/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 * 
 * Flex interface used for partitions within the same window that can be automatically resized by the user, similar to sub-windows. The `.arg1_options.style.flex` attribute of the descendant Component will determine its flex size.
 * - Functional binding: <span color=00ffff>veFlexInterface</span>().
 * 
 * ##### Constructor:
 * - `arg0_value`: {@link Object}
 *   - `<category_key>`: {@link Object}
 *     - `<category_key>`: {@link Object}
 *     - `<component_key>`: {@link ve.Component}
 *       - `.options`: {@link Object}
 *         - `.flex_disabled=false`: {@link boolean}
 *     - `.type="horizontal"` - Either 'horizontal'/'vertical'.
 *   - `.type="horizontal"` - Either 'horizontal'/'vertical'.
 * - `arg1_options`: {@link Object}
 * 
 * ##### Instance:
 * - `<category_key>`: {@link Object}<{@link ve.Component}|{@link Object}>
 * - `<component_key>`: {@link ve.Component}
 * - `.reserved_keys`: {@link Array}<{@link string}> - Controls what keys are reserved and cannot be destructured.
 * - `.v`: {@link Object}
 * - `.value`: {@link Object} - Uses this.value instead of this.components_obj.
 * 
 * ##### Methods:
 * - <span color=00ffff>{@link ve.FlexInterface.handleEvents|handleEvents}</span>()
 * - <span color=00ffff>{@link ve.FlexInterface.handleResize|handleResize}</span>(arg0_e:{@link Event}, arg1_size_property:{@link string}, arg2_position_property:{@link string})
 * 
 * ##### Static Methods:
 * - <span color=00ffff>{@link ve.FlexInterface.generateHTMLRecursively|generateHTMLRecursively}</span>(arg0_root_el:{@link HTMLElement}, arg1_value:{@link Object}, arg2_options:{ flex_disabled:{@link boolean} })
 * 
 * @augments ve.Component
 * @memberof ve.Component
 * @type {ve.FlexInterface}
 */
