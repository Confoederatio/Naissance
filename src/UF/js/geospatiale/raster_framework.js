//Initialise functions
{
	/**
	 * geoJSONFillPolygon() - Fills a GeoJSON Polygon on a given RGBA buffer. [WIP] - This is an AI-generated function that works; it needs refactoring in the future.
	 * @param {Buffer<ArrayBuffer>} arg0_rgba_buffer
	 * @param {Object} arg1_polygon
	 * @param {Object} [arg2_options]
	 *  @param {number} [arg2_options.height=2160] - The height of the underlying RGBA buffer.
	 *  @param {number} [arg2_options.width=4320] - The width of the underlying RGBA buffer.
	 *
	 * @returns {Buffer<ArrayBuffer>}
	 */
	function geoJSONFillPolygon (arg0_rgba_buffer, arg1_polygon, arg2_options) {
		// Convert from parameters
		var rgba_buffer = arg0_rgba_buffer;
		var polygon = arg1_polygon;
		var options = arg2_options || {};

		// Initialize options
		if (!options.colour) options.colour = generateRandomColour();
		options.height = returnSafeNumber(options.height, 2160); // 5-arcminute resolution default
		options.width = returnSafeNumber(options.width, 4320); // 5-arcminute resolution default

		if (!rgba_buffer) rgba_buffer = Buffer.alloc(options.width * options.height * 4, 0); // Initialize all transparent

		// Function to fill a horizontal line
		function fillHorizontalLine(y, x_start, x_end, colour) {
			for (let x = x_start; x <= x_end; x++) {
				const local_index = (y * options.width + x) * 4;
				rgba_buffer[local_index] = colour[0]; // R
				rgba_buffer[local_index + 1] = colour[1]; // G
				rgba_buffer[local_index + 2] = colour[2]; // B
				rgba_buffer[local_index + 3] = colour[3]; // A
			}
		}

		// Function to find intersections of a scanline with polygon edges
		function findIntersections(y, ring) {
			const intersections = [];
			for (let i = 0; i < ring.length - 1; i++) {
				const [lon1, lat1] = ring[i];
				const [lon2, lat2] = ring[i + 1];

				const { x_coord: x1, y_coord: y1 } = getEquirectangularCoordsPixel(lat1, lon1, { return_object: true });
				const { x_coord: x2, y_coord: y2 } = getEquirectangularCoordsPixel(lat2, lon2, { return_object: true });

				// Check if the scanline intersects the edge
				if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) {
					const x_intersection = Math.round(x1 + ((y - y1) * (x2 - x1)) / (y2 - y1));
					intersections.push(x_intersection);
				}
			}
			return intersections.sort((a, b) => a - b); // Sort intersections by x-coordinate
		}

		// Loop through polygon rings
		polygon.forEach((ring) => {
			for (let y = 0; y < options.height; y++) {
				const intersections = findIntersections(y, ring);

				// Fill pixels between pairs of intersections
				for (let i = 0; i < intersections.length; i += 2) {
					if (i + 1 < intersections.length) {
						fillHorizontalLine(y, intersections[i], intersections[i + 1], options.colour);
					}
				}
			}
		});

		// Return statement
		return rgba_buffer;
	};

	/**
	 * getEquirectangularCoordsPixel - Fetches the x, y coordinate pair for a given pixel given latitude and longitude coordinates for WGS84 Equirectangular.
	 * @param {number} arg0_latitude
	 * @param {number} arg1_longitude
	 * @param {Object} [arg2_options]
	 *  @param {boolean} [arg2_options.return_object=false] - Whether to return a structured object instead.
	 *
	 * @returns {Array<number, number>|{x_coord: number, y_coord: number}}
	 */
	function getEquirectangularCoordsPixel (arg0_latitude, arg1_longitude, arg2_options) {
		//Convert from parameters
		var latitude = returnSafeNumber(arg0_latitude);
		var longitude = returnSafeNumber(arg1_longitude);
		var options = (arg2_options) ? arg2_options : {};

		//Initialise options
		options.height = returnSafeNumber(options.height, 2160); //5-arcminute resolution default
		options.width = returnSafeNumber(options.width, 4320); //5-arcminute resolution default

		//Declare local instance variables
		var bbox = [-180, -90, 180, 90]; //Full Earth latlng
		var x_coord = Math.floor(((longitude - bbox[0])/(bbox[2] - bbox[0]))*options.width);
		var y_coord = Math.floor(((latitude - bbox[1])/(bbox[3] - bbox[1]))*options.height);

		//Return statement
		return (!options.return_object) ?
			[x_coord, y_coord] : { x_coord, y_coord };
	};

	/**
	 * Writes a GHSL (Global Human Settlement Layer) GeoJSON file to raster.
	 * @param {String} arg0_input_file_path
	 * @param {String} arg1_output_file_path
	 * @param {Object} [arg2_options]
	 *  @param {number} [arg2_options.height=2160]
	 *  @param {number} [arg2_options.width=4320]
	 *
	 *  @param {String} [arg2_options.property="ID_UC_G0"] - The GHSL property to target when determining colour IDs. Corresponds to urban area IDs by default.
	 */
	async function GHSLGeoJSONToRaster (arg0_input_file_path, arg1_output_file_path, arg2_options) {
		//Convert from parameters
		var input_file_path = arg0_input_file_path;
		var output_file_path = arg1_output_file_path;
		var options = (arg2_options) ? arg2_options : {};

		//Initialise options
		options.height = returnSafeNumber(options.height, 2160); //5-arcminute resolution default
		options.width = returnSafeNumber(options.width, 4320); //5-arcminute resolution default

		//Declare local instance variables
		var geojson = JSON.parse(fs.readFileSync(input_file_path, "utf8"));
		var rgba_buffer = Buffer.alloc(options.width*options.height*4, 0);

		//Process each feature in the GeoJSON
		geojson.features.forEach((feature, index) => {
			try {
				var local_geometry = feature.geometry;

				if (local_geometry.type == "Polygon" || local_geometry.type == "MultiPolygon") {
					var local_colour = encodeNumberAsRGBA(feature.properties.ID_UC_G0);

					if (local_geometry.type == "Polygon") {
						rgba_buffer = geoJSONFillPolygon(rgba_buffer, local_geometry.coordinates, {
							colour: local_colour
						});
					} else if (local_geometry.type == "MultiPolygon") {
						local_geometry.coordinates.forEach((polygon) => {
							rgba_buffer = geoJSONFillPolygon(rgba_buffer, polygon, {
								colour: local_colour
							});
						});
					}
				}
			} catch (e) {
				console.error(e);
			}
		});

		//Flip the buffer vertically
		var flipped_buffer = Buffer.alloc(rgba_buffer.length);
		var row_size = options.width*4;

		for (var i = 0; i < options.height; i++) {
			var source_start = i*row_size;
			var target_start = (options.height - i - 1)*row_size;

			rgba_buffer.copy(flipped_buffer, target_start, source_start, source_start + row_size);
		}

		//Save flipped_buffer to raster
		var png = new pngjs.PNG({
			height: options.height,
			width: options.width,
			filterType: -1
		});

		flipped_buffer.copy(png.data);
		fs.writeFileSync(output_file_path, pngjs.PNG.sync.write(png));
	};
}