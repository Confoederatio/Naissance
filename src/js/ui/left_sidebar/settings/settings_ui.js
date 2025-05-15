//Initialise functions
{
  function initSettingsUI () { //[WIP] - Finish function body
    //Declare local instance variables
    var common_defines = config.defines.common;
    var settings_container_selector = common_defines.selectors.settings_container;

    //Set new context menu
    var settings_context_menu = createContextMenu({
      anchor: settings_container_selector,
      class: `settings-ui unique`,
      id: `settings-ui`,
      name: `Settings:`,

      global_settings_html: {
        id: `global_settings_header`,
        type: "html",

        innerHTML: `
          <div class = "primary-header">Global Settings</div>
        `,
      },
      document_settings_html: {
        id: `document_settings_header`,
        type: "html",

        innerHTML: `
          <div class = "primary-header">Document Settings</div>
        `,
      },
      map_projection: {
        id: `map_projection`,
        name: `<div class = "secondary-header">Base Map Projection:</div>`,
        type: "select",
        options: {
          "equirectangular": "Equirectangular",
          "mercator": "Mercator"
        },

        onload: function (e) {
          //Declare local instance variables
          var projection_dictionary = config.defines.map.projection_dictionary;

          //Iterate over all_projections
          var all_projections = Object.keys(projection_dictionary);
          var options_html = ``;

          for (var i = 0; i < all_projections.length; i++) {
            var local_projection = projection_dictionary[all_projections[i]];

            options_html += `<option value = "${all_projections[i]}" ${all_projections[i] == getMapProjection() ? "selected" : ""}>${parseString(all_projections[i])}</option>`;
          }

          e.querySelector("select").innerHTML = options_html;
        },
        onclick: function (e) {
          setMapProjection(e.target.value);
        },
      },
      map_layers_sortable_list: {
        id: `map_layers_sortable_list`,
        name: `<div class = "secondary-header">Map Layers:</div>`,
        type: "sortable_list",
        has_controls: true, //Make sure to implement this into BrowserUI
          add_button_name: "Add Layer",
          delete_button_name: "Delete Layer",
          other_header_buttons: `
            <button id = "reload-map-layers" onclick = "applyMapLayersObject()">Reload Map Layers</button>
          `,

        options: {
          "default": createMapLayerElement({
            name: "Default",
            is_base_layer: true
          }),
        },
        onchange: function (e) {
          applyMapLayersObject();
        },
        onadd: function (e) {
          e.querySelector("span").innerHTML = createMapLayerElement();
        }
      }
    });

    console.log(settings_container_selector, settings_context_menu);
  }
}