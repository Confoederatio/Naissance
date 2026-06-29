if (!global.naissance) global.naissance = {};
naissance.Renderer = class extends ve.Class {
	constructor () {
		super();
		
		this.handleEvents();
	}
	
	/**
	 * Handles Render events, particularly for zoom-related visibility.
	 * - Method of: {@link naissance.Renderer}
	 */
	handleEvents () {
		map.on("zoomend", () => {
			//Call this.update() in the correct order
			this.update();
		});
	}
	
	/**
	 * Returns the ordered z-indexes of all Geometries within each Feature based on {@link UI_LeftbarHierarchy}.
	 * - Method of: {@link naissance.Renderer}
	 */
	getRenderingOrder (arg0_entity_obj) {
		//Convert from parameters
		let entity_obj = (arg0_entity_obj) ? arg0_entity_obj : undefined;
		
		//Declare local instance variables
		let rendering_order = [];
		
		//1. Base Hierarchy handling
		if (!entity_obj) {
			//First, collect all top-level features into a temporary static array
			let top_level_features = [];
			Object.iterate(naissance.Feature.instances, (local_key, local_feature) => {
				if (!local_feature.parent) top_level_features.push(local_feature);
			});
			
			//Now, iterate over the static list of top-level features to build the final order
			for (let i = 0; i < top_level_features.length; i++) {
				let local_feature = top_level_features[i];
				
				//Add the feature itself to the order
				rendering_order.push(local_feature);
				//Then, recursively get and concatenate all its descendants
				rendering_order = rendering_order.concat(this.getRenderingOrder(local_feature));
			}
			
			//Iterate over all naissance.Geometry.instances and append top-level ones to the end
			Object.iterate(naissance.Geometry.instances, (local_key, local_geometry) => {
				if (!local_geometry.parent) rendering_order.push(local_geometry);
			});
		}
		//2. naissance.Feature handling (Recursive step)
		else {
			//(Real Groups) naissance.Group, naissance.Layer handling
			if (entity_obj.entities) {
				for (let i = 0; i < entity_obj.entities.length; i++) {
					let local_entity = entity_obj.entities[i];
					
					rendering_order.push(local_entity);
					if (local_entity.entities || local_entity._entities)
						rendering_order = rendering_order.concat(this.getRenderingOrder(local_entity));
				}
			}
			//(Pseudo-Groups) naissance.SketchMap handling
			else if (entity_obj._entities) {
				for (let i = 0; i < entity_obj._entities.length; i++) {
					let local_geometry = entity_obj._entities[i];
					
					rendering_order.push(local_geometry);
				}
			}
		}
		
		//Return statement
		return rendering_order;
	}
	
	/**
	 * Returns a list of all unique timestamps in the current global state.
	 * - Method of: {@link naissance.Renderer}
	 * 
	 * @returns {number[]}
	 */
	getTimestamps () {
		//Declare local instance variables
		let all_timestamps = [];
		
		//Iterate over all naissance.Feature.instances with no .parent
		Object.iterate(naissance.Feature.instances, (local_key, local_feature) => {
			if (!local_feature.parent) 
				all_timestamps = Array.strictUnique(all_timestamps, local_feature.getTimestamps());
		});
		
		//Iterate over all naissance.Geometry.instances with no parent
		Object.iterate(naissance.Geometry.instances, (local_key, local_geometry) => {
			if (!local_geometry.parent) 
				all_timestamps = Array.strictUnique(all_timestamps, local_geometry.history.getTimestamps());
		})
		
		//Return statement
		return all_timestamps.sort((a, b) => a - b);
	}
	
	/**
	 * Draws all Features/Geometries in order by calling their draw function.
	 * - Method of: {@link naissance.Renderer}
	 */
	update () {
		//Declare local instance variables
		let rendering_order = this.getRenderingOrder();
		this.active_symbol_functions = naissance.Mapmode.getActiveSymbolFunctions();
		
		//Iterate over all entities in rendering_order
		for (let i = 0; i < rendering_order.length; i++)
			if (rendering_order[i].draw)
				rendering_order[i].draw();
	}
	
	static getAllTags () {
		//Declare local instance variables
		let all_tags = [];
		
		//Iterate over all naissance.Geometry.instances and fetch their tags
		Object.iterate(naissance.Geometry.instances, (local_key, local_value) => {
			if (local_value?.metadata?.tags)
				all_tags = [...new Set([...all_tags, ...local_value.metadata.tags])];
		});
		
		//Return statement
		return all_tags;
	}
	
	static getDefaultLabelSymbol () {
		//Declare local instance variables
		let map_defines = config.defines.map;
		
		let default_maptalks_label_keys = map_defines.default_maptalks_label_keys;
		let maptalks_label_obj = {};
		
		for (let i = 0; i < default_maptalks_label_keys.length; i++)
			maptalks_label_obj[default_maptalks_label_keys[i]] = map_defines.default_maptalks_symbol[default_maptalks_label_keys[i]];
		
		//Return statement; diff main.settings.default_label_symbol and config.defines.map.default_maptalks_symbol
		return {
			...maptalks_label_obj,
			...main.settings.default_label_symbol
		};
	}
	
	static getDefaultSymbol (arg0_options) {
		//Convert from parameters
		let options = (arg0_options) ? arg0_options : {};
		
		//Initialise options
		if (!options.exclude) options.exclude = [];
		
		//Declare local instance variables
		let map_defines = config.defines.map;
		
		let default_maptalks_symbol = map_defines.default_maptalks_symbol;
		let default_symbol_obj = {
			...((!options.exclude.includes("line")) ? main.settings.default_line_symbol : {}),
			...((!options.exclude.includes("point")) ? main.settings.default_point_symbol : {}),
			...((!options.exclude.includes("polygon")) ? main.settings.default_polygon_symbol : {}),
		};
		
		//Iterate over default_symbol_obj; if same as corresponding default_maptalks_symbol, remove it
		Object.iterate(default_symbol_obj, (local_key, local_value) => {
			if (local_value === default_maptalks_symbol[local_key])
				delete default_symbol_obj[local_key];
		});
		
		//Return statement
		return default_symbol_obj;
	}
	
	static toggleUI () {
		let all_interface_els = document.querySelectorAll(`#ve-overlay > .ve`);
		naissance.Renderer.hide_ui = (!naissance.Renderer.hide_ui);
		
		if (naissance.Renderer.hide_ui) {
			for (let i = 0; i < all_interface_els.length; i++) {
				if (all_interface_els[i].getAttribute("data-do-not-toggle-ui")) continue;
				let local_display = all_interface_els[i].style.display;
				
				if (local_display !== "")
					all_interface_els[i].setAttribute("data-display", JSON.parse(JSON.stringify(all_interface_els[i].style.display)));
				all_interface_els[i].style.display = "none";
			}
		} else {
			for (let i = 0; i < all_interface_els.length; i++) {
				let local_data_display = all_interface_els[i].getAttribute("data-display");
				
				all_interface_els[i].style.display = (local_data_display) ? local_data_display : "";
				all_interface_els[i].removeAttribute("data-display");
			}
		}
	}
};