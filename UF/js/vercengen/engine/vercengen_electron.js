//Import libraries
if (!global.ve) global.ve = {};

if (!global.electron) try { electron = require("electron"); } catch (e) {}
if (!global.file_read) try { file_read = require("../../file/file_read"); } catch (e) {}
if (!global.fs) try { fs = require("fs"); } catch (e) {}
if (!global.os) global.os = require("node:os");
if (!global.path) try { path = require("path"); } catch (e) {}
if (!global.readline) try { readline = require("readline"); } catch (e) {}
if (!global.v8) global.v8 = require("node:v8");

//Math utils - [WIP] - Override at a later date
{
	if (!global.Math) global.Math = {};
	Math.returnSafeNumber = function (arg0_number, arg1_default) {
		//Convert from parameters
		let number = parseFloat(arg0_number);
		let default_value = (arg1_default !== undefined) ? arg1_default : 0;
		
		//Return statement
		return (!isNaN(number) && isFinite(number)) ? number : default_value;
	};
}

//Initialise functions
{
	/**
	 * Initialises IPC handlers.
	 * 
	 * List of valid IPC channels:
	 * - electron:close-dev-tools
	 * - electron:is-dev-tools-focused
	 * - electron:is-dev-tools-open
	 * - electron:open-dev-tools
	 * - electron:toggle-dev-tools
	 * - ndjson - NDJSON handler (arg0_function_key, argn_arguments).
	 * - ndjson:get-all-functions - Returns all NDJSON functions.
	 * - ontology:initialise - Initialises Ontology streaming.
	 * - ontology:stream-batch - DB sends batch to render.
	 * - ontology:stream-done - Marks all streaming as finished (loaded into memory).
	 * - ontology:stream-next - Render requests batch from DB.
	 * 
	 * @param {Object} [arg0_options]
	 *  @param {number} [arg0_options.ontology_stream_size=256] - The stream packet size for Ontologies from DB.
	 */
	ve.initialiseIPC = function (arg0_options) {
		//Convert from parameters
		let options = (arg0_options) ? arg0_options : {};
		
		//Initialise options
		options.ontology_stream_size = (options.ontology_stream_size > 0) ?
			options.ontology_stream_size : 256;
		
		//Declare local instance variables
		let ipc_main = electron.ipcMain;
		
		//electron
		ipc_main.on("electron:close-dev-tools", async (event) => {
			event.sender.closeDevTools();
			event.sender.send("electron:close-dev-tools:ready");
		});
		ipc_main.on("electron:is-dev-tools-focused", async (event) => {
			event.sender.send("electron:is-dev-tools-focused:ready", event.sender.isDevToolsFocused());
		})
		ipc_main.on("electron:is-dev-tools-open", async (event) => {
			event.sender.send("electron:is-dev-tools-open:ready", event.sender.isDevToolsOpened());
		});
		ipc_main.on("electron:open-dev-tools", async (event) => {
			event.sender.openDevTools();
			event.sender.send("electron:open-dev-tools:ready");
		});
		ipc_main.on("electron:toggle-dev-tools", async (event) => {
			event.sender.toggleDevTools();
			event.sender.send("electron:toggle-dev-tools:ready");
		});
		
		//ndjson
		ipc_main.on("ndjson", async (event, function_key, ...argn_arguments) => {
			if (NDJSON[function_key] === undefined) event.sender.send("ndjson:ready", null);
			
			//console.log(`Received`, function_key, argn_arguments);
			let result = await NDJSON[function_key](...argn_arguments);
			event.sender.send("ndjson:ready", result);
		});
		//ndjson:get-all-functions
		ipc_main.on("ndjson:get-all-functions", async (event) => {
			let all_ndjson_function_keys = [];
			let all_ndjson_keys = Object.keys(NDJSON);
			
			for (let i = 0; i < all_ndjson_keys.length; i++) {
				let local_value = NDJSON[all_ndjson_keys[i]];
				
				if (typeof local_value === "function")
					all_ndjson_function_keys.push(all_ndjson_keys[i]);
			}
			
			event.sender.send("ndjson:get-all-functions:ready", all_ndjson_function_keys);
		});
		
		//ontology
		ipc_main.on("ontology:initialise", async (event, folder_path) => {
			//Declare local instance variables
			if (!fs.existsSync(folder_path)) fs.mkdirSync(folder_path, { recursive: true });
			let all_files = fs.readdirSync(folder_path)
				.filter((f) => f.endsWith(".ontology"))
				.sort((a, b) => b.localeCompare(a));
			let web_contents = event.sender;
			
			async function* getOntologyBatches () {
				let batch = {};
				let count = 0;
				
				for (let local_file of all_files) {
					let local_file_path = path.join(folder_path, local_file);
					
					//Process each file backwards line-by-line
					for await (let local_line of global.file_read.readLinesBackwards(local_file_path)) {
						if (!local_line.trim()) continue;
						
						let json_start = local_line.indexOf("{");
						if (json_start === -1) continue;
						
						let id = local_line.substring(0, json_start).trim();
						try {
							let local_keyframe = JSON.parse(local_line.substring(json_start));
								local_keyframe._saved = true;
							
							if (!batch[id]) batch[id] = [];
							batch[id].push(local_keyframe);
							count++;
							
							//Smaller batch size (256) is better for IPC stability
							if (count >= options.ontology_stream_size) {
								yield batch;
								batch = {};
								count = 0;
							}
						} catch (e) {}
					}
				}
				if (Object.keys(batch).length > 0) yield batch;
			}
			
			let currentStream = getOntologyBatches();
			let sendNextBatch = async () => {
				let { value, done } = await currentStream.next();
				
				if (done) {
					web_contents.send('ontology:stream-done');
					ipc_main.removeListener('ontology:stream-next', sendNextBatch);
				} else {
					web_contents.send('ontology:stream-batch', value);
				}
			};
			
			//Stream in batches
			ipc_main.removeAllListeners('ontology:stream-next');
			ipc_main.on('ontology:stream-next', sendNextBatch);
			await sendNextBatch();
		});
		
		//process
		ipc_main.on("process", async (event, json) => {
			if (proc.IPC_task === undefined) event.sender.send("process:ready", null);
			
			let result = await proc.IPC_task(json);
			event.sender.send("process:ready", result);
		});
		ipc_main.on("process:get-diagnostics", async (event) => {
			let result = await proc.IPC_getDiagnostics();
			event.sender.send("process:get-diagnostics:ready", result);
		});
		ipc_main.on("process:get-worker-pool", async (event, max_workers) => {
			let pool = proc.IPC_getWorkerPool(max_workers);
			let serialised_pool = pool.map((w) => { 
				return {
					threadId: w?.threadId,
					resourceLimits: w?.resourceLimits ? {
						maxYoungGenerationSizeMb: w.resourceLimits.maxYoungGenerationSizeMb,
						maxOldGenerationSizeMb: w.resourceLimits.maxOldGenerationSizeMb,
						codeRangeSizeMb: w.resourceLimits.codeRangeSizeMb,
						stackSizeMb: w.resourceLimits.stackSizeMb
					} : null
				};
			});
			event.sender.send("process:get-worker-pool:ready", serialised_pool);
		});
	};
	
	try {
		require("../db/NDJSON_main.js");
		require("../../../../core/process/workers/process_main.js");
	} catch (e) {} //NDJSON handling
}

module.exports = { 
	initialiseIPC: ve.initialiseIPC
};