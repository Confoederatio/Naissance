/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 *
 * Basic colour input used to fetch [R, G, B] parameters. May also fetch hex value via <span color = 00ffff>getHex</span>().
 * - Functional binding: <span color=00ffff>veColour</span>().
 *
 * ##### Constructor:
 * - `arg0_value`: {@link Array}<{@link number}, {@link number}, {@link number}> | {@link string}
 * - `arg1_options`: {@link Object}
 *   - `.is_rgba=false`: {@link boolean} - If true, adds an opacity slider and handles [R, G, B, A] values.
 *
 * ##### Instance:
 * - `.v`: {@link Array}<{@link number}, {@link number}, {@link number}> - The R, G, B (and optional A) value of the present Component.
 *
 * ##### Methods:
 * - <span color=00ffff>{@link ve.Colour.getHex|getHex}</span>() | {@link string} - Returns the hex value of the present R, G, B value.
 * - <span color=00ffff>{@link ve.Colour.toString|toString}</span>() | {@link string} - Returns the R,G,B value as a string.
 *
 * @augments ve.Component
 * @memberof ve.Component
 * @type {ve.Colour}
 */
ve.Colour = class extends ve.Component { //[WIP] - Refactor at a later date
	static demo_value = [220, 160, 60];
	
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let options = (arg1_options) ? arg1_options : {};
		let initial_value = (arg0_value) ? arg0_value : [255, 255, 255];
		super(options);
		
		//Initialise options
		options.attributes = options.attributes ? options.attributes : {};
		if (options.name === undefined) options.name = loc("ve.registry.localisation.Colour_name_default");
		
		//Logic update for RGB/alpha parsing
		let alpha_value = 1;
		let rgb_value = [255, 255, 255];
		
		if (Array.isArray(initial_value)) {
			// Handle Array Input
			if (initial_value.length === 4) {
				//[R, G, B, A]
				rgb_value = [initial_value[0], initial_value[1], initial_value[2]];
				alpha_value = initial_value[3];
				// Auto-enable RGBA mode if 4 values are passed, unless explicitly disabled
				if (options.is_rgba === undefined) options.is_rgba = true;
			} else {
				//[R, G, B]
				rgb_value = initial_value;
			}
		} else if (typeof initial_value === "string") {
			//Handle String Input
			if (initial_value.startsWith("#")) {
				if (initial_value.length > 7) {
					//#RRGGBBAA (8-digit)
					let rgba = Colour.convertHexToRGBA(initial_value);
					rgb_value = [rgba[0], rgba[1], rgba[2]];
					alpha_value = rgba[3];
					if (options.is_rgba === undefined) options.is_rgba = true;
				} else {
					//#RRGGBB (6-digit)
					rgb_value = Colour.convertHexToRGB(initial_value);
				}
			}
		}
		
		//Convert RGB array to #RRGGBB string for the HTML input
		let value = Colour.convertRGBToHex(rgb_value);
		
		//Declare local instance variables
		this.element = document.createElement("div");
		this.element.setAttribute("component", "ve-colour");
		this.element.instance = this;
		
		this.alpha = alpha_value;
		this.options = options;
		this.value = value;
		
		//Format HTML string
		let html_string = [];
		html_string.push(`<span id = "name"></span> `);
		html_string.push(`<input type = "color"${HTML.objectToAttributes(options.attributes)}>`);
		
		//Populate element and initialise handlers
		this.element.innerHTML = html_string.join("");
		
		let input_el = this.element.querySelector("input");
		input_el.value = this.value;
		if (this.options.is_rgba) input_el.style.opacity = this.alpha;
		
		input_el.addEventListener("input", (e) => {
			this.value = e.target.value; // Updates internal hex
			this.fireToBinding();
		});
		
		//RGBA Opacity Slider Logic
		if (this.options.is_rgba) {
			this.opacity_slider = new ve.Range(this.alpha * 100, {
				name: loc("ve.registry.localisation.Colour_opacity_label"),
				min: 0,
				max: 100,
				step: 1,
				style: {
					display: "inline",
					marginLeft: "0.5rem"
				},
				onuserchange: (v) => {
					this.alpha = v / 100;
					this.element.querySelector(`input[type="color"]`).style.opacity = this.alpha;
					this.fireToBinding();
				},
			});
			this.element.appendChild(this.opacity_slider.element);
		}
		
		this.name = options.name;
	}
	
	/**
	 * Returns the current [R, G, B] (or [R, G, B, A]) value.
	 * - Accessor of: {@link ve.Colour}
	 *
	 * @alias v
	 * @memberof ve.Component.ve.Colour
	 * @type {number[]}
	 */
	get v () {
		//Get RGB from the internal hex string stored in this.value
		let rgb = Colour.convertHexToRGB(this.value);
		
		if (this.options.is_rgba) {
			return [rgb[0], rgb[1], rgb[2], this.alpha];
		}
		return rgb;
	}
	
	/**
	 * Sets the current value. Accepts [R, G, B], [R, G, B, A] arrays, or Hex strings.
	 * - Accessor of: {@link ve.Colour}
	 *
	 * @alias v
	 * @memberof ve.Component.ve.Colour
	 *
	 * @param {number[]|string} arg0_value
	 */
	set v (arg0_value) {
		let input_rgb = [0, 0, 0];
		let input_alpha = 1;
		
		//1. Parse Input
		if (typeof arg0_value === "string") {
			//Hex String Handling
			if (arg0_value.startsWith("#")) {
				if (arg0_value.length > 7) {
					// #RRGGBBAA
					let rgba = Colour.convertHexToRGBA(arg0_value);
					input_rgb = [rgba[0], rgba[1], rgba[2]];
					input_alpha = rgba[3];
				} else {
					//#RRGGBB
					input_rgb = Colour.convertHexToRGB(arg0_value);
				}
			}
		} else if (Array.isArray(arg0_value)) {
			// Array Handling
			if (arg0_value.length === 4) {
				input_rgb = [arg0_value[0], arg0_value[1], arg0_value[2]];
				input_alpha = arg0_value[3];
			} else {
				input_rgb = arg0_value;
			}
		}
		
		//2. Convert RGB part to Standard Hex for HTML Input
		let hex_value = Colour.convertRGBToHex(input_rgb);
		
		//3. Update State
		this.value = hex_value;
		this.element.querySelector("input").value = this.value;
		
		//4. Update Alpha if applicable
		if (this.options.is_rgba) {
			this.alpha = input_alpha;
			this.element.querySelector("input").style.opacity = this.alpha;
			if (this.opacity_slider) {
				this.opacity_slider.v = this.alpha * 100;
			}
		}
		
		this.fireFromBinding();
	}
	
	/**
	 * Returns the hexadecimal value of {@link ve.Colour} as a string.
	 * Returns 8-digit hex if is_rgba is true.
	 * - Method of: {@link ve.Colour}
	 *
	 * @alias getHex
	 * @memberof ve.Component.ve.Colour
	 *
	 * @returns {string}
	 */
	getHex () {
		if (this.options.is_rgba) {
			// Combine current RGB with current Alpha
			return Colour.convertRGBAToHex(this.v);
		}
		return this.value; // this.value is already #RRGGBB
	}
	
	/**
	 * Returns the 'R,G,B' (or 'R,G,B,A') value of {@link ve.Colour} as a string.
	 * - Method of: {@link ve.Colour}
	 *
	 * @alias toString
	 * @memberof ve.Component.ve.Colour
	 *
	 * @returns {string}
	 */
	toString () {
		return this.v.join(",");
	}
};

//Functional binding

/**
 * @returns {ve.Colour}
 */
veColour  = function () {
	//Return statement
	return new ve.Colour(...arguments);
};