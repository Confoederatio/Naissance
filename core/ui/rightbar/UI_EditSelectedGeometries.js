global.UI_EditSelectedGeometries = class extends ve.Class {
	constructor () {
		super();
	}
	
	draw () {
		//Declare local instance variables
		this.label_symbol = new UI_LabelSymbol(main.settings.default_label_symbol, {
			name: "Label Symbol",
			special_function: (v) => UI_EditSelectedGeometries._makeSetSymbol({ label_symbol: v })
		});
		this.line_symbol = new UI_LineSymbol(main.settings.default_line_symbol, {
			name: "Line Symbol",
			special_function: (v) => UI_EditSelectedGeometries._makeSetSymbol(v)
		});
		this.point_symbol = new UI_PointSymbol(main.settings.default_point_symbol, {
			name: "Point Symbol",
			special_function: (v) => UI_EditSelectedGeometries._makeSetSymbol(v)
		});
		this.polygon_symbol = new UI_PolygonSymbol(main.settings.default_polygon_symbol, {
			name: "Polygon Symbol",
			special_function: (v) => UI_EditSelectedGeometries._makeSetSymbol(v)
		});
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
		
		//Call naissance.Geometry.setSymbols if this.options._id is defined, otherwise call naissance.Brush.setSelectedSymbol
		(options._id) ?
			naissance.Geometry.setSymbols(options._id, options) :
			naissance.Brush.setSelectedSymbol(options);
	};
};