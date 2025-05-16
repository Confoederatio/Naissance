//Initialise functions
{
  function initSettingsUI () { //[WIP] - Finish function body; reassign to populate from config.settings
    //Declare local instance variables
    var common_defines = config.defines.common;
    var settings_container_selector = common_defines.selectors.settings_container;

    //Set new context menu
    var settings_options = {
      anchor: settings_container_selector,
      class: `settings-ui unique`,
      id: `settings-ui`,
      name: `Settings:`,
    };

    //Iterate over all_settings_categories and populate settings_options
    var all_settings_categories = Object.keys(config.settings);

    for (var i = 0; i < all_settings_categories.length; i++) {
      var local_settings_category = config.settings[all_settings_categories[i]];

      settings_options = dumbMergeObjects(settings_options, local_settings_category);
    }

    //Initialise settings_context_menu
    var settings_context_menu = createContextMenu(settings_options);

    //Return statement
    return settings_context_menu;
  }

  function populateMapTileLayersFromObject (arg0_map_tile_layers_obj) { //[WIP] - Finish function body
  }
}