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
          <div class = "header">Global Settings</div>
        `,
      },
      test_sortable_list: {
        id: `test_sortable_list`,
        name: `Test Sortable List`,
        type: "sortable_list",

        options: {
          "default": `Default`,
          "test": `Test`
        },
        onclick: function (e) {
          console.log(e);
        }
      }
    });

    console.log(settings_container_selector, settings_context_menu);
  }
}