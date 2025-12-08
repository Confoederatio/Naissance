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
		let font_select_obj = {};
		
		//Populate font_select_obj
		main.settings.font_registry.forEach((local_value) => {
			font_select_obj[local_value] = {
				name: local_value
			}
		});
		
		//Return statement
		return new ve.Interface({
			font_colour: veColour((main.settings.default_label_colour) ? main.settings.default_label_colour : [255, 255, 255], {
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
				selected: (main.settings.default_label_font) ? main.settings.default_label_font : "monospace"
			}),
			font_stroke: veColour((main.settings.default_label_stroke) ? main.settings.default_label_stroke : [0, 0, 0], {
				name: "Font Stroke",
				onuserchange: (v, e) => naissance.Brush.setSelectedLabelSymbol({ textHaloFill: e.getHex() })
			}),
			font_stroke_width: veNumber(Math.returnSafeNumber(main.settings.default_label_stroke_width, 2), {
				name: "Font Stroke Width",
				
				min: 0,
				onuserchange: (v) => naissance.Brush.setSelectedLabelSymbol({ textHaloRadius: v })
			})
		}, { name: options.name });
	}
};