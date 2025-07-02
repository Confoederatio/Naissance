//Initialise functions
{
  /*
    convertNCToASC() - Converts a .nc file to a .asc file, depending on its options.time_index and options.variable_key.
    arg0_input_file_path: (String)
    arg1_output_file_path: (String)
    arg2_options: (Object)
      time_index: (Number) - Optional. 0 by default.
      variable_key: (String) - The variable key to write to a .asc file as it can only store one value per .asc file.
  */
  async function convertNCToASC (arg0_input_file_path, arg1_output_file_path, arg2_options) {
    //Convert from parameters
    var input_file_path = arg0_input_file_path;
    var output_file_path = arg1_output_file_path;
    var options = (arg2_options) ? arg2_options : {};

    //Initialise options
    options.time_index = returnSafeNumber(options.time_index);
    if (!options.variable_key) { //Guard clause if options.variable_key is not specified
        console.error("convertNCToASC() - No variable key provided.");
        return;
    }

    //Declare local instance variables
    var file_buffer = fs.readFileSync(input_file_path);
    var reader = new netcdfjs.NetCDFReader(file_buffer);

    //Extract metadata from .nc file
    var cellsize = reader.getDataVariable("longitude")[1] - reader.getDataVariable("longitude")[0];
    var ncols = reader.dimensions.find((dimension) => dimension.name === "longitude").size;
    var nodata = -9999;
    var nrows = reader.dimensions.find((dimension) => dimension.name === "latitude").size;
    var xllcorner = reader.getDataVariable("longitude")[0];
    var yllcorner = reader.getDataVariable("latitude")[nrows - 1];

    //Create temporary file names for async purposes
    var temp_nc = "./temp_time_slice.nc";
    var temp_ascii = "./temp_output.txt";

    //Log extracted metadata
    console.log(`Extracted Metadata: ncols=${ncols}, nrows=${nrows}, cellsize=${cellsize}, xllcorner=${xllcorner}, yllcorner=${yllcorner}`);

    try {
        console.log(`Extracting time slice ${options.time_index} from ${input_file_path}...`);
        child_process.execSync(`wsl ncks -d time,${options.time_index} ${input_file_path} -o ${temp_nc}`);

        console.log(`Converting .nc to .asc using ncdump (floating-point precision) ..`);
        child_process.execSync(`ncdump -p 16,9 -v ${options.variable_key} ${temp_nc} > ${temp_ascii}`);

        console.log(`Processing ASCII output into .asc format ..`);

        //Read ASCII file and extract data
        var ascii_data = fs.readFileSync(temp_ascii, "utf-8").split("\n");
        var grid_data = [];
        var processing_data = false;

        for (var line of ascii_data) {
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
        var write_stream = fs.createWriteStream(output_file_path);

        write_stream.write(`ncols ${ncols}\n`);
        write_stream.write(`nrows ${nrows}\n`);
        write_stream.write(`xllcorner ${xllcorner}\n`);
        write_stream.write(`yllcorner ${yllcorner}\n`);
        write_stream.write(`cellsize ${cellsize}\n`);
        write_stream.write(`NODATA_value ${nodata}\n`);

        //Write content correctly
        for (var i = 0; i < nrows; i++) {
          var row_start = i * ncols;
          var row_values = grid_data.slice(row_start, row_start + ncols);

          var clean_row = row_values.join(" "); // nsure single-space formatting
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

  function getNCVariables (arg0_input_file_path) {
    //Convert from parameters
    var input_file_path = arg0_input_file_path;

    //Declare local instance variables
    var file_buffer = fs.readFileSync(input_file_path);
    var reader = new netcdfjs.NetCDFReader(file_buffer);

    //Log all attributes first
    console.log(`Attributes from ${input_file_path}:`);
    console.log(reader.dimensions);

    //Iterate over all variables and log it
    console.log(`Variables from ${input_file_path}:`);

    for (var i = 0; i < reader.variables.length; i++)
      console.log(reader.variables[i]);
  };

  async function processSEDAC (arg0_input_file_path, arg1_output_folder, arg2_variable_key) {
    //Convert from parameters
    var input_file_path = arg0_input_file_path;
    var output_folder = arg1_output_folder;
    var variable_key = arg2_variable_key;

    //Declare local instance variables
    var file_buffer = fs.readFileSync(input_file_path);
    var reader = new netcdfjs.NetCDFReader(file_buffer);

    var time_domain = reader.getDataVariable("time").length;

    //Log SEDAC processing
    console.log(`Processing SEDAC iteratively into ${output_folder} with a time_domain of: ${time_domain}`);

    //Iterate over time_domain
    for (var i = 0; i < time_domain; i++) {
      console.log(`Processing ${i}/${time_domain} (${1990 + i}AD) ..`);
      await convertNCToASC(input_file_path, `${output_folder}SEDAC_${1990 + i}.asc`, {
        variable_key: variable_key, time_index: i
      });
    }
  };
}
