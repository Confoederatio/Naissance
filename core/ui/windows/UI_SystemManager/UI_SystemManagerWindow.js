global.UI_SystemManagerWindow = class {
	static instance;
	
	constructor () {
		if (UI_SystemManagerWindow.instance) UI_SystemManagerWindow.instance.close();
		UI_SystemManagerWindow.instance = vePageMenuWindow({
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
			name: "System Manager",
			height: "80dvh",
			width: "80dvw",
			
			page_menu_options: { starting_page: "script_manager" }
		});
	}
};