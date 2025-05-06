//Initialise functions
{
  /*
    closeEntityKeyframeContextMenu() - Closes entity keyframe context menus for a specific order.
    arg0_entity_id: (String) - The entity ID for which to close a menu.
    arg1_order: (Number) - The order which to target to remove.
  */
  function closeEntityKeyframeContextMenu (arg0_entity_id, arg1_order) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var order = (arg1_order) ? arg1_order : 1;

    //Declare local instance variables
    var entity_keyframe_anchor_el = getEntityKeyframesAnchorElement(entity_id);

    //Fetch local entity keyframe context menu and close it
    var entity_keyframe_el = entity_keyframe_anchor_el.querySelector(`[order="${order}"]`);
    entity_keyframe_el.remove();
    refreshEntityKeyframeContextMenus(entity_id);
  }

  /*
    closeEntityKeyframeContextMenus() - Closes all entity keyframe context menus.
    arg0_entity_id: (String) - The entity ID for which to close all menus.
  */
  function closeEntityKeyframeContextMenus (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var entity_keyframe_anchor_selector = getEntityKeyframesAnchorElement(entity_id, { return_selector: true });

    //Fetch local entity keyframe context menus and close all of them
    var entity_keyframe_els = document.querySelectorAll(`${entity_keyframe_anchor_selector} > .context-menu`);

    //Iterate over all entity_keyframe_els
    for (var i = 0; i < entity_keyframe_els.length; i++)
      entity_keyframe_els[i].remove();
  }

  /*
    closeEntityKeyframeLastContextMenu() - Closes the last opened keyframe context menu for an entity.
    arg0_entity_id: (String) - The entity ID for which to close the last opened menu.
  */
  function closeEntityKeyframeLastContextMenu (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var entity_open_orders = getEntityKeyframeOpenOrders(entity_id);

    //Close last keyframe context menu
    closeEntityKeyframeContextMenu(entity_id, entity_open_orders[entity_open_orders.length - 1]);
  }

  /*
    getEntityKeyframesAnchorElement() - Fetches the keyframe HTMLElement or selector of a given entity's entity keyframe anchor element.
    arg0_entity_id: (String) - The entity ID for which to fetch the selector for.
    arg1_options: (Object)
      return_selector: (Boolean) - Optional. Whether or not to return the selector instead of the HTMLElement. False by default.
  */
  function getEntityKeyframesAnchorElement (arg0_entity_id, arg1_options) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var common_selectors = config.defines.common.selectors;
    var entity_el = getEntityElement(entity_id);
    var entity_keyframe_anchor_el = entity_el.querySelector(`${common_selectors.entity_keyframe_context_menu_anchor}`);
    var entity_selector = `${common_selectors.entity_ui}[class*=" ${entity_id}"]`;

    //Return statement
    return (!options.return_selector) ?
      entity_keyframe_anchor_el :
      `${entity_selector} ${common_selectors.entity_keyframe_context_menu_anchor}`;
  }

  /*
    getEntityKeyframeOpenOrders() - Fetches all currently opened orders for entity keyframe context menus as an array.
    arg0_entity_id: (String) - The entity ID for which to fetch currently opened orders.

    Returns: (Array<Number>)
  */
  function getEntityKeyframeOpenOrders (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var entity_keyframe_anchor_selector = getEntityKeyframesAnchorElement(entity_id, { return_selector: true });
    var entity_keyframe_els = document.querySelectorAll(`${entity_keyframe_anchor_selector} .context-menu`);
    var unique_orders = [];

    //Iterate over all entity_keyframe_els; get unique orders
    for (var i = 0; i < entity_keyframe_els.length; i++) {
      var local_order = entity_keyframe_els[i].getAttribute("order");

      if (local_order)
        if (!unique_orders.includes(local_order))
          unique_orders.push(local_order);
    }

    //Return statement
    return unique_orders;
  }

  /*
    getEntityKeyframesInputObject() - Fetches the merged input object for a given Entity UI's keyframes menu.
    arg0_entity_id: (String) - The entity ID for which to return the input object for.

    Returns: (Object)
  */
  function getEntityKeyframesInputObject (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var entity_keyframes_anchor_el = getEntityKeyframesAnchorElement(entity_id);
    var inputs_obj = {};

    //Iterate over all_context_menu_els
    var all_context_menu_els = entity_keyframes_anchor_el.querySelectorAll(".context-menu");

    for (var i = 0; i < all_context_menu_els.length; i++)
      inputs_obj = dumbMergeObjects(inputs_obj, getInputsAsObject(all_context_menu_els[i], {
        entity_id: entity_id
      }));

    //Return statement
    return inputs_obj;
  }

  /*
    printEntityKeyframeContextMenu() - Prints an entity keyframe context menu based on an EntityKeyframe object.
    arg0_entity_id: (String) - The entity ID for which to print the context menu for.
    arg1_entity_keyframe: (Object) - The entity keyframe action to be referenced from config.entity_keyframes.
    arg2_options: (Object)
      <key>: (Variable) - The placeholder value to assign to the given context menu.
      timestamp: (Object, Date/Number) - The timestamp the keyframe is referencing.

    Returns: (HTMLElement)
  */
  function printEntityKeyframeContextMenu (arg0_entity_id, arg1_entity_keyframe, arg2_options) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var entity_keyframe = arg1_entity_keyframe;
    var options = (arg2_options) ? arg2_options : {};

    //Declare local instance variables
    var common_defines = config.defines.common;
    var common_selectors = common_defines.selectors;
    var entity_keyframe_obj = getEntityKeyframe(entity_keyframe);
    var entity_obj = getEntity(entity_id);

    //Initialise interfaces[entity_id] if it doesn't exist
    if (!global.interfaces[entity_id]) global.interfaces[entity_id] = {
      id: entity_id,
      entity_obj: entity_obj,
      options: {}
    };

    //Refresh entity keyframe context menus first; then append the current context menu
    var context_menu_ui = {};

    //Parse given .interface from entity_keyframe_obj if applicable
    if (entity_keyframe_obj.interface) {
      var entity_el = getEntityElement(entity_id);
      var entity_keyframe_anchor_el = getEntityKeyframesAnchorElement(entity_id);
      var entity_keyframe_order = (entity_keyframe_obj.order != undefined) ? entity_keyframe_obj.order : 1;
      var entity_selector = getEntityElement(entity_id, { return_selector: true });
      var lowest_order = config.entity_keyframes_lowest_order;

      //Initialise options
      if (!options.timestamp) options.timestamp = entity_keyframe_anchor_el.getAttribute("timestamp");

      //Check to see if given entity_keyframe_obj is of the lowest order. If so, set "timestamp" attribute
      if (entity_keyframe_order == config.entity_keyframes_lowest_order)
        entity_keyframe_anchor_el.setAttribute("timestamp", options.timestamp);

      //Delete given order if already extant
      if (entity_el.querySelector(`${common_selectors.entity_keyframe_context_menu_anchor} [order="${entity_keyframe_order}"]`))
        closeEntityKeyframeContextMenu(entity_id, entity_keyframe_order);

      //Append dummy context menu div first for context_menu_ui to append to
      var context_menu_el = document.createElement("div");

      context_menu_el.setAttribute("class", "context-menu");
      context_menu_el.id = entity_keyframe_obj.id;
      context_menu_el.setAttribute("order", entity_keyframe_order);
      entity_keyframe_anchor_el.appendChild(context_menu_el);

      //Initialise context_menu_ui options
      context_menu_ui.anchor = `${entity_selector} ${common_selectors.entity_keyframe_context_menu_anchor} .context-menu#${entity_keyframe_obj.id}`;
      if (entity_keyframe_obj.class) context_menu_ui.class = entity_keyframe_obj.class;
      if (entity_keyframe_obj.name) context_menu_ui.name = entity_keyframe_obj.name;
      if (entity_keyframe_obj.maximum_height) context_menu_ui.maximum_height = entity_keyframe_obj.maximum_height;
      if (entity_keyframe_obj.maximum_width) context_menu_ui.maximum_width = entity_keyframe_obj.maximum_width;

      //Initialise preliminary context menu first
      if (entity_keyframe_obj.interface) {
        var new_interface = JSON.parse(JSON.stringify(entity_keyframe_obj.interface));
        new_interface.anchor = context_menu_ui.anchor;

        var keyframe_context_menu_ui = createContextMenu(new_interface);
        refreshEntityKeyframeContextMenus(entity_id);
      }

      //Iterate over all_interface_keys and parse them correctly
      var all_interface_keys = Object.keys(entity_keyframe_obj.interface);

      for (let i = 0; i < all_interface_keys.length; i++) {
        let local_value = entity_keyframe_obj.interface[all_interface_keys[i]];

        if (!Array.isArray(local_value) && typeof local_value == "object") {
          let local_element = document.querySelector(`${context_menu_ui.anchor} #${local_value.id}`);
          if (!local_value.id) local_value.id = all_interface_keys[i];

          //Type handlers: set placeholders where applicable
          autoFillInputs({
            element: local_element,
            type: local_value.type,
            placeholder: local_value.placeholder,
            value: local_value
          });

          //Parse .effect to .onclick event handler
          if (local_value.effect)
            local_element.onclick = function (e) {
              parseEffect(entity_id, local_value.effect, { timestamp: options.timestamp, ui_type: "entity_keyframes" });
              console.log(entity_id, local_value.effect, { timestamp: options.timestamp, ui_type: "entity_keyframes" });
            };
        }
      }
    }

    //Return statement
    return (context_menu_el) ? context_menu_el : undefined;
  }

  /*
    printEntityKeyframeNavigationMenu() - Prints the base navigation menu for entity keyframes based upon its lowest order.
    arg0_entity_id: (String) - The entity ID for which to print the base navigation menu.
    arg1_parent_el: (HTMLElement) - The parent element in which to print the navigation menu.
  */
  function printEntityKeyframeNavigationMenu (arg0_entity_id, arg1_parent_el) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var parent_el = arg1_parent_el;

    //Declare local instance variables
    var common_defines = config.defines.common;
    var common_selectors = common_defines.selectors;
    var entity_el = getEntityElement(entity_id);
    var timestamp = parent_el.parentElement.getAttribute("timestamp");

    //Calculate top_string
    var bio_container_el = entity_el.querySelector(common_selectors.entity_bio_container);
    var parent_offset = getY(parent_el, bio_container_el);
    var top_string = `calc(${bio_container_el.offsetTop}px + ${parent_offset}px)`;

    //Create local context menu
    var entity_keyframe_anchor_el = getEntityKeyframesAnchorElement(entity_id);
    var entity_keyframe_navigation_obj = getEntityKeyframesNavigationObject();

    entity_keyframe_anchor_el.style.top = top_string;
    entity_keyframe_anchor_el.setAttribute("timestamp", timestamp);
    printEntityKeyframeContextMenu(entity_id, entity_keyframe_navigation_obj);
  }

  /*
    refreshEntityKeyframeContextMenus() - Refreshes entity keyframe context menu widths.
    arg0_entity_id: (String) - The entity ID to refresh entity keyframe context menus for.

    Returns: (Number) - The amount of pixels currently taken up horizontally by extant context menus.
  */
  function refreshEntityKeyframeContextMenus (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var common_selectors = config.defines.common.selectors;
    var entity_el = getEntityElement(entity_id);
    var entity_header_el = entity_el.querySelector(common_selectors.entity_ui_header);
    var entity_keyframe_anchor_el = entity_el.querySelector(`${common_selectors.entity_keyframe_context_menu_anchor}`);
    var entity_keyframe_context_menus = entity_keyframe_anchor_el.querySelectorAll(`${common_selectors.entity_keyframe_context_menu_anchor} > .context-menu`);
    var entity_keyframe_context_width = entity_header_el.offsetWidth + 8; //Measured in px

    //Iterate over entity_keyframe_context_menus; fetch current entity keyframe context menu width. Set current width
    entity_keyframe_context_menus = sortElements(entity_keyframe_context_menus, { attribute: "order" });
    for (var i = 0; i < entity_keyframe_context_menus.length; i++) {
      //Set current position; track entity_keyframe_context_width
      entity_keyframe_context_menus[i].style.left = `${entity_keyframe_context_width}px`;
      entity_keyframe_context_width += entity_keyframe_context_menus[i].offsetWidth + 8;
    }

    //Update context menu inputs
    refreshEntityKeyframeContextMenuInputs(entity_id);

    //Return statement
    return entity_keyframe_context_width;
  }

  /*
    refreshEntityKeyframeContextMenuInputs() - Refreshes all entity keyframe context menu inputs.
    arg0_entity_id: (String) - The entity ID which to refresh entity keyframe context menus for.
  */
  function refreshEntityKeyframeContextMenuInputs (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var common_selectors = config.defines.common.selectors;
    var entity_el = getEntityElement(entity_id);
    var entity_keyframe_anchor_el = entity_el.querySelector(`${common_selectors.entity_keyframe_context_menu_anchor}`);
    var entity_keyframe_context_menus = entity_keyframe_anchor_el.querySelectorAll(`${common_selectors.entity_keyframe_context_menu_anchor} > .context-menu`);
    var entity_timestamp = entity_keyframe_anchor_el.getAttribute("timestamp");

    //Placeholder handlers
    //Iterate over all entity_keyframe_context_menus; fetch their IDs and update their inputs based on .placeholders
    for (var i = 0; i < entity_keyframe_context_menus.length; i++) {
      var entity_keyframe_obj = config.flattened_entity_keyframes[entity_keyframe_context_menus[i].id];
      var input_obj = getInputsAsObject(entity_keyframe_context_menus[i], { entity_id: entity_id });

      if (entity_keyframe_obj)
        if (entity_keyframe_obj.interface) {
          var all_interface_keys = Object.keys(entity_keyframe_obj.interface);

          //Iterate over all_interface_keys to fill out inputs if placeholder exists
          for (var x = 0; x < all_interface_keys.length; x++) {
            var local_value = entity_keyframe_obj.interface[all_interface_keys[x]];

            //Make sure local_value.placeholder is a valid field before filling it in
            var local_input_el = entity_keyframe_context_menus[i].querySelector(`#${local_value.id}`);
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
