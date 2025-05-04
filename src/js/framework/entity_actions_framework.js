//Initialise Entity Actions framework
{
  /*
    getAllEntityActions() - Fetches all entity actions as either an array of keys or objects.
    arg0_options: (Object)
      return_keys: (Boolean) - Optional. Whether or not to return an array of keys instead of objects. False by default.

    Returns: (Array<Object>/Array<String>)
  */
  function getAllEntityActions (arg0_options) {
    //Convert from parameters
    var options = (arg0_options) ? arg0_options : {};

    //Declare local instance variables
    var common_defines = config.defines.common;
    var flattened_entity_actions = config.flattened_entity_actions;
    var return_actions = [];
    var return_keys = [];

    //Iterate over all_flattened_entity_actions
    var all_flattened_entity_actions = Object.keys(flattened_entity_actions);

    for (var i = 0; i < all_flattened_entity_actions.length; i++)
      if (!common_defines.reserved_entity_actions.includes(all_flattened_entity_actions[i])) {
        return_actions.push(flattened_entity_actions[all_flattened_entity_actions[i]]);
        return_keys.push(all_flattened_entity_actions[i]);
      }

    //Return statement
    return (!options.return_actions) ? return_actions : return_keys;
  }

  /*
    getEntityAction() - Fetches an entity action.
    arg0_name: (String) - The name/ID of the entity action category.
    arg1_options: (Object)
      return_key: (Boolean) - Optional. Whether or not to return the key. False by default.

    Returns: (Object/String)
  */
  function getEntityAction (arg0_name, arg1_options) {
    //Convert from parameters
    var name = arg0_name;
    var options = (arg1_options) ? arg1_options : {};

    //Guard clause for objects; direct keys
    if (typeof name == "object") return name;
    if (config.flattened_entity_actions[name]) return (!options.return_key) ? config.flattened_entity_actions[name] : name;

    //Declare local instance variables
    var entity_actions_exists = [false, ""]; //[entity_actions_exists, entity_actions_key];
    var search_name = name.toLowerCase().trim();

    //ID search - soft search 1st, hard search 2nd
    {
      //Iterate over config.all_entity_actions
      for (var i = 0; i < config.all_entity_actions.length; i++) {
        var local_value = config.all_entity_actions[i];

        if (local_value.id.toLowerCase().includes(search_name))
          entity_actions_exists = [true, local_value.key];
      }
      for (var i = 0; i < config.all_entity_actions.length; i++) {
        var local_value = config.all_entity_actions[i];

        if (local_value.id.toLowerCase() == search_name)
          entity_actions_exists = [true, local_value.key];
      }
    }

    //Name search - soft search 1st, hard search 2nd
    {
      //Iterate over config.all_entity_actions
      for (var i = 0; i < config.all_entity_actions.length; i++) {
        var local_value = config.all_entity_actions[i];

        if (local_value.name)
          if (local_value.name.toLowerCase().includes(search_name))
            entity_actions_exists = [true, local_value.key];
      }
      for (var i = 0; i < config.all_entity_actions.length; i++) {
        var local_value = config.all_entity_actions[i];

        if (local_value.name)
          if (local_value.name.toLowerCase() == search_name)
            entity_actions_exists = [true, local_value.key];
      }
    }

    //Return statement
    if (entity_actions_exists[0])
      return (!options.return_key) ? config.flattened_entity_actions[entity_actions_exists[1]] : entity_actions_exists[1];
  }

  /*
    getEntityKeyframesAtOrder() - Fetches all entity actions belonging to a given .order.
    arg0_options: (Object)
      order: (Number) - Optional. The current order to fetch all relevant actions at. 1 by default.
      return_keys: (Boolean) - Optional. Whether or not to return an array of keys instead of objects. False by default.
      return_object: (Boolean) - Optional. Whether to return the array as an object or not. False by default.

    Returns: (Array<Object>/Array<String>/Object)
  */
  function getEntityActionsAtOrder (arg0_options) {
    //Convert from parameters
    var options = (arg0_options) ? arg0_options : {};

    //Declare local instance variables
    var flattened_entity_actions = config.flattened_entity_actions;
    var order = (options.order != undefined) ? options.order : 1;
    var return_actions = [];
    var return_obj = {};
    var return_keys = [];

    //Iterate over all_flattened_entity_actions
    var all_flattened_entity_actions = Object.keys(flattened_entity_actions);

    for (var i = 0; i < all_flattened_entity_actions.length; i++) {
      var local_action = flattened_entity_actions[all_flattened_entity_actions[i]];

      if (local_action.order == options.order) {
        return_actions.push(local_action);
        return_keys.push(all_flattened_entity_actions[i]);
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
    getEntityActionsCategory() - Fetches an entity actions category object/key.
    arg0_name: (String) - The name/ID of the entity action category.
    arg1_options: (Object)
      return_key: (Boolean) - Optional. Whether or not to return the key. False by default.

    Returns: (Object/String)
  */
  function getEntityActionsCategory (arg0_name, arg1_options) {
    //Convert from parameters
    var name = arg0_name;
    var options = (arg1_options) ? arg1_options : {};

    //Guard clause for objects; direct keys
    if (typeof name == "object") return name;
    if (config.entity_actions[name]) return (!options.return_key) ? config.entity_actions[name] : name;

    //Declare local instance variables
    var all_entity_actions = Object.keys(config.entity_actions);
    var entity_actions_exists = [false, ""]; //[entity_actions_exists, entity_actions_key];
    var search_name = name.toLowerCase().trim();

    //ID search - soft search 1st, hard search 2nd
    {
      //Iterate over all_entity_actions
      for (var i = 0; i < all_entity_actions.length; i++)
        if (all_entity_actions[i].toLowerCase().includes(search_name))
          entity_actions_exists = [true, all_entity_actions[i]];
      for (var i = 0; i < all_entity_actions.length; i++)
        if (all_entity_actions[i].toLowerCase() == search_name)
          entity_actions_exists = [true, all_entity_keyframes[i]];
    }

    //Name search - soft search 1st, hard search 2nd
    {
      //Iterate over all_entity_actions
      for (var i = 0; i < all_entity_actions.length; i++) {
        var local_value = config.entity_actions[all_entity_actions[i]];

        if (local_value.name)
          if (local_value.name.toLowerCase().includes(search_name))
            entity_actions_exists = [true, all_entity_keyframes[i]];
      }
      for (var i = 0; i < all_entity_actions.length; i++) {
        var local_value = config.entity_actions[all_entity_actions[i]];

        if (local_value.name)
          if (local_value.name.toLowerCase() == search_name)
            entity_actions_exists = [true, all_entity_keyframes[i]];
      }
    }

    //Return statement
    if (entity_actions_exists[0])
      return (!options.return_key) ? config.entity_actions[entity_actions_exists[1]] : entity_actions_exists[1];
  }

  /*
    getEntityActionInput() - Fetches the input object of a given entity action within config .interface.
    arg0_action_id: (String) - The action ID to search for.
    arg1_input_id: (String) - The input ID to search for in terms of .id or .input key.

    Returns: (Object)
  */
  function getEntityActionInput (arg0_action_id, arg1_input_id) {
    //Convert from parameters
    var action_id = arg0_action_id;
    var input_id = arg1_input_id;

    //Declare local instance variables
    var entity_action = getEntityAction(keyframe_id);

    if (entity_action)
      //Iterate over .interface if it exists
      if (entity_action.interface) {
        //Guard clause if citing direct key
        if (entity_action.interface[input_id]) return entity_action.interface[input_id];

        //Iterate over all_inputs
        var all_inputs = Object.keys(entity_action.interface);

        for (var i = 0; i < all_inputs.length; i++) {
          var local_input = entity_action.interface[all_inputs[i]];

          if (!Array.isArray(local_input) && typeof local_input == "object")
            if (local_input.id == input_id)
              //Return statement
              return local_input;
        }
      }
  }

  /*
    getEntityActionsLowestOrder() - Fetches the lowest .order from all config.entity_actions.

    Returns: (Number)
  */
  function getEntityActionsLowestOrder () {
    //Declare local instance variables
    var flattened_entity_actions = config.flattened_entity_actions;
    var min_order = Infinity;

    //Iterate over all_flattened_entity_actions
    var all_flattened_entity_actions = Object.keys(flattened_entity_actions);

    for (var i = 0; i < all_flattened_entity_actions.length; i++) {
      var local_action = flattened_entity_actions[all_flattened_entity_actions[i]];

      if (local_action.order != undefined)
        min_order = Math.min(min_order, local_action.order);
    }

    //Return statement
    return min_order;
  }

  /*
    getEntityActionsNavigationObject() - Fetches the navigation object for entity actions; the initial context menu from the lowest order.

    Returns: (Object)
  */
  function getEntityActionsNavigationObject () {
    //Declare local instance variables
    var flattened_entity_actions = config.flattened_entity_actions;
    var lowest_order = getEntityActionsLowestOrder(flattened_entity_actions);

    //Return statement
    return getEntityActionsAtOrder({ order: lowest_order, return_object: true });
  }
}
