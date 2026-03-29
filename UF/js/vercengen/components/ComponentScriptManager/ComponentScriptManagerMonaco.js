/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 *
 * Manages the Monaco Editor instance for {@link ve.ScriptManager}, the main IDE component for Vercengen.
 * - Functional binding: <span color=00ffff>veScriptManagerMonaco</span>().
 *
 * ##### Constructor:
 * - `arg0_value`: {@link string} - The code to load into the present component.
 * - `arg1_options`: {@link Object}
 *   - `.monaco_options`: {@link Object} - Any monaco options to use upon instantiation.
 *   - `.script_manager`: {@link ve.ScriptManager}
 *   - `.theme`: {@link string} - The initial theme to load.
 *
 * ##### Instance:
 * - `.editor`: {@link Object} - The raw Monaco editor instance.
 * - `.v`: {@link string}
 *
 * ##### Methods:
 * - <span color=00ffff>{@link ve.ScriptManagerMonaco.setOptions|setOptions}</span>(arg0_options:{@link Object})
 * - <span color=00ffff>{@link ve.ScriptManagerMonaco.setTheme|setTheme}</span>(arg0_theme_name:{@link string})
 *
 * @augments ve.Component
 * @memberof ve.Component
 * @type {ve.ScriptManagerMonaco}
 */
