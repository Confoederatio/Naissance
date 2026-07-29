/**
 * Imports a file into the given Feature if possible.
 * 
 * @param {string} arg0_file_path
 * @param {string} [arg1_type] - Either 'csv'/'geojson'/'gpx'/'kml'/'kmz'/'naissance'/'osm'/'polyline'/'shp'/'topojson'/'wkt'.
 * @param {Object} [arg2_options] - Key map once converted into GeoJSON.
 */
naissance.Feature.importFile = function (arg0_file_path, arg1_type, arg2_options) {
	//Convert from parameters
	let file_path = path.resolve(arg0_file_path);
	let type = (arg1_type) ? arg1_type : "geojson";
	let options = (arg2_options) ? arg2_options : {};
	
	if (!fs.existsSync(file_path)) {
		console.error(`File ${file_path} does not exist.`);
		return;
	}
	
	//Handle .naissance files
	if (type === "csv") {
		maptalks.Formats.csv(file_path, (err, geojson) =>
			naissance.Feature.importGeoJSON.call(this, geojson, options));
	} else if (type === "geojson") {
		naissance.Feature.importGeoJSON.call(this, fs.readFileSync(file_path, "utf8"), options);
	} else if (type === "gpx") {
		maptalks.Formats.gpx(file_path, (err, geojson) =>
			naissance.Feature.importGeoJSON.call(this, geojson, options));
	} else if (type === "kml") {
		maptalks.Formats.kml(file_path, (err, geojson) =>
			naissance.Feature.importGeoJSON.call(this, geojson, options));
	} else if (type === "kmz") {
		Geospatiale.maptalks_GeoKMZ.toGeoJSON(file_path).then((geojson) => 
			naissance.Feature.importGeoJSON.call(this, geojson, options));
	} else if (type === "naissance") {
		let created_entities = [];
		let json = JSON.parse(fs.readFileSync(file_path, "utf8"));
		
		//Iterate over JSON to load in each class
		Object.iterate(json, (local_key, local_value) => {
			if (local_value.class_name) {
				let naissance_obj;
				
				//1.1. Handle naissance.Geometry classes
				if (local_value.type === "geometry") {
					naissance_obj = new naissance[local_value.class_name]({ is_import: true });
					
					//ID/History/Metadata deserialisation
					if (local_value.id) {
						let has_id = naissance.Geometry.instances[local_value.id];
						
						if (!has_id) {
							naissance_obj.setID(local_value.id);
						} else {
							if (!naissance_obj.metadata) naissance_obj.metadata = {};
							naissance_obj.metadata.linked_id = local_value.id;
						}
					}
					
					if (local_value.history) naissance_obj.history.fromJSON(local_value.history);
					if (local_value.metadata) naissance_obj.metadata = Object.assign(naissance_obj.metadata || {}, local_value.metadata);
				}
				//1.2. Handle naissance.Feature classes
				else if (local_value.type === "feature") {
					naissance_obj = new naissance[local_value.class_name](undefined, {
						metadata: local_value.metadata
					});
					
					if (local_value.id) {
						let has_id = naissance.Feature.instances[local_value.id];
						
						if (!has_id) {
							naissance_obj.setID(local_value.id);
						} else {
							if (!naissance_obj.metadata) naissance_obj.metadata = {};
							naissance_obj.metadata.linked_id = local_value.id;
						}
					}
					
					if (local_value.value) naissance_obj.json = local_value.value;
				}
				
				//1.3. Set parent and nesting
				if (naissance_obj) {
					naissance_obj.parent = this;
					this.entities.push(naissance_obj);
					created_entities.push(naissance_obj);
				}
			}
		});
		
		//2. Second Pass: Features must be rendered/initialized after all instances are created
		for (let i = 0; i < created_entities.length; i++) {
			let local_entity = created_entities[i];
			
			if (local_entity.type === "feature" && local_entity.json) {
				local_entity.fromJSON(local_entity.json);
				
				try {
					if (local_entity.draw) local_entity.draw();
				} catch (e) {
					console.warn(e);
				}
			}
		}
		
		//3. Post-load UI refresh
		if (typeof UI_Leftbar !== "undefined") UI_Leftbar.refresh();
	} else if (type === "osm") {
		maptalks.Formats.osm(file_path, (err, geojson) =>
			naissance.Feature.importGeoJSON.call(this, geojson, options));
	} else if (type === "polyline") {
		maptalks.Formats.polyline(file_path, (err, geojson) =>
			naissance.Feature.importGeoJSON.call(this, geojson, options));
	} else if (type === "shp") {
		shp(fs.readFileSync(file_path)).then((geojson) =>
			naissance.Feature.importGeoJSON.call(this, geojson, options));
	} else if (type === "topojson") {
		maptalks.Formats.topojson(file_path, (err, geojson) =>
			naissance.Feature.importGeoJSON.call(this, geojson, options));
	} else if (type === "wkt") {
		maptalks.Formats.wkt(file_path, (err, geojson) =>
			naissance.Feature.importGeoJSON.call(this, geojson, options));
	}
};

