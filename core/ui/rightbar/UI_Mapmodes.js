global.UI_Mapmodes = class extends ve.Class {
	constructor () {
		super();
		
		//Declare local instance variables
		this.interface = new ve.Interface({
			mapmode_selection: new ve.SearchSelect({
				default_mapmode: veButton(() => {
					
				}, {
					attributes: {
						"data-default": true
					},
					name: "<icon>flag</icon><span style = 'display: none;'>Default</span>",
					tooltip: "Default"
				}),
				default_keyframes: veButton(() => {
					
				}, {
					attributes: {
						"data-default": true
					},
					name: "<icon>flag_circle</icon><span style = 'display: none;'>Default Keyframes</span>",
					tooltip: "Default Keyframes"
				})
			}, {
				filter_names: {
					"data-default": "Default"
				}
			})
		}, { 
			is_folder: false,
			style: {
				padding: 0
			}
		});
		
		//Open window
		super.open("instance", {
			anchor: "bottom_right",
			mode: "static_window",
			name: "Mapmodes",
			width: "26rem",
			x: 8,
			y: () => main.brush.instance_window.element.offsetHeight + 16
		});
	}
};