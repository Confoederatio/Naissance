global.UI_Navbar = class {
	constructor () {
		//Declare local instance variables
		this.ui = {};
		
		this.navbar_el = new ve.Navbar({
			file: {
				name: "Project",
				
				open_project_folder: {
					name: "Open Project Folder",
					onclick: () => {
						let electron_shell = global.electron.shell;
						let remote_module = global.electron_remote;
						let base_path = `${remote_module.app.getAppPath()}/saves`;
						
						electron_shell.openPath(base_path);
					}
				}
			},
			edit: {
				name: "Edit",
				
				save_snapshot_as_geojson: {
					name: "Save Snapshot (GeoJSON)",
					onclick: () => {
						if (this.save_snapshot_window) this.save_snapshot_window.close();
						this.save_snapshot_window = veWindow({
							save_symbols: veCheckbox((this.ui.save_snapshot_symbols !== undefined) ? this.ui.save_snapshot_symbols : true, {
								name: "Save Symbols",
								onuserchange: (v) => this.ui.save_snapshot_symbols = v
							}),
							file_path: veFile(this.ui.save_snapshot_file_path, {
								onuserchange: (v) => this.ui.save_snapshot_file_path = v,
								save_function: () => naissance.Renderer.getGeoJSON({
									do_not_save_symbols: (this.ui.save_snapshot_symbols === false)
								})
							})
						}, {
							name: "Save Snapshot as GeoJSON",
							can_rename: false,
							width: "20rem",
							x: "50dvw - 10rem",
							y: "50dvh - 2.5rem"
						});
					}
				},
				toggle_dev_tools: {
					name: "Toggle Dev Tools",
					keybind: "ctrl+i",
					onclick: () => Blacktraffic.task("electron:toggle-dev-tools")
				},
				toggle_ui: {
					name: "Toggle UI",
					keybind: "ctrl+u",
					onclick: () => naissance.Renderer.toggleUI()
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
				name: "Tutorial",
				onclick: () => {
					if (main.interfaces.tutorial_window) main.interfaces.tutorial_window.close();
					main.interfaces.tutorial_window = veWindow(`Click the 'Help' button in the top right to open the <b>Wiki</b>.<br><br>The Wiki contains the most up-to-date information on how to use <b>Naissance</b>, which is the map editor on your screen.`, {
						name: "Tutorial",
						can_rename: false,
						width: "20rem",
						height: "10rem",
						x: "50dvw - 10rem",
						y: "50dvh - 5rem"
					});
				}
			}
		});
	}
};