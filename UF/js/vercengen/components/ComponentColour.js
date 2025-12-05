/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 * 
 * Basic colour input used to fetch [R, G, B] parameters. May also fetch hex value via <span color = 00ffff>getHex</span>().
 * - Functional binding: <span color=00ffff>veColour</span>().
 * 
 * ##### Constructor:
 * - `arg0_value`: {@link Array}<{@link number}, {@link number}, {@link number}>
 * - `arg1_options`: {@link Object}
 * 
 * ##### Instance:
 * - `.v`: {@link Array}<{@link number}, {@link number}, {@link number}> - The R, G, B value of the present Component.
 * 
 * ##### Methods:
 * - <span color=00ffff>{@link ve.Colour.getHex|getHex}</span>() | {@link string} - Returns the hex value of the present R, G, B value.
 * - <span color=00ffff>{@link ve.Colour.toString|toString}</span>() | {@link string} - Returns the R,G,B value as a string.
 * 
 * @augments ve.Component
 * @memberof ve.Component
 * @type {ve.Colour}
 */
ve.Colour = class extends ve.Component {
	static demo_value =  [220, 160, 60];
	
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = (arg0_value) ? arg0_value : [255, 255, 255];
		let options = (arg1_options) ? arg1_options : {};
			super(options);
		
		//Initialise options
		options.attributes = options.attributes ? options.attributes : {};
		if (options.name === undefined) options.name = "Colour";
		
		//Declare local instance variables
		this.element = document.createElement("div");
			this.element.setAttribute("component", "ve-colour");
			this.element.instance = this;
			
		this.options = options;
		this.value = value;
		
		//Format HTML string
		let html_string = [];
		html_string.push(`<span id = "name"></span> `);
		html_string.push(`<input type = "color"${HTML.objectToAttributes(options.attributes)}>`);
		
		//Populate element and initialise handlers; set .instance
		this.element.innerHTML = html_string.join("");
		
		let input_el = this.element.querySelector("input");
		input_el.addEventListener("input", (e) => {
			this.value = e.target.value;
			this.fireToBinding();
		});
		this.name = options.name;
		this.v = this.value;
	}
	
	/**
	 * Returns the current [R, G, B] value.
	 * - Accessor of: {@link ve.Colour}
	 *
	 * @alias v
	 * @memberof ve.Component.ve.Colour
	 * @type {number[]}
	 */
	get v () {
		//Return statement
		return Colour.convertHexToRGB(this.value);
	}
	
	/**
	 * Sets the current [R, G, B] value (although HTML components internally store colour values as hex).
	 * - Accessor of: {@link ve.Colour}
	 *
	 * @alias v
	 * @memberof ve.Component.ve.Colour
	 * 
	 * @param {number[]|string} arg0_value
	 */
	set v (arg0_value) {
		//Convert from parameters
		let value = Colour.convertRGBToHex(arg0_value);
		
		//Set value and update UI
		//console.trace(`Should I fire this.fireFromBinding()?`, !this.from_binding_fire_silently)
		this.value = value;
		this.element.querySelector("input").value = this.value;
		this.fireFromBinding();
	}
	
	/**
	 * Returns the hexadecimal value of {@link ve.Colour} as a string.
	 * - Method of: {@link ve.Colour}
	 *
	 * @alias getHex
	 * @memberof ve.Component.ve.Colour
	 * 
	 * @returns {string}
	 */
	getHex () {
		//console.log(this.v, this.value);
		return Colour.convertRGBToHex(this.value);
	}
	
	/**
	 * Returns the 'R,G,B' value of {@link ve.Colour} as a string.
	 * - Method of: {@link ve.Colour}
	 *
	 * @alias toString
	 * @memberof ve.Component.ve.Colour
	 * 
	 * @returns {string}
	 */
	toString () {
		return this.value.join(",");
	}
};

//Functional binding

/**
 * @returns {ve.Colour}
 */
veColour = function () {
	//Return statement
	return new ve.Colour(...arguments);
};