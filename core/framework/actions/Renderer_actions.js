/**
 * Parses a JSON action for the main map.
 * - Static method of: {@link naissance.Renderer}
 *
 * `arg0_json`: {@link Object|string}
 * - `.add_mapmode`: {@link string} - The mapmode ID to add.
 * - `.remove_mapmode`: {@link string} - The mapmode ID to remove.
 * - `.set_map_spatial_reference`: {@link Object}
 */
naissance.Renderer.parseAction = function (arg0_json) {
	//Convert from parameters
	let json = (typeof arg0_json === "string") ? JSON.parse(arg0_json) : arg0_json;
	
	//Parse commands for map
	if (json.set_map_spatial_reference) {
		map.setSpatialReference(json.set_map_spatial_reference);
		
		//Refresh naissance.FeatureTileLayers this.draw() call
		for (let i = 0; i < naissance.Feature.instances.length; i++)
			if (naissance.Feature.instances[i] instanceof naissance.FeatureTileLayer)
				naissance.Feature.instances[i].draw();
	}
};