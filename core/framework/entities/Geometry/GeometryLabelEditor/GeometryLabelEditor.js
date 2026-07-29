if (!global.naissance) global.naissance = {};

/**
 * Label editor bound to a {@link naissance.Geometry} entity.
 * 
 * ##### Instance:
 * - `.geometry`: {@link naissance.Geometry} - The parent Naissance geometry entity. The rendered {@link maptalks.Geometry} is available as `.geometry.geometry`.
 * - `.interfaces`: {@link Object}
 * - `.label_geometries`: {@link Array}<{@link Object}>
 *   - `.geometry`: {@link Geospatiale.maptalks_CurvedLabel}|{@link maptalks.Geometry} - The rendered label geometry owned by this editor.
 *   - `.options`: {@link Object}
 *     - `.length`: {@link number} - Any positive length results in truncation.
 *     - `.symbol_obj`: {@link Object} - The maptalks symbol used by the label.
 *     - `.type`: {@link string} - Either 'curved'/'straight'.
 * - `.selected_geometries`: {@link Array}<{@link maptalks.Geometry}> - Reserved for selection overlays.
 * - `.selected_indexes`: {@link Array}<{@link number}> - Selected label indexes.
 *
 * @type {naissance.GeometryLabelEditor}
 */
naissance.GeometryLabelEditor = class {
	constructor (arg0_geometry) {
		//Convert from parameters
		let geometry = arg0_geometry;
		
		//Declare local instance variables
		this.geometry = geometry;
			this.geometry.is_label_editor_open = true;
		this.interfaces = {};
		this.selected_geometries = [];
		this.selected_indexes = [];
		
		//Update label_geometries
		let label_geometries = this.geometry.value?.[2]?.label_geometries;
		if (!label_geometries || label_geometries.length === 0) {
			let center_coords = (this.geometry.geometry) ? this.geometry.geometry.getCenter() : map.getCenter();
			this.addLabelGeometry(center_coords, {
				symbol_obj: {
					textName: this.geometry.name
				}
			});
		}
	}
	
	addLabelGeometry (arg0_coords, arg1_options) {
		//Convert from parameters
		let coords = arg0_coords;
		let options = (arg1_options) ? arg1_options : {};
		
		//Initialise options
		options.symbol_obj = {
			...naissance.Renderer.getDefaultLabelSymbol(),
			...options.symbol_obj
		};
		if (!options.symbol_obj.textName)
			options.symbol_obj.textName = (this.geometry?.name || "New Label");
		if (!options.type) options.type = "straight";
		
		//Declare local instance variables
		let map_instance = (global.map || window.map || map);
		let rendered_geometry = this.geometry?.geometry;
		
		if (options.type === "curved" && !Array.isArray(coords)) {
			let extent = (rendered_geometry) ? rendered_geometry.getExtent() : map_instance.getExtent();
			let center = (rendered_geometry) ? rendered_geometry.getCenter() : map_instance.getCenter();
			
			coords = [
				[extent.xmin, extent.ymax],
				[center.x, center.y],
				[extent.xmax, extent.ymin]
			];
		} else if (coords === undefined) {
			coords = (rendered_geometry) ? rendered_geometry.getCenter() : map_instance.getCenter();
		}
		
		let json_obj;
		if (options.type === "curved") {
			let temp_curved = new Geospatiale.maptalks_CurvedLabel(coords, {
				map: map_instance,
				text_string: options.symbol_obj.textName,
				base_font_size: Math.returnSafeNumber(options.symbol_obj.textSize, 16),
				base_zoom: map_instance.getZoom(),
				style: {
					fontFamily: options.symbol_obj.textFaceName || "sans-serif",
					color: options.symbol_obj.textFill || "#ffffff"
				}
			});
			json_obj = temp_curved.toJSON();
			temp_curved.remove();
			json_obj.options.symbol_obj = options.symbol_obj;
		} else {
			let new_marker = new maptalks.Marker(coords, {
				symbol: options.symbol_obj
			});
			json_obj = new_marker.toJSON();
			json_obj.options = options;
		}
		
		//Ensure .value[2].label_geometries exists
		if (!this.geometry.value) this.geometry.value = [];
		if (!this.geometry.value[2]) this.geometry.value[2] = {};
		if (!this.geometry.value[2].label_geometries) this.geometry.value[2].label_geometries = [];
		let label_geometries = this.geometry.value[2].label_geometries;
		label_geometries.push(json_obj);
		
		//Update keyframe; draw UI
		this.updateKeyframe();
	}
	
	deselect (arg0_index) {
		//Convert from parameters
		let index = arg0_index;
		
		//Iterate over all selected_indexes and splice matches
		for (let i = this.selected_indexes.length - 1; i >= 0; i--)
			if (this.selected_indexes[i] === index)
					this.selected_indexes.splice(i, 1);
		this.drawSelectedGeometries();
	}
	
	drawSelectedGeometries () {
		if (!this.selected_geometries) this.selected_geometries = [];
		
		let active_selected_objects = [];
		
		if (this.geometry?.label_geometries)
			for (let i = 0; i < this.geometry.label_geometries.length; i++) {
				let local_geometry = this.geometry.label_geometries[i];
				let is_selected = (this.selected_indexes.includes(i) && this.isSelected());
				
				if (local_geometry instanceof Geospatiale.maptalks_CurvedLabel) {
					//Toggle outline highlight directly on glyph DOM elements
					for (let x = 0; x < local_geometry.glyph_markers.length; x++) {
						let dom_el = local_geometry.glyph_markers[x].getDOM();
						if (dom_el) {
							let span_el = dom_el.querySelector("span");
							let target_el = (span_el) ? span_el : dom_el;
							target_el.style.outline = (is_selected) ? "2px solid yellow" : "none";
							target_el.style.outlineOffset = "2px";
						}
					}
					
					if (is_selected) try {
						let line_coords = local_geometry.coords;
						let existing_path = this.selected_geometries.find((geom) => geom._label_index === i);
						
						if (existing_path) {
							active_selected_objects.push(existing_path);
						} else {
							let path_line = new maptalks.LineString(line_coords, {
								draggable: true,
								smoothness: 0.5,
								symbol: {
									lineColor: "#00bfff",
									lineWidth: 2,
									lineDasharray: [4, 4]
								}
							});
							path_line._label_index = i;
							path_line.addTo(main.layers.selection_layer);
							path_line.startEdit();
							
							let updateCoords = () => {
								let raw_coords = path_line.getCoordinates();
								let updated_coords = [];
								
								for (let c = 0; c < raw_coords.length; c++)
									updated_coords.push([raw_coords[c].x, raw_coords[c].y]);
								
								local_geometry.setCoordinates(updated_coords);
								
								let saved_label_data = this.geometry.value?.[2]?.label_geometries;
								if (saved_label_data && saved_label_data[i]) {
									let current_symbol = saved_label_data[i].options?.symbol_obj || saved_label_data[i].symbol || local_geometry.options?.symbol_obj;
									
									if (!local_geometry.options) local_geometry.options = {};
									if (current_symbol) local_geometry.options.symbol_obj = current_symbol;
									
									saved_label_data[i] = local_geometry.toJSON();
									if (current_symbol) {
										if (!saved_label_data[i].options) saved_label_data[i].options = {};
										saved_label_data[i].options.symbol_obj = current_symbol;
										saved_label_data[i].symbol = current_symbol;
									}
								}
								
								this.updateKeyframe();
							};
							
							path_line.on("shapechange positionchange editend dragend dragpositionchange", updateCoords);
							active_selected_objects.push(path_line);
						}
					} catch (e) { console.error(e); }
				} else if (is_selected) try {
					let local_selected_geometry = local_geometry.copy();
					local_selected_geometry.setSymbol({
						...local_geometry.getSymbol(),
						textHaloFill: `rgba(255, 255, 0, 0.5)`,
						textHaloRadius: 4
					});
					main.layers.selection_layer.addGeometry(local_selected_geometry);
					active_selected_objects.push(local_selected_geometry);
				} catch (e) { console.error(e); }
			}
		
		//Clean up old selection overlays that are no longer active
		for (let i = 0; i < this.selected_geometries.length; i++) {
			let old_geom = this.selected_geometries[i];
			if (!active_selected_objects.includes(old_geom))
				old_geom.remove();
		}
		this.selected_geometries = active_selected_objects;
	}
	
	handleEvents () {
		//Attach event handles
		if (this?.geometry?.label_geometries && this.isSelected())
			for (let i = 0; i < this.geometry.label_geometries.length; i++) {
				let local_geometry = this.geometry.label_geometries[i];
				
				if (local_geometry instanceof maptalks.Geometry) {
					local_geometry.on("click", () => {
						if (!this.selected_indexes.includes(i)) {
							this.select(i);
						} else {
							this.deselect(i);
						}
					});
				} else if (local_geometry.glyph_markers) {
					for (let x = 0; x < local_geometry.glyph_markers.length; x++) {
						let marker = local_geometry.glyph_markers[x];
						let dom_el = marker.getDOM();
						
						if (dom_el) {
							let span_el = dom_el.querySelector("span");
							
							span_el.style.pointerEvents = "auto";
							span_el.style.cursor = "help";
							span_el.onclick = (e) => {
								if (e) e.stopPropagation();
								if (!this.selected_indexes.includes(i)) {
									this.select(i);
								} else {
									this.deselect(i);
								}
							};
						}
					}
				}
			}
	}
	
	isSelected () {
		//Return statement
		return (this?.geometry?.selected || this.window);
	}
	
	open () {
		//Declare local instance variables
		let default_label_symbol = {
			...main.settings.default_label_symbol,
			...(this.value?.[1]?.label_symbol || {})
		};
		let map_instance = (global.map || window.map || map);
		
		if (this.window) this.window.close();
		this.window = veWindow({
			actions_bar: veInterface({
				menu: veRawInterface({
					add_straight_label: veButton(() => {
						this.addLabelGeometry(map_instance.getCenter(), {
							symbol_obj: {
								textName: this.geometry.name
							}
						});
					}, { name: "Add Label (Straight)" }),
					add_curved_label: veButton(() => {
						let rendered_geometry = this.geometry?.geometry;
						let extent = (rendered_geometry) ? rendered_geometry.getExtent() : map_instance.getExtent();
						let center = (rendered_geometry) ? rendered_geometry.getCenter() : map_instance.getCenter();
						let curve_coords = [
							[extent.xmin, extent.ymax],
							[center.x, center.y],
							[extent.xmax, extent.ymin]
						];
						
						this.addLabelGeometry(curve_coords, {
							type: "curved",
							symbol_obj: {
								textName: this.geometry.name
							}
						});
					}, { name: "Add Label (Curved)" })
				})
			}, { name: "Label Actions", open: true }),
			edit_curved_label_style: new UI_CurvedLabelSymbol({}, {
				name: "Edit Selected Labels (Curved)",
				onuserchange: (v) => {
					let label_geometries = this.geometry.label_geometries;
					let saved_label_data = this.geometry.value?.[2]?.label_geometries;
					
					if (label_geometries && saved_label_data) {
						for (let i = 0; i < this.selected_indexes.length; i++) {
							let local_index = this.selected_indexes[i];
							let local_geometry = label_geometries[local_index];
							let local_json = saved_label_data[local_index];
							
							if (local_geometry instanceof Geospatiale.maptalks_CurvedLabel) {
								local_geometry.style = {
									...local_geometry.style,
									...v
								};
								if (!local_json.options) local_json.options = {};
								local_json.options.style = { ...local_geometry.style };
								local_geometry.render();
								
								let existing_symbol = local_json.options?.symbol_obj || local_json.symbol;
								saved_label_data[local_index] = local_geometry.toJSON();
								if (existing_symbol) {
									saved_label_data[local_index].options.symbol_obj = existing_symbol;
									saved_label_data[local_index].symbol = existing_symbol;
								}
							}
						}
						this.updateKeyframe();
					}
				}
			}),
			edit_selected_labels: new UI_LabelSymbol(default_label_symbol, {
				name: "Edit Selected Labels (Straight)",
				special_function: (v) => {
					let label_geometries = this.geometry.label_geometries;
					let saved_label_data = this.geometry.value?.[2]?.label_geometries;
					
					if (label_geometries && saved_label_data) {
						for (let i = 0; i < this.selected_indexes.length; i++) {
							let local_index = this.selected_indexes[i];
							let local_geometry = label_geometries[local_index];
							let local_json = saved_label_data[local_index];
							
							if (local_geometry && local_json) {
								let new_symbol = {
									...(local_json.options?.symbol_obj || local_json.symbol || {}),
									...v
								};
								
								if (!local_json.options) local_json.options = {};
								local_json.options.symbol_obj = new_symbol;
								local_json.symbol = new_symbol;
								
								if (local_geometry instanceof Geospatiale.maptalks_CurvedLabel) {
									if (!local_geometry.options) local_geometry.options = {};
									local_geometry.options.symbol_obj = new_symbol;
									
									if (v.textSize !== undefined) local_geometry.setFontSize(v.textSize);
									if (v.textName !== undefined) local_geometry.setText(v.textName);
									if (v.textFill !== undefined) local_geometry.style.color = v.textFill;
									if (v.textFaceName !== undefined) local_geometry.style.fontFamily = v.textFaceName;
									local_geometry.render();
									
									saved_label_data[local_index] = local_geometry.toJSON();
									saved_label_data[local_index].options.symbol_obj = new_symbol;
									saved_label_data[local_index].symbol = new_symbol;
								} else if (typeof local_geometry.setSymbol === "function") {
									local_geometry.setSymbol(new_symbol);
								}
							}
						}
						
						//Update keyframe; redraw
						this.updateKeyframe();
						if (this.geometry) this.geometry.draw();
						this.drawSelectedGeometries();
					}
				}
			}),
			selection: veInterface({
				menu: veRawInterface({
					clear_selection: veButton(() => {
						this.selected_indexes = [];
						this.drawSelectedGeometries();
						
						veToast(`Cleared selected labels.`);
					}, { name: "Clear Selection" }),
					move_selection: veButton((v, local_component) => {
						if (!this._is_being_moved) {
							veToast(`Click a new location on the map to move these labels to.`);
							this._is_being_moved = true;
							local_component.name = `Cancel Moving Selection`;
							
							map_instance.once("click", (e) => {
								let saved_labels = this.geometry.value?.[2]?.label_geometries;
								
								for (let i = 0; i < this.selected_indexes.length; i++) {
									let local_index = this.selected_indexes[i];
									let local_geometry = this.geometry.label_geometries[local_index];
									let local_json = saved_labels[local_index];
									
									if (local_geometry && local_json) {
										if (local_json.options?.type === "curved" || local_geometry instanceof Geospatiale.maptalks_CurvedLabel) {
											let old_coords = local_geometry.coords;
											let center_x = 0;
											let center_y = 0;
											
											for (let c = 0; c < old_coords.length; c++) {
												center_x += (old_coords[c].x !== undefined) ? old_coords[c].x : old_coords[c][0];
												center_y += (old_coords[c].y !== undefined) ? old_coords[c].y : old_coords[c][1];
											}
											center_x /= old_coords.length;
											center_y /= old_coords.length;
											
											let dx = e.coordinate.x - center_x;
											let dy = e.coordinate.y - center_y;
											let new_coords = [];
											
											for (let c = 0; c < old_coords.length; c++) {
												let cx = (old_coords[c].x !== undefined) ? old_coords[c].x : old_coords[c][0];
												let cy = (old_coords[c].y !== undefined) ? old_coords[c].y : old_coords[c][1];
												new_coords.push([cx + dx, cy + dy]);
											}
											
											local_geometry.setCoordinates(new_coords);
											local_json.coords = new_coords;
										} else {
											try {
												local_json.feature.geometry.coordinates = e.coordinate.toJSON();
											} catch (err) {}
										}
									}
								}
								
								delete this._is_being_moved;
								local_component.name = `Move Selection`;
								this.updateKeyframe();
								if (this.geometry) this.geometry.draw();
								this.drawSelectedGeometries();
							});
						} else {
							veToast(`Cancelled moving selection.`);
							delete this._is_being_moved;
							local_component.name = `Move Selection`;
						}
					}, { name: "Move Selection" }),
					delete_selected_labels: veButton(() => {
						veToast(`Deleted ${String.formatNumber(this.selected_indexes.length)} selected labels.`);
						
						for (let i = this.selected_indexes.length - 1; i >= 0; i--)
							this.removeLabelGeometry(this.selected_indexes[i]);
						this.selected_indexes = [];
						if (this.geometry) this.geometry.draw();
					}, { name: "Delete Selected Labels" }),
					select_all: veButton(() => {
						//Declare local instance variables
						let label_geometries = this.geometry.label_geometries;
						
						//Iterate over all label_geometries and select them
						for (let i = 0; i < label_geometries.length; i++)
							this.select(i);
						
						veToast(`Selected all ${String.formatNumber(label_geometries.length)} label geometries associated with ${this.geometry.name}.`);
					}, { name: "Select All" })
				})
			}, { name: "Selection", open: true })
		}, {
			can_rename: false,
			name: `Edit Labels (${this.geometry.name})`,
			width: "20rem"
		});
	}
	
	remove () {
		//Declare local instance variables
		this.geometry.is_label_editor_open = false;
		
		Object.iterate(this.interfaces, (local_key, local_value) => {
			if (local_value.remove) local_value.remove();
		});
		this.interfaces = {};
		
		//Iterate over all this.selected_geometries and remove them
		for (let i = 0; i < this.selected_geometries.length; i++)
			if (this.selected_geometries[i]) this.selected_geometries[i].remove();
		this.selected_geometries = [];
		
		//Call parent .draw() now that labels are removed
		if (this.geometry && this.geometry.draw)
			this.geometry.draw();
	}
	
	removeLabelGeometry (arg0_index) {
		//Convert from parameters
		let index = arg0_index;
		
		//Declare local instance variables
		let label_geometries = this.geometry.value?.[2]?.label_geometries;
		
		if (label_geometries && label_geometries[index]) {
			let selected_index = this.selected_indexes.indexOf(index);
			if (selected_index !== -1)
				this.selected_indexes.splice(selected_index, 1);
			
			label_geometries.splice(index, 1);
			this.updateKeyframe();
		}
	}
	
	select (arg0_index) {
		//Convert from parameters
		let index = arg0_index;
		
		//Select index if possible
		if (!this.selected_indexes.includes(index))
			this.selected_indexes.push(index);
		this.drawSelectedGeometries();
	}
	
	updateKeyframe () {
		//Declare local instance variables
		let parent_entity = this.geometry;
		
		if (!parent_entity || !parent_entity.is_naissance_geometry) return; //Internal guard clause if parent entity doesn't exist
		DALS.Timeline.parseAction("refresh_label_geometries", { 
			geometry_obj: this.geometry.id, 
			refresh_label_geometries: true 
		});
	}
};