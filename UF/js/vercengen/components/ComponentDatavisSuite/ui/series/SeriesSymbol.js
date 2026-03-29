ve.DatavisSuite.SeriesSymbol = class extends ve.Component {
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = (arg0_value) ? arg0_value : {};
		let options = (arg1_options) ? arg1_options : {};
		super(options);
		
		//Initialise options
		options.attributes = (options.attributes) ? options.attributes : {};
		
		//Declare local instance variables
		this.element = document.createElement("div");
		this.element.setAttribute("component", "ve-datavis-suite-series-symbol");
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
		
		//Declare local instance variables
		let components_obj = {};
		
		//Series type selection
		if (!value.type) value.type = "line";
		if (value.type === "line") {
			components_obj = {};
		} else if (value.type === "bar") {
			components_obj = {
				interface: new ve.Interface({
					bar_category_gap: new ve.Text(value.barCategoryGap, {
						name: loc("ve.registry.localisation.SeriesSymbol_bar_category_gap"),
						parse_number: true,
						onuserchange: (v) => this.value.barCategoryGap = v
					}),
					bar_gap: new ve.Text((value.barGap) ? value.barGap : "20%", {
						name: loc("ve.registry.localisation.SeriesSymbol_bar_gap"),
						parse_number: true,
						onuserchange: (v) => this.value.barGap = v
					}),
					bar_max_width: new ve.Text(value.barMaxWidth, {
						name: loc("ve.registry.localisation.SeriesSymbol_bar_max_width"),
						parse_number: true,
						onuserchange: (v) => this.value.barMaxWidth = v
					}),
					bar_min_angle: new ve.Text(value.barMinAngle, {
						name: loc("ve.registry.localisation.SeriesSymbol_bar_min_angle"),
						parse_number: true,
						onuserchange: (v) => this.value.barMinAngle = v
					}),
					bar_min_height: new ve.Text(value.barMinHeight, {
						name: loc("ve.registry.localisation.SeriesSymbol_bar_min_height"),
						parse_number: true,
						onuserchange: (v) => this.value.barMinHeight = v
					}),
					bar_min_width: new ve.Text(value.barMinWidth, {
						name: loc("ve.registry.localisation.SeriesSymbol_bar_min_width"),
						parse_number: true,
						onuserchange: (v) => this.value.barMinWidth = v
					}),
					bar_width: new ve.Text(value.barWidth, {
						name: loc("ve.registry.localisation.SeriesSymbol_bar_width"),
						parse_number: true,
						onuserchange: (v) => this.value.barWidth = v
					}),
					round_cap: new ve.Toggle(value.roundCap, {
						name: loc("ve.registry.localisation.SeriesSymbol_round_cap"),
						onuserchange: (v) => this.value.roundCap = v
					}),
					show_background: new ve.Toggle(value.showBackground, {
						name: loc("ve.registry.localisation.SeriesSymbol_show_background"),
						onuserchange: (v) => this.value.showBackground = v
					})
				}, { name: loc("ve.registry.localisation.SeriesSymbol_bar_symbol") })
			};
		} else if (value.type === "pie") {
			components_obj = {
				interface: new ve.Interface({
					clockwise: new ve.Toggle(value.clockwise, {
						name: loc("ve.registry.localisation.SeriesSymbol_clockwise"),
						onuserchange: (v) => this.value.clockwise = v
					}),
					empty_circle_style: new ve.DatavisSuite.StrokeSymbol(value.emptyCircleStyle, {
						name: loc("ve.registry.localisation.SeriesSymbol_empty_circle_symbol"),
						onuserchange: (v) => this.value.emptyCircleStyle = v
					}),
					end_angle: new ve.Number(Math.returnSafeNumber(value.endAngle), {
						name: loc("ve.registry.localisation.SeriesSymbol_end_angle"),
						onuserchange: (v) => this.value.endAngle = v
					}),
					min_angle: new ve.Number(Math.returnSafeNumber(value.minAngle), {
						name: loc("ve.registry.localisation.SeriesSymbol_min_angle"),
						onuserchange: (v) => this.value.minAngle = v
					}),
					min_show_label_angle: new ve.Number(Math.returnSafeNumber(value.minShowLabelAngle), {
						name: loc("ve.registry.localisation.SeriesSymbol_min_show_label_angle"),
						onuserchange: (v) => this.value.minShowLabelAngle = v
					}),
					rose_type: new ve.Select({
						area: { name: loc("ve.registry.localisation.SeriesSymbol_area") },
						"false": { name: loc("ve.registry.localisation.SeriesSymbol_false") },
						"true": { name: loc("ve.registry.localisation.SeriesSymbol_true") },
						radius: { name: loc("ve.registry.localisation.SeriesSymbol_radius") }
					}, {
						name: loc("ve.registry.localisation.SeriesSymbol_rose_type"),
						selected: (value.roseType === false) ? "false" :
							(value.roseType === true) ? "true" :
								value.roseType,
						onuserchange: (v) => {
							if (v === "false") v = false;
							if (v === "true") v = true;
							this.value.roseType = v;
						}
					}),
					pad_angle: new ve.Number(Math.returnSafeNumber(value.padAngle), {
						name: loc("ve.registry.localisation.SeriesSymbol_pad_angle"),
						onuserchange: (v) => this.value.padAngle = v
					}),
					start_angle: new ve.Number(Math.returnSafeNumber(value.startAngle, 90), {
						name: loc("ve.registry.localisation.SeriesSymbol_start_angle"),
						onuserchange: (v) => this.value.startAngle = v
					}),
					
					behaviour: new ve.Interface({
						avoid_label_overlap: new ve.Toggle(value.avoidLabelOverlap, {
							name: loc("ve.registry.localisation.SeriesSymbol_avoid_label_overlap"),
							onuserchange: (v) => this.value.avoidLabelOverlap = v
						}),
						cursor: new ve.Text((value.cursor) ? value.cursor : "pointer", {
							name: loc("ve.registry.localisation.SeriesSymbol_cursor"),
							onuserchange: (v) => this.value.cursor = v
						}),
						percent_precision: new ve.Number(Math.returnSafeNumber(value.percentPrecision, 2), {
							name: loc("ve.registry.localisation.SeriesSymbol_percent_precision"),
							onuserchange: (v) => this.value.percentPrecision = v
						}),
						show_empty_circle: new ve.Toggle(value.showEmptyCircle, {
							name: loc("ve.registry.localisation.SeriesSymbol_show_empty_circle"),
							onuserchange: (v) => this.value.showEmptyCircle = v
						}),
						still_show_zero_sum: new ve.Toggle(value.stillShowZeroSum, {
							name: loc("ve.registry.localisation.SeriesSymbol_still_show_zero_sum"),
							onuserchange: (v) => this.value.stillShowZeroSum = v
						})
					}, { name: loc("ve.registry.localisation.SeriesSymbol_behaviour") }),
					
					events: new ve.Interface({
						selected_offset: new ve.Number(Math.returnSafeNumber(value.selectedOffset, 10), {
							name: loc("ve.registry.localisation.SeriesSymbol_selected_offset"),
							onuserchange: (v) => this.value.selectedOffset = v
						})
					}, { name: loc("ve.registry.localisation.SeriesSymbol_events") })
				}, { name: loc("ve.registry.localisation.SeriesSymbol_pie_symbol") })
			};
		}
		
		//Parse value
		this.element.innerHTML = "";
		this.interface = new ve.Interface({
			colour: new ve.Colour((value.color) ? value.color : [255, 255, 255, 1], {
				is_rgba: true,
				onuserchange: (v, e) => this.value.color = e.getHex()
			}),
			_name: new ve.Text(value.name, {
				name: loc("ve.registry.localisation.SeriesSymbol_name"),
				onuserchange: (v) => this.value.name = v
			}),
			type: new ve.Select({
				line: { name: loc("ve.registry.localisation.SeriesSymbol_line") },
				bar: { name: loc("ve.registry.localisation.SeriesSymbol_bar") },
				pie: { name: loc("ve.registry.localisation.SeriesSymbol_pie") }
			}, {
				name: loc("ve.registry.localisation.SeriesSymbol_type"),
				selected: (value.type) ? value.type : "line",
				onuserchange: (v) => {
					this.value.type = v;
					this.v = this.value; //Reload interface
				}
			}),
			...components_obj,
			
			animation: new ve.Interface({
				delay: new ve.Number(Math.returnSafeNumber(value.animationDelay), {
					name: loc("ve.registry.localisation.SeriesSymbol_delay"),
					onuserchange: (v) => this.value.animationDelay = v
				}),
				delay_update: new ve.Number(Math.returnSafeNumber(value.animationDelayUpdate, 300), {
					name: loc("ve.registry.localisation.SeriesSymbol_delay_update"),
					onuserchange: (v) => this.value.animationDelayUpdate = v
				}),
				duration: new ve.Number(Math.returnSafeNumber(value.animationDuration, 1000), {
					name: loc("ve.registry.localisation.SeriesSymbol_duration"),
					onuserchange: (v) => this.value.animationDuration = v
				}),
				duration_update: new ve.Number(Math.returnSafeNumber(value.animationDurationUpdate, 300), {
					name: loc("ve.registry.localisation.SeriesSymbol_duration_update"),
					onuserchange: (v) => this.value.animationDurationUpdate = v
				}),
				easing: new ve.Select({
					linear: { name: loc("ve.registry.localisation.SeriesSymbol_easing_linear") },
					quadraticIn: { name: loc("ve.registry.localisation.SeriesSymbol_easing_quadratic_in") },
					quadraticOut: { name: loc("ve.registry.localisation.SeriesSymbol_easing_quadratic_out") },
					quadraticInOut: { name: loc("ve.registry.localisation.SeriesSymbol_easing_quadratic_in_out") },
					cubicIn: { name: loc("ve.registry.localisation.SeriesSymbol_easing_cubic_in") },
					cubicOut: { name: loc("ve.registry.localisation.SeriesSymbol_easing_cubic_out") },
					cubicInOut: { name: loc("ve.registry.localisation.SeriesSymbol_easing_cubic_in_out") },
					quarticIn: { name: loc("ve.registry.localisation.SeriesSymbol_easing_quartic_in") },
					quarticOut: { name: loc("ve.registry.localisation.SeriesSymbol_easing_quartic_out") },
					quarticInOut: { name: loc("ve.registry.localisation.SeriesSymbol_easing_quartic_in_out") },
					quinticIn: { name: loc("ve.registry.localisation.SeriesSymbol_easing_quintic_in") },
					quinticOut: { name: loc("ve.registry.localisation.SeriesSymbol_easing_quintic_out") },
					quinticInOut: { name: loc("ve.registry.localisation.SeriesSymbol_easing_quintic_in_out") },
					sinusoidalIn: { name: loc("ve.registry.localisation.SeriesSymbol_easing_sinusoidal_in") },
					sinusoidalOut: { name: loc("ve.registry.localisation.SeriesSymbol_easing_sinusoidal_out") },
					sinusoidalInOut: { name: loc("ve.registry.localisation.SeriesSymbol_easing_sinusoidal_in_out") },
					exponentialIn: { name: loc("ve.registry.localisation.SeriesSymbol_easing_exponential_in") },
					exponentialOut: { name: loc("ve.registry.localisation.SeriesSymbol_easing_exponential_out") },
					exponentialInOut: { name: loc("ve.registry.localisation.SeriesSymbol_easing_exponential_in_out") },
					circularIn: { name: loc("ve.registry.localisation.SeriesSymbol_easing_circular_in") },
					circularOut: { name: loc("ve.registry.localisation.SeriesSymbol_easing_circular_out") },
					circularInOut: { name: loc("ve.registry.localisation.SeriesSymbol_easing_circular_in_out") },
					elasticIn: { name: loc("ve.registry.localisation.SeriesSymbol_easing_elastic_in") },
					elasticOut: { name: loc("ve.registry.localisation.SeriesSymbol_easing_elastic_out") },
					elasticInOut: { name: loc("ve.registry.localisation.SeriesSymbol_easing_elastic_in_out") },
					backIn: { name: loc("ve.registry.localisation.SeriesSymbol_easing_back_in") },
					backOut: { name: loc("ve.registry.localisation.SeriesSymbol_easing_back_out") },
					backInOut: { name: loc("ve.registry.localisation.SeriesSymbol_easing_back_in_out") },
					bounceIn: { name: loc("ve.registry.localisation.SeriesSymbol_easing_bounce_in") },
					bounceOut: { name: loc("ve.registry.localisation.SeriesSymbol_easing_bounce_out") },
					bounceInOut: { name: loc("ve.registry.localisation.SeriesSymbol_easing_bounce_in_out") }
				}, {
					name: loc("ve.registry.localisation.SeriesSymbol_easing"),
					selected: (value.animationEasing) ? value.animationEasing : "linear",
					onuserchange: (v) => this.value.animationEasing = v
				}),
				easing_update: new ve.Select({
					linear: { name: loc("ve.registry.localisation.SeriesSymbol_easing_linear") },
					quadraticIn: { name: loc("ve.registry.localisation.SeriesSymbol_easing_quadratic_in") },
					quadraticOut: { name: loc("ve.registry.localisation.SeriesSymbol_easing_quadratic_out") },
					quadraticInOut: { name: loc("ve.registry.localisation.SeriesSymbol_easing_quadratic_in_out") },
					cubicIn: { name: loc("ve.registry.localisation.SeriesSymbol_easing_cubic_in") },
					cubicOut: { name: loc("ve.registry.localisation.SeriesSymbol_easing_cubic_out") },
					cubicInOut: { name: loc("ve.registry.localisation.SeriesSymbol_easing_cubic_in_out") },
					quarticIn: { name: loc("ve.registry.localisation.SeriesSymbol_easing_quartic_in") },
					quarticOut: { name: loc("ve.registry.localisation.SeriesSymbol_easing_quartic_out") },
					quarticInOut: { name: loc("ve.registry.localisation.SeriesSymbol_easing_quartic_in_out") },
					quinticIn: { name: loc("ve.registry.localisation.SeriesSymbol_easing_quintic_in") },
					quinticOut: { name: loc("ve.registry.localisation.SeriesSymbol_easing_quintic_out") },
					quinticInOut: { name: loc("ve.registry.localisation.SeriesSymbol_easing_quintic_in_out") },
					sinusoidalIn: { name: loc("ve.registry.localisation.SeriesSymbol_easing_sinusoidal_in") },
					sinusoidalOut: { name: loc("ve.registry.localisation.SeriesSymbol_easing_sinusoidal_out") },
					sinusoidalInOut: { name: loc("ve.registry.localisation.SeriesSymbol_easing_sinusoidal_in_out") },
					exponentialIn: { name: loc("ve.registry.localisation.SeriesSymbol_easing_exponential_in") },
					exponentialOut: { name: loc("ve.registry.localisation.SeriesSymbol_easing_exponential_out") },
					exponentialInOut: { name: loc("ve.registry.localisation.SeriesSymbol_easing_exponential_in_out") },
					circularIn: { name: loc("ve.registry.localisation.SeriesSymbol_easing_circular_in") },
					circularOut: { name: loc("ve.registry.localisation.SeriesSymbol_easing_circular_out") },
					circularInOut: { name: loc("ve.registry.localisation.SeriesSymbol_easing_circular_in_out") },
					elasticIn: { name: loc("ve.registry.localisation.SeriesSymbol_easing_elastic_in") },
					elasticOut: { name: loc("ve.registry.localisation.SeriesSymbol_easing_elastic_out") },
					elasticInOut: { name: loc("ve.registry.localisation.SeriesSymbol_easing_elastic_in_out") },
					backIn: { name: loc("ve.registry.localisation.SeriesSymbol_easing_back_in") },
					backOut: { name: loc("ve.registry.localisation.SeriesSymbol_easing_back_out") },
					backInOut: { name: loc("ve.registry.localisation.SeriesSymbol_easing_back_in_out") },
					bounceIn: { name: loc("ve.registry.localisation.SeriesSymbol_easing_bounce_in") },
					bounceOut: { name: loc("ve.registry.localisation.SeriesSymbol_easing_bounce_out") },
					bounceInOut: { name: loc("ve.registry.localisation.SeriesSymbol_easing_bounce_in_out") }
				}, {
					name: loc("ve.registry.localisation.SeriesSymbol_easing_update"),
					selected: (value.animationEasingUpdate) ? value.animationEasingUpdate : "cubicOut",
					onuserchange: (v) => this.value.animationEasingUpdate = v
				}),
				threshold: new ve.Number(Math.returnSafeNumber(value.threshold, 2000), {
					name: loc("ve.registry.localisation.SeriesSymbol_threshold"),
					onuserchange: (v) => this.value.threshold = v
				}),
				toggle_universal_transition: new ve.Toggle(value.universalTransition, {
					name: loc("ve.registry.localisation.SeriesSymbol_toggle_universal_transition"),
					onuserchange: (v) => value.universalTransition = v
				}),
				universal_transition: new ve.Interface({
					enabled: new ve.Toggle(value.universalTransition?.enabled, {
						name: loc("ve.registry.localisation.SeriesSymbol_enabled"),
						onuserchange: (v) => {
							if (!this.value.universalTransition) this.value.universalTransition = {};
							this.value.universalTransition.enabled = v;
						}
					}),
					
					delay: new ve.Number(Math.returnSafeNumber(value.universalTransition?.delay), {
						name: loc("ve.registry.localisation.SeriesSymbol_delay"),
						onuserchange: (v) => {
							if (!this.value.universalTransition) this.value.universalTransition = {};
							this.value.universalTransition.delay = v;
						}
					}),
					divide_shape: new ve.Select({
						clone: { name: loc("ve.registry.localisation.SeriesSymbol_clone") },
						split: { name: loc("ve.registry.localisation.SeriesSymbol_split") }
					}, {
						name: loc("ve.registry.localisation.SeriesSymbol_divide_shape"),
						selected: (value.universalTransition?.divideShape) ? value.universalTransition.divideShape : "clone",
						onuserchange: (v) => {
							if (!this.value.universalTransition) this.value.universalTransition = {};
							this.value.universalTransition.divideShape = v;
						}
					}),
					series_key: new ve.Text((value.universalTransition?.seriesKey) ? value.universalTransition.seriesKey : [""], {
						onuserchange: (v) => {
							if (!this.value.universalTransition) this.value.universalTransition = {};
							this.value.universalTransition.seriesKey = v;
						}
					})
				}, { name: loc("ve.registry.localisation.SeriesSymbol_universal_transition") })
			}, { name: loc("ve.registry.localisation.SeriesSymbol_animation") }),
			behaviour: new ve.Interface({
				colour_scheme: new ve.Select({
					data: { name: loc("ve.registry.localisation.SeriesSymbol_data") },
					series: { name: loc("ve.registry.localisation.SeriesSymbol_series") }
				}, {
					name: loc("ve.registry.localisation.SeriesSymbol_colour_scheme"),
					selected: (value.colorBy) ? value.colorBy : "data",
					onuserchange: (v) => this.value.colorBy = v
				}),
				interactive: new ve.Toggle(value.silent, {
					name: loc("ve.registry.localisation.SeriesSymbol_interactive"),
					onuserchange: (v) => this.value.silent = v
				}),
				interpolate: new ve.Number(Math.returnSafeNumber(value.interpolate), {
					name: loc("ve.registry.localisation.SeriesSymbol_interpolate"),
					onuserchange: (v) => this.value.interpolate = v
				}),
				sampling: new ve.Select({
					average: { name: loc("ve.registry.localisation.SeriesSymbol_average") },
					max: { name: loc("ve.registry.localisation.SeriesSymbol_max") },
					min: { name: loc("ve.registry.localisation.SeriesSymbol_min") },
					minmax: { name: loc("ve.registry.localisation.SeriesSymbol_minmax") },
					lttb: { name: loc("ve.registry.localisation.SeriesSymbol_lttb") },
					sum: { name: loc("ve.registry.localisation.SeriesSymbol_sum") },
					undefined: { name: loc("ve.registry.localisation.SeriesSymbol_none") }
				}, {
					name: loc("ve.registry.localisation.SeriesSymbol_sampling"),
					selected: (value.sampling) ? value.sampling : "undefined",
					onuserchange: (v) => {
						if (v === "undefined") {
							delete this.value.sampling;
							return;
						}
						this.value.sampling = v;
					}
				}),
				smoothing: new ve.Select({
					x: { name: loc("ve.registry.localisation.SeriesSymbol_x") },
					y: { name: loc("ve.registry.localisation.SeriesSymbol_y") },
					undefined: { name: loc("ve.registry.localisation.SeriesSymbol_none") }
				}, {
					name: loc("ve.registry.localisation.SeriesSymbol_smoothing"),
					selected: (value.smoothing) ? value.smoothing : "undefined",
					onuserchange: (v) => {
						if (v === "undefined") {
							delete this.value.smoothing;
							return;
						}
						this.value.selected = v;
					}
				}),
				z_index: new ve.Number(Math.returnSafeNumber(value.z), {
					name: loc("ve.registry.localisation.SeriesSymbol_z_index"),
					onuserchange: (v) => this.value.z = v
				})
			}, { name: loc("ve.registry.localisation.SeriesSymbol_behaviour") }),
			behaviour_advanced: new ve.Interface({
				blend_mode: new ve.Select({
					lighter: { name: loc("ve.registry.localisation.SeriesSymbol_lighter") },
					"source-over": { name: loc("ve.registry.localisation.SeriesSymbol_source_over") }
				}, {
					name: loc("ve.registry.localisation.SeriesSymbol_blend_mode"),
					selected: (value.blendMode) ? value.blendMode : "source-over",
					onuserchange: (v) => this.value.blendMode = v
				}),
				cursor: new ve.Text((value.cursor) ? value.cursor : "pointer", {
					name: loc("ve.registry.localisation.SeriesSymbol_cursor"),
					onuserchange: (v) => this.value.cursor = v
				}),
				hover_layer_threshold: new ve.Number(Math.returnSafeNumber(value.hoverLayerThreshold, 3000), {
					name: loc("ve.registry.localisation.SeriesSymbol_hover_layer_threshold"),
					onuserchange: (v) => this.value.hoverLayerThreshold = v
				}),
				rich_text_inherits_plain_label: new ve.Toggle(value.richInheritPlainLabel, {
					name: loc("ve.registry.localisation.SeriesSymbol_rich_text_inherits_plain_label"),
					onuserchange: (v) => this.value.richInheritPlainLabel = v
				}),
				use_UTC: new ve.Toggle(value.useUTC, {
					name: loc("ve.registry.localisation.SeriesSymbol_use_utc"),
					onuserchange: (v) => this.value.useUTC = v
				})
			}, { name: loc("ve.registry.localisation.SeriesSymbol_behaviour_advanced") }),
			behaviour_stack: new ve.Interface({
				stack: new ve.Text(value.stack, {
					name: loc("ve.registry.localisation.SeriesSymbol_stack"),
					onuserchange: (v) => this.value.stack = v
				}),
				stack_mode: new ve.Select({
					all: { name: loc("ve.registry.localisation.SeriesSymbol_all") },
					negative: { name: loc("ve.registry.localisation.SeriesSymbol_negative") },
					positive: { name: loc("ve.registry.localisation.SeriesSymbol_positive") },
					samesign: { name: loc("ve.registry.localisation.SeriesSymbol_same_sign") }
				}, {
					name: loc("ve.registry.localisation.SeriesSymbol_stack_mode"),
					selected: (value.stackStrategy) ? value.stackStrategy : "samesign",
					onuserchange: (v) => this.value.stackStrategy = v
				}),
				stack_order: new ve.Select({
					seriesAsc: { name: loc("ve.registry.localisation.SeriesSymbol_order_series_asc") },
					seriesDesc: { name: loc("ve.registry.localisation.SeriesSymbol_order_series_desc") }
				}, {
					name: loc("ve.registry.localisation.SeriesSymbol_stack_order"),
					selected: (value.stackOrder) ? value.stackOrder : "seriesAsc",
					onuserchange: (v) => this.value.stackOrder = v
				})
			}, { name: loc("ve.registry.localisation.SeriesSymbol_behaviour_stack") }),
			coordinates: new ve.Interface({
				_height: new ve.Text((value.height) ? value.height : "auto", {
					name: loc("ve.registry.localisation.SeriesSymbol_height"),
					onuserchange: (v) => {
						if (!isNaN(parseFloat(v))) v = parseFloat(v);
						this.value.height = v;
					}
				}),
				_width: new ve.Text((value.width) ? value.width : "auto", {
					name: loc("ve.registry.localisation.SeriesSymbol_width"),
					onuserchange: (v) => {
						if (!isNaN(parseFloat(v))) v = parseFloat(v);
						this.value.width = v;
					}
				}),
				
				bottom: new ve.Text((value.bottom) ? value.bottom : "auto", {
					name: loc("ve.registry.localisation.SeriesSymbol_bottom"),
					selected: (value.bottom) ? value.bottom : "auto",
					onuserchange: (v) => this.value.bottom = v
				}),
				left: new ve.Text((value.left) ? value.left : "auto", {
					name: loc("ve.registry.localisation.SeriesSymbol_left"),
					selected: (value.left) ? value.left : "auto",
					onuserchange: (v) => this.value.left = v
				}),
				right: new ve.Text((value.right) ? value.right : "auto", {
					name: loc("ve.registry.localisation.SeriesSymbol_right"),
					selected: (value.right) ? value.right : "auto",
					onuserchange: (v) => this.value.right = v
				}),
				top: new ve.Text((value.top) ? value.top : "auto", {
					name: loc("ve.registry.localisation.SeriesSymbol_top"),
					selected: (value.top) ? value.top : "auto",
					onuserchange: (v) => this.value.top = v
				})
			}, { name: loc("ve.registry.localisation.SeriesSymbol_coordinates") }),
			coordinates_advanced: new ve.Interface({
				coordinate_system: new ve.Select({
					"cartesian2d": { name: loc("ve.registry.localisation.SeriesSymbol_cartesian_2d") },
					polar: { name: loc("ve.registry.localisation.SeriesSymbol_polar") }
				}, {
					name: loc("ve.registry.localisation.SeriesSymbol_coordinate_system"),
					selected: (value.coordinateSystem) ? value.coordinateSystem : "cartesian2d",
					onuserchange: (v) => this.value.coordinateSystem = v
				}),
				polar_index: new ve.Number(Math.returnSafeNumber(value.polarIndex), {
					name: loc("ve.registry.localisation.SeriesSymbol_polar_index"),
					onuserchange: (v) => this.value.polarIndex = v
				}),
				x_axis_index: new ve.Number(Math.returnSafeNumber(value.xAxisIndex), {
					name: loc("ve.registry.localisation.SeriesSymbol_x_axis_index"),
					onuserchange: (v) => this.value.xAxisIndex = v
				}),
				y_axis_index: new ve.Number(Math.returnSafeNumber(value.yAxisIndex), {
					name: loc("ve.registry.localisation.SeriesSymbol_y_axis_index"),
					onuserchange: (v) => this.value.yAxisIndex = v
				})
			}, { name: loc("ve.registry.localisation.SeriesSymbol_coordinates_advanced") }),
			coordinates_assignment: new ve.Interface({
				calendar_id: new ve.Number(Math.returnSafeNumber(value.calendarId), {
					name: loc("ve.registry.localisation.SeriesSymbol_calendar_id"),
					onuserchange: (v) => this.value.calendarId = v
				}),
				calendar_index: new ve.Number(Math.returnSafeNumber(value.calendarIndex), {
					name: loc("ve.registry.localisation.SeriesSymbol_calendar_index"),
					onuserchange: (v) => this.value.calendarIndex = v
				}),
				geo_id: new ve.Number(Math.returnSafeNumber(value.geoId), {
					name: loc("ve.registry.localisation.SeriesSymbol_geo_io"),
					onuserchange: (v) => this.value.geoId = v
				}),
				geo_index: new ve.Number(Math.returnSafeNumber(value.geoIndex), {
					name: loc("ve.registry.localisation.SeriesSymbol_geo_index"),
					onuserchange: (v) => this.value.geoIndex = v
				}),
				matrix_id: new ve.Number(Math.returnSafeNumber(value.matrixId), {
					name: loc("ve.registry.localisation.SeriesSymbol_matrix_io"),
					onuserchange: (v) => this.value.matrixId = v
				}),
				matrix_index: new ve.Number(Math.returnSafeNumber(value.matrixIndex), {
					name: loc("ve.registry.localisation.SeriesSymbol_matrix_index"),
					onuserchange: (v) => this.value.matrixIndex = v
				}),
			}, { name: loc("ve.registry.localisation.SeriesSymbol_coordinates_assignment") }),
			events: new ve.Interface({
				onblur: new ve.Interface({
					end_label_symbol: new ve.DatavisSuite.LabelSymbol(value.blur?.endLabel, {
						name: loc("ve.registry.localisation.SeriesSymbol_end_label_symbol"),
						onuserchange: (v) => {
							if (!this.value.blur) this.value.blur = {};
							this.value.blur.endLabel = v;
						}
					}).interface,
					fill_symbol: new ve.DatavisSuite.FillSymbol(value.blur?.areaStyle, {
						name: loc("ve.registry.localisation.SeriesSymbol_fill_symbol"),
						onuserchange: (v) => {
							if (!this.value.blur) this.value.blur = {};
							this.value.blur.areaStyle = v;
						}
					}).interface,
					label_symbol: new ve.DatavisSuite.LabelSymbol(value.blur?.label, {
						name: loc("ve.registry.localisation.SeriesSymbol_label_symbol"),
						onuserchange: (v) => {
							if (!this.value.blur) this.value.blur = {};
							this.value.blur.label = v;
						}
					}).interface,
					label_stroke_symbol: new ve.DatavisSuite.StrokeSymbol(value.blur?.labelLine?.lineStyle, {
						name: loc("ve.registry.localisation.SeriesSymbol_label_stroke_symbol"),
						onuserchange: (v) => {
							if (!this.value.blur) this.value.blur = {};
							if (!this.value.blur.labelLine) this.value.blur.labelLine = {};
							this.value.blur.labelLine.lineStyle = v;
						}
					}).interface,
					point_symbol: new ve.DatavisSuite.PointSymbol(value.blur?.itemStyle, {
						name: loc("ve.registry.localisation.SeriesSymbol_point_symbol"),
						onuserchange: (v) => {
							if (!this.value.blur) this.value.blur = {};
							this.value.blur.itemStyle = v;
						}
					}).interface,
					stroke_symbol: new ve.DatavisSuite.StrokeSymbol(value.blur?.lineStyle, {
						name: loc("ve.registry.localisation.SeriesSymbol_stroke_symbol"),
						onuserchange: (v) => {
							if (!this.value.blur) this.value.blur = {};
							this.value.blur.lineStyle = v;
						}
					}).interface
				}, { name: loc("ve.registry.localisation.SeriesSymbol_onblur") }),
				onhover: new ve.Interface({
					focus: new ve.Select({
						self: { name: loc("ve.registry.localisation.SeriesSymbol_self") },
						series: { name: loc("ve.registry.localisation.SeriesSymbol_series") }
					}, {
						name: loc("ve.registry.localisation.SeriesSymbol_focus"),
						selected: (value.emphasis?.focus) ? value.emphasis.focus : "series",
						onuserchange: (v) => {
							if (!this.value.emphasis) this.value.emphasis = {};
							this.value.emphasis.focus = v;
						}
					}),
					highlight: new ve.Toggle(value.emphasis?.legendHoverLink, {
						name: loc("ve.registry.localisation.SeriesSymbol_highlight"),
						onuserchange: (v) => this.value.emphasis.legendHoverLink = v
					}),
					scale: new ve.Number(Math.returnSafeNumber(value.emphasis?.scale, 1.1), {
						name: loc("ve.registry.localisation.SeriesSymbol_scale"),
						onuserchange: (v) => {
							if (!this.value.emphasis) this.value.emphasis = {};
							this.value.emphasis.scale = v;
						}
					}),
					
					blur_scope: new ve.Select({
						coordinateSystem: { name: loc("ve.registry.localisation.SeriesSymbol_coordinate_system") },
						global: { name: loc("ve.registry.localisation.SeriesSymbol_global") },
						series: { name: loc("ve.registry.localisation.SeriesSymbol_series") }
					}, {
						name: loc("ve.registry.localisation.SeriesSymbol_blur_scope"),
						selected: (value.emphasis?.blurScope) ? value.emphasis.blurScope : "coordinateSystem",
						onuserchange: (v) => {
							if (!this.value.emphasis) this.value.emphasis = {};
							this.value.emphasis.blurScope = v;
						}
					}),
					
					end_label_symbol: new ve.DatavisSuite.LabelSymbol(value.emphasis?.endLabel, {
						name: loc("ve.registry.localisation.SeriesSymbol_end_label_symbol"),
						onuserchange: (v) => {
							if (!this.value.emphasis) this.value.emphasis = {};
							this.value.emphasis.endLabel = v;
						}
					}).interface,
					fill_symbol: new ve.DatavisSuite.FillSymbol(value.emphasis?.areaStyle, {
						name: loc("ve.registry.localisation.SeriesSymbol_fill_symbol"),
						onuserchange: (v) => {
							if (!this.value.emphasis) this.value.emphasis = {};
							this.value.emphasis.areaStyle = v;
						}
					}).interface,
					label_symbol: new ve.DatavisSuite.LabelSymbol(value.emphasis?.label, {
						name: loc("ve.registry.localisation.SeriesSymbol_label_symbol"),
						onuserchange: (v) => {
							if (!this.value.emphasis) this.value.emphasis = {};
							this.value.emphasis.label = v;
						}
					}).interface,
					point_symbol: new ve.DatavisSuite.PointSymbol(value.emphasis?.itemStyle, {
						name: loc("ve.registry.localisation.SeriesSymbol_point_symbol"),
						onuserchange: (v) => {
							if (!this.value.emphasis) this.value.emphasis = {};
							this.value.emphasis.itemStyle = v;
						}
					}).interface,
					stroke_symbol: new ve.DatavisSuite.StrokeSymbol(value.emphasis?.lineStyle, {
						name: loc("ve.registry.localisation.SeriesSymbol_stroke_symbol"),
						onuserchange: (v) => {
							if (!this.value.emphasis) this.value.emphasis = {};
							this.value.emphasis.lineStyle = v;
						}
					}).interface
				}, { name: loc("ve.registry.localisation.SeriesSymbol_onhover") }),
				onselect: new ve.Interface({
					end_label_symbol: new ve.DatavisSuite.LabelSymbol(value.select?.endLabel, {
						name: loc("ve.registry.localisation.SeriesSymbol_end_label_symbol"),
						onuserchange: (v) => {
							if (!this.value.select) this.value.select = {};
							this.value.select.endLabel = v;
						}
					}).interface,
					fill_symbol: new ve.DatavisSuite.FillSymbol(value.select?.areaStyle, {
						name: loc("ve.registry.localisation.SeriesSymbol_fill_symbol"),
						onuserchange: (v) => {
							if (!this.value.select) this.value.select = {};
							this.value.select.areaStyle = v;
						}
					}).interface,
					label_symbol: new ve.DatavisSuite.LabelSymbol(value.select?.label, {
						name: loc("ve.registry.localisation.SeriesSymbol_label_symbol"),
						onuserchange: (v) => {
							if (!this.value.select) this.value.select = {};
							this.value.select.label = v;
						}
					}).interface,
					label_stroke_symbol: new ve.DatavisSuite.StrokeSymbol(value.select?.labelLine?.lineStyle, {
						name: loc("ve.registry.localisation.SeriesSymbol_label_stroke_symbol"),
						onuserchange: (v) => {
							if (!this.value.select) this.value.select = {};
							if (!this.value.select.labelLine) this.value.select.labelLine = {};
							this.value.select.labelLine.lineStyle = v;
						}
					}).interface,
					point_symbol: new ve.DatavisSuite.PointSymbol(value.select?.itemStyle, {
						name: loc("ve.registry.localisation.SeriesSymbol_point_symbol"),
						onuserchange: (v) => {
							if (!this.value.select) this.value.select = {};
							this.value.select.itemStyle = v;
						}
					}).interface,
					stroke_symbol: new ve.DatavisSuite.StrokeSymbol(value.select?.lineStyle, {
						name: loc("ve.registry.localisation.SeriesSymbol_stroke_symbol"),
						onuserchange: (v) => {
							if (!this.value.select) this.value.select = {};
							this.value.select.lineStyle = v;
						}
					}).interface
				}, { name: loc("ve.registry.localisation.SeriesSymbol_onselect") })
			}, { name: loc("ve.registry.localisation.SeriesSymbol_events") }),
			fill_symbol: new ve.DatavisSuite.FillSymbol({
				...value.areaStyle,
				...value.backgroundStyle
			}, {
				name: loc("ve.registry.localisation.SeriesSymbol_fill_symbol"),
				onuserchange: (v) => {
					this.value.areaStyle = v;
					this.value.backgroundStyle = v;
				}
			}).interface,
			stroke_symbol: new ve.DatavisSuite.StrokeSymbol(value.lineStyle, {
				name: loc("ve.registry.localisation.SeriesSymbol_stroke_symbol"),
				onuserchange: (v) => this.value.lineStyle = v
			}).interface,
			tooltip: new ve.Interface({
				label_symbol: new ve.DatavisSuite.LabelSymbol(value.tooltip?.textStyle, {
					name: loc("ve.registry.localisation.SeriesSymbol_label_symbol"),
					onuserchange: (v) => {
						if (!this.value.tooltip) this.value.tooltip = {};
						this.value.tooltip.textStyle = v;
					}
				}).interface,
				tooltip_symbol: new ve.DatavisSuite.TooltipSymbol(value.tooltip, {
					name: loc("ve.registry.localisation.SeriesSymbol_tooltip_symbol"),
					onuserchange: (v) => {
						if (!this.value.tooltip) this.value.tooltip = {};
						this.value.tooltip = {
							...this.value.tooltip,
							...v
						};
					}
				}).interface
			}, { name: loc("ve.registry.localisation.SeriesSymbol_tooltip") }),
			optimisation: new ve.Interface({
				large: new ve.Toggle(value.large, {
					name: loc("ve.registry.localisation.SeriesSymbol_large"),
					onuserchange: (v) => this.value.large = v
				}),
				large_threshold: new ve.Number(Math.returnSafeNumber(value.largeThreshold, 400), {
					name: loc("ve.registry.localisation.SeriesSymbol_large_threshold"),
					onuserchange: (v) => this.value.largeThreshold = v
				}),
				progressive: new ve.Number(Math.returnSafeNumber(value.progressive, 5000), {
					name: loc("ve.registry.localisation.SeriesSymbol_progressive"),
					onuserchange: (v) => this.value.progressive = v
				}),
				progressive_chunk_mode: new ve.Select({
					mod: { name: loc("ve.registry.localisation.SeriesSymbol_mod") },
					sequential: { name: loc("ve.registry.localisation.SeriesSymbol_sequential") }
				}, {
					name: loc("ve.registry.localisation.SeriesSymbol_progressive_chunk_mode"),
					selected: (value.progressiveChunkMode) ? value.progressiveChunkMode : "mod",
					onuserchange: (v) => this.value.progressiveChunkMode = v
				}),
				progressive_threshold: new ve.Number(Math.returnSafeNumber(value.progressiveThreshold, 3000), {
					name: loc("ve.registry.localisation.SeriesSymbol_progressive_threshold"),
					onuserchange: (v) => this.value.progressiveThreshold = v
				})
			}, { name: loc("ve.registry.localisation.SeriesSymbol_optimisation") })
		}, {
			name: (this.options.name) ? this.options.name : loc("ve.registry.localisation.SeriesSymbol_series_symbol"),
			onuserchange: (v, e) => {
				delete this.do_not_fire_to_binding;
				this.fireToBinding();
			},
			open: true
		});
		this.interface.setOwner(this, [this]);
		this.interface.bind(this.element);
	}
};