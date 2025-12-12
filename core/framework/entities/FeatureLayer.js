if (!global.naissance) global.naissance = {};
/**
 * @type {naissance.FeatureLayer}
 */
naissance.FeatureLayer = class extends naissance.Feature {
	constructor (arg0_entities, arg1_options) {
		super();
		this.cannot_nest_self = true;
		this.class_name = "FeatureLayer";
		this.entities = (arg0_entities) ? arg0_entities : [];
		this.options = (arg1_options) ? arg1_options : {};
		
		//Declare local instance variables
		this._name = "New Layer";
		this._type = "default"; //Either 'default'/'provinces'
		
		//Declare UI
		this.interface = veInterface({
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
				
				onuserchange: (v) => DALS.Timeline.parseAction({
					options: { name: "Set Layer Type", key: "set_layer_type" },
					value: [{ 
						type: "FeatureLayer", 
						feature_id: this.id, 
						set_layer_option: { key: "type", value: v } 
					}]
				})
			})
		}, { is_folder: false });
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
	
	drawHierarchyDatatype () {
		//Declare local instance variables
		let hierarchy_obj = {};
		
		//Delete any self-references; already assigned entities with other .parent
		for (let i = this.entities.length - 1; i >= 0; i--)
			if (this.entities[i].class_name === "FeatureLayer" && this.entities[i].id === this.id) {
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
				//console.log(this, `is calling`, local_entity)
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
		
		//Return statement
		return new ve.HierarchyDatatype({
			icon: new ve.HTML(`<icon>${(this.type !== "provinces") ? "layers" : "flag"}</icon>`, {
				tooltip: `FeatureLayer - Type: ${this.type}`
			}),
			...super.drawHierarchyDatatypeGenerics(),
			edit: veButton(() => {
				super.open("instance", {
					id: this.id,
					name: this._name,
					width: "24rem"
				});
				this.draw();
			}, {
				name: `<icon>more_vert</icon>`,
				tooltip: "Edit Layer",
				style: { order: 100, padding: 0 }
			}),
			
			...hierarchy_obj
		}, {
			instance: this,
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
			type: "group"
		});
	}
	
	fromJSON (arg0_json) {
		//Convert from parameters
		let json = (typeof arg0_json !== "object") ? JSON.parse(arg0_json) : arg0_json;
		
		//Declare local instance variables
		this.id = json.id;
		this.is_collapsed = json.is_collapsed;
		this._name = (json.name) ? json.name : "New Layer";
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
	
	getAllGeometries (arg0_object) {
		//Convert from parameters
		let object = (arg0_object) ? arg0_object : this;
		
		//Declare local instance variables
		let all_entities = [];
		
		//Iterate over all .entities and check if they have .entities
		if (object.entities)
			for (let i = 0; i < object.entities.length; i++)
				if (object.entities[i] instanceof naissance.Geometry) {
					all_entities.push(object.entities[i]);
				} else if (object.entities[i].entities) {
					all_entities = all_entities.concat(this.getAllGeometries(object.entities[i]));
				}
		
		//Return statement
		return all_entities;
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
			name: this._name,
			entities: entity_ids,
			options: this.options
		});
	}
	
	static _debugProvincesLayer () {
		let provinces_layer = naissance.FeatureLayer.fetchProvincesLayer();
		
		let all_geometries = provinces_layer.getGeometries();
		
		for (let i = 0; i < all_geometries.length; i++)
			all_geometries[i].setSymbol({
				polygonFill: Colour.randomHex(),
				polygonOpacity: 0.5
			});
		//provinces_layer.removeFrom(map);
		provinces_layer.addTo(map);
	}
	
	static fetchProvincesLayer () {
		//Declare local instance variables
		let all_feature_collections = [];
		let province_layers = main._layers.province_layers;
		
		//Declare local instance variables
		let maptalks_geometries = [];
		
		if (province_layers.length === 1) {
			let all_geometries = province_layers[0].getAllGeometries();
			
			//Iterate over all_geometries and append them to maptalks_geometries
			for (let i = 0; i < all_geometries.length; i++)
				if (all_geometries[i] instanceof naissance.GeometryPolygon)
					if (all_geometries[i].geometry)
						maptalks_geometries.push(all_geometries[i].geometry.copy());
		} else if (province_layers.length > 1) {
			//Iterate over all province_layers and convert them to geometry collections
			for (let i = 0; i < province_layers.length; i++) {
				let local_geometries = province_layers[i].getAllGeometries();
				let raw_geometries = [];
				
				//Iterate over all local_geometries and filter for naissance.GeometryPolygon
				for (let x = 0; x < local_geometries.length; x++)
					if (local_geometries[x] instanceof naissance.GeometryPolygon)
						if (local_geometries[x].geometry)
							raw_geometries.push(Geospatiale.convertMaptalksToTurf(local_geometries[x].geometry));
				
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
		
		main._layers.provinces.clear(); //Clear all geometries in layer first
		console.log(maptalks_geometries);
		if (province_layers.length > 0)
			main._layers.provinces.addGeometry(maptalks_geometries);
		
		//Return statement
		return main._layers.provinces;
	}
	
	/**
	 * Parses a JSON action for a target FeatureLayer.
	 * - Static method of: {@link naissance.FeatureLayer}
	 * 
	 * `arg0_json`: {@link Object|string}
	 * - `.feature_id`: {@link string} - Identifier. The {@link naissance.Feature} ID to target changes for.
	 * <br>
	 * - #### Extraneous Commands:
	 *   - `.create_layer`: {@link Object}
	 *     - `.do_not_refresh=false`: {@link boolean}
	 *     - `.id`: {@link string}
	 * - #### Internal Commands:
	 *   - `.set_layer_option`: {@link Object}
	 *     - `.key`: {@link string} - The key to change for the selected layer.
	 *     - `.value`: {@link any} - What to change the value of the key to.
	 */
	static parseAction (arg0_json) {
		//Convert from parameters
		let json = (typeof arg0_json === "string") ? JSON.parse(arg0_json) : arg0_json;
		
		//Declare local instance variables
		let layer_obj = naissance.Feature.instances.filter((v) => v.id === json.feature_id)[0];
		
		//Parse extraneous commands
		//create_layer
		if (json.create_layer)
			if (json.create_layer.id) {
				let new_layer = new naissance.FeatureLayer();
				new_layer.id = json.create_layer.id;
				
				if (!json.create_layer.do_not_refresh)
					UI_LeftbarHierarchy.refresh();
			}
		
		//Parse commands for layer_obj
		if (layer_obj) {
			//set_layer_option
			if (json.set_layer_option)
				layer_obj[json.set_layer_option.key] = json.set_layer_option.value;
		}
	}
};