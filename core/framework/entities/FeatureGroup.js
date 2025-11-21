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
		this.interface = undefined;
		this.drawHierarchyDatatype(); //Declares this.interface
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
	
	drawHierarchyDatatype () {
		//Declare local instance variables
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
		for (let i = 0; i < this.entities.length; i++) {
			let local_entity = this.entities[i];
			let local_key = `${local_entity.class_name}-${local_entity.id}`;
			
			//naissance.FeatureGroup, naissance.FeatureLayer handling
			if (local_entity instanceof naissance.Feature && local_entity.drawHierarchyDatatype) {
				hierarchy_obj[local_key] = local_entity.drawHierarchyDatatype();
			} else {
				//naissance.Feature generic handling
				if (local_entity instanceof naissance.Feature) {
					hierarchy_obj[local_key] = new ve.HierarchyDatatype({
						icon: new ve.HTML(`<icon>inventory_2</icon>`, {
							tooltip: local_entity.class_name } )
					}, { instance: local_entity });
				}
				//naissance.Geometry generic handling
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
		
		//Set this.interface
		this.interface = new ve.HierarchyDatatype({
			icon: new ve.HTML(`<icon>folder</icon>`),
			hide_visibility: veButton(() => {
				DALS.Timeline.parseAction({
					options: { name: "Hide Group", key: "hide_group" },
					value: [{ type: "Feature", feature_id: this.id, set_visibility: false }]
				});
			}, {
				name: "<icon>visibility</icon>",
				limit: () => this._is_visible,
				tooltip: "Hide Group",
				style: {
					marginLeft: "auto", order: 99, padding: 0,
					"button": {
						marginLeft: "1rem"
					}
				}
			}),
			show_visibility: veButton(() => {
				DALS.Timeline.parseAction({
					options: { name: "Show Group", key: "show_group" },
					value: [{ type: "Feature", feature_id: this.id, set_visibility: true }]
				});
			}, {
				name: "<icon>visibility_off</icon>",
				limit: () => !this._is_visible,
				tooltip: "Show Group",
				style: {
					marginLeft: "auto", order: 99, padding: 0,
					"button": {
						marginLeft: "1rem"
					}
				}
			}),
			
			...hierarchy_obj
		}, {
			instance: this,
			is_collapsed: this.is_collapsed,
			name: this.name,
			name_options: {
				onchange: (v) => {
					this.name = v;
					this.drawHierarchyDatatype();
				}
			},
			style: {
				".nst-content": {
					paddingRight: 0
				},
				"[component='ve-button'] > button": {
					border: 0
				}
			},
			type: "group",
		});
		
		//Return statement
		return this.interface;
	}
	
	fromJSON (arg0_json) {
		//Convert from parameters
		let json = (typeof arg0_json !== "object") ? JSON.parse(arg0_json) : arg0_json;
		
		//Declare local instance variables
		this.id = json.id;
		this.is_collapsed = json.is_collapsed;
		this.options = json.options;
		
		//Iterate over json.entities and restore them
		for (let i = 0; i < naissance.Feature.instances.length; i++) {
			let local_feature = naissance.Feature.instances[i];
			
			for (let x = 0; x < json.entities.length; x++)
				if (
					json.entities[x].class_name === local_feature.class_name &&
					json.entities[x].id === local_feature.id
				)
					this.addEntity(local_feature, true);
		}
		for (let i = 0; i < naissance.Geometry.instances.length; i++) {
			let local_geometry = naissance.Geometry.instances[i];
			
			for (let x = 0; x < json.entities.length; x++)
				if (
					json.entities[x].class_name === local_geometry.class_name &&
					json.entities[x].id === local_geometry.id
				)
					this.addEntity(local_geometry, true);
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
			is_collapsed: this.is_collapsed,
			entities: entity_ids,
			options: this.options
		});
	}
	
	/**
	 * Parses a JSON action for a target FeatureGroup.
	 * - Static method of: {@link naissance.FeatureGroup}
	 * 
	 * `arg0_json`: {@link Object|string}
	 * - `.feature_id`: {@link string} - Identifier. The {@link naissance.Feature} ID to target changes for.
	 * <br>
	 * - #### Extraneous Commands:
	 * - `.create_group`: {@link Object}
	 *   - `.do_not_refresh=false`: {@link boolean}
	 *   - `.id`: {@link string}
	 * 
	 */
	static parseAction (arg0_json) {
		//Convert from parameters
		let json = (typeof arg0_json === "string") ? JSON.parse(arg0_json) : arg0_json;
		
		//Parse extraneous commands
		//create_group
		if (json.create_group)
			if (json.create_group.id) {
				let new_group = new naissance.FeatureGroup();
				new_group.id = json.create_group.id;
				
				if (!json.create_group.do_not_refresh)
					UI_LeftbarHierarchy.refresh();
			}
	}
};