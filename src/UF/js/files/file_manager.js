//Initialise functions
{
	/**
	 * getAllFiles() - Fetches all files within a folder and returns them.
	 * @param folder
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

	function loadFileToDOM (arg0_file_path) {
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

	function loadAllScripts () {
		//Declare local instance variables
		var all_potential_files = [];

		// --- Step 1: Gather all files from directories ---
		global.load_order.load_directories.forEach(function (dir) {
			var full_path = path.join(__dirname, dir);
			var files_in_dir = getAllFiles(full_path);

			all_potential_files = all_potential_files.concat(files_in_dir);
		});

		// --- Step 2: Gather all files from specific/wildcard list ---
		global.load_order.load_files.forEach(function (file_pattern) {
			if (file_pattern.includes("*")) {
				// Handle wildcard
				var directory = path.dirname(file_pattern);
				var pattern = new RegExp(
					"^" +
					path
					.basename(file_pattern)
					.replace(".", "\\.")
					.replace("*", ".*") +
					"$"
				);
				var files_in_dir = getAllFiles(path.join(__dirname, directory));

				files_in_dir.forEach(function (file) {
					if (pattern.test(path.basename(file))) {
						all_potential_files.push(file);
					}
				});
			} else {
				// Handle specific file
				// This is tricky because we don't know which directory it's in.
				// We search all of them.
				global.load_order.load_directories.forEach(function (dir) {
					var potential_path = path.join(__dirname, dir, file_pattern);
					if (fs.existsSync(potential_path)) {
						all_potential_files.push(potential_path);
					}
				});
			}
		});

		// --- Step 3: De-duplicate the list ---
		var unique_files_to_load = [];
		var seen_files = {};
		all_potential_files.forEach(function (file) {
			if (!seen_files[file]) {
				unique_files_to_load.push(file);
				seen_files[file] = true;
			}
		});

		// --- Step 4: Load all unique scripts ---
		console.log(
			"Attempting to load " + unique_files_to_load.length + " unique scripts..."
		);
		unique_files_to_load.forEach(function (file) {
			console.log("Loading:", file.replace(__dirname, ""));
			loadFileToDOM(file);
		});
		console.log("Script loading process complete.");
	}
}