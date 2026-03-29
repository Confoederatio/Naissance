/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 *
 * Generic horizontal list input for non-nested lists with reorderable elements, i.e. arrays.
 * - Functional binding: <span color=00ffff>veList</span>().
 *
 * ##### Constructor:
 * - `arg0_value`: {@link Array}<{@link ve.Component}>
 * - `arg1_options`: {@link Object}
 *   - `.do_not_allow_insertion=false`: {@link boolean}
 *   - `.do_not_display_info_button=false`: {@link boolean}
 *   - `.max`: {@link number} - The maximum number of elements in the array.
 *   - `.min=0`: {@link number} - The minimum number of elements in the array.
 *   - `.ondelete`: {@link function}(arg0_component_obj:{@link ve.Component})
 *   - `.options`: {@link Object} - The `.options` field to pass onto elements in the array.
 *   - `.placeholder`: {@link ve.Component} - An instance used as a template for new items. Required if initialising with an empty array.
 *   - `.split_rows=true`: {@link boolean} - Whether to split item rows onto separate lines.
 *
 * ##### Instance:
 * - `.v`: {@link Array}<{@link ve.Component}>
 *
 * @augments ve.Component
 * @memberof ve.Component
 * @type {ve.List}
 */
ve.List = class extends ve.Component { //[WIP] - Refactor at a later date
	static instances = [];
	
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = (arg0_value !== undefined) ? arg0_value : [];
		let options = (arg1_options) ? arg1_options : {};
		super(options);
		
		//Initialise options
		if (options.split_rows === undefined) options.split_rows = true;
		
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
		
		this.options = options;
		this.shift_positions = 1;
		this.value = Array.toArray(value);
		
		//Update logic for insertion
		if (!options.do_not_allow_insertion) {
			this.add_item_button = new ve.Button(() => {
				this.addItem();
				this.fireToBinding();
			}, { name: "<icon>add</icon>", tooltip: loc("ve.registry.localisation.List_add_item") });
			this.add_item_button.bind(this.element);
			
			//Determine the template component (source)
			let source_component = (options.placeholder) ? options.placeholder : this.value[0];
			
			if (source_component) {
				try {
					//1. Determine Class Name
					if (source_component.class_name) {
						this.class_name = source_component.class_name;
					} else {
						// Fallback: Remove 've' prefix from constructor name (e.g., veText -> Text)
						this.class_name = source_component.constructor.name.replace(/^ve/, "");
					}
					
					//2. Determine Placeholder Value
					this.placeholder = source_component.v;
					
				} catch (e) {
					//Disable button if we fail to resolve template
					console.error(`Class name/Placeholder could not be found for template:`, source_component, e);
					this.add_item_button.hide();
				}
			} else {
				//Empty array and no placeholder option provided, we cannot know what to insert, so we hide the add button.
				this.add_item_button.hide();
			}
			
			this.overlay_window = undefined;
		}
		if (!this.options.do_not_display_info_button) {
			this.info_button = new ve.Button(() => {}, {
				name: "<icon>info</icon>", tooltip: `<kbd>RMB</kbd>: ${loc("ve.registry.localisation.List_info_edit_item")}` 
			});
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
		//Ensure class_name is valid before attempting creation
		if (this.class_name && global[`ve${this.class_name}`]) {
			this.value.push(global[`ve${this.class_name}`](this.placeholder, this.options.options));
			this.draw();
		} else {
			console.error(`ve.List: Cannot add item. Unknown class: ve${this.class_name}`);
		}
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
			let current_component = this.value[i];
			
			//1. Bind to DOM
			current_component.bind(this.components_el);
			current_component.setOwner(this, [this]);
			current_component.element.style.display = "inline";
			
			//2. Define context menu interfaces
			let shift_bar_obj = new ve.RawInterface({
				shift_left_button: new ve.Button(() => {
					let shift_positions = this.shift_positions;
					let new_index = Math.max(i - shift_positions, 0);
					
					this.value = Array.moveElement(this.value, i, new_index);
					this.draw();
					this.fireToBinding();
					// No need to update 'i' as redraw resets loop
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
						"input": { textAlign: "center" }
					}
				}),
				shift_right_button: new ve.Button(() => {
					let shift_positions = this.shift_positions;
					let new_index = Math.min(i + shift_positions, this.value.length - 1);
					
					this.value = Array.moveElement(this.value, i, new_index);
					this.draw();
					this.fireToBinding();
				}, {
					name: "<icon>chevron_right</icon>",
					tooltip: loc("ve.registry.localisation.List_shift_right")
				})
			}, { style: { alignItems: "center", display: "flex", justifyContent: "center" } });
			
			let actions_bar_obj = new ve.RawInterface({
				insert_before_button: new ve.Button(() => {
					if (this.options.max && this.value.length >= this.options.max) {
						veToast(`<icon>warning</icon> ${loc("ve.registry.localisation.List_error_max_items_reached", String.formatNumber(this.options.max))}`);
						return;
					}
					this.value.splice(i, 0, global[`ve${this.class_name}`](this.placeholder));
					this.draw();
					this.fireToBinding();
				}, {
					name: "<icon>first_page</icon>",
					limit: () => (!this.options.do_not_allow_insertion),
					tooltip: loc("ve.registry.localisation.List_insert_item_before")
				}),
				insert_after_button: new ve.Button(() => {
					if (this.options.max && this.value.length >= this.options.max) {
						veToast(`<icon>warning</icon> ${loc("ve.registry.localisation.List_error_max_items_reached", String.formatNumber(this.options.max))}`);
						return;
					}
					this.value.splice(i + 1, 0, global[`ve${this.class_name}`](this.placeholder));
					this.draw();
					this.fireToBinding();
				}, {
					name: "<icon>last_page</icon>",
					limit: () => (!this.options.do_not_allow_insertion),
					tooltip: loc("ve.registry.localisation.List_insert_item_after")
				}),
				delete_button: new ve.Button(() => {
					if (this.options.ondelete !== undefined)
						this.options.ondelete(this.v[i]);
					
					this.deleteItem(i); // This 'i' is now strictly tied to the loop iteration
					if (this.overlay_window) this.overlay_window.close();
					this.fireToBinding();
				}, { name: "<icon>delete</icon>", tooltip: loc("ve.registry.localisation.List_delete_item") }),
			}, { style: { alignItems: "center", display: "flex", justifyContent: "center" } });
			
			let overlay_interface = (this.options.split_rows) ? new ve.Interface({
				shift_bar_obj: shift_bar_obj,
				actions_bar_obj: actions_bar_obj
			}, { is_folder: false }) : new ve.Interface({
				actions_bar_obj: new ve.RawInterface({
					...shift_bar_obj.components_obj,
					...actions_bar_obj.components_obj
				}, { style: { display: "flex" } })
			}, { is_folder: false });
			
			//3. Attach Event Listener Directly to the Component Element
			current_component.element.addEventListener("contextmenu", (e) => {
				e.preventDefault();
				e.stopPropagation(); // Prevents nested lists from opening multiple menus
				
				if (this.overlay_window) this.overlay_window.close();
				this.overlay_window = new ve.Window(overlay_interface, {
					can_rename: false,
					name: loc("ve.registry.localisation.List_edit_item"),
					width: (this.options.split_row) ? "12rem" : "14rem",
					y: (HTML.mouse_y < window.innerHeight/2) ?
						HTML.mouse_y + current_component.element.offsetHeight :
						HTML.mouse_y - current_component.element.offsetHeight
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