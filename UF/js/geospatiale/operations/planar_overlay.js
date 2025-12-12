//Initialise functions
{
	if (!global.Geospatiale)
		global.Geospatiale = {};
	
	/**
	 * Performs a planar overlay between two layers, merging them into a single {@link FeatureCollection} of {@link MultiPolygon}s.
	 * 
	 * @param {FeatureCollection} arg0_layer
	 * @param {FeatureCollection} arg1_layer
	 * 
	 * @returns {FeatureCollection}
	 */
	Geospatiale.planarOverlay = function (arg0_layer, arg1_layer) {
		//Convert from parameters
		let layer_a = JSON.parse(JSON.stringify(arg0_layer));
		let layer_b = JSON.parse(JSON.stringify(arg1_layer));
		
		//Declare local instance variables
		let result_by_source = new Map(); //Track pieces per source feature
		let seen = new Set();
		
		//Process layer_a
		layer_a.features.forEach((local_feature, local_index) => {
			let local_key = `A_${local_index}`;
			let local_pieces = Geospatiale.splitFeature(local_feature, layer_b);
			
			result_by_source.set(local_key, {
				pieces: local_pieces.filter((local_piece) => {
					let local_hash = Geospatiale.hashGeometry(local_piece);
					if (seen.has(local_hash)) return false;
					seen.add(local_hash);
					return true;
				}),
				properties: local_feature.properties,
				source_layer: "A"
			});
		});
		
		//Process layer_b
		layer_b.features.forEach((local_feature, local_index) => {
			let local_key = `B_${local_index}`;
			let local_pieces = Geospatiale.splitFeature(local_feature, layer_a);
			
			result_by_source.set(local_key, {
				pieces: local_pieces.filter((local_piece) => {
					let local_hash = Geospatiale.hashGeometry(local_piece);
					if (seen.has(local_hash)) return false;
					seen.add(local_hash);
					return true;
				}),
				properties: local_feature.properties,
				source_layer: "B"
			});
		});
		
		//Recombine pieces into MultiPolygons
		let result = [];
		
		//Iterate over all results by source
		for (let { pieces, properties, source_layer } of result_by_source.values()) {
			if (pieces.length === 0) continue;
			
			let local_multi_polygon = (pieces.length === 1) ? pieces[0] : {
				type: "MultiPolygon",
				coordinates: pieces.flatMap((local_piece) =>
					(local_piece.type === "MultiPolygon") ? local_piece.coordinates : [local_piece.coordinates])
			};
			result.push(turf.feature(local_multi_polygon, { ...properties, source_layer }));
		}
		
		//Return statement
		return turf.featureCollection(result);
	};
}