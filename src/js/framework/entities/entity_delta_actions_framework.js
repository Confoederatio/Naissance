//Initialise functions
{
  /*
    deleteEntity() - Deletes an entity.
    arg0_entity_id: (String) - The entity ID for the entity to delete.
  */
  function deleteEntity (arg0_entity_id, arg1_do_not_add_to_undo_redo) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var do_not_add_to_undo_redo = arg1_do_not_add_to_undo_redo;

    //Declare local instance variables
    var current_entity_class;
    var group_memberships = [];
    var old_entity_obj;

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
          if (local_group.entities[x] == entity_id) {
            group_memberships.push(all_groups[i]);
            local_group.entities.splice(x, 1);
          }
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
        old_entity_obj = serialiseEntity(main.entities[i]);

        main.entities[i].remove();
        main.entities.splice(i, 1);
      }

    //Refresh sidebar
    if (!do_not_add_to_undo_redo) {
      
      performAction({
        action_id: "delete_entity",
        redo_function: "deleteEntity",
        redo_function_parameters: [entity_id, true],
        undo_function: "undoDeleteEntity",
        undo_function_parameters: [old_entity_obj, group_memberships, true]
      });

      console.log(old_entity_obj);
    }
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
      renameEntity(entity_id, entity_name, date, true);

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
    var old_entity_name = (entity_obj.options.entity_name) ? 
      JSON.parse(JSON.stringify(entity_obj.options.entity_name)) : "Unnamed Entity";

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

  function undoDeleteEntity (arg0_old_entity_obj, arg1_group_memberships, arg2_do_not_reload) {
    //Convert from parameters
    var old_entity_obj = arg0_old_entity_obj;
    var group_memberships = arg1_group_memberships;
    var do_not_reload = arg2_do_not_reload;
    
    //Declare local instance variables
    var deserialised_entity_obj = deserialiseEntity(old_entity_obj);

    var deserialised_entity_id = deserialised_entity_obj.options.className;

    //Add entity back to its groups and to main.entities
    for (var i = 0; i < group_memberships.length; i++) {
      var local_group = main.groups[group_memberships[i]];

      if (!local_group.entities) local_group.entities = [];
      local_group.entities.push(deserialised_entity_id);
    }

    main.entities.push(deserialised_entity_obj);

    refreshHierarchy();
    loadDate();
  }
  
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
      deleteEntity(entity_id, true);
      clearBrush();
    }
  }
}