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
		
		//Return statement
		return new ve.Interface({
			font_family: veSelect({
				monospace: {
					name: "Monospace",
					selected: true
				},
				"Karla, sans-serif": {
					name: "Karla"
				}
			}, {
				name: "Font Family",
				onuserchange: (v) => {
					naissance.Brush.setSelectedLabelSymbol({ textFaceName: v });
				}
			})
		}, { name: options.name });
	}
};