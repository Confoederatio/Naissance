if (!global.naissance) global.naissance = {};

/**
 * Parses a JSON action for a target Geometry.
 * - Static method of: {@link naissance.Geometry}
 *
 * `arg0_json`: {@link Object}|{@link string}
 * - `.geometry_obj`: {@link Object}|{@link string} - Identifier. The {@link naissance.Geometry} ID to target changes for, if any.
 * <br>
 * - #### Extraneous Commands:
 * - `.clean_keyframes`: {@link Array}<{@link string}> - Arguments: ["symbol"]. Whether to clean keyframes, including the default `main.brush.getBrushSymbol()` (if symbol is enabled), as well as any duplicates.
 * - `.delete_geometry`: {@link boolean}
 * - `.geometry_operation`: {@link Object}
 *   - `.type`: {@link string} - Either 'buffer'/'difference'/'intersect'/'union'/'xor'.
 *   -
 *   - `.feature_id`: {@link string}
 *   - `.geometry_id`: {@link string}
 *   
 *   - Special options ('buffer')
 *     - `.distance`: {@link number} - The number of kilometres to buffer by.
 * - `.merge_geometry`: {@link string} - Merges a geometry with the target geometry ID.
 * - `.move_keyframe`: {@link number}
 *   - `.date`: {@link Object} - The date of the keyframe to move.
 *   - `.ot_date`: {@link Object} - The date to move the keyframe to.
 * - `.remove_keyframe`: {@link number} - The timestamp of the removed keyframe.
 * - `.remove_property`: {@link Object}
 *   - `.date`: {@link number}|{@link Object} - Optional.
 *   - `.key`: {@link string}
 * - `.set_history`: {@link string} - The JSON `.history` string to set for the target Geometry.
 * - `.set_label_symbol`: {@link Object}
 * - `.set_name`: {@link string}
 * - `.set_polygon`: {@link string} - The JSON to set the polygon geometry to.
 * - `.set_properties`: {@link Object}
 *   - `<data_key>`: {@link any}
 * - `.set_tags`: {@link Array}<{@link string}>
 * - `.set_symbol`: {@link Object}
 *   - `._set_label_symbol`: {@link Object} - Private alias for `.set_label_symbol`.
 *   - `<symbol_key>`: {@link any}
 * - `.set_zoom`: {@link Object}
 *   - `.is_start_keyframe=false`: {@link boolean}
 *   - `.max_zoom`: {@link number}|{@link string} - 'delete' if a number.
 *   - `.min_zoom`: {@link number}|{@link string} - 'delete' if a number.
 *   
 * - Variables:
 * - `.add_column`: {@link Object}
 *   - `.key`: {@link string}
 *   - `.values`: {@link Array}<{@link Array}<{@link Object}|{@link number}, {@link any}, ...>> - [date, value] map.
 * - `.add_variable`: {@link Object}
 *   - `.date`: {@link Object}|{@link number}|{@link string} - If string, either 'start'/'end'.
 *   - `.key`: {@link string}
 *   - `.value`: {@link any}
 * - `.remove_column`: {@link string}
 * - `.remove_variable`: {@link Object}
 *   - `.date`: {@link Object}|{@link number}|{@link string} - If string, either 'start'/'end'.
 *   - `.key`: {@link string}
 *
 * @param {Object|string} arg0_json
 */
