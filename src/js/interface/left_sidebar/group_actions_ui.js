//Initialise functions
{
  /*
    closeGroupActionsContextMenu() - Closes group actions context menus for a specific order.
    arg0_group_id: (String) - The group I dfor which to close a menu.
    arg1_order: (Number) - The order which to target to remove.
  */
  function closeGroupActionsContextMenu (arg0_group_id, arg1_order) {
    //Convert from parameters
    var group_id = arg0_group_id;
    var order = (arg1_order) ? arg1_order : 1;

    //Declare local instance variables
    var group_actions_anchor_el = getGroupActionsAnchorElement(group_id);

    //Fetch local group action context menu and close it
    var group_actions_el = group_actions_anchor_el.querySelector(`[order="${order}"]`);
    group_actions_el.remove();
    refreshGroupActionsContextMenus();
  }

  /*
    closeGroupActionsContextMenu() - Closes all group actions context menus.
    arg0_group_id: (String) - The group ID for which to close all menus.
  */
  function closeGroupActionsContextMenus (arg0_group_id) {
    //Convert from parameters
    var group_id = arg0_group_id;

    //Declare local instance variables
    var group_actions_anchor_selector = getGroupActionsAnchorElement(group_id, { return_selector: true });

    //Fetch local group action context menus and close all of them
    var group_action_els = document.querySelectorAll(`${group_actions_anchor_selector} > .context-menu`);

    //Iterate over all group_action_els
    for (var i = 0; i < group_action_els.length; i++)
      group_action_els[i].remove();
  }

  /*
    closeGroupActionsContextMenu() - Closes the last opened context menu for a group.
    arg0_group_id: (String) - The group ID for which to close the last opened menu.
  */
  function closeGroupActionsLastContextMenu (arg0_group_id) {
    //Convert from parameters
    var group_id = arg0_group_id;

    //Declare local instance variables
    var group_actions_anchor_el = getGroupActionsAnchorElement(group_id);
    var group_open_orders = getGroupActionsOpenOrders(group_id);

    //Close last keyframe context menu
    closeGroupActionsContextMenu(group_id, group_open_orders[group_open_orders.length - 1]);
  }

  /*
    getGroupActionsAnchorElement() - Fetches the group actions HTMLElement or selector of a given group's group actions anchor element.
    arg0_group_id: (String) - The group ID for which to fetch the selector for.
    arg1_options: (Object)
      return_selector: (Boolean) - Optional. Whether or not to return the selector instead of the HTMLElement. False by default.

    Returns: (HTMLElement/String)
  */
  function getGroupActionsAnchorElement (arg0_group_id, arg1_options) {
    //Convert from parameters
    var group_id = arg0_group_id;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var common_selectors = config.defines.common.selectors;
    var group_el = getGroupElement(group_id);
    var entity_group_anchor_el = group_el.querySelector(`${common_selectors.group_actions_context_menu_anchor}`);
    var entity_selector = `${common_selectors.group_ui}[data-id="${group_id}"]`;

    //Return statement
    return (!options.return_selector) ?
      entity_group_anchor_el :
      `${entity_selector} ${common_selectors.group_actions_context_menu_anchor}`;
  }

  /*
    getGroupActionsOpenOrders() - Fetches all currently opened orders for group actions context menus as an array.
    arg0_group_id: (String) - The group ID for which to fetch currently opened orders.

    Returns: (Array<Number>)
  */
  function getGroupActionsOpenOrders (arg0_group_id) {
    //Convert from parameters
    var group_id = arg0_group_id;

    //Declare local instance variables
    var group_actions_anchor_selector = getGroupActionsAnchorElement(group_id, { return_selector: true });
    var group_actions_els = document.querySelectorAll(`${group_actions_anchor_selector} .context-menu`);
    var unique_orders = [];

    //Iterate over all group_actions_els; get unique orders
    for (var i = 0; i < group_actions_els.length; i++) {
      var local_order = group_actions_els[i].getAttribute("order");

      if (local_order)
        if (!unique_orders.includes(local_order))
          unique_orders.push(local_order);
    }

    //Return statement
    return unique_orders;
  }

  /*
    getGroupActionsInputObject() - Fetches the merged input object for a given Group UI's action menu.
    arg0_group_id: (String) - The group ID for which to return the group object for.

    Returns: (Object)
  */
  function getGroupActionsInputObject (arg0_group_id) {
    //Convert from parameters
    var group_id = arg0_group_id;

    //Declare local instance variables
    var group_el = getGroupElement(group_id);
    var group_actions_anchor_el = getGroupActionsAnchorElement(group_id);
    var inputs_obj = {};

    //Iterate over all_context_menu_els
    var all_context_menu_els = group_actions_anchor_el.querySelectorAll(".context-menu");

    for (var i = 0; i < all_context_menu_els.length; i++)
      inputs_obj = dumbMergeObjects(inputs_obj, getInputsAsObject(all_context_menu_els[i], {
        group_id: group_id
      }));

    //Return statement
    return inputs_obj;
  }

  /*
    printGroupActionsContextMenu() - Prints a group actions context menu based on a GroupAction object.
    arg0_group_id: (String) - The group ID for which to print the context menu for.
    arg1_group_action: (Object) - The group action to be referenced from config.group_actions.
    arg2_options: (Object)
      <key>: (Variable) - The placeholder value to assign to the given context menu.
  */
  function printGroupActionsContextMenu (arg0_group_id, arg1_group_action, arg2_options) {
    //Convert from parameters
    var group_id = arg0_group_id;
    var group_action = arg1_group_action;
    var options = (arg2_options) ? arg2_options : {};

    //Declare local instance variables
    var common_defines = config.defines.common;
    var common_selectors = common_defines.selectors;
    var group_action_obj = getGroupAction(group_action);
    var group_obj = getGroup("hierarchy", group_id);

    //Initialise interfaces[group_id] if it doesn't exist
    if (!global.interfaces[group_id]) global.interfaces[group_id] = {
      id: group_id,
      group_obj: group_obj,
      options: {}
    };

    //Refresh group action context menus first; then append the current context menu
    var context_menu_ui = {};

    //Parse given .interface from group_action_obj if applicable
    if (group_action_obj.interface) {
      var group_el = getGroupElement(group_id);
      var group_action_anchor_el = getGroupActionsAnchorElement(group_id);
      var group_action_order = (group_action_obj.order != undefined) ? group_action_obj.order : 1;
      var group_selector = getGroupElement(group_id, { return_selector: true });
      var interaction_container_el = group_el.querySelectorAll(`.interaction-container`)[0];
      var lowest_order = config.group_actions_lowest_order;

      //Make sure UI isn't already open
      if (!interaction_container_el.querySelector(`[id="${group_action_obj.id}"]`)) {
        //Initialise options
        if (!options.timestamp) options.timestamp = convertTimestampToInt(getTimestamp(main.date));

        //Check to see if given group_action_obj is of the lowest order. If so, set "timestamp" attribute
        if (group_action_order == config.group_actions_lowest_order)
          group_action_anchor_el.setAttribute("timestamp", options.timestamp);

        //Append dummy context menu div first for context_menu_ui to append to
        var context_menu_el = document.createElement("div");

        context_menu_el.setAttribute("class", "context-menu");
        context_menu_el.id = group_action_obj.id;
        context_menu_el.setAttribute("order", group_action_order);
        group_action_anchor_el.appendChild(context_menu_el);

        //Initialise context_menu_ui options
        context_menu_ui.anchor = `${group_selector} ${common_selectors.group_actions_context_menu_anchor} .context-menu#${group_action_obj.id}`;
        if (group_action_obj.class) context_menu_ui.class = group_action_obj.class;
        if (group_action_obj.name) context_menu_ui.name = group_action_obj.name;
        if (group_action_obj.maximum_height) context_menu_ui.maximum_height = group_action_obj.maximum_height;
        if (group_action_obj.maximum_width) context_menu_ui.maximum_width = group_action_obj.maximum_width;

        //Initialise preliminary context menu first
        if (group_action_obj.interface) {
          var new_interface = JSON.parse(JSON.stringify(group_action_obj.interface));
          new_interface.anchor = context_menu_ui.anchor;
          new_interface.close_function = `closeGroupActionsContextMenu('${group_id}', ${group_action_order}); refreshGroupActionsContextMenus('${group_id}');`;

          var group_action_context_menu_ui = createContextMenu(new_interface);
          refreshGroupActionsContextMenus(group_id);
        }

        //Iterate over all_interface_keys and parse them correctly
        var all_interface_keys = Object.keys(group_action_obj.interface);

        for (let i = 0; i < all_interface_keys.length; i++) {
          let local_value = group_action_obj.interface[all_interface_keys[i]];

          if (!Array.isArray(local_value) && typeof local_value == "object") {
            let local_element = document.querySelector(`${context_menu_ui.anchor} #${local_value.id}`);
            if (!local_value.id) local_value.id = all_interface_keys[i];

            //Type handlers: set placeholders where applicable
            {
              autoFillInputs({
                element: local_element,
                type: local_value.type,
                placeholder: local_value.placeholder,
                value: local_value
              });

              //Special Group handling
              //Group Mask
              if (local_value.attributes)
                if (local_value.attributes.global_key == "GROUP_OBJ.mask_select") {
                  var all_mask_types_keys = Object.keys(config.mask_types);
                  var all_option_els = [];
                  var local_select_el = local_element.querySelector("select");

                  for (var x = 0; x < all_mask_types_keys.length; x++) {
                    var local_mask = config.mask_types[all_mask_types_keys[x]];
                    var local_option_el = document.createElement("option");

                    local_option_el.setAttribute("value", all_mask_types_keys[x]);
                    local_option_el.innerHTML = (local_mask.name) ? local_mask.name : all_mask_types_keys[x];

                    //Push local_option_el into current all_option_els
                    all_option_els.push(local_option_el);
                  }

                  //Set local_element
                  local_select_el.innerHTML = "";
                  for (var x = 0; x < all_option_els.length; x++)
                    local_select_el.appendChild(all_option_els[x]);

                  //Set actual placeholder
                  var current_group_mask = getGroupMask(group_obj.id);

                  if (current_group_mask) {
                    local_select_el.value = current_group_mask;
                  } else {
                    local_select_el.value = "clear";
                  }
                }
            }

            //Parse .effect to .onclick event handler
            if (local_value.effect)
              local_element.onclick = function (e) {
                parseEffect(group_id, local_value.effect, { event: e, timestamp: options.timestamp, ui_type: "group_actions" });
                console.log(group_id, local_value.effect, { timestamp: options.timestamp, ui_type: "group_actions" });

                //console.log(document.body);
                //console.log(getEntityHierarchyElement("54814714446"));
              };
          }
        }
      }
    }

    //Return statement
    return (context_menu_el) ? context_menu_el : undefined;
  }

  /*
    printGroupActionNavigationMenu() - Prints the group actions navigation menu - in this case, visible by default.
    arg0_group_id: (String) - The group ID for which to display the navigation menu for.
    arg1_parent_el: (HTMLElement) - The HTMLElement to assign the navigation menu to.

    Returns: (HTMLElement)
  */
  function printGroupActionsNavigationMenu (arg0_group_id, arg1_parent_el) {
    //Convert from parameters
    var group_id = arg0_group_id;
    var parent_el = arg1_parent_el;

    //Declare local instance variables
    var common_defines = config.defines.common;
    var common_selectors = common_defines.selectors;
    var group_el = getGroupElement(group_id);
    var timestamp = convertTimestampToInt(getTimestamp(main.date));

    //Calculate top_string
    var container_el = document.querySelector(common_selectors.hierarchy);
    var parent_offset = getY(parent_el, container_el);
    var top_string = `calc(${container_el.offsetTop}px + ${parent_offset}px)`;

    //Create local context menu
    var group_actions_anchor_el = getGroupActionsAnchorElement(group_id);
    var group_actions_navigation_obj = getGroupActionsNavigationObject();

    group_actions_anchor_el.style.top = top_string;
    group_actions_anchor_el.setAttribute("timestamp", timestamp);
    printGroupActionsContextMenu(group_id, group_actions_navigation_obj);

    //Set main.brush.selected_group_id
    selectGroup(group_id);
  }

  /*
    printGroupActionsNavigationMenuHandler() - Helper function. Provides the main interface through which printGroupActionsNavigationMenu() is invoked.
    arg0_hierarchy_key: (String) - The hierarchy key to populate group actions UIs for.
    arg1_group_id: (String) - The group ID for which to print the handdler.
  */
  function printGroupActionsNavigationMenuHandler (arg0_hierarchy_key, arg1_group_id) {
    //Convert from parameters
    var hierarchy_key = arg0_hierarchy_key;
    var group_id = arg1_group_id;

    //Declare local instance variables
    var common_selectors = config.defines.common.selectors;
    var parent_el = document.querySelector(`.group[data-id="${group_id}"]`)
      .querySelector(common_selectors.group_actions_context_menu_anchor);

    //Invoke printGroupActionsNavigationMenu()
    printGroupActionsNavigationMenu(group_id, parent_el);
  }

  /*
    refreshGroupActionsContextMenus() - Refreshes group actions context menu widths.
    arg0_group_id: (String) - The group ID to refresh group actions context menus for.

    Returns: (Number)
  */
  function refreshGroupActionsContextMenus (arg0_group_id) {
    //Convert from parameters
    var group_id = arg0_group_id;

    //Declare local instance variables
    var common_selectors = config.defines.common.selectors;
    var group_el = getGroupElement(group_id);

    if (!group_el) return; //Guard clause if group_el doesn't exist

    var hierarchy_el = document.querySelector(`${common_selectors.hierarchy}`);
    var left_sidebar_el = document.querySelector(`${common_selectors.left_sidebar}`);
    var interaction_container_el = group_el.querySelectorAll(`.interaction-container`)[0];

    var group_actions_anchor_el = group_el.querySelector(`${common_selectors.group_actions_context_menu_anchor}`);
    var group_actions_context_menus = interaction_container_el.querySelectorAll("div.context-menu[order]");
    var group_actions_context_width = left_sidebar_el.offsetWidth + 8;

    //Iterate over group_actions_context_menus; fetch current group actions context menu width. Set current width.
    group_actions_context_menus = sortElements(group_actions_context_menus, { attribute: "order" });
    for (var i = 0; i < group_actions_context_menus.length; i++) {
      //Set current position; track group_actions_context_width
      group_actions_context_menus[i].style.left = `${group_actions_context_width}px`;
      group_actions_context_menus[i].style.top = group_actions_anchor_el.style.top;
      group_actions_context_width += group_actions_context_menus[i].offsetWidth + 8;
    }

    //Close all other group action context menus
    var all_group_els = hierarchy_el.querySelectorAll(".group");
    group_id = group_el.getAttribute("data-id");

    for (var i = 0; i < all_group_els.length; i++)
      if (all_group_els[i].getAttribute("data-id") != group_id) {
        var local_context_menu_container = all_group_els[i].querySelector(`${common_selectors.group_actions_context_menu_anchor}`);

        local_context_menu_container.innerHTML = "";
      }

    //Update context menu inputs
    refreshGroupActionsContextMenuInputs(group_id);

    //Return statement
    return group_actions_context_width;
  }

  /*
    refreshGroupActionsContextMenuInputs() - Refreshes all group actions context menu inputs.
    arg0_group_id: (String) - The group ID which to refresh group actions context menus for.
  */
  function refreshGroupActionsContextMenuInputs (arg0_group_id) {
    //Convert from parameters
    var group_id = arg0_group_id;

    //Declare local instance variables
    var common_selectors = config.defines.common.selectors;
    var group_el = getGroupElement(group_id);
    var group_actions_anchor_el = group_el.querySelector(`${common_selectors.group_actions_context_menu_anchor}`);
    var group_actions_context_menus = group_actions_anchor_el.querySelectorAll(`${common_selectors.group_actions_context_menu_anchor} > .context-menu`);

    //Placeholder handlers
    //Iterate over all group_actions_context_menus; fetch their IDs and update their inputs based on .placeholders
    for (var i = 0; i < group_actions_context_menus.length; i++) {
      var group_action_obj = config.flattened_group_actions[group_actions_context_menus[i].id];
      var input_obj = getInputsAsObject(group_actions_context_menus[i], { group_id: group_id });

      if (group_action_obj)
        if (group_action_obj.interface) {
          var all_interface_keys = Object.keys(group_action_obj.interface);

          //Iterate over all_interface_keys to fill out input if placeholder exists
          for (var x = 0; x < all_interface_keys.length; x++) {
            var local_value = group_action_obj.interface[all_interface_keys[x]];

            //Make sure local_value.placeholder is a valid field before filling it in
            var local_input_el = group_actions_context_menus[i].querySelector(`#${local_value.id}`);
            if (local_value.placeholder)
              fillInput({
                element: local_input_el,
                type: local_input_el.getAttribute("type"),
                placeholder: input_obj[local_value.placeholder]
              });
          }
        }
    }
  }
}
