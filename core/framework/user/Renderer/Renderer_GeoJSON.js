naissance.Renderer.getGeoJSON = function (arg0_options) {
	//Convert from parameters
	let options = (arg0_options) ? arg0_options : {};
	
	//Declare local instance variables
	let geojson_obj = { type: "FeatureCollection", features: [] };
	
	Object.iterate(naissance.Geometry.instances, (local_key, local_value) => {
		if (local_value.geometry) {
			let local_geojson = local_value.geometry.toGeoJSON();
			let local_symbol = local_value.geometry._symbol;
			
			if (!options.do_not_save_symbols) {
				if (!local_geojson.properties) local_geojson.properties = {};
				let local_properties = local_geojson.properties;
				
				if (local_value?.value?.[2])
					local_properties = { ...local_properties, ...local_value.value[2] }; //Concatenate it with Naissance properties
				
				//geojson.io keys
				if (local_symbol.polygonFill !== undefined) local_properties["fill"] = local_symbol.polygonFill;
				if (local_symbol.polygonOpacity !== undefined) local_properties["fill-opacity"] = local_symbol.polygonOpacity;
				if (local_symbol.lineColor !== undefined) local_properties["stroke"] = local_symbol.lineColor;
				if (local_symbol.lineOpacity !== undefined) local_properties["stroke-opacity"] = local_symbol.lineOpacity;
				if (local_symbol.lineWidth !== undefined) local_properties["stroke-width"] = local_symbol.lineWidth;
				
				//Fix reference
				local_geojson.properties = local_properties;
			}
			
			geojson_obj.features.push(local_geojson);
		}
	});
	
	//Return statement
	return JSON.stringify(geojson_obj);
};