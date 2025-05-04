//Initialise functions
{
  /*
    cleanKeyframes() - Removes duplicate keyframes for an entity.
    arg0_entity_id: (String) - The entity ID which to clean keyframes for.
    arg1_tolerance: (Object, Date) - The date range from the current main.date for which duplicate keyframes should be removed.
    arg2_options: (Object)
      do_not_display: (Boolean) - Optional. Whether to not refresh the entity bio. False by default.

    Returns: (Object)
  */
  function cleanKeyframes (arg0_entity_id, arg1_tolerance, arg2_options, arg3_do_not_add_to_undo_redo) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var tolerance = (arg1_tolerance) ? convertTimestampToInt(getTimestamp(arg1_tolerance)) : Infinity;
    var options = (arg2_options) ? arg2_options : {};
    var do_not_add_to_undo_redo = arg3_do_not_add_to_undo_redo;

    //Declare local instance variables
    var entity_obj = (typeof entity_id != "object") ? getEntity(entity_id) : entity_id;
    var old_history_obj;

    if (entity_obj)
      if (entity_obj.options.history) {
        old_history_obj = JSON.parse(JSON.stringify(entity_obj.options.history));

        //Iterate over all_history_entries
        var all_history_entries = Object.keys(entity_obj.options.history);

        for (var i = 0; i < all_history_entries.length; i++)
          if (convertTimestampToInt(all_history_entries[i]) >= (convertTimestampToInt(getTimestamp(main.date)) - tolerance)) {
            var empty_options = false;
            var local_history_entry = entity_obj.options.history[all_history_entries[i]];

            //Process .coords
            {
              //Remove .coords if last coords are the same getEntityLastIdenticalCoords(entity_obj, local_history_entry));
              if (getEntityLastIdenticalCoords(entity_obj, local_history_entry))
                delete local_history_entry.coords;

              //Convert to Naissance format if applicable
              if (local_history_entry.coords)
                local_history_entry.coords = convertToNaissance(local_history_entry.coords);
            }

            //Remove frame if same .coords and options is empty
            if (local_history_entry.options) {
              if (Object.keys(local_history_entry.options).length == 0) {
                empty_options = true;
                delete local_history_entry.options;
              }
            } else {
              empty_options = true;
            }

            //Remove frame if needed
            if (!local_history_entry.coords && empty_options)
              delete entity_obj.options.history[all_history_entries[i]];
          }

        //Repopulate entity bio; refresh UI
        if (!options.do_not_display)
          try {
            printEntityBio(entity_id);
          } catch {}

        if (!do_not_add_to_undo_redo)
          performAction({
            action_id: "clean_keyframes",
            redo_function: "cleanKeyframes",
            redo_function_args: [entity_id, tolerance, options, true],
            undo_function: "undoCleanKeyframes",
            undo_function_args: [entity_id, old_history_obj]
          });
      }

    //Return statement
    return entity_obj;
  }

  function undoCleanKeyframes (arg0_entity_id, arg1_old_history_obj) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var old_history_obj = arg1_old_history_obj;

    //Declare local instance variables
    var entity_obj = getEntity(entity_id);
    
    try {
      entity_obj.options.history = old_history_obj;
      printEntityBio(entity_id);
    } catch (e) {}
  }
}
