global.UI_SystemManagerWindow = class {
	static instance;
	
	constructor () {
		if (UI_SystemManagerWindow.instance) UI_SystemManagerWindow.instance.close();
		UI_SystemManagerWindow.instance = vePageMenuWindow({
			datavis_suite: {
				name: "Datavis Suite",
				components_obj: {
					datavis_suite: veDatavisSuite()
				}
			},
			livemap_workers: {
				name: "Livemap Workers"
			},
			script_manager: {
				name: "Script Manager (IDE)",
				components_obj: {
					script_manager: veScriptManager()
				}
			}
		}, {
			can_rename: false,
			name: "Advanced Tools",
			height: "80dvh",
			width: "80dvw",
			
			page_menu_options: {
				retain: true,
				starting_page: "script_manager",
				style: {
					display: "flex",
					height: "100%",
					flexDirection: "column",
					
					"#component-body": { 
						flexGrow: 1,
						"[component='ve-interface']": { padding: 0 },
						"td[id='0-0']": { padding: 0 }
					}
				}
			}
		});
	}
};