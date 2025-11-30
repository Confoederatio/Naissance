if (!global.naissance) global.naissance = {};
/**
 * @type {naissance.FeatureLayer}
 */
naissance.FeatureSketchMap = class extends naissance.Feature {
	constructor (arg0_entities, arg1_options) {
		super();
		this.class_name = "FeatureSketchMap";
		this.options = (arg1_options) ? arg1_options : {};
		
		//Declare local instance variables
		this._entities = [];
		this._is_visible = true;
		this._name = "New Sketch Map";
		this.toolbar = undefined;
		
		//Declare UI, attached to UI_LeftbarHierarchy
		this.interface = undefined;
		this.handleEvents();
	}
	
	addGeometry (arg0_geometry) {
		//Convert from parameters
		let geometry = arg0_geometry;
		
		//Add geometry to layer
		geometry.addTo(main.layers.overlay_layer);
		this._entities.push(geometry);
	}
	
	clearLayer () {
		for (let i = 0; i < this._entities.length; i++)
			this._entities[i].remove();
		this.draw_tool.disable();
	}
	
	draw () {
		if (this._is_visible) {
			//Iterate over all this._entities and declare their corresponding context menus on click
			for (let i = 0; i < this._entities.length; i++) {
				let local_entity = this._entities[i];
					local_entity.show();
				
				let local_generic_ui = () => {
					return {
						pre_ui: {
							header: veHTML(`<b>${local_entity.getType()}</b>`)
						},
						post_ui: {
							actions_bar: veRawInterface({
								edit_toggle_container: veRawInterface({
									edit_button: veButton(() => {
										main.brush.disabled = true;
										local_entity.startEdit();
									}, { name: "<icon>edit</icon> Edit", limit: () => !local_entity.isEditing(), x: 0, y: 0 }),
									cancel_edit_button: veButton(() => {
										local_entity.endEdit()
									}, { name: "<icon>edit</icon> Cancel Edit", limit: () => local_entity.isEditing(), x: 0, y: 0 })
								}, { name: " ", style: { display: "inline" } }),
								
								delete_button: veButton(() => {
									DALS.Timeline.parseAction({
										options: { name: "Deleted SketchMap Geometry", key: "delete_sketch_map_geometry" },
										value: [{
											type: "FeatureSketchMap",
											feature_id: this.id,
											delete_entity: { id: i }
										}]
									});
								}, { name: "<icon>delete</icon> Delete" })
							}, { name: " " })
						}
					}
				};
				let local_properties = local_entity.getProperties();
					if (local_properties === null || local_properties === undefined) local_properties = {};
				
				//Instantiate UI handlers
				if (local_entity instanceof maptalks.Marker) {
					local_entity.addEventListener("click", (e) => {
						let local_symbol = e.target.getSymbol();
						local_entity.context_menu = veContextMenu({
							...local_generic_ui().pre_ui,
							name_element: new ve.Text((local_symbol?.textName) ? local_symbol?.textName : "", { 
								name: "Name",
								onchange: (v, e) => {
									DALS.Timeline.parseAction({
										options: { name: "Edited SketchMap Marker Label", key: "edit_sketch_map_marker_label" },
										value: [{ 
											type: "FeatureSketchMap", 
											feature_id: this.id, 
											set_entity_symbol: {
												id: i,
												value: {
													textFaceName: "Karla, sans-serif",
													textFill: `rgb(255, 255, 255)`,
													textHaloFill: `rgb(0, 0, 0)`,
													textHaloRadius: 2,
													textName: v
												}
											}
										}]
									});
									console.log(local_entity);
								}
							}),
							...local_generic_ui().post_ui
						}, { id: "sketch_geometry_context_menu" })
					});
				} else {
					local_entity.addEventListener("click", (e) => {
						local_entity.context_menu = veContextMenu({
							...local_generic_ui().pre_ui,
							...local_generic_ui().post_ui
						}, { id: "sketch_geometry_context_menu" });
					});
				}
				
				local_entity.addEventListener("editend", (e) => {
					DALS.Timeline.parseAction({
						options: { name: "Edited SketchMap Geometry", key: "edit_sketch_map_geometry" },
						value: [{
							type: "FeatureSketchMap",
							feature_id: this.id,
							edit_entity: { id: i, value: e.target.toJSON() }
						}]
					});
				});
			}
			
		} else {
			for (let i = 0; i < this._entities.length; i++)
				this._entities[i].hide();
		}
	}
	
	drawHierarchyDatatype () {
		//Declare local instance variables
		this.interface = new ve.HierarchyDatatype({
			icon: new ve.HTML(`<icon>app_registration</icon>`),
			hide_visibility: veButton(() => {
				DALS.Timeline.parseAction({
					options: { name: "Hide SketchMap", key: "hide_sketch_map" },
					value: [{ type: "Feature", feature_id: this.id, set_visibility: false }]
				});
			}, {
				name: "<icon>visibility</icon>",
				limit: () => this._is_visible,
				tooltip: "Hide Sketch Map",
				style: {
					marginLeft: "auto", order: 99, padding: 0,
					"button": {
						marginLeft: "1rem"
					}
				}
			}),
			show_visibility: veButton(() => {
				DALS.Timeline.parseAction({
					options: { name: "Show SketchMap", key: "show_sketch_map" },
					value: [{ type: "Feature", feature_id: this.id, set_visibility: true }]
				});
			}, {
				name: "<icon>visibility_off</icon>",
				limit: () => !this._is_visible,
				tooltip: "Show Sketch Map",
				style: {
					marginLeft: "auto", order: 99, padding: 0,
					"button": {
						marginLeft: "1rem"
					}
				}
			}),
			edit: veButton(() => {
				super.open("instance", {
					id: this.id,
					name: this._name,
					width: "24rem"
				});
				this.draw();
			}, {
				name: "<icon>more_vert</icon>",
				tooltip: "Edit Sketch Map",
				style: { order: 100, padding: 0 }
			})
		}, {
			ignore_component: true,
			instance: this,
			name: this.name,
			name_options: {
				onchange: (v) => {
					this.name = v;
					this.drawHierarchyDatatype();
				}
			},
			type: "item",
			style: {
				".nst-content": {
					paddingRight: 0
				},
				"[component='ve-button'] > button": {
					border: 0
				}
			}
		});
		
		//Return statement
		return this.interface;
	}
	
	fromJSON (arg0_json) {
		//Declare local instance variables
		let json = (typeof arg0_json !== "object") ? JSON.parse(arg0_json) : arg0_json;
		
		//Declare local instance variables
		this.id = json.id;
		this._name = json.name;
		this._entities = [];
		
		//Populate this._entities
		for (let i = 0; i < json._entities.length; i++)
			this.addGeometry(maptalks.Geometry.fromJSON(json._entities[i]));
		
		//Draw HierarchyDatatype if possible
		this.drawHierarchyDatatype();
	}
	
	handleEvents () {
		//Declare local instance variables
		if (!this.draw_tool) {
			this.draw_tool = new maptalks.DrawTool({ mode: "Polygon" }).addTo(map).disable();
			this.draw_tool.on("drawend", (e) => {
				DALS.Timeline.parseAction({
					options: { name: "Create SketchMap Geometry", key: "create_sketch_map_geometry" },
					value: [{ type: "FeatureSketchMap", feature_id: this.id, add_geometry: e.geometry.toJSON() }]
				});
				this.draw_tool.disable();
				this.draw();
			});
		}
		
		//Populate UI
		this.entity_items = ["Polygon", "LineString", "Point", "Circle", "Ellipse", "Rectangle", "FreeHandLineString", "FreeHandPolygon"].map((local_value) => {
			//Return statement
			return veButton(() => this.draw_tool.setMode(local_value).enable(), { name: local_value }); 
		});
		this.entity_items_interface = new ve.RawInterface({
			...this.entity_items
		}, { name: " " });
		
		this.brush_interface = new ve.Interface({
			clear_brush: new ve.Button(() => {
				this.draw_tool.disable();
			}, { name: "<icon>edit_off</icon> Clear Brush", x: 0, y: 0 }),
			clear_layer: new ve.Button(() => {
				veConfirm(`Are you sure you want to delete this layer? This clears all geometries currently bound to the Sketch Layer!`, { special_function: () =>
					DALS.Timeline.parseAction({
						options: { name: "Clear SketchMap Layer", key: "clear_sketch_map_layer" },
						value: [{ type: "FeatureSketchMap", feature_id: this.id, clear_layer: true }]
					})
				});
			}, { name: "<icon>delete</icon> Clear Layer", x: 1, y: 0 }),
		}, { 
			is_folder: false,
			style: { marginLeft: "auto", marginRight: "auto" }
		});
	}
	
	hide () {
		this._is_visible = false;
		this.draw();
	}
	
	remove () {
		
	}
	
	show () {
		this._is_visible = true;
		this.draw();
	}
	
	toJSON () {
		//Declare local instance variables
		let json_obj = {
			id: this.id,
			name: this._name,
			_entities: []
		};
		
		//Iterate over all this._entities
		for (let i = 0; i < this._entities.length; i++)
			json_obj._entities.push(this._entities[i].toJSON());
		
		//Return statement
		return JSON.stringify(json_obj);
	}
	
	/**
	 * Parses a JSON action for a target FeatureLayer.
	 * - Static method of: {@link naissance.FeatureLayer}
	 *
	 * `arg0_json`: {@link Object|string}
	 * - `.feature_id`: {@link string} - Identifier. The {@link naissance.Feature} ID to target changes for.
	 * <br>
	 * - #### Extraneous Commands:
	 * - `.create_sketch_map`: {@link Object}
	 *   - `.do_not_refresh=false`: {@link boolean}
	 *   - `.id`: {@link string}
	 * - #### Internal Commands:
	 * - `.delete_entity`: {@link Object}
	 *   - `.id`: {@link number} - The index of the deleted geometry.
	 * - `.edit_entity`: {@link Object}
	 *   - `.id`: {@link number} - The index of the edited geometry.
	 *   - `.value`: {@link string} - The JSON value of the edited geometry.
	 * - `.set_entity_symbol`: {@link Object}
	 *   - `.id`: {@link number} - The index of the edited geometry.
	 *   - `.value`: {@link Object} - The value of the edited symbol.
	 */
	static parseAction (arg0_json) {
		//Convert from parameters
		let json = (typeof arg0_json === "string") ? JSON.parse(arg0_json) : arg0_json;
		
		//Declare local instance variables
		let sketch_map_obj = naissance.Feature.instances.filter((v) => v.id === json.feature_id)[0];
		
		//Parse extraneous commands
		//create_sketch_map
		if (json.create_sketch_map)
			if (json.create_sketch_map.id) {
				let new_sketch_map = new naissance.FeatureSketchMap();
				new_sketch_map.id = json.create_sketch_map.id;
				
				if (!json.create_sketch_map.do_not_refresh)
					UI_LeftbarHierarchy.refresh();
			}
		
		//Parse commands for sketch_map_obj
		if (sketch_map_obj instanceof naissance.FeatureSketchMap) {
			//add_geometry
			if (json.add_geometry)
				sketch_map_obj.addGeometry(maptalks.Geometry.fromJSON(json.add_geometry));
			//clear_layer
			if (json.clear_layer)
				sketch_map_obj.clearLayer();
			if (json.delete_entity && json.delete_entity.id) 
				if (sketch_map_obj._entities[json.delete_entity.id]) {
					let local_entity = sketch_map_obj._entities[json.delete_entity.id];
					
					sketch_map_obj._entities.splice(json.delete_entity.id, 1);
					local_entity.remove();
					if (local_entity.context_menu) local_entity.context_menu.close();
				}
			//edit_entity
			if (json.edit_entity)
				if (sketch_map_obj._entities[json.edit_entity.id]) {
					sketch_map_obj._entities[json.edit_entity.id].remove();
					sketch_map_obj._entities[json.edit_entity.id] = maptalks.Geometry.fromJSON(json.edit_entity.value);
					sketch_map_obj._entities[json.edit_entity.id].addTo(main.layers.overlay_layer);
					sketch_map_obj.draw();
				}
			//set_entity_symbol
			if (json.set_entity_symbol)
				if (sketch_map_obj._entities[json.set_entity_symbol.id])
					sketch_map_obj._entities[json.set_entity_symbol.id].setSymbol(json.set_entity_symbol.value);
		}
	}
};