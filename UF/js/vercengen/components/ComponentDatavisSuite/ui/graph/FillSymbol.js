/**
 * Internal sub-component of <span color = "yellow">{@link ve.DatavisSuite}</span>. 
 * 
 * Please refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 * 
 * ##### Constructor:
 * - `arg0_value`: {@link Object}
 *   - `.fill_colour`: {@link string}
 *   - `.origin="auto"`: {@link number}|{@link string} - Either 'auto'/'start'/'end'.
 *   - `.opacity=0.7`: {@link number} - Value from 0 to 1.
 *   - 
 *   - `.shadow_blur`: {@link number}
 *   - `.shadow_offset_x`: {@link number}
 *   - `.shadow_offset_y`: {@link number}
 * - `arg1_options`: {@link Object}
 *   - `.name`: {@link string}
 *
 * @augments ve.Component
 * @memberof ve.Component.ve.DatavisSuite
 * @type {ve.DatavisSuite.FillSymbol}
 */
ve.DatavisSuite.FillSymbol = class extends ve.Component { //[WIP] - Refactor to use .value mutation
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = (arg0_value) ? arg0_value : {};
		let options = (arg1_options) ? arg1_options : {};
			super(options);
			
		//Initialise options
		options.attributes = (options.attributes) ? options.attributes : {};
			
		//Declare local instance variables
		this.element = document.createElement("div");
			this.element.setAttribute("component", "ve-datavis-suite-fill-symbol");
			this.element.instance = this;
			HTML.setAttributesObject(this.element, options.attributes);
		this.value = {};
		this.from_binding_fire_silently = true;
		this.v = value;
		delete this.from_binding_fire_silently;
	}
	
	get v () {
		//Return statement
		return this.value;
	}
	
	set v (arg0_value) {
		//Convert from parameters
		let value = (arg0_value) ? arg0_value : {};
		
		//Parse value
		this.element.innerHTML = "";
		this.interface = new ve.Interface({
			fill_colour: new ve.Colour(value.color, {
				name: loc("ve.registry.localisation.FillSymbol_fill_colour"),
				onuserchange: (v, e) => this.value.color = e.getHex()
			}),
			origin: new ve.Select({
				auto: { name: loc("ve.registry.localisation.FillSymbol_auto") },
				end: { name: loc("ve.registry.localisation.FillSymbol_end") },
				start: { name: loc("ve.registry.localisation.FillSymbol_start") }
			}, {
				name: loc("ve.registry.localisation.FillSymbol_origin"),
				selected: (value.origin) ? value.origin : "auto",
				onuserchange: (v) => this.value.origin = v
			}),
			opacity: new ve.Range(Math.returnSafeNumber(value.opacity, 0.7), {
				name: loc("ve.registry.localisation.FillSymbol_opacity"),
				onuserchange: (v) => this.value.opacity = v
			}),
			
			shadow_blur: new ve.Number(Math.returnSafeNumber(value.shadowBlur), {
				name: loc("ve.registry.localisation.FillSymbol_shadow_blur"),
				onuserchange: (v) => this.value.shadowBlur = v
			}),
			shadow_offset_x: new ve.Number(Math.returnSafeNumber(value.shadowOffsetX), {
				name: loc("ve.registry.localisation.FillSymbol_shadow_offset_x"),
				onuserchange: (v) => this.value.shadowOffsetX = v
			}),
			shadow_offset_y: new ve.Number(Math.returnSafeNumber(value.shadowOffsetY), {
				name: loc("ve.registry.localisation.FillSymbol_shadow_offset_y"),
				onuserchange: (v) => this.value.shadowOffsetY = v
			})
		}, {
			name: (this.options.name) ? this.options.name : loc("ve.registry.localisation.FillSymbol_fill_symbol"),
			onuserchange: (v, e) => {
				delete this.do_not_fire_to_binding;
				this.fireToBinding();
			}
		});
		this.interface.bind(this.element);
		this.value = value;
	}
};

//Functional binding

/**
 * @returns {ve.DatavisSuite.FillSymbol}
 */
veDatavisSuiteFillSymbol = function () {
	//Return statement
	return new ve.DatavisSuite.FillSymbol(...arguments);
};