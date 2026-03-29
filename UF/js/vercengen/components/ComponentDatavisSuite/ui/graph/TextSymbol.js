ve.DatavisSuite.TextSymbol = class extends ve.Component {
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = (arg0_value) ? arg0_value : {};
		let options = (arg1_options) ? arg1_options : {};
		super(options);
		
		//Initialise options
		options.attributes = (options.attributes) ? options.attributes : {};
		
		//Declare local instance variables
		this.element = document.createElement("div");
		this.element.setAttribute("component", "ve-datavis-suite-text-symbol");
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
			colour: new ve.Colour((value.color) ? value.color : "#000000", {
				name: loc("ve.registry.localisation.TextSymbol_colour"),
				is_rgba: true,
				onuserchange: (v, e) => this.value.color = e.getHex()
			}),
			ellipsis: new ve.Text((value.ellipsis) ? value.ellipsis : "...", {
				name: loc("ve.registry.localisation.TextSymbol_ellipsis"),
				onuserchange: (v) => this.value.ellipsis = v
			}),
			font_family: new ve.Text((value.fontFamily) ? value.fontFamily : "sans-serif", {
				name: loc("ve.registry.localisation.TextSymbol_font_family"),
				onuserchange: (v) => this.value.fontFamily = v
			}),
			font_size: new ve.Number(Math.returnSafeNumber(value.fontSize, 12), {
				name: loc("ve.registry.localisation.TextSymbol_font_size"),
				onuserchange: (v) => this.value.fontSize = v
			}),
			font_style: new ve.Select({
				normal: { name: loc("ve.registry.localisation.TextSymbol_normal") },
				italic: { name: loc("ve.registry.localisation.TextSymbol_italic") },
				oblique: { name: loc("ve.registry.localisation.TextSymbol_oblique") }
			}, {
				name: loc("ve.registry.localisation.TextSymbol_font_style"),
				onuserchange: (v) => this.value.fontStyle = v,
				selected: (value.fontStyle) ? value.fontStyle : "normal"
			}),
			font_weight: new ve.Select({
				bold: { name: loc("ve.registry.localisation.TextSymbol_bold") },
				bolder: { name: loc("ve.registry.localisation.TextSymbol_bolder") },
				normal: { name: loc("ve.registry.localisation.TextSymbol_normal") },
				lighter: { name: loc("ve.registry.localisation.TextSymbol_lighter") }
			}, {
				name: loc("ve.registry.localisation.TextSymbol_font_weight"),
				onuserchange: (v) => this.value.fontWeight = v,
				selected: (value.fontWeight) ? value.fontWeight : "normal"
			}),
			_height: new ve.Number(Math.returnSafeNumber(value.height, 12), {
				name: loc("ve.registry.localisation.TextSymbol_height"),
				onuserchange: (v) => this.value.height = v
			}),
			overflow: new ve.Select({
				break: { name: loc("ve.registry.localisation.TextSymbol_break") },
				breakAll: { name: loc("ve.registry.localisation.TextSymbol_break_all") },
				none: { name: loc("ve.registry.localisation.TextSymbol_none") },
				truncate: { name: loc("ve.registry.localisation.TextSymbol_truncate") }
			}, {
				name: loc("ve.registry.localisation.TextSymbol_overflow"),
				onuserchange: (v) => this.value.overflow = v,
				selected: (value.overflow) ? value.overflow : "none"
			}),
			text_border_colour: new ve.Colour((value.textBorderColor) ? value.textBorderColor : "#000000", {
				name: loc("ve.registry.localisation.TextSymbol_text_border_colour"),
				is_rgba: true,
				onuserchange: (v, e) => this.value.textBorderColor = e.getHex()
			}),
			text_border_dash_offset: new ve.Number(Math.returnSafeNumber(value.textBorderDashOffset, 0), {
				name: loc("ve.registry.localisation.TextSymbol_text_border_dash_offset"),
				onuserchange: (v) => this.value.textBorderDashOffset = v
			}),
			text_border_type: new ve.Select({
				solid: { name: loc("ve.registry.localisation.TextSymbol_solid") },
				dashed: { name: loc("ve.registry.localisation.TextSymbol_dashed") },
				dotted: { name: loc("ve.registry.localisation.TextSymbol_dotted") }
			}, {
				name: loc("ve.registry.localisation.TextSymbol_text_border_type"),
				onuserchange: (v) => this.value.textBorderType = v,
				selected: (value.textBorderType) ? value.textBorderType : "none"
			}),
			text_border_width: new ve.Number(Math.returnSafeNumber(value.textBorderWidth, 0), {
				name: loc("ve.registry.localisation.TextSymbol_text_border_width"),
				onuserchange: (v) => this.value.textBorderWidth
			}),
			text_shadow_blur: new ve.Number(Math.returnSafeNumber(value.textShadowBlur), {
				name: loc("ve.registry.localisation.TextSymbol_shadow_blur"),
				onuserchange: (v) => this.value.textShadowBlur = v
			}),
			text_shadow_colour: new ve.Colour((value.textShadowColor) ? value.textShadowColor : "#000000", {
				name: loc("ve.registry.localisation.TextSymbol_text_shadow_colour"),
				is_rgba: true,
				onuserchange: (v, e) => this.value.textShadowColor = e.getHex()
			}),
			text_shadow_offset_x: new ve.Number(Math.returnSafeNumber(value.textShadowOffsetX), {
				name: loc("ve.registry.localisation.TextSymbol_shadow_offset_x"),
				onuserchange: (v) => this.value.textShadowOffsetX = v
			}),
			text_shadow_offset_y: new ve.Number(Math.returnSafeNumber(value.textShadowOffsetY), {
				name: loc("ve.registry.localisation.TextSymbol_shadow_offset_y"),
				onuserchange: (v) => this.value.textShadowOffsetY = v
			}),
			_width: new ve.Number(Math.returnSafeNumber(value.width, 0), {
				name: loc("ve.registry.localisation.TextSymbol_width"),
				onuserchange: (v) => this.value.width = v
			})
		}, {
			name: (this.options.name) ? this.options.name : loc("ve.registry.localisation.TextSymbol_text_symbol"),
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
 * @returns {ve.DatavisSuite.StrokeSymbol}
 */
veDatavisSuiteTextSymbol = function () {
	//Return statement
	return new ve.DatavisSuite.StrokeSymbol(...arguments);
};