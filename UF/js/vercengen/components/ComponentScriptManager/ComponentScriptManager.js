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
 *   - `.do_not_display_file_name=false`: {@link boolean}
 *   - `.folder_path=__dirname`: {@link string}
 *   - `.save_extension=[".*"]`: {@link Array}<{@link string}>
 * 	 - `.settings`: {@link Object}
 * 	   - `.clear_blockly_workspace_on_error=true`: {@link boolean}
 * 	   - `.codemirror_theme="nord"`: {@link string}
 * 	   - `.display_load_errors=false`: {@link boolean}
 * 	   - `.hide_blockly_workspace_on_error`: {@link boolean}
 * 	   - `.keybinds="sublime"`: {@link string} - Either 'emacs'/'sublime'/'vim'
 * 	   - `.theme="theme-default"`: {@link string} - Either 'theme-default'/'theme-light'
 * 	   - `.view_file_explorer=true`: {@link boolean}
 * 	   
 * ##### Instance:
 * - `.console_el`: {@link HTMLElement}
 *   - `.print`: {@link function}(arg0_message:{@link string}, arg1_type:{@link string}) - arg1_type is either 'message'/'error'.
 * - `.leftbar_file_explorer`: {@link ve.FileExplorer}
 * - `.scene_blockly`: {@link ve.ScriptManagerBlockly}
 * - `.scene_codemirror`: {@link ve.ScriptManagerCodemirror}
 * - `.v`: {@link string}
 * 
 * Private Fields:
 * - `._codemirror_themes`: {@link Object}<{@link string}>
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
 * @augments {@link ve.Component}
 * @class
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
		if (options.name === undefined) options.name = "ScriptManager";
		
		//Declare local instance variables
		this._codemirror_themes = {
			"3024-day": "3024-day",
			"3024-night": "3024-night",
			"abbott": "Abbott",
			"abcdef": "abcdef",
			"ambiance-mobile": "Ambiance Mobile",
			"ambiance": "Ambiance",
			"ayu-dark": "Ayu Dark",
			"ayu-mirage": "Ayu Mirage",
			"base16-dark": "base16-dark",
			"base16-light": "base16-light",
			"bespin": "Bespin",
			"blackboard": "Blackboard",
			"cobalt": "Cobalt",
			"colorforth": "Colourforth",
			"darcula": "Darcula",
			"default": "Default",
			"dracula": "Dracula",
			"duotone-dark": "Duotone Dark",
			"duotone-light": "Duotone Light",
			"eclipse": "Eclipse",
			"elegant": "Elegant",
			"erlang-dark": "Erlang-dark",
			"gruvbox-dark": "Gruvbox-dark",
			"hopscotch": "Hopscotch",
			"icecoder": "Icecoder",
			"idea": "Idea",
			"isotope": "Isotope",
			"juejin": "Juejin",
			"lesser-dark": "Lesser-dark",
			"liquibyte": "Liquibyte",
			"lucario": "Lucario",
			"material-darker": "Material Darker",
			"material-ocean": "Material Ocean",
			"material-palenight": "Material Palenight",
			"material": "Material",
			"mbo": "mbo",
			"mdn-like": "mdn-like",
			"midnight": "Midnight",
			"monokai": "Monokai",
			"moxer": "Moxer",
			"neat": "Neat",
			"neo": "Neo",
			"night": "Night",
			"nord": "Nord",
			"oceanic-next": "Oceanic Next",
			"panda-syntax": "Panda Syntax",
			"paraiso-dark": "Paraiso Dark",
			"paraiso-light": "Paraiso Light",
			"pastel-on-dark": "Pastel on Dark",
			"railscasts": "Railscasts",
			"rubyblue": "Rubyblue",
			"seti": "SETI",
			"shadowfox": "Shadowfox",
			"solarized": "Solarised",
			"ssms": "SSMS",
			"the-matrix": "The Matrix",
			"tomorrow-night-bright": "Tomorrow Night Bright",
			"tomorrow-night-eighties": "Tomorrow Night 80s",
			"ttcn": "TTCN",
			"twilight": "Twilight",
			"vibrant-ink": "Vibrant Ink",
			"xq-dark": "XQ Dark",
			"xq-light": "XQ Light",
			"yeti": "Yeti",
			"yonce": "Yonce",
			"zenburn": "Zenburn"
		};
		this.id = Class.generateRandomID(ve.ScriptManager);
		this.options = options;
		this._settings = {
			is_vercengen_script_manager_settings: true,
			
			clear_blockly_workspace_on_error: true,
			codemirror_theme: "nord",
			display_load_errors: false,
			hide_blockly_workspace_on_error: false,
			keybinds: "sublime",
			theme: "theme-default",
			view_file_explorer: true
		};
		
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
		
		this.console_el = document.createElement("div");
			this.console_el.print = (arg0_message, arg1_type) => {
				//Convert from parameters
				let message = (arg0_message) ? arg0_message : "";
				let type = (arg1_type) ? arg1_type : "message";
				
				//Declare local instance variables
				let local_msg_el = document.createElement("div");
					local_msg_el.classList.add(type);
					local_msg_el.innerText = message;
					this.console_el.appendChild(local_msg_el);
 			};
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
			this.container_el.style.display = "flex";
			this.container_el.style.flexDirection = "row";
			
			this.leftbar_el = document.createElement("div");
			this.leftbar_el.id = "leftbar";
				this.leftbar_file_explorer = new ve.FileExplorer((this.options.folder_path) ? this.options.folder_path : __dirname, {
					load_function: (arg0_data, arg1_file_path) => {
						let local_data = arg0_data;
						let file_path = arg1_file_path;
						
						this._file_path = file_path;
						try {
							this.v = local_data;
							this.fireToBinding();
						} catch (e) {}
					},
					save_extension: (this.options.save_extension) ? this.options.save_extension : [".*"],
					save_function: () => {
						//Return statement
						return this.scene_codemirror.v;
					},
					style: { 
						overflow: "auto",
						paddingBottom: 0,
						paddingTop: 0,
						width: "20rem"
					}
				});
				this.leftbar_file_explorer.bind(this.leftbar_el);
			this.scene_el = document.createElement("div");
			this.scene_el.style.display = "flex";
			this.scene_el.style.flexDirection = "row";
			this.scene_el.style.width = "100%";
			this.scene_el.id = "scene";
				this.scene_blockly = new ve.ScriptManagerBlockly();
				this.scene_blockly_el = this.scene_blockly.element;
					this.scene_blockly_el.id = "scene-blockly";
					this.scene_blockly_el.style.display = "block";
				this.scene_codemirror = new ve.ScriptManagerCodemirror();
					this.scene_codemirror_el = this.scene_codemirror.element;
					this.scene_codemirror_el.id = "scene-codemirror";
				this.scene_tabs_el = document.createElement("div");
					this.scene_tabs_el.id = "scene-tabs";
				
				this.scene_el.append(this.scene_blockly_el, this.scene_codemirror_el, this.scene_tabs_el);
			this.topbar_el = document.createElement("div");
			this.topbar_el.id = "topbar";
		
			this.console_html = new ve.HTML(() => this.console_el, {
				attributes: { "class": "ve-script-manager-console" },
				x: 0, y: 0
			});
				this.topbar_interface = new ve.RawInterface({
					name_el: new ve.HTML(() => `<span id = "name">${this.name}</span>${(!options.do_not_display_file_name) ? `<span id = "file-name"> | ${(this._file_path) ? this._file_path : "None"}</span>` : ""}`,
						{ style: { marginRight: "1rem", overflow: "clip", width: "19rem" } }),
					/*file: new ve.Button(() => {
						
					}, { name: "File" }),*/
					settings: new ve.Button(() => {
						if (this.settings_window) this.settings_window.close();
						this.settings_window = new ve.Window({
							hide_blockly_workspace_on_error: new ve.Toggle(this._settings.hide_blockly_workspace_on_error, {
								name: "Hide/show Blockly workspace on error",
								onuserchange: (v) => this._settings.hide_blockly_workspace_on_error = v
							}),
							keybinds: new ve.Select({
								emacs: {
									name: "Emacs",
									selected: (this._settings.keybinds === "emacs")
								},
								sublime: {
									name: "Sublime Text",
									selected: (this._settings.keybinds === "sublime")
								},
								vim: {
									name: "Vim",
									selected: (this._settings.keybinds === "vim")
								}
							}, { 
								name: "Keybinds",
								onuserchange: (v) => {
									this.loadSettings({ keybinds: v });
								}
							}),
							actions_bar: new ve.RawInterface({
								load_settings: new ve.File(undefined, {
									name: "Load Settings",
									do_not_display: true,
									onuserchange: (v) => {
										//Declare local instance variables
										let display_error = false;
										
										//Try to load new settings
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
											veWindow(`<span style = "align-items: center; display: flex"><icon>warning</icon> Could not load non-ScriptManager settings.</span>`, { can_rename: false, name: "Error loading settings", width: "20rem" });
									},
								}),
								save_settings: (ve.registry.settings.ScriptManager.save_file === false) ?
									new ve.File(undefined, {
										name: "Save Settings",
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
											veToast(`Saved settings to ${scriptmanager_settings.save_file}!`);
										});
									}, {
										name: "Save Settings"
									})
							}, { name: " ", style: { alignItems: "center", display: "flex" } })
						}, { can_rename: false, name: "Settings", width: "24rem" })
					}, { name: "Settings" }),
					view: new ve.Button(() => {
						//Populate themes_obj
						let themes_obj = {};
						
						Object.iterate(this._codemirror_themes, (local_key, local_value) => {
							themes_obj[local_key] = { name: local_value, selected: (this._settings.codemirror_theme === local_key) }
						});
						
						let local_context_menu = new ve.ContextMenu({
							view_header: new ve.HTML(`<b>View Settings:</b><br><br>`, { x: 0, y: 0 }),
							
							editor_theme: new ve.Select({
								"theme-default": {
									name: "Default",
									selected: (!["theme-light"].includes(this._settings.theme))
								},
								"theme-light": {
									name: "Light",
									selected: (this._settings.theme === "theme-light")
								}
							}, {
								name: "Editor Theme",
								onchange: (v) => {
									this.loadSettings({ theme: v });
								},
								style: {
									alignItems: "center",
									display: "flex"
								},
								x: 0, y: 1
							}),
							codemirror_theme: new ve.Select({
								...themes_obj
							}, {
								name: "Codemirror Theme",
								onchange: (v) => {
									this.loadSettings({ codemirror_theme: v });
								},
								x: 0, y: 2
							}),
							
							hide_blockly: new ve.Button(() => {
								this.scene_blockly.hide();
							}, { name: "Hide Blockly", limit: () => !this.scene_blockly._hidden, x: 0, y: 3 }),
							show_blockly: new ve.Button(() => {
								this.scene_blockly.show();
								this.v = this.v;
							}, { name: "Show Blockly", limit: () => this.scene_blockly._hidden, x: 0, y: 3 }),
							
							clear_blockly_workspace_on_error: new ve.Toggle(this._settings.clear_blockly_workspace_on_error, {
								name: "Clear Blockly on error",
								onuserchange: (v) => this._settings.clear_blockly_workspace_on_error = v
							}, { x: 0, y: 4 }),
							display_load_errors: new ve.Toggle(this._settings.display_load_errors, {
								name: "Display load errors",
								onuserchange: (v) => this._settings.display_load_errors = v
							}),
							show_file_explorer: new ve.Toggle(this._settings.view_file_explorer, {
								name: "View File Explorer",
								onuserchange: (v) => this.loadSettings({ view_file_explorer: v })
							})
						}, {
							id: "script_manager_view"
						});
					}, { name: "View", x: 0, y: 2 }),
					run: new ve.Button(() => {
						let local_context_menu = new ve.ContextMenu({
							run_header: new ve.HTML(`<b>Run Settings:</b><br>`, { x: 0, y: 0 }),
							
							warning: new ve.HTML(`<div style = "align-items: center; display: flex"><icon style = "width: auto;">info</icon><b style = "margin-left: calc(var(--padding)*0.5);">Note:</b></div><span>Make sure you trust the code you are about to run before executing it.</span><br><br>`),
							run_this_file_button: new ve.Button(() => {
								try {
									eval(this.v);
								} catch (e) {
									this.console_el.print(e, "error");
								}
							}, { name: "Run Current File" })
						}, { id: "script_manager_run" });
					}, { name: "Run" }),
					console: new ve.Button(() => {
						if (this.local_console) this.local_console.close();
						this.local_console = new ve.Window({
							console_el: this.console_html,
							actions_bar: new ve.RawInterface({
								console_command: new ve.Text("", { 
									attributes: { placeholder: "Enter console command ..." }, 
									name: " ",
									style: { display: "inline" }
								}),
								send_command: new ve.Button(() => {
									//Declare local instance variables
									let command_value = this.local_console.actions_bar.console_command.v;
									
									if (command_value.length > 0) try {
										eval(command_value);
									} catch (e) {
										this.console_el.print(e, "error");
									}
								}, { name: "Send" }),
								information: new ve.Button(() => {
									this.console_el.print(`Help Menu:`);
									this.console_el.print(`- this.console_el.print(arg0_message:string, arg1_type:string) - Prints a message to the console.`);
									this.console_el.print(`- - arg1_type: 'error'/'info'`);
								}, {
									name: "Help",
									tooltip: `Prints help information.`
								}),
								clear_console: new ve.Button(() => {
									let local_confirm_modal = new ve.Confirm(`Are you sure you want to clear the current console?`, {
										special_function: () => this.console_el.innerHTML = ""
									});
								}, { name: "Clear Console" }),
							}, {
								style: {
									alignItems: "center",
									display: "flex"
								},
								name: " "
							})
						}, { can_rename: false, name: "Console", width: "40rem" });
					}, { name: "Console" })
				}, { 
					no_name_element: true,
					is_folder: false,
					style: {
						alignItems: "center",
						display: "flex",
						padding: 0,
						
						"[component='ve-button']": {
							marginRight: "calc(var(--cell-padding)*2)"
						}
					}
				});
				this.topbar_interface.bind(this.topbar_el);
			
			this.element.appendChild(this.topbar_el);
			this.container_el.append(this.leftbar_el, this.scene_el);
		this.element.appendChild(this.container_el);
		
		//Initialisation loop for ScriptManager to ensure all requisite elements are loaded first
		this.scriptmanager_initialisation_loop = setInterval(() => {
			if (!document.body.contains(this.scene_blockly_el.querySelector("svg"))) return;
			let svg_el = this.scene_blockly_el.querySelector("svg");
			let svg_rect = svg_el.getBoundingClientRect();
			
			this.scene_codemirror_el.style.height = `${svg_rect.height}px`;
			this.leftbar_file_explorer.element.style.height = `${svg_rect.height}px`;
			
			clearInterval(this.scriptmanager_initialisation_loop);
		}, 100);
		
		//Populate element and initialise handlers
		this.name = options.name;
		
		this.from_binding_fire_silently = true;
		this.v = value;
		delete this.from_binding_fire_silently;
		ve.ScriptManager.instances.push(this);
	}
	
	/**
	 * Returns the current output code in the present Component.
	 * - Accessor of: {@link ve.ScriptManager}
	 *
	 * @alias v
	 * @memberof ve.Component.ve.ScriptManager
	 * @type {string}
	 * 
	 * @returns {string}
	 */
	get v () {
		//Return statement
		return this.scene_codemirror.v;
	}
	
	/**
	 * Sets the current output code in the present Component.
	 * - Accessor of: {@link ve.ScriptManager}
	 *
	 * @alias v
	 * @memberof ve.Component.ve.ScriptManager
	 * @type {string}
	 *
	 * @param {string} arg0_value
	 */
	set v (arg0_value) {
		//Convert from parameters
		let local_value = (arg0_value) ? arg0_value : "";
		
		//Declare local instance variables
		let set_value_loop = setInterval(() => {
			if (this.scene_codemirror?.codemirror) try {
				//Set new code value
				if (!this.scene_blockly._hidden) {
					this.scene_blockly.enable();
					js2blocks.parseCode(local_value);
				}
				this.scene_codemirror.to_binding_fire_silently = true;
				this.scene_codemirror.v = local_value;
				delete this.scene_codemirror.to_binding_fire_silently;
				this.fireFromBinding();
				clearInterval(set_value_loop);
				
				if (this._settings.hide_blockly_workspace_on_error)
					this.scene_blockly.show();
			} catch (e) {
				clearInterval(set_value_loop);
				if (this._settings.display_load_errors)
					this.throwLoadError(e);
				if (this._settings.hide_blockly_workspace_on_error)
					this.scene_blockly.hide();
				
				if (this._settings.clear_blockly_workspace_on_error) {
					this.scene_blockly.enable();
					js2blocks.parseCode("");
					this.scene_blockly.disable();
				}
				
				//Load the file anyway
				this.scene_blockly.disable();
				this.scene_codemirror.to_binding_fire_silently = true;
				this.scene_codemirror.v = local_value;
				delete this.scene_codemirror.to_binding_fire_silently;
				this.fireFromBinding();
			}
		});
	}
	
	/**
	 * Loads a new settings object and refreshes the present Component to display them, then sets {@link this._settings}.
	 * - Method of: {@link ve.ScriptManager}
	 *
	 * @alias loadSettings
	 * @memberof ve.Component.ve.ScriptManager
	 * 
	 * @param {Object} [arg0_settings]
	 *  @param {string} [arg0_settings.codemirror_theme] - One of the default CodeMirror themes. [View CodeMirror theming list](https://codemirror.net/5/demo/theme.html)
	 *  @param {string} [arg0_settings.keybinds] - Either 'emacs'/'sublime'/'vim'
	 *  @param {theme} [arg0_settings.theme] - Either 'theme-default'/'theme-light'
	 *  @param {boolean} [arg0_settings.view_file_explorer] - Whether to show the file explorer.
	 */
	loadSettings (arg0_settings) {
		//Convert from parameters
		let settings_obj = arg0_settings;
		
		//Declare local instance variables; parse settings
		let scriptmanager_settings = ve.registry.settings.ScriptManager;
		let settings_apply_loop = setInterval(() => {
			try {
				if (settings_obj.codemirror_theme)
					this.setCodeEditorTheme(settings_obj.codemirror_theme);
				if (settings_obj.keybinds)
					this.scene_codemirror.codemirror.setOption("keyMap", settings_obj.keybinds);
				if (settings_obj.theme)
					this.setTheme(settings_obj.theme);
				if (settings_obj.view_file_explorer !== undefined)
					this.leftbar_file_explorer.element.style.display = (settings_obj.view_file_explorer) ? "block" : "none";
				clearInterval(settings_apply_loop);
			} catch (e) {}
		}, 100);
		
		//Set this._settings
		this._settings = {
			...this._settings,
			...settings_obj
		};
		
		//Apply this._settings to all other instances if shared
		if (scriptmanager_settings.share_settings_across_instances)
			for (let i = 0; i < ve.ScriptManager.instances.length; i++)
				if (ve.ScriptManager.instances[i].id !== this.id)
					ve.ScriptManager.instances[i].loadSettings(this._settings);
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
	 * Sets the present code editor theme to a default CodeMirror theme. [View CodeMirror theming list](https://codemirror.net/5/demo/theme.html)
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
		this._settings.codemirror_theme = theme_class;
		this.scene_codemirror.codemirror.setOption("theme", theme_class);
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
		veWindow(`Are you sure this file is ${(this.options.compatibility_message) ? this.options.compatibility_message : "ES6"} compatible? Blockly has been disabled, and the file is only editable via CodeMirror.<br><br><div style = "align-items: center; display: flex;"><icon>warning</icon>&nbsp;${error}</div><br><b>Stack Trace:</b><br><div style = "margin-left: 1rem;">${error.stack}</div>`, { name: `Error Reading File`, width: "24rem" });
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