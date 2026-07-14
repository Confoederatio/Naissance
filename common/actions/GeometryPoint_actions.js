/**
 * - #### Extraneous Commands:
 * - `.create_point`: {@link Object}
 *   - `.coordinates`: {@link Array}<{@link maptalks.Coordinate}>
 *   - `.id`: {@link string}
 *   - `.is_search`: {@link boolean}
 *   - `.name`: {@link string}
 * - #### Internal Commands:
 *   - `.add_coordinates`: {@link Array}<{@link Array}<{@link number}, {@link number}>>
 *   - `.add_to_point`: {@link Object}
 *     - `.date=main.date`: {@link Object}
 *     - `.geometry`: {@link string}
 *   - `.delete_coordinates`: {@link number} - The index of the coordinates to delete.
 *   - `.move_coordinates`: {@link Object}
 *     - `.coordinates`: {@link Array}<{@link number}, {@link number}>
 *     - `.index=0`: {@link number}
 *   - `.set_coordinates`: {@link maptalks.Coordinate}
 * 
 * @type {Object}
 */
config.actions.geometry_point = {
	create_point: {
		name: "Create Point",
		scope: ["GeometryPoint"],
		
		special_function: async function (json) {
			if (json.create_point.id) {
				let new_point = new naissance.GeometryPoint();
				new_point.setID(json.create_point.id);
				if (json.create_point.coordinates !== undefined) {
					let maptalks_marker_obj = new maptalks.MultiPoint();
					maptalks_marker_obj.setCoordinates(json.create_point.coordinates);
					new_point.addKeyframe(main.date, maptalks_marker_obj.toJSON());
				}
				if (json.create_point.name) {
					new_point.fire_action_silently = true;
					new_point.name = json.create_point.name;
					delete new_point.fire_action_silently;
				}
				
				//Point handling; .is_search
				if (!json.create_point.is_search) {
					UI_Leftbar.refresh();
				} else {
					UI_LeftbarHierarchy.do_not_refresh = true;
				}
			}
		}
	},
	
	add_coordinates: {
		name: "Add Coordinates",
		scope: ["GeometryPoint"],
		
		special_function: async function (json) {
			//Declare local instance variables
			let point_obj = json.naissance_obj;
			
			try {
				json.add_coordinates = Array.toArray(json.add_coordinates);
				
				let multipoint_coords = maptalks.Coordinate.toNumberArrays(point_obj.geometry.getCoordinates());
				multipoint_coords = multipoint_coords.concat(json.add_coordinates);
				point_obj.geometry.setCoordinates(multipoint_coords);
				point_obj.addKeyframe(main.date, point_obj.geometry.toJSON());
			} catch (e) {}
		}
	},
	add_to_point: {
		name: "Add to Point",
		scope: ["GeometryPoint"],
		
		special_function: async function (json) {
			//Declare local instance variables
			let point_obj = json.naissance_obj;
			
			let date = (json.add_to_point.date) ? json.add_to_point.date : main.date;
			let geometries = point_obj.getGeometries();
			let ot_geometry = naissance.Geometry.instances[json.add_to_point.geometry];
			let ot_geometries = ot_geometry.getGeometries();
			
			//Union with existing point if defined, if undefined replace geometry
			if (ot_geometries) {
				let maptalks_point_obj = new maptalks.MultiPoint();
				
				if (geometries) {
					maptalks_point_obj.setGeometries(geometries.concat(ot_geometries));
				} else {
					maptalks_point_obj.setGeometries(ot_geometries);
				}
				point_obj.addKeyframe(date, maptalks_point_obj.toJSON());
			}
		}
	},
	delete_coordinates: {
		name: "Delete Coordinates",
		scope: ["GeometryPoint"],
		
		special_function: async function (json) {
			//Declare local instance variables
			let point_obj = json.naissance_obj;
			
			//Delete coordinates only if geometry exists
			if (point_obj.geometry) {
				let coords = point_obj.geometry.getCoordinates();
				let delete_indexes = Array.toArray(json.delete_coordinates);
				
				//Iterate over coords and remove them if included in delete_indexes
				for (let i = coords.length - 1; i >= 0; i--)
					if (delete_indexes.includes(i)) coords.splice(i, 1);
				if (coords.length === 0) {
					point_obj.remove();
				} else {
					point_obj.geometry.setCoordinates(coords);
					point_obj.addKeyframe(main.date, point_obj.geometry.toJSON());
				}
			}
		}
	},
	move_coordinates: {
		name: "Move Coordinates",
		scope: ["GeometryPoint"],
		
		special_function: async function (json) {
			//Declare local instance variables
			let point_obj = json.naissance_obj;
			
			let multipoint_obj = point_obj.geometry;
			let multipoint_coords = maptalks.Coordinate.toNumberArrays(multipoint_obj.getCoordinates());
			
			if (multipoint_coords[json.move_coordinates.index] !== undefined)
				multipoint_coords[json.move_coordinates.index] = json.move_coordinates.coordinates;
			multipoint_obj.setCoordinates(multipoint_coords);
			point_obj.addKeyframe(main.date, multipoint_obj.toJSON());
		}
	},
	set_coordinates: {
		name: "Set Coordinates",
		scope: ["GeometryPoint"],
		
		special_function: async function (json) {
			//Declare local instance variables
			let point_obj = json.naissance_obj;
			
			let maptalks_marker_obj = (point_obj.geometry) ? point_obj.geometry : new maptalks.MultiPoint();
			maptalks_marker_obj.setCoordinates([json.set_coordinates]);
			point_obj.addKeyframe(main.date, maptalks_marker_obj.toJSON());
		}
	}
};