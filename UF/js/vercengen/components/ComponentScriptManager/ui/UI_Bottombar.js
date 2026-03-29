/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 * 
 * Creates a bottombar UI with a bound `.element` that can easily be attached to a parent {@link ve.ScriptManager}.
 * 
 * ##### Constructor:
 * - `arg0_value`: {@link Array}<{@link string}> - The array of currently opened file paths.
 * - `arg1_options`: {@link Object}
 *   - `.script_manager`: {@link ve.ScriptManager}
 * 
 * ##### Instance:
 * - `.v`: {@link Array}<{@link string}>
 * 
 * @augments ve.Component
 * @memberof ve.Component.ve.ScriptManager
 * @type {ve.ScriptManager.UI_Bottombar}
 */
ve.ScriptManager.UI_Bottombar = class extends ve.Component {
  constructor (arg0_value, arg1_options) {
    //Convert from parameters
    let value = (arg0_value) ? arg0_value : [];
    let options = (arg1_options) ? arg1_options : {};
      super(options);
    
    //Initialise options
    if (!options.file_paths) options.file_paths = [];
    
    //Declare local instance variables
    this.element = document.createElement("div");
      this.element.id = "ui-bottombar";
      this.element.instance = this;
    this.options = options;
    this.value = options.file_paths;

    this.from_binding_fire_silently = true;
    this.v = value;
    delete this.from_binding_fire_silently;
  }

  /**
   * Fetches the current value of the component.
   * - Accessor of: {@link ve.ScriptManager.UI_Bottombar}
   * 
   * @alias v
	 * @memberof ve.ScriptManager.UI_Bottombar
	 *
	 * @type {string[]}
   */
  get v () {
    //Return statement
    return this.value;
  }

  /**
   * Sets the current value of the component.
   * - Accessor of: {@link ve.ScriptManager.UI_Bottombar}
   * 
   * @alias v
	 * @memberof ve.ScriptManager.UI_Bottombar
	 *
	 * @param {string} arg0_value
   */
  set v (arg0_value) {
    //Convert from parameters
    let value = (arg0_value) ? arg0_value : [];
    if (value.length === 0) { 
      this.element.innerHTML = "";
      return;
    }

    //Declare local instance variables
    let components_array = [];

    //Iterate over all value file_paths; create button per file
    for (let i = 0; i < value.length; i++) {
      value[i] = path.resolve(value[i]);
      
      let local_el = document.createElement("button");
        local_el.id = value[i];
        local_el.setAttribute("data-file-path", value[i]);
        local_el.innerHTML = path.basename(value[i]);
        
        //Load file upon click
        local_el.addEventListener("click", (e) => {
          if (this.options.script_manager)
            if (this.options.script_manager._file_path !== value[i])
              this.options.script_manager.loadFile(value[i]);
        });
      let local_html_obj = new ve.HTML(local_el, {
        attributes: {
          [`data-file-extension-${path.extname(value[i])}`]: true
        },
        tooltip: `${value[i]}`
      });
        local_html_obj._name = value[i];

      //Push local_html_obj to components_array
      components_array.push(local_html_obj);
    }

    this.list_obj = new ve.List(components_array, {
      do_not_allow_insertion: true,
      do_not_display_info_button: true,
      split_rows: false,
      style: {
        paddingTop: 0,
        
        "#component-body": { display: "flex" }
      },

      //Make sure that when a file is deleted from the bottombar, it updates the ScriptManager properly
      ondelete: (v) => {
        let local_el = v.element.querySelector("button[data-file-path]");

        if (local_el)
          //Wait 1 tick since the bottombar needs to be updated by .loadFile() first
          setTimeout(() => {
            let local_file_path = local_el.getAttribute("data-file-path");
            let local_index = this.v.indexOf(local_file_path);
            
            if (this.options.script_manager && this.options.script_manager._file_path === local_file_path)
              if (this.v[local_index - 1]) {
                this.options.script_manager.loadFile(this.v[local_index - 1]);
              } else if (this.v[local_index + 1]) {
                this.options.script_manager.loadFile(this.v[local_index + 1]);
              } else {
                this.options.script_manager.v = "";
              }
              
            //Update config if possible
            this.value.splice(local_index, 1);
            this.saveToConfig();
          });
      }
    });
    
    let file_extensions_obj = ve.ScriptManager._getFileExtensions({ return_select_obj: true });
    this.search_select_obj = new ve.SearchSelect({
      list_obj: this.list_obj
    }, {
      filter_names: (v) => {
        if (v.startsWith("data-file-extension-")) {
          let local_file_extension = ve.ScriptManager._getFileExtension(v.replace("data-file-extension-", ""));
          let local_file_extension_obj = file_extensions_obj[local_file_extension];
          
          //Return statement
          if (local_file_extension_obj?.name) {
            return local_file_extension_obj.name;
          } else {
            return local_file_extension;
          }
        } else {
          //Return statement
          return v;
        }
      },
      search_select_els: () => this.list_obj.element.querySelectorAll(`[component="ve-html"]`),
      search_keys: ["_name"],
      style: {
        alignItems: "flex-start",
        display: "flex",
        marginTop: "var(--padding)",
        
        '[component="ve-datalist"]': {
          width: "100%",
          
          'input[list]': { width: "calc(100% - var(--padding))" }
        }
      }
    });

    //Refresh this.element
    this.value = value;
    
    this.element.innerHTML = "";
    this.search_select_obj.bind(this.element);
    this.draw();
    
    //Set to ve.ScriptManager.config if possible
    this.saveToConfig();
    this.fireFromBinding();
  }
  
  /**
   * Adds a given file to the present bottombar.
   * - Method of: {@link ve.ScriptManager.UI_Bottombar}
   * 
   * @alias addFile
   * @memberof ve.Component.ve.ScriptManager.ve.ScriptManager.UI_Bottombar
   * 
   * @param {string} arg0_file_path
   */
  addFile (arg0_file_path) {
    //Convert from parameters
    let file_path = (arg0_file_path) ? path.resolve(arg0_file_path) : "";
    
    //Declare local instance variables
    if (this.value.length === 0) {
      this.v = [file_path];
    } else {
      let actual_value = [];
      
      //Iterate over this.list_obj.v; make sure file path is unique
      for (let i = 0; i < this.list_obj.v.length; i++) {
        let local_el = this.list_obj.v[i].element.querySelector("button[data-file-path]");
        
        actual_value.push(local_el.getAttribute("data-file-path"));
      }
      if (!actual_value.includes(file_path))
        actual_value.push(file_path);
      
      this.v = actual_value;
    }
  }
  
  /**
   * Draws the current bottombar component as it is.
   * - Method of: {@link ve.ScriptManager.UI_Bottombar}
   * 
   * @alias draw
   * @memberof ve.Component.ve.ScriptManager.ve.ScriptManager.UI_Bottombar
   */
  draw () {
    //Iterate over all elements in list_obj.v
    for (let i = 0; i < this.list_obj.v.length; i++) {
      let local_el = this.list_obj.v[i].element.querySelector("button[data-file-path]");
      
      if (local_el.getAttribute("data-file-path") === this.options.script_manager._file_path) {
        local_el.setAttribute("data-is-selected", "true");
      } else {
        local_el.removeAttribute("data-is-selected");
      }
    }
  }

  /**
   * Saves the current bottombar to the {@link ve.ScriptManager} `.config` variable.
   * - Method of: {@link ve.ScriptManager.UI_Bottombar}
   * 
   * @alias saveToConfig
	 * @memberof ve.Component.ve.ScriptManager.ve.ScriptManager.UI_Bottombar
   */
  saveToConfig () {
    //Set to ve.ScriptManager.config if possible
    if (this.options.script_manager) {
      let script_manager_obj = this.options.script_manager;
      
      script_manager_obj.config.ui_bottombar_value = this.value;
      if (script_manager_obj._settings.autosave_projects)
        ve.ScriptManager._saveConfig.call(script_manager_obj);
    }
  }
};