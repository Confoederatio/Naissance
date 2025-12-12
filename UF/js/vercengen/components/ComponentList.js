/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 * 
 * Generic horizontal list input for non-nested lists with reorderable elements, i.e. arrays.
 * - Functional binding: <span color=00ffff>veList</span>().
 * 
 * ##### Constructor:
 * - `arg0_value`: {@link Array}<{@link ve.Component}>
 * - `arg1_options`: {@link Object}
 *   - `.do_not_display_info_button=false`: {@link boolean}
 *   - `.max`: {@link number} - The maximum number of elements in the array.
 *   - `.min=0`: {@link number} - The minimum number of elements in the array.
 *   - `.options`: {@link Object} - The `.options` field to pass onto elements in the array.
 *   
 * ##### Instance:
 * - `.v`: {@link Array}<{@link ve.Component}>
 * 
 * @augments ve.Component
 * @memberof ve.Component
 * @type {ve.List}
 */
ve.List = class extends ve.Component {
	static instances = [];
	
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = arg0_value;
		let options = (arg1_options) ? arg1_options : {};
			super(options);
		
		//Declare local instance variables
		this.element = document.createElement("div");
			this.element.setAttribute("component", "ve-horizontal-list");
			if (options.attributes)
				Object.iterate(options.attributes, (local_key, local_value) => {
					this.element.setAttribute(local_key, local_value.toString());
				});
			this.element.instance = this;
		this.element.style.alignItems = "center";
			this.element.style.display = "flex";
			
			//Format html_string
			let html_string = [];
			html_string.push(`<span id = "name"></span> `);
			this.element.innerHTML = html_string.join("");
			
			this.components_el = document.createElement("div");
				this.components_el.id = "component-body";
				this.element.appendChild(this.components_el);
			this.add_item_button = new ve.Button(() => {
				this.addItem();
				this.fireToBinding();
			}, { name: "<icon>add</icon>", tooltip: "Add Item" });
			this.add_item_button.bind(this.element);
		this.options = options;
		this.shift_positions = 1;
		this.value = Array.toArray(value);
		
		this.class_name = structuredClone(this.value[0].class_name);
		this.placeholder = structuredClone(this.value[0].v);
		this.overlay_window = undefined;
		
		if (!this.options.do_not_display_info_button) {
			this.info_button = new ve.Button(() => {}, { 
				name: "<icon>info</icon>", tooltip: `<kbd>RMB</kbd>: ${loc("ve.registry.localisation.List_info_edit_item")}` });
			this.info_button.bind(this.element);
		}
		
		//Set this.v to be the inputted ve.Component[]
		if (options.name) this.name = options.name;
		this.v = value;
	}
	
	/**
	 * Returns the current array value.
	 * - Accessor of: {@link ve.List}
	 *
	 * @alias v
	 * @memberof ve.Component.ve.List
	 * @type {ve.Component[]}
	 */
	get v () {
		//Return statement
		return this.value;
	}
	
	/**
	 * Sets the current array value.
	 * - Accessor of: {@link ve.List}
	 *
	 * @alias v
	 * @memberof ve.Component.ve.List
	 * 
	 * @param {ve.Component[]} arg0_value
	 */
	set v (arg0_value) {
		//Convert from parameters
		let value = arg0_value;
		
		//Set value, redraw and fire from binding
		this.value = value;
		this.draw();
		this.fireFromBinding();
	}
	
	/**
	 * Adds an item to the end of the array.
	 * - Method of: {@link ve.List}
	 *
	 * @alias addItem
	 * @memberof ve.Component.ve.List
	 */
	addItem () {
		if (this.options.max && this.value.length >= this.options.max) { //Internal guard clause for this.options.max
			veToast(`<icon>warning</icon> ${loc("ve.registry.localisation.List_error_max_items_reached", String.formatNumber(this.options.max))}`);
			return;
		}
		
		//Push item to end of stack
		this.value.push(global[`ve${this.class_name}`](this.placeholder, this.options.options));
		this.draw();
	}
	
	/**
	 * Deletes an item from the array given its index.
	 * - Method of: {@link ve.List}
	 *
	 * @alias deleteItem
	 * @memberof ve.Component.ve.List
	 * 
	 * @param {number} arg0_index
	 */
	deleteItem (arg0_index) {
		//Convert from parameters
		let index = (arg0_index >= 0) ? arg0_index : this.value.length - 1;
		if (this.value.length === 0) return; //Internal guard clause if there are already no elements in the array
		
		if (this.options.min && this.value.length - 1 < this.options.min) { //Internal guard clause for this.options.min
			veToast(`<icon>warning</icon>  ${loc("ve.registry.localisation.List_error_min_items_reached", String.formatNumber(this.options.min))}`);
			return;
		}
		
		//Delete item at index
		this.value.splice(index, 1);
		this.draw();
	}
	
	/**
	 * Redraws the present array.
	 * - Method of: {@link ve.List}
	 *
	 * @alias draw
	 * @memberof ve.Component.ve.List
	 */
	draw () {
		//Draw .components_el from this.value
		this.components_el.innerHTML = "";
		
		//Iterate over all components in this.value
		for (let i = 0; i < this.value.length; i++) {
			this.value[i].bind(this.components_el);
			this.value[i].element.style.display = "inline";
		}
		
		//Iterate over all_component_els and apply .onclick this.overlay_interface
		let all_component_els = this.components_el.querySelectorAll(`[component]`);
		
		for (let i = 0; i < all_component_els.length; i++) {
			let overlay_interface = new ve.Interface({
				shift_bar: new ve.RawInterface({
					shift_left_button: new ve.Button(() => {
						let shift_positions = overlay_interface.shift_bar.shift_positions.v;
						
						let new_index = Math.max(i - shift_positions, 0);
						
						this.value = Array.moveElement(this.value, i, new_index);
						this.draw();
						this.fireToBinding();
						i = new_index;
					}, {
						name: "<icon>chevron_left</icon>",
						tooltip: loc("ve.registry.localisation.List_shift_left")
					}),
					shift_positions: new ve.Number(this.shift_positions, {
						min: 1,
						name: loc("ve.registry.localisation.List_shift"),
						onuserchange: (v) => this.shift_positions = v,
						style: {
							marginLeft: `calc(var(--padding)*0.5)`,
							marginRight: `calc(var(--padding)*0.5)`,
							whiteSpace: "nowrap",
							"input": {
								textAlign: "center"
							}
						}
					}),
					shift_right_button: new ve.Button(() => {
						let shift_positions = overlay_interface.shift_bar.shift_positions.v;
						
						let new_index = Math.min(i + shift_positions, this.value.length - 1);
						
						this.value = Array.moveElement(this.value, i, new_index);
						this.draw();
						this.fireToBinding();
						i = new_index;
					}, {
						name: "<icon>chevron_right</icon>",
						tooltip: loc("ve.registry.localisation.List_shift_right")
					})
				}, { style: { alignItems: "center", display: "flex", justifyContent: "center" } }),
				actions_bar: new ve.RawInterface({
					insert_before_button: new ve.Button(() => {
						if (this.options.max && this.value.length >= this.options.max) {
							veToast(`<icon>warning</icon> ${loc("ve.registry.localisation.List_error_max_items_reached", String.formatNumber(this.options.max))}`);
							return;
						}
						
						this.value.splice(i, 0, global[`ve${this.class_name}`](this.placeholder));
						this.draw();
						this.fireToBinding();
					}, { name: "<icon>first_page</icon>", tooltip: loc("ve.registry.localisation.List_insert_item_after") }),
					insert_after_button: new ve.Button(() => {
						if (this.options.max && this.value.length >= this.options.max) {
							veToast(`<icon>warning</icon> ${loc("ve.registry.localisation.List_error_max_items_reached", String.formatNumber(this.options.max))}`);
							return;
						}
						
						this.value.splice(i + 1, 0, global[`ve${this.class_name}`](this.placeholder));
						this.draw();
						this.fireToBinding();
					}, { name: "<icon>last_page</icon>", tooltip: loc("ve.registry.localisation.List_insert_item_after") }),
					delete_button: new ve.Button(() => {
						this.deleteItem(i);
						if (this.overlay_window) this.overlay_window.close();
						this.fireToBinding();
					}, { name: "<icon>delete</icon>", tooltip: loc("ve.registry.localisation.List_delete_item") }),
				}, { style: { alignItems: "center", display: "flex", justifyContent: "center" } })
			}, {
				is_folder: false
			});
			
			all_component_els[i].addEventListener("contextmenu", () => {
				if (this.overlay_window) this.overlay_window.close();
				this.overlay_window = new ve.Window(overlay_interface, {
					can_rename: false,
					name: "Edit Item",
					y: HTML.mouse_y + all_component_els[i].offsetHeight
				});
			});
		}
	}
};

//Functional binding

/**
 * @returns {ve.List}
 */
veList  = function () {
	//Return statement
	return new ve.List(...arguments);
};