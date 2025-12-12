//Initialise functions
{
	if (!global.Geospatiale)
		global.Geospatiale = {};
	
	Geospatiale.planarOverlay = function (arg0_layer, arg1_layer) {
		//Convert from parameters
		let layer_a = JSON.parse(JSON.stringify(arg0_layer));
		let layer_b = JSON.parse(JSON.stringify(arg1_layer));
		
		//Declare local instance variables
		let queue = [];
		let solved = [];
		let max_loops = 5000;
		let loops = 0;
		
		//Helper function to prepare features
		let prepare_feature = function (arg0_feature, arg1_source) {
			let local_feature = arg0_feature;
			let local_source = arg1_source;
			
			if (!local_feature.geometry) return;
			
			//Truncate precision and buffer to heal topology
			let truncated = turf.truncate(local_feature, { precision: 6, coordinates: 2, mutate: false });
			let clean = truncated;
			
			try {
				clean = turf.buffer(truncated, 0);
			} catch (e) {}
			
			//Flatten MultiPolygons
			turf.flatten(clean).features.forEach((local_poly) => {
				if (!local_poly.geometry) return;
				local_poly.properties = {
					...local_feature.properties,
					source_layer: local_source
				};
				queue.push(local_poly);
			});
		};
		
		//Process inputs
		turf.flatten(layer_a).features.forEach((local_feature) => prepare_feature(local_feature, "A"));
		turf.flatten(layer_b).features.forEach((local_feature) => prepare_feature(local_feature, "B"));
		
		//Main constructive loop
		while (queue.length > 0) {
			if (loops > max_loops) {
				solved.push(...queue);
				break;
			}
			loops++;
			
			let candidate = queue.shift();
			let collision_existing = null;
			let collision_index = -1;
			let intersection_geom = null;
			
			//Check candidate against solved list
			for (let i = 0; i < solved.length; i++) {
				let existing = solved[i];
				
				//BBox optimization
				let b1 = turf.bbox(candidate);
				let b2 = turf.bbox(existing);
				
				if (b1[2] < b2[0] || b1[0] > b2[2] || b1[3] < b2[1] || b1[1] > b2[3]) continue;
				
				try {
					let inter = turf.intersect(turf.featureCollection([candidate, existing]));
					
					if (inter && (inter.geometry.type === "Polygon" || inter.geometry.type === "MultiPolygon")) {
						let area = turf.area(inter);
						if (area > 1.0) { //Ignore tiny shards
							collision_existing = existing;
							collision_index = i;
							intersection_geom = inter;
							break;
						}
					}
				} catch (e) {}
			}
			
			if (collision_existing) {
				//Collision found: shatter and re-queue
				solved.splice(collision_index, 1);
				
				//Calculate pieces
				let piece_intersection = intersection_geom;
				piece_intersection.properties = {
					...collision_existing.properties,
					...candidate.properties,
					source_layer: [collision_existing.properties.source_layer, candidate.properties.source_layer].join(",")
				};
				
				let piece_rem_candidate = null;
				try {
					piece_rem_candidate = turf.difference(turf.featureCollection([candidate, intersection_geom]));
				} catch (e) {}
				
				let piece_rem_existing = null;
				try {
					piece_rem_existing = turf.difference(turf.featureCollection([collision_existing, intersection_geom]));
				} catch (e) {}
				
				//Push back to queue
				let pieces = [piece_intersection, piece_rem_candidate, piece_rem_existing];
				
				pieces.forEach((local_piece, local_index) => {
					if (!local_piece) return;
					
					turf.flatten(local_piece).features.forEach((local_f) => {
						if (turf.area(local_f) > 1.0) {
							if (local_index === 0) local_f.properties = piece_intersection.properties;
							else if (local_index === 1) local_f.properties = candidate.properties;
							else if (local_index === 2) local_f.properties = collision_existing.properties;
							
							queue.push(local_f);
						}
					});
				});
			} else {
				//No collision, add to solved
				solved.push(candidate);
			}
		}
		
		//Return statement
		return turf.featureCollection(solved);
	};
}