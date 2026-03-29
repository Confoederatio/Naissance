//Initialise methods
{
	/**
	 * Opens custom node editor window. Can optionally edit an existing node.
	 * - Method of: {@link ve.NodeEditor}
	 *
	 * @alias ve.Component.ve.NodeEditor.prototype.openCustomNodeEditor
	 * @instance
	 * @memberof ve.NodeEditor
	 * @this ve.NodeEditor
	 *
	 * @param {string} arg0_edit_key - Optional. Edits the existing custom node with this key.
	 */
	ve.NodeEditor.prototype.openCustomNodeEditor = function (arg0_edit_key) {
		//Convert from parameters
		let edit_key = arg0_edit_key;
		
		//Declare local instance variables
		let custom_node_window;
		let existing_definition = (edit_key) ?
			this.main.custom_node_types[edit_key] : null;
		let save_custom_node = () => {
			let active_input_nodes = temp_editor.main.nodes.filter(
				(n) => n.value.key === "ve_input",
			);
			let graph_data = temp_editor.v;
			let nodes = graph_data.nodes;
			
			active_input_nodes.sort((a, b) => a.value.coords.y - b.value.coords.y);
			let inputs = active_input_nodes.map((n, i) => {
				let param_name =
					n.constant_values && n.constant_values[0]
						? n.constant_values[0]
						: loc("ve.registry.localisation.NodeEditor_param_default", i + 1);
				let param_type =
					n.constant_values && n.constant_values[1]
						? n.constant_values[1]
						: "any";
				return { name: param_name, type: param_type };
			});
			
			let meta_category = loc("ve.registry.localisation.Forse_category_custom");
			let meta_name = existing_definition ? existing_definition.name : loc("ve.registry.localisation.NodeEditor_new_custom_node");
			let meta_output_type = "any";
			
			let n_cat = nodes.find((n) => n.key === "ve_config_category");
			if (n_cat && n_cat.constant_values[0])
				meta_category = n_cat.constant_values[0];
			
			let n_name = nodes.find((n) => n.key === "ve_config_name");
			if (n_name && n_name.constant_values[0])
				meta_name = n_name.constant_values[0];
			
			let n_out_type = nodes.find((n) => n.key === "ve_config_output_type");
			if (n_out_type && n_out_type.constant_values[0])
				meta_output_type = n_out_type.constant_values[0];
			
			let output_node = nodes.find((n) => n.key === "ve_output");
			if (!output_node) {
				veToast(loc("ve.registry.localisation.NodeEditor_toast_error_missing_output"));
				return;
			}
			
			let node_key =
				edit_key || `custom_${Class.generateRandomID(ve.NodeEditor)}`;
			
			let custom_definition = {
				name: meta_name,
				category: meta_category,
				input_parameters: inputs,
				output_type: meta_output_type,
				options: {
					id: existing_definition
						? existing_definition.options.id
						: Class.generateRandomID(ve.NodeEditorDatatype),
					alluvial_scaling: 1,
					show_alluvial: false,
				},
				subgraph: graph_data,
				special_function: this.createCustomExecutionLogic(graph_data),
			};
			
			this.main.custom_node_types[node_key] = custom_definition;
			this.options.node_types[node_key] = custom_definition;
			
			if (this.toolbox_window) {
				this.toolbox_window.close();
				this.drawToolbox();
			}
			
			custom_node_window.close();
			veToast(
				loc("ve.registry.localisation.NodeEditor_toast_custom_node_success", meta_name, existing_definition ? loc("ve.registry.localisation.NodeEditor_updated") : loc("ve.registry.localisation.NodeEditor_created")),
			);
		};
		let temp_editor = new ve.NodeEditor({ nodes: [] }, {
			category_types: this.options.category_types,
			disable_file_explorer: true,
			node_types: this.options.node_types,
			project_folder: this.options.project_folder,
			show_internal: true,
		});
		let window_contents = new ve.RawInterface({
			editor_panel: new ve.RawInterface({
				editor: temp_editor
			}, {
				style: { height: "calc(100% - 3rem)", width: "100%" }
			}),
			controls: new ve.RawInterface({
				save_btn: new ve.Button(save_custom_node, {
					name: existing_definition ? loc("ve.registry.localisation.NodeEditor_update_custom_node") : loc("ve.registry.localisation.NodeEditor_save_custom_node"),
					style: { width: "100%", height: "100%" },
				}),
			},{
				style: {
					height: "3rem",
					padding: "0.5rem"
				}
			}),
		},{
			style: {
				display: "flex",
				flexDirection: "column",
				height: "100%"
			}
		});
		
		//Open custom_node_window
		custom_node_window = new ve.Window(window_contents, {
			name: (existing_definition) ? loc("ve.registry.localisation.NodeEditor_edit_node", existing_definition.name) : loc("ve.registry.localisation.NodeEditor_create_custom_node"),
			width: "80vw",
			height: "80vh",
			can_rename: false,
		});
		
		//Ensure map is ready and interactive before loading nodes
		setTimeout(() => {
			if (temp_editor.map) {
				temp_editor.map.checkSize();
				//Ensure centre is valid to prevent rendering glitches
				if (existing_definition && existing_definition.subgraph.map_state) {
					temp_editor.map.setCenter(existing_definition.subgraph.map_state.center);
					temp_editor.map.setZoom(existing_definition.subgraph.map_state.zoom);
				}
			}
			
			if (existing_definition && existing_definition.subgraph)
				temp_editor.v = existing_definition.subgraph;
			ve.NodeEditorDatatype.draw(temp_editor);
		}, 100);
	};
}