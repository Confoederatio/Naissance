global.UI_MapSettings = class UI_MapSettings extends ve.Class {
	constructor () {
		super();
		
		//Declare local instance variables
		let proj_ortho = "+proj=gnom +lat_0=90 +lon_0=0 +x_0=6300000 +y_0=6300000 +ellps=WGS84 +datum=WGS84 +units=m +no_defs";
		let proj_ortho_transform = proj4("WGS84", proj_ortho);
		
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
					
					if (local_projection.options) {
						map.setSpatialReference(local_projection.options);
						
						//Refresh this.draw() call
						for (let i = 0; i < naissance.Feature.instances.length; i++)
							if (naissance.Feature.instances[i] instanceof naissance.FeatureTileLayer)
								naissance.Feature.instances[i].draw();
					}
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
					map.setSpatialReference({
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
						resolutions: [
							156543.03392804097, 78271.51696402048, 39135.75848201024,
							19567.87924100512, 9783.93962050256, 4891.96981025128,
							2445.98490512564, 1222.99245256282, 611.49622628141,
							305.748113140705, 152.8740565703525, 76.43702828517625,
							38.21851414258813,
						],
						fullExtent: {
							top: 6378137 * Math.PI,
							left: -6378137 * Math.PI,
							bottom: -6378137 * Math.PI,
							right: 6378137 * Math.PI,
						}
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
};