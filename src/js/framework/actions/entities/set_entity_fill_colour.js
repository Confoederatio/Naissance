//Initialise functions
{
  /*
    setEntityFillColour() - Sets the fill colour of a given entity.
    arg0_entity_id: (String) - The entity ID to input.
    arg1_colour: (Array<Number, Number, Number>/String) - The colour to change the entity to.
    arg2_options: (Object)
      date: (Object, Date) - Optional. The current date by default.
  */
  function setEntityFillColour (arg0_entity_id, arg1_colour, arg2_options) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var colour = (Array.isArray(arg1_colour)) ? RGBToHex(arg1_colour) : arg1_colour;
    var options = (arg2_options) ? arg2_options : {};

    //Initialise options
    if (!options.date) options.date = main.date;

    //Declare local instance variables
    var current_history = getHistoryFrame(entity_id, options.date);
    var entity_obj = getEntity(entity_id);

    if (current_history.options.fillColor != colour) {
      createHistoryFrame(entity_id, options.date, { fillColor: colour });

      var current_symbol = entity_obj.getSymbol();
      current_symbol.polygonFill = colour;
      entity_obj.setSymbol(current_symbol);
    }
  }

  function setEntityFillOpacity (arg0_entity_id, arg1_opacity, arg2_options) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var opacity = returnSafeNumber(arg1_opacity);
    var options = (arg2_options) ? arg2_options : {};

    //Initialise options
    if (!options.date) options.date = main.date;
    
    //Declare local instance variables
    var current_history = getHistoryFrame(entity_id, options.date);
    var entity_obj = getEntity(entity_id);

    if (current_history.options.fillOpacity != opacity) {
      createHistoryFrame(entity_id, options.date, { fillOpacity: opacity });

      var current_symbol = entity_obj.getSymbol();
      current_symbol.polygonOpacity = opacity;
      entity_obj.setSymbol(current_symbol);
    }
  }

  function setEntityFillPattern (arg0_entity_id, arg1_pattern_url, arg2_options) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var pattern_url = arg1_pattern_url;
    var options = (arg2_options) ? arg2_options : {};
    
    //Initialise options
    if (!options.date) options.date = main.date;

    //Declare local instance variables
    var current_history = getHistoryFrame(entity_id, options.date);
    var entity_obj = getEntity(entity_id);

    if (current_history.options.polygonPatternFile != pattern_url) {
      createHistoryFrame(entity_id, options.date, { polygonPatternFile: pattern_url });

      var current_symbol = entity_obj.getSymbol();
      entity_obj.setSymbol(current_symbol);
    }
  }
}
