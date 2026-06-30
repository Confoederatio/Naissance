if (!global.naissance) global.naissance = {};

/**
 * Parses a JSON action for a target Feature.
 * - Static method of: {@link naissance.Feature}
 *
 * `arg0_json`: {@link Object}|{@link string}
 * - `.feature_id`: {@link Object}|{@link string} - Identifier. The {@link naissance.Feature} ID to target changes for, if any.
 * <br>
 * - ##### Extraneous Commands:
 * - `.add_column`: {@link Object}
 *   - `.key`: {@link string}
 *   - `.values`: {@link Array}<{@link Array}<{@link Object}|{@link number}, {@link any}, ...>> - [date, value] map.
 * - `.add_variable`: {@link Object}
 *   - `.date`: {@link Object}|{@link number}|{@link string} - If string, either 'start'/'end'.
 *   - `.key`: {@link string}
 *   - `.value`: {@link any}
 * - `.clean_keyframes`: {@link Array}<{@link string}> - Cleans geometry keyframes for default symbols, redundant names. Options: ["symbol"]
 * - `.clean_geometry_tags`: {@link boolean}
 * - `.delete_feature`: {@link boolean}
 * - `.feature_operation`: {@link Object}
 *   - `.type`: {@link string} - Either 'difference'/'intersect'/'union'/'xor'.
 *   -
 *   - `.feature_id`: {@link string}
 *   - `.geometry_id`: {@link string}
 * - `.flatten_all_geometries`: {@link boolean}
 * - `.import_file`: {@link Object}
 *   - `.file_path`: {@link string}
 *   - `.type`: {@link string} - Either 'csv'/'geojson'/'gpx'/'kml'/'kmz'/'naissance'/'osm'/'polyline'/'shp'/'topojson'/'wkt'.
 *   - `.options`: {@link Object}
 * - `.move_all_entities_to_feature`: {@link string}
 * - `.set_name`: {@link string}
 * - `.set_visibility`: {@link boolean}
 * - `.set_zoom`: {@link Object}
 *   - `.is_start_keyframe=false`: {@link boolean}
 *   - `.max_zoom`: {@link number}|{@link string} - 'delete' if a number.
 *   - `.min_zoom`: {@link number}|{@link string} - 'delete' if a number.
 * - `.simplify_all_polygons`: {@link number}
 *
 * @param {Object|string} arg0_json
 */
