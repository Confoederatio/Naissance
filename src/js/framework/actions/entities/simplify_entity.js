//Initialise functions
{
  /**
   * Simplifies the geometry of a given entity based on a specified tolerance.
   *
   * @param {string|Object} arg0_entity_id - The entity ID to simplify.
   * @param {number} [arg1_tolerance=main.brush.simplify_tolerance] - The tolerance to simplify this entity to.
   * @param {Object} [arg2_options]
   *  @param {Object} [arg2_options.date]
   *
   * @return {Object}
   */
  function simplifyEntity (arg0_entity_id, arg1_tolerance, arg2_options) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var tolerance = (arg1_tolerance) ? arg1_tolerance : main.brush.simplify_tolerance;
    var options = (arg2_options) ? arg2_options : {};

    //Initialise options
    if (!options.date) options.date = main.date;

    //Declare local instance variables
    var entity_coords = getEntityCoords(entity_id, options.date);
    var entity_obj = (typeof entity_id != "object") ? getEntity(entity_id) : entity_id;

    //Simplify entity keyframe
    if (entity_obj) {
      var simplified_coords = simplify(convertToTurf(entity_coords), tolerance);

      //Set history entry to reflect actual_coords
      if (entity_obj.options.history) {
        createHistoryFrame(entity_id, options.date, { coords:
          convertToNaissance(simplified_coords)
        });
      }

      //Refresh entity_obj
      if (getTimestamp(options.date) == getTimestamp(main.date))
        entity_obj.setCoordinates(convertToMaptalks(simplified_coords));
    }

    //Return statement
    return entity_obj;
  }
}
