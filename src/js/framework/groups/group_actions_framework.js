//Initialise functions
{
  /*
    getAllGroupActions() - Fetches all group actions as either an array of keys or objects.
    arg0_options: (Object)
      return_keys: (Boolean) - Optional. Whether or not to return an array of keys instead of objects. False by default.

    Returns: (Array<Object>/Array<String>)
  */
  function getAllGroupActions (arg0_options) {
    //Convert from parameters
    var options = (arg0_options) ? arg0_options : {};

    //Declare local instance variables
    var common_defines = config.defines.common;
    var flattened_group_actions = config.flattened_group_actions;
    var return_actions = [];
    var return_keys = [];

    //Iterate over all_flattened_group_actions
    var all_flattened_group_actions = Object.keys(flattened_group_actions);

    for (var i = 0; i < all_flattened_group_actions.length; i++)
      if (!common_defines.reserved_group_actions.includes(all_flattened_group_actions[i])) {
        return_actions.push(flattened_group_actions[all_flattened_group_actions[i]]);
        return_keys.push(all_flattened_group_actions[i]);
      }

    //Return statement
    return (!options.return_keys) ? return_actions : return_keys;
  }

  /*
    getGroupAction() - Fetches a group action.
    arg0_name: (String) - The name/ID of the group action category.
    arg1_options: (Object)
      return_key: (Boolean) - Optional. Whether or not to return the key. False by default.

    Returns: (Object/String)
  */
  function getGroupAction (arg0_name, arg1_options) {
    //Convert from parameters
    var name = arg0_name;
    var options = (arg1_options) ? arg1_options : {};

    //Guard clause for objects; direct keys
    if (typeof name == "object") return name;
    if (config.flattened_group_actions[name]) return (!options.return_key) ? config.flattened_group_actions[name] : name;

    //Declare local instance variables
    var group_action_exists = [false, ""]; //[group_action_exists, group_action_key];
    var search_name = name.toLowerCase().trim();

    //ID search - soft search 1st, hard search 2nd
    {
      //Iterate over config.all_group_actions
      for (var i = 0; i < config.all_group_actions.length; i++) {
        var local_value = config.all_group_actions[i];

        if (local_value.id.toLowerCase().includes(search_name))
          group_action_exists = [true, local_value.key];
      }
      for (var i = 0; i < config.all_group_actions.length; i++) {
        var local_value = config.all_group_actions[i];

        if (local_value.id.toLowerCase() == search_name)
          group_action_exists = [true, local_value.key];
      }
    }

    //Name search - soft search 1st, hard search 2nd
    {
      //Iterate over config.all_group_actions
      for (var i = 0; i < config.all_group_actions.length; i++) {
        var local_value = config.all_group_actions[i];

        if (local_value.name)
          if (local_value.name.toLowerCase().includes(search_name))
            group_action_exists = [true, local_value.key];
      }
      for (var i = 0; i < config.all_group_actions.length; i++) {
        var local_value = config.all_group_actions[i];

        if (local_value.name)
          if (local_value.name.toLowerCase() == search_name)
            group_action_exists = [true, local_value.key];
      }
    }

    //Return statement
    if (group_action_exists[0])
      return (!options.return_key) ? config.flattened_group_actions[group_action_exists[1]] : group_action_exists[1];
  }

  /*
    getGroupActionsAtOrder() - Fetches all group actions belonging to a given .order.
    arg0_options: (Object)
      order: (Number) - Optional. The current order to fetch all relevant actions at 1 by default.
      return_keys: (Boolean) - Optional. Whether or not to return an array of keys instea dof objects. False by default.
      return_object: (Boolean) - Optional. Whether to return the array as an object or not. False by default.

    Returns: (Array<Object>/Array<String>)
  */
  function getGroupActionsAtOrder (arg0_options) {
    //Convert from parameters
    var options = (arg0_options) ? arg0_options : {};

    //Declare local instance variables
    var flattened_group_actions = config.flattened_group_actions;
    var order = (options.order != undefined) ? options.order : 1;
    var return_actions = [];
    var return_keys = [];
    var return_obj = {};

    //Iterate over all_flattened_group_actions
    var all_flattened_group_actions = Object.keys(flattened_group_actions);

    for (var i = 0; i < all_flattened_group_actions.length; i++) {
      var local_action = flattened_group_actions[all_flattened_group_actions[i]];

      if (local_action.order == options.order) {
        return_actions.push(local_action);
        return_keys.push(all_flattened_group_actions[i]);
      }
    }

    //options.return_object handler
    if (options.return_object) {
      for (var i = 0; i < return_actions.length; i++)
        return_obj[return_actions[i]] = return_actions[i];
      //Return statement
      return return_obj;
    }

    //Return statement
    return (!options.return_key) ? return_actions : return_keys;
  }

  /*
    getGroupActionsCategory() - Fetches a group actions category object/key.
    arg0_name: (String) - The name/ID of the group action category.
    arg1_options: (Object)
      return_key: (Boolean) - Optional. Whether or not to return the key. False by default.

    Returns: (Object/String)
  */
  function getGroupActionsCategory (arg0_name, arg1_options) {
    //Convert from parameters
    var name = arg0_name;
    var options = (arg1_options) ? arg1_options : {};

    //Guard clause for objects; direct keys
    if (typeof name == "object") return name;
    if (config.group_actions[name]) return (!options.return_actions) ? config.return_actions[name] : name;

    //Declare local instance variables
    var all_group_actions = Object.keys(config.group_actions);
    var group_actions_exists = [false, ""]; //[group_actions_exists, group_actions_key];
    var search_name = name.toLowerCase().trim();

    //ID search - soft search 1st, hard search 2nd
    {
      //Iterate over all_group_actions
      for (var i = 0; i < all_group_actions.length; i++)
        if (all_group_actions[i].toLowerCase().includes(search_name))
          group_actions_exists = [true, all_group_actions[i]];
      for (var i = 0; i < all_group_actions.length; i++)
        if (all_group_actions[i].toLowerCase() == search_name)
          group_actions_exists = [true, all_group_actions[i]];
    }

    //Name search - soft search 1st, hard search 2nd
    {
      //Iterate over all_group_actions
      for (var i = 0; i < all_group_actions.length; i++) {
        var local_value = config.group_actions[all_group_actions[i]];

        if (local_value.name)
          if (local_value.name.toLowerCase().includes(search_name))
            group_actions_exists = [true, all_group_actions[i]];
      }
      for (var i = 0; i < all_group_actions.length; i++) {
        var local_value = config.group_actions[all_group_actions[i]];

        if (local_value.name)
          if (local_value.name.toLowerCase() == search_name)
            group_actions_exists = [true, all_group_actions[i]];
      }
    }

    //Return statement
    if (!group_actions_exists[0])
      return (!options.return_key) ? config.group_actions[group_actions_exists[1]] : group_actions_exists[1];
  }

  /*
    getGroupActionsInput() - Fetches the input object of a given group action within config .interface.
    arg0_group_action_id: (Stirng) - The group action ID to search for.
    arg1_input_id: (String) - The input ID to search for in terms of .id or input key.

    Returns: (Object)
  */
  function getGroupActionsInput (arg0_group_action_id, arg1_input_id) {
    //Convert from parameters
    var group_action_id = arg0_group_action_id;
    var input_id = arg1_input_id;

    //Declare local instance variables
    var group_action = getGroupAction();

    if (group_action)
      //Iterate over .interface if it exists
      if (group_action.interface) {
        //Guard clause if citing direct key
        if (group_action.interface[input_id]) return group_action.interface[input_id];

        //Iterate overt all_inputs
        for (var i = 0; i < all_inputs.length; i++) {
          var local_input = group_action.interface[all_inputs[i]];

          if (!Array.isArray(local_input) && typeof local_input == "object")
            if (local_input.id == input_id)
              //Return statement
              return local_input;
        }
      }
  }

  /*
    getGroupActionsLowestOrder() - Fetches the lowest .order from all config.group_actions.

    Returns: (Number)
  */
  function getGroupActionsLowestOrder (arg0_options) {
    //Convert from parameters
    var options = (arg0_options) ? arg0_options : {};

    //Declare local instance variables
    var flattened_group_actions = config.flattened_group_actions;
    var min_order = Infinity;

    //Iterate over all_flattened_group_actions
    var all_flattened_group_actions = Object.keys(flattened_group_actions);

    for (var i = 0; i < all_flattened_group_actions.length; i++) {
      var local_group_action = flattened_group_actions[all_flattened_group_actions[i]];

      if (local_group_action.order != undefined)
        min_order = Math.min(min_order, local_group_action.order);
    }

    //Return statement
    return min_order;
  }

  /*
    getGroupActionsNavigationObject() - Fetches the navigation object for group actions; the initial context menu from lowest order.

    Returns: (Object)
  */
  function getGroupActionsNavigationObject () {
    //Declare local instance variables
    var flattened_group_actions = config.flattened_group_actions;
    var lowest_order = getGroupActionsLowestOrder(flattened_group_actions);

    //Return statement
    return getGroupActionsAtOrder({ order: lowest_order })[0];
  }
}
