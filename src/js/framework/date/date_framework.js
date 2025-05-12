//Global Date Strings
var date_error_field = document.getElementById("date-error");
var day_field = document.getElementById("day-input");
var month_field = document.getElementById("month-input");
var year_field = document.getElementById("year-input");
var year_type_field = document.getElementById("year-type");

var hour_field = document.getElementById("hour-input");
var minute_field = document.getElementById("minute-input");

window.date_fields = [day_field, month_field, year_field, hour_field, minute_field];

//Date load functions
{
  function loadDate (arg0_old_date, arg1_options) {
    //Convert from parameters
    var old_date = arg0_old_date;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var brush_obj = main.brush;

    //Clear map first before rendering entities
    clearMap();
    renderAllPolities(); //Used to ensure that polities are rendered in the correct order

    //Iterate over all entities and render them
    for (let i = 0; i < main.entities.length; i++) {
      let local_entity = main.entities[i];
      let local_entity_id = local_entity.options.className;
      let local_history = getAbsoluteHistoryFrame(local_entity_id, main.date);

      //Reload object; add to map
      if (brush_obj.editing_entity != local_entity_id || !options.reload_map)
        if (local_history) {
        //Update UIs for each open popup
        let local_popup = document.querySelector(`.leaflet-popup[class~="${local_entity_id}"]`);

        if (local_popup) {
          let name_field = local_popup.querySelector(`input#polity-name`);

          name_field.value = getEntityName(local_entity_id);
        }

        //Run through each options type
        if (local_entity.options.type == "polity") {
          //Make sure polity is not extinct
          if (!isEntityHidden(local_entity_id, main.date)) {
            let local_history_frame = getHistoryFrame(local_entity, main.date);
            let local_options = JSON.parse(JSON.stringify(local_entity.options));

            //Overwrite local_options with local_history_options
            let all_local_history_options = Object.keys(local_history_frame.options);

            for (let x = 0; x < all_local_history_options.length; x++)
              local_options[all_local_history_options[x]] = local_history_frame.options[all_local_history_options[x]];

            //Refresh main.entities[i]; add to current main.entity_layer
            local_options.do_not_display = true;
            main.entities[i] = createPolygon(local_history_frame.coords, local_options);

            try {
              delete local_options.do_not_display;
              main.entities[i].addTo(main.entity_layer);
              main.entities[i].addEventListener("mouseup", function (e) {
                if (main.events.left_mouse)
                  printEntityContextMenu(e.target.options.className, { coords: e.coordinate, is_being_edited: false, pin: true });
              });
            } catch (e) {
              console.error(`Ran into error!`, e, JSON.stringify(local_history_frame.coords));
            }

            //If this is the current selected polity, re-add cursor
            if (!options.reload_map)
              if (brush_obj.editing_entity == local_entity_id)
                clearBrush();
          }
        }
      }
    }

    //Update Left Sidebar
    autoFillDate();
    if (!options.reload_map)
      refreshHierarchy();
  }

  /**
   * setDate() - Sets the current date and reloads the map where necessary.
   * @param {Object} arg0_date - The date to set.
   * 
   * @returns {Object}
   */
  function setDate (arg0_date, arg1_do_not_add_to_undo_redo) {
    //Convert from parameters 
    var date_obj = convertTimestampToDate(arg0_date);
    var do_not_add_to_undo_redo = arg1_do_not_add_to_undo_redo;

    //Declare local instance variables
    var old_date_obj = JSON.parse(JSON.stringify(main.date));

    //Set main.date
    main.date = date_obj;

    //Reload map
    loadDate();

    //Log action
    if (!do_not_add_to_undo_redo)
      performAction({
        action_id: "change_date",
        redo_function: "setDate",
        redo_function_parameters: [date_obj, true],
        undo_function: "setDate",
        undo_function_parameters: [old_date_obj, true]
      });

    //Return statement
    return date_obj;
  }
}
