if (!global.naissance) global.naissance = {};

naissance.GeometryLine = class extends naissance.Geometry {
	constructor () {
		super();
		this.class_name = "GeometryLine";
		this.node_editor_mode = "LineString";
		
		//Declare UI
		this.interface = veInterface({
			information: veHTML(() => {
				//Declare local instance variables
				let length_km = (this.geometry && this.isOpen("instance")) ?
					this.geometry.getLength()/1000 : 0;
				
				//Return statement
				return `ID: ${this.id} | Length: ${String.formatNumber(length_km)}km`
			}, { width: 99, x: 0, y: 0 }),
			move_to_brush: veButton(() => DALS.Timeline.parseAction({
				options: { name: "Select Geometry" },
				value: [{ type: "Brush", select_geometry_id: this.id }]
			}), { name: "Move To Brush", limit: () => (main.brush.selected_geometry?.id !== this.id), x: 0, y: 1 }),
			finish_line: veButton(() => DALS.Timeline.parseAction({
				options: { name: "Deselect Geometry", key: "deselect_geometry" },
				value: [{ type: "Brush", select_geometry_id: false }]
			}), { name: "Finish Line", limit: () => (main.brush.selected_geometry?.id === this.id), x: 0, y: 1 }),
			
			selected: veCheckbox(this.selected, {
				name: "Selected",
				onuserchange: (v) => this.selected = v,
				x: 1, y: 1
			})
		}, { is_folder: false });
		this.edit_symbol_ui = veInterface({
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
					if (this.geometry && this.value[2].label_geometries !== null) {
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
		}
		
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
				if (!["node", "node_override"].includes(main.brush.mode) && !HTML.ctrl_pressed)
					super.open("instance", { name: this.name, ...this.window_options });
				
				if (
					HTML.ctrl_pressed &&
					main.brush._selected_geometry?.id === this.id
					&& e.pickGeometryIndex !== undefined
				) {
					//Remove this index from the line instead
					DALS.Timeline.parseAction({
						options: { name: "Remove from Line", key: "remove_from_line" },
						value: [{
							type: "GeometryLine",
							
							geometry_id: main.brush._selected_geometry.id,
							remove_from_line: e.pickGeometryIndex
						}]
					});
				}
			});
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
			icon: veHTML(`<icon>polyline</icon>`, { tooltip: "GeometryLine" }),
			...super.drawHierarchyDatatypeGenerics(),
			context_menu: veButton(() => {
				this.history.draw();
				super.open("instance", { name: this.name, ...this.window_options })
			}, {
				name: "<icon>more_vert</icon>",
				tooltip: "More Actions",
				style: { cursor: "padding", order: 101, padding: 0 }
			})
		}, {
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
		let e = (arg0_e);
		
		//Push action to timeline
		if (main.brush.node_editor.mode === "add") {
			e.geometry = main.brush.getAddLine(e.geometry);
			DALS.Timeline.parseAction({
				options: { name: "Add to Line", key: "add_to_line" },
				value: [{
					type: "GeometryLine",
					
					geometry_id: this.id,
					add_to_line: { geometry: e.geometry.toJSON() }
				}]
			});
		}
		
		main.brush.node_editor.disable();
		main.brush.node_editor.enable();
	}
	
	/**
	 * Parses a JSON action for a target GeometryLine.
	 * - Static method of: {@link naissance.GeometryLine}
	 * 
	 * `arg0_json`: {@link Object|string}
	 * - `.geometry_id`: {@link string} - Identifier. The {@link naissance.Geometry} ID to target changes
	 * for, if any.
	 * <br>
	 * - #### Extraneous Commands:
	 * - `.create_line`: {@link Object}
	 *   - `.do_not_refresh`: {@link boolean}
	 *   - `.id`: {@link string}
	 *   - `.name`: {@link string}
	 * - #### Internal Commands:
	 *   - `.add_to_line`: {@link Object}
	 *     - `.geometry`: {@link string}
	 *   - `.remove_from_line`: {@link number} - The index of the multiline to remove.
	 */
	static parseAction (arg0_json) {
		//Convert from parameters
		let json = (typeof arg0_json === "string") ? JSON.parse(arg0_json) : arg0_json;
		
		//Declare local instance variables
		let line_obj = naissance.Geometry.instances.filter((v) => v.id === json.geometry_id)[0];
		
		//Parse extraneous commands
		//create_line
		if (json.create_line)
			if (json.create_line.id) {
				let new_line = new naissance.GeometryLine();
					new_line.id = json.create_line.id;
					if (json.create_line.name) {
						new_line.fire_action_silently = true;
						new_line.name = json.create_line.name;
						delete new_line.fire_action_silently;
					}
					if (main.brush.selected_feature)
						if (!json.create_line.do_not_refresh)
							UI_LeftbarHierarchy.refresh();
			}
		
		//Parse commands for line_obj
		if (line_obj && line_obj instanceof naissance.GeometryLine) {
			//add_to_line
			if (json.add_to_line !== undefined) {
				let geometry = line_obj.geometry;
				let ot_geometry = maptalks.Geometry.fromJSON(json.add_to_line.geometry);
				
				//Union with existing line if defined, if undefined replace geometry
				if (line_obj.geometry) {
					let all_geometries = geometry.getGeometries();
					let all_ot_geometries = ot_geometry.getGeometries();
					let maptalks_line_obj = new maptalks.MultiLineString();
						maptalks_line_obj.setGeometries(all_geometries.concat(all_ot_geometries));
					
					line_obj.addKeyframe(main.date, maptalks_line_obj.toJSON());
				} else {
					line_obj.addKeyframe(main.date, ot_geometry.toJSON());
				}
			}
			
			//remove_from_line
			if (json.remove_from_line !== undefined)
				if (typeof json.remove_from_line === "number") {
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
	}
};