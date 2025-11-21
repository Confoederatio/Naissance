/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 * 
 * Generic single-line text input without rich text formatting options.
 * - Functional binding: <span color=00ffff>veText</span>().
 * 
 * ##### Constructor:
 * - `arg0_value`: {@link string}
 * - `arg1_options`: {@link Object}
 *   - `.disabled=false`: {@link boolean}
 *   - `.length`: {@link number}
 *   - `.max`: {@link number}
 *   - `.min`: {@link number}
 * 
 * ##### Instance:
 * - `.v`: {@link string}
 * 
 * @augments ve.Component
 * @augments {@link ve.Component}
 * @memberof ve.Component
 * @type {ve.Text}
 */
ve.Text = class extends ve.Component {
	static demo_value = "Lorem ipsum dolor text amet";
	
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = (arg0_value !== undefined) ? arg0_value : "";
		let options = (arg1_options) ? arg1_options : {};
			super(options);
			
		//Initialise options
		options.attributes = (options.attributes) ? options.attributes : {};
		
		//Declare local instance variables
		let attributes = {
			disabled: options.disabled,
			size: options.length,
			maxlength: options.max,
			minlength: options.min,
			...options.attributes
		};
		this.element = document.createElement("div");
			this.element.setAttribute("component", "ve-text");
			this.element.instance = this;
		
		this.options = options;
		this.value = value;
		
		//Format html_string
		let html_string = [];
		html_string.push(`<span id = "name"></span> `);
		html_string.push(`<input type = "text"${HTML.objectToAttributes(attributes)}>`);
		
		//Populate element and initialise handlers
		this.element.innerHTML = html_string.join("");
		
		let input_el = this.element.querySelector("input");
		input_el.addEventListener("change", (e) => {
			this.from_binding_fire_silently = true;
			this.v = global.String(e.target.value);
			delete this.from_binding_fire_silently;
			this.fireToBinding();
		});
		if (options.name) this.name = options.name;
		this.v = this.value;
	}
	
	/**
	 * Returns the current text value.
	 * - Accessor of: {@link ve.Text}
	 * 
	 * @returns {string}
	 */
	get v () {
		//Return statement
		return this.value;
	}
	
	/**
	 * Sets the current text value for the component.
	 * - Accessor of: {@link ve.Text}
	 * 
	 * @param {string} arg0_value
	 */
	set v (arg0_value) {
		//Convert from parameters
		let value = arg0_value;
		if (value === undefined) return;
		
		//Set value and update UI
		if (typeof value === "object")
			console.warn(`ve.Text: The type of value received was not a valid string! Please check to make sure your component key is not the reserved keyword 'name'.`, value);
		
		this.value = value;
		this.element.querySelector("input").value = this.value;
		this.fireFromBinding();
	}
};

//Functional binding

/**
 * @returns {ve.Text}
 */
veText = function () {
	//Return statement
	return new ve.Text(...arguments);
};