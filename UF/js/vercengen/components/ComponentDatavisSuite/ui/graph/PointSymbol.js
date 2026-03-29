ve.DatavisSuite.PointSymbol = class extends ve.Component {
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = (arg0_value) ? arg0_value : {};
		let options = (arg1_options) ? arg1_options : {};
		super(options);
		
		//Initialise options
		options.attributes = (options.attributes) ? options.attributes : {};
		
		//Declare local instance variables
		this.element = document.createElement("div");
		this.element.setAttribute("component", "ve-datavis-suite-point-symbol");
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
		
		//Declare local instance variables
		if (!value.decal) value.decal = {};
		if (!this.value.decal) this.value.decal = {};
		
		//Parse value
		this.element.innerHTML = "";
		this.interface = new ve.Interface({
			border_cap: new ve.Select({
				butt: { name: loc("ve.registry.localisation.PointSymbol_butt") },
				round: { name: loc("ve.registry.localisation.PointSymbol_round") },
				square: { name: loc("ve.registry.localisation.PointSymbol_square") }
			}, {
				name: loc("ve.registry.localisation.PointSymbol_border_cap"),
				onuserchange: (v) => this.value.borderCap = v,
				selected: (value.borderCap) ? value.borderCap : "butt"
			}),
			border_colour: new ve.Colour((value.borderColor) ? value.borderColor : "#000000", {
				name: loc("ve.registry.localisation.PointSymbol_border_colour"),
				onuserchange: (v) => this.value.borderColor = v
			}),
			border_dash_offset: new ve.Number(Math.returnSafeNumber(value.borderDashOffset), {
				name: loc("ve.registry.localisation.PointSymbol_border_dash_offset"),
				onuserchange: (v) => this.value.borderDashOffset = v
			}),
			border_join: new ve.Select({
				bevel: { name: loc("ve.registry.localisation.PointSymbol_bevel") },
				miter: { name: loc("ve.registry.localisation.PointSymbol_miter") },
				round: { name: loc("ve.registry.localisation.PointSymbol_round") }
			}, {
				name: loc("ve.registry.localisation.PointSymbol_border_join"),
				onuserchange: (v) => this.value.borderJoin = v,
				selected: (value.borderJoin) ? value.borderJoin : "bevel"
			}),
			border_miter_limit: new ve.Number(Math.returnSafeNumber(value.borderMiterLimit, 10), {
				name: loc("ve.registry.localisation.PointSymbol_border_miter_limit"),
				onuserchange: (v) => this.value.borderMiterLimit = v
			}),
			border_type: new ve.Select({
				dashed: { name: loc("ve.registry.localisation.PointSymbol_dashed") },
				dotted: { name: loc("ve.registry.localisation.PointSymbol_dotted") },
				solid: { name: loc("ve.registry.localisation.PointSymbol_solid") },
			}, {
				name: loc("ve.registry.localisation.PointSymbol_border_type"),
				onuserchange: (v) => this.value.borderType = v,
				selected: (value.borderType) ? value.borderType : "solid"
			}),
			border_width: new ve.Number(Math.returnSafeNumber(value.border_width), {
				name: loc("ve.registry.localisation.PointSymbol_border_width"),
				onuserchange: (v) => this.value.borderWidth = v
			}),
			colour: new ve.Colour((value.color) ? value.color : "#ffffff", {
				name: loc("ve.registry.localisation.PointSymbol_colour"),
				onuserchange: (v, e) => this.value.color = e.getHex()
			}),
			decal: new ve.Interface({
				background_colour: new ve.Colour((value.decal.backgroundColor) ?
					value.decal.backgroundColor : "#000000", {
					name: loc("ve.registry.localisation.PointSymbol_background_colour"),
					onuserchange: (v, e) => this.value.decal.backgroundColor = e.getHex()
				}),
				colour: new ve.Colour((value.decal.color) ?
					value.decal.color : "#ffffff", {
					name: loc("ve.registry.localisation.PointSymbol_colour"),
					onuserchange: (v, e) => this.value.decal.color = e.getHex()
				}),
				dash_array_x: new ve.Number(Math.returnSafeNumber(value.decal.dashArrayX, 5), {
					name: loc("ve.registry.localisation.PointSymbol_dash_array_x"),
					onuserchange: (v) => this.value.dashArrayX = v
				}),
				dash_array_y: new ve.Number(Math.returnSafeNumber(value.decal.dashArrayY, 5), {
					name: loc("ve.registry.localisation.PointSymbol_dash_array_y"),
					onuserchange: (v) => this.value.dashArrayY = v
				}),
				max_tile_height: new ve.Number(Math.returnSafeNumber(value.decal.maxTileHeight, 512), {
					name: loc("ve.registry.localisation.PointSymbol_max_tile_height"),
					onuserchange: (v) => this.value.maxTileHeight = v
				}),
				max_tile_width: new ve.Number(Math.returnSafeNumber(value.decal.maxTileWidth, 512), {
					name: loc("ve.registry.localisation.PointSymbol_max_tile_width"),
					onuserchange: (v) => this.value.maxTileWidth = v
				}),
				rotation: new ve.Number(Math.returnSafeNumber(value.decal.rotation), {
					name: loc("ve.registry.localisation.PointSymbol_rotation"),
					onuserchange: (v) => this.value.rotation = v
				}),
				symbol: new ve.Select({
					arrow: { name: loc("ve.registry.localisation.PointSymbol_arrow") },
					circle: { name: loc("ve.registry.localisation.PointSymbol_circle") },
					diamond: { name: loc("ve.registry.localisation.PointSymbol_diamond") },
					none: { name: loc("ve.registry.localisation.PointSymbol_none") },
					pin: { name: loc("ve.registry.localisation.PointSymbol_pin") },
					triangle: { name: loc("ve.registry.localisation.PointSymbol_triangle") },
					rect: { name: loc("ve.registry.localisation.PointSymbol_rectangle") },
					roundRect: { name: loc("ve.registry.localisation.PointSymbol_rounded_rectangle") },
				}, {
					name: loc("ve.registry.localisation.PointSymbol_symbol"),
					onuserchange: (v) => this.value.decal.symbol = v,
					selected: value.decal.symbol
				}),
				symbol_keep_aspect: new ve.Toggle((value.decal.symbolKeepAspect !== undefined) ?
					value.decal.symbolKeepAspect : true, {
					name: loc("ve.registry.localisation.PointSymbol_symbol_keep_aspect"),
					onuserchange: (v) => this.value.decal.symbolKeepAspect = v
				}),
				symbol_size: new ve.Number(Math.returnSafeNumber(value.decal.symbolSize, 1), {
					name: loc("ve.registry.localisation.PointSymbol_symbol_size"),
					onuserchange: (v) => this.value.decal.symbolSize = v
				})
			}, { name: loc("ve.registry.localisation.PointSymbol_decal") }),
			opacity: new ve.Range(Math.returnSafeNumber(value.opacity, 1), {
				name: loc("ve.registry.localisation.PointSymbol_opacity"),
				onuserchange: (v) => this.value.opacity = v
			}),
			shadow_blur: new ve.Number(Math.returnSafeNumber(value.shadowBlur), {
				name: loc("ve.registry.localisation.PointSymbol_shadow_blur"),
				onuserchange: (v) => this.value.shadowBlur = v
			}),
			shadow_colour: new ve.Colour((value.shadowColor) ? value.shadowColor : "#000000", {
				name: loc("ve.registry.localisation.PointSymbol_shadow_colour"),
				onuserchange: (v, e) => this.value.shadowColor = e.getHex()
			}),
			shadow_offset_x: new ve.Number(Math.returnSafeNumber(value.shadowOffsetX), {
				name: loc("ve.registry.localisation.PointSymbol_shadow_offset_x"),
				onuserchange: (v) => this.value.shadowOffsetX = v
			}),
			shadow_offset_y: new ve.Number(Math.returnSafeNumber(value.shadowOffsetY), {
				name: loc("ve.registry.localisation.PointSymbol_shadow_offset_y"),
				onuserchange: (v) => this.value.shadowOffsetY = v
			})
		}, {
			name: (this.options.name) ? this.options.name : loc("ve.registry.localisation.PointSymbol_point_symbol"),
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
 * @returns {ve.DatavisSuite.PointSymbol}
 */
veDatavisSuitePointSymbol = function () {
	//Return statement
	return new ve.DatavisSuite.PointSymbol(...arguments);
};