//Initialise functions
{
  function getVariableListObject (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var current_history = getHistoryFrame(entity_id, main.date);
    var entity_el = getEntityElement(entity_id);
    var entity_variables = getAllEntityVariables(entity_id);
    var variable_list_obj = {};

    //Iterate over all_entity_variables
    if (current_history)
      if (current_history.options.variables)
        //Iterate over entity_variables
        for (var i = 0; i < entity_variables.length; i++) {
          var local_key = entity_variables[i];
          var local_value = current_history.options.variables[entity_variables[i]];

          variable_list_obj[local_key] = {
            id: local_key,
            name: `${local_key}: `,
            type: "text",
            attributes: {
              value: local_value
            },

            onclick: function (e) {
              setEntityVariable(entity_id, local_key, e.target.value, { date: main.date });
              printEntityBio(entity_id);
            }
          };
        }

    //Return statement
    return variable_list_obj;
  }

  /**
   * printEntityContextMenuCustomisationSection() - Prints the customisation section of an entity context menu.
   * @param {string} arg0_entity_id
   */
  function printEntityContextMenuCustomisationSection (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var common_selectors = config.defines.common.selectors;
    var current_history = getHistoryFrame(entity_id, main.date);
    var entity_el = getEntityElement(entity_id);

    var entity_customisation_content_selector = `div.entity-ui-pane[class~="${entity_id}"] ${common_selectors.entity_customisation_options}`;
    var entity_customisation_selector = `div.entity-ui-pane[class~="${entity_id}"] ${common_selectors.entity_colour_picker}`;
    var entity_altitude = returnSafeNumber(current_history.options.altitude);
    var entity_maximum_zoom = returnSafeNumber(current_history.options.maximum_zoom_level);
    var entity_minimum_zoom = returnSafeNumber(current_history.options.minimum_zoom_level);
    var entity_obj = getEntity(entity_id);
    var variable_list_obj = getVariableListObject(entity_id);

    //Define tab options in #entity-ui-customisation-options-container
    var entity_customisation_content_el = createPageMenu({
      id: entity_id,

      anchor: entity_customisation_content_selector,
      tab_anchor: common_selectors.entity_customisation_tab_container,
      default: "fill",

      class: `customisation-options-container`,
      name: "Customisation Options:",

      pages: {
        description: {
          name: "Desc.",
          special_function: function (e) {
            var current_history = getHistoryFrame(entity_id, main.date);
            var wysiwyg_selector = `${entity_customisation_content_selector} .visual-view`;

            if (current_history.options)
              if (current_history.options.description)
                setTimeout(function(){
                  document.querySelector(wysiwyg_selector).innerHTML = current_history.options.description;
                }, 0);
          },

          description: {
            id: "description",
            type: "wysiwyg",

            onchange: function (e) {
              setEntityDescription(entity_id, e.value);
            }
          }
        },
        fill: {
          name: "Fill",

          fill_colour: {
            id: "fill_colour",
            name: "Fill Colour",
            type: "basic_colour",

            attributes: {
              value: entity_obj._symbol.polygonFill
            },
            onclick: function (e) {
              setEntityFillColour(entity_id, e.target.value); 
              printEntityBio(entity_id);
            }
          },
          fill_opacity_number: {
            id: "fill_opacity_number",
            name: "Fill Opacity (0-100): ",
            type: "number",

            attributes: {
              min: 0,
              max: 100
            },
            onclick: function (e) {
              setEntityFillOpacity(entity_id, e.target.value/100);
              printEntityBio(entity_id);
            },
            onload: function (e) {
              e.querySelector("input").value = returnSafeNumber(entity_obj._symbol.polygonOpacity*100, 60);
            }
          }
        },
        stroke: {
          name: "Stroke",

          stroke_colour: {
            id: "stroke_colour",
            name: "Stroke Colour",
            type: "basic_colour",
            x: 0,
            y: 0,

            attributes: {
              value: entity_obj._symbol.lineColor
            },
            onclick: function (e) {
              setEntityStrokeColour(entity_id, e.target.value);
              printEntityBio(entity_id);
            }
          },
          stroke_options: {
            id: "stroke_options",
            name: "Set Stroke to be Same as Fill",
            type: "checkbox",
            x: 1,
            y: 0,

            options: {
              "set_stroke_to_be_same_as_fill": "Set stroke to be same as fill",
            }
          },
          stroke_opacity_number: {
            id: "stroke_opacity_number",
            name: "Stroke Opacity (0-100): ",
            type: "number",
            x: 1,
            y: 1,
            
            attributes: {
              min: 0,
              max: 100
            },
            onclick: function (e) {
              setEntityStrokeOpacity(entity_id, e.target.value/100);
              printEntityBio(entity_id);
            },
            onload: function (e) {
              e.querySelector("input").value = returnSafeNumber(entity_obj._symbol.lineOpacity*100, 100);
            }
          },
          stroke_width_number: {
            id: "stroke_width_number",
            name: "Stroke Width: ",
            type: "number",
            x: 1,
            y: 2,
            
            attributes: {
              width: 2
            },
            onclick: function (e) {
              setEntityStrokeWidth(entity_id, e.target.value);
              printEntityBio(entity_id);
            },
            onload: function (e) {
              e.querySelector("input").value = returnSafeNumber(entity_obj._symbol.lineWidth, 1);
            }
          },
        },
        other: {
          name: "Other",
          special_function: function (e) {
            setTimeout(function(){
              printVariableList(entity_id);
            }, 0);
          },
          
          altitude: {
            id: "altitude",
            name: "Altitude: ",
            type: "number",
            x: 0,
            y: 1,
            
            attributes: {
              min: 0,
              value: entity_altitude
            },
            onclick: function (e) {
              setEntityAltitude(entity_id, e.target.value);
            }
          },
          maximum_zoom_level: {
            id: "maximum_zoom_level",
            name: "Maximum Zoom Level: ",
            type: "number",
            x: 0,
            y: 2,

            attributes: {
              min: 0,
              max: 20,
              value: entity_maximum_zoom
            },
            onclick: function (e) {
              setEntityMaximumZoomLevel(entity_id, e.target.value);
            }
          },
          minimum_zoom_level: {
            id: "minimum_zoom_level",
            name: "Minimum Zoom Level: ",
            type: "number",
            x: 1,
            y: 2,

            attributes: {
              min: 0,
              max: 20,
              value: entity_minimum_zoom
            },
            onclick: function (e) {
              setEntityMinimumZoomLevel(entity_id, e.target.value);
            }
          },
          custom_data_fields: {
            id: "custom_data_fields",
            name: `<b>Custom Data Fields:</b>`,
            type: "html",
            x: 0,
            y: 3,
          },
          custom_variable_input: {
            id: "custom_variable_input",
            type: "text",
            x: 1,
            y: 3,

            attributes: {
              placeholder: "Variable key ..",
              width: 16
            },
            onclick: function (e) {
              console.log(e);
            }
          },

          add_variable: {
            id: "add_variable",
            name: "Add Variable",
            type: "button",
            x: 0,
            y: 4,

            onclick: function (e) {
              var variable_input_el = document.querySelector(`${entity_customisation_content_selector} #custom_variable_input input[type="text"]`);

              if (variable_input_el.value && !entityVariableExists(entity_id, variable_input_el.value)) {
                setEntityVariable(entity_id, variable_input_el.value, 0, { date: main.date });
                printVariableList(entity_id);
                printEntityBio(entity_id);
              }
            }
          },
          delete_variable: {
            id: "delete_variable",
            name: "Delete Variable",
            type: "button",
            x: 1,
            y: 4,
            
            onclick: function (e) {
              var variable_input_el = document.querySelector(`${entity_customisation_content_selector} #custom_variable_input input[type="text"]`);

              if (variable_input_el.value) {
                deleteEntityVariable(entity_id, variable_input_el.value);
                printVariableList(entity_id);
                printEntityBio(entity_id);
              }
            }
          },
          variable_fields: {
            id: "variable_fields",
            innerHTML: `<div id = "variable-fields-container"></div>`,
            type: "html",
            width: 2,
            x: 0,
            y: 5
          }
        }
      }
    });
  }

  function printVariableList (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    
    //Declare local instance variables
    var common_selectors = config.defines.common.selectors;
    var entity_customisation_content_selector = `div.entity-ui-pane[class~="${entity_id}"] ${common_selectors.entity_customisation_options}`;
    var variable_list_obj = getVariableListObject(entity_id);

    var entity_variable_list_el = createContextMenu({
      anchor: `${entity_customisation_content_selector} #variable-fields-container`,
      class: `variable-list-container unique`,
      id: "variable-list",
      name: "Variable List:",
      do_not_append: true,

      ...variable_list_obj
    });
  }

  function deleteEntityVariable (arg0_entity_id, arg1_variable_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var variable_id = arg1_variable_id;
    
    //Declare local instance variables
    var entity_obj = getEntity(entity_id);

    //Iterate over all_history_frames and delete the given variable
    if (entity_obj.options)
      if (entity_obj.options.history) {
        var all_history_frames = Object.keys(entity_obj.options.history);

        for (var i = 0; i < all_history_frames.length; i++) {
          var local_history_frame = entity_obj.options.history[all_history_frames[i]];
          
          if (local_history_frame.options)
            if (local_history_frame.options.variables)
              delete local_history_frame.options.variables[variable_id];
        }
      }
  }

  function setEntityVariable (arg0_entity_id, arg1_variable_id, arg2_variable_value, arg3_options) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var variable_id = arg1_variable_id;
    var variable_value = arg2_variable_value;
    var options = (arg3_options) ? arg3_options : {};
    
    //Declare local instance variables
    if (!options.date) options.date = main.date;

    //Declare local instance variables
    var current_history = getHistoryFrame(entity_id, options.date);
    var current_timestamp = convertTimestampToInt(getTimestamp(options.date));
    var entity_obj = getEntity(entity_id);
    var old_history_entry = getAbsoluteHistoryFrame(entity_id, options.date);

    //Guard clause if the variable is already set to the given value
    if (current_history)
      if (current_history.variables)
        if (current_history.variables[variable_id] == variable_value) return;
    
    if (old_history_entry.id == current_timestamp) {
      if (!current_history.options) current_history.options = {};
      if (!current_history.options.variables) current_history.options.variables = {};
      
      var variables_obj = dumbMergeObjects(current_history.options.variables, { [variable_id]: variable_value });
      createHistoryFrame(entity_id, options.date, { variables: variables_obj });
      console.log(variables_obj);
    } else {
      createHistoryFrame(entity_id, options.date, { variables: { [variable_id]: variable_value } });
      console.log(variable_value);
    }

    console.log(entity_obj.options.history);
  }
}