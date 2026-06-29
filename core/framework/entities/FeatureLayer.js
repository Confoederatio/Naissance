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
		this.options = (arg1_options) ? arg1_options : {};
		this.window = new UI_FeatureLayerWindow(this);
		
		//Declare local instance variables
		this._name = "New Layer";
		this._type = "default"; //Either 'default'/'provinces'
		this._ui = {};
	}
	
	get type () {
		//Return statement
		return this._type;
	}
	
	set type (arg0_value) {
		//Convert from parameters
		let value = (arg0_value) ? arg0_value : "default";
		
		//Declare local instance variables
		let province_layers = main._layers.province_layers;
		
		//Parse value if 'default'/'provinces'
		if (value === "default") {
			//Extant type is provinces, remove from main._layers.province_layers, recalculate provinces
			if (this.type === "provinces") {
				//Splice from province_layers
				for (let i = 0; i < province_layers.length; i++)
					if (province_layers[i].id === this.id)
						main._layers.province_layers.splice(i, 1);
				
				//Recalculate naissance.FeatureLayer.getProvincesLayer()
				naissance.FeatureLayer.fetchProvincesLayer();
				if (this._provinces_is_visible)
					this.show();
				delete this._provinces_is_visible;
			}
		} else if (value === "provinces") {
			//Add to main._layers.province_layers if not already included
			let is_duplicate = false;
			
			//Iterate over all province_layers, only push to province_layers if it is not a duplicate
			for (let i = 0; i < province_layers.length; i++)
				if (province_layers[i].id === this.id) {
					is_duplicate = true;
					break;
				}
			
			if (!is_duplicate)
				province_layers.push(this);
			
			//Recalculate naissance.FeatureLayer.getProvincesLayer()
			naissance.FeatureLayer.fetchProvincesLayer();
			this._provinces_is_visible = JSON.parse(JSON.stringify(this._is_visible));
			this.hide();
		}
		
		//Set this._type
		this._type = value;
	}
	
	addEntity (arg0_naissance_obj, arg1_do_not_refresh) {
		//Convert from parameters
		let naissance_obj = arg0_naissance_obj;
		let do_not_refresh = arg1_do_not_refresh;
		
		//Declare local instance variables
		let has_entity = this.hasEntity(naissance_obj);
		
		if (!has_entity && !(naissance_obj instanceof naissance.Feature && naissance_obj.id === this.id)) {
			naissance_obj.parent = this;
			this.entities.push(naissance_obj);
			if (!do_not_refresh) this.drawHierarchyDatatype();
		}
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
				
				onuserchange: (v) => DALS.Timeline.parseAction("set_layer_type", [{
					feature_obj: this.id,
					set_layer_option: { key: "type", value: v }
				}])
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
		this.type = (json.type) ? json.type : "default";
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
			type: this._type,
		});
	}
	
	static fetchProvincesLayer () {
		//Declare local instance variables
		let all_feature_collections = [];
		let province_layers = main._layers.province_layers;
		
		//Declare local instance variables
		let maptalks_geometries = [];
		
		//1. Populate maptalks_geometries
		if (province_layers.length === 1) {
			let all_geometries = province_layers[0].getAllGeometries();
			
			//Iterate over all_geometries and append them to maptalks_geometries
			for (let i = 0; i < all_geometries.length; i++)
				if (all_geometries[i] instanceof naissance.GeometryPolygon)
					if (all_geometries[i].current_geometry)
						maptalks_geometries.push(all_geometries[i].current_geometry);
		} else if (province_layers.length > 1) {
			//Iterate over all province_layers and convert them to geometry collections
			for (let i = 0; i < province_layers.length; i++) {
				let local_geometries = province_layers[i].getAllGeometries();
				let raw_geometries = [];
				
				//Iterate over all local_geometries and filter for naissance.GeometryPolygon
				for (let x = 0; x < local_geometries.length; x++)
					if (local_geometries[x] instanceof naissance.GeometryPolygon)
						if (local_geometries[x].current_geometry)
							raw_geometries.push(Geospatiale.convertMaptalksToTurf(local_geometries[x].current_geometry));
				
				//Create new turf.featureCollection() and parse it out to GeoJSON
				all_feature_collections.push(turf.featureCollection(raw_geometries));
			}
			
			//Iterate over all_geometry_collections and difference them using Geospatiale.planarOverlay; return turf.featureCollection()
			let result = all_feature_collections[0];
			
			for (let i = 1; i < all_feature_collections.length; i++)
				result = Geospatiale.planarOverlay(result, all_feature_collections[i]);
			
			for (let local_feature of result.features) {
				let local_maptalks_geometry = Geospatiale.convertTurfToMaptalks(local_feature.geometry);
				maptalks_geometries.push(local_maptalks_geometry);
			}
		}
		
		//2. Refresh layer
		main._layers.provinces.clear(); //Clear all geometries in layer first
		if (province_layers.length > 0)
			main._layers.provinces.addGeometry(maptalks_geometries);
		
		//3. Draw layer onto map
		let provinces_layer = main._layers.provinces;
		
		//Iterate over all_geometries
		let all_geometries = provinces_layer.getGeometries();
		
		for (let i = 0; i < all_geometries.length; i++)
			all_geometries[i].setSymbol({
				polygonFill: Colour.randomHex(),
				polygonOpacity: Math.returnSafeNumber(main.settings.province_layer_opacity, 0.5)
			});
		provinces_layer.addTo(map);
		
		//Return statement
		return main._layers.provinces;
	}
};