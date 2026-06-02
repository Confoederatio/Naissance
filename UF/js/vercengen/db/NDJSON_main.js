//[VERCENGEN]

//Import libraries
let fs = require("node:fs");
let path = require("node:path");
let os = require("node:os");
let v8 = require("node:v8");
let readline = require("node:readline");
let NodeWorker = require("node:worker_threads").Worker;

if (!global.NDJSON)
	/**
	 * The namespace for NDJSON utility functions.
	 *
	 * @namespace NDJSON
	 */
	global.NDJSON = {};
	
//Initialise utils
{
	/**
	 * Internal helper to route multi-ID tasks across worker partitions and format ordered responses.
	 *
	 * @param {string[]} arg0_ids
	 * @param {string} arg1_type
	 * @param {Object} [arg2_payload={}]
	 *
	 * @returns {Promise<Array<Object|null>>}
	 * @private
	 */
	NDJSON._getMulti = async function (arg0_ids, arg1_type, arg2_payload) {
		//Convert from parameters
		let ids = Array.isArray(arg0_ids) ? arg0_ids : [];
		let payload = arg2_payload || {};
		
		//Declare local instance variables
		let pool = NDJSON.getWorkerPool();
		let ids_by_worker = {};
		
		for (let i = 0; i < ids.length; i++) {
			let wid = NDJSON.getWorkerID(ids[i], pool.length);
			if (!ids_by_worker[wid]) ids_by_worker[wid] = [];
			ids_by_worker[wid].push(ids[i]);
		}
		
		let target_wids = Object.keys(ids_by_worker).map(Number);
		
		let results = await NDJSON.task(target_wids, (wid) => ({
			type: arg1_type,
			file_path: path.resolve(ve.ndjson_file_path),
			ids: ids_by_worker[wid],
			...payload
		}));
		
		let merged_map = {};
		for (let i = 0; i < results.length; i++) {
			let res = results[i];
			if (res) Object.assign(merged_map, res);
		}
		
		//Return statement
		return ids.map((id) =>
			merged_map.hasOwnProperty(id) ? merged_map[id] : null
		);
	};
	
	/**
	 * Internal dispatcher to handle messaging and promise queues across worker pools.
	 *
	 * @param {number|number[]|string} arg0_target - Target worker ID, array of IDs, partition ID string, or "all".
	 * @param {Object|Function} arg1_message - Message payload, or a factory function returning payload.
	 *
	 * @returns {Promise<any|any[]>}
	 */
	NDJSON.task = function (arg0_target, arg1_message) {
		//Declare local instance variables
		let pool = NDJSON.getWorkerPool();
		let worker_ids = [];
		let is_array = false;
		
		if (arg0_target === "all") {
			worker_ids = pool.map((_, i) => i);
			is_array = true;
		} else if (Array.isArray(arg0_target)) {
			worker_ids = arg0_target;
			is_array = true;
		} else if (typeof arg0_target === "string") {
			worker_ids = [NDJSON.getWorkerID(arg0_target, pool.length)];
			is_array = false;
		} else if (typeof arg0_target === "number") {
			worker_ids = [arg0_target];
			is_array = false;
		}
		
		let promises = worker_ids.map((wid) => {
			let task_id = global.ve.ndjson_task_id_counter++;
			let message = typeof arg1_message === "function"
				? arg1_message(wid)
				: { ...arg1_message };
			
			message.task_id = task_id;
			
			return new Promise((resolve) => {
				global.ve.ndjson_pending_tasks.set(task_id, resolve);
				pool[wid].postMessage(message);
			});
		});
		
		//Return statement
		return is_array ? Promise.all(promises) : promises[0];
	};
}

