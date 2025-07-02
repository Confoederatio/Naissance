//Initialise functions
{
  /*
    convertASCToPNG() - Converts an .asc file to .png.
    arg0_input_file_path: (String)
    arg1_output_file_path: (String)
    arg2_options: (Object)
      is_sedac_convert_intl_dollars: (Boolean) - Whether this is SEDAC. If true, converts from 2011$ to 2000$.
      mode: (String) - Either 'number' or 'percentage'. 'number' by default.
  */
  async function convertASCToPNG (arg0_input_file_path, arg1_output_file_path, arg2_options) {
    //Convert from parameters
    var input_file_path = arg0_input_file_path;
    var output_file_path = arg1_output_file_path;
    var options = (arg2_options) ? arg2_options : {};

    //Initialise options
    if (!options.mode) options.mode = "number";

    //Declare local instance variables
    var asc_dataframe = readASCFile(input_file_path);
    var image_columns = asc_dataframe[0].length;
    var image_rows = asc_dataframe.length;
    var max_value = getMaximumInArray(asc_dataframe);

    //Log image_columns; image_rows
    console.log(`Converting .asc file ${input_file_path} to ${output_file_path} with dimensions ${image_columns}x${image_rows}. Maximum value in dataframe: ${max_value}`);

    var png = new pngjs.PNG({
      height: image_rows,
      width: image_columns,
      filterType: -1
    });
    var world_bank_subdivisions_image;
    if (options.is_sedac_convert_intl_dollars)
      world_bank_subdivisions_image = loadWorldBankSubdivisions(config.defines.common.input_file_paths.world_bank_subdivisions);

    //Iterate over all rows and columns
    for (var i = 0; i < image_rows; i++)
      for (var x = 0; x < image_columns; x++) {
        var local_index = (i*image_columns + x)*4; //RGBA index
        var local_value = asc_dataframe[i][x];
        var rgba;

        //is_sedac_convert_intl_dollars 2011$ to 2000$ handler
        if (options.is_sedac_convert_intl_dollars) {
          var local_alpha = world_bank_subdivisions_image[local_index + 3];
          var local_country = getCountryObjectByRGB([
            world_bank_subdivisions_image.data[local_index],
            world_bank_subdivisions_image.data[local_index + 1],
            world_bank_subdivisions_image.data[local_index + 2]
          ]);

          if (local_value != undefined && local_value != -9999)
            if (local_country)
              local_value *= local_country.ppp_absolute_scalar;
        }

        if (local_value != undefined && local_value != -9999) {
          if (options.mode == "number") {
            //Encode full 32-bit integer value into RGBA
            rgba = encodeNumberAsRGBA((options.is_sedac) ?
              local_value/100 : local_value);
          } else if (options.mode == "percentage") {
            //Scale using percentage mode (0-100 mapped to G channel)
            var local_g = Math.min(Math.round((local_value/max_value)*255), 255);
            rgba = [0, local_g, 0, 255];
          }
        } else {
          //NODATA values are fully tansparent
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
  }

  async function processHYDEASCsToPNG (arg0_input_folder, arg1_output_folder, arg2_options) {
    //Convert from parameters
    var input_folder = arg0_input_folder;
    var output_folder = arg1_output_folder;
    var options = (arg2_options) ? arg2_options : {};

    //Declare local instance variables
    var all_input_files = FileManager.getAllFiles(input_folder);

    //Iterate over all_input_files. Remember that HYDE entries are contained in separate directories.
    for (var i = 0; i < all_input_files.length; i++)
      if (fs.lstatSync(all_input_files[i]).isDirectory()) {
        console.log(`Parsing HYDE folder: ${all_input_files[i]}`);

        processHYDEASCToPNG(all_input_files[i], output_folder, options);
      } else if (all_input_files[i].endsWith(".asc")) {
        var local_split_path = all_input_files[i].split("\\");
        var local_suffix = (options.mode == "percentage") ?
          `_percentage` : `_number`;

        var local_file_name = local_split_path[local_split_path.length - 1];

        //Convert ASC to PNG according to options
        convertASCToPNG(all_input_files[i], `${output_folder}/${local_file_name.replace(".asc", "")}${local_suffix}.png`, options);
      }
  }

  async function processSEDACASCToPNG (arg0_input_folder, arg1_output_folder, arg2_options) {
    //Convert from parameters
    var input_folder = arg0_input_folder;
    var output_folder = arg1_output_folder;
    var options = (arg2_options) ? arg2_options : {};
      options.is_sedac = true; //IMPORTANT! Divides all values by /100 (i.e. GDP PPP) for options.mode = 'number'.
      if (options.is_sedac_convert_intl_dollars == undefined) options.is_sedac_convert_intl_dollars = true;

    //Declare local instance Variables
    var all_input_files = FileManager.getAllFiles(input_folder);

    //Iterate over all_input_files with SEDAC_ prefix
    for (var i = 0; i < all_input_files.length; i++) {
      var local_split_path = all_input_files[i].split("\\");

      var local_file_name = local_split_path[local_split_path.length - 1];

      if (local_file_name.startsWith("SEDAC") && local_file_name.endsWith(".asc")) {
        var local_suffix = (options.mode == "percentage") ?
          `_percentage` : `_number`;

        //Convert ASC to PNG accordidng to options
        convertASCToPNG(all_input_files[i], `${output_folder}/${local_file_name.replace(".asc", "")}${local_suffix}.png`, options);
      }
    }
  }

  function readASCFile (arg0_file_path) {
    //Convert from parameters
    var file_path = arg0_file_path;

    //Declare local instance variables
    var checks_passed = 0;
    var data_columns = 0;
    var data_frame = [];
    var data_rows = 0;
    var is_header = true;
    var no_data_value = undefined;
    var raw_data = fs.readFileSync(file_path, "utf8").split("\n");
    var row_index = 0;

    //Iterate over all raw_data lines
    for (var i = 0; i < raw_data.length; i++) {
      var local_line = raw_data[i].trim();

      //Internal guard clause; skip empty lines
      if (local_line == "") continue;

      //Header parsing
      if (is_header) {
        if (checks_passed < 3) {
          var split_line = local_line.split(" ");

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

          for (var x = 0; x < data_rows; x++)
            data_frame[x] = new Array(data_columns);
        }
        continue;
      }

      //Data parsing
      var local_values = local_line.split(/\s+/);

      for (var x = 0; x < data_columns; x++)
        data_frame[row_index][x] = (local_values[x] == no_data_value) ?
          undefined : parseFloat(local_values[x]);

      row_index++;
      if (row_index >= data_rows) break; //Stop processing once all rows are read
    }

    //Return statement
    return data_frame;
  }
}
