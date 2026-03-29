//Initialise functions
{
	if (!global.GeoASC)
		/**
		 * Handles ASC files. Part of Geospatiale III.
		 * 
		 * @namespace GeoASC
		 */
		global.GeoASC = {};
	
	/**
	 * Converts an .asc file to .png.
	 * @alias GeoASC.convertToPNG
	 * 
	 * @param {string} arg0_input_file_path
	 * @param {string} arg1_output_file_path
	 * @param {Object} [arg2_options]
	 *  @param {string} [arg2_options.mode="number"] - Either 'number'/'percentage'.
	 *  @param {boolean} [arg2_options.ceil=true] - Whether to ceiling ASC integers.
	 *  @param {function(local_index, local_value)} [arg2_options.special_function] - Any function to pass to the iterative loop when processing. Must return a {@link number}.
	 *  
	 * @returns {{dataframe: Object, max_value: number}}
	 */
	GeoASC.convertToPNG = async function (arg0_input_file_path, arg1_output_file_path, arg2_options) {
		//Convert from parameters
		let input_file_path = arg0_input_file_path;
		let output_file_path = arg1_output_file_path;
		let options = (arg2_options) ? arg2_options : {};
		
		//Initialise options
		if (!options.mode) options.mode = "number";
		if (options.ceil === undefined) options.ceil = true;
		
		//Declare local instance variables
		let asc_dataframe = GeoASC.readFile(input_file_path);
		let image_columns = asc_dataframe[0].length;
		let image_rows = asc_dataframe.length;
		let max_value = Array.getMaximum(asc_dataframe);
		
		//Log image_columns; image_rows
		console.log(`Converting .asc file ${input_file_path} to ${output_file_path} with dimensions ${image_columns}x${image_rows}. Maximum value in dataframe: ${max_value}`);
		
		let png = new pngjs.PNG({
			height: image_rows,
			width: image_columns,
			filterType: -1
		});
		
		//Iterate over all rows and columns
		for (let i = 0; i < image_rows; i++)
			for (let x = 0; x < image_columns; x++) {
				let local_index = (i*image_columns + x)*4; //RGBA index
				let local_value = asc_dataframe[i][x];
				let rgba;
				
				if (options.special_function)
					local_value = options.special_function(local_index, local_value);
				
				if (local_value !== undefined && local_value !== -9999) {
					if (options.mode === "number") {
						//Encode full 32-bit integer value into RGBA
						if (options.ceil)
							local_value = Math.ceil(local_value);
						rgba = Colour.encodeNumberAsRGBA(local_value);
					} else if (options.mode === "percentage") {
						//Scale using percentage mode (0-100 mapped to G channel)
						let local_g = Math.min(Math.round((local_value/max_value)*255), 255);
						rgba = [0, local_g, 0, 255];
					}
				} else {
					//NODATA values are fully transparent
					rgba = [0, 0, 0, 0];
				}
				
				//Set pixel values
				png.data[local_index] = rgba[0];
				png.data[local_index + 1] = rgba[1];
				png.data[local_index + 2] = rgba[2];
				png.data[local_index + 3] = rgba[3];
			}
		
		//Write PNG file
		png.pack().pipe(fs.createWriteStream(output_file_path))
			.on("finish", () => console.log(`.PNG output file written to ${output_file_path}`));
		
		//Return statement
		return {
			dataframe: asc_dataframe,
			max_value: max_value
		};
	};
	
	/**
	 * Reads an ASC file into a 2D Array/dataframe.
	 * @alias GeoASC.readFile
	 * 
	 * @param {string} arg0_file_path
	 * 
	 * @returns {Array.<any[]>}
	 */
	GeoASC.readFile = function (arg0_file_path) {
		//Convert from parameters
		let file_path = arg0_file_path;
		
		//Declare local instance variables
		let checks_passed = 0;
		let data_columns = 0;
		let data_frame = [];
		let data_rows = 0;
		let is_header = true;
		let no_data_value = undefined;
		let raw_data = fs.readFileSync(file_path, "utf8").split("\n");
		let row_index = 0;
		
		//Iterate over all raw_data lines
		for (let i = 0; i < raw_data.length; i++) {
			let local_line = raw_data[i].trim();
			
			//Internal guard clause; skip empty lines
			if (local_line === "") continue;
			
			//Header parsing
			if (is_header) {
				if (checks_passed < 3) {
					let split_line = local_line.split(" ");
					
					if (local_line.startsWith("ncols")) {
						data_columns = parseInt(split_line[1]);
						checks_passed++;
					} else if (local_line.startsWith("nrows")) {
						data_rows = parseInt(split_line[1]);
						checks_passed++;
					} else if (local_line.startsWith("NODATA_value")) {
						no_data_value = split_line[1];
						checks_passed++;
					}
				} else {
					//End of header; initialise data_frame
					is_header = false;
					data_frame = new Array(data_rows);
					
					for (let x = 0; x < data_rows; x++)
						data_frame[x] = new Array(data_columns);
				}
				continue;
			}
			
			//Data parsing
			let local_values = local_line.split(/\s+/);
			
			for (let x = 0; x < data_columns; x++)
				data_frame[row_index][x] = (local_values[x] === no_data_value) ?
					undefined : parseFloat(local_values[x]);
			
			row_index++;
			if (row_index >= data_rows) break; //Stop processing once all rows are read
		}
		
		//Return statement
		return data_frame;
	};
}