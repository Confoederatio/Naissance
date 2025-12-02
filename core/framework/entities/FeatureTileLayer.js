if (!global.naissance) global.naissance = {};
/**
 * @type {naissance.FeatureTileLayer}
 */
naissance.FeatureTileLayer = class extends naissance.Feature {
	constructor (arg0_options) {
		super();
		this.class_name = "FeatureTileLayer";
		this.options = (arg0_options) ? arg0_options : {
			preset: "carto_light_all",
			
			urlTemplate: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
			subdomains: ["a","b","c","d"],
			
			opacity: 0,
			repeatWorld: false
		};
		
		//Declare local instance variables
		this._is_visible = true;
		this._name = "New Tile Layer";
		this.layer = new maptalks.TileLayer(this.id, this.options);
	}
	
	_DALS_addOptions (arg0_options) {
		//Convert from parameters
		let options = (arg0_options) ? arg0_options : {};
		
		//Execute DALS action
		DALS.Timeline.parseAction({
			options: { name: "Set TileLayer Options", key: "set_tile_layer_options" },
			value: [{
				type: "FeatureTileLayer",
				feature_id: this.id,
				add_options: {
					...options
				}
			}]
		});
	}
	
	_DALS_applyAsBaseLayer (arg0_do_not_add_to_undo_redo) {
		//Convert from parameters
		let do_not_add_to_undo_redo = arg0_do_not_add_to_undo_redo;
		
		//Fire action
		DALS.Timeline.parseAction({
			options: { name: "Apply TileLayer as Base", key: "apply_tile_layer_as_base" },
			value: [{
				type: "FeatureTileLayer",
				feature_id: this.id,
				apply_as_base_layer: true
			}]
		}, do_not_add_to_undo_redo);
	}
	
	_DALS_recalculatePreset (arg0_preset) {
		//Convert from parameters
		let preset = arg0_preset;
		
		//Declare local instance variables
		let presets_obj = config.features.tile_layer.tilemap_presets;
		let preset_obj = presets_obj[preset];
		
		if (preset.startsWith("maptiler_")) {
			this._DALS_addOptions({
				urlTemplate: `https://api.maptiler.com/maps/${preset.replace("maptiler_", "")}/${(this.tile_layer_window.resolution.v !== "null") ? this.tile_layer_window.resolution.v : ""}{z}/{x}/{y}.png?key=${this.tile_layer_window.advanced_options.maptiler_key.v}`
			});
		} else {
			this._DALS_addOptions({
				...preset_obj.options
			});
		}
	}
	
	draw () {
		//Refresh layer
		this.layer._setOptions({
			...this.options,
			spatialReference: map.getSpatialReference()
		});
		
		try {
			map.removeLayer(this.layer);
			if (this._is_visible)
				map.addLayer(this.layer);
		} catch (e) {}
	}
	
	drawHierarchyDatatype () {
		//Declare local instance variables
		let preset_options = {};
		let presets_obj = config.features.tile_layer.tilemap_presets;
		
		//Populate preset_options
		Object.iterate(presets_obj, (local_key, local_value) => {
			preset_options[local_key] = { 
				name: local_value.name,
				selected: (this.options.preset === local_key)
			};
		});
		
		//Return this.interface
		this.interface = new ve.HierarchyDatatype({
			icon: new ve.HTML(`<icon>${(this.is_base_layer) ? "map" : "view_module"}</icon>`, { tooltip: (this.is_base_layer) ? "Base FeatureTileLayer" : "FeatureTileLayer" }),
			...super.drawHierarchyDatatypeGenerics(),
			edit_tile_layer: veButton(() => {
				if (this.tile_layer_window) this.tile_layer_window.close();
				this.tile_layer_window = veWindow({
					opacity: veRange(0, {
						name: "Opacity",
						onuserchange: (v) => this._DALS_addOptions({ opacity: v })
					}),
					resolution: veSelect({
						"256/": {
							name: "256",
							selected: true
						},
						"null": {
							name: "512"
						}
					}, { 
						name: "Resolution",
						onuserchange: (v) => this._DALS_recalculatePreset(this.options.preset)
					}),
					set_preset: veSelect(preset_options, { 
						name: "Tilemap Preset",
						onuserchange: (v) => {
							this.options.preset = v;
							this._DALS_recalculatePreset(this.options.preset);
						}
					}),
					
					advanced_options: veInterface({
						maptiler_key: veText("xWbyIIrJg1lF1fmQFByp", { name: "Maptiler Key" }),
						url_template: veURL("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png", {
							name: "URL Template",
							onuserchange: (v) => this._DALS_addOptions({ urlTemplate: v })
						}),
						subdomains: veText(["a", "b", "c", "d"], {
							name: "Subdomains",
							onuserchange: (v) => this._DALS_addOptions({ subdomains: v })
						}),
						
						max_available_zoom: veNumber(0, {
							name: "Max Available Zoom",
							min: -1,
							onuserchange: (v) => this._DALS_addOptions({ maxAvailableZoom: (v > 0) ? v : null })
						}),
						repeat_world: veToggle(false, {
							name: "Repeat World",
							onuserchange: (v) => this._DALS_addOptions({ repeatWorld: v })
						})
					}, { name: "Advanced Options" }),
					
					apply_as_base_layer: veButton(() => this._DALS_applyAsBaseLayer(), { name: "Apply as Base Layer" })
				}, { name: `Edit ${this._name}`, can_rename: false, width: "24rem" });
			}, {
				name: "<icon>more_vert</icon>",
				tooltip: "Edit Tile Layer",
				style: {
					order: 101,
					padding: 0
				}
			})
		}, {
			ignore_component: true,
			instance: this,
			name: this.name,
			name_options: {
				onchange: (v) => {
					this.name = v;
					this.drawHierarchyDatatype();
				}
			},
			type: "item",
			style: {
				".nst-content": {
					paddingRight: 0
				},
				"[component='ve-button'] > button": {
					border: 0
				}
			}
		});
		
		//Return statement
		return this.interface;
	}
	
	fromJSON (arg0_json) {
		//Convert from parameters
		let json = (typeof arg0_json !== "object") ? JSON.parse(arg0_json) : arg0_json;
		
		this.id = json.id;
		this.is_base_layer = json.is_base_layer;
		this._name = json.name;
		this.options = json.options;
		
		//Draw call, draw hierarchy datatype
		this.draw();
		this.drawHierarchyDatatype();
		if (this.is_base_layer)
			this._DALS_applyAsBaseLayer(true);
	}
	
	hide () {
		this._is_visible = false;
		this.draw();
	}
	
	remove () {
		this.layer.remove();
		super.remove();
	}
	
	show () {
		this._is_visible = true;
		this.draw();
	}
	
	toJSON () {
		//Declare local instance variables
		let json_obj = {
			id: this.id,
			is_base_layer: this.is_base_layer,
			name: this._name,
			options: this.options
		};
		
		//Return statement
		return JSON.stringify(json_obj);
	}
	
	/**
	 * Parses a JSON action for a target FeatureTileLayer.
	 * - Static method of: {@link naissance.FeatureTileLayer}
	 * 
	 * `arg0_json`: {@link Object|string}
	 * - `.feature_id`: {@link string} - Identifier. The {@link naissance.Feature} ID to target changes for.
	 * <br>
	 * - #### Extraneous Commands:
	 * - `.create_tile_layer`: {@link Object}
	 *   - `.do_not_refresh=false`: {@link boolean}
	 *   - `.id`: {@link string}
	 * - #### Internal Commands:
	 * - `.add_options`: {@link Object} - Mutates specified TileLayer options.
	 * - `.apply_as_base_layer`: {@link boolean}
	 * - `.set_options`: {@link Object} - Overrides all options for the {@link naissance.FeatureTileLayer} and replaces them with the object specified.
	 */
	static parseAction (arg0_json) {
		//Convert from parameters
		let json = (typeof arg0_json === "string") ? JSON.parse(arg0_json) : arg0_json;
		
		//Declare local instance variables
		let tile_layer_obj = naissance.Feature.instances.filter((v) => v.id === json.feature_id)[0];
		
		//Parse extraneous commands
		//create_tile_layer
		if (json.create_tile_layer)
			if (json.create_tile_layer.id) {
				let new_tile_layer = new naissance.FeatureTileLayer();
				new_tile_layer.id = json.create_tile_layer.id;
				
				if (!json.create_tile_layer.do_not_refresh)
					UI_LeftbarHierarchy.refresh();
			}
		
		//Parse commands for tile_layer_obj
		if (tile_layer_obj instanceof naissance.FeatureTileLayer) {
			//add_options
			if (json.add_options) {
				tile_layer_obj.options = {
					...tile_layer_obj.options,
					...json.add_options
				};
				tile_layer_obj.draw();
			}
			
			//apply_as_base_layer
			if (json.apply_as_base_layer) {
				//Iterate over all naissance.Feature.instances; remove .is_base_layer flag from all instances first
				for (let i = 0; i < naissance.Feature.instances.length; i++)
					if (naissance.Feature.instances[i] instanceof naissance.FeatureTileLayer)
						delete naissance.Feature.instances[i].is_base_layer;
				
				//Replace base layer
				map.removeBaseLayer();
				map.setBaseLayer(tile_layer_obj.layer);
				tile_layer_obj.is_base_layer = true;
				UI_LeftbarHierarchy.refresh();
			}
			
			//set_options
			if (json.set_options) {
				tile_layer_obj.options = json.set_options;
				tile_layer_obj.draw();
			}
		}
	}
};