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
				node: {
					name: "Node"
				},
				node_override: {
					name: "Node Override"
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
			
			properties: veButton(() => {
				main.interfaces.edit_selected_geometries_ui.open();
			}, {
				name: "Edit Selected Geometries",
				limit: () => this.hasSelectedGeometry(),
				width: 2,
				x: 0, y: 3
			})
		}, { name: "Brush Options:", open: true });
		this.optimisation = veInterface({
			simplify: veRange(0.05, {
				binding: "this.simplify",
				name: "Simplify", x: 0, y: 0
			}),
			simplify_applies_to_brush: veCheckbox(false, {
				to_binding: "this.simplify_applies_to_brush",
				name: "Applies to Brush",
				tooltip: "Whether the simplification should apply to the brush only instead of the selected polygon.",
				x: 1, y: 0
			})
		}, { name: "Brush Optimisation:", open: true });
		this.information_display = veHTML(() => {
			let cursor_coordinates = this.cursor.getCoordinates();
			
			return `X: ${String.formatNumber(cursor_coordinates.x, 2)}; Y: ${String.formatNumber(cursor_coordinates.y, 2)} | Size: ${String.formatNumber(this.radius/1000, 2)}km`;
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
			UI_LeftbarHierarchy.refresh();
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
				maptalks_line_obj.setGeometries(all_geometries);
			
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
							if (!["override", "node_override"].includes(this.mode))
								turf_geometry = turf.difference(turf.featureCollection([
									turf_geometry,
									turf.buffer(Geospatiale.convertMaptalksToTurf(all_layer_geometries[i].geometry), 0.001, { units: "kilometers"})
								]));
						} catch (e) { console.warn(e); }
				}
			}
			
			//Return statement
			return Geospatiale.convertTurfToMaptalks(turf_geometry);
		}
	}
	
	getBrushSymbol () {
		//Return statement
		return {
			//Point
			'markerFile'   : 'gfx/icons/marker_default.png',
			'markerWidth'  : 40,
			'markerHeight' : 40,
			'markerDx'     : 0,
			'markerDy'     : 0,
			'markerOpacity': 1,
			
			
			//Polygon
			polygonFill: this.brush_options.colour.getHex(),
			polygonOpacity: this.opacity/100,
			lineColor: this.brush_options.stroke_colour.getHex(),
			lineOpacity: this.stroke_opacity/100,
			lineWidth: this.stroke_width,
			
			//Label
			textFaceName: (main.settings.default_label_font) ?
				main.settings.default_label_font : "Karla, sans-serif",
			textFill: (main.settings.default_label_colour) ?
				main.settings.default_label_colour : `#ffffff`,
			textHaloFill: (main.settings.default_label_stroke) ?
				main.settings.default_label_stroke : `#000000`,
			textHaloRadius: Math.returnSafeNumber(main.settings.default_label_stroke_width, 2),
			textSize: Math.returnSafeNumber(main.settings.default_label_font_size, 14)
		};
	}
	
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
		map.on("mousedown", (e) => {
			setTimeout(() =>{
				if (this.disabled) return;
				if (HTML.left_click || HTML.right_click) map.config("draggable", false);
				if (HTML.middle_click) this.node_editor.disable();
			});			
		});
		map.on("mouseup", (e) => {
			map.config("draggable", true);
			if (HTML.middle_click)
				if (main.brush._selected_geometry instanceof naissance.GeometryLine)
					this.node_editor.enable();
		});
		
		//Context menu handler
		map.on("contextmenu", (e) => {
			main.interfaces.ui_map_context_menu = new UI_MapContextMenu();
		});
		
		//Cursor handler
		map.on("mousemove", (e) => {
			this.cursor.setCoordinates(e.coordinate);
			if (this.disabled || ["node", "node_override"].includes(main.brush.mode)) return;
			
			if (this._selected_geometry instanceof naissance.GeometryPolygon && (HTML.left_click || HTML.right_click)) {
				let processed_geometry = (HTML.left_click) ?
					this.getAddPolygon(this.cursor) : this.getRemovePolygon(this.cursor);
				
				if (processed_geometry)
					if (HTML.left_click) {
						//add_to_polygon
						DALS.Timeline.parseAction({
							options: { name: "Add to Polygon", key: "add_to_polygon" },
							value: [{
								type: "GeometryPolygon",
								
								geometry_id: this._selected_geometry.id,
								add_to_polygon: { geometry: processed_geometry.toJSON() },
								simplify_polygon: (main.brush.simplify > 0 && main.brush.simplify_applies_to_brush) ?
									main.brush.simplify : undefined
							}]
						});
					} else if (HTML.right_click) {
						DALS.Timeline.parseAction({
							options: { name: "Remove from Polygon", key: "remove_from_polygon" },
							value: [{
								type: "GeometryPolygon",
								
								geometry_id: this._selected_geometry.id,
								remove_from_polygon: { geometry: processed_geometry.toJSON() }
							}]
						});
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
		//Return statement
		for (let i = 0; i < naissance.Geometry.instances.length; i++)
			if (naissance.Geometry.instances[i].selected === true)
				return true;
	}
	
	/**
	 * Parses a JSON action for the target Brush.
	 * - Static method of: {@link naissance.Brush}
	 * 
	 * `arg0_json`: {@link Object|string}
	 * - `.select_feature_id`: {@link string|null}
	 * - `.select_geometry_id`: {@link string|null}
	 * 
	 * @param {Object|string} arg0_json
	 */
	static parseAction (arg0_json) {
		//Convert from parameters
		let json = (typeof arg0_json === "string") ? JSON.parse(arg0_json) : arg0_json;
		
		if (typeof json.select_feature_id === "string") {
			let feature_obj = naissance.Feature.instances.filter((v) => v.id === json.select_feature_id);
				if (feature_obj) feature_obj = feature_obj[0];
			main.brush.selected_feature = feature_obj;
			if (main.brush.selected_feature) main.brush.selected_feature.draw(); 
		} else if (json.select_feature_id === false) {
			main.brush.selected_feature = undefined;
		}
		if (json.select_geometry_id !== undefined) {
			//Handle old geometry
			//main.brush.mode === "override" handling
			if (main.brush.selected_geometry && ["node_override", "override"].includes(main.brush.mode)) {
				//1. Fetch the current layer, turf_cursor_geometry of the present brush
				let current_layer = main.brush.selected_geometry.getLayer();
				
				//2. If defined, difference turf_brush_geometry from all geometries in the layer
				if (current_layer && main.brush.selected_geometry.geometry) {
					let all_layer_geometries = current_layer.getAllGeometries();
					
					for (let i = 0; i < all_layer_geometries.length; i++)
						if (all_layer_geometries[i].id !== main.brush.selected_geometry.id && all_layer_geometries[i].geometry) try {
								DALS.Timeline.parseAction({
									options: { name: "Remove from Polygon", key: "remove_from_polygon" },
									value: [{
										type: "GeometryPolygon",
										
										geometry_id: all_layer_geometries[i].id,
										remove_from_polygon: { geometry: main.brush.selected_geometry.geometry.toJSON() }
									}]
								});
							} catch (e) { console.warn(e); }
				}
			}
			
			//Select new geometry
			if (typeof json.select_geometry_id === "string") {
				let geometry_obj = naissance.Geometry.instances.filter((v) => v.id === json.select_geometry_id);
				if (geometry_obj) geometry_obj = geometry_obj[0];
				main.brush.selected_geometry = geometry_obj;
				if (main.brush.selected_geometry) main.brush.selected_geometry.draw();
			} else if (json.select_geometry_id === false) {
				main.brush.selected_geometry = undefined;
			}
			
			//Handle brush mode
			main.brush.node_editor.update();
		}
	}
	
	static setSelectedLabelSymbol (arg0_symbol_obj) {
		//Convert from parameters
		let symbol_obj = (arg0_symbol_obj) ? arg0_symbol_obj : {};
		
		//Declare local instance variables
		let json_obj = {
			options: { name: "Set Selected Label Symbol", key: "set_selected_label_symbol" },
			value: []
		};
		
		//Iterate over naissance.Geometry.instances and check for .selected
		for (let i = 0; i < naissance.Geometry.instances.length; i++)
			if (naissance.Geometry.instances[i].selected)
				json_obj.value.push({
					type: "Geometry",
					
					geometry_id: naissance.Geometry.instances[i].id,
					set_label_symbol: symbol_obj
				});
		DALS.Timeline.parseAction(json_obj);
	}
	
	static setSelectedSymbol (arg0_symbol_obj) {
		//Convert from parameters
		let symbol_obj = (arg0_symbol_obj) ? arg0_symbol_obj : {};
		
		//Declare local instance variables
		let json_obj = {
			options: { name: "Set Selected Symbol", key: "set_selected_symbol" },
			value: []
		};
		
		//Iterate over naissance.Geometry.instances and check for .selected
		for (let i = 0; i < naissance.Geometry.instances.length; i++)
			if (naissance.Geometry.instances[i].selected)
				json_obj.value.push({
					type: "Geometry",
					
					geometry_id: naissance.Geometry.instances[i].id,
					set_symbol: symbol_obj
				});
		DALS.Timeline.parseAction(json_obj);
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
		for (let i = 0; i < naissance.Geometry.instances.length; i++)
			if (naissance.Geometry.instances[i].selected)
				json_obj.value.push({
					type: "Geometry",
					
					geometry_id: naissance.Geometry.instances[i].id,
					set_properties: properties_obj
				});
		DALS.Timeline.parseAction(json_obj);
	}
};