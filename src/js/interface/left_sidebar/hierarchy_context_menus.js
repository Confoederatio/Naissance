//Initialise context menu functions
{
  function printHierarchyEntityContextMenu (arg0_hierarchy_key, arg1_entity_id, arg2_options) { //[WIP] - Finish function after entity_ui.js recode
    //Convert from parameters
    var hierarchy_key = arg0_hierarchy_key;
    var entity_id = arg1_entity_id;
    var options = (arg2_options) ? arg2_options : {};

    //Call printEntityContextMenu()
    printEntityContextMenu(entity_id);
  }
}
