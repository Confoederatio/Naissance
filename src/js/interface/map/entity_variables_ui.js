//Initialise functions
{
  /**
   * closeEntityVariableContextMenu() - Closes entity variable context menus for a specific order.
   * @param {string} arg0_entity_id
   * @param {number} arg1_order
   */
  function closeEntityVariableContextMenu (arg0_entity_id, arg1_order) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var order = (arg1_order) ? arg1_order : 1;

    //Declare local instance variables
    var entity_variable_anchor_el = getEntityVariablesAnchorElement(entity_id);
    
    //Fetch local entity variable context menu and close it
    var entity_variable_el = entity_variable_anchor_el.querySelector(`[order="${order}"]`);
    entity_variable_el.remove();
    refreshEntityVariableContextMenus(entity_id);
  }

  /**
   * closeEntityKeyframeContextMenus() - Closes all entity keyframe context menus.
   * @param {string} arg0_entity_id
   */
  function closeEntityKeyframeContextMenus (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var entity_variable_anchor_selector = getEntityVariablesAnchorElement(entity_id, { return_selector: true });

    //Fetch all entity variable context menus and close them
    var entity_variable_els = document.querySelectorAll(`${entity_variable_anchor_selector} > .context-menu`);

    //Iterate over all entity_variable_els
    for (var i = 0; i < entity_variable_els.length; i++)
      entity_variable_els[i].remove();
  }

  /** 
   * closeEntityVariableLastContextMenu() - Closes the last opened entity variable context menu.
   * @param {string} arg0_entity_id
   */
  function closeEntityVariableLastContextMenu (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    
    //Declare local instance variables
    var entity_open_orders = getEntityVariableOpenOrders(entity_id);

    //Close last entity variable context menu
    closeEntityVariableContextMenu(entity_id, entity_open_orders[entity_open_orders.length - 1]);
  }

  /**
   * getEntityVariablesAnchorElement() - Fetches the anchor element for entity variable context menus.
   * 
   * @param {string} arg0_entity_id
   * @param {Object} [arg1_options]
   * @returns {HTMLElement}
   */
  function getEntityVariablesAnchorElement (arg0_entity_id, arg1_options) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var common_selectors = config.defines.common.selectors;
    var entity_el = getEntityElement(entity_id);
    var entity_variable_anchor_el = entity_el.querySelector(`${common_selectors.entity_variable_context_menu_anchor}`);
    var entity_selector = `${common_selectors.entity_ui}[class*=" ${entity_id}"]`;

    //Return statement
    return (!options.return_selector) ?
      entity_variable_anchor_el :
      `${entity_selector} ${common_selectors.entity_variable_context_menu_anchor}`;
  }

  /**
   * getEntityVariablesInputObject() - Fetches the merged input object for a given Entity UI's variables menu.
   * @param {string} arg0_entity_id
   * 
   * @returns {Object}
   */
  function getEntityVariablesInputObject (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var entity_variables_anchor_el = getEntityVariablesAnchorElement(entity_id);
    var inputs_obj = {};

    //Iterate over all_context_menu_els
    var all_context_menu_els = entity_variables_anchor_el.querySelectorAll(".context-menu");
    
    for (var i = 0; i < all_context_menu_els.length; i++)
      inputs_obj = dumbMergeObjects(inputs_obj, getInputsAsObject(all_context_menu_els[i], {
        entity_id: entity_id
      }));

    //Return statement
    return inputs_obj;
  }

  /**
   * printEntityVariableContextMenu() - Prints an entity variable context menu based on an EntityVariable object.
   * @param {string} arg0_entity_id
   * @param {Object} arg1_entity_variable
   * @param {Object} [arg2_options]
   *  @param {string} [arg2_options."key"] - The placeholder value to assign to the given context menu.
   * 
   * @returns {HTMLElement}
   */
  function printEntityVariableContextMenu (arg0_entity_id, arg1_entity_variable, arg2_options) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var entity_variable = arg1_entity_variable;
    var options = (arg2_options) ? arg2_options : {};

    //Declare local instance variables
    var common_defines = config.defines.common;
    var common_selectors = common_defines.selectors;
    var entity_variable_obj = getEntityVariable(entity_variable);
    var entity_obj = getEntity(entity_id);

    //Initialise interfaces[entity_id] if it doesn't exist
    if (!global.interfaces[entity_id]) global.interfaces[entity_id] = {
      id: entity_id,
      entity_obj: entity_obj,
      options: {}
    };

    //Refresh entity variable context menus first; then append the current context menu
    var context_menu_ui = {};

    //Parse given .interface from entity_variable_obj if applicable
    if (entity_variable_obj.interface) {
      var entity_el = getEntityElement(entity_id);
      var entity_variable_anchor_el = getEntityVariablesAnchorElement(entity_id);
      var entity_variable_order = (entity_variable_obj.order != undefined) ? entity_variable_obj.order : 1;
      var entity_selector = getEntityElement(entity_id, { return_selector: true });
      var lowest_order = config.entity_keyframes_lowest_order;

      //Initialise options
      if (!options.timestamp) options.timestamp = entity_variable_anchor_el.getAttribute("timestamp");
      
      //Check to see if given entity_variable_obj is of the lowest order. If so, set "timestamp" attribute
      if (entity_variable_order == config.entity_keyframes_lowest_order)
        entity_variable_anchor_el.setAttribute("timestamp", options.timestamp);

      //Delete given order if already extant
      if (entity_el.querySelector(`${common_selectors.entity_variable_context_menu_anchor} [order="${entity_variable_order}"]`))
        closeEntityVariableContextMenu(entity_id, entity_variable_order);

      //Append dummy context menu div first for context_menu_ui to append to
      var context_menu_el = document.createElement("div");

      context_menu_el.setAttribute("class", global.default_ve_class);
      context_menu_el.id = entity_variable_obj.id;
      context_menu_el.setAttribute("order", entity_variable_order);
      entity_variable_anchor_el.appendChild(context_menu_el);

      //Initialise context_menu_ui options
      context_menu_ui.anchor = `${entity_selector} ${common_selectors.entity_variable_context_menu_anchor} .context-menu#${entity_variable_obj.id}`;
      if (entity_variable_obj.class) context_menu_ui.class = entity_variable_obj.class;
      if (entity_variable_obj.name) context_menu_ui.name = entity_variable_obj.name;
      if (entity_variable_obj.maximum_height) context_menu_ui.maximum_height = entity_variable_obj.maximum_height;
      if (entity_variable_obj.maximum_width) context_menu_ui.maximum_width = entity_variable_obj.maximum_width;

      //Initialise preliminary context menu first
      if (entity_variable_obj.interface) {
        var new_interface = JSON.parse(JSON.stringify(entity_variable_obj.interface));
        new_interface.anchor = context_menu_ui.anchor;
        new_interface.close_function = `closeEntityVariableContextMenu('${entity_id}', ${entity_variable_order}); refreshEntityVariableContextMenus('${entity_id}');`;
        
        var variable_context_menu_ui = createContextMenu(new_interface);
        refreshEntityVariableContextMenus(entity_id);
      }

      //Iterate over all_interface_keys and parse them correctly
      var all_interface_keys = Object.keys(entity_variable_obj.interface);

      for (let i = 0; i < all_interface_keys.length; i++) {
        let local_value = entity_variable_obj.interface[all_interface_keys[i]];

        if (!Array.isArray(local_value) && typeof local_value == "object") {
          let local_element = document.querySelector(`${context_menu_ui.anchor} #${local_value.id}`);
          if (!local_value.id) local_value.id = all_interface_keys[i];

          //Type handlers: set placeholders where applicable
          autoFillInput({
            element: local_element,
            type: local_value.type,
            placeholder: local_value.placeholder,
            value: local_value
          });

          //Parse .effect to .onclick event handler
          if (local_value.effect)
            local_element.onclick = function (e) {
              parseEffect(entity_id, local_value.effect, { timestamp: options.timestamp, ui_type: "entity_variables" });
            };
        }
      }
    }

    //Return statement
    return (context_menu_el) ? context_menu_el : undefined;
  }

  /**
   * printEntityVariableNavigationMenu() - Prints the base navigation menu for entity variables based upon its lowest order.
   * @param {string} arg0_entity_id
   */
  function printEntityVariableNavigationMenu (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var common_defines = config.defines.common;
    var common_selectors = common_defines.selectors;
    var entity_el = getEntityElement(entity_id);

    //Calculate top_string
    var customisation_container_el = entity_el.querySelector(common_selectors.entity_customisation_tab_container);
    var top_string = customisation_container_el.querySelector(common_selectors.entity_customisation_options).offsetTop;
    
    //Create local context menu
    var entity_variable_anchor_el = getEntityVariablesAnchorElement(entity_id);

    printEntityVariableContextMenu(entity_id, entity_variable_navigation_obj);
  }

  /**
   * refreshEntityVariableContextMenus() - Refreshes entity variable context menu widths.
   * @param {string} arg0_entity_id
   * 
   * @returns {number}
   */
  function refreshEntityVariableContextMenus (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    
    //Declare local instance variables
    var common_selectors = config.defines.common.selectors;
    var entity_el = getEntityElement(entity_id);
    var entity_header_el = entity_el.querySelector(common_selectors.entity_ui_header);  
    var entity_variable_anchor_el = entity_el.querySelector(`${common_selectors.entity_variable_context_menu_anchor}`);
    var entity_variable_context_menus = entity_variable_anchor_el.querySelectorAll(`${common_selectors.entity_variable_context_menu_anchor} > .context-menu`);
    var entity_variable_context_width = entity_header_el.offsetWidth + 8; //Measured in px

    //Iterate over all entity_variable_context_menus; fetch current entity variable context menu width. Set current width
    entity_variable_context_menus = sortElements(entity_variable_context_menus, { attribute: "order" });
    for (var i = 0; i < entity_variable_context_menus.length; i++) {
      entity_variable_context_menus[i].style.left = `${entity_variable_context_menus[i].offsetWidth}px`;
      entity_variable_context_width += entity_variable_context_menus[i].offsetWidth + 8;
    }

    //Update context menu inputs
    refreshEntityVariableContextMenuInputs(entity_id);

    //Return statement
    return entity_variable_context_width;
  }

  /**
   * refreshEntityVariableContextMenuInputs() - Refreshes all entity variable context menu inputs.
   * @param {string} arg0_entity_id
   */
  function refreshEntityVariableContextMenuInputs (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var common_selectors = config.defines.common.selectors;
    var entity_el = getEntityElement(entity_id);
    var entity_variable_anchor_el = entity_el.querySelector(`${common_selectors.entity_variable_context_menu_anchor}`);
    var entity_variable_context_menus = entity_variable_anchor_el.querySelectorAll(`${common_selectors.entity_variable_context_menu_anchor} > .context-menu`);
    
    //Placeholder handlers
    //Iterate over all entity_variable_context_menus; fetch their IDs and update their inputs based on .placeholders
    for (var i = 0; i < entity_variable_context_menus.length; i++) {
      var entity_keyframe_obj = config.flattened_entity_keyframes[entity_keyframe_context_menus[i].id];
      var input_obj = getInputsAsObject(entity_keyframe_context_menus[i], { entity_id: entity_id });

      if (entity_keyframe_obj)
        if (entity_keyframe_obj.interface) {
          var all_interface_keys = Object.keys(entity_keyframe_obj.interface);

          //Iterate over all_interface_keys to fill out inputs if placeholder exists
          for (var x = 0; x < all_interface_keys.length; x++) {
            var local_value = entity_keyframe_obj.interface[all_interface_keys[x]];

            //Make sure local_value.placeholder is a valid field before filling it in
            var local_input_el = entity_variable_context_menus[i].querySelector(`#${local_value.id}`);
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