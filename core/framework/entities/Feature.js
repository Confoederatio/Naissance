if (!global.naissance) global.naissance = {};
naissance.Feature = class extends ve.Class {
	static instances = [];
	
	constructor () {
		//Convert from parameters
		super();
		this.id = Class.generateRandomID(naissance.Feature);
		this.instance = this;
		this.is_naissance_feature = true;
		this._is_visible = true;
		
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
		if (!options.move_to_filters) options.move_to_filters = ["FeatureGroup", "FeatureLayer"];
		
		//Return statement
		return veInterface({
			actions_palette: veSearchSelect({
				clean_geometry_tags: veButton(() => {
					veConfirm(`Are you sure you want to clean all geometry tags in ${this.name}?`, {
						special_function: () => {
							DALS.Timeline.parseAction({
								options: { name: "Clean Geometry Tags", key: "clean_layer_geometry_tags" },
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
						clean_symbols: veToggle(this._ui.clean_symbols, {
							name: "Clean Symbols",
							onuserchange: (v) => this._ui.clean_symbols = v
						}),
						clean_keyframes: veButton(() => {
							//Declare local instance variables
							let all_flags = [];
							if (this._ui.clean_symbols) all_flags.push("symbol");
							
							DALS.Timeline.parseAction({
								options: { name: "Clean Keyframes", key: "clean_layer_keyframes" },
								value: [{
									type: "Feature",
									feature_id: this.id,
									clean_keyframes: all_flags
								}]
							});
							veToast(`Cleaned layer keyframes.`);
						}, { name: "Confirm" })
					}, { name: "Clean Layer Keyframes", can_rename: false });
				}, { name: "Clean Layer Keyframes"}),
				flatten_all_geometries: veButton(() => {
					veConfirm(`Are you sure you want to flatten all geometries in ${this.name}?`, {
						special_function: () => {
							DALS.Timeline.parseAction({
								options: { name: "Flatten Geometries", key: "flatten_layer_geometries" },
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
						to_layer: new UI_FeatureDatalist(this._ui.to_feature_id, {
							name: "To Layer",
							filter_types: options.move_to_filters,
							onuserchange: (v) => {
								console.log(v);
								this._ui.to_feature_id = v;
							}
						}),
						confirm: veButton(() => {
							try {
								//Declare local instance variables
								let ot_feature = naissance.Feature.instances.filter((v) => v.id === this._ui.to_feature_id)[0];
								
								//Parse action
								DALS.Timeline.parseAction({
									options: { name: "Move Geometries To", key: "move_layer_geometries_to" },
									value: [{
										type: "Feature",
										feature_id: this.id,
										move_all_entities_to_feature: this._ui.to_feature_id
									}]
								});
								veToast(`Moved all geometries from ${this.name} Layer to ${ot_feature.name} Layer.`);
							} catch (e) { console.error(e); }
						}, { name: "Confirm" })
					}, { name: "Move Entities To", can_rename: false })
				}, { name: "Move Entities To Layer" })
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
			style: {
				padding: 0
			}
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
	 * Returns an array of all {@link naissance.Geometry}|{@link naissance.Feature} instances housed in the FeatureLayer.
	 *
	 * @param {naissance.Feature} [arg0_object]
	 * @param {Object} [arg1_options]
	 *  @param {naissance.Feature[]} [arg1_options.owners]
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
					if (!local_entity.metadata) local_entity.metadata = {};
					if (!local_entity.metadata.tags) local_entity.metadata.tags = [];
					
					//Iterate over all owner_names and ensure they inherit the proper tags if they don't exist, i.e. convert groups to tags
					for (let x = 0; x < owner_names.length; x++)
						if (!local_entity.metadata.tags.includes(owner_names[x]))
							local_entity.metadata.tags.push(owner_names[x]);
					
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
								local_feature[delete_keys[x]].splice(x, 1);
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
	
	/**
	 * Parses a JSON action for a target Feature.
	 * - Static method of: {@link naissance.Feature}
	 * 
	 * `arg0_json`: {@link Object|string}
	 * - `.feature_id`: {@link string} - Identifier. The {@link naissance.Feature} ID to target changes for, if any.
	 * <br>
	 * - ##### Extraneous Commands:
	 * - `.clean_keyframes`: {@link Array}<{@link string}> - Cleans geometry keyframes for default symbols, redundant names. Options: ["symbol"]
	 * - `.clean_geometry_tags`: {@link boolean}
	 * - `.delete_feature`: {@link boolean}
	 * - `.flatten_all_geometries`: {@link boolean}
	 * - `.move_all_entities_to_feature`: {@link string}
	 * - `.set_name`: {@link string}
	 * - `.set_visibility`: {@link boolean}
	 * 
	 * @param {Object|string} arg0_json
	 */
	static parseAction (arg0_json) {
		//Convert from parameters
		let json = (typeof arg0_json === "string") ? JSON.parse(arg0_json) : arg0_json;
		
		//Declare local instance variables
		let feature_obj = naissance.Feature.instances.filter((v) => v.id === json.feature_id)[0];
		
		//Parse commands for feature_obj
		if (feature_obj) {
			//clean_keyframes
			if (json.clean_keyframes) {
				let all_geometries = feature_obj.getAllGeometries();
				let all_geometry_ids = [];
				
				//Iterate over all_geometries and append IDs for parsing
				for (let i = 0; i < all_geometries.length; i++)
					if (all_geometries[i].id) all_geometry_ids.push(all_geometries[i].id);
				naissance.Geometry.parseActionForGeometries(all_geometry_ids, {
					command: "clean_keyframes",
					key: "clean_keyframes",
					name: "Clean F.Geometry Keyframes",
					value: json.clean_keyframes
				});
			}
			
			//clean_geometry_tags
			if (json.clean_geometry_tags) {
				let all_geometries = feature_obj.getAllGeometries();
				
				//Iterate over all_geometries and clean metadata.tags
				for (let i = 0; i < all_geometries.length; i++)
					delete all_geometries[i].metadata.tags;
			}
			
			//delete_feature
			if (json.delete_feature === true) {
				feature_obj.remove();
				return;
			}
			
			//flatten_all_geometries
			if (json.flatten_all_geometries) {
				feature_obj.entities = feature_obj.getAllGeometries();
				
				//Update parent ref for all promoted geometries
				for (let i = 0; i < feature_obj.entities.length; i++)
					feature_obj.entities[i].parent = feature_obj;
				UI_LeftbarHierarchy.refresh();
			}
			
			//move_all_entities_to_feature
			if (json.move_all_entities_to_feature !== undefined) {
				let ot_feature_obj = naissance.Feature.instances.filter((v) => v.id === json.move_all_entities_to_feature)[0];
				
				if (ot_feature_obj && ot_feature_obj?.id !== feature_obj.id) {
					let local_entities = [...feature_obj.entities];
					
					//Iterate over local_entities
					for (let i = 0; i < local_entities.length; i++) {
						let local_entity = local_entities[i];
						
						//Remove from old parent .entities array
						if (local_entity.parent && local_entity.parent.entities) {
							let parent_entities = local_entity.parent.entities;
							
							//Iterate over all parent_entities and splice out the entity being moved
							for (let x = parent_entities.length - 1; x >= 0; x--)
								if (parent_entities[x].id === local_entity.id)
									parent_entities.splice(x, 1);
						}
						
						//Move to target feature
						local_entity.parent = ot_feature_obj;
						if (!ot_feature_obj.entities) ot_feature_obj.entities = [];
						ot_feature_obj.entities.push(local_entity);
					}
					UI_LeftbarHierarchy.refresh();
				}
			}
			
			//set_name
			if (typeof json.set_name === "string")
				feature_obj._name = json.set_name;
			
			//set_visibility
			if (json.set_visibility !== undefined)
				if (json.set_visibility === true) {
					feature_obj.show();
				} else if (json.set_visibility === false) {
					feature_obj.hide();
				}
		}
	}
};