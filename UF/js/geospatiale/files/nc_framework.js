//Initialise functions
{
	if (!global.GeoNC)
		/**
		 * Handles NC files. Part of Geospatiale III.
		 * 
		 * @namespace GeoNC
		 */
		global.GeoNC = {};
	
	/**
	 * Requires netcdfjs. Converts an .nc file to a .asc file, depending on its options.time_index and options.variable_key.
	 * @alias GeoNC.convertToASC
	 * 
	 * @param {String} arg0_input_file_path
	 * @param {String} arg1_output_file_path
	 * @param {Object} [arg2_options]
	 *  @param {String} [arg2_options.latitude_key="latitude"]
	 *  @param {String} [arg2_options.longitude_key="longitude"]
	 *  @param {String} [arg2_options.time_index=0]
	 *  @param {String} [arg2_options.variable_key]
	 */
	GeoNC.convertToASC = async function (arg0_input_file_path, arg1_output_file_path, arg2_options) {
		//Convert from parameters
		let input_file_path = arg0_input_file_path;
		let output_file_path = arg1_output_file_path;
		let options = (arg2_options) ? arg2_options : {};
		
		//Initialise options
		if (!options.latitude_key) options.latitude_key = "latitude";
		if (!options.longitude_key) options.longitude_key = "longitude";
		options.time_index = Math.returnSafeNumber(options.time_index);
		if (!options.variable_key) { //Guard clause if options.variable_key is not specified
			console.error("convertNCToASC() - No variable key provided.");
			return;
		}
		
		//Declare local instance variables
		let file_buffer = fs.readFileSync(input_file_path);
		let reader = new netcdfjs.NetCDFReader(file_buffer);
		
		//Extract metadata from .nc file
		let cellsize = reader.getDataVariable(options.longitude_key)[1] - reader.getDataVariable(options.longitude_key)[0];
		let ncols = reader.dimensions.find((dimension) => dimension.name === options.longitude_key).size;
		let nodata = -9999;
		let nrows = reader.dimensions.find((dimension) => dimension.name === options.latitude_key).size;
		let xllcorner = reader.getDataVariable(options.longitude_key)[0];
		let yllcorner = reader.getDataVariable(options.latitude_key)[nrows - 1];
		
		//Create temporary file names for async purposes
		let temp_nc = "./temp_time_slice.nc";
		let temp_ascii = "./temp_output.txt";
		
		//Log extracted metadata
		console.log(`Extracted Metadata: ncols=${ncols}, nrows=${nrows}, cellsize=${cellsize}, xllcorner=${xllcorner}, yllcorner=${yllcorner}`);
		
		try {
			console.log(`Extracting time slice ${options.time_index} from ${input_file_path}...`);
			child_process.execSync(`wsl ncks -d time,${options.time_index} ${input_file_path} -o ${temp_nc}`);
			
			console.log(`Converting .nc to .asc using ncdump (floating-point precision) ..`);
			child_process.execSync(`ncdump -p 16,9 -v ${options.variable_key} ${temp_nc} > ${temp_ascii}`);
			
			console.log(`Processing ASCII output into .asc format ..`);
			
			//Read ASCII file and extract data
			let ascii_data = fs.readFileSync(temp_ascii, "utf-8").split("\n");
			let grid_data = [];
			let processing_data = false;
			
			for (let line of ascii_data) {
				if (line.includes(`${options.variable_key} =`)) {
					processing_data = true;
					line = line.split("=")[1].trim();
				}
				if (processing_data) {
					line = line.replace(/;/g, "").trim(); //Remove trailing semicolons
					if (line.length > 0)
						grid_data.push(...line.split(/[\s,]+/).filter(value => value.trim() !== "")); //Clean spaces & commas
				}
			}
			
			//Write header to final .asc file
			let write_stream = fs.createWriteStream(output_file_path);
			
			write_stream.write(`ncols ${ncols}\n`);
			write_stream.write(`nrows ${nrows}\n`);
			write_stream.write(`xllcorner ${xllcorner}\n`);
			write_stream.write(`yllcorner ${yllcorner}\n`);
			write_stream.write(`cellsize ${cellsize}\n`);
			write_stream.write(`NODATA_value ${nodata}\n`);
			
			//Write content correctly
			for (let i = 0; i < nrows; i++) {
				let row_start = i*ncols;
				let row_values = grid_data.slice(row_start, row_start + ncols);
				
				let clean_row = row_values.join(" "); // nsure single-space formatting
				clean_row = clean_row.replace(/-9(\s|$)/g, "-9999 "); //Replace -9 with -9999
				clean_row = clean_row.replace(/\s+/g, " ").trim(); //Ensure only single spaces
				write_stream.write(clean_row + "\n");
			}
			
			write_stream.end(() => {
				console.log(`Converted .nc input file to .asc output at: ${output_file_path}`);
			});
		} catch (error) {
			console.error(`Error processing NetCDF file:`, error);
		} finally {
			//Cleanup temporary files
			fs.unlinkSync(temp_nc);
			fs.unlinkSync(temp_ascii);
		}
	};
	
	/**
	 * Logs all variables within an `.nc` file.
	 * @alias GeoNC.getVariables
	 * 
	 * @param {string} arg0_input_file_path
	 */
	GeoNC.getVariables = function (arg0_input_file_path) {
		//Convert from parameters
		let input_file_path = arg0_input_file_path;
		
		//Declare local instance variables
		let file_buffer = fs.readFileSync(input_file_path);
		let reader = new netcdfjs.NetCDFReader(file_buffer);
		
		//Log all attributes first
		console.log(`Attributes from ${input_file_path}:`);
		console.log(reader.dimensions);
		
		//Iterate over all variables and log it
		console.log(`Variables from ${input_file_path}:`);
		
		for (let i = 0; i < reader.variables.length; i++)
			console.log(reader.variables[i]);
	};
}