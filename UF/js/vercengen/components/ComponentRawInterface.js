/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 * 
 * Raw interface used for creating a container {@link HTMLElement} that encapsulates components underneath it. Additionally destructures any components contained within.
 * - Functional binding: <span color=00ffff>veRawInterface</span>().
 * 
 * ##### Constructor:
 * - `arg0_components_obj`: {@link Object}<{@link ve.Component}>
 * - `arg1_options`: {@link Object}
 *   - `.no_name_element=false`: {@link boolean}
 * 
 * ##### Instance:
 * - `<component_key>`: {@link ve.Component} - Contains any destructured components.
 * - `.components_obj`: {@link Object}<{@link ve.Component}>
 * - `.reserved_keys`: {@link Array}<{@link string}> - Controls what keys are reserved and cannot be destructured.
 * - `.v`: {@link Object}<{@link ve.Component}>
 * 
 * @augments ve.Component
 * @memberof ve.Component
 * @type {ve.RawInterface}
 */
ve.RawInterface = class extends ve.Component {
	constructor (arg0_components_obj, arg1_options) {
		//Convert from parameters
		let components_obj = (arg0_components_obj) ? arg0_components_obj : {};
		let options = (arg1_options) ? arg1_options : {};
			super(options);
			
		//Declare local instance variables
		this.components_obj = components_obj;
		this.element = document.createElement("div");
			this.element.setAttribute("component", "ve-raw-interface");
			this.element.instance = this;
			HTML.setAttributesObject(this.element, options.attributes);
			
		this.options = options;
		
		//Format html_string
		let html_string = [];
		
		if (!this.options.no_name_element)
			html_string.push(`<span id = "name"></span>`);
		this.element.innerHTML = html_string.join("");
		
		//KEEP AT BOTTOM!
		this.name = this.options.name;
		this.reserved_keys = Object.keys(this).concat(["reserved_keys", "v"]);
		this.v = components_obj;
	}
	
	/**
	 * Returns the current {@link this.components_obj}.
	 * - Accessor of: {@link ve.RawInterface}
	 *
	 * @alias v
	 * @memberof ve.Component.ve.RawInterface
	 * @type {{"<component_key>": ve.Component}}
	 */
	get v () {
		//Return statement
		return this.components_obj;
	}
	
	/**
	 * Sets and redraws {@link this.components_obj}.
	 * - Accessor of: {@link ve.RawInterface}
	 *
	 * @alias v
	 * @memberof ve.Component.ve.RawInterface
	 * 
	 * @param {{"<component_key>": ve.Component}} arg0_components_obj
	 */
	set v (arg0_components_obj) {
		//Convert from parameters
		let components_obj = arg0_components_obj;
		
		//Declare local instance variables
		let all_component_els = this.element.querySelectorAll(`[component]`);
		
		//Set this.components_obj; reset this.element by removing all selectors with [component] attributes
		all_component_els.forEach((local_element) => local_element.remove());
		Object.iterate(components_obj, (local_key, local_value) => {
			if (!this.reserved_keys.includes(local_key)) {
				this[local_key] = local_value;
			} else {
				console.warn(`ve.RawInterface: ${local_key} is a reserved key. It can therefore not be set to:`, local_value);
			}
			
			this.element.appendChild(local_value.element);
		});
		if (this.options.onchange) this.options.onchange(this);
	}
};

//Functional binding

/**
 * @returns {ve.RawInterface}
 */
veRawInterface = function () {
	//Return statement
	return new ve.RawInterface(...arguments);
};