global.UI_EditGeometryLabel = class extends ve.Class {
	constructor () {
		super();
	}
	
	/**
	 * @param {Object} [arg0_options]
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
				onuserchange: (v, e) => naissance.Brush.setSelectedLabelSymbol({ textFill: e.getHex() }),
			}),
			font_family: veSelect({
				monospace: {
					name: "Monospace"
				},
				...font_select_obj
			}, {
				name: "Font Family",
				onuserchange: (v) => naissance.Brush.setSelectedLabelSymbol({ textFaceName: v }),
				selected: brush_symbol.textFaceName
			}),
			font_size: veNumber(brush_symbol.textSize, {
				name: "Font Size",
				onuserchange: (v) => naissance.Brush.setSelectedLabelSymbol({ textSize: v })
			}),
			font_stroke: veColour(brush_symbol.textHaloFill, {
				name: "Font Stroke",
				onuserchange: (v, e) => naissance.Brush.setSelectedLabelSymbol({ textHaloFill: e.getHex() })
			}),
			font_stroke_width: veNumber(brush_symbol.textHaloRadius, {
				name: "Font Stroke Width",
				
				min: 0,
				onuserchange: (v) => naissance.Brush.setSelectedLabelSymbol({ textHaloRadius: v })
			})
		}, { name: options.name });
	}
};