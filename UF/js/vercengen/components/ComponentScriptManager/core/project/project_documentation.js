//Initialise functions
{
	/**
	 * Index documentation in the currently selected folder for the project.
	 * - Method of: {@link ve.ScriptManager}
	 *
	 * @alias _indexDocumentation
	 * @memberof ve.Component.ve.ScriptManager
	 *
	 * @param {HTMLElement} arg0_element
	 * @param {Object} [arg1_options]
	 *  @param {number} [arg1_options.max_file_size=512000] - The maximum file size that documentation should be loaded for.
	 *
	 * @returns {Promise<void>}
	 * @private
	 */
	ve.ScriptManager._indexDocumentation = async function (arg0_element, arg1_options) {
		//Convert from parameters
		let element = (arg0_element) ? arg0_element : document.createElement("div");
		let options = (arg1_options) ? arg1_options : {};
		
		//Initialise options
		if (!options.excluded_paths) options.excluded_paths = [];
		if (!this._settings.index_documentation) return;
		if (this.config.files)
			Object.iterate(this.config.files, (local_key, local_value) => {
				if (local_value.mode === "excluded")
					options.excluded_paths.push(local_key);
			});
		options.max_file_size = Math.returnSafeNumber(options.max_file_size, 500*1024); //Maximum file size at 500KB
		
		//Declare local instance variables
		this._indexDocumentationCallID = Date.now();
		
		let compiler_options = {
			allowJs: true,
			allowNonTsExtensions: true,
			target: monaco.languages.typescript.ScriptTarget.ESNext,
			moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
			checkJs: true,
		};
		monaco.languages.typescript.javascriptDefaults.setCompilerOptions(compiler_options);
		monaco.languages.typescript.typescriptDefaults.setCompilerOptions(compiler_options);
		let current_call_id = this._indexDocumentationCallID;
		let current_folder = (this.config.project_folder !== "none") ?
			this.config.project_folder : this.leftbar_file_explorer.v;
		let shouldAbort = () => (current_call_id !== this._indexDocumentationCallID);
		
		//Clear cached documentation if applicable
		element.innerHTML = loc("ve.registry.localisation.ScriptManager_status_clearing_documentation");
		if (!this._documentation_files) {
			this._documentation_files = [];
		} else {
			//Iterate over all this._documentation_files
			for (let i = 0; i < this._documentation_files.length; i++)
				this._documentation_files[i].dispose();
			this._documentation_files = [];
		}
		
		//Iterate over all_files and check their extname for js/ts and document them
		element.innerHTML = loc("ve.registry.localisation.ScriptManager_status_indexing_files");
		let all_files = await File.getAllFiles(current_folder, {
			excluded_paths: options.excluded_paths
		});
		if (shouldAbort()) return;
		
		for (let i = 0; i < all_files.length; i++) try {
			if (all_files[i].endsWith(".js") || all_files[i].endsWith(".ts")) {
				let local_file_stats = fs.statSync(all_files[i]);
				
				if (local_file_stats.size <= options.max_file_size) {
					let local_data = fs.readFileSync(all_files[i], "utf8");
					
					//.js/.ts handling
					if (all_files[i].endsWith(".js") || all_files[i].endsWith(".ts"))
						this._documentation_files.push(monaco.languages.typescript.javascriptDefaults.addExtraLib(
							local_data,
							monaco.Uri.file(all_files[i]).toString()
						));
				}
			}
			
			//Waiting tick to update status
			if (i % 100 === 0 || i === all_files.length - 1) {
				element.innerHTML = loc("ve.registry.localisation.ScriptManager_status_indexed_progress", String.formatNumber(i), String.formatNumber(all_files.length));
				await new Promise((resolve) => setTimeout(resolve, 0));
				if (shouldAbort()) return;
			}
		} catch (e) {
			console.error(e);
		}
		element.innerHTML = loc("ve.registry.localisation.ScriptManager_status_parsed_documentation", String.formatNumber(all_files.length));
    let index_documentation_button_el = document.createElement("button");
      index_documentation_button_el.classList.add("refresh-button");
      index_documentation_button_el.innerHTML = loc("ve.registry.localisation.ScriptManager_refresh");
      
      index_documentation_button_el.addEventListener("click", () => 
        ve.ScriptManager._indexDocumentation.call(this, element, options));
    element.appendChild(index_documentation_button_el);
	};
}