ve.FlexInterface = class extends ve.Component { //[WIP] - Finish CSS and JS handlers
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = arg0_value;
		let options = (arg1_options) ? arg1_options : {};
			super(options);
		
		//Initialise options
		options.attributes = (options.attributes) ? options.attributes : {};
			
		//Declare local instance variables
		this.element = document.createElement("div");
			this.element.setAttribute("component", "ve-flex-interface");
			HTML.setAttributesObject(this.element, options.attributes);
			this.element.instance = this;
		this.options = options;
		this.value = value;
		
		//Set .v
		this.from_binding_fire_silently = true;
		//KEEP AT BOTTOM!
		this.name = this.options.name;
		this.reserved_keys = Object.keys(this).concat(["reserved_keys", "v"]);
		this.v = this.value;
		
		delete this.from_binding_fire_silently;
	}
	
	/**
	 * Returns the current value of the component.
	 * - Accessor of: {@link ve.FlexInterface}
	 * 
	 * @alias v
	 * @memberof ve.Component.ve.FlexInterface
	 * @type {Object}
	 */
	get v () {
		//Return statement
		return this.value;
	}
	
	/**
	 * Sets the present value of the component.
	 * - Accessor of: {@link ve.FlexInterface}
	 * 
	 * @alias v
	 * @memberof ve.Component.ve.FlexInterface
	 * 
	 * @param {Object} arg0_value
	 */
	set v (arg0_value) {
		//Convert from parameters
		let value = (arg0_value) ? arg0_value : {};
		
		//Set this.value and refresh flex interface
		this.components_obj = this.value;
		this.value = value;
		this.element.innerHTML = "";
		this.element.appendChild(ve.FlexInterface.generateHTMLRecursively(undefined, this.value, {
			type: this.value.type
		}));
		
		//Destructure components
		Object.iterate(this.value, (local_key, local_value) => {
			if (!this.reserved_keys.includes(local_key) && typeof local_value === "object") {
				this[local_key] = local_value;
			} else {
				console.warn(`ve.RawInterface: ${local_key} is a reserved key. It can therefore not be set to:`, local_value);
			}
		});
		
		this.handleEvents();
		this.fireFromBinding();
	}
	
	/**
	 * Handles events for the current component.
	 * - Method of: {@link ve.FlexInterface}
	 *
	 * @alias handleEvents
	 * @memberof ve.Component.ve.FlexInterface
	 */
	handleEvents () {
		this.element.addEventListener("mousedown", (e) => {
			let html = document.querySelector("html");
			let target = e.target;
			let parent = target.parentNode;
			
			if (target.nodeType !== 1 || target.tagName !== "FLEX-RESIZER") return;
			
			let is_horizontal = parent.classList.contains("horizontal");
			let is_vertical = parent.classList.contains("vertical");
			
			if (is_horizontal) {
				target.style.cursor = "col-resize";
				html.style.cursor = "col-resize";
				this.handleResize(e, "width", "pageX");
			} else if (is_vertical) {
				target.style.cursor = "row-resize";
				html.style.cursor = "row-resize";
				this.handleResize(e, "height", "pageY");
			}
		});
	}
	
	/**
	 * Handles a resize event given a MouseDown event type. Internal helper method.
	 * - Method of: {@link ve.FlexInterface}
	 *
	 * @alias handleResize
	 * @memberof ve.Component.ve.FlexInterface
	 *
	 * @param {Event} arg0_e
	 * @param {string} arg1_dimension_property - "width" or "height"
	 * @param {string} arg2_position_property - "pageX" or "pageY"
	 */
	handleResize (arg0_e, arg1_dimension_property, arg2_position_property) {
		//Convert from parameters
		let md = arg0_e;
		let dimension_prop = arg1_dimension_property; // "width" or "height"
		let position_property = arg2_position_property;
		
		//Declare local instance variables
		let r = md.target;
		let parent = r.parentNode;
		let next = r.nextElementSibling;
		let prev = r.previousElementSibling;
		
		if (!prev || !next) return;
		
		//Capture initial state using getBoundingClientRect for sub-pixel accuracy
		let prev_rect = prev.getBoundingClientRect();
		let next_rect = next.getBoundingClientRect();
		let parent_rect = parent.getBoundingClientRect();
		
		let start_prev_size = prev_rect[dimension_prop];
		let start_next_size = next_rect[dimension_prop];
		let parent_total_size = parent_rect[dimension_prop];
		
		let start_position = md[position_property];
		let total_combined_size = start_prev_size + start_next_size;
		
		md.preventDefault();
		
		let _onmousemove = (e) => {
			//Calculate delta from the starting click
			let current_position = e[position_property];
			let d = current_position - start_position;
			
			let new_prev_size = start_prev_size + d;
			let new_next_size = start_next_size - d;
			
			// Constrain boundaries logic
			if (new_prev_size < 0) {
				new_prev_size = 0;
				new_next_size = total_combined_size;
			}
			if (new_next_size < 0) {
				new_next_size = 0;
				new_prev_size = total_combined_size;
			}
			
			/**
			 * Calculate percentage relative to the parent container.
			 * This ensures that when the root element resizes, the partitions scale proportionally.
			 */
			let prev_percentage = (new_prev_size / parent_total_size) * 100;
			let next_percentage = (new_next_size / parent_total_size) * 100;
			
			//Apply styles as percentages
			prev.style.flex = `1 0 ${prev_percentage}%`;
			next.style.flex = `1 0 ${next_percentage}%`;
		};
		
		let _onmouseup = () => {
			let html = document.querySelector('html');
			html.style.cursor = 'default';
			r.style.cursor = (position_property === "pageX") ? "ew-resize" : "ns-resize";
			
			window.removeEventListener("mousemove", _onmousemove);
			window.removeEventListener("mouseup", _onmouseup);
			
			if (typeof this.fireToBinding === "function")
				this.fireToBinding();
		};
		
		window.addEventListener("mousemove", _onmousemove);
		window.addEventListener("mouseup", _onmouseup);
	}
	
	/**
	 * Generates HTML recursively given a current value compatible with the component's initialising `arg0_value` and a root element.
	 * - Static method of: {@link ve.FlexInterface}
	 * 
	 * @alias #generateHTMLRecursively
	 * @memberof ve.Component.ve.FlexInterface
	 * 
	 * @param {HTMLElement|undefined} arg0_root_el
	 * @param {Object} arg1_value
	 * @param {Object} [arg2_options]
	 *  @param {boolean} [arg2_options.flex_disabled=false] - Whether flex resizing is disabled for the given element.
	 * 
	 * @returns {HTMLElement}
	 */
	static generateHTMLRecursively (arg0_root_el, arg1_value, arg2_options) {
		//Convert from parameters
		let root_el = (arg0_root_el) ? arg0_root_el : document.createElement("flex");
		let value = (arg1_value) ? arg1_value : {};
		let options = (arg2_options) ? arg2_options : {};
		
		//Initialise value
		if (!value.type) value.type = "horizontal";
		
		//Modify root_el
		root_el.setAttribute("class", value.type);
		if (getComputedStyle(root_el).getPropertyValue("flex").length === 0)
			root_el.style.flex = "1";
		
		//Iterate over all keys in value
		Object.iterate(value, (local_key, local_value, local_index) => {
			let flex_item_el = document.createElement("flex-item");
				flex_item_el.style.flex = "1";
			let flex_resizer_el = document.createElement("flex-resizer");
			
			if (typeof local_value === "object" && local_key !== "options" && !(local_value instanceof ve.Component)) {
				if (!options.flex_disabled && local_index >= 1)
					root_el.appendChild(flex_resizer_el);
				
				let container_el = ve.FlexInterface.generateHTMLRecursively(undefined, local_value, local_value.options);
					root_el.appendChild(container_el);
			} else if (local_value instanceof ve.Component) {
				if (!options.flex_disabled && local_index >= 1)
					root_el.appendChild(flex_resizer_el);
				
				local_value.bind(flex_item_el);
				flex_item_el.style.flex = Math.returnSafeNumber(parseFloat(local_value?.options?.style?.flex), 1);
				root_el.appendChild(flex_item_el);
			}
		});
		
		//Return statement
		return root_el;
	}
};

//Functional binding

/**
 * @returns {ve.FlexInterface}
 */
veFlexInterface = function () {
	//Return statement
	return new ve.FlexInterface(...arguments);
};