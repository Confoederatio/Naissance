//Initialise functions
{
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
            innerHTML: `<b>Custom Data Fields:</b>
              <div id = "custom-data-fields-container"></div>
            `,
            type: "html"
          }
        }
      }
    });
  }
}