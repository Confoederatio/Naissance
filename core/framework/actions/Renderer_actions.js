if (!global.naissance) global.naissance = {};

/**
 * Parses a JSON action for the main map.
 * - Static method of: {@link naissance.Renderer}
 *
 * `arg0_json`: {@link Object|string}
 * - `.move_keyframe`: {@link Object}
 *   - `.from_timestamp`: {@link number}|{@link Object}
 *   - `.to_timestamp`: {@link number}|{@link Object}
 * - `.set_map_spatial_reference`: {@link Object}
 */
naissance.Renderer.parseAction = async function (arg0_json) {
	//Convert from parameters
	let json = (typeof arg0_json === "string") ? JSON.parse(arg0_json) : arg0_json;
	
	//move_keyframe
	if (json.move_keyframe) {
		let from_timestamp = Date.getTimestamp(json.move_keyframe.from_timestamp);
		let to_timestamp = Date.getTimestamp(json.move_keyframe.to_timestamp);
		
		//Iterate over all naissance.Geometry.instances and move any keyframes found at from_timestamp to to_timestamp
		Object.iterate(naissance.Geometry.instances, (local_key, local_geometry) =>
			local_geometry.history.moveKeyframe(from_timestamp, to_timestamp));
	}
	//set_map_spatial_reference
	if (json.set_map_spatial_reference) {
		map.setSpatialReference(json.set_map_spatial_reference);
		
		//Refresh naissance.FeatureTileLayers this.draw() call
		Object.iterate(naissance.Feature.instances, (local_key, local_feature) => 
			local_feature.draw());
	}
};