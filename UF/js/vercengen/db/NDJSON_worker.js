//[VERCENGEN]

//Import libraries
let fs = require("node:fs");
let path = require("node:path");
let readline = require("node:readline");
let { parentPort, workerData } = require("node:worker_threads");

if (!global?.NDJSON) global.NDJSON = {};
if (!global.ve) global.ve = {};

require("../db_shared/NDJSON_history.js"); //Require NDJSON_history.js

//Declare variables
let processing = false;
let queue = [];

//Internal helper functions
{
	Object.getValue = function (arg0_object, arg1_variable_string) {
		//Convert from parameters
		let object = arg0_object;
		let variable_string = (arg1_variable_string) ? arg1_variable_string : "";
		
		//Return statement
		return variable_string.split(".")
		.reduce((local_object, local_key) => local_object?.[local_key], object);
	};
}

parentPort.on("message", (task) => {
	// Bypasses resource-intensive wait queues for real-time diagnostics
	if (task.type === "get_diagnostics") {
		let memory = process.memoryUsage();
		let v8_stats = require("node:v8").getHeapStatistics();
		
		return parentPort.postMessage({
			task_id: task.task_id,
			results: {
				worker_id: workerData.worker_id,
				rss: memory.rss, // Total Resident Set Size for the whole process
				heapUsed: memory.heapUsed,
				heapTotal: memory.heapTotal,
				heapLimit: v8_stats.heap_size_limit,
				percentage: parseFloat(
					((memory.heapUsed / v8_stats.heap_size_limit) * 100).toFixed(2)
				)
			}
		});
	}
	
	queue.push(task);
	if (!processing) processQueue();
});

