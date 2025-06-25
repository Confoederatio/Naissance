//Basic files - Requires path and fs to function.

function getAllDrives () {
  //Declare local instance variables
  var current_os = process.platform;

  if (current_os == "win32") {
    var stdout = child_process.execSync("wmic logicaldisk get name", { encoding: "utf8" });

    //Parse the output to extract drive letters
    stdout = stdout.split("\n");
    stdout.unshift();
    stdout = stdout.map((line) => line.trim());

    //Iterate over all stdout
    for (var i = stdout.length - 1; i >= 0; i--)
      if (stdout[i] == "" || stdout[i] == "Name")
        stdout.splice(i, 1);

    //Return statement
    return stdout;
  } else {
    var stdout = child_process.execSync("df -h", { encoding: "utf8" });

    //Parse the output to extract drives
    stdout = stdout.split("\n")
      .map((line) => line.split(/\s+/).pop())
      .filter((path) => path.startsWith("/") && !path.startsWith("/dev"));

    //Return statement
    return [...new Set(stdout)];
  }
}

/*
  importFile() - Imports a Node.js file.
  arg0_require_obj: (String) - The file path to import.
*/
function importFile (arg0_require_obj) {
  //Convert from parameters
  var local_library = require(arg0_require_obj);

  //Add to global namespace
  var all_properties_in_library = Object.keys(local_library);

  for (var i = 0; i < all_properties_in_library.length; i++)
    global[all_properties_in_library[i]] = local_library[all_properties_in_library[i]];
}

/*
  loadDirectory() - Loads the files in an immediate directory in chronological order.
  arg0_folder: (String) - The directory to load.
  arg1_options: (Object)
    reverse: (Boolean) - Optional. Whether to reverse it or not. True by default.
*/
function loadDirectory (arg0_folder, arg1_options) {
  //Convert from parameters
  var folder = arg0_folder;
  var options = (arg1_options) ? arg1_options : {};

  //Initialise options
  if (options.reverse == undefined) options.reverse = true;

  //Declare local instance variables
  var folder_array = fs.readdirSync(folder);

  //Sort folder_array in chronological order
  folder_array.sort(function(a, b) {
    try {
      return fs.statSync(folder + a).mtime.getTime() - fs.statSync(folder + b).mtime.getTime();
    } catch {}
  });

  //Reverse folder_array to most recent first
  if (options.reverse)
    folder_array = folder_array.reverse();

  //Return statement
  return folder_array;
}

//loadConfig()
function loadConfig () {
  //Declare local instance variables
  var loaded_files = [];

  //Load config backend files individually first
  if (global.load_order) {
    var local_load_order = global.load_order.load_files;

    for (var i = 0; i < local_load_order.length; i++) {
      for (var x = 0; x < load_order.load_directories.length; x++) {
        var dir_pattern = load_order.load_directories[x];
        
        //Split the pattern into directory and file pattern
        var last_slash = dir_pattern.lastIndexOf('/');
        var base_dir = dir_pattern;
        var file_pattern = '*.js'; // Default pattern
        
        //If there's a pattern in the path, use it instead
        if (last_slash !== -1) {
          base_dir = dir_pattern.substring(0, last_slash);
          file_pattern = dir_pattern.substring(last_slash + 1);
        }
        
        var local_dir = `${__dirname}\\${base_dir}`;
        var all_directory_files = getAllFiles(local_dir);

        for (var y = 0; y < all_directory_files.length; y++) if (all_directory_files[y].includes(local_load_order[i])) {
          loadFile(all_directory_files[y]);
          loaded_files.push(local_load_order[i]);
          log.info(`Loaded imperative file ${all_directory_files[y]}.`);
        }
      }
    }

    //Load each load directory separately
    for (var i = 0; i < load_order.load_directories.length; i++) {
      var dir_pattern = load_order.load_directories[i];
      
      //Split the pattern into directory and file pattern
      var last_slash = dir_pattern.lastIndexOf('/');
      var base_dir = dir_pattern;
      var file_pattern = '*.js'; // Default pattern
      
      //If there's a pattern in the path, use it instead
      if (last_slash !== -1) {
        base_dir = dir_pattern.substring(0, last_slash);
        file_pattern = dir_pattern.substring(last_slash + 1);
      }
      
      var local_dir = `${__dirname}\\${base_dir}`;
      var all_directory_files = getAllFiles(local_dir);
      
      for (var x = 0; x < all_directory_files.length; x++) {
        //Skip if file is already loaded
        if (loaded_files.includes(all_directory_files[x])) continue;
        
        //Get just the filename from the full path
        var filename = all_directory_files[x].split('\\').pop();
        
        //Convert glob pattern to regex
        var pattern = file_pattern
          .replace(/\./g, '\\.') // Escape dots
          .replace(/\*/g, '.*')  // Convert * to .*
          .replace(/\?/g, '.');  // Convert ? to .
        var regex = new RegExp('^' + pattern + '$');
        
        //Only load if file matches pattern
        if (!regex.test(filename)) continue;
        
        loadFile(all_directory_files[x]);
        loaded_files.push(all_directory_files[x]);
      }
    }

    log.info(`Loaded ${loaded_files.length} files from ${load_order.load_directories.length} directories.`);
  } else {
    console.log(`No load order is defined.`);
  }
}

/*
  loadFile() - Loads a file, similar to import but with eval.
  arg0_file: (String) - The file path to load.
*/
function loadFile (arg0_file) {
  //Convert from parameters
  var file_path = arg0_file;

  //Evaluate file contents
  try {
    var rawdata = fs.readFileSync(file_path);
    eval(rawdata.toString());
  } catch (e) {
    log.error(`Failed to load ${file_path}.`);
    console.log(e);
  }
}
