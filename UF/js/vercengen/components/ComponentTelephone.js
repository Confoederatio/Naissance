/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 * 
 * Handles telephone inputs with a basic text field with forced constraints.
 * - Functional binding: <span color=00ffff>veTelephone</span>().
 * 
 * ##### Constructor:
 * - `arg0_value`: {@link string} - The current telephone number stored by the component.
 * - `arg1_options`: {@link Object}
 *   - `.disabled=false`: {@link boolean}
 *   - `.placeholder="+(XX)-000-000-0000"`: {@link string}
 * 
 * ##### Instance:
 * - `.v`: {@link string}
 * 
 * @augments ve.Component
 * @augments {@link ve.Component}
 * @memberof ve.Component
 * @type {ve.Telephone}
 */
ve.Telephone = class extends ve.Component {
	static demo_value = "+1-800-800-8000";
	
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = (arg0_value !== undefined) ? arg0_value : "";
		let options = (arg1_options) ? arg1_options : {};
			super(options);
			
		//Initialise options
		options.attributes = (options.attributes) ? options.attributes : {};
		
		//Declare local instance variables
		let attributes = {
			placeholder: (options.placeholder !== undefined) ? options.placeholder : "+(XX)-000-000-0000",
			readonly: options.disabled,
			...options.attributes
		};
		this.element = document.createElement("div");
			this.element.setAttribute("component", "ve-telephone");
			this.element.instance = this;
		
		this.options = options;
		this.value = value;
		
		//Format HTML string
		let html_string = [];
		html_string.push(`<span id = "name"></span>`);
		html_string.push(`<input type = "tel"${HTML.objectToAttributes(attributes)}>`);
		
		//Populate element and initialise handlers
		this.element.innerHTML = html_string.join("");
		
		let input_el = this.element.querySelector("input");
		input_el.addEventListener("input", (e) => {
			let filtered = e.target.value.replace(/[^0-9()+\-]/g, "");
			
			if (e.target.value !== filtered) e.target.value = filtered;
			this.from_binding_fire_silently = true;
			this.v = global.String(e.target.value);
			delete this.from_binding_fire_silently;
			this.fireToBinding();
		});
		this.v = this.value;
	}
	
	/**
	 * Returns the present telephone number.
	 * - Accessor of: {@link ve.Telephone}
	 * 
	 * @returns {string}
	 */
	get v () {
		//Return statement
		return this.value;
	}
	
	/**
	 * Sets a new telephone number for the given component.
	 * - Accessor of: {@link ve.Telephone}
	 * 
	 * @param arg0_value
	 */
	set v (arg0_value) {
		//Convert from parameters
		let value = arg0_value;
		
		//Set value and update UI
		this.value = value;
		this.element.querySelector("input").value = this.value;
		this.fireFromBinding();
	}
};

//Functional binding

/**
 * @returns {ve.Telephone}
 */
veTelephone = function () {
	//Return statement
	return new ve.Telephone(...arguments);
};