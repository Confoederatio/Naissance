/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 * 
 * Password input for the end user.
 * - Functional binding: <span color=00ffff>vePassword</span>().
 * 
 * ##### Constructor:
 * - `arg0_value`: {@link string} - The password placeholder for the given input.
 * - `arg1_options`: {@link Object}
 *   - `.disabled=false`: {@link boolean}
 * 
 * ##### Instance:
 * - `.v`: {@link string}
 * 
 * @augments ve.Component
 * @augments {@link ve.Component}
 * @class
 * @memberof ve.Component
 * @type {ve.Password}
 */
ve.Password = class extends ve.Component {
	static demo_value = "password";
	
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = arg0_value;
		let options = (arg1_options) ? arg1_options : {};
			super(options);
			
		//Initialise options
		options.attributes = (options.attributes) ? options.attributes : {};
		
		//Declare local instance variables
		let attributes = {
			readonly: options.disabled,
			...options.attributes
		};
		this.element = document.createElement("div");
			this.element.setAttribute("component", "ve-password");
			this.element.instance = this;
		
		this.options = options;
		this.value = value;
		
		//Format HTML string
		let html_string = [];
		html_string.push(`<span id = "name"></span>`);
		html_string.push(`<input type = "password"${HTML.objectToAttributes(attributes)}>`);
		
		//Populate element and initialise handlers
		this.element.innerHTML = html_string.join("");
		
		let input_el = this.element.querySelector("input");
		input_el.addEventListener("input", (e) => {
			this.from_binding_fire_silently = true;
			this.v = global.String(e.target.value);
			delete this.from_binding_fire_silently;
			this.fireToBinding();
		});
		this.v = this.value;
	}
	
	/**
	 * Returns the current password.
	 * - Accessor of: {@link ve.Password}
	 *
	 * @alias v
	 * @memberof ve.Component.ve.Password
	 * @type {string}
	 * 
	 * @returns {string}
	 */
	get v () {
		//Return statement
		return this.value;
	}
	
	/**
	 * Sets the new password for the present component.
	 * - Accessor of: {@link ve.Password}
	 *
	 * @alias v
	 * @memberof ve.Component.ve.Password
	 * @type {string}
	 * 
	 * @param {string} arg0_value
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
vePassword = function () {
	//Return statement
	return new ve.Password(...arguments);
};