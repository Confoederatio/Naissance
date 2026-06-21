if (!global.naissance) global.naissance = {};
naissance.Geometry = class extends naissance.Entity {
	static special_properties = ["hidden", "label_geometries", "label_name", "label_symbol", "max_zoom", "min_zoom", "name", "variables"];
	
	static history_localisation_function = (new_keyframe, old_keyframe) => {
		//Declare local instance variables
		let return_string = [];
		
		try {
			//[0] .geometry change
			if (new_keyframe.value[0])
				return_string.push(`Geometry changed`);
			if (new_keyframe.value[0] === null)
				return_string.push(`Geometry removed`);
			
			//[1] .symbol change
			if (new_keyframe.value[1])
				return_string.push(`Symbol changed to: ${String.formatObject(new_keyframe.value[1])}`);
			
			//[2] .properties change
			if (new_keyframe.value[2]?.hidden === false)
				return_string.push(`Geometry visible`);
			if (new_keyframe.value[2]?.hidden === true)
				return_string.push(`Geometry hidden`);
			if (new_keyframe.value[2]?.label_geometries)
				if (new_keyframe.value[2].label_geometries.length > 0)
					return_string.push(`Set custom label geometries`);
			if (new_keyframe.value[2]?.label_name)
				return_string.push(`Label name changed to: ${new_keyframe.value[2].label_name}`);
			if (new_keyframe.value[2]?.label_symbol)
				return_string.push(`Label symbol changed to: ${String.formatObject(new_keyframe.value[2].label_symbol)}`);
			if (new_keyframe.value[2]?.max_zoom !== undefined)
				return_string.push(`Maximum zoom set to ${new_keyframe.value[2].max_zoom}`);
			if (new_keyframe.value[2]?.min_zoom !== undefined)
				return_string.push(`Minimum zoom set to ${new_keyframe.value[2].min_zoom}`);
			if (new_keyframe.value[2]?.name)
				return_string.push(`Name changed to ${new_keyframe.value[2].name}`);
			if (new_keyframe.value[2]?.variables) {
				let variables_obj = JSON.parse(JSON.stringify(new_keyframe.value[2].variables));
				
				if (variables_obj.Relation) {
					return_string.push(naissance.Geometry.parseRelationsString(new_keyframe.timestamp, variables_obj.Relation));
					delete variables_obj.Relation;
				}
				if (Object.keys(variables_obj).length > 0)
					return_string.push(`Variables changed to: ${String.formatObject(variables_obj)}`);
			}
			
			if (new_keyframe.value[2]) {
				let all_property_keys = Object.keys(new_keyframe.value[2]);
				let remainder_obj = {};
				
				for (let i = 0; i < all_property_keys.length; i++)
					if (!naissance.Geometry.special_properties.includes(all_property_keys[i]))
						remainder_obj[all_property_keys[i]] = new_keyframe.value[2][all_property_keys[i]];
				
				if (Object.keys(remainder_obj).length > 0)
					return_string.push(`Properties changed to: ${String.formatObject(remainder_obj)}`);
			}
		} catch (e) {
			try {
				JSON.stringify(old_keyframe);
				JSON.stringify(new_keyframe);
			} catch (e) {
				console.error(`Was a circular reference detected? If so, ensure that you are feeding in arg0_v, and not arg1_e for the property in question.`);
			}
			console.error(`new_keyframe:`, new_keyframe, `old_keyframe:`, old_keyframe, `Error:`, e);
		}
		
		//Return statement
		return String.formatArray(return_string);
	};
	static instances = {};
	static reserved_keys = ["name"];
	
	constructor () {
		super();
		this.history = new naissance.History({}, {
			_id: () => this.id,
			localisation_function: naissance.Geometry.history_localisation_function
		});
		this.id = Class.generateRandomID(naissance.Geometry);
		this.is_naissance_geometry = true; //Identifier flag for Naissance-bound reflection engine
		this.metadata = {};
		
		//Initialise this.options
		if (!this.options) this.options = {};
			this.options.instance = this;
		
		//Define naissance.Geometry contract
		
		/** 
		 * The current geometry as rendered on {@link global.map}.
		 * @type {maptalks.Geometry|undefined} 
		 */
		this.geometry = undefined;
		/** 
		 * Renders any assigned name to the geometry/label.
		 * @type {maptalks.Label[]|undefined}
		 */
		this.label_geometries = [];
		/** @type {boolean} */
		this._selected = false; //Should be overridden by a getter/setter that attempts to render this.selected_geometry
		/**
		 * Selected geometry overlay.
		 * - Mirror of: {@link this.geometry}
		 * @type {maptalks.Geometry|undefined} 
		 */
		this.selected_geometry = undefined;
		/**
		 * Holds the currently rendered keyframe at this date.
		 * @type {naissance.HistoryKeyframe.value|undefined}
		 */
		this.value = undefined;
		/**
		 * Options passed to the interface window that is opened.
		 * @type {Object}
		 */
		this.window_options = {
			width: "30rem",
			onuserchange: (v) => {
				if (v.name)
					DALS.Timeline.parseAction("rename_geometry", [{ geometry_obj: this.id, set_name: v.name }]);
			}
		};
		
		//Push to naissance.Geometry.instances
		naissance.Geometry.instances[this.id] = this;
		if (main.brush.selected_feature?.entities) {
			this.parent = main.brush.selected_feature;
			main.brush.selected_feature.entities.push(this);
		}
	}
	
	get current_geometry () {
		//Declare local instance variables
		let current_keyframe = this.current_keyframe;
		
		//Return statement
		return (current_keyframe && current_keyframe.value[0]) ?
			maptalks.Geometry.fromJSON(current_keyframe.value[0]) : undefined;
	}
	
	get current_keyframe () {
		//Return statement
		return this.history.getKeyframe();
	}
	
	get name () {
		//Declare local instance variables
		let current_keyframe = this.history.getKeyframe();
		let current_value = current_keyframe.value;
		
		let current_name;
			if (current_value[2] && current_value[2].name) current_name = current_value[2].name;
			if (!current_name)
				Object.iterate(this.history.keyframes, (local_key, local_value) => {
					if (local_value?.value[2] && local_value?.value[2].name) {
						current_name = local_value.value[2].name;
						return "break"; //Break if possible
					}
				});
		
		//Return statement
		return (current_name) ? 
			current_name : `New ${(this.class_name) ? this.class_name : "Geometry"}`;
	}
	
	set name (arg0_value) {
		//Convert from parameters
		let value = (arg0_value) ? arg0_value : `New ${(this.class_name) ? this.class_name : "Geometry"}`;
		
		//Send DALS.Timeline.parseAction() command
		DALS.Timeline.parseAction("rename_geometry", [{ geometry_obj: this.id, set_name: value }], this.fire_action_silently);
	}
	
	get selected () {
		//Declare local instance variables
		let is_selected;
		
		//Fetch is_selected
		if (main.brush && main.brush.selected_geometry && main.brush.selected_geometry.id === this.id) {
			is_selected = true;
		} else {
			is_selected = this._selected;
		}
		if (this.interface && this.interface.selected)
			this.interface.selected.v = is_selected;
		
		//Return statement
		return is_selected;
	}
	
	set selected (v) {
		//Set selected, then update draw
		this._selected = v;
		this.draw();
		UI_LeftbarHierarchy.refresh();
	}
	
	addKeyframe (arg0_date, arg1_coords, arg2_symbol, arg3_data) {
		//Convert from parameters
		let date = (arg0_date) ? arg0_date : main.date;
		let coords = arg1_coords;
		let symbol = arg2_symbol;
		let data = arg3_data;
		
		//Declare local instance variables
		this.history.addKeyframe(date, coords, symbol, data);
		this.draw();
	}
	
	drawActionsPalette (arg0_options) {
		//Convert from parameters
		let options = (arg0_options) ? arg0_options : {};
		
		//Declare local instance variables
		if (!this.ui) this.ui = {};
		
		//Open this.actions_palette_window
		if (this.actions_palette_window) this.actions_palette_window.close();
		this.actions_palette_window = veWindow({
			actions_palette: veSearchSelect({
				debug_geometry: veButton(() => {
					window.$geometry = this;
					console.log(`Geometry logged as:`, window.$geometry);
					veToast(`Geometry logged to console.`);
				}, { name: "Debug Geometry" }),
				link_geometry: veButton(() => {
					if (this.link_geometry_window) this.link_geometry_window.close();
					this.link_geometry_window = veWindow({
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
							
							veToast(`Linked ${this.name} with ${linked_geometry.name}`);
							this.link_geometry_window.close();
						}, { name: "Confirm" })
					}, { name: "Link Geometry", can_rename: false });
				}, { name: "Link Geometry" }),
				manage_relations: veButton(() => {
					if (this.add_relation_window) this.add_relation_window.close();
					this.add_relation_window = veWindow({
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
					}, {
						name: "Manage Relations",
						can_rename: false,
						width: "20rem"
					})
				}, { name: "Manage Relations" }),
				unlink_geometry: veButton(() => {
					let linked_geometry = naissance.Geometry.instances[this.metadata.linked_id];
					
					delete this.metadata.linked_id;
					if (linked_geometry) {
						veToast(`Unlinked geometry from ${linked_geometry.name}.`);
					} else {
						veToast(`Cleared reference to stale geometry.`);
					}
				}, {
					name: "Unlink Geometry",
					limit: () => this?.metadata?.linked_id
				})
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
			name: `Geometry Actions (${this.name})`,
			can_rename: false,
			width: "30rem"
		});
	}
	
	/**
	 * Draws the variables editor for the current geometry UI.
	 */
	drawVariablesEditor () {
		//Declare local instance variables
		this.variables_ui = veInterface({
			geometry_description: veWordProcessor(this.metadata.description, { //Loaded after 1 tick
				onuserchange: (v) => this.metadata.description = v
			}),
			actions_bar: veRawInterface({
				open_variables_editor: veButton(() => {
					if (this.variables_editor) this.variables_editor.close();
					try { this.syncVariablesToSpreadsheet(); } catch (e) { console.error(e); } //Sync first
					this.variables_editor = veWindow({
						table_editor: veSpreadsheet(this.metadata.variables, {
							dark_mode: true,
							onuserchange: (v, e) => {
								let array_values = e.convertToArray();
								this.history.do_not_draw = true;
								
								//1. Reset all [2].variables from all keyframes
								Object.iterate(this.history.keyframes, (local_key, local_keyframe) => {
									let local_value = local_keyframe.value;
									
									if (local_value[2] && local_value[2].variables)
										if (Object.keys(local_value[2]).length === 1) {
											delete this.history.keyframes[local_key];
										} else {
											delete local_value[2].variables;
										}
								});
								
								//2. Reconstruct .variables for all valid keyframes
								for (let i = 0; i < array_values.length; i++) {
									let current_sheet = array_values[i];
									let header_row = (current_sheet[0]) ? current_sheet[0] : [];
									
									//Calculate max width of the sheet to ensure consistent column indexing
									let max_sheet_width = header_row.length;
									for (let x = 0; x < current_sheet.length; x++)
										if (current_sheet[x] && current_sheet[x].length > max_sheet_width)
											max_sheet_width = current_sheet[x].length;
									
									for (let x = 1; x < current_sheet.length; x++) {
										let current_row = current_sheet[x];
										
										if (current_row && current_row[0]) {
											let local_date = Date.convertStringToDate(current_row[0].toString());
											let local_variables_obj = {};
											
											//If local_date is defined, iterate based on the global max width of the sheet
											if (local_date) {
												for (let y = 1; y < max_sheet_width; y++) {
													let variable_name = (header_row[y]) ?
														header_row[y] : y; //Fallback to index if header cell is empty
													let cell_value = current_row[y];
													
													//Only append Truthy and non-empty values to prevent resetting historical fields
													if (cell_value !== null && cell_value !== undefined && cell_value !== "" && cell_value !== " ")
														local_variables_obj[variable_name] = cell_value;
												}
												
												//Only add keyframe if there are actual variable changes defined for this date
												if (Object.keys(local_variables_obj).length > 0)
													this.history.addKeyframe(local_date, undefined, undefined, {
														variables: local_variables_obj
													});
											}
										}
									}
								}
								
								this.metadata.variables = e.toJSON();
								delete this.history.do_not_draw;
								this.history.draw(this.keyframes_ui);
							}
						})
					}, {
						name: `Variables Editor (${this.name})`,
						can_rename: false,
						height: "20rem",
						width: "30rem",
						
						onuserchange: (v, e) => {
							//Declare local instance variables
							let table_editor = e?.instance?.table_editor;
								if (table_editor) this.metadata.variables = table_editor.toJSON();
							
							//Call DALS.Timeline.parseAction() .set_history 
							if (v.close)
								DALS.Timeline.parseAction("edit_geometry_history", [{ geometry_obj: this.id, set_history: this.history.toJSON() }]);
						}
					});
				}, { name: "<icon>rule</icon> Variables Editor", x: 0, y: 1 }),
				open_help_menu: veButton(() => {
					
				}, { name: "<icon>info</icon> Help Menu", x: 1, y: 1 })
			}, {
				style: {
					"[component='ve-button']": { marginRight: `var(--padding)` }
				}
			})
		}, { name: "Variables", do_not_display: true, open: true });
		
		//Wait a tick for metadata to load
		setTimeout(() => {
			if (this.metadata.description) this.variables_ui.geometry_description.v = this.metadata.description;
		});
	}
	
	/**
	 * Imports a {@link naissance.Geometry} class from JSON. Contract function.
	 */
	fromJSON () {
		console.warn(`naissance.Geometry.fromJSON() was called for: ${this.class_name}, but was not defined.`);
	}
	
	/**
	 * Returns a unique list of all names as a flat array, without respect to keyframes. Most recent namees first.
	 * 
	 * @param {Object} [arg0_options]
	 *  @param {boolean} [arg0_options.return_objects=false] - Whether to return objects. Returns [{ name: string, timestamp: number, ... }] in ascending order.
	 */
	getAllNames (arg0_options) {
		//Convert from parameters
		let options = (arg0_options) ? arg0_options : {};
		
		//Declare local instance variables
		let all_names = []; //[{ name: string, timestamp: number }, ...]
		
		//Iterate over this.history.keyframes
		Object.iterate(this.history.keyframes, (local_key, local_value) => {
			let is_duplicate = false;
			let local_properties = local_value.value?.[2];
			
			if (local_properties?.name) {
				for (let i = 0; i < all_names.length; i++)
					if (all_names[i].name === local_properties.name) {
						is_duplicate = true;
						break;
					}
				
				if (!is_duplicate)
					all_names.push({ name: local_properties.name, timestamp: local_value.timestamp });
			}
		}, { sort_mode: "descending" });
		
		all_names.sort((a, b) => b.timestamp - a.timestamp);
		
		//Return statement
		return (!options.return_objects) ? 
			all_names.map((element) => element.name) : all_names;
	}
	
	/**
	 * Returns all keyframes that change the current geometry. Returns either the timestamp/date. Dates by default.
	 * 
	 * @param {Object} [arg0_options]
	 *  @param {boolean} [arg0_options.return_timestamps=false]
	 * 
	 * @returns {Object[]|number[]}
	 */
	getGeometryKeyframes (arg0_options) {
		//Convert from parameters
		let options = (arg0_options) ? arg0_options : {};
		
		//Declare local instance variables
		let unique_timestamps = [];
		
		//Iterate over all .history.keyframes
		Object.iterate(this.history.keyframes, (local_key, local_value) => {
			if (local_value.value[0] !== undefined)
				unique_timestamps.push(Date.convertTimestampToInt(local_key));
		});
		
		if (!options.return_timestamps) {
			let unique_dates = [];
			
			//Return statement
			for (let i = 0; i < unique_timestamps.length; i++)
				unique_dates.push(Date.convertTimestampToDate(unique_timestamps[i]));
			return unique_dates;
		}
		return unique_timestamps;
	}
	
	
	//console.time(`1. Differencing ${all_timestamps[i]} (${i}/${all_timestamps.length})`);
	
	/**
	 * Returns the Maptalks geometry at the specific date.
	 * 
	 * @param {Object|number} [arg0_date]
	 * 
	 * @returns {Object}
	 */
	getGeometryKeyframeAtDate (arg0_date) {
		//Convert from parameters
		let date = (arg0_date) ? arg0_date : main.date;
			date = Date.convertTimestampToDate(date);
			
		//Declare local instance variables
		let keyframe_obj = this.history.getKeyframe({ date: date });
		
		//Return statement
		if (keyframe_obj.value?.[2]?.hidden) return null;
		return keyframe_obj.value[0];
	}
	
	/**
	 * Fetches the layer that the current {@link naissance.Geometry} is appended to, if anything. Used for masking.
	 *
	 * @returns {naissance.FeatureLayer}
	 */
	getLayer () {
		//Declare local instance variables
		let all_feature_keys = Object.keys(naissance.Feature.instances);
		
		//Iterate over all_feature_keys naissance.Feature.instances
		for (let i = 0; i < all_feature_keys.length; i++) {
			let local_feature = naissance.Feature.instances[all_feature_keys[i]];
			
			if (local_feature instanceof naissance.FeatureLayer) {
				let local_geometries = local_feature.getAllGeometries();
				
				for (let x = 0; x < local_geometries.length; x++)
					if (local_geometries[x].id === this.id)
						//Return statement
						return local_feature;
			}
		}
	}
	
	/**
	 * Returns a quick actions component with the specified size.
	 * 
	 * @param {Object} [arg0_options]
	 *  @param {string} [arg0_options.mode="large"] - Either 'small'/'large'.
	 * 
	 * @returns {ve.RawInterface}
	 */
	getQuickActionsComponent (arg0_options) {
		//Convert from parameters
		let options = (arg0_options) ? arg0_options : {};
		
		//Initialise options
		if (!options.mode) options.mode = "large";
		
		//Declare local instance variables
		let components_obj = {};
		
		//Compare options.mode
		if (options.mode === "small") {
			components_obj = {
				move_to_brush: veButton(() => {
					DALS.Timeline.parseAction("select_geometry", [{
						type: "Brush", select_geometry_id: this.id
					}]);
				}, {
					name: `<icon>brush</icon>`,
					tooltip: "Move to Brush",
					limit: () => (main.brush.selected_geometry?.id !== this.id)
				}),
				finish_geometry: veButton(() => {
					DALS.Timeline.parseAction("deselect_geometry", [{
						type: "Brush", select_geometry_id: false
					}]);
				}, {
					name: `<icon>download_done</icon>`,
					tooltip: "Finish Geometry",
					limit: () => (main.brush.selected_geometry?.id === this.id)
				}),
				open_button: veButton(() => {
					this.open();
				}, { name: "<icon>more_vert</icon>", tooltip: "Edit Geometry" })
			};
		} else if (options.mode === "large") {
			//Return statement
			components_obj = {
				selected: veCheckbox(this.selected, {
					name: "Selected",
					onuserchange: (v) => this.selected = v
				}),
				
				move_to_brush: veButton(() => {
					DALS.Timeline.parseAction("select_geometry", [{
						type: "Brush", select_geometry_id: this.id
					}]);
				}, {
					name: `<icon>brush</icon>`,
					tooltip: "Move to Brush",
					limit: () => (main.brush.selected_geometry?.id !== this.id)
				}),
				finish_geometry: veButton(() => {
					DALS.Timeline.parseAction("deselect_geometry", [{
						type: "Brush", select_geometry_id: false
					}]);
				}, {
					name: `<icon>download_done</icon>`,
					tooltip: "Finish Geometry",
					limit: () => (main.brush.selected_geometry?.id === this.id)
				}),
				
				multitag: veButton(() => {
					if (this.tags_editor) this.tags_editor.close();
					this.tags_editor = veWindow({
						tags_list: veMultiTag(this.metadata.tags, {
							onuserchange: (v) => this.metadata.tags = v
						})
					}, {
						name: `Edit Tags (${this.name})`,
						can_rename: false,
						width: "20rem",
						
						onuserchange: (v) => {
							if (v.close)
								DALS.Timeline.parseAction("edit_geometry_tags", [{ geometry_obj: this.id, set_tags: this.metadata.tags }]);
						}
					})
				}, {
					name: "<icon>new_label</icon>", tooltip: "Manage Tags"
				}),
				hide_geometry: veButton(() => {
					DALS.Timeline.parseAction("hide_geometry", [{ geometry_obj: this.id, set_properties: { hidden: true } }]);
					this.history.draw(this.keyframes_ui);
				}, {
					name: `<icon>visibility</icon>`,
					limit: () => !this.value[2]?.hidden,
					tooltip: "Hide Geometry"
				}),
				show_geometry: veButton(() => {
					DALS.Timeline.parseAction("show_geometry", [{ geometry_obj: this.id, set_properties: { hidden: false } }]);
					this.history.draw(this.keyframes_ui);
				}, {
					name: "<icon>visibility_off</icon>",
					limit: () => this.value[2]?.hidden,
					tooltip: "Show Geometry"
				}),
				delete_button: veButton(() => {
					veConfirm(`Are you sure you want to delete ${this.name}?`, {
						special_function: () => {
							let geometry_name = this.name;
							
							DALS.Timeline.parseAction("delete_geometry", [{ geometry_obj: this.id, delete_geometry: true }]);
							veToast(`Deleted ${geometry_name}`);
						}
					})
				}, {
					name: "<icon>delete</icon>",
					tooltip: "Delete Geometry"
				}),
				
				open_actions_palette: veButton(() => {
					this.drawActionsPalette();
				}, {
					name: "<icon>more_vert</icon>",
					tootlip: "Open Actions Palette"
				}),
			};
		}
		
		//Return statement
		return new ve.RawInterface(components_obj, {
			attributes: {
				"class": options.mode,
				"naissance-ui": "geometry-actions-bar"
			},
			do_not_display: true,
			width: 99
		});
	}
	
	getRelations () { return naissance.Geometry.getRelations.call(this); }
	
	/**
	 * Returns the actual symbol_obj for the given Geometry.
	 * 
	 * @param {Object} arg0_symbol_obj
	 * 
	 * @returns {Object}
	 */
	getSymbol (arg0_symbol_obj) {
		//Convert from parameters
		let symbol_obj = arg0_symbol_obj;
			if (symbol_obj === undefined) {
				this.value = this.history.getKeyframe({
					date: main.timestamp,
					guaranteed_indexes: [1]
				}).value;
				symbol_obj = (this.value[1]) ? this.value[1] : {};
			}
		
		//Declare local instance variables
		let active_symbol_functions = main.renderer.active_symbol_functions;
			
		//Ensure symbol is the same as that of the linked ID if it exists
		if (this.metadata?.linked_id) {
			let linked_geometry = naissance.Geometry.instances[this.metadata.linked_id];
			
			if (linked_geometry) {
				let linked_geometry_keyframe = linked_geometry.history.getKeyframe({
					date: main.timestamp,
					guaranteed_indexes: [1]
				});
				
				if (linked_geometry_keyframe?.value?.[1]) symbol_obj = linked_geometry_keyframe.value[1];
			}
		}
		for (let i = 0; i < active_symbol_functions.length; i++)
			symbol_obj = {
				...symbol_obj,
				...active_symbol_functions[i](this)
			};
		
		//Return statement
		return symbol_obj;
	}
	
	/**
	 * Hides the present Geometry. Used by {@link naissance.Feature}, not internally used.
	 */
	hide () {
		this._is_visible = false;
		this.draw();
	}
	
	open (arg0_type, arg1_options) {
		//Convert from parameters
		let type = (arg0_type) ? arg0_type : "instance";
		let options = (arg1_options) ? arg1_options : {};
		
		//Initialise options
		if (!options.name) options.name = this.name;
		if (!options.width) options.width = "24rem";
		
		//Declare UI in order
		{
			if (!this.keyframes_ui) this.keyframes_ui = veInterface({}, {
				name: `Keyframes`, 
				do_not_display: true,
				open: true
			});
			this.history.draw(this.keyframes_ui);
			this.drawVariablesEditor();
		}
		
		if (!this.interface) this.interface = veInterface({
			information: veHTML(() => {
				//Declare local instance variables
				let format_string = `ID: ${this.id}`;
				
				if (this?.metadata?.linked_id)
					format_string += ` | Linked ID: ${this.metadata.linked_id}`;
				
				if (this.class_name === "GeometryPolygon") {
					let area_km2 = (this.geometry && this.isOpen("instance")) ?
						this.geometry.getArea()/1000000 : 0;
					return `${format_string} | Area: ${String.formatNumber(area_km2)}km^2`;
				} else if (this.class_name === "GeometryLine") {
					let length_km = (this.geometry && this.isOpen("instance")) ?
						this.geometry.getLength()/1000 : 0;
					return `${format_string} | Length: ${String.formatNumber(length_km)}km`;
				} else if (this.class_name === "GeometryPoint") {
					let coordinates = (this.geometry && this.isOpen("instance")) ?
						this.geometry.getCoordinates().toJSON() : { x: 0, y: 0 }
					return `${format_string} | X: ${String.formatNumber(coordinates.x, 4)}, Y: ${String.formatNumber(coordinates.y, 4)}`;
				}
					
			}),
			quick_actions: this.getQuickActionsComponent(),
			
			...((typeof this.drawUI === "function") ? this.drawUI() : {}),
			...ve.Class.getVercengenComponents(this),
			variables_ui: this.variables_ui
		}, { is_folder: false });
		
		
		//Call super.open for naissance.Entity
		super.open(type, options);
	}
	
	/**
	 * Removes the current {@link naissance.Geometry} instance.
	 */
	remove (arg0_do_not_refresh) {
		//Convert from parameters
		let do_not_refresh = arg0_do_not_refresh;
		
		super.close("instance"); //Close any open UIs
		
		//Remove from naissance.Feature .entities
		Object.iterate(naissance.Feature.instances, (local_key, local_feature) => {
			if (local_feature.entities)
				for (let i = 0; i < local_feature.entities.length; i++)
					if (local_feature.entities[i].id === this.id)
						local_feature.entities.splice(i, 1);
		});
		
		//Remove from naissance.Geometry.instances
		delete naissance.Geometry.instances[this.id];
		
		//Rerender deleted geometry and remove it from the map
		this.history = new naissance.History();
		if (!do_not_refresh)
			this.draw();
	}
	
	/**
	 * Alias for {@link naissance.History.removeKeyframe}.
	 *
	 * @param {Object} arg0_date
	 */
	removeKeyframe (arg0_date) {
		//Convert from parameters
		let date = (arg0_date) ? Date.convertTimestampToDate(arg0_date) : main.date;
		
		//Remove the keyframe at the given date
		this.history.removeKeyframe(date);
		if (Object.keys(this.history.keyframes).length === 0) //Remove geometry if no keyframes exist anymore
			this.remove();
	}
	
	setID (arg0_id) {
		//Convert from parameters
		let id = arg0_id;
		
		//Declare local instance variables; shuffle ID
		let old_id = JSON.parse(JSON.stringify(this.id));
		this.id = id;
		naissance.Geometry.instances[id] = this;
		delete naissance.Geometry.instances[old_id];
	}
	
	/**
	 * Shows the present Geometry. Used by {@link naissance.Feature}, not internally used.
	 */
	show () {
		this._is_visible = true;
		this.draw();
	}
	
	/**
	 * Synchronises `.value[2].variables` in the Geometry's `.history` to the Variables Spreadsheet contained by the Geometry.
	 * Resolves date equivalence using timestamps to prevent row duplication.
	 * - Method of: {@link naissance.Geometry}
	 */
	syncVariablesToSpreadsheet() { naissance.Geometry.syncVariablesToSpreadsheet.call(this); }
	
	/**
	 * Exports a {@link naissance.Geometry} class to JSON. Contract function.
	 */
	toJSON () {
		console.warn(`naissance.Geometry.toJSON() was called for: ${this.class_name}, but was not defined.`);
	}
	
	/**
	 * Updates the geometry UI.
	 */
	update () {
		//Update name
		if (super.isOpen("instance")) {
			this.instance_window.setName(this.name);
			
			//Update keyframes
			if (this.keyframes_ui) this.history.draw(this.keyframes_ui);
		}
	}
	
	/**
	 * Returns a map of all `naissance.Geometry.instances`.
	 * 
	 * @returns {{"<geometry_id>": naissance.Geometry}}
	 */
	static getObject () {
		//Return statement
		return naissance.Geometry.instances;
	}
	
	/**
	 * Parses a list of commands for multiple geometries.
	 * 
	 * @param {string[]} arg0_geometry_ids
	 * @param {Object} [arg1_options]
	 *  @param {Object} [arg1_options.command="set_symbol"] - The `parseAction()` command to package up.
	 *  @param {string} [arg1_options.key="set_geometry_symbols"]
	 *  @param {string} [arg1_options.name="Set Geometry Symbols"]
	 *  @param {string} [arg1_options.type="Geometry"]
	 *  @param {function()|Object} [arg1_options.value] - The individual value to actually send to each command. If a function, the return value is concatenated. .arguments[0] if a function refers to the index.
	 *  
	 *  @param {Object} [arg1_options.date] - The date at which to apply this change.
	 */
	static parseActionForGeometries (arg0_geometry_ids, arg1_options) {
		//Convert from parameters
		let geometry_ids = Array.toArray(arg0_geometry_ids);
		let options = (arg1_options) ? arg1_options : {};
		
		//Initialise options
		if (!options.command) options.command = "set_symbol";
		if (!options.key) options.key = "set_geometry_symbols";
		if (!options.name) options.name = "Set Geometry Symbols";
		if (!options.type) options.type = "Geometry";
		if (!options.value) options.value = {};
		
		//Declare local instance variables
		let dals_value_array = [];
		let old_date;
		
		//Iterate over all geometry_ids and populate dals_value_array
		for (let i = 0; i < geometry_ids.length; i++) {
			let local_value = options.value;
			
			if (typeof options.value === "function")
				local_value = options.value(i);
			
			dals_value_array.push({ 
				type: options.type,
				geometry_obj: geometry_ids[i], 
				[options.command]: local_value
			});
		}
		
		//Add to DALS
		if (options.date) {
			old_date = JSON.parse(JSON.stringify(main.date));
			UI_DateMenu.setDate(options.date);
		}
		console.log(options.key, dals_value_array);
		DALS.Timeline.parseAction(options.key, dals_value_array);
		if (options.date)
			UI_DateMenu.setDate(old_date);
	};
	
	static setGeometries (arg0_geometry_ids, arg1_geometries, arg2_options) { 
		//Convert from parameters
		let geometry_ids = Array.toArray(arg0_geometry_ids);
		let geometries = Array.toArray(arg1_geometries);
		let options = (arg2_options) ? arg2_options : {};
		
		//Parse action for geometries
		naissance.Geometry.parseActionForGeometries(geometry_ids, {
			command: "set_geometry",
			key: "set_geometries",
			name: "Set Geometries",
			value: (i) => (geometries[i]) ? geometries[i] : undefined,
			...options
		});
	}
	
	static setProperties (arg0_geometry_ids, arg1_properties_obj, arg2_options) {
		//Convert from parameters
		let geometry_ids = Array.toArray(arg0_geometry_ids);
		let properties_obj = (arg1_properties_obj) ? arg1_properties_obj : {};
		let options = (arg2_options) ? arg2_options : {};
		
		//Parse action for geometries
		naissance.Geometry.parseActionForGeometries(geometry_ids, {
			command: "set_properties",
			key: "set_geometry_properties",
			name: "Set Geometry Properties",
			value: properties_obj,
			...options
		});
	}
	
	static setSymbols (arg0_geometry_ids, arg1_symbol_obj, arg2_options) {
		//Convert from parameters
		let geometry_ids = Array.toArray(arg0_geometry_ids);
		let symbol_obj = (arg1_symbol_obj) ? arg1_symbol_obj : {};
		let options = (arg2_options) ? arg2_options : {};
		
		//Parse action for geometries
		naissance.Geometry.parseActionForGeometries(geometry_ids, {
			value: symbol_obj,
			...options
		});
	}
};