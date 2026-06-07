global.UI_LineSymbol = class extends ve.Component {
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = arg0_value;
		let options = (arg1_options) ? arg1_options : {};
			super(options);
			
		//Declare local instance variables
		this.options = options;
		this.value = (value) ? value : {};
		
		this.element = this.draw().element;
	}
	
	get v () { return this.value; }
	
	set v (arg0_value) {
		//Convert from parameters
		let value = (arg0_value) ? arg0_value : {};
		
		//Fire setValue
		UI_Symbol.setValue(value, { 
			instance: this, 
			key_map_obj: {
				lineColor: "stroke_colour",
				lineOpacity: "stroke_opacity",
				lineWidth: "stroke_width",
				
				lineCap: "stroke_line_cap",
				lineJoin: "stroke_line_join",
				
				lineDasharray: "advanced_options.stroke_dash_array",
				linePatternFile: "advanced_options.stroke_pattern_file",
				lineDx: "advanced_options.stroke_offset_x",
				lineDy: "advanced_options.stroke_offset_y"
			}
		});
	}
	
	draw () {
		//Declare local instance variables
		if (this.components_obj) //If this.components_obj is already defined, remove all components
			Object.iterate(this.components_obj, (local_key, local_component) => {
				local_component.remove();
			});
		this.components_obj = {
			stroke_colour: veColour((this.value.lineColor || "#000000"), {
				name: "Stroke Colour",
				onuserchange: (v, e) => {
					this.value.lineColor = e.getHex();
					this.options.special_function({ lineColor: e.getHex() });
				}
			}),
			stroke_opacity: veRange(Math.returnSafeNumber(this.value.lineOpacity, 1), {
				name: "Stroke Opacity",
				onuserchange: (v) => {
					this.value.lineOpacity = v;
					this.options.special_function({ lineOpacity: v });
				}
			}),
			stroke_width: veNumber(Math.returnSafeNumber(this.value.lineWidth, 2), {
				name: "Stroke Width",
				onuserchange: (v) => {
					this.value.lineWidth = v;
					this.options.special_function({ lineWidth: v });
				}
			}),
			
			stroke_line_cap: veSelect({
				butt: { name: "Butt" },
				round: { name: "Round" },
				square: { name: "Square" }
			}, {
				name: "Line Cap",
				selected: (this.value.lineCap || "butt"),
				onuserchange: (v) => {
					this.value.lineCap = v;
					this.options.special_function({ lineCap: v });
				}
			}),
			stroke_line_join: veSelect({
				bevel: { name: "Bevel" },
				miter: { name: "Miter" },
				round: { name: "Round" }
			}, {
				name: "Line Join",
				selected: (this.value.lineJoin || "miter"),
				onuserchange: (v) => {
					this.value.lineJoin = v;
					this.options.special_function({ lineJoin: v });
				}
			}),
			
			advanced_options: veInterface({
				stroke_dash_array: veNumber((this.value.lineDasharray || [0]), {
					name: "Line Dash Pattern",
					onuserchange: (v) => {
						if (v.length <= 1) {
							delete this.value.lineDasharray;
						} else {
							this.value.lineDasharray = v;
						}
						this.options.special_function({ lineDasharray: v });
					}
				}),
				stroke_pattern_file: veFile(this.value.linePatternFile, {
					name: "Change Pattern",
					onuserchange: (v) => {
						if (v.length === 0) {
							delete this.value.linePatternFile;
						} else {
							this.value.linePatternFile = v;
						}
						this.options.special_function({ linePatternFile: v });
					}
				}),
				stroke_offset_x: veNumber(Math.returnSafeNumber(this.value.lineDx, 0), {
					name: "Offset X",
					onuserchange: (v) => {
						this.value.lineDx = v;
						this.options.special_function({ lineDx: v });
					}
				}),
				stroke_offset_y: veNumber(Math.returnSafeNumber(this.value.lineDy, 0), {
					name: "Offset Y",
					onuserchange: (v) => {
						this.value.lineDy = v;
						this.options.special_function({ lineDy: v });
					}
				})
			}, {
				name: "Advanced Options"
			})
		};
		
		//Return statement
		return veInterface(this.components_obj, { name: (this.options.name || "Line Symbol") });
	}
};