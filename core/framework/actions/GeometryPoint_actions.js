/**
 * Parses a JSON action for a target GeometryPoint.
 * - Static method of: {@link naissance.GeometryPoint}
 *
 * `arg0_json`: {@link Object|string}
 * - `.geometry_id`: {@link string} - Identifier. The {@link naissance.Geometry} ID to target changes
 * for, if any.
 * <br>
 * - #### Extraneous Commands:
 * - `.create_point`: {@link Object}
 *   - `.coordinates`: {@link Array}<{@link maptalks.Coordinate}>
 *   - `.do_not_refresh`: {@link boolean}
 *   - `.id`: {@link string}
 *   - `.name`: {@link string}
 * - #### Internal Commands:
 *   - `.set_coordinates`: {@link maptalks.Coordinate}
 */
naissance.GeometryPoint.parseAction = function (arg0_json) {
	//Convert from parameters
	let json = (typeof arg0_json === "string") ? JSON.parse(arg0_json) : arg0_json;
	
	//Declare local instance variables
	let point_obj = naissance.Geometry.instances.filter((v) => v.id === json.geometry_id)[0];
	
	//Parse extraneous commands
	//create_point
	if (json.create_point)
		if (json.create_point.id) {
			let new_point = new naissance.GeometryPoint();
			new_point.id = json.create_point.id;
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
			if (main.brush.selected_feature)
				if (!json.create_point.do_not_refresh)
					UI_LeftbarHierarchy.refresh();
		}
	
	//Parse commands for point_obj
	if (point_obj && point_obj instanceof naissance.GeometryPoint) {
		//.set_coordinates
		if (json.set_coordinates) {
			let maptalks_marker_obj = (this.geometry) ? this.geometry : new maptalks.Marker();
			maptalks_marker_obj.setCoordinates(json.set_coordinates);
			point_obj.addKeyframe(main.date, maptalks_marker_obj.toJSON());
		}
	}
};