if (!global.naissance) global.naissance = {};
/**
 * @type {naissance.FeatureLayer}
 */
naissance.FeatureLayer = class extends naissance.Feature {
	static hierarchy_symbol = {
		icon: "layers",
		name: "Layer"
	};
	
	constructor (arg0_entities, arg1_options) {
		super(arg1_options);
		this.cannot_nest_self = true;
		this.class_name = "FeatureLayer";
		/**
		 * @type {Array<naissance.Feature|naissance.Geometry>}
		 */
		this.entities = (arg0_entities) ? arg0_entities : [];
		this.metadata = {
			show_layer_features: true
		};
		this.options = (arg1_options) ? arg1_options : {};
		this.window = new UI_FeatureLayerWindow(this);
		
		//Declare local instance variables
		this._name = "New Layer";
		this.type = "default"; //Either 'default'/'provinces'
		this._ui = {};
	}
	
	drawUI () {
		//Return statement
		return {
			open_table: veButton(() => this.window.refresh(), { name: "View Geometries", x: 0, y: 0 }),
			debug: veButton(() => {
				console.log(`$feature - naissance.FeatureLayer (ID: ${this.id}):`, this);
				window.$feature = this;
			}, {
				name: "Debug",
				x: 1, y: 0
			}),
			show_features: veToggle(this.metadata?.show_layer_features, {
				name: "Show Layer Features",
				onuserchange: (v) => {
					if (v === false) {
						if (this.metadata) delete this.metadata.show_layer_features;
					} else {
						if (!this.metadata) this.metadata = {};
						this.metadata.show_layer_features = true;
					}
					UI_Leftbar.refresh();
				}
			}),
			show_geometries: veToggle(this.metadata?.show_layer_geometries, {
				name: "Show Layer Geometries",
				onuserchange: (v, e) => {
					let all_geometries = this.getAllGeometries();
					let max_recommended = Math.returnSafeNumber(main.settings.hierarchy_recommended_max_geometries_in_layer, 100);
					let showLayerGeometries = () => {
						if (!this.metadata) this.metadata = {};
						this.metadata.show_layer_geometries = true;
						UI_Leftbar.refresh();
					};
					
					if (v === false) {
						if (this.metadata) delete this.metadata.show_layer_geometries;
						UI_Leftbar.refresh();
					} else {
						if (all_geometries.length > max_recommended) {
							veConfirm(`This Layer contains ${String.formatNumber(all_geometries.length)} geometries. Are you sure you want to view its scene tree? (Recommended: ${String.formatNumber(max_recommended)})`, {
								onclose: () => e.v = false,
								special_function: () => showLayerGeometries()
							})
						} else { showLayerGeometries(); }
					}
				}
			}),
			
			layer_type: veSelect({
				default: {
					name: "Default"
				},
				provinces: {
					name: "Provinces"
				}
			}, {
				name: "Layer Type",
				selected: this._type,
				
				onuserchange: (v) => {
					DALS.Timeline.parseAction("set_layer_type", [{
						feature_obj: this.id,
						set_layer_option: { key: "type", value: v }
					}]);
					main.renderer.update();
				}
			}),
			
			actions: this.drawActionsPalette({
				name: "Layer",
				type: "layer",
				
				move_to_filters: ["FeatureLayer"]
			})
		};
	}
	
	fromJSON (arg0_json) {
		//Convert from parameters
		let json = (typeof arg0_json !== "object") ? JSON.parse(arg0_json) : arg0_json;
		
		//Declare local instance variables
		this.id = json.id;
		this.is_collapsed = json.is_collapsed;
		this._name = (json.name) ? json.name : "New Layer";
		this.options = json.options;
		
		//Iterate over json.entities IN SAVED ORDER to restore them
		for (let x = 0; x < json.entities.length; x++) {
			let entity_def = json.entities[x];
			
			//Check naissance.Feature.instances
			let local_feature = naissance.Feature.instances[entity_def.id];
			
			if (entity_def.class_name === local_feature?.class_name)
				this.addEntity(local_feature, true);
			
			//Check naissance.Geometry.instances
			if (naissance.Geometry.instances[entity_def.id]) {
				let local_geometry = naissance.Geometry.instances[entity_def.id];
				
				if (entity_def.class_name === local_geometry.class_name)
					this.addEntity(local_geometry, true);
			}
		}
		
		//Draw HierarchyDatatype if possible; switch type at bottom
		this.drawHierarchyDatatype();
		this.type = (json._type) ? json._type : "default";
	}
	
	/**
	 * Returns all unique keyframe dates in a layer.
	 * 
	 * @param {Object} [arg0_options]
	 *  @param {boolean} [arg0_options.return_timestamps=false] - Whether to return timestamps.
	 */
	getUniqueKeyframeDates (arg0_options) {
		//Convert from parameters
		let options = (arg0_options) ? arg0_options : {};
		
		//Declare local instance variables
		let all_geometries = this.getAllGeometries();
		let unique_timestamps = [];
		
		//Iterate over all_geometries and fetch unique_keyframes
		for (let i = 0; i < all_geometries.length; i++) {
			let local_history_keyframes = Object.keys(all_geometries[i].history.keyframes)
				.map(Date.convertTimestampToInt);
			
			for (let x = 0; x < local_history_keyframes.length; x++)
				if (!unique_timestamps.includes(local_history_keyframes[x]))
					unique_timestamps.push(local_history_keyframes[x]);
		}
		
		//If return_timestamps is not false, return dates instead
		if (!options.return_timestamps) {
			let unique_dates = [];
			
			//Return statement
			for (let i = 0; i < unique_timestamps.length; i++)
				unique_dates.push(Date.convertTimestampToDate(unique_timestamps[i]));
			return unique_dates;
		}
		return unique_timestamps;
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
			options: this.options,
			_type: this.type
		});
	}
};