config.mapmodes.tags = {
	name: "Tags",
	icon: "label",
	description: "Customisable mapmode for different tags and tag groups.",
	
	onhide: (v) => {
		setTimeout(() => main.renderer.update());
	},
	onshow: (v) => {
		//Declare local instance variables
		let config_obj = config.mapmodes.tags;
		let map_settings = main.map.settings;
		
		if (!map_settings.tag_mapmode) map_settings.tag_mapmode = {};
		if (main.interfaces.tag_mapmode) main.interfaces.tag_mapmode.close();
		
		let get_template_options = () => {
			let select_obj = { none: { name: "None" } };
			Object.iterate(map_settings.tag_mapmode, (local_key, local_value) =>
				select_obj[local_key] = (local_value.name || local_key));
			return select_obj;
		};
		
		//Helper to create a new row component for the veList
		let create_symbol_row = (arg0_tags, arg1_colour) => {
			let row_tags = (arg0_tags !== undefined) ? arg0_tags : [""];
			let row_colour = (arg1_colour !== undefined) ? arg1_colour : "#ffffff";
			
			return veRawInterface({
				tags: veText(row_tags, { name: "Tags" }),
				fill_colour: veColour(row_colour, { is_rgba: true })
			}, {
				style: {
					alignItems: "center",
					display: "flex"
				}
			});
		};
		
		//Declare UI variables
		let symbol_editor = veList([], {
			name: "Edit Symbols",
			placeholder: create_symbol_row()
		});
		
		let template_name_input = veText(config_obj.template_name || "", {
			name: "Template Name",
			onuserchange: (v) => config_obj.template_name = v
		});
		
		let switch_template = veSelect(get_template_options(), {
			name: "Switch Template",
			onuserchange: (v) => {
				map_settings.tag_mapmode_selected = v;
				let selected_template = map_settings.tag_mapmode[v];
				
				if (selected_template) {
					let components_array = [];
					let saved_array = selected_template.symbol_array;
					
					for (let i = 0; i < saved_array.length; i++) {
						let new_row = create_symbol_row(
							saved_array[i][0],
							saved_array[i][1].polygonFill
						);
						components_array.push(new_row);
					}
					
					//Update UI and internal state
					symbol_editor.v = components_array;
					template_name_input.v = selected_template.name;
					config_obj.template_name = selected_template.name;
					config_obj.symbol_array = saved_array;
				} else if (v === "none") {
					symbol_editor.v = [];
					template_name_input.v = "";
					config_obj.template_name = "";
					config_obj.symbol_array = [];
				}
				
				//Draw Mapmode
				main.renderer.update();
			},
			selected: (map_settings.tag_mapmode_selected) ? map_settings.tag_mapmode_selected : "none"
		});
		
		//Open window
		main.interfaces.tag_mapmode = veWindow({
			switch_template,
			template_name: template_name_input,
			symbol_editor,
			update_mapmode: veButton(() => {
				let symbol_array = [];
				let editor_rows = symbol_editor.v;
				
				//Iterate over editor_rows; extract values from components
				for (let i = 0; i < editor_rows.length; i++) {
					let row_comp = editor_rows[i].components_obj;
					symbol_array.push([row_comp.tags.v, {
						polygonFill: row_comp.fill_colour.getHex(),
						polygonOpacity: 1
					}]);
				}
				
				config_obj.symbol_array = symbol_array;
				
				//Save to map_settings
				if (config_obj.template_name) {
					map_settings.tag_mapmode[config_obj.template_name] = {
						name: config_obj.template_name,
						symbol_array: symbol_array
					};
					
					//Refresh dropdown options and selection
					map_settings.tag_mapmode_selected = config_obj.template_name;
					switch_template.options.selected = config_obj.template_name;
					switch_template.v = get_template_options();
					
					veToast(`Saved tag mapmode as ${config_obj.template_name}.`);
				}
				
				//Draw Mapmode
				main.renderer.update();
			}, { name: "Update Mapmode" })
		}, {
			name: "Tag Mapmode",
			width: "30rem"
		});
		
		//Call onuserchange upon init
		if (map_settings.tag_mapmode_selected && map_settings.tag_mapmode_selected !== "none")
			switch_template.options.onuserchange(map_settings.tag_mapmode_selected);
	},
	symbol_function: (geometry_obj) => {
		//Declare local instance variables
		let local_tags = (geometry_obj?.metadata?.tags) ? geometry_obj.metadata.tags : [];
		let symbol_array = (config.mapmodes.tags.symbol_array || []);
		let symbol_obj = {};
		
		//Iterate over symbol_array and parse it
		for (let i = 0; i < symbol_array.length; i++) {
			//Check if symbol_array[i][0] contains local_tags
			let has_local_tag = false;
			
			for (let x = 0; x < local_tags.length; x++)
				if (symbol_array[i][0].includes(local_tags[x])) {
					has_local_tag = true;
					break;
				}
			
			//Apply symbol if has_local_tag
			if (has_local_tag)
				symbol_obj = { ...symbol_obj, ...symbol_array[i][1] };
		}
		
		//Return statement
		return symbol_obj;
	}
};