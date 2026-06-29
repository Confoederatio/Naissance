if (!global.naissance) global.naissance = {};

/**
 * Parses a JSON action for a target GeometryPoint.
 * - Static method of: {@link naissance.GeometryPoint}
 *
 * `arg0_json`: {@link Object}|{@link string}
 * - `.geometry_obj`: {@link Object}|{@link string} - Identifier. The {@link naissance.Geometry} ID to target changes
 * for, if any.
 * <br>
 * - #### Extraneous Commands:
 * - `.create_point`: {@link Object}
 *   - `.coordinates`: {@link Array}<{@link maptalks.Coordinate}>
 *   - `.id`: {@link string}
 *   - `.is_search`: {@link boolean}
 *   - `.name`: {@link string}
 * - #### Internal Commands:
 *   - `.add_to_point`: {@link Object}
 *     - `.date=main.date`: {@link Object}
 *     - `.geometry`: {@link string}
 *   - `.set_coordinates`: {@link maptalks.Coordinate}
 */
naissance.GeometryPoint.parseAction = async function (arg0_json) {
	//Convert from parameters
	let json = (typeof arg0_json === "string") ? JSON.parse(arg0_json) : arg0_json;
	
	//Declare local instance variables
	let point_obj = (typeof json.geometry_obj === "string") ?
		naissance.Geometry.instances[json.geometry_obj] : json.geometry_obj;
	
	//Parse extraneous commands
	//create_point
	if (json.create_point)
		if (json.create_point.id) {
			let new_point = new naissance.GeometryPoint();
				new_point.setID(json.create_point.id);
			if (json.create_point.coordinates !== undefined) {
				let maptalks_marker_obj = new maptalks.Marker();
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
	
	//Parse commands for point_obj
	if (point_obj && point_obj instanceof naissance.GeometryPoint) {
		//.add_to_point
		if (json.add_to_point !== undefined) {
			let date = (json.add_to_point.date) ? json.add_to_point.date : main.date;
			let geometries = point_obj.getGeometries();
			let ot_geometry = naissance.Geometry.instances[json.add_to_point.geometry];
			let ot_geometries = ot_geometry.getGeometries();
			
			//Union with existing point if defined, if undefined replace geometry
			if (ot_geometries) {
				let maptalks_point_obj = new maptalks.MultiLineString();
				
				if (geometries) {
					maptalks_point_obj.setGeometries(geometries.concat(ot_geometries));
				} else {
					maptalks_point_obj.setGeometries(ot_geometries);
				}
				point_obj.addKeyframe(date, maptalks_point_obj.toJSON());
			}
		}
		
		//.set_coordinates
		if (json.set_coordinates) {
			let maptalks_marker_obj = (point_obj.geometry) ? point_obj.geometry : new maptalks.Marker();
			maptalks_marker_obj.setCoordinates(json.set_coordinates);
			point_obj.addKeyframe(main.date, maptalks_marker_obj.toJSON());
		}
	}
};