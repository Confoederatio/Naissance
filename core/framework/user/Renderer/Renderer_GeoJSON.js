naissance.Renderer.getGeoJSON = function (arg0_options) {
	//Convert from parameters
	let options = (arg0_options) ? arg0_options : {};
	
	//Declare local instance variables
	let geojson_obj = { type: "FeatureCollection", features: [] };
	let geometries = main.layers.entity_layer.getGeometries();
	
	//Save snapshot
	geometries.forEach((v) => {
		let local_geojson = v.toGeoJSON();
		let local_symbol = v._symbol;
		
		if (Object.keys(local_symbol).length && !options.do_not_save_symbols) {
			if (!local_geojson.properties) local_geojson.properties = {};
			let local_properties = local_geojson.properties;
			
			//geojson.io keys
			if (local_symbol.polygonFill !== undefined) local_properties["fill"] = local_symbol.polygonFill;
			if (local_symbol.polygonOpacity !== undefined) local_properties["fill-opacity"] = local_symbol.polygonOpacity;
			if (local_symbol.lineColor !== undefined) local_properties["stroke"] = local_symbol.lineColor;
			if (local_symbol.lineOpacity !== undefined) local_properties["stroke-opacity"] = local_symbol.lineOpacity;
			if (local_symbol.lineWidth !== undefined) local_properties["stroke-width"] = local_symbol.lineWidth;
		}
		
		geojson_obj.features.push(local_geojson);
	});
	
	//Return statement
	return JSON.stringify(geojson_obj);
};