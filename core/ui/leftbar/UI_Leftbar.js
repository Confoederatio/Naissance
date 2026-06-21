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
							DALS.Timeline.parseAction("load_save", [{ load_save: data }]);
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
							new UI_SystemManagerWindow();
						}, {
							name: `<icon>handyman</icon><span style = "padding-left: 0.25rem; padding-right: 0.5rem;">Advanced Tools</span>`,
							tooltip: `Tools for modelling and extending Naissance, as well as a System Manager for tasks.`,
							style: { "#name": { alignItems: "center", display: "flex" }, marginLeft: "0.25rem" }
						})
					}),
					hierarchy: new UI_LeftbarHierarchy().value
				}
			},
			timeline: {
				name: "Timeline",
				components_obj: {}
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