/**
 * - ##### Internal Commands:
 * - `.add_column`: {@link Object}
 *   - `.key`: {@link string}
 *   - `.values`: {@link Array}<{@link Array}<{@link Object}|{@link number}, {@link any}, ...>> - [date, value] map.
 * - `.add_variable`: {@link Object}
 *   - `.date`: {@link Object}|{@link number}|{@link string} - If string, either 'start'/'end'.
 *   - `.key`: {@link string}
 *   - `.value`: {@link any}
 * - `.clean_keyframes`: {@link Array}<{@link string}> - Cleans geometry keyframes for default symbols, redundant names. Options: ["symbol"]
 * - `.clean_geometry_tags`: {@link boolean}
 * - `.delete_feature`: {@link boolean}
 * - `.feature_operation`: {@link Object}
 *   - `.type`: {@link string} - Either 'difference'/'intersect'/'union'/'xor'.
 *   -
 *   - `.feature_id`: {@link string}
 *   - `.geometry_id`: {@link string}
 * - `.flatten_all_geometries`: {@link boolean}
 * - `.import_file`: {@link Object}
 *   - `.file_path`: {@link string}
 *   - `.type`: {@link string} - Either 'csv'/'geojson'/'gpx'/'kml'/'kmz'/'naissance'/'osm'/'polyline'/'shp'/'topojson'/'wkt'.
 *   - `.options`: {@link Object}
 * - `.move_all_entities_to_feature`: {@link string}
 * - `.set_name`: {@link string}
 * - `.set_visibility`: {@link boolean}
 * - `.set_zoom`: {@link Object}
 *   - `.is_start_keyframe=false`: {@link boolean}
 *   - `.max_zoom`: {@link number}|{@link string} - 'delete' if a number.
 *   - `.min_zoom`: {@link number}|{@link string} - 'delete' if a number.
 * - `.simplify_all_polygons`: {@link number}
 * 
 * @type {Object}
 */
