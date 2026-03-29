/**
 * ##### Constructor;
 * - `arg0_value`: {@link Object}
 * - `arg1_options`: {@link Object}
 *   - `.name`; {@link string}
 * 
 * @augments ve.Component
 * @memberof ve.Component.ve.DatavisSuite
 * @type {ve.DatavisSuite.LabelSymbol}
 */
ve.DatavisSuite.LabelSymbol = class extends ve.Component { //[WIP] - Refactor to use .value mutation
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = (arg0_value) ? arg0_value : {};
		let options = (arg1_options) ? arg1_options : {};
			super(options);
			
		//Initialise options
		options.attributes = (options.attributes) ? options.attributes : {};
		
		//Declare local instance variables
		this.element = document.createElement("div");
			this.element.setAttribute("component", "ve-datavis-suite-labels-symbol");
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
			text_options: new ve.Interface({
				show: new ve.Toggle((value.show !== undefined) ? value.show : true, { 
					name: loc("ve.registry.localisation.LabelSymbol_show"), 
					onuserchange: (v) => this.value.show = v
				}),
				
				colour: new ve.Colour((value.color) ? value.color : "#ffffff", { 
					name: loc("ve.registry.localisation.LabelSymbol_colour"),
					onuserchange: (v) => this.value.color = v
				}),
				formatter: new ve.Text((value.formatter) ? value.formatter : "", { 
					name: loc("ve.registry.localisation.LabelSymbol_formatter"), 
					onuserchange: (v) => this.value.formatter = v
				}),
				font_family: new ve.Text((value.fontFamily) ? value.fontFamily : "sans-serif", { 
					name: loc("ve.registry.localisation.LabelSymbol_font_family"),
					onuserchange: (v) => this.value.fontFamily = v
				}),
				font_size: new ve.Number(Math.returnSafeNumber(value.fontSize, 12), { 
					min: 0, 
					name: loc("ve.registry.localisation.LabelSymbol_font_size"),
					onuserchange: (v) => this.value.fontSize = v
				}),
				font_style: new ve.Select({
					normal: { name: loc("ve.registry.localisation.LabelSymbol_normal") },
					italic: { name: loc("ve.registry.localisation.LabelSymbol_italic") },
					oblique: { name: loc("ve.registry.localisation.LabelSymbol_oblique") }
				}, { 
					name: loc("ve.registry.localisation.LabelSymbol_font_style"), 
					selected: (value.fontStyle) ? value.fontStyle : "normal",
					onuserchange: (v) => this.value.fontStyle = v
				}),
				font_weight: new ve.Select({
					light: { name: loc("ve.registry.localisation.LabelSymbol_light") },
					normal: { name: loc("ve.registry.localisation.LabelSymbol_normal") },
					bolder: { name: loc("ve.registry.localisation.LabelSymbol_medium") },
					bold: { name: loc("ve.registry.localisation.LabelSymbol_bold") }
				}, { 
					name: loc("ve.registry.localisation.LabelSymbol_font_weight"),
					selected: (value.fontWeight) ? value.fontWeight : "normal",
					onuserchange: (v) => this.value.fontWeight = v
				}),
				_height: new ve.Number(Math.returnSafeNumber(value.height,50), { 
					min: 0, 
					name: loc("ve.registry.localisation.LabelSymbol_height"),
					onuserchange: (v) => this.value.height = 50
				}),
				_width: new ve.Number(Math.returnSafeNumber(value.width, 100), { 
					min: 0, 
					name: loc("ve.registry.localisation.LabelSymbol_width"), 
					onuserchange: (v) => this.value.width = 100
				})
			}, { name: loc("ve.registry.localisation.LabelSymbol_text_options") }),
			text_style: new ve.Interface({
				background_colour: new ve.Colour((value.backgroundColor) ? 
					value.backgroundColor : "#000000", { 
					name: loc("ve.registry.localisation.LabelSymbol_background_colour"),
					has_opacity: true,
					onuserchange: (v, e) => this.value.backgroundColor = e.getHex()
				}),
				border_colour: new ve.Colour((value.borderColor) ? value.borderColor : "#000000", { 
					name: loc("ve.registry.localisation.LabelSymbol_border_colour"),
					onuserchange: (v, e) => this.value.borderColor = e.getHex()
				}),
				border_dash_offset: new ve.Number(Math.returnSafeNumber(value.borderDashOffset), { 
					name: loc("ve.registry.localisation.LabelSymbol_border_dash_offset"), 
					onuserchange: (v) => this.value.borderDashOffset = v
				}),
				border_radius: new ve.Number(Math.returnSafeNumber(value.borderRadius), { 
					name: loc("ve.registry.localisation.LabelSymbol_border_radius"),
					onuserchange: (v) => this.value.borderRadius = v
				}),
				border_type: new ve.Select({
					dashed: { name: loc("ve.registry.localisation.LabelSymbol_dashed") },
					dotted: { name: loc("ve.registry.localisation.LabelSymbol_dotted") },
					solid: { name: loc("ve.registry.localisation.LabelSymbol_solid") },
				}, { 
					name: loc("ve.registry.localisation.LabelSymbol_border_type"),
					onuserchange: (v) => this.value.borderType = v,
					selected: (value.borderType) ? value.borderType : "solid"
				}),
				border_width: new ve.Number(Math.returnSafeNumber(value.borderWidth), { 
					name: loc("ve.registry.localisation.LabelSymbol_border_width"), 
					onuserchange: (v) => this.value.borderWidth = v
				}),
				distance: new ve.Number(Math.returnSafeNumber(value.distance, 5), { 
					name: loc("ve.registry.localisation.LabelSymbol_distance"),
					onuserchange: (v) => this.value.distance = v
				}),
				ellipsis: new ve.Text((value.ellipsis) ? value.ellipsis : "...", { 
					name: loc("ve.registry.localisation.LabelSymbol_ellipsis"), 
					onuserchange: (v) => this.value.ellipsis = v
				}),
				line_height: new ve.Number(Math.returnSafeNumber(value.lineHeight, 12), { 
					min: 0, 
					name: loc("ve.registry.localisation.LabelSymbol_line_height"),
					onuserchange: (v) => this.value.lineHeight = v
				}),
				offset_x: new ve.Number((value.offset) ? Math.returnSafeNumber(value.offset[0]) : 0, { 
					name: loc("ve.registry.localisation.LabelSymbol_offset_x"), 
					onuserchange: (v) => this.value.offset = [v, this.interface.text_style.offset_y.v]
				}),
				offset_y: new ve.Number((value.offset) ? Math.returnSafeNumber(value.offset[1]) : 0, { 
					name: loc("ve.registry.localisation.LabelSymbol_offset_y"),
					onuserchange: (v) => this.value.offset = [this.interface.text_style.offset_x.v, v]
				}),
				overflow: new ve.Select({
					break: { name: loc("ve.registry.localisation.LabelSymbol_break") },
					breakAll: { name: loc("ve.registry.localisation.LabelSymbol_break_all") },
					none: { name: loc("ve.registry.localisation.LabelSymbol_none") },
					truncate: { name: loc("ve.registry.localisation.LabelSymbol_truncate") }
				}, { 
					name: loc("ve.registry.localisation.LabelSymbol_overflow"),
					onuserchange: (v) => this.value.overflow = v,
					selected: (value.overflow) ? value.overflow : "none"
				}),
				min_margin: new ve.Number(Math.returnSafeNumber(value.minMargin), { 
					name: loc("ve.registry.localisation.LabelSymbol_minimum_margin"),
					onuserchange: (v) => this.value.minMargin = v
				}),
				padding: new ve.List((value.padding) ? 
					value.padding.map((v) => ve.Number(v)) : [new ve.Number(0)], { 
					min: 1, max: 4, 
					name: loc("ve.registry.localisation.LabelSymbol_padding"),
					onuserchange: (v) => this.value.padding = v.map((v) => v.v)
				}),
				position: new ve.Select({
					bottom: { name: loc("ve.registry.localisation.LabelSymbol_bottom") },
					inside: { name: loc("ve.registry.localisation.LabelSymbol_inside") },
					insideBottom: { name: loc("ve.registry.localisation.LabelSymbol_inside_bottom") },
					insideBottomLeft: { name: loc("ve.registry.localisation.LabelSymbol_inside_bottom_left") },
					insideBottomRight: { name: loc("ve.registry.localisation.LabelSymbol_inside_bottom_right") },
					insideLeft: { name: loc("ve.registry.localisation.LabelSymbol_inside_left") },
					insideRight: { name: loc("ve.registry.localisation.LabelSymbol_inside_right") },
					insideTop: { name: loc("ve.registry.localisation.LabelSymbol_inside_top") },
					insideTopLeft: { name: loc("ve.registry.localisation.LabelSymbol_inside_top_left") },
					insideTopRight: { name: loc("ve.registry.localisation.LabelSymbol_inside_top_right") },
					left: { name: loc("ve.registry.localisation.LabelSymbol_left") },
					right: { name: loc("ve.registry.localisation.LabelSymbol_right") },
					top: { name: loc("ve.registry.localisation.LabelSymbol_top") }
				}, { 
					name: loc("ve.registry.localisation.LabelSymbol_position"),
					onuserchange: (v) => this.value.position = v,
					selected: (value.position) ? value.position : "top"
				}),
				rotate: new ve.Number(Math.returnSafeNumber(value.rotate), { 
					name: loc("ve.registry.localisation.LabelSymbol_rotate"),
					onuserchange: (v) => this.value.rotate = v
				}),
				text_align_horizontal: new ve.Select({
					left: { name: loc("ve.registry.localisation.LabelSymbol_left") },
					center: { name: loc("ve.registry.localisation.LabelSymbol_centre") },
					right: { name: loc("ve.registry.localisation.LabelSymbol_right") }
				}, { 
					name: loc("ve.registry.localisation.LabelSymbol_text_align_horizontal"),
					onuserchange: (v) => this.value.align = v,
					selected: (value.align) ? value.align : "left"
				}),
				text_align_vertical: new ve.Select({
					top: { name: loc("ve.registry.localisation.LabelSymbol_top") },
					middle: { name: loc("ve.registry.localisation.LabelSymbol_middle") },
					bottom: { name: loc("ve.registry.localisation.LabelSymbol_bottom") }
				}, { 
					name: loc("ve.registry.localisation.LabelSymbol_text_align_vertical"),
					onuserchange: (v) => this.value.verticalAlign = v,
					selected: (value.verticalAlign) ? value.verticalAlign : "middle"
				}),
				text_border_colour: new ve.Colour((value.textBorderColor) ? 
					value.textBorderColor : "#000000", { 
					name: loc("ve.registry.localisation.LabelSymbol_text_border_colour"),
					onuserchange: (v) => this.value.textBorderColor = v
				}),
				text_border_dash_offset: new ve.Number(Math.returnSafeNumber(value.textBorderDashOffset), { 
					name: loc("ve.registry.localisation.LabelSymbol_text_border_dash_offset"),
					onuserchange: (v) => this.value.textBorderDashOffset = v
				}),
				text_border_type: new ve.Select({
					dashed: { name: loc("ve.registry.localisation.LabelSymbol_dashed") },
					dotted: { name: loc("ve.registry.localisation.LabelSymbol_dotted") },
					solid: { name: loc("ve.registry.localisation.LabelSymbol_solid") },
				}, { 
					name: loc("ve.registry.localisation.LabelSymbol_text_border_type"),
					onuserchange: (v) => this.value.textBorderType = v,
					selected: value.textBorderType
				}),
				text_border_width: new ve.Number(Math.returnSafeNumber(value.textBorderWidth), { 
					name: loc("ve.registry.localisation.LabelSymbol_text_border_width"),
					onuserchange: (v) => this.value.textBorderWidth = v
				}),
				text_margin_x: new ve.Number((value.textMargin) ? 
					Math.returnSafeNumber(value.textMargin[0]) : 0, { 
					name: loc("ve.registry.localisation.LabelSymbol_text_margin_x"),
					onuserchange: (v) => this.value.textMargin = [v, this.interface.text_style.text_margin_y.v]
				}),
				text_margin_y: new ve.Number((value.textMargin) ? 
					Math.returnSafeNumber(value.textMargin[1]) : 0, { 
					name: loc("ve.registry.localisation.LabelSymbol_text_margin_y"),
					onuserchange: (v) => this.value.textMargin = [this.interface.text_style.text_margin_x.v, v]
				}),
				text_shadow_blur: new ve.Number(Math.returnSafeNumber(value.textShadowBlur), { 
					name: loc("ve.registry.localisation.LabelSymbol_text_shadow_blur"),
					onuserchange: (v) => this.value.textShadowBlur = v
				}),
				text_shadow_offset_x: new ve.Number(Math.returnSafeNumber(value.textShadowOffsetX), { 
					name: loc("ve.registry.localisation.LabelSymbol_text_shadow_offset_x"),
					onuserchange: (v) => this.value.textShadowOffsetX = v
				}),
				text_shadow_offset_y: new ve.Number(Math.returnSafeNumber(value.textShadowOffsetY), { 
					name: loc("ve.registry.localisation.LabelSymbol_text_shadow_offset_y"),
					onuserchange: (v) => this.value.textShadowOffsetY = v
				})
			}, { name: loc("ve.registry.localisation.LabelSymbol_text_style") }),
			shadow_options: new ve.Interface({
				shadow_blur: new ve.Number(Math.returnSafeNumber(value.shadowBlur), { 
					name: loc("ve.registry.localisation.LabelSymbol_shadow_blur"),
					onuserchange: (v) => this.value.shadowBlur = v
				}),
				shadow_colour: new ve.Colour((value.shadowColor) ? value.shadowColor : "#000000", { 
					name: loc("ve.registry.localisation.LabelSymbol_shadow_colour"),
					onuserchange: (v) => this.value.shadowColor = v
				}),
				shadow_offset_x: new ve.Number(Math.returnSafeNumber(value.shadowOffsetX), { 
					name: loc("ve.registry.localisation.LabelSymbol_shadow_offset_x"),
					onuserchange: (v) => this.value.shadowOffsetX = v
				}),
				shadow_offset_y: new ve.Number(Math.returnSafeNumber(value.shadowOffsetY), { 
					name: loc("ve.registry.localisation.LabelSymbol_shadow_offset_y"),
					onuserchange: (v) => this.value.shadowOffsetY = v
				})
			}, { name: loc("ve.registry.localisation.LabelSymbol_shadow") })
		}, { 
			name: (this.options.name) ? this.options.name : loc("ve.registry.localisation.LabelSymbol_label_symbol"),
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
 * @returns {ve.DatavisSuite.LabelSymbol}
 */
veDatavisSuiteLabelSymbol = function () {
	//Return statement
	return new ve.DatavisSuite.LabelSymbol(...arguments);
};