//GEOSPATIALE I. Now deprecated.
//Coordinate conversion functions
{
	/*
		convertToGeoJSON() - Converts any format to GeoJSON.
		arg0_format: (Variable) - The coords format to input.

		Returns: (Object, GeoJSON)
	*/
	function convertToGeoJSON (arg0_format) {
		//Convert from parameters
		var format = arg0_format;

		//Declare local instance variables
		var format_type = getCoordsType(format);
		var geojson_coords;

		//Guard clauses if format_type is already GeoJSON
		if (format_type == "geojson") return format;

		if (format_type == "leaflet") {
			var leaflet_geojson = new L.Polygon(format).toGeoJSON();
			geojson_coords = leaflet_geojson.geometry;
		} else if (format_type == "leaflet_non_poly") {
			var leaflet_geojson = new L.Polygon(format._latlngs).toGeoJSON();
			geojson_coords = leaflet_geojson.geometry;
		} else if (format_type == "maptalks") {
			geojson_coords = format.toGeoJSON();
		} else if (format_type == "turf") {
			geojson_coords = {
				type: (format[1] == "polygon") ? "Polygon" : "MultiPolygon",
				coordinates: format[0]
			};
		} else if (format_type == "turf_object") {
			geojson_coords = format.geometry;
		}

		//Return statement
		return geojson_coords;
	}

	/*
		convertToLeaflet() - Converts any format to Leaflet.
		arg0_format: (Variable) - The coords format to input.

		Returns: (Array<Array<{ lat: (Number), lng: (Number) }>>)
	*/
	function convertToLeaflet (arg0_format) {
		//Convert from parameters
		var format = arg0_format;

		//Declare local instance variables
		var format_type = getCoordsType(format);
		var leaflet_coords;

		//Guard clauses if already of Leaflet type
		if (format_type == "leaflet")
			return JSON.parse(JSON.stringify(format));
		if (format_type == "leaflet_non_poly")
			return JSON.parse(JSON.stringify(format._latlngs));

		//If a valid format type, convert it to Leaflet somehow
		if (format_type)
			if (format_type == "geojson") {
				if (format._layers) {
					var all_layers = Object.keys(format._layers);

					if (all_layers.length > 0)
						leaflet_coords = format._layers[all_layers[0]]._latlngs;
				}
			} else if (format_type == "maptalks") {
				leaflet_coords = convertToLeaflet(convertToGeoJSON(format));
			} else if (format_type == "naissance") {
				var temp_polygon = L.polygon(format);

				leaflet_coords = temp_polygon._latlngs;
			} else if (format_type == "naissance_history") {
				var temp_polygon = L.polygon(format.coords)

				leaflet_coords = temp_polygon._latlngs;
			} else if (format_type == "turf") {
				var turf_obj = getTurfObject(format);

				var local_geojson = L.geoJSON(turf_obj);

				leaflet_coords = getGeoJSONCoords(local_geojson);
			} else if (format_type == "turf_object") {
				var local_geojson = L.geoJSON(format);

				leaflet_coords = getGeoJSONCoords(local_geojson);
			}

		//Return statement
		return leaflet_coords;
	}

	/*
		convertToMaptalks() - Converts any format to Maptalks.
		arg0_format: (Variable) - The coords format to input.

		Returns: (Array<Array<{ x: (Number), y: (Number), z: (Number) }>>)
	*/
	function convertToMaptalks (arg0_format) {
		//Convert from parameters
		var format = arg0_format;

		//Declare local instance variables
		var format_type = getCoordsType(format);

		//Guard clause if format_type is already Maptalks
		if (format_type == "maptalks") return format;

		if (format_type === "geojson") {
			var geojson_geometry = (format.geometry || format); //Support both Feature and Geometry
			maptalks_coords = maptalks.GeoJSON.toGeometry(geojson_geometry).getCoordinates();
		} else if (format_type === "leaflet") {
			maptalks_coords = convertLeafletCoordsToMaptalks(format);
		} else if (format_type === "leaflet_non_poly") {
			maptalks_coords = convertLeafletCoordsToMaptalks(format._latlngs);
		} else if (format_type === "naissance") {
			var geojson_coords = convertCoordsToGeoJSON(format);
			maptalks_coords = maptalks.GeoJSON.toGeometry({
				type: "Polygon",
				coordinates: geojson_coords,
			}).getCoordinates();
		} else if (format_type === "turf") {
			var geojson_obj = getTurfObject(format);
			maptalks_coords = maptalks.GeoJSON.toGeometry(geojson_obj.geometry).getCoordinates();
		} else if (format_type === "turf_object") {
			maptalks_coords = maptalks.GeoJSON.toGeometry(format.geometry).getCoordinates();
		} else if (format_type === "naissance_history") {
			var geojson_coords = convertCoordsToGeoJSON(format.coords);
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

	/*
		convertToNaissance() - Converts any format to Naissance.
		arg0_format: (Variable) - The coords format to input.

		Returns: (Array<Array<{ lat: (Number), lng: (Number) }>>)
	*/
	function convertToNaissance (arg0_format) {
		//Convert from parameters
		var format = arg0_format;

		//Declare local instance variables
		var leaflet_coords = format;

		//Iterate over leaflet_coords
		for (var i = 0; i < leaflet_coords.length; i++)
			if (Array.isArray(leaflet_coords[i])) {
				leaflet_coords[i] = convertToNaissance(leaflet_coords[i]);
			} else {
				leaflet_coords[i] = [leaflet_coords[i].lat, leaflet_coords[i].lng];
			}

		//Return statement
		return leaflet_coords;
	}

	/*
		convertToTurf() - Converts any format to Turf.
		arg0_format: (Variable) - The coords format to input.

		Returns: (Array<Array<Number, Number>>)
	*/
	function convertToTurf (arg0_format) {
		//Convert from parameters
		var format = arg0_format;

		//Declare local instance variables
		var format_type = getCoordsType(format);
		var turf_coords;

		//Guard clauses if already Turf type
		if (format_type == "turf")
			return format;

		//If a valid format type, convert it to Turf somehow
		if (format_type)
			if (format_type == "geojson") {
				var geojson_coords = getGeoJSONCoords(format);

				turf_coords = convertLeafletCoordsToTurf(geojson_coords);
			} else if (["leaflet", "naissance"].includes(format_type)) {
				turf_coords = convertLeafletCoordsToTurf(format);
			} else if (format_type == "leaflet_non_poly") {
				turf_coords = convertLeafletCoordsToTurf(format._latlngs);
			} else if (format_type == "maptalks") {
				turf_coords = convertMaptalksCoordsToTurf(format);
			} else if (format_type == "naissance_history") {
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

				turf_coords = convertLeafletCoordsToTurf(format.coords);
			} else if (format_type == "turf_object") {
				turf_coords = convertLeafletCoordsToTurf(format);
			}

		//Return statement
		return turf_coords;
	}

	/*
		getCoordsType() - Returns the coords format the variable represents.
		arg0_format: (Variable) - The coords format to input.

		Returns: (String) - Either 'geojson', 'leaflet', 'leaflet_non_poly', 'maptalks', 'naissance', 'naissance_history', 'turf', or 'turf_object'
	*/
	function getCoordsType (arg0_format) {
		//Convert from parameters
		var format = arg0_format;

		//Guard clause if format does not exist
		if (!format)
			return undefined;

		//Check if type is GeoJSON
		if (format._initHooksCalled && !format._latlngs && !format._symbolUpdated && !format._geometries)
			return "geojson";

		//Check if type is Leaflet
		if (format._latlngs)
			return "leaflet_non_poly";
		if (Array.isArray(format)) {
			var flattened_array = format.flat(Infinity);

			if (typeof flattened_array[0] == "object") {
				try {
					if (flattened_array[0].lat && flattened_array[1].lng)
						return "leaflet";
				} catch {}
			}
		}

		//Check if type is maptalks
		if (format._symbolUpdated || format._geometries)
			return "maptalks";

		//Check if type is naissance_history
		if (typeof format == "object")
			if (format.id && format.coords)
				return "naissance_history";

		//Check if type is turf
		if (Array.isArray(format))
			if (format.length == 2)
				if (Array.isArray(format[0]) && typeof format[1] == "string")
					if (["polygon", "multiPolygon"].includes(format[1]))
						return "turf";

		//Check if type is turf_object
		if (typeof format == "object")
			if (format.type == "Feature" && format.geometry)
				return "turf_object";

		//If none of the above and is array, return Naissance
		if (format)
			if (Array.isArray(format))
				return "naissance";
	}
}

//Internals functions - Should not actually be used by end dev
{
	function convertEntityCoordsToMaptalks (arg0_entity_id) {
		//Convert from parameters
		var entity_id = arg0_entity_id;

		//Declare local instance variables
		var entity_obj = getEntity(entity_id);

		//Return statement
		return flipCoordinates(convertMaptalksCoordsToTurf(entity_obj)[0]);
	}

	function convertLeafletCoordsToMaptalks (arg0_coords) {
		//Convert from parameters
		var coords = arg0_coords;

		//Return statement
		return maptalks.GeoJSON.toGeometry(new L.Polygon(coords).toGeoJSON()).getCoordinates();
	}

	function convertLeafletCoordsToTurf (arg0_geojson) {
		//Convert from parameters
		var geojson = arg0_geojson;

		//Declare local instance variables
		var temp_polygon = L.polygon(geojson).toGeoJSON();

		return [
			temp_polygon.geometry.coordinates,
			(temp_polygon.geometry.type == "Polygon") ? "polygon" : "multiPolygon"
		];
	}

	function convertMaptalksCoordsToTurf (arg0_coords) {
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

	function convertCoordsToGeoJSON (arg0_coords) {
		//Convert from parameters
		var coords = arg0_coords;

		//Declare local instance variables
		var leaflet_polygon = new L.Polygon(coords).toGeoJSON();

		//Return statement
		return leaflet_polygon.geometry.coordinates;
	}

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

	function getGeoJSONCoords (arg0_geojson) {
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

	function isValidCoordinate (arg0_coords) {
		//Convert from parameters
		var coords = arg0_coords;

		//Check if it's a valid array of [longitude, latitude]
		//Return statement
		return Array.isArray(coords) && coords.length === 2 &&
			typeof coords[0] === "number" && typeof coords[1] === "number" &&
			coords[0] >= -180 && coords[0] <= 180 && //Valid longitude
			coords[1] >= -90 && coords[1] <= 90;    //Valid latitude
	}

	function validateCoordinates (arg0_coords) {
		//Convert from parameters
		var coords_array = arg0_coords;

		//Recursively validate coordinates
		//Return statement
		if (Array.isArray(coords_array))
			return coords_array.every((coords) => {
				if (Array.isArray(coords[0])) {
					//If it's a nested array, recurse
					return validateCoordinates(coords);
				} else {
					//Otherwise, validate the coordinate pair
					return isValidCoordinate(coords);
				}
			});
	}
}