naissance.Geometry.parseAction = async function (arg0_json) { //[WIP] - Add variable actions
	//Convert from parameters
	let json = (typeof arg0_json === "string") ? JSON.parse(arg0_json) : arg0_json;
	
	//Declare local instance variables
	let geometry_obj = (typeof json.geometry_obj === "string") ? 
		naissance.Geometry.instances[json.geometry_obj] : json.geometry_obj;
	
	//Parse commands for geometry_obj
	if (geometry_obj) {
		//Specialised Geometry handler
		if (geometry_obj.class_name)
			if (["GeometryLine", "GeometryPoint", "GeometryPolygon"].includes(geometry_obj.class_name))
				await naissance[geometry_obj.class_name].parseAction(json);
		
		//Abstraction handlers
		{
			//set_symbol._set_label_symbol
			if (json.set_symbol && json.set_symbol._set_label_symbol)
				if (!json.set_label_symbol) {
					json.set_label_symbol = json.set_symbol._set_label_symbol;
					delete json.set_symbol._set_label_symbol;
				}
		}
		
		//add_column
		if (typeof json.add_column === "object") {
			if (!json.add_column.values) {
				let first_keyframe = geometry_obj.history.getFirstKeyframe();
				json.add_column.values = [[first_keyframe.timestamp, null]];
			}
			
			//Iterate over all .values[n][0] dates; add keyframes at locations
			for (let i = 0; i < json.add_column.values.length; i++)
				geometry_obj.addKeyframe(json.add_column.values[i][0], undefined, undefined, {
					variables: { [json.add_column.key]: json.add_column.values[i][1] }
				});
		}
		
		//add_variable
		if (typeof json.add_variable === "object") {
			let timestamp;
				if (json.add_variable.date === "end") {
					timestamp = geometry_obj.history.getLastKeyframe().timestamp;
				} else if (json.add_variable.date === "start") {
					timestamp = geometry_obj.history.getFirstKeyframe().timestamp;
				} else {
					timestamp = Date.getTimestamp((json.add_variable.date !== undefined) ?
						json.add_variable.date : main.date);
				}
			
			geometry_obj.addKeyframe(timestamp, undefined, undefined, {
				variables: { [json.add_variable.key]: json.add_variable.value }
			});
		}
		
		//clean_keyframes
		if (json.clean_keyframes) {
			let current_brush_symbol = main.brush.getBrushSymbol();
			
			//Symbol cleaning
			if (json.clean_keyframes.includes("symbol")) { //[WIP] - There should be a better heuristic for removing redundancy
				let first_keyframe = geometry_obj.history.getFirstKeyframe();
				
				if (first_keyframe) {
					let local_keyframe = JSON.parse(JSON.stringify(first_keyframe));
					let local_symbol = local_keyframe.value[1];
					
					//Iterate over current_brush_symbol and clean duplicates
					Object.iterate(current_brush_symbol, (local_key, local_value) => {
						if (local_symbol && local_symbol[local_key] === local_value)
							delete local_symbol[local_key];
					});
					geometry_obj.history.replaceKeyframe(first_keyframe, local_keyframe, { refresh_localisation: false });
				}
			}
			
			geometry_obj.history.cleanKeyframes();
			geometry_obj.history.getKeyframe(); //Refresh localisation
			//geometry_obj.history.draw(geometry_obj.keyframes_ui);
		}
		
		//delete_geometry
		if (json.delete_geometry === true)
			geometry_obj.remove();
		
		//geometry_operation
		if (json.geometry_operation) {
			let maptalks_geometry = naissance.Geometry.operate.call(geometry_obj, 
				json.geometry_operation.type, 
				(json.geometry_operation.feature_id) ? json.geometry_operation.feature_id : json.geometry_operation.geometry_id,
				json.geometry_operation.options);
			maptalks_geometry = (maptalks_geometry === null) ? null : maptalks_geometry.toJSON();
			geometry_obj.history.addKeyframe(main.date, maptalks_geometry);
		}
		
		//merge_geometry
		if (json.merge_geometry) {
			let ot_geometry = naissance.Geometry.instances[json.merge_geometry];
			
			if (ot_geometry && geometry_obj.class_name === ot_geometry.class_name) {
				let from_keys = Object.keys(ot_geometry.history.keyframes).map(Number);
				let to_keys = Object.keys(geometry_obj.history.keyframes).map(Number);
				let union_timestamps = [...new Set([...from_keys, ...to_keys])]
					.sort((a, b) => a - b);
				
				//Iterate over all union_timestamps
				for (let i = 0; i < union_timestamps.length; i++) {
					//Apply union operations for geometry
					let from_value = ot_geometry.history.getKeyframe({ date: union_timestamps[i] }).value;
					let to_value = geometry_obj.history.getKeyframe({ date: union_timestamps[i] }).value;
					
					if (from_value?.[0] && to_value?.[0])
						if (geometry_obj.class_name === "GeometryPolygon") {
							DALS.Timeline.parseAction("add_to_polygon", [{
								type: "GeometryPolygon",
								geometry_obj: geometry_obj.id,
								add_to_polygon: {
									geometry: from_value[0],
									date: union_timestamps[i]
								}
							}], true);
						} else if (geometry_obj.class_name === "GeometryLine") {
							DALS.Timeline.parseAction("add_to_line", [{
								type: "GeometryLine",
								geometry_obj: geometry_obj.id,
								add_to_line: {
									geometry: from_value[0],
									date: union_timestamps[i]
								}
							}], true);
						} else if (geometry_obj.class_name === "GeometryPoint") {
							DALS.Timeline.parseAction("add_to_point", [{
								type: "GeometryPoint",
								geometry_obj: geometry_obj.id,
								add_to_point: {
									geometry: from_value[0],
									date: union_timestamps[i]
								}
							}], true);
						}
					
					//Transfer non-geometric history data (metadata/attributes)
					if (from_value?.length > 1) {
						let extra_values = from_value.slice(1);
						geometry_obj.history.addKeyframe(union_timestamps[i], undefined, ...extra_values);
					}
				}
			}
		}
		
		//move_keyframe
		if (json.move_keyframe) {
			geometry_obj.history.moveKeyframe(json.move_keyframe.date, json.move_keyframe.ot_date);
			geometry_obj.history.draw(geometry_obj.keyframes_ui);
		}
		
		//remove_column
		if (typeof json.remove_variable === "string") {
			Object.iterate(geometry_obj.history, (local_key, local_value) => {
				if (local_value?.value?.[2]?.variables)
					delete local_value.value[2].variables[json.remove_variable];
			});
			geometry_obj.history.cleanKeyframes(); //Clean keyframes just in-case
		}
		
		//remove_keyframe
		if (json.remove_keyframe) {
			geometry_obj.removeKeyframe(json.remove_keyframe);
			geometry_obj.history.draw(geometry_obj.keyframes_ui);
		}
		
		//remove_property
		if (json.remove_property) {
			if (json.remove_property.date) {
				let keyframe_obj = geometry_obj.history.keyframes[Date.getTimestamp(json.remove_property.date)];
					
				if (keyframe_obj)
					delete keyframe_obj.value?.[2]?.[json.remove_property.key];
			} else {
				Object.iterate(geometry_obj.history.keyframes, (local_key, local_value) => {
					delete local_value.value?.[2]?.[json.remove_property.key];
				});
			}
			
			geometry_obj.history.cleanKeyframes(); //Clean keyframes just in-case
		}
		
		//remove_variable
		if (typeof json.remove_variable === "object") {
			let timestamp;
				if (json.remove_variable.date === "end") {
					timestamp = geometry_obj.history.getLastKeyframe().timestamp;
				} else if (json.remove_variable.date === "start") {
					timestamp = geometry_obj.history.getFirstKeyframe().timestamp;
				} else {
					timestamp = Date.getTimestamp((json.remove_variable.date !== undefined) ?
						json.remove_variable.date : main.date);
				}
			
			let keyframe = geometry_obj.history.keyframes[timestamp];
			
			if (keyframe?.value?.[2]?.variables) {
				delete keyframe.value[2].variables[json.remove_variable.key];
				
				if (Object.keys(keyframe.value[2].variables).length === 0)
					delete keyframe.value[2].variables;
				if (
					(keyframe.value[0] === "undefined" || !keyframe.value[0]) &&
					(!keyframe.value[1]) &&
					(Object.keys(keyframe.value[2]).length === 0)
				)
					geometry_obj.removeKeyframe(timestamp);
			}
		}
		
		//set_geometry
		if (json.set_geometry) {
			geometry_obj.addKeyframe(main.date, json.set_geometry);
		} else if (json.set_geometry === null) {
			geometry_obj.addKeyframe(main.date, null);
		}
		
		//set_history
		if (json.set_history)
			geometry_obj.history.fromJSON(json.set_history);
		
		//set_label_symbol
		if (json.set_label_symbol) {
			geometry_obj.addKeyframe(main.date, undefined, undefined, {
				label_symbol: {
					...geometry_obj.current_keyframe?.value[2]?.label_symbol,
					...json.set_label_symbol
				}
			});
		} else if (json.set_label_symbol === null) {
			geometry_obj.addKeyframe(main.date, undefined, undefined, { label_symbol: null });
		}
		
		//set_name
		if (json.set_name) {
			let date = main.date;
			if (typeof json.set_name === "object" && json.set_name.date !== undefined)
				date = json.set_name.date;
			let old_name = geometry_obj.name;
			if (old_name) old_name = old_name.trim();
			let new_name;
			if (typeof json.set_name === "object") {
				new_name = json.set_name.name;
			} else if (typeof json.set_name === "string") {
				new_name = json.set_name;
			}
			if (new_name) new_name = new_name.trim();
			
			if (new_name !== old_name) {
				geometry_obj.history.addKeyframe(date, undefined, undefined, { name: new_name });
				
				//Refresh .instance_window .name if visible
				if (geometry_obj.instance_window) {
					let current_keyframe = geometry_obj.history.getKeyframe();
					
					if (current_keyframe.value[2] && current_keyframe.value[2].name)
						geometry_obj.instance_window.setName(current_keyframe.value[2].name);
					geometry_obj.draw();
				}
			}
		}
		
		//set_properties
		if (json.set_properties) {
			if (json.set_properties.date) {
				geometry_obj.addKeyframe(json.set_properties.date, undefined, undefined, json.set_properties.value);
			} else {
				geometry_obj.addKeyframe(main.date, undefined, undefined, json.set_properties);
			}
		} else if (json.set_properties === null) {
			geometry_obj.addKeyframe(main.date, undefined, undefined, null);
		}
		
		//set_symbol
		if (json.set_symbol) {
			geometry_obj.addKeyframe(main.date, undefined, json.set_symbol);
		} else if (json.set_symbol === null) {
			geometry_obj.addKeyframe(main.date, undefined, null);
		}
		
		//set_tags
		if (json.set_tags)
			geometry_obj.metadata.tags = Array.toArray(json.set_tags);
		
		//set_zoom
		if (json.set_zoom) {
			let zoom_date = (json.set_zoom.is_start_keyframe) ? 
				geometry_obj.history.getFirstKeyframe().timestamp : main.date;
			let zoom_props = {};
			
			if (json.set_zoom.max_zoom !== undefined)
				(json.set_zoom.max_zoom === "delete") ? naissance.Geometry.parseAction({
					geometry_obj: geometry_obj,
					remove_property: { key: "max_zoom" },
				}) : (zoom_props.max_zoom = json.set_zoom.max_zoom);
			
			if (json.set_zoom.min_zoom !== undefined)
				(json.set_zoom.min_zoom === "delete") ? naissance.Geometry.parseAction({
						geometry_obj: geometry_obj,
						remove_property: { key: "min_zoom" },
					}) : (zoom_props.min_zoom = json.set_zoom.min_zoom);
			
			if (Object.keys(zoom_props).length > 0)
				geometry_obj.addKeyframe(zoom_date, undefined, undefined, zoom_props);
		}
	}
};