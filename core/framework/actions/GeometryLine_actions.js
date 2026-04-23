/**
 * Parses a JSON action for a target GeometryLine.
 * - Static method of: {@link naissance.GeometryLine}
 *
 * `arg0_json`: {@link Object|string}
 * - `.geometry_id`: {@link string} - Identifier. The {@link naissance.Geometry} ID to target changes
 * for, if any.
 * <br>
 * - #### Extraneous Commands:
 * - `.create_line`: {@link Object}
 *   - `.do_not_refresh`: {@link boolean}
 *   - `.id`: {@link string}
 *   - `.name`: {@link string}
 * - #### Internal Commands:
 *   - `.add_to_line`: {@link Object}
 *     - `.geometry`: {@link string}
 *   - `.remove_from_line`: {@link number} - The index of the multiline to remove.
 */
naissance.GeometryLine.parseAction = function (arg0_json) {
	//Convert from parameters
	let json = (typeof arg0_json === "string") ? JSON.parse(arg0_json) : arg0_json;
	
	//Declare local instance variables
	let line_obj = naissance.Geometry.instances.filter((v) => v.id === json.geometry_id)[0];
	
	//Parse extraneous commands
	//create_line
	if (json.create_line)
		if (json.create_line.id) {
			let new_line = new naissance.GeometryLine();
			new_line.id = json.create_line.id;
			if (json.create_line.name) {
				new_line.fire_action_silently = true;
				new_line.name = json.create_line.name;
				delete new_line.fire_action_silently;
			}
			if (main.brush.selected_feature)
				if (!json.create_line.do_not_refresh)
					UI_LeftbarHierarchy.refresh();
		}
	
	//Parse commands for line_obj
	if (line_obj && line_obj instanceof naissance.GeometryLine) {
		//add_to_line
		if (json.add_to_line !== undefined) {
			let geometry = line_obj.geometry;
			let ot_geometry = maptalks.Geometry.fromJSON(json.add_to_line.geometry);
			
			//Union with existing line if defined, if undefined replace geometry
			if (line_obj.geometry) {
				let all_geometries = geometry.getGeometries();
				let all_ot_geometries = ot_geometry.getGeometries();
				let maptalks_line_obj = new maptalks.MultiLineString();
				maptalks_line_obj.setGeometries(all_geometries.concat(all_ot_geometries));
				
				line_obj.addKeyframe(main.date, maptalks_line_obj.toJSON());
			} else {
				line_obj.addKeyframe(main.date, ot_geometry.toJSON());
			}
		}
		
		//remove_from_line
		if (json.remove_from_line !== undefined)
			if (typeof json.remove_from_line === "number") {
				//Attempt to splice it out of geometries
				let all_geometries = line_obj.geometry.getGeometries();
				if (all_geometries[json.remove_from_line] !== undefined)
					all_geometries.splice(json.remove_from_line, 1);
				
				//Set new maptalks_line_obj
				let maptalks_line_obj = new maptalks.MultiLineString();
				maptalks_line_obj.setGeometries(all_geometries);
				
				line_obj.addKeyframe(main.date, maptalks_line_obj.toJSON());
			}
	}
};