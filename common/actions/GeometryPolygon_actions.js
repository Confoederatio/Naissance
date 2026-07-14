/**
 * - #### Internal Commands:
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
 */
config.actions.geometry_polygon = {
	create_polygon: {
		name: "Create Polygon",
		scope: ["GeometryPolygon"],
		
		special_function: async function (json) {
			//Create new polygon
			if (json.create_polygon.id) {
				let new_polygon = new naissance.GeometryPolygon();
				new_polygon.setID(json.create_polygon.id);
				if (json.create_polygon.name) {
					new_polygon.fire_action_silently = true;
					new_polygon.name = json.create_polygon.name;
					delete new_polygon.fire_action_silently;
				}
				if (main.brush.selected_feature)
					if (!json.create_polygon.do_not_refresh)
						UI_Leftbar.refresh();
			}
		}
	},
	
	add_to_polygon: {
		name: "Add to Polygon",
		scope: ["GeometryPolygon"],
		
		special_function: async function (json) {
			//Declare local instance variables
			let polygon_obj = json.naissance_obj;
			
			let date = (json.add_to_polygon.date) ? json.add_to_polygon.date : main.date;
			let geometry = (json.add_to_polygon.date) ?
				polygon_obj.getGeometryKeyframeAtDate(date) : polygon_obj.geometry;
			let ot_geometry = maptalks.Geometry.fromJSON(json.add_to_polygon.geometry);
			
			//Date range handling
			if (json.add_to_polygon.date_range) {
				polygon_obj.history.callFunctionInDateRange(json.add_to_polygon.date_range, (local_keyframe) => {
					DALS.Timeline.parseAction("add_to_polygon", [{
						geometry_obj: polygon_obj.id,
						add_to_polygon: {
							date: local_keyframe,
							geometry: json.add_to_polygon.geometry
						}
					}], true);
				});
			} else {
				//Union with existing geometry if defined, if undefined replace geometry
				try {
					geometry = (geometry) ? Geospatiale.convertMaptalksToTurf(geometry) : null;
					ot_geometry = (ot_geometry) ? Geospatiale.convertMaptalksToTurf(ot_geometry) : null;
					
					if (geometry && ot_geometry) {
						polygon_obj.addKeyframe(date, Geospatiale.convertTurfToMaptalks(
							turf.union(turf.featureCollection([geometry, ot_geometry]))
						).toJSON());
					} else if (geometry && !ot_geometry) {
						polygon_obj.addKeyframe(date, Geospatiale.convertTurfToMaptalks(geometry).toJSON());
					} else if (!geometry && ot_geometry) {
						polygon_obj.addKeyframe(date, Geospatiale.convertTurfToMaptalks(ot_geometry).toJSON());
					}
				} catch (e) { console.error(e); }
			}
		}
	},
	geometry_operation: {
		name: "Geometry Operation",
		feature_name: "Operate on Geometries",
		scope: ["GeometryPolygon"],
		
		draw_function: function () {
			//Declare local instance variables
			let operation_names = {
				buffer: { name: "Buffer" },
				difference: { name: "Difference" },
				intersect: { name: "Intersect" },
				union: { name: "Union" },
				xor: { name: "XOR" }
			};
			let operation_target = () => (this.ui.geometry_operation_target || "geometry");
			let operation_type = () => (this.ui.geometry_operation_type || "union");
			
			//Return statement
			return {
				geometry_operation_target: veSelect({
					feature: { name: "Feature" },
					geometry: { name: "Geometry" }
				}, {
					name: "Merge With Entity Type",
					selected: operation_target(),
					onuserchange: (v) => this.ui.geometry_operation_target = v
				}),
				geometry_operation_geometry: new UI_GeometryDatalist(this.ui.geometry_operation_geometry, {
					name: "Geometry",
					filter_types: ["GeometryPolygon"],
					limit: () => {
						let target = operation_target();
						if (target === "geometry") return true;
						return false;
					},
					onuserchange: (v) => this.ui.geometry_operation_geometry = v
				}),
				geometry_operation_feature: new UI_FeatureDatalist(this.ui.geometry_operation_feature, {
					name: "Feature",
					filter_types: ["FeatureGroup", "FeatureLayer"],
					limit: () => {
						let target = operation_target();
						if (target === "feature") return true;
						return false;
					},
					onuserchange: (v) => this.ui.geometry_operation_feature = v
				}),
				operation_type: veSelect(operation_names, {
					name: "Operation Type",
					selected: operation_type(),
					onuserchange: (v) => this.ui.geometry_operation_type = v
				}),
				
				buffer_distance: veNumber(this.ui.geometry_operation_buffer_distance, {
					name: "Buffer Distance",
					limit: () => operation_type() === "buffer",
					onuserchange: (v) => this.ui.geometry_operation_buffer_distance = v
				}),
				
				confirm: veButton(() => {
					//Declare local instance variables
					let geometry_operation_type = operation_type();
					let options = {};
					let target = operation_target();
					let target_geometry_id = (target === "geometry") ? this.ui.geometry_operation_geometry : undefined;
					let target_feature_id = (target === "feature") ? this.ui.geometry_operation_feature : undefined;
					
					//Buffer handling
					let buffer_distance = Math.returnSafeNumber(this.ui.geometry_operation_buffer_distance, 0);
					if (geometry_operation_type === "buffer") {
						if (buffer_distance === 0) {
							veToast(`<icon>warning</icon> Buffer distance must not be 0.`);
							return;
						}
						
						options.distance = buffer_distance;
					}
					
					//Run feature operation
					DALS.Timeline.parseAction("geometry_operation", {
						[this.getDALSKey()]: this.id,
						geometry_operation: {
							type: geometry_operation_type,
							feature_id: target_feature_id,
							geometry_id: target_geometry_id,
							options: options
						}
					});
					
					let operation_name = operation_names[geometry_operation_type].name;
					let ot_name;
					if (target_geometry_id) ot_name = naissance.Geometry.instances[target_geometry_id]?.name;
					if (target_feature_id) ot_name = naissance.Feature.instances[target_feature_id]?.name;
					
					if (this instanceof naissance.Geometry) {
						veToast(`Performed ${operation_name} on ${this.name} using ${ot_name}.`);
					} else {
						let all_geometries = this.getAllGeometries();
						
						veToast(`Performed ${operation_name} on ${String.formatNumber(all_geometries.length)} geometries using ${ot_name}.`);
					}
				}, { name: "Confirm" })
			};
		},
		special_function: async function (json) {
			//Declare local instance variables
			let geometry_obj = json.naissance_obj;
			
			let maptalks_geometry = naissance.Geometry.operate.call(geometry_obj,
				json.geometry_operation.type,
				(json.geometry_operation.feature_id) ? json.geometry_operation.feature_id : json.geometry_operation.geometry_id,
				json.geometry_operation.options);
			maptalks_geometry = (maptalks_geometry === null) ? null : maptalks_geometry.toJSON();
			geometry_obj.history.addKeyframe(main.date, maptalks_geometry);
		}
	},
	remove_from_polygon: {
		name: "Remove from Polygon",
		scope: ["GeometryPolygon"],
		
		special_function: async function (json) {
			//Declare local instance variables
			let polygon_obj = json.naissance_obj;
			
			if (json.remove_from_polygon) {
				let date = (json.remove_from_polygon.date) ? json.remove_from_polygon.date : main.date;
				let geometry = (json.remove_from_polygon.date) ?
					polygon_obj.getGeometryKeyframeAtDate(date) : polygon_obj.geometry;
				let ot_geometry = maptalks.Geometry.fromJSON(json.remove_from_polygon.geometry);
				
				//Difference with existing geometry, if return value is null replace geometry
				if (json.remove_from_polygon.date_range) {
					polygon_obj.history.callFunctionInDateRange(json.remove_from_polygon.date_range, (local_keyframe) => {
						DALS.Timeline.parseAction("remove_from_polygon", [{
							geometry_obj: polygon_obj.id,
							remove_from_polygon: {
								date: local_keyframe,
								geometry: json.remove_from_polygon.geometry
							}
						}], true);
					});
				} else {
					//Difference with existing geometry; if it covers the entire geometry set to null to hide
					if (geometry) {
						let turf_difference;
						try {
							turf_difference = turf.difference(turf.featureCollection([
								Geospatiale.convertMaptalksToTurf(geometry),
								Geospatiale.convertMaptalksToTurf(ot_geometry)
							]));
						} catch (e) {}
						polygon_obj.addKeyframe(date, (turf_difference) ?
							Geospatiale.convertTurfToMaptalks(turf_difference).toJSON() : null);
					}
				}
			}
		}
	},
	set_polygon: {
		name: "Set Polygon",
		scope: ["GeometryPolygon"],
		
		special_function: async function (json) {
			//Declare local instance variables
			let polygon_obj = json.naissance_obj;
			
			if (json.set_polygon && json.set_polygon.geometry) {
				let new_geometry = json.set_polygon.geometry;
				
				if (typeof new_geometry === "string")
					new_geometry = JSON.parse(new_geometry);
				polygon_obj.addKeyframe(main.date, new_geometry);
			}
		}
	},
	simplify_polygon: {
		name: "Simplify Polygon",
		feature_name: "Simplify All Polygons",
		scope: ["GeometryPolygon"],
		
		special_function: async function (json) {
			//Declare local instance variables
			let polygon_obj = json.naissance_obj;
			
			if (typeof json.simplify_polygon === "number") {
				let geometry = polygon_obj.geometry;
				let turf_simplify = turf.simplify(Geospatiale.convertMaptalksToTurf(geometry), { tolerance: json.simplify_polygon });
				
				polygon_obj.addKeyframe(main.date, (turf_simplify) ?
					Geospatiale.convertTurfToMaptalks(turf_simplify).toJSON() : null);
			} else if (typeof json.simplify_polygon === "object") {
				let tolerance = Math.returnSafeNumber(json.simplify_polygon.tolerance);
				
				if (tolerance) {
					let date = (json.simplify_polygon.date) ? json.simplify_polygon.date : main.date;
					
					if (json.simplify_polygon.date_range) {
						polygon_obj.history.callFunctionInDateRange(json.simplify_polygon.date_range, (local_keyframe) => {
							let local_simplify_options = json.simplify_polygon;
							delete local_simplify_options.date_range;
							
							DALS.Timeline.parseAction("simplify_polygon", [{
								geometry_obj: polygon_obj.id,
								simplify_polygon: {
									date: local_keyframe,
									tolerance: tolerance,
									...local_simplify_options
								}
							}], true);
						});
					} else {
						let geometry = (json.simplify_polygon.date) ?
							polygon_obj.getGeometryKeyframeAtDate(date) : polygon_obj.geometry;
						
						if (geometry) try {
							let turf_simplify = turf.simplify(Geospatiale.convertMaptalksToTurf(geometry), { tolerance: tolerance });
							if (json.simplify_polygon.truncate > 0)
								turf_simplify = turf.truncate(turf_simplify, { precision: json.simplify_polygon.truncate });
							
							polygon_obj.addKeyframe(date, (turf_simplify) ?
								Geospatiale.convertTurfToMaptalks(turf_simplify).toJSON() : null);
						} catch (e) {
							console.error(`Turf simplify:`, Geospatiale.convertMaptalksToTurf(geometry), geometry, e);
						}
					}
				}
			}
		}
	},
	simplify_polygon_for_all_keyframes: {
		name: "Simplify Polygon for All Keyframes",
		feature_name: "Simplify All Polygon Keyframes",
		scope: ["GeometryPolygon"],
		
		draw_function: function () {
			//Return statement
			return {
				simplify_threshold: veRange(Math.returnSafeNumber(this.ui.simplify_threshold, 0.01), {
					name: `Simplify Threshold`,
					onuserchange: (v) => this.ui.simplify_threshold = v
				}),
				truncate_coordinates: veNumber(Math.returnSafeNumber(this.ui.truncate_threshold, -1), {
					name: "Truncate Coordinates",
					onuserchange: (v) => this.ui.truncate_threshold = v
				}),
				confirm: veButton(() => {
					//Declare local instance variables
					let simplify_threshold = Math.returnSafeNumber(this.ui.simplify_threshold, 0.01);
					
					try {
						DALS.Timeline.parseAction(`simplify_polygon_for_all_keyframes`, [{
							[this.getDALSKey()]: this.id,
							simplify_polygon_for_all_keyframes: {
								tolerance: simplify_threshold,
								truncate: this.ui.truncate_threshold
							}
						}]);
						
						//Declare formatting strings
						let simplify_string = String.formatNumber(simplify_threshold, 2);
						
						if (this instanceof naissance.Feature) {
							veToast(`Simplified all geometries by ${simplify_string}.`);
						} else {
							veToast(`Simplified all keyframes in polygon by ${simplify_string}.`);
						}
					} catch (e) { console.error(e); }
				}, { name: "Confirm" })
			};
		},
		special_function: async function (json) {
			//Declare local instance variables
			let polygon_obj = json.naissance_obj;
			
			Object.iterate(polygon_obj.history.keyframes, (local_key, local_value) => {
				let local_geometry = local_value.value[0];
				
				if (local_geometry && local_geometry !== "undefined") {
					let geometry = maptalks.Geometry.fromJSON(local_geometry);
					
					if (geometry) try {
						let turf_simplify = turf.simplify(Geospatiale.convertMaptalksToTurf(geometry), {
							tolerance: json.simplify_polygon_for_all_keyframes.tolerance
						});
						if (json.simplify_polygon_for_all_keyframes.truncate > 0)
							turf_simplify = turf.truncate(turf_simplify, {
								precision: json.simplify_polygon_for_all_keyframes.truncate
							});
						
						local_value.value[0] = Geospatiale.convertTurfToMaptalks(turf_simplify).toJSON();
					} catch (e) { console.error(`Error simplifying ${polygon_obj.name}:`, local_value, e); }
				}
			});
		}
	}
};