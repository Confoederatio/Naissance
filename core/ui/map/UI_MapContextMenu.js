global.UI_MapContextMenu = class UI_MapContextMenu extends ve.Class {
	constructor () {
		super();
		this.interface = veContextMenu({
			//New Polygon/Line/Point
			new_polygon: veButton(() => {
				let new_polygon_interface = this.interface.addContextMenu({
					polygon_name: veText("New Polygon", { name: "Name" }),
					colour: veColour(Colour.convertHexToRGBA(main.brush.brush_options.colour.v), {
						attributes: { "data-brush-colour": true },
						name: "Colour",
						onuserchange: (v) => main.brush.colour = v
					}),
					create_polygon: veButton(() => {
						new veToast(`Created ${new_polygon_interface.polygon_name.v}`);
						let select_geometry_id = Class.generateRandomID(naissance.Geometry);
						
						DALS.Timeline.parseAction({
							options: { name: "Create GeometryPolygon", key: "create_GeometryPolygon" },
							value: [{ type: "GeometryPolygon", create_polygon: { 
								id: select_geometry_id,
								name: new_polygon_interface.polygon_name.v
							}}]
						});
						DALS.Timeline.parseAction({
							options: { name: "Select Geometry", key: "select_geometry" },
							value: [{ type: "Brush", select_geometry_id: select_geometry_id }]
						});
						this.interface.close();
					}, { name: "Create Polygon" })
				}, { id: "brush_map_context_menu_new_polygon" })
			}, {
				name: "New Polygon"
			}),
			
			new_line: veButton(() => {
				
			}, { name: "New Line" }),
			
			new_point: veButton(() => {
				
			}, { name: "New Point" }),
			
			clear_brush: veButton(() => {
				DALS.Timeline.parseAction({
					options: { name: "Clear Brush", key: "clear_brush" },
					value: [{ type: "Brush", select_geometry_id: false }]
				});
				this.interface.close();
			}, { name: "Clear Brush", limit: () => main.brush._selected_geometry })
		}, { id: "ui_map_context_menu" })
	}
};