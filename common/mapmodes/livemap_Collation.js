config.mapmodes.livemap_Collation = {
	name: "Collation (Livemap)",
	icon: "visibility",
	
	redraw: function () {
		//Declare local instance variables
		let config_obj = config.mapmodes.livemap_Collation;
		let geometries = [];
		
		//Iterate over all Ontologies and draw them
		for (let i = 0; i < Ontology.instances.length; i++) {
			let local_ontology = Ontology.instances[i];
			
			geometries = geometries.concat(local_ontology.draw());
		}
		
		//Return statement
		return config_obj.instance.setGeometries(geometries);
	},
	
	special_function: function (v) {
		//Declare local instance variables
		let config_obj = config.mapmodes.livemap_Collation;
		
		if (main.interfaces.livemap_Collation) main.interfaces.livemap_Collation.close();
		main.interfaces.livemap_Collation = new ve.Window({
			hours_ago: new ve.Number(Ontology_Event.draw_hours_ago, {
				name: "Hours Ago (Event)",
				onuserchange: (v) => {
					Ontology_Event.draw_hours_ago = v;
					config_obj.redraw();
				}
			})
		}, {
			name: "Livemap (Collation)",
			can_rename: false
		});
		
		//Return statement
		return config_obj.redraw();
	}
};