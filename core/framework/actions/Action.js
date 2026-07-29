if (!global.naissance) global.naissance = {};

/**
 * @param {string} arg0_key
 * @param {Object} [arg1_json]
 *  @param {string} [arg1_json.name]
 *  
 *  @param {boolean} [arg1_json.do_not_bind_to_feature=false]
 *  @param {function} [arg1_json.draw_function] - (arg0_naissance_obj.ui:{@link Object})
 *  @param {Object} [arg1_json.node_options]
 *  @param {string|string[]} [arg1_json.scope]
 *  @param {AsyncFunction} [arg1_json.special_function] - (arg0_json:{@link Object}) 
 * 
 * @type {naissance.Action}
 */
naissance.Action = class {
	static instances = {};
	static scope_map = {};
	
	constructor (arg0_key, arg1_json) {
		//Convert from parameters
		let key = arg0_key;
		let json = (arg1_json) ? arg1_json : {};
		
		//Initialise options
		if (json.do_not_bind_to_feature === undefined) json.do_not_bind_to_feature = false;
		
		//Declare local instance variables
		this.key = key.split("-")[1];
		
		//1. Destructure json
		Object.iterate(json, (local_key, local_value) => this[local_key] = local_value);
		
		//2. Add to scope_map
		let scope_map = naissance.Action.scope_map;
		
		if (this.scope) {
			this.scope = Array.toArray(this.scope);
			
			for (let i = 0; i < this.scope.length; i++) {
				if (!scope_map[this.scope[i]]) scope_map[this.scope[i]] = {};
				scope_map[this.scope[i]][this.key] = this;
			}
		}
		
		//Push to naissance.Action.instances
		naissance.Action.instances[key] = this;
	}
	
	/**
	 * Returns the Actions Palette for a given Naissance Object.
	 * 
	 * @param {Object} arg0_naissance_obj
	 * @param {Object} [arg1_options]
	 * 
	 * @returns {ve.Interface}
	 */
	static drawActionsPalette (arg0_naissance_obj, arg1_options) {
		//Convert from parameters
		let naissance_obj = arg0_naissance_obj;
		let options = (arg1_options) ? arg1_options : {};
		
		//Declare local instance variables
		let components_obj = {};
		let filter_obj = {};
		let scopes = naissance.Action.getScopes(naissance_obj);
		let sorted_array = [];
		
		//Iterate over all scopes and the .scope_map[scopes[i]] that applies to it
		for (let i = 0; i < scopes.length; i++) {
			let local_map = naissance.Action.scope_map[scopes[i]];
			
			if (!local_map) continue;
			
			//Alphabetise names in actions palette
			Object.iterate(local_map, (local_key, local_action) => {
				if (typeof local_action.draw_function === "function") sorted_array.push({
					key: local_key,
					name: (local_action.name || local_action.key),
					scope_key: scopes[i]
				});
			});
		}
		sorted_array.sort((a, b) => a.name.localeCompare(b.name));
		
		//Iterate over all sorted_array and structure buttons with .draw_function bound to them; assuming they have one
		for (let i = 0; i < sorted_array.length; i++) {
			let local_filters = {};
			let local_map = naissance.Action.scope_map[sorted_array[i].scope_key];
			
			let local_action = local_map[sorted_array[i].key];
			
			let action_name = local_action.name;
			
			//Filter handling
			if (Array.isArray(local_action.scope))
				for (let x = 0; x < local_action.scope.length; x++) {
					let filter_key = String.snakecase(local_action.scope[x]);
					
					filter_obj[`data-${filter_key}`] = local_action.scope[x];
					local_filters[`data-${filter_key}`] = "true";
				}
				
			if (local_action.filters)
				for (let i = 0; i < local_action.filters.length; i++) {
					let filter_key = String.snakecase(local_action.filters[i]);
					
					//Set attributes
					filter_obj[`data-${filter_key}`] = local_action.filters[i];
					local_filters[`data-${filter_key}`] = "true";
				}
			
			//Component handling
			components_obj[local_action.key] = veButton(() => {
				let local_components_obj = local_action.draw_function.call(naissance_obj, local_action);
				let local_name = (naissance_obj.name || naissance_obj.class_name);
				
				//Only initialise the window if local_components_obj doesn't return undefined
				if (local_components_obj !== undefined) {
					if (naissance_obj[`${local_action.key}_window`]) naissance_obj[`${local_action.key}_window`].close();
					naissance_obj[`${local_action.key}_window`] = veWindow(local_components_obj, {
						name: `${action_name}${(local_name) ? ` (${local_name})` : ""}`,
						can_rename: false,
						width: "20rem",
						...local_action.window_options
					});
				}
			}, {
				attributes: {
					...local_filters
				},
				name: action_name 
			});
		}
		
		//Show either veHTML/veSearchSelect depending on relevance
		let processed_components_obj = {};
		
		if (Object.keys(components_obj).length > 0) {
			processed_components_obj.actions_palette = veSearchSelect(components_obj, {
				display: "inline",
				filter_names: filter_obj,
				placeholder: "Search for action ...",
				style: {
					"> [component='ve-button']": {
						display: "inline",
						padding: 0
					}
				}
			});
		} else {
			processed_components_obj.actions_palette = veHTML("No actions available.");
		}
		
		//Return statement
		return veInterface(processed_components_obj, {
			name: "Actions",
			style: { padding: 0 },
			width: 99,
			
			...options
		});
	}
	
	/**
	 * Opens the Action Palette Window for a given Naissance object.
	 * 
	 * @param {Object} arg0_naissance_obj
	 * @param {Object} [arg1_options]
	 *  @param {Object} [arg1_options.components_obj]
	 *  @param {string} [arg1_options.name]
	 *  @param {Object} [arg1_options.palette_options]
	 */
	static openActionsPalette (arg0_naissance_obj, arg1_options) {
		//Convert from parameters
		let naissance_obj = arg0_naissance_obj;
		let options = (arg1_options) ? arg1_options : {};
		
		//Initialise options
		if (!options.palette_options) options.palette_options = {};
		
		//Declare local instance variables
		if (!naissance_obj.ui) naissance_obj.ui = {};
		let window_name = options.name;
		
		//Ensure naissance_obj.actions_palette_window is free
		if (naissance_obj.actions_palette_window) naissance_obj.actions_palette_window.close();
		
		//Get window name
		if (!window_name)
			if (naissance_obj instanceof naissance.Entity) {
				window_name = `${naissance_obj.getTypeName()} Actions (${naissance_obj.name})`;
			} else {
				window_name = `${naissance_obj.constructor.name} Actions`;
			}
		
		//Create new window
		naissance_obj.actions_palette_window = veWindow({
			...(options.components_obj || {}),
			actions_palette: naissance.Action.drawActionsPalette(naissance_obj, { 
				open: true, 
				style: {
					maxHeight: "30rem",
					overflowY: "auto"
				},
				...options.palette_options
			})
		}, {
			name: window_name,
			can_rename: false,
			width: "30rem",
			...options
		});
	}
	
	/**
	 * Returns all applicable scopes for a given Naissance Object.
	 * 
	 * @param {Object} arg0_naissance_obj
	 * 
	 * @returns {string[]}
	 */
	static getScopes (arg0_naissance_obj) {
		//Convert from parameters
		let naissance_obj = arg0_naissance_obj;
		
		if (typeof naissance_obj === "string") return [naissance_obj]; //Internal guard clause for string types
		
		//Declare local instance variables
		let scopes = [];
		
		//Parse scopes
		if (naissance_obj.class_name) {
			if (naissance_obj.class_name.startsWith("Feature"))
				Array.uniquePush(scopes, "Entity", "Feature");
			if (naissance_obj.class_name.startsWith("Geometry"))
				Array.uniquePush(scopes, "Entity", "Geometry");
			Array.uniquePush(scopes, naissance_obj.class_name);
		}
		
		//Return statement
		return scopes;
	}
	
	/**
	 * Initialises everything from `config.actions` into `naissance.Action.instances` as a structured map.
	 */
	static initialise () {
		//Iterate over all config.actions categories and their subobjects
		Object.iterate(config.actions, (local_category_key, local_category_obj) => {
			Object.iterate(local_category_obj, (local_action_key, local_action_obj) => {
				let is_geometry_action = false;
				let scope_array;
				
				if (!local_action_obj.do_not_bind_to_feature) {
					scope_array = Array.toArray(local_action_obj.scope);
					
					//Iterate over scope_array and check for any starting Geometry keys
					for (let i = 0; i < scope_array.length; i++)
						if (scope_array[i].startsWith("Geometry")) {
							is_geometry_action = true;
							break;
						}
				}
				
				//1. Declare global action
				new naissance.Action(`${local_category_key}-${local_action_key}`, local_action_obj);
				
				//Handles Actions where .do_not_bind_to_feature is false, and it has a scope to either Geometry, or a subclass
				if (is_geometry_action) {
					let has_duplicate = naissance.Action.scope_map["Feature"][local_action_key];
					
					//Check to make sure it isn't already in existence
					if (!has_duplicate) {
						let new_options = { ...local_action_obj };
						
						//.name handling
						new_options.name = (local_action_obj.feature_name) ?
							local_action_obj.feature_name : `(Feature) ${(local_action_obj.name || local_action_key)}`;
						
						//[WIP] - .node_options handling
						if (local_action_obj.node_options) {
							
						}
						
						//.scope handling
						new_options.scope = ["Feature"];
						
						//.special_function handling
						let special_function = local_action_obj.special_function;
						
						if (typeof special_function === "function")
							new_options.special_function = async (json) => {
								let feature_obj = naissance.Feature.instances[json.feature_obj];
								
								//Iterate over all_geometries if .entities is defined
								if (feature_obj?.entities) {
									let all_geometries = feature_obj.getAllGeometries();
									
									for (let i = 0; i < all_geometries.length; i++) {
										//Iterate over scope_array and see if the current geometry passes_check
										let passes_check = false;
										
										for (let x = 0; x < scope_array.length; x++) {
											if (["Entity", "Geometry"].includes(scope_array[x])) {
												passes_check = true;
											} else if (scope_array[x].startsWith("Geometry")) {
												if (all_geometries[i]?.class_name === scope_array[x])
													passes_check = true;
											}
											
											if (passes_check) break;
										}
										
										//If so, execute an action for this Geometry
										if (passes_check)
											await special_function({
												...json,
												naissance_obj: all_geometries[i],
											});
									}
								}
							};
						
						//2. Declare geometry action at feature level
						new naissance.Action(`Feature-${local_action_key}`, new_options);
					}
				}
			});
		});
	}
};