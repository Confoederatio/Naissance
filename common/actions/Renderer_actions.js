/**
 * - #### Extraneous Commands:
 * - `.move_keyframe`: {@link Object}
 *   - `.from_timestamp`: {@link number}|{@link Object}
 *   - `.to_timestamp`: {@link number}|{@link Object}
 * - `.set_map_spatial_reference`: {@link Object}
 * 
 * @type {Object}
 */
config.actions.renderer = {
	move_keyframe: {
		name: "Move Keyframe",
		scope: ["Renderer"],
		
		special_function: async function (json) {
			//Declare local instance variables
			let from_timestamp = Date.getTimestamp(json.move_keyframe.from_timestamp);
			let to_timestamp = Date.getTimestamp(json.move_keyframe.to_timestamp);
			
			//Iterate over all naissance.Geometry.instances and move any keyframes found at from_timestamp to to_timestamp
			Object.iterate(naissance.Geometry.instances, (local_key, local_geometry) =>
				local_geometry.history.moveKeyframe(from_timestamp, to_timestamp));
		}
	},
	set_map_spatial_reference: {
		name: "Set Map Spatial Reference",
		scope: ["Renderer"],
		
		special_function: async function (json) {
			//Declare local instance variables
			let spatial_reference = json.set_map_spatial_reference;
			
			//Coerce spatial_reference.projection if string
			if (typeof spatial_reference.projection === "string") {
				let proj4js_transform = proj4("WGS84", spatial_reference.projection);
				
				spatial_reference.projection = {
					code: "proj4-custom",
					project: (c) => {
						let pc;
						try { pc = proj4js_transform.forward(c.toArray()); } catch (e) {}
						
						//If projection returns invalid or NaN, return neutral coords
						if (!pc || isNaN(pc[0]) || isNaN(pc[1]))
							pc = (window.last_coord) ? window.last_coord : [0, 0];
						
						//Return statement
						window.last_coord = pc;
						return new maptalks.Coordinate(pc);
					},
					unproject: (pc) => {
						if (!Array.isArray(Array.toArray(pc)))
							return new maptalks.Coordinate([0, 0]);
						let c;
						try { c = proj4js_transform.inverse(pc.toArray()); } catch (e) {}
						
						if (!c || isNaN(c[0]) || isNaN(c[1]))
							c = (window.last_coord) ? window.last_coord : [0, 0];
						
						//Return statement
						window.last_coord = c;
						return new maptalks.Coordinate(c);
					},
					measure: "EPSG:4326"
				};
			}
			
			//Set spatial reference
			map.setSpatialReference(json.set_map_spatial_reference);
			
			//Refresh naissance.FeatureTileLayers this.draw() call
			Object.iterate(naissance.Feature.instances, (local_key, local_feature) =>
				local_feature.draw());
		}
	}
};