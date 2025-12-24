/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 * 
 * Search select/filter component used as a raw interface pool with a searchbar in which users can look up matching items with selected 'data-' attributes.
 * - Functional binding: <span color=00ffff>veSearchSelect</span>().
 * 
 * ##### Constructor:
 * - `arg0_components_obj`: {@link Object}<{@link ve.Component}> - The individual items to append to the current search select field.
 * - `arg1_options`: {@link Object}
 *   - `.display="inline"`: {@link string}
 *   - `.header_components_obj`: {@link Object}>{@link ve.Component}
 *   - `.hide_filter=false`: {@link boolean} - Whether to hide the filter tool.
 *   - `.filter_names`: {@link Object}
 *     - `<attribute_key>`: {@link string}
 *     
 * ##### Instance:
 * - `.components_obj`: {@link Object}<{@link ve.Component}>
 * - `.filters`: {@link Object} - Any filters currently applied to the component.
 *   - `<filter_key>`: true
 * - `.search_value`: {@link string} - The current user search query.
 * - `.v`: {@link this.components_obj} - Accessor. The current components_obj mounted to ve.SearchSelect.
 * 
 * ##### Methods:
 * - <span color=00ffff>{@link ve.SearchSelect.updateSearchFilter|updateSearchFilter}</span>()
 * 
 * @augments ve.Component
 * @memberof ve.Component
 * @type {ve.SearchSelect}
 */
