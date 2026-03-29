/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 *
 * Visual block-based and code-based IDE used to assemble `.js` script files. ES6 compatible; non-compatible files will degrade to code editor only.
 *
 * **Note:** Declaring duplicate ve.ScriptManager components will reset the main Blockly workspace for each new instance.
 * - Functional binding: <span color=00ffff>veScriptManager</span>().
 * - This component has special default settings located in {@link ve.registry.settings.ScriptManager}.
 *
 * ##### Constructor:
 * - `arg0_value`: {@link string} - The code to load into the present ve.ScriptManager.
 * - `arg1_options`: {@link Object}
 *   - `.do_not_auto_detect_project=false`: {@link boolean} - Whether to attempt to read from the base `.ve-sm` file upon initialisation.
 *   - `.do_not_cache_file_explorer=false`: {@link boolean} - Whether the file directory should remain the same as when last opened.
 *   - `.do_not_display_file_name=false`: {@link boolean}
 *   - `.do_not_display_project_name=false`: {@link boolean}
 *   - `.folder_path=process.cwd()`: {@link string}
 *   - `.save_extension=[".*"]`: {@link Array}<{@link string}>
 * 	 - `.settings`: {@link Object}
 * 	   - `.autosave_projects=true`: {@link boolean}
 * 	   - `.display_load_errors=false`: {@link boolean}
 * 	   - `.monaco_theme="nord"`: {@link string}
 * 	   - `.index_documentation=true`: {@link boolean}
 * 	   - `.log_large_objects_in_console=false`: {@link boolean}
 * 	   - `.manual_synchronisation`: {@link true}
 * 	   - `.scene_height=0`: {@link number} - The scene height of the main workspace in px.
 * 	   - `.theme="theme-default"`: {@link string} - Either 'theme-default'/'theme-light'
 * 	   - `.view_file_explorer=true`: {@link boolean}
 *
 * ##### Instance:
 * - `.console_el`: {@link HTMLElement}
 *   - `.print`: {@link function}(arg0_message:{@link string}, arg1_type:{@link string}) - arg1_type is either 'message'/'error'.
 * - `._file_path`: {@link string} - The file path currently opened.
 * - `.leftbar_file_explorer`: {@link ve.FileExplorer}
 * - `.scene_blockly`: {@link ve.ScriptManagerBlockly}
 * - `.scene_monaco`: {@link ve.ScriptManagerMonaco}
 * - `.scene_interface`: {@link ve.FlexInterface}
 * - `.v`: {@link string}
 *
 * Private Fields:
 * - `._monaco_themes`: {@link Object}<{@link string}>
 * - `._settings`: {@link Object}
 *
 * ##### Methods:
 * - <span color=00ffff>{@link ve.ScriptManager.loadSettings|loadSettings}</span>(arg0_settings:{@link Object})
 * - <span color=00ffff>{@link ve.ScriptManager.saveSettings|saveSettings}</span>() | {@link string}
 * - <span color=00ffff>{@link ve.ScriptManager.setCodeEditorTheme|setCodeEditorTheme}</span>(arg0_theme_class:{@link string})
 * - <span color=00ffff>{@link ve.ScriptManager.setTheme|setTheme}</span>(arg0_theme_class:{@link string})
 * - <span color=00ffff>{@link ve.ScriptManager.throwLoadError|throwLoadError}</span>(arg0_error:{@link Error}|{@link string})
 *
 * @augments ve.Component
 * @memberof ve.Component
 * @type {ve.ScriptManager}
 */
