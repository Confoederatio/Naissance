/**
 * Parses a JSON action for the target Brush.
 * - Static method of: {@link naissance.Brush}
 *
 * `arg0_json`: {@link Object|string}
 * - `.select_feature_id`: {@link string|null}
 * - `.select_geometry_id`: {@link string|null}
 *
 * @param {Object|string} arg0_json
 */
naissance.Brush.parseAction = function (arg0_json) {
	//Convert from parameters
	let json = (typeof arg0_json === "string") ? JSON.parse(arg0_json) : arg0_json;
	
	if (typeof json.select_feature_id === "string") {
		let feature_obj = naissance.Feature.instances.filter((v) => v.id === json.select_feature_id);
		if (feature_obj) feature_obj = feature_obj[0];
		main.brush.selected_feature = feature_obj;
		if (main.brush.selected_feature) main.brush.selected_feature.draw();
	} else if (json.select_feature_id === false) {
		main.brush.selected_feature = undefined;
	}
	if (json.select_geometry_id !== undefined) {
		//Handle old geometry
		//main.brush.mode === "override" handling
		if (main.brush.selected_geometry && ["node_override", "override"].includes(main.brush.mode)) {
			//1. Fetch the current layer, turf_cursor_geometry of the present brush
			let current_layer = main.brush.selected_geometry.getLayer();
			
			//2. If defined, difference turf_brush_geometry from all geometries in the layer
			if (current_layer && main.brush.selected_geometry.geometry) {
				let all_layer_geometries = current_layer.getAllGeometries();
				
				for (let i = 0; i < all_layer_geometries.length; i++)
					if (all_layer_geometries[i].id !== main.brush.selected_geometry.id && all_layer_geometries[i].geometry) try {
						DALS.Timeline.parseAction({
							options: { name: "Remove from Polygon", key: "remove_from_polygon" },
							value: [{
								type: "GeometryPolygon",
								
								geometry_id: all_layer_geometries[i].id,
								remove_from_polygon: { geometry: main.brush.selected_geometry.geometry.toJSON() }
							}]
						});
					} catch (e) { console.warn(e); }
			}
		}
		
		//Select new geometry
		if (typeof json.select_geometry_id === "string") {
			let geometry_obj = naissance.Geometry.instances.filter((v) => v.id === json.select_geometry_id);
			if (geometry_obj) geometry_obj = geometry_obj[0];
			main.brush.selected_geometry = geometry_obj;
			if (main.brush.selected_geometry) main.brush.selected_geometry.draw();
		} else if (json.select_geometry_id === false) {
			main.brush.selected_geometry = undefined;
		}
		
		//Handle brush mode
		main.brush.node_editor.update();
	}
};