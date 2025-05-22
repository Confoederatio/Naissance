//UI window functions
{
  function closePopup () {
    map.closePopup();
  }

  function hideElement (arg0_element) {
    //Convert from parameters
    var element = arg0_element;

    //Declare local instance variables
    var class_name = element.getAttribute("class");

    if (!class_name.includes(" hidden"))
      (class_name) ?
        element.setAttribute("class", `${class_name} hidden`) :
        element.setAttribute("class", " hidden");
  }

  /**
   * createContextMenuIndex() - Creates a context menu indexing framework.
   * @param [arg0_options]
   *  @param {String} [arg0_options.config_key] - The main config key where action categories are stored, i.e. 'group_actions'.
   *  @param {String} [arg0_options.namespace] - The namespace in which to define global-level functions belonging to this index, i.e. 'GroupActions'.
   */
  function createContextMenuIndex (arg0_options) {
    //Convert from parameters
    var options = (arg0_options) ? arg0_options : {};

    //Declare local instance variables
    config[`flattened_${options.config_key}`] = dumbFlattenObject(config[options.config_key]);
    if (!config.defines.common[`reserved_${options.config_key}`])
      config.defines.common[`reserved_${options.config_key}`] = [];

    global[`getAll${options.namespace}s`] = function (arg0_options) {
      //Convert from parameters
      var local_options = (arg0_options) ? arg0_options : {};

      //Declare local instance variables
      var common_defines = config.defines.common;
      var flattened_namespace = config[`flattened_${options.config_key}`];
      var return_namespace = [];
      var return_keys = [];

      //Iterate over all_flattened_namespace
      var all_flattened_namespace = Object.keys(flattened_namespace);

      for (var i = 0; i < all_flattened_namespace.length; i++)
        if (!common_defines[`reserved_${options.config_key}`].includes(all_flattened_namespace[i])) {
          return_namespace.push(flattened_namespace[all_flattened_namespace[i]]);
          return_keys.push(all_flattened_namespace[i]);
        }

      //Return statement
      return (!local_options.return_keys) ? return_namespace : return_keys;
    };

    global[`get${options.namespace}`] = function (arg0_name, arg1_options) {
      //Convert from parameters
      var name = arg0_name;
      var local_options = (arg1_options) ? arg1_options : {};

      //Guard clause for objects; direct keys
      if (typeof name == "object") return name;
      if (config[`flattened_${options.config_key}`][name]) return (!local_options.return_key) ? config[`flattened_${options.config_key}`][name] : name;

      //Declare local instance variables
      var namespace_exists = [false, ""]; //[namespace_exists, namespace_key];
      var search_name = name.toLowerCase().trim();

      //ID search - soft search 1st, hard search 2nd
      {
        //Iterate over config[`all_${options.config_key}`]
        for (var i = 0; i < config[`all_${options.config_key}`].length; i++) {
          var local_value = config[`all_${options.config_key}`][i];

          if (local_value.id.toLowerCase().includes(search_name))
            namespace_exists = [true, local_value.key];
        }
        for (var i = 0; i < config[`all_${options.config_key}`].length; i++) {
          var local_value = config[`all_${options.config_key}`][i];

          if (local_value.id.toLowerCase() == search_name)
            namespace_exists = [true, local_value.key];
        }
      }

      //Name search - soft search 1st, hard search 2nd
      {
        //Iterate over config[`all_${options.config_key}`]
        for (var i = 0; i < config[`all_${options.config_key}`].length; i++) {
          var local_value = config[`all_${options.config_key}`][i];

          if (local_value.name)
            if (local_value.name.toLowerCase().includes(search_name))
              namespace_exists = [true, local_value.key];
        }
        for (var i = 0; i < config[`all_${options.config_key}`].length; i++) {
          var local_value = config[`all_${options.config_key}`][i];

          if (local_value.name)
            if (local_value.name.toLowerCase() == search_name)
              namespace_exists = [true, local_value.key];
        }
      }

      //Return statement
      if (namespace_exists[0])
        return (!local_options.return_key) ? config[`flattened_${options.config_key}`][namespace_exists[1]] : namespace_exists[1];
    };

    global[`get${options.namespace}sAtOrder`] = function (arg0_options) {
      //Convert from parameters
      var local_options = (arg0_options) ? arg0_options : {};

      //Declare local instance variables
      var flattened_namespace = config[`flattened_${options.config_key}`];
      var order = (local_options.order != undefined) ? local_options.order : 1;
      var return_namespaces = [];
      var return_keys = [];
      var return_obj = {};

      //Iterate over all_flattened_namespace
      var all_flattened_namespace = Object.keys(flattened_namespace);

      for (var i = 0; i < all_flattened_namespace.length; i++) {
        var local_namespace = flattened_namespace[all_flattened_namespace[i]];

        if (local_namespace.order == order) {
          return_namespaces.push(local_namespace);
          return_keys.push(all_flattened_namespace[i]);
        }
      }

      //local_options.return_object handler
      if (local_options.return_object) {
        for (var i = 0; i < return_namespaces.length; i++)
          return_obj[return_keys[i]] = return_namespaces[i];
        //Return statement
        return return_obj;
      }

      //Return statement
      return (!local_options.return_key) ? return_namespaces : return_keys;
    };

    global[`get${options.namespace}sCategory`] = function (arg0_name, arg1_options) {
      //Convert from parameters
      var name = arg0_name;
      var local_options = (arg1_options) ? arg1_options : {};

      //Guard clause for objects; direct keys
      if (typeof name == "object") return name;
      if (config[local_options.config_key][name]) return (!local_options.return_key) ? config[local_options.config_key][name] : name;

      //Declare local instance variables
      var all_namespaces = Object.keys(config[local_options.config_key]);
      var namespace_exists = [false, ""]; //[namespace_exists, namespace_key];
      var search_name = name.toLowerCase().trim();

      //ID search - soft search 1st, hard search 2nd
      {
        //Iterate over all_namespaces
        for (var i = 0; i < all_namespaces.length; i++) {
          var local_value = config[local_options.config_key][all_namespaces[i]];

          if (local_value.id.toLowerCase().includes(search_name))
            namespace_exists = [true, all_namespaces[i]];
        }
        for (var i = 0; i < all_namespaces.length; i++) {
          var local_value = config[local_options.config_key][all_namespaces[i]];

          if (local_value.id.toLowerCase() == search_name)
            namespace_exists = [true, all_namespaces[i]];
        }
      }

      //Name search - soft search 1st, hard search 2nd
      {
        //Iterate over all_namespaces
        for (var i = 0; i < all_namespaces.length; i++) {
          var local_value = config[local_options.config_key][all_namespaces[i]];

          if (local_value.name)
            if (local_value.name.toLowerCase().includes(search_name))
              namespace_exists = [true, all_namespaces[i]];
        }
        for (var i = 0; i < all_namespaces.length; i++) {
          var local_value = config[local_options.config_key][all_namespaces[i]];

          if (local_value.name)
            if (local_value.name.toLowerCase() == search_name)
              namespace_exists = [true, all_namespaces[i]];
        }
      }

      //Return statement
      if (namespace_exists[0])
        return (!local_options.return_key) ? config[local_options.config_key][namespace_exists[1]] : namespace_exists[1];
    };

    global[`get${options.namespace}sInput`] = function (arg0_namespace_id, arg1_input_id) {
      //Convert from parameters
      var namespace_id = arg0_namespace_id;
      var input_id = arg1_input_id;

      //Declare local instance variables
      var namespace_obj = global[`get${options.namespace}`](namespace_id);

      if (namespace_obj)
        if (namespace_obj.interface) {
          //Guard clause if citing direct key
          if (namespace_obj.interface[input_id]) return namespace_obj.interface[input_id];

          //Iterate over all_inputs
          var all_inputs = Object.keys(namespace_obj.interface);

          for (var i = 0; i < all_inputs.length; i++) {
            var local_input = namespace_obj.interface[all_inputs[i]];

            if (!Array.isArray(local_input) && typeof local_input == "object")
              if (local_input.id == input_id)
                  //Return statement
                return local_input;
          }
        }
    };

    global[`get${options.namespace}sLowestOrder`] = function (arg0_options) {
      //Convert from parameters
      var local_options = (arg0_options) ? arg0_options : {};

      //Declare local instance variables
      var flattened_namespace = config[`flattened_${options.config_key}`];
      var min_order = Infinity;

      //Iterate over all_flattened_namespace
      var all_flattened_namespace = Object.keys(flattened_namespace);

      for (var i = 0; i < all_flattened_namespace.length; i++) {
        var local_namespace = flattened_namespace[all_flattened_namespace[i]];

        if (local_namespace.order != undefined)
          min_order = Math.min(min_order, local_namespace.order);
      }

      //Return statement
      return min_order;
    };

    global[`get${options.namespace}sNavigationObject`] = function () {
      //Declare local instance variables
      var flattened_namespace = config[`flattened_${options.config_key}`];
      var lowest_order = global[`get${options.namespace}sLowestOrder`]();
      var navigation_obj = global[`get${options.namespace}sAtOrder`]({ order: lowest_order, return_object: true });

      //Return statement
      return (navigation_obj.navigation_ui) ? navigation_obj.navigation_ui : navigation_obj;
    };

    //Initialise config variables
    config[`all_${options.config_key}`] = global[`getAll${options.namespace}s`]();
    config[`all_${options.config_key}_keys`] = global[`getAll${options.namespace}s`]({ return_keys: true });
    config[`${options.config_key}_lowest_order`] = global[`get${options.namespace}sLowestOrder`]();
  }

  /**
   * createContextMenuInterface() - Creates a context menu interface framework. Note here that only the navigation menu is unique.
   * @param [arg0_options]
   *  @param {String} [arg0_options.anchor]
   *  @param {String} [arg0_options.config_key]
   *  @param {String} [arg0_options.interface_key=arg0_options.config_key]
   *  @param {String} [arg0_options.left_margin] - The CSS calc attribute to prepend when calculating offset margins.
   *  @param {String} [arg0_options.right_margin] - The CSS calc attribute to prepend when calculating offset margins.
   *  @param {String} [arg0_options.namespace]
   *  @param {String} [arg0_options.navigation_mode="list"] - Either 'icons'/'list'/'list_icons'. Brush actions: 'icons', Entity actions: 'list_icons', Entity keyframes: 'list', Group actions: 'list'
   *  @param {String} [arg0_options.type="default"] - Either 'default'/'entity'/'group'
   */
  //NOTE: It would probably be better to use a long-context model; i.e. Gemini to merge all this boilerplate
  function createContextMenuInterface (arg0_options) { //[WIP] - Finish function body
    //Convert from parameters
    var options = (arg0_options) ? arg0_options : {};

    //Initialise options
    if (!options.interface_key) options.interface_key = options.config_key;
    if (!options.navigation_mode) options.navigation_mode = "list";
    if (!options.type) options.type = "default";

    //Declare local instance variables


    /**
     * close<namespace>ContextMenu() - Closes entity actions context menus for a specific order.
     * @param {number} arg0_order
     * @param {Object} [arg1_options]
     */
    global[`close${options.namespace}ContextMenu`] = function (arg0_order, arg1_options) {
      //Convert from parameters
      var order = returnSafeNumber(arg0_order, 1);
      var local_options = (arg0_options) ? arg0_options : {};

      //Declare local instance variables
      var namespace_el = global[`get${options.namespace}sElement`](local_options);

      //Fetch local namespace context menu and close it
      var namespace_el = namespace_el.querySelector(`[order="${order}"]`);
      namespace_el.remove();
      global[`refresh${options.namespace}sContextMenus`](local_options);
    };

    global[`close${options.namespace}ContextMenus`] = function (arg0_options) {
      //Convert from parameters
      var local_options = (arg0_options) ? arg0_options : {};

      //Declare local instance variables
      var namespace_anchor_selector = global[`get${options.namespace}sAnchorElement`]({ ...local_options, return_selector: true });

      //Fetch local namespace context menus and close all of them
      var namespace_els = document.querySelectorAll(`${namespace_anchor_selector} > .context-menu`);

      //Iterate over all namespace_els
      for (var i = 0; i < namespace_els.length; i++)
        namespace_els[i].remove();
    };

    global[`close${options.namespace}LastContextMenu`] = function (arg0_options) {
      //Convert from parameters
      var local_options = (arg0_options) ? arg0_options : {};

      //Declare local instance variables
      var namespace_open_orders = global[`get${options.namespace}OpenOrders`](local_options);

      //Close last namespace context menu
      global[`close${options.namespace}ContextMenu`](namespace_open_orders[namespace_open_orders.length - 1], local_options);
    };

    global[`get${options.namespace}sAnchorElement`] = function (arg0_options) {
      //Convert from parameters
      var local_options = (arg0_options) ? arg0_options : {};

      //Declare local instance variables
      var common_selectors = config.defines.common.selectors;

      if (options.type == "default") {
        var namespace_anchor_el = document.querySelector(options.anchor);

        //Return statement
        return (!local_options.return_selector) ?
          namespace_anchor_el :
          options.anchor;
      } else if (options.type == "entity") {
        var entity_el = getEntityElement(local_options.entity_id);

        var entity_anchor_el = entity_el.querySelector(options.anchor);
        var entity_selector = `${common_selectors.entity_ui}[class*=" ${local_options.entity_id}"]`;

        //Return statement
        return (!local_options.return_selector) ?
          entity_anchor_el :
          `${entity_selector} ${options.anchor}`;
      } else if (options.type == "group") {
        var group_el = getGroupElement(local_options.group_id);

        var group_anchor_el = group_el.querySelector(options.anchor);
        var group_selector = `${common_selectors.group_ui}[data-id="${group_id}"]`;

        //Return statement
        return (!local_options.return_selector) ?
          group_anchor_el :
          `${group_selector} ${options.anchor}`;
      }
    };

    global[`get${options.namespace}sOpenOrders`] = function () {
      //Declare local instance variables
      var namespace_anchor_selector = global[`get${options.namespace}sAnchorElement`]({ return_selector: true });
      var namespace_els = document.querySelectorAll(`${namespace_anchor_selector} > .context-menu`);
      var unique_orders = [];

      //Iterate over all namespace_els
      for (var i = 0; i < namespace_els.length; i++) {
        var local_order = namespace_els[i].getAttribute("order");

        if (local_order != undefined) {
          local_order = parseInt(local_order);
          if (!unique_orders.includes(local_order))
            unique_orders.push(local_order);
        }
      }

      //Return statement
      return unique_orders;
    };

    global[`get${options.namespace}sInputObject`] = function () {
      //Declare local instance variables
      var namespace_anchor_el = global[`get${options.namespace}sAnchorElement`]();
      var inputs_obj = {};

      //Iterate over all_context_menu_els
      var all_context_menu_els = namespace_anchor_el.querySelectorAll(".context-menu");

      for (var i = 0; i < all_context_menu_els.length; i++)
        inputs_obj = dumbMergeObjects(inputs_obj, getInputsAsObject(all_context_menu_els[i]));

      //Return statement
      return inputs_obj;
    };

    global[`print${options.namespace}sContextMenu`] = function (arg0_namespace_obj, arg1_options) { //[WIP] -Finish function body
      //Convert from parameters
      var namespace_obj = arg0_namespace_obj;
      var local_options = (arg1_options) ? arg1_options : {};

      //Declare local instance variables
      var common_selectors = config.defines.common.selectors;

      if (options.type == "default") {
        //Initialise interfaces.brush if it doesn't exist
        if (!global.interfaces[options.interface_key]) global.interfaces[options.interface_key] = {
          id: options.interface_key,
          options: {}
        };

        //Refresh namespace context menus first; then append the current context menu
        var context_menu_ui = {};

        //Parse given .interface from namespace_obj if applicable
        if (namespace_obj.interface) {
          var namespace_anchor_el = global[`get${options.namespace}sAnchorElement`]();
          var namespace_anchor_selector = global[`get${options.namespace}sAnchorElement`]({ return_selector: true });
          var namespace_order = (namespace_obj.order != undefined) ? namespace_obj.order : 1;
          var lowest_order = config[`${options.config_key}_lowest_order`];

          //Delete given order if already extant
          if (namespace_anchor_el.querySelector(`[order="${namespace_order}"]`))
            global[`close${options.namespace}ContextMenu`](namespace_order, local_options);

          //Append dummy context menu div first for context_menu_ui to append to
          var context_menu_el = document.createElement("div");

          context_menu_el.setAttribute("class", "context-menu");
          context_menu_el.id = namespace_obj.id;
          context_menu_el.setAttribute("order", namespace_order);
          namespace_anchor_el.appendChild(context_menu_el);

          //Initialise context_menu_ui options
        }
      } else if (options.type == "entity") {

      } else if (options.type == "group") {

      }
    };
  }

  function updateSidebarHover () {
    //Declare local instance variables
    var all_hovers = document.querySelectorAll(`.hierarchy-elements-container div:hover`);
    var all_legacy_hovers = document.querySelectorAll(`.hover`);

    //Clear all elements with .hover class
    for (var i = 0; i < all_legacy_hovers.length; i++)
      all_legacy_hovers[i].setAttribute("class",
        all_legacy_hovers[i].getAttribute("class").replace(" hover", "")
      );

    //Set only last hover to be hovered
    if (all_hovers.length > 0) {
      var local_class = all_hovers[all_hovers.length - 1].getAttribute("class");

      (local_class) ?
        all_hovers[all_hovers.length - 1].setAttribute("class",
          local_class + " hover"
        ) :
        all_hovers[all_hovers.length - 1].setAttribute("class", " hover");
    }
  }

  function toggleElementVisibility (arg0_element, arg1_button_element) {
    //Convert from parameters
    var element = arg0_element;
    var btn_element = arg1_button_element;

    //Declare local instance variables
    var class_name = element.getAttribute("class");
    var is_visible = true;

    if (class_name)
      if (class_name.includes(" hidden"))
        is_visible = false;

    (is_visible) ?
      hideElement(element) :
      showElement(element);

    //Set button element class if present
    if (btn_element)
      (is_visible) ?
        btn_element.setAttribute("class", btn_element.getAttribute("class").replace(" minimise-icon", " reverse-minimise-icon")) :
        btn_element.setAttribute("class", btn_element.getAttribute("class").replace(" reverse-minimise-icon", " minimise-icon"));
  }
}
