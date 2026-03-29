ve.DatavisSuite.TitleSymbol = class extends ve.Component {
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = (arg0_value) ? arg0_value : {};
		let options = (arg1_options) ? arg1_options : {};
		super(options);
		
		//Initialise options
		options.attributes = (options.attributes) ? options.attributes : {};
		
		//Declare local instance variables
		this.element = document.createElement("div");
		this.element.setAttribute("component", "ve-datavis-suite-title-symbol");
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
			id: new ve.Text(value.id, {
				name: loc("ve.registry.localisation.TitleSymbol_id"),
				onuserchange: (v) => this.value.id = v
			}),
			show: new ve.Toggle(value.show, {
				name: loc("ve.registry.localisation.TitleSymbol_show"),
				onuserchange: (v) => this.value.show = v
			}),
			
			_name: new ve.Text(value.text, {
				name: loc("ve.registry.localisation.TitleSymbol_name"),
				onuserchange: (v) => this.value.text = v
			}),
			link: new ve.URL(value.link, {
				name: loc("ve.registry.localisation.TitleSymbol_link"),
				onuserchange: (v) => this.value.link = v
			}),
			target: new ve.Select({
				blank: { name: loc("ve.registry.localisation.TitleSymbol_blank") },
				self: { name: loc("ve.registry.localisation.TitleSymbol_self") }
			}, {
				name: loc("ve.registry.localisation.TitleSymbol_target"),
				selected: (value.target) ? value.target : "blank",
				onuserchange: (v) => this.value.target = v
			}),
			title_symbol: new ve.DatavisSuite.TextSymbol(value.textStyle, {
				name: loc("ve.registry.localisation.TitleSymbol_title_symbol"),
				onuserchange: (v) => this.value.textStyle = v
			}).interface,
			
			coordinates: new ve.Interface({
				coord: new ve.RawInterface({
					coord_x: new ve.Text((value.coord?.[0] !== undefined) ? value.coord[0] : 0, { name: loc("ve.registry.localisation.TitleSymbol_x") }),
					coord_y: new ve.Text((value.coord?.[1] !== undefined) ? value.coord[1] : 0, { name: loc("ve.registry.localisation.TitleSymbol_y") })
				}, {
					onuserchange: (v) => {
						if (!isNaN(parseFloat(v.coord_x.v))) v.coord_x.v = parseFloat(v.coord_x.v);
						if (!isNaN(parseFloat(v.coord_y.v))) v.coord_y.v = parseFloat(v.coord_y.v);
						
						this.value.coord = [v.coord_x.v, v.coord_y.v];
					}
				}),
				coordinate_system: new ve.Select({
					calendar: { name: loc("ve.registry.localisation.TitleSymbol_calendar") },
					matrix: { name: loc("ve.registry.localisation.TitleSymbol_matrix") },
					none: { name: loc("ve.registry.localisation.TitleSymbol_none") }
				}, {
					name: loc("ve.registry.localisation.TitleSymbol_coordinate_system"),
					selected: (value.coordinateSystem) ? value.coordinateSystem : "none",
					onuserchange: (v) => this.value.coordinateSystem = v
				}),
				coordinate_system_usage: new ve.Select({
					box: { name: loc("ve.registry.localisation.TitleSymbol_box") },
					data: { name: loc("ve.registry.localisation.TitleSymbol_data") }
				}, {
					name: loc("ve.registry.localisation.TitleSymbol_coordinate_system_usage"),
					selected: (value.coordinateSystemUsage) ? value.coordinateSystemUsage : "box",
					onuserchange: (v) => this.value.coordinateSystemUsage = v
				})
			}, { name: loc("ve.registry.localisation.TitleSymbol_coordinates") }),
			position: new ve.Interface({
				bottom: new ve.Text((value.bottom) ? value.bottom : "auto", {
					name: loc("ve.registry.localisation.TitleSymbol_bottom"),
					selected: (value.bottom) ? value.bottom : "auto",
					onuserchange: (v) => this.value.bottom = v
				}),
				left: new ve.Text((value.left) ? value.left : "auto", {
					name: loc("ve.registry.localisation.TitleSymbol_left"),
					selected: (value.left) ? value.left : "auto",
					onuserchange: (v) => this.value.left = v
				}),
				right: new ve.Text((value.right) ? value.right : "auto", {
					name: loc("ve.registry.localisation.TitleSymbol_right"),
					selected: (value.right) ? value.right : "auto",
					onuserchange: (v) => this.value.right = v
				}),
				top: new ve.Text((value.top) ? value.top : "auto", {
					name: loc("ve.registry.localisation.TitleSymbol_top"),
					selected: (value.top) ? value.top : "auto",
					onuserchange: (v) => this.value.top = v
				})
			}, { name: loc("ve.registry.localisation.TitleSymbol_position") }),
			styling: new ve.Interface({
				background_colour: new ve.Colour((value.backgroundColor) ? value.backgroundColor : [0, 0, 0, 0], {
					name: loc("ve.registry.localisation.TitleSymbol_background_colour"),
					is_rgba: true,
					onuserchange: (v, e) => this.value.backgroundColor = e.getHex()
				}),
				border_colour: new ve.Colour((value.borderColor) ? value.borderColor : "#cccccc", {
					name: loc("ve.registry.localisation.TitleSymbol_border_colour"),
					onuserchange: (v, e) => this.value.borderColor = e.getHex()
				}),
				border_radius: new ve.Number((value.borderRadius) ? value.borderRadius : [0, 0, 0, 0], {
					name: loc("ve.registry.localisation.TitleSymbol_border_radius"),
					onuserchange: (v) => this.value.borderRadius = v
				}),
				border_width: new ve.Number(Math.returnSafeNumber(value.borderWidth, 1), {
					name: loc("ve.registry.localisation.TitleSymbol_border_width"),
					onuserchange: (v) => this.value.borderWidth = v
				}),
				shadow_blur: new ve.Number(Math.returnSafeNumber(value.shadowBlur), {
					name: loc("ve.registry.localisation.TitleSymbol_shadow_blur"),
					onuserchange: (v) => this.value.shadowBlur = v
				}),
				shadow_colour: new ve.Colour((value.shadowColor) ? value.shadowColor : [0, 0, 0, 0], {
					name: loc("ve.registry.localisation.TitleSymbol_shadow_colour"),
					is_rgba: true,
					onuserchange: (v, e) => this.value.shadowColor = e.getHex()
				}),
				shadow_offset_x: new ve.Number(Math.returnSafeNumber(value.shadowOffsetX), {
					name: loc("ve.registry.localisation.TitleSymbol_shadow_offset_x"),
					onuserchange: (v) => this.value.shadowOffsetX = v
				}),
				shadow_offset_y: new ve.Number(Math.returnSafeNumber(value.shadowOffsetY), {
					name: loc("ve.registry.localisation.TitleSymbol_shadow_offset_y"),
					onuserchange: (v) => this.value.shadowOffsetY = v
				})
			}, { name: loc("ve.registry.localisation.TitleSymbol_styling") }),
			advanced_styling: new ve.Interface({
				calendar_id: new ve.Number(Math.returnSafeNumber(value.calendarId), {
					name: loc("ve.registry.localisation.TitleSymbol_calendar_id"),
					onuserchange: (v) => this.value.calendarId = v
				}),
				calendar_index: new ve.Number(Math.returnSafeNumber(value.calendarIndex), {
					name: loc("ve.registry.localisation.TitleSymbol_calendar_index"),
					onuserchange: (v) => this.value.calendarIndex = v
				}),
				item_gap: new ve.Number(Math.returnSafeNumber(value.itemGap, 10), {
					name: loc("ve.registry.localisation.TitleSymbol_item_gap"),
					onuserchange: (v) => this.value.itemGap = v
				}),
				matrix_id: new ve.Number(Math.returnSafeNumber(value.matrixId), {
					name: loc("ve.registry.localisation.TitleSymbol_matrix_io"),
					onuserchange: (v) => this.value.matrixId = v
				}),
				matrix_index: new ve.Number(Math.returnSafeNumber(value.matrixIndex), {
					name: loc("ve.registry.localisation.TitleSymbol_matrix_index"),
					onuserchange: (v) => this.value.matrixIndex = v
				}),
				padding: new ve.Number((value.padding) ? value.padding : [5], {
					name: loc("ve.registry.localisation.TitleSymbol_padding"),
					onuserchange: (v) => {
						if (v.length === 1) {
							this.value.padding = v[0];
							return;
						}
						this.value.padding = v;
					}
				}),
				text_align: new ve.Select({
					auto: { name: loc("ve.registry.localisation.TitleSymbol_auto") },
					center: { name: loc("ve.registry.localisation.TitleSymbol_centre") },
					left: { name: loc("ve.registry.localisation.TitleSymbol_left") },
					right: { name: loc("ve.registry.localisation.TitleSymbol_right") }
				}, {
					name: loc("ve.registry.localisation.TitleSymbol_text_align"),
					onuserchange: (v) => this.value.textAlign = v,
					selected: (value.textAlign) ? value.textAlign : "auto"
				}),
				text_vertical_align: new ve.Select({
					auto: { name: loc("ve.registry.localisation.TitleSymbol_auto") },
					bottom: { name: loc("ve.registry.localisation.TitleSymbol_bottom") },
					middle: { name: loc("ve.registry.localisation.TitleSymbol_middle") },
					top: { name: loc("ve.registry.localisation.TitleSymbol_top") }
				}, {
					name: loc("ve.registry.localisation.TitleSymbol_text_vertical_align"),
					onuserchange: (v) => this.value.textVerticalAlign = v,
					selected: (value.textVerticalAlign) ? value.textVerticalAlign : "auto"
				}),
				trigger_event: new ve.Toggle(value.triggerEvent, {
					name: loc("ve.registry.localisation.TitleSymbol_trigger_event"),
					onuserchange: (v) => this.value.triggerEvent = v
				}),
				z_index: new ve.Number(Math.returnSafeNumber(value.z, 2), {
					name: loc("ve.registry.localisation.TitleSymbol_z_index"),
					onuserchange: (v) => this.value.z = v
				}),
				z_level: new ve.Number(Math.returnSafeNumber(value.zlevel), {
					name: loc("ve.registry.localisation.TitleSymbol_z_level"),
					onuserchange: (v) => this.value.zlevel = v
				})
			}, { name: loc("ve.registry.localisation.TitleSymbol_styling_advanced") }),
			subtitle: new ve.Interface({
				subtitle: new ve.Text(value.subtext, {
					name: loc("ve.registry.localisation.TitleSymbol_subtitle"),
					onuserchange: (v) => this.value.subtext = v
				}),
				sublink: new ve.URL(value.sublink, {
					name: loc("ve.registry.localisation.TitleSymbol_sublink"),
					onuserchange: (v) => this.value.sublink = v
				}),
				subtarget: new ve.Select({
					blank: { name: loc("ve.registry.localisation.TitleSymbol_blank") },
					self: { name: loc("ve.registry.localisation.TitleSymbol_self") }
				}, {
					name: loc("ve.registry.localisation.TitleSymbol_subtarget"),
					selected: (value.subtarget) ? value.subtarget : "blank",
					onuserchange: (v) => this.value.subtarget = v
				}),
				subtitle_symbol: new ve.DatavisSuite.TextSymbol(value.subtextStyle, {
					name: loc("ve.registry.localisation.TitleSymbol_subtitle_symbol"),
					onuserchange: (v) => this.value.subtextStyle = v
				}).interface,
			}, { name: loc("ve.registry.localisation.TitleSymbol_subtitle_symbol") }),
		}, {
			name: (this.options.name) ? this.options.name : loc("ve.registry.localisation.TitleSymbol_title_symbol"),
			onuserchange: () => {
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
 * @returns {ve.DatavisSuite.TitleSymbol}
 */
veDatavisSuiteTitleSymbol = function () {
	//Return statement
	return new ve.DatavisSuite.TitleSymbol(...arguments);
};