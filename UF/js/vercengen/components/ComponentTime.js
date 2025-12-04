/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 * 
 * Time input for selecting a given hour/minute. For longer date components with years, see {@link ve.Date} or {@link ve.DateLength} for time durations.
 * - Functional binding: <span color=00ffff>veTime</span>().
 * 
 * ##### Constructor:
 * - `arg0_value`: {hour: {@link number}, minute: {@link number}}
 * - `arg1_options`: {@link Object}
 *   - `.disabled=false`: {@link boolean}
 *   - `.max`: {@link number}
 *   - `.min`: {@link number}
 * 
 * ##### Instance:
 * - `.v`: {hour: {@link number}, minute: {@link number}}
 * 
 * @augments ve.Component
 * @augments {@link ve.Component}
 * @class
 * @memberof ve.Component
 * @type {ve.Time}
 */
ve.Time = class extends ve.Component {
	static demo_value = { hour: 10, minute: 10 };
	
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = (arg0_value !== undefined) ? arg0_value : {
			hour: 0,
			minute: 0
		};
		let options = (arg1_options) ? arg1_options : {};
			super(options);
			
		//Initialise options
		options.attributes = (options.attributes) ? options.attributes : {};
		
		//Declare local instance variables
		let attributes = {
			readonly: options.disabled,
			max: options.max,
			min: options.min,
			...options.attributes
		};
		this.element = document.createElement("div");
			this.element.setAttribute("component", "ve-time");
			this.element.instance = this;
		
		this.options = options;
		this.value = value;
		
		//Format html_string
		let html_string = [];
		html_string.push(`<span id = "name"></span> `);
		html_string.push(`<input type = "time"${HTML.objectToAttributes(attributes)}>`);
		
		//Populate element and initialise handlers
		this.element.innerHTML = html_string.join("");
		
		let input_el = this.element.querySelector("input");
		input_el.addEventListener("input", (e) => {
			let split_value = e.target.value.split(":");
			
			this.from_binding_fire_silently = true;
			this.v = { hour: parseInt(split_value[0]), minute: parseInt(split_value[1]) };
			delete this.from_binding_fire_silently;
			this.fireToBinding();
		});
		this.v = this.value;
	}
	
	/**
	 * Returns the present time value.
	 * - Accessor of: {@link ve.Time}
	 *
	 * @alias v
	 * @memberof ve.Component.ve.Time
	 * @type {{hour: number, minute: number}}
	 * 
	 * @returns {{hour: number, minute: number}}
	 */
	get v () {
		//Declare local instance variables
		let split_value = this.element.querySelector("input").value.split(":");
		
		//Return statement
		return {
			hour: parseInt(split_value[0]),
			minute: parseInt(split_value[1])
		};
	}
	
	/**
	 * Sets the time value for the component.
	 * - Accessor of: {@link ve.Time}
	 *
	 * @alias v
	 * @memberof ve.Component.ve.Time
	 * @type {{hour: number, minute: number}}
	 * 
	 * @param {{hour: number, minute: number}} arg0_value
	 */
	set v (arg0_value) {
		//Convert from parameters
		let value = arg0_value;
		
		//Set value and update UI
		this.value = value;
		this.element.querySelector("input").value = `${value.hour.toString().padStart(2, "0")}:${value.minute.toString().padStart(2, "0")}`;
		this.fireFromBinding();
	}
};

//Functional binding
veTime = function () {
	//Return statement
	return new ve.Time(...arguments);
};