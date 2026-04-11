global.UI_Leftbar = class extends ve.Class {
	constructor () {
		super();
		
		//Declare local instance variables
		let navbar_el = document.querySelector(".ve.navbar");
		
		this.page_menu = new ve.PageMenu({
			file_explorer: {
				name: "File",
				components_obj: {
					file_explorer: veFileExplorer(path.join(process.cwd(), "saves"), { 
						name: " ",
						navigation_only: true,
						
						load_function: (arg0_data) => {
							//Convert from parameters
							let data = (arg0_data) ? arg0_data : {};
							
							//Load state
							DALS.Timeline.parseAction({
								options: { name: "Load Save", key: "load_save" },
								value: [{ type: "global", load_save: data }]
							});
						},
						save_extension: ".naissance",
						save_function: DALS.Timeline.saveState
					})
				}
			},
			hierarchy: {
				name: "Hierarchy",
				components_obj: {
					topbar: veRawInterface({
						map_settings: veButton(() => {
							new UI_MapSettings();
						}, {
							name: `<icon>settings</icon><span style = "padding-left: 0.25rem; padding-right: 0.5rem;">Map Settings</span>`,
							style: { "#name": { alignItems: "center", display: "flex" } }
						}),
						script_manager: veButton(() => {
							if (this.script_manager_window) this.script_manager_window.close();
							this.script_manager_window = veWindow(veScriptManager(), {
								name: "ScriptManager",
								height: "80vh",
								width: "80vw"
							});
						}, {
							name: `<icon>code</icon><span style = "padding-left: 0.25rem; padding-right: 0.5rem;">Script Manager</span>`,
							tooltip: `ScriptManager positioning is temporary, and will be changed in the future to be integrated into the main node editor.`,
							style: { "#name": { alignItems: "center", display: "flex" }, marginLeft: "0.25rem" }
						})
					}),
					hierarchy: new UI_LeftbarHierarchy().value
				}
			},
			undo_redo: {
				name: "Undo/Redo",
				components_obj: { undo_redo: veUndoRedo() }
			}
		}, { 
			do_not_wrap: true,
			starting_page: "hierarchy",
			style: {
				display: "flex",
				overflow: "hidden",
				flexDirection: "column",
				height: `calc(100% - var(--padding)*2)`,
				
				"#component-body": {
					flexGrow: 1,
					minHeight: 0,
					overflow: "auto",
					scrollbarColor: "white transparent",
					scrollbarWidth: "thin",
					
					"> [component='ve-raw-interface']": {
						display: "flex",
						flexDirection: "column",
						height: "100%"
					}
				},
				"[component='ve-file-explorer']": {
					paddingLeft: 0,
					
					"#file-explorer-body > [component='ve-hierarchy']": { paddingLeft: 0 }
				}
			}
		});
		
		//Open UI
		super.open("instance", {
			anchor: "top_left",
			do_not_wrap: true,
			mode: "static_ui",
			height: `calc(100dvh${(navbar_el) ? " - " + navbar_el.offsetHeight + "px" : ""} - 16px)`,
			width: "24rem",
			x: 8,
			y: ((navbar_el) ? navbar_el.offsetHeight : 0) + 8
		});
	}
};