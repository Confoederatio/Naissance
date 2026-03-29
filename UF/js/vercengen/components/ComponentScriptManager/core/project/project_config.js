//Initialise functions
{
	ve.ScriptManager._drawFileExplorer = function (arg0_value, arg1_component_obj) {
		//Convert from parameters
		let value = arg0_value;
		let component_obj = arg1_component_obj;
		
		//Detect file paths via data-path attribute and check against folder data to draw icons/classes
		let all_hierarchy_datatypes = component_obj.element.querySelectorAll(`[component="ve-hierarchy-datatype"][data-path]`);
		
		for (let i = 0; i < all_hierarchy_datatypes.length; i++) {
			let local_instance_el = all_hierarchy_datatypes[i].instance.element;
			let local_path = local_instance_el.getAttribute("data-path");
			
			if (this.config?.files[local_path]) {
				let local_config_obj = this.config.files[local_path];
				
				//Set data attributes
				all_hierarchy_datatypes[i].setAttribute("data-mode", (local_config_obj.mode) ? local_config_obj.mode : "default");
			}
		}
	};
	
	ve.ScriptManager._loadConfig = function (arg0_vesm_folder) {
    //Convert from parameters
    let vesm_folder = (arg0_vesm_folder) ? arg0_vesm_folder : process.cwd();

    //Try to load the local .ve-sm to determine the actual project path
		if (fs.existsSync(".ve-sm")) try {
			this.config = JSON.parse(fs.readFileSync(path.join(vesm_folder, ".ve-sm"), "utf8"));
    } catch (e) { console.error(e); }
		if (this.config.project_folder === "none" || !this.config.project_folder) return; //Internal guard clause if project folder is not set
		
		//Declare local instance variables
		let project_folder = this.config.project_folder;
		
		let project_config_path = path.join(project_folder, ".ve-sm");
		
		//Parse config
		if (project_folder && fs.existsSync(project_config_path))
			this.config = JSON.parse(fs.readFileSync(project_config_path, "utf8"));
		if (this.config) {
			ve.ScriptManager._drawFileExplorer.call(this, this.leftbar_file_explorer.v, this.leftbar_file_explorer);
			ve.ScriptManager._indexDocumentation.call(this, this.bottombar_status_el);
			
			//Attempt to load the starting file; bottombar if possible
			if (this.config._file_path)
				if (fs.existsSync(this.config._file_path))
					this.loadFile(this.config._file_path, undefined, true);
			if (this.config.ui_bottombar_value) {
				//Iterate over this.config.ui_bottombar_value to ensure that only extant files exist
				for (let i = this.config.ui_bottombar_value.length - 1; i >= 0; i--)
					if (!fs.existsSync(this.config.ui_bottombar_value[i]))
						this.config.ui_bottombar_value.splice(i, 1);
				this.bottombar_obj.v = this.config.ui_bottombar_value;
			}

      //Attempt to load the starting folder if possible
      if (!this.options.do_not_cache_file_explorer && this.config._leftbar_file_explorer_path)
        if (fs.existsSync(this.config._leftbar_file_explorer_path))
          this.leftbar_file_explorer.v = this.config._leftbar_file_explorer_path;
		}
	};
	
	ve.ScriptManager._saveConfig = function () {
		if (!this.config.project_folder) return; //Internal guard clause if project folder is undefined
		if (this.config.project_folder === "none") return; //Internal guard clause if project folder is not set

		//Initialise config
		if (this._file_path)
			this.config._file_path = this._file_path;
		
		//Declare local instance variables
		let project_folder = this.config.project_folder;
		let project_config_path = path.join(project_folder, ".ve-sm");
		
		//Save this.config to base project folder if possible
		fs.writeFileSync(project_config_path, JSON.stringify(this.config));
		ve.ScriptManager._indexDocumentation.call(this, this.bottombar_status_el);
	};
	
	ve.ScriptManager._setSourceAsMode = function (arg0_file_path, arg1_mode) {
		//Convert from parameters
		let file_path = arg0_file_path;
		let mode = (arg1_mode) ? arg1_mode : "default";
		
		//Declare local instance variables
		if (!this.config.files[file_path]) this.config.files[file_path] = {};
		let local_file_config = this.config.files[file_path];
			if (mode !== "default") {
				local_file_config.mode = mode;
			} else {
				delete local_file_config.mode;
			}
		
		//Call update functions
		ve.ScriptManager._drawFileExplorer.call(this, this.leftbar_file_explorer.v, this.leftbar_file_explorer);
		ve.ScriptManager._saveConfig.call(this);
	};
}