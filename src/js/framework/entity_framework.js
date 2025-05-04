//Entity core actions
{
  /*
    deleteEntity() - Deletes an entity.
    arg0_entity_id: (String) - The entity ID for the entity to delete.
  */
  function deleteEntity (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var current_entity_class;

    //Close popups relating to entity first
    closeEntityContextMenu(entity_id);

    //Delete entity now
    try {
      clearBrush();
    } catch (e) {
      console.warn(e);
    }

    //Remove entity from all groups
    var all_groups = Object.keys(main.groups);

    for (var i = 0; i < all_groups.length; i++) {
      var local_group = main.groups[all_groups[i]];

      //Splice from entities
      if (local_group.entities)
        for (var x = 0; x < local_group.entities.length; x++)
          if (local_group.entities[x] == entity_id)
            local_group.entities.splice(x, 1);
    }

    //Remove entity from all masks
    try {
      removeEntityMask(entity_id);
    } catch (e) {
      console.warn(e);
    }

    //Remove entity
    for (var i = 0; i < main.entities.length; i++)
      if (main.entities[i].options.className == entity_id) {
        main.entities[i].remove();
        main.entities.splice(i, 1);
      }

    //Refresh sidebar
    refreshHierarchy();
  }

  /*
    editEntity() - Edits an entity clientside.
    arg0_entity_id: (String) - The entity ID to edit.
  */
  function editEntity (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var brush_obj = main.brush;
    var entity_obj = getEntity(entity_id);

    //Close popups relating to entity first
    closeEntityContextMenu(entity_id);

    //finishEntity() if brush_obj.current_path has something in it
    try {
      if (brush_obj.current_path)
        finishEntity();
    } catch (e) {
      console.warn(e);
    }

    if (entity_obj) {
      brush_obj.editing_entity = entity_id;
      brush_obj.entity_options = entity_obj.options;

      //Set brush to this
      brush_obj.current_path = convertEntityCoordsToMaptalks(entity_obj);
      brush_obj.current_selection = entity_obj;

      //Set entityUI for current selected entity
      brush_obj.current_selection.on("click", function (e) {
        printEntityContextMenu(e.target.options.className);
      });
    }
  }

  /*
    hideEntity() - Hides an entity.
    arg0_entity_id: (String) - The entity ID to hide.
    arg1_date: (Object, Date) - Optional. The date at which to hide the entity. main.date by default.
    arg2_do_not_reload: (Boolean) - Optional. Whether to reload the entity interface. False by default.
  */
  function hideEntity (arg0_entity_id, arg1_date, arg2_do_not_reload, arg3_do_not_add_to_undo_redo) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var date = (arg1_date) ? arg1_date : main.date;
    var do_not_reload = arg2_do_not_reload;
    var do_not_add_to_undo_redo = arg3_do_not_add_to_undo_redo;
    //Declare local instance variables
    var entity_obj = getEntity(entity_id);

    if (entity_obj) {
      createHistoryFrame(entity_id, date, {
        extinct: true
      });

      if (!do_not_add_to_undo_redo) {
        try { printEntityBio(entity_id); } catch {}
        try { populateTimelineGraph(entity_id); } catch {}

        performAction({
          action_id: "hide_entity",
          redo_function: "hideEntity",
          redo_function_parameters: [entity_id, date, do_not_reload, true],
          undo_function: "showEntity",
          undo_function_parameters: [entity_id, date, do_not_reload, true]
        });
      }

      if (!do_not_reload)
        loadDate();
    }
  }

  /*
    renameEntity() - Renames an entity.
    arg0_entity_id: (String) - The entity ID for the entity which to rename.
    arg1_entity_name: (String) - What to rename the entity to.
    arg2_date: (Object, Date) - Optional. The date at which to rename the entity. main.date by default.
  */
  function renameEntity (arg0_entity_id, arg1_entity_name, arg2_date, arg3_do_not_add_to_undo_redo) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var entity_name = (arg1_entity_name) ? arg1_entity_name : `Unnamed Polity`;
    var date = (arg2_date) ? getTimestamp(arg2_date) : main.date;
    var do_not_add_to_undo_redo = arg3_do_not_add_to_undo_redo;

    //Declare local instance variables
    var entity_obj = (typeof entity_id != "object") ? getEntity(entity_id) : entity_id;
    var old_entity_name = JSON.parse(JSON.stringify(entity_obj.options.entity_name));

    if (entity_obj) {
      createHistoryFrame(entity_obj, date, { entity_name: entity_name });

      if (!do_not_add_to_undo_redo)
        performAction({
          action_id: "rename_entity",
          redo_function: "renameEntity",
          redo_function_parameters: [entity_id, JSON.parse(JSON.stringify(entity_name)), date, true],
          undo_function: "renameEntity",
          undo_function_parameters: [entity_id, old_entity_name, date, true]
        });
    }

    //Return statement
    return entity_name;
  }

  /*
    showEntity() - Shows an entity.
    arg0_entity_id: (String) - The entity ID to show.
    arg1_date: (Object, Date) - Optional. The date at which to hide the entity. main.date by default.
    arg2_do_not_reload: (Boolean) - Optional. Whether to reload the entity interface. False by default.
  */
  function showEntity (arg0_entity_id, arg1_date, arg2_do_not_reload, arg3_do_not_add_to_undo_redo) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var date = (arg1_date) ? arg1_date : main.date;
    var do_not_reload = arg2_do_not_reload;
    var do_not_add_to_undo_redo = arg3_do_not_add_to_undo_redo;

    //Declare local instance variables
    var entity_obj = getEntity(entity_id);

    if (entity_obj) {
      createHistoryFrame(entity_id, date, {
        extinct: false
      });

      if (!do_not_add_to_undo_redo) {
        try { printEntityBio(entity_id); } catch {}
        try { populateTimelineGraph(entity_id); } catch {}

        performAction({
          action_id: "show_entity",
          redo_function: "showEntity",
          redo_function_parameters: [entity_id, date, do_not_reload, true],
          undo_function: "hideEntity",
          undo_function_parameters: [entity_id, date, do_not_reload, true]
        });
      }

      if (!do_not_reload)
        loadDate();
    }
  }
}

