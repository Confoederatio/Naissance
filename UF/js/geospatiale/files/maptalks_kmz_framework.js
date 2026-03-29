if (!global.Geospatiale) 
	global.Geospatiale = {};

/**
 * Handles GeoKMZ/KML files for Maptalks and allows them to be rendered.
 * 
 * @type {Geospatiale.maptalks_GeoKMZ}
 */
Geospatiale.maptalks_GeoKMZ = class {
	constructor (arg0_kmz_file, arg1_options) {
		//Convert from parameters
		let kmz_file = arg0_kmz_file;
		let options = (arg1_options) ? arg1_options : {};
		
		//Declare local instance variables
		this.leaflet_html = document.createElement("div");
		this.map = L.map(this.leaflet_html);
		this.options = options;
		
		//Load KMZ
		this.geometries_obj = {};
		this.layer = new maptalks.VectorLayer(kmz_file);
		
		//Populate this.kmz
		if (kmz_file) this.loadKMZ(kmz_file, {
			window_options: {
				width: "25rem",
			},
			...options
		});
	}
	
	/**
	 * Adds the current GeoKMZ to a Maptalks map.
	 * - Method of: {@link Geospatiale.maptalks_GeoKMZ}
	 * 
	 * @param {maptalks.Map} arg0_map_obj
	 */
	addTo (arg0_map_obj) { try { arg0_map_obj.addLayer(this.layer); } catch (e) {} }
	
	/**
	 * Loads a KMZ into the current collated layer.
	 * - Method of: {@link Geospatiale.maptalks_GeoKMZ}
	 * 
	 * @param {string} arg0_input_file_path
	 * @param {Object} [arg1_options]
	 *  @param {string[]} [arg1_options.exclude_types] - Any types to exclude. Either 'polygon'/'line'/'point'.
	 *  @param {boolean} [arg1_options.do_not_display_popups=false]
	 *  @param {function} [arg1_options.onload] - (arg0_geokmz_obj, arg1_geometries). The method to call once loading is finished.
	 *  @param {Object} [arg1_options.window_options]
	 */
	loadKMZ (arg0_input_file_path, arg1_options) {
		//Convert from parameters
		let input_file_path = arg0_input_file_path;
		let options = (arg1_options) ? arg1_options : {};
		
		//Initialise options
		if (!options.exclude_types) options.exclude_types = [];
		
		//Internal guard clause if KMZ can't be found
		if (!fs.existsSync(input_file_path)) {
			console.warn(`maptalks_GeoKMZ: Could not load ${input_file_path}. File does not exist.`);
			return;
		}
		if (this.geometries_obj[input_file_path]) this.unloadKMZ(input_file_path); //Unload conflicting geometries_obj first
		
		//Declare local instance variables
		this.geometries_obj[input_file_path] = [];
		let geometries = this.geometries_obj[input_file_path];
		let kmz = L.kmzLayer().addTo(this.map);
		
		kmz.load(input_file_path);
		kmz.on("load", (e) => {
			Object.iterate(e.layer._layers, (local_key, local_value) => {
				let geometry_type = Geospatiale.getLeafletGeometryType(local_value);
				
				if (options.exclude_types.length === 0 || !options.exclude_types.includes(geometry_type)) {
					//Check geometry_type
					if (["polygon", "line"].includes(geometry_type)) {
						geometries.push({
							geometry: local_value.toGeoJSON(),
							symbol: Geospatiale.convertLeafletSymbolToMaptalks(local_value.options),
							type: geometry_type
						});
					} else if (geometry_type === "point") {
						let icon_url;
							try { icon_url = local_value.options.iconUrl; } catch (e) {}
						let popup_title;
							try { popup_title = local_value._tooltip._content; } catch (e) {}
						let popup_description;
							try { popup_description = local_value._popup._content; } catch (e) {}
						
						geometries.push({
							geometry: local_value.toGeoJSON(),
							properties: {
								popup_title: popup_title,
								popup_description: popup_description
							},
							symbol: {
								...Geospatiale.convertLeafletSymbolToMaptalks(local_value.options),
								markerFile: icon_url
							},
							type: geometry_type
						});
					}
				}
			});
			
			//Iterate over all geometries and add it to the map
			for (let i = 0; i < geometries.length; i++) { //[WIP] - Use Vercengen popups instead
				let local_geometry = maptalks.GeoJSON.toGeometry(geometries[i].geometry);
				let local_properties = geometries[i].properties;
				
				try {
					if (!options.do_not_display_popups)
						local_geometry.addEventListener("click", (e) => {
							veWindow(local_properties.popup_description, {
								name: (local_properties.popup_title) ? local_properties.popup_title : "",
								width: "20rem",
								...options.window_options
							});
						});
				} catch (e) {}
				local_geometry.updateSymbol(geometries[i].symbol);
				local_geometry.addTo(this.layer);
				
				geometries[i].maptalks_obj = local_geometry;
			}
			
			if (this.options.onload)
				this.options.onload(this, this.geometries_obj[input_file_path]);
			
			//Free memory for kmz
			kmz.clearLayers();
			kmz.remove();
		});
		
	}
	
	/**
	 * Removes the current GeoKMZ from a Maptalks map.
	 * - Method of: {@link Geospatiale.maptalks_GeoKMZ}
	 */
	remove () {
		Object.iterate(this.geometries_obj, (local_key, local_value) => 
			this.unloadKMZ(local_key));
	}
	
	/**
	 * Removes the KMZ from the given Maptalks map if possible.
	 * - Method of: {@link Geospatiale.maptalks_GeoKMZ}
	 * 
	 * @param {maptalks.Map} arg0_map_obj
	 */
	removeFrom (arg0_map_obj) { try { arg0_map_obj.removeLayer(this.layer); } catch (e) {} }
	
	/**
	 * Unloads the given GeoKMZ given an input path.
	 * - Method of: {@link Geospatiale.maptalks_GeoKMZ}
	 * 
	 * @param {string} arg0_input_file_path
	 */
	unloadKMZ (arg0_input_file_path) {
		//Convert from parameters
		let input_file_path = arg0_input_file_path;
		
		//Internal guard clause if KMZ isn't in cache
		if (!this.geometries_obj[input_file_path]) return;
		
		//Declare local instance variables
		let geometries = this.geometries_obj[input_file_path];
		
		//Iterate over all geometries and unload it
		for (let i = 0; i < geometries.length; i++)
			geometries[i].maptalks_obj.remove(this.layer);
		delete this.geometries_obj[input_file_path];
	}
};