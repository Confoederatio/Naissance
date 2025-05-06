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
      if (current_history.variables)
        //Iterate over entity_variables
        for (var i = 0; i < entity_variables.length; i++) {
          var local_key = entity_variables[i];
          var local_value = current_history.variables[entity_variables[i]];

          variable_list_obj[local_key] = {
            id: local_key,
            name: local_key,
            type: "text",
            onclick: function (e) {
              console.log(e.target.value);
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

    var entity_customisation_content_selector = `div.leaflet-popup[class~="${entity_id}"] ${common_selectors.entity_customisation_options}`;
    var entity_customisation_selector = `div.leaflet-popup[class~="${entity_id}"] ${common_selectors.entity_colour_picker}`;
    var entity_maximum_zoom = (current_history.options.maximum_zoom_level) ? current_history.options.maximum_zoom_level : 0;
    var entity_minimum_zoom = (current_history.options.minimum_zoom_level) ? current_history.options.minimum_zoom_level : 0;
    var variable_list_obj = getVariableListObject(entity_id);

    //Define colour picker
    var entity_customisation_fill_tab_el = createContextMenu({
      anchor: entity_customisation_selector,
      class: `colour-picker-container unique`,
      id: "entity-colour-picker",
      name: "Colour Picker:",

      colour_input: {
        id: "colour_input",
        type: "colour",

        x: 0,
        y: 0,

        onclick: function (arg0_colour) {
          //Convert from parameters
          var colour = arg0_colour;

          //Declare local instance variables
          var entity_obj = getEntity(entity_id);
          var entity_ui_obj = global.interfaces[entity_id];

          if (entity_ui_obj.page == "fill") {
            setEntityFillColour(entity_id, colour);
          } else if (entity_ui_obj.page == "stroke") {
            setEntityStrokeColour(entity_id, colour);
          }
        }
      }
    });

    //Define tab options in #entity-ui-customisation-options-container
    var entity_customisation_content_el = createPageMenu({
      id: entity_id,

      anchor: entity_customisation_content_selector,
      tab_anchor: common_selectors.entity_customisation_tab_container,
      default: "fill",

      class: `customisation-options-container`,
      name: "Customisation Options:",

      pages: {
        fill: {
          name: "Fill"
        },
        stroke: {
          name: "Stroke"
        },
        other: {
          name: "Other",

          maximum_zoom_level: {
            id: "maximum_zoom_level",
            name: "Maximum Zoom Level: ",
            type: "number",
            x: 0,
            y: 0,

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
            x: 0,
            y: 1,

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
            innerHTML: `<b>Custom Data Fields:</b>`,
            type: "html",
            x: 0,
            y: 2,
          },

          add_variable: {
            id: "add_variable",
            name: "Add Variable",
            type: "button",
            x: 0,
            y: 3,

            onclick: function (e) {
              console.log(e);
            }
          },
          delete_variable: {
            id: "delete_variable",
            name: "Delete Variable",
            type: "button",
            x: 1,
            y: 3,
            
            onclick: function (e) {
              console.log(e);
            }
          },
          variable_fields: {
            id: "variable_fields",
            innerHTML: `<div id = "variable-fields-container"></div>`,
            type: "html",
            width: 2,
            x: 0,
            y: 4
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
    var entity_customisation_content_selector = `div.leaflet-popup[class~="${entity_id}"] ${common_selectors.entity_customisation_options}`;
    var variable_list_obj = getVariableListObject(entity_id);
    
    var entity_variable_list_el = createContextMenu({
      anchor: `${entity_customisation_content_selector} #variable-fields-container`,
      class: `variable-list-container`,
      id: "variable-list",
      name: "Variable List:",

      ...variable_list_obj
    });
  }

  function setEntityVariable (arg0_entity_id, arg1_variable_id, arg2_variable_value) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var variable_id = arg1_variable_id;
    var variable_value = arg2_variable_value;
    
    //Declare local instance variables
  }
}