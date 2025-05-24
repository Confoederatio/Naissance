//Initialise functions
{
  /*
    printGroupActionsNavigationMenuHandler() - Helper function. Provides the main interface through which printGroupActionsNavigationMenu() is invoked.
    arg0_hierarchy_key: (String) - The hierarchy key to populate group actions UIs for.
    arg1_group_id: (String) - The group ID for which to print the handdler.
  */
  function printGroupActionsNavigationMenuHandler (arg0_hierarchy_key, arg1_group_id) {
    //Convert from parameters
    var hierarchy_key = arg0_hierarchy_key;
    var group_id = arg1_group_id;

    console.log(hierarchy_key, group_id);

    //Declare local instance variables
    var common_selectors = config.defines.common.selectors;
    var parent_el = document.querySelector(`.group[data-id="${group_id}"]`)
      .querySelector(common_selectors.group_actions_context_menu_anchor);

    //Invoke printGroupActionsNavigationMenu()
    printGroupActionsNavigationMenu(parent_el, { group_id: group_id });
  }
}
