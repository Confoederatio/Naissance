//State mutation functions
{
	/**
	 * Parses a user action inside Naissance. All user actions must be mapped to a valid JSON schema.
	 * @alias DALS.Timeline.parseAction
	 *
	 * @param {string} [arg0_key] - The key to push to the current DALS timeline.
	 * @param {Object[]} [arg1_json] - If no top-level ID is passed, the action is assumed to be global.
	 * @param {boolean} [arg2_do_not_push_action=false]
	 */
	DALS.Timeline.parseAction = async function (arg0_key, arg1_json, arg2_do_not_push_action) {
		//Convert from parameters
		let key = arg0_key;
		let json = (typeof arg1_json === "string") ? JSON.parse(arg1_json) : arg1_json;
		let do_not_push_action = arg2_do_not_push_action;
		
		//Initialise JSON
		if (json === undefined) json = [];
		
		//Allow callers to pass either a raw MVP array or a full action object
		if (!Array.isArray(json) && json.value !== undefined) {
			if (key === undefined)
				key = json.key || json.options?.key;
			
			json = (typeof json.value === "string") ?
				JSON.parse(json.value) : json.value;
		}
		if (json === undefined) json = [];
		if (!Array.isArray(json)) json = [json];
		
		//Declare local instance variables
		let scope_map = naissance.Action.scope_map;
		
		//Iterate over multi-value packet (MVP) and filter it down to superclass single-value packets (SVPs)
		for (let i = 0; i < json.length; i++) {
			//New handling (Actions Palette)
			if (json[i].feature_obj || json[i].geometry_obj || json[i].type) {
				let feature_obj = naissance.Feature.instances[json[i].feature_obj];
				let geometry_obj = naissance.Geometry.instances[json[i].geometry_obj]; 
				let naissance_obj;
				
				if (feature_obj) naissance_obj = feature_obj;
				if (geometry_obj) naissance_obj = geometry_obj;
				
				//Iterate over all scopes and handle their actions
				let scopes = naissance.Action.getScopes((naissance_obj || json[i].type));
				
				for (let x = 0; x < scopes.length; x++) {
					let local_scope_map = scope_map[scopes[x]];
					if (!local_scope_map) continue;
					
					//Iterate over all_scope_keys
					let all_scope_keys = Object.keys(local_scope_map);
					
					for (let y = 0; y < all_scope_keys.length; y++) {
						let local_action = local_scope_map[all_scope_keys[y]];
						
						if (json[i][local_action.key] !== undefined && typeof local_action.special_function === "function")
							await local_action.special_function({
								naissance_obj,
								...json[i]
							});
					}
				}
			} else {
				if (json[i].load_save)
					DALS.fromJSON(json[i].load_save);
				if (json[i].load_savefile)
					DALS.load(json[i].load_savefile);
				if (json[i].set_date) {
					UI_DateMenu.setDate(json[i].set_date);
				} else if (json[i].refresh_date === true) {
					let is_playing = UI_DateMenu.isPlaying();
					
					Object.iterate(naissance.Geometry.instances, (local_key, local_value) =>{
						local_value.draw();
						local_value.update();
					});
					naissance.GeometryMedia.syncToDate();
					naissance.Mapmode.draw();
					if (!is_playing) UI_Leftbar.refresh();
				}
			}
		}
		
		//Save action to current timeline if needed
		if (!do_not_push_action) {
			new DALS.Action({
				options: {
					key: key,
					name: String.formalise(key)
				},
				value: json
			});
			
			//Force all UI_LeftbarHierarchy instances to .refresh()
			UI_Leftbar.refresh();
		}
	};
}

//State save/load functions
{
	DALS.fromJSON = function (arg0_json) {
		//Convert from parameters
		let json = (arg0_json) ? arg0_json : {};
		if (typeof json === "string") json = JSON.parse(json);
		
		//0. Clear map
		console.log(`DALS.fromJSON called.`);
		{
			//Clear _layers
			main._layers.province_layers = [];
			if (main._layers.provinces)
				main._layers.provinces.clear();
			
			//Clear geometries
			Object.iterate(naissance.Geometry.instances, (local_key, local_geometry) => 
				local_geometry.remove());
			
			//Clear scene
			scene.map_component.clear();
			naissance.Feature.instances = {};
			naissance.Geometry.instances = {};
		}
		
		//1. Handle main map
		if (json.map_settings)
			UI_MapSettings.fromJSON(json.map_settings);
		
		//2. Iterate over JSON to load in each class
		Object.iterate(json, (local_key, local_value) => {
			if (local_value.class_name) {
				//2.1. Handle naissance.Geometry classes
				if (local_value.type === "geometry") {
					let geometry_obj = new naissance[local_value.class_name]({ is_import: true });
					
					//ID/History/Metadata deserialisation
					if (local_value.id) geometry_obj.setID(local_value.id);
					geometry_obj.history.fromJSON(local_value.history);
					if (local_value.metadata) geometry_obj.metadata = local_value.metadata;
				}
				//2.2. Handle naissance.Feature classes
				else if (local_value.type === "feature") {
					let feature_obj = new naissance[local_value.class_name](undefined, {
						metadata: local_value.metadata
					});
					
					if (local_value.id) feature_obj.setID(local_value.id);
					if (local_value.is_visible === false) feature_obj._is_visible = false;
					if (local_value.value) feature_obj.json = local_value.value;
				}
			}
		});
		
		//3. Features must be rendered separately
		Object.iterate(naissance.Feature.instances, (local_key, local_feature) => {
			local_feature.fromJSON(local_feature.json);
			try {
				if (local_feature.draw) local_feature.draw();
				if (local_feature._is_visible === false) local_feature.hide();
			} catch (e) { console.warn(e); }
		});
		
		//4. Force all UI_LeftbarHierarchy instances to .refresh()
		setTimeout(() => {
			UI_Leftbar.refresh();
			main.renderer.update(); //Update renderer
		}, 100);
		
		//Reload cursor
		main.layers.cursor_layer.addGeometry(main.brush.cursor);
	};
	
	DALS.toJSON = function () {
		//Declare local instance variables
		let json_obj = {};
		
		//Set json_obj.map_settings
		try {
			if (global.map) json_obj.map_settings = UI_MapSettings.toJSON();
		} catch (e) { console.error(e); }
		
		//Iterate over all naissance.Geometry.instances and serialise them
		Object.iterate(naissance.Geometry.instances, (local_key, local_geometry) => {
			json_obj[local_geometry.id] = {
				id: local_geometry.id,
				class_name: local_geometry.class_name,
				history: local_geometry.history.toJSON(),
				metadata: local_geometry.metadata,
				type: "geometry"
			}
			
			//Visibility is handled via keyframes, so the same sort of handling naissance.Feature needs isn't required
		});
		
		//Iterate over all naissance.Feature.instances and serialise them
		Object.iterate(naissance.Feature.instances, (local_key, local_feature) => {
			json_obj[local_feature.id] = {
				id: local_feature.id,
				class_name: local_feature.class_name,
				metadata: local_feature.metadata,
				type: "feature",
				value: local_feature.toJSON()
			};
			
			let local_json = json_obj[local_feature.id];
			if (!local_feature._is_visible)
				local_json.is_visible = false;
			
			console.log(`Serialised as:`, local_json);
		});
		
		//Return statement
		return json_obj;
	};
}