if (!global.naissance) global.naissance = {};

naissance.GeometryLine = class extends naissance.Geometry {
	static hierarchy_symbol = {
		icon: "polyline",
		name: "Line",
		
		colour: "stroke"
	};
	
	constructor () {
		super();
		this.class_name = "GeometryLine";
		this.node_editor_mode = "LineString";
		
		//Add keyframe with default brush symbol upon instantiation
		let brush_symbol = main.brush.getBrushSymbol();
		if (brush_symbol)
			this.addKeyframe(main.date, undefined, brush_symbol);
		
		//KEEP AT BOTTOM!
		this.updateOwner();
	}
	
	_drawLabels () {
		if (this.value[2])
			if (this.geometry) {
				//Declare local instance variables
				let default_label_symbol = naissance.Renderer.getDefaultLabelSymbol();
				let label_geometries = (this.value[2].label_geometries) ?
					this.value[2].label_geometries : [];
				let label_name = (this.value[2].label_name) ?
					this.value[2].label_name : this.value[2].name;
				if (!label_name) return;
				
				let label_symbol = {
					...default_label_symbol,
					...this.value[2].label_symbol
				};
				if (label_symbol.hide_label) return;
				
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
							...label_symbol,
							textName: label_name,
						});
						
						if (main.settings.hide_labels_by_default)
							this.label_geometries[i].hide();
					}
					
					this.label_geometries[i].addTo(main.layers.label_layer);
				}
			}
	}
	
	draw () {
		//Declare local instance variables
		let derender_geometry = false;
		
		//1. Set this.value from current relative keyframe
		this.value = this.history.getKeyframe({ 
			date: main.date,
			guaranteed_indexes: [1]
		}).value;
		this.value[1] = this.getSymbol(this.value[1]);
		
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
					
					this._drawLabels(); //Draw labels
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
			this.history.draw(this.keyframes_ui);
			
			this.geometry.addEventListener("click", (e) => {
				if (!["node", "node_override", "node_transfer"].includes(main.brush.mode) && !HTML.ctrl_pressed)
					this.open("instance", { name: this.name, ...this.window_options });
				
				if (
					HTML.ctrl_pressed &&
					main.brush._selected_geometry?.id === this.id
					&& e.pickGeometryIndex !== undefined
				) {
					//Remove this index from the line instead
					DALS.Timeline.parseAction("remove_from_line", [{
						geometry_obj: main.brush._selected_geometry.id,
						remove_from_line: e.pickGeometryIndex
					}]);
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
	
	drawUI () {
		//Return statement
		return {
			edit_symbol_ui: veInterface({
				edit_label: new UI_LabelSymbol(main.settings.default_label_symbol, {
					name: "Label",
					special_function: (v) => UI_EditSelectedGeometries._makeSetSymbol({ label_symbol: v, _id: this.id })
				}),
				edit_stroke: new UI_LineSymbol(main.settings.default_line_symbol, {
					name: "Stroke",
					special_function: (v) => UI_EditSelectedGeometries._makeSetSymbol({ ...v, _id: this.id })
				})
			}, { name: "Edit Symbol" })
		};
	}
};