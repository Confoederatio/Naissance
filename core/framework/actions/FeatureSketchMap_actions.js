/**
 * Parses a JSON action for a target FeatureLayer.
 * - Static method of: {@link naissance.FeatureLayer}
 *
 * `arg0_json`: {@link Object|string}
 * - `.feature_id`: {@link string} - Identifier. The {@link naissance.Feature} ID to target changes for.
 * <br>
 * - #### Extraneous Commands:
 * - `.create_sketch_map`: {@link Object}
 *   - `.do_not_refresh=false`: {@link boolean}
 *   - `.id`: {@link string}
 * - #### Internal Commands:
 * - `.delete_entity`: {@link Object}
 *   - `.id`: {@link number} - The index of the deleted geometry.
 * - `.edit_entity`: {@link Object}
 *   - `.id`: {@link number} - The index of the edited geometry.
 *   - `.value`: {@link string} - The JSON value of the edited geometry.
 * - `.set_entity_symbol`: {@link Object}
 *   - `.id`: {@link number} - The index of the edited geometry.
 *   - `.value`: {@link Object} - The value of the edited symbol.
 */
naissance.FeatureSketchMap.parseAction = function (arg0_json) {
	//Convert from parameters
	let json = (typeof arg0_json === "string") ? JSON.parse(arg0_json) : arg0_json;
	
	//Declare local instance variables
	let sketch_map_obj = naissance.Feature.instances.filter((v) => v.id === json.feature_id)[0];
	
	//Parse extraneous commands
	//create_sketch_map
	if (json.create_sketch_map)
		if (json.create_sketch_map.id) {
			let new_sketch_map = new naissance.FeatureSketchMap();
			new_sketch_map.id = json.create_sketch_map.id;
			
			if (!json.create_sketch_map.do_not_refresh)
				UI_LeftbarHierarchy.refresh();
		}
	
	//Parse commands for sketch_map_obj
	if (sketch_map_obj instanceof naissance.FeatureSketchMap) {
		//add_geometry
		if (json.add_geometry)
			sketch_map_obj.addGeometry(maptalks.Geometry.fromJSON(json.add_geometry));
		//clear_layer
		if (json.clear_layer)
			sketch_map_obj.clearLayer();
		if (json.delete_entity && json.delete_entity.id)
			if (sketch_map_obj._entities[json.delete_entity.id]) {
				let local_entity = sketch_map_obj._entities[json.delete_entity.id];
				
				sketch_map_obj._entities.splice(json.delete_entity.id, 1);
				local_entity.remove();
				if (local_entity.context_menu) local_entity.context_menu.close();
			}
		//edit_entity
		if (json.edit_entity)
			if (sketch_map_obj._entities[json.edit_entity.id]) {
				sketch_map_obj._entities[json.edit_entity.id].remove();
				sketch_map_obj._entities[json.edit_entity.id] = maptalks.Geometry.fromJSON(json.edit_entity.value);
				sketch_map_obj._entities[json.edit_entity.id].addTo(main.layers.overlay_layer);
				sketch_map_obj.draw();
			}
		//set_entity_symbol
		if (json.set_entity_symbol)
			if (sketch_map_obj._entities[json.set_entity_symbol.id])
				sketch_map_obj._entities[json.set_entity_symbol.id].setSymbol(json.set_entity_symbol.value);
	}
};