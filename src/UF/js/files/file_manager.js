//Initialise functions
{
	/**
	 * getAllFiles() - Fetches all files within a folder and returns them.
	 * @param {String} arg0_folder
	 *
	 * @returns {Array<String>}
	 */
	function getAllFiles (arg0_folder) {
		//Convert from parameters
		var folder = arg0_folder;

		//Declare local instance variables
		var file_array = [];

		try {
			var files = fs.readdirSync(folder);

			for (var i = 0; i < files.length; i++) {
				var file_path = path.join(folder, files[i]);

				if (fs.statSync(file_path).isDirectory()) {
					file_array = file_array.concat(getAllFiles(file_path)); //Recursively call function when a directory is encountered
				} else if (file_path.endsWith(".js")) {
					file_array.push(file_path);
				}
			}
		} catch (e) {}

		//Return statement
		return file_array;
	}

	/**
	 * loadFileInDOM() - Loads a file at the end of the <body> tag in DOM.
	 * @param {String} arg0_file_path
	 */
	function loadFileInDOM (arg0_file_path) {
		//Convert from parameters
		var file_path = arg0_file_path;

		try {
			var script = document.createElement("script");
			//Convert absolute path from __dirname to a relative path for the browser
			script.src = file_path.replace(__dirname, ".");
			script.type = "text/javascript";
			script.async = false; //Crucial for loading scripts in order

			document.body.appendChild(script);
		} catch (e) {
			console.error("Failed to create script tag for " + file_path, e);
		}
	}

	//loadAllScripts() - Loads all scripts as defined in global.load_order.
	function loadAllScripts () {
		//Declare local instance variables
		var all_potential_files = [];

		//1. Get all files in directories.
		load_order.load_directories.forEach(function (dir) {
			var full_path = path.join(__dirname, dir);
			var files_in_dir = getAllFiles(full_path);

			all_potential_files = all_potential_files.concat(files_in_dir);
		});

		//2. Match wildcard files and import them.
		load_order.load_files.forEach(function (file_pattern) {
			if (file_pattern.includes("*")) {
				// Handle wildcard
				var directory = path.dirname(file_pattern);
				var files_in_dir = getAllFiles(path.join(__dirname, directory));
				var pattern = new RegExp(
					"^" +
					path.basename(file_pattern).replace(".", "\\.")
						.replace("*", ".*") + "$"
				);

				//Iterate over all files_in_dir
				files_in_dir.forEach(function (file) {
					if (pattern.test(path.basename(file))) {
						all_potential_files.push(file);
					}
				});
			} else {
				//Iterate over all directories

				load_order.load_directories.forEach(function (dir) {
					var potential_path = path.join(__dirname, dir, file_pattern);
					if (fs.existsSync(potential_path))
						all_potential_files.push(potential_path);
				});
			}
		});

		//3. Remove duplicates from the list
		var seen_files = {};
		var unique_files_to_load = [];

		all_potential_files.forEach(function (file) {
			if (!seen_files[file]) {
				unique_files_to_load.push(file);
				seen_files[file] = true;
			}
		});

		//4. Iterate over all unique_files_to_load; load all unique scripts
		console.log(`Attempting to load ${unique_files_to_load.length} script tags in ${load_order.load_directories.length} directories ..`);
		unique_files_to_load.forEach(function (file) {
			loadFileInDOM(file);
		});
	}
}