if (!global.naissance) global.naissance = {};

naissance.GeometryPoint = class extends naissance.Geometry {
	constructor () {
		super();
		this.class_name = "GeometryPoint";
		this.node_editor_mode = "Point";
		
		//Declare UI
		this.interface = veInterface({
			information: veHTML(() => {
				//Declare local instance variables
				let coordinates = (this.geometry && this.isOpen("instance")) ? 
					this.geometry.getCoordinates().toJSON() : { x: 0, y: 0 }
				
				return `ID: ${this.id} | X: ${String.formatNumber(coordinates.x, 4)}, Y: ${String.formatNumber(coordinates.y, 4)}`;
			}, { width: 99, x: 0, y: 0 })
		}, { is_folder: false });
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
		if (this.value && this.value[0] === null) 
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
					this.geometry = maptalks.Geometry.fromJSON(this.value[0]);
					this.geometry.setSymbol({
						markerDx: brush_symbol._markerDx,
						markerDy: brush_symbol._markerDy,
						markerFile: brush_symbol._markerFile,
						markerHeight: brush_symbol._markerHeight,
						markerOpacity: brush_symbol._markerOpacity,
						markerWidth: brush_symbol._markerWidth,
					});
					if (this.value[1] && this.geometry) 
						this.geometry.setSymbol({
							...this.geometry.getSymbol(),
							...this.value[1]
						});
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
							this.label_geometries[0] = new maptalks.Marker(this.geometry.getCoordinates());
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
				super.open("instance", { name: this.name, ...this.window_options });
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
			icon: veHTML(`<icon>location_on</icon>`, { tooltip: "GeometryPoint" }),
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
	
	/**
	 * Parses a JSON action for a target GeometryPoint.
	 * - Static method of: {@link naissance.GeometryPoint}
	 * 
	 * `arg0_json`: {@link Object|string}
	 * - `.geometry_id`: {@link string} - Identifier. The {@link naissance.Geometry} ID to target changes
	 * for, if any.
	 * <br>
	 * - #### Extraneous Commands:
	 * - `.create_point`: {@link Object}
	 *   - `.coordinates`: {@link Array}<{@link maptalks.Coordinate}>
	 *   - `.do_not_refresh`: {@link boolean}
	 *   - `.id`: {@link string}
	 *   - `.name`: {@link string}
	 */
	static parseAction (arg0_json) {
		//Convert from parameters
		let json = (typeof arg0_json === "string") ? JSON.parse(arg0_json) : arg0_json;
		
		//Declare local instance variables
		let point_obj = naissance.Geometry.instances.filter((v) => v.id === json.geometry_id)[0];
		
		//Parse extraneous commands
		//create_point
		if (json.create_point)
			if (json.create_point.id) {
				let new_point = new naissance.GeometryPoint();
				new_point.id = json.create_point.id;
				if (json.create_point.coordinates !== undefined) {
					let maptalks_marker_obj = new maptalks.Marker();
						maptalks_marker_obj.setCoordinates(json.create_point.coordinates);
					new_point.addKeyframe(main.date, maptalks_marker_obj.toJSON());
				}
				if (json.create_point.name) {
					new_point.fire_action_silently = true;
					new_point.name = json.create_point.name;
					delete new_point.fire_action_silently;
				}
				if (main.brush.selected_feature)
					if (!json.create_point.do_not_refresh)
						UI_LeftbarHierarchy.refresh();
			}
		
		//Parse commands for point_obj
		if (point_obj && point_obj instanceof naissance.GeometryPoint) {
			
		}
	}
};