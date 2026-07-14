/**
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
 * 
 * @type {Object}
 */
config.actions.feature_sketch_map = {
	create_sketch_map: {
		name: "Create Sketch Map",
		scope: ["FeatureSketchMap"],
		
		special_function: async function (json) {
			if (json.create_sketch_map.id) {
				let new_sketch_map = new naissance.FeatureSketchMap();
				new_sketch_map.setID(json.create_sketch_map.id);
				
				if (!json.create_sketch_map.do_not_refresh)
					UI_Leftbar.refresh();
			}
		}
	},
	
	add_geometry: {
		name: "Add Geometry",
		scope: ["FeatureSketchMap"],
		
		special_function: async function (json) {
			//Declare local instance variables
			let sketch_map_obj = json.naissance_obj;
			
			sketch_map_obj.addGeometry(maptalks.Geometry.fromJSON(json.add_geometry));
		}
	},
	clear_layer: {
		name: "Clear Layer",
		scope: ["FeatureSketchMap"],
		
		special_function: async function (json) {
			//Declare local instance variables
			let sketch_map_obj = json.naissance_obj;
			
			if (json.clear_layer) sketch_map_obj.clearLayer();
		}
	},
	edit_entity: {
		name: "Edit Entity",
		scope: ["FeatureSketchMap"],
		
		special_function: async function (json) {
			//Declare local instance variables
			let sketch_map_obj = json.naissance_obj;
			
			if (sketch_map_obj._entities[json.edit_entity.id]) {
				sketch_map_obj._entities[json.edit_entity.id].remove();
				sketch_map_obj._entities[json.edit_entity.id] = maptalks.Geometry.fromJSON(json.edit_entity.value);
				sketch_map_obj._entities[json.edit_entity.id].addTo(main.layers.overlay_layer);
				sketch_map_obj.draw();
			}
		}
	},
	set_entity_symbol: {
		name: "Set Entity Symbol",
		scope: ["FeatureSketchMap"],
		
		special_function: async function (json) {
			//Declare local instance variables
			let sketch_map_obj = json.naissance_obj;
			
			if (sketch_map_obj._entities[json.set_entity_symbol.id])
				sketch_map_obj._entities[json.set_entity_symbol.id].setSymbol(json.set_entity_symbol.value);
		}
	}
};