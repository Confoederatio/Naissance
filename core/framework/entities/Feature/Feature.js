if (!global.naissance) global.naissance = {};
naissance.Feature = class extends naissance.Entity {
	static instances = {};
	
	constructor (arg0_options) {
		//Convert from parameters
		let options = (arg0_options) ? arg0_options : {};
		
		//Declare local instance variables
		super();
		this.id = Class.generateRandomID(naissance.Feature);
		this.is_naissance_feature = true;
		this._is_visible = true;
		this.metadata = (options.metadata) ? options.metadata : {};
		this.ui = {};
		
		//Initialise this.options
		if (!this.options) this.options = {};
			this.options.instance = this;
			
		//Declare local instance variables
		this._name = "New Feature";
		this._parent = undefined;
		
		//Push to naissance.Feature.instances
		naissance.Feature.instances[this.id] = this;
		setTimeout(() => {
			if (main.brush.selected_feature?.entities && !this.cannot_nest_self) //Sanity check to make sure .cannot_nest_self is invalid for nesting
				this.moveToFeature(main.brush.selected_feature);
		});
	}
	
	get name () {
		//Return statement
		return this._name;
	}
	
	set name (arg0_value) {
		//Convert from parameters
		let value = (arg0_value) ? arg0_value : "";
		
		//Send DALS.Timeline.parseAction() command
		DALS.Timeline.parseAction("rename_feature", [{ feature_obj: this.id, set_name: value }], this.fire_action_silently);
	}
	
	get parent () {
		//Return statement
		return this._parent;
	}
	
	set parent (arg0_v) {
		//Convert from parameters
		let value = arg0_v;
		
		//Make sure parent cannot be self
		if (value && value.id !== this.id)
			this._parent = value;
		if (value === undefined)
			this._parent = undefined;
	}
	
	addEntity (arg0_entity, arg1_do_not_refresh) {
		//Convert from parameters
		let entity = arg0_entity;
		let do_not_refresh = arg1_do_not_refresh;
		
		//Declare local instance variables
		entity.moveToFeature(this);
		if (!do_not_refresh) this.drawHierarchyDatatype();
	}
	
	drawActionsPalette (arg0_options) {
		//Convert from parameters
		let options = (arg0_options) ? arg0_options : {};
		
		//Initialise options
		if (!options.name) options.name = "Feature";
		if (!options.move_to_filters) options.move_to_filters = ["FeatureGroup", "FeatureLayer"];
		if (!options.type) options.type = "feature";
		
		//Return statement
		return veInterface({
			actions_palette: veSearchSelect({
				add_descriptions: veButton(() => {
					//Set defaults
					if (this.ui.add_descriptions_avoid_duplicates === undefined) this.ui.add_descriptions_avoid_duplicates = true;
					if (this.ui.add_descriptions_insert_at === undefined) this.ui.add_descriptions_insert_at = "append";
					if (this.ui.add_descriptions_insert_newline === undefined) this.ui.add_descriptions_insert_newline = true;
					if (this.ui.add_descriptions_search === undefined) this.ui.add_descriptions_search = "substring";
					
					if (this.add_descriptions_window) this.add_descriptions_window.close();
					this.add_descriptions_window = veWindow({
						value: veWordProcessor(this.ui.add_descriptions_value, {
							onuserchange: (v) => this.ui.add_descriptions_value = v,
							width: 99,
							x: 0, y: 0
						}),
						duplicate_filtering: veInterface({
							avoid_duplicates: veToggle(this.ui.add_descriptions_avoid_duplicates, {
								name: "Avoid Duplicates",
								onuserchange: (v) => this.ui.add_descriptions_avoid_duplicates = v
							}),
							case_sensitive: veToggle(this.ui.add_descriptions_case_sensitive, {
								name: "Case Sensitive",
								onuserchange: (v) => this.ui.add_descriptions_case_sensitive = v
							}),
							search: veSelect({
								substring: { name: "Substring" },
								whole_line: { name: "Whole Line" }
							}, {
								name: "Search",
								selected: this.ui.add_descriptions_search,
								onuserchange: (v) => this.ui.add_descriptions_search = v
							})
						}, { name: "Duplicate Filtering", x: 0, y: 1 }),
						insert_options: veInterface({
							insert_at: veSelect({
								append: { name: "Append" },
								prepend: { name: "Prepend" }
							}, {
								name: "Insert At",
								onuserchange: (v) => this.ui.add_descriptions_insert_at = v,
								selected: this.ui.add_descriptions_insert_at
							}),
							insert_newline: veToggle(this.ui.add_descriptions_insert_newline, {
								name: "Insert Newline",
								onuserchange: (v) => this.ui.add_descriptions_insert_newline = v
							}),
						}, { name: "Insert Options", x: 1, y: 1 }),
						confirm: veButton(() => {
							if (!(this.ui.add_descriptions_value?.length > 0)) {
								veToast(`<icon>warning</icon> You must provide a valid description to append/prepend.`);
								return;
							}
							
							//Declare local instance variables
							let all_geometries = this.getAllGeometries();
							
							//Iterate over all_geometries and add to .metadata.description
							for (let i = 0; i < all_geometries.length; i++) {
								if (!all_geometries[i].metadata) all_geometries[i].metadata = {};
								if (!all_geometries[i].metadata.description) all_geometries[i].metadata.description = "";
								
								let local_description = all_geometries[i].metadata.description;
								
								all_geometries[i].metadata.description = String.editAddToString(local_description, this.ui.add_descriptions_value, {
									avoid_duplicates: this.ui.add_descriptions_avoid_duplicates,
									case_sensitive: this.ui.add_descriptions_case_sensitive,
									insert_at: this.ui.add_descriptions_insert_at,
									insert_newline: this.ui.add_descriptions_insert_newline,
									search: this.ui.add_descriptions_search,
								});
								
								if (all_geometries[i].variables_ui) all_geometries[i].variables_ui.remove(); //Free previous variables_ui
								all_geometries[i].drawVariablesEditor();
							}
							veToast(`Added descriptions for ${all_geometries.length} geometries in ${this.name}.`);
						}, { name: "Confirm" })
					}, {
						name: "Add Descriptions",
						can_rename: false,
						width: "30rem"
					})
				}, { name: "Add Descriptions" }),
				add_variable: veButton(() => {
					if (this.add_variable_window) this.add_variable_window.close();
					this.add_variable_window = veWindow({
						variable_key: veText(this.ui.add_variable_key, {
							name: "Variable Key",
							onuserchange: (v) => this.ui.add_variable_key = v
						}),
						value: veText(this.ui.add_variable_value, {
							name: "Value",
							onuserchange: (v) => {
								if (!isNaN(parseFloat(v))) {
									this.ui.add_variable_value = parseFloat(v);
								} else {
									this.ui.add_variable_value = v;
								}
							}
						}),
						keyframe: veSelect({
							end: { name: "End Date" },
							manual: { name: "Manual Date" },
							start: { name: "Start Date" },
						}, {
							name: "Keyframe",
							selected: (this.ui.add_variable_keyframe) ? this.ui.add_variable_keyframe : "start",
							onuserchange: (v) => this.ui.add_variable_keyframe = v
						}),
						date: veDate(main.date, {
							name: "Date",
							limit: () => this.ui.add_variable_keyframe === "manual",
							onuserchange: (v) => this.ui.add_variable_date = v
						}),
						
						confirm: veButton(() => {
							if (!this.ui.add_variable_key) {
								veToast(`<icon>warning</icon> You must provide a valid variable key.`);
								return;
							}
							
							let actual_date;
								if (this.ui.add_variable_keyframe === "manual") {
									actual_date = (this.ui.add_variable_date) ? this.ui.add_variable_date : main.date;
								} else {
									actual_date = (this.ui.add_variable_keyframe) ? this.ui.add_variable_keyframe : "start";
								}
							DALS.Timeline.parseAction(`add_variable_${this.ui.add_variable_key}`, [{
								feature_obj: this.id,
								add_variable: {
									date: actual_date,
									key: this.ui.add_variable_key,
									value: (this.ui.add_variable_value !== undefined) ? this.ui.add_variable_value : ""
								}
							}]);
						}, { name: "Confirm" })
					}, { 
						name: "Add Variable", 
						can_rename: false,
						width: "20rem"
					});
				}, { name: "Add Variable" }),
				add_variables: veButton(() => {
					if (this.add_field_window) this.add_field_window.close();
					this.add_field_window = veWindow({
						field_name: veText(this.ui.add_variables_key, {
							name: "Variable Key",
							onuserchange: (v) => this.ui.add_variables_key = v
						}),
						edit_values: veList(veRawInterface({
							date: veDate(),
							value: veText()
						}), {
							name: "Edit Values",
							onuserchange: (v) => {
								//Declare local instance variables
								let values = [];
								
								//Iterate over all v entries
								for (let i = 0; i < v.length; i++)
									values.push([Date.getTimestamp(v[i].date.v), v[i].value.v]);
								
								this.ui.add_variables_values = values;
							}
						}),
						
						confirm: veButton(() => {
							//Declare local instance variables
							let all_geometries = this.getAllGeometries();
							let values = (this.ui.add_variables_values) ? this.ui.add_variables_values : [];
							
							if (!this.ui.add_variables_key) {
								veToast(`<icon>warning</icon> You must set a valid field name.`);
								return;
							}
							
							//Add data to field
							DALS.Timeline.parseAction(`add_column_${this.ui.add_variables_key}`, [{
								feature_obj: this.id,
								add_column: {
									key: this.ui.add_variables_key,
									values: values
								}
							}]);
							veToast(`Added ${this.ui.add_variables_key} as a variable column to ${String.formatNumber(all_geometries.length)} geometries.`);
						}, { name: "Confirm" })
					}, {
						name: "Add Variables",
						can_rename: false,
						width: "30rem"
					});
				}, { name: "Add Variables" }),
				add_property: veButton(() => {
					if (this.add_property_window) this.add_property_window.close();
					this.add_property_window = veWindow({
						edit_values: veList(veRawInterface({
							date: veDate(),
							value: veObjectEditor()
						}), {
							name: "Edit Values",
							onuserchange: (v) => {
								//Declare local instance variables
								let values = [];
								
								//Iterate over all v entries
								for (let i = 0; i < v.length; i++)
									values.push({
										date: Date.getTimestamp(v[i].date.v),
										value: v[i].value.v
									});
								
								this.ui.add_property_values = values;
							}
						}),
						confirm: veButton(() => {
							if (!(this.ui.add_property_values?.length > 0)) {
								veToast(`<icon>warning</icon> Adding a property requires a valid field and value.`);
								return;
							}
							
							//Declare local instance variables
							let all_geometries = this.getAllGeometries();
							let all_geometry_ids = [];
								for (let i = 0; i < all_geometries.length; i++)
									all_geometry_ids.push(all_geometries[i].id);
							
							//Iterate over all this.ui.add_property_values.length to finish adding properties
							for (let i = 0; i < this.ui.add_property_values.length; i++) {
								let local_property = this.ui.add_property_values[i];
								
								naissance.Geometry.setProperties(all_geometry_ids, local_property);
							}
							
							veToast(`Successfully altered ${String.formatNumber(this.ui.add_property_values.length)} properties for ${String.formatNumber(all_geometries.length)} geometries.`);
						}, { name: "Confirm" })
					}, {
						name: "Add Property",
						can_rename: false,
						width: "30rem"
					});
					
				}, { name: "Add Property" }),
				add_tag: veButton(() => {
					if (this.add_tag_window) this.add_tag_window.close();
					this.add_tag_window = veWindow({
						tag_key: veText(this.ui.add_tag_key, {
							name: "Tag Key",
							onuserchange: (v) => this.ui.add_tag_key = v
						}),
						tag_mode: veSelect({
							append: { name: "Append" },
							insert: { name: "Insert" },
							prepend: { name: "Prepend" }
						}, {
							name: "Tag Mode",
							onuserchange: (v) => this.ui.add_tag_mode = v,
							selected: (this.ui.add_tag_mode) ? this.ui.add_tag_mode : "append"
						}),
						insert_at_position: veNumber(this.ui.add_tag_insert_at_position, {
							name: "Insert at Position",
							limit: () => (this.ui.add_tag_mode === "insert"),
							min: 0,
							onuserchange: (v) => this.ui.add_tag_insert_at_position = v,
						}),
						confirm: veButton(() => {
							if (!(this.ui?.add_tag_key?.length > 0)) {
								veToast(`<icon>warning</icon> You must specify a valid tag key to add.`);
								return;
							}
							
							//Declare local instance variables
							let all_geometries = this.getAllGeometries();
							let tag_mode = (this.ui.add_tag_mode) ? this.ui.add_tag_mode : "append";
							
							//Ensure Objects exist for all_geometries
							for (let i = 0; i < all_geometries.length; i++) {
								if (!all_geometries[i].metadata) all_geometries[i].metadata = {};
								if (!all_geometries[i].metadata.tags) all_geometries[i].metadata.tags = [];
							}
							
							//Iteerate over all_geometries and parse tag_mode
							if (tag_mode === "append") {
								for (let i = 0; i < all_geometries.length; i++)
									all_geometries[i].metadata.tags.push(this.ui.add_tag_key);
							} else if (tag_mode === "insert") {
								for (let i = 0; i < all_geometries.length; i++)
									all_geometries[i].metadata.tags.splice(
										Math.returnSafeNumber(this.ui.add_tag_insert_at_position), 0, this.ui.add_tag_key);
							} else if (tag_mode === "prepend") {
								for (let i = 0; i < all_geometries.length; i++)
									all_geometries[i].metadata.tags.unshift(this.ui.add_tag_key);
							}
							
							veToast(`Added ${this.ui.add_tag_key} to ${String.formatNumber(all_geometries.length)} geometries.`);
						}, { name: "Confirm" })
					}, {
						name: "Add Tag",
						can_rename: false,
						width: "30rem"
					});
				}, { name: "Add Tag" }),
				clear_descriptions: veButton(() => {
					veConfirm(`Are you sure you want to clear all descriptions in ${this.name}?`, {
						special_function: () => {
							//Declare local instance variables
							let all_geometries = this.getAllGeometries();
							
							//Iterate over all_geometries and remove .metadata.description
							for (let i = 0; i < all_geometries.length; i++)
								delete all_geometries[i].metadata.description;
							veToast(`Removed descriptions for ${String.formatNumber(all_geometries.length)} items.`);
						}
					});
				}, { name: "Clear Descriptions" }),
				clean_geometry_tags: veButton(() => {
					veConfirm(`Are you sure you want to clean all geometry tags in ${this.name}?`, {
						special_function: () => {
							DALS.Timeline.parseAction(`clean_${options.type}_geometry_tags`, [{
								type: "Feature",
								feature_obj: this.id,
								clean_geometry_tags: true
							}]);
							veToast(`Cleaned geometry tags.`);
						}
					});
				}, { name: "Clean Geometry Tags" }),
				clean_keyframes: veButton(() => {
					if (this.clean_keyframes_window) this.clean_keyframes_window.close();
					this.clean_keyframes_window = veWindow({
						clean_symbols: veToggle(this.ui.clean_symbols, {
							name: "Clean Symbols",
							onuserchange: (v) => this.ui.clean_symbols = v
						}),
						clean_keyframes: veButton(() => {
							//Declare local instance variables
							let all_flags = [];
							if (this.ui.clean_symbols) all_flags.push("symbol");
							
							DALS.Timeline.parseAction(`clean_${options.type}_keyframes`, [{
								feature_obj: this.id,
								clean_keyframes: all_flags
							}]);
							veToast(`Cleaned ${options.name} keyframes.`);
						}, { name: "Confirm" })
					}, { name: `Clean ${options.name} Keyframes`, can_rename: false });
				}, { name: `Clean ${options.name} Keyframes` }),
				feature_operation: veButton(() => {
					let operation_names = {
						difference: { name: "Difference" },
						intersect: { name: "Intersect" },
						union: { name: "Union" },
						xor: { name: "XOR" }
					};
					let operation_target = () => (this.ui.feature_operation_target || "geometry");
					let operation_type = () => (this.ui.feature_operation_type || "union");
					
					if (this.feature_operation_window) this.feature_operation_window.close();
					
					this.feature_operation_window = veWindow({
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
					}, {
						name:`Feature Operation (${this.name})`,
						can_rename: false,
						width: "20rem"
					});
				}, {
					name: "Feature Operation"
				}),
				flatten_all_geometries: veButton(() => {
					veConfirm(`Are you sure you want to flatten all geometries in ${this.name}?`, {
						special_function: () => {
							DALS.Timeline.parseAction(`flatten_${options.type}_geometries`, [{
								feature_obj: this.id,
								flatten_all_geometries: true
							}]);
							veToast(`Flattened all geometries.`);
						}
					});
				}, {
					name: "Flatten All Geometries"
				}),
				import_file: veButton(() => {
					let import_file_type = (this.ui.import_file_type || "geojson");
					if (!this.ui.import_file_options) this.ui.import_file_options = {};
					
					if (this.import_file_window) this.import_file_window.close();
					this.import_file_window = veWindow({
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
								
								DALS.Timeline.parseAction(`import_file_${import_file_type}`, [{
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
					}, {
						name: `Import File(s) (${this.name})`,
						can_rename: false,
						width: "20rem"
					})
				}, {
					name: "Import File(s)",
					limit: () => ["FeatureGroup", "FeatureLayer"].includes(this.class_name)
				}),
				merge_layers: veButton(() => {
					if (this.merge_layers_window) this.merge_layers_window.close();
					this.merge_layers_window = veWindow({
						mode: veSelect({
							auto: { name: "Auto" },
							manual_dates: { name: "Manual Dates" }
						}, {
							name: "Mode",
							selected: (this.ui.merge_layers_mode) ? this.ui.merge_layers_mode : "auto",
							onuserchange: (v) => this.ui.merge_layers_mode = v
						}),
						to_layer: new UI_FeatureDatalist(this.ui.merge_layers_to_layer, {
							name: "To Layer",
							onuserchange: (v) => this.ui.merge_layers_to_layer = v
						}),
						
						start_date: veDate(undefined, {
							name: "Start Date",
							limit: () => this.ui.merge_layers_mode === "manual_dates",
							onuserchange: (v) => this.ui.merge_layers_start_date = v
						}),
						end_date: veDate(undefined, {
							name: "End Date",
							limit: () => this.ui.merge_layers_mode === "manual_dates",
							onuserchange: (v) => this.ui.merge_layers_end_date = v
						}),
						delete_layer_after: veToggle((this.ui.merge_layers_delete_layer_after !== undefined) ? this.ui.merge_layers_delete_layer_after : true, {
							name: "Delete Layer After",
							onuserchange: (v) => this.ui.merge_layers_delete_layer_after = v
						}),
						
						confirm: veButton(() => {
							//Internal guard clause to ensure this.ui.merge_layers_to_layer is valid
							if (!this.ui.merge_layers_to_layer) {
								veToast(`<icon>warning</icon> You must select a valid Layer to merge ${this.name} into.`);
								return;
							}
							
							let to_layer_obj = naissance.Feature.instances[this.ui.merge_layers_to_layer];
							if (!to_layer_obj) {
								veToast(`<icon>warning</icon> No Layer with the specified ID could be found.`);
								return;
							}
							if (to_layer_obj.class_name !== "FeatureLayer") {
								veToast(`<icon>warning</icon> You cannot merge ${this.name} into a ${to_layer_obj.class_name}.`);
								return;
							}
							
							//Declare local instance variables
							let options = {};
							
							if (this.ui.merge_layers_mode === "manual_dates") {
								if (this.ui.merge_layers_end_date !== undefined) options.end_date = this.ui.merge_layers_end_date;
								if (this.ui.merge_layers_start_date !== undefined) options.start_date = this.ui.merge_layers_start_date;
								if (this.ui.merge_layers_delete_layer_after) options.do_not_delete_after = true;
							}
							
							//Execute action; close windows after
							DALS.Timeline.parseAction(`merge_layer_${to_layer_obj.id}`, [{
								feature_obj: this.id,
								type: "FeatureLayer",
								merge_layer: {
									to_layer_id: to_layer_obj.id,
									...options
								}
							}]);
							
							veToast(`Successfully merged this layer into ${to_layer_obj.name}.`);
							this.merge_layers_window.close();
							this.close("instance");
						}, { name: "Confirm" })
					}, {
						name: "Merge Layers",
						can_rename: false,
						width: "30rem"
					})
				}, { 
					name: "Merge Layers",
					limit: () => this.class_name === "FeatureLayer"
				}),
				move_entities_to: veButton(() => {
					if (this.move_entities_window) this.move_entities_window.close();
					this.move_entities_window = veWindow({
						to_feature: new UI_FeatureDatalist(this.ui.to_feature_id, {
							name: `To ${options.name}`,
							filter_types: options.move_to_filters,
							onuserchange: (v) => {
								console.log(v);
								this.ui.to_feature_id = v;
							}
						}),
						confirm: veButton(() => {
							try {
								//Declare local instance variables
								let ot_feature = naissance.Feature.instances[this.ui.to_feature_id];
								
								//Parse action
								DALS.Timeline.parseAction(`move_${options.type}_geometries_to`, [{
									feature_obj: this.id,
									move_all_entities_to_feature: this.ui.to_feature_id
								}]);
								veToast(`Moved all geometries from ${this.name} ${options.name} to ${ot_feature.name} ${options.name}.`);
							} catch (e) { console.error(e); }
						}, { name: "Confirm" })
					}, { name: "Move Entities To", can_rename: false })
				}, { name: `Move Entities To ${options.name}` }),
				select_all_geometries: veButton(() => {
					//Declare local instance variables
					let all_geometries = this.getAllGeometries();
					
					//Iterate over all_geometries
					for (let i = 0; i < all_geometries.length; i++)
						if (all_geometries[i].geometry) all_geometries[i].selected = true;
					veToast(`Selected all geometries in ${this.name}.`);
				}, { name: "Select All Geometries" }),
				set_zoom_visibility: veButton(() => {
					if (this.set_zoom_window) this.set_zoom_window.close();
					this.set_zoom_window = veWindow({
						information: veHTML(`To remove the zoom attribute, type -1 as the value instead.`),
						
						min_zoom: veNumber(this.ui.set_zoom_min, {
							name: "Minimum Zoom Level",
							onuserchange: (v) => this.ui.set_zoom_min = v
						}),
						max_zoom: veNumber(this.ui.set_zoom_max, {
							name: "Maximum Zoom Level",
							onuserchange: (v) => this.ui.set_zoom_max = v
						}),
						is_start_keyframe: veToggle(this.ui.set_zoom_is_start, {
							name: "Modify Zoom at Starting Keyframe",
							onuserchange: (v) => this.ui.set_zoom_is_start = v
						}),
						
						confirm: veButton(() => {
							let current_min = (this.ui.set_zoom_min !== undefined) ? this.ui.set_zoom_min : -1;
							let current_max = (this.ui.set_zoom_max !== undefined) ? this.ui.set_zoom_max : -1;
							
							DALS.Timeline.parseAction("set_zoom", [{
								feature_obj: this.id,
								set_zoom: {
									is_start_keyframe: (this.ui.set_zoom_is_start),
									max_zoom: (current_max === -1) ? "delete" : current_max,
									min_zoom: (current_min === -1) ? "delete" : current_min
								}
							}]);
							
							veToast(`Successfully updated zoom visibility for ${this.name}.`);
							this.set_zoom_window.close();
						}, { name: "Confirm" })
					}, {
						name: `Set Zoom (${this.name})`,
						can_rename: false,
						width: "20rem"
					});
				}, { name: "Set Zoom Visibility" }),
				simplify_polygons: veButton(() => {
					if (this.simplify_polygons_window) this.simplify_polygons_window.close();
					this.simplify_polygons_window = veWindow({
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
								DALS.Timeline.parseAction(`simplify_${options.type}_geometries`, [{
									feature_obj: this.id,
									simplify_all_polygons: {
										tolerance: simplify_threshold,
										truncate: this.ui.truncate_threshold
									}
								}]);
								veToast(`Simplified all geometries by ${String.formatNumber(simplify_threshold, 2)}.`);
							} catch (e) { console.error(e); }
						}, { name: "Confirm" })
					}, { name: "Simplify Polygons", can_rename: false });
				}, { name: "Simplify Polygons" }),
				remove_property: veButton(() => {
					if (this.remove_property_window) this.remove_property_window.close();
					this.remove_property_window = veWindow({
						property_key: veText(this.ui.remove_property_key, {
							name: "Property Key",
							onuserchange: (v) => this.ui.remove_property_key = v
						}),
						property_date: veDate(main.date, {
							name: "Date (Optional)",
							onuserchange: (v) => this.ui.remove_property_date = v
						}),
						confirm: veButton(() => {
							if (!this.ui.remove_property_key) {
								veToast(`<icon>warning</icon> You must provide a valid property key.`);
								return;
							}
							
							let all_geometries = this.getAllGeometries();
							let all_geometry_ids = [];
							
							for (let i = 0; i < all_geometries.length; i++)
								if (all_geometries[i].id) all_geometry_ids.push(all_geometries[i].id);
							
							naissance.Geometry.parseActionForGeometries(all_geometry_ids, {
								command: "remove_property",
								key: "remove_property",
								name: "Remove F.Property",
								type: "Geometry",
								value: {
									date: this.ui.remove_property_date,
									key: this.ui.remove_property_key
								}
							});
							veToast(`Removed property ${this.ui.remove_property_key} from ${String.formatNumber(all_geometry_ids.length)} geometries.`);
						}, { name: "Confirm" })
					}, {
						name: "Remove Property",
						can_rename: false,
						width: "20rem"
					});
				}, { name: "Remove Property" }),
				remove_variable: veButton(() => {
					if (this.remove_variable_window) this.remove_variable_window.close();
					this.remove_variable_window = veWindow({
						variable_key: veText(this.ui.remove_variable_key, {
							name: "Variable Key",
							onuserchange: (v) => this.ui.remove_variable_key = v
						}),
						keyframe: veSelect({
							end: { name: "End Date" },
							manual: { name: "Manual Date" },
							start: { name: "Start Date" },
						}, {
							name: "Keyframe",
							selected: (this.ui.remove_variable_keyframe) ? this.ui.remove_variable_keyframe : "start",
							onuserchange: (v) => this.ui.remove_variable_keyframe = v
						}),
						date: veDate(main.date, {
							name: "Date",
							limit: () => this.ui.remove_variable_keyframe === "manual",
							onuserchange: (v) => this.ui.remove_variable_date = v
						}),
						confirm: veButton(() => {
							if (!this.ui.remove_variable_key) {
								veToast(`<icon>warning</icon> You must provide a valid variable key.`);
								return;
							}
							
							let actual_date = (this.ui.remove_variable_keyframe === "manual") ?
								((this.ui.remove_variable_date) ? this.ui.remove_variable_date : main.date) :
								((this.ui.remove_variable_keyframe) ? this.ui.remove_variable_keyframe : "start");
							
							let all_geometries = this.getAllGeometries();
							let all_geometry_ids = [];
							
							for (let i = 0; i < all_geometries.length; i++)
								if (all_geometries[i].id) all_geometry_ids.push(all_geometries[i].id);
							
							naissance.Geometry.parseActionForGeometries(all_geometry_ids, {
								command: "remove_variable",
								key: "remove_variable",
								name: "Remove F.Variable",
								type: "Geometry",
								value: {
									date: actual_date,
									key: this.ui.remove_variable_key
								}
							});
							veToast(`Removed variable ${this.ui.remove_variable_key} from ${String.formatNumber(all_geometry_ids.length)} geometries.`);
						}, { name: "Confirm" })
					}, {
						name: "Remove Variable",
						can_rename: false,
						width: "20rem"
					});
				}, { name: "Remove Variable" }),
				remove_tags: veButton(() => {
					if (this.remove_tag_window) this.remove_tag_window.close();
					this.remove_tag_window = veWindow({
						tag_key: veText(this.ui.remove_tag_key, {
							name: "Tag Key",
							onuserchange: (v) => this.ui.remove_tag_key = v
						}),
						confirm: veButton(() => {
							if (!this.ui.remove_tag_key) {
								veToast(`<icon>warning</icon> You must specify a valid tag key to remove.`);
								return;
							}
							
							let all_geometries = this.getAllGeometries();
							let all_geometry_ids = [];
							
							for (let i = 0; i < all_geometries.length; i++) {
								if (all_geometries[i].id) all_geometry_ids.push(all_geometries[i].id);
								if (all_geometries[i].metadata?.tags) {
									let tags = all_geometries[i].metadata.tags;
									for (let x = tags.length - 1; x >= 0; x--)
										if (tags[x] === this.ui.remove_tag_key) tags.splice(x, 1);
								}
							}
							
							naissance.Geometry.parseActionForGeometries(all_geometry_ids, {
								command: "set_tags",
								key: "set_tags",
								name: "Remove F.Tag",
								type: "Geometry"
							});
							veToast(`Removed tag ${this.ui.remove_tag_key} from ${String.formatNumber(all_geometry_ids.length)} geometries.`);
						}, { name: "Confirm" })
					}, {
						name: "Remove Tag",
						can_rename: false,
						width: "20rem"
					});
				}, { name: "Remove Tag" }),
				replace_descriptions: veButton(() => { //[WIP] - Should be changed to replace_descriptions
					if (this.replace_descriptions_window) this.replace_descriptions_window.close();
					this.replace_descriptions_window = veWindow({
						find: veInterface({
							find_value: veWordProcessor(this.ui.replace_descriptions_find_value, {
								onuserchange: (v) => this.ui.replace_descriptions_find_value = v
							}),
						}, { name: "Find", open: true }),
						replace: veInterface({
							replace_value: veWordProcessor(this.ui.replace_descriptions_replace_value, {
								onuserchange: (v) => this.ui.replace_descriptions_replace_value = v
							}),
						}, { name: "Replace", open: true }),
						information: veHTML("If no replace value is provided, the found value(s) will automatically be removed."),
						
						match_filtering: veInterface({
							case_sensitive: veToggle(this.ui.replace_descriptions_case_sensitive, {
								name: "Case Sensitive",
								onuserchange: (v) => this.ui.replace_descriptions_case_sensitive = v
							}),
							remove_all: veToggle(this.ui.replace_descriptions_remove_all, {
								name: "Remove All",
								onuserchange: (v) => this.ui.replace_descriptions_remove_all = v
							}),
							remove_order: veSelect({
								first: { name: "First-to-last" },
								last: { name: "Last-to-first" }
							}, {
								name: "Remove Order",
								onuserchange: (v) => this.ui.replace_descriptions_remove_order = v,
								selected: (this.ui.replace_descriptions_remove_order) ? 
									this.ui.replace_descriptions_remove_order : "first"
							}),
							search: veSelect({
								substring: { name: "Substring" },
								whole_line: { name: "Whole Line" }
							}, {
								name: "Search",
								onuserchange: (v) => this.ui.replace_descriptions_search = v,
								selected: (this.ui.replace_descriptions_search) ? 
									this.ui.replace_descriptions_search : "substring"
							})
						}, { name: "Match Filtering", x: 0, y: 2 }),
						confirm: veButton(() => {
							if (!(this.ui.replace_descriptions_find_value?.length > 0)) {
								veToast(`<icon>warning</icon> You must provide a valid value to find.`);
								return;
							}
							
							//Declare local instance variables
							let all_geometries = this.getAllGeometries();
							
							//Iterate over all_geometries and add to .metadata.description
							for (let i = 0; i < all_geometries.length; i++) {
								if (!(all_geometries[i]?.metadata?.description)) continue;
								
								let local_description = all_geometries[i].metadata.description;
								
								all_geometries[i].metadata.description = String.editReplaceInString(
									local_description, 
									this.ui.replace_descriptions_find_value, 
									this.ui.replace_descriptions_replace_value, 
									{
										case_sensitive: this.ui.replace_descriptions_case_sensitive,
										remove_all: this.ui.replace_descriptions_remove_all,
										remove_order: this.ui.replace_descriptions_remove_order,
										search: this.ui.replace_descriptions_search
									});
								if (all_geometries[i].metadata.description?.length === 0) 
									delete all_geometries[i].metadata.description;
								
								if (all_geometries[i].variables_ui) all_geometries[i].variables_ui.remove(); //Free previous variables_ui
								all_geometries[i].drawVariablesEditor();
							}
							veToast(`Replaced descriptions for ${all_geometries.length} geometries in ${this.name}.`);
						})
					}, {
						name: "Replace Descriptions",
						can_rename: false,
						width: "30rem"
					});
				}, { name: "Replace Descriptions" }),
			}, {
				display: "inline",
				placeholder: "Search for action ...",
				style: {
					"> [component='ve-button']": {
						display: "inline",
						padding: 0
					}
				}
			})
		}, {
			name: "Actions",
			style: { padding: 0 },
			width: 99
		});
	}
	
	/**
	 * Returns an array of all {@link naissance.Geometry}|{@link naissance.Feature} instances housed in the Feature.
	 * - Method of: {@link naissance.Feature}
	 *
	 * @param {naissance.Feature} [arg0_object]
	 * @param {Object} [arg1_options]
	 *  @param {naissance.Feature[]} [arg1_options.owners]
	 *  @param {boolean} [arg1_options.refresh_metadata=false]
	 *  @param {string[]} [arg1_options.types=["Feature", "Geometry"]] - The types to filter for.
	 *
	 * @returns {naissance.Geometry[]}
	 */
	getAllEntities (arg0_object, arg1_options) {
		//Convert from parameters
		let object = (arg0_object) ? arg0_object : this;
		let options = (arg1_options) ? arg1_options : {};
		
		//Initialise options
		if (!options.owners) options.owners = [];
		if (!options.types) options.types = ["Feature", "Geometry"];
		
		//Declare local instance variables
		let all_entities = [];
		let owner_names = [];
		
		//Iterate over options.owners and fetch their .name
		for (let i = 0; i < options.owners.length; i++) {
			let local_name = options.owners[i]?.name;
			
			if (local_name) owner_names.push(local_name);
		}
		
		//Iterate over all .entities and check if they have .entities
		if (object?.entities)
			for (let i = 0; i < object.entities.length; i++) {
				let local_entity = object.entities[i];
				
				//Iterate over all options.types and determine if it is valid
				for (let x = 0; x < options.types.length; x++)
					if (local_entity instanceof naissance[options.types[x]]) {
						all_entities.push(local_entity);
						break;
					}
				
				if (local_entity) {
					//Edit metadata
					if (options.refresh_metadata) {
						if (!local_entity.metadata) local_entity.metadata = {};
						if (!local_entity.metadata.tags) local_entity.metadata.tags = [];
						
						//Iterate over all owner_names and ensure they inherit the proper tags if they don't exist, i.e. convert groups to tags
						for (let x = 0; x < owner_names.length; x++)
							if (!local_entity.metadata.tags.includes(owner_names[x]))
								local_entity.metadata.tags.push(owner_names[x]);
					}
					
					//Recurse if the entity has its own entities
					if (local_entity.entities)
						all_entities = all_entities.concat(this.getAllEntities(local_entity, {
							...options,
							owners: options.owners.concat([local_entity])
						}));
				}
			}
		
		//Return statement
		return all_entities;
	}
	
	/**
	 * Returns an array of all {@link naissance.Feature} instances housed in the Feature.
	 * 
	 * @param {naissance.Feature} arg0_object
	 * @param {Object} arg1_options
	 * 
	 * @returns {naissance.Geometry[]}
	 */
	getAllFeatures (arg0_object, arg1_options) {
		//Convert from parameters
		let object = arg0_object;
		let options = (arg1_options) ? arg1_options : {};
		
		//Return statement
		return this.getAllEntities(object, {
			...options,
			types: ["Feature"]
		});
	}
	
	/**
	 * Returns an array of all {@link naissance.Geometry} instances housed in the Feature.
	 *
	 * @param {naissance.Feature} [arg0_object]
	 * @param {Object} [arg1_options]
	 *  @param {naissance.Feature[]} [arg1_options.owners]
	 *
	 * @returns {naissance.Geometry[]}
	 */
	getAllGeometries (arg0_object, arg1_options) {
		//Convert from parameters
		let object = arg0_object;
		let options = (arg1_options) ? arg1_options : {};
		
		//Return statement
		return this.getAllEntities(object, {
			...options,
			types: ["Geometry"]
		});
	}
	
	getTimestamps () {
		//Declare local instance variables
		let all_geometries = this.getAllGeometries();
		let all_timestamps = [];
		
		//Iterate over all_geometries and their .history.keyframes
		for (let i = 0; i < all_geometries.length; i++) {
			all_timestamps = [...new Set([
				...all_timestamps, 
				...Object.keys(all_geometries[i].history.keyframes).map(Number)
			])];
		}
		
		//Return statement
		return all_timestamps.sort((a, b) => a - b);
	}
	
	getTurfGeometry () {
		//Declare local instance variables
		let all_geometries = this.getAllGeometries();
		let turf_geometry;
		
		//Iterate over all_geometries to fetch turf_geometry
		for (let i = 0; i < all_geometries.length; i++)
			if (all_geometries[i] instanceof naissance.GeometryPolygon)
				if (all_geometries[i].geometry) {
					let local_geometry = all_geometries[i].geometry;
					let local_turf_geometry = Geospatiale.convertMaptalksToTurf(local_geometry);
					
					if (!turf_geometry) {
						turf_geometry = local_turf_geometry;
					} else {
						turf_geometry = turf.union(turf.featureCollection([turf_geometry, local_turf_geometry]));
					}
				}
		
		//Return statement
		return turf_geometry;
	}
	
	hide () {
		//Declare local instance variables
		this._is_visible = false;
		
		//Iterate over all entities; attempt to hide all entities
		if (this.entities)
			for (let i = 0; i < this.entities.length; i++)
				if (this.entities[i].hide)
					this.entities[i].hide();
	}
	
	open (arg0_type, arg1_options) {
		//Convert from parameters
		let type = arg0_type;
		let options = (arg1_options) ? arg1_options : {};
		
		if (!this.quick_actions) this.quick_actions = veRawInterface({
			hide_visibility: veButton(() => {
				DALS.Timeline.parseAction("hide_feature", [{ feature_obj: this.id, set_visibility: false }]);
			}, {
				attributes: { class: "order-99 onhover-visible" },
				name: `<icon>visibility</icon>`,
				limit: () => this._is_visible,
				tooltip: "Hide Feature"
			}),
			show_visibility: veButton(() => {
				DALS.Timeline.parseAction("show_feature", [{ feature_obj: this.id, set_visibility: true }]);
			}, {
				attributes: { class: "order-99 onhover-visible" },
				name: "<icon>visibility_off</icon>",
				limit: () =>  !this._is_visible,
				tooltip: "Show Feature"
			}),
			delete_button: veButton(() => {
				veConfirm(`Are you sure you want to delete ${this.name}?`, {
					special_function: () => {
						//Declare local instance variables
						let old_name = this.name;
						
						super.close("instance");
						DALS.Timeline.parseAction("delete_feature", [{ feature_obj: this.id, delete_feature: true }]);
						veToast(`Deleted ${old_name}.`);
					}
				});
			}, {
				attributes: { class: "order-100 onhover-visible" },
				name: "<icon>delete</icon>",
				tooltip: "Delete",
			})
		}, {
			name: "<b>Quick Actions:</b>",
			style: {
				alignItems: "center",
				display: "flex",
				"[component='ve-button']": { marginLeft: "var(--padding)" },
			},
			width: 99
		});
		if (!this._interface) this._interface = veInterface({
			quick_actions: this.quick_actions,
			
			...((typeof this.drawUI === "function") ? this.drawUI() : {}),
			...ve.Class.getVercengenComponents(this)
		}, { is_folder: false });
		
		//Call super.open for naissance.Entity
		super.open(type, options);
	}
	
	remove () {
		//Declare local instance variables
		let delete_keys = ["_entities", "entities"]
		
		//Remove from naissance.Feature.instances
		delete naissance.Feature.instances[this.id];
		
		Object.iterate(naissance.Feature.instances, (local_key, local_feature) => {
			for (let i = 0; i < delete_keys.length; i++)
				if (local_feature[delete_keys[i]])
					for (let x = local_feature[delete_keys[i]].length - 1; x >= 0; x--)
						if (local_feature[delete_keys[i]][x].id === this.id)
							local_feature[delete_keys[i]].splice(x, 1);
		});
		
		//Remove from local_feature.entities
		if (this.hide) this.hide();
		if (this.entities)
			for (let i = 0; i < this.entities.length; i++)
				if (this.entities[i].id === this.id)
					this.entities[i].remove();
		
		//Rerender deleted feature and remove it from the map
		if (this.draw) this.draw();
		UI_Leftbar.refresh();
	}
	
	setID (arg0_id) {
		//Convert from parameters
		let id = arg0_id;
		
		//Declare local instance variables; shuffle ID
		let old_id = JSON.parse(JSON.stringify(this.id));
		this.id = id;
		naissance.Feature.instances[id] = this;
		delete naissance.Feature.instances[old_id];
	}
	
	show () {
		this._is_visible = true;``
		
		//Iterate over all entities; attempt to show all entities
		if (this.entities)
			for (let i = 0; i < this.entities.length; i++)
				if (this.entities[i].show)
					this.entities[i].show();
	}
};