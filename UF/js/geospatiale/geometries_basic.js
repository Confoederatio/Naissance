//Initialise functions
{
	if (!global.Geospatiale)
		global.Geospatiale = {};
	
	/**
	 * Hashes a geometry to detect duplicates and ensure uniqueness.
	 * 
	 * @param {Geometry} arg0_geometry
	 * @param {Object} [arg1_options]
	 *  @param {number} [arg1_options.precision=6] - The precision to use when checking the hash.
	 *  
	 * @returns {string}
	 */
	Geospatiale.hashGeometry = function (arg0_geometry, arg1_options) {
		//Convert from parameters
		let geometry = arg0_geometry;
		let options = (arg1_options) ? arg1_options : {};
		
		//Initialise options
		options.precision = Math.returnSafeNumber(options.precision, 6);
		
		//Return statement
		return JSON.stringify(turf.truncate(geometry, { precision: options.precision }));
	};
	
	/**
	 * Splits a feature into multiple sections based on a divisor layer.
	 * 
	 * @param {Feature} arg0_feature
	 * @param {FeatureCollection} arg1_divisor_layer
	 * 
	 * @returns {Feature[]}
	 */
	Geospatiale.splitFeature = function (arg0_feature, arg1_divisor_layer) { //[WIP] - Untested function
		//Convert from parameters
		let feature = arg0_feature;
		let divisor_layer = arg1_divisor_layer;
		
		//Declare local instance variables
		let feature_pieces = [];
		let flattened = turf.flatten(turf.feature(feature.geometry));
		
		//Iterate over all polygons in flattened.features
		for (let local_polygon of flattened.features) {
			let current_pieces = [local_polygon.geometry];
			
			for (let local_ot_feature of divisor_layer.features) {
				let ot_flattened = turf.flatten(turf.feature(local_ot_feature.geometry));
				let next_pieces = [];
				
				for (let local_geometry of current_pieces) {
					let was_split = false;
					
					for (let local_ot_polygon of ot_flattened.features) try {
						let local_difference = turf.difference(turf.feature(local_geometry), local_ot_polygon);
						let local_intersection = turf.intersect(turf.feature(local_geometry), local_ot_polygon);
						
						//Parse local_intersection.geometry, then local_difference.geometry
						if (local_intersection?.geometry) {
							next_pieces.push(local_intersection.geometry);
							was_split = true;
						}
						if (local_difference?.geometry) {
							next_pieces.push(local_difference.geometry);
							was_split = true;
						}
						
						if (was_split) break;
					} catch (e) {}
					
					if (!was_split)
						next_pieces.push(local_geometry);
				}
				
				current_pieces = next_pieces;
			}
			
			feature_pieces.push(...current_pieces);
		}
		
		//Return statement
		return feature_pieces;
	};
}