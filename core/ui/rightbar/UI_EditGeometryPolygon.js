global.UI_EditGeometryPolygon = class extends ve.Class {
	constructor () {
		super();
	}
	
	/**
	 * @param {Object} [arg0_options]
	 *  @param {function} [arg0_options._id]
	 *  @param {string} [arg0_options.name="Polygon Symbol"]
	 * 
	 * @returns {ve.Interface}
	 */
	draw (arg0_options) {
		//Convert from parameters
		let options = (arg0_options) ? arg0_options : {};
		
		//Initialise options
		if (!options.name) options.name = "Polygon Symbol";
		
		//Declare local instance variables
		let set_symbol = UI_EditSelectedGeometries._makeSetSymbol(options);
		
		//Return statement
		return new ve.Interface({
			fill_colour: veColour(main.brush.colour, {
				name: "Fill Colour",
				onuserchange: (v, e) => {
					set_symbol({ polygonFill: e.getHex() });
				}
			}),
			fill_opacity: veRange(main.brush.opacity/100, {
				name: "Fill Opacity",
				onuserchange: (v) => {
					set_symbol({ polygonOpacity: v });
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
						set_symbol({ polygonPatternFile: v });
					}
				}
			})
		}, { name: options.name });
	}
}