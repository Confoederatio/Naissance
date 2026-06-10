if (!global.naissance) global.naissance = {};

/**
 * Parses a JSON action for the main map.
 * - Static method of: {@link naissance.Renderer}
 *
 * `arg0_json`: {@link Object|string}
 * - `.add_mapmode`: {@link string} - The mapmode ID to add.
 * - `.remove_mapmode`: {@link string} - The mapmode ID to remove.
 * - `.set_map_spatial_reference`: {@link Object}
 */
naissance.Renderer.parseAction = async function (arg0_json) {
	//Convert from parameters
	let json = (typeof arg0_json === "string") ? JSON.parse(arg0_json) : arg0_json;
	
	//Parse commands for map
	if (json.set_map_spatial_reference) {
		map.setSpatialReference(json.set_map_spatial_reference);
		
		//Refresh naissance.FeatureTileLayers this.draw() call
		Object.iterate(naissance.Feature.instances, (local_key, local_feature) => 
			local_feature.draw());
	}
};