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
		let set_symbol = UI_EditSelectedGeometries._makeSetSymbol(options);
		
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
					set_symbol({ lineOpacity: v });
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