//Initialise functions
{
	/**
	 * Returns a diff over `.history.keyframes` for the ID in question.
	 * 
	 * @param {string} arg0_id
	 * @param {Object} arg1_timestamp
	 *
	 * @returns {Promise<Object|null>}
	 */
	NDJSON.diff = async function (arg0_id, arg1_timestamp) {
		//Convert from parameters
		let id = arg0_id;
		let timestamp = arg1_timestamp;
		
		//Return statement
		return NDJSON.task(id, {
			type: "diff",
			file_path: path.resolve(ve.ndjson_file_path),
			id: id,
			timestamp: timestamp
		});
	};
	
	/**
	 * Diffs all `.history.keyframes` for all Objects for a given ID, so long as they have that field.
	 *
	 * @param {number|string} arg0_timestamp
	 *
	 * @returns {Promise<Object[]>}
	 */
	NDJSON.diffAll = async function (arg0_timestamp) {
		//Convert from parameters
		let timestamp = parseInt(arg0_timestamp);
		
		//Declare local instance variables
		let results = await NDJSON.task("all", {
			type: "diff_all",
			file_path: path.resolve(ve.ndjson_file_path),
			timestamp: timestamp
		});
		
		//Return statement
		return results.filter(v => v !== null).flat();
	};
	
	/**
	 * Resolves active RAM diagnostic percentage statistics from every worker in the pool.
	 *
	 * @returns {Promise<Array<{worker_id: number, rss: number, heapUsed: number, heapTotal: number, heapLimit: number, percentage: number}>>}
	 */
	NDJSON.getDiagnostics = async function () {
		//Return statement
		return await NDJSON.task("all", {
			type: "get_diagnostics"
		});
	};
	
	/**
	 * Returns diffs over `.history.keyframes` for multiple IDs in 1-pass.
	 *
	 * @param {string[]} arg0_ids
	 * @param {number} arg1_timestamp
	 *
	 * @returns {Promise<Array<Object|null>>}
	 */
	NDJSON.getDiffs = async function (arg0_ids, arg1_timestamp) {
		//Convert from parameters
		let ids = arg0_ids;
		let timestamp = arg1_timestamp;
		
		//Return statement
		return NDJSON._getMulti(ids, "get_diffs", {
			timestamp: timestamp
		});
	};
	
	NDJSON.getHierarchyValues = async function (arg0_timestamp) {
		//Convert from parameters
		let timestamp = parseInt(arg0_timestamp);
		
		//Declare local instance variables
		let results = await NDJSON.task("all", {
			type: "get_hierarchy_values",
			file_path: path.resolve(ve.ndjson_file_path),
			timestamp: timestamp
		});
		
		//Return statement
		return results.filter(v => v !== null).flat();
	};
	
	/**
	 * Returns the Object values of multiple IDs in 1-pass.
	 *
	 * @param {string[]} arg0_ids
	 *
	 * @returns {Promise<Array<Object|null>>}
	 */
	NDJSON.getValues = async function (arg0_ids) {
		//Convert from parameters
		let ids = arg0_ids;
		
		//Return statement
		return NDJSON._getMulti(ids, "get_values");
	};
	
	/**
	 * Returns processed `.history.keyframes` for a given key.
	 *
	 * @param {string} arg0_id
	 *
	 * @returns {Promise<Object>}
	 */
	NDJSON.getKeyframes = async function (arg0_id) {
		//Convert from parameters
		let id = arg0_id;
		
		//Return statement
		return NDJSON.task(id, {
			type: "get_keyframes",
			file_path: path.resolve(ve.ndjson_file_path),
			id: id
		});
	};
	
	/**
	 * Returns the Object value of a single ID.
	 *
	 * @param {string} arg0_id
	 *
	 * @returns {Promise<Object>}
	 */
	NDJSON.getValue = async function (arg0_id) {
		//Convert from parameters
		let id = arg0_id;
		
		//Return statement
		return NDJSON.task(id, {
			type: "get_value",
			file_path: path.resolve(ve.ndjson_file_path),
			id: id
		});
	};
	
	/**
	 * Returns the Worker ID that holds a particular ID's partition.
	 *
	 * @param {string} arg0_id
	 * @param {number} arg1_pool_length
	 *
	 * @returns {number}
	 */
	NDJSON.getWorkerID = function (arg0_id, arg1_pool_length) {
		//Convert from parameters
		let id_str = arg0_id.toString();
		let pool_length = arg1_pool_length;
		
		//Declare local instance variables
		let hash = 0;
		
		for (let i = 0; i < id_str.length; i++) {
			hash = ((hash << 5) - hash) + id_str.charCodeAt(i);
			hash |= 0;
		}
		
		//Return statement
		return Math.abs(hash) % pool_length;
	};
	
	/**
	 * Returns the current NDJSON worker pool managing DBs.
	 *
	 * @param {number} [arg0_max_workers=os.cpus().length - 1]
	 *
	 * @returns {NodeWorker[]}
	 */
	NDJSON.getWorkerPool = function (arg0_max_workers) {
		//Convert from parameters
		let max_workers = Math.returnSafeNumber(arg0_max_workers, os.cpus().length - 1);
		
		//Init workerpool variables
		if (global.ve.ndjson_pending_tasks === undefined) global.ve.ndjson_pending_tasks = new Map();
		if (global.ve.ndjson_task_id_counter === undefined) global.ve.ndjson_task_id_counter = 0;
		if (global.ve.ndjson_worker_pool === undefined) global.ve.ndjson_worker_pool = [];
		
		//Declare local instance variables
		if (global.ve.ndjson_worker_pool.length === 0)
			for (let i = 0; i < max_workers; i++) {
				let worker = new NodeWorker("./UF/js/vercengen/db/NDJSON_worker.js", { workerData: { worker_id: i } });
				worker.on("message", (response) => {
					let callback = global.ve.ndjson_pending_tasks.get(response.task_id);
					if (callback) {
						callback(response.results !== undefined ? response.results : true);
						global.ve.ndjson_pending_tasks.delete(response.task_id);
					}
				});
				global.ve.ndjson_worker_pool.push(worker);
			}
		
		//Return statement
		return global.ve.ndjson_worker_pool;
	};
	
	/**
	 * Loads a regular JSON file and partitions it into NDJSON files.
	 *
	 * @param {string} arg0_file_path
	 * @param {Object} [arg1_options]
	 *  @param {number} [arg1_options.dynamic_chunk_size=67108864] - 64MB
	 *  @param {number} [arg1_options.dynamic_max_workers=os.cpus().length - 1]
	 *  @param {number} [arg1_options.ram_threshold] - % Threshold of RAM dedicated to RAM queries.
	 *
	 * @returns {Promise<unknown>}
	 */
	NDJSON.load = async function (arg0_file_path, arg1_options) {
		//Convert from parameters		
		let file_path = path.resolve(arg0_file_path);
		let options = (arg1_options) ? arg1_options : {};
		
		//Initialise options
		options.dynamic_chunk_size = Math.returnSafeNumber(options.dynamic_chunk_size, 64*1024*1024);
		options.dynamic_max_workers = Math.returnSafeNumber(options.dynamic_max_workers, os.cpus().length - 1);
		options.ram_threshold = Math.returnSafeNumber(options.ram_threshold, 0.50);
		
		//Declare local instance variables
		let _dynamic_chunk_size = structuredClone(options.dynamic_chunk_size);
		let _dynamic_max_workers = structuredClone(options.dynamic_max_workers);
		let heap_limit = v8.getHeapStatistics().heap_size_limit;
		let stats = await fs.promises.stat(file_path);
		
		let active_workers = 0;
		let current_offset = 0;
		let global_depth = 0;
		let write_stream = fs.createWriteStream(`${file_path}.ndjson`);
		ve.ndjson_file_path = `${file_path}.ndjson`;
		
		//Initialise logic functions
		let refreshLimits = () => {
			let memory = process.memoryUsage();
			let memory_usage = memory.heapUsed;
			
			let available_buffer = (heap_limit*options.ram_threshold) - memory_usage;
			
			if (available_buffer < 0) {
				_dynamic_chunk_size = Math.max(1024*1024, _dynamic_chunk_size*0.9);
				_dynamic_max_workers = Math.max(1, _dynamic_max_workers - 1);
			} else {
				_dynamic_chunk_size = Math.min(128*1024*1024, Math.floor(available_buffer*options.ram_threshold));
				_dynamic_max_workers = Math.min(os.cpus().length - 1, _dynamic_max_workers + 1);
			}
		};
		
		//Return statement
		return new Promise((resolve, reject) => {
			let processNextChunk = () => {
				if (current_offset >= stats.size) {
					if (active_workers === 0) {
						write_stream.end(async () => {
							await NDJSON.partitionFile(`${file_path}.ndjson`);
							resolve(`${file_path}.ndjson`);
						});
					}
					return;
				}
				
				refreshLimits();
				if (active_workers < _dynamic_max_workers) {
					let start = current_offset;
					let end = Math.min(start + _dynamic_chunk_size - 1, stats.size - 1);
					
					active_workers++;
					current_offset = end + 1;
					
					let worker = new NodeWorker("./UF/js/vercengen/db/NDJSON_parser.js", {
						workerData: { file_path, start, end, initial_depth: global_depth }
					});
					worker.on("message", (message) => {
						global_depth = message.final_depth;
						let can_write = write_stream.write(message.transformed_data);
						let continueProcessing = () => {
							active_workers--;
							processNextChunk();
						}
						
						if (!can_write) write_stream.once("drain", continueProcessing);
						else setImmediate(continueProcessing);
					});
					worker.on("error", reject);
					
					if (active_workers < _dynamic_max_workers) processNextChunk();
				}
			};
			
			processNextChunk();
		});
	};
	
	/**
	 * Partitions a given file into multiple NDJSON files for use. Internal helper function.
	 *
	 * @param {string} arg0_file_path
	 *
	 * @returns {Promise<void>}
	 */
	NDJSON.partitionFile = async function (arg0_file_path) {
		//Convert from parameters
		let file_path = path.resolve(arg0_file_path);
		
		//Declare local instance variables
		let folder_path = `${file_path}.tmpndjson`;
		let pool = NDJSON.getWorkerPool();
		let write_streams = {};
		
		//Iterate over all workers and ensure partitions
		if (!fs.existsSync(folder_path))
			fs.mkdirSync(folder_path, { recursive: true });
		for (let i = 0; i < pool.length; i++)
			write_streams[i] = fs.createWriteStream(
				path.join(folder_path, `${i}.ndjson`)
			);
		
		//Iterate over all lines in rs
		let rs = fs.createReadStream(file_path);
		let rl = readline.createInterface({ input: rs });
		
		for await (let line of rl) {
			let match = line.match(/^"([^"]+)"\s*:/);
			if (match) {
				let wid = NDJSON.getWorkerID(match[1], pool.length);
				let clean_line = line.trim();
				if (clean_line.endsWith(",")) clean_line = clean_line.slice(0, -1);
				
				if (!write_streams[wid].write(clean_line + "\n"))
					await new Promise((r) => write_streams[wid].once("drain", r));
			}
		}
		
		//Cleanup read handles explicitly
		rl.close();
		rs.destroy();
		
		//Iterate over all workers in pool and finish
		for (let i = 0; i < pool.length; i++) {
			write_streams[i].end();
			await new Promise((r) => write_streams[i].on("finish", r));
		}
	};
	
	/**
	 * Queries an NDJSON file. [WIP] - Should be refactored so that only `arg1_options` is present.
	 *
	 * @param {Object} [arg0_options]
	 *  @param {number} [arg0_options.limit_end]
	 *  @param {number} [arg0_options.limit_start=0]
	 *  @param {Object} [arg0_options.query_obj] - Key/value pairs to match for.
	 *
	 * @returns {Promise<Object[]>}
	 */
	NDJSON.query = async function (arg0_options) {
		//Convert from parameters
		let options = arg0_options ? arg0_options : {};
		
		//Initialise options
		if (!options.query_obj) options.query_obj = {};
		
		//Declare local instance variables
		let limit_end = options.limit_end;
		let limit_start = Math.returnSafeNumber(options.limit_start, 0);
		
		let results = await NDJSON.task("all", {
			type: "query",
			file_path: path.resolve(ve.ndjson_file_path),
			query: options.query_obj,
			limit_end: limit_end
		});
		
		let final_results = results.filter(v => v !== null).flat();
		
		//Return statement
		if (limit_end !== undefined) {
			return final_results.slice(limit_start, limit_end);
		} else if (limit_start > 0) {
			return final_results.slice(limit_start);
		}
		return final_results;
	};
	
	/**
	 * Removes a value from the NDJSON file.
	 *
	 * @param {string} arg0_id
	 *
	 * @returns {Promise<boolean>}
	 */
	NDJSON.removeValue = async function (arg0_id) {
		//Convert from parameters
		let id = arg0_id;
		
		//Declare local instance variables
		let map = {};
		map[id] = null;
		
		//Return statement
		return await NDJSON.setValues(map);
	};
	
	/**
	 * Removes multiple values from the NDJSON file.
	 *
	 * @param {string[]} arg0_ids
	 *
	 * @returns {Promise<boolean>}
	 */
	NDJSON.removeValues = async function (arg0_ids) {
		//Convert from parameters
		let ids = arg0_ids;
		
		//Declare local instance variables
		let map = {};
		
		//Iterate over all ids to remove
		for (let i = 0; i < ids.length; i++)
			map[ids[i]] = null;
		
		//Return statement
		return await NDJSON.setValues(map);
	};
	
	/**
	 * Saves the NDJSON file back into the main directory.
	 *
	 * @returns {Promise<void>}
	 */
	NDJSON.save = async function () {
		//Declare local instance variables
		let file_path = path.resolve(ve.ndjson_file_path);
		let folder_path = `${file_path}.tmpndjson`;
		let pool = NDJSON.getWorkerPool();
		
		if (!fs.existsSync(folder_path)) return; //Internal guard clause if folder path doesn't exist
		
		let ws = fs.createWriteStream(file_path); // Overwrite target .ndjson
		ws.write("{\n");
		
		//Iterate over all workers and write as needed
		let first = true;
		for (let i = 0; i < pool.length; i++) {
			let page_file = path.join(folder_path, `${i}.ndjson`);
			if (fs.existsSync(page_file)) {
				//Iterate over all lines in rl
				let rs = fs.createReadStream(page_file);
				let rl = readline.createInterface({ input: rs });
				for await (let line of rl) {
					if (line.trim().length === 0) continue;
					if (!first) ws.write(",\n");
					ws.write(line.trim());
					first = false;
				}
				rl.close();
				rs.destroy();
			}
		}
		
		ws.write("\n}");
		ws.end();
		await new Promise((r) => ws.on("finish", r));
		
		//Retry mechanism for rmSync to handle lingering handles on Windows
		let removed = false;
		let attempts = 0;
		while (!removed && attempts < 5)
			try {
				fs.rmSync(folder_path, { recursive: true, force: true });
				removed = true;
			} catch (e) {
				attempts++;
				await new Promise((r) => setTimeout(r, 100));
			}
	};
	
	/**
	 * Sets the `.history.keyframes` object for a given key.
	 *
	 * @param {string} arg0_id
	 * @param {Object} arg1_keyframes
	 *
	 * @returns {Promise<boolean>}
	 */
	NDJSON.setKeyframes = async function (arg0_id, arg1_keyframes) {
		//Convert from parameters
		let id = arg0_id;
		let keyframes_obj = arg1_keyframes;
		
		//Return statement
		return NDJSON.task(id, {
			type: "set_keyframes",
			file_path: path.resolve(ve.ndjson_file_path),
			id: id,
			keyframes: keyframes_obj
		});
	};
	
	/**
	 * Sets a key-value pair in the NDJSON file.
	 *
	 * @param {string} arg0_id
	 * @param {Object} arg1_value
	 *
	 * @returns {Promise<boolean>}
	 */
	NDJSON.setValue = async function (arg0_id, arg1_value) {
		//Convert from parameters
		let id = arg0_id;
		let value = arg1_value;
		
		//Declare local instance variables
		let map = {};
		map[id] = value;
		
		//Return statement
		return await NDJSON.setValues(map);
	};
	
	/**
	 * Sets multiple key-value pairs for the NDJSON file.
	 *
	 * @param {Object} arg0_update_map
	 *
	 * @returns {Promise<boolean>}
	 */
	NDJSON.setValues = async function (arg0_update_map) {
		//Convert from parameters
		let update_map = (arg0_update_map) ? arg0_update_map : {};
		
		//Declare local instance variables
		let pool = NDJSON.getWorkerPool();
		let updates_by_worker = {};
		
		//Iterate over all keys in update map
		for (let key in update_map) {
			let wid = NDJSON.getWorkerID(key, pool.length);
			if (!updates_by_worker[wid]) updates_by_worker[wid] = {};
			updates_by_worker[wid][key] = update_map[key];
		}
		
		let target_wids = Object.keys(updates_by_worker).map(Number);
		
		//Dispatch tasks via the NDJSON.task helper
		await NDJSON.task(target_wids, (wid) => ({
			type: "set_values",
			file_path: path.resolve(ve.ndjson_file_path),
			update_map: updates_by_worker[wid]
		}));
		
		//Return statement
		return true;
	};
}