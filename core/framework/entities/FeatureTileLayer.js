if (!global.naissance) global.naissance = {};
/**
 * @type {naissance.FeatureTileLayer}
 */
naissance.FeatureTileLayer = class extends naissance.Feature {
	static tilemap_presets = {
		//CARTO
		//Carto Dark
		carto_dark_all: {
			name: "Carto Dark All",
			options: {
				urlTemplate: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
				subdomains: ["a","b","c","d"]
			}
		},
		carto_dark_only_labels: {
			name: "Carto Dark (Only Labels)",
			options: {
				urlTemplate: "https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}.png",
				subdomains: ["a","b","c","d"]
			}
		},
		carto_dark_nolabels: {
			name: "Carto Dark (No Labels)",
			options: {
				urlTemplate: "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png",
				subdomains: ["a","b","c","d"]
			}
		},
		
		//Carto Light
		carto_light_all: {
			name: "Carto Light All",
			options: {
				urlTemplate: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
				subdomains: ["a","b","c","d"]
			}
		},
		carto_light_only_labels: {
			name: "Carto Light (Only Labels)",
			options: {
				urlTemplate: "https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png",
				subdomains: ["a","b","c","d"]
			}
		},
		carto_light_nolabels: {
			name: "Carto Light (No Labels)",
			options: {
				urlTemplate: "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png",
				subdomains: ["a","b","c","d"]
			}
		},
		
		//Carto Voyager
		carto_voyager: {
			name: "Carto Voyager",
			options: {
				urlTemplate: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
				subdomains: ["a","b","c","d"]
			}
		},
		carto_voyager_labels_under: {
			name: "Carto Voyager (Labels Under)",
			options: {
				urlTemplate: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png",
				subdomains: ["a","b","c","d"]
			}
		},
		carto_voyager_only_labels: {
			name: "Carto Voyager (Only Labels)",
			options: {
				urlTemplate: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}.png",
				subdomains: ["a","b","c","d"]
			}
		},
		carto_voyager_nolabels: {
			name: "Carto Voyager (No Labels)",
			options: {
				urlTemplate: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}.png",
				subdomains: ["a","b","c","d"]
			}
		},
		
		//ESRI
		esri_satellite: {
			name: "ESRI Satellite",
			options: {
				urlTemplate: "https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.jpg",
				subdomains: ["a", "b", "c"]
			}
		},
		
		//Google
		google_maps_road: {
			name: "Google Maps (Road)",
			options: {
				urlTemplate: "https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}",
				subdomains: ["a", "b", "c"]
			}
		},
		google_maps_roads: {
			name: "Google Maps (Roads)",
			options: {
				urlTemplate: "https://mt1.google.com/vt/lyrs=h&x={x}&y={y}&z={z}",
				subdomains: ["a", "b", "c"]
			}
		},
		google_maps_satellite: {
			name: "Google Maps (Satellite)",
			options: {
				urlTemplate: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
				subdomains: ["a", "b", "c"]
			}
		},
		google_maps_satellite_hybrid: {
			name: "Google Maps (Satellite Hybrid)",
			options: {
				urlTemplate: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
				subdomains: ["a", "b", "c"]
			}
		},
		google_maps_terrain: {
			name: "Google Maps (Terrain)",
			options: {
				urlTemplate: "https://mt1.google.com/vt/lyrs=t&x={x}&y={y}&z={z}",
				subdomains: ["a", "b", "c"]	
			}
		},
		
		//MapTiler
		maptiler_aquarelle: { name: "MapTiler Aquarelle" },
		maptiler_backdrop: { name: "MapTiler Backdrop" },
		maptiler_basic: { name: "MapTiler Basic" },
		maptiler_bright: { name: "MapTiler Bright" },
		maptiler_dataviz: { name: "MapTiler Dataviz" },
		maptiler_landscape: { name: "MapTiler Landscape" },
		maptiler_openstreetmap: { name: "MapTiler OSM" },
		maptiler_ocean: { name: "MapTiler Ocean" },
		maptiler_outdoor: { name: "MapTiler Outdoor" },
		maptiler_satellite: { name: "MapTiler Satellite" },
		maptiler_streets: { name: "MapTiler Streets" },
		maptiler_toner: { name: "MapTiler Toner" },
		maptiler_topo: { name: "MapTiler Topo" },
		maptiler_winter: { name: "MapTiler Winter" },
		
		//OSM
		osm: {
			name: "OSM",
			options: {
				urlTemplate: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
				subdomains: ["a", "b", "c"]
			}
		},
		osm_english: {
			name: "OSM English",
			options: {
				urlTemplate: "https://cdn.lima-labs.com/{z}/{x}/{y}.png?api=demo",
				subdomains: ["a", "b", "c"]
			}
		},
		osm_humanitarian: {
			name: "OSM Humanitarian",
			options: {
				urlTemplate: "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
				subdomains: ["a", "b", "c"]
			}
		},
	}; //[WIP] - Read tilemap_presets from common JSON file in future
	
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
	
	_DALS_recalculatePreset (arg0_preset) {
		//Convert from parameters
		let preset = arg0_preset;
		
		//Declare local instance variables
		let presets_obj = naissance.FeatureTileLayer.tilemap_presets;
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
		this.layer._setOptions(this.options);
		
		try {
			map.removeLayer(this.layer);
			if (this._is_visible)
				map.addLayer(this.layer);
		} catch (e) {}
	}
	
	drawHierarchyDatatype () {
		//Declare local instance variables
		let preset_options = {};
		let presets_obj = naissance.FeatureTileLayer.tilemap_presets;
		
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
			hide_visibility: veButton(() => {
				this.hide();
			}, {
				name: `<icon>visibility</icon>`,
				limit: () => this._is_visible,
				tooltip: "Hide Tile Layer",
				style: {
					marginLeft: "auto", order: 99, padding: 0,
					"button": {
						marginLeft: "1rem"
					}
				}
			}),
			show_visibility: veButton(() => {
				this.show();
			}, {
				name: "<icon>visibility_off</icon>",
				limit: () =>  !this._is_visible,
				tooltip: "Show Tile Layer",
				style: {
					marginLeft: "auto", order: 99, padding: 0,
					"button": {
						marginLeft: "1rem"
					}
				}
			}),
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
					
					apply_as_base_layer: veButton(() => {
						DALS.Timeline.parseAction({
							options: { name: "Apply TileLayer as Base", key: "apply_tile_layer_as_base" },
							value: [{
								type: "FeatureTileLayer",
								feature_id: this.id,
								apply_as_base_layer: true
							}]
						});
					}, { name: "Apply as Base Layer" })
				}, { name: `Edit ${this._name}`, can_rename: false, width: "24rem" });
			}, {
				name: "<icon>more_vert</icon>",
				tooltip: "Edit Tile Layer",
				style: {
					order: 100,
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
		this._name = json.name;
		this.options = json.options;
		
		//Draw call, draw hierarchy datatype
		this.draw();
		this.drawHierarchyDatatype();
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