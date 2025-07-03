//Initialise Entity Keyframes actions
{
  function deleteKeyframe (arg0_entity_id, arg1_timestamp) { //[WIP] - Deleting a keyframe should update the bio and close the keyframe context menus. It currently does not
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var timestamp = arg1_timestamp;

    //Delete keyframe; update bio [WIP] - Make sure to update bio
    closeEntityKeyframeContextMenus(entity_id);
    deleteHistoryFrame(entity_id, timestamp);

    printEntityBio(entity_id);
  }

  function editKeyframe (arg0_entity_id, arg1_timestamp) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var timestamp = arg1_timestamp;

    //Close entity UI, call editEntity()
    closeEntityContextMenu(entity_id);
    setDate(timestamp);
    editEntity(entity_id);

    performAction({
      action_id: "edit_keyframe",
      redo_function: "editKeyframe",
      redo_function_parameters: [entity_id, timestamp],
      undo_function: "undoEditKeyframe",
      undo_function_parameters: [entity_id]
    });
  }

  function moveKeyframe (arg0_entity_id, arg1_date, arg2_date) { //[WIP] - This should update the bio and adjust any open context menus tied to a keyframe. ('placeholder: "timestamp"') It does not.
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var entry_date = arg1_date;
    var move_to_date = arg2_date;

    //Declare local instance variables
    var common_selectors = config.defines.common.selectors;
    var entity_el = getEntityElement(entity_id);

    var entity_obj = getEntity(entity_id);
    var history_entry = getAbsoluteHistoryFrame(entity_id, entry_date);
    var new_timestamp = getTimestamp(move_to_date);
    var old_timestamp = getTimestamp(convertTimestampToDate(entry_date));
    var popup_el = document.querySelector(`.entity-ui-pane[class~='${entity_id}']`);

    //Move history_entry to new timestamp
    if (entity_obj)
      if (history_entry) {
        //Only change date of keyframe if it does not conflict with the same keyframe
        if (history_entry.id != convertTimestampToInt(new_timestamp)) {
          //Move to new_timestamp
          entity_obj.options.history[new_timestamp] = history_entry;
          var new_history_entry = entity_obj.options.history[new_timestamp];

          //Delete old timestamp; change ID
          delete entity_obj.options.history[old_timestamp];
          new_history_entry.id = convertTimestampToInt(new_timestamp);
          entity_obj.options.history = sortObjectByKey(entity_obj.options.history, { key: "id", mode: "ascending" });

          //Repopulate bio; move it to new history entry
          printEntityBio(entity_id);

          var new_history_entry_el = document.querySelector(`#entity-ui-timeline-bio-table-${entity_id} tr[timestamp="${new_history_entry.id}"]`);
        }
      } else {
        console.warn(`Could not find history entry for ${entity_id} at timestamp ${entry_date}!`);
      }
  }

  /**
   * undoEditKeyframe() - Undoes an edit keyframe action by restoring the current history frame and clearing entity brush selection.
   * @param {String} arg0_entity_id - The ID of the entity to undo the edit keyframe action for.
   * 
   * @returns {Object}
   **/
  function undoEditKeyframe (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    clearBrush();
    loadDate();
  }
}
