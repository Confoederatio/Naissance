const { parentPort } = require("node:worker_threads");
const fs = require("fs");

if (!global.ve) global.ve = {};

let file_index = new Map();
let indexed_mtime = 0;

//Initialise functions
{
	ve.NDJSON_resolveStateAtTimestamp = function (arg0_keyframes, arg1_timestamp) {
		//Convert from parameters
		let keyframes = arg0_keyframes;
		let timestamp = parseInt(arg1_timestamp);
		
		//Declare local instance variables
		let return_keyframe = {
			timestamp: timestamp,
			value: []
		};
		
		let all_keyframes = Object.keys(keyframes).sort((a, b) => parseInt(a) - parseInt(b));
		
		for (let i = 0; i < all_keyframes.length; i++) {
			let local_keyframe = keyframes[all_keyframes[i]];
			
			if (parseInt(all_keyframes[i]) <= parseInt(return_keyframe.timestamp)) {
				if (!local_keyframe.value) continue;
				
				for (let x = 0; x < local_keyframe.value.length; x++) {
					if (typeof local_keyframe.value[x] === "object" && local_keyframe.value[x] !== null) {
						let old_variables = (return_keyframe.value[x] && return_keyframe.value[x].variables) ?
							return_keyframe.value[x].variables : {};
						
						if (!return_keyframe.value[x]) return_keyframe.value[x] = {};
						
						return_keyframe.value[x] = {
							...return_keyframe.value[x],
							...local_keyframe.value[x],
						};
						
						if (local_keyframe.value[x] && local_keyframe.value[x].variables)
							return_keyframe.value[x].variables = {
								...old_variables,
								...local_keyframe.value[x].variables,
							};
					} else if (local_keyframe.value[x] !== undefined) {
						if (local_keyframe.value[x] === "undefined") continue;
						if (x !== 0 && local_keyframe.value[x] === null) continue;
						
						return_keyframe.value[x] = local_keyframe.value[x];
					}
				}
			} else {
				break;
			}
		}
		
		//Return statement
		return return_keyframe.value;
	};
}

parentPort.on("message", async (task) => {
	//Declare local instance variables
	let { type, file_path, start, end, task_id, timestamp, id, mtime, update_map } = task;
	
	if (type === "index") {
		if (mtime !== indexed_mtime) { file_index.clear(); indexed_mtime = mtime; }
		
		let tombstones = [];
		const fd = fs.openSync(file_path, 'r');
		const buffer = Buffer.alloc(1024 * 512);
		let current_pos = start;
		let line_start = start;
		
		while (current_pos < end) {
			const bytesRead = fs.readSync(fd, buffer, 0, Math.min(buffer.length, end - current_pos), current_pos);
			if (bytesRead === 0) break;
			
			for (let i = 0; i < bytesRead; i++) {
				let is_end_of_chunk = (current_pos + i === end - 1);
				
				if (buffer[i] === 10 || is_end_of_chunk) {
					let line_end = current_pos + i + (buffer[i] === 10 ? 0 : 1);
					let head_len = Math.min(512, line_end - line_start);
					let head_buf = Buffer.alloc(head_len);
					
					fs.readSync(fd, head_buf, 0, head_len, line_start);
					
					let head_str = head_buf.toString();
					let match = head_str.match(/^"([^"]+)"\s*:/);
					
					if (match) {
						let value_str = head_str.substring(head_str.indexOf(":") + 1).trim();
						
						//Detect tombstones: value is literally "null"
						if (value_str === "null" || value_str.startsWith("null\n") || value_str.startsWith("null\r")) {
							tombstones.push(match[1]);
							file_index.delete(match[1]);
						} else {
							file_index.set(match[1], { start: line_start, end: line_end });
						}
					}
					line_start = current_pos + i + 1;
				}
			}
			current_pos += bytesRead;
		}
		
		fs.closeSync(fd);
		return parentPort.postMessage({ task_id, status: "indexed", count: file_index.size, tombstones });
	}
	
	if (type === "update_index") {
		let { offsets, tombstone_keys, is_primary, mtime: new_mtime } = task;
		
		//Keep worker mtime in sync
		if (new_mtime) indexed_mtime = new_mtime;
		
		if (offsets) {
			let keys = Object.keys(offsets);
			let tombstone_set = new Set(tombstone_keys || []);
			
			//Every worker deletes stale entries for changed keys
			for (let i = 0; i < keys.length; i++)
				file_index.delete(keys[i]);
			
			//Only the primary worker adopts new byte offsets, skipping tombstones
			if (is_primary)
				for (let i = 0; i < keys.length; i++)
					if (!tombstone_set.has(keys[i]))
						file_index.set(keys[i], offsets[keys[i]]);
		}
		
		return parentPort.postMessage({ task_id, status: "updated" });
	}
	
	if (type === "purge_keys") {
		let { keys } = task;
		
		for (let i = 0; i < keys.length; i++)
			file_index.delete(keys[i]);
		
		return parentPort.postMessage({ task_id, status: "purged" });
	}
	
	if (type === "get_value" || type === "diff" || type === "diff_all" || type === "batch_process") {
		let list = [];
		let targets = (type === "get_value" || type === "diff") ?
			(file_index.has(id) ? [[id, file_index.get(id)]] : []) : Array.from(file_index.entries());
		
		const fd = fs.openSync(file_path, 'r');
		
		for (let i = 0; i < targets.length; i++) {
			let local_id = targets[i][0];
			let pos = targets[i][1];
			
			if (type === "batch_process" && update_map && update_map.hasOwnProperty(local_id)) {
				if (update_map[local_id] !== null) list.push({ id: local_id, data: update_map[local_id] });
				continue;
			}
			
			let buf_len = pos.end - pos.start;
			let buf = Buffer.alloc(buf_len);
			fs.readSync(fd, buf, 0, buf_len, pos.start);
			
			let str = buf.toString();
			let raw = str.substring(str.indexOf(":") + 1).trim();
			
			//Guaranteed JSON Extractor
			if (raw.endsWith(",")) raw = raw.slice(0, -1);
			let parsed_data = null;
			
			try {
				parsed_data = JSON.parse(raw);
			} catch (err) {
				if (raw.endsWith("}")) {
					raw = raw.slice(0, -1).trim();
					try { parsed_data = JSON.parse(raw); } catch (err2) {}
				}
			}
			
			if (parsed_data) {
				if (type === "get_value") {
					fs.closeSync(fd);
					return parentPort.postMessage({ task_id, results: parsed_data });
				}
				if (type === "batch_process") {
					list.push({ id: local_id, data: parsed_data });
				} else {
					let history_obj = (typeof parsed_data.history === "string") ?
						JSON.parse(parsed_data.history) : parsed_data.history;
					
					if (history_obj && history_obj.keyframes) {
						let state_val = ve.NDJSON_resolveStateAtTimestamp(history_obj.keyframes, timestamp);
						if (type === "diff") {
							fs.closeSync(fd);
							return parentPort.postMessage({ task_id, results: { key: id, value: state_val } });
						}
						
						list.push({ key: local_id, value: state_val });
					}
				}
			}
		}
		
		fs.closeSync(fd);
		parentPort.postMessage({ task_id, results: (targets.length === 0 && type !== "diff_all") ? null : list });
	}
});