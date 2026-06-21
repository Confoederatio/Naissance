config.mapmodes.relations = {
	name: "Relations",
	icon: "sync_alt",
	description: "Customisable mapmode for displaying relation types.",
	
	//Robust helper function to parse generic Relation variable: 'add-<id>-<type>'
	//For indirect relations: 'add-indirect-<type>'
	getRelations: (geometry_instance) => {
		if (!geometry_instance || typeof geometry_instance.getRelations !== "function") return [];
		
		let relation_string = geometry_instance.getRelations();
		if (!relation_string || typeof relation_string !== "string") return [];
		
		let relations_list = [];
		let relation_entries = relation_string.split(",");
		
		for (let i = 0; i < relation_entries.length; i++) {
			let relation_segments = relation_entries[i].split("-");
			// Expected format: ["add", "target_id", "relation_type"]
			// We use slice to join the remainder in case relation types have hyphens
			if (relation_segments[0] === "add" && relation_segments.length >= 3) {
				relations_list.push({
					target_id: relation_segments[1],
					relation_type: relation_segments.slice(2).join("-")
				});
			}
		}
		
		return relations_list;
	},
	
	onhide: (v) => {
		setTimeout(() => main.renderer.update());
	},
	
	onshow: (v) => {
		let config_obj = config.mapmodes.relations;
		let map_settings = main.map.settings;
		
		if (!map_settings.relations_mapmode) {
			map_settings.relations_mapmode = {
				selected: "none",
				templates: {}
			};
		}
		
		if (main.interfaces.relations_mapmode) main.interfaces.relations_mapmode.close();
		
		let get_template_options = () => {
			let select_options = { none: { name: "None" } };
			Object.iterate(map_settings.relations_mapmode.templates, (template_id, template_data) =>
				select_options[template_id] = (template_data.name || template_id)
			);
			return select_options;
		};
		
		let create_relation_row = (arg0_data) => {
			let data = (arg0_data) ? arg0_data : {};
			let symbol_data = (data.symbol_object) ? data.symbol_object : {};
			
			return veRawInterface({
				relation_name: veText((data.relation || ""), { name: "Relation Type" }),
				type_select: veSelect({
					bilateral: { name: "Bilateral" },
					indirect: { name: "Indirect" },
					unilateral_from: { name: "Unilateral From" },
					unilateral_to: { name: "Unilateral To" }
				}, {
					name: "Direction",
					selected: (data.type || "bilateral")
				}),
				line_editor: new UI_LineSymbol(symbol_data, {
					name: "Line",
					special_function: (v) => Object.assign(symbol_data, v)
				}),
				poly_editor: new UI_PolygonSymbol(symbol_data, {
					name: "Polygon",
					special_function: (v) => Object.assign(symbol_data, v)
				})
			}, {
				style: {
					alignItems: "flex-start",
					display: "flex",
					flexDirection: "column",
					borderBottom: "1px solid var(--border-color)",
					paddingBottom: "1rem"
				}
			});
		};
		
		let initial_row = create_relation_row();
		let symbol_editor = veList([initial_row], {
			name: "Edit Relation Symbols",
			placeholder: initial_row
		});
		
		let template_name_input = veText("", {
			name: "Template Name",
			onuserchange: (v) => config_obj.template_name = v
		});
		
		let switch_template = veSelect(get_template_options(), {
			name: "Switch Template",
			onuserchange: (v) => {
				map_settings.relations_mapmode.selected = v;
				let selected_template = map_settings.relations_mapmode.templates[v];
				
				if (selected_template) {
					let template_components = [];
					let saved_rules = selected_template.symbol_array;
					
					for (let i = 0; i < saved_rules.length; i++)
						template_components.push(create_relation_row(saved_rules[i]));
					
					symbol_editor.v = template_components;
					template_name_input.v = selected_template.name;
				} else if (v === "none") {
					symbol_editor.v = [create_relation_row()];
					template_name_input.v = "";
				}
				
				//Draw Mapmode
				main.renderer.update();
			},
			selected: map_settings.relations_mapmode.selected
		});
		
		main.interfaces.relations_mapmode = veWindow({
			switch_template,
			template_name: template_name_input,
			symbol_editor,
			update_mapmode: veButton(() => {
				let rule_array = [];
				let editor_rows = symbol_editor.v;
				
				for (let i = 0; i < editor_rows.length; i++) {
					let row_components = editor_rows[i].components_obj;
					//Flatten outputs of both visual editors
					let merged_symbol_object = { ...row_components.line_editor.v, ...row_components.poly_editor.v };
					
					rule_array.push({
						relation: row_components.relation_name.v,
						type: row_components.type_select.v,
						symbol_object: merged_symbol_object
					});
				}
				
				let save_name = template_name_input.v;
				if (save_name) {
					map_settings.relations_mapmode.templates[save_name] = {
						name: save_name,
						symbol_array: rule_array
					};
					map_settings.relations_mapmode.selected = save_name;
					
					switch_template.options.selected = save_name;
					switch_template.v = get_template_options();
					veToast(`Saved relation template: ${save_name}`);
				}
				
				//Draw Mapmode
				main.renderer.update();
			}, { name: "Update Mapmode" })
		}, {
			name: "Relation Mapmode",
			width: "35rem"
		});
		
		if (map_settings.relations_mapmode.selected !== "none")
			switch_template.options.onuserchange(map_settings.relations_mapmode.selected);
	},
	
	symbol_function: (current_geometry) => {
		let config_obj = config.mapmodes.relations;
		let map_settings = main.map.settings;
		
		// 1. Fetch rules robustly from live settings instead of static onshow cache
		let mapmode_settings = map_settings.relations_mapmode;
		if (!mapmode_settings || mapmode_settings.selected === "none") return {};
		
		let active_template = mapmode_settings.templates[mapmode_settings.selected];
		if (!active_template || !active_template.symbol_array) return {};
		
		let symbol_rules = active_template.symbol_array;
		let result_symbol = {};
		
		// 2. Identify the active open geometry while caching rigorously 
		if (!config_obj.viewed_geometry_cache || (config_obj.viewed_geometry_cache.isOpen && !config_obj.viewed_geometry_cache.isOpen("instance"))) {
			config_obj.viewed_geometry_cache = undefined;
			
			let all_geometry_keys = Object.keys(naissance.Geometry.instances);
			for (let i = 0; i < all_geometry_keys.length; i++) {
				let testing_geo = naissance.Geometry.instances[all_geometry_keys[i]];
				if (testing_geo.isOpen && testing_geo.isOpen("instance")) {
					config_obj.viewed_geometry_cache = testing_geo;
					break;
				}
			}
		}
		
		let viewed_geometry = config_obj.viewed_geometry_cache;
		
		// Exit early if no geometry is viewed, or if rendering the viewed geometry itself
		if (!viewed_geometry || viewed_geometry.id === current_geometry.id) return result_symbol;
		
		let viewed_id_str = String(viewed_geometry.id);
		let current_id_str = String(current_geometry.id);
		
		let viewed_relations = config_obj.getRelations(viewed_geometry);
		let current_relations = config_obj.getRelations(current_geometry);
		
		// 3. Evaluate Relation Rule Directives
		for (let i = 0; i < symbol_rules.length; i++) {
			let rule_meta = symbol_rules[i];
			let target_relation_type = rule_meta.relation;
			let is_rule_match = false;
			
			if (rule_meta.type === "bilateral" || rule_meta.type === "unilateral_from" || rule_meta.type === "unilateral_to") {
				// Ensure string parity across dynamically typed attributes
				let viewed_targets_current = viewed_relations.some((rel) => String(rel.target_id) === current_id_str && rel.relation_type === target_relation_type);
				let current_targets_viewed = current_relations.some((rel) => String(rel.target_id) === viewed_id_str && rel.relation_type === target_relation_type);
				
				if (rule_meta.type === "bilateral") {
					// Inclusive OR: Match if either party designates the other
					is_rule_match = (viewed_targets_current || current_targets_viewed);
				} else if (rule_meta.type === "unilateral_from") {
					// Match if the relation comes FROM the Current country TO the Viewed country
					is_rule_match = current_targets_viewed;
				} else if (rule_meta.type === "unilateral_to") {
					// Match if the relation goes TO the Current country FROM the Viewed country
					is_rule_match = viewed_targets_current;
				}
			} else if (rule_meta.type === "indirect") {
				// Indirect tag checking ensures BOTH geometries share the "indirect" flag and relation type
				let viewed_has_indirect = viewed_relations.some((rel) => rel.target_id === "indirect" && rel.relation_type === target_relation_type);
				let current_has_indirect = current_relations.some((rel) => rel.target_id === "indirect" && rel.relation_type === target_relation_type);
				
				is_rule_match = (viewed_has_indirect && current_has_indirect);
			}
			
			if (is_rule_match)
				result_symbol = { ...result_symbol, ...rule_meta.symbol_object };
		}
		
		return result_symbol;
	}
};