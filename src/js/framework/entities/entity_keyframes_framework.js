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
    closeEntityContextMenu();
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

//Initialise Entity Keyframes framework
{
  /*
    getAllEntityKeyframes() - Fetches all entity keyframes as either an array of keys or objects.
    arg0_options: (Object)
      return_keys: (Boolean) - Optional. Whether or not to return an array of keys instead of objects. False by default.

    Returns: (Array<Object>/Array<String>)
  */
  function getAllEntityKeyframes (arg0_options) {
    //Convert from parameters
    var options = (arg0_options) ? arg0_options : {};

    //Declare local instance variables
    var common_defines = config.defines.common;
    var flattened_entity_keyframes = config.flattened_entity_keyframes;
    var return_keyframes = [];
    var return_keys = [];

    //Iterate over all_flattened_entity_keyframes
    var all_flattened_entity_keyframes = Object.keys(flattened_entity_keyframes);

    for (var i = 0; i < all_flattened_entity_keyframes.length; i++)
      if (!common_defines.reserved_entity_keyframes.includes(all_flattened_entity_keyframes[i])) {
        return_keyframes.push(flattened_entity_keyframes[all_flattened_entity_keyframes[i]]);
        return_keys.push(all_flattened_entity_keyframes[i]);
      }

    //Return statement
    return (!options.return_keys) ? return_keyframes : return_keys;
  }

  /*
    getEntityKeyframe() - Fetches an entity keyframe action.
    arg0_name: (String) - The name/ID of the entity keyframe category.
    arg1_options: (Object)
      return_key: (Boolean) - Optional. Whether or not to return the key. False by default.

    Returns: (Object/String)
  */
  function getEntityKeyframe (arg0_name, arg1_options) {
    //Convert from parameters
    var name = arg0_name;
    var options = (arg1_options) ? arg1_options : {};

    //Guard clause for objects; direct keys
    if (typeof name == "object") return name;
    if (config.flattened_entity_keyframes[name]) return (!options.return_key) ? config.flattened_entity_keyframes[name] : name;

    //Declare local instance variables
    var entity_keyframe_exists = [false, ""]; //[entity_keyframe_exists, entity_keyframe_key];
    var search_name = name.toLowerCase().trim();

    //ID search - soft search 1st, hard search 2nd
    {
      //Iterate over config.all_entity_keyframes
      for (var i = 0; i < config.all_entity_keyframes.length; i++) {
        var local_value = config.all_entity_keyframes[i];

        if (local_value.id.toLowerCase().includes(search_name))
          entity_keyframe_exists = [true, local_value.key];
      }
      for (var i = 0; i < config.all_entity_keyframes.length; i++) {
        var local_value = config.all_entity_keyframes[i];

        if (local_value.id.toLowerCase() == search_name)
          entity_keyframe_exists = [true, local_value.key];
      }
    }

    //Name search - soft search 1st, hard search 2nd
    {
      //Iterate over config.all_entity_keyframes
      for (var i = 0; i < config.all_entity_keyframes.length; i++) {
        var local_value = config.all_entity_keyframes[i];

        if (local_value.name)
          if (local_value.name.toLowerCase().includes(search_name))
            entity_keyframe_exists = [true, local_value.key];
      }
      for (var i = 0; i < config.all_entity_keyframes.length; i++) {
        var local_value = config.all_entity_keyframes[i];

        if (local_value.name)
          if (local_value.name.toLowerCase() == search_name)
            entity_keyframe_exists = [true, local_value.key];
      }
    }

    //Return statement
    if (entity_keyframe_exists[0])
      return (!options.return_key) ? config.flattened_entity_keyframes[entity_keyframe_exists[1]] : entity_keyframe_exists[1];
  }

  /*
    getEntityKeyframesAtOrder() - Fetches all entity keyframe actions belonging to a given .order.
    arg0_options: (Object)
      order: (Number) - Optional. The current order ot fetch all relevant keyframes at. 1 by default.
      return_keys: (Boolean) - Optional. Whether or not to return an array of keys instead of objects. False by default.
      return_object: (Boolean) - Optional. Whether to return the array as an object or not. False by default.

    Returns: (Array<Object>/Array<String>)
  */
  function getEntityKeyframesAtOrder (arg0_options) {
    //Convert from parameters
    var options = (arg0_options) ? arg0_options : {};

    //Declare local instance variables
    var flattened_entity_keyframes = config.flattened_entity_keyframes;
    var order = (options.order != undefined) ? options.order : 1;
    var return_keyframes = [];
    var return_keys = [];
    var return_obj = {};

    //Iterate over all_flattened_entity_keyframes
    var all_flattened_entity_keyframes = Object.keys(flattened_entity_keyframes);

    for (var i = 0; i < all_flattened_entity_keyframes.length; i++) {
      var local_keyframe = flattened_entity_keyframes[all_flattened_entity_keyframes[i]];

      if (local_keyframe.order == options.order) {
        return_keyframes.push(local_keyframe);
        return_keys.push(all_flattened_entity_keyframes[i]);
      }
    }

    //options.return_object handler
    if (options.return_object) {
      for (var i = 0; i < return_keyframes.length; i++)
        return_obj[return_keyframes[i]] = return_keyframes[i];
      //Return statement
      return return_obj;
    }

    //Return statement
    return (!options.return_key) ? return_keyframes : return_keys;
  }

  /*
    getEntityKeyframesCategory() - Fetches an entity keyframes category object/key.
    arg0_name: (String) - The name/ID of the entity keyframe category.
    arg1_options: (Object)
      return_key: (Boolean) - Optional. Whether or not to return the key. False by default.

    Returns: (Object/String)
  */
  function getEntityKeyframesCategory (arg0_name, arg1_options) {
    //Convert from parameters
    var name = arg0_name;
    var options = (arg1_options) ? arg1_options : {};

    //Guard clause for objects; direct keys
    if (typeof name == "object") return name;
    if (config.entity_keyframes[name]) return (!options.return_key) ? config.entity_keyframes[name] : name;

    //Declare local instance variables
    var all_entity_keyframes = Object.keys(config.entity_keyframes);
    var entity_keyframes_exists = [false, ""]; //[entity_keyframes_exists, entity_keyframes_key];
    var search_name = name.toLowerCase().trim();

    //ID search - soft search 1st, hard search 2nd
    {
      //Iterate over all_entity_keyframes
      for (var i = 0; i < all_entity_keyframes.length; i++)
        if (all_entity_keyframes[i].toLowerCase().includes(search_name))
          entity_keyframes_exists = [true, all_entity_keyframes[i]];
      for (var i = 0; i < all_entity_keyframes.length; i++)
        if (all_entity_keyframes[i].toLowerCase() == search_name)
          entity_keyframes_exists = [true, all_entity_keyframes[i]];
    }

    //Name search - soft search 1st, hard search 2nd
    {
      //Iterate over all_entity_keyframes
      for (var i = 0; i < all_entity_keyframes.length; i++) {
        var local_value = config.entity_keyframes[all_entity_keyframes[i]];

        if (local_value.name)
          if (local_value.name.toLowerCase().includes(search_name))
            entity_keyframes_exists = [true, all_entity_keyframes[i]];
      }
      for (var i = 0; i < all_entity_keyframes.length; i++) {
        var local_value = config.entity_keyframes[all_entity_keyframes[i]];

        if (local_value.name)
          if (local_value.name.toLowerCase() == search_name)
            entity_keyframes_exists = [true, all_entity_keyframes[i]];
      }
    }

    //Return statement
    if (entity_keyframes_exists[0])
      return (!options.return_key) ? config.entity_keyframes[entity_keyframes_exists[1]] : entity_keyframes_exists[1];
  }

  /*
    getEntityKeyframesInput() - Fetches the input object of a given entity keyframe within config .interface.
    arg0_keyframe_id: (String) - The keyframe ID to search for.
    arg1_input_id: (String) - The input ID to search for in terms of .id or input key.

    Returns: (Object)
  */
  function getEntityKeyframesInput (arg0_keyframe_id, arg1_input_id) {
    //Convert from parameters
    var keyframe_id = arg0_keyframe_id;
    var input_id = arg1_input_id;

    //Declare local instance variables
    var entity_keyframe = getEntityKeyframe(keyframe_id);

    if (entity_keyframe)
      //Iterate over .interface if it exists
      if (entity_keyframe.interface) {
        //Guard clause if citing direct key
        if (entity_keyframe.interface[input_id]) return entity_keyframe.interface[input_id];

        //Iterate over all_inputs
        var all_inputs = Object.keys(entity_keyframe.interface);

        for (var i = 0; i < all_inputs.length; i++) {
          var local_input = entity_keyframe.interface[all_inputs[i]];

          if (!Array.isArray(local_input) && typeof local_input == "object")
            if (local_input.id == input_id)
              //Return statement
              return local_input;
        }
      }
  }

  /*
    getEntityKeyframesLowestOrder() - Fetches the lowest .order from all config.entity_keyframes.

    Returns: (Number)
  */
  function getEntityKeyframesLowestOrder (arg0_options) {
    //Convert from parameters
    var options = (arg0_options) ? arg0_options : {};

    //Declare local instance variables
    var flattened_entity_keyframes = config.flattened_entity_keyframes;
    var min_order = Infinity;

    //Iterate over all_flattened_entity_keyframes
    var all_flattened_entity_keyframes = Object.keys(flattened_entity_keyframes);

    for (var i = 0; i < all_flattened_entity_keyframes.length; i++) {
      var local_keyframe = flattened_entity_keyframes[all_flattened_entity_keyframes[i]];

      if (local_keyframe.order != undefined)
        min_order = Math.min(min_order, local_keyframe.order);
    }

    //Return statement
    return min_order;
  }

  /*
    getEntityKeyframesNavigationObject() - Fetches the navigation object for entity keyframes; the initial context menu from lowest order.

    Returns: (Object)
  */
  function getEntityKeyframesNavigationObject () {
    //Declare local instance variables
    var flattened_entity_keyframes = config.flattened_entity_keyframes;
    var lowest_order = getEntityKeyframesLowestOrder(flattened_entity_keyframes);

    //Return statement
    return getEntityKeyframesAtOrder({ order: lowest_order })[0];
  }
}
