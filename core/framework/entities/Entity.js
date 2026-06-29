if (!global.naissance) global,naissance = {};
naissance.Entity = class extends ve.Class {
	constructor (arg0_options) {
		//Convert from parameters
		let options = (arg0_options) ? arg0_options : {};
			super();
		
		//Declare local instance variables
		this.instance = this;
	}
	
	drawHierarchyDatatype (arg0_options) {
		//Convert from parameters
		let options = (arg0_options) ? arg0_options : {};
		
		//Declare local instance variables
		let all_geometries;
		let attributes_obj = {};
		let hierarchy_obj = {};
		let icon_style = "";
		let symbol_obj = (naissance[this.class_name].hierarchy_symbol || {});
		let show_features = true;
		let show_geometries = true;
			if (this.class_name === "FeatureLayer") {
				if (!this.metadata.show_layer_features) show_features = false;
				if (!this.metadata.show_layer_geometries) show_geometries = false;
			}
		
		let symbol_name = (symbol_obj.name) ? symbol_obj.name : this.class_name;
		
		//Remove previous hierarchy_datatype; handle attributes
		if (this.hierarchy_datatype?.remove) this.hierarchy_datatype.remove();
		if (options.is_search) attributes_obj["data-is-search"] = "true";
		
		//Geometry: Keyframe handling
		if (this.class_name.startsWith("Geometry")) {
			let current_keyframe = this.history.getKeyframe({
				guaranteed_indexes: [1]
			});
				this._current_keyframe = current_keyframe;
			let current_symbol = current_keyframe.value[1];
			let is_visible = false;
			
			try {
				if (current_keyframe.value[0] !== undefined && Object.keys(current_keyframe.value[0]).length)
					is_visible = true;
			} catch (e) {}
			
			//Set attributes
			attributes_obj["data-is-selected"] = this.selected;
			attributes_obj["data-is-visible"] = String(is_visible);
			attributes_obj["data-selected-geometry"] = (main.brush.selected_geometry?.id === this.id);
			
			//Set symbol
			if (symbol_obj.colour === "fill") {
				if (current_symbol?.polygonFill) 
					icon_style += `color:${current_symbol.polygonFill};`;
			} else if (symbol_obj.colour === "stroke") {
				if (current_symbol?.lineColor)
					icon_style += `color:${current_symbol.lineColor};`;
			}
		}
		
		//Feature: this.entities handling
		if (this.entities) {
			all_geometries = this.getAllGeometries();
			
			//Set Feature attributes
			attributes_obj["data-entities"] = this.entities.length;
			
			//Delete any self-references; already assigned entities with other .parent
			for (let i = this.entities.length - 1; i >= 0; i--)
				if (this.entities[i].class_name === "FeatureGroup" && this.entities[i].id === this.id) {
					console.warn(`Deleting self-reference`, this.entities[i], `from`, this);
					this.entities.splice(i, 1);
				} else if (this.entities[i].parent && this.entities[i].parent.id !== this.id) {
					this.entities.splice(i, 1);
				}
			
			//Iterate over this.entities and call .draw() recursively where valid
			if (!this.is_collapsed)
				for (let i = 0; i < this.entities.length; i++) {
					let local_entity = this.entities[i];
					let local_key = `${local_entity.class_name}-${local_entity.id}`;
					
					//naissance.FeatureGroup, naissance.FeatureLayer handling
					if (local_entity instanceof naissance.Feature && local_entity.drawHierarchyDatatype) {
						if (show_features)
							hierarchy_obj[local_key] = local_entity.drawHierarchyDatatype(options);
					} else {
						//naissance.Feature generic handling
						if (show_features)
							if (local_entity instanceof naissance.Feature) {
								hierarchy_obj[local_key] = new ve.HierarchyDatatype({
									icon: new ve.HTML(`<icon>inventory_2</icon>`, {
										tooltip: local_entity.class_name } )
								}, { instance: local_entity });
							}
						//naissance.Geometry generic handling
						if (show_geometries)
							if (local_entity instanceof naissance.Geometry) {
								if (local_entity.drawHierarchyDatatype) {
									hierarchy_obj[local_key] = local_entity.drawHierarchyDatatype();
								} else { //[WIP] - Implement naissance.Geometry.name accessor
									hierarchy_obj[local_key] = new ve.HierarchyDatatype({
										icon: new ve.HTML(`<icon>shapes</icon>`, {
											tooltip: local_entity.class_name } )
									}, {
										instance: local_entity,
										name: local_entity.name,
										name_options: {
											onprogramchange: () => {
												this.drawHierarchyDatatype();
											},
											onuserchange: (v) => {
												local_entity.name = v;
											}
										}
									});
								}
							}
					}
				}
		}
		
		//Return statement
		this.hierarchy_datatype = new ve.HierarchyDatatype({
			icon: new ve.HTML(`${(symbol_obj.icon) ? `<icon style="${icon_style}">${symbol_obj.icon}</icon>` : ""}`, {
				tooltip: `${symbol_name}${(all_geometries) ? ` (${String.formatNumber(all_geometries.length)} Items)` : ""}`,
			}),
			
			edit: veButton(() => {
				this.open("instance", {
					id: this.id,
					name: this.name,
					width: "24rem"
				});
				this.draw();
			}, {
				attributes: { class: "order-99" },
				name: "<icon>more_vert</icon>",
				tooltip: `Edit ${symbol_name}`,
			}),
			
			...hierarchy_obj
		}, {
			attributes: {
				...attributes_obj,
				"data-type": this.class_name
			},
			instance: this,
			ignore_component: true,
			is_collapsed: this.is_collapsed,
			name: this.name,
			name_options: {
				onchange: (v) => {
					this.name = v;
					setTimeout(() => this.drawHierarchyDatatype()); //Prevents a race condition
				}
			},
			oncollapse: (v, e) => {
				this.is_collapsed = v;
				if (v === false)
					UI_Leftbar.refresh();
			},
			type: (!this.entities) ? "item" : "group"
		});
		delete this._current_keyframe;
		return this.hierarchy_datatype;
	}
};