async function handleTask (arg0_task) {
	//Convert from parameters
	let task = arg0_task;
	
	//Declare internal helper functions
	let findByID = async (callback) => {
		let found = null;
		await forEachLine(page_file, (key, val_str) => {
			if (key === id) {
				try {
					let parsed = JSON.parse(val_str);
					let res = callback(parsed);
					if (res !== null && res !== undefined) found = res;
				} catch (e) {}
				return false; // Break the stream reader
			}
		});
		return found;
	};
	
	let findMany = async (ids, callback) => {
		let target_ids = new Set(ids);
		let found = {};
		
		await forEachLine(page_file, (key, val_str) => {
			if (target_ids.has(key)) {
				try {
					let parsed = JSON.parse(val_str);
					let res = callback(key, parsed);
					if (res !== null && res !== undefined) {
						found[key] = res;
					}
				} catch (e) {}
				target_ids.delete(key);
				if (target_ids.size === 0) return false; // Break early
			}
		});
		return found;
	};
	
	let forEachLine = async (filePath, callback) => {
		if (fs.existsSync(filePath)) {
			let rs = fs.createReadStream(filePath);
			let rl = readline.createInterface({ input: rs });
			try {
				for await (let line of rl) {
					let match = line.match(/^"([^"]+)"\s*:/);
					let result = match
						? await callback(
							match[1],
							getCleanValue(line.substring(line.indexOf(":") + 1)),
							line
						)
						: await callback(null, null, line);
					
					if (result === false) break;
				}
			} finally {
				rl.close();
				rs.destroy();
				// Ensure OS has tick to release file descriptor
				await new Promise((r) => setImmediate(r));
			}
		}
	};
	let getCleanValue = (string) => {
		let clean = string.trim();
		if (clean.endsWith(",")) clean = clean.slice(0, -1);
		
		//Return statement
		return clean;
	};
	let resolveHistory = (data, timestamp, options) => {
		let history_obj =
			typeof data.history === "string" ? JSON.parse(data.history) : data.history;
		
		//Return statement
		if (history_obj && history_obj.keyframes) {
			if (options?.type === "get_keyframes")
				return History.getKeyframes(history_obj.keyframes);
			return History.getKeyframe(history_obj.keyframes, timestamp);
		}
		return null;
	};
	
	let updateNDJSON = async (getUpdatedValue) => {
		let tmp_file = `${page_file}.tmp_${Date.now()}_${Math.floor(
			Math.random() * 1000
		)}`;
		let updated = false;
		
		let dir = path.dirname(page_file);
		if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
		
		let ws = fs.createWriteStream(tmp_file);
		
		if (fs.existsSync(page_file)) {
			await forEachLine(page_file, (key, val_str, line) => {
				if (key) {
					let newValue = getUpdatedValue(key, val_str);
					if (newValue !== undefined) {
						if (newValue !== null)
							ws.write(`"${key}":${JSON.stringify(newValue)}\n`);
						updated = true;
					} else ws.write(line + "\n");
				} else ws.write(line + "\n");
			});
		}
		
		let extra_appends = getUpdatedValue(null, null, updated);
		if (extra_appends) {
			for (let [k, val] of Object.entries(extra_appends))
				if (val !== null) ws.write(`"${k}":${JSON.stringify(val)}\n`);
		}
		
		ws.end();
		await new Promise((r) => ws.on("finish", r));
		
		// Handle Windows EPERM via retry loop for renameSync
		let renamed = false;
		let attempts = 0;
		while (!renamed && attempts < 10) {
			try {
				fs.renameSync(tmp_file, page_file);
				renamed = true;
			} catch (e) {
				attempts++;
				if (attempts >= 10) throw e;
				await new Promise((r) => setTimeout(r, 50));
			}
		}
	};
	
	//Declare local instance variables
	let {
		file_path,
		id,
		limit_end,
		keyframes,
		update_map,
		query,
		task_id,
		timestamp,
		type,
	} = task;
	let page_file = path.join(
		`${file_path}.tmpndjson`,
		`${workerData.worker_id}.ndjson`
	);
	
	if (type === "diff") {
		let found = await findByID((obj) => {
			let state_val = resolveHistory(obj, timestamp);
			
			if (state_val !== null) {
				return {
					key: id,
					class_name: obj.class_name,
					value: state_val,
				};
			} else {
				return {
					key: id,
					class_name: obj.class_name,
					value:
						typeof obj.value === "string" ? JSON.parse(obj.value) : obj.value,
				};
			}
		});
		return parentPort.postMessage({ task_id, results: found });
	}
	
	if (type === "diff_all") {
		let list = [];
		await forEachLine(page_file, (key, val_str) => {
			try {
				let entity_obj = JSON.parse(val_str);
				let state_val = resolveHistory(entity_obj, timestamp);
				
				if (state_val !== null) {
					list.push({
						key,
						class_name: entity_obj.class_name,
						value: state_val,
					});
				} else {
					list.push({
						key,
						class_name: entity_obj.class_name,
						value:
							typeof entity_obj.value === "string"
								? JSON.parse(entity_obj.value)
								: entity_obj.value,
					});
				}
			} catch (e) {}
		});
		return parentPort.postMessage({ task_id, results: list });
	}
	
	if (type === "get_diffs") {
		let found = await findMany(task.ids, (key, obj) => {
			let state_val = resolveHistory(obj, timestamp);
			
			if (state_val !== null) {
				return {
					key,
					class_name: obj.class_name,
					value: state_val,
				};
			} else {
				return {
					key,
					class_name: obj.class_name,
					value:
						typeof obj.value === "string" ? JSON.parse(obj.value) : obj.value,
				};
			}
		});
		return parentPort.postMessage({ task_id, results: found });
	}
	
	if (type === "get_hierarchy_values") {
		let list = [];
		await forEachLine(page_file, (key, val_str) => {
			try {
				let entity_obj = JSON.parse(val_str);
				
				if (typeof entity_obj.history !== "undefined") {
					let current_keyframe = resolveHistory(entity_obj, timestamp);
					let state_val = resolveHistory(entity_obj, timestamp, {
						type: "get_keyframes",
					});
					let all_keyframes = Object.keys(state_val);
					
					for (let i = 0; i < all_keyframes.length; i++) {
						let local_keyframe = state_val[all_keyframes[i]];
						delete local_keyframe.localisation;
						if (local_keyframe.value) local_keyframe.value[0] = undefined;
					}
					
					list.push({
						key,
						class_name: entity_obj.class_name,
						metadata: entity_obj.metadata,
						name: History.getName(state_val, timestamp),
						current_keyframe: current_keyframe,
						value: state_val,
					});
				} else {
					list.push({
						key,
						class_name: entity_obj.class_name,
						metadata: entity_obj.metadata,
						value:
							typeof entity_obj.value === "string"
								? JSON.parse(entity_obj.value)
								: entity_obj.value,
					});
				}
			} catch (e) {}
		});
		return parentPort.postMessage({ task_id, results: list });
	}
	
	if (type === "get_keyframes") {
		let found = await findByID((obj) => {
			let state_val = resolveHistory(obj, undefined, {
				type: "get_keyframes",
			});
			return state_val !== null ? { key: id, value: state_val } : null;
		});
		return parentPort.postMessage({ task_id, results: found });
	}
	
	if (type === "get_value") {
		let found = await findByID((obj) => obj);
		return parentPort.postMessage({ task_id, results: found });
	}
	
	if (type === "get_values") {
		let found = await findMany(task.ids, (key, obj) => obj);
		return parentPort.postMessage({ task_id, results: found });
	}
	
	if (type === "query") {
		let list = [];
		await forEachLine(page_file, (key, val_str) => {
			if (limit_end !== undefined && list.length >= limit_end) return false;
			try {
				let obj = JSON.parse(val_str);
				let matches = true;
				
				for (let query_key in query)
					if (Object.getValue(obj, query_key) !== query[query_key]) {
						matches = false;
						break;
					}
				if (matches) {
					if (typeof obj === "object" && obj !== null) obj._id = key;
					list.push(obj);
				}
			} catch (e) {}
		});
		return parentPort.postMessage({ task_id, results: list });
	}
	
	if (type === "set_keyframes") {
		await updateNDJSON((key, val_str, updated) => {
			if (key === null) {
				return updated ? null : { [id]: { history: { keyframes } } };
			}
			if (key === id) {
				try {
					let obj = JSON.parse(val_str);
					let is_history_string = typeof obj.history === "string";
					let history_obj = is_history_string
						? JSON.parse(obj.history)
						: obj.history;
					
					if (!history_obj) history_obj = {};
					history_obj.keyframes = keyframes;
					
					obj.history = is_history_string
						? JSON.stringify(history_obj)
						: history_obj;
					return obj;
				} catch (e) {
					return undefined;
				}
			}
			return undefined;
		});
		return parentPort.postMessage({ task_id, results: true });
	}
	
	if (type === "set_values") {
		let updated_keys = new Set();
		await updateNDJSON((key, val_str) => {
			if (key === null) {
				let rem = {};
				for (let k in update_map)
					if (!updated_keys.has(k)) rem[k] = update_map[k];
				return rem;
			}
			if (update_map.hasOwnProperty(key)) {
				updated_keys.add(key);
				return update_map[key];
			}
			return undefined;
		});
		return parentPort.postMessage({ task_id, results: true });
	}
}

async function processQueue () {
	processing = true;
	while (queue.length > 0) {
		let task = queue.shift();
		await handleTask(task);
	}
	processing = false;
}