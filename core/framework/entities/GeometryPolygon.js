if (!global.naissance) global.naissance = {};
/**
 * {@link naissance.HistoryKeyframe} data structure:
 * - [0]: arg0_coords:{@link Object}<{@link Array}<{@link float}, {@link float}>> - Contains the maptalks coordinates.
 * - [1]: arg1_symbol:{@link Object} - Contains the maptalks symbol.
 * - [2]: arg2_data:{@link Object}
 * 
 * @type {naissance.GeometryPolygon}
 */
naissance.GeometryPolygon = class extends naissance.Geometry {
	constructor () {
		super();
		this.class_name = "GeometryPolygon";
		this.node_editor_mode = "Polygon";
		
		//Declare UI
		this.interface = veInterface({
			information: veHTML(() => `ID: ${this.id}`, { x: 0, y: 0 }),
			move_to_brush: veButton(() => DALS.Timeline.parseAction({
				options: { name: "Select Geometry" },
				value: [{ type: "Brush", select_geometry_id: this.id }]
			}), { name: "Move To Brush", limit: () => (main.brush.selected_geometry?.id !== this.id), x: 0, y: 1 }),
			finish_polygon: veButton(() => DALS.Timeline.parseAction({
				options: { name: "Deselect Geometry", key: "deselect_geometry" },
				value: [{ type: "Brush", select_geometry_id: false }]
			}), { name: "Finish Polygon", limit: () => (main.brush.selected_geometry?.id === this.id), x: 0, y: 1 }),
			
			selected: veCheckbox(this.selected, {
				onuserchange: (v) => this.selected = v,
				x: 1, y: 1
			}),
		}, { is_folder: false });
		this.keyframes_ui = veInterface({}, {
			name: "Keyframes", open: true
		});
		this.variables_ui = veInterface({
			open_variables_editor: veButton(() => {
				if (this.variables_editor) this.variables_editor.close();
				this.variables_editor = veWindow({
					table_editor: veTable(this.metadata.variables, {
						dark_mode: true,
						onuserchange: (v, e) => { //[WIP] - Finish function body
							let array_values = e.convertToArray();
							this.history.do_not_draw = true;
							
							//console.log(array_values);
							
							//Instead of diffing, the geometry variables editor should simply have the reserved namespace .data.variables which it stores all its variables in, allowing us to rebuild variables each time values are changed. State is saved on window close.
							
							//1. Reset all [2].variables from all keyframes
							Object.iterate(this.history.keyframes, (local_key, local_keyframe) => {
								let local_value = local_keyframe.value;
								console.log(local_value[2] && local_value[2].variables);
								console.log(Object.keys(local_value[2]).length);
								
								if (local_value[2] && local_value[2].variables)
									if (Object.keys(local_value[2]).length === 1) {
										console.log(`Deleting keyframe:`, local_key);
										delete this.history.keyframes[local_key];
									} else {
										delete local_value[2].variables;
									}
							});
							
							//2. Reconstruct .variables for all valid keyframes
							for (let i = 0; i < array_values.length; i++)
								for (let x = 0; x < array_values[i].length; x++) //Iterate over all rows in spreadsheets
									if (array_values[i][x][0]) {
										let local_date = Date.convertStringToDate(array_values[i][x][0].toString());
										let local_variables_obj = {};
										
										//If local_date is defined, iterate over all values in row and append them to local_variables_obj
										if (local_date && array_values[i][x].length > 1) {
											for (let y = 1; y < array_values[i][x].length; y++) {
												let local_cell_variable_name = y;
												if (array_values[i][0][y])
													local_cell_variable_name = array_values[i][0][y];
												
												local_variables_obj[local_cell_variable_name] = array_values[i][x][y];
											}
											
											this.history.addKeyframe(local_date, undefined, undefined, {
												variables: local_variables_obj
											});
										}
									}
							
							this.metadata.variables = v;
							delete this.history.do_not_draw;
							this.history.draw();
							this.keyframes_ui.v = this.history.interface.v;
						}
					})
				}, {
					name: "Variables Editor",
					can_rename: false,
					height: "20rem",
					width: "30rem",
					
					onuserchange: (v) => {
						if (!v.close) return;
						
						//Call DALS.Timeline.parseAction() .set_history 
						DALS.Timeline.parseAction({
							options: { name: "Edit Geometry History", key: "edit_geometry_history" },
							value: [{ type: "Geometry", geometry_id: this.id, set_history: this.history.toJSON() }]
						});
					}
				});
			}, { name: "<icon>rule</icon> Variables Editor", x: 0, y: 0 }),
			open_help_menu: veButton(() => {
				
			}, { name: "<icon>info</icon> Help Menu", x: 1, y: 0 })
		}, { name: "Variables", open: true });
		
		//Add keyframe with default brush symbol upon instantiation
		let brush_symbol = main.brush.getBrushSymbol();
		if (brush_symbol)
			this.addKeyframe(main.date, undefined, brush_symbol);
		
		//KEEP AT BOTTOM!
		this.updateOwner();
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
		//if (coords !== undefined) coords = coords;
		this.history.addKeyframe(date, coords, symbol, data);
		this.draw();
	}
	
	draw () {
		//Declare local instance variables
		let derender_geometry = false;
		
		//1. Set this.value from current relative keyframe
		this.value = this.history.getKeyframe({ date: main.date }).value;
		if (this.value === undefined || this.value.length === 0 || this._is_visible === false) derender_geometry = true;
			
		//2. Draw this.geometry, this.label from this.value onto map
		if (this.value && this.value[0] === null) derender_geometry = true; //Coords are null, derender geometry
		if (this.value && this.value[2]) {
			if (this.value[2].max_zoom && map.getZoom() > this.value[2].max_zoom) derender_geometry = true;
			if (this.value[2].min_zoom && map.getZoom() < this.value[2].min_zoom) derender_geometry = true;
		}
		
		if (!derender_geometry) {
			try {
				//console.log(`naissance.GeometryPolygon, render keyframe:`, this.value);
				if (this.geometry) this.geometry.remove();
				if (this.value[0]) {
					this.geometry = maptalks.Geometry.fromJSON(this.value[0]);
					if (this.value[1] && this.geometry) this.geometry.setSymbol(this.value[1]);
					main.layers.entity_layer.addGeometry(this.geometry);
				}
				if (this.value[2]) { //[WIP] - Finish backend for label rendering
					//Fetch this.value[2].label_geometry, this.value[2].label_name, this.value[2].label_symbol
				}
			} catch (e) { console.error(e); }
			
			//3. Draw this.selected_geometry
			try {
				if (this.selected_geometry) this.selected_geometry.remove();
				this.selected_geometry = undefined;
				
				if (this.geometry && this.selected) {
					this.selected_geometry = this.geometry.copy();
					this.selected_geometry.setSymbol({
						lineColor: `rgb(255, 255, 0)`,
						lineDasharray : (main.brush.selected_geometry?.id !== this.id) ? [10, 10, 10] : undefined,
						lineOpacity: 0.5,
						lineWidth: 4,
					});
					main.layers.selection_layer.addGeometry(this.selected_geometry);
				}
			} catch (e) { console.error(e); }
			
			//4. Add bindings
			if (this.geometry) {
				this.keyframes_ui.v = this.history.interface.v;
				this.geometry.addEventListener("click", (e) => {
					if (!["node", "node_override"].includes(main.brush.mode))
						super.open("instance", { name: this.name, width: "20rem" });
				});
			}
		}
		
		//5. Derender geometry handler
		if (derender_geometry) {
			if (this.geometry) this.geometry.remove();
			if (this.label) this.label.remove();
			if (this.selected_geometry) this.selected_geometry.remove();
		}
	}
	
	drawHierarchyDatatype () {
		//Declare local instance variables
		let current_keyframe = this.history.getKeyframe();
		let current_symbol = current_keyframe.value[1];
		
		//Return statement
		return new ve.HierarchyDatatype({
			icon: veHTML(`<icon style = "${
				(current_symbol?.polygonFill) ? `color: ${current_symbol?.polygonFill};` : ""
			}">pentagon</icon>`, {
				tooltip: "GeometryPolygon"
			}),
			...super.drawHierarchyDatatypeGenerics(),
			context_menu: veButton(() => {
				super.open("instance", { name: this.name, width: "20rem" });
			}, {
				name: "<icon>more_vert</icon>",
				tooltip: "More Actions",
				style: { cursor: "padding", order: 101, padding: 0 }
			})
		},  {
			attributes: {
				"data-is-selected": this.selected,
				"data-is-visible": (current_keyframe.value[0] !== undefined && Object.keys(current_keyframe.value[0]).length) ? "true" : "false",
				"data-selected-geometry": (main.brush.selected_geometry?.id === this.id),
			},
			instance: this,
			name: this.name,
			name_options: {
				onprogramchange: () => {
					this.drawHierarchyDatatype();
				},
				onuserchange: (v) => {
					this.name = v;
				}
			},
			style: {
				".nst-content": {
					paddingRight: 0
				},
				"[component='ve-button'] > button": {
					border: 0
				}
			}
		});
	}
	
	handleNodeEditorEnd (arg0_e) {
		//Convert from parameters
		let e = arg0_e;
		
		//Push action to timeline
		if (main.brush.node_editor.mode === "add") {
			e.geometry = main.brush.getAddPolygon(e.geometry);
			DALS.Timeline.parseAction({
				options: { name: "Add to Polygon", key: "add_to_polygon" },
				value: [{
					type: "GeometryPolygon",
					
					geometry_id: this.id,
					add_to_polygon: { geometry: e.geometry.toJSON() },
					simplify_polygon: (main.brush.simplify > 0 && main.brush.simplify_applies_to_brush) ?
						main.brush.simplify : undefined
				}]
			});
		} else if (main.brush.node_editor.mode === "remove") {
			e.geometry = main.brush.getRemovePolygon(e.geometry);
			DALS.Timeline.parseAction({
				options: { name: "Remove from Polygon", key: "remove_from_polygon" },
				value: [{
					type: "GeometryPolygon",
					geometry_id: this.id,
					remove_from_polygon: { geometry: e.geometry.toJSON() }
				}]
			});
		}
		
		main.brush.node_editor.disable();
		main.brush.node_editor.enable();
	}
	
	/**
	 * Parses a JSON action for a target GeometryPolygon.
	 * - Static method of: {@link naissance.GeometryPolygon}
	 * 
	 * `arg0_json`: {@link Object|string}
	 * - `.geometry_id`: {@link string} - Identifier. The {@link naissance.Geometry} ID to target changes for, if any.
	 * <br>
	 * - #### Extraneous Commands:
	 * - `.create_polygon`: {@link Object}
	 *   - `.do_not_refresh`: {@link boolean}
	 *   - `.id`: {@link string}
	 *   - `.name`: {@link string}
	 * - #### Internal Commands:
	 * - `.add_to_polygon`: {@link Object}
	 *   - `.geometry`: {@link string}
	 * - `.remove_from_polygon`: {@link Object}
	 *   - `.geometry`: {@link string}
	 * - `.set_properties`: {@link Object}
	 *   - `<data_key>`: {@link any}
	 * - `.set_polygon`: {@link string} - The JSON to set the polygon geometry to.
	 * - `.set_symbol`: {@link Object}
	 *   - `<symbol_key>`: {@link any}
	 */
	static parseAction (arg0_json) { //[WIP] - Add .set_history
		//Convert from parameters
		let json = (typeof arg0_json === "string") ? JSON.parse(arg0_json) : arg0_json;
		
		//Declare local instance variables
		let polygon_obj = naissance.Geometry.instances.filter((v) => v.id === json.geometry_id)[0];
		
		//Parse extraneous commands
		//create_polygon
		if (json.create_polygon)
			if (json.create_polygon.id) {
				let new_polygon = new naissance.GeometryPolygon();
					new_polygon.id = json.create_polygon.id;
					if (json.create_polygon.name) {
						new_polygon.fire_action_silently = true;
						new_polygon.name = json.create_polygon.name;
						delete new_polygon.fire_action_silently;
					}
					if (main.brush.selected_feature)
						if (!json.create_polygon.do_not_refresh)
							UI_LeftbarHierarchy.refresh();
			}
		
		//Parse commands for polygon_obj
		if (polygon_obj && polygon_obj instanceof naissance.GeometryPolygon) {
			//add_to_polygon
			if (json.add_to_polygon) {
				let geometry = polygon_obj.geometry;
				let ot_geometry = maptalks.Geometry.fromJSON(json.add_to_polygon.geometry);
				
				//Union with existing geometry if defined, if undefined replace geometry
				if (polygon_obj.geometry) {
					geometry = Geospatiale.convertMaptalksToTurf(geometry);
					ot_geometry = Geospatiale.convertMaptalksToTurf(ot_geometry);
					polygon_obj.addKeyframe(main.date, Geospatiale.convertTurfToMaptalks(
						turf.union(turf.featureCollection([geometry, ot_geometry]))
					).toJSON());
				} else {
					polygon_obj.addKeyframe(main.date, ot_geometry.toJSON());
				}
			}
			
			//remove_from_polygon
			if (json.remove_from_polygon) {
				let geometry = polygon_obj.geometry;
				let ot_geometry = maptalks.Geometry.fromJSON(json.remove_from_polygon.geometry);
				
				//Difference with existing geometry, if return value is null replace geometry
				if (polygon_obj.geometry) {
					let turf_difference = turf.difference(turf.featureCollection([
						Geospatiale.convertMaptalksToTurf(geometry),
						Geospatiale.convertMaptalksToTurf(ot_geometry)
					]));
					polygon_obj.addKeyframe(main.date, (turf_difference) ? 
						Geospatiale.convertTurfToMaptalks(turf_difference).toJSON() : null);
					/*console.log((turf_difference) ?
						Geospatiale.convertTurfToMaptalks(turf_difference).toJSON() : null);*/
				}
			}
			
			//set_polygon
			if (json.set_polygon) {
				polygon_obj.addKeyframe(main.date, json.set_polygon);
			} else if (json.set_polygon === null) {
				polygon_obj.addKeyframe(main.date, null);
			}
			
			//set_properties
			if (json.set_properties) {
				if (json.set_properties.date) {
					polygon_obj.addKeyframe(json.set_properties.date, undefined, undefined, json.set_properties.value);
				} else {
					polygon_obj.addKeyframe(main.date, undefined, undefined, json.set_properties);
				}
			} else if (json.set_properties === null) {
				polygon_obj.addKeyframe(main.date, undefined, undefined, null);
			}
			
			//set_symbol
			if (json.set_symbol) {
				polygon_obj.addKeyframe(main.date, undefined, json.set_symbol);
			} else if (json.set_symbol === null) {
				polygon_obj.addKeyframe(main.date, undefined, null);
			}
			
			//simplify_polygon
			if (json.simplify_polygon !== undefined) {
				let geometry = polygon_obj.geometry;
				let turf_simplify = turf.simplify(Geospatiale.convertMaptalksToTurf(geometry), { tolerance: json.simplify_polygon });
				
				polygon_obj.addKeyframe(main.date, (turf_simplify) ?
					Geospatiale.convertTurfToMaptalks(turf_simplify).toJSON() : null);
			}
		}
	}
};