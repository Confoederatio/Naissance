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

//String utils - [WIP] - Override at a later date
{
	String.prototype.hashCode = function () {
		//Declare local instance variables
		let hash = 0;
		
		//Iterate over this.length
		for (let i = 0; i < this.length; i++) {
			hash = (hash << 5) - hash + this.charCodeAt(i);
			hash |= 0;
		}
		
		//Return statement
		return hash;
	};
}

//Initialise functions
{
	/**
	 * Initialises IPC handlers.
	 * 
	 * ontology:initialise - Initialises Ontology streaming.
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
	};
	
	try {
		require("../../blacktraffic/blacktraffic_ndjson.js");
	} catch (e) {} //NDJSON handling
}

module.exports = { 
	initialiseIPC: ve.initialiseIPC,
	loadNDJSON: ve.loadNDJSON,
	
	NDJSON_checkIndex: ve.NDJSON_checkIndex,
	NDJSON_diff: ve.NDJSON_diff,
	NDJSON_diffAll: ve.NDJSON_diffAll,
	NDJSON_getValue: ve.NDJSON_getValue,
	NDJSON_getWorkerPool: ve.NDJSON_getWorkerPool,
	NDJSON_index: ve.NDJSON_index,
	NDJSON_parse: ve.NDJSON_parse,
	NDJSON_query: ve.NDJSON_query,
	NDJSON_removeValue: ve.NDJSON_removeValue,
	NDJSON_setValue: ve.NDJSON_setValue,
	NDJSON_setValues: ve.NDJSON_setValues
};