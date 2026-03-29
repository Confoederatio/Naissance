/**
 * Refer to <span color = "yellow">{@link ve.Feature}</span> for methods or fields inherited from the parent, such as automatic destructuring.
 * 
 * Represents a Tooltip Feature that contains a set of components which are wrapped inside an Interface. This uses a {@link tippy} element.
 * - Functional binding: <span color=00ffff>veTooltip</span>().
 * 
 * ##### Constructor:
 * - `arg0_components_obj`: {@link function}|{@link Object}<{@link ve.Component}>|{@link string}
 * - `arg1_options`: {@link Object}
 *   - `attributes`: {@link Object}<{@link string}>
 *   - `element`: {@link HTMLElement}|{@link string} - The anchor element that ve.Tooltip should be bound to.
 *   - `style`: {@linK Object}<{@link string}>
 *     
 * ##### Instance:
 * - `.anchor_element`: {@link HTMLElement}
 * - `.v`: {@link HTMLElement}
 *     
 * @augments ve.Feature
 * @memberof ve.Feature
 * @type {ve.Tooltip}
 */
ve.Tooltip = class extends ve.Feature {
	constructor (arg0_components_obj, arg1_options) {
		//Convert from parameters
		let components_obj = arg0_components_obj;
		let options = (arg1_options) ? arg1_options : {};
			super(components_obj, options);
		
		//Initialise options
		if (options.element === undefined)
			console.error(`arg1_options.element needs to be defined for ve.Tooltip to work.`);
		
		//Declare local instance variables
		this.anchor_element = (typeof options.element === "string") ? 
			document.querySelector(options.element) : options.element;
		this.element = document.createElement("div");
			this.element.instance = this;
		HTML.setAttributesObject(this.element, (options.attributes) ? options.attributes : {});
		HTML.applyTelestyle(this.element, options.style);
		if (options.theme)
			HTML.applyTelestyle(this.element, ve.registry.themes[options.theme]);
		this.v = components_obj;
		
		//Set tippy tooltip based on element
		this.tippy = tippy(this.anchor_element, { 
			allowHTML: true, 
			appendTo: document.body, 
			content: this.element, 
			interactive: false,
			offset: (options.offset) ? options.offset : [0, 8],
			placement: (options.placement) ? options.placement : "auto"
		});
	}
	
	/**
	 * Returns the element of the current tooltip.
	 * - Method of: {@link ve.Tooltip}
	 * 
	 * @alias v
	 * @memberof ve.Feature.ve.Tooltip
	 * @type {HTMLElement}
	 * 
	 * @returns {HTMLElement}
	 */
	get v () {
		//Return statement
		return this.element;
	}
	
	/**
	 * Sets the value of the current tooltip using a {@link Array}<{@link ve.Component}> type, a string, or a function that returns a string.
	 * - Method of: {@link ve.Tooltip}
	 *
	 * @alias v
	 * @memberof ve.Feature.ve.Tooltip
	 * @type {HTMLElement}
	 * 
	 * @param {function|string|ve.Component[]} arg0_value
	 */
	set v (arg0_value) {
		//Convert from parameters
		let components_obj = arg0_value;
		
		//Reset innerHTML
		this.element.innerHTML = "";
		
		//Append components_obj if possible
		if (typeof components_obj === "function")
			components_obj = components_obj(this); //Fetch return value if possible
		if (typeof components_obj === "object") {
			//Iterate over all components in components_obj
			Object.iterate(components_obj, (local_key, local_value) => {
				this.element.appendChild(local_value.element);
			});
		} else if (typeof components_obj === "string") {
			this.element.innerHTML = components_obj;
		}
	}
	
	/**
	 * Removes any redundant tooltips.
	 * - Static method of: {@link ve.Tooltip}
	 * 
	 * @alias #refresh
	 */
	static refresh () {
		for (let i = ve.Feature.instances.length - 1; i >= 0; i--)
			if (ve.Feature.instances[i] instanceof ve.Tooltip) {
				let local_feature = ve.Feature.instances[i];
				
				if (local_feature.tippy && !document.body.contains(local_feature.tippy.reference)) {
					//1. Destroy the Tippy first
					local_feature.tippy.destroy();
					
					//2. Delete everything inside the feature
					let all_feature_keys = Object.keys(local_feature);
					
					for (let x = 0; x < all_feature_keys.length; x++)
						delete local_feature[all_feature_keys[x]];
					
					//3. Purge it from the .instances array
					ve.Feature.instances.splice(i, 1);
					local_feature = null;
				}
			}
	}
};

//Functional binding

/**
 * @returns {ve.Tooltip}
 */
veTooltip = function () {
	//Return statement
	return new ve.Tooltip(...arguments);
};