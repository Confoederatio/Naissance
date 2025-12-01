/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 * 
 * Creates a range selector, typically between 0-1 with a 0,01 step. These may be customised in set options.
 * - Functional binding: <span color=00ffff>veRange</span>().
 * 
 * ##### Constructor:
 * - `arg0_value`: {@link number}
 * - `arg1_options`: {@link Object}
 *   - `.disabled=false`: {@link boolean}
 *   - `.max=1`: {@link number}
 *   - `.min=0`: {@link number}
 *   - `.step=0.01`: {@link number}
 * 
 * ##### Instance:
 * - `.v`: {@link number} 
 * 
 * ##### Methods:
 * - <span color=00ffff>{@link ve.Range.toString|toString}</span>() | {@link string}
 * - <span color=00ffff>{@link ve.Range.valueOf|valueOf}</span>() | {@link number}
 * 
 * @augments ve.Component
 * @augments {@link ve.Component}
 * @memberof ve.Component
 * @type {ve.Range}
 */
ve.Range = class extends ve.Component {
	static demo_value = 0.50;
	
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = Math.returnSafeNumber(arg0_value);
		let options = (arg1_options) ? arg1_options : {};
			super(options);
			
		//Initialise options
		options.atributes = (options.attributes) ? options.attributes : {};
		
		//Declare local instance variables
		let attributes = {
			readonly: options.disabled,
			max: (options.max !== undefined) ? options.max : 1,
			min: (options.min !== undefined) ? options.min : 0,
			step: (options.step !== undefined) ? options.step : 0.01,
			...options.attributes
		};
		this.element = document.createElement("div");
			this.element.setAttribute("component", "ve-range");
			this.element.instance = this;
		
		this.options = options;
		this.value = value;
		
		//Format HTML string
		let html_string = [];
		html_string.push(`<span id = "name"></span>`);
		html_string.push(`<input type = "range"${HTML.objectToAttributes(attributes)}>`);
		html_string.push(`<span id = "value-label">${this.value}</span>`);
		
		//Populate element and initialise handlers
		this.element.innerHTML = html_string.join("");
		
		let input_el = this.element.querySelector("input");
		input_el.addEventListener("input", (e) => {
			this.from_binding_fire_silently = true;
			this.v = global.Number(e.target.value);
			delete this.from_binding_fire_silently;
			this.fireToBinding();
		});
		this.name = options.name;
		this.v = this.value;
	}
	
	/**
	 * Returns the number currently selected by the {@link ve.Range}.
	 * - Accessor of: {@link ve.Range}
	 * 
	 * @returns {number}
	 */
	get v () {
		//Return statement
		return this.value;
	}
	
	/**
	 * Sets the number currently selected by {@link ve.Range}
	 * - Accessor of: {@link ve.Range}
	 * 
	 * @param {number} arg0_value
	 */
	set v (arg0_value) {
		//Convert from parameters
		let value = arg0_value;
		
		//Set value and update UI
		this.value = value;
		this.element.querySelector("input").value = this.value;
		this.element.querySelector("#value-label").innerHTML = `${this.value}`;
		this.fireFromBinding();
	}
	
	//Class methods
	
	/**
	 * Converts the present value to a string and returns it.
	 * - Method of: {@link ve.Range}
	 * 
	 * @returns {string}
	 */
	toString () {
		//Return statement
		return String(this.value);
	}
	
	/**
	 * Returns the number stored by the present string.
	 * - Method of: {@link ve.Range}
	 * 
	 * @returns {number}
	 */
	valueOf () {
		//Return statement
		return this.value;
	}
};

//Functional binding

/**
 * @returns {ve.Range}
 */
veRange = function () {
	//Return statement
	return new ve.Range(...arguments);
};