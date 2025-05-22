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
  function createContextMenuIndex (arg0_options) { //[WIP] - Finish function body
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
