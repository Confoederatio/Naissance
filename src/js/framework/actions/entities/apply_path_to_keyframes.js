//Initialise functions
{
  /*
    applyPathToKeyframes() - Retroactively applies the current path to multiple keyframes.
    arg0_entity_id: (String) - The entity ID for which to apply the path to multiple keyframes for.
    arg1_keyframes: (Array<String>) - The keyframes which to apply paths for.
  */
  function applyPathToKeyframes (arg0_entity_id, arg1_keyframes, arg2_do_not_add_to_undo_redo) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var keyframes = getList(arg1_keyframes);
    var do_not_add_to_undo_redo = arg2_do_not_add_to_undo_redo;

    //Declare local instance variables
    var entity_obj = getEntity(entity_id);

    if (entity_obj) {
      var current_history_entry = getAbsoluteHistoryFrame(entity_id, main.date);
      var old_history_obj = JSON.parse(JSON.stringify(entity_obj.options.history));

      //Make sure keyframes is defined
      if (!keyframes)
        keyframes = (entity_obj.options.selected_keyframes) ? entity_obj.options.selected_keyframes : [];
      
      //Iterate over all keyframes
      for (var i = 0; i < keyframes.length; i++) try {
        var local_timestamp = getTimestamp(keyframes[i]);

        var local_history_entry = entity_obj.options.history[local_timestamp];
        local_history_entry.coords = current_history_entry.coords;
      } catch (e) {}
    }

    //Add to undo/redo
    if (!do_not_add_to_undo_redo)
      performAction({
        action_id: "apply_path_to_keyframes",
        redo_function: "applyPathToKeyframes",
        undo_function: "undoApplyPathToKeyframes",
        redo_function_args: [entity_id, keyframes, true],
        undo_function_args: [entity_id, old_history_obj]
      });
      
    //Repopulate entity bio; refresh UI
    try {
      printEntityBio(entity_id);
    } catch (e) {}
  }

  function undoApplyPathToKeyframes (arg0_entity_id, arg1_old_history_obj) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var old_history_obj = arg1_old_history_obj;

    //Declare local instance variables
    var entity_obj = getEntity(entity_id);

    //Restore old history
    entity_obj.options.history = old_history_obj;

    //Repopulate entity bio; refresh UI
    printEntityBio(entity_id);
  }
}
