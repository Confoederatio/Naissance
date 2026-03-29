//Initialise functions
{
	if (!global.GeoTIFF)
		/**
		 * Handles TIFF files. Part of Geospatiale III.
		 * 
		 * @namespace GeoTIFF
		 */
		global.GeoTIFF = {};
	
	/**
	 * Attempts to convert a given GeoTIFF file to PNG, assuming that it is single-band
	 * @param {String} arg0_input_file_path
	 * @param {String} arg1_output_file_path
	 *
	 * @returns {Object}
	 */
	GeoTIFF.convertToPNG = async function (arg0_input_file_path, arg1_output_file_path) {
		//Convert from parameters
		let input_file_path = arg0_input_file_path;
		let output_file_path = arg1_output_file_path;
		
		//Declare local instance variables
		let tiff = await geotiff.fromFile(input_file_path);
		
		let image = await tiff.getImage();
		let image_height = image.getHeight();
		let image_width = image.getWidth();
		let raster = await image.readRasters();
		let png = new pngjs.PNG({
			height: image_height,
			width: image_width,
			
			colorType: 6, //RGBA
			inputColorType: 6, //RGBA
			bitDepth: 8 //8 bits per channel
		});
		
		let original_data = raster[0]; //Assuming single-band data
		
		//Iterate over all pixels and encode it as RGBA
		for (let i = 0; i < image_height; i++)
			for (let x = 0; x < image_width; x++) {
				let local_index = i*image_width + x;
				let local_value = original_data[local_index];
				
				//Encode the value as RGBA
				let local_rgba = Colour.encodeNumberAsRGBA(local_value);
				
				//Write RGBA values into the PNG data
				let local_png_index = local_index*4;
				
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
	 * Unpacks a multi-band GeoTIFF file to multiple PNG files, one for each year/band.
	 * @alias GeoTIFF.convertToPNGs
	 * 
	 * @param {String} arg0_input_file_path
	 * @param {String} arg1_output_base_path - The prefix for the output (e.g., 'map_data_').
	 * @param {Object} [arg2_options]
	 *  @param {number} [arg2_options.scalar=1] - The scalar to multiply or divide by.
	 *  @param {string[]} [arg2_options.years] - The list of years to use for output file names.
	 *
	 * @returns {Array<Object>}
	 */
	GeoTIFF.convertToPNGs = async function (arg0_input_file_path, arg1_output_base_path, arg2_options) { //[WIP] - Refactor at a later date
		//Convert from parameters
		let input_file_path = arg0_input_file_path;
		let output_base_path = arg1_output_base_path;
		let options = arg2_options;
		
		//Initialise options
		options.scalar = Math.returnSafeNumber(options.scalar, 1);
		
		//Declare local instance variables
		let tiff = await geotiff.fromFile(input_file_path);
		let image = await tiff.getImage();
		let image_height = image.getHeight();
		let image_width = image.getWidth();
		let raster = await image.readRasters(); //Contains an array of bands
		
		let output_pngs = [];
		
		//Iterate over every band in the GeoTIFF (each band represents a year)
		for (let i = 0; i < raster.length; i++) {
			let current_year = (options.years?.[i]) ? options.years[i] : i;
			let current_output_path = `${output_base_path}_${current_year}.png`;
			let original_data = raster[i];
			
			let png = new pngjs.PNG({
				height: image_height,
				width: image_width,
				
				colorType: 6, //RGBA
				inputColorType: 6, //RGBA
				bitDepth: 8, //8 bits per channel
			});
			
			//Iterate over all pixels and encode it as RGBA
			for (let x = 0; x < image_height; x++)
				for (let y = 0; y < image_width; y++) {
					let local_index = x*image_width + y;
					let local_value = original_data[local_index];
					
					//Multiply local_value by scalar
					local_value *= options.scalar;
					
					//Encode the value as RGBA using the provided helper
					let local_rgba = Colour.encodeNumberAsRGBA(local_value);
					
					//Write RGBA values into the PNG data
					let local_png_index = local_index*4;
					
					png.data[local_png_index] = local_rgba[0];
					png.data[local_png_index + 1] = local_rgba[1];
					png.data[local_png_index + 2] = local_rgba[2];
					png.data[local_png_index + 3] = local_rgba[3];
				}
			
			//Write the PNG file for this specific year
			png.pack()
				.pipe(fs.createWriteStream(current_output_path))
				.on("finish", () =>
					console.log(`.PNG output for band ${current_year} written to ${current_output_path}`));
			
			//Push PNG to output array
			output_pngs.push(png);
		}
		
		//Return statement
		return output_pngs;
	};
}