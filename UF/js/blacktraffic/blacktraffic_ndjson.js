//Import libraries
if (!global.ve) global.ve = {};
let NodeWorker = require("node:worker_threads").Worker;

/**
 * Parses a file into NDJSON.
 *
 * @param {string} arg0_file_path - The filepath to convert to .ndjson.
 * @param {Object} [arg1_options]
 *  @param {number} [arg1_options.ram_threshold=0.50] - Percentage of RAM dedicated to loading NDJSON when running.
 *  @param {number} [arg1_options.dynamic_chunk_size=67108864] - The size of each chunk of NDJSON to load into memory at init.
 *  @param {number} [arg1_options.dynamic_max_workers=os.cpus().length - 1] - The maximum number of workers to spawn at init.
 *
 * @returns {Promise<void>}
 */
ve.NDJSON_parse = async function (arg0_file_path, arg1_options) {
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
	
	//Initialise logic functions
	let refreshLimits = () => {
		let memory = process.memoryUsage();
		let memory_usage = memory.heapUsed;
		
		let available_buffer = (heap_limit*options.ram_threshold) - memory_usage; //50% of RAM heap by default
		
		//If we are exceeding n% of --max-old-space-size, throttle down
		if (available_buffer < 0) {
			_dynamic_chunk_size = Math.max(1024*1024, _dynamic_chunk_size*0.9); //Floor at 1MB; throttle down by 10%
			_dynamic_max_workers = Math.max(1, _dynamic_max_workers - 1);
		} else {
			//If we have plenty of room, scale back up to CPU limits
			_dynamic_chunk_size = Math.min(128*1024*1024, Math.floor(available_buffer*options.ram_threshold));
			_dynamic_max_workers = Math.min(os.cpus().length - 1, _dynamic_max_workers + 1);
		}
	};
	
	//Return statement
	return new Promise((resolve, reject) => {
		let processNextChunk = () => {
			if (current_offset >= stats.size) {
				if (active_workers === 0) {
					write_stream.end();
					resolve(`${file_path}.ndjson`);
				}
				return;
			}
			
			//Re-evaluate RAM ceiling before spawning
			refreshLimits();
			if (active_workers < _dynamic_max_workers) {
				let start = current_offset;
				let end = Math.min(start + _dynamic_chunk_size - 1, stats.size - 1);
				
				active_workers++;
				current_offset = end + 1;
				
				let worker = new NodeWorker("./UF/js/vercengen/workers/worker_vercengen_ndjson.js", {
					workerData: { file_path, start, end, initial_depth: global_depth }
				});
				worker.on("message", (message) => {
					global_depth = message.final_depth;
					
					let can_write = write_stream.write(message.transformed_data);
					let continueProcessing = () => {
						active_workers--;
						processNextChunk();
					}
					
					if (!can_write) {
						write_stream.once("drain", continueProcessing);
					} else {
						setImmediate(continueProcessing);
					}
				});
				worker.on("error", reject);
				
				//Try to saturate the updated _dynamic_max_workeers
				if (active_workers < _dynamic_max_workers) processNextChunk();
			}
		};
		
		processNextChunk(); //Initialise next chunk processing
	});
};

//AI SLOP ZONE START

//Declare global locks
if (!global.ve.ndjson_locks) global.ve.ndjson_locks = new Map();

