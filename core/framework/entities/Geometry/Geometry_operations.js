naissance.Geometry.operate = function (arg0_type, arg1_entity_id) {
	//Convert from parameters
	let type = (arg0_type) ? arg0_type : "union";
	let entity_id = arg1_entity_id;
	
	//Declare local instance variables
	let ot_turf_geometry;
	let turf_geometry = Geospatiale.convertMaptalksToTurf(this.geometry);
	
	if (typeof entity_id === "string") {
		let ot_feature_obj = naissance.Feature.instances[entity_id];
		let ot_geometry_obj = naissance.Geometry.instances[entity_id];
		
		//ot_feature_obj handling
		if (ot_feature_obj?.entities) {
			ot_turf_geometry = ot_feature_obj.getTurfGeometry();
		} else if (ot_geometry_obj) {
			ot_turf_geometry = Geospatiale.convertMaptalksToTurf(ot_geometry_obj.geometry);
		}
	} else if (typeof entity_id === "object") {
		ot_turf_geometry = entity_id;
	}
	
	if (ot_turf_geometry)
		if (type === "difference") {
			if (turf_geometry) {
				turf_geometry = turf.difference(turf.featureCollection([turf_geometry, ot_turf_geometry]));
			} else {
				turf_geometry = null;
			}
		} else if (type === "intersect") {
			if (turf_geometry) {
				turf_geometry = turf.intersect(turf.featureCollection([turf_geometry, ot_turf_geometry]));
			} else {
				turf_geometry = null;
			}
		} else if (type === "union") {
			if (turf_geometry) {
				turf_geometry = turf.union(turf.featureCollection([turf_geometry, ot_turf_geometry]));
			} else {
				turf_geometry = ot_turf_geometry;
			}
		} else if (type === "xor") {
			if (turf_geometry) {
				let intersect_geometry = turf.intersect(turf.featureCollection([turf_geometry, ot_turf_geometry]));
				turf_geometry = turf.difference(turf.featureCollection([turf_geometry, intersect_geometry]));
			} else {
				turf_geometry = null;
			}
		}
	
	//Return statement
	return Geospatiale.convertTurfToMaptalks(turf_geometry);
};