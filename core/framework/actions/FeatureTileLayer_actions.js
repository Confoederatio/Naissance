if (!global.naissance) global.naissance = {};

/**
 * Parses a JSON action for a target FeatureTileLayer.
 * - Static method of: {@link naissance.FeatureTileLayer}
 *
 * `arg0_json`: {@link Object}|{@link string}
 * - `.feature_obj`: {@link Object}|{@link string} - Identifier. The {@link naissance.Feature} ID to target changes for.
 * <br>
 * - #### Extraneous Commands:
 * - `.create_tile_layer`: {@link Object}
 *   - `.do_not_refresh=false`: {@link boolean}
 *   - `.id`: {@link string}
 * - #### Internal Commands:
 * - `.add_options`: {@link Object} - Mutates specified TileLayer options.
 * - `.apply_as_base_layer`: {@link boolean}
 * - `.set_options`: {@link Object} - Overrides all options for the {@link naissance.FeatureTileLayer} and replaces them with the object specified.
 */
naissance.FeatureTileLayer.parseAction = async function (arg0_json) {
	//Convert from parameters
	let json = (typeof arg0_json === "string") ? JSON.parse(arg0_json) : arg0_json;
	
	//Declare local instance variables
	let tile_layer_obj = (typeof json.feature_obj === "string") ? 
		naissance.Feature.instances[json.feature_obj] : json.feature_obj;
	
	//Parse extraneous commands
	//create_tile_layer
	if (json.create_tile_layer)
		if (json.create_tile_layer.id) {
			let new_tile_layer = new naissance.FeatureTileLayer();
				new_tile_layer.setID(json.create_tile_layer.id);
			
			if (!json.create_tile_layer.do_not_refresh)
				UI_Leftbar.refresh();
		}
	
	//Parse commands for tile_layer_obj
	if (tile_layer_obj instanceof naissance.FeatureTileLayer) {
		//add_options
		if (json.add_options) {
			tile_layer_obj.options = {
				...tile_layer_obj.options,
				...json.add_options
			};
			tile_layer_obj.draw();
		}
		
		//apply_as_base_layer
		if (json.apply_as_base_layer) {
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
		
		//set_options
		if (json.set_options) {
			tile_layer_obj.options = json.set_options;
			tile_layer_obj.draw();
		}
	}
};