//Initialise functions
{
	ve.NDJSON_getLock = async function (arg0_file_path) {
		//Convert from parameters
		let file_path = path.resolve(arg0_file_path);
		
		//Wait for existing lock to resolve
		while (global.ve.ndjson_locks.get(file_path))
			await global.ve.ndjson_locks.get(file_path);
		
		//Create a new lock
		let resolve_lock;
		let lock_promise = new Promise((resolve) => { resolve_lock = resolve; });
		global.ve.ndjson_locks.set(file_path, lock_promise);
		
		//Return unlock function
		return function () {
			global.ve.ndjson_locks.delete(file_path);
			resolve_lock();
		};
	};
	
	ve.NDJSON_getWorkerPool = function (arg0_max_workers) {
		//Convert from parameters
		let max_workers = Math.returnSafeNumber(arg0_max_workers, os.cpus().length - 1);
		
		//Init workerpool variables
		if (global.ve.ndjson_pending_tasks === undefined) global.ve.ndjson_pending_tasks = new Map();
		if (global.ve.ndjson_task_id_counter === undefined) global.ve.ndjson_task_id_counter = 0;
		if (global.ve.ndjson_worker_pool === undefined) global.ve.ndjson_worker_pool = [];
		
		//Declare local instance variables
		if (global.ve.ndjson_worker_pool.length === 0)
			for (let i = 0; i < max_workers; i++) {
				let worker = new NodeWorker("./UF/js/vercengen/workers/worker_vercengen_db.js");
				worker.on("message", (response) => {
					let { task_id, results, status, count, tombstones } = response;
					let callback = global.ve.ndjson_pending_tasks.get(task_id);
					
					if (callback) {
						if (status === "indexed")
							callback({ count, tombstones: tombstones || [] });
						else if (status === "updated" || status === "purged")
							callback(true);
						else
							callback(results);
						global.ve.ndjson_pending_tasks.delete(task_id);
					}
				});
				global.ve.ndjson_worker_pool.push(worker);
			}
		
		//Return statement
		return global.ve.ndjson_worker_pool;
	};
	
	ve.NDJSON_checkIndex = async function (arg0_file_path, arg1_options) {
		//Convert from parameters
		let file_path = path.resolve(arg0_file_path);
		let options = (arg1_options) ? arg1_options : {};
		
		//Declare local instance variables
		let stats = await fs.promises.stat(file_path);
		
		if (global.ve.ndjson_file_metadata?.[file_path] !== stats.mtimeMs)
			await ve.NDJSON_index(file_path, options);
	};
	
	ve.NDJSON_index = async function (arg0_file_path, arg1_options) {
		//Convert from parameters
		let file_path = path.resolve(arg0_file_path);
		let options = (arg1_options) ? arg1_options : {};
		
		//Declare local instance variables
		let stats = await fs.promises.stat(file_path);
		let mtime = stats.mtimeMs;
		let pool = ve.NDJSON_getWorkerPool(options.dynamic_max_workers);
		let chunk_size = Math.ceil(stats.size / pool.length);
		let promises = [];
		
		for (let i = 0; i < pool.length; i++) {
			let task_id = global.ve.ndjson_task_id_counter++;
			promises.push(new Promise((resolve) => {
				global.ve.ndjson_pending_tasks.set(task_id, resolve);
				pool[i].postMessage({
					type: "index",
					task_id: task_id,
					file_path: file_path,
					mtime: mtime,
					start: i * chunk_size,
					end: (i === pool.length - 1) ? stats.size : (i + 1) * chunk_size
				});
			}));
		}
		
		let results = await Promise.all(promises);
		
		//Collect all tombstone keys from every worker
		let all_tombstones = new Set();
		for (let i = 0; i < results.length; i++)
			if (results[i].tombstones)
				for (let j = 0; j < results[i].tombstones.length; j++)
					all_tombstones.add(results[i].tombstones[j]);
		
		//Broadcast purge to all workers so no stale entries survive cross-chunk
		if (all_tombstones.size > 0) {
			let tombstone_array = Array.from(all_tombstones);
			let purge_promises = [];
			
			for (let i = 0; i < pool.length; i++) {
				let task_id = global.ve.ndjson_task_id_counter++;
				purge_promises.push(new Promise((resolve) => {
					global.ve.ndjson_pending_tasks.set(task_id, resolve);
					pool[i].postMessage({
						type: "purge_keys",
						task_id: task_id,
						keys: tombstone_array
					});
				}));
			}
			
			await Promise.all(purge_promises);
		}
		
		if (!global.ve.ndjson_file_metadata) global.ve.ndjson_file_metadata = {};
		global.ve.ndjson_file_metadata[file_path] = mtime;
	};
	
	ve.NDJSON_getValue = async function (arg0_file_path, arg1_id, arg2_options) {
		//Convert from parameters
		let file_path = path.resolve(arg0_file_path);
		let options = (arg2_options) ? arg2_options : {};
		
		//Acquire Mutex
		let unlock = await ve.NDJSON_getLock(file_path);
		
		try {
			await ve.NDJSON_checkIndex(file_path, options);
			
			//Declare local instance variables
			let pool = ve.NDJSON_getWorkerPool();
			let promises = [];
			
			for (let i = 0; i < pool.length; i++) {
				let task_id = global.ve.ndjson_task_id_counter++;
				promises.push(new Promise((resolve) => {
					global.ve.ndjson_pending_tasks.set(task_id, resolve);
					pool[i].postMessage({ type: "get_value", task_id: task_id, file_path: file_path, id: arg1_id });
				}));
			}
			
			let results = await Promise.all(promises);
			
			//Return statement
			return results.find(v => v !== null) || null;
		} finally {
			unlock();
		}
	};
	
	ve.NDJSON_diffAll = async function (arg0_file_path, arg1_options) {
		//Convert from parameters
		let file_path = path.resolve(arg0_file_path);
		let options = (arg1_options) ? arg1_options : {};
		
		//Acquire Mutex
		let unlock = await ve.NDJSON_getLock(file_path);
		
		try {
			await ve.NDJSON_checkIndex(file_path, options);
			
			//Declare local instance variables
			let pool = ve.NDJSON_getWorkerPool();
			let promises = [];
			
			for (let i = 0; i < pool.length; i++) {
				let task_id = global.ve.ndjson_task_id_counter++;
				promises.push(new Promise((resolve) => {
					global.ve.ndjson_pending_tasks.set(task_id, resolve);
					pool[i].postMessage({ type: "diff_all", task_id: task_id, file_path: file_path, timestamp: options.timestamp });
				}));
			}
			
			let results = await Promise.all(promises);
			
			//Return statement
			return results.filter(v => v !== null).flat();
		} finally {
			unlock();
		}
	};
	
	ve.NDJSON_setValues = async function (arg0_file_path, arg1_update_map, arg2_options) {
		//Convert from parameters
		let file_path = path.resolve(arg0_file_path);
		let update_map = (arg1_update_map) ? arg1_update_map : {};
		let options = (arg2_options) ? arg2_options : {};
		
		//Acquire Mutex
		let unlock = await ve.NDJSON_getLock(file_path);
		
		try {
			await ve.NDJSON_checkIndex(file_path, options);
			
			//Declare local instance variables
			let pool = ve.NDJSON_getWorkerPool();
			let stats = await fs.promises.stat(file_path);
			let current_offset = stats.size;
			
			let append_lines = [];
			let new_offsets = {};
			let tombstone_keys = [];
			
			//Build append buffer and compute byte offsets for each entry
			let update_keys = Object.keys(update_map);
			
			for (let i = 0; i < update_keys.length; i++) {
				let id = update_keys[i];
				let value = update_map[id];
				
				let line = (value === null)
					? `"${id}":null\n`
					: `"${id}":${JSON.stringify(value)}\n`;
				let line_bytes = Buffer.byteLength(line);
				
				new_offsets[id] = { start: current_offset, end: current_offset + line_bytes - 1 };
				if (value === null) tombstone_keys.push(id);
				append_lines.push(line);
				current_offset += line_bytes;
			}
			
			//Single small append instead of full rewrite
			if (append_lines.length > 0)
				await fs.promises.appendFile(file_path, append_lines.join(""));
			
			//Get new mtime so workers + main thread stay in sync
			let new_stats = await fs.promises.stat(file_path);
			let new_mtime = new_stats.mtimeMs;
			
			//Broadcast lightweight index patches to all workers
			let promises = [];
			
			for (let i = 0; i < pool.length; i++) {
				let task_id = global.ve.ndjson_task_id_counter++;
				promises.push(new Promise((resolve) => {
					global.ve.ndjson_pending_tasks.set(task_id, resolve);
					pool[i].postMessage({
						type: "update_index",
						task_id: task_id,
						offsets: new_offsets,
						tombstone_keys: tombstone_keys,
						is_primary: i === 0,
						mtime: new_mtime
					});
				}));
			}
			
			await Promise.all(promises);
			
			//Update main thread metadata
			if (!global.ve.ndjson_file_metadata) global.ve.ndjson_file_metadata = {};
			global.ve.ndjson_file_metadata[file_path] = new_mtime;
		} finally {
			unlock();
		}
	};
	
	ve.NDJSON_setValue = async function (arg0_file_path, arg1_id, arg2_value) {
		let map = {};
		map[arg1_id] = arg2_value;
		
		//Return statement
		return await ve.NDJSON_setValues(arg0_file_path, map);
	};
	
	ve.NDJSON_removeValue = async function (arg0_file_path, arg1_id) {
		let map = {};
		map[arg1_id] = null;
		
		//Return statement
		return await ve.NDJSON_setValues(arg0_file_path, map);
	};
}

//AI SLOP ZONE END