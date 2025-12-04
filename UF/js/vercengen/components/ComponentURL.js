/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 * 
 * Used to insert a link/URL, typically with an associated WYSIWYG hyperlink for the user to preview.
 * - Functional binding: <span color=00ffff>veURL</span>().
 * 
 * ##### Constructor:
 * - `arg0_value`: {@link string}
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
 * @type {ve.URL}
 */
ve.URL = class extends ve.Component {
	static demo_value = "https://confoederatio.org";
	
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = (arg0_value !== undefined) ? arg0_value : "";
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
			this.element.setAttribute("component", "ve-url");
			this.element.instance = this;
			
		this.options = options;
		this.value = value;
		
		//Format html_string
		let html_string = [];
		html_string.push(`<span id = "name"></span> `);
		html_string.push(`<input type = "url"${HTML.objectToAttributes(attributes)}>`);
		html_string.push(` | <a id = "open-link">Open</a>`)
		
		//Populate element and initialise handlers
		this.element.innerHTML = html_string.join("");
		
		let input_el = this.element.querySelector("input");
		input_el.addEventListener("input", (e) => {
			this.from_binding_fire_silently = true;
			this.v = global.String(e.target.value);
			delete this.from_binding_fire_silently;
			this.fireToBinding();
		});
		this.element.querySelector("#open-link").addEventListener("click", (e) => {
			if (this.value.isURL())
				require("electron").shell.openExternal(this.value);
		});
		this.v = this.value;
	}
	
	/**
	 * Returns the present URL.
	 * - Accessor of: {@link ve.URL}
	 *
	 * @alias v
	 * @memberof ve.Component.ve.UndoRedo
	 * @type {string}
	 * 
	 * @returns {string}
	 */
	get v () {
		//Return statement
		return this.value;
	}
	
	/**
	 * Sets the URL of the present component.
	 * - Accessor of: {@link ve.URL}
	 *
	 * @alias v
	 * @memberof ve.Component.ve.UndoRedo
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
		this.element.querySelector(`#open-link`).setAttribute("valid-url", value.isURL());
		this.fireFromBinding();
	}
};

//Functional binding

/**
 * @returns {ve.URL}
 */
veURL = function () {
	//Return statement
	return new ve.URL(...arguments);
};