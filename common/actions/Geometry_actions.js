/**
 * - #### Internal Commands:
 * - `.add_description`: {@link Object}
 *   - `.options`: {@link Object}
 *   - `.value`: {@link string}
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
 *   
 * @type {Object}
 */
config.actions.geometry = {
	add_column: {
		name: "Add Column",
		feature_name: "Add Columns",
		filters: ["Variables"],
		scope: ["Geometry"],
		
		draw_function: function () {
			//Return statement
			return {
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
					let values = (this.ui.add_variables_values) ? this.ui.add_variables_values : [];
					
					if (!this.ui.add_variables_key) {
						veToast(`<icon>warning</icon> You must set a valid field name.`);
						return;
					}
					
					//Add data to field
					DALS.Timeline.parseAction(`add_column_${this.ui.add_variables_key}`, {
						[this.getDALSKey()]: this.id,
						add_column: {
							key: this.ui.add_variables_key,
							values: values
						}
					});
					
					if (this instanceof naissance.Feature) {
						let all_geometries = this.getAllGeometries();
						
						veToast(`Added ${this.ui.add_variables_key} as a variable column to ${String.formatNumber(all_geometries.length)} geometries.`);
					} else {
						veToast(`Added ${this.ui.add_variables_key} as a variable column for ${this.name}.`);
					}
				}, { name: "Confirm" })
			};
		},
		special_function: async function (json) {
			//Declare local instance variables
			let geometry_obj = json.naissance_obj;
			
			//.add_column handling
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
		}
	},
	add_description: {
		name: "Add Description",
		feature_name: "Add Descriptions",
		scope: ["Geometry"],
		
		draw_function: function () {
			//Declare local instance variables
			if (!this.ui) this.ui = {};
			if (this.ui.add_descriptions_avoid_duplicates === undefined) this.ui.add_descriptions_avoid_duplicates = true;
			if (this.ui.add_descriptions_insert_at === undefined) this.ui.add_descriptions_insert_at = "append";
			if (this.ui.add_descriptions_insert_newline === undefined) this.ui.add_descriptions_insert_newline = true;
			if (this.ui.add_descriptions_search === undefined) this.ui.add_descriptions_search = "substring";
			
			//Return statement
			return {
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
					
					DALS.Timeline.parseAction("add_description", {
						[this.getDALSKey()]: this.id,
						add_description: {
							value: this.ui.add_descriptions_value,
							options: {
								avoid_duplicates: this.ui.add_descriptions_avoid_duplicates,
								case_sensitive: this.ui.add_descriptions_case_sensitive,
								insert_at: this.ui.add_descriptions_insert_at,
								insert_newline: this.ui.add_descriptions_insert_newline,
								search: this.ui.add_descriptions_search
							}
						}
					});
					
					//Feature/Geometry handling
					if (this instanceof naissance.Feature) {
						let all_geometries = this.getAllGeometries();
						
						veToast(`Added descriptions for ${all_geometries.length} geometries in ${this.name}.`);
					} else {
						veToast(`Added description to ${this.name}.`);
					}
				}, { name: "Confirm" })
			};
		},
		special_function: async function (json) {
			//Declare local instance variables
			let geometry_obj = json.naissance_obj;
			
			if (!geometry_obj.metadata) geometry_obj.metadata = {};
			if (!geometry_obj.metadata.description) geometry_obj.metadata.description = "";
			let description = geometry_obj.metadata.description;
			
			geometry_obj.metadata.description = String.editAddToString(description, json.add_description.value, json.add_description.options);
			
			if (geometry_obj.variables_ui) geometry_obj.variables_ui.remove();
			geometry_obj.drawVariablesEditor();
		}
	},
	add_properties: {
		name: "Add Properties",
		feature_name: "Add Properties",
		scope: ["Geometry"],
		
		draw_function: function () {
			//Return statement
			return {
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
					
					//Add properties
					DALS.Timeline.parseAction("add_properties", {
						[this.getDALSKey()]: this.id,
						add_properties: this.ui.add_property_values
					});
					
					if (this instanceof naissance.Feature) {
						let all_geometries = this.getAllGeometries();
						
						veToast(`Successfully altered ${String.formatNumber(this.ui.add_property_values.length)} properties for ${String.formatNumber(all_geometries.length)} geometries.`);
					} else {
						veToast(`Successfully altered ${String.formatNumber(this.ui.add_property_values.length)} properties for ${this.name}.`);
					}
				}, { name: "Confirm" })
			};
		},
		special_function: async function (json) {
			//Declare local instance variables
			let geometry_obj = json.naissance_obj;
			let json_packet = [];
			let values = json.add_properties;
			
			//Iterate over all values and populate json_packet
			for (let i = 0; i < values.length; i++)
				json_packet.push({
					geometry_obj: geometry_obj.id,
					set_properties: { date: values[i].date, value: values[i].value }
				});
			
			//Call set_properties
			DALS.Timeline.parseAction("set_properties", json_packet, true);
		}
	},
	add_tag: {
		name: "Add Tag",
		feature_name: "Add Tags",
		scope: ["Geometry"],
		
		draw_function: function () {
			//Return statement
			return {
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
					let tag_mode = (this.ui.add_tag_mode || "append");
					
					if (!(this.ui?.add_tag_key?.length > 0)) {
						veToast(`<icon>warning</icon> You must specify a valid tag key to add.`);
						return;
					}
					
					DALS.Timeline.parseAction("add_tag", {
						[this.getDALSKey()]: this.id,
						add_tag: {
							key: this.ui.add_tag_key,
							mode: tag_mode,
							position: (tag_mode === "insert") ? this.ui.add_tag_insert_at_position : undefined
						}
					});
					
					if (this instanceof naissance.Feature) {
						let all_geometries = this.getAllGeometries();
						
						veToast(`Added ${this.ui.add_tag_key} to ${String.formatNumber(all_geometries.length)} geometries.`);
					} else {
						veToast(`Added ${this.ui.add_tag_key} to ${this.name}.`);
					}
				}, { name: "Confirm" })
			};
		},
		special_function: async function (json) {
			//Declare local instance variables
			let geometry_obj = json.naissance_obj;
			let tag_mode = json.add_tag.mode;
			let tag_key = json.add_tag.key;
			let tag_position = json.add_tag.position;
			
			//Ensure .metadata.tags exists for geometry_obj
			if (!geometry_obj.metadata) geometry_obj.metadata = {};
			if (!geometry_obj.metadata.tags) geometry_obj.metadata.tags = [];
			
			//Insert tag
			if (tag_mode === "append") {
				geometry_obj.metadata.tags.push(tag_key);
			} else if (tag_mode === "insert") {
				geometry_obj.metadata.tags.splice(
					Math.returnSafeNumber(tag_position), 0, tag_key);
			} else if (tag_mode === "prepend") {
				geometry_obj.metadata.tags.unshift(tag_key);
			}
		}
	},
	add_variable: {
		name: "Add Variable",
		feature_name: "Add Variables",
		scope: ["Geometry"],
		
		draw_function: function () {
			//Return statement
			return {
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
					DALS.Timeline.parseAction(`add_variable_${this.ui.add_variable_key}`, {
						[this.getDALSKey()]: this.id,
						add_variable: {
							date: actual_date,
							key: this.ui.add_variable_key,
							value: (this.ui.add_variable_value !== undefined) ? this.ui.add_variable_value : ""
						}
					});
				}, { name: "Confirm" })
			};
		},
		special_function: async function (json) {
			//Declare local instance variables
			let geometry_obj = json.naissance_obj;
			
			//.add_variable handling
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
		}
	},
	clean_keyframes: {
		name: "Clean Keyframes",
		feature_name: "Clean Keyframes",
		scope: ["Geometry"],
		
		draw_function: function () {
			//Return statement
			return {
				clean_symbols: veToggle(this.ui.clean_symbols, {
					name: "Clean Symbols",
					onuserchange: (v) => this.ui.clean_symbols = v
				}),
				clean_keyframes: veButton(() => {
					//Declare local instance variables
					let all_flags = [];
					if (this.ui.clean_symbols) all_flags.push("symbol");
					
					DALS.Timeline.parseAction("clean_keyframes", {
						[this.getDALSKey()]: this.id,
						clean_keyframes: all_flags
					});
					
					veToast(`Cleaned keyframes.`);
				}, { name: "Confirm" })
			};
		},
		special_function: async function (json) {
			//Declare local instance variables
			let current_brush_symbol = main.brush.getBrushSymbol();
			let geometry_obj = json.naissance_obj;
			
			//Symbol cleaning
			if (json.clean_keyframes.includes("symbol")) {
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
		}
	},
	debug_geometry: {
		name: "Debug Geometry",
		scope: ["Geometry"],
		do_not_bind_to_feature: true,
		
		draw_function: function () {
			window.$geometry = this;
			console.log(`Geometry logged as:`, window.$geometry);
			veToast(`Geometry logged to console.`);
			return undefined;
		}
	},
	delete_description: {
		name: "Delete Description",
		feature_name: "Delete Descriptions",
		scope: ["Geometry"],
		
		draw_function: function () {
			veConfirm(`Are you sure you want to clear all descriptions for ${this.name}?`, {
				special_function: () => {
					DALS.Timeline.parseAction("delete_description", {
						[this.getDALSKey()]: this.id,
						delete_description: true
					})
					
					if (this instanceof naissance.Feature) {
						let all_geometries = this.getAllGeometries();
						veToast(`Removed descriptions for ${String.formatNumber(all_geometries.length)} items.`);
					} else {
						veToast(`Removed description for ${this.name}.`);
					}
				}
			});
			return undefined;
		},
		special_function: async function (json) {
			//Declare local instance variables
			let geometry_obj = json.naissance_obj;
			
			delete geometry_obj.metadata.description;
		}
	},
	delete_geometry: {
		name: "Delete Geometry",
		feature_name: "Delete Geometries",
		scope: ["Geometry"],
		
		draw_function: function () {
			//Declare local instance variables
			let current_name = this.name;
			
			//Return statement
			return {
				label: veHTML(`Are you sure you want to delete ${current_name}?`),
				confirm: veButton(() => {
					DALS.Timeline.parseAction("delete_geometry", {
						[this.getDALSKey()]: this.id,
						delete_geometry: true
					});
					
					//Delete all geometries in scope
					if (this instanceof naissance.Feature) {
						veToast(`Deleted all geometries in ${current_name}.`);
					} else {
						veToast(`Deleted ${current_name}.`);
					}
				})
			};
		},
		special_function: async function (json) {
			if (json.delete_geometry === true) json.naissance_obj.remove();
		}
	},
	delete_tags: {
		name: "Delete Tags",
		feature_name: "Delete Tags",
		scope: ["Geometry"],
		
		draw_function: function () {
			//Return statement
			return {
				label: veHTML(`Removes all tags from ${this.name}.`),
				confirm: veButton(() => {
					DALS.Timeline.parseAction("delete_tags", {
						[this.getDALSKey()]: this.id,
						delete_tags: true
					});
					
					//Delete all tags in scope
					if (this instanceof naissance.Feature) {
						veToast(`Deleted all tags for geometries in ${this.name}.`);
					} else {
						veToast(`Deleted all tags.`);
					}
				})
			}
		},
		special_function: async function (json) {
			try { delete json.naissance_obj.metadata.tags; } catch (e) {}
		}
	},
	edit_symbol_or_property: {
		name: "Edit Symbol/Property",
		feature_name: "Edit Symbols/Properties",
		scope: ["Geometry"],
		
		draw_function: function () {
			//Declare local instance variables
			let date_type = () => (this.ui.edit_symbol_property_date_type || "current_date");
			let mode = () => (this.ui.edit_symbol_property_mode || "property_to_symbol");
			
			let end_date = this.ui.edit_symbol_property_end_date;
			let start_date = this.ui.edit_symbol_property_start_date;
			let timestamps = (this.history) ? this.history.getTimestamps() : this.getTimestamps();
			
			//Return statement
			return {
				date_type: veSelect({
					all_keyframes: { name: "All Keyframes" },
					current_date: { name: "Current Date" },
					date_range: { name: "Date Range" },
					end_keyframe: { name: "End Keyframe" },
					start_keyframe: { name: "Start Keyframe" }
				}, {
					name: "Date Type",
					selected: date_type(),
					onuserchange: (v) => this.ui.edit_symbol_property_date_type = v
				}),
				date_range: veInterface({
					start_date: veDate((start_date !== undefined) ? start_date : timestamps[0], {
						name: "Start Date",
						onuserchange: (v) => this.ui.edit_symbol_property_start_date = v
					}),
					end_date: veDate((end_date !== undefined) ? end_date : timestamps[timestamps.length - 1], {
						name: "End Date",
						onuserchange: (v) => this.ui.edit_symbol_property_end_date = v
					})
				}, { 
					limit: () => this.ui.edit_symbol_property_date_type === "date_range",
					name: "Date Range",
					open: true,
				}),
				mode: veSelect({
					property_to_property: { name: "Property to Property" },
					property_to_symbol: { name: "Property to Symbol" },
					symbol_to_property: { name: "Symbol to Property" },
					symbol_to_symbol: { name: "Symbol to Symbol" }
				}, {
					name: "Mode",
					selected: mode(),
					onuserchange: (v) => this.ui.edit_symbol_property_mode = v
				}),
				do_not_delete: veToggle(this.ui.edit_symbol_property_do_not_delete, {
					name: "Do Not Delete",
					tooltip: "Whether to delete the original key being copied from.",
					onuserchange: (v) => this.ui.edit_symbol_property_do_not_delete = v
				}),
				from_key: veText(this.ui.edit_symbol_property_from_key, {
					name: "From Key",
					onuserchange: (v) => this.ui.edit_symbol_property_from_key = v
				}),
				to_key: veText(this.ui.edit_symbol_property_to_key, {
					name: "To Key",
					onuserchange: (v) => this.ui.edit_symbol_property_to_key = v
				}),
				confirm: veButton(() => {
					if (!this.ui.edit_symbol_property_from_key) {
						veToast(`<icon>warning</icon> You must specify a key to copy from.`);
						return;
					}
					if (!this.ui.edit_symbol_property_to_key) {
						veToast(`<icon>warning</icon> You must specify a key to copy to.`);
						return;
					}
					
					DALS.Timeline.parseAction("edit_symbol_or_property", {
						[this.getDALSKey()]: this.id,
						edit_symbol_or_property: {
							date_type: date_type(),
							do_not_delete: this.ui.edit_symbol_property_do_not_delete,
							mode: mode(),
							from_key: this.ui.edit_symbol_property_from_key,
							to_key: this.ui.edit_symbol_property_to_key,
						}
					});
					
					if (this instanceof naissance.Feature) {
						veToast(`Edited properties for all geometries in ${this.name}.`);
					} else {
						veToast(`Edited properties for ${this.name}.`);
					}
				}, { name: "Confirm" })
			};
		},
		/**
		 * @param {Object} json
		 *  @param {Object[]|number[]|string} [json.edit_symbol_or_property.date_type="current_date"] - Either a date range (Array), or 'all_keyframes'/'current_date'/'end_keyframe'/'start_keyframe'
		 *  @param {boolean} [json.edit_symbol_or_property.do_not_delete=false]
		 *  @param {string} [json.edit_symbol_or_property.mode="property_to_symbol"] - Either 'property_to_property'/'property_to_symbol'/'symbol_to_property'/'symbol_to_symbol'
		 *
		 *  @param {string} json.edit_symbol_or_property.from_key
		 *  @param {string} json.edit_symbol_or_property.to_key
		 *  
		 * @returns {Promise<void>}
		 */
		special_function: async function (json) {
			//Declare local instance variables
			let action_json = json.edit_symbol_or_property;
			let date_type = (action_json.date_type || "current_date");
			let geometry_obj = json.naissance_obj;
			let mode = (action_json.mode || "property_to_symbol");
			let timestamps = geometry_obj.getTimestamps(date_type);
			
			let from_index;
			let to_index;
			
			//Iterate over timestamps and act on .mode
			for (let i = 0; i < timestamps.length; i++) {
				let local_keyframe = geometry_obj.history.keyframes[timestamps[i]];
				if (!local_keyframe) continue;
				
				let local_value = local_keyframe.value;
				
				if (mode === "property_to_property") {
					from_index = 2; to_index = 2;
				} else if (mode === "property_to_symbol") {
					from_index = 2; to_index = 1;
				} else if (mode === "symbol_to_property") {
					from_index = 1; to_index = 2;
				} else if (mode === "symbol_to_symbol") {
					from_index = 1; to_index = 1;
				}
				
				if (local_value[from_index]) {
					let from_value = structuredClone(Object.getValue(local_value[from_index], action_json.from_key));
					
					if (!local_value[to_index]) local_value[to_index] = {};
					Object.setValue(local_value[to_index], action_json.to_key, from_value);
					if (!action_json.do_not_delete)
						Object.deleteValue(local_value[from_index], action_json.from_key);
				}
			}
		}
	},
	link_geometry: {
		name: "Link Geometry",
		feature_name: "Link Geometries",
		scope: ["Geometry"],
		
		draw_function: function () {
			//Return statement
			return {
				link_geometry_with: new UI_GeometryDatalist(this.ui.link_geometry_with_id, {
					name: "Link to Geometry:",
					onuserchange: (v) => this.ui.link_geometry_with_id = v
				}),
				confirm: veButton(() => {
					//Internal guard clauses to prevent invalid operations
					if (!this.ui.link_geometry_with_id) {
						veToast(`<icon>warning</icon> You must select a valid Geometry to link to.`)
						return;
					}
					
					let linked_geometry = naissance.Geometry.instances[this.ui.link_geometry_with_id];
					
					if (!linked_geometry) {
						veToast(`<icon>warning</icon> The linked geometry no longer exists.`);
						return;
					}
					if (linked_geometry.class_name !== this.class_name) {
						veToast(`<icon>warning</icon> You may only link to geometries of the same type.`);
						return;
					}
					if (linked_geometry?.metadata?.linked_id) {
						veToast(`<icon>warning</icon> You cannot recursively link geometries.`);
						return;
					}
					
					let from_layer = this.getLayer();
					let to_layer = linked_geometry.getLayer();
					
					if (from_layer.id === to_layer.id) {
						veToast(`<icon>warning</icon> You cannot claim geometries are identical within the same layer. Move ${this.name} to a new layer first.`);
						return;
					}
					
					if (!this.metadata) this.metadata = {};
					this.metadata.linked_id = this.ui.link_geometry_with_id;
					
					if (this instanceof naissance.Geometry) {
						veToast(`Linked ${this.name} with ${linked_geometry.name}`);
					} else {
						veToast(`Linked all Geometries in ${this.name} with ${linked_geometry.name}`);
					}
				}, { name: "Confirm" })
			};
		},
		special_function: async function (json) {
			//Declare local instance variables
			let geometry_obj = json.naissance_obj;
			
			if (!geometry_obj.metadata) geometry_obj.metadata = {};
			geometry_obj.metadata.linked_id = json.link_geometry;
		}
	},
	manage_relations: {
		name: "Manage Relations",
		feature_name: "Manage Geometry Relations",
		scope: ["Geometry"],
		do_not_bind_to_feature: true,
		
		draw_function: function () {
			//Return statement
			return {
				add_remove: veSelect({
					add: { name: "Start" },
					remove: { name: "End" }
				}, {
					name: "Start/End Relationship",
					onuserchange: (v) => this.ui.add_relation_modifier = v,
					selected: (this.ui.add_relation_with_id) ? this.ui.add_relation_with_id : "add"
				}),
				relation_mode: veSelect({
					clear: { name: "Clear" },
					direct: { name: "Direct" },
					indirect: { name: "Indirect" },
					remove_direct: { name: "Remove Direct" },
					remove_indirect: { name: "Remove Indirect" },
					replace: { name: "Replace" }
				}, {
					name: "Mode",
					tooltip: "Direct relationships are with other geometries, indirect relations are detached (similar to tags).",
					
					onuserchange: (v) => this.ui.add_relation_mode = v,
					selected: (this.ui.add_relation_mode) ? this.ui.add_relation_mode : "direct",
				}),
				relation_with: new UI_GeometryDatalist(this.ui.add_relation_with_id, {
					name: "Add Relation with Geometry:",
					limit: () => !["clear", "indirect", "remove_indirect"].includes(this.ui.add_relation_mode),
					onuserchange: (v) => this.ui.add_relation_with_id = v
				}),
				relation_date: veDate((this.ui.add_relation_date !== undefined) ? this.ui.add_relation_date : main.date, {
					name: "Relation Date:",
					onuserchange: (v) => this.ui.add_relation_date = v,
					tooltip: "The date at which this relation begins."
				}),
				relation_name: veText(this.ui.add_relation_type, {
					name: "Relation Name:",
					limit: () => !["clear"].includes(this.ui.add_relation_mode),
					onuserchange: (v) => this.ui.add_relation_type = v
				}),
				confirm: veButton(() => {
					naissance.Geometry.Action_manageRelations.call(this);
				}, { name: "Confirm" })
			};
		}
	},
	merge_geometry: {
		name: "Merge Geometry",
		feature_name: "Merge Geometries",
		scope: ["Geometry"],
		
		special_function: async function (json) {
			//Declare local instance variables
			let geometry_obj = json.naissance_obj;
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
							DALS.Timeline.parseAction("add_to_polygon", {
								type: "GeometryPolygon",
								geometry_obj: geometry_obj.id,
								add_to_polygon: {
									geometry: from_value[0],
									date: union_timestamps[i]
								}
							}, true);
						} else if (geometry_obj.class_name === "GeometryLine") {
							DALS.Timeline.parseAction("add_to_line", {
								type: "GeometryLine",
								geometry_obj: geometry_obj.id,
								add_to_line: {
									geometry: from_value[0],
									date: union_timestamps[i]
								}
							}, true);
						} else if (geometry_obj.class_name === "GeometryPoint") {
							DALS.Timeline.parseAction("add_to_point", {
								type: "GeometryPoint",
								geometry_obj: geometry_obj.id,
								add_to_point: {
									geometry: from_value[0],
									date: union_timestamps[i]
								}
							}, true);
						}
					
					//Transfer non-geometric history data (metadata/attributes)
					if (from_value?.length > 1) {
						let extra_values = from_value.slice(1);
						geometry_obj.history.addKeyframe(union_timestamps[i], undefined, ...extra_values);
					}
				}
			}
		}
	},
	move_keyframe: {
		name: "Move Keyframe",
		feature_name: "Move Geometry Keyframes",
		scope: ["Geometry"],
		
		draw_function: function () {
			//Declare local instance variables
			let from_date = () => (this.ui.move_keyframe_from_date) ? 
				this.ui.move_keyframe_from_date : main.timestamp;
			let to_date = () => (this.ui.move_keyframe_to_date) ? 
				this.ui.move_keyframe_to_date : main.timestamp;
			
			//Return statement
			return {
				from_date: veDate(from_date(), {
					name: "From Date",
					onuserchange: (v) => this.ui.move_keyframe_from_date = v
				}),
				to_date: veDate(to_date(), {
					name: "To Date",
					onuserchange: (v) => this.ui.move_keyframe_to_date = v
				}),
				confirm: veButton(() => {
					//Declare local instance variables
					let timestamp = from_date();
					let ot_timestamp = to_date();
					
					if (timestamp === ot_timestamp) {
						veToast(`<icon>warning</icon> You must specify a different date to move to.`);
						return;
					}
					
					//Parse action
					DALS.Timeline.parseAction("move_keyframe", {
						[this.getDALSKey()]: this.id,
						move_keyframe: {
							date: timestamp,
							ot_date: ot_timestamp
						}
					});
					
					if (this instanceof naissance.Feature) {
						veToast(`Moved keyframe from ${String.formatDate(from_date())} to ${String.formatDate(to_date())} for all geometries in ${this.name}.`);
					} else {
						veToast(`Moved keyframe from ${String.formatDate(from_date())} to ${String.formatDate(to_date())} for ${this.name}.`);
					}
				})
			};
		},
		special_function: async function (json) {
			//Declare local instance variables
			let geometry_obj = json.naissance_obj;
			
			//Move keyframe and redraw
			geometry_obj.history.moveKeyframe(json.move_keyframe.date, json.move_keyframe.ot_date);
			geometry_obj.history.draw(geometry_obj.keyframes_ui);
		}
	},
	move_to_feature: {
		name: "Move To Feature",
		feature_name: "Move Geometries to Feature",
		scope: ["Geometry"],
		
		draw_function: function () {
			//Return statement
			return {
				to_feature: new UI_FeatureDatalist(this.ui.to_feature_id, {
					name: `Move To Feature`,
					filter_types: ["FeatureGroup", "FeatureLayer"],
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
						DALS.Timeline.parseAction(`move_to_feature`, {
							[this.getDALSKey()]: this.id,
							move_to_feature: this.ui.to_feature_id
						});
						
						if (this instanceof naissance.Feature) {
							veToast(`Moved all geometries from ${this.name} to ${ot_feature.name}.`);
						} else {
							veToast(`Moved geometry to from ${this.name} to ${ot_feature.name}.`);
						}
					} catch (e) { console.error(e); }
				}, { name: "Confirm" })
			};
		},
		special_function: async function (json) {
			//Declare local instance variables
			let feature_obj = naissance.Feature.instances[json.move_to_feature];
			let geometry_obj = json.naissance_obj;
			
			//Attempt to move to feature
			geometry_obj.moveToFeature(feature_obj);
		}
	},
	refresh_label_geometries: {
		name: "Refresh Label Geometries",
		feature_name: "Refresh Label Geometries",
		scope: ["Geometry"],
		do_not_bind_to_feature: true,
		
		special_function: async function (json) {
			//Declare local instance variables
			let geometry_obj = json.naissance_obj;
			let label_geometries = (geometry_obj?.value?.[2]?.label_geometries || []);
			console.log(`Label geometries:`, geometry_obj, geometry_obj.label_geometries)
			
			//Commit existing label_geometries
			if (json.refresh_label_geometries) {
				geometry_obj.addKeyframe(main.date, undefined, geometry_obj.value[1], {
					...geometry_obj.value[2],
					label_geometries
				});
			}
		}
	},
	remove_column: {
		name: "Remove Columns",
		feature_name: "Remove Columns",
		scope: ["Geometry"],
		
		special_function: async function (json) {
			//Declare local instance variables
			let geometry_obj = json.naissance_obj;
			
			Object.iterate(geometry_obj.history, (local_key, local_value) => {
				if (local_value?.value?.[2]?.variables)
					delete local_value.value[2].variables[json.remove_variable];
			});
			geometry_obj.history.cleanKeyframes(); //Clean keyframes just in-case
		}
	},
	remove_keyframe: {
		name: "Remove Keyframe",
		feature_name: "Remove Keyframes",
		scope: ["Geometry"],
		
		special_function: async function (json) {
			//Declare local instance variables
			let geometry_obj = json.naissance_obj;
			
			//Remove keyframe and redraw
			geometry_obj.removeKeyframe(json.remove_keyframe);
			geometry_obj.history.draw(geometry_obj.keyframes_ui);
		}
	},
	remove_property: {
		name: "Remove Property",
		feature_name: "Remove Properties",
		scope: ["Geometry"],
		
		draw_function: function () {
			//Return statement
			return {
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
					
					DALS.Timeline.parseAction("remove_property", {
						[this.getDALSKey()]: this.id,
						remove_property: {
							date: this.ui.remove_property_date,
							key: this.ui.remove_property_key
						}
					});
					
					if (this instanceof naissance.Feature) {
						let all_geometries = this.getAllGeometries();
						
						veToast(`Removed property ${this.ui.remove_property_key} from ${String.formatNumber(all_geometries.length)} geometries.`);
					} else {
						veToast(`Removed property ${this.ui.remove_property_key} from ${this.name}.`);
					}
				}, { name: "Confirm" })
			};
		},
		special_function: async function (json) {
			//Declare local instance variables
			let geometry_obj = json.naissance_obj;
			
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
	},
	remove_tag: {
		name: "Remove Tag",
		feature_name: "Remove Tags",
		scope: ["Geometry"],
		
		draw_function: function () {
			//Return statement
			return {
				tag_key: veText(this.ui.remove_tag_key, {
					name: "Tag Key",
					onuserchange: (v) => this.ui.remove_tag_key = v
				}),
				confirm: veButton(() => {
					if (!this.ui.remove_tag_key) {
						veToast(`<icon>warning</icon> You must specify a valid tag key to remove.`);
						return;
					}
					
					DALS.Timeline.parseAction("remove_tag", {
						[this.getDALSKey()]: this.id,
						remove_tag: this.ui.remove_tag_key
					});
					
					if (this instanceof naissance.Feature) {
						let all_geometries = this.getAllGeometries();
						veToast(`Removed tag ${this.ui.remove_tag_key} from ${String.formatNumber(all_geometries.length)} geometries.`);
					} else {
						veToast(`Removed tag ${this.ui.remove_tag_key} from ${this.name}.`);
					}
				}, { name: "Confirm" })
			};
		},
		special_function: async function (json) {
			//Declare local instance variables
			let geometry_obj = json.naissance_obj;
			
			//Check that tags exist prior to removal
			if (geometry_obj.metadata?.tags) {
				let tags = geometry_obj.metadata.tags;
				
				for (let i = tags.length - 1; i >= 0; i--)
					if (tags[i] === json.remove_tag) tags.splice(i, 1);
			}
		}
	},
	remove_variable: {
		name: "Remove Variable",
		feature_name: "Remove Variables",
		scope: ["Geometry"],
		
		draw_function: function () {
			//Return statement
			return {
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
					
					for (let i = 0; i < all_geometries.length; i++)
						if (all_geometries[i].id) all_geometry_ids.push(all_geometries[i].id);
					
					DALS.Timeline.parseAction("remove_variable", {
						[this.getDALSKey()]: this.id,
						remove_variable: {
							date: actual_date,
							key: this.ui.remove_variable_key
						}
					});
					
					if (this instanceof naissance.Feature) {
						let all_geometries = this.getAllGeometries();
						
						veToast(`Removed variable ${this.ui.remove_variable_key} from ${String.formatNumber(all_geometries.length)} geometries.`);
					} else {
						veToast(`Removed variable ${this.ui.remove_variable_key} from ${this.name}.`);
					}
				}, { name: "Confirm" })
			};
		},
		special_function: async function (json) {
			//Declare local instance variables
			let geometry_obj = json.naissance_obj;
			let timestamp;
			
			//Remove variable and update keyframes
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
	},
	replace_description: {
		name: "Replace Description",
		feature_name: "Replace Descriptions",
		scope: ["Geometry"],
		
		draw_function: function () {
			//Return statement
			return {
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
					
					DALS.Timeline.parseAction("replace_description", {
						[this.getDALSKey()]: this.id,
						replace_description: {
							find_value: this.ui.replace_descriptions_find_value,
							replace_value: this.ui.replace_descriptions_replace_value,
							options: {
								case_sensitive: this.ui.replace_descriptions_case_sensitive,
								remove_all: this.ui.replace_descriptions_remove_all,
								remove_order: this.ui.replace_descriptions_remove_order,
								search: this.ui.replace_descriptions_search
							}
						}
					});
					
					//Declare local instance variables
					if (this instanceof naissance.Feature) {
						let all_geometries = this.getAllGeometries();
						
						veToast(`Replaced descriptions for ${all_geometries.length} geometries in ${this.name}.`);
					} else {
						veToast(`Replaced description for ${this.name}.`);
					}
				})
			};
		},
		special_function: async function (json) {
			//Declare local instance variables
			let geometry_obj = json.naissance_obj;
			
			//Edit description
			if (geometry_obj?.metadata?.description) {
				geometry_obj.metadata.description = String.editReplaceInString(
					geometry_obj.metadata.description,
					json.replace_description.find_value,
					json.replace_description.replace_value,
					json.replace_description.options
				);
				if (geometry_obj.metadata.description?.length === 0)
					delete geometry_obj.metadata.description;
				
				if (geometry_obj.variables_ui) geometry_obj.variables_ui.remove(); //Free previous variables_ui
				geometry_obj.drawVariablesEditor();
			}
		}
	},
	select_geometry: {
		name: "Select Geometry",
		feature_name: "Select Geometries",
		scope: ["Geometry"],
		
		draw_function: function () {
			//Select geometries in scope
			DALS.Timeline.parseAction("select_geometry", {
				[this.getDALSKey()]: this.id,
				select_geometry: true
			});
			
			if (this instanceof naissance.Feature) {
				veToast(`Selected all geometries in ${this.name}.`);
			} else {
				veToast(`Selected ${this.name}.`);
			}
			
			//Return statement
			return undefined;
		},
		special_function: async function (json) {
			//Declare local instance variables
			let geometry_obj = json.naissance_obj;
			
			geometry_obj.selected = true;
		}
	},
	set_geometry: {
		name: "Set Geometry",
		feature_name: "Set Geometries",
		scope: ["Geometry"],
		
		special_function: async function (json) {
			//Declare local instance variables
			let geometry_obj = json.naissance_obj;
			
			//Set geometry (null = hide coords)
			if (json.set_geometry) {
				geometry_obj.addKeyframe(main.date, json.set_geometry);
			} else if (json.set_geometry === null) {
				geometry_obj.addKeyframe(main.date, null);
			}
		}
	},
	set_history: {
		name: "Set History",
		feature_name: "Set Histories",
		scope: ["Geometry"],
		
		special_function: async function (json) {
			if (json.set_history) json.naissance_obj.history.fromJSON(json.set_history);
		}
	},
	set_label_symbol: {
		name: "Set Label Symbol",
		feature_name: "Set Label Symbols",
		scope: ["Geometry"],
		
		special_function: async function (json) {
			//Declare local instance variables
			let geometry_obj = json.naissance_obj;
			
			//Set label symbol
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
		}
	},
	set_name: {
		name: "Set Name",
		feature_name: "Set Names",
		scope: ["Geometry"],
		
		special_function: async function (json) {
			//Declare local instance variables
			let date = main.date;
				if (typeof json.set_name === "object" && json.set_name.date !== undefined)
					date = json.set_name.date;
			let geometry_obj = json.naissance_obj;
			
			let old_name = geometry_obj.name;
				if (old_name) old_name = old_name.trim();
			let new_name;
				if (typeof json.set_name === "object") {
					new_name = json.set_name.name;
				} else if (typeof json.set_name === "string") {
					new_name = json.set_name;
				}
				if (new_name) new_name = new_name.trim();
			
			//Set new name if different
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
	},
	set_properties: {
		name: "Set Properties",
		feature_name: "Set Properties",
		scope: ["Geometry"],
		
		special_function: async function (json) {
			//Declare local instance variables
			let geometry_obj = json.naissance_obj;
			
			//Set properties as needed
			if (json.set_properties) {
				if (json.set_properties.date) {
					geometry_obj.addKeyframe(json.set_properties.date, undefined, undefined, json.set_properties.value);
				} else {
					geometry_obj.addKeyframe(main.date, undefined, undefined, json.set_properties);
				}
			} else if (json.set_properties === null) {
				geometry_obj.addKeyframe(main.date, undefined, undefined, null);
			}
		}
	},
	set_symbol: {
		name: "Set Symbol",
		scope: ["Geometry"],
		
		special_function: async function (json) {
			//Declare local instance variables
			let geometry_obj = json.naissance_obj;
			
			//Set symbol
			if (json.set_symbol) {
				geometry_obj.addKeyframe(main.date, undefined, json.set_symbol);
			} else if (json.set_symbol === null) {
				geometry_obj.addKeyframe(main.date, undefined, null);
			}
		}
	},
	set_tags: {
		name: "Set Tags",
		feature_name: "Set Tags",
		scope: ["Geometry"],
		
		special_function: async function (json) {
			//Declare local instance variables
			let geometry_obj = json.naissance_obj;
			
			//Set tags
			if (json.set_tags) geometry_obj.metadata.tags = Array.toArray(json.set_tags);
		}
	},
	set_zoom: {
		name: "Set Zoom Visibility",
		feature_name: "Set Zoom Visibility",
		scope: ["Geometry"],
		
		draw_function: function () {
			//Return statement
			return {
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
					
					DALS.Timeline.parseAction("set_zoom",{
						[this.getDALSKey()]: this.id,
						set_zoom: {
							is_start_keyframe: (this.ui.set_zoom_is_start),
							max_zoom: (current_max === -1) ? "delete" : current_max,
							min_zoom: (current_min === -1) ? "delete" : current_min
						}
					});
					
					veToast(`Successfully updated zoom visibility for ${this.name}.`);
					this.set_zoom_window.close();
				}, { name: "Confirm" })
			};
		},
		special_function: async function (json) {
			//Declare local instance variables
			let geometry_obj = json.naissance_obj;
			
			//Set zoom
			if (json.set_zoom) {
				let zoom_date = (json.set_zoom.is_start_keyframe) ?
					geometry_obj.history.getFirstKeyframe().timestamp : main.date;
				let zoom_props = {};
				
				if (json.set_zoom.max_zoom !== undefined)
					(json.set_zoom.max_zoom === "delete") ? DALS.Timeline.parseAction("set_max_zoom", {
						geometry_obj: geometry_obj.id,
						remove_property: { key: "max_zoom" },
					}) : (zoom_props.max_zoom = json.set_zoom.max_zoom);
				
				if (json.set_zoom.min_zoom !== undefined)
					(json.set_zoom.min_zoom === "delete") ? DALS.Timeline.parseAction("set_min_zoom", {
						geometry_obj: geometry_obj.id,
						remove_property: { key: "min_zoom" },
					}) : (zoom_props.min_zoom = json.set_zoom.min_zoom);
				
				if (Object.keys(zoom_props).length > 0)
					geometry_obj.history.addKeyframe(zoom_date, undefined, undefined, zoom_props);
			}
		}
	},
	unlink_geometry: {
		name: "Unlink Geometry",
		feature_name: "Unlink Geometries",
		scope: ["Geometry"],
		
		draw_function: function () {
			DALS.Timeline.parseAction("unlink_geometry", {
				[this.getDALSKey()]: this.id,
				unlink_geometry: true
			});
			
			if (this instanceof naissance.Feature) {
				veToast(`Unlinked all geometries in ${this.name}.`);
			} else {
				veToast(`Unlinked ${this.name}.`);
			}
			
			//Return statement
			return undefined;
		},
		special_function: async function (json) {
			//Declare local instance variables
			let geometry_obj = json.naissance_obj;
			
			//Unlink geometry
			if (json.unlink_geometry)	delete geometry_obj.metadata.linked_id;
		}
	},
};