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
        id: `global-settings-header`,
        type: "html",

        innerHTML: `
          <div class = "primary-header">Global Settings</div>
        `,
      },
      test_sortable_list: {
        id: `test_sortable_list`,
        name: `<div class = "secondary-header">Map Layers:</div>`,
        type: "sortable_list",
        has_controls: true, //Make sure to implement this into BrowserUI
          add_button_name: "Add Layer",
          delete_button_name: "Delete Layer",

        options: {
          "default": `Default`,
          "test": `Test`
        },
        onchange: function (e) {
          console.log(`Onchange fired:`, e);
        },
        onadd: function (e) {
          console.log(`Onadd fired:`, e);
        },
        onremove: function (e) {
          console.log(`Onremove fired:`, e);
        }
      }
    });

    console.log(settings_container_selector, settings_context_menu);
  }
}