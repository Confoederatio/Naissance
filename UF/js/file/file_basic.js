//Initialise functions
{
	if (!global.File)
		/**
		 * The namespace for all UF/File utility functions, typically for static methods.
		 * 
		 * @namespace File
		 */
		global.File = {};
	
	/**
	 * Whether a file is inside a folder path.
	 * @alias File.containsPath
	 * 
	 * @param {string} arg0_file_path
	 * @param {string} arg1_folder_path
	 * 
	 * @returns {boolean}
	 */
	//[QUARANTINE]
	File.containsPath = function (arg0_file_path, arg1_folder_path) {
		const resolvedFile = path.resolve(arg0_file_path);
		const resolvedFolder = path.resolve(arg1_folder_path);
		
		//Return statement
		return (
			resolvedFile === resolvedFolder ||
			resolvedFile.startsWith(resolvedFolder + path.sep)
		);
	};
	
	/**
	 * Converts an image, preferably `.png`, to a Base64 string for inline embedding.
	 * @alias File.convertImageToBase64
	 * 
	 * @param {string} arg0_file_path
	 * 
	 * @returns {string}
	 */
	File.convertImageToBase64 = function (arg0_file_path) {
		//Convert from parameters
		let file_buffer = fs.readFileSync(arg0_file_path);
		
		//Return statement
		return file_buffer.toString("base64");
	};
	
	/**
	 * Returns all drives in the current operating system.
	 * @alias File.getAllDrives
	 * 
	 * @returns {string[]}
	 */
	//[QUARANTINE]
	File.getAllDrives = function () {
		const platform = process.platform;
		
		try {
			if (platform === "win32") {
				// Run WMIC command to list logical drives
				const output = child_process.execSync("wmic logicaldisk get name", { encoding: "utf8" });
				return output
				.split("\n")
				.map((line) => line.trim())
				.filter((line) => /^[A-Z]:$/i.test(line)) // e.g. "C:"
				.map((drive) => drive + "\\");
			} else {
				// POSIX systems
				// Common mount points: "/", "/Volumes/*" (macOS), "/mnt/*" or "/media/*" (Linux)
				const drives = ["/"];
				
				const possibleDirs = ["/Volumes", "/mnt", "/media"];
				for (const dir of possibleDirs) {
					if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
						const subMounts = fs
						.readdirSync(dir)
						.map((name) => path.join(dir, name))
						.filter((p) => {
							try {
								return fs.statSync(p).isDirectory();
							} catch {
								return false;
							}
						});
						drives.push(...subMounts);
					}
				}
				return drives;
			}
		} catch (err) {
			console.error("getAllDrives() failed:", err);
			return [];
		}
	};
	
	/**
	 * Returns all files in a current folder path as full file paths.
	 * @alias File.getAllFiles
	 * 
	 * @param {string} arg0_folder_path
	 * @param {Object} [arg1_options]
	 *  @param {string[]} [arg1_options.excluded_paths]
	 * 
	 * @returns {string[]}
	 */
	File.getAllFiles = async function (arg0_folder_path, arg1_options) {
		//Convert from parameters
		let root_path = path.resolve(arg0_folder_path);
		let options = arg1_options || {};
		
		//Declare local instance variables
		let excluded_paths = (options.excluded_paths || []).map((p) => path.resolve(p));
		
		try {
			let entries = await fs.promises.readdir(root_path, { withFileTypes: true });
			let paths = await Promise.all(
				entries.map(async (entry) => {
					let full_path = path.resolve(root_path, entry.name);
					
					//Internal guard clause if the current full path is in the excluded list
					if (excluded_paths.includes(full_path))
						return [];
					if (entry.isDirectory())
						//Recursively call File.getAllFiles if possible
						return await File.getAllFiles(full_path, options);
					return full_path;
				}),
			);
			
			return paths.flat();
		} catch (err) {
			console.error(`File.getAllFiles: Error reading directory ${root_path}:`, err);
			throw err;
		}
	};
	
	/**
	 * Returns all files in a current folder synchronously.
	 * @alias File.getAllFilesSync
	 * 
	 * @param {string} arg0_folder_path
	 * 
	 * @returns {string[]}
	 */
	File.getAllFilesSync = function (arg0_folder_path) {
		//Convert from parameters
		let folder_path = arg0_folder_path;
		
		//Declare local instance variables
		let all_files = fs.readdirSync(folder_path, {
			recursive: true,
			withFileTypes: true
		});
		
		//Return statement
		return all_files.filter((entry) => entry.isFile())
			.map((entry) => path.join(entry.path, entry.name));
	};
	
	/**
	 * Returns the time at which a file was last modified.
	 * @alias File.getLastModified
	 * 
	 * @param {string} arg0_file_path
	 * 
	 * @returns {Promise<{last_modified: Date, seconds: number}>}
	 */
	File.getLastModified = function (arg0_file_path) {
		//Convert from parameters
		let file_path = arg0_file_path;
		
		//Check if file_path exists, then extract last modified time
		if (fs.existsSync(file_path)) {
			//Declare local instance variables
			let date_obj = new Date();
			let stats = fs.statSync(file_path);
			
			let last_modified = stats.mtime;
			
			let diff_in_seconds = Math.floor((date_obj.getTime() - last_modified.getTime())/1000);
			
			//Return statement
			return {
				last_modified: last_modified,
				seconds: diff_in_seconds
			};
		}
	};
	
	/**
	 * Returns whether the given file path is a file.
	 * @alias File.isFile
	 * 
	 * @param {string} arg0_file_path
	 * 
	 * @returns {boolean}
	 */
	File.isFile = function (arg0_file_path) { return (!File.isFolder(arg0_file_path)); }
	
	/**
	 * Returns whether the given file path is a folder.
	 * @alias File.isFolder
	 * 
	 * @param {string} arg0_file_path
	 * 
	 * @returns {boolean}
	 */
	File.isFolder = function (arg0_file_path) {
		//Convert from parameters
		let file_path = path.resolve(arg0_file_path);
		
		//Return statement
		if (fs.existsSync(file_path))
			return (fs.statSync(file_path).isDirectory());
		return false;
	};
	
	/**
	 * Whether the selected file path is a valid drive.
	 * @alias File.isDrive
	 * 
	 * @param {string} arg0_file_path
	 * 
	 * @returns {boolean}
	 */
	File.isDrive = function (arg0_file_path) {
		//Convert from parameters
		let file_path = arg0_file_path;
		
		//Declare local instance variables
		let resolved = path.resolve(file_path);
		
		//Check if file_path is drive
		try {
			let stats = fs.statSync(resolved);
			if (!stats.isDirectory()) return false; //Internal guard clause if not a directory
		} catch (e) {
			//Return statement
			return false;
		}
		
		//Return statement
		return (resolved === path.parse(resolved).root);
	};
	
	//[QUARANTINE]
	File.loadCSVAsJSON = function (arg0_file_path, arg1_options) {
		//Convert from parameters
		let file_path = arg0_file_path;
		let options = arg1_options ? arg1_options : {};
		
		//Intialise options
		if (!options.mode) options.mode = "vertical";
		
		//Declare local instance variables
		let csv_string = fs.readFileSync(file_path, "utf8");
		let csv_array = csv_string.trim().split(/\r?\n/);
		let parsed_rows = csv_array.map(parseCSVLine);
		let return_obj = {};
		
		if (options.mode === "vertical") {
			let headers = parsed_rows[0];
			for (let i = 1; i < parsed_rows.length; i++) {
				let row = parsed_rows[i];
				let key = row[0];
				if (!key) continue;
				if (!return_obj[key]) {
					return_obj[key] = {};
					for (let j = 1; j < headers.length; j++) {
						return_obj[key][headers[j]] = [];
					}
				}
				for (let j = 1; j < headers.length; j++) {
					return_obj[key][headers[j]].push(row[j] !== undefined ? row[j] : null);
				}
			}
		} else if (options.mode === "horizontal") {
			// In horizontal mode, each column after the first is a key
			let property_names = parsed_rows[0];
			for (let col = 1; col < property_names.length; col++) {
				var key = property_names[col];
				if (!key) continue;
				if (!return_obj[key]) {
					return_obj[key] = {};
					// Initialize arrays for each row label (excluding the first row)
					for (let row = 1; row < parsed_rows.length; row++) {
						var row_label = parsed_rows[row][0];
						return_obj[key][row_label] = [];
					}
				}
				for (let row = 1; row < parsed_rows.length; row++) {
					var row_label = parsed_rows[row][0];
					var value = parsed_rows[row][col] !== undefined ? parsed_rows[row][col] : null;
					return_obj[key][row_label].push(value);
				}
			}
		}
		
		function parseCSVLine (line) {
			let current = "";
			let in_quotes = false;
			let result = [];
			for (let i = 0; i < line.length; i++) {
				if (line[i] === '"' && (i === 0 || line[i - 1] !== "\\")) {
					in_quotes = !in_quotes;
				} else if (line[i] === "," && !in_quotes) {
					result.push(current.trim().replace(/^"|"$/g, "").replace(/""/g, '"'));
					current = "";
				} else {
					current += line[i];
				}
			}
			result.push(current.trim().replace(/^"|"$/g, "").replace(/""/g, '"'));
			return result;
		}
		
		return return_obj;
	};
}