//Initialise functions
{
  function loadCSVAsArray (arg0_input_file_path) {
    //Convert from parameters
    var input_file_path = arg0_input_file_path;

    //Declare local instance variables
    var csv_file = fs.readFileSync(input_file_path, "utf8");
    var result = papaparse.parse(csv_file, {
      skipEmptyLines: true
    });

    //Return statement
    return result.data;
  }
}