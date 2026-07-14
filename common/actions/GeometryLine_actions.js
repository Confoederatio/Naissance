/**
 * - #### Extraneous Commands:
 * - `.create_line`: {@link Object}
 *   - `.do_not_refresh`: {@link boolean}
 *   - `.id`: {@link string}
 *   - `.name`: {@link string}
 * - #### Internal Commands:
 *   - `.add_to_line`: {@link Object}
 *     - `.date=main.date`: {@link Object}
 *     - `.geometry`: {@link string}
 *   - `.remove_from_line`: {@link number} - The index of the multiline to remove.
 *   
 * @type {Object}
 */
config.actions.geometry_line = {
	create_line: {
		name: "Create Line",
		scope: ["GeometryLine"],
		
		special_function: async function (json) {
			if (json.create_line.id) {
				let new_line = new naissance.GeometryLine();
				new_line.setID(json.create_line.id);
				if (json.create_line.name) {
					new_line.fire_action_silently = true;
					new_line.name = json.create_line.name;
					delete new_line.fire_action_silently;
				}
				if (main.brush.selected_feature)
					if (!json.create_line.do_not_refresh)
						UI_Leftbar.refresh();
			}
		}
	},
	
	add_to_line: {
		name: "Add to Line",
		scope: ["GeometryLine"],
		
		special_function: async function (json) {
			//Declare local instance variables
			let line_obj = json.naissance_obj;
			
			let date = (json.add_to_line.date) ? json.add_to_line.date : main.date;
			let geometry = line_obj.geometry;
			let ot_geometry = maptalks.Geometry.fromJSON(json.add_to_line.geometry);
			
			//Union with existing line if defined, if undefined replace geometry
			if (line_obj.geometry) {
				let all_geometries = geometry.getGeometries();
				let all_ot_geometries = ot_geometry.getGeometries();
				let maptalks_line_obj = new maptalks.MultiLineString();
				maptalks_line_obj.setGeometries(all_geometries.concat(all_ot_geometries));
				
				line_obj.addKeyframe(date, maptalks_line_obj.toJSON());
			} else {
				line_obj.addKeyframe(date, ot_geometry.toJSON());
			}
		}
	},
	remove_from_line: {
		name: "Remove from Line",
		scope: ["GeometryLine"],
		
		special_function: async function (json) {
			//Declare local instance variables
			let line_obj = json.naissance_obj;
			
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