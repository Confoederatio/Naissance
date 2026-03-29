/**
 * Internal sub-component of <span color = "yellow">{@link ve.DatavisSuite}</span>.
 *
 * Please refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 *
 * ##### Constructor:
 * - `arg0_value`: {@link Object}
 * - `arg1_options`: {@link Object}
 *   - `.datavis_suite_obj`: {@link ve.DatavisSuite} - The DatavisSuite that the X Axis Symbol is attached to.
 *   - `.graph_obj`: {@link ve.Graph} - The graph to bind the given symbol to.
 *   - `.name="<X/Y/Z> Axis Symbol"`: {@link string}
 */
ve.DatavisSuite.AxisSymbol = class extends ve.Component {
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = (arg0_value) ? arg0_value : {};
		let options = (arg1_options) ? arg1_options : {};
			super(options);
		
		//Initialise options
		options.attributes = (options.attributes) ? options.attributes : {};
		
		//Declare local instance variables
		this.element = document.createElement("div");
			this.element.setAttribute("component", "ve-datavis-suite-x-axis-symbol");
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
		let data_series = {};
		let position_obj = new ve.Select({
			top: { name: loc("ve.registry.localisation.AxisSymbol_top") },
			bottom: { name: loc("ve.registry.localisation.AxisSymbol_bottom") }
		}, {
			name: loc("ve.registry.localisation.AxisSymbol_position"),
			selected: (this.value.position) ? this.value.position : "bottom",
			onuserchange: (v) => this.value.position = v
		});
			if (this.options.axis_type === "y")
				position_obj = new ve.Select({
					left: { name: loc("ve.registry.localisation.AxisSymbol_left") },
					right: { name: loc("ve.registry.localisation.AxisSymbol_right") }
				}, {
					name: loc("ve.registry.localisation.AxisSymbol_position"),
					selected: (this.value.position) ? this.value.position : "left",
					onuserchange: (v) => this.value.position = v
				})
		
		if (this.options.datavis_suite_obj) {
			let datavis_suite_obj = this.options.datavis_suite_obj;
			
			let all_series_names = datavis_suite_obj.getAllSeriesNames();
			let series_options = {
				name: loc("ve.registry.localisation.AxisSymbol_axis_ticks_data_series"),
				tooltip: loc("ve.registry.localisation.AxisSymbol_tooltip_axis_ticks_data_series"),
				selected: (this.value.data_series?.length > 0) ? all_series_names[this.value.data_series] : undefined,
				onuserchange: (v) => {
					if (v === "") {
						delete this.value.data_series;
						veToast(loc("ve.registry.localisation.AxisSymbol_toast_cleared_data_series"));
						return;
					}
					if (!datavis_suite_obj.series[v]) {
						veToast(`<icon>warning</icon> ${loc("ve.registry.localisation.AxisSymbol_toast_invalid_data_series")}`);
					} else {
						this.value.data = this.getDataSeries(v);
						this.value.data_series = v;
					}
				}
			};
			data_series.data_series = new ve.Datalist(all_series_names, series_options);
				data_series.placeholder = all_series_names;
		}
		
		//Parse value
		this.element.innerHTML = "";
		this.interface = new ve.Interface({
			x_axis_name: new ve.Text((value.name) ? value.name : "", {
				name: loc("ve.registry.localisation.AxisSymbol_name"),
				onuserchange: (v) => this.value.name = v
			}),
			name_gap: new ve.Number(Math.returnSafeNumber(value.name_gap, 15), {
				name: loc("ve.registry.localisation.AxisSymbol_name_gap"),
				onuserchange: (v) => this.value.nameGap = v
			}),
			name_location: new ve.Select({
				start: { name: loc("ve.registry.localisation.AxisSymbol_start") },
				middle: { name: loc("ve.registry.localisation.AxisSymbol_middle") },
				end: { name: loc("ve.registry.localisation.AxisSymbol_end") }
			}, {
				name: loc("ve.registry.localisation.AxisSymbol_name_location"),
				selected: (value.name_location) ? value.name_location : "end",
				onuserchange: (v) => this.value.nameEnd = v
			}),
			name_move_overlap: new ve.Toggle(value.nameMoveOverlap, {
				name: loc("ve.registry.localisation.AxisSymbol_name_move_overlap"),
				onuserchange: (v) => this.value.nameMoveOverlap = v
			}),
			name_rotate: new ve.Number(Math.returnSafeNumber(value.nameRotate, 0), {
				name: loc("ve.registry.localisation.AxisSymbol_name_rotate"),
				onuserchange: (v) => this.value.nameRotate = v
			}),
			type: new ve.Select({
				value: { name: loc("ve.registry.localisation.AxisSymbol_value") },
				category: { name: loc("ve.registry.localisation.AxisSymbol_category") },
				time: { name: loc("ve.registry.localisation.AxisSymbol_time") },
				log: { name: loc("ve.registry.localisation.AxisSymbol_log") }
			}, {
				name: loc("ve.registry.localisation.AxisSymbol_type"),
				selected: (value.type) ? value.type : "value",
				onuserchange: (v) => this.value.type = v
			}),
			
			data: new ve.Text((value.data) ? value.data : [""], {
				name: loc("ve.registry.localisation.AxisSymbol_axis_ticks"),
				onuserchange: (v) => {
					console.log("this.value.data", v);
					this.value.data = v;
				}
			}),
			...data_series,
			
			axis_label: new ve.Interface({
				show: new ve.Toggle(this.value.axisLabel?.show, {
					name: loc("ve.registry.localisation.AxisSymbol_show_axis_label"),
					onuserchange: (v) => {
						if (!this.value.axisLabel) this.value.axisLabel = {};
						this.value.axisLabel = v;
					}
				}),
				
				align_max_label: new ve.Select({
					left: { name: loc("ve.registry.localisation.AxisSymbol_left") },
					center: { name: loc("ve.registry.localisation.AxisSymbol_centre") },
					right: { name: loc("ve.registry.localisation.AxisSymbol_right") },
					none: { name: loc("ve.registry.localisation.AxisSymbol_none") }
				}, {
					name: loc("ve.registry.localisation.AxisSymbol_align_max_label"),
					onuserchange: (v) => {
						if (!this.value.axisLabel) this.value.axisLabel = {};
						if (v !== "none") {
							this.value.axisLabel.alignMaxLabel = v;
						} else {
							this.value.axisLabel.alignMaxLabel = null;
						}
					}
				}),
				align_min_label: new ve.Select({
					left: { name: loc("ve.registry.localisation.AxisSymbol_left") },
					center: { name: loc("ve.registry.localisation.AxisSymbol_centre") },
					right: { name: loc("ve.registry.localisation.AxisSymbol_right") },
					none: { name: loc("ve.registry.localisation.AxisSymbol_none") }
				}, {
					name: loc("ve.registry.localisation.AxisSymbol_align_min_label"),
					onuserchange: (v) => {
						if (!this.value.axisLabel) this.value.axisLabel = {};
						if (v !== "none") {
							this.value.axisLabel.alignMaxLabel = v;
						} else {
							this.value.axisLabel.alignMaxLabel = null;
						}
					}
				}),
				custom_values: new ve.Number((value.axisLabel?.customValues) ? value.axisLabel.customValues : [0], {
					name: loc("ve.registry.localisation.AxisSymbol_custom_values"),
					onuserchange: (v) => {
						if (!this.value.axisLabel) this.value.axisLabel = {};
						this.value.axisLabel.customValues = v;
					}
				}),
				formatter: new ve.Text((value.axisLabel?.formatter) ? value.axisLabel.formatter : "", {
					name: loc("ve.registry.localisation.AxisSymbol_formatter"),
					tooltip: loc("ve.registry.localisation.AxisSymbol_tooltip_formatter"),
					onuserchange: (v) => {
						if (!this.value.axisLabel) this.value.axisLabel = {};
						this.value.axisLabel.formatter = v;
					}
				}),
				hide_overlap: new ve.Toggle((value.axisLabel?.hideOverlap !== undefined) ? value.axisLabel.hideOverlap : false, {
					name: loc("ve.registry.localisation.AxisSymbol_hide_overlap"),
					onuserchange: (v) => {
						if (!this.value.axisLabel) this.value.axisLabel = {};
						this.value.axisLabel.hideOverlap = v;
					}
				}),
				inside: new ve.Toggle((value.axisLabel?.inside !== undefined) ? value.axisLabel.inside : false, {
					name: loc("ve.registry.localisation.AxisSymbol_inside"),
					onuserchange: (v) => {
						if (!this.value.axisLabel) this.value.axisLabel = {};
						this.value.axisLabel.inside = v;
					}
				}),
				interval: new ve.Text((value.axisLabel?.interval !== undefined) ? value.axisLabel.interval : "auto", {
					name: loc("ve.registry.localisation.AxisSymbol_interval"),
					onuserchange: (v) => {
						if (!this.value.axisLabel) this.value.axisLabel = {};
						if (!isNaN(parseFloat(v))) v = parseFloat(v);
						this.value.axisLabel.interval = v;
					}
				}),
				margin: new ve.Number(Math.returnSafeNumber(value.axisLabel?.margin, 8), {
					name: loc("ve.registry.localisation.AxisSymbol_margin"),
					onuserchange: (v) => {
						if (!this.value.axisLabel) this.value.axisLabel = {};
						this.value.axisLabel.margin = v;
					}
				}),
				rotate: new ve.Number(Math.returnSafeNumber(value.axisLabel?.rotate, 0), {
					name: loc("ve.registry.localisation.AxisSymbol_rotate"),
					onuserchange: (v) => {
						if (!this.value.axisLabel) this.value.axisLabel = {};
						this.value.axisLabel.rotate = v;
					}
				}),
				show_max_label: new ve.Toggle(value.axisLabel?.showMaxLabel, {
					name: loc("ve.registry.localisation.AxisSymbol_show_max_label"),
					onuserchange: (v) => {
						if (!this.value.axisLabel) this.value.axisLabel = {};
						this.value.axisLabel.showMaxLabel = v;
					}
				}),
				show_min_label: new ve.Toggle(value.axisLabel?.showMinLabel, {
					name: loc("ve.registry.localisation.AxisSymbol_show_min_label"),
					onuserchange: (v) => {
						if (!this.value.axisLabel) this.value.axisLabel = {};
						this.value.axisLabel.showMinLabel = v;
					}
				}),
				label_symbol: new ve.DatavisSuite.LabelSymbol(value.axisLabel, {
					name: loc("ve.registry.localisation.AxisSymbol_label_symbol"),
					onuserchange: (v, e) => {
						if (!this.value.axisLabel) this.value.axisLabel = {};
						this.value.axisLabel = {
							...this.value.axisLabel,
							...e.value
						};
					}
				}).interface,
				stroke_symbol: new ve.DatavisSuite.StrokeSymbol(value.axisLabel, {
					name: loc("ve.registry.localisation.AxisSymbol_stroke_symbol"),
					onuserchange: (v, e) => {
						if (!this.value.axisLabel) this.value.axisLabel = {};
						this.value.axisLabel = {
							...this.value.axisLabel,
							...e.value
						};
					}
				}).interface
			}, {
				name: loc("ve.registry.localisation.AxisSymbol_axis_label")
			}),
			axis_line: new ve.Interface({
				show: new ve.Toggle(value.axisLine?.show, {
					name: loc("ve.registry.localisation.AxisSymbol_show"),
					onuserchange: (v, e) => {
						if (!this.value.axisLine) this.value.axisLine = {};
						this.value.axisLine.show = v;
					}
				}),
				
				on_zero: new ve.Toggle(value.axisLine?.onZero, {
					name: loc("ve.registry.localisation.AxisSymbol_on_zero"),
					onuserchange: (v) => {
						if (!this.value.axisLine) this.value.axisLine = {};
						this.value.axisLine.onZero = v;
					}
				}),
				on_zero_axis_index: new ve.Number(Math.returnSafeNumber(value.axisLine?.onZeroAxisIndex), {
					name: loc("ve.registry.localisation.AxisSymbol_on_zero_axis_index"),
					onuserchange: (v) => {
						if (!this.value.axisLine) this.value.axisLine = {};
						this.value.axisLine.onZeroAxisIndex = v;
					}
				}),
				stroke_symbol: new ve.DatavisSuite.StrokeSymbol(Math.returnSafeNumber(value.axisLine?.lineStyle), {
					name: loc("ve.registry.localisation.AxisSymbol_stroke_symbol"),
					onuserchange: (v) => {
						if (!this.value.axisLine) this.value.axisLine = {};
						this.value.axisLine.lineStyle = v;
					}
				}).interface,
				symbol: new ve.Select({
					"none-none": { name: loc("ve.registry.localisation.AxisSymbol_symbol_none_none") },
					"arrow-arrow": { name: loc("ve.registry.localisation.AxisSymbol_symbol_arrow_arrow") },
					"arrow-none": { name: loc("ve.registry.localisation.AxisSymbol_symbol_arrow_none") },
					"none-arrow": { name: loc("ve.registry.localisation.AxisSymbol_symbol_none_arrow") }
				}, {
					selected: (value.axisLine?.symbol) ? value.axisLine.symbol.join("-") : "none-none",
					onuserchange: (v) => {
						if (!this.value.axisLine) this.value.axisLine = {};
						this.value.axisLine.symbol = v.split("-");
					}
				}),
				symbol_size: new ve.RawInterface({
					symbol_size_x: new ve.Number(Math.returnSafeNumber(value.axisLine?.symbolSize?.[0]), {
						name: loc("ve.registry.localisation.AxisSymbol_x")
					}),
					symbol_size_y: new ve.Number(Math.returnSafeNumber(value.axisLine?.symbolSize?.[1]), {
						name: loc("ve.registry.localisation.AxisSymbol_y")
					})
				}, { 
					name: loc("ve.registry.localisation.AxisSymbol_symbol_size"),
					onuserchange: (v) => {
						if (!this.value.axisLine) this.value.axisLine = {};
						this.value.axisLine.symbolSize = [v.symbol_size_x.v, v.symbol_size_y.v];
					}
				}),
				symbol_offset: new ve.RawInterface({
					symbol_offset_x: new ve.Number(Math.returnSafeNumber(value.axisLine?.symbolOffset?.[0]), {
						name: loc("ve.registry.localisation.AxisSymbol_x")
					}),
					symbol_offset_y: new ve.Number(Math.returnSafeNumber(value.axisLine?.symbolOffset?.[1]), {
						name: loc("ve.registry.localisation.AxisSymbol_y")
					})
				}, {
					name: loc("ve.registry.localisation.AxisSymbol_symbol_offset"),
					onuserchange: (v) => {
						if (!this.value.axisLine) this.value.axisLine = {};
						if (v.symbol_offset_x.v === 0 && v.symbol_offset_y.v === 0) return;
						this.value.axisLine.symbolOffset = [v.symbol_offset_x.v, v.symbol_offset_y.v];
					}
				})
			}, {
				name: loc("ve.registry.localisation.AxisSymbol_axis_line")
			}),
			axis_pointer: new ve.Interface({
				show: new ve.Toggle(value.axisPointer?.show, {
					name: loc("ve.registry.localisation.AxisSymbol_show"),
					onuserchange: (v) => {
						if (!this.value.axisPointer) this.value.axisPointer = {};
						this.value.axisPointer.show = v;
					}
				}),
				label_symbol: new ve.DatavisSuite.LabelSymbol(value.axisPointer?.label, {
					name: loc("ve.registry.localisation.AxisSymbol_label_symbol"),
					onuserchange: (v) => {
						if (!this.value.axisPointer) this.value.axisPointer = {};
						this.value.axisPointer.label = v;
					}
				}).interface,
				on_hover_emphasis: new ve.Toggle(value.axisPointer?.triggerEmphasis, {
					name: loc("ve.registry.localisation.AxisSymbol_onhover_emphasis"),
					onuserchange: (v) => {
						if (!this.value.axisPointer) this.value.axisPointer = {};
						this.value.axisPointer.triggerEmphasis = v;
					}
				}),
				on_hover_tooltip: new ve.Toggle(value.axisPointer?.triggerTooltip, {
					name: loc("ve.registry.localisation.AxisSymbol_onhover_tooltip"),
					onuserchange: (v) => {
						if (!this.value.axisPointer) this.value.axisPointer = {};
						this.value.axisPointer.triggerTooltip = v;
					}
				}),
				shadow_blur: new ve.Number(Math.returnSafeNumber(value.axisPointer?.shadowStyle?.shadowBlur, 0), {
					name: loc("ve.registry.localisation.AxisSymbol_shadow_blur"),
					onuserchange: (v) => {
						if (!this.value.axisPointer) this.value.axisPointer = {};
						if (!this.value.axisPointer.shadowStyle) this.value.axisPointer.shadowStyle = {};
						this.value.axisPointer.shadowStyle.shadowBlur = v;
					}
				}),
				shadow_colour: new ve.Colour((value.axisPointer?.shadowStyle?.shadowColor) ? value.axisPointer.shadowStyle.shadowColor : "#000", {
					name: loc("ve.registry.localisation.AxisSymbol_shadow_colour"),
					onuserchange: (v) => {
						if (!this.value.axisPointer) this.value.axisPointer = {};
						if (!this.value.axisPointer.shadowStyle) this.value.axisPointer.shadowStyle = {};
						this.value.axisPointer.shadowStyle.shadowColor = v;
					}
				}),
				shadow_offset_x: new ve.Number(Math.returnSafeNumber(value.axisPointer?.shadowStyle?.shadowOffsetX), {
					name: loc("ve.registry.localisation.AxisSymbol_shadow_offset_x"),
					onuserchange: (v) => {
						if (!this.value.axisPointer) this.value.axisPointer = {};
						if (!this.value.axisPointer.shadowStyle) this.value.axisPointer.shadowStyle = {};
						this.value.axisPointer.shadowStyle.shadowOffsetX = v;
					}
				}),
				shadow_offset_y: new ve.Number(Math.returnSafeNumber(value.axisPointer?.shadowStyle?.shadowOffsetY), {
					name: loc("ve.registry.localisation.AxisSymbol_shadow_offset_y"),
					onuserchange: (v) => {
						if (!this.value.axisPointer) this.value.axisPointer = {};
						if (!this.value.axisPointer.shadowStyle) this.value.axisPointer.shadowStyle = {};
						this.value.axisPointer.shadowStyle.shadowOffsetY = v;
					}
				}),
				snap_to: new ve.Toggle(value.axisPointer?.shadowStyle?.snap, {
					name: loc("ve.registry.localisation.AxisSymbol_snap_to"),
					onuserchange: (v) => {
						if (!this.value.axisPointer) this.value.axisPointer = {};
						this.value.axisPointer.snap = v;
					}
				}),
				status: new ve.Toggle(value.axisPointer?.status, {
					name: loc("ve.registry.localisation.AxisSymbol_status"),
					onuserchange: (v) => {
						if (!this.value.axisPointer) this.value.axisPointer = {};
						this.value.axisPointer.status = v;
					}
				}),
				stroke_symbol: new ve.DatavisSuite.StrokeSymbol(value.axisPointer?.lineStyle, {
					name: loc("ve.registry.localisation.AxisSymbol_stroke_symbol"),
					onuserchange: (v) => {
						if (!this.value.axisPointer) this.value.axisPointer = {};
						this.value.axisPointer.lineStyle = v;
					}
				}).interface,
				type: new ve.Select({
					line: { name: loc("ve.registry.localisation.AxisSymbol_line") },
					shadow: { name: loc("ve.registry.localisation.AxisSymbol_shadow") },
					none: { name: loc("ve.registry.localisation.AxisSymbol_none") }
				}, {
					name: loc("ve.registry.localisation.AxisSymbol_type"),
					onuserchange: (v) => {
						if (!this.value.axisPointer) this.value.axisPointer = {};
						this.value.axisPointer.type = v;
					}
				}),
				value: new ve.Number(Math.returnSafeNumber(this.value?.axisPointer?.value), {
					name: loc("ve.registry.localisation.AxisSymbol_value"),
					onuserchange: (v) => {
						if (!this.value.axisPointer) this.value.axisPointer = {};
						this.value.axisPointer.value = v;
					}
				}),
				z_index: new ve.Number(Math.returnSafeNumber(this.value?.axisPointer?.z), {
					name: loc("ve.registry.localisation.AxisSymbol_z_index"),
					onuserchange: (v) => {
						if (!this.value.axisPointer) this.value.axisPointer = {};
						this.value.axisPointer.z = v;
					}
				})
			}, {
				name: loc("ve.registry.localisation.AxisSymbol_axis_pointer")
			}),
			axis_tick: new ve.Interface({
				show: new ve.Toggle(this.value?.axisTick?.show, {
					name: loc("ve.registry.localisation.AxisSymbol_show"),
					onuserchange: (v) => {
						if (!this.value.axisTick) this.value.axisTick = {};
						this.value.axisTick.show = v;
					}
				}),
				align_with_label: new ve.Toggle(this.value?.axisTick?.alignWithLabel, {
					name: loc("ve.registry.localisation.AxisSymbol_align_with_label"),
					onuserchange: (v) => {
						if (!this.value.axisTick) this.value.axisTick = {};
						this.value.axisTick.alignWithLabel = v;
					}
				}),
				custom_values: new ve.Number((this.value?.axisTick?.customValues) ? this.value.axisTick.customValues : [0], {
					name: loc("ve.registry.localisation.AxisSymbol_custom_values"),
					onuserchange: (v) => {
						if (!this.value.axisTick) this.value.axisTick = {};
						this.values.axisTick.customValues = v;
					}
				}),
				inside: new ve.Toggle(this.value?.axisTick?.inside, {
					name: loc("ve.registry.localisation.AxisSymbol_inside"),
					onuserchange: (v) => {
						if (!this.value.axisTick) this.value.axisTick = {};
						this.value.axisTick.inside = v;
					}
				}),
				interval: new ve.Text((value.axisTick?.interval !== undefined) ? value.axisTick.interval : "auto", {
					name: loc("ve.registry.localisation.AxisSymbol_interval"),
					onuserchange: (v) => {
						if (!this.value.axisTick) this.value.axisTick = {};
						if (!isNaN(parseFloat(v))) v = parseFloat(v);
						this.value.axisTick.interval = v;
					}
				}),
				length: new ve.Number(Math.returnSafeNumber(value.axisTick?.length, 5), {
					name: loc("ve.registry.localisation.AxisSymbol_length"),
					onuserchange: (v) => {
						if (!this.value.axisTick) this.value.axisTick = {};
						this.value.axisTick.length = v;
					}
				}),
				stroke_symbol: new ve.DatavisSuite.StrokeSymbol(value.axisTick?.lineStyle, {
					name: loc("ve.registry.localisation.AxisSymbol_stroke_symbol"),
					onuserchange: (v) => {
						if (!this.value.axisTick) this.value.axisTick = {};
						this.value.axisTick.lineStyle = v;
					}
				}).interface,
				minor_split_line: new ve.Interface({
					show: new ve.Toggle(value.axisTick?.minorSplitLine, {
						name: loc("ve.registry.localisation.AxisSymbol_show"),
						onuserchange: (v) => {
							if (!this.value.axisTick) this.value.axisTick = {};
							if (!this.value.axisTick.minorSplitLine) this.value.axisTick.minorSplitLine = {};
							this.value.axisTick.minorSplitLine.show = v;
						}
					}),
					stroke_symbol: new ve.DatavisSuite.StrokeSymbol(value.axisTick?.minorSplitLine?.lineStyle, {
						name: loc("ve.registry.localisation.AxisSymbol_stroke_symbol"),
						onuserchange: (v) => {
							if (!this.value.axisTick) this.value.axisTick = {};
							if (!this.value.axisTick.minorSplitLine) this.value.axisTick.minorSplitLine = {};
							this.value.axisTick.minorSplitLine.lineStyle = v;
						}
					}).interface
				}, { name: loc("ve.registry.localisation.AxisSymbol_minor_split_line") }),
				minor_tick: new ve.Interface({
					show: new ve.Toggle(value.axisTick?.minorTick, {
						name: loc("ve.registry.localisation.AxisSymbol_show"),
						onuserchange: (v) => {
							if (!this.value.axisTick) this.value.axisTick = {};
							if (!this.value.axisTick.minorTick) this.value.axisTick.minorTick = {};
							this.value.axisTick.minorTick.show = v;
						}
					}),
					
					length: new ve.Number(Math.returnSafeNumber(value.axisTick?.minorTick?.length, 3), {
						name: loc("ve.registry.localisation.AxisSymbol_length"),
						onuserchange: (v) => {
							if (!this.value.axisTick) this.value.axisTick = {};
							if (!this.value.axisTick.minorTick) this.value.axisTick.minorTick = {};
							this.value.axisTick.minorTick.length = v;
						}
					}),
					split_number: new ve.Number(Math.returnSafeNumber(value.axisTick?.minorTick?.splitNumber, 5), {
						name: loc("ve.registry.localisation.AxisSymbol_split_number"),
						onuserchange: (v) => {
							if (!this.value.axisTick) this.value.axisTick = {};
							if (!this.value.axisTick.minorTick) this.value.axisTick.minorTick = {};
							this.value.axisTick.minorTick.splitNumber = v;
						}
					}),
					stroke_symbol: new ve.DatavisSuite.StrokeSymbol(value.axisTick?.minorTick?.lineStyle, {
						name: loc("ve.registry.localisation.AxisSymbol_stroke_symbol"),
						onuserchange: (v) => {
							if (!this.value.axisTick) this.value.axisTick = {};
							if (!this.value.axisTick.minorTick) this.value.axisTick.minorTick = {};
							this.value.axisTick.minorTick.lineStyle = v;
						}
					}).interface
				}, { name: loc("ve.registry.localisation.AxisSymbol_minor_tick") })
			}, {
				name: loc("ve.registry.localisation.AxisSymbol_axis_tick")
			}),
			break_area: new ve.Interface({
				show: new ve.Toggle(value?.breakArea?.show, {
					name: loc("ve.registry.localisation.AxisSymbol_show"),
					onuserchange: (v) => {
						if (!this.value.breakArea) this.value.breakArea = {};
						this.value.breakArea.show = v;
					}
				}),
				expand_on_click: new ve.Toggle(value?.breakArea?.expandOnClick, {
					name: loc("ve.registry.localisation.AxisSymbol_expand_on_click"),
					onuserchange: (v) => {
						if (!this.value.breakArea) this.value.breakArea = {};
						this.value.breakArea.expandOnClick = v;
					}
				}),
				point_symbol: new ve.DatavisSuite.PointSymbol(value?.breakArea?.itemStyle, {
					name: loc("ve.registry.localisation.AxisSymbol_point_symbol"),
					onuserchange: (v) => {
						if (!this.value.breakArea) this.value.breakArea = {};
						this.value.breakArea.itemStyle = v;
					}
				}).interface,
				zigzag_amplitude: new ve.Number(Math.returnSafeNumber(value?.breakArea?.zigzagAmplitude, 4), {
					name: loc("ve.registry.localisation.AxisSymbol_zigzag_amplitude"),
					onuserchange: (v) => {
						if (!this.value.breakArea) this.value.breakArea = {};
						this.value.breakArea.zigzagAmplitude = v;
					}
				}),
				zigzag_max_span: new ve.Number(Math.returnSafeNumber(value?.breakArea?.zigzagMaxSpan, 4), {
					name: loc("ve.registry.localisation.AxisSymbol_zigzag_max_span"),
					onuserchange: (v) => {
						if (!this.value.breakArea) this.value.breakArea = {};
						this.value.breakArea.zigzagMaxSpan = v;
					}
				}),
				zigzag_min_span: new ve.Number(Math.returnSafeNumber(value?.breakArea?.zigzagMinSpan, 4), {
					name: loc("ve.registry.localisation.AxisSymbol_zigzag_min_span"),
					onuserchange: (v) => {
						if (!this.value.breakArea) this.value.breakArea = {};
						this.value.breakArea.zigzagMinSpan = v;
					}
				}),
				zigzag_z_index: new ve.Number(Math.returnSafeNumber(value?.breakArea?.zigzagZIndex, 100), {
					name: loc("ve.registry.localisation.AxisSymbol_zigzag_z_index"),
					onuserchange: (v) => {
						if (!this.value.breakArea) this.value.breakArea = {};
						this.value.breakArea.zigzagZ = v;
					}
				})
			}, { name: loc("ve.registry.localisation.AxisSymbol_break_area") }),
			breaks: new ve.Interface({
				break_editor: new ve.List([], {
					placeholder: new ve.ObjectEditor({
						gap: 0,
						end: 0,
						is_expanded: false,
						start: 0
					}),
					options: {
						do_not_allow_type_change: false,
						preserve_structure: true
					},
					onuserchange: (v) => {
						if (v.length === 0) {
							delete this.value.breaks;
						} else {
							//Iterate over all v components, set all_breaks
							let all_breaks = [];
							
							for (let i = 0; i < v.length; i++)
								all_breaks.push(v[i].v);
							this.value.breaks = all_breaks;
						}
					}
				})
			}, { name: loc("ve.registry.localisation.AxisSymbol_breaks") }),
			name_truncate: new ve.Interface({
				ellipsis: new ve.Text((value?.nameTruncate?.ellipsis) ? value?.nameTruncate?.ellipsis : "...", {
					name: loc("ve.registry.localisation.AxisSymbol_ellipsis"),
					onuserchange: (v) => {
						if (!this.value.nameTruncate) this.value.nameTruncate = {};
						this.value.nameTruncate.ellipsis = v;
					}
				}),
				max_width: new ve.Number(Math.returnSafeNumber(value?.nameTruncate?.maxWidth, -1), {
					name: loc("ve.registry.localisation.AxisSymbol_max_width"),
					onuserchange: (v) => {
						if (!this.value.nameTruncate) this.value.nameTruncate = {};
						this.value.nameTruncate.maxWidth = (v > 0) ? v : undefined;
					}
				})
			}, {
				name: loc("ve.registry.localisation.AxisSymbol_name_truncate")
			}),
			overlap: new ve.Interface({
				move_overlap: new ve.Select({
					auto: { name: loc("ve.registry.localisation.AxisSymbol_auto") },
					"true": { name: loc("ve.registry.localisation.AxisSymbol_true") },
					"false": { name: loc("ve.registry.localisation.AxisSymbol_false") }
				}, {
					name: loc("ve.registry.localisation.AxisSymbol_move_overlap"),
					onuserchange: (v) => {
						if (!this.value.breakLabelLayout) this.value.breakLabelLayout = {};
						if (v === "true") v = true;
						if (v === "false") v = false;
						this.value.breakLabelLayout.moveOverlap = v;
					}
				}),
			}, { name: loc("ve.registry.localisation.AxisSymbol_overlap") }),
			split_area: new ve.Interface({
				show: new ve.Toggle(value?.splitArea?.show, {
					name: loc("ve.registry.localisation.AxisSymbol_show"),
					onuserchange: (v) => {
						if (!this.value.splitArea) this.value.splitArea = {};
						this.value.splitArea.show = v;
					}
				}),
				fill_symbol: new ve.DatavisSuite.FillSymbol(value?.splitArea?.areaStyle, {
					name: loc("ve.registry.localisation.AxisSymbol_fill_symbol"),
					onuserchange: (v) => {
						if (!this.value.splitArea) this.value.splitArea = {};
						this.value.splitArea.areaStyle = v;
					}
				}).interface,
				interval: new ve.Text((value.splitArea?.interval !== undefined) ? value.splitArea.interval : "auto", {
					name: loc("ve.registry.localisation.AxisSymbol_interval"),
					onuserchange: (v) => {
						if (!this.value.splitArea) this.value.splitArea = {};
						if (!isNaN(parseFloat(v))) v = parseFloat(v);
						this.value.splitArea.interval = v;
					}
				}),
			}, { name: loc("ve.registry.localisation.AxisSymbol_split_area") }),
			split_line: new ve.Interface({
				show: new ve.Toggle(value?.splitLine?.show, {
					name: loc("ve.registry.localisation.AxisSymbol_show"),
					onuserchange: (v) => {
						if (!this.value.splitLine) this.value.splitLine = {};
						this.value.splitLine.show = v;
					}
				}),
				
				interval: new ve.Text((value.splitLine?.interval !== undefined) ? value.splitLine.interval : "auto", {
					name: loc("ve.registry.localisation.AxisSymbol_interval"),
					onuserchange: (v) => {
						if (!this.value.splitLine) this.value.splitLine = {};
						if (!isNaN(parseFloat(v))) v = parseFloat(v);
						this.value.splitLine.interval = v;
					}
				}),
				show_max_line: new ve.Toggle(value.splitLine?.interval, {
					name: loc("ve.registry.localisation.AxisSymbol_show_max_line"),
					onuserchange: (v) => {
						if (!this.value.splitLine) this.value.splitLine = {};
						this.value.splitLine.interval = v;
					}
				}),
				show_min_line: new ve.Toggle(value.splitLine?.interval, {
					name: loc("ve.registry.localisation.AxisSymbol_show_min_line"),
					onuserchange: (v) => {
						if (!this.value.splitLine) this.value.splitLine = {};
						this.value.splitLine.interval = v;
					}
				}),
				stroke_symbol: new ve.DatavisSuite.StrokeSymbol(value.splitLine?.lineStyle, {
					name: loc("ve.registry.localisation.AxisSymbol_stroke_symbol"),
					onuserchange: (v) => {
						if (!this.value.splitLine) this.value.splitLine = {};
						this.value.splitLine.strokeSymbol = v;
					}
				}).interface
			}, { name: loc("ve.registry.localisation.AxisSymbol_split_line") }),
			
			advanced_styling: new ve.Interface({
				align_ticks: new ve.Toggle(value.alignTicks, {
					name: loc("ve.registry.localisation.AxisSymbol_align_ticks"),
					onuserchange: (v) => this.value.alignTicks = v
				}),
				boundary_gap: new ve.Toggle(value.boundaryGap, {
					name: loc("ve.registry.localisation.AxisSymbol_boundary_gap"),
					onuserchange: (v) => this.value.boundaryGap = v
				}),
				boundary_gap_array: new ve.RawInterface({
					boundary_gap_array_x: new ve.Text(value.boundaryGap?.[0]),
					boundary_gap_array_y: new ve.Text(value.boundaryGap?.[1])
				}, {
					name: loc("ve.registry.localisation.AxisSymbol_boundary_gap_x_y"),
					onuserchange: (v) => this.value.boundaryGap = [v.boundary_gap_array_x.v, v.boundary_gap_array_y.v]
				}),
				grid_index: new ve.Number(Math.returnSafeNumber(value.gridIndex), {
					name: loc("ve.registry.localisation.AxisSymbol_grid_index"),
					onuserchange: (v) => this.value.gridIndex = v
				}),
				interactive: new ve.Toggle(value.interactive, {
					name: loc("ve.registry.localisation.AxisSymbol_interactive"),
					onuserchange: (v) => this.value.interactive = v
				}),
				interval: new ve.Number(Math.returnSafeNumber(value.interval), {
					name: loc("ve.registry.localisation.AxisSymbol_interval"),
					onuserchange: (v) => this.value.interval = v
				}),
				inverse: new ve.Toggle(value.inverse, {
					name: loc("ve.registry.localisation.AxisSymbol_inverse"),
					onuserchange: (v) => this.value.inverse = v
				}),
				log_base: new ve.Number(Math.returnSafeNumber(value.logBase, 10), {
					name: loc("ve.registry.localisation.AxisSymbol_log_base"),
					onuserchange: (v) => this.value.logBase = v
				}),
				jitter: new ve.Toggle(value.jitter, {
					name: loc("ve.registry.localisation.AxisSymbol_jitter"),
					onuserchange: (v) => this.value.jitter = v,
					tooltip: loc("ve.registry.localisation.AxisSymbol_tooltip_jitter")
				}),
				jitter_margin: new ve.Number(Math.returnSafeNumber(value.jitterMargin, 2), {
					name: loc("ve.registry.localisation.AxisSymbol_jitter_margin"),
					onuserchange: (v) => this.value.jitterMargin = v,
					tooltip: loc("ve.registry.localisation.AxisSymbol_tooltip_jitter")
				}),
				jitter_overlap: new ve.Toggle(value.jitterOverlap, {
					name: loc("ve.registry.localisation.AxisSymbol_jitter_overlap"),
					onuserchange: (v) => this.value.jitterOverlap = v,
					tooltip: loc("ve.registry.localisation.AxisSymbol_tooltip_jitter")
				}),
				max: new ve.Text(value.max, {
					name: loc("ve.registry.localisation.AxisSymbol_max"),
					onuserchange: (v) => {
						if (!isNaN(parseFloat(v))) v = parseFloat(v);
						this.value.max = v;
					}
				}),
				max_interval: new ve.Number(Math.returnSafeNumber(value.maxInterval), {
					name: loc("ve.registry.localisation.AxisSymbol_max_interval"),
					onuserchange: (v) => this.value.maxInterval = v
				}),
				min: new ve.Text(value.min, {
					name: loc("ve.registry.localisation.AxisSymbol_min"),
					onuserchange: (v) => {
						if (!isNaN(parseFloat(v))) v = parseFloat(v);
						this.value.min = v;
					}
				}),
				min_interval: new ve.Number(Math.returnSafeNumber(value.minInterval), {
					name: loc("ve.registry.localisation.AxisSymbol_min_interval"),
					onuserchange: (v) => this.value.minInterval = v
				}),
				offset: new ve.Number(Math.returnSafeNumber(value.offset), {
					name: loc("ve.registry.localisation.AxisSymbol_offset"),
					onuserchange: (v) => this.value.offset = v
				}),
				scale: new ve.Toggle(value.scale, {
					name: loc("ve.registry.localisation.AxisSymbol_scale"),
					onuserchange: (v) => this.value.scale = v
				}),
				silent: new ve.Toggle(value.silent, {
					name: loc("ve.registry.localisation.AxisSymbol_silent"),
					onuserchange: (v) => this.value.silent = v
				}),
				split_number: new ve.Number(Math.returnSafeNumber(value.splitNumber, 5), {
					name: loc("ve.registry.localisation.AxisSymbol_split_number"),
					onuserchange: (v) => this.value.splitNumber = v
				}),
				start_value: new ve.Number(Math.returnSafeNumber(value.startValue, 0), {
					name: loc("ve.registry.localisation.AxisSymbol_start_value"),
					onuserchange: (v) => this.value.startValue = v
				}),
				text_symbol: new ve.DatavisSuite.TextSymbol(value.nameTextStyle, {
					name: loc("ve.registry.localisation.AxisSymbol_text_symbol"),
					onuserchange: (v) => this.value.nameTextStyle = v
				}).interface,
				z_index: new ve.Number(Math.returnSafeNumber(value.z), {
					name: loc("ve.registry.localisation.AxisSymbol_z_index"),
					onuserchange: (v) => this.value.z = v
				}),
			}, { name: loc("ve.registry.localisation.AxisSymbol_styling_advanced") }),
			tooltip: new ve.Interface({
				label_symbol: new ve.DatavisSuite.LabelSymbol(value?.tooltip?.textStyle, {
					name: loc("ve.registry.localisation.AxisSymbol_label_symbol"),
					onuserchange: (v) => {
						if (!this.value.tooltip) this.value.tooltip = {};
						this.value.tooltip.textStyle = v;
					}
				}).interface,
				tooltip_symbol: new ve.DatavisSuite.TooltipSymbol(value.tooltip, {
					name: loc("ve.registry.localisation.AxisSymbol_tooltip_symbol"),
					onuserchange: (v) => {
						if (!this.value.tooltip) this.value.tooltip = {};
						this.value.tooltip = {
							...this.value.tooltip,
							...v
						};
					}
				}).interface
			}, { name: loc("ve.registry.localisation.AxisSymbol_tooltip") }),
			animation: new ve.Interface({
				delay: new ve.Number(Math.returnSafeNumber(value.animationDelay), {
					name: loc("ve.registry.localisation.AxisSymbol_delay"),
					onuserchange: (v) => this.value.animationDelay = v
				}),
				delay_update: new ve.Number(Math.returnSafeNumber(value.animationDelayUpdate, 300), {
					name: loc("ve.registry.localisation.AxisSymbol_delay_update"),
					onuserchange: (v) => this.value.animationDelayUpdate = v
				}),
				duration: new ve.Number(Math.returnSafeNumber(value.animationDuration, 1000), {
					name: loc("ve.registry.localisation.AxisSymbol_duration"),
					onuserchange: (v) => this.value.animationDuration = v
				}),
				duration_update: new ve.Number(Math.returnSafeNumber(value.animationDurationUpdate, 300), {
					name: loc("ve.registry.localisation.AxisSymbol_duration_update"),
					onuserchange: (v) => this.value.animationDurationUpdate = v
				}),
				easing: new ve.Select({
					linear: { name: loc("ve.registry.localisation.AxisSymbol_easing_linear") },
					quadraticIn: { name: loc("ve.registry.localisation.AxisSymbol_easing_quadratic_in") },
					quadraticOut: { name: loc("ve.registry.localisation.AxisSymbol_easing_quadratic_out") },
					quadraticInOut: { name: loc("ve.registry.localisation.AxisSymbol_easing_quadratic_in_out") },
					cubicIn: { name: loc("ve.registry.localisation.AxisSymbol_easing_cubic_in") },
					cubicOut: { name: loc("ve.registry.localisation.AxisSymbol_easing_cubic_out") },
					cubicInOut: { name: loc("ve.registry.localisation.AxisSymbol_easing_cubic_in_out") },
					quarticIn: { name: loc("ve.registry.localisation.AxisSymbol_easing_quartic_in") },
					quarticOut: { name: loc("ve.registry.localisation.AxisSymbol_easing_quartic_out") },
					quarticInOut: { name: loc("ve.registry.localisation.AxisSymbol_easing_quartic_in_out") },
					quinticIn: { name: loc("ve.registry.localisation.AxisSymbol_easing_quintic_in") },
					quinticOut: { name: loc("ve.registry.localisation.AxisSymbol_easing_quintic_out") },
					quinticInOut: { name: loc("ve.registry.localisation.AxisSymbol_easing_quintic_in_out") },
					sinusoidalIn: { name: loc("ve.registry.localisation.AxisSymbol_easing_sinusoidal_in") },
					sinusoidalOut: { name: loc("ve.registry.localisation.AxisSymbol_easing_sinusoidal_out") },
					sinusoidalInOut: { name: loc("ve.registry.localisation.AxisSymbol_easing_sinusoidal_in_out") },
					exponentialIn: { name: loc("ve.registry.localisation.AxisSymbol_easing_exponential_in") },
					exponentialOut: { name: loc("ve.registry.localisation.AxisSymbol_easing_exponential_out") },
					exponentialInOut: { name: loc("ve.registry.localisation.AxisSymbol_easing_exponential_in_out") },
					circularIn: { name: loc("ve.registry.localisation.AxisSymbol_easing_circular_in") },
					circularOut: { name: loc("ve.registry.localisation.AxisSymbol_easing_circular_out") },
					circularInOut: { name: loc("ve.registry.localisation.AxisSymbol_easing_circular_in_out") },
					elasticIn: { name: loc("ve.registry.localisation.AxisSymbol_easing_elastic_in") },
					elasticOut: { name: loc("ve.registry.localisation.AxisSymbol_easing_elastic_out") },
					elasticInOut: { name: loc("ve.registry.localisation.AxisSymbol_easing_elastic_in_out") },
					backIn: { name: loc("ve.registry.localisation.AxisSymbol_easing_back_in") },
					backOut: { name: loc("ve.registry.localisation.AxisSymbol_easing_back_out") },
					backInOut: { name: loc("ve.registry.localisation.AxisSymbol_easing_back_in_out") },
					bounceIn: { name: loc("ve.registry.localisation.AxisSymbol_easing_bounce_in") },
					bounceOut: { name: loc("ve.registry.localisation.AxisSymbol_easing_bounce_out") },
					bounceInOut: { name: loc("ve.registry.localisation.AxisSymbol_easing_bounce_in_out") }
				}, {
					name: loc("ve.registry.localisation.AxisSymbol_easing"),
					selected: (this.value.animationEasing) ? this.value.animationEasing : "cubicOut",
					onuserchange: (v) => this.value.animationEasing = v
				}),
				easing_update: new ve.Select({
					linear: { name: loc("ve.registry.localisation.AxisSymbol_easing_linear") },
					quadraticIn: { name: loc("ve.registry.localisation.AxisSymbol_easing_quadratic_in") },
					quadraticOut: { name: loc("ve.registry.localisation.AxisSymbol_easing_quadratic_out") },
					quadraticInOut: { name: loc("ve.registry.localisation.AxisSymbol_easing_quadratic_in_out") },
					cubicIn: { name: loc("ve.registry.localisation.AxisSymbol_easing_cubic_in") },
					cubicOut: { name: loc("ve.registry.localisation.AxisSymbol_easing_cubic_out") },
					cubicInOut: { name: loc("ve.registry.localisation.AxisSymbol_easing_cubic_in_out") },
					quarticIn: { name: loc("ve.registry.localisation.AxisSymbol_easing_quartic_in") },
					quarticOut: { name: loc("ve.registry.localisation.AxisSymbol_easing_quartic_out") },
					quarticInOut: { name: loc("ve.registry.localisation.AxisSymbol_easing_quartic_in_out") },
					quinticIn: { name: loc("ve.registry.localisation.AxisSymbol_easing_quintic_in") },
					quinticOut: { name: loc("ve.registry.localisation.AxisSymbol_easing_quintic_out") },
					quinticInOut: { name: loc("ve.registry.localisation.AxisSymbol_easing_quintic_in_out") },
					sinusoidalIn: { name: loc("ve.registry.localisation.AxisSymbol_easing_sinusoidal_in") },
					sinusoidalOut: { name: loc("ve.registry.localisation.AxisSymbol_easing_sinusoidal_out") },
					sinusoidalInOut: { name: loc("ve.registry.localisation.AxisSymbol_easing_sinusoidal_in_out") },
					exponentialIn: { name: loc("ve.registry.localisation.AxisSymbol_easing_exponential_in") },
					exponentialOut: { name: loc("ve.registry.localisation.AxisSymbol_easing_exponential_out") },
					exponentialInOut: { name: loc("ve.registry.localisation.AxisSymbol_easing_exponential_in_out") },
					circularIn: { name: loc("ve.registry.localisation.AxisSymbol_easing_circular_in") },
					circularOut: { name: loc("ve.registry.localisation.AxisSymbol_easing_circular_out") },
					circularInOut: { name: loc("ve.registry.localisation.AxisSymbol_easing_circular_in_out") },
					elasticIn: { name: loc("ve.registry.localisation.AxisSymbol_easing_elastic_in") },
					elasticOut: { name: loc("ve.registry.localisation.AxisSymbol_easing_elastic_out") },
					elasticInOut: { name: loc("ve.registry.localisation.AxisSymbol_easing_elastic_in_out") },
					backIn: { name: loc("ve.registry.localisation.AxisSymbol_easing_back_in") },
					backOut: { name: loc("ve.registry.localisation.AxisSymbol_easing_back_out") },
					backInOut: { name: loc("ve.registry.localisation.AxisSymbol_easing_back_in_out") },
					bounceIn: { name: loc("ve.registry.localisation.AxisSymbol_easing_bounce_in") },
					bounceOut: { name: loc("ve.registry.localisation.AxisSymbol_easing_bounce_out") },
					bounceInOut: { name: loc("ve.registry.localisation.AxisSymbol_easing_bounce_in_out") }
				}, {
					name: loc("ve.registry.localisation.AxisSymbol_easing_update"),
					selected: (this.value.animationEasingUpdate) ? this.value.animationEasingUpdate : "cubicOut",
					onuserchange: (v) => this.value.animationEasingUpdate = v
				})
			}, { name: loc("ve.registry.localisation.AxisSymbol_animation") }),
			position: position_obj
		}, { 
			name: (this.options.name) ? this.options.name : loc("ve.registry.localisation.AxisSymbol_axis_symbol"),
			onuserchange: () => {
				//Draw graph; fire to binding if possible
				delete this.do_not_fire_to_binding;
				this.fireToBinding();
			},
			style: this.options.style,
			x: this.options.x,
			y: this.options.y
		});
		this.interface.bind(this.element);
		this.value = value;
	}
	
	/**
	 * Gets the data series that determines axis tick labels from `arg1_options.datavis_suite_obj`.
	 * 
	 * @param {string} arg0_series_id
	 * @param {Object} [arg1_options]
	 *  @param {string} [arg1_options.mode="vertical"] - Either 'horizontal'/'vertical'.
	 */
	getDataSeries (arg0_series_id, arg1_options) {
		//Convert from parameters
		let series_id = arg0_series_id;
		let options = (arg1_options) ? arg1_options : {};
		
		//Declare local instance variables
		let datavis_suite_obj = this.options.datavis_suite_obj;
			if (!datavis_suite_obj) return; //Internal guard clause if datavis_suite_obj is undefined
		let series_data = datavis_suite_obj.getSeriesData(series_id);
		
		//Iterate over series_data in the direction of `arg1_options.mode`
		let all_axis_labels = [];
		
		if (options.mode === "horizontal") {
			let max_length = 0;
			
			for (let i = 0; i < series_data.length; i++)
				max_length = Math.max(max_length, series_data[i].length);
			for (let i = 0; i < max_length; i++)
				for (let x = 0; x < series_data.length; x++)
					if (series_data[x][i]) all_axis_labels.push(series_data[x][i]);
		} else {
			for (let i = 0; i < series_data.length; i++)
				for (let x = 0; x < series_data[i].length; x++)
					if (series_data[i][x]) all_axis_labels.push(series_data[i][x]);
		}
		
		//Return statement
		return all_axis_labels;
	}
};