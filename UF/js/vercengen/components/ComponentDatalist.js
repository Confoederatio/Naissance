/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 * 
 * Datalist component, typically a text component with autocomplete suggestions. May sometimes also be used as a primitive for search select.
 * - Functional binding: <span color=00ffff>veDatalist</span>().
 * 
 * ##### Constructor:
 * - `arg0_value`: {@link Object}<{@link string}> - Read-only names are values, internal IDs are keys.
 * - `arg1_options`: {@link Object}
 *   - `.disabled=false`: {@link boolean}
 * 
 * ##### Instance:
 * - `.v`: {@link string} - The current ID selected by the datalist. If no valid ID is found, the raw `.value` of the datalist element is returned.
 * 
 * @augments ve.Component
 * @augments {@link ve.Component}
 * @class
 * @memberof ve.Component
 * @type {ve.Datalist}
 */
ve.Datalist = class extends ve.Component {
	static demo_value = {
		"polygon": "Polygon",
		"line": "Line",
		"point": "Point"
	};
	static demo_options = {
		onchange: (e) => {
			console.log(`ve.Datalist:`, e);
		}
	};
	
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
			this.element.setAttribute("component", "ve-datalist");
			this.element.instance = this;
			this.id = Class.generateRandomID();
		
		this.options = options;
		this.value = value;
		
		//Format HTML string
		let html_string = [];
		html_string.push(`<span id = "name"></span>`);
		
		html_string.push(`<input list = "datalist-${this.id}" type = "text"${HTML.objectToAttributes(attributes)}>`);
		html_string.push(`<datalist id = "datalist-${this.id}">`);
		html_string.push(`</datalist>`);
		
		//Populate element and initialise handlers
		this.element.innerHTML = html_string.join("");
		
		let input_el = this.element.querySelector("input");
		input_el.addEventListener("change", (e) => {
			this.from_binding_fire_silently = true;
			this.v = e.target.value.toString();
			delete this.from_binding_fire_silently;
			this.fireToBinding();
		});
		this.name = options.name;
		this.v = this.value;
	}
	
	/**
	 * Returns the key/ID of the present datalist.
	 * - Accessor of: {@link ve.Datalist}
	 *
	 * @alias v
	 * @memberof ve.Component.ve.Datalist
	 * @type {string}
	 * 
	 * @returns {string}
	 */
	get v () {
		//Declare local instance variables
		let local_value = this.element.querySelector(`input[list="datalist-${this.id}"]`).value;
		
		let local_option = this.element.querySelector(`option[value="${local_value}"`);
		
		//Return statement
		return (local_option) ? local_option.innerHTML : local_value;
	}
	
	/**
	 * Sets the key/ID for the present datalist.
	 * - Accessor of: {@link ve.Datalist}
	 *
	 * @alias v
	 * @memberof ve.Component.ve.Datalist
	 * @type {string}
	 * 
	 * @param {string} arg0_value
	 */
	set v (arg0_value) {
		//Convert from parameters
		let value = arg0_value;
		
		//Declare local instance variables
		let html_string = [];
		
		if (typeof value === "object") {
			//Iterate over all keys in value and assign <option> tags to the datalist
			Object.iterate(value, (local_key, local_value) => {
				if (local_key === "selected") {
					this.element.querySelector(`input[type="text"]`).value = local_value;
				} else {
					html_string.push(`<option value = "${local_value}">${local_key}</option>`);
				}
			});
			this.element.querySelector("datalist").innerHTML = html_string.join("");
		} else if (typeof value === "string") {
			this.element.querySelector(`input[type="text"]`).value = value;
		}
		
		this.value = value;
		this.fireFromBinding();
	}
};

//Functional binding

/**
 * @returns {ve.Datalist}
 */
veDatalist = function () {
	//Return statement
	return new ve.Datalist(...arguments);
};