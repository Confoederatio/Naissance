/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 * 
 * Conventional select dropdown that returns the key of the option selected by the end user.
 * - Functional binding: <span color=00ffff>veSelect</span>().
 * 
 * ##### Constructor:
 * - `arg0_value`: {@link Object}
 *   - `<option_key>`: {@link Object|string}
 *     - `.name`: {@link string}
 *     - `.selected`: {@link boolean} - Whether the current option is selected.
 * - `arg1_options`: {@link Object}
 *   - `.disabled=false`: {@link boolean}
 * 
 * ##### Instance:
 * - `.v`: {@link string} - The selected option key. 
 * 
 * ##### Methods:
 * - <span color=00ffff>{@link ve.Select.generateHTML|generateHTML}</span>() | {@link Array}<{@link string}> - Returns the HTML for the present select input.
 * 
 * @augments ve.Component
 * @augments {@link ve.Component}
 * @memberof ve.Component
 * @type {ve.Select}
 */
ve.Select = class veSelect extends ve.Component {
	static demo_value = {
		afghanistan: "Afghanistan",
		albania: {
			name: "Albania",
			selected: true
		},
		algeria: "Algeria",
		andorra: "Andorra"
	};
	static demo_options = {
		onchange: (e) => {
			if (ve.registry.debug_mode)
				console.log(`ve.Select: Changed selection to:`, e);
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
			this.element.setAttribute("component", "ve-select");
			this.element.instance = this;
		
		this.options = options;
		this.value = value;
		
		//Format HTML string
		let html_string = [];
		html_string.push(`<span id = "name"></span>`);
		html_string.push(`<select>`);
			html_string.concat(this.generateHTML());
		html_string.push(`</select>`);
		
		//Populate element and initialise handlers
		this.element.innerHTML = html_string.join("");
		
		let input_el = this.element.querySelector("select");
		input_el.addEventListener("change", (e) => {
			let selected_id = this.element.querySelectorAll("option")[e.target.selectedIndex].id;
			this.from_binding_fire_silently = true;
			this.v = global.String(selected_id);
			delete this.from_binding_fire_silently;
			this.fireToBinding();
		});
		this.v = this.value;
	}
	
	/**
	 * Gets the currently selected key from its `.id`.
	 * - Accessor of: {@link ve.Select}
	 * 
	 * @returns {string}
	 */
	get v () {
		//Return statement
		return this.element.querySelectorAll("option")[
			this.element.querySelector("select").selectedIndex
		].id;
	}
	
	/**
	 * Sets the current selected key value.
	 * - Accessor of: {@link ve.Select}
	 * 
	 * @param {string} arg0_value
	 */
	set v (arg0_value) {
		//Convert from parameters
		let value = arg0_value;
		
		//Declare local instance variables
		if (typeof value === "object") {
			this.value = value;
			this.element.querySelector("select").innerHTML = this.generateHTML().join("");
			Object.iterate(this.value, (local_key, local_value) => {
				if (local_value.selected)
					this.element.querySelector(`option[id="${local_key}"]`).selected = true;
			});
		} else if (typeof value === "string") {
			this.element.querySelector(`option[id="${value}"]`).selected = true;
		}
		this.fireFromBinding();
	}
	
	/**
	 * Returns the HTML string of the present component as an {@link Array}<{@link string}>
	 * 
	 * @returns {string[]}
	 */
	generateHTML () {
		//Declare local instance variables
		let html_string = [];
		
		//Iterate over this.value
		if (typeof this.value === "object")
			Object.iterate(this.value, (local_key, local_value) => {
				if (typeof local_value === "object") {
					html_string.push(`<option id = "${local_key}">${local_value.name}</option>`);
				} else {
					html_string.push(`<option id = "${local_key}">${local_value}</option>`);
				}
			});
		
		//Return statement
		return html_string;
	}
};

//Functional binding

/**
 * @returns {ve.Select}
 */
veSelect = function () {
	//Return statement
	return new ve.Select(...arguments);
};