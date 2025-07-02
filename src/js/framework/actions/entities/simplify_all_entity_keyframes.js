//Initialise functions
{
  /*
    simplifyAllEntityKeyframes() - Simplifies all entity keyframe paths to a given tolerance.
    arg0_entity_id: (String) - The entity ID to simplify all keyframes for.
    arg1_tolerance: (Number) - The tolerance to simplify the keyframes to.

    Returns: (Number)
  */
  function simplifyAllEntityKeyframes (arg0_entity_id, arg1_simplify_all_entity_keyframes, arg2_options) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var simplify_all_entity_keyframes = arg1_simplify_all_entity_keyframes;
    var options = (arg2_options) ? arg2_options : {};

    //Guard clause
    if (simplify_all_entity_keyframes != true) return;
    console.log(`Attempting to simplify all entity keyframes`);

    //Declare local instance variables
    var entity_obj = (typeof entity_id != "object") ? getEntity(entity_id) : entity_id;
    var tolerance = (options.tolerance) ?
      options.tolerance : main.brush.simplify_tolerance;

    if (entity_obj) {
      if (entity_obj.options.history) {
        var all_history_entries = Object.keys(entity_obj.options.history);

        for (var i = 0; i < all_history_entries.length; i++) {
          var local_date = convertTimestampToDate(all_history_entries[i]);
          var local_history_frame = entity_obj.options.history[all_history_entries[i]];
          var local_simplified_coords = convertToNaissance(simplify(local_history_frame, tolerance));

          //Extract coords from local_simplified_coords
          local_history_frame.coords = local_simplified_coords;
        }
      }

      //Simplify current entity to update coords on map
      simplifyEntity(entity_id, tolerance);
    }

    //Return statement
    return entity_obj;
  }
}
