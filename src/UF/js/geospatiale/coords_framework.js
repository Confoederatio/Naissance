//GEOSPATIALE II - Not yet completely up to specification.
{
	//1. Master functions - KEEP AT TOP
	{
		/**
		 * getCoordsType() - Returns the coords/geometry format the variable represents.
		 * @param {*} arg0_format - The coords/geometry format to input.
		 *
		 * @returns {String} - Either 'geojson_coords'/'geojson_geometry'/'leaflet_coords'/'leaflet_geometry'/'maptalks_coords'/'maptalks_geometry'/'naissance_coords'/'naissance_geometry'/'turf_coords'/'turf_object'.
		 */
		function getCoordsType (arg0_format) {
			//Convert from parameters
			var format = arg0_format;

			//Guard clause if format does not exist
			if (!format)
				return undefined;

			//1. Master Types: Check if type is GeoJSON
			if (isGeoJSONCoords(format))
				return "geojson_coords";
			if (format._initHooksCalled && !format._latlngs && !format._symbolUpdated && !format._geometries)
				return "geojson_geometry";

			//2. Worker Types: Check if type is Leaflet/Maptalks/Naissance/Turf
			{
				//Leaflet
				if (Array.isArray(format)) {
					var flattened_array = format.flat(Infinity);

					if (typeof flattened_array[0] == "object") {
						try {
							if (flattened_array[0].lat && flattened_array[1].lng)
								return "leaflet_coords";
						} catch {}
					}
				}
				if (format._latlngs)
					return "leaflet_geometry";
				
				//Maptalks
				if (Array.isArray(format))
					if (!Array.isArray(format[0]) && typeof format[0] == "object")
						if (format[0].x != undefined && format[0].y != undefined)
							return "maptalks_coords";
				if (format._symbolUpdated || format._geometries)
					return "maptalks_geometry";

				//Naissance
				if (typeof format == "object")
					if (format.id && format.coords)
						return "naissance_geometry";

				//Turf
				if (Array.isArray(format))
					if (format.length == 2)
						if (Array.isArray(format[0]) && typeof format[1] == "string")
							if (["polygon", "multiPolygon"].includes(format[1]))
								return "turf_coords";
				if (typeof format == "object")
					if (format.type == "Feature" && format.geometry)
						return "turf_geometry";
			}

			//Return statement; if none of the above and is Array, return 'naissance_coords'
			if (format)
				if (Array.isArray(format))
					return "naissance_coords";
		}

		/**
		 * convertToGeoJSONCoords() - Converts any format to GeoJSON coords.
		 * @param {*} arg0_format
		 *
		 * @returns {Object}
		 */
		function convertToGeoJSONCoords (arg0_format) {
			//Convert from parameters
			var format = arg0_format;

			//Declare local instance variables
			var format_type = getCoordsType(format);
			var geojson_coords;

			//Guard clauses if format_type is already GeoJSON
			if (format_type == "geojson_geometry") return format;

			if (format_type == "leaflet_coords") {
				var leaflet_geojson = new L.Polygon(format).toGeoJSON();
				geojson_coords = leaflet_geojson.geometry;
			} else if (format_type == "leaflet_geometry") {
				var leaflet_geojson = new L.Polygon(format._latlngs).toGeoJSON();
				geojson_coords = leaflet_geojson.geometry;
			} else if (format_type == "maptalks_geometry") {
				geojson_coords = format.toGeoJSON();
			} else if (format_type == "turf_coords") {
				geojson_coords = {
					type: (format[1] == "polygon") ? "Polygon" : "MultiPolygon",
					coordinates: format[0]
				};
			} else if (format_type == "turf_geometry") {
				geojson_coords = format.geometry;
			}

			//Return statement
			return geojson_coords;
		}
	}

	//2. Worker functions
	{
		/**
		 * convertToLeafletCoords() - Converts any format to Leaflet coords.
		 * @param {*} arg0_format
		 *
		 * @returns {Array<Array<{ lat: number, lng: number }>>}
		 */
		function convertToLeafletCoords (arg0_format) {
			//Convert from parameters
			var format = arg0_format;

			//Declare local instance variables
			var format_type = getCoordsType(format);
			var leaflet_coords;

			//Guard clauses if already of Leaflet type
			if (format_type == "leaflet_coords")
				return JSON.parse(JSON.stringify(format));
			if (format_type == "leaflet_geometry")
				return JSON.parse(JSON.stringify(format._latlngs));

			//If a valid format type, convert it to Leaflet somehow
			if (format_type)
				if (format_type == "geojson_geometry") {
					if (format._layers) {
						var all_layers = Object.keys(format._layers);

						if (all_layers.length > 0)
							leaflet_coords = format._layers[all_layers[0]]._latlngs;
					}
				} else if (format_type == "maptalks_geometry") {
					leaflet_coords = convertToLeafletCoords(convertToGeoJSONCoords(format));
				} else if (format_type == "naissance_coords") {
					var temp_polygon = L.polygon(format);

					leaflet_coords = temp_polygon._latlngs;
				} else if (format_type == "naissance_geometry") {
					var temp_polygon = L.polygon(format.coords)

					leaflet_coords = temp_polygon._latlngs;
				} else if (format_type == "turf_coords") {
					var turf_obj = convertToTurfGeometry(format);

					var local_geojson = L.geoJSON(turf_obj);

					leaflet_coords = getLeafletGeoJSONCoords(local_geojson);
				} else if (format_type == "turf_geometry") {
					var local_geojson = L.geoJSON(format);

					leaflet_coords = getLeafletGeoJSONCoords(local_geojson);
				}

			//Return statement
			return leaflet_coords;
		}

		/**
		 * convertToMaptalksCoords() - Converts any format to Maptalks coords.
		 * @param {*} arg0_format
		 *
		 * @returns {Array<Array<{ x: number, y: number, z: number }>>}
		 */
		function convertToMaptalksCoords (arg0_format) {
			//Convert from parameters
			var format = arg0_format;

			//Declare local instance variables
			var format_type = getCoordsType(format);

			//Guard clause if format_type is already Maptalks
			if (format_type == "maptalks_geometry") return format;

			if (format_type === "geojson_geometry") {
				var geojson_geometry = (format.geometry || format); //Support both Feature and Geometry
				maptalks_coords = maptalks.GeoJSON.toGeometry(geojson_geometry).getCoordinates();
			} else if (format_type === "leaflet_coords") {
				maptalks_coords = convertLeafletCoordsToMaptalksCoords(format);
			} else if (format_type === "leaflet_geometry") {
				maptalks_coords = convertLeafletCoordsToMaptalksCoords(format._latlngs);
			} else if (format_type === "naissance_coords") {
				var geojson_coords = convertLeafletCoordsToGeoJSONCoords(format);
				maptalks_coords = maptalks.GeoJSON.toGeometry({
					type: "Polygon",
					coordinates: geojson_coords,
				}).getCoordinates();
			} else if (format_type === "turf_coords") {
				var geojson_obj = convertToTurfGeometry(format);
				maptalks_coords = maptalks.GeoJSON.toGeometry(geojson_obj.geometry).getCoordinates();
			} else if (format_type === "turf_geometry") {
				maptalks_coords = maptalks.GeoJSON.toGeometry(format.geometry).getCoordinates();
			} else if (format_type === "naissance_geometry") {
				var geojson_coords = convertLeafletCoordsToGeoJSONCoords(format.coords);
				maptalks_coords = maptalks.GeoJSON.toGeometry({
					type: "Polygon",
					coordinates: geojson_coords,
				}).getCoordinates();
			} else {
				console.error("Unknown coordinate format type:", format);
				throw new Error("Unsupported format for conversion to Maptalks.");
			}

			//Return statement
			return maptalks_coords;
		}

		/**
		 * convertToNaissanceCoords() - Converts any format to Naissance coords. GeoJSON-compatible.
		 * @param {*} arg0_format
		 *
		 * @returns {Array<Array<number, number>>}
		 */
		function convertToNaissanceCoords (arg0_format) {
			//Convert from parameters
			var format = arg0_format;

			//Declare local instance variables
			var leaflet_coords = format;

			//Iterate over leaflet_coords
			for (var i = 0; i < leaflet_coords.length; i++)
				if (Array.isArray(leaflet_coords[i])) {
					leaflet_coords[i] = convertToNaissanceCoords(leaflet_coords[i]);
				} else {
					leaflet_coords[i] = [leaflet_coords[i].lat, leaflet_coords[i].lng];
				}

			//Return statement
			return leaflet_coords;
		}

		/**
		 * convertToTurfCoords() - Converts any format to Turf coords.
		 * @param {*} arg0_format
		 *
		 * @returns {Array<Array<number, number>>}
		 */
		function convertToTurfCoords (arg0_format) {
			//Convert from parameters
			var format = arg0_format;

			//Declare local instance variables
			var format_type = getCoordsType(format);
			var turf_coords;

			//Guard clauses if already Turf type
			if (format_type == "turf_coords")
				return format;

			//If a valid format type, convert it to Turf somehow
			if (format_type)
				if (format_type == "geojson_geometry") {
					var geojson_coords = getLeafletGeoJSONCoords(format);

					turf_coords = convertLeafletCoordsToTurfGeometry(geojson_coords);
				} else if (["leaflet_coords", "naissance_coords"].includes(format_type)) {
					turf_coords = convertLeafletCoordsToTurfGeometry(format);
				} else if (format_type == "leaflet_geometry") {
					turf_coords = convertLeafletCoordsToTurfGeometry(format._latlngs);
				} else if (format_type == "maptalks_geometry") {
					turf_coords = convertMaptalksGeometryToTurfGeometry(format);
				} else if (format_type == "naissance_geometry") {
					var no_coords = false;

					//Guard clause if no coords
					{
						if (format.coords) {
							if (format.coords.length == 0)
								no_coords = true;
						} else {
							no_coords = true;
						}

						if (no_coords)
							return [format.coords, "polygon"];
					}

					turf_coords = convertLeafletCoordsToTurfGeometry(format.coords);
				} else if (format_type == "turf_geometry") {
					turf_coords = convertLeafletCoordsToTurfGeometry(format);
				}

			//Return statement
			return turf_coords;
		}

		/**
		 * convertToTurfGeometry() - Converts any format to Turf geometry.
		 * @param {*} arg0_format
		 *
		 * @returns {Array<Array<Array<number, number>>, String>} - [0] contains turf_coords; [1] represents either 'Polygon'/'MultiPolygon';
		 */
		function convertToTurfGeometry (arg0_format) {
			//Convert from parameters
			var format = arg0_format;

			//Declare local instance variables
			var format_type = getCoordsType(format);

			//Guard clauses for existing Turf formats
			if (format_type == "turf_coords") return turf[format[1]](format[0]);
			if (format_type == "turf_geometry") return format;

			//Process turf_coords
			var turf_coords = convertToTurfCoords(format);

			//Return statement
			return turf[turf_coords[1]](turf_coords[0]);
		}
	}

	//3. Internal helper functions - These should ideally not be used by end developers. KEEP AT BOTTOM
	{
		/**
		 * convertLeafletCoordsToGeoJSONCoords() - Converts Leaflet coords to GeoJSON .geometry.coordinates. Note that this is different from 'geojson_coords', which is .geometry, and not .geometry.coordinates.
		 * @param {Array<Array<Array<number, number>>>|Array<Array<Array<{ lat: number, lng: number }>>>} arg0_coords
		 *
		 * @returns {Array<Array<Array<number, number>>>|Array<Array<number, number>>}
		 */
		function convertLeafletCoordsToGeoJSONCoords (arg0_coords) {
			//Convert from parameters
			var coords = arg0_coords;

			//Declare local instance variables
			var leaflet_polygon = new L.Polygon(coords).toGeoJSON();

			//Return statement
			return leaflet_polygon.geometry.coordinates;
		}

		/**
		 * convertLeafletCoordsToMaptalksCoords() - Converts Leaflet coords to Maptalks coords.
		 * @param {Array<Array<Array<{ lat: number, lng: number }>>>|Array<Array<{ lat: number, lng: number }>>} arg0_coords
		 *
		 * @returns {Array<{ x: number, y: number, z: number }>}
		 */
		function convertLeafletCoordsToMaptalksCoords (arg0_coords) {
			//Convert from parameters
			var coords = arg0_coords;

			//Return statement
			return maptalks.GeoJSON.toGeometry(new L.Polygon(coords).toGeoJSON()).getCoordinates();
		}

		/**
		 * convertLeafletCoordsToTurfGeometry() - Converts Leaflet geometry to Turf geometry.
		 * @param {Object} arg0_geojson
		 * @returns {Array<Array<Array<number, number>>, String>} - [0] contains turf_coords; [1] represents either 'Polygon'/'MultiPolygon';
		 */
		function convertLeafletCoordsToTurfGeometry (arg0_geojson) {
			//Convert from parameters
			var geojson = arg0_geojson;

			//Declare local instance variables
			var temp_polygon = L.polygon(geojson).toGeoJSON();

			return [
				temp_polygon.geometry.coordinates,
				(temp_polygon.geometry.type == "Polygon") ? "polygon" : "multiPolygon"
			];
		}

		/**
		 * convertMaptalksGeometryToTurfGeometry() - Converts Maptalks geometry to Turf geometry.
		 * @param {Object} arg0_coords
		 *
		 * @returns {Array<Array<Array<number, number>>, String>} - [0] contains turf_coords; [1] represents either 'Polygon'/'MultiPolygon';
		 */
		function convertMaptalksGeometryToTurfGeometry (arg0_coords) {
			//Convert from parameters
			var coords = arg0_coords;

			//Declare local instance variables
			var geojson = coords.toGeoJSON();

			//Return statement
			return [
				geojson.geometry.coordinates,
				(geojson.geometry.type == "Polygon") ? "polygon" : "multiPolygon"
			];
		}

		/**
		 * convertNaissanceGeometryToMaptalksCoords() - Converts Naissance geometry to Maptalks coords.
		 * @param arg0_entity_id
		 *
		 * @returns {Array<Array<Array<number, number>>>|Array<Array<number, number>>}
		 */
		function convertNaissanceGeometryToMaptalksCoords (arg0_entity_id) {
			//Convert from parameters
			var entity_id = arg0_entity_id;

			//Declare local instance variables
			var entity_obj = getEntity(entity_id);

			//Return statement
			return flipCoordinates(convertMaptalksGeometryToTurfGeometry(entity_obj)[0]);
		}

		/**
		 * flipCoordinates() - Flips any _coords type from latlng to lnglat and vice versa. May be arbitrarily nested. Must be GeoJSON compatible.
		 * @param {*} arg0_coords
		 * 
		 * @returns {Array<Array<Array<number, number>>>|Array<Array<number, number>>}
		 */
		function flipCoordinates (arg0_coords)  {
			//Convert from parameters
			var coords = arg0_coords;

			//Return statement
			return coords.map((coordinate) => {
				// If the element is an array (nested array structure), recurse
				if (Array.isArray(coordinate[0])) {
					return flipCoordinates(coordinate); // Recurse into inner arrays
				} else {
					return [coordinate[1], coordinate[0]]; // Flip latitude and longitude
				}
			});
		}

		/**
		 * getLeafletGeoJSONCoords() - Fetches GeoJSON coords from a Leaflet GeoJSON object.
		 * @param {Object} arg0_geojson
		 *
		 * @returns {Array<Array<Array<number, number>>>|Array<Array<number, number>>}
		 */
		function getLeafletGeoJSONCoords (arg0_geojson) {
			//Convert from parameters
			var geojson = arg0_geojson;

			//Declare local instance variables
			var coords = [];

			//Check if layers exists
			if (geojson._layers) {
				var all_layers = Object.keys(geojson._layers);

				if (all_layers.length > 0)
					coords = geojson._layers[all_layers[0]]._latlngs;
			}

			//Return statement
			return coords;
		}

		/**
		 * isGeoJSONCoords() - Whether the coords type being tested are loosely GeoJSON compatible.
		 * @param {*} arg0_coords
		 *
		 * @returns {boolean}
		 */
		function isGeoJSONCoords (arg0_coords) {
			//Convert from parameters
			var coords = arg0_coords;

			//Internal guard clauses to ensure compatibility
			if (!Array.isArray(coords)) return;
			if (!Array.isArray(coords[0])) return;

			//Return statement
			return coords.every(isGeoJSONCoords);
		}

		/**
		 * isGeoJSONStrictCoords() - Whether the coords type being tested are strictly GeoJSON compatible.
		 * @param {*} arg0_coords
		 *
		 * @returns {boolean}
		 */
		function isGeoJSONStrictCoords (arg0_coords) {
			//Convert from parameters
			var coords_array = arg0_coords;

			//Recursively validate coordinates
			//Return statement
			if (Array.isArray(coords_array))
				return coords_array.every((coords) => {
					if (Array.isArray(coords[0])) {
						//If it's a nested array, recurse
						return isGeoJSONStrictCoords(coords);
					} else {
						//Otherwise, validate the coordinate pair
						return isValidCoordinate(coords);
					}
				});
		}

		/**
		 * isValidCoordinate() - Whether the coordinate pair is valid (GeoJSON compatible) and within latitudinal/longitudinal bounds.
		 * @param {*} arg0_coords
		 *
		 * @returns {boolean}
		 */
		function isValidCoordinate (arg0_coords) {
			//Convert from parameters
			var coords = arg0_coords;

			//Return statement; check if it's a valid array of [longitude, latitude]
			return Array.isArray(coords) && coords.length === 2 &&
				typeof coords[0] === "number" && typeof coords[1] === "number" &&
				coords[0] >= -180 && coords[0] <= 180 && //Valid longitude
				coords[1] >= -90 && coords[1] <= 90; //Valid latitude
		}
	}
}