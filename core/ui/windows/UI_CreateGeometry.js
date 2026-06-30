global.UI_CreateGeometry = class extends ve.Class {
	constructor (arg0_type, arg1_options) {
		//Convert from parameters
		let type = arg0_type;
		let options = (arg1_options) ? arg1_options : {};
			super();
			
		//Declare local instance variables
		this.options = options;
		this.type = type;
		
		//Draw call
		if (options.return) return this.draw(); //Internal guard clause if return is true
		this.open(); //Open prompt otherwise
	}
	
	draw () {
		//Declare local instance variables
		let DALS_command = `create_${this.type.replace("Geometry", "").toLowerCase()}`;
		let geometry_name = veText(`New ${this.type.replace("Geometry", "")}`, { name: "Name" });
		
		//Return statement
		return {
			geometry_name,
			create_geometry: veButton(() => {
				veToast(`Created ${geometry_name.v}`);
				let select_geometry_id = Class.generateRandomID(naissance.Geometry);
				
				DALS.Timeline.parseAction(`create_${this.type}`, [{
					type: this.type,
					[DALS_command]: {
						id: select_geometry_id,
						name: geometry_name.v,
						coordinates: (this.type === "GeometryPoint") ? [(map.mouse_click_coords || map.mouse_hover_coords)] : undefined
					}
				}, {
					type: "Brush",
					select_geometry_id: select_geometry_id
				}]);
				if (this?.interface) this.interface.close();
				if (this.options.onclick) this.options.onclick();
			})
		};
	}
	
	open () {
		//Declare local instance variables
		let DALS_command = `create_${this.type.replace("Geometry", "").toLowerCase()}`;
		console.log(DALS_command)
		
		if (this.interface) this.interface.remove();
		this.interface = veContextMenu(this.draw(), {
			id: "ui_create_geometry",
			draggable: true
		});
	}
}