//Internals functions - Should not actually be used by end dev
{
  function getTurfObject (arg0_format) {
    //Convert from parameters
    var format = arg0_format;

    //Declare local instance variables
    var format_type = getCoordsType(format);

    //Guard clauses for existing Turf formats
    if (format_type == "turf")
      return turf[format[1]](format[0]);
    if (format_type == "turf_object") {
      return format;
    }

    var turf_coords = convertToTurf(format);

    //Return statement
    return turf[turf_coords[1]](turf_coords[0]);
  }

  function isValidTurfOperation (arg0_format, arg1_format) {
    //Convert from parameters
    var format = arg0_format;
    var ot_format = arg1_format;

    //Return statement
    if (format && ot_format)
      if (
        getCoordsType(format) == "turf_object" &&
        getCoordsType(ot_format) == "turf_object"
      ) {
          return true;
      }
  }

  /*
    performTurfOperation() - Performs a Turf operation; similar to difference(), intersect() or union().
    options: {
      operation_type: "difference"/"intersect"/"union", - Select one of three.
      return_leaflet: false/true - Optional. Whether to return a Leaflet object. True by default
    }
  */
  function performTurfOperation (arg0_format, arg1_format, arg2_options) {
    //Convert from parameters
    var format = arg0_format;
    var ot_format = arg1_format;
    var options = (arg2_options) ? arg2_options : {};

    //Initialise options
    if (!options.return_leaflet != false) options.return_leaflet = true;

    //Declare local instance variables
    try {
      var ot_turf_obj = getTurfObject(ot_format);
      var turf_obj = getTurfObject(format);
      var turf_operation = turf[options.operation_type](turf_obj, ot_turf_obj);

      //Return statement
      if (turf_operation)
        return (options.return_leaflet) ? convertToLeaflet(turf_operation) : turf_operation;
    } catch (e) {
      //Return statement
      return (options.return_leaflet) ? convertToLeaflet(turf_operation) : turf_operation;
    }
  }
}

//Turf list operations, accepts any valid format, so long as it is an array
{
  //bufferAll() - Same options as buffer().
  function bufferAll (arg0_format_list, arg1_options) {
    //Convert from parameters
    var format_list = getList(arg0_format_list);
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var all_buffers = [];

    //Iterate over format_list and buffer everything
    for (var i = 0; i < format_list.length; i++)
      all_buffers.push(buffer(format_list[i], options));

    //Return statement
    return all_buffers;
  }

  //differenceAll() - Same options as difference(). First element is subtracted by the rest
  function differenceAll (arg0_format_list, arg1_options) {
    //Convert from parameters
    var format_list = getList(arg0_format_list);
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var original_poly = getTurfObject(format_list[0]);

    //Iterate over format_list above i = 1
    if (format_list.length > 1)
      for (var i = 1; i < format_list.length; i++) {
        var local_turf_obj = getTurfObject(format_list[i]);

        original_poly = difference(original_poly, local_turf_obj, {
          return_leaflet: false
        });
      }

    //Return statement
    return (!options.return_leaflet) ? convertToLeaflet(original_poly) : original_poly;
  }

  //intersectionAll() - Same options as intersection(). The intersection of all elements is returned
  function intersectionAll (arg0_format_list, arg1_options) {
    //Convert from parameters
    var format_list = getList(arg0_format_list);
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var original_poly = getTurfObject(format_list[0]);

    //Iterate over format_list above i = 1
    if (format_list.length > 1)
      for (var i = 1; i < format_list.length; i++) {
        var local_turf_obj = getTurfObject(format_list[i]);

        original_poly = intersection(original_poly, local_turf_obj, {
          return_leaflet: false
        });
      }


    //Return statement
    return (!options.return_leaflet) ? convertToLeaflet(original_poly) : original_poly;
  }

  //unionAll() - Same options as union().
  function unionAll (arg0_format_list, arg1_options) {
    //Convert from parameters
    var format_list = getList(arg0_format_list);
    var options = (arg1_options) ? arg1_options : {};

    if (options.return_leaflet != false) options.return_leaflet = true;

    //Declare local instance variables
    var original_poly = getTurfObject(format_list[0]);

    //Iterate over format_list above i = 1
    if (format_list.length > 1)
      for (var i = 1; i < format_list.length; i++) {
        var local_turf_obj = getTurfObject(format_list[i]);

        original_poly = union(original_poly, local_turf_obj, {
          return_leaflet: false
        });
      }


    //Return statement
    return (!options.return_leaflet) ? convertToLeaflet(original_poly) : original_poly;
  }

  //simplifyAll() - Same options as simplify().
  function simplifyAll (arg0_format_list, arg1_options) {
    //Convert from parameters
    var format_list = getList(arg0_format_list);
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var all_simplifications = [];

    //Iterate over format_list and buffer everything
    for (var i = 0; i < format_list.length; i++)
      all_simplifications.push(simplify(format_list[i], options));

    //Return statement
    return all_simplifications;
  }
}

