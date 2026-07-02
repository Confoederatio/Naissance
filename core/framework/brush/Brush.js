if (!global.naissance) global.naissance = {};
naissance.Brush = class extends ve.Class {
	constructor () {
		super();
		
		//Declare local instance variables
		this.node_editor = new naissance.BrushNodeEditor();
		this.radius = 50000;
		this._selected_feature = undefined;
		this._selected_geometry = undefined;
		this.symbol = {};
		
		//Draw
		this.cursor = new maptalks.Circle([0, 0], this.radius, {
			symbol: {
				lineColor: Colour.convertRGBAToHex([0, 0, 0]),
				lineDasharray: [4, 4],
				polygonFill: "transparent",
				lineWidth: 2
			}
		});
		main.layers.cursor_layer.addGeometry(this.cursor);
		
		//Declare brush UI
		this.brush_options = new ve.Interface({
			disabled: veToggle(false, {
				binding: "this.disabled",
				onchange: (v) => {
					if (this.cursor)
						if (v) {
							this.cursor.hide();
							map.config("draggable", true);
						} else {
							this.cursor.show();
						}
				},
				name: "Disable Brush", x: 0, y: 0
			}),
			brush_mode: veSelect({
				normal: {
					name: "Default",
					selected: true
				},
				fill_tool: {
					name: "Fill Bucket"
				},
				node: {
					name: "Node"
				},
				node_override: {
					name: "Node Override"
				},
				node_transfer: {
					name: "Node Transfer"
				},
				override: {
					name: "Override"
				}
			}, {
				binding: "this.mode",
				name: "Brush Mode:", x: 1, y: 0,
				onchange: (v) => {
					console.log(`Brush Mode changed to:`, v);
					setTimeout(() => this.node_editor.update());
				}
			}),
			
			//Row 1: Colour
			colour: veColour("#1bbc9b", {
				name: "<b>Fill</b> Colour",
				binding: "this.colour",
				onchange: (v, e) => {
					try { //console.log(`Changed from user ${v}`);
						naissance.Brush.setSelectedSymbol({ polygonFill: e.getHex() }); 
					} catch (e) { console.error(e); }
				},
				x: 0, y: 1
			}),
			opacity: veNumber(70, {
				name: "Opacity",
				max: 100,
				min: 0,
				
				binding: "this.opacity",
				onchange: (v) => {
					try { 
						naissance.Brush.setSelectedSymbol({
							polygonOpacity: v/100
						}); 
					} catch (e) { console.error(e); }
				},
				x: 1, y: 1
			}),
			stroke_colour: veColour("#000000", {
				name: "<b>Stroke</b> Colour",
				binding: "this.stroke_colour",
				onchange: (v, e) => {
					try {
						naissance.Brush.setSelectedSymbol({ lineColor: e.getHex() });
					} catch (e) { console.error(e); }
				},
				x: 0, y: 2
			}),
			stroke_opacity: veNumber(100, {
				name: "Opacity",
				max: 100,
				min: 0,
				
				binding: "this.stroke_opacity",
				onchange: (v) => {
					try {
						naissance.Brush.setSelectedSymbol({
							lineOpacity: v/100
						});
					} catch (e) { console.error(e); }
				},
				style: { display: "inline" },
				x: 1, y: 2
			}),
			stroke_width: veNumber(2, {
				name: "Width",
				binding: "this.stroke_width",
				step: 1,
				onchange: (v) => {
					try {
						naissance.Brush.setSelectedSymbol({ lineWidth: v });
					} catch (e) { console.error(e); }
				},
				style: { display: "inline" },
				x: 1, y: 2
			}),
			from_geometry: new UI_GeometryDatalist(undefined, {
				name: "From Geometry",
				binding: "this.from_geometry_id",
        filter_types: ["GeometryLine", "GeometryPolygon"],
				limit: () => this.mode === "node_transfer",
				width: 2,
				x: 0, y: 3
			}),
			node_buffer: veNumber(Math.returnSafeNumber(this.node_buffer, 5), {
				name: "Node Buffer (m)",
				binding: "this.node_buffer",
				limit: () => this.mode === "node_transfer",
				width: 2,
				x: 0, y: 4
			}),
			
			actions_bar: veRawInterface({
				keyframes: veButton(() => {
					if (this.brush_keyframes_window) this.brush_keyframes_window.close();
					this.brush_keyframes_window = veWindow(main.interfaces.edit_brush_keyframes.draw(), {
						name: "Edit Brush Date Range",
						can_rename: false,
						width: "20rem",
						x: "50dvw - 20rem/2",
						y: "50dvh"
					});
				}, {
					name: "Edit Date Range",
					limit: () => !this.disabled
				}),
				properties: veButton(() => {
					main.interfaces.edit_selected_geometries_ui.open();
				}, {
					name: "Edit Selected Geometries",
					limit: () => this.hasSelectedGeometry()
				})
			}, {
				style: {
					display: "flex",
					"[component='ve-button']": { marginRight: `var(--padding)` }
				},
				width: 99,
				x: 0, y: 5
			})
		}, { name: "Brush Options:", open: true });
		this.optimisation = veInterface({
			simplify: veRange(0, {
				binding: "this.simplify",
				name: "Simplify", 
				x: 0, y: 0,
				style: {
					"input[type='range']": { 
						width: "calc(50% - var(--padding))" 
					},
					"#value-label": { marginLeft: "var(--padding)" }
				}
			}),
			simplify_applies_to_polygon: veCheckbox(false, {
				to_binding: "this.simplify_applies_to_polygon",
				name: "Applies to Polygon",
				tooltip: "Whether the simplification should apply to the polygon as well as the brush.",
				x: 1, y: 0,
				style: {
					display: "flex",
					"input[type='checkbox']": {
						order: 0
					},
					"#name": {
						marginLeft: "var(--padding)",
						order: 1,
						whiteSpace: "nowrap"
					}
				}
			}),
			fill_truncate: veNumber(2, {
				binding: "this.fill_truncate",
				name: "Fill Truncate",
				limit: () => this.mode === "fill_tool",
				min: 0,
				tooltip: "Determines precision when using the fill tool.<br>0 to disable.",
				x: 0, y: 1
			}),
			fill_buffer: veNumber(500, {
				binding: "this.fill_buffer",
				name: "Fill Buffer (m)",
				limit: () => this.mode === "fill_tool",
				min: 0,
				tooltip: "Determines the buffer when using the fill tool.<br>0 to disable.",
				x: 1, y: 1
			})
		}, { name: "Brush Optimisation:", open: true });
		this.information_display = veHTML(() => {
			let cursor_coordinates = this.cursor.getCoordinates();
			
			return `Lng (X): ${String.formatNumber(cursor_coordinates.x, 2)}; Lat (Y): ${String.formatNumber(cursor_coordinates.y, 2)} | Size: ${String.formatNumber(this.radius/1000, 2)}km`;
		});
		
		super.open("instance", {
			anchor: "bottom_right",
			mode: "static_window",
			name: "Brush",
			width: "26rem",
			x: 8,
			y: 8
		});
		this.handleEvents();
	}
	
	get selected_feature () {
		//Return statement
		return this._selected_feature;
	}
	
	set selected_feature (v) {
		let old_selected_feature = this._selected_feature;
		this._selected_feature = v;
		if (old_selected_feature && old_selected_feature.draw) {
			old_selected_feature.draw(); //Update draw
			UI_Leftbar.refresh();
		}
	}
	
	get selected_geometry () {
		//Return statement
		return this._selected_geometry;
	}
	
	set selected_geometry (v) {
		let old_selected_geometry = this._selected_geometry;
		this._selected_geometry = v;
		if (old_selected_geometry && old_selected_geometry.draw) 
			old_selected_geometry.draw(); //Update draw
    if (this._selected_geometry && this._selected_geometry.draw)
      this._selected_geometry.draw(); //Update draw
	}
	
	getAddLine (arg0_geometry) {
		//Convert from parameters
		let geometry = arg0_geometry;
		
		//Process geometry if valid
		if (this._selected_geometry instanceof naissance.GeometryLine) {
			//1. Check geometry.current_keyframe[0] and union lines
			let all_geometries = [];
			
			if (geometry.current_keyframe)
				if (geometry.current_keyframe.value[0]) {
					let current_geometry = maptalks.Geometry.fromJSON(geometry.current_keyframe.value[0]);
					
					if (current_geometry.getGeometries)
						all_geometries = current_geometry.getGeometries();
				}
			all_geometries.push(geometry);
			
			let maptalks_line_obj = new maptalks.MultiLineString();
				try {
					console.log(all_geometries);
					maptalks_line_obj.setGeometries(all_geometries);	
				} catch (e) {
					console.error(`The following geometries were invalid:`, all_geometries);
				}
			
			//Return statement
			return maptalks_line_obj;
		}
	}
	
	getAddPolygon (arg0_geometry) {
		//Convert from parameters
		let geometry = arg0_geometry;
		
		//Process geometry if valid
		if (this._selected_geometry instanceof naissance.GeometryPolygon) {
			let turf_geometry = Geospatiale.convertMaptalksToTurf(geometry);
			
			//1. Brush; Simplify handling
			if (main.brush.simplify > 0)
				turf_geometry = turf.simplify(turf_geometry, {
					tolerance: main.brush.simplify
				});
			
			//2. Commit; Layer handling
			{
				//2.1. Fetch the current layer of the present geometry
				let current_layer = this._selected_geometry.getLayer();
				
				//2.2. If defined, buffer first (to prevent zero-width holes), then difference all geometries in the layer from turf_cursor_geometry
				if (current_layer) {
					let all_layer_geometries = current_layer.getAllGeometries();
					
					for (let i = 0; i < all_layer_geometries.length; i++)
						if (all_layer_geometries[i].id !== this._selected_geometry.id && all_layer_geometries[i].geometry) try {
							let is_visible = false;
							try {
								let current_keyframe = all_layer_geometries[i].history.getKeyframe();
								
								if (current_keyframe) {
									if (current_keyframe.value[0] && Object.keys(current_keyframe.value[0]).length)
										is_visible = true;
									if (current_keyframe.value[2] !== undefined && current_keyframe.value[2].hidden)
										is_visible = false;
								}
							} catch (e) { console.warn(e); }
							
							if (!["override", "node_override", "node_transfer"].includes(this.mode) && is_visible)
								turf_geometry = turf.difference(turf.featureCollection([
									turf_geometry,
									Geospatiale.convertMaptalksToTurf(all_layer_geometries[i].geometry)
								]));
						} catch (e) { console.warn(e); }
				}
			}
			
			//Return statement
			return Geospatiale.convertTurfToMaptalks(turf_geometry);
		}
	}
	
	getBrushSymbol () {
		//Declare local instance variables
		let brush_symbol_obj = {
			polygonFill: this.brush_options.colour.getHex(),
			polygonOpacity: this.opacity/100,
			lineColor: this.brush_options.stroke_colour.getHex(),
			lineOpacity: this.stroke_opacity/100,
			lineWidth: this.stroke_width
		};
		let default_symbol_obj = naissance.Renderer.getDefaultSymbol();
		
		//Diff brush_symbol_obj with default_symbol_obj
		Object.iterate(brush_symbol_obj, (local_key, local_value) => {
			if (local_value === default_symbol_obj[local_key])
				delete brush_symbol_obj[local_key];
		});
		
		//Return statement
		return brush_symbol_obj;
	}
	
	getCoordinates () { return this.cursor.getCoordinates(); }
	
	getRemovePolygon (arg0_geometry) {
		//Convert from parameters
		let geometry = arg0_geometry;
		
		//Process geometry if valid
		if (this._selected_geometry instanceof naissance.GeometryPolygon) {
			let turf_geometry = Geospatiale.convertMaptalksToTurf(geometry);
			
			//1. Brush; Simplify handling
			if (main.brush.simplify > 0)
				turf_geometry = turf.simplify(turf_geometry, {
					tolerance: main.brush.simplify
				});
			
			//Return statement
			return Geospatiale.convertTurfToMaptalks(turf_geometry);
		}
	}
	
	handleEvents () {
		//Map event handlers
		map_component.on("click", (e) => {
			if (main.brush.mode === "fill_tool") {
				if (!(this._selected_geometry && this._selected_geometry instanceof naissance.GeometryPolygon)) return;
				if (this._selected_geometry.getLayer()?.type === "provinces") {
					veToast(`<icon>warning</icon> You cannot use the fill tool on Polygons that are currently in a Province Layer!`);
					return;
				}
				
				//Fill bucket logic
				map.identify({
					coordinate: e.coordinate,
					layers: [main.layers.entity_layer],
				}, (geometries) => {
					for (let i = 0; i < geometries.length; i++) 
						if (geometries[i]._naissance_province) {
							let turf_geometry = Geospatiale.convertMaptalksToTurf(geometries[i]);
							
							if (this.fill_buffer !== 0)
								turf_geometry = turf.buffer(turf_geometry, this.fill_buffer/1000, { units: "kilometers" });
							if (this.fill_truncate !== 0) 
								turf_geometry = turf.truncate(turf_geometry, { precision: this.fill_truncate });
							
							if (!HTML.ctrl_pressed) {
								DALS.Timeline.parseAction("add_to_polygon", [{
									geometry_obj: this._selected_geometry.id,
									add_to_polygon: { geometry: turf_geometry }
								}]);
							} else {
								DALS.Timeline.parseAction("remove_from_polygon", [{
									geometry_obj: this._selected_geometry.id,
									remove_from_polygon: { geometry: turf_geometry }
								}]);
							}
							
							break;
						}
				});
			}
		});
		
		map_component.on("mousedown", (e) => {
			setTimeout(() =>{
				if (this.disabled) return;
				if (HTML.left_click || HTML.right_click) map.config("draggable", false);
			});			
		});
		map_component.on("mouseup", (e) => {
			map.config("draggable", true);
			if (HTML.middle_click)
				if (main.brush._selected_geometry instanceof naissance.GeometryLine)
					this.node_editor.enable();
		});
		
		//Context menu handler
		map_component.on("contextmenu", (e) => {
      if (!this.disabled) main.interfaces.ui_map_context_menu = new UI_MapContextMenu();
		});
		
		//Cursor handler
		map_component.on("mousemove", (e) => {
			this.cursor.setCoordinates(e.coordinate);
			if (this.disabled || ["fill_tool", "node", "node_override", "node_transfer"].includes(main.brush.mode)) return;
			
			if (this._selected_geometry instanceof naissance.GeometryPolygon && (HTML.left_click || HTML.right_click)) {
				//Internal guard clause if in provinces layer
				let layer_obj = this._selected_geometry.getLayer();
					if (layer_obj?.type === "provinces") return;
				let processed_geometry = (HTML.left_click) ?
					this.getAddPolygon(this.cursor) : this.getRemovePolygon(this.cursor);
				
				if (processed_geometry)
					if (HTML.left_click) {
						//add_to_polygon
						DALS.Timeline.parseAction("add_to_polygon", [{
							geometry_obj: this._selected_geometry.id,
							add_to_polygon: { geometry: processed_geometry.toJSON() },
							simplify_polygon: (main.brush.simplify > 0 && main.brush.simplify_applies_to_polygon) ?
								main.brush.simplify : undefined
						}]);
					} else if (HTML.right_click) {
						DALS.Timeline.parseAction("remove_from_polygon", [{
							geometry_obj: this._selected_geometry.id,
							remove_from_polygon: { geometry: processed_geometry.toJSON() }
						}]);
					}
			}
		});
		map.getContainer().addEventListener("wheel", (e) => {
			if (this.disabled) return;
			
			//Normalise the wheel delta across different browsers
			let delta_y = e.deltaY*-1;
			
			if (HTML.ctrl_pressed) {
				if (delta_y < 0)
					this.radius *= 1.1;
				if (delta_y > 0)
					this.radius *= 0.9;
				this.cursor.setRadius(this.radius);
			}
		});
	}
	
	hasSelectedGeometry () {
		//Declare local instance variables
		let has_selected_geometry = false;
		
		//Return statement
		Object.iterate(naissance.Geometry.instances, (local_key, local_geometry) => {
			if (local_geometry.selected === true) has_selected_geometry = true;
		});
		
		return has_selected_geometry;
	}
	
	static getSelectedGeometries () {
		//Declare local instance variables
		let selected_geometries = [];
		
		//Iterate over naissance.Geometry.instances and check for .selected
		Object.iterate(naissance.Geometry.instances, (local_key, local_geometry) => {
			if (local_geometry.selected) selected_geometries.push(local_geometry);
		});
		
		//Return statement
		return selected_geometries;
	}
	
	static setSelectedLabelSymbol (arg0_symbol_obj) {
		//Convert from parameters
		let symbol_obj = (arg0_symbol_obj) ? arg0_symbol_obj : {};
		
		//Declare local instance variables
		let json_obj = [];
		
		//Iterate over naissance.Geometry.instances and check for .selected
		Object.iterate(naissance.Geometry.instances, (local_key, local_geometry) => {
			if (local_geometry.selected)
				json_obj.push({
					geometry_obj: local_geometry.id,
					set_label_symbol: symbol_obj
				});
		});
		DALS.Timeline.parseAction("set_selected_label_symbol", json_obj);
	}
	
	static setSelectedSymbol (arg0_symbol_obj) {
		//Convert from parameters
		let symbol_obj = (arg0_symbol_obj) ? arg0_symbol_obj : {};
		
		//Declare local instance variables
		let json_obj = [];
		
		//Iterate over naissance.Geometry.instances and check for .selected
		Object.iterate(naissance.Geometry.instances, (local_key, local_geometry) => {
			if (local_geometry.selected)
				json_obj.push({
					geometry_obj: local_geometry.id,
					set_symbol: symbol_obj
				});
		});
		DALS.Timeline.parseAction("set_selected_symbol", json_obj);
	}
	
	static setSelectedProperties (arg0_properties_obj) {
		//Convert from parameters
		let properties_obj = (arg0_properties_obj) ? arg0_properties_obj : {};
		
		//Declare local instance variables
		let json_obj = {
			options: { name: "Set Selected Properties", key: "set_selected_properties" },
			value: []
		};
		
		//Iterate over naissance.Geometry.instances and check for .selected
		Object.iterate(naissance.Geometry.instances, (local_key, local_geometry) => {
			if (local_geometry.selected)
				json_obj.value.push({
					geometry_obj: local_geometry.id,
					set_properties: properties_obj
				});
		});
		DALS.Timeline.parseAction("set_selected_properties", json_obj);
	}
};