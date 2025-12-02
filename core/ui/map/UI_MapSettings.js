global.UI_MapSettings = class UI_MapSettings extends ve.Class {
	constructor () {
		super();
		
		//Declare local instance variables
		let previous_window = document.querySelector(`.ve.window[id="UI_MapSettings"]`)?.instance;
		if (previous_window) previous_window.close();
		let projection_obj = {
			"EPSG:4326": {
				name: "Equirectangular",
				options: { projection: "EPSG:4326" }
			},
			"EPSG:3857": {
				name: "Mercator",
				options: { projection: "EPSG:3857" }
			}
		};
		let spatial_reference = map.getSpatialReference();
		
		if (projection_obj[spatial_reference._projection.code])
			projection_obj[spatial_reference._projection.code].selected = true;
		
		this.interface = veWindow({
			projection: veSelect(projection_obj, {
				name: "Projection",
				onuserchange: (v) => {
					//Declare local instance variables
					let local_projection = projection_obj[v];
					
					if (local_projection.options)
						DALS.Timeline.parseAction({
							options: { name: "Set Map Projection", key: "set_map_projection" },
							value: [{ type: "Renderer", set_map_spatial_reference: local_projection.options }]
						});
				},
				x: 0, y: 0
			}),
			proj4js_string: veText("", {
				name: "Proj4JS String",
				x: 0, y: 1
			}),
			proj4js_confirm_settings: veButton(() => {
				//Declare local instance variables
				let proj4js_string = this.interface.proj4js_string.v;
				let proj4js_transform = proj4("WGS84", proj4js_string);
				
				if (proj4js_string.length > 0)
					DALS.Timeline.parseAction({
						options: { name: "Set Map Projection", key: "set_map_projection" },
						value: [{ type: "Renderer", set_map_spatial_reference: {
							projection: {
								code: "proj4-custom",
								project: (c) => {
									if (!Array.isArray(c.toArray())) return new maptalks.Coordinate([0, 0]);
									let pc = proj4js_transform.forward(c.toArray());
									
									//If projection returns invalid or NaN, return neutral coords
									if (!pc || isNaN(pc[0]) || isNaN(pc[1])) pc = [0, 0];
									return new maptalks.Coordinate(pc);
								},
								unproject: (pc) => {
									if (!Array.isArray(pc.toArray())) return new maptalks.Coordinate([0, 0]);
									let result = proj4js_transform.inverse(pc.toArray());
									if (!result || isNaN(result[0]) || isNaN(result[1])) result = [0, 0];
									return new maptalks.Coordinate(result);
								},
								measure: "EPSG:4326"
							},
							fullExtent: config.defines.map.custom_projections_full_extent,
							resolutions: config.defines.map.custom_projections_resolutions
						} }]
					});
			}, { 
				name: "Apply Proj4JS Projection", 
				tooltip: `<span style = "align-items: top; display: flex;"><icon>warning</icon><span style = "margin-left: 0.5rem;">Back up your save before applying a new Proj4JS projection, as custom projections can be unstable!</span></span>`,
				x: 1, y: 1
			})
		}, { 
			can_rename: false,
			id: "UI_MapSettings",
			name: "Map Settings",
			width: "30rem"
		});
	}
	
	_DALS_setCustomProjection (arg0_proj4js_string, arg1_do_not_add_to_undo_redo) { //[WIP] - Finish function body
		
	}
	
	_DALS_setProjection (arg0_projection, arg1_do_not_add_to_undo_redo) { //[WIP] - Finish function body
		
	}
};