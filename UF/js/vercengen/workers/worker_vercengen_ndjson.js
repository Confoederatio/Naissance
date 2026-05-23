//Import libraries
if (!global.ve) global.ve = {};

if (!global.fs) try { fs = require("fs"); } catch (e) {}
let { parentPort, workerData } = require("node:worker_threads");
//Destructure worker data
let { file_path, start, end, initial_depth } = workerData;

//Initialise function
{
	ve.NDJSON_processSegment = function () {
		//Declare local instance variables
		let depth = initial_depth;
		let read_stream = fs.createReadStream(file_path, { start, end });
		
		let escaped = false;
		let in_string = false;
		let result_parts = [];
		
		//Chunk read stream data
		read_stream.on("data", (chunk) => {
			let last_pos = 0;
			
			//Iterate over chunk
			for (let i = 0; i < chunk.length; i++) {
				let local_char = chunk[i];
				
				//Code IDs are ASCII
				if (local_char === 34 && !escaped) in_string = (!in_string); //34: "
				escaped = (local_char === 92 && !escaped); //92: \
				
				//Non-string literal parsing
				if (!in_string)
					if (local_char === 91 || local_char === 123) { //91/123: [
						if (depth === 0) { //Move up starting bracket; 1-indexed
							result_parts.push(chunk.subarray(last_pos, i + 1));
							result_parts.push(Buffer.from("\n"));
							last_pos = i + 1;
						}
						depth++;
					} else if (local_char === 93 || local_char === 125) {  //93/125: ]
						depth--;
						if (depth === 0) { //Move down ending bracket; length - 2
							result_parts.push(chunk.subarray(last_pos, i));
							result_parts.push(Buffer.from("\n"));
							last_pos = i;
						}
					}
					//Depth: 1 since first { in .json causes base-level depth to be 1-indexed
					else if (local_char === 44 && depth === 1) { //44: ,
						result_parts.push(chunk.subarray(last_pos, i));
						result_parts.push(Buffer.from("\n"));
						last_pos = i + 1;
					}
			}
			result_parts.push(chunk.subarray(last_pos)); //Push the remainder of this chunk
		});
		read_stream.on("end", () => {
			let final_buffer = Buffer.concat(result_parts);
			parentPort.postMessage({
				transformed_data: final_buffer,
				final_depth: depth
			}, [final_buffer.buffer]);
		});
	};
}

//Start worker
ve.NDJSON_processSegment();