naissance.Feature.parseAction = async function (arg0_json) {
	//Convert from parameters
	let json = (typeof arg0_json === "string") ? JSON.parse(arg0_json) : arg0_json;
	
	//Declare local instance variables
	let feature_obj = (typeof json.feature_obj === "string") ? 
		naissance.Feature.instances[json.feature_obj] : json.feature_obj;
	
	//Parse commands for feature_obj
	if (feature_obj) {
		//Specialised Feature handler
		if (feature_obj.class_name)
			if (["FeatureGroup", "FeatureLayer", "FeatureSketchMap", "FeatureTileLayer"].includes(feature_obj.class_name))
				await naissance[feature_obj.class_name].parseAction(json);
		
		//add_column
		if (json.add_column !== undefined) {
			let all_geometries = feature_obj.getAllGeometries();
			let all_geometry_ids = [];
			
			//Iterate over all_geometries and append IDs for parsing
			for (let i = 0; i < all_geometries.length; i++)
				if (all_geometries[i].id) all_geometry_ids.push(all_geometries[i].id);
			
			naissance.Geometry.parseActionForGeometries(all_geometry_ids, {
				command: "add_column",
				key: "add_column",
				name: "Add F.Field",
				type: "Geometry",
				value: json.add_column,
			});
		}
		
		//add_variable
		if (json.add_variable !== undefined) {
			let all_geometries = feature_obj.getAllGeometries();
			let all_geometry_ids = [];
			
			//Iterate over all_geometries and append IDs for parsing
			for (let i = 0; i < all_geometries.length; i++)
				if (all_geometries[i].id) all_geometry_ids.push(all_geometries[i].id);
			naissance.Geometry.parseActionForGeometries(all_geometry_ids, {
				command: "add_variable",
				key: "add_variable",
				name: "Add F.Variable",
				type: "Geometry",
				value: json.add_variable
			});
		}
		
		//clean_keyframes
		if (json.clean_keyframes) {
			let all_geometries = feature_obj.getAllGeometries();
			let all_geometry_ids = [];
			
			//Iterate over all_geometries and append IDs for parsing
			for (let i = 0; i < all_geometries.length; i++)
				if (all_geometries[i].id) all_geometry_ids.push(all_geometries[i].id);
			naissance.Geometry.parseActionForGeometries(all_geometry_ids, {
				command: "clean_keyframes",
				key: "clean_keyframes",
				name: "Clean F.Geometry Keyframes",
				value: json.clean_keyframes
			});
		}
		
		//clean_geometry_tags
		if (json.clean_geometry_tags) {
			let all_geometries = feature_obj.getAllGeometries();
			
			//Iterate over all_geometries and clean metadata.tags
			for (let i = 0; i < all_geometries.length; i++)
				delete all_geometries[i].metadata.tags;
		}
		
		//delete_feature
		if (json.delete_feature === true) {
			feature_obj.remove();
			return;
		}
		
		//feature_operation
		if (json.feature_operation) {
			naissance.Feature.operate.call(feature_obj,
				json.feature_operation.type,
				(json.feature_operation.feature_id) ? json.feature_operation.feature_id : json.feature_operation.geometry_id);
			UI_Leftbar.refresh();
		}
		
		//flatten_all_geometries
		if (json.flatten_all_geometries) {
			feature_obj.entities = feature_obj.getAllGeometries();
			
			//Update parent ref for all promoted geometries
			for (let i = 0; i < feature_obj.entities.length; i++)
				feature_obj.entities[i].parent = feature_obj;
			UI_Leftbar.refresh();
		}
		
		//import_file
		if (json.import_file)
			if (feature_obj.entities) {
				naissance.Feature.importFile.call(feature_obj, json.import_file.file_path, json.import_file.type, json.import_file.options);
				UI_Leftbar.refresh();
			}
		
		//move_all_entities_to_feature
		if (json.move_all_entities_to_feature !== undefined) {
			let ot_feature_obj = naissance.Feature.instances[json.move_all_entities_to_feature];
			
			if (ot_feature_obj && ot_feature_obj?.id !== feature_obj.id) {
				let local_entities = [...feature_obj.entities];
				
				//Iterate over local_entities
				for (let i = 0; i < local_entities.length; i++) {
					let local_entity = local_entities[i];
					
					//Remove from old parent .entities array
					if (local_entity.parent && local_entity.parent.entities) {
						let parent_entities = local_entity.parent.entities;
						
						//Iterate over all parent_entities and splice out the entity being moved
						for (let x = parent_entities.length - 1; x >= 0; x--)
							if (parent_entities[x].id === local_entity.id)
								parent_entities.splice(x, 1);
					}
					
					//Move to target feature
					local_entity.parent = ot_feature_obj;
					if (!ot_feature_obj.entities) ot_feature_obj.entities = [];
					ot_feature_obj.entities.push(local_entity);
				}
				UI_Leftbar.refresh();
			}
		}
		
		//set_name
		if (typeof json.set_name === "string")
			feature_obj._name = json.set_name;
		
		//set_visibility
		if (json.set_visibility !== undefined)
			if (json.set_visibility === true) {
				feature_obj.show();
			} else if (json.set_visibility === false) {
				feature_obj.hide();
			}
		
		//set_zoom
		if (json.set_zoom !== undefined) {
			let all_geometries = feature_obj.getAllGeometries();
			let all_geometry_ids = [];
			
			for (let i = 0; i < all_geometries.length; i++)
				if (all_geometries[i].id) all_geometry_ids.push(all_geometries[i].id);
			
			naissance.Geometry.parseActionForGeometries(all_geometry_ids, {
				command: "set_zoom",
				key: "set_zoom",
				name: "Set F.Zoom",
				value: json.set_zoom,
			});
		}
		
		//simplify_all_polygons
		if (json.simplify_all_polygons !== undefined) {
			let all_geometries = feature_obj.getAllGeometries();
			let all_geometry_ids = [];
			
			//Iterate over all_geometries and append IDs for parsing
			for (let i = 0; i < all_geometries.length; i++)
				if (all_geometries[i].id) all_geometry_ids.push(all_geometries[i].id);
			naissance.Geometry.parseActionForGeometries(all_geometry_ids, {
				command: "simplify_polygon_for_all_keyframes",
				key: "simplify_polygon_for_all_keyframes",
				name: "Simplify F.Keyframes",
				type: "GeometryPolygon",
				value: json.simplify_all_polygons
			});
		}
	}
};