ve.ScriptManagerMonaco = class extends ve.Component {
	static excluded_from_demo = true;
	
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = arg0_value;
		let options = (arg1_options) ? arg1_options : {};
		super(options);
		
		//Initialise options
		options.attributes = (options.attributes) ? options.attributes : {};
		
		//Declare local instance variables
		this.element = document.createElement("div");
			this.element.instance = this;
			this.element.setAttribute("component", "ve-script-manager-monaco");
			HTML.setAttributesObject(this.element, options.attributes);
		
		let computed_style_obj = window.getComputedStyle(document.body);
		let default_font_family = computed_style_obj.getPropertyValue("--monospace-font-family").replace(/"/gm, "");
		this.options = options;
		this._default_options = {
			autoIndent: "advanced",
			automaticLayout: true,
			contextmenu: true,
			detectIndentation: false,
			fixedOverflowWidgets: true,
			fontFamily: default_font_family,
			fontLigatures: true,
			fontSize: 14,
			formatOnPaste: false,
			insertSpaces: true,
			minimap: { enabled: true },
			tabSize: 2,
			wordWrap: "bounded",
			wordWrapColumn: 120
		};
		this._pending_value = (value === null || value === undefined) ? "" : value.toString();
		this._theme = (options.theme) ? options.theme : "nord";
		
		//Load Monaco once DOM populates
		this.monaco_initialisation_loop = setInterval(() => {
			if (!document.body.contains(this.element)) return;
			if (!window.monaco_require) return; // Wait for loader
			
			window.monaco_require(["vs/editor/editor.main"], () => {
				//1. Create Editor
				this.editor = monaco.editor.create(this.element, {
					value: this._pending_value,
					language: "javascript",
					theme: "vs-dark", // Placeholder, we set the real theme immediately after
					
					...this._default_options,
					...this.options.monaco_options
				});
				
				//2. Load and Set the correct theme
				this.setTheme(this._theme);
				
				//3. Fix paste event for Electron
				this.editor.addAction({
					id: "electron-native-paste",
					label: loc("ve.registry.localisation.ScriptManagerMonaco_action_paste"),
					keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV],
					contextMenuGroupId: "9_cutcopypaste",
					run: (ed) => {
						try {
							const electron = window.node_require ? window.node_require("electron") : null;
							if (electron && electron.clipboard) {
								const text = electron.clipboard.readText();
								const selection = ed.getSelection();
								
								ed.executeEdits("native-paste", [{
									range: selection,
									text: text,
									forceMoveMarkers: true,
								}]);
								ed.pushUndoStop();
							}
						} catch (e) {
							console.error("ve.ScriptManagerMonaco: Paste Error", e);
						}
					},
				});
				
				// 4. Handle value changes and sync to Blockly
				this.editor.onDidChangeModelContent(() => {
					this._exportToBlockly();
					this.fireToBinding();
				});
				
				//Clear pending
				delete this._pending_value;
			});
			
			clearInterval(this.monaco_initialisation_loop);
		}, 100);
	}
	
	/**
	 * Returns the code value for the present Component.
	 * - Accessor of: {@link ve.ScriptManagerMonaco}
	 *
	 * @alias v
	 * @memberof ve.Component.ve.ScriptManagerMonaco
	 * @type {string}
	 */
	get v () {
		if (!this.editor) return (this._pending_value) ? this._pending_value : "";
		return this.editor.getValue();
	}
	
	/**
	 * Sets the code value for the present Component.
	 * - Accessor of: {@link ve.ScriptManagerMonaco}
	 *
	 * @alias v
	 * @memberof ve.Component.ve.ScriptManagerMonaco
	 *
	 * @param {string} arg0_value
	 */
	set v (arg0_value) {
		//Convert from parameters
		let value = (arg0_value === null || arg0_value === undefined) ? "" : String(arg0_value);
		
		this.do_not_fire_to_binding = true;
		if (!this.editor) {
			this._pending_value = value;
		} else {
			//Prevent cursor jumping if value is same
			if (this.editor.getValue() !== value) {
				this.editor.setValue(value);
			}
		}
		delete this.do_not_fire_to_binding;
		
		this.fireFromBinding();
	}
	
	/**
	 * Exports the current value to {@link ve.ScriptManagerBlockly}.
	 * - Method of: {@link ve.ScriptManagerMonaco}
	 * 
	 * @param {boolean} [arg0_force_export=false]
	 * @private
	 */
	_exportToBlockly (arg0_force_export) {
		//Convert from parameters
		let force_export = arg0_force_export;
		
		//Declare local instance variables
		let should_export = false;
			if (this.options.script_manager && !this.options.script_manager._settings.manual_synchronisation)
				should_export = true;
			if (force_export) should_export = true;
		
		//Only export if should_export is true
		if (should_export)
			try {
				if (!this.to_binding_fire_silently) {
					let manager_el = this.element.closest(`[component="ve-script-manager"]`);
					let blockly_el = (manager_el) ?
						manager_el.querySelector(`[component="ve-script-manager-blockly"]`) :
						undefined;
					
					if (blockly_el && blockly_el.instance) {
						let blockly_obj = blockly_el.instance;
						
						blockly_obj.to_binding_fire_silently = true;
						blockly_obj.v = this.editor.getValue();
					}
				}
			} catch (e) { console.warn(e); }
	}
	
	/**
	 * Sets an option for the current code interface and pushes it to the parent {@link ve.ScriptManager}.
	 * - Method of: {@link ve.ScriptManagerMonaco}
	 * 
	 * @param {string} arg0_option_key
	 * @param {any} arg1_value
	 * @private
	 */
	_setOption (arg0_option_key, arg1_value) {
		//Convert from parameters
		let option_key = arg0_option_key;
		let value = arg1_value;
		
		//Declare local instance variables
		let settings_obj = this.options?.script_manager?._settings;
		
		//Try to update the present option
		if (settings_obj) {
			if (!settings_obj.monaco) settings_obj.monaco = {};
			settings_obj.monaco[option_key] = value;
		}
		this.setOptions({ [option_key]: value });
	}
	
	/**
	 * Returns the current options interface with the ability to update the current symbol and export it to `this.options.script_manager._settings`.
	 * - Method of: {@link ve.ScriptManagerMonaco}
	 * 
	 * @param {Object} [arg0_options]
	 *  @param {boolean} [arg0_options.do_not_cache=false]
	 *  @param {string} [arg0_options.name="Code Editor"]
	 * 
	 * @returns {ve.Interface}
	 */
	drawOptionsInterface (arg0_options) {
		//Convert from parameters
		let options = (arg0_options) ? arg0_options : {};
		
		//Declare local instance variables
		let current_options = this.editor.getRawOptions();
		let getMonacoOption = (arg0_key) => current_options[arg0_key];
		let new_interface = new ve.Interface({
			appearance: new ve.Interface({
				font_family: new ve.Text(getMonacoOption("fontFamily"), {
					name: loc("ve.registry.localisation.ScriptManagerMonaco_font_family"),
					onuserchange: (v) => this._setOption("fontFamily", v)
				}),
				font_ligatures: new ve.Toggle(getMonacoOption("fontLigatures"), {
					name: loc("ve.registry.localisation.ScriptManagerMonaco_font_ligatures"),
					onuserchange: (v) => this._setOption("fontLigatures", v)
				}),
				font_size: new ve.Number(getMonacoOption("fontSize"), {
					name: loc("ve.registry.localisation.ScriptManagerMonaco_font_size"),
					onuserchange: (v) => this._setOption("fontSize", v)
				}),
				minimap: new ve.Toggle((getMonacoOption("minimap.enabled")) ? getMonacoOption("minimap.enabled") : true, {
					name: loc("ve.registry.localisation.ScriptManagerMonaco_show_minimap"),
					onuserchange: (v) => {
						this._setOption("minimap.enabled", v);
						this.setOptions({ minimap: { enabled: v } });
					}
				}),
				word_wrap: new ve.Toggle((getMonacoOption("wordWrap") === "bounded"), {
					name: loc("ve.registry.localisation.ScriptManagerMonaco_word_wrap"),
					onuserchange: (v) => this._setOption("wordWrap", (v) ? "bounded" : "off")
				}),
				word_wrap_column: new ve.Number(Math.returnSafeNumber(getMonacoOption("wordWrapColumn"), 120), {
					name: loc("ve.registry.localisation.ScriptManagerMonaco_word_wrap_column"),
					min: 1,
					onuserchange: (v) => this._setOption("wordWrapColumn", v)
				})
			}, { name: loc("ve.registry.localisation.ScriptManagerMonaco_appearance") }),
			indentation: new ve.Interface({
				insert_spaces: new ve.Toggle(getMonacoOption("insertSpaces"), {
					name: loc("ve.registry.localisation.ScriptManagerMonaco_insert_spaces"),
					onuserchange: (v) => this._setOption("insertSpaces", v)
				}),
				tab_size: new ve.Number(getMonacoOption("tabSize"), {
					name: loc("ve.registry.localisation.ScriptManagerMonaco_tab_size"),
					onuserchange: (v) => this._setOption("tabSize", v)
				})
			}, { name: loc("ve.registry.localisation.ScriptManagerMonaco_indentation") }),
			reset_monaco_settings: new ve.Button(() => {
				//Declare local instance variables
				let computed_style_obj = window.getComputedStyle(this.element);
				let settings_obj = this.options?.script_manager?._settings;
				
				//Update the present option if possible
				if (settings_obj)
					settings_obj.monaco = {};
				this._default_options.fontFamily = computed_style_obj.getPropertyValue("--monospace-font-family").replace(/"/gm, "");
				this.refresh();
				setTimeout(() => {
					let new_interface = this.drawOptionsInterface({
						...options,
						do_not_cache: true
					});
					
					//Swap out interface
					this.options_interface.element.innerHTML = "";
					this.options_interface.element.replaceWith(new_interface.element);
					this.options_interface.element = new_interface.element;
					this.options_interface.v = new_interface.components_obj;
				}, 100);
			}, { name: loc("ve.registry.localisation.ScriptManagerMonaco_button_reset") })
		}, {
			name: (options.name) ? options.name : loc("ve.registry.localisation.ScriptManagerMonaco_name_default")
		});
		if (!options.do_not_cache)
			this.options_interface = new_interface;
		
		//Return statement
		return new_interface;
	}
	
	/**
	 * Refreshes the current Monaco display. Used for resetting all cached options.
	 * - Method of: {@link ve.ScriptManagerMonaco}
	 */
	refresh () {
		//Declare local instance variables
		let computed_style_obj = window.getComputedStyle(this.element);
		let current_value = this.editor.getValue();
		let view_state = this.editor.saveViewState();
		
		//Dispose the current editor and refresh it
		this.editor.dispose();
		this.editor = monaco.editor.create(this.element, {
			value: current_value,
			language: "javascript",
			theme: "vs-dark", // Placeholder, we set the real theme immediately after
			
			...this._default_options,
			...this.options.monaco_options
		});
		
		//Apply current theme; restore view state
		if (this._theme)
			this.setTheme(this._theme);
		this.editor.restoreViewState(view_state);
	}
	
	/**
	 * Update behaviour/symbol options for Monaco.
	 * - Method of: {@link ve.ScriptManagerMonaco}
	 * 
	 * @param {Object} arg0_options
	 */
	setOptions (arg0_options) {
		//Convert from parameters
		let options = (arg0_options) ? arg0_options : {};
		
		//Initialise options bindings
		if (options["minimap.enabled"] !== undefined) {
			if (!options.minimap) options.minimap = {};
			options.minimap.enabled = options["minimap.enabled"];
		}
		
		//Set options for Monaco
		this.editor.updateOptions(options);
	}
	
	/**
	 * Dynamically loads and sets a Monaco theme from a remote repository.
	 * - Method of: {@link ve.ScriptManagerMonaco}
	 *
	 * @param {string} arg0_theme_name
	 */
	async setTheme (arg0_theme_name) {
		let theme_name = arg0_theme_name;
		this._theme = theme_name;
		
		//Guard clause: If Monaco isn't loaded yet, the init loop will handle setting this._theme
		if (!window.monaco || !monaco.editor) return;
		
		//If it's a standard internal theme (vs, vs-dark, hc-black), just set it
		if (["vs", "vs-dark", "hc-black"].includes(theme_name)) {
			monaco.editor.setTheme(theme_name);
			return;
		}
		
		try {
			let file_path = `${process.cwd()}/UF/js/vercengen/components/ComponentScriptManager/monaco/themes/${theme_name}.json`;
			
			if (fs.existsSync(file_path)) {
				let theme_data = JSON.parse(fs.readFileSync(file_path, "utf8"));
				
				monaco.editor.defineTheme(theme_name, theme_data);
				monaco.editor.setTheme(theme_name);
			} else {
				console.warn(`ve.ScriptManagerMonaco: Theme file not found: ${theme_name}`);
				//Fallback to vs-dark if custom theme fails
				monaco.editor.setTheme("vs-dark");
			}
		} catch (e) {
			console.error("ve.ScriptManagerMonaco: Theme load failed", theme_name, e);
		}
	}
};

//Functional binding

/**
 * @returns {ve.ScriptManagerMonaco}
 */
veScriptManagerMonaco = function () {
	//Return statement
	return new ve.ScriptManagerMonaco(...arguments);
};