//Initialise functions
{
	if (!global.Geospatiale) global.Geospatiale = {};
	
	Geospatiale.convertMaptalksToTurf = function (arg0_geometry) {
		//Convert from parameters
		let geometry = arg0_geometry;
		
		//Internal guard clause if the geometry is already a Turf geometry
		if (Geospatiale.getCoordsType(geometry) === "turf_geometry") return geometry;
		
		//Declare local instance variables
		let geojson = geometry.toGeoJSON();
		
		//Return statement
		return turf.feature(geojson.geometry);
	};
	
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
		if (format.geometry && format.properties && format.type && Object.keys(format).length <= 3) {
			return "turf_geometry";
		} else if (Object.keys(format).length > 3) {
			return "maptalks_geometry";
		}
	};
	
	/**
	 * Whether the coords type being tested are loosely GeoJSON compatible.
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