/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 * 
 * Generic button used to call a function upon user click. If multiple buttons are to be inline, they may be appended using {@link ve.RawInterface} as a container.
 * 
 * ##### Constructor:
 * - `arg0_value`: {@link function}({@link MouseEvent}) - The function to call upon user click.
 * - `arg1_options`: {@link Object}
 * 
 * ##### Instance:
 * - `.v`: {@link function} - Accessor. The current function stored by the {@link ve.Button} component.
 * 
 * @augments ve.Component
 * @augments {@link ve.Component}
 * @class
 * @memberof ve.Component
 * @type {ve.Button}
 */
ve.Button = class extends ve.Component {
	static demo_value = () => { window.alert("This is an alert from ve.Button."); };
	
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = arg0_value;
		let options = (arg1_options) ? arg1_options : {};
			super(options);
		
		//Initialise options
		options.attributes = (options.attributes) ? options.attributes : {};
		if (options.name === undefined) options.name = "Confirm";
		
		//Declare local instance variables
		this.element = document.createElement("div");
			this.element.setAttribute("component", "ve-button");
			this.element.instance = this;
		this.options = options;
		this.value = value;
		
		//Format HTML string
		let html_string = [];
		html_string.push(`<button ${HTML.objectToAttributes(options.attributes)}>`);
			if (options.icon) html_string.push(`<img src = "${options.icon}">`);
			html_string.push(` <span id = "name" style = "align-items: center; display: flex;"></span>`)
		html_string.push(`</button>`);
		
		//Populate element and initialise handlers
		this.element.innerHTML = html_string.join("");
		
		let button_el = this.element.querySelector("button");
		button_el.addEventListener("click", (e) => {
			if (this.value) this.value(e);
			this.fireToBinding();
		});
		this.name = options.name;
		this.v = this.value;
		
		//Post-value styling
		let name_el = this.element.querySelector(`#name`);
		if (name_el && HTML.getInnerText(name_el).length > 0 && name_el.querySelector("icon"))
			this.name += "&nbsp;&nbsp;";
	}
	
	/**
	 * Returns the function bound to the present button.
	 * - Accessor of: {@link ve.Button}
	 *
	 * @alias v
	 * @memberof ve.Component.ve.Button
	 * @type {function}
	 * 
	 * @returns {function}
	 */
	get v () {
		//Return statement
		return this.value;
	}
	
	/**
	 * Sets the function for the present button.
	 * - Accessor of: {@link ve.Button}
	 *
	 * @alias v
	 * @memberof ve.Component.ve.Button
	 * @type {function}
	 * 
	 * @param {function} arg0_value
	 */
	set v (arg0_value) {
		//Convert from parameters
		let value = arg0_value;
		
		//Set value and update UI
		this.value = value;
		this.fireFromBinding();
	}
};

//Functional binding

/**
 * @returns {ve.Button}
 */
veButton = function () {
	//Return statement
	return new ve.Button(...arguments);
};