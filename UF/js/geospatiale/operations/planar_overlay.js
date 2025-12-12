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
		let layer_a = JSON.parse(JSON.stringify(arg0_layer));
		let layer_b = JSON.parse(JSON.stringify(arg1_layer));
		
		//Split within each layer first (self-overlay)
		layer_a = Geospatiale.planarOverlay_internal(layer_a, layer_a);
		layer_a = turf.flatten(layer_a);  // Flatten to individual Polygons
		
		layer_b = Geospatiale.planarOverlay_internal(layer_b, layer_b);
		layer_b = turf.flatten(layer_b);  // Flatten to individual Polygons
		
		//Then split across layers
		return Geospatiale.planarOverlay_internal(layer_a, layer_b);
	};
	
	Geospatiale.planarOverlay_internal = function (arg0_layer, arg1_layer) {
		let layer_a = JSON.parse(JSON.stringify(arg0_layer));
		let layer_b = JSON.parse(JSON.stringify(arg1_layer));
		
		let result_by_source = new Map();
		
		//Process layer_a
		layer_a.features.forEach((local_feature, local_index) => {
			let local_key = `A_${local_index}`;
			let local_pieces = Geospatiale.splitFeature(local_feature, layer_b);
			
			result_by_source.set(local_key, {
				pieces: local_pieces,
				properties: local_feature.properties,
				source_layer: "A"
			});
		});
		
		//Process layer_b
		if (layer_a !== layer_b) {
			layer_b.features.forEach((local_feature, local_index) => {
				let local_key = `B_${local_index}`;
				let local_pieces = Geospatiale.splitFeature(local_feature, layer_a);
				
				result_by_source.set(local_key, {
					pieces: local_pieces,
					properties: local_feature.properties,
					source_layer: "B"
				});
			});
		}
		
		let result = [];
		let source_dedup = new Map(); // Deduplicate by (source_key + geometry_hash)
		
		for (let [source_key, { pieces, properties, source_layer }] of result_by_source.entries()) {
			if (pieces.length === 0) continue;
			
			for (let piece of pieces) {
				let local_hash = Geospatiale.hashGeometry(piece);
				let dedup_key = `${source_key}_${local_hash}`;
				
				if (source_dedup.has(dedup_key)) continue; // Skip duplicates from same source
				source_dedup.set(dedup_key, true);
				
				let local_multi_polygon = (piece.type === "MultiPolygon") ? piece : {
					type: "MultiPolygon",
					coordinates: [piece.coordinates]
				};
				result.push(turf.feature(local_multi_polygon, { ...properties, source_layer }));
			}
		}
		
		console.log(`planarOverlay_internal:`, JSON.stringify(turf.featureCollection(result)));
		return turf.featureCollection(result);
	};
}