global.UI_EditGeometryLine = class extends ve.Class {
	constructor () {
		super();
	}
	
	draw (arg0_options) {
		//Convert from parameters
		let options = (arg0_options) ? arg0_options : {};
		
		//Initialise options
		if (!options.name) options.name = "Line Symbol";
		
		//Declare local instance variables
		let set_symbol = (arg0_symbol_obj) => {
			//Convert from parameters
			let symbol_obj = (arg0_symbol_obj) ? arg0_symbol_obj : {};
			
			//Call naissance.Geometry.setSymbols if this.options._id is defined, otherwise call naissance.Brush.setSelectedSymbol
			(options._id) ?
				naissance.Geometry.setSymbols(options._id(), symbol_obj) :
				naissance.Brush.setSelectedSymbol(symbol_obj);
		};
		
		//Return statement
		return new ve.Interface({
			stroke_colour: veColour(main.brush.stroke_colour, {
				name: "Stroke Colour",
				onuserchange: (v, e) => {
					set_symbol({ lineColor: e.getHex() });
				}
			}),
			stroke_opacity: veRange(main.brush.stroke_opacity/100, {
				name: "Stroke Opacity",
				onuserchange: (v, e) => {
					set_symbol({ lineOpacity: e });
				}
			}),
			stroke_width: veNumber(main.brush.stroke_width, {
				name: "Stroke Width",
				onuserchange: (v) => {
					set_symbol({ lineWidth: v });
				}
			}),
			
			stroke_line_cap: new ve.Select({
				butt: {
					name: "Butt",
					selected: true
				},
				round: {
					name: "Round"
				},
				square: {
					name: "Square"
				}
			}, {
				name: "Line Cap",
				onuserchange: (v) => {
					set_symbol({ lineCap: v });
				}
			}),
			stroke_line_join: new ve.Select({
				bevel: {
					name: "Bevel"
				},
				miter: {
					name: "Miter",
					selected: true
				},
				round: {
					name: "Round",
				}
			}, {
				name: "Line Join",
				onuserchange: (v) => {
					set_symbol({ lineJoin: v });
				}
			})
		}, { name: options.name });
	}
};