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
			information: veHTML(() => {
				//Declare local instance variables
				let area_km2 = (this.geometry && this.isOpen("instance")) ? 
					this.geometry.getArea()/1000000 : 0;
				
				//Return statement
				return `ID: ${this.id} | Area: ${String.formatNumber(area_km2)}km^2`;
			}, { width: 99, x: 0, y: 0 }),
			move_to_brush: veButton(() => DALS.Timeline.parseAction({
				options: { name: "Select Geometry" },
				value: [{ type: "Brush", select_geometry_id: this.id }]
			}), { name: "Move To Brush", limit: () => (main.brush.selected_geometry?.id !== this.id), x: 0, y: 1 }),
			finish_polygon: veButton(() => DALS.Timeline.parseAction({
				options: { name: "Deselect Geometry", key: "deselect_geometry" },
				value: [{ type: "Brush", select_geometry_id: false }]
			}), { name: "Finish Polygon", limit: () => (main.brush.selected_geometry?.id === this.id), x: 0, y: 1 }),
			
			selected: veCheckbox(this.selected, {
				name: "Selected",
				onuserchange: (v) => this.selected = v,
				x: 1, y: 1
			}),
		}, { is_folder: false });
		this.edit_symbol_ui = veInterface({
			edit_fill: main.interfaces.edit_geometry_polygon.draw({ _id: () => this.id, name: "Fill" }),
			edit_label: main.interfaces.edit_geometry_label.draw({ _id: () => this.id, name: "Label" }),
			edit_stroke: main.interfaces.edit_geometry_line.draw({ _id: () => this.id, name: "Stroke" })
		}, { name: "Edit Symbol" });
		this.keyframes_ui = veInterface({}, {
			name: "Keyframes", open: true
		});
		super.drawVariablesEditor();
		
		//Add keyframe with default brush symbol upon instantiation
		let brush_symbol = main.brush.getBrushSymbol();
		if (brush_symbol)
			this.addKeyframe(main.date, undefined, brush_symbol);
		
		//KEEP AT BOTTOM!
		this.updateOwner();
	}
	
	draw () {
		//Declare local instance variables
		let brush_symbol = main.brush.getBrushSymbol();
		let derender_geometry = false;
		
		//1. Set this.value from current relative keyframe
		this.value = this.history.getKeyframe({ date: main.date }).value;
		if (this.value === undefined || this.value.length === 0 || this._is_visible === false) 
			derender_geometry = true;
			
		//2. Check any cause for derendering
		if (this.value && this.value[0] === null) derender_geometry = true; //Coords are null, derender geometry
		if (this.value && this.value[2]) {
			if (this.value[2].hidden) derender_geometry = true;
			if (this.value[2].max_zoom && map.getZoom() > this.value[2].max_zoom) derender_geometry = true;
			if (this.value[2].min_zoom && map.getZoom() < this.value[2].min_zoom) derender_geometry = true;
		}
		
		//3. Draw this.geometry, this.label from this.value onto map
		if (!derender_geometry) {
			try {
				if (this.geometry) this.geometry.remove();
				if (this.label_geometries)
					for (let i = this.label_geometries.length - 1; i >= 0; i--) {
						this.label_geometries[i].remove();
						this.label_geometries.splice(i, 1);
					}
				if (this.selected_geometry) this.selected_geometry.remove();
				
				//Draw this.geometry, this.label_geometries, this.selected_geometry
				if (this.value[0]) {
					this.geometry = maptalks.Geometry.fromJSON(this.value[0]);
					if (this.value[1] && this.geometry) this.geometry.setSymbol(this.value[1]);
					main.layers.entity_layer.addGeometry(this.geometry);
				}
				if (this.value[2]) {
					//Fetch this.value[2].label_coordinates, this.value[2].label_name/name, this.value[2].label_symbol
					if (this.geometry && !this.value[2]?.label_symbol?.hide) {
						let label_geometries = (this.value[2].label_geometries) ?
							this.value[2].label_geometries : [];
						let label_name = (this.value[2].label_name) ? 
							this.value[2].label_name : this.value[2].name;
						
						//1. .label_coordinates
						if (label_geometries.length === 0) {
							if (!this.geometry.getGeometries) {
								this.label_geometries[0] = new maptalks.Marker(this.geometry.getCenter());
							} else {
								let all_geometries = this.geometry.getGeometries();
								
								for (let i = 0; i < all_geometries.length; i++)
									this.label_geometries[i] = new maptalks.Marker(all_geometries[i].getCenter());
							}
						} else {
							for (let i = 0; i < label_geometries.length; i++)
								this.label_geometries[i] = maptalks.Geometry.fromJSON(label_geometries[i]);
						}
						
						//Iterate over all this.label_geometries, apply settings
						for (let i = 0; i < this.label_geometries.length; i++) {
							//2. .label_name/.name
							if (label_geometries.length === 0) {
								this.label_geometries[i].setSymbol({
									textName: label_name,
									
									textFaceName: brush_symbol.textFaceName,
									textFill: brush_symbol.textFill,
									textHaloFill: brush_symbol.textHaloFill,
									textHaloRadius: brush_symbol.textHaloRadius,
									textSize: brush_symbol.textSize,
									...this.value[2].label_symbol
								});
								
								if (main.settings.hide_labels_by_default)
									this.label_geometries[i].hide();
							}
								
							this.label_geometries[i].addTo(main.layers.label_layer);
						}
					}
				}
			} catch (e) { console.error(e); }
			
			//4. Draw this.selected_geometry
			try {
				this.selected_geometry = undefined;
				
				if (this.geometry && this.selected) {
					this.selected_geometry = this.geometry.copy();
					this.selected_geometry.setSymbol({
						lineColor: `rgb(255, 255, 0)`,
						lineDasharray : (main.brush.selected_geometry?.id !== this.id) ? [10, 10, 10] : undefined,
						lineOpacity: 0.5,
						lineWidth: 4
					});
					main.layers.selection_layer.addGeometry(this.selected_geometry);
				}
			} catch (e) { console.error(e); }
			
			//5. Add bindings
			if (this.geometry) {
				this.keyframes_ui.v = this.history.interface.v;
				this.geometry.addEventListener("click", (e) => {
					if (!["fill_tool", "node", "node_override"].includes(main.brush.mode))
						super.open("instance", { name: this.name, ...this.window_options });
				});
			}
		}
		
		//6. Derender geometry handler
		if (derender_geometry) {
			if (this.geometry) this.geometry.remove();
			if (this.label_geometries)
				for (let i = 0; i < this.label_geometries.length; i++)
					this.label_geometries[i].remove();
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
				this.history.draw();
				super.open("instance", { name: this.name, ...this.window_options });
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
	 * - `.simplify_polygon`: {@link number} - The amount to simplify the Polygon by.
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
				}
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