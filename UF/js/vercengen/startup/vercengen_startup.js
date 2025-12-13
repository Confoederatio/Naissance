//Import Node.js libraries
global.fs = require("fs");
global.path = require("path");

//Initialise functions
{
	/**
	 * @namespace global
	 */
	if (!global) global = {};
	if (!global.ve)
		/**
		 * The root namespace for all Vercengen classes and options.
		 * 
		 * @namespace ve
		 */
		global.ve = {
			/**
			 * Registry is initialised from {@link window.ve_registry} if it exists. Otherwise, default settings are used across Vercengen.
			 * @type {Object}
			 */
			registry: (window.ve_registry) ? window.ve_registry :{
				/**
				 * Determines whether or not to run linters at runtime.
				 * @type {boolean}
				 */
				debug_mode: true,
				
				/**
				 * @type {{"<component_key>": ve.Component}}
				 */
				components: {},
				/**
				 * @type {{"<feature_key>": ve.Feature}}
				 */
				features: {},
				/**
				 * Defaults to '' for EN-GB
				 * @type {string}
				 */
				locale: "",
				/**
				 * Localisation strings used inside of Vercengen.
				 * @type {Object}
				 */
				localisation: {},
				/**
				 * Theme keys hold Telestyle CSS objects.
				 * @type {{"<theme_key>": Object}}
				 */
				themes: {},
				
				settings: {
					/**
					 * Whether names can be automatically imputed from the key name. False by default.
					 * @type {boolean}
					 */
					automatic_naming: false,
					
					//Component-wide settings
					
					/**
					 * Component settings for {@link ve.MultiTag}.
					 * @type {{"<registry_key>": string[]}}
					 */
					MultiTag: {
						global: []
					},
					
					/**
					 * Component settings for {@link ve.ScriptManager}.
					 */
					ScriptManager: {
						/**
						 * Either false if no automatic save file is declared, or the file path to save settings in.
						 * @type {boolean|string}
						 */
						save_file: "settings/ScriptManager_settings.json",
						/**
						 * Determines whether `._settings` are shared between instances of {@link ve.ScriptManager}.
						 * @type {boolean}
						 */
						share_settings_across_instances: true
					}
				}
			}
		};
	
	/**
	 * Returns all non-evaluated files in a folder, so long as an evaluated set is provided.
	 *
	 * @param {string} arg0_folder_path
	 * @param {Set<string>} arg1_evaluated_set
	 *
	 * @returns {Array<string>}
	 */
	ve.getFilesInFolder = function (arg0_folder_path, arg1_evaluated_set) {
		//Convert from parameters
		let folder_path = arg0_folder_path;
		let evaluated_set = arg1_evaluated_set;
		
		//Declare local instance variables
		let file_list = fs.readdirSync(folder_path, { withFileTypes: true });
		let return_files = [];
		
		//Iterate over all entries in file_list
		for (let local_file_entry of file_list) {
			let full_path = path.join(folder_path, local_file_entry.name);
			
			//Skip any full_path in the evaluated_set
			if (evaluated_set.has(full_path)) continue;
				evaluated_set.add(full_path);
				
			//Recursively import files from directories
			if (local_file_entry.isDirectory()) {
				return_files = return_files.concat(ve.getFilesInFolder(full_path, evaluated_set));
			} else {
				return_files.push(full_path);
			}
		}
		
		//Return statement
		return return_files;
	};
	
	/**
	 * Returns an Array<String> from a list of patterns. The last pattern
	 * to match a file determines its final position in the load order. This
	 * function iterates patterns in reverse to ensure that more specific
	 * patterns listed later correctly claim files from broader patterns
	 * listed earlier.
	 *
	 * @param {Array<string>} patterns The list of patterns to resolve.
	 * @returns {Array<string>} The final, ordered list of file paths.
	 */
	ve.getImportFiles = function (patterns) { //[WIP] - Refactor from AI
		const base = process.cwd();
		const finalFiles = [];
		const handledPaths = new Set(); // Tracks files that have already been placed.
		const excludedPaths = new Set(); // Tracks files explicitly excluded by `!`.
		
		// Process patterns in reverse order (from last to first).
		// This is the key to ensuring the "last match wins" rule.
		for (let i = patterns.length - 1; i >= 0; i--) {
			let pattern = patterns[i];
			const isExclusion = pattern.startsWith("!");
			if (isExclusion) {
				pattern = pattern.slice(1);
			}
			
			let files = [];
			if (pattern.includes("*")) {
				files = ve.getWildcardsInFolder(base, pattern);
			} else {
				const absolutePath = path.resolve(base, pattern);
				if (fs.existsSync(absolutePath)) {
					// Use your original, RECURSIVE function for directories.
					if (fs.statSync(absolutePath).isDirectory()) {
						files = ve.getFilesInFolder(absolutePath, new Set());
					} else {
						files = [absolutePath]; // It's a single file.
					}
				}
				// Silently ignore patterns that don't exist.
			}
			
			// Since we're iterating backwards, we prepend files to maintain order.
			// We also process the files found by a pattern in reverse to counteract
			// the unshift, keeping the original readdir order.
			for (let j = files.length - 1; j >= 0; j--) {
				const file = files[j];
				if (isExclusion) {
					excludedPaths.add(file);
				} else {
					// A file is only added if it hasn't been claimed by a later,
					// higher-priority pattern already.
					if (!handledPaths.has(file)) {
						finalFiles.unshift(file);
						handledPaths.add(file);
					}
				}
			}
		}
		
		// Final pass: filter out any files that were explicitly excluded.
		return finalFiles.filter(file => !excludedPaths.has(file));
	};
	
	/**
	 * Returns the absolute file paths of all wildcards within a given folder.
	 *
	 * @param {string} arg0_folder_path
	 * @param {string} arg1_wildcard_pattern
	 *
	 * @returns {Array<string>}
	 */
	ve.getWildcardsInFolder = function (arg0_folder_path, arg1_wildcard_pattern) {
		//Convert from parameters
		let folder_path = arg0_folder_path;
		let wildcard_pattern = arg1_wildcard_pattern;
		
		//Declare local instance variables
		let base = path.basename(wildcard_pattern);
		let directory = path.dirname(wildcard_pattern);
		
		//Non-wildcard resolution
		if (!base.includes("*")) {
			//No wildcard, simply return if the file exists
			let absolute_path = path.resolve(folder_path, wildcard_pattern);
			
			//Return statement
			if (fs.existsSync(absolute_path) && fs.statSync(absolute_path).isFile())
				return [absolute_path];
			if (fs.existsSync(absolute_path) && fs.statSync(absolute_path).isDirectory())
				return ve.getFilesInFolder(absolute_path, new Set());
			return [];
		}
		
		//Wildcard: match files in the directory
		let absolute_dir = path.resolve(folder_path, directory);
		
		//Return statement
		if (!fs.existsSync(absolute_dir) || !fs.statSync(absolute_dir).isDirectory())
			return [];
		
		//Return regex wildcard; return statement
		let regex = new RegExp("^" +
			base.replace(/\./g, "\\.")
				.replace(/\*/g, ".*") + "$"
		);
		
		//Return statement
		return fs.readdirSync(absolute_dir)
			.filter((f) => regex.test(f))
			.map((f) => path.join(absolute_dir, f))
			.filter((f) => fs.statSync(f).isFile());
	};
	
	/**
	 * Initialises Vercengen and associated UF files.
	 */
	ve.initialise = function () {
		//Initialise UF handlers
		new DALS.Timeline(); //Initialise starting timeline
		HTML.initialise();
		
		ve.scene_el = document.createElement("div");
		ve.scene_el.id = "ve-scene";
		ve.scene_el.setAttribute("class", "ve scene");
		document.body.appendChild(ve.scene_el);
		
		ve.window_overlay_el = document.createElement("div");
		ve.window_overlay_el.id = "ve-overlay";
		ve.window_overlay_el.setAttribute("class", "ve overlay");
		document.body.appendChild(ve.window_overlay_el);
		setTimeout(() => {
			ve.Component.linter(); //Lint ve.Component library
			ve.Feature.linter(); //Lint ve.Feature library
		}, 100);
	};
	
	/**
	 * Initialises a Vercengen app, alongside necessary UF imports.
	 *
	 * arg0_options: {@link Object}
	 * - `.do_not_import_UF`: {@link boolean} - Whether to refuse UF imports unrelated to Vercengen startup functions.
	 * - `.load_files`: {@link Array}<{@link string}> - The sequence of files to load. `!` should be used as an exclusion prefix, whilst `*` functions as a wildcard pattern.
	 * - `.is_browser=true`: {@link boolean} - Whether the imports are for the Browser/Electron. Imports are assumed to be eval/Node.js otherwise.
	 * - `.is_node=false`: {@link boolean} - Whether the imports are for Node.js. Overridden by `.is_browser`. Inputs are assumed to be for eval if false.
	 * - `.special_function`: {@link function} - The function to execute upon startup and Vercengen initialisation.
	 *
	 * @returns Array<string>
	 */
	ve.start = function (arg0_options) { //[WIP] - Move Browser/Node/Eval selection to `.mode` optioning.
		//Convert from parameters
		let options = (arg0_options) ? arg0_options : {};
		
		//Initialise options
		if (options.is_browser === undefined) options.is_browser = true;
		if (options.load_files === undefined) options.load_files = [];
		
		//Declare local instance variables
		let load_patterns = (!options.do_not_import_UF) ? [
			"!UF/archives",
			"UF",
			
			//Blockly/Maptalks
			"UF/libraries",
			"UF/libraries/blockly.js",
			"UF/libraries/bi_blockly/",
			"!UF/libraries/js2blocks.mjs",
			"UF/libraries/maptalks.min.js",
			"UF/libraries/mapbox-gl.js",
			"UF/libraries/mapbox-gl.css",
			"UF/libraries/maptalks.mapboxgl.min.js",
			
			//Univer
			"UF/libraries/univer/react.production.min.js",
			"UF/libraries/univer/react-dom.production.min.js",
			"UF/libraries/univer/rxjs.umd.min.js",
			"UF/libraries/univer/univerjs.index.js",
			"UF/libraries/univer/univerjs.umd.index.js",
			"UF/libraries/univer/univer.en-US.js",
			
			//DALS, Vercengen Components
			"UF/js/dals/Timeline.js",
			"UF/js/dals/Timeline_state.js",
			"UF/js/vercengen/engine",
			"UF/js/vercengen/engine/Demo.js",
			"UF/js/vercengen/components",
			"UF/js/vercengen/components/ComponentFileExplorer/file_operations_ui.js",
			"UF/js/vercengen/features",
			
			//Localisation
			"UF/js/vercengen/vercengen_localisation.js"
		] : [];
			load_patterns = load_patterns.concat(options.load_files);
		
		let load_files = ve.getImportFiles(load_patterns);
		
		console.log(`[VERCENGEN] Importing ${load_files.length} files.`);
		
		//1. Handle browser <link>/<script> tags
		if (options.is_browser) { //[WIP] - Refactor at a later date
			// Build up the full HTML snippet for all files in order
			let html_concat = "";
			
			for (let i = 0; i < load_files.length; i++) {
				const local_file_path = load_files[i];
				const local_file_extension = path.extname(local_file_path).toLowerCase();
				
				// Each file becomes HTML markup in correct order
				if (local_file_extension === ".css") {
					html_concat += `<link rel="stylesheet" type="text/css" href="${local_file_path}">`;
				} else if (local_file_extension === ".js") {
					// close the script tag safely
					html_concat += `<script type="text/javascript" src="${local_file_path}"></` + `script>`;
				}
			}
			
			// Inject all tags via HTML concatenation
			//
			// document.write() integrates the tags into the parsing process.
			// This ensures that <script> blocks execute *in exact given order*,
			// per HTML parser rules.
			//
			// This must run during document loading (not after DOM is complete).
			injectConcatenatedHTML(html_concat);
		}
		
		//2. Handle eval/Node.js require tags
		if (!options.is_browser) {
			for (let i = 0; i < load_files.length; i++) {
				let local_file_extension = path.extname(load_files[i]);
				let local_file_path = load_files[i];
				
				if (local_file_extension === ".js")
					if (options.is_node) {
						const local_library = require(local_file_path);
						
						//Destructure Node.js objects into global
						for (let [key, value] of Object.entries(local_library)) {
							if (global[key]) {
								console.error(`${key} is already a defined function namespace; ${local_file_path} is attempting an override. The present function is as follows:`, global[key]);
								continue;
							}
							global[key] = value;
						}
					} else {
						eval(fs.readFileSync(local_file_path, "utf8"));
					}
			}
		}
		
		//Initialise ve after import
		global.initialise_ve_loop = setInterval(function(){
			try {
				ve.initialise();
				clearInterval(global.initialise_ve_loop);
				
				if (options.special_function)
					options.special_function();
			} catch (e) {}
		}, 100);
		
		//Return statement
		return load_files;
	};
}

//[WIP] - Refactor later
function injectConcatenatedHTML(htmlMarkup) {
	const tempContainer = document.createElement("div");
	tempContainer.innerHTML = htmlMarkup;
	
	const head = document.head || document.getElementsByTagName("head")[0];
	const body = document.body || document.getElementsByTagName("body")[0];
	
	const fragment = document.createDocumentFragment();
	
	[...tempContainer.children].forEach((el) => {
		if (el.tagName === "SCRIPT") {
			const script = document.createElement("script");
			script.src = el.getAttribute("src");
			script.type = el.type || "text/javascript";
			script.async = false; // preserves order!
			fragment.appendChild(script);
		} else if (el.tagName === "LINK") {
			fragment.appendChild(el);
		}
	});
	
	body.appendChild(fragment);
}