//Initialise functions#
{
  function setMapProjection (arg0_projection) {
    //Convert from parameters
    var projection = (arg0_projection) ? arg0_projection : "mercator";

    //Declare local instance variables
    var projection_dictionary = config.defines.map.projection_dictionary;
    var projection_value = projection_dictionary[projection];

    //Change the map projection
    map.setSpatialReference({
      projection: projection_value
    });

    //Set the map.projection in main.settings.map
    if (!main.settings.map) main.settings.map = {};
      main.settings.map.projection = projection;
  }
  
  function getMapProjection () {
    //Declare local instance variables
    var actual_projection;
    var default_projection = config.defines.map.default_projection;

    if (main.settings)
      if (main.settings.map)
        if (main.settings.map.projection)
          actual_projection = main.settings.map.projection;

    //Return statement
    return (actual_projection) ? actual_projection : default_projection;
  }
}