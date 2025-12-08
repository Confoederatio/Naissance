global.UI_MapContextMenu = class UI_MapContextMenu extends ve.Class {
	constructor () {
		super();
		this.interface = veContextMenu({
			//New Polygon/Line/Point
			new_polygon: veButton(() => this._openNewGeometryUI("GeometryPolygon"), { name: "New Polygon" }),
			new_line: veButton(() => this._openNewGeometryUI("GeometryLine"), { name: "New Line" }),
			new_point: veButton(() => this._openNewGeometryUI("GeometryPoint"), { name: "New Point" }),
			
			clear_brush: veButton(() => {
				DALS.Timeline.parseAction({
					options: { name: "Clear Brush", key: "clear_brush" },
					value: [{ type: "Brush", select_geometry_id: false }]
				});
				this.interface.close();
			}, { name: "Clear Brush", limit: () => main.brush._selected_geometry })
		}, { id: "ui_map_context_menu" })
	}
	
	_openNewGeometryUI (arg0_geometry_class, arg1_DALS_command) {
		//Convert from parameters
		let geometry_class = arg0_geometry_class;
		let DALS_command = (arg1_DALS_command) ? arg1_DALS_command : `create_${geometry_class.replace("Geometry", "").toLowerCase()}`;
		
		//Declare local instance variables
		if (this.geometry_interface)
			this.interface.removeContextMenu(this.geometry_interface.index);
		this.geometry_interface = this.interface.addContextMenu({
			geometry_name: veText(`New ${geometry_class.replace("Geometry", "")}`, { name: "Name" }),
			create_geometry: veButton(() => {
				veToast(`Created ${this.geometry_interface.geometry_name.v}`);
				let select_geometry_id = Class.generateRandomID(naissance.Geometry);
				
				DALS.Timeline.parseAction({
					options: { name: `Create ${geometry_class}`, key: `create_${geometry_class}` },
					value: [{ type: geometry_class, [DALS_command]: {
						id: select_geometry_id,
						name: this.geometry_interface.geometry_name.v,
						
						coordinates: (DALS_command === "create_point") ? (map.mouse_click_coords || map.mouse_hover_coords) : undefined
					}}]
				});
				DALS.Timeline.parseAction({
					options: { name: "Select Geometry", key: "select_geometry" },
					value: [{ type: "Brush", select_geometry_id: select_geometry_id }]
				});
				this.interface.close();
			})
		}, { id: "brush_map_context_menu_new_geometry" });
	}
};