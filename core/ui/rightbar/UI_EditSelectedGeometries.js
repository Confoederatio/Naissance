global.UI_EditSelectedGeometries = class extends ve.Class {
	constructor () {
		super();
	}
	
	draw () {
		/**
		 * maptalks.Polygon symbol:
		 */
		this.polygon_symbol = main.interfaces.edit_geometry_polygon.draw();
		this.line_symbol = new ve.Interface({
			
		}, { name: "Line Symbol" });
		this.point_symbol = new ve.Interface({
			
		}, { name: "Point Symbol" });
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
};