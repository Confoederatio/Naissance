//Initialise functions
{
	/**
	 * Attempts to convert a given GeoTIFF file to PNG, assuming that it is single-band
	 * @param {String} arg0_input_file_path
	 * @param {String} arg1_output_file_path
	 *
	 * @returns {Object}
	 */
	async function convertGeoTIFFToPNG (arg0_input_file_path, arg1_output_file_path) {
		//Convert from parameters
		var input_file_path = arg0_input_file_path;
		var output_file_path = arg1_output_file_path;

		//Declare local instance variables
		var tiff = await GeoTIFF.fromFile(input_file_path);

		var image = await tiff.getImage();
		var image_height = image.getHeight();
		var image_width = image.getWidth();
		var raster = await image.readRasters();
		var png = new pngjs.PNG({
			height: image_height,
			width: image_width,

			colorType: 6, //RGBA
			inputColorType: 6, //RGBA
			bitDepth: 8 //8 bits per channel
		});

		var original_data = raster[0]; //Assuming single-band data

		//Iterate over all pixels and encode it as RGBA
		for (var i = 0; i < image_height; i++)
			for (var x = 0; x < image_width; x++) {
				var local_index = i*image_width + x;
				var local_value = original_data[local_index];

				//Encode the value as RGBA
				var local_rgba = encodeNumberAsRGBA(local_value);

				//Write RGBA values into the PNG data
				var local_png_index = local_index*4;

				png.data[local_png_index] = local_rgba[0];
				png.data[local_png_index + 1] = local_rgba[1];
				png.data[local_png_index + 2] = local_rgba[2];
				png.data[local_png_index + 3] = local_rgba[3];
			}

		//Write the PNG file
		png.pack().pipe(fs.createWriteStream(output_file_path))
			.on("finish", () => console.log(`.PNG output file written to ${output_file_path}`));

		//Return statement
		return png;
	};

	/**
	 * downscaleGeoTIFF() - Downscales a GeoTIFF file to a given options.height, options.width resolution.
	 * @param {String} arg0_input_file_path - The input file path.
	 * @param {String} arg1_output_file_path - The output file path.
	 * @param {Object} [arg2_options]
	 *  @param {number} [arg2_options.height=2160]
	 *  @param {number} [arg2_options.width=4320]
	 */
	async function downscaleGeoTIFF (arg0_input_file_path, arg1_output_file_path, arg2_options)	{
		//Convert from parameters
		var input_file_path = arg0_input_file_path;
		var output_file_path = arg1_output_file_path;
		var options = (arg2_options) ? arg2_options : {};

		//Initialise options
		options.height = returnSafeNumber(options.height, 2160);
		options.width = returnSafeNumber(options.width, 4320);

		//Declare local instance variables
		var tiff = await GeoTIFF.fromFile(input_file_path);

		var image = await tiff.getImage();
		var image_height = image.getHeight();
		var image_width = image.getWidth();
		var origin_x = image.getOrigin()[0]; //Upper-left corner longitude
		var origin_y = image.getOrigin()[1]; //Upper-left corner latitude
		var resolution_x = image.getResolution()[0]; //Original resolution (degrees per pixel)
		var resolution_y = image.getResolution()[1];

		//Calculate the scale factor for aggregation
		var extent_x = resolution_x*image_width;
		var extent_y = resolution_y*image_height;
		var target_resolution_x = extent_x/options.width;
		var target_resolution_y = extent_y/options.height;

		var scale_factor_x = resolution_x/target_resolution_x;
		var scale_factor_y = resolution_y/target_resolution_y;

		//Calculate the dimensions for the downscaled raster
		var new_height = Math.floor(image_height/scale_factor_y);
		var new_width = Math.floor(image_width/scale_factor_x);

		//Initialise the downscaled raster
		var downscaled_raster = new Array(new_height).fill(null)
			.map(() => new Array(new_width).fill(0));
		var raster = await image.readRasters({ interleave: true });

		var original_data = raster[0]; //Assuming single-band data

		///Iterate over height; width, read values into downscaled raster
		for (var i = 0; i < new_height; i++)
			for (var x = 0; x < new_width; x++) {
				var local_sum = 0;

				//Aggregate values from the corresponding block in the original raster
				for (var y = 0; y < scale_factor_y; y++)
					for (var z = 0; z < scale_factor_x; z++) {
						var original_x = x*scale_factor_x + z;
						var original_y = i*scale_factor_y + y;

						if (original_x < image_width && original_y < image_height) {
							var local_index = original_y*image_width + original_x;

							local_sum += original_data[local_index];
						}
					}

				downscaled_raster[i][x] = local_sum;
			}

		//Write the downscaled raster to a new GeoTIFF
		var new_geotiff = GeoTIFF.write({
			fileDirectory: {
				ImageLength: new_height,
				ImageWidth: new_width,
				BitsPerSample: 32,
				SampleFormat: 3,
				Compression: 1,
				PhotometricInterpretation: 1,
				PlanarConfiguration: 1,
				SamplesPerPixel: 1,
				ModelPixelScale: [target_resolution_x, target_resolution_y, 0],
				ModelTiepoint: [0, 0, 0, origin_x, origin_y, 0],
				GeoKeyDirectoryTag: {
					GTModelTypeGeoKey: 1,
					GTRasterTypeGeoKey: 1,
					GeographicTypeGeoKey: 4326
				}
			},
			data: downscaled_raster.flat()
		});

		fs.writeFileSync(output_file_path, Buffer.from(new_geotiff));
		console.log(`Downscaled GeoTIFF saved to ${output_file_path}.`);
	};
}