config.actions.feature = {
	debug_feature: {
		name: "Debug Feature",
		scope: ["Feature"],
		
		draw_function: function () {
			window.$feature = this;
			console.log(`Feature logged as:`, window.$feature);
			veToast(`Feature logged to console.`);
			return undefined;
		}
	},
	delete_feature: {
		name: "Delete Feature",
		scope: ["Feature"],
		
		special_function: async function (json) {
			if (json.delete_feature === true)
				json.naissance_obj.remove();
		}
	},
	feature_operation: {
		name: "Feature Operation",
		scope: ["Feature"],
		
		draw_function: function () {
			//Declare local instance variables
			let operation_names = {
				difference: { name: "Difference" },
				intersect: { name: "Intersect" },
				union: { name: "Union" },
				xor: { name: "XOR" }
			};
			let operation_target = () => (this.ui.feature_operation_target || "geometry");
			let operation_type = () => (this.ui.feature_operation_type || "union");
			
			//Return statement
			return {
				feature_operation_target: veSelect({
					feature: { name: "Feature" },
					geometry: { name: "Geometry" }
				}, {
					name: "Merge With Entity Type",
					selected: operation_target(),
					onuserchange: (v) => this.ui.feature_operation_target = v
				}),
				feature_operation_geometry: new UI_GeometryDatalist(this.ui.feature_operation_geometry, {
					name: "Geometry",
					filter_types: ["GeometryPolygon"],
					limit: () => {
						let target = operation_target();
						if (target === "geometry") return true;
						return false;
					},
					onuserchange: (v) => this.ui.feature_operation_geometry = v
				}),
				feature_operation_feature: new UI_FeatureDatalist(this.ui.feature_operation_feature, {
					name: "Feature",
					filter_types: ["FeatureGroup", "FeatureLayer"],
					limit: () => {
						let target = operation_target();
						if (target === "feature") return true;
						return false;
					},
					onuserchange: (v) => this.ui.feature_operation_feature = v
				}),
				operation_type: veSelect(operation_names, {
					name: "Operation Type",
					selected: operation_type(),
					onuserchange: (v) => this.ui.feature_operation_type = v
				}),
				confirm: veButton(() => {
					//Declare local instance variables
					let feature_operation_type = operation_type();
					let target = operation_target();
					let target_geometry_id = (target === "geometry") ? this.ui.feature_operation_geometry : undefined;
					let target_feature_id = (target === "feature") ? this.ui.feature_operation_feature : undefined;
					
					//Run feature operation
					DALS.Timeline.parseAction("feature_operation", {
						feature_obj: this.id,
						feature_operation: {
							type: feature_operation_type,
							feature_id: target_feature_id,
							geometry_id: target_geometry_id,
						}
					});
					
					let ot_name;
					if (target_geometry_id) ot_name = naissance.Geometry.instances[target_geometry_id]?.name;
					if (target_feature_id) ot_name = naissance.Feature.instances[target_feature_id]?.name;
					
					veToast(`Performed ${operation_names[feature_operation_type].name} on ${this.name} using ${ot_name}.`);
				}, { name: "Confirm" })
			};
		},
		special_function: async function (json) {
			if (json.feature_operation) {
				naissance.Feature.operate.call(json.naissance_obj,
					json.feature_operation.type,
					(json.feature_operation.feature_id) ? json.feature_operation.feature_id : json.feature_operation.geometry_id);
				UI_Leftbar.refresh();
			}
		}
	},
	flatten_geometries: {
		name: "Flatten Geometries",
		scope: ["FeatureGroup", "FeatureLayer"],
		
		draw_function: function () {
			veConfirm(`Are you sure you want to flatten all geometries in ${this.name}?`, {
				special_function: () => {
					DALS.Timeline.parseAction(`flatten_geometries`, [{
						feature_obj: this.id,
						flatten_geometries: true
					}]);
					veToast(`Flattened all geometries.`);
				}
			});
			return undefined;
		},
		special_function: async function (json) {
			//Declare local instance variables
			let feature_obj = json.naissance_obj;
			
			//Iterate over all_geometries and flatten them as needed
			let all_geometries = feature_obj.getAllGeometries();
			
			for (let i = 0; i < all_geometries.length; i++)
				all_geometries[i].moveToFeature(feature_obj);
			UI_Leftbar.refresh();
		}
	},
	import_file: {
		name: "Import File(s)",
		scope: ["Feature"],
		
		draw_function: function () {	
			//Declare local instance variables
			let import_file_type = (this.ui.import_file_type || "geojson");
			if (!this.ui.import_file_options) this.ui.import_file_options = {};
			
			//Return statement
			return {
				file_type: veSelect({
					csv: { name: "CSV (.csv)" },
					geojson: { name: "GeoJSON (.geojson)" },
					gpx: { name: "GPX (.gpx)" },
					kml: { name: "KML (.kml)" },
					kmz: { name: "KMZ (.kmz)" },
					naissance: { name: "Naissance (.naissance)" },
					osm: { name: "OSM (.osm)" },
					polyline: { name: "Polyline (.polyline)" },
					shp: { name: "Shapefile (.shp)" },
					topojson: { name: "TopoJSON (.topojson)" }
				}, {
					name: "File Type",
					onuserchange: (v) => this.ui.import_file_type = v,
					selected: import_file_type
				}),
				file_path: veFile(this.ui.import_file_path, {
					name: "Select File(s)",
					multifile: true,
					onuserchange: (v) => this.ui.import_file_path = v
				}),
				behaviour: veInterface({
					flatten_when_importing: veCheckbox(this.ui.import_file_flatten_when_importing, {
						name: "Flatten When Importing",
						tooltip: "Will not create separate groups for different files during import.",
						onuserchange: (v) => this.ui.import_file_flatten_when_importing = v
					}),
					latitude_formula: veText(this.ui.import_file_lat_formula, {
						name: "Latitude Formula",
						tooltip: "<kbd>lat, y</kbd>: (float) refers to the Latitude of the coordinate.",
						onuserchange: (v) => this.ui.import_file_lat_formula = v
					}),
					longitude_formula: veText(this.ui.import_file_lng_formula, {
						name: "Longitude Formula",
						tooltip: "<kbd>lng, x</kbd>: (float) refers to the Latitude of the coordinate.",
						onuserchange: (v) => this.ui.import_file_lng_formula = v
					})
				}, { name: "Behaviour" }),
				feature_properties: veInterface({
					information: veHTML(`Feature properties map start/end dates and symbol properties into Naissance. Leaving a field blank means that it will not be passed when importing the file.`),
					
					id_key: veText(this.ui.import_id_key, { name: "ID Key", onuserchange: (v) => this.ui.import_id_key = v }),
					symbol_properties: veInterface({
						lineColor_key: veText(this.ui.import_lineColor_key, { name: "Line Color Key", onuserchange: (v) => this.ui.import_lineColor_key = v }),
						lineOpacity_key: veText(this.ui.import_lineOpacity_key, { name: "Line Opacity Key", onuserchange: (v) => this.ui.import_lineOpacity_key = v }),
						lineWidth_key: veText(this.ui.import_lineWidth_key, { name: "Line Width Key", onuserchange: (v) => this.ui.import_lineWidth_key = v }),
						name_key: veText(this.ui.import_name_key, { name: "Name Key", onuserchange: (v) => this.ui.import_name_key = v }),
						polygonFill_key: veText(this.ui.import_polygonFill_key, { name: "Polygon Fill Key", onuserchange: (v) => this.ui.import_polygonFill_key = v }),
						polygonOpacity_key: veText(this.ui.import_polygonOpacity_key, { name: "Polygon Opacity Key", onuserchange: (v) => this.ui.import_polygonOpacity_key = v }),
					}, { name: "Symbol" }),
					
					start_date: veInterface({
						start_year_key: veText(this.ui.import_start_year_key, { name: "Start Year Key", onuserchange: (v) => this.ui.import_start_year_key = v }),
						start_month_key: veText(this.ui.import_start_month_key, { name: "Start Month Key", onuserchange: (v) => this.ui.import_start_month_key = v }),
						start_day_key: veText(this.ui.import_start_day_key, { name: "Start Day Key", onuserchange: (v) => this.ui.import_start_day_key = v }),
						start_hour_key: veText(this.ui.import_start_hour_key, { name: "Start Hour Key", onuserchange: (v) => this.ui.import_start_hour_key = v }),
						start_minute_key: veText(this.ui.import_start_minute_key, { name: "Start Minute Key", onuserchange: (v) => this.ui.import_start_minute_key = v }),
					}, { name: "Start Date" }),
					
					end_date: veInterface({
						end_year_key: veText(this.ui.import_end_year_key, { name: "End Year Key", onuserchange: (v) => this.ui.import_end_year_key = v }),
						end_month_key: veText(this.ui.import_end_month_key, { name: "End Month Key", onuserchange: (v) => this.ui.import_end_month_key = v }),
						end_day_key: veText(this.ui.import_end_day_key, { name: "End Day Key", onuserchange: (v) => this.ui.import_end_day_key = v }),
						end_hour_key: veText(this.ui.import_end_hour_key, { name: "End Hour Key", onuserchange: (v) => this.ui.import_end_hour_key = v }),
						end_minute_key: veText(this.ui.import_end_minute_key, { name: "End Minute Key", onuserchange: (v) => this.ui.import_end_minute_key = v })
					}, { name: "End Date" })
				}, {
					name: "Special Properties",
					limit: () => this.ui.import_file_type !== "naissance"
				}),
				confirm: veButton(() => {
					//Declare local instance variables
					let import_file_type = (this.ui.import_file_type || "geojson");
					
					if (this.class_name === "FeatureLayer" && import_file_type === "naissance") {
						veToast(`<icon>warning</icon> Naissance files can only be imported into a FeatureGroup.`);
						return;
					}
					if (!this.ui.import_file_path) {
						veToast(`<icon>warning</icon> You must select a file to import.`);
						return;
					}
					
					let local_options = {
						lat_formula: this.ui.import_file_lat_formula,
						lng_formula: this.ui.import_file_lng_formula,
						
						id_key: this.ui.import_id_key,
						lineColor_key: this.ui.import_lineColor_key,
						lineOpacity_key: this.ui.import_lineOpacity_key,
						lineWidth_key: this.ui.import_lineWidth_key,
						name_key: this.ui.import_name_key,
						polygonFill_key: this.ui.import_polygonFill_key,
						polygonOpacity_key: this.ui.import_polygonOpacity_key,
						
						end_year_key: this.ui.import_end_year_key,
						end_month_key: this.ui.import_end_month_key,
						end_day_key: this.ui.import_end_day_key,
						end_hour_key: this.ui.import_end_hour_key,
						end_minute_key: this.ui.import_end_minute_key,
						
						start_year_key: this.ui.import_start_year_key,
						start_month_key: this.ui.import_start_month_key,
						start_day_key: this.ui.import_start_day_key,
						start_hour_key: this.ui.import_start_hour_key,
						start_minute_key: this.ui.import_start_minute_key
					};
					
					//Strip anything without a .length > 0 from local_options
					Object.iterate(local_options, (local_key, local_value) => {
						if (typeof local_value !== "string") {
							delete local_options[local_key];
						} else {
							local_value = local_value.trim();
							if (local_value.length === 0) delete local_options[local_key];
						}
					});
					
					//Execute action
					let import_file_paths = this.ui.import_file_path;
					let separate_groups = (import_file_paths.length > 1 && !this.ui.import_file_flatten_when_importing);
					
					//Iterate over all import_file_paths
					for (let i = 0; i < import_file_paths.length; i++) try {
						let local_group = this;
						if (separate_groups) {
							local_group = new naissance.FeatureGroup();
							local_group.moveToFeature(this);
						}
						
						DALS.Timeline.parseAction(`import_file`, [{
							feature_obj: local_group.id,
							import_file: {
								type: import_file_type,
								file_path: this.ui.import_file_path[i],
								options: local_options
							}
						}]);
						console.log(`Imported File ${i + 1}/${import_file_paths.length} for ${this.name} using ${import_file_type}.`);
					} catch (e) {
						console.error(`Error importing File ${i + 1}/${import_file_paths.length}`, e);
					}
					
					UI_Leftbar.refresh();
					veToast(`Import request for ${import_file_type} file sent to ${this.name}.`);
				}, { name: "Confirm" })
			};
		},
		special_function: async function (json) {
			if (json.naissance_obj.entities) {
				naissance.Feature.importFile.call(json.naissance_obj, 
					json.import_file.file_path, json.import_file.type, json.import_file.options);
				UI_Leftbar.refresh();
			}
		}
	},
	set_name: {
		name: "Set Name",
		scope: ["Feature"],
		
		special_function: async function (json) {
			if (typeof json.set_name === "string")
				json.naissance_obj._name = json.set_name;
		}
	},
	set_visibility: {
		name: "Set Visibility",
		scope: ["Feature"],
		
		special_function: async function (json) {
			if (json.set_visibility === true) {
				json.naissance_obj.show();
			} else if (json.set_visibility === false) {
				json.naissance_obj.hide();
			}
		}
	},
};