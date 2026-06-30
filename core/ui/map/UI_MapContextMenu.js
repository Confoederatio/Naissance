global.UI_MapContextMenu = class UI_MapContextMenu extends ve.Class {
	constructor () {
		super();
		
		//Declare local instance variables
		this.coordinates = main.brush.getCoordinates();
		this.geometry = new maptalks.Marker(this.coordinates, {
			symbol: {
				textFill: "rgba(255, 255, 255, 1)",
				textHaloFill: "black",
				textHaloRadius: 2,
				textName: "•",
				textSize: 24,
			}
		});
			this.geometry.addTo(main.layers.cursor_layer);
		
		this.interface = veContextMenu({
			information: new ve.HTML(`${Math.roundNumber(this.coordinates.x, 6)},${Math.roundNumber(this.coordinates.y, 6)}`),
			
			//New Polygon/Line/Point
			new_polygon: veButton(() => this._openNewGeometryUI("GeometryPolygon"), { name: "New Polygon" }),
			new_line: veButton(() => this._openNewGeometryUI("GeometryLine"), { name: "New Line" }),
			new_point: veButton(() => this._openNewGeometryUI("GeometryPoint"), { name: "New Point" }),
			
			clear_brush: veButton(() => {
				DALS.Timeline.parseAction("clear_brush", [{ type: "Brush", select_geometry_id: false }]);
				this.interface.close();
				
				//Deselect everything else currently selected
				let selected_geometries = naissance.Brush.getSelectedGeometries();
				
				for (let i = 0; i < selected_geometries.length; i++)
					selected_geometries[i].selected = false;
			}, { name: "Clear Brush", limit: () => naissance.Brush.getSelectedGeometries().length })
		}, { id: "ui_map_context_menu" });
		
		this.logic_loop = setInterval(() => {
			if (!document.body.contains(this.interface.information.element)) {
				this.geometry.remove();
				clearInterval(this.logic_loop);
			}
		}, 100);
	}
	
	_openNewGeometryUI (arg0_geometry_class) {
		//Convert from parameters
		let geometry_class = arg0_geometry_class;
		
		if (this.geometry_interface) this.interface.removeContextMenu(this.geometry_interface.index);
		this.geometry_interface = this.interface.addContextMenu(new UI_CreateGeometry(geometry_class, {
			onclick: () => this.interface.close(),
			return: true 
		}), {
			id: "brush_map_context_menu_new_geometry"
		});
	}
};