/**
 * Imports a GeoJSON object into the current Feature.
 *
 * @param {Object|string} arg0_geojson_obj
 * @param {Object} [arg1_options]
 *  @param {string} [arg1_options.lat_formula]
 *  @param {string} [arg1_options.lng_formula]
 *
 *  @param {string} [arg1_options.id_key] - The ID key to look for in .properties.
 *  @param {string} [arg1_options.lineColor_key]
 *  @param {string} [arg1_options.lineOpacity_key]
 *  @param {string} [arg1_options.lineWidth_key]
 *  @param {string} [arg1_options.name_key] - The name key to look for in .properties.
 *  @param {string} [arg1_options.polygonFill_key]
 *  @param {string} [arg1_options.polygonOpacity_key]
 *
 *  @param {string} [arg1_options.end_year_key]
 *  @param {string} [arg1_options.end_month_key]
 *  @param {string} [arg1_options.end_day_key]
 *  @param {string} [arg1_options.end_hour_key]
 *  @param {string} [arg1_options.end_minute_key]
 *
 *  @param {string} [arg1_options.start_year_key]
 *  @param {string} [arg1_options.start_month_key]
 *  @param {string} [arg1_options.start_day_key]
 *  @param {string} [arg1_options.start_hour_key]
 *  @param {string} [arg1_options.start_minute_key]
 */
