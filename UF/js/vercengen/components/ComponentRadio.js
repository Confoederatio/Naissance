/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 * 
 * Mutually exclusive radio input with a specific reserved namespace. Consider using {@link ve.Checkbox} if you do not intend inputs to be mutually exclusive.
 * - Functional binding: <span color=00ffff>{@link ve.Radio}</span>
 * 
 * ##### Constructor:
 * - `arg0_value`: {@link Object}
 *   - `<radio_group_key>`: {@link Object}
 *     - `<radio_key>`: {@link boolean}
 *   - `<radio_key>`: {@link boolean}
 * - `arg1_options`: {@link Object}
 * 
 * ##### Instance:
 * - `.v`: {@link Object}<{@link boolean}> - Recursive value, the same as `arg0_value`.
 * 
 * ##### Static Fields:
 * - `.instances`: {@link Array}<{@link ve.Radio}>
 *   
 * ##### Static Methods:
 * - <span color=00ffff>{@link ve.Radio.generateHTMLRecursively|generateHTMLRecursively}</span>(arg0_value:{@link Object}<{@link boolean}>, arg1_this:{@link ve.Radio}) | {@link string}
 * 
 * @augments ve.Component
 * @augments {@link ve.Component}
 * @memberof ve.Component
 * @type {ve.Radio}
 */
ve.Radio = class extends ve.Component {
	static demo_value = {
		radio_one: true,
		radio_two: false,
		radio_three: false,
		radio_submenu: {
			radio_four: false,
			radio_five: false
		}
	};
	static instances = [];
	
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = arg0_value;
		let options = (arg1_options) ? arg1_options : {};
			super(options);
			
		//Initialise options
		options.attributes = (options.attributes) ? options.attributes : {};
		
		//Declare local instance variables
		this.element = document.createElement("div");
			this.element.setAttribute("component", "ve-radio");
			this.element.instance = this;
		
		this.id = Class.generateRandomID(ve.Radio);
		this.options = options;
		this.value = value;
		
		//Format html_string
		let html_string = []
		html_string.push(`<legend id = "name"></legend>`);
		html_string.push(`<ul>`);
			if (typeof this.value === "object") {
				html_string.push(...ve.Radio.generateHTMLRecursively(this.value, this));
			} else {
				html_string.push(...ve.Radio.generateHTMLRecursively({ value: this.value }, this));
			}
		html_string.push(`</ul>`);
		
		//Populate element and initialise handlers
		this.element.innerHTML = html_string.join("");
		
		let all_radio_els = this.element.querySelectorAll("input");
		all_radio_els.forEach((el) => el.addEventListener("change", (e) => {
			this.value = this.v;
			this.fireToBinding();
		}));
		ve.Radio.instances.push(this);
		
		this.name = options.name;
		this.v = this.value;
	}
	
	/**
	 * Returns the present value of the checked options.
	 * - Accessor of: {@link ve.Radio}
	 * 
	 * @returns {Object<boolean>}
	 */
	get v () {
		//Declare local instance variables
		return this.element.querySelector(`input[type="radio"]:checked`).id;
	}
	
	/**
	 * Sets the present value of the checked options.
	 * - Accessor of: {@link ve.Radio}
	 * 
	 * @param {Object<boolean>} arg0_value
	 */
	set v (arg0_value) {
		//Convert from parameters
		let value = arg0_value;
		
		//Parse value
		if (typeof value === "boolean") {
			//Set singular checkbox value
			this.value = value;
			this.element.querySelector(`input[type="radio"]`).checked = value;
		} else {
			let traverse = (ul_el, values) => {
				[...ul_el.children].forEach((li_el) => {
					if (li_el.tagName === "LI") {
						let input_el = li_el.querySelector(`input[type="radio"]`);
						if (input_el && input_el.id in values)
							input_el.checked = (!!values[input_el.id]);
					} else if (li_el.tagName === "UL") {
						if (li_el.id && typeof values[li_el.id] === "object")
							traverse(li_el, values[li_el.id]);
					}
				})
			};
			
			let root_ul = this.element.querySelector("ul");
			traverse(root_ul, value);
			this.value = value;
		}
		this.fireFromBinding();
	}
	
	/**
	 * Generates HTML recursively given a current value compatible with the component's initialising `arg0_value`.
	 * - Static method of: {@link ve.Radio}
	 * 
	 * @param {Object<boolean>} arg0_value
	 * @param {ve.Radio} arg1_this
	 * 
	 * @returns {string}
	 */
	static generateHTMLRecursively (arg0_value, arg1_this) {
		//Convert from parameters
		let value = arg0_value;
		let local_this = arg1_this;
		
		//Declare local instance variables
		let html_string = [];
		
		//Iterate over all keys in value
		Object.iterate(value, (local_key, local_value) => {
			if (typeof local_value === "boolean") {
				html_string.push(`<li><input id = "${local_key}" name = "radio-${local_this.id}" type = "radio"${(local_value) ? " checked" : ""}>${(local_key) ? `<label for = "${local_key}">${local_key}</label>` : ""}</li>`);
			} else if (typeof local_value === "object") {
				html_string.push(`<ul id = "${local_key}">`);
					html_string.push(...ve.Radio.generateHTMLRecursively(local_value, local_this));
				html_string.push(`</ul>`);
			}
		});
		
		//Return statement
		return html_string;
	}
};

//Functional binding

/**
 * @returns {ve.Radio}
 */
veRadio = function () {
	//Return statement
	return new ve.Radio(...arguments);
};
