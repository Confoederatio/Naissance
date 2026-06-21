global.UI_Navbar = class {
	constructor () {
		//Declare local instance variables
		this.navbar_el = new ve.Navbar({
			file: {
				name: "Project",
				
				open_project_folder: {
					name: "Open Project Folder"
				}
			},
			edit: {
				name: "Edit",
				
				toggle_dev_tools: {
					name: "Toggle Dev Tools",
					keybind: "ctrl+i",
					onclick: () => Blacktraffic.task("electron:toggle-dev-tools")
				},
				undo: {
					name: "Undo",
					keybind: "ctrl+z",
					onclick: () => DALS.Timeline.undo()
				},
				redo: {
					name: "Redo",
					keybind: "ctrl+y",
					onclick: () => DALS.Timeline.redo()
				}
			},
			settings: {
				name: "Settings",
				onclick: () => new UI_Settings()
			},
			tutorial: {
				name: "Tutorial"
			}
		});
	}
};