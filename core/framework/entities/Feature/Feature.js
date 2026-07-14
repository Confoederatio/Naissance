if (!global.naissance) global.naissance = {};
naissance.Feature = class extends naissance.Entity {
	static instances = {};
	
	constructor (arg0_options) {
		//Convert from parameters
		let options = (arg0_options) ? arg0_options : {};
		
		//Declare local instance variables
		super();
		this.id = Class.generateRandomID(naissance.Feature);
		this.is_naissance_feature = true;
		this._is_visible = true;
		this.metadata = (options.metadata) ? options.metadata : {};
		this.ui = {};
		
		//Initialise this.options
		if (!this.options) this.options = {};
			this.options.instance = this;
			
		//Declare local instance variables
		this._name = "New Feature";
		this._parent = undefined;
		
		//Push to naissance.Feature.instances
		naissance.Feature.instances[this.id] = this;
		setTimeout(() => {
			if (main.brush.selected_feature?.entities && !this.cannot_nest_self) //Sanity check to make sure .cannot_nest_self is invalid for nesting
				this.moveToFeature(main.brush.selected_feature);
		});
	}
	
	get name () {
		//Return statement
		return this._name;
	}
	
	set name (arg0_value) {
		//Convert from parameters
		let value = (arg0_value) ? arg0_value : "";
		
		//Send DALS.Timeline.parseAction() command
		DALS.Timeline.parseAction("rename_feature", [{ feature_obj: this.id, set_name: value }], this.fire_action_silently);
	}
	
	get parent () {
		//Return statement
		return this._parent;
	}
	
	set parent (arg0_v) {
		//Convert from parameters
		let value = arg0_v;
		
		//Make sure parent cannot be self
		if (value && value.id !== this.id)
			this._parent = value;
		if (value === undefined)
			this._parent = undefined;
	}
	
	addEntity (arg0_entity, arg1_do_not_refresh) {
		//Convert from parameters
		let entity = arg0_entity;
		let do_not_refresh = arg1_do_not_refresh;
		
		//Declare local instance variables
		entity.moveToFeature(this);
		if (!do_not_refresh) this.drawHierarchyDatatype();
	}
	
	drawActionsPalette (arg0_options) { //[WIP] - Method should now be deprecated
		//Convert from parameters
		let options = (arg0_options) ? arg0_options : {};
		
		//Initialise options
		if (!options.name) options.name = "Feature";
		if (!options.move_to_filters) options.move_to_filters = ["FeatureGroup", "FeatureLayer"];
		if (!options.type) options.type = "feature";
		
		//Return statement
		return naissance.Action.drawActionsPalette(this);
	}
	
	/**
	 * Returns an array of all {@link naissance.Geometry}|{@link naissance.Feature} instances housed in the Feature.
	 * - Method of: {@link naissance.Feature}
	 *
	 * @param {naissance.Feature} [arg0_object]
	 * @param {Object} [arg1_options]
	 *  @param {naissance.Feature[]} [arg1_options.owners]
	 *  @param {boolean} [arg1_options.refresh_metadata=false]
	 *  @param {string[]} [arg1_options.types=["Feature", "Geometry"]] - The types to filter for.
	 *
	 * @returns {naissance.Geometry[]}
	 */
	getAllEntities (arg0_object, arg1_options) {
		//Convert from parameters
		let object = (arg0_object) ? arg0_object : this;
		let options = (arg1_options) ? arg1_options : {};
		
		//Initialise options
		if (!options.owners) options.owners = [];
		if (!options.types) options.types = ["Feature", "Geometry"];
		
		//Declare local instance variables
		let all_entities = [];
		let owner_names = [];
		
		//Iterate over options.owners and fetch their .name
		for (let i = 0; i < options.owners.length; i++) {
			let local_name = options.owners[i]?.name;
			
			if (local_name) owner_names.push(local_name);
		}
		
		//Iterate over all .entities and check if they have .entities
		if (object?.entities)
			for (let i = 0; i < object.entities.length; i++) {
				let local_entity = object.entities[i];
				
				//Iterate over all options.types and determine if it is valid
				for (let x = 0; x < options.types.length; x++)
					if (local_entity instanceof naissance[options.types[x]]) {
						all_entities.push(local_entity);
						break;
					}
				
				if (local_entity) {
					//Edit metadata
					if (options.refresh_metadata) {
						if (!local_entity.metadata) local_entity.metadata = {};
						if (!local_entity.metadata.tags) local_entity.metadata.tags = [];
						
						//Iterate over all owner_names and ensure they inherit the proper tags if they don't exist, i.e. convert groups to tags
						for (let x = 0; x < owner_names.length; x++)
							if (!local_entity.metadata.tags.includes(owner_names[x]))
								local_entity.metadata.tags.push(owner_names[x]);
					}
					
					//Recurse if the entity has its own entities
					if (local_entity.entities)
						all_entities = all_entities.concat(this.getAllEntities(local_entity, {
							...options,
							owners: options.owners.concat([local_entity])
						}));
				}
			}
		
		//Return statement
		return all_entities;
	}
	
	/**
	 * Returns an array of all {@link naissance.Feature} instances housed in the Feature.
	 * 
	 * @param {naissance.Feature} arg0_object
	 * @param {Object} arg1_options
	 * 
	 * @returns {naissance.Geometry[]}
	 */
	getAllFeatures (arg0_object, arg1_options) {
		//Convert from parameters
		let object = arg0_object;
		let options = (arg1_options) ? arg1_options : {};
		
		//Return statement
		return this.getAllEntities(object, {
			...options,
			types: ["Feature"]
		});
	}
	
	/**
	 * Returns an array of all {@link naissance.Geometry} instances housed in the Feature.
	 *
	 * @param {naissance.Feature} [arg0_object]
	 * @param {Object} [arg1_options]
	 *  @param {naissance.Feature[]} [arg1_options.owners]
	 *
	 * @returns {naissance.Geometry[]}
	 */
	getAllGeometries (arg0_object, arg1_options) {
		//Convert from parameters
		let object = arg0_object;
		let options = (arg1_options) ? arg1_options : {};
		
		//Return statement
		return this.getAllEntities(object, {
			...options,
			types: ["Geometry"]
		});
	}
	
	getTimestamps () {
		//Declare local instance variables
		let all_geometries = this.getAllGeometries();
		let all_timestamps = [];
		
		//Iterate over all_geometries and their .history.keyframes
		for (let i = 0; i < all_geometries.length; i++) {
			all_timestamps = [...new Set([
				...all_timestamps, 
				...Object.keys(all_geometries[i].history.keyframes).map(Number)
			])];
		}
		
		//Return statement
		return all_timestamps.sort((a, b) => a - b);
	}
	
	getTurfGeometry () {
		//Declare local instance variables
		let all_geometries = this.getAllGeometries();
		let turf_geometry;
		
		//Iterate over all_geometries to fetch turf_geometry
		for (let i = 0; i < all_geometries.length; i++)
			if (all_geometries[i] instanceof naissance.GeometryPolygon)
				if (all_geometries[i].geometry) {
					let local_geometry = all_geometries[i].geometry;
					let local_turf_geometry = Geospatiale.convertMaptalksToTurf(local_geometry);
					
					if (!turf_geometry) {
						turf_geometry = local_turf_geometry;
					} else {
						turf_geometry = turf.union(turf.featureCollection([turf_geometry, local_turf_geometry]));
					}
				}
		
		//Return statement
		return turf_geometry;
	}
	
	hide () {
		//Declare local instance variables
		this._is_visible = false;
		
		//Iterate over all entities; attempt to hide all entities
		if (this.entities)
			for (let i = 0; i < this.entities.length; i++)
				if (this.entities[i].hide)
					this.entities[i].hide();
	}
	
	open (arg0_type, arg1_options) {
		//Convert from parameters
		let type = arg0_type;
		let options = (arg1_options) ? arg1_options : {};
		
		//Declare local instance variables
		let class_obj = naissance[this.class_name];
		
		//Initialise this.quick_actions; this._interface
		if (!this.quick_actions) {
			let actions_palette_obj = (!class_obj?.options?.disable_actions_palette) ? {
				open_button: veButton(() => {
					naissance.Action.openActionsPalette(this);
				}, {
					name: "<icon>more_vert</icon>",
					tooltip: "Open Actions Palette"
				})
			} : {};
			
			this.quick_actions = veRawInterface({
				hide_visibility: veButton(() => {
					DALS.Timeline.parseAction("hide_feature", [{ feature_obj: this.id, set_visibility: false }]);
				}, {
					attributes: { class: "order-99 onhover-visible" },
					name: `<icon>visibility</icon>`,
					limit: () => this._is_visible,
					tooltip: "Hide Feature"
				}),
				show_visibility: veButton(() => {
					DALS.Timeline.parseAction("show_feature", [{ feature_obj: this.id, set_visibility: true }]);
				}, {
					attributes: { class: "order-99 onhover-visible" },
					name: "<icon>visibility_off</icon>",
					limit: () =>  !this._is_visible,
					tooltip: "Show Feature"
				}),
				delete_button: veButton(() => {
					veConfirm(`Are you sure you want to delete ${this.name}?`, {
						special_function: () => {
							//Declare local instance variables
							let old_name = this.name;
							
							super.close("instance");
							DALS.Timeline.parseAction("delete_feature", [{ feature_obj: this.id, delete_feature: true }]);
							veToast(`Deleted ${old_name}.`);
						}
					});
				}, {
					attributes: { class: "order-100 onhover-visible" },
					name: "<icon>delete</icon>",
					tooltip: "Delete",
				}),
				...actions_palette_obj
			}, {
				name: "<b>Quick Actions:</b>",
				style: {
					alignItems: "center",
					display: "flex",
					"[component='ve-button']": { marginLeft: "var(--padding)" },
				},
				width: 99
			});
		}
		if (!this._interface) this._interface = veInterface({
			quick_actions: this.quick_actions,
			
			...((typeof this.drawUI === "function") ? this.drawUI() : {}),
			...ve.Class.getVercengenComponents(this)
		}, { is_folder: false });
		
		//Call super.open for naissance.Entity
		super.open(type, options);
	}
	
	remove () {
		//Declare local instance variables
		let delete_keys = ["_entities", "entities"]
		
		//Remove from naissance.Feature.instances
		delete naissance.Feature.instances[this.id];
		
		Object.iterate(naissance.Feature.instances, (local_key, local_feature) => {
			for (let i = 0; i < delete_keys.length; i++)
				if (local_feature[delete_keys[i]])
					for (let x = local_feature[delete_keys[i]].length - 1; x >= 0; x--)
						if (local_feature[delete_keys[i]][x].id === this.id)
							local_feature[delete_keys[i]].splice(x, 1);
		});
		
		//Remove from local_feature.entities
		if (this.hide) this.hide();
		if (this.entities)
			for (let i = 0; i < this.entities.length; i++)
				if (this.entities[i].id === this.id)
					this.entities[i].remove();
		
		//Rerender deleted feature and remove it from the map
		if (this.draw) this.draw();
		UI_Leftbar.refresh();
	}
	
	setID (arg0_id) {
		//Convert from parameters
		let id = arg0_id;
		
		//Declare local instance variables; shuffle ID
		let old_id = JSON.parse(JSON.stringify(this.id));
		this.id = id;
		naissance.Feature.instances[id] = this;
		delete naissance.Feature.instances[old_id];
	}
	
	show () {
		this._is_visible = true;``
		
		//Iterate over all entities; attempt to show all entities
		if (this.entities)
			for (let i = 0; i < this.entities.length; i++)
				if (this.entities[i].show)
					this.entities[i].show();
	}
};