ve.ScriptManager = class extends ve.Component {
	static excluded_from_demo = true;
	static instances = [];
	
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = arg0_value;
		let options = (arg1_options) ? arg1_options : {};
			super(options);
		
		//Initialise options
		options.attributes = (options.attributes) ? options.attributes : {};
		if (options.name === undefined) options.name = loc("ve.registry.localisation.ScriptManager_name_default");
		if (options.style === undefined) options.style = {};
		
		//Declare local instance variables
		this._monaco_themes = ve.ScriptManager._getMonacoThemes();
		this._selected_view = "monaco";
		this._settings = {
			is_vercengen_script_manager_settings: true,
			
			//Project
			project_folder: "none",
			
			//Settings
			autosave_projects: true,
			index_documentation: true,
			log_large_objects_in_console: false,
			manual_synchronisation: true,
			scene_height: 0,
			
			//View
			display_load_errors: false,
			monaco_theme: "nord",
			theme: "theme-default",
			view_file_explorer: true
		};
		this.config = {
			files: {}
		};
		this.id = Class.generateRandomID(ve.ScriptManager);
		this.options = options;
		
		//Load console channel for ScriptManager
		if (!log.scriptmanager) new log.Channel("scriptmanager", { colour: "powderblue" });
		
		let scriptmanager_settings = ve.registry.settings.ScriptManager;
		
		//Load settings from save file if available
		if (scriptmanager_settings.save_file !== false)
			if (fs.existsSync(scriptmanager_settings.save_file))
				this.loadSettings(JSON.parse(fs.readFileSync(scriptmanager_settings.save_file, "utf8")));
		if (scriptmanager_settings.share_settings_across_instances)
			if (ve.ScriptManager.instances.length > 0)
				this._settings = ve.ScriptManager.instances[0]._settings;
		if (this.options.settings)
			this._settings = {
				...this._settings,
				...this.options.settings
			};
		try { Blockly.mainWorkspace.clear(); } catch (e) {}
		
		this.element = document.createElement("div");
			this.element.setAttribute("component", "ve-script-manager");
			this.element.instance = this;
			this.element.style.padding = "0";
		if (this.options.attributes)
			Object.iterate(this.options.attributes, (local_key, local_value) => {
				this.element.setAttribute(local_key, local_value.toString());
			});
		
		this.container_el = document.createElement("div");
			this.container_el.id = "container";
		
		this.leftbar_el = document.createElement("div");
		this.leftbar_el.id = "leftbar";
		
		let file_components_obj = {
			context_menu: new ve.Button((v, e) => {
				let local_hierarchy_datatype = e.owners[e.owners.length - 2];
				
				let default_file_extension = "";
				let is_file = local_hierarchy_datatype.element.getAttribute("data-file");
				let local_file_path = local_hierarchy_datatype.element.getAttribute("data-path");
				let local_file_obj = (this.config.files[local_file_path]) ? 
					this.config.files[local_file_path] : {};
				
				if (is_file)
					default_file_extension = ve.ScriptManager._getFileExtension(path.extname(local_file_path));
				
				if (this.file_context_menu) this.file_context_menu.close();
				this.file_context_menu = new ve.ContextMenu({
					override_file_type: new ve.Select(ve.ScriptManager._getFileExtensions({ return_select_obj: true }), {
						name: loc("ve.registry.localisation.ScriptManager_mark_as_file_type"),
						limit: () => is_file,
						selected: (local_file_obj.type) ? local_file_obj.type : default_file_extension,
						
						onuserchange: (v) => ve.ScriptManager._setFileExtension.call(this, local_file_path, v)
					}),
					mark_source_as_excluded: new ve.Button(() => {
						ve.ScriptManager._setSourceAsMode.call(this, local_file_path, "excluded");
					}, {
						name: loc("ve.registry.localisation.ScriptManager_mark_excluded"),
						style: {
							textAlign: "left",
							whiteSpace: "nowrap"
						}
					}),
					mark_source_as_included: new ve.Button(() => {
						ve.ScriptManager._setSourceAsMode.call(this, local_file_path, "default");
					}, {
						name: loc("ve.registry.localisation.ScriptManager_mark_included"),
						style: {
							textAlign: "left",
							whiteSpace: "nowrap"
						}
					})
				}, {
					id: "ScriptManager_file_context_menu",
					width: "20rem"
				});
			}, {
				name: "<icon>more_vert</icon>",
				tooltip: loc("ve.registry.localisation.ScriptManager_tooltip_edit_properties"),
				style: {
					paddingBottom: `var(--cell-padding)`,
					paddingTop: `var(--cell-padding)`
				}
			})
		};
		this.leftbar_file_explorer = new ve.FileExplorer((this.options.folder_path) ? this.options.folder_path : process.cwd(), {
			actions_components_obj: {
				set_project_folder: new ve.Button(() => {
					let new_folder_path = path.resolve(this.leftbar_file_explorer.v);
					
					this.config.project_folder = new_folder_path;
					ve.ScriptManager._indexDocumentation.call(this, this.bottombar_status_el);
          ve.ScriptManager._saveConfig.call(this);
					veToast(loc("ve.registry.localisation.ScriptManager_toast_changed_project_folder", new_folder_path));
				}, { 
					name: "<icon>gite</icon>",
					tooltip: loc("ve.registry.localisation.ScriptManager_tooltip_set_project_folder"),
					limit: () => (path.resolve(this.leftbar_file_explorer.v) !== this.config.project_folder)
				})
			},
			file_components_obj: {
				...file_components_obj
			},
			folder_components_obj: { //[WIP] - Implement context menu to exclude/include folders
				...file_components_obj
			},
			load_function: (arg0_data, arg1_file_path) => {
				//Convert from parameters
				let local_data = arg0_data;
				let file_path = arg1_file_path;
				
				//Load file if possible
				this.loadFile(file_path, local_data);
			},
			save_extension: (this.options.save_extension) ? this.options.save_extension : [".*"],
			save_function: (arg0_save_name) => {
				this._file_path = arg0_save_name;
				this.bottombar_obj.addFile(this._file_path);
				
				//Return statement
				return this.scene_monaco.v;
			},
			
			onrefresh: (v, e) => ve.ScriptManager._drawFileExplorer.call(this, v, e),
      onuserchange: (v) => {
        this.config._leftbar_file_explorer_path = v;
        ve.ScriptManager._saveConfig.call(this);
      }
		});
		this.leftbar_file_explorer.bind(this.leftbar_el);
		this.scene_el = document.createElement("div");
			this.scene_el.id = "scene";
		this.scene_blockly = new ve.ScriptManagerBlockly(undefined, {
			script_manager: this,
			
			onload: (v, e) => {
				e.element.addEventListener("click", (e) => {
					if (this._selected_view && this._selected_view === "monaco")
						if (this._settings.manual_synchronisation && this._monaco_change)
							ve.ScriptManager._synchroniseViews.call(this, "monaco");
					this.scene_el.setAttribute("data-selected-view", "blockly");
					this._selected_view = "blockly";
				});
			},
			onuserchange: (v, e) => {
				this._blockly_change = true;
			}
		});
		this.scene_blockly_el = this.scene_blockly.element;
			this.scene_blockly_el.id = "scene-blockly";
		
		this.scene_monaco = new ve.ScriptManagerMonaco(undefined, {
			script_manager: this,
			theme: this._settings.monaco_theme,
			
			onload: (v, e) => {
				e.element.addEventListener("click", (e) => {
					if (this._selected_view && this._selected_view === "blockly")
						if (this._settings.manual_synchronisation && this._blockly_change)
							ve.ScriptManager._synchroniseViews.call(this, "blockly");
					this.scene_el.setAttribute("data-selected-view", "monaco");
					this._selected_view = "monaco";
				});
			},
			onuserchange: (v, e) => {
				this._monaco_change = true;
				if (this._settings.autosave_projects)
					ve.ScriptManager._autosave.call(this);
			}
		});
			this.scene_monaco_initialisation_loop = setInterval(() => {
				try {
					this.scene_monaco.editor.addAction({
						id: "open-project-find-and-replace",
						label: loc("ve.registry.localisation.ScriptManager_action_find_replace"),
						keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF],
						contextMenuGroupId: "1_modification",
						run: (ed) => {
							this._openFindAndReplace.call(this);
						}
					});
					
					clearInterval(this.scene_monaco_initialisation_loop);
					delete this.scene_monaco_initialisation_loop;
				} catch (e) {}
			}, 100);
		this.scene_monaco_el = this.scene_monaco.element;
			this.scene_monaco_el.id = "scene-monaco";
		
		this.scene_tabs_el = document.createElement("div");
		this.scene_tabs_el.id = "scene-tabs";
		
		//Initialise scene_interface now, but only append its components upon this.scriptmanager_initialisation_loop
		this.scene_interface = new ve.FlexInterface({ 
			type: "horizontal",
			blockly: this.scene_blockly,
			monaco: this.scene_monaco
		}, {
			name: "ScriptManagerInterface",
		});
		
		this.scene_el.append(this.scene_interface.element, this.scene_tabs_el);
		this.topbar_el = document.createElement("div");
		this.topbar_el.id = "topbar";
		
		this.topbar_interface = new ve.RawInterface({
			name_el: new ve.HTML(() => {
				return [
					//ScriptManager .name
					`<span id = "name">${this.name}</span>`,
					//Project Header
					`${(!options.do_not_display_project_name) ? `<div id = "project-name"><b>${(this.config.project_folder && this.config.project_folder !== "none") ? this.config.project_folder : loc("ve.registry.localisation.ScriptManager_no_project")}</b></div>` : ""}`,
					//File Header
					`${(!options.do_not_display_file_name) ? `- <span id = "file-name" data-is-saved="${this._is_file_saved}">${(this._file_path) ? this._file_path : loc("ve.registry.localisation.ScriptManager_none")}</span>` : ""}`
				].join("");
			},
			{ style: { marginRight: "1rem", overflow: "clip", width: "19rem" } }),
			settings: new ve.Button(() => {
				if (this.settings_window) this.settings_window.close();
				this.settings_window = new ve.Window({
					appearance: new ve.Interface({
						background: new ve.Text(this._settings.background_image, {
							name: loc("ve.registry.localisation.ScriptManager_background"),
							onuserchange: (v) => {
								if (v.isURL()) v = `url(${v})`;
								
								this._settings.background_image = v;
								this.loadSettings({ background_image: this._settings.background_image });
							},
							style: {
								'input[type="text"]': { maxWidth: "20rem" }
							}
						}),
						background_colour: new ve.Colour(this._settings.background_colour, {
							name: loc("ve.registry.localisation.ScriptManager_background_colour"),
							onuserchange: (v, e) => {
								this._settings.background_colour = e.getHex();
								this.loadSettings({ background_colour: this._settings.background_colour });
							}
						}),
						background_opacity: new ve.Range(Math.returnSafeNumber(this._settings.background_opacity, 0.5), {
							name: loc("ve.registry.localisation.ScriptManager_background_opacity"),
							onuserchange: (v) => {
								this._settings.background_opacity = v;
								this.loadSettings({ background_opacity: this._settings.background_opacity });
							}
						}),
						
						scene_height: new ve.Number(Math.returnSafeNumber(this._settings.scene_height, 0), {
							name: loc("ve.registry.localisation.ScriptManager_scene_height_px"),
							min: 0,
							onuserchange: (v) => {
								if (v === 0) {
									delete this.options.style.height;
								} else {
									this.options.style.height = `${v}px`;
								}
								this._settings.scene_height = v;
								this._drawHeight();
							}
						}),
					}, { name: loc("ve.registry.localisation.ScriptManager_appearance") }),
					monaco_settings: this.scene_monaco.drawOptionsInterface({
						name: loc("ve.registry.localisation.ScriptManager_editor_code")
					}),
					features: new ve.Interface({
						autosave_projects: new ve.Toggle(this._settings.autosave_projects, {
							name: loc("ve.registry.localisation.ScriptManager_autosave_projects"),
							onuserchange: (v) => this._settings.autosave_projects = v
						}),
						index_documentation: new ve.Toggle(this._settings.index_documentation, {
							name: loc("ve.registry.localisation.ScriptManager_index_documentation"),
							onuserchange: (v) => {
								this._settings.index_documentation = v;
								if (v) ve.ScriptManager._indexDocumentation.call(this, this.bottombar_status_el);
							}
						}),
						log_large_objects_in_console: new ve.Toggle(this._settings.log_large_objects_in_console, {
							name: loc("ve.registry.localisation.ScriptManager_log_large_objects_confirm"),
							onuserchange: (v) => this._settings.log_large_objects_in_console = v
						}),
						manual_synchronisation: new ve.Toggle(this._settings.manual_synchronisation, {
							name: loc("ve.registry.localisation.ScriptManager_manual_synchronisation"),
							onuserchange: (v) => this._settings.manual_synchronisation = v
						}),
					}, { name: loc("ve.registry.localisation.ScriptManager_features") }),
					
					actions_bar: new ve.RawInterface({
						load_settings: new ve.File(undefined, {
							name: loc("ve.registry.localisation.ScriptManager_load_settings"),
							do_not_display: true,
							onuserchange: (v) => {
								let display_error = false;
								try {
									let settings_obj = JSON.parse(fs.readFileSync(v[0], "utf8"));
									if (settings_obj && settings_obj.is_vercengen_script_manager_settings) {
										this.loadSettings(settings_obj);
									} else {
										display_error = true;
									}
								} catch (e) {
									display_error = true;
								}
								if (display_error)
									veWindow(`<span style = "align-items: center; display: flex"><icon>warning</icon> ${loc("ve.registry.localisation.ScriptManager_could_not_load_settings")}</span>`, {
										can_rename: false,
										name: loc("ve.registry.localisation.ScriptManager_error_loading_settings"),
										width: "20rem"
									});
							},
						}),
						save_settings: (ve.registry.settings.ScriptManager.save_file === false) ?
							new ve.File(undefined, {
								name: loc("ve.registry.localisation.ScriptManager_save_settings"),
								do_not_display: true,
								onuserchange: (v) => {
									console.log(v);
								},
								save_function: () => this.saveSettings()
							}) :
							new ve.Button(() => {
								let dirname = path.dirname(scriptmanager_settings.save_file);
								fs.mkdir(dirname, { recursive: true }, (err) => {
									if (err) {
										console.error(err);
										return;
									}
									fs.writeFileSync(scriptmanager_settings.save_file, this.saveSettings());
									veToast(loc("ve.registry.localisation.ScriptManager_saved_settings", scriptmanager_settings.save_file));
								});
							}, {
								name: loc("ve.registry.localisation.ScriptManager_save_settings")
							})
					}, { name: " ", style: { alignItems: "center", display: "flex" } })
				}, { can_rename: false, name: loc("ve.registry.localisation.ScriptManager_settings"), width: "24rem" })
			}, { name: loc("ve.registry.localisation.ScriptManager_settings") }),
			view: new ve.Button(() => {
				//Populate themes_obj
				let themes_obj = {};
				
				Object.iterate(this._monaco_themes, (local_key, local_value) => {
					themes_obj[local_key] = { name: local_value, selected: (this._settings.monaco_theme === local_key) }
				});
				
				let local_context_menu = new ve.ContextMenu({
					view_header: new ve.HTML(`<b>${loc("ve.registry.localisation.ScriptManager_view_settings")}</b><br><br>`, { x: 0, y: 0 }),
					
					monaco_theme: new ve.Select({
						...themes_obj
					}, {
						name: loc("ve.registry.localisation.ScriptManager_monaco_theme"),
						onchange: (v) => {
							this.loadSettings({ monaco_theme: v });
						},
						x: 0, y: 1
					}),
					editor_theme: new ve.Select({
						"theme-default": {
							name: loc("ve.registry.localisation.ScriptManager_theme_default"),
							selected: (!["theme-light"].includes(this._settings.theme))
						},
						"theme-light": {
							name: loc("ve.registry.localisation.ScriptManager_theme_light"),
							selected: (this._settings.theme === "theme-light")
						}
					}, {
						name: loc("ve.registry.localisation.ScriptManager_editor_theme"),
						onchange: (v) => {
							this.loadSettings({ theme: v });
						},
						style: {
							alignItems: "center",
							display: "flex"
						},
						x: 0, y: 2
					}),
					open_project_find_and_replace: new ve.Button(() => {
						this._openFindAndReplace.call(this);
					}, {
						name: loc("ve.registry.localisation.ScriptManager_open_find_replace")
					}),
					
					display_load_errors: new ve.Toggle(this._settings.display_load_errors, {
						name: loc("ve.registry.localisation.ScriptManager_display_load_errors"),
						onuserchange: (v) => this._settings.display_load_errors = v
					}),
					show_file_explorer: new ve.Toggle(this._settings.view_file_explorer, {
						name: loc("ve.registry.localisation.ScriptManager_view_file_explorer"),
						onuserchange: (v) => this.loadSettings({ view_file_explorer: v })
					})
				}, {
					id: "script_manager_view",
					width: "16rem"
				});
			}, { name: loc("ve.registry.localisation.ScriptManager_view"), x: 0, y: 2 }),
			run: new ve.Button(() => {
				let local_context_menu = new ve.ContextMenu({
					run_header: new ve.HTML(`<b>${loc("ve.registry.localisation.ScriptManager_view_settings")}</b><br>`, { x: 0, y: 0 }),
					
					warning: new ve.HTML(`<div style = "align-items: center; display: flex"><icon style = "width: auto;">info</icon><b style = "margin-left: calc(var(--padding)*0.5);">${loc("ve.registry.localisation.ScriptManager_note")}</b></div><span>${loc("ve.registry.localisation.ScriptManager_trust_warning")}</span><br><br>`),
					run_this_file_button: new ve.Button(() => {
						try {
							eval(this.v);
						} catch (e) {
							log.scriptmanager_error(e, "error");
						}
					}, { name: loc("ve.registry.localisation.ScriptManager_run_current_file") })
				}, { id: "script_manager_run" });
			}, { name: loc("ve.registry.localisation.ScriptManager_run") }),
			console: new ve.Button(() => {
				if (this.local_console) this.local_console.close();
				this.local_console = new ve.Window({
					log: new ve.Log("scriptmanager")
				}, {
					can_rename: false,
					do_not_wrap: true,
					name: loc("ve.registry.localisation.ScriptManager_console"),
					width: "40rem"
				});
			}, { name: loc("ve.registry.localisation.ScriptManager_console") })
		}, {
			no_name_element: true,
			is_folder: false
		});
		this.topbar_interface.bind(this.topbar_el);
		
		this.bottombar_el = document.createElement("div");
		this.bottombar_el.id = "bottombar";
		
		this.bottombar_status_el = document.createElement("div");
		this.bottombar_status_el.id = "bottombar-status";
		this.bottombar_el.appendChild(this.bottombar_status_el);
		
		this.bottombar_obj = new ve.ScriptManager.UI_Bottombar(undefined, {
			script_manager: this
		});
		this.bottombar_el.appendChild(this.bottombar_obj.element);
		
		//Layer 1. Append topbar
		this.element.appendChild(this.topbar_el);
		//Layer 2. Append leftbar and scene
		this.container_el.append(this.leftbar_el, this.scene_el);
		this.element.appendChild(this.container_el);
		//Layer 3. Append bottombar
		this.element.appendChild(this.bottombar_el);
		
		//Initialisation loop for ScriptManager to ensure all requisite elements are loaded first
		this.scriptmanager_initialisation_loop = setInterval(() => {
			this._drawHeight();
			clearInterval(this.scriptmanager_initialisation_loop);
		}, 100);
		
		this._is_file_saved = false;
		this.logic_loop = setInterval(() => {
			ve.ScriptManager._projectLogicLoop.call(this);
			if (!this.element.contains(this.scene_blockly.element))
				this.scene_interface.v = {
					type: "horizontal",
					blockly: this.scene_blockly,
					monaco: this.scene_monaco
				};
		}, 100);
		
		//Populate element and initialise handlers
		this.name = options.name;
		
		this.from_binding_fire_silently = true;
		this.v = value;
		delete this.from_binding_fire_silently;
		if (!this.options.do_not_auto_detect_project && 
			fs.existsSync(path.join(this.leftbar_file_explorer.v, ".ve-sm"))
		) {
			if (this.config.project_folder === "none") this.config.project_folder = this.leftbar_file_explorer.v;
			ve.ScriptManager._loadConfig.call(this, this.options.folder_path);
		}
		
		ve.ScriptManager.instances.push(this);
	}
	
	/**
	 * Returns the current output code in the present Component.
	 * - Accessor of: {@link ve.ScriptManager}
	 *
	 * @alias v
	 * @memberof ve.Component.ve.ScriptManager
	 * @type {string}
	 */
	get v () {
		//Return statement
		return this.scene_monaco.v;
	}
	
	/**
	 * Sets the current output code in the present Component.
	 * - Accessor of: {@link ve.ScriptManager}
	 *
	 * @alias v
	 * @memberof ve.Component.ve.ScriptManager
	 *
	 * @param {string} arg0_value
	 */
	set v (arg0_value) {
		//Convert from parameters
		let local_value = (arg0_value) ? arg0_value : "";
		
		//Declare local instance variables
		let set_value_loop = setInterval(() => {
			this.scene_blockly.show();
			
			if (this.scene_monaco?.editor) try {
				//Set new code value
				if (!this.scene_blockly._hidden) {
					this.scene_blockly.enable();
					this.scene_blockly.to_binding_fire_silently = true;
					js2blocks.parseCode(local_value);
					setTimeout(() => delete this.scene_blockly.to_binding_fire_silently);
				}
				this.scene_monaco.to_binding_fire_silently = true;
				this.scene_monaco.v = local_value;
				delete this.scene_monaco.to_binding_fire_silently;
				this.fireFromBinding();
				clearInterval(set_value_loop);
			} catch (e) {
				clearInterval(set_value_loop);
				
				//Log error to console if this._settings.display_load_errors is true
				if (this._settings.display_load_errors)
					log.scriptmanager(loc("ve.registry.localisation.ScriptManager_error_parsing_es6", e.toString()), "error");
				
				//Hide Blockly workspace, then clear it
				this.scene_blockly.hide();
				this.scene_blockly.enable();
				js2blocks.parseCode("");
				this.scene_blockly.disable();
				
				//Load the file to the text editor instead (graceful degradation)
				this.scene_blockly.disable();
				this.scene_monaco.to_binding_fire_silently = true;
				this.scene_monaco.v = local_value;
				delete this.scene_monaco.to_binding_fire_silently;
				this.fireFromBinding();
			}
		});
	}
	
	_drawHeight () {
		//Declare local instance variables
		let svg_el = this.scene_blockly_el.querySelector("svg");
		let svg_rect = svg_el.getBoundingClientRect();
		
		//Set new height
		if (!this.options?.style?.height) {
			this.scene_interface.element.style.height = `${svg_rect.height}px`;
			this.leftbar_file_explorer.element.style.height = `${svg_rect.height}px`;
		} else {
			setTimeout(() => {
				this.scene_blockly.max_height = this.options.style.height;
				svg_el.style.maxHeight = this.options.style.height;
			}, 100)
			this.scene_interface.element.style.height = this.options.style.height;
			this.leftbar_file_explorer.element.style.height = this.options.style.height;
		}
	}
	
	loadFile (arg0_file_path, arg1_file_data, arg2_do_not_add_to_bottombar) {
		//Convert from parameters
		let file_path = path.resolve(arg0_file_path);
		let file_data = arg1_file_data;
		let do_not_add_to_bottombar = arg2_do_not_add_to_bottombar;
		
		if (!fs.existsSync(file_path)) return; //Internal guard clause if file path doesn't exist
		
		//Declare local instance variables
		try {
			let actual_file_data = (file_data) ? file_data : fs.readFileSync(file_path, "utf8");
			
			this._file_path = file_path;
			this.v = actual_file_data;
			
			//Load proper syntax highlighting; bottombar
			ve.ScriptManager._loadFileExtension.call(this, path.extname(this._file_path));
			if (!do_not_add_to_bottombar)
				this.bottombar_obj.addFile(this._file_path);
			this.fireToBinding();
		} catch (e) {}
	}
	
	/**
	 * Loads a new settings object and refreshes the present Component to display them, then sets {@link this._settings}.
	 * - Method of: {@link ve.ScriptManager}
	 *
	 * @alias loadSettings
	 * @memberof ve.Component.ve.ScriptManager
	 *
	 * @param {Object} [arg0_settings]
	 *  @param {string} [arg0_settings.project_folder]
	 *  @param {string} [arg0_settings.monaco_theme] - One of the default Monaco themes or a custom JSON theme name.
	 *  @param {boolean} [arg0_settings.hide_blockly]
	 *  @param {number} [arg0_settings.scene_height]
	 *  @param {theme} [arg0_settings.theme] - Either 'theme-default'/'theme-light'
	 *  @param {boolean} [arg0_settings.view_file_explorer] - Whether to show the file explorer.
	 * @param {boolean} arg1_loaded
	 */
	loadSettings (arg0_settings, arg1_loaded) {
		//Convert from parameters
		let settings_obj = arg0_settings;
		let loaded = (arg1_loaded) ? arg1_loaded : [];
		
		if (loaded.includes(this.id)) return; //Internal guard clause if this instance has already been loaded this call
		
		//Declare local instance variables; parse settings
		let scriptmanager_settings = ve.registry.settings.ScriptManager;
		let settings_apply_loop = setInterval(() => {
			try {
				if (settings_obj.background_colour !== undefined)
					this.element.style.setProperty("--ve-sm-background-colour", settings_obj.background_colour);
				if (settings_obj.background_opacity !== undefined) {
					this.element.style.setProperty("--ve-sm-background-opacity", `${settings_obj.background_opacity*100}%`);
				} else {
					this.element.style.setProperty("--ve-sm-background-opacity", "50%");
				}
				if (settings_obj.background_image !== undefined)
					if (settings_obj.background_image.length !== 0) {
						this.element.setAttribute("data-background-image", settings_obj.background_image);
						this.element.style.setProperty("--ve-sm-background-image", settings_obj.background_image);
					} else {
						this.element.style.removeProperty("--ve-sm-background-image");
						this.element.removeAttribute("data-background-image");
					}
				if (settings_obj.project_folder)
					settings_obj.project_folder = (fs.existsSync(settings_obj.project_folder) && fs.statSync(settings_obj.project_folder).isDirectory()) ?
						settings_obj.project_folder : "none";
				if (settings_obj.monaco_theme)
					this.setCodeEditorTheme(settings_obj.monaco_theme);
				if (settings_obj.hide_blockly !== undefined) {
					if (settings_obj.hide_blockly === true) {
						//this.scene_interface.v = {
						//	type: "horizontal",
						//	monaco: this.scene_monaco
						//};
						//this.scene_blockly.hide();
					} else {
						this.scene_interface.v = {
							type: "horizontal",
							blockly: this.scene_blockly,
							monaco: this.scene_monaco
						};
						this.scene_blockly.show();
					}
				}
				if (settings_obj.scene_height) {
					if (!this.options.style) this.options.style = {};
					this.options.style.height = `${settings_obj.scene_height}px`;
					this._drawHeight();
				}
				if (settings_obj.theme)
					this.setTheme(settings_obj.theme);
				if (settings_obj.view_file_explorer !== undefined)
					this.leftbar_el.style.display = (settings_obj.view_file_explorer) ? "block" : "none";
				
				//Monaco Settings
				if (settings_obj.monaco)
					this.scene_monaco.setOptions(settings_obj.monaco);
				
				clearInterval(settings_apply_loop);
			} catch (e) {}
		}, 100);
		
		//Set this._settings
		this._settings = {
			...this._settings,
			...settings_obj
		};
		loaded.push(this.id);
		
		//Apply this._settings to all other instances if shared
		if (scriptmanager_settings.share_settings_across_instances)
			for (let i = 0; i < ve.ScriptManager.instances.length; i++)
				if (ve.ScriptManager.instances[i].id !== this.id)
					ve.ScriptManager.instances[i].loadSettings(this._settings, loaded);
	}
	
	/**
	 * Returns the present {@link this._settings} as a string.
	 * - Method of: {@link ve.ScriptManager}
	 *
	 * @alias saveSettings
	 * @memberof ve.Component.ve.ScriptManager
	 *
	 * @returns {string}
	 */
	saveSettings () {
		//Return statement
		return JSON.stringify(this._settings);
	}
	
	/**
	 * Sets the present code editor theme.
	 * - Method of: {@link ve.ScriptManager}
	 *
	 * @alias setCodeEditorTheme
	 * @memberof ve.Component.ve.ScriptManager
	 *
	 * @param {string} arg0_theme_class
	 */
	setCodeEditorTheme (arg0_theme_class) {
		//Convert from parameters
		let theme_class = arg0_theme_class;
		
		//Declare local instance variables
		this._settings.monaco_theme = theme_class;
		this.scene_monaco.setTheme(theme_class);
	}
	
	/**
	 * Sets the theme of the overall editor.
	 * - Method of: {@link ve.ScriptManager}
	 *
	 * @alias setTheme
	 * @memberof ve.Component.ve.ScriptManager
	 *
	 * @param {string} arg0_theme_class - Either 'theme-default'/'theme-light'
	 */
	setTheme (arg0_theme_class) {
		//Convert from parameters
		let theme_class = arg0_theme_class;
		
		//Remove previous themes
		if (this._settings.theme) {
			let all_classes = this.element.getAttribute("class");
			
			if (all_classes) {
				all_classes = all_classes.split(" ");
				
				//Iterate over all_classes and remove all previous themes
				for (let i = all_classes.length - 1; i >= 0; i--)
					if (all_classes[i].startsWith("theme-"))
						all_classes.splice(i, 1);
				this.element.setAttribute("class", all_classes.join(" "));
			}
		}
		this._settings.theme = theme_class;
		
		//Apply new theme
		this.element.classList.add(this._settings.theme);
		this.scene_blockly.setTheme(this._settings.theme);
	}
	
	/**
	 * Displays a load error window given an error, or a variable that resolves to a {@link string}.
	 * - Method of: {@link ve.ScriptManager}
	 *
	 * @alias throwLoadError
	 * @memberof ve.Component.ve.ScriptManager
	 *
	 * @param {Error|string} arg0_error
	 */
	throwLoadError (arg0_error) {
		//Convert from parameters
		let error = arg0_error;
		
		//Instantiate load message popup
		veWindow(`${loc("ve.registry.localisation.ScriptManager_error_compatibility", (this.options.compatibility_message) ? this.options.compatibility_message : "ES6")}<br><br><div style = "align-items: center; display: flex;"><icon>warning</icon>&nbsp;${error}</div><br><b>${loc("ve.registry.localisation.ScriptManager_stack_trace")}</b><br><div style = "margin-left: 1rem;">${error.stack}</div>`, {
			name: loc("ve.registry.localisation.ScriptManager_error_reading_file"),
			width: "24rem"
		});
	}
};

//Functional binding

/**
 * @returns {ve.ScriptManager}
 */
veScriptManager = function () {
	//Return statement
	return new ve.ScriptManager(...arguments);
};