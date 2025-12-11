global.UI_EditGeometryPoint = class extends ve.Class {
	constructor () {
		super();
	}
	
	draw (arg0_options) {
		//Convert from parameters
		let options = (arg0_options) ? arg0_options : {};
		
		//Initialise options
		if (!options.name) options.name = "Point Symbol";
		
		//Declare local instance variables
		let brush_symbol = main.brush.getBrushSymbol();
		let set_symbol = UI_EditSelectedGeometries._makeSetSymbol(options);
		
		//Return statement
		return veInterface({
			marker_icon: veFile(brush_symbol._markerFile, {
				name: "Change Icon",
				onuserchange: (v) => set_symbol({ markerFile: v[0] }),
				width: 2,
				x: 0,
				y: 0
			}),
			opacity: veRange(brush_symbol._markerOpacity, {
				name: "Opacity",
				onuserchange: (v) => set_symbol({ markerOpacity: v }),
				x: 0,
				y: 1
			}),
			
			marker_height: veNumber(brush_symbol._markerHeight, {
				name: "Height",
				onuserchange: (v) => set_symbol({ markerHeight: v }),
				x: 0,
				y: 2
			}),
			marker_width: veNumber(brush_symbol._markerWidth, {
				name: "Width",
				onuserchange: (v) => set_symbol({ markerWidth: v }),
				x: 1,
				y: 2
			}),
			
			marker_x_offset: veNumber(brush_symbol._markerDx, {
				name: "Offset X",
				onuserchange: (v) => set_symbol({ markerDx: v }),
				x: 0,
				y: 3
			}),
			marker_y_offset: veNumber(brush_symbol._markerDy, {
				name: "Offset Y",
				onuserchange: (v) => set_symbol({ markerDy: v }),
				x: 1,
				y: 3
			})
		}, { name: options.name });
	}
};