/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 * 
 * Represents a number input that can be set by the user.
 * - Functional binding: <span color=00ffff>veNumber</span>().
 * 
 * ##### Constructor:
 * - `arg0_value=0`: {@link Array}<{@link number}>|{@link number}
 * - `arg1_options`: {@link Object}
 *   - `.disabled=false`: {@link boolean}
 *   - `.max`: {@link number}
 *   - `.min`: {@link number}
 *   - `.step`: {@link number}
 * 
 * ##### Instance:
 * - `.v`: {@link number} 
 * 
 * ##### Methods:
 * - <span color=00ffff>{@link ve.Number.toString|toString}</span>() | {@link string}
 * - <span color=00ffff>{@link ve.Number.valueOf|valueOf}</span>() | {@link number}
 * 
 * @augments ve.Component
 * @augments {@link ve.Component}
 * @memberof ve.Component
 * @type {ve.Number}
 */
ve.Number = class extends ve.Component {
	static demo_value = 1;
	
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = (!Array.isArray(arg0_value)) ? Math.returnSafeNumber(arg0_value) : arg0_value;
		let options = (arg1_options) ? arg1_options : {};
			super(options);
		
		//Initialise options
		options.attributes = (options.attributes) ? options.attributes : {};
		
		//Declare local instance variables
		let attributes = {
			readonly: options.disabled,
			max: options.max,
			min: options.min,
			step: options.step,
			...options.attributes
		};
		this.element = document.createElement("div");
			this.element.setAttribute("component", "ve-number");
			this.element.instance = this;
		this.options = options;
		this.value = value;
		
		//Format html_string
		let html_string = [];
		html_string.push(`<span id = "name"></span> `);
		html_string.push(`<input type = "number"${HTML.objectToAttributes(attributes)}>`);
		
		//Populate element and initialise handlers
		this.element.innerHTML = html_string.join("");
		
		let input_el = this.element.querySelector("input");
		input_el.addEventListener("input", (e) => {
			if (this.options.max && e.target.value > this.options.max)
				e.target.value = this.options.max;
			if (this.options.min && e.target.value < this.options.min)
				e.target.value = this.options.min;
			
			this.from_binding_fire_silently = true;
			this.v = global.Number(e.target.value);
			delete this.from_binding_fire_silently;
			this.fireToBinding();
		});
		this.name = options.name;
		this.v = this.value;
	}
	
	/**
	 * Returns the present number stored by the component.
	 * - Accessor of: {@link ve.Number}
	 * 
	 * @returns {number|number[]}
	 */
	get v () {
		if (this.list_component) {
			//Iterate over this.list_component.v to fetch all_values
			let all_values = [];
			
			for (let i = 0; i < this.list_component.v.length; i++)
				all_values.push(this.list_component.v[i].v);
			
			//Return statement
			return all_values;
		} else {
			//Return statement
			return this.value;
		}
	}
	
	/**
	 * Sets the number stored by the component.
	 * - Accessor of: {@link ve.Number}
	 * 
	 * @param {number} arg0_value
	 */
	set v (arg0_value) {
		//Convert from parameters
		let value = arg0_value;
		
		if (Array.isArray(value)) {
			//Populate this.list_component with all_components
			let all_components = [];
			
			for (let i = 0; i < value.length; i++)
				all_components.push(new ve.Number(value[i]));
			this.list_component = new ve.List(all_components, this.options);
			
			//Set value and refresh
			this.value = value;
			this.element.innerHTML = "";
			this.element.appendChild(this.list_component.element);
			this.fireFromBinding();
		} else {
			//Refresh this.element if possible
			if (this.list_component) {
				let temp_component = new ve.Number(value, this.options);
				this.element = temp_component.element;
				delete this.list_component;
			}
			
			//Set value and update UI
			this.value = value;
			this.element.querySelector("input").value = this.value;
			this.fireFromBinding();
		}
	}
	
	/**
	 * Converts the present number to a string.
	 * - Method of: {@link ve.Number}
	 * 
	 * @returns {string}
	 */
	toString () {
		return String(this.value);
	}
	
	/**
	 * Converts the present value to a number.
	 * - Method of: {@link ve.Number}
	 * 
	 * @returns {number}
	 */
	valueOf () {
		return this.value;
	}
};

//Functional binding

/**
 * @returns {ve.Number}
 */
veNumber = function () {
	//Return statement
	return new ve.Number(...arguments);
};