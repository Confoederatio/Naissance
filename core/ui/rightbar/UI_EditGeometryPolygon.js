global.UI_EditGeometryPolygon = class extends ve.Class {
	constructor () {
		super();
	}
	
	/**
	 * @param {Object} [arg0_options]
	 *  @param {string} [arg0_options.name="Polygon Symbol"]
	 * 
	 * @returns {ve.Interface}
	 */
	draw (arg0_options) {
		//Convert from parameters
		let options = (arg0_options) ? arg0_options : {};
		
		//Initialise options
		if (!options.name) options.name = "Polygon Symbol";
		
		//Return statement
		return new ve.Interface({
			fill_colour: veColour(main.brush.colour, {
				name: "Fill Colour",
				onuserchange: (v, e) => {
					naissance.Brush.setSelectedSymbol({ polygonFill: e.getHex() });
				}
			}),
			fill_opacity: veRange(main.brush.opacity/100, {
				name: "Fill Opacity",
				onuserchange: (v) => {
					naissance.Brush.setSelectedSymbol({ polygonOpacity: v });
				}
			}),
			fill_pattern_url: new ve.Text("", {
				name: "Fill Pattern",
				attributes: {
					placeholder: "File path or URL ..."
				},
				onuserchange: (v) => {
					if (v.length === 0) {
						veToast("Reset fill pattern!");
					} else {
						naissance.Brush.setSelectedSymbol({ polygonPatternFile: v });
					}
				}
			})
		}, { name: options.name });
	}
}