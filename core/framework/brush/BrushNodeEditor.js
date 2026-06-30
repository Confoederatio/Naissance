if (!global.naissance) global.naissnace = {};
naissance.BrushNodeEditor = class extends ve.Class {
	constructor () {
		super();
		
		//Declare local instance variables
		this.coords = [];
		this.mode = "Polygon";
		this.type = "add";
		this.enabled = false;
		
		this._click_listener = (e) => { this.onclick(e); };
		this._dblclick_listener = (e) => { this.ondblclick(e); };
		this._mousemove_listener = (e) => { this.onmousemove(e); };
	}
	
	addNode (coord) {
		this.coords.push(coord);
		this.draw();
	}
	
	disable () {
		this.enabled = false;
		this.coords = [];
		if (this.geometry) {
			this.geometry.remove();
			this.geometry = null;
		}
		map.off("click", this._click_listener);
		map.off("dblclick", this._dblclick_listener);
		map.off("mousemove", this._mousemove_listener);
	}
	
	draw (temp_coord) {
		if (this.geometry) this.geometry.remove();
		
		let draw_coords = [...this.coords];
		if (temp_coord) draw_coords.push(temp_coord);
		
		if (draw_coords.length < 2) return;
		
		let fill_color = (this.type === "remove") ? "rgba(240, 60, 60, 0.5)" : "rgba(255, 255, 255, 0.5)";
		let stroke_color = (this.type === "remove") ? "rgba(240, 60, 60, 1)" : "rgba(255, 255, 255, 1)";
		
		let current_mode = "Polygon";
		if (this.mode === "LineString" || this.mode === "FreeHandLineString")
			current_mode = "LineString";
		this.geometry = new maptalks[current_mode](draw_coords, {
			symbol: {
				polygonFill: fill_color,
				lineColor: stroke_color,
				lineWidth: 2
			}
		});
		
		this.geometry.addTo(main.layers.cursor_layer);
	}
	
	enable () {
		this.disable();
		this.enabled = true;
		this.type = "add";
		
		map.on("click", this._click_listener);
		map.on("dblclick", this._dblclick_listener);
		map.on("mousemove", this._mousemove_listener);
	}
	
	onclick (e) {
		if (HTML.ctrl_pressed && ["FreeHandLineString", "LineString"].includes(this.mode))
			return; //Remove isn;t valid for GeometryLine
		
		this.type = (HTML.ctrl_pressed) ? "remove" : "add";
		this.addNode(e.coordinate);
	}
	
	onmousemove (e) {
		if (this.coords.length === 0) return;
		this.draw(e.coordinate);
	}
	
	ondblclick (e) {
		if (this.coords.length < 2) return; //Internal guard clause if less than 2 coords to finish
		
		let selected_geometry = main.brush._selected_geometry;
		
		//Internal guard clause; check to make sure that ._selected_geometry is not in a provinces layer
		if (selected_geometry) {
			let layer_obj = selected_geometry.getLayer();
			if (layer_obj?._type === "provinces") {
				this.disable();
				this.enable();
				return;
			}
			
			//Call handler using .type instead of overwriting .mode
			if (naissance[selected_geometry.class_name]?.handleNodeEditorEnd)
				naissance[selected_geometry.class_name].handleNodeEditorEnd.call(selected_geometry, { geometry: this.geometry });
		}
		
		this.disable();
		this.enable();
	}
	
	update () {
		let selected_geometry = main.brush._selected_geometry;
		let is_node_brush = ["node", "node_override", "node_transfer"].includes(main.brush.mode);
		
		if (selected_geometry) {
			let is_geometry_line = selected_geometry instanceof naissance.GeometryLine;
			
			// Ensure LineString is used for lines, otherwise check node_editor_mode or default to Polygon
			if (is_node_brush || is_geometry_line) {
				this.mode = is_geometry_line ? "LineString" : (selected_geometry.node_editor_mode || "Polygon");
				this.enable();
			} else {
				this.disable();
			}
		} else {
			this.disable();
		}
	}
};

