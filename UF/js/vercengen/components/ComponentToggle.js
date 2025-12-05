/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 * 
 * Toggle component with HTML labels for on/off switches. Mainly returns a boolean value.
 * - Functional binding: <span color=00ffff>veToggle</span>().
 * 
 * ##### Constructor:
 * - `arg0_value`: {@link boolean}
 * - `arg1_options`: {@link Object}
 *   - `.off_label`: {@link string} - The off label to be displayed after the HTML icon.
 *   - `.off_name`: {@link string} - The off name, including the HTML icon, to be displayed in its off state.
 *   - `.on_label`: {@link string} - The on label to be displayed after the HTML icon.
 *   - `.on_name`: {@link string} - The on name, including the HTML icon, to be displayed in its on state.
 *   - `.name`: {@link string} - If set, this reflects a common label shared between both the off/on states.
 * 
 * ##### Methods:
 * - <span color=00ffff>{@link ve.Toggle.updateName|updateName}</span>()
 * 
 * @augments ve.Component
 * @memberof ve.Component
 * @type {ve.Toggle}
 */
ve.Toggle = class extends ve.Component {
	static demo_value = () => { window.alert("This is an alert from ve.Toggle."); };
	
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = arg0_value;
		let options = (arg1_options) ? arg1_options : {};
			super(options);
			
		//Initialise options
		options.attributes = (options.attributes) ? options.attributes : {};
		if (options.off_name === undefined) options.off_name = `<icon class = "toggle-icon off">toggle_off</icon>${(options.name) ? ` &nbsp; ${(options.off_label) ? options.off_label : options.name}` : ""}`;
		if (options.on_name === undefined) options.on_name = `<icon class = "toggle-icon on">toggle_on</icon>${(options.name) ? ` &nbsp; ${(options.on_label) ? options.on_label : options.name}` : ""}`;
		
		//Declare local instance variables
		this.element = document.createElement("div");
			this.element.setAttribute("component", "ve-toggle");
			this.element.instance = this;
			
		this.options = options;
		this.value = value;
		
		//Format HTML string
		let html_string = [];
		html_string.push(`<span id = "name"></span>`);
		
		//Populate element and initialise handlers
		this.element.innerHTML = html_string.join("");
		
		let toggle_el = this.element.querySelector("#name");
		toggle_el.addEventListener("click", (e) => {
			this.value = (!this.value);
			this.updateName();
			this.fireToBinding();
			e.stopPropagation();
		});
		this.name = options.on_name;
		if (options.name) this.name = options.name;
		this.v = this.value;
	}
	
	/**
	 * Returns the current boolean value.
	 * - Accessor of: {@link ve.Toggle}
	 *
	 * @alias v
	 * @memberof ve.Component.ve.Time
	 * @type {boolean}
	 */
	get v () {
		//Return statement
		return this.value;
	}
	
	/**
	 * Sets the current boolean value of the toggle.
	 * - Accessor of: {@link ve.Toggle}
	 *
	 * @alias v
	 * @memberof ve.Component.ve.Time
	 * 
	 * @param {boolean} arg0_value
	 */
	set v (arg0_value) {
		//Convert from parameters
		let value = arg0_value;
		
		//Set value and update UI
		this.value = value;
		this.updateName();
		this.fireFromBinding();
	}
	
	/**
	 * Internal helper function. Updates the present name based on the boolean state of the toggle.
	 * - Method of: {@link ve.Toggle}
	 *
	 * @alias updateName
	 * @memberof ve.Component.ve.Time
	 */
	updateName () {
		//Set new this.name
		this.name = (this.v) ? this.options.on_name : this.options.off_name;
	}
};

//Functional binding

/**
 * @returns {ve.Toggle}
 */
veToggle = function () {
	//Return statement
	return new ve.Toggle(...arguments);
};