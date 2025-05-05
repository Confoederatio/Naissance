//Initialise Brush Actions framework
{
  /*
    getAllBrushActions() - Fetches all brush actions as either an array of keys or objects.
    arg0_options: (Object)
      return_keys: (Boolean) - Optional. Whether or not to return an array of keys instead of objects. False by default.

    Returns: (Array<Object>/Array<String>)
  */
  function getAllBrushActions (arg0_options) {
    //Convert from parameters
    var options = (arg0_options) ? arg0_options : {};

    //Declare local instance variables
    var common_defines = config.defines.common;
    var flattened_brush_actions = config.flattened_brush_actions;
    var return_actions = [];
    var return_keys = [];

    //Iterate over all_flattened_brush_actions
    var all_flattened_brush_actions = Object.keys(flattened_brush_actions);

    for (var i = 0; i < all_flattened_brush_actions.length; i++)
      if (!common_defines.reserved_brush_actions.includes(all_flattened_brush_actions[i])) {
        return_actions.push(flattened_brush_actions[all_flattened_brush_actions[i]]);
        return_keys.push(all_flattened_brush_actions[i]);
      }

    //Return statement
    return (!options.return_actions) ? return_actions : return_keys;
  }

  /*
    getBrushAction() - Fetches a brush action.
    arg0_name: (String) - The name/ID of the brush action category.
    arg1_options: (Object)
      return_key: (Boolean) - Optional. Whether or not to return the key. False by default.

    Returns: (Object/String)
  */
  function getBrushAction (arg0_name, arg1_options) {
    //Convert from parameters
    var name = arg0_name;
    var options = (arg1_options) ? arg1_options : {};

    //Guard clause for objects; direct keys
    if (typeof name == "object") return name;
    if (config.flattened_brush_actions[name]) return (!options.return_key) ? config.flattened_brush_actions[name] : name;

    //Declare local instance variables
    var brush_actions_exists = [false, ""]; //[brush_actions_exists, brush_actions_key];
    var search_name = name.toLowerCase().trim();

    //ID search - soft search 1st, hard search 2nd
    {
      //Iterate over config.all_brush_actions
      for (var i = 0; i < config.all_brush_actions.length; i++) {
        var local_value = config.all_brush_actions[i];

        if (local_value.id.toLowerCase().includes(search_name))
          brush_actions_exists = [true, local_value.key];
      }
      for (var i = 0; i < config.all_brush_actions.length; i++) {
        var local_value = config.all_brush_actions[i];

        if (local_value.id.toLowerCase() == search_name)
          brush_actions_exists = [true, local_value.key];
      }
    }

    //Name search - soft search 1st, hard search 2nd
    {
      //Iterate over config.all_brush_actions
      for (var i = 0; i < config.all_brush_actions.length; i++) {
        var local_value = config.all_brush_actions[i];

        if (local_value.name)
          if (local_value.name.toLowerCase().includes(search_name))
            brush_actions_exists = [true, local_value.key];
      }
      for (var i = 0; i < config.all_brush_actions.length; i++) {
        var local_value = config.all_brush_actions[i];

        if (local_value.name)
          if (local_value.name.toLowerCase() == search_name)
            brush_actions_exists = [true, local_value.key];
      }
    }

    //Return statement
    if (brush_actions_exists[0])
      return (!options.return_key) ? config.flattened_brush_actions[brush_actions_exists[1]] : brush_actions_exists[1];
  }

  /*
    getBrushActionsAtOrder() - Fetches all brush actions belonging to a given .order.
    arg0_options: (Object)
      order: (Number) - Optional. The current order to fetch all relevant actions at. 1 by default.
      return_keys: (Boolean) - Optional. Whether or not to return an array of keys instead of objects. False by default.
      return_object: (Boolean) - Optional. Whether to return the array as an object or not. False by default.

    Returns: (Array<Object>/Array<String>/Object)
  */
  function getBrushActionsAtOrder (arg0_options) {
    //Convert from parameters
    var options = (arg0_options) ? arg0_options : {};

    //Declare local instance variables
    var flattened_brush_actions = config.flattened_brush_actions;
    var order = (options.order != undefined) ? options.order : 1;
    var return_actions = [];
    var return_obj = {};
    var return_keys = [];

    //Iterate over all_flattened_brush_actions
    var all_flattened_brush_actions = Object.keys(flattened_brush_actions);

    for (var i = 0; i < all_flattened_brush_actions.length; i++) {
      var local_action = flattened_brush_actions[all_flattened_brush_actions[i]];

      if (local_action.order == options.order) {
        return_actions.push(local_action);
        return_keys.push(all_flattened_brush_actions[i]);
      }
    }

    //options.return_object handler
    if (options.return_object) {
      for (var i = 0; i < return_actions.length; i++)
        return_obj[return_keys[i]] = return_actions[i];
      //Return statement
      return return_obj;
    }

    //Return statement
    return (!options.return_key) ? return_actions : return_keys;
  }

  /*
    getBrushActionsCategory() - Fetches a brush actions category object/key.
    arg0_name: (String) - The name/ID of the brush action category.
    arg1_options: (Object)
      return_key: (Boolean) - Optional. Whether or not to return the key. False by default.

    Returns: (Object/String)
  */
  function getBrushActionsCategory (arg0_name, arg1_options) {
    //Convert from parameters
    var name = arg0_name;
    var options = (arg1_options) ? arg1_options : {};

    //Guard clause for objets; direct keys
    if (typeof name == "object") return name;
    if (config.brush_actions[name]) return (!options.return_key) ? config.brush_actions[name] : name;

    //Declar elocal instance variables
    var all_brush_actions = Object.keys(config.brush_actions);
    var brush_actions_exists = [false, ""]; //[brush_actions_exists, brush_actions_key];
    var search_name = name.toLowerCase().trim();

    //ID search - soft search 1st, hard search 2nd
    {
      //Iterate over all_brush_actions
      for (var i = 0; i < all_brush_actions.length; i++)
        if (all_brush_actions[i].toLowerCase().includes(search_name))
          brush_actions_exists = [true, all_brush_actions[i]];
      for (var i = 0; i < all_brush_actions.length; i++)
        if (all_brush_actions[i].toLowerCase() == search_name)
          brush_actions_exists = [true, all_brush_actions[i]];
    }

    //Name search - soft search 1st, hard search 2nd
    {
      //Iterate over all_brush_actions
      for (var i = 0; i < all_brush_actions.length; i++) {
        var local_value = config.brush_actions[all_brush_actions[i]];

        if (local_value.name)
          if (local_value.name.toLowerCase().includes(search_name))
            brush_actions_exists = [true, all_brush_actions[i]];
      }
      for (var i = 0; i < all_brush_actions.length; i++) {
        var local_value = config.brush_actions[all_brush_actions[i]];

        if (local_value.name)
          if (local_value.name.toLowerCase() == search_name)
            brush_actions_exists = [true, all_brush_actions[i]];
      }
    }

    //Return statement
    if (brush_actions_exists[0])
      return (!options.return_key) ? config.brush_actions[brush_actions_exists[1]] : brush_actions_exists[1];
  }

  /*
    getBrushActionInput() - Fetches the input object of a given brush action within config .interface.
    arg0_action_id: (String) - The action ID to search for.
    arg1_input_id: (String) - The input ID to search for in terms of .id or .input key.

    Returns: (Object)
  */
  function getBrushActionInput (arg0_action_id, arg1_input_id) {
    //Convert from parameters
    var action_id = arg0_action_id;
    var input_id = arg1_input_id;

    //Declare local instance variables
    var brush_action = getBrushAction(action_id);

    if (brush_action)
      if (brush_action.interface) {
        //Guard clause if citing direct key
        if (brush_action.interface[input_id]) return brush_action.interface[input_id];

        //Iterate over all_inputs
        var all_inputs = Object.keys(brush_action.interface);

        for (var i = 0; i < all_inputs.length; i++) {
          var local_input = brush_action.interface[all_inputs[i]];

          if (!Array.isArray(local_input) && typeof local_input == "object")
            if (local_input.id == input_id)
              //Return statement
              return local_input;
        }
      }
  }

  /*
    getBrushActionsLowestOrder() - Fetches the lowest .order from all config.brush_actions.

    Returns: (Number)
  */
  function getBrushActionsLowestOrder () {
    //Declare local instance variables
    var flattened_brush_actions = config.flattened_brush_actions;
    var min_order = Infinity;

    //Iterate over all_flattened_brush_actions
    var all_flattened_brush_actions = Object.keys(flattened_brush_actions);

    for (var i = 0; i < all_flattened_brush_actions.length; i++) {
      var local_action = flattened_brush_actions[all_flattened_brush_actions[i]];

      if (local_action.order != undefined)
        min_order = Math.min(min_order, local_action.order);
    }

    //Return statement
    return min_order;
  }

  /*
    getBrushActionsNavigationObject() - Fetches the navigation object for brush actions; the initial context menu from the lowest order.

    Returns: (Object)
  */
  function getBrushActionsNavigationObject () {
    //Declare local instance variables
    var flattened_brush_actions = config.flattened_brush_actions;
    var lowest_order = getBrushActionsLowestOrder();

    //Return statement
    return getBrushActionsAtOrder({ order: lowest_order, return_object: true });
  }
}
