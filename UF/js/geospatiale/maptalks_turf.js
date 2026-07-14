//Initialise functions
{
	if (!global.Geospatiale)
		/**
		 * The namespace for all UF/Geospatiale utility functions, typically for static methods.
		 * 
		 * @namespace Geospatiale
		 */
		global.Geospatiale = {};
	
	/**
	 * Cleans rings within a GeoJSON FeatureCollection/MultiPolygon/Polygon to ensure Turf.js validity.
	 *
	 * @param {Object} arg0_geojson_feature
	 *
	 * @returns {Object|null}
	 */
	Geospatiale.cleanRings = function (arg0_geojson_feature) {
		//Convert from parameters
		let geojson_feature = arg0_geojson_feature;
		
		if (!geojson_feature) return null; //Internal guard clause if geojson_feature isn't defined
		
		//Handle Polygon cleaning
		if (geojson_feature.type === "Polygon") {
			let valid_rings = [];
			
			//Iterate over all geojson_feature.coordinates (rings)
			for (let i = 0; i < geojson_feature.coordinates.length; i++) {
				let clean_ring = [];
				let local_ring = geojson_feature.coordinates[i];
				
				//Deduplicate points to calculate true topological length
				if (local_ring) {
					//Iterate over all coords in local_ring
					for (let x = 0; x < local_ring.length; x++) {
						let point_a = local_ring[x];
						let point_b = clean_ring[clean_ring.length - 1];
						
						let is_duplicate = (point_b) ?
							point_a[0] === point_b[0] && point_a[1] === point_b[1] : false;
						
						if (!is_duplicate) clean_ring.push(point_a);
					}
				}
				
				if (clean_ring.length >= 4) {
					valid_rings.push(local_ring);
				} else {
					//Return statement
					if (i === 0) return null;
				}
			}
			geojson_feature.coordinates = valid_rings;
			
			//Return statement
			return (geojson_feature.coordinates.length > 0) ? geojson_feature : null;
		}
		//Handle MultiPolygon cleaning
		else if (geojson_feature.type === "MultiPolygon") {
			let valid_polygons = [];
			
			//Iterate over all geojson_feature.coordinates (rings)
			for (let i = 0; i < geojson_feature.coordinates.length; i++) {
				let is_poly_valid = true;
				let local_polygon = geojson_feature.coordinates[i];
				let valid_rings = [];
				
				//Iterate over all rings in local_polygon
				for (let x = 0; x < local_polygon.length; x++) {
					let local_ring = local_polygon[x];
					let clean_ring = [];
					
					if (local_ring)
						//Iterate over all coords in local_ring
						for (let y = 0; y < local_ring.length; y++) {
							let point_a = local_ring[y];
							let point_b = clean_ring[clean_ring.length - 1];
							
							let is_duplicate = (point_b) ?
								(point_a[0] === point_b[0] && point_a[1] === point_b[1]) : false;
							
							if (!is_duplicate) clean_ring.push(point_a);
						}
					
					if (clean_ring.length >= 4) {
						valid_rings.push(local_ring);
					} else {
						if (x === 0) {
							is_poly_valid = false;
							break;
						}
					}
				}
				
				if (is_poly_valid && valid_rings.length > 0) {
					valid_polygons.push(valid_rings);
				}
			}
			geojson_feature.coordinates = valid_polygons;
			
			//Return statement
			return (geojson_feature.coordinates.length > 0) ? geojson_feature : null;
		}
		//Recursive check for GeometryCollections
		else if (geojson_feature.type === "GeometryCollection") {
			let valid_geometries = [];
			
			//Iterate over all geojson_feature.geometries and recursively process them
			for (let i = 0; i < geojson_feature.geometries.length; i++) {
				let cleaned_sub_geom = Geospatiale.cleanRings(geojson_feature.geometries[i]);
				if (cleaned_sub_geom) valid_geometries.push(cleaned_sub_geom);
			}
			geojson_feature.geometries = valid_geometries;
			
			//Return statement
			return (geojson_feature.geometries.length) > 0 ? geojson_feature : null;
		}
		
		//Return statement
		return geojson_feature;
	};
	
	/**
	 * Converts a {@link maptalks.Geometry} into a {@link turf.Geometry}.
	 *
	 * @param {maptalks.Geometry} arg0_geometry
	 *
	 * @returns {Object|turf.Feature|null}
	 */
	Geospatiale.convertMaptalksToTurf = function (arg0_geometry) {
		//Convert from parameters
		let geometry = arg0_geometry;
		
		//Internal guard clauses
		if (Geospatiale.getCoordsType(geometry) === "turf_geometry") return geometry;
		if (geometry === null) return null;
		
		try {
			if (typeof geometry === "object" && typeof geometry.toJSON !== "function") {
				let temp_geometry = maptalks.GeoJSON.toGeometry(geometry);
				geometry = temp_geometry === null ? maptalks.Geometry.fromJSON(geometry) : temp_geometry;
			}
			
			let geojson = geometry.toGeoJSON();
			let geometry_data = geojson.geometry ? geojson.geometry : geojson;
			
			//Post-process geometry
			let final_geometry = Geospatiale.cleanRings(geometry_data);
			
			//Return statement
			return (final_geometry) ? turf.feature(final_geometry) : null;
		} catch (e) {
			//Return statement
			return (typeof geometry === "object") ? geometry : null;
		}
	};
	
	/**
	 * Converts a {@link turf.Geometry} into a {@link maptalks.Geometry}
	 * 
	 * @param {turf.Geometry} arg0_geometry
	 * 
	 * @returns {maptalks.Geometry|maptalks.GeometryCollection}
	 */
	Geospatiale.convertTurfToMaptalks = function (arg0_geometry) {
		const geometry = arg0_geometry;
		
		//Internal guard clause if the geometry is already a Maptalks geometry
		if (Geospatiale.getCoordsType(geometry) === "maptalks_geometry") return geometry;
		if (geometry === null) return null;
		
		// Handle Turf Feature or raw geometry
		let feature = geometry;
		if (geometry.type !== "Feature")
			feature = { type: "Feature", geometry: geometry, properties: {} };
		
		//Convert using Maptalks built-in
		let result = maptalks.GeoJSON.toGeometry(feature);
		
		//Return statement; handle array results (MultiPolygon becomes array)
		if (Array.isArray(result))
			return new maptalks.GeometryCollection(result);
		return result;
	};
	
	/**
	 * Returns the coords/geometry format the variable represents.
	 * 
	 * @param {*} arg0_format - The coords/geometry format to input.
	 *
	 * @returns {String} - Either 'geojson_coords'/'geojson_geometry'/'leaflet_coords'/'leaflet_geometry'/'maptalks_coords'/'maptalks_geometry'/'naissance_coords'/'naissance_geometry'/'turf_coords'/'turf_geometry'.
	 */
	Geospatiale.getCoordsType = function (arg0_format) {
		//Convert from parameters
		let format = arg0_format;
		
		//Guard clause if format does not exist
		if (!format)
			return undefined;
		
		//Check if type is 'turf_geometry'
		if (typeof format.toJSON !== "function" && format.type) { //GeoJSON cannot have live functions bound to it
			return "turf_geometry";
		} else {
			return "maptalks_geometry";
		}
	};
	
	/**
	 * Whether the coords type being tested are loosely GeoJSON compatible.
	 * 
	 * @param {*} arg0_coords
	 *
	 * @returns {boolean}
	 */
	Geospatiale.isGeoJSONCoords = function (arg0_coords) {
		//Convert from parameters
		let coords = arg0_coords;
		
		//Internal guard clauses to ensure compatibility
		if (!Array.isArray(coords)) return;
		if (!Array.isArray(coords[0])) return;
		
		//Return statement
		return coords.every(Geospatiale.isGeoJSONCoords);
	};
}