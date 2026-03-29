ve.DatavisSuite.TooltipSymbol = class extends ve.Component {
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = (arg0_value) ? arg0_value : {};
		let options = (arg1_options) ? arg1_options : {};
		super(options);
		
		//Initialise options
		options.attributes = (options.attributes) ? options.attributes : {};
		
		//Declare local instance variables
		this.element = document.createElement("div");
		this.element.setAttribute("component", "ve-datavis-suite-tooltip-symbol");
		this.element.instance = this;
		HTML.setAttributesObject(this.element, options.attributes);
		this.options = options;
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
			show: new ve.Toggle(value.show, {
				name: loc("ve.registry.localisation.TooltipSymbol_show"),
				onuserchange: (v) => this.value.show = v
			}),
			trigger: new ve.Select({
				axis: { name: loc("ve.registry.localisation.TooltipSymbol_axis") },
				item: { name: loc("ve.registry.localisation.TooltipSymbol_item") },
				none: { name: loc("ve.registry.localisation.TooltipSymbol_none") }
			}, {
				name: loc("ve.registry.localisation.TooltipSymbol_trigger"),
				onuserchange: (v) => this.value.trigger = v
			}),
			
			always_show_content: new ve.Toggle(value.alwaysShowContent, {
				name: loc("ve.registry.localisation.TooltipSymbol_always_show_content"),
				onuserchange: (v) => this.value.alwaysShowContent = v
			}),
			_class_name: new ve.Text(value.className, {
				name: loc("ve.registry.localisation.TooltipSymbol_class_name"),
				onuserchange: (v) => this.value.className = v
			}),
			confine: new ve.Toggle(value.confine, {
				name: loc("ve.registry.localisation.TooltipSymbol_confine"),
				onuserchange: (v) => this.value.confine = v
			}),
			display_transition: new ve.Toggle((value.displayTransition !== undefined) ? true : value.displayTransition, {
				name: loc("ve.registry.localisation.TooltipSymbol_display_transition"),
				onuserchange: (v) => this.value.displayTransition = v
			}),
			enterable: new ve.Toggle((value.enterable !== undefined) ? true : value.enterable, {
				name: loc("ve.registry.localisation.TooltipSymbol_enterable"),
				onuserchange: (v) => this.value.enterable = v
			}),
			hide_delay: new ve.Number(Math.returnSafeNumber(value.hideDelay, 100), {
				name: loc("ve.registry.localisation.TooltipSymbol_hide_delay"),
				onuserchange: (v) => this.value.hideDelay = v
			}),
			position: new ve.RawInterface({
				position_x: new ve.Text(value.position?.[0], {
					name: loc("ve.registry.localisation.TooltipSymbol_x")
				}),
				position_y: new ve.Text(value.position?.[1], {
					name: loc("ve.registry.localisation.TooltipSymbol_y")
				})
			}, {
				name: loc("ve.registry.localisation.TooltipSymbol_position"),
				onuserchange: (v) => {
					if (v.position_x.v === "" && v.position_y.v === "") {
						delete value.position;
						return;
					}
					if (!isNaN(parseFloat(v.position_x.v))) v.position_x.v = parseFloat(v.position_x.v);
					if (!isNaN(parseFloat(v.position_y.v))) v.position_y.v = parseFloat(v.position_y.v);
					
					this.value.position = [v.position_x.v, v.position_y.v];
				}
			}),
			show_content: new ve.Toggle((value.showContent !== undefined) ? true : value.showContent, {
				name: loc("ve.registry.localisation.TooltipSymbol_show_content"),
				onuserchange: (v) => this.value.showContent = v
			}),
			show_delay: new ve.Number(Math.returnSafeNumber(value.showDelay), {
				name: loc("ve.registry.localisation.TooltipSymbol_show_delay"),
				onuserchange: (v) => this.value.showDelay = v
			}),
			transition_duration: new ve.Number(Math.returnSafeNumber(value.transitionDuration, 0.4), {
				name: loc("ve.registry.localisation.TooltipSymbol_transition_duration"),
				onuserchange: (v) => this.value.transitionDuration = v
			}),
			trigger_on: new ve.Select({
				"click": { name: loc("ve.registry.localisation.TooltipSymbol_click") },
				"mousemove": { name: loc("ve.registry.localisation.TooltipSymbol_mousemove") },
				"mousemove|click": { name: loc("ve.registry.localisation.TooltipSymbol_mousemove_click") },
				"none": { name: loc("ve.registry.localisation.TooltipSymbol_none") }
			}, {
				name: loc("ve.registry.localisation.TooltipSymbol_trigger_on"),
				selected: (this.value.triggerOn) ? this.value.triggerOn : "mousemove|click",
				onuserchange: (v) => this.value.triggerOn = v
			}),
			render_mode: new ve.Select({
				"html": { name: loc("ve.registry.localisation.TooltipSymbol_html") },
				"richText": { name: loc("ve.registry.localisation.TooltipSymbol_rich_text") }
			}, {
				name: loc("ve.registry.localisation.TooltipSymbol_render_mode"),
				selected: (this.value.renderMode) ? this.value.renderMode : "html",
				onuserchange: (v) => this.value.renderMode = v
			}),
			
			axis_pointer: new ve.Interface({
				show: new ve.Toggle(value.axisPointer?.show, {
					name: loc("ve.registry.localisation.TooltipSymbol_show"),
					onuserchange: (v) => {
						if (!this.value.axisPointer) this.value.axisPointer = {};
						this.value.axisPointer.show = v;
					}
				}),
				label_symbol: new ve.DatavisSuite.LabelSymbol(value.axisPointer?.label, {
					name: loc("ve.registry.localisation.TooltipSymbol_label_symbol"),
					onuserchange: (v) => {
						if (!this.value.axisPointer) this.value.axisPointer = {};
						this.value.axisPointer.label = v;
					}
				}),
				on_hover_emphasis: new ve.Toggle(value.axisPointer?.triggerEmphasis, {
					name: loc("ve.registry.localisation.TooltipSymbol_onhover_emphasis"),
					onuserchange: (v) => {
						if (!this.value.axisPointer) this.value.axisPointer = {};
						this.value.axisPointer.triggerEmphasis = v;
					}
				}),
				on_hover_tooltip: new ve.Toggle(value.axisPointer?.triggerTooltip, {
					name: loc("ve.registry.localisation.TooltipSymbol_onhover_tooltip"),
					onuserchange: (v) => {
						if (!this.value.axisPointer) this.value.axisPointer = {};
						this.value.axisPointer.triggerTooltip = v;
					}
				}),
				shadow_blur: new ve.Number(Math.returnSafeNumber(value.axisPointer?.shadowStyle?.shadowBlur, 0), {
					name: loc("ve.registry.localisation.TooltipSymbol_shadow_blur"),
					onuserchange: (v) => {
						if (!this.value.axisPointer) this.value.axisPointer = {};
						if (!this.value.axisPointer.shadowStyle) this.value.axisPointer.shadowStyle = {};
						this.value.axisPointer.shadowStyle.shadowBlur = v;
					}
				}),
				shadow_colour: new ve.Colour((value.axisPointer?.shadowStyle?.shadowColor) ? value.axisPointer.shadowStyle.shadowColor : "#000", {
					name: loc("ve.registry.localisation.TooltipSymbol_shadow_colour"),
					onuserchange: (v) => {
						if (!this.value.axisPointer) this.value.axisPointer = {};
						if (!this.value.axisPointer.shadowStyle) this.value.axisPointer.shadowStyle = {};
						this.value.axisPointer.shadowStyle.shadowColor = v;
					}
				}),
				shadow_offset_x: new ve.Number(Math.returnSafeNumber(value.axisPointer?.shadowStyle?.shadowOffsetX), {
					name: loc("ve.registry.localisation.TooltipSymbol_shadow_offset_x"),
					onuserchange: (v) => {
						if (!this.value.axisPointer) this.value.axisPointer = {};
						if (!this.value.axisPointer.shadowStyle) this.value.axisPointer.shadowStyle = {};
						this.value.axisPointer.shadowStyle.shadowOffsetX = v;
					}
				}),
				shadow_offset_y: new ve.Number(Math.returnSafeNumber(value.axisPointer?.shadowStyle?.shadowOffsetY), {
					name: loc("ve.registry.localisation.TooltipSymbol_shadow_offset_y"),
					onuserchange: (v) => {
						if (!this.value.axisPointer) this.value.axisPointer = {};
						if (!this.value.axisPointer.shadowStyle) this.value.axisPointer.shadowStyle = {};
						this.value.axisPointer.shadowStyle.shadowOffsetY = v;
					}
				}),
				snap_to: new ve.Toggle(value.axisPointer?.shadowStyle?.snap, {
					name: loc("ve.registry.localisation.TooltipSymbol_snap_to"),
					onuserchange: (v) => {
						if (!this.value.axisPointer) this.value.axisPointer = {};
						this.value.axisPointer.snap = v;
					}
				}),
				status: new ve.Toggle(value.axisPointer?.status, {
					name: loc("ve.registry.localisation.TooltipSymbol_status"),
					onuserchange: (v) => {
						if (!this.value.axisPointer) this.value.axisPointer = {};
						this.value.axisPointer.status = v;
					}
				}),
				stroke_symbol: new ve.DatavisSuite.StrokeSymbol(value.axisPointer?.lineStyle, {
					name: loc("ve.registry.localisation.TooltipSymbol_stroke_symbol"),
					onuserchange: (v) => {
						if (!this.value.axisPointer) this.value.axisPointer = {};
						this.value.axisPointer.lineStyle = v;
					}
				}),
				type: new ve.Select({
					line: { name: loc("ve.registry.localisation.TooltipSymbol_line") },
					shadow: { name: loc("ve.registry.localisation.TooltipSymbol_shadow") },
					none: { name: loc("ve.registry.localisation.TooltipSymbol_none") }
				}, {
					name: loc("ve.registry.localisation.TooltipSymbol_type"),
					onuserchange: (v) => {
						if (!this.value.axisPointer) this.value.axisPointer = {};
						this.value.axisPointer.type = v;
					}
				}),
				value: new ve.Number(Math.returnSafeNumber(this.value?.axisPointer?.value), {
					name: loc("ve.registry.localisation.TooltipSymbol_value"),
					onuserchange: (v) => {
						if (!this.value.axisPointer) this.value.axisPointer = {};
						this.value.axisPointer.value = v;
					}
				}),
				z_index: new ve.Number(Math.returnSafeNumber(this.value?.axisPointer?.z), {
					name: loc("ve.registry.localisation.TooltipSymbol_z_index"),
					onuserchange: (v) => {
						if (!this.value.axisPointer) this.value.axisPointer = {};
						this.value.axisPointer.z = v;
					}
				})
			}, {
				name: loc("ve.registry.localisation.TooltipSymbol_axis_pointer")
			}),
			background_colour: new ve.Colour((value.backgroundColor) ? value.backgroundColor : [50, 50, 50], {
				name: loc("ve.registry.localisation.TooltipSymbol_background_colour"),
				onuserchange: (v, e) => this.value.backgroundColor = e.getHex()
			}),
			background_opacity: new ve.Range(Math.returnSafeNumber(value.backgroundOpacity, 0.7*100), {
				name: loc("ve.registry.localisation.TooltipSymbol_background_opacity"),
				min: 0,
				max: 100,
				onuserchange: (v) => this.value.backgroundOpacity = v/100
			}),
			border_colour: new ve.Colour((value.borderColor) ? value.borderColor : "#333333", {
				name: loc("ve.registry.localisation.TooltipSymbol_border_colour"),
				onuserchange: (v, e) => this.value.borderColor = e.getHex()
			}),
			border_width: new ve.Number(Math.returnSafeNumber(value.borderWidth, 0), {
				name: loc("ve.registry.localisation.TooltipSymbol_border_width"),
				onuserchange: (v) => this.value.borderWidth = v
			}),
			formatter: new ve.RawInterface({
				formatter: new ve.Text(value.formatter, {
					name: loc("ve.registry.localisation.TooltipSymbol_formatter")
				}),
				formatter_information: new ve.Button(() => {}, {
					name: "<icon>info</icon>",
					tooltip: loc("ve.registry.localisation.TooltipSymbol_tooltip_formatter"),
					
					style: { marginLeft: "var(--padding)" }
				})
			}),
			order: new ve.Select({
				seriesAsc: { name: loc("ve.registry.localisation.TooltipSymbol_order_series_asc") },
				seriesDesc: { name: loc("ve.registry.localisation.TooltipSymbol_order_series_desc") },
				valueAsc: { name: loc("ve.registry.localisation.TooltipSymbol_order_value_asc") },
				valueDesc: { name: loc("ve.registry.localisation.TooltipSymbol_order_value_desc") }
			}, {
				name: loc("ve.registry.localisation.TooltipSymbol_order"),
				selected: (value.order) ? value.order : "seriesAsc",
				onuserchange: (v) => this.value.order = v
			}),
			padding: new ve.Number((value.padding) ? value.padding : [0], {
				name: loc("ve.registry.localisation.TooltipSymbol_padding"),
				onuserchange: (v) => this.value.padding = v
			}),
			text_symbol: new ve.DatavisSuite.TextSymbol(value.textStyle, {
				name: loc("ve.registry.localisation.TooltipSymbol_text_symbol"),
				onuserchange: (v) => this.value.textStyle = v
			}).interface
		}, {
			name: (this.options.name) ? this.options.name : loc("ve.registry.localisation.TooltipSymbol_tooltip_symbol"),
			onuserchange: (v, e) => {
				delete this.do_not_fire_to_binding;
				this.fireToBinding();
			}
		});
	}
}