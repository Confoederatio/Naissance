global.UI_EditSelectedGeometries = class extends ve.Class {
	constructor () {
		super();
	}
	
	draw () {
		/**
		 * maptalks.Polygon symbol:
		 */
		this.polygon_symbol = main.interfaces.edit_geometry_polygon.draw();
		this.line_symbol = main.interfaces.edit_geometry_line.draw();
		this.point_symbol = main.interfaces.edit_geometry_point.draw();
		this.label_symbol = main.interfaces.edit_geometry_label.draw();
		this.properties = new ve.Interface({
			visibility: new ve.Interface({
				minimum_zoom: new ve.Number(0, {
					name: "Minimum Zoom",
					onuserchange: (v) => {
						naissance.Brush.setSelectedProperties({ min_zoom: v });
					}
				}),
				maximum_zoom: new ve.Number(0,{
					name: "Maximum Zoom",
					onuserchange: (v) => {
						naissance.Brush.setSelectedProperties({ max_zoom: v });
					}
				})
			}, { name: "Visibility", open: true })
		}, { name: "Properties", open: true });
	}
	
	open () {
		this.draw();
		
		//Open UI
		super.open("instance", {
			can_rename: false,
			name: "Edit Selected Geometries",
			width: "24rem" 
		});
	}
	
	static _makeSetSymbol (arg0_options) {
		//Convert from parameters
		let options = (arg0_options) ? arg0_options : {};
		
		//Return function
		return (arg0_symbol_obj) => {
			//Convert from parameters
			let symbol_obj = (arg0_symbol_obj) ? arg0_symbol_obj : {};
			
			//Call naissance.Geometry.setSymbols if this.options._id is defined, otherwise call naissance.Brush.setSelectedSymbol
			(options._id) ?
				naissance.Geometry.setSymbols(options._id(), 
					(!options.wrapper_key) ? symbol_obj : { [options.wrapper_key]: symbol_obj }) :
				naissance.Brush.setSelectedSymbol(symbol_obj);
		};
	};
};