//Entity functions - General-purpose, regardless of entity type
{
  function convertLeafletOptionsToMaptalks (arg0_options) {
    //Convert from parameters
    var options = (arg0_options) ? arg0_options : {};

    //Return statement
    return replaceKeys(options, {
      color: "lineColor",
      fillColor: "polygonFill",
      lineOpacity: "opacity",
      polygonOpacity: "fillOpacity",
      weight: "lineWidth"
    });
  }

  /**
   * finishEntity() - Finishes an entity's editing process.
   * @param {Object} [arg0_options]
   *  @param {boolean} [arg0_options.do_not_reload] - Optional. Whether to reload the current date.
   * 
   * @returns {String} - The entity ID of the newly created entity.
  **/
  function finishEntity (arg0_options, arg1_do_not_add_to_undo_redo) {
    //Convert from parameters
    var options = (arg0_options) ? arg0_options : {};
    var do_not_add_to_undo_redo = arg1_do_not_add_to_undo_redo;

    //Declare local instance variables
    var brush_obj = main.brush;
    var current_entity_history_obj = {};
    var current_entity_obj = getEntity(brush_obj.entity_options.className);
    var internal_options = JSON.parse(JSON.stringify({
      coords: convertToNaissance(brush_obj.current_path),
      entity_options: brush_obj.entity_options || {},
      selection_options: brush_obj.current_selection.options || {},
      selected_group_id: brush_obj.selected_group_id,
      do_not_reload: options.do_not_reload,
      entity_id: options.entity_id || (brush_obj.entity_options ? brush_obj.entity_options.className : undefined),
      current_path: brush_obj.current_path,
      date: main.date
    }));

    if (current_entity_obj)
      if (current_entity_obj.options)
        if (current_entity_obj.options.history)
          current_entity_history_obj = current_entity_obj.options.history;
    if (current_entity_history_obj)
      if (Object.keys(current_entity_history_obj).length <= 0)
        current_entity_history_obj = undefined;

    if (!do_not_add_to_undo_redo)
      performAction({
        action_id: "finish_entity",
        redo_function: "internalFinishEntity",
        redo_function_parameters: [internal_options, true],
        undo_function: "undoFinishEntity",
        undo_function_parameters: [internal_options.entity_id, current_entity_history_obj]
      });

    clearBrush();

    //Return statement
    return internalFinishEntity(internal_options);
  }

  /*
    generateEntityID() - Generates a random entity ID for use.

    Returns: (String)
  */
  function generateEntityID () {
    //While loop to find ID, just in-case of conflicting random ID's:
    while (true) {
      var id_taken = false;
      var local_id = generateRandomID();

      //Check to see if ID is taken in main.entities
      for (var i = 0; i < main.entities.length; i++) {
        var local_entity = main.entities[i];

        if (local_entity.options)
          if (local_entity.options.className)
            if (local_entity.options.className.includes(local_id))
              id_taken = true;
      }

      if (!id_taken) {
        return local_id;
        break;
      }
    }
  }

  /*
    getEntity() - Returns an entity object or [layer_key, index];
    arg0_entity_id: (String)
    arg1_options: (Object)
      return_is_new_entity: (Boolean) - Optional. Returns whether the current entity is a new entity or not. False by default.
      return_key: (Boolean) - Optional. Whether to return a [layer_key, index] instead of an object. False by default.

    Returns: (Object, Date/String)
  */
  function getEntity (arg0_entity_id, arg1_options) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local isntance variables
    var brush_obj = main.brush;
    var entity_obj;
    var is_new_entity;

    //Guard clause
    if (typeof entity_id == "object") return entity_id;

    //Iterate over all main.entities for .options.className
    for (var i = 0; i < main.entities.length; i++) {
      var local_entity = main.entities[i];

      if (local_entity.options)
        if (local_entity.options.className == entity_id)
          entity_obj = (!options.return_key) ? main.entities[i] : i;
    }

    //If entity_obj is undefined; check to make sure entity_id being fetched isn't just the current main.brush.current_selection
    if (brush_obj.entity_options)
      if (brush_obj.entity_options.className)
        if (!entity_obj) {
          is_new_entity = true;
          entity_obj = brush_obj.current_selection;
        }

    //Final is_new_entity check
    if (options.return_is_new_entity && !entity_obj)
      is_new_entity = true;

    //Return statement
    return (!options.return_is_new_entity) ? entity_obj : is_new_entity;
  }

  /*
    getEntityAbsoluteAge() - Fetches the absolute age of an entity; the distance between its first and last frames.
    arg0_entity_id: (String) - The entity ID for which to fetch the absolute age for.

    Returns: (Object, Date)
  */
  function getEntityAbsoluteAge (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var entity_obj = getEntity(entity_id);

    //Attempt to fetch distance between first and last keyframe to fetch its absolute age
    if (entity_obj)
      if (entity_obj.options)
        if (entity_obj.options.history)
          if (Object.keys(entity_obj.options.history).length > 0) {
            var all_history_frames = Object.keys(entity_obj.options.history);
            var first_history_frame = entity_obj.options.history[all_history_frames[0]];
            var last_history_frame = entity_obj.options.history[all_history_frames[all_history_frames.length - 1]];

            var age_timestamp = last_history_frame.id - first_history_frame.id;

            //Return statement
            return convertTimestampToDate(age_timestamp);
          }

    //Return statement if entity has no history
    return getBlankDate();
  }

  /*
    getEntityRelativeAge() - Fetches the relative age of an entity; the distance between its first frame and the current main.date.
    arg0_entity_id: (String) - The entity ID for which to fetch the relative age for.

    Returns: (Object, Date)
  */
  function getEntityRelativeAge (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var entity_obj = getEntity(entity_id);

    //Attempt to fetch distance between first keyframe and main.date to fetch its relative age
    if (entity_obj)
      if (entity_obj.options)
        if (entity_obj.options.history)
          if (Object.keys(entity_obj.options.history).length > 0) {
            var all_history_frames = Object.keys(entity_obj.options.history);
            var first_history_frame = entity_obj.options.history[all_history_frames[0]];

            var age_timestamp = convertTimestampToInt(getTimestamp(main.date)) - first_history_frame.id;

            //Return statement
            return convertTimestampToDate(age_timestamp);
          }

    //Return statement if entity has no history
    return getBlankDate();
  }

  /*
    getEntityName() - Fetches an entity name relative to the current date.
    arg0_entity_id: (String) - The entity ID for which to fetch the entity name for.
    arg1_date: (Object, Date) - Optional. The date relative to which to fetch the name for. main.date by default.

    Returns: (String)
  */
  function getEntityName (arg0_entity_id, arg1_date) {
    //Convert from parmateers
    var entity_id = arg0_entity_id;
    var date = arg1_date;

    //Declare local instance variables
    var brush_obj = main.brush;
    var entity_name;
    var entity_obj = (typeof entity_id != "object") ? getEntity(entity_id) : entity_id;

    //Check if this is an actual entity object or a new selection
    if (entity_obj) {
      var first_history_frame = getFirstHistoryFrame(entity_obj);
      var history_frame = getHistoryFrame(entity_obj, date);

      if (history_frame.options)
        if (history_frame.options.entity_name)
          entity_name = history_frame.options.entity_name;
      if (!entity_name)
        if (first_history_frame.options)
          if (first_history_frame.options.entity_name)
            entity_name = first_history_frame.options.entity_name;


      if (!entity_name)
        if (brush_obj.current_path)
          if (entity_obj.options.className == entity_id)
            entity_name = entity_obj.options.entity_name;
    }

    //Return statement
    return (entity_name) ? entity_name : "Unnamed Polity";
  }

  function internalFinishEntity (arg0_options) {
    //Convert from parameters
    var options = (arg0_options) ? arg0_options : {};

    //Declare local instance variables
    var coords = options.coords;
    var current_path = options.current_path;
    var date = options.date;
    var entity_id = options.entity_id;
    var entity_options = (options.entity_options) ? options.entity_options : {};
    var selected_group_id = options.selected_group_id;
    var selection_options = (options.selection_options) ? options.selection_options : {};

    var is_new_entity = getEntity(entity_id, { return_is_new_entity: true });
    var new_entity = {
      options: {
        ...selection_options,
        type: selection_options.type || "polity"
      }
    };

    createHistoryFrame(new_entity, date, {}, coords);
    var entity_name = selection_options.entity_name || "Unnamed Polity";

    if (is_new_entity) {
      var new_entity_obj = createPolygon(current_path, new_entity.options);
      main.entities.push(new_entity_obj);
      renameEntity(entity_id, entity_name, date);

      if (selected_group_id) {
        var group_obj = getGroup("hierarchy", selected_group_id);
        group_obj.entities = group_obj.entities || [];
        group_obj.entities.push(entity_id);
      }
    } else if (entity_options.className) {
      var entity_obj = getEntity(entity_options.className);
      entity_obj.options = new_entity.options;
    }

    if (!options.do_not_reload) {
      clearBrush();
      loadDate();
    }

    //Return statement
    return entity_id;
  }

  /*
    isEntityBeingEdited() - Checks whether the entity is currently being edited.
    arg0_entity_id: (String) - The entity ID to check for.

    Returns: (Boolean)
  */
  function isEntityBeingEdited (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var brush_obj = main.brush;

    //Return statement
    if (brush_obj.editing_entity == entity_id) return true;
    if (brush_obj.entity_options)
      if (brush_obj.entity_options.className == entity_id) return true;
  }

  /*
    isEntityHidden() - Checks whether an entity is currently hidden.
    arg0_entity_id: (String) - The entity ID to check for.
    arg1_date: (Object, Date) - Optional. The date at which to check if an entity is hidden.

    Returns: (Boolean)
  */
  function isEntityHidden (arg0_entity_id, arg1_date) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var date = arg1_date;

    //Check if date is before first history frame
    var first_history_frame = getFirstHistoryFrame(entity_id);

    if (first_history_frame)
      if (first_history_frame.id > convertTimestampToInt(getTimestamp(main.date)))
        return true;

    //Return statement
    return entityHistoryHasProperty(entity_id, date, function (local_history) {
      var is_extinct;

      if (local_history.options)
        if (local_history.options.extinct) {
          is_extinct = local_history.options.extinct;
        } else if (local_history.options.extinct == false) {
          is_extinct = false;
        }

      return is_extinct;
    });
  }

  /*
    isEntityVisible() - Checks whether an entity should currently be visible; for both .minimum_zoom_level, .maximum_zoom_level and isEntityHidden().
    arg0_entity_id: (String) - The entity ID to check for.
    arg1_date: (Object, Date) - Optional. The date at which to check if an entity is hidden. main.date by default.

    Returns: (Boolean)
  */
  function isEntityVisible (arg0_entity_id, arg1_date) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var date = (arg1_date) ? arg1_date : main.date;

    //Guard clause if entity is hidden
    if (isEntityHidden(entity_id, date)) return false;

    //Declare local instance variables
    var current_history = getHistoryFrame(entity_id, date);
    var entity_obj = getEntity(entity_id);
    var zoom_level = map.getZoom();

    var entity_maximum_zoom = (current_history.options.maximum_zoom_level) ? current_history.options.maximum_zoom_level : 1000;
    var entity_minimum_zoom = (current_history.options.minimum_zoom_level) ? current_history.options.minimum_zoom_level : 0;

    //Guard clause; return false if current zoom requirements are not met
    if (zoom_level < entity_minimum_zoom || zoom_level > entity_maximum_zoom) return false;

    //Return statement
    return true;
  }

  /*
    refreshEntityActions() - Refreshes the visible Entity Action navigation menu.
    arg0_entity_id: (String) - The entity ID to refresh Entity Actions for.
  */
  function refreshEntityActions (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var entity_obj = getEntity(entity_id);
    var entity_el = getEntityElement(entity_id);

    //Check if entity_el exists
    if (!entity_el)
      printEntityContextMenu(entity_id, {
        coords: entity_obj.getBounds().getCenter(),
        is_being_edited: isEntityBeingEdited(entity_id)
      });
    setTimeout(function(){
      var entity_actions_el = getEntityActionsAnchorElement(entity_id);
      var entity_actions_ui = printEntityActionsNavigationMenu(entity_id, entity_actions_el);
    }, 1);
  }

  function reloadEntitiesArray () {
    //Run a simple call to loadDate().
    loadDate(undefined, { reload_map: true });
  }

  /*
    reloadEntityInArray() - Reloads a given entity in an array when rendering. Returns the source array.
    arg0_array: (Array<Object>) - The array containing the entity objects to reload.
    arg1_entity_id: (String) - The entity ID which to reload.

    Returns: (Array<Object>)
  */
  function reloadEntityInArray (arg0_array, arg1_entity_id) {
    //Convert from parameters
    var array = getList(arg0_array);
    var entity_id = arg1_entity_id;

    //Declare local instance variables
    var entity_obj = (typeof entity_id != "object") ?
      getEntity(entity_id) : entity_id;

    if (entity_obj)
      entity_id = entity_obj.options.className;

    //Iterate over array
    for (var i = 0; i < array.length; i++)
      if (array[i]) {
        if (array[i].options) {
          var local_id = array[i].options.className;

          if (local_id == entity_id && !array[i].selection) {
            array[i].removeFrom(map);
            array[i] = entity_obj;
          }
        }
      } else {
        console.log(array);
      }

    //Return statement
    return array;
  }

  /*
    selectMultipleKeyframes() - Opens the selection menu for multiple keyframes.
    arg0_entity_id: (String)
    arg1_options: (Object)
      assign_key: (String) - Optional. The key to assign this to. 'selected_keyframes' by default.
      close_selection: (Boolean) - Optional. Whether to close the selection. False by default.
  */
  function selectMultipleKeyframes (arg0_entity_id, arg1_options) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var options = (arg1_options) ? arg1_options : {};

    //Initialise options
    if (!options.assign_key) options.assign_key = "selected_keyframes";

    //Declare local instance variables
    var common_selectors = config.defines.common.selectors;
    var entity_el = getEntityElement(entity_id);
    var entity_obj = getEntity(entity_id);

    var bio_container_el = entity_el.querySelector(common_selectors.entity_bio_container);
    var is_select_multiple_keyframes_open = false;
    var select_all_checkbox_el = entity_el.querySelector(`[id="select-all-${entity_id}"]`);

    //Check if selection should be closed or not first
    if (bio_container_el && !options.close_selection) {
      //Make sure selecting multiple keyframes isn't already open
      if (!select_all_checkbox_el) {
        //Make sure bio_container_el exists in the first place before appending a checkbox to each keyframe; create a 'Select All' button at top.
        var bio_entries = bio_container_el.querySelectorAll(common_selectors.entity_bio_entries_dates);
        var bio_top_header_el = bio_container_el.querySelector(common_selectors.entity_bio_header);
        var select_all_el = document.createElement("span");

        select_all_el.innerHTML = `Select All: <input type = "checkbox" id = "select-all-${entity_id}">`;
        bio_top_header_el.prepend(select_all_el);
        entity_obj.options.selected_keyframes_key = options.assign_key;

        //Add select_all_el onclick event listener
        select_all_el.onclick = function (e) {
          var all_checkbox_els = bio_container_el.querySelectorAll(`${common_selectors.entity_bio_entries_dates} input[type="checkbox"]`);

          //Check if select_all_el.checked is true; uncheck all if not
          entity_obj.options.selected_keyframes = [];

          //Iterate over all_checkbox_els and set them to the select_all_el .checked value; update selected timestamps
          for (var i = 0; i < all_checkbox_els.length; i++)
            all_checkbox_els[i].checked = e.target.checked;
          if (e.target.checked)
            for (var i = 0; i < all_checkbox_els.length; i++)
              entity_obj.options.selected_keyframes.push(all_checkbox_els[i].getAttribute("timestamp"));
        };

        //Iterate over each bio entry and assign each a checkbox
        for (var i = 0; i < bio_entries.length; i++) {
          var local_checkbox_el = document.createElement("input");
          var local_parent_el = bio_entries[i].parentElement;
          var local_timestamp = local_parent_el.getAttribute("timestamp");

          //Create local_checkbox_el and prepend it to the current bio_entries[i]
          local_checkbox_el.setAttribute("type", "checkbox");
          local_checkbox_el.setAttribute("timestamp", local_timestamp);

          if (entity_obj.options.selected_keyframes.includes(local_timestamp))
            local_checkbox_el.checked = true;
          bio_entries[i].prepend(local_checkbox_el);

          //Add local_checkbox_el onclick event istener
          local_checkbox_el.onclick = function (e) {
            var actual_timestamp = e.target.getAttribute("timestamp");

            if (e.target.checked) {
              if (!entity_obj.options.selected_keyframes.includes(actual_timestamp))
                entity_obj.options.selected_keyframes.push(actual_timestamp);
            } else {
              for (var i = 0; i < entity_obj.options.selected_keyframes.length; i++)
                if (entity_obj.options.selected_keyframes[i] == actual_timestamp)
                  entity_obj.options.selected_keyframes.splice(i, 1);
            }
          };
        }
      }
    } else {
      if (select_all_checkbox_el) {
        //Close multi-keyframe selection
        var bio_entries = bio_container_el.querySelectorAll(common_selectors.entity_bio_entries_dates);
        var bio_top_header_el = bio_container_el.querySelectorAll(common_selectors.entity_bio_header);

        //Remove select_all_el at top header; entity_obj.options.selected_keyframes_key
        try { bio_top_header_el.querySelector(`span:first-child`).remove(); } catch {}
        delete entity_obj.options.selected_keyframes;

        //Iterate over all bio_entries and remove the local_checkbox_el
        for (var i = 0; i < bio_entries.length; i++) {
          var local_checkbox_el = bio_entries[i].querySelector(`input[type="checkbox"]`);
          if (local_checkbox_el) local_checkbox_el.remove();
        }
      }
    }
  }

  /*
    setEntityCoords() - Sets current entity coords.
    arg0_entity_id: (String) - The entity ID to set coords for.
    arg1_coords: (Array<Array<Number, Number>>) - The coords to set.
    arg2_date: (Object, Date) - Optional. The date to set coords at.
  */
  function setEntityCoords (arg0_entity_id, arg1_coords, arg2_date) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var coords = arg1_coords;
    var date = (arg2_date) ? arg2_date : main.date;

    //Set coords
    if (coords) {
      var entity_obj = getEntity(entity_id);

      if (isEntityHidden(entity_id, date) && coords != undefined)
        showEntity(entity_id);
      createHistoryFrame(entity_id, date, {}, coords);
    } else {
      hideEntity(entity_id, date);
    }
  }

  /*
    setEntityNameFromInput() - Sets the current entity name from a given input element.
    arg0_entity_id: (String) - The entity ID which to set the entity name for.
    arg1_element: (HTMLElement) - The HTML element representing the input for the given name.

    Returns: (String)
  */
  function setEntityNameFromInput (arg0_entity_id, arg1_element) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var element = arg1_element;

    //Declare local instance variables
    var entity_name;
    var entity_obj = (typeof entity_id != "object") ? getEntity(entity_id) : entity_id;

    if (element && entity_obj) {
      var is_unnamed_entity = false;

      if (!element.value || element.value == "Unnamed Polity")
        is_unnamed_entity = true;

      entity_name = (is_unnamed_entity) ? `Unnamed Polity` : element.value;
      createHistoryFrame(entity_obj, main.date, { entity_name: entity_name });
    }

    //Return statement
    return entity_name;
  }

  //[WIP] - Finish function body
  function undoFinishEntity (arg0_entity_id, arg1_old_history_obj) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var old_history_obj = arg1_old_history_obj;

    if (old_history_obj) {
      var entity_obj = getEntity(entity_id);
      entity_obj.options.history = old_history_obj;

      loadDate();
      clearBrush();
    } else {
      deleteEntity(entity_id);
      clearBrush();
    }
  }

  /*
    updateEntityVisibility() - Updates an entity's visibility on the map based on hidden/zoom levels, or other attributes.
    arg0_entity_id: (String) - The entity ID to update.
    arg1_date: (Object, Date) - Optional. TRhe date at which to check for if an entity is hidden. main.date by default.
  */
  function updateEntityVisibility (arg0_entity_id, arg1_date) { //[WIP] - Finish function body
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var date = (arg1_date) ? arg1_date : main.date;

    //Declare local instance variables
    var entity_obj = getEntity(entity_id);
    var is_entity_actually_visible = true;
    var is_entity_visible = isEntityVisible(entity_id, date); //Whether the entity should be visible

    //Check if entity is actually visible
    if (entity_obj)
      if (!entity_obj.isVisible()) is_entity_actually_visible = false;

    //Update entity visibility
    if (!is_entity_actually_visible)
      if (is_entity_visible)
        entity_obj.show();
    if (is_entity_actually_visible)
      if (!is_entity_visible)
        entity_obj.hide();
  }
}

//Polity functions - For polygons only
{
  /*
    getPolityArea() - Fetches the total area of a given polity in square metres.
    arg0_entity_id: (String) - The entity ID for which to fetch the total area.
    arg1_date: (Object, Date) - The date for which to fetch the entity area.

    Returns: (Number)
  */
  function getPolityArea (arg0_entity_id, arg1_date) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var date = arg1_date;

    //Declare local instance variables
    var entity_area = 0;
    var entity_obj = getEntity(entity_id);

    //Check to make sure entity_obj exists
    if (entity_obj) {
      var is_extinct = isEntityHidden(entity_id, date);
      var last_coords = getEntityCoords(entity_id, date);

      if (last_coords)
        try {
          var local_coordinates = getTurfObject(last_coords);

          entity_area = (!is_extinct) ? turf.area(local_coordinates) : 0;
        } catch (e) {
          console.log(e);
          entity_area = 0;
        }
    }

    //Return statement
    return entity_area;
  }
}
