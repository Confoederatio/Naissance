global.UI_Mapmodes_Settings = class extends ve.Class {
	constructor () {
		super();
		
		this.interface = new ve.Interface({
			disable_mapmode_interactivity: new ve.Toggle(main.settings.disable_mapmode_interactivity, {
				name: "Disable Mapmode Interactivity",
				tooltip: "Disables click events for overlay/underlay mapmodes.",
				
				onuserchange: (v) => {
					main.settings.disable_mapmode_interactivity = v;
					this.update();
				}
			})
		}, {
			is_folder: false
		});
		
		super.open("instance", {
			name: "Mapmode Settings",
			can_rename: false,
			width: "30rem",
			x: "50dvw - 30rem/2"
		});
	}
	
	update () {
		//Redraw Mapmodes
		naissance.Mapmode.draw();
	}
};