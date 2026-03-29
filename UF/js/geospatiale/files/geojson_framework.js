//Initialise functions
{
	if (!global.GeoJSON)
		/**
		 * Handles GeoJSON files. Part of Geospatiale III.
		 *
		 * @namespace GeoJSON
		 */
		global.GeoJSON = {};
	
	//[QUARANTINE]
	/**
	 * Fills a GeoJSON Polygon on a given RGBA buffer.
	 * @param {Buffer<ArrayBuffer>} arg0_rgba_buffer
	 * @param {Object} arg1_polygon
	 * @param {Object} [arg2_options]
	 *  @param {number} [arg2_options.height=2160] - The height of the underlying RGBA buffer.
	 *  @param {number} [arg2_options.width=4320] - The width of the underlying RGBA buffer.
	 *
	 * @returns {Buffer<ArrayBuffer>}
	 */
	GeoJSON.fillPolygon = function (arg0_rgba_buffer, arg1_polygon, arg2_options) {
		//Convert from parameters
		let rgba_buffer = arg0_rgba_buffer;
		let polygon = arg1_polygon;
		let options = arg2_options || {};
		
		if (!options.colour) options.colour = Colour.generateRandomColour();
		options.height = Math.returnSafeNumber(options.height, 2160);
		options.width = Math.returnSafeNumber(options.width, 4320);
		
		if (!rgba_buffer) rgba_buffer = Buffer.alloc(options.width * options.height * 4, 0);
		
		let pixelWritten = false;
		
		function fillHorizontalLine(y, x_start, x_end, colour) {
			for (let x = x_start; x <= x_end; x++) {
				if (
					x >= 0 &&
					x < options.width &&
					y >= 0 &&
					y < options.height
				) {
					const local_index = (y * options.width + x) * 4;
					rgba_buffer[local_index] = colour[0];
					rgba_buffer[local_index + 1] = colour[1];
					rgba_buffer[local_index + 2] = colour[2];
					rgba_buffer[local_index + 3] = colour[3];
					pixelWritten = true;
				}
			}
		}
		
		function findIntersections(y, ring) {
			const intersections = [];
			for (let i = 0; i < ring.length - 1; i++) {
				const [lon1, lat1] = ring[i];
				const [lon2, lat2] = ring[i + 1];
				
				const { x_coord: x1, y_coord: y1 } = Geospatiale.getEquirectangularCoordsPixel(lat1, lon1, { return_object: true, width: options.width, height: options.height });
				const { x_coord: x2, y_coord: y2 } = Geospatiale.getEquirectangularCoordsPixel(lat2, lon2, { return_object: true, width: options.width, height: options.height });
				
				if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) {
					const x_intersection = Math.round(x1 + ((y - y1) * (x2 - x1)) / (y2 - y1));
					intersections.push(x_intersection);
				}
			}
			return intersections.sort((a, b) => a - b);
		}
		
		polygon.forEach((ring) => {
			for (let y = 0; y < options.height; y++) {
				const intersections = findIntersections(y, ring);
				for (let i = 0; i < intersections.length; i += 2) {
					if (i + 1 < intersections.length) {
						fillHorizontalLine(y, intersections[i], intersections[i + 1], options.colour);
					}
				}
			}
		});
		
		return pixelWritten;
	};
	
	/**
	 * Fetches the x, y coordinate pair for a given pixel given latitude and longitude coordinates for WGS84 Equirectangular.
	 * @alias GeoJSON.getCentroid
	 * 
	 * @param {Object} arg0_geometry
	 *
	 * @returns {number[]}
	 */
	GeoJSON.getCentroid = function (arg0_geometry) {
		let geometry = arg0_geometry;
		
		// Only supports Polygon and MultiPolygon
		function polygonCentroid(coords) {
			// Only use the exterior ring
			const ring = coords[0];
			let area = 0, x = 0, y = 0;
			for (let i = 0, len = ring.length - 1; i < len; i++) {
				const [x0, y0] = ring[i];
				const [x1, y1] = ring[i + 1];
				const a = x0 * y1 - x1 * y0;
				area += a;
				x += (x0 + x1) * a;
				y += (y0 + y1) * a;
			}
			area *= 0.5;
			if (area === 0) {
				// Degenerate, just return first point
				return ring[0];
			}
			x /= (6 * area);
			y /= (6 * area);
			return [x, y];
		}
		
		if (geometry.type === "Polygon") {
			return polygonCentroid(geometry.coordinates);
		} else if (geometry.type === "MultiPolygon") {
			// Average centroids of all polygons
			const centroids = geometry.coordinates.map(polygonCentroid);
			const n = centroids.length;
			const sum = centroids.reduce((acc, c) => [acc[0] + c[0], acc[1] + c[1]], [0, 0]);
			return [sum[0] / n, sum[1] / n];
		}
		throw new Error("Unsupported geometry type for centroid");
	};
	
	/**
	 * Writes a GeoJSON file to raster.
	 * @alias GeoJSON.toRaster
	 * 
	 * @param {string} arg0_input_file_path - `.geojson` input file to specify.
	 * @param {string} arg1_output_file_path - `.png` output file path.
	 * @param {Object} [arg2_options]
	 *  @param {string} [arg2_options.property_key="ID_UC_G0"] - The `.feature.properties` key to encode as the colour of each GeoJSON Polygon.
	 *  
	 *  @param {number} [arg2_options.height=2160]
	 *  @param {number} [arg2_options.width=4320]
	 */
	GeoJSON.toRaster = async function (
		arg0_input_file_path,
		arg1_output_file_path,
		arg2_options
	) {
		let input_file_path = arg0_input_file_path;
		let output_file_path = arg1_output_file_path;
		let options = arg2_options ? arg2_options : {};
		
		options.height = Math.returnSafeNumber(options.height, 2160);
		options.width = Math.returnSafeNumber(options.width, 4320);
		
		let geojson = JSON.parse(fs.readFileSync(input_file_path, "utf8"));
		let property_key = (options.property_key) ? 
			options.property_key : "ID_UC_G0";
		let rgba_buffer = Buffer.alloc(options.width * options.height * 4, 0);
		
		geojson.features.forEach((feature, index) => {
			try {
				let local_geometry = feature.geometry;
				let local_colour = Colour.encodeNumberAsRGBA(feature.properties[property_key]);
				
				if (local_geometry.type === "Polygon") {
					let pixelWritten = GeoJSON.fillPolygon(rgba_buffer, local_geometry.coordinates, {
						colour: local_colour,
						height: options.height,
						width: options.width,
					});
					if (!pixelWritten) {
						//Write centroid pixel
						let [lon, lat] = GeoJSON.getCentroid(local_geometry);
						let { x_coord, y_coord } = GeoPNG.getEquirectangularCoordsPixel(
							lat,
							lon,
							{
								width: options.width,
								height: options.height,
								return_object: true,
							}
						);
						if (
							x_coord >= 0 &&
							x_coord < options.width &&
							y_coord >= 0 &&
							y_coord < options.height
						) {
							let idx = (y_coord * options.width + x_coord) * 4;
							for (let j = 0; j < 4; j++) {
								rgba_buffer[idx + j] = local_colour[j];
							}
						}
					}
				} else if (local_geometry.type === "MultiPolygon") {
					local_geometry.coordinates.forEach((polygon) => {
						let pixelWritten = GeoJSON.fillPolygon(rgba_buffer, polygon, {
							colour: local_colour,
							height: options.height,
							width: options.width,
						});
						if (!pixelWritten) {
							let [lon, lat] = GeoJSON.getCentroid({
								type: "Polygon",
								coordinates: polygon,
							});
							let { x_coord, y_coord } = GeoPNG.getEquirectangularCoordsPixel(
								lat,
								lon,
								{
									width: options.width,
									height: options.height,
									return_object: true,
								}
							);
							if (
								x_coord >= 0 &&
								x_coord < options.width &&
								y_coord >= 0 &&
								y_coord < options.height
							) {
								let idx = (y_coord * options.width + x_coord) * 4;
								for (let j = 0; j < 4; j++) {
									rgba_buffer[idx + j] = local_colour[j];
								}
							}
						}
					});
				}
			} catch (e) {
				console.error(e);
			}
		});
		
		let flipped_buffer = Buffer.alloc(rgba_buffer.length);
		let row_size = options.width * 4;
		
		for (let i = 0; i < options.height; i++) {
			let source_start = i * row_size;
			let target_start = (options.height - i - 1) * row_size;
			rgba_buffer.copy(flipped_buffer, target_start, source_start, source_start + row_size);
		}
		
		let png = new pngjs.PNG({
			height: options.height,
			width: options.width,
			filterType: -1,
		});
		
		flipped_buffer.copy(png.data);
		fs.writeFileSync(output_file_path, pngjs.PNG.sync.write(png));
	};
}