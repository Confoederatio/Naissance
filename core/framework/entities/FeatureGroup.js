if (!global.naissance) global.naissance = {};
/**
 * @type {naissance.FeatureGroup}
 */
naissance.FeatureGroup = class extends naissance.Feature {
	constructor (arg0_entities, arg1_options) {
		//Convert from parameters
		super();
		//this.cannot_nest_self = true;
		this.class_name = "FeatureGroup";
		this.entities = (arg0_entities) ? arg0_entities : [];
		this.options = (arg1_options) ? arg1_options : {};
		
		//Declare local instance variables
		this._name = "New Group";
		
		//Declare UI; attached to UI_LeftbarHierarchy
		this.interface = veInterface({
			actions: this.drawActionsPalette({
				name: "Group",
				type: "group",
				
				move_to_filters: ["FeatureGroup"] 
			})
		}, { is_folder: false });
		this.drawHierarchyDatatype();
	}
	
	addEntity (arg0_naissance_obj, arg1_do_not_refresh) {
		//Convert from parameters
		let naissance_obj = arg0_naissance_obj;
		let do_not_refresh = arg1_do_not_refresh;
		
		//Declare local instance variables
		let has_entity = this.hasEntity(naissance_obj);
		
		if (!has_entity) {
			naissance_obj.parent = this;
			this.entities.push(naissance_obj);
			if (!do_not_refresh) this.drawHierarchyDatatype();
		}
	}
	
	drawHierarchyDatatype (arg0_options) {
		//Convert from parameters
		let options = (arg0_options) ? arg0_options : {};
		
		//Declare local instance variables
		let all_geometries = this.getAllGeometries();
		let hierarchy_obj = {};
		
		//Delete any self-references; already assigned entities with other .parent
		for (let i = this.entities.length - 1; i >= 0; i--)
			if (this.entities[i].class_name === "FeatureGroup" && this.entities[i].id === this.id) {
				console.warn(`Deleting self-reference`, this.entities[i], `from`, this);
				this.entities.splice(i, 1);
			} else if (this.entities[i].parent && this.entities[i].parent.id !== this.id) {
				this.entities.splice(i, 1);
			}
		
		//Iterate over this.entities, if naissance.FeatureGroup/naissance.FeatureLayer, call .draw() recursively
		if (!this.is_collapsed)
			for (let i = 0; i < this.entities.length; i++) {
				let local_entity = this.entities[i];
				let local_key = `${local_entity.class_name}-${local_entity.id}`;
				
				//naissance.FeatureGroup, naissance.FeatureLayer handling
				if (local_entity instanceof naissance.Feature && local_entity.drawHierarchyDatatype) {
					hierarchy_obj[local_key] = local_entity.drawHierarchyDatatype(options);
				} else {
					//naissance.Feature generic handling
					if (options.hide_features) continue; //Internal guard clause if features are meant to be hidden
					if (local_entity instanceof naissance.Feature) {
						hierarchy_obj[local_key] = new ve.HierarchyDatatype({
							icon: new ve.HTML(`<icon>inventory_2</icon>`, {
								tooltip: local_entity.class_name } )
						}, { instance: local_entity });
					}
					//naissance.Geometry generic handling
					if (options.hide_geometries) continue; //Internal guard clause if geometries are meant to be hidden
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
		
		//Return statement
		return new ve.HierarchyDatatype({
			icon: new ve.HTML(`<icon>folder</icon>`),
			...super.drawHierarchyDatatypeGenerics(),
			
			polity_number: veHTML(`(${String.formatNumber(all_geometries.length)})`),
			edit: veButton(() => {
				super.open("instance", {
					id: this.id,
					name: this._name,
					width: "24rem"
				});
				this.draw();
			}, {
				name: `<icon>more_vert</icon>`,
				tooltip: "Edit Group",
				attributes: { class: "order-100" },
			}),
			
			...hierarchy_obj
		}, {
			attributes: {
				"data-entities": this.entities.length,
				"data-type": "FeatureGroup"
			},
			instance: this,
			is_collapsed: this.is_collapsed,
			name: this.name,
			name_options: {
				onchange: (v) => {
					this.name = v;
					this.drawHierarchyDatatype();
				}
			},
			oncollapse: (v, e) => {
				this.is_collapsed = v;
				if (v === false)
					UI_LeftbarHierarchy.refresh();
			},
			type: "group",
		});
	}
	
	fromJSON (arg0_json) {
		//Convert from parameters
		let json = (typeof arg0_json !== "object") ? JSON.parse(arg0_json) : arg0_json;
		
		//Declare local instance variables
		this.id = json.id;
		this.is_collapsed = json.is_collapsed;
		this._name = (json.name) ? json.name : "New Group";
		this.options = json.options;
		
		//Iterate over json.entities IN SAVED ORDER to restore them
		for (let x = 0; x < json.entities.length; x++) {
			let entity_def = json.entities[x];
			
			//Check naissance.Feature.instances
			for (let i = 0; i < naissance.Feature.instances.length; i++) {
				let local_feature = naissance.Feature.instances[i];
				
				if (
					entity_def.class_name === local_feature.class_name &&
					entity_def.id === local_feature.id
				) {
					this.addEntity(local_feature, true);
					break;
				}
			}
			
			//Check naissance.Geometry.instances
			for (let i = 0; i < naissance.Geometry.instances.length; i++) {
				let local_geometry = naissance.Geometry.instances[i];
				
				if (
					entity_def.class_name === local_geometry.class_name &&
					entity_def.id === local_geometry.id
				) {
					this.addEntity(local_geometry, true);
					break;
				}
			}
		}
		
		//Draw HierarchyDatatype if possible
		this.drawHierarchyDatatype();
	}
	
	hasEntity (arg0_naissance_obj) {
		//Convert from parameters
		let naissance_obj = arg0_naissance_obj;
		
		//Iterate over this.entities and flag anything with the same .id
		for (let i = 0; i < this.entities.length; i++)
			if (
				this.entities[i].class_name === naissance_obj.class_name &&
				this.entities[i].id === naissance_obj.id
			)
				//Return statement
				return true;
	}
	
	removeEntity (arg0_naissance_obj) {
		//Convert from parameters
		let naissance_obj = arg0_naissance_obj;
		
		//Iterate over all entities and then redraw the current hierarchy datatype
		for (let i = 0; i < this.entities.length; i++)
			if (
				this.entities[i].class_name === naissance_obj.class_name &&
				this.entities[i].id === naissance_obj.id
			) {
				this.entities.splice(i, 1);
				break;
			}
		this.drawHierarchyDatatype();
	}
	
	toJSON () {
		//Declare local instance variables
		let entity_ids = [];
		
		//Iterate over all this.entities
		for (let i = 0; i < this.entities.length; i++)
			entity_ids.push({
				class_name: this.entities[i].class_name,
				id: this.entities[i].id
			});
		
		//Return statement
		return JSON.stringify({
			id: this.id,
			name: this._name,
			
			entities: entity_ids,
			is_collapsed: this.is_collapsed,
			metadata: this.metadata,
			options: this.options
		});
	}
};