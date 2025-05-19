//Initialise functions
{
  /*
    setEntityStrokeColour() - Sets the stroke colour of a given entity.
    arg0_entity_id: (String) - The entity ID to input.
    arg1_colour: (Array<Number, Number, Number>/String) - The colour to change the entity to.
    arg2_options: (Object)
      date: (Object, Date) - Optional. The current date by default.
  */
  function setEntityStrokeColour (arg0_entity_id, arg1_colour, arg2_options) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var colour = (Array.isArray(arg1_colour)) ? RGBToHex(arg1_colour) : arg1_colour;
    var options = (arg2_options) ? arg2_options : {};

    //Initialise options
    if (!options.date) options.date = main.date;

    //Declare local instance variables
    var current_history = getHistoryFrame(entity_id, options.date);
    var entity_obj = getEntity(entity_id);

    if (current_history.options.color != colour) {
      createHistoryFrame(entity_id, options.date, { color: colour, lineColor: colour });

      var current_symbol = entity_obj.getSymbol();
      current_symbol.lineColor = colour;
      entity_obj.setSymbol(current_symbol);
    }
  }

  /**
   * setEntityStrokeOpacity() - Sets the stroke opacity of a given entity.
   * @param {String} arg0_entity_id - The entity ID to input.
   * @param {number} arg1_opacity - The opacity to change the entity to.
   * @param {Object} [arg2_options] - Optional. The options to input.
   *  @param {Object} [arg2_options.date=main.date] - Optional. The current date by default.
   */
  function setEntityStrokeOpacity (arg0_entity_id, arg1_opacity, arg2_options) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var opacity = returnSafeNumber(arg1_opacity);
    var options = (arg2_options) ? arg2_options : {};
    
    //Declare local instance variables
    var current_history = getHistoryFrame(entity_id, options.date);
    var entity_obj = getEntity(entity_id);

    if (current_history.options.strokeOpacity != opacity) {
      createHistoryFrame(entity_id, options.date, { strokeOpacity: opacity });

      var current_symbol = entity_obj.getSymbol();
      current_symbol.lineOpacity = opacity;
      entity_obj.setSymbol(current_symbol);
    }
  }

  function setEntityStrokeWidth (arg0_entity_id, arg1_width, arg2_options) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var width = returnSafeNumber(arg1_width);
    var options = (arg2_options) ? arg2_options : {};
    
    //Declare local instance variables
    var current_history = getHistoryFrame(entity_id, options.date);
    var entity_obj = getEntity(entity_id);

    if (current_history.options.strokeWidth != width) {
      createHistoryFrame(entity_id, options.date, { lineWidth: width });

      var current_symbol = entity_obj.getSymbol();
      current_symbol.lineWidth = width;
      entity_obj.setSymbol(current_symbol);
    }
  }
}
