naissance.Feature.operate = function (arg0_type, arg1_entity_id) {
	//Convert from parameters
	let type = (arg0_type) ? arg0_type : "union";
	let entity_id = arg1_entity_id;
	
	//Declare local instance variables
	let geometries = this.getAllGeometries();
	let ot_feature_obj = naissance.Feature.instances[entity_id];
	let ot_geometry_obj = naissance.Geometry.instances[entity_id];
	
	//ot_feature_obj handling
	let ot_turf_geometry;
	
	if (ot_feature_obj?.entities) {
		let ot_geometries = ot_feature_obj.getAllGeometries();
		
		//Special handling for union
		if (type === "union") {
			//Iterate over all ot_geometries
			for (let i = 0; i < ot_geometries.length; i++) {
				let linked_geometry;
				
				if (ot_geometries[i]?.metadata?.linked_id)
					for (let x = 0; x < geometries.length; x++)
						if (geometries[x].id === ot_geometries[i].metadata.linked_id) {
							linked_geometry = geometries[x];
							break;
						}
				
				//Merge current geometry with linked geometry
				if (linked_geometry) {
					let maptalks_geometry = naissance.Geometry.operate.call(linked_geometry, ot_geometries[i].id, "union");
					if (maptalks_geometry !== null) maptalks_geometry = maptalks_geometry.toJSON();
					linked_geometry.addKeyframe(main.date, maptalks_geometry);
				}
				//Just copy the geometry over
				else if (ot_geometries[i].geometry) {
					let geometry_obj = new naissance[ot_geometries[i].class_name]({ is_import: true });
					geometry_obj.addKeyframe(main.date, ot_geometries[i].geometry.toJSON());
					geometry_obj.parent = this;
					geometry_obj.entities.push(ot_geometries[i]);
				}
			}
		} else {
			ot_turf_geometry = ot_feature_obj.getTurfGeometry();
		}
	}
	
	if (ot_geometry_obj?.geometry)
		ot_turf_geometry = Geospatiale.convertMaptalksToTurf(ot_geometry_obj.geometry);
	
	//Iterate through geometries and apply naissance.Geometry.operate
	if (ot_turf_geometry)
		for (let i = 0; i < geometries.length; i++) {
			let maptalks_geometry = naissance.Geometry.operate.call(geometries[i], type, ot_turf_geometry);
			if (maptalks_geometry !== null) maptalks_geometry = maptalks_geometry.toJSON();
			geometries[i].addKeyframe(main.date, maptalks_geometry);
		}
};