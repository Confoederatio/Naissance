if (!global.naissance) global.naissance = {};

naissance.GeometryPoint = class extends naissance.Geometry {
	static hierarchy_symbol = {
		icon: "location_on",
		name: "Point"
	};
	
	constructor () {
		super();
		this.class_name = "GeometryPoint";
		this.node_editor_mode = "Point";
		
		//Add keyframe with default brush symbol upon instantiation
		let brush_symbol = main.brush.getBrushSymbol();
		if (brush_symbol)
			this.addKeyframe(main.date, undefined, brush_symbol);
		
		//KEEP AT BOTTOM!
		this.updateOwner();
	}
	
	_drawLabels () {
		//Declare local instance variables
		let default_label_symbol = naissance.Renderer.getDefaultLabelSymbol();
		
		if (this.value[2]) {
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
					let all_coordinates = this.geometry.getCoordinates();
					
					for (let i = 0; i < all_coordinates.length; i++)
						this.label_geometries[i] = new maptalks.Marker(all_coordinates[i]);
				} else {
					for (let i = 0; i < label_geometries.length; i++)
						this.label_geometries[i] = maptalks.Geometry.fromJSON(label_geometries[i]);
				}
				
				//Iterate over all this.label_geometries, apply settings
				for (let i = 0; i < this.label_geometries.length; i++) {
					//2. .label_name/.name
					if (label_geometries.length === 0) {
						this.label_geometries[i].setSymbol({
							textDy: (this.geometry.getSymbol().markerHeight + 8)*-1,
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
	}
	
	draw () {
		//Declare local instance variables
		let default_symbol = naissance.Renderer.getDefaultSymbol();
		let derender_geometry = false;
		
		if (this.geometry) this.geometry.remove(); //Remove geometry to preserve flash behaviour
		
		//1. Set this.value from current relative keyframe
		this.value = this.history.getKeyframe({
			date: main.date,
			guaranteed_indexes: [1]
		}).value;
		this.value[1] = this.getSymbol(this.value[1]);
		
		if (this.value === undefined || this.value.length === 0 || this._is_visible === false)
			derender_geometry = true;
		
		//2. Check any cause for derendering
		if (this.value && !this.value[0]) 
			derender_geometry = true; //Coords are null, derender geometry
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
					if (this.selected_index === undefined) this.selected_index = 0;
					
					this.geometry = maptalks.Geometry.fromJSON(this.value[0]);
					let symbol_obj = default_symbol;
					
					if (this.value[1] && this.geometry) 
						symbol_obj = {
							...symbol_obj,
							...this.geometry.getSymbol(),
							...this.value[1]
						}
					this.geometry.setSymbol(symbol_obj);
					main.layers.entity_layer.addGeometry(this.geometry);
					
					this._drawLabels();
					
					//3.1. Draw selection
					if (this.selected || this._is_being_moved)
						if (this.selected_index !== undefined) {
							let coordinates = maptalks.Coordinate.toNumberArrays(this.geometry.getCoordinates());
							let selected_coords = coordinates[this.selected_index];
							
							if (selected_coords) {
								this.selected_geometry = new maptalks.Marker(coordinates[this.selected_index]);
								this.selected_geometry.setSymbol({
									...symbol_obj,
									markerFile: "./gfx/icons/marker_default_selected.png",
									markerOpacity: 0.5
								});
								main.layers.selection_layer.addGeometry(this.selected_geometry);
							}
						}
				}
			} catch (e) { console.error(e); }
		}
		
		//4. Add bindings
		if (this.geometry) {
			this.history.draw(this.keyframes_ui);
			
			this.geometry.addEventListener("click", (e) => {
				this.selected_index = e.pickGeometryIndex;
				this.open("instance", { name: this.name, ...this.window_options });
				this.draw(); //Refreshes select geometry
			});
		}
		
		//5. Derender geometry handler
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
			actions_bar: veRawInterface({
				add_marker: veButton((v, local_component) => {
					if (!this._is_adding_marker) {
						veToast(`Click a new location on the map to add a new marker.`);
						
						this._is_adding_marker = true;
						this.draw();
						local_component.name = "Cancel Adding Marker";
						
						map.once("click", (e) => {
							DALS.Timeline.parseAction("add_point_position", [{
								type: "GeometryPoint",
								geometry_obj: this.id,
								add_coordinates: e.coordinate.toJSON()
							}]);
							
							delete this._is_adding_marker;
							this.draw();
							local_component.name = `Add Marker`;
						});
					} else {
						veToast(`Cancelled adding new marker.`);
						
						delete this._is_adding_marker;
						this.draw();
						local_component.name = `Add Marker`;
					}
				}, { name: "Add Marker" }),
				delete_marker: veButton(() => {
					DALS.Timeline.parseAction("delete_point", [{
						type: "GeometryPoint",
						geometry_obj: this.id,
						delete_coordinates: Math.returnSafeNumber(this.selected_index)
					}]);
					
					veToast(`Deleted selected marker in collection.`);
					this.close("instance");
				}, { name: "Delete Marker" }),
				move_marker: veButton((v, local_component) => {
					if (!this._is_being_moved) {
						veToast(`Click a new location on the map to move this marker to.`);
						
						this._is_being_moved = true;
						this.draw();
						local_component.name = `Cancel Moving Marker`;
						
						map.once("click", (e) => {
							DALS.Timeline.parseAction("move_point_position", [{
								type: "GeometryPoint",
								geometry_obj: this.id,
								move_coordinates: {
									index: Math.returnSafeNumber(this.selected_index),
									coordinates: e.coordinate.toJSON()
								}
							}]);
							
							delete this._is_being_moved;
							this.draw();
							local_component.name = `Move Marker`;
						});
					} else {
						veToast(`Cancelled marker movement.`);
						
						delete this._is_being_moved;
						this.draw();
						local_component.name = `Move Marker`;
					}
				}, { name: "Move Marker" }),
			}, {
				style: {
					"[component='ve-button']": { marginLeft: "var(--padding)" }
				}
			}),
			edit_symbol_ui: veInterface({
				edit_label: new UI_LabelSymbol(main.settings.default_label_symbol, {
					name: "Label",
					special_function: (v) => UI_EditSelectedGeometries._makeSetSymbol({ ...v, _id: this.id })
				}),
				edit_point: new UI_PointSymbol(main.settings.default_point_symbol, {
					name: "Point",
					special_function: (v) => UI_EditSelectedGeometries._makeSetSymbol({ ...v, _id: this.id })
				})
			}, { name: "Edit Symbol" })
		};
	}
};