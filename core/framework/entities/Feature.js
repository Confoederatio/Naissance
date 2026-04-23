if (!global.naissance) global.naissance = {};
naissance.Feature = class extends ve.Class {
	static instances = [];
	
	constructor (arg0_options) {
		//Convert from parameters
		let options = (arg0_options) ? arg0_options : {};
		
		//Declare local instance variables
		super();
		this.id = Class.generateRandomID(naissance.Feature);
		this.instance = this;
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
		naissance.Feature.instances.push(this);
		setTimeout(() => {
			if (main.brush.selected_feature?.entities && !this.cannot_nest_self) { //Sanity check to make sure .cannot_nest_self is invalid for nesting
				this.parent = main.brush.selected_feature;
				main.brush.selected_feature.entities.push(this);
			}
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
		DALS.Timeline.parseAction({
			options: { name: "Rename Feature", key: "rename_Feature" },
			value: [{ type: "Feature", feature_id: this.id, set_name: value }]
		}, this.fire_action_silently);
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
	
	drawActionsPalette (arg0_options) {
		//Convert from parameters
		let options = (arg0_options) ? arg0_options : {};
		
		//Initialise options
		if (!options.name) options.name = "Feature";
		if (!options.move_to_filters) options.move_to_filters = ["FeatureGroup", "FeatureLayer"];
		if (!options.type) options.type = "feature";
		
		//Return statement
		return veInterface({
			actions_palette: veSearchSelect({
				clean_geometry_tags: veButton(() => {
					veConfirm(`Are you sure you want to clean all geometry tags in ${this.name}?`, {
						special_function: () => {
							DALS.Timeline.parseAction({
								options: { name: "Clean Geometry Tags", key: `clean_${options.type}_geometry_tags` },
								value: [{
									type: "Feature",
									feature_id: this.id,
									clean_geometry_tags: true
								}]
							});
							veToast(`Cleaned geometry tags.`);
						}
					});
				}, { name: "Clean Geometry Tags" }),
				
				clean_keyframes: veButton(() => {
					if (this.clean_keyframes_window) this.clean_keyframes_window.close();
					this.clean_keyframes_window = veWindow({
						clean_symbols: veToggle(this.ui.clean_symbols, {
							name: "Clean Symbols",
							onuserchange: (v) => this.ui.clean_symbols = v
						}),
						clean_keyframes: veButton(() => {
							//Declare local instance variables
							let all_flags = [];
							if (this.ui.clean_symbols) all_flags.push("symbol");
							
							DALS.Timeline.parseAction({
								options: { name: "Clean Keyframes", key: `clean_${options.type}_keyframes` },
								value: [{
									type: "Feature",
									feature_id: this.id,
									clean_keyframes: all_flags
								}]
							});
							veToast(`Cleaned ${options.name} keyframes.`);
						}, { name: "Confirm" })
					}, { name: `Clean ${options.name} Keyframes`, can_rename: false });
				}, { name: `Clean ${options.name} Keyframes` }),
				flatten_all_geometries: veButton(() => {
					veConfirm(`Are you sure you want to flatten all geometries in ${this.name}?`, {
						special_function: () => {
							DALS.Timeline.parseAction({
								options: { name: "Flatten Geometries", key: `flatten_${options.type}_geometries` },
								value: [{
									type: "Feature",
									feature_id: this.id,
									flatten_all_geometries: true
								}]
							});
							veToast(`Flattened all geometries.`);
						}
					});
				}, {
					name: "Flatten All Geometries"
				}),
				move_entities_to: veButton(() => {
					if (this.move_entities_window) this.move_entities_window.close();
					this.move_entities_window = veWindow({
						to_feature: new UI_FeatureDatalist(this.ui.to_feature_id, {
							name: `To ${options.name}`,
							filter_types: options.move_to_filters,
							onuserchange: (v) => {
								console.log(v);
								this.ui.to_feature_id = v;
							}
						}),
						confirm: veButton(() => {
							try {
								//Declare local instance variables
								let ot_feature = naissance.Feature.instances.filter((v) => v.id === this.ui.to_feature_id)[0];
								
								//Parse action
								DALS.Timeline.parseAction({
									options: { name: "Move Geometries To", key: `move_${options.type}_geometries_to` },
									value: [{
										type: "Feature",
										feature_id: this.id,
										move_all_entities_to_feature: this.ui.to_feature_id
									}]
								});
								veToast(`Moved all geometries from ${this.name} ${options.name} to ${ot_feature.name} ${options.name}.`);
							} catch (e) { console.error(e); }
						}, { name: "Confirm" })
					}, { name: "Move Entities To", can_rename: false })
				}, { name: `Move Entities To ${options.name}` }),
				simplify_polygons: veButton(() => {
					if (this.simplify_polygons_window) this.simplify_polygons_window.close();
					this.simplify_polygons_window = veWindow({
						simplify_threshold: veRange(Math.returnSafeNumber(this.ui.simplify_threshold, 0.01), {
							name: `Simplify Threshold`,
							onuserchange: (v) => this.ui.simplify_threshold = v
						}),
						confirm: veButton(() => {
							//Declare local instance variables
							let simplify_threshold = Math.returnSafeNumber(this.ui.simplify_threshold, 0.01);
							
							try {
								DALS.Timeline.parseAction({
									options: { name: "Simplify Polygons", key: `simplify_${options.type}_geometries` },
									value: [{
										type: "Feature",
										feature_id: this.id,
										simplify_all_polygons: simplify_threshold
									}]
								});
								veToast(`Simplified all geometries by ${String.formatNumber(simplify_threshold)}`)
							} catch (e) { console.error(e); }
						}, { name: "Confirm" })
					}, { name: "Simplify Polygons", can_rename: false });
				}, { name: "Simplify Polygons" })
			}, {
				display: "inline",
				placeholder: "Search for action ...",
				style: {
					"> [component='ve-button']": {
						display: "inline",
						padding: 0
					}
				}
			})
		}, {
			name: "Actions",
			style: { padding: 0 }
		});
	}
	
	drawHierarchyDatatypeGenerics () {
		//Return statement
		return {
			hide_visibility: veButton(() => {
				DALS.Timeline.parseAction({
					options: { name: "Hide Feature", key: "hide_feature" },
					value: [{ type: "Feature", feature_id: this.id, set_visibility: false }]
				});
			}, {
				attributes: { class: "order-99" },
				name: `<icon>visibility</icon>`,
				limit: () => this._is_visible,
				tooltip: "Hide Feature"
			}),
			show_visibility: veButton(() => {
				DALS.Timeline.parseAction({
					options: { name: "Show Feature", key: "show_feature" },
					value: [{ type: "Feature", feature_id: this.id, set_visibility: true }]
				});
			}, {
				attributes: { class: "order-99" },
				name: "<icon>visibility_off</icon>",
				limit: () =>  !this._is_visible,
				tooltip: "Show Feature"
			}),
			delete_button: veButton(() => {
				DALS.Timeline.parseAction({
					options: { name: "Delete Feature", key: "delete_feature" },
					value: [{ type: "Feature", feature_id: this.id, delete_feature: true }]
				});
			}, {
				attributes: { class: "order-100" },
				name: "<icon>delete</icon>", 
				tooltip: "Delete",
			}),
		};
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
	
	hide () {
		//Declare local instance variables
		this._is_visible = false;
		
		//Iterate over all entities; attempt to hide all entities
		if (this.entities)
			for (let i = 0; i < this.entities.length; i++)
				if (this.entities[i].hide)
					this.entities[i].hide();
	}
	
	remove () {
		//Declare local instance variables
		let delete_keys = ["_entities", "entities"]
		
		//Remove from naissance.Feature.instances
		for (let i = naissance.Feature.instances.length - 1; i >= 0; i--) {
			let local_feature = naissance.Feature.instances[i];
			
			if (local_feature.id === this.id)
				naissance.Feature.instances.splice(i, 1);
			if (local_feature.entities)
				//Iterate over delete_keys and local_feature.entities.length to ensure clean removal
				for (let x = 0; x < delete_keys.length; x++)
					if (local_feature[delete_keys[x]])
						for (let y = local_feature[delete_keys[x]].length - 1; y >= 0; y--)
							if (local_feature[delete_keys[x]][y].id === this.id)
								local_feature[delete_keys[x]].splice(y, 1);
		}
		
		//Remove from local_feature.entities
		if (this.hide) this.hide();
		if (this.entities)
			for (let x = 0; x < this.entities.length; x++)
				if (this.entities[x].id === this.id)
					naissance.Feature.instances.splice(x, 1);
		
		//Rerender deleted feature and remove it from the map
		if (this.draw) this.draw();
		UI_LeftbarHierarchy.refresh();
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