//Turf single operations, accepts any valid format
{
  /*
    buffer() - Buffers a polygon of any accepted format.
    options: {
      <key>: <value>, - Any other value used in turf.buffer()
      radius: 1, - The number of units to buffer by
      return_leaflet: false/true - Optional. Whether to return a Leaflet object. True by default
    }
  */
  function buffer (arg0_format, arg1_options) {
    //Convert from parameters
    var format = arg0_format;
    var options = (arg1_options) ? arg1_options : {};

    //Initialise options
    if (options.radius == undefined) options.radius = 1;
    if (options.return_leaflet != false) options.return_leaflet = true;

    //Declare local instance variables
    var turf_obj = getTurfObject(format);

    var turf_buffered = turf.buffer(turf_obj, options.radius, options);

    //Return statement
    return (options.return_leaflet) ? convertToLeaflet(turf_buffered) : turf_buffered;
  }

  /*
    difference() - Subtracts arg1_format from arg0_format.
    options: {
      return_leaflet: false/true - Optional. Whether to return a Leaflet object. True by default
    }
  */
  function difference (arg0_format, arg1_format, arg2_options) {
    //Convert from parameters
    var format = arg0_format;
    var ot_format = arg1_format;
    var options = (arg2_options) ? arg2_options : {};

    //Initialise options
    if (!options.return_leaflet != false) options.return_leaflet = true;

    //Declare local instance variables
    var turf_difference = performTurfOperation(format, ot_format, {
      operation_type: "difference",
      return_leaflet: options.return_leaflet
    });

    //Return statement
    return turf_difference;
  }

  /*
    intersection() - Returns the intersection of arg0_format and arg1_format.
    options: {
      return_leaflet: false/true - Optional. Whether to return a Leaflet object. True by default
    }
  */
  function intersection (arg0_format, arg1_format, arg2_options) {
    //Convert from parameters
    var format = arg0_format;
    var ot_format = arg1_format;
    var options = (arg2_options) ? arg2_options : {};

    //Initialise options
    if (!options.return_leaflet != false) options.return_leaflet = true;

    //Declare local instance variables
    var turf_intersection = performTurfOperation(format, ot_format, {
      operation_type: "intersect",
      return_leaflet: options.return_leaflet
    });

    //Return statement
    return turf_intersection;
  }

  /*
    union() - Adds arg1_format to arg0_format.
    options: {
      return_leaflet: false/true - Optional. Whether to return a Leaflet object. True by default
    }
  */
  function union (arg0_format, arg1_format, arg2_options) {
    //Convert from parameters
    var format = arg0_format;
    var ot_format = arg1_format;
    var options = (arg2_options) ? arg2_options : {};

    //Initialise options
    if (!options.return_leaflet != false) options.return_leaflet = true;

    //Declare local instance variables
    var turf_union = performTurfOperation(format, ot_format, {
      operation_type: "union",
      return_leaflet: options.return_leaflet
    });

    //Return statement
    return turf_union;
  }

  /*
    simplify() - Simplifies a polygon of any accepted format.
    options: {
      <key>: <value>, - Any other value used in turf.simplify()
      return_leaflet: false/true - Optional. Whether to return a Leaflet object. True by default
    }
  */
  function simplify (arg0_format, arg1_tolerance, arg2_options) {
    //Convert from parameters
    var format = arg0_format;
    var tolerance = parseFloat(arg1_tolerance);
    var options = (arg2_options) ? arg2_options : {};

    //Initialise options
    if (options.return_leaflet != false) options.return_leaflet = true;

    if (tolerance != undefined) {
      var new_options = mergeObjects({ tolerance: tolerance }, options);

      if (typeof new_options.tolerance == "number") {
        try {
          var turf_obj = getTurfObject(format);
          var turf_simplified = turf.simplify(turf_obj, new_options);

          //Return statement
          return (options.return_leaflet) ? 
            convertToLeaflet(turf_simplified) : turf_simplified;
        } catch (e) {
          //Return statement; guard clause
          return format;
        }
      } else {
        console.error(`Invalid tolerance option!`, new_options);
      }
    } else {
      console.error(`No options.tolerance specified.`);
    }
  }
}
