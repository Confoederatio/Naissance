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
			let rl = readline.createInterface({
				input: fs.createReadStream(filePath)
			});
			for await (let line of rl) {
				let match = line.match(/^"([^"]+)"\s*:/);
				let result;
				
				if (match) {
					let key = match[1];
					let val_str = getCleanValue(
						line.substring(line.indexOf(":") + 1)
					);
					result = await callback(key, val_str, line);
				} else {
					result = await callback(null, null, line);
				}
				
				if (result === false) {
					rl.close();
					break;
				}
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
		let history_obj = (typeof data.history === "string") ?
			JSON.parse(data.history) : data.history;
		
		//Return statement
		if (history_obj && history_obj.keyframes) {
			if (options?.type === "get_keyframes")
				return History.getKeyframes(history_obj.keyframes);
			return History.getKeyframe(history_obj.keyframes, timestamp);
		}
		return null;
	};
	
	let updateNDJSON = async (getUpdatedValue) => {
		let tmp_file = `${page_file}.tmp_${Date.now()}`;
		let updated = false;
		
		let dir = path.dirname(page_file);
		if (!fs.existsSync(dir))
			fs.mkdirSync(dir, { recursive: true });
		
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
		
		let extraAppends = getUpdatedValue(null, null, updated);
		if (extraAppends) {
			for (let [k, val] of Object.entries(extraAppends))
				if (val !== null)
					ws.write(`"${k}":${JSON.stringify(val)}\n`);
		}
		
		ws.end();
		await new Promise(r => ws.on("finish", r));
		
		fs.renameSync(tmp_file, page_file);
	};
	
	//Declare local instance variables
	let {
		file_path, id, limit_end, keyframes, update_map, query, task_id, timestamp, type
	} = task; //Destructure parameters from task
	let page_file = path.join(`${file_path}.tmpndjson`, `${workerData.worker_id}.ndjson`);
	
	//diff: parses the .history.keyframes for an individual ID
	if (type === "diff") {
		let found = await findByID((obj) => {
			let state_val = resolveHistory(obj, timestamp);
			
			if (state_val !== null) {
				return {
					key: id,
					class_name: obj.class_name,
					value: state_val
				};
			} else {
				return {
					key: id,
					class_name: obj.class_name,
					value: (typeof obj.value === "string") ?
						JSON.parse(obj.value) : obj.value
				};
			}
		});
		
		//Return statement
		return parentPort.postMessage({ task_id, results: found });
	}
	
	//diff_all: parses `.history.keyframes` for all individual IDs.
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
						value: state_val
					});
				} else {
					list.push({
						key,
						class_name: entity_obj.class_name,
						value: (typeof entity_obj.value === "string") ?
							JSON.parse(entity_obj.value) : entity_obj.value
					});
				}
			} catch (e) {}
		});
		
		//Return statement
		return parentPort.postMessage({ task_id, results: list });
	}
	
	//get_diffs: parses `.history.keyframes` for multiple IDs in a single pass.
	if (type === "get_diffs") {
		let found = await findMany(task.ids, (key, obj) => {
			let state_val = resolveHistory(obj, timestamp);
			
			if (state_val !== null) {
				return {
					key,
					class_name: obj.class_name,
					value: state_val
				};
			} else {
				return {
					key,
					class_name: obj.class_name,
					value: (typeof obj.value === "string") ?
						JSON.parse(obj.value) : obj.value
				};
			}
		});
		
		//Return statement
		return parentPort.postMessage({ task_id, results: found });
	}
	
	//get_hierarchy_values: sends back metadata, names, and symbols of Geometry classes, as well as Feature classes
	if (type === "get_hierarchy_values") {
		let list = [];
		
		await forEachLine(page_file, (key, val_str) => {
			try {
				let entity_obj = JSON.parse(val_str);
				let state_val = resolveHistory(entity_obj, timestamp, {
					type: "get_keyframes"
				});
				
				if (typeof entity_obj.history !== "undefined") {
					//Iterate over all_keyframes to ensure we pass back minimal data
					let all_keyframes = Object.keys(state_val);
					
					for (let i = 0; i < all_keyframes.length; i++) {
						let local_keyframe = state_val[all_keyframes[i]];
						
						delete local_keyframe.localisation;
						if (local_keyframe.value)
							local_keyframe.value[0] = undefined;
					}
					
					list.push({
						key,
						class_name: entity_obj.class_name,
						metadata: entity_obj.metadata,
						name: History.getName(state_val, timestamp),
						value: state_val
					});
				} else {
					list.push({
						key,
						class_name: entity_obj.class_name,
						metadata: entity_obj.metadata,
						value: (typeof entity_obj.value === "string") ?
							JSON.parse(entity_obj.value) : entity_obj.value
					});
				}
			} catch (e) {}
		});
		
		//Return statement
		return parentPort.postMessage({ task_id, results: list });
	}
	
	//get_keyframes: returns keyframes for an ID.
	if (type === "get_keyframes") {
		let found = await findByID((obj) => {
			let state_val = resolveHistory(obj, undefined, {
				type: "get_keyframes"
			});
			return (state_val !== null) ? { key: id, value: state_val } : null;
		});
		
		//Return statement
		return parentPort.postMessage({ task_id, results: found });
	}
	
	//get_value: returns the Object representing an ID.
	if (type === "get_value") {
		let found = await findByID((obj) => obj);
		
		//Return statement
		return parentPort.postMessage({ task_id, results: found });
	}
	
	//get_values: returns the Objects representing multiple IDs in a single pass.
	if (type === "get_values") {
		let found = await findMany(task.ids, (key, obj) => obj);
		
		//Return statement
		return parentPort.postMessage({ task_id, results: found });
	}
	
	//query: queries an Object based on strict matches, and returns an Array<Object>.
	if (type === "query") {
		let list = [];
		
		await forEachLine(page_file, (key, val_str) => {
			if (limit_end !== undefined && list.length >= limit_end) return false; // Break early
			
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
		
		//Return statement
		return parentPort.postMessage({ task_id, results: list });
	}
	
	//set_keyframes: sets/updates the .history.keyframes for an individual ID.
	if (type === "set_keyframes") {
		await updateNDJSON((key, val_str, updated) => {
			if (key === null) {
				return updated ? null : { [id]: { history: { keyframes } } };
			}
			
			if (key === id) {
				try {
					let obj = JSON.parse(val_str);
					let is_history_string = (typeof obj.history === "string");
					let history_obj = is_history_string ?
						JSON.parse(obj.history) : obj.history;
					
					if (!history_obj) history_obj = {};
					history_obj.keyframes = keyframes;
					
					obj.history = is_history_string ?
						JSON.stringify(history_obj) : history_obj;
					
					return obj;
				} catch (e) {
					return undefined;
				}
			}
			return undefined;
		});
		
		//Return statement
		return parentPort.postMessage({ task_id, results: true });
	}
	
	//set_values: sets multiple key-value pairs in the NDJSON partition.
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
		
		//Return statement
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