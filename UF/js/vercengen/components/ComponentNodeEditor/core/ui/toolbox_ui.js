//Initialise methods
{
	/**
	 * Draws the toolbox UI and displays it in a {@link ve.Window}.
	 * - Method of: {@link ve.NodeEditor}
	 *
	 * @alias ve.Component.ve.NodeEditor.prototype.drawToolbox
	 * @instance
	 * @memberof ve.NodeEditor
	 * @this ve.NodeEditor
	 */
	ve.NodeEditor.prototype.drawToolbox = function () {
		//Declare local instance variables
		let page_menu_obj = {};
		let unique_categories = [];
		
		//Iterate over all node_types and set their given categories
		Object.iterate(this.options.node_types, (local_key, local_value) => {
			if (typeof local_value !== "object" || !local_value) return; //Internal guard clause if object is not valid
			if (local_value.is_internal && !this.options.show_internal) return; //Internal guard clause for custom nodes depending on subgraph
			
			//Declare local instance variables
			let category = (local_value.category || loc("ve.registry.localisation.NodeEditor_category_uncategorised"));
			if (!unique_categories.includes(category))
				unique_categories.push(category);
		});
		
		if (unique_categories.length === 0)
			unique_categories = [
				loc("ve.registry.localisation.NodeEditor_category_expressions"),
				loc("ve.registry.localisation.NodeEditor_category_filters"),
				loc("ve.registry.localisation.NodeEditor_category_io"),
				loc("ve.registry.localisation.Forse_category_custom")
			];
		if (!this.options.exclude_all) unique_categories.unshift(loc("ve.registry.localisation.NodeEditor_category_all"));
		
		//Iterate over all unique_categories to parse them
		for (let i = 0; i < unique_categories.length; i++) {
			let category_key = unique_categories[i];
			let filter_names_obj = {};
			let local_search_select_obj = {};
			
			//Iterate over all unique_categories and sanitise their names
			for (let x = 0; x < unique_categories.length; x++)
				filter_names_obj[`data-${unique_categories[x]
				.toLowerCase().replace(/[^a-z0-9]/g, "_")}`
					] = unique_categories[x];
			
			//Iterate over all node types and check if they should be appended to the current category
			Object.iterate(this.options.node_types, (local_key, local_value) => {
				if (typeof local_value !== "object" || !local_value) return; //Internal guard clause if object is not valid
				if (local_value.is_internal && !this.options.show_internal) return; //Internal guard clause for subgraph handling
				
				let local_category = (local_value.category || loc("ve.registry.localisation.NodeEditor_category_uncategorised"));
				let local_category_options = (this.options.category_types[local_category] || {});
				
				let local_category_colour = Colour.convertRGBAToHex(
					local_category_options.colour || [255, 255, 255]);
				let local_category_text_colour = Colour.convertRGBAToHex(
					local_category_options.text_colour || [0, 0, 0]);
				
				if (local_category === category_key || category_key === loc("ve.registry.localisation.NodeEditor_category_all")) {
					let toolbox_button = new ve.Button(() => {
						if (local_key === "ve_comment") {
							let comment_window_components = {
								text_input: new ve.Text("", {
									placeholder: loc("ve.registry.localisation.NodeEditor_comment_placeholder"),
								})
							};
							comment_window_components.confirm = new ve.Button(() => {
								let comment_text = comment_window_components.text_input.v;
								
								this.main.nodes.push(new ve.NodeEditorDatatype({
									coords: this._mouse_coords,
									key: local_key,
									display_name: comment_text,
									...local_value,
								}, {
									category_options: local_category_options,
									node_editor: this,
									...local_value.options,
								}));
								if (this.current_comment_window)
									this.current_comment_window.close();
							}, { name: loc("ve.registry.localisation.NodeEditor_button_place_comment") });
							this.current_comment_window = new ve.Window(comment_window_components, {
								name: loc("ve.registry.localisation.NodeEditor_window_add_comment"),
								can_rename: false,
								height: "auto",
								width: "20rem"
							});
							return; //Internal guard clause when comment window is written up
						}
						
						//Push comment node to scene if possible
						this.main.nodes.push(new ve.NodeEditorDatatype({
							coords: this._mouse_coords,
							key: local_key,
							...local_value,
						}, {
							category_options: local_category_options,
							node_editor: this,
							...local_value.options,
						}));
					},{
						attributes: {
							[`data-${local_category.toLowerCase().replace(/[^a-z0-9]/g, "_")}`]: "true",
						},
						name: (local_value.name) ? local_value.name : local_key,
						style: {
							button: {
								backgroundColor: local_category_colour,
								color: local_category_text_colour,
							},
						},
					});
					
					if (local_category === loc("ve.registry.localisation.Forse_category_custom") && this.main.custom_node_types[local_key])
						setTimeout(() => {
							if (toolbox_button.element && !this.options.disable_custom_nodes)
								toolbox_button.element.addEventListener("contextmenu", (e) => {
									e.preventDefault();
									new ve.ContextMenu({
										edit_node: new ve.Button(() => this.openCustomNodeEditor(local_key),{
											name: loc("ve.registry.localisation.NodeEditor_context_edit_node")
										}),
										delete_node: new ve.Button(() => this.deleteCustomNode(local_key), {
											name: loc("ve.registry.localisation.NodeEditor_context_delete_node")
										}),
									}, {
										x: e.clientX,
										y: e.clientY,
									});
								});
						});
					
					local_search_select_obj[local_key] = toolbox_button;
				}
			});
			
			//All/Custom category_key handling
			if ([loc("ve.registry.localisation.NodeEditor_category_all"), loc("ve.registry.localisation.Forse_category_custom")].includes(category_key))
				local_search_select_obj.create_custom = new ve.Button(() => this.openCustomNodeEditor(), {
					name: loc("ve.registry.localisation.NodeEditor_button_create_custom_node"),
					limit: () => (!this.options.disable_custom_nodes),
					style: {
						button: {
							border: "1px dashed var(--body-colour)",
							display: "block",
							marginTop: "var(--padding)",
						},
					},
				});
			
			//Set current category page
			page_menu_obj[category_key] = {
				name: category_key,
				components_obj: {
					search_select: new ve.SearchSelect(local_search_select_obj, {
						hide_filter: category_key !== loc("ve.registry.localisation.NodeEditor_category_all"),
						filter_names: filter_names_obj,
					}),
				},
			};
		}
		
		//Initialise toolbox_window; close if already open
		if (this.toolbox_window) this.toolbox_window.close();
		this.toolbox_window = new ve.PageMenuWindow(page_menu_obj, {
			name: loc("ve.registry.localisation.NodeEditor_window_toolbox"),
			height: "40vh",
			width: "23rem",
			can_rename: false,
		});
	};
}