global.UI_EditGeometryLabel = class extends ve.Class {
	constructor () {
		super();
	}
	
	/**
	 * @param {Object} [arg0_options]
	 *  @param {function} [arg0_options._id]
	 *  @param {string} [arg0_options.name="Label Symbol"]
	 *
	 * @returns {ve.Interface}
	 */
	draw (arg0_options) {
		//Convert from parameters
		let options = (arg0_options) ? arg0_options : {};
		
		//Initialise options
		if (!options.name) options.name = "Label Symbol";
		
		//Declare local instance variables
		let brush_symbol = main.brush.getBrushSymbol();
		let font_select_obj = {};
		let set_symbol = (arg0_symbol_obj) => {
			//Convert from parameters
			let symbol_obj = (arg0_symbol_obj) ? arg0_symbol_obj : {};
			
			//Call naissance.Geometry.setSymbols if this.options._id is defined, otherwise call naissance.Brush.setSelectedSymbol
			(options._id) ?
				naissance.Geometry.setSymbols(options._id(), { _set_label_symbol: symbol_obj }) :
				naissance.Brush.setSelectedSymbol(symbol_obj);
		};
		
		//Populate font_select_obj
		main.settings.font_registry.forEach((local_value) => {
			font_select_obj[local_value] = {
				name: local_value
			}
		});
		
		//Return statement
		return new ve.Interface({
			font_colour: veColour(brush_symbol.textFill, {
				name: "Font Colour",
				onuserchange: (v, e) => set_symbol({ textFill: e.getHex() }),
			}),
			font_family: veSelect({
				monospace: {
					name: "Monospace"
				},
				...font_select_obj
			}, {
				name: "Font Family",
				onuserchange: (v) => set_symbol({ textFaceName: v }),
				selected: brush_symbol.textFaceName
			}),
			font_size: veNumber(brush_symbol.textSize, {
				name: "Font Size",
				onuserchange: (v) => set_symbol({ textSize: v })
			}),
			font_stroke: veColour(brush_symbol.textHaloFill, {
				name: "Font Stroke",
				onuserchange: (v, e) => set_symbol({ textHaloFill: e.getHex() })
			}),
			font_stroke_width: veNumber(brush_symbol.textHaloRadius, {
				name: "Font Stroke Width",
				
				min: 0,
				onuserchange: (v) => set_symbol({ textHaloRadius: v })
			})
		}, { name: options.name });
	}
};