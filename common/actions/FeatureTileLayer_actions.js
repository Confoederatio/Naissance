/**
 * - #### Extraneous Commands:
 * - `.create_tile_layer`: {@link Object}
 *   - `.do_not_refresh=false`: {@link boolean}
 *   - `.id`: {@link string}
 * - #### Internal Commands:
 * - `.add_options`: {@link Object} - Mutates specified TileLayer options.
 * - `.apply_as_base_layer`: {@link boolean}
 * - `.set_options`: {@link Object} - Overrides all options for the {@link naissance.FeatureTileLayer} and replaces them with the object specified.
 * 
 * @type {Object}
 */
config.actions.feature_tile_layer = {
	create_tile_layer: {
		name: "Create Tile Layer",
		scope: ["FeatureTileLayer"],
		
		special_function: async function (json) {
			if (json.create_tile_layer.id) {
				let new_tile_layer = new naissance.FeatureTileLayer();
				new_tile_layer.setID(json.create_tile_layer.id);
				
				if (!json.create_tile_layer.do_not_refresh)
					UI_Leftbar.refresh();
			}
		}
	},
	
	add_options: {
		name: "Add Options",
		scope: ["FeatureTileLayer"],
		
		special_function: async function (json) {
			//Declare local instance variables
			let tile_layer_obj = json.naissance_obj;
			
			//Fix .options
			tile_layer_obj.options = {
				...tile_layer_obj.options,
				...json.add_options
			};
			tile_layer_obj.draw();
		}
	},
	apply_as_base_layer: {
		name: "Apply as Base Layer",
		scope: ["FeatureTileLayer"],
		
		special_function: async function (json) {
			//Declare local instance variables
			let tile_layer_obj = json.naissance_obj;
			
			//Iterate over all naissance.Feature.instances; remove .is_base_layer flag from all instances first
			Object.iterate(naissance.Feature.instances, (local_key, local_feature) => {
				if (local_feature instanceof naissance.FeatureTileLayer)
					delete local_feature.is_base_layer;
			});
			
			//Replace base layer
			map.removeBaseLayer();
			map.setBaseLayer(tile_layer_obj.layer);
			tile_layer_obj.is_base_layer = true;
			UI_Leftbar.refresh();
		}
	},
	set_options: {
		name: "Set Options",
		scope: ["FeatureTileLayer"],
		
		special_function: async function (json) {
			//Declare local instance variables
			let tile_layer_obj = json.naissance_obj;
			
			//Set options if possible
			if (json.set_options) {
				tile_layer_obj.options = json.set_options;
				tile_layer_obj.draw();
			}
		}
	}
};