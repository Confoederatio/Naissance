if (!global.naissance) global.naissance = {};

/**
 * Parses a JSON action for a target FeatureLayer.
 * - Static method of: {@link naissance.FeatureLayer}
 *
 * `arg0_json`: {@link Object}|{@link string}
 * - `.feature_obj`: {@link Object}|{@link string} - Identifier. The {@link naissance.Feature} ID to target changes for.
 * <br>
 * - #### Extraneous Commands:
 *   - `.create_layer`: {@link Object}
 *     - `.do_not_refresh=false`: {@link boolean}
 *     - `.id`: {@link string}
 * - #### Internal Commands:
 *   - `.set_layer_option`: {@link Object}
 *     - `.key`: {@link string} - The key to change for the selected layer.
 *     - `.value`: {@link any} - What to change the value of the key to.
 */
naissance.FeatureLayer.parseAction = async function (arg0_json) {
	//Convert from parameters
	let json = (typeof arg0_json === "string") ? JSON.parse(arg0_json) : arg0_json;
	
	//Declare local instance variables
	let layer_obj = (typeof json.feature_obj === "string") ? 
		naissance.Feature.instances[json.feature_obj] : json.feature_obj;
	
	//Parse extraneous commands
	//create_layer
	if (json.create_layer)
		if (json.create_layer.id) {
			let new_layer = new naissance.FeatureLayer();
				new_layer.setID(json.create_layer.id);
			
			if (!json.create_layer.do_not_refresh)
				UI_LeftbarHierarchy.refresh();
		}
	
	//Parse commands for layer_obj
	if (layer_obj) {
		//set_layer_option
		if (json.set_layer_option)
			layer_obj[json.set_layer_option.key] = json.set_layer_option.value;
	}
};