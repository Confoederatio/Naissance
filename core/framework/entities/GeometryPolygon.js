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
	static hierarchy_symbol = {
		icon: "pentagon",
		name: "Polygon",
		
		colour: "fill" //Either 'fill'/'stroke'
	};
	
	constructor (arg0_options) {
		//Convert from parameters
		let options = (arg0_options) ? arg0_options : {};
			super(options);
		
		//Declare local instance variables
		this.class_name = "GeometryPolygon";
		this.node_editor_mode = "Polygon";
		
		//Add keyframe with default brush symbol upon instantiation
		if (!options.is_import) {
			let brush_symbol = main.brush.getBrushSymbol();
			if (brush_symbol)
				this.addKeyframe(main.date, undefined, brush_symbol);
		}
		
		//KEEP AT BOTTOM!
		this.updateOwner();
	}
	
	_drawLabels () {
		try {
			if (this.value[2]) {
				//Declare local instance variables
				let default_label_symbol = naissance.Renderer.getDefaultLabelSymbol();
				let hide_labels_under_km2 = Math.returnSafeNumber(main.settings.hide_labels_under_km2, 1000);
				
				//Fetch this.value[2].label_coordinates, this.value[2].label_name/name, this.value[2].label_symbol
				if (this.geometry) {
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
							this.label_geometries[0].area = this.geometry.getArea();
						} else {
							let all_geometries = this.geometry.getGeometries();
							
							for (let i = 0; i < all_geometries.length; i++) {
								let local_area = all_geometries[i].getArea();
								if (local_area < hide_labels_under_km2*1000000 && i > 0) continue; //Internal guard clause for small exclaves <1000km^2
								
								let local_label_geometry = new maptalks.Marker(all_geometries[i].getCenter());
								local_label_geometry.area = local_area;
								this.label_geometries.push(local_label_geometry);
							}
						}
					} else {
						for (let i = 0; i < label_geometries.length; i++)
							this.label_geometries[i] = maptalks.Geometry.fromJSON(label_geometries[i]);
					}
					
					//Iterate over all this.label_geometries, apply settings
					for (let i = 0; i < this.label_geometries.length; i++) {
						let local_label_geometry = this.label_geometries[i];
						if (!local_label_geometry) continue;
						
						//2. .label_name/.name
						if (label_geometries.length === 0) {
							this.label_geometries[i].setSymbol({
								...label_symbol,
								textName: label_name,
							});
							
							if (main.settings.hide_labels_by_default)
								this.label_geometries[i].hide();
						}
						if (local_label_geometry.area !== undefined)
							local_label_geometry.setZIndex(-local_label_geometry.area);
						local_label_geometry.addTo(main.layers.label_layer);
					}
				}
			}
		} catch (e) { console.error(e); }
	}
	
	draw () {
		//Remove geometry first to handle it
		if (this.geometry) this.geometry.remove();
		if (this.selected_geometry) this.selected_geometry.remove();
		if (this.label_geometries)
			for (let i = this.label_geometries.length - 1; i >= 0; i--) {
				this.label_geometries[i].remove();
				this.label_geometries.splice(i, 1);
			}
		this.geometry = undefined;
		this.selected_geometry = undefined;
		
		//1. Set this.value from current relative keyframe
		if (this.history._hasTimestampAfter(main.timestamp)) {
			this.value = this.history.getKeyframe({ 
				date: main.timestamp,
				guaranteed_indexes: [1]
			}).value;
			this.value[1] = this.getSymbol(this.value[1]);
				
			if (this.value === undefined || this.value?.length === 0 || this._is_visible === false) return;
			
			//2. Check any cause for derendering
			if (this.value && this.value[0] === null) return;
			if (this.value && this.value[2]) {
				if (this.value[2].hidden) return;
				if (this.value[2].max_zoom && map.getZoom() > this.value[2].max_zoom) return;
				if (this.value[2].min_zoom && map.getZoom() < this.value[2].min_zoom) return;
			}
			
			//3. Draw this.geometry, this.label_geometries, this.selected_geometry onto map
			try {
				if (this.value[0]) {
					this.geometry = maptalks.Geometry.fromJSON(this.value[0]);
					if (this.geometry) this.geometry.setSymbol({
						...naissance.Renderer.getDefaultSymbol({ exclude: ["point"] }),
						...this.value?.[1],
					});
					main.layers.entity_layer.addGeometry(this.geometry);
					this._drawLabels();
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
			if (this.geometry)
				this.geometry.addEventListener("click", (e) => {
					if (!["fill_tool", "node", "node_override", "node_transfer"].includes(main.brush.mode))
						this.open("instance", { name: this.name, ...this.window_options });
				});
		}
	}
	
	drawUI () {
		//Return statement
		return {
			edit_symbol_ui: veInterface({
				edit_label: new UI_LabelSymbol(main.settings.default_label_symbol, {
					name: "Label",
					special_function: (v) => UI_EditSelectedGeometries._makeSetSymbol({ ...v, _id: this.id })
				}),
				edit_polygon: new UI_PolygonSymbol(main.settings.default_polygon_symbol, {
					name: "Polygon",
					special_function: (v) => UI_EditSelectedGeometries._makeSetSymbol({ ...v, _id: this.id })
				}),
				edit_stroke: new UI_LineSymbol(main.settings.default_line_symbol, {
					name: "Stroke",
					special_function: (v) => UI_EditSelectedGeometries._makeSetSymbol({ ...v, _id: this.id })
				})
			}, { name: "Edit Symbol" })
		};
	}
};