naissance.GeometryLine.handleNodeEditorEnd = function (arg0_e) {
	//Convert from parameters
	let e = arg0_e;
	
	//Push action to timeline based on .type
	if (main.brush.node_editor.type === "add") {
		e.geometry = main.brush.getAddLine(e.geometry);
		DALS.Timeline.parseAction("add_to_line", [{
			geometry_obj: this.id,
			add_to_line: { geometry: e.geometry.toJSON() }
		}]);
	}
	
	main.brush.node_editor.disable();
	main.brush.node_editor.enable();
};
naissance.GeometryPolygon.handleNodeEditorEnd = function (arg0_e) {
	//Convert from parameters
	let e = arg0_e;
	
	//Declare local instance variables
	let date_range = main.interfaces.edit_brush_keyframes.getDateRange();
	
	//Transfer handler
	if (main.brush.mode === "node_transfer") {
		try {
			let from_geometry_id = main.brush.from_geometry_id;
			let from_geometry = naissance.Geometry.instances[from_geometry_id];
			
			//Get the intersection of from_geometry and e.geometry
			if (!(from_geometry?.geometry && e?.geometry)) return; //Internal guard clause if neither are presently defined
			if (from_geometry?.id === this.id) return; //Internal guard clause for self-selection
			
			let cursor_turf_geometry = Geospatiale.convertMaptalksToTurf(e.geometry);
			let ot_turf_geometry = Geospatiale.convertMaptalksToTurf(from_geometry.geometry);
			let turf_geometry = (this.geometry) ? Geospatiale.convertMaptalksToTurf(this.geometry) : null;
			
			let turf_intersection = (main.brush.node_editor.type === "add") ?
				turf.intersect(turf.featureCollection([ot_turf_geometry, cursor_turf_geometry])) :
				turf.intersect(turf.featureCollection([turf_geometry, cursor_turf_geometry]));
			
			if (!turf_intersection) return; //Internal guard clause if nothing overlaps
			turf_intersection = turf.buffer(turf_intersection, 0.001, {
				units: "kilometers",
				steps: 1
			});
			
			//Transfer selected polygon
			e.geometry = Geospatiale.convertTurfToMaptalks(turf_intersection);
			
			if (main.brush.node_editor.type === "add") {
				DALS.Timeline.parseAction("remove_from_polygon", [{
					geometry_obj: from_geometry.id,
					remove_from_polygon: {
						date_range: date_range,
						geometry: e.geometry.toJSON()
					}
				}]); //Remove cut from target polygon
			} else if (main.brush.node_editor.type === "remove") {
				DALS.Timeline.parseAction("add_to_polygon", [{
					geometry_obj: from_geometry.id,
					add_to_polygon: {
						date_range: date_range,
						geometry: e.geometry.toJSON()
					}
				}]);
			}
			
		} catch (err) { console.error(err); }
	}
	
	//Push action to timeline for selected geometry
	if (main.brush.node_editor.type === "add") {
		e.geometry = main.brush.getAddPolygon(e.geometry);
		if (!e.geometry) console.log(`Undefined geometry:`, e.geometry);
		DALS.Timeline.parseAction("add_to_polygon", [{
			geometry_obj: this.id,
			add_to_polygon: {
				date_range: date_range,
				geometry: e.geometry.toJSON()
			},
			simplify_polygon: {
				date_range: date_range,
				tolerance: (main.brush.simplify > 0 && main.brush.simplify_applies_to_polygon) ?
					main.brush.simplify : undefined
			}
		}]); //Add cut to target polygon
	} else if (main.brush.node_editor.type === "remove") {
		e.geometry = main.brush.getRemovePolygon(e.geometry);
		DALS.Timeline.parseAction("remove_from_polygon", [{
			geometry_obj: this.id,
			remove_from_polygon: {
				date_range: date_range,
				geometry: e.geometry.toJSON()
			}
		}]);
	}
	
	main.brush.node_editor.disable();
	main.brush.node_editor.enable();
};