global.UI_Settings = class extends ve.Class { //[WIP] - Add settings serialisation/deserialisation
	constructor () {
		super();
		
		//Declare local instance variables
		let navbar_el = document.querySelector(".ve.navbar");
		let settings_ui = {
			project: {
				name: "Project",
				components_obj: {
					autoload_file_container: veRawInterface({
						autoload_file_label: veHTML(`<b>Autoload File</b>`, { style: { display: "inline" } }),
						autoload_file: veFile((main.settings.autoload_file) ? main.settings.autoload_file : path.join(__dirname, "saves/autosave.naissance"), {
							name: "Change Save",
							tooltip: "Loads file whenever available.",
							
							onuserchange: (v) => {
								main.settings.autoload_file = v;
							}
						})
					}),
					sort_settings_alphabetically: veToggle(main.settings.sort_settings_alphabetically, {
						name: "Sort Settings Alphabetically",
						onuserchange: (v) => {
							main.settings.sort_settings_alphabetically = v;
						}
					})
				}
			},
			appearance: {
				name: "Appearance",
				components_obj: {
					appearance_ui: vePageMenu({
						editor_appearance: {
							name: "Editor Appearance"
						},
						map_appearance: {
							name: "Map Appearance"
						}
					})
				}
			},
			keymap: {
				name: "Keymap"
			}
		};
		
		//Open UI
		this.settings_ui = new ve.PageMenu(settings_ui);
		super.open("instance", {
			name: "Settings",
			can_rename: false,
			width: "30rem",
			y: ((navbar_el) ? navbar_el.offsetHeight : 0) + HTML.mouse_y + 8 
		});
	}
	
	/**
	 * Loads settings from `settings.json`.
	 */
	static loadSettings () {
		//Load settings from settings.json if it exists
		if (fs.existsSync("./settings.json")) try {
			main.settings = JSON.parse(fs.readFileSync("./settings.json", "utf8"));
		} catch (e) {
			veWindow(`Error loading <kbd>./settings.json</kbd>: ${e}<br><br>If you have modified ./settings.json manually, please ensure that your syntax is correct.`, {
				name: "Error Loading Settings"
			});
			return;
		}
		
		//main.settings.autoload_file handler
		if (main.settings.autoload_file)
			if (fs.existsSync(main.settings.autoload_file)) {
				let load_data = fs.readFileSync(main.settings.autoload_file, "utf8");
				
				//Load state
				DALS.Timeline.parseAction({
					options: { name: "Load Save", key: "load_save" },
					value: [{ type: "global", load_save: load_data }]
				});
			}
	}
	
	/**
	 * Saves the current `main.settings` {@link Object} to `settings.json`.
	 */
	static saveSettings () {
		
	}
}