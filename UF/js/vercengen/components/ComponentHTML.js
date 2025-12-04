/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 * 
 * Custom component used to encapsulate any HTML that may need to be mounted to Vercengen. Also used for immediate-mode displays.
 * - Functional binding: <span color=00ffff>veHTML</span>().
 * 
 * ##### Constructor:
 * - `arg0_value`: {@link function}|{@link HTMLElement}|{@link string} - If a function, the function must return a string, preferably in closure.
 * - `arg1_options`: {@link Object}
 * 
 * ##### Instance:
 * - `.v`: {@link HTMLElement}
 * 
 * ##### Methods:
 * - <span color=00ffff>{@link ve.HTML.toString|toString}</span>() | {@link string}
 * 
 * @augments ve.Component
 * @augments {@link ve.Component}
 * @class
 * @memberof ve.Component
 * @type {ve.HTML}
 */
ve.HTML = class extends ve.Component {
	static demo_value = (e) => `<b>Test HTML.</b> This is mock text. <kbd>Date:</kbd>${new Date()}`;
	
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = arg0_value;
		let options = (arg1_options) ? arg1_options : {};
			super(options);
			
		//Initialise options
		options.attributes = (options.attributes) ? options.attributes : {};
		
		//Declare local instance variables
		this.element = document.createElement("div");
			this.element.setAttribute("component", "ve-html");
			Object.iterate(options.attributes, (local_key, local_value) => {
				this.element.setAttribute(local_key, local_value.toString());
			});
			this.element.instance = this;
		
		this.options = options;
		this.value = value;
		
		//Set .v
		this.v = this.value;
	}
	
	/**
	 * Returns the current HTMLElement from the component.
	 *
	 * @alias v
	 * @memberof ve.Component.ve.HTML
	 * @type {HTMLElement}
	 * 
	 * @returns {HTMLElement}
	 */
	get v () {
		//Return statement
		return this.element;
	}
	
	/**
	 * Sets the current function/HTMLElement/string for the present HTML component.
	 * - Accessor of: {@link ve.HTML}
	 *
	 * @alias v
	 * @memberof ve.Component.ve.HTML
	 * @type {HTMLElement}
	 * 
	 * @param {function|HTMLElement|string} arg0_value
	 */
	set v (arg0_value) {
		//Convert from parameters
		let value = arg0_value;
		
		//Set value and update UI
		this.value = value;
		if (typeof this.value === "function") {
			if (this.draw_loop) {
				clearInterval(this.draw_loop);
				delete this.draw_loop;
			}
			this.draw_function = this.value;
			
			if (this.options.do_not_refresh !== true) {
				this.v = this.draw_function(this);
				this.draw_loop = setInterval(() => {
					this.v = this.draw_function(this);
				}, 100);
			} else {
				this.v = this.draw_function(this);
			}
		} else if (typeof this.value === "object") {
			this.element.innerHTML = "";
			this.element.appendChild(this.value);
		} else {
			this.element.innerHTML = this.value;
		}
		this.value = this.element;
		this.fireFromBinding();
	}
	
	/**
	 * Returns the string from the present .innerHTML.
	 * - Method of: {@link ve.HTML}
	 *
	 * @alias toString
	 * @memberof ve.Component.ve.HTML
	 * 
	 * @returns {string}
	 */
	toString () {
		return String(this.element.innerHTML);
	}
};

//Functional binding

/**
 * @returns {ve.HTML}
 */
veHTML = function () {
	//Return statement
	return new ve.HTML(...arguments);
};