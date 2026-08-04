if (!global.naissance) global.naissance = {};
/**
 * @type {naissance.FeatureTileLayer}
 */
naissance.FeatureTileLayer = class extends naissance.Feature {
	static hierarchy_symbol = {
		icon: "map",
		name: "Tile Layer"
	};
	static options = {
		disable_actions_palette: true
	};
	
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
		DALS.Timeline.parseAction("set_tile_layer_options", [{
			type: "FeatureTileLayer",
			feature_obj: this.id,
			add_options: {
				...options
			}
		}]);
	}
	
	_DALS_applyAsBaseLayer (arg0_do_not_add_to_undo_redo) {
		//Convert from parameters
		let do_not_add_to_undo_redo = arg0_do_not_add_to_undo_redo;
		
		//Fire action
		DALS.Timeline.parseAction("apply_tile_layer_as_base", [{
			feature_obj: this.id,
			apply_as_base_layer: true
		}], do_not_add_to_undo_redo);
	}
	
	_DALS_recalculatePreset (arg0_preset) {
		//Convert from parameters
		let preset = arg0_preset;
		
		//Declare local instance variables
		let presets_obj = config.features.tile_layer.tilemap_presets;
		let preset_obj = presets_obj[preset];
		let resolution = (this.options.resolution && this.options.resolution !== "null") ? 
			this.options.resolution : "";
		
		if (preset.startsWith("maptiler_")) {
			this._DALS_addOptions({
				urlTemplate: `https://api.maptiler.com/maps/${preset.replace("maptiler_", "")}/${resolution}{z}/{x}/{y}.png?key=${this.options.maptiler_key}`
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
			main.layers.group_tile_layers.addTo(map);
			main.layers.group_tile_layers.removeLayer(this.layer);
			if (this._is_visible)
				main.layers.group_tile_layers.addLayer(this.layer);
		} catch (e) {}
	}
	
	drawUI () {
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
		
		//Return statement
		return {
			opacity: veRange(Math.returnSafeNumber(this.layer?.options?.opacity, 0), {
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
				onuserchange: (v) => {
					this.options.resolution = v;
					this._DALS_recalculatePreset(this.options.preset);
				},
				selected: this.options.resolution
			}),
			set_preset: veSelect(preset_options, {
				name: "Tilemap Preset",
				onuserchange: (v) => {
					this.options.preset = v;
					this._DALS_recalculatePreset(this.options.preset);
				}
			}),
			
			advanced_options: veInterface({
				maptiler_key: veText(this.options.maptiler_key, { 
					name: "Maptiler Key",
					onuserchange: (v) => this.options.maptiler_key = v
				}),
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
			
			actions_bar: veRawInterface({
				apply_as_base_layer: veButton(() => this._DALS_applyAsBaseLayer(), { name: "Apply as Base Layer" }),
				debug_tile_layer: veButton(() => {
					window.$feature = this;
					console.log(`Logged debug feature to console as:`, $feature);
					veToast(`Logged debug TileLayer to console.`);
				}, { name: "Debug Tile Layer" })
			})
		};
	}
	
	fromJSON (arg0_json) {
		let json = (typeof arg0_json !== "object") ? JSON.parse(arg0_json) : arg0_json;
		
		this.id = json.id;
		this.is_base_layer = json.is_base_layer;
		this._name = json.name;
		this.options = json.options;
		
		// Re-sync the maptalks layer object with the loaded options
		if (this.layer) {
			this.layer._setOptions(this.options);
			this.layer.setId(this.id);
		} else {
			this.layer = new maptalks.TileLayer(this.id, this.options);
		}
		
		this.draw();
		if (this.is_base_layer) {
			// Delay slightly or ensure map exists before applying base layer
			setTimeout(() => {
				if (global.map) this._DALS_applyAsBaseLayer(true);
			}, 0);
		}
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
		return JSON.stringify({
			id: this.id,
			is_base_layer: this.is_base_layer,
			name: this._name, // Consistently use _name
			options: this.options,
			class_name: this.class_name
		});
	}
};