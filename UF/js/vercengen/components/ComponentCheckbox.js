/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 * 
 * Either used as a toggle (boolean) or more extensively as a nested checkbox list (Object), depending on the type.
 * - Functional binding: <span color=00ffff>veCheckbox</span>().
 * 
 * ##### Constructor:
 * - `arg0_value`: {@link boolean|Object}
 *   - `<checkbox_group_key>`: {@link Object}
 *     - `.name`: {@link string}
 *     - `<checkbox_key>`: {@link boolean}
 *   - `<checkbox_key>`: {@link boolean}
 * - `arg1_options`: {@link Object}
 * 
 * ##### Instance:
 * - `.v`: {@link boolean}|{@link Object} - Equivalent to the `arg0_value` initialiser in structure.
 * 
 * ##### Static Methods:
 * - <span color=00ffff>{@link ve.Checkbox.generateHTMLRecursively}</span>(arg0_value:{@link boolean}|{@link Object}) | {@link Array}<{@link string}>
 * 
 * @augments ve.Component
 * @augments {@link ve.Component}
 * @class
 * @memberof ve.Component
 * @type {ve.Checkbox}
 */
ve.Checkbox = class extends ve.Component {
	static demo_value = {
		checkbox_one: true,
		checkbox_two: false,
		checkbox_three: false,
		checkbox_four: {
			name: "Nested Checkboxes:",
			checkbox_five: true,
			checkbox_six: false
		}
	};
	
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = (arg0_value !== undefined) ? arg0_value : false;
		let options = (arg1_options) ? arg1_options : {};
			super(options);
			
		//Initialise options
		options.attributes = (options.attributes) ? options.attributes : {};
		
		//Declare local instance variables
		this.element = document.createElement("div");
			this.element.setAttribute("component", "ve-checkbox");
			this.element.instance = this;
		
		this.options = options;
		this.value = value;
		
		//Format html_string
		let html_string = [];
		html_string.push(`<div id = "name"></div>`);
		
		if (typeof value === "boolean") {
			html_string.push(`<input type = "checkbox">`);
			this.element.innerHTML = html_string.join("");
			
			this.element.querySelector(`input[type="checkbox"]`).addEventListener("change", (e) => {
				this.fireToBinding();
				this.value = this.v;
				this.from_binding_fire_silently = true;
				this.v = this.value; //Needs to run setter
				this.from_binding_fire_silently = false;
			});
		} else if (typeof value === "object") {
			html_string.push(`<ul>`);
			if (typeof this.value === "object") {
				html_string.push(...ve.Checkbox.generateHTMLRecursively(this.value));
			} else {
				html_string.push(...ve.Checkbox.generateHTMLRecursively({ value: this.value }));
			}
			html_string.push(`</ul>`);
			
			//Populate element and initialise handlers
			this.element.innerHTML = html_string.join("");
			
			let all_checkbox_els = this.element.querySelectorAll("input");
			all_checkbox_els.forEach((el) => el.addEventListener("change", (e) => {
				this.value = this.v;
				this.from_binding_fire_silently = true;
				this.v = this.value; //Needs to run setter
				this.from_binding_fire_silently = false;
				this.fireToBinding();
			}));
		}
		
		this.name = options.name;
		this.v = this.value;
	}
	
	/**
	 * Returns the present ve.Checkbox list value.
	 * - Accessor of {@link ve.Checkbox}
	 *
	 * @alias v
	 * @memberof ve.Component.ve.Checkbox
	 * @type {{"checkbox_key": boolean|{"name": string, "checkbox_key": boolean|Object|string}|string}}
	 * 
	 * @returns {{"checkbox_key": boolean|{"name": string, "checkbox_key": boolean|Object|string}|string}}
	 */
	get v () {
		//Declare local instance variables
		let root_el = this.element.querySelector("ul");
		
		if (!root_el) return this.element.querySelector(`input[type="checkbox"]`).checked; //Internal guard clause for booleans
		
		//Traversal function (recursive) if typeof ve.Checkbox is object
		let traverse = (ul_el) => {
			let local_obj = {};
			
			[...ul_el.children].forEach((li_el) => {
				if (li_el.tagName === "LI") {
					let input_el = li_el.querySelector(`input[type="checkbox"]`);
					if (input_el) local_obj[input_el.id] = input_el.checked;
				} else if (li_el.tagName === "UL") {
					local_obj[li_el.id] = traverse(li_el);
				}
			});
			
			//Return statement
			return local_obj;
		}
		
		//Return statement
		return traverse(root_el);
	}
	
	/**
	 * Sets the present ve.Checkbox list value.
	 * - Accessor of: {@link ve.Checkbox}
	 *
	 * @alias v
	 * @memberof ve.Component.ve.Checkbox
	 * @type {{"checkbox_key": boolean|{"name": string, "checkbox_key": boolean|Object|string}|string}}
	 * 
	 * @param {{"checkbox_key": boolean|{"name": string, "checkbox_key": boolean|Object|string}|string}} arg0_value
	 */
	set v (arg0_value) {
		//Convert from parameters
		let value = (typeof arg0_value !== "undefined") ? arg0_value : false;
		
		//Parse value
		if (typeof value === "boolean") {
			//Set singular checkbox value
			this.value = value;
			this.element.querySelector(`input[type="checkbox"]`).checked = value;
		} else {
			let traverse = (ul_el, values) => {
				[...ul_el.children].forEach((li_el) => {
					if (li_el.tagName === "LI") {
						let input_el = li_el.querySelector(`input[type="checkbox"]`);
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
	 * Generates HTML recursively for a nested checkbox element.
	 * - Static method of: {@link ve.Checkbox}
	 *
	 * @alias #generateHTMLRecursively
	 * @memberof ve.Component.ve.Checkbox
	 * 
	 * @param {{"checkbox_key": boolean|{"name": string, "checkbox_key": boolean|Object|string}|string}} arg0_value
	 * @returns {string[]}
	 */
	static generateHTMLRecursively (arg0_value) {
		//Convert from parameters
		let value = arg0_value;
		
		//Declare local instance variables
		let html_string = [];
		
		//Iterate over all keys in value
		Object.iterate(value, (local_key, local_value) => {
			if (typeof local_value === "boolean") {
				html_string.push(`<li><input id = "${local_key}" type = "checkbox"${(local_value) ? " checked" : ""}>${(local_key) ? `<label for = "${local_key}">${local_key}</label>` : ""}</li>`);
			} else if (typeof local_value === "object") {
				html_string.push(`<ul id = "${local_key}">`);
					html_string.push(...ve.Checkbox.generateHTMLRecursively(local_value));
				html_string.push(`</ul>`);
			} else if (typeof local_value === "string") {
				html_string.push(`<li><b>${local_value}</b></li>`);
			}
		});
		
		//Return statement
		return html_string;
	}
};

//Functional binding

/**
 * @returns {ve.Checkbox}
 */
veCheckbox = function () {
	//Return statement
	return new ve.Checkbox(...arguments);
};