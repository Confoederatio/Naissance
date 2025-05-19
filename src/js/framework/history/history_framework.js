//Initialise history frame functions
{
  function createHistoryFrame (arg0_entity_id, arg1_date, arg2_options, arg3_coords) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var date = arg1_date;
    var options = arg2_options;
    var coords = arg3_coords;

    //Declare local instance variables
    var date_string = getTimestamp(date);
    var entity_key = getEntity(entity_id, { return_key: true });
    var hierarchy_obj = main.hierarchies.hierarchy;
    var old_history_entry = getAbsoluteHistoryFrame(entity_id, date);

    var entity_obj = (typeof entity_id != "object") ?
      main.entities[entity_key] : entity_id;

    if (entity_obj) {
      //Make sure history object is initailised
      if (!entity_obj.options.history) entity_obj.options.history = {};

      //Fetch actual coords
      var actual_coords = coords;

      if (!actual_coords)
        actual_coords = (old_history_entry) ?
          old_history_entry.coords :
          convertMaptalksCoordsToTurf(entity_obj)[0];

      //Create new history object
      if (!entity_obj.options.history[date_string])
        entity_obj.options.history[date_string] = {
          id: convertTimestampToInt(date_string),

          coords: actual_coords,
          options: {}
        };

      //Manually transcribe options to avoid recursion
      var all_option_keys = Object.keys(options);
      var local_history = entity_obj.options.history[date_string];

      local_history.coords = actual_coords;
      if (!local_history.options) local_history.options;

      for (var i = 0; i < all_option_keys.length; i++)
        if (!["history", "type"].includes(all_option_keys[i]))
          local_history.options[all_option_keys[i]] = options[all_option_keys[i]];

      //Delete local_history if it's the same as old_history_entry
      if (old_history_entry)
        if (
          JSON.stringify(old_history_entry.coords) == JSON.stringify(local_history.coords) && JSON.stringify(old_history_entry.options) == JSON.stringify(local_history.options) &&
          old_history_entry.id != local_history.id
        )
          delete entity_obj.options.history[date_string];

      //Delete local_history.options if not needed
      if (!local_history.options)
        delete local_history.options;

      //Fix entity_obj history order
      entity_obj.options.history = sortObject(entity_obj.options.history, "numeric_ascending");
    }
  }

  function deleteHistoryFrame (arg0_entity_id, arg1_date) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var entry_date = arg1_date;

    //Declare local instance variables
    var context_menu_el = document.getElementById(`entity-ui-context-menu-${entity_id}`);
    var entity_obj = getEntity(entity_id);
    var history_key = getAbsoluteHistoryFrame(entity_id, entry_date, { return_key: true });
    var popup_el = document.querySelector(`.leaflet-popup[class~='${entity_id}']`);

    //Delete polity history if it exists
    if (entity_obj.options.history)
      if (history_key) {
        delete entity_obj.options.history[history_key];

        if (context_menu_el) {
          popup_el.after(context_menu_el);
          closeKeyframeContextMenu(entity_id);

          printEntityBio(entity_id);
        }

        //Delete entity if no history entries are left
        if (Object.keys(entity_obj.options.history).length == 0)
          deleteEntity(entity_id, true);
      }
  }

  function editHistoryFrame (arg0_entity_id, arg1_date) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var entry_date = arg1_date;

    //Change date to entry_date
    date = entry_date;

    //Edit entity
    editEntity(entity_id);
  }

  /*
    entityHistoryHasProperty() - Checks whether an entity's history matches a given conditional function.
    arg0_entity_id: (String) - The entity ID for which to check if entity history matches.
    arg1_date: (Object, Date) - Optional. The ending timestamp prior to which to check the conditional_function for. main.date by default.
    arg2_conditional_function: (Function) - The conditional function which to run a check on every keyframe in an entity object for. Must return a Boolean.

    Returns: (Boolean)
  */
  function entityHistoryHasProperty (arg0_entity_id, arg1_date, arg2_conditional_function) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var date = arg1_date;
    var conditional_function = arg2_conditional_function;

    //Declare local instance variables
    var ending_timestamp = (date) ? getTimestamp(date) : getTimestamp(main.date);
    var entity_obj = (typeof entity_id != "object") ? getEntity(entity_id) : entity_id;
    var has_property;

    if (entity_obj)
      if (entity_obj.options)
        if (entity_obj.options.history) {
          var all_history_entries = Object.keys(entity_obj.options.history);

          for (var i = 0; i < all_history_entries.length; i++) {
            var local_history = entity_obj.options.history[all_history_entries[i]];

            if (parseInt(local_history.id) <= convertTimestampToInt(ending_timestamp))
              has_property = conditional_function(local_history);
          }
        }

    //Return statement
    return has_property;
  }

  /*
    getEntityProperty() - Fetches the current value of an entity property (or key value) relative to the current date. For example, this can be used to fetch the last .entity_name.
    arg0_entity_id: (String) - The entity ID for which to return the relevant key value for.
    arg1_date: (Object, Date) - Optional. The date relative to which to fetch the last keyframed property entry for. main.date by default.
    arg2_property: (String) - The key string which to return the property for.

    Returns: (Variable)
  */
  function getEntityProperty (arg0_entity_id, arg1_date, arg2_property, arg3_options) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var date = (arg1_date) ? arg1_date : main.date;
    var property = arg2_property;
    var options = (arg3_options) ? arg3_options : {};

    //Declare local instance variables
    var ending_timestamp = convertTimestampToInt(getTimestamp(date));
    var entity_value;
    var entity_obj = (typeof entity_id != "object") ? getEntity(entity_id) : entity_id;

    if (entity_obj) {
      if (entity_obj.options)
        if (entity_obj.options.history) {
          var all_history_entries = Object.keys(entity_obj.options.history);

          for (var i = 0; i < all_history_entries.length; i++) {
            var local_history = entity_obj.options.history[all_history_entries[i]];

            if (!options.is_non_inclusive) {
              if (parseInt(local_history.id) <= ending_timestamp)
                if (local_history.options)
                  if (local_history.options[property])
                    entity_value = local_history.options[property];
            } else {
              if (parseInt(local_history.id) < ending_timestamp)
                if (local_history.options)
                  if (local_history.options[property])
                    entity_value = local_history.options[property];
            }
          }

          if (!entity_value)
            entity_value = entity_obj.options[property];
        }

      //Return statement
      return entity_value;
    }
  }

  /*
    getFirstHistoryFrame() - Returns the first history frame of a given entity object.
    arg0_entity_id: (String) - The entity ID for which to return the first history frame.

    Returns: (Object)
  */
  function getFirstHistoryFrame (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var entity_obj = (typeof entity_id != "object") ? getEntity(entity_id) : entity_id;

    //If entity_obj exists, check options.history for first date
    if (entity_obj)
      if (entity_obj.options)
        if (entity_obj.options.history) {
          var all_history_frames = Object.keys(entity_obj.options.history);
          var history_frame = {
            id: convertTimestampToInt(getTimestamp(main.date)),
            coords: [],
            options: {}
          };

          if (all_history_frames.length >= 1) {
            var first_history_frame = entity_obj.options.history[all_history_frames[0]];

            history_frame.id = first_history_frame.id;
            history_frame.is_founding = true;
            if (first_history_frame.coords)
              history_frame.coords = first_history_frame.coords;
            if (first_history_frame.options)
              history_frame.options = mergeObjects(history_frame.options, first_history_frame.options, "override");
          }

          //Return statement
          return history_frame;
        }
  }

  /*
    getAbsoluteHistoryFrame() - Returns the most recent absolute history frame for an entity.

    arg0_entity_id: (String) - The enity ID for which to fetch the last history frame.
    arg1_date: (Object, Date) - Optional. The date relative to which to fetch the last history frame.
    arg2_options: (Object)
      return_key: (Boolean) - Whether to return the key instead of the object. False by default
  */
  function getAbsoluteHistoryFrame (arg0_entity_id, arg1_date, arg2_options) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var entry_date = arg1_date;
    var options = (arg2_options) ? arg2_options : {};

    //Declare local instance variables
    var entity_obj = (typeof entity_id != "object") ? getEntity(entity_id) : entity_id;
    var entry_timestamp = getTimestamp(arg1_date);

    //Check that entity_obj actually exists
    if (entity_obj)
      if (entity_obj.options.history) {
        var all_entity_histories = Object.keys(entity_obj.options.history);
        var current_entry = undefined;

        for (var i = 0; i < all_entity_histories.length; i++)
          if (convertTimestampToInt(entry_timestamp) >= convertTimestampToInt(all_entity_histories[i]))
            current_entry = (!options.return_key) ? entity_obj.options.history[all_entity_histories[i]] : all_entity_histories[i];
      }

    //Return statement
    return current_entry;
  }

  /*
    getHistoryFrame() - Returns the most recent relative history frame for an entity.
    arg0_entity_id: (String) - The entity ID for which to fetch the relevant history frame.
    arg1_date: (Object, Date) - Optional. The date relative to which to fetch all last keyframed property entries for. main.date by default.

    Returns: (Object)
      is_founding: (Boolean), - Whether this frame is the founding frame

      id: (String), - The current history timestamp
      coords: (Array<Array<Number, Number>>), - An array of Naissance coords representing the poly
      options: (Object) - A list of customisation options
  */
  function getHistoryFrame (arg0_entity_id, arg1_date) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var date = (arg1_date) ? arg1_date : main.date;

    //Declare local instance variables
    var entity_obj = (typeof entity_id != "object") ? getEntity(entity_id) : entity_id;
    var history_frame = {
      coords: [],
      options: {}
    };
    var current_timestamp = convertTimestampToInt(getTimestamp(date));

    var all_history_frames = Object.keys(entity_obj.options.history);

    //Iterate over all_history_frames
    for (var i = 0; i < all_history_frames.length; i++)
      if (convertTimestampToInt(all_history_frames[i]) <= current_timestamp) {
        var local_history_frame = entity_obj.options.history[all_history_frames[i]];

        //is_founding handler
        if (i == 0) {
          history_frame.is_founding = true;
        } else {
          delete history_frame.is_founding;
        }

        //Other data structures
        history_frame.id = local_history_frame.id;
        if (local_history_frame.coords)
          history_frame.coords = local_history_frame.coords;
        if (local_history_frame.options)
          history_frame.options = mergeObjects(history_frame.options, local_history_frame.options, "override");
      } else {
        break; //Break once past timestamp, no point in continuing on
      }

    //Return statement
    return history_frame;
  }

  /*
    isSameHistoryFrame() - Checks whether two entity history frames are identical.
    arg0_history_frame: (Object) - The 1st history frame to compare.
    arg1_history_frame: (Object) - The 2nd history frame to compare.

    Returns: (Boolean)
  */
  function isSameHistoryFrame (arg0_history_frame, arg1_history_frame) {
    //Convert from parameters
    var history_frame = arg0_history_frame;
    var ot_history_frame = arg1_history_frame;

    //Return statement
    return (
      JSON.stringify(history_frame.coords) == JSON.stringify(ot_history_frame.coords) &&
      JSON.stringify(history_frame.options) && JSON.stringify(ot_history_frame.options));
  }
}

//Entity history frame property handling
{
  /*
    getEntityCoords() - Fetches an entity's current coordinates.
    arg0_entity_id: (String) - The entity ID for which to fetch the coordinates for.
    arg1_date: (Object, Date) - Optional. The date relative to which to fetch current .coords.
    arg2_options: (Object)
      is_non_inclusive: (Boolean) - Optional. Whether to include the end timestamp when searching for entity coords or not. False by default.

    Returns: (Array<Array<Number, Number>>)
  */
  function getEntityCoords (arg0_entity_id, arg1_date, arg2_options) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var date = (arg1_date) ? arg1_date : main.date;
    var options = (arg2_options) ? arg2_options : {};

    //Guard clause if entity is hidden
    if (isEntityHidden(entity_id)) return undefined;

    //Declare local instance variables
    var entity_obj = (typeof entity_id != "object") ? getEntity(entity_id) : entity_id;

    //Return statement
    return entityHistoryHasProperty(entity_obj, date, function (local_history) {
      if (local_history.coords)
        return local_history.coords;
    }, options);
  }
}
