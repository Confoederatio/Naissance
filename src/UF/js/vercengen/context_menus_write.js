//Initialise functions
{
  /**
   * autoFillInput() - Auto-fills inputs for a given element based on parseVariableString() and their context menu .placeholder object.
   * @param {Object} [arg0_options]
   *  @param {HTMLElement} [arg0_options.element] - The direct element object for which to fill in an input for
   *  @param {Object|String} [arg0_options.placeholder] - The variable to use as the placeholder
   *  @param {string} [arg0_options.type] - The type of input the element represents
   *  @param {Object} [arg0_options.value] - The local value for the given context menu object element
   */
  function autoFillInput (arg0_options) { //[WIP] - Rework autoFillInput() to use parseVariableString() for all inputs
    //Convert from parameters
    var options = (arg0_options) ? arg0_options : {};

    //Initalise options
    if (!options.value) options.value = {};

    //Guard clause if options.placeholder doesn't exist
    if (options.placeholder == undefined) return undefined;

    //Declare local instance variables
    var placeholder_obj = JSON.parse(JSON.stringify(options.placeholder));

    //Parse placeholder_obj
    if (typeof placeholder_obj == "object") {
      var all_placeholder_keys = Object.keys(options.placeholder);

      for (var i = 0; i < all_placeholder_keys.length; i++) {
        var local_placeholder = placeholder_obj[all_placeholder_keys[i]];
        var local_placeholder_string = JSON.parse(JSON.stringify(local_placeholder));

        if (local_placeholder != undefined)
          placeholder_obj[all_placeholder_keys[i]] = (options.value.value_equation) ?
            parseVariableString(options.value.value_equation, { VALUE: parseVariableString(local_placeholder) }) :
            parseVariableString(local_placeholder, { ignore_errors: true });
      }

      if (all_placeholder_keys.length == 1 && placeholder_obj.VALUE != undefined)
        placeholder_obj = placeholder_obj.VALUE;
    }

    if (options.type == "basic_colour") {
      if (Array.isArray(placeholder_obj)) {
        options.element.querySelector(`input[type="color"]`).value = RGBToHex(placeholder_obj);
      } else if (typeof placeholder_obj == "string") {
        options.element.querySelector(`input[type="color"]`).value = placeholder_obj;
      }
    } else if (options.type == "date") {
      populateDateFields(options.element, convertTimestampToDate(placeholder_obj));
    } else if (options.type == "date_length") {
      //Guard clause if typeof is invalid; i.e. a custom template
      if (typeof placeholder_obj == "string") return;
    } else if (options.type == "range") {
      var actual_number_in_range = calculateNumberInRange(
        [returnSafeNumber(options.value.attributes.min, 0), returnSafeNumber(options.value.attributes.max, 100)],
        placeholder_obj,
        options.value.value_equation
      );
      var range_el = options.element.querySelector(`input[type="range"]`);

      range_el.value = actual_number_in_range;
    } else {
      fillInput({
        element: options.element,
        type: options.type,
        placeholder: placeholder_obj
      });
    }
  }
  
 /**
  * fillInput() - Fills in a context menu input with its corresponding type.
  * @param {Object} [arg0_options]
  *  @param {HTMLElement} [arg0_options.element] - The direct element object for which to fill in an input for
  *  @param {string} [arg0_options.type] - The type of input the element represents
  *  @param {Object} [arg0_options.placeholder] - The variable to use as the placeholder
  */
  function fillInput (arg0_options) {
    //Convert from parameters
    var options = (arg0_options) ? arg0_options : {};

    //Initialise options
    if (!options.type) options.type = "text";

    //Make sure element is declared; look over options.type and fill in the input with variable
    if (options.element)
      if (options.type == "biuf") {
        options.element.querySelector(`#biuf-input`).innerHTML = options.placeholder;
      } else if (["rich_text", "wysiwyg"].includes(options.type)) {
        options.element.querySelector(`.html-view`).value = options.placeholder;
        options.element.querySelector(`.visual-view`).innerHTML = options.placeholder;
      } else if (options.type == "checkbox") {
        var all_checkbox_els = options.element.querySelectorAll(`[type="checkbox"]`);

        //Iterate over all_checkbox_els
        for (let i = 0; i < all_checkbox_els.length; i++) try {
          if (options.placeholder[all_checkbox_els[i].id]) {
            all_checkbox_els[i].checked = options.placeholder[all_checkbox_els[i].id];
          } else {
            all_checkbox_els[i].checked = false;
          }
        } catch {}
      } else if (["color", "colour"].includes(options.type)) {
        var b_el = options.element.querySelector(`input#b`);
        var g_el = options.element.querySelector(`input#g`);
        var r_el = options.element.querySelector(`input#r`);

        //Set numbers and update colour wheel
        r_el.value = options.placeholder[0];
        g_el.value = options.placeholder[1];
        b_el.value = options.placeholder[2];
        setColourWheelCursor(options.element, options.placeholder);
      } else if (options.type == "datalist") {
        options.element.querySelector("datalist").value = options.placeholder;
      } else if (options.type == "date") {
        var day_el = options.element.querySelector(`#day-input`);
        var hour_el = options.element.querySelector(`#hour-input`);
        var minute_el = options.element.querySelector(`#minute-input`);
        var month_el = options.element.querySelector(`#month-input`);
        var year_el = options.element.querySelector(`#year-input`);
        var year_type_el = options.element.querySelector(`#year-type`);

        //Set local values from options.placeholder
        options.placeholder = convertTimestampToDate(options.placeholder);

        if (options.placeholder.year < 0) {
          year_el.value = options.placeholder.year*-1;
          year_type_el.value = "BC";
        } else {
          year_el.value = options.placeholder.year;
          year_type_el.value = "AD";
        }
        month_el.value = (!isNaN(options.placeholder.month)) ? months[options.placeholder.month - 1] : "January";
        day_el.value = options.placeholder.day;
        hour_el.value = `${(options.placeholder.hour < 10) ? "0" : ""}${options.placeholder.hour}`;
        minute_el.value = `${(options.placeholder.minute < 10) ? "0" : ""}${options.placeholder.minute}`;
      } else if (options.type == "date_length") {
        var days_el = options.element.querySelector(`#days-input`);
        var hours_el = options.element.querySelector(`#hours-input`);
        var minutes_el = options.element.querySelector(`#minutes-input`);
        var months_el = options.element.querySelector(`#months-input`);
        var years_el = options.element.querySelector(`#years-input`);

        //Set local values from options.placeholder
        options.placeholder = convertTimestampToDate(options.placeholder);

        years_el.value = options.placeholder.year;
        months_el.value = options.placeholder.month;
        days_el.value = options.placeholder.day;
        hours_el.value = options.placeholder.hour;
        minutes_el.value = options.placeholder.minute;
      } else if (options.type == "email") {
        options.element.querySelector(`input[type="email"]`).value = options.placeholder;
      } else if (options.type == "file") {
        //[WIP] - No current file input of this kind
      } else if (options.type == "html") {
        options.element = options.placeholder;
      } else if (options.type == "image") {
        //[WIP] - No current file input of this kind
      } else if (options.type == "number") {
        options.element.querySelector(`input[type="number"]`).value = options.placeholder;
      } else if (options.type == "password") {
        options.element.querySelector(`input[type="password"]`).value = options.placeholder;
      } else if (options.type == "radio") {
        var all_radio_els = options.element.querySelectorAll(`[type="radio"]`);

        //Iterate over all_radio_els
        for (var i = 0; i < all_radio_els; i++)
          if (options.placeholder == all_radio_els[i].id)
            all_radio_els[i].checked = true;
      } else if (options.type == "range") {
        options.element.querySelector(`input[type="range"]`).value = options.placeholder;
      } else if (options.type == "search_select") {
        options.element.setAttribute("data-selected", options.placeholder);
        options.element.querySelector(`[data-value="${options.placeholder}"]`).classList.add("selected");
      } else if (options.type == "select") {
        options.element.querySelector(`select`).value = options.placeholder;
      } else if (["tel", "telephone"].includes(options.type)) {
        options.element.querySelector(`input[type="tel"]`).value = options.placeholder;
      } else if (options.type == "text") {
        options.element.querySelector(`input[type="text"]`).value = options.placeholder;
      } else if (options.type == "time") {
        var time_el = options.element.querySelector(`input[type="time"]`);

        if (!Array.isArray(options.placeholder) && typeof options.placeholder == "object") {
          time_el.value = `${(options.placeholder.hour < 10) ? `0` : ""}${options.placeholder.hour}:${(options.placeholder.minute < 10) ? `0` : ""}${options.placeholder.minute}`;
        } else if (Array.isArray(options.placeholder)) {
          time_el.value = `${(options.placeholder[0] < 10) ? `0` : ""}${options.placeholder[0]}:${(options.placeholder[1] < 10) ? `0` : ""}${options.placeholder[1]}`;
        } else {
          time_el.value = options.placeholder;
        }
      } else if (options.type == "url") {
        options.element.querySelector(`input[type="url"]`).value = options.placeholder;
      }
  }
}