ve.SearchSelect = class extends ve.Component {
	static reserved_keys = ["element", "id", "name"];
	
	constructor (arg0_components_obj, arg1_options) {
		//Convert from parameters
		let components_obj = (arg0_components_obj) ? arg0_components_obj : {};
		let options = (arg1_options) ? arg1_options : {};
			super(options);
			
		//Initialise options
		options.attributes = (options.attributes) ? options.attributes : {};
		options.style = {
			padding: 0,
			...options.style
		};
		
		//Declare local instance variables
		this.element = document.createElement("div");
			this.element.setAttribute("component", "ve-search-select");
			this.element.instance = this;
			HTML.setAttributesObject(this.element, options.attributes);
		this.filters = {};
		this.options = options;
		this.search_value = "";
		
		//Append components_obj to this.element
		this.v = components_obj;
	}
	
	/**
	 * Returns the current {@link this.components_obj}.
	 * - Accessor of: {@link ve.SearchSelect}
	 * 
	 * @alias v
	 * @memberof ve.Component.ve.SearchSelect
	 * @type {ve.Component[]}
	 */
	get v () {
		//Return statement
		return this.components_obj;
	}
	
	/**
	 * Sets the current {@link this.components_obj} displayed in the search select box.
	 * - Accessor of: {@link ve.Hierarchy}
	 * 
	 * @alias v
	 * @memberof ve.Component.ve.SearchSelect
	 * @param arg0_components_obj {ve.Component[]}
	 */
	set v (arg0_components_obj) {
		//Convert from parameters
		let components_obj = arg0_components_obj;
		
		//Reset element; re-append all components in components_obj to element as though it were a ve.RawInterface
		this.components_obj = components_obj;
		this.element.innerHTML = "";
		
		let searchbar_interface = new ve.RawInterface({
			searchbar_icon: new ve.HTML("<icon>search</icon>", { style: { padding: `var(--cell-padding)` } }),
			searchbar_input: new ve.Datalist({}, {
				attributes: {
					placeholder: loc("ve.registry.localisation.Hierarchy_search_for_item")
				},
				name: " ",
				onuserchange: (v) => {
					this.search_value = v;
					this.updateSearchFilter();
					this.fireToBinding();
				}
			}),
			searchbar_filter: new ve.Button(() => {
				//Declare local instance variables
				let all_unique_attributes = [];
				
				//Add checkbox context menu based on data- attributes
				Object.iterate(this.components_obj, (local_key, local_value) => {
					//Iterate over all local_value.element.attributes
					for (let i = 0; i < local_value.element.attributes.length; i++) {
						let local_attribute = local_value.element.attributes[i].nodeName;
						
						if (local_attribute.startsWith("data-"))
							if (!all_unique_attributes.includes(local_attribute))
								all_unique_attributes.push(local_attribute);
					}
				});
				all_unique_attributes.sort();
				
				//Iterate over all_unique_attributes, add to filter context menu
				let checkbox_components_obj = {};
				
				for (let i = 0; i < all_unique_attributes.length; i++) {
					let local_name = all_unique_attributes[i];
						if (this.options?.filter_names)
							if (this.options.filter_names[all_unique_attributes[i]])
								local_name = this.options.filter_names[all_unique_attributes[i]];
					
					checkbox_components_obj[all_unique_attributes[i]] = new ve.Checkbox(this.filters[all_unique_attributes[i]], {
						name: local_name,
						onuserchange: (v) => {
							if (v === true) {
								this.filters[all_unique_attributes[i]] = true;
							} else {
								delete this.filters[all_unique_attributes[i]];
							}
							this.updateSearchFilter();
							this.fireToBinding();
						}
					});
				}
					
				if (all_unique_attributes.length === 0)
					checkbox_components_obj.no_elements_found = new ve.HTML(loc("ve.registry.localisation.SearchSelect_no_elements_found"));
				
				//Open new context menu
				let local_context_menu = new ve.ContextMenu({
					filter_header: new ve.HTML(`<b>${loc("ve.registry.localisation.SearchSelect_search_filter")}</b><br><br>`, { x: 0, y: 0 }),
					...checkbox_components_obj
				}, {
					id: "search_select_filter"
				})
			}, { 
				name: "<icon>filter_alt</icon>",
				tooltip: loc("ve.registry.localisation.SearchSelect_search_filter"),
				style: {
					display: (this.options.hide_filter) ? "none" : "block",
					marginLeft: "auto"
				}
			}),
			...this.options.header_components_obj
		}, {
			name: " ",
			style: {
				...ve.registry.themes["ve-searchbar"],
				...this.options.searchbar_style
			}
		});
		searchbar_interface.bind(this.element);
		
		Object.iterate(this.components_obj, (local_key, local_value) =>
			this.element.appendChild(local_value.element));
		this.fireFromBinding();
	}
	
	/**
	 * Updates the present search filter to be inline with {@link this.filters} and {@link this.search_value}.
	 * - Method of: {@link ve.SearchSelect}
	 * 
	 * @alias updateSearchFilter
	 * @memberof ve.Component.ve.SearchSelect
	 */
	updateSearchFilter () {
		//Declare local instance variables
		let all_search_select_els = [];
			Object.iterate(this.components_obj, (local_key, local_value) =>
				all_search_select_els.push(local_value.element));
		
		//If name and filters are nothing, restore visibility to all hidden results
		if (this.search_value.length === 0 && Object.keys(this.filters).length === 0) {
			for (let i = 0; i < all_search_select_els.length; i++)
				all_search_select_els[i].style.display = (this.options.display) ? this.options.display : "inline";
		} else {
			
			for (let i = 0; i < all_search_select_els.length; i++) {
				let show_element = false;
				
				if (all_search_select_els[i].instance.name.toLowerCase().trim().indexOf(this.search_value.toLowerCase().trim()) !== -1) {
					//Check if element has data- attribute in filters
					let has_valid_attribute = false;
					
					if (Object.keys(this.filters).length === 0) {
						has_valid_attribute = true;
					} else {
						Object.iterate(this.filters, (local_key, local_value) => {
							if (all_search_select_els[i].getAttribute(local_key))
								has_valid_attribute = true;
						});
					}
					
					if (has_valid_attribute)
						show_element = true;
				}
				
				if (show_element || all_search_select_els[i]?.instance?.options?.disabled === true) {
					all_search_select_els[i].style.display = (this.options.display) ? this.options.display : "inline";
				} else {
					all_search_select_els[i].style.display = "none";
				}
			}
		}
	}
};

//Functional binding

/**
 * @returns {ve.SearchSelect}
 */
veSearchSelect = function () {
	//Return statement
	return new ve.SearchSelect(...arguments);
};