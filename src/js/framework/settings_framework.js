//Initialise functions
{
  function applyDocumentSettings (arg0_settings_object) { //[WIP] - Finish function body
    //Convert from parameters
    var settings_object = (arg0_settings_object) ? arg0_settings_object : main.settings;

    //Internal guard clause if settings_object is not an object
    if (settings_object == undefined) return;

    //Declare local instance variables

    //Load Date from memory
    if (settings_object.date)
      main.date = settings_object.date;

    //Load Map Projection
    setMapProjection(getMapProjection());

    //Load Map Tilelayers
    if (settings_object.map)
      if (settings_object.map.tile_layers)
        applyMapLayersObject(settings_object.map.tile_layers);
    
    initSettingsUI();
  }
}