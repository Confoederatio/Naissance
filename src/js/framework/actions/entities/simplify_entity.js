//Initialise functions
{
  /*
    simplifyEntity() - Simplifies an entity to a given tolerance.
    arg0_entity_id: (String) - The entity ID to simplify.
    arg1_tolerance: (Number) - The tolerance to simplify this entity to.

    Returns: (Object)
  */
  function simplifyEntity (arg0_entity_id, arg1_tolerance) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var tolerance = arg1_tolerance;

    //Declare local instance variables
    var entity_obj = (typeof entity_id != "object") ? getEntity(entity_id) : entity_id

    if (entity_obj) {
      var simplified_coords = simplify(convertMaptalksCoordsToTurf(entity_obj), tolerance);

      //Set history entry to reflect actual_coords
      if (entity_obj.options.history) {
        var current_history_entry = getAbsoluteHistoryFrame(entity_obj, main.date);

        current_history_entry.coords = convertToNaissance(simplified_coords);
      }

      //Refresh entity_obj
      entity_obj.setCoordinates(convertToMaptalks(simplified_coords));
    }

    //Return statement
    return entity_obj;
  }
}
