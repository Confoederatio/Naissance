//Import libraries
if (!global.fs) try { fs = require("fs"); } catch (e) {}

//Initialise functions
{
	if (!global.File) global.File = {};
	
	/**
	 * Reads lines in a file backwards and returns results line-by-line in 64KB chunks.
	 * @alias File.readLinesBackwards
	 * 
	 * @param {string} arg0_file_path
	 * 
	 * @returns {AsyncGenerator<string>}
	 */
	File.readLinesBackwards = async function* (arg0_file_path) {
		//Convert from parameters
		let file_path = arg0_file_path;
		
		//Declare local instance variables
		let fd = fs.openSync(file_path, "r");
		let buffer_size = 64*1024; //64KB chunks
		let buffer = Buffer.alloc(buffer_size);
		let leftover = "";
		let stats = fs.statSync(file_path);
		
		let pos = stats.size;
		
		while (pos > 0) {
			let end = pos;
				pos = Math.max(0, pos - buffer_size);
			let length = end - pos;
			
			//Read synchronously in async
			fs.readSync(fd, buffer, 0, length, pos);
			let chunk = buffer.toString("utf8", 0, length) + leftover;
			let lines = chunk.split(/\r?\n/);
			
			//The first line in the chunk might be incomplete (split across buffers)
			leftover = lines.shift();
			
			//Yield lines from the end of this chunk (which is newer in the file)
			for (let i = lines.length - 1; i >= 0; i--)
				yield lines[i];
		}
		if (leftover) yield leftover;
		fs.closeSync(fd);
	};
}

module.exports = {
	readLinesBackwards: File.readLinesBackwards
};