naissance.Feature.importGeoJSON = function (arg0_geojson_obj, arg1_options) {
	//Convert from parameters
	let geojson_obj = (typeof arg0_geojson_obj === "string") ? JSON.parse(arg0_geojson_obj) : arg0_geojson_obj;
	let options = (arg1_options) ? arg1_options : {};

	//Declare local instance variables
	let maptalks_type_map = {
		"LineString": "MultiLineString",
		"Point": "MultiPoint",
		"Polygon": "MultiPolygon",

		"MultiPoint": "MultiPoint",
		"MultiPolygon": "MultiPolygon",
		"MultiLineString": "MultiLineString",
	};
	let naissance_type_map = {
		"LineString": "GeometryLine",
		"Point": "GeometryPoint",
		"Polygon": "GeometryPolygon",

		"MultiPoint": "GeometryPoint",
		"MultiPolygon": "GeometryPolygon",
		"MultiLineString": "GeometryLine",
	};
	
	let lat_fn = (options.lat_formula && String.isMathExpression(options.lat_formula)) ? 
		new Function("lat", "lng", "let y = lat; return " + options.lat_formula) : null;
	let lng_fn = (options.lng_formula && String.isMathExpression(options.lat_formula)) ? new Function("lat", "lng", "let x = lng; return " + options.lng_formula) : null;
	
	let transformCoords = function (input_coords) {
		if (typeof input_coords[0] === "number") {
			let old_lng = input_coords[0];
			let old_lat = input_coords[1];
			let new_lng = (lng_fn) ? lng_fn(old_lat, old_lng) : old_lng;
			let new_lat = (lat_fn) ? lat_fn(old_lat, old_lng) : old_lat;
			
			return [new_lng, new_lat];
		} else {
			for (let i = 0; i < input_coords.length; i++) {
				input_coords[i] = transformCoords(input_coords[i]);
			}
			return input_coords;
		}
	};

	//Iterate over all geojson_obj entries
	for (let i = 0; i < geojson_obj.features.length; i++) {
		let local_feature = geojson_obj.features[i];
		if (!local_feature.geometry?.type) continue; //Internal guard clause if type is not defined

		let local_feature_type = local_feature.geometry.type;

		let is_singular = ["LineString", "Point"].includes(local_feature_type);

		let local_maptalks_type = maptalks_type_map[local_feature_type];
		let local_naissance_type = naissance_type_map[local_feature_type];
		let local_properties = (local_feature.properties) ? JSON.parse(JSON.stringify(local_feature.properties)) : {};

		if (!local_maptalks_type || !local_naissance_type) continue; //Internal guard clause for non-geometries

		//Deep clone coordinates to prevent modifying original object
		let local_coords = (is_singular) ?
			[local_feature.geometry.coordinates] :local_feature.geometry.coordinates;

		//Apply transformation formulas if provided
		if (lat_fn || lng_fn) local_coords = transformCoords(local_coords);

		//Construct symbol
		let local_symbol = (local_properties?.maptalks_symbol) ? local_properties.maptalks_symbol : {};
			if (options.lineColor_key) local_symbol.lineColor = Object.getValue(local_properties, options.lineColor_key);
			if (options.lineOpacity_key) local_symbol.lineOpacity = Object.getValue(local_properties, options.lineOpacity_key);
			if (options.lineWidth_key) local_symbol.lineWidth = Object.getValue(local_properties, options.lineWidth_key);
			if (options.polygonFill_key) local_symbol.polygonFill = Object.getValue(local_properties, options.polygonFill_key);
			if (options.polygonOpacity_key) local_symbol.polygonOpacity = Object.getValue(local_properties, options.polygonOpacity_key);

		//Construct date objects
		let local_start_date = {
			year: (options.start_year_key) ? (Object.getValue(local_properties, options.start_year_key) || 1) : main.date.year,
			month: (options.start_month_key) ? (Object.getValue(local_properties, options.start_month_key) || 1) : main.date.month,
			day: (options.start_day_key) ? (Object.getValue(local_properties, options.start_day_key) || 1) : main.date.day,
			hour: (options.start_hour_key) ? (Object.getValue(local_properties, options.start_hour_key) || 0) : main.date.hour,
			minute: (options.start_minute_key) ? (Object.getValue(local_properties, options.start_minute_key) || 0) : main.date.minute
		};
		let local_end_date = {
			year: (options.end_year_key) ? (Object.getValue(local_properties, options.end_year_key) || 1) : 0,
			month: (options.end_month_key) ? (Object.getValue(local_properties, options.end_month_key) || 1) : 1,
			day: (options.end_day_key) ? (Object.getValue(local_properties, options.end_day_key) || 1) : 1,
			hour: (options.end_hour_key) ? (Object.getValue(local_properties, options.end_hour_key) || 0) : 0,
			minute: (options.end_minute_key) ? (Object.getValue(local_properties, options.end_minute_key) || 0) : 0
		};

		let geometry_obj;
		let local_id = (options.id_key) ? Object.getValue(local_properties, options.id_key) : undefined;

		//Merge logic: Look for existing global instance
		if (local_id !== undefined) geometry_obj = naissance.Geometry.instances[local_id];

		if (!geometry_obj) {
			geometry_obj = new naissance[local_naissance_type]({
				is_import: true
			});
			geometry_obj.parent = this;
			if (local_id !== undefined) geometry_obj.setID(local_id);
		}

		//Ensure the entity is linked to this feature, even if it already existed globally
		if (!this.entities.includes(geometry_obj)) this.entities.push(geometry_obj);

		//Set name and properties
		if (options.name_key) {
			let local_name = Object.getValue(local_properties, options.name_key);
			if (local_name) local_properties.name = local_name;
		}

		//Create maptalks geometry and add keyframe
		let local_maptalks_geometry = new maptalks[local_maptalks_type](local_coords);
		geometry_obj.history.addKeyframe(local_start_date, local_maptalks_geometry.toJSON(), local_symbol, local_properties);

		//Add end date keyframe if applicable
		let has_end_date = (local_end_date.year !== 0);
		if (has_end_date) geometry_obj.history.addKeyframe(local_end_date, null);
	}
};

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
					this.entities.push(ot_geometries[i]);
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