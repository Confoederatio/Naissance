//Initialise functions
{
  function getColourFromFields (arg0_colour_el) {
    //Convert from parameters
    var colour_el = arg0_colour_el;

    //Declare local instance variables
    var b_el = colour_el.querySelector(`input#b`);
    var g_el = colour_el.querySelector(`input#g`);
    var r_el = colour_el.querySelector(`input#r`);

    //Return statement
    return [parseInt(r_el.value), parseInt(g_el.value), parseInt(b_el.value)];
  }

  /*
    getDateFromFields() - Fetches a date object from input fields.
    arg0_date_container_el: (HTMLElement) - The container for all the date fields.

    Returns: (Object, Date)
  */
  function getDateFromFields (arg0_date_container_el) {
    //Convert from parameters
    var date_container_el = arg0_date_container_el;

    //Declare local instance variables
    var day_el = date_container_el.querySelector(`#day-input`);
    var hour_el = date_container_el.querySelector(`#hour-input`);
    var minute_el = date_container_el.querySelector(`#minute-input`);
    var month_el = date_container_el.querySelector(`#month-input`);
    var year_el = date_container_el.querySelector(`#year-input`);
    var year_type_el = date_container_el.querySelector(`#year-type`);

    //Declare local instance variables
    var new_date = {};

    //Check if year is valid
    if (!isNaN(year_el.value))
      if (year_el.value > 0) {
        new_date.year = (year_type_el.value == "AD") ?
          parseInt(year_el.value) :
          parseInt(year_el.value)*-1;
      } else if (year_el.value == 0) {
        //Assume this means AD 1
        year_el.value = 1;
      } else {
        new_date.year = year_el.value;
        year_type_el.value = (year_type_el.value == "AD") ? "BC" : "AD";
      }

    //Set month; day; hour; minute
    new_date.month = getMonth(month_el.value); //[WIP] - This is flawed
    new_date.day = parseInt(day_el.value);

    var hour_value = returnSafeNumber(parseInt(hour_el.value));
    var minute_value = returnSafeNumber(parseInt(minute_el.value));

    //Set min, max bounds
    if (hour_value < 0) hour_value = 0;
    if (hour_value > 23) hour_value = 23;
    if (minute_value < 0) minute_value = 0;
    if (minute_value > 59) minute_value = 59;

    //New Year's exception (change to 00:01 if date is January 1)
    if (new_date.month == 1 && new_date.day == 1)
      if (hour_value == 0 && minute_value == 0)
        minute_value = 1;

    new_date.hour = hour_value;
    new_date.minute = minute_value;

    month_el.value = (!isNaN(new_date.month)) ? months[new_date.month - 1] : "January";
    day_el.value = new_date.day;
    hour_el.value = `${(new_date.hour < 10) ? "0" : ""}${new_date.hour}`;
    minute_el.value = `${(new_date.minute < 10) ? "0" : ""}${new_date.minute}`;

    //Return statement
    return new_date;
  }

  /*
    getDateLengthFromFields() - Fetchesa date object from input fields, representing a length of time.
    arg0_date_range_container_el: (HTMLElement) - The container for all the date length fields.

    Returns: (Object, Date)
  */
  function getDateLengthFromFields (arg0_date_range_container_el) {
    //Convert from parameters
    var date_range_container_el = arg0_date_range_container_el;

    //Declare local instance variables
    var day_el = date_range_container_el.querySelector(`#days-input`);
    var hour_el = date_range_container_el.querySelector(`#hours-input`);
    var minute_el = date_range_container_el.querySelector(`#minutes-input`);
    var month_el = date_range_container_el.querySelector(`#months-input`);
    var year_el = date_range_container_el.querySelector(`#years-input`);

    //Declare local instance variables
    var local_date = {
      year: parseInt(year_el.value),
      month: parseInt(month_el.value),
      day: parseInt(month_el.value),

      hour: parseInt(month_el.value),
      minute: parseInt(month_el.value)
    };

    //Return statement
    return convertTimestampToDate(getTimestamp(local_date)); //Flatten date
  }

  /*
    getInput() - Returns the input of a specific input HTMLElement within a context menu as a variable.
    arg0_input_el: (HTMLElement) - The individual .context-menu-cell being referenced.

    Returns: (Variable)
  */
  function getInput (arg0_input_el, arg1_options) {
    //Convert from parameters
    var input_el = arg0_input_el;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var id = input_el.getAttribute("id");
    var output;
    var type = input_el.getAttribute("type");

    if (type == "basic_colour") {
      output = input_el.querySelector(`input[type="color"]`).value;
    } else if (type == "biuf") {
      output = input_el.querySelector(`#biuf-input`).innerHTML;
    } else if (["rich_text", "wysiwyg"].includes(type)) {
      output = getWysiwygFromFields(input_el);
    } else if (type == "checkbox") {
      var all_checkboxes = input_el.querySelectorAll(`[type="checkbox"]`);
      output = {};

      //Iterate over all_checkboxes
      for (var i = 0; i < all_checkboxes.length; i++)
        output[all_checkboxes[i].id] = (all_checkboxes[i].checked);
    } else if (["color", "colour"].includes(type)) {
      output = getColourFromFields(input_el);
    } else if (type == "datalist") {
      output = input_el.querySelector("datalist").value;
    } else if (type == "date") {
      output = getDateFromFields(input_el);
    } else if (type == "date_length") {
      output = getDateLengthFromFields(input_el);
    } else if (type == "email") {
      output = input_el.querySelector("input[type='email']").value;
    } else if (type == "file") {
      //[WIP] - No current file input of this kind
    } else if (type == "html") {
      if (options.custom_html_function)
        output = options.custom_html_function(input_el);
    } else if (type == "image") {
      //[WIP] - No current file input of this kind
    } else if (type == "interface") {
      output = getInputsAsObject(input_el, options);
    } else if (type == "number") {
      output = parseFloat(input_el.querySelector(`input[type="number"]`).value);
    } else if (type == "password") {
      output = input_el.querySelector(`input[type="password"]`).value;
    } else if (type == "radio") {
      var all_radio_els = input_el.querySelectorAll(`[type="radio"]`);

      //Iterate over all_radio_els
      for (var i = 0; i < all_radio_els.length; i++)
        if (all_radio_els[i].checked) {
          output = all_radio_els[i].id;
          break;
        }
    } else if (type == "range") {
      output = input_el.querySelector(`input[type="range"]`).value;
    } else if (type == "search_select") {
      output = input_el.getAttribute("data-selected");
    } else if (type == "select") {
      output = input_el.querySelector("select").value;
    } else if (type == "sortable_list") {
      output = input_el.querySelectorAll(`ul.sortable-list > li > span`);
    } else if (["tel", "telephone"].includes(type)) {
      output = input_el.querySelector(`input[type="tel"]`).value;
    } else if (type == "text") {
      output = input_el.querySelector(`input[type="text"]`).value;
    } else if (type == "time") {
      output = input_el.querySelector(`input[type="time"]`).value;
      if (output && output != "n/a") {
        output = output.split(":");
        output = {
          hour: parseInt(output[0]),
          minute: parseInt(output[1])
        };
      }
    } else if (type == "url") {
      output = input_el.querySelector(`input[type="url"]`).value;
    }

    //Return statement
    return output;
  }

  /*
    getInputsAsObject() - Returns inputs as an object.
    arg0_context_menu_el: (HTMLElement) - The context menu element.
    arg1_options: (Object)
      do_not_include_submenus: (Boolean) - Optional. Whether to not include context submenus. False by default.
      entity_id: (String) - Optional. Whether the context menu is related to an entity. Undefined by default.
      custom_file_function: (Function) - Optional. The function to run to fetch input values for 'file' types. Fetches all paths by default.
      custom_html_function: (Function) - Optional. The function to run to fetch input values for custom 'html' types. Fetches nothing by default.

    Returns: (Object)
  */
  function getInputsAsObject (arg0_context_menu_el, arg1_options) {
    //Convert from parameters
    var context_menu_el = arg0_context_menu_el;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var all_inputs = context_menu_el.querySelectorAll(`.context-menu-cell`);
    var return_obj = {};

    //1. General input handling
    //Iterate over all_inputs and set values in return_obj by referring to the ID
    for (var i = 0; i < all_inputs.length; i++) {
      var has_output = true;
      var local_id = all_inputs[i].getAttribute("id");
      var local_output;

      //Fetch local_output
      local_output = getInput(all_inputs[i]);
      if (local_output != null && local_output != undefined) has_output = true;

      //Set return_obj[local_id]
      if (has_output) {
        if (!Array.isArray(local_output) && typeof local_output == "object")
          return_obj = mergeObjects(return_obj, local_output);
        return_obj[local_id] = local_output;
      }
    }

    //2. Specialised input handling
    if (options.entity_id) {
      var common_selectors = config.defines.common.selectors;
      var entity_el = getEntityElement(options.entity_id);
      var entity_obj = getEntity(options.entity_id);

      //Make sure entity_obj exists
      if (entity_obj) {
        //Metadata handling
        //Metadata - Reserved variables
        if (!return_obj.ENTITY_ABSOLUTE_AGE) return_obj.ENTITY_ABSOLUTE_AGE = getEntityAbsoluteAge(options.entity_id);
        if (!return_obj.ENTITY_RELATIVE_AGE) return_obj.ENTITY_RELATIVE_AGE = getEntityRelativeAge(options.entity_id);

        //Multiple keyframes handling
        if (entity_obj.options.selected_keyframes_key)
          return_obj[entity_obj.options.selected_keyframes_key] = entity_obj.options.selected_keyframes;
        //Timestamp handling
        if (entity_el) {
          var entity_keyframe_anchor_el = entity_el.querySelector(`${common_selectors.entity_keyframe_context_menu_anchor}`);
          var entity_timestamp = entity_keyframe_anchor_el.getAttribute("timestamp");

          if (entity_timestamp)
            return_obj.timestamp = entity_timestamp;
        }
      }
    }

    //Return statement
    return return_obj;
  }

  function getWysiwygFromFields (arg0_wysiwyg_el) {
    //Convert from parameters
    var wysiwyg_el = arg0_wysiwyg_el;

    //Declare local instance variables
    var html_content_el = wysiwyg_el.querySelector(`.html-view`);
    var visual_content_el = wysiwyg_el.querySelector(`.visual-view`);

    //Return statement
    return (html_content_el.innerHTML.length > visual_content_el.innerHTML.length) ?
      html_content_el.innerHTML : visual_content_el.innerHTML;
  }
}