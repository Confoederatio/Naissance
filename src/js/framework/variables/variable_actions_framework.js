//Initialise functions
{
  /**
   * getAllVariableActions() - Fetches all variable actions as either an array of keys or objects.
   * @param {Object} [arg0_options]
   *  @param {boolean} [arg0_options.return_keys=false] - Optional. Whether or not to return an array of keys instead of objects.
   * 
   * @returns {Array<Object>|Array<String>}
   */
  function getAllVariableActions (arg0_options) {
    //Convert from parameters
    var options = (arg0_options) ? arg0_options : {};

    //Declare local instance variables
    var common_defines = config.defines.common;
    var flattened_variable_actions = config.flattened_variable_actions;
    var return_actions = [];
    var return_keys = [];

    //Iterate over all_flattened_variable_actions
    var all_flattened_variable_actions = Object.keys(flattened_variable_actions);
   
    for (var i = 0; i < all_flattened_variable_actions.length; i++)
      if (!common_defines.reserved_variable_actions.includes(all_flattened_variable_actions[i])) {
        return_actions.push(flattened_variable_actions[all_flattened_variable_actions[i]]);
        return_keys.push(all_flattened_variable_actions[i]);
      }

    //Return statement
    return (!options.return_keys) ? return_actions : return_keys;
  }

  /**
   * getVariableAction() - Fetches a variable action.
   * @param {String} arg0_name - The name/ID of the variable action.
   * @param {Object} [arg1_options]
   *  @param {boolean} [arg1_options.return_key=false] - Optional. Whether or not to return the key instead of the object.
   * 
   * @returns {Object|String}
   */
  function getVariableAction (arg0_name, arg1_options) {
    //Convert from parameters
    var name = arg0_name;
    var options = (arg1_options) ? arg1_options : {};

    //Guard clause for objects; direct keys
    if (typeof name == "object") return name;
    if (config.flattened_variable_actions[name]) return (!options.return_key) ? config.flattened_variable_actions[name] : name;

    //Declare local instance variables
    var variable_action_exists = [false, ""]; //[variable_action_exists, variable_action_key];
    var search_name = name.toLowerCase().trim();
    
    //ID search - soft search 1st, hard search 2nd
    {
      //Iterate over config.all_variable_actions
      for (var i = 0; i < config.all_variable_actions.length; i++) {
        var local_value = config.all_variable_actions[i];
        
        if (local_value.id.toLowerCase().includes(search_name))
          variable_action_exists = [true, local_value.key];
      }
      for (var i = 0; i < config.all_variable_actions.length; i++) {
        var local_value = config.all_variable_actions[i];

        if (local_value.id.toLowerCase() == search_name)
          variable_action_exists = [true, local_value.key];
      }
    }

    //Name search - soft search 1st, hard search 2nd
    {
      //Iterate over config.all_variable_actions
      for (var i = 0; i < config.all_variable_actions.length; i++) {
        var local_value = config.all_variable_actions[i];

        if (local_value.name)
          if (local_value.name.toLowerCase().includes(search_name))
            variable_action_exists = [true, local_value.key];
      }
      for (var i = 0; i < config.all_variable_actions.length; i++) {
        var local_value = config.all_variable_actions[i];
        
        if (local_value.name)
          if (local_value.name.toLowerCase() == search_name)
            variable_action_exists = [true, local_value.key];
      }
    }

    //Return statement
    if (variable_action_exists[0])
      return (!options.return_key) ? config.flattened_variable_actions[variable_action_exists[1]] : variable_action_exists[1];
  }

  /**
   * getVariableActionsAtOrder() - Fetches all variable actions belonging to a given .order.
   * @param {Object} [arg0_options]
   *  @param {number} [arg0_options.order=1] - Optional. The current order to fetch all relevant actions at 1 by default.
   *  @param {boolean} [arg0_options.return_keys=false] - Optional. Whether or not to return an array of keys instead of objects.
   * 
   * @returns {Array<Object>|Array<String>}
   */
  function getVariableActionsAtOrder (arg0_options) {
    //Convert from parameters
    var options = (arg0_options) ? arg0_options : {};

    //Declare local instance variables
    var flattened_variable_actions = config.flattened_variable_actions;
    var order = (options.order != undefined) ? options.order : 1;
    var return_actions = [];
    var return_keys = [];
    var return_obj = {};

    //Iterate over all_flattened_variable_actions
    var all_flattened_variable_actions = Object.keys(flattened_variable_actions);

    for (var i = 0; i < all_flattened_variable_actions.length; i++) {
      var local_action = flattened_variable_actions[all_flattened_variable_actions[i]];

      if (local_action.order == order) {
        return_actions.push(local_action);
        return_keys.push(all_flattened_variable_actions[i]);
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

  /**
   * getVariableActionsCategory() - Fetches a variable actions category object/key.
   * @param {String} arg0_name - The name/ID of the variable actions category.
   * @param {Object} [arg1_options]
   *  @param {boolean} [arg1_options.return_key=false] - Optional. Whether or not to return the key instead of the object.
   * 
   * @returns {Object|String}
   */
  function getVariableActionsCategory (arg0_name, arg1_options) {
    //Convert from parameters
    var name = arg0_name;
    var options = (arg1_options) ? arg1_options : {};

    //Guard clause for objects; direct keys
    if (typeof name == "object") return name;
    if (config.variables[name]) return (!options.return_key) ? config.variables[name] : name;

    //Declare local instance variables
    var all_variable_actions = Object.keys(config.variables);
    var variable_actions_exists = [false, ""]; //[variable_actions_exists, variable_actions_key];
    var search_name = name.toLowerCase().trim();

    //ID search - soft search 1st, hard search 2nd
    {
      //Iterate over all_variable_actions
      for (var i = 0; i < all_variable_actions.length; i++)
        if (all_variable_actions[i].toLowerCase().includes(search_name))
          variable_actions_exists = [true, all_variable_actions[i]];
      for (var i = 0; i < all_variable_actions.length; i++)
        if (all_variable_actions[i].toLowerCase() == search_name)
          variable_actions_exists = [true, all_variable_actions[i]];
    }
    
    //Name search - soft search 1st, hard search 2nd
    {
      //Iterate over all_variable_actions
      for (var i = 0; i < all_variable_actions.length; i++) {
        var local_value = config.variables[all_variable_actions[i]];

        if (local_value.name)
          if (local_value.name.toLowerCase().includes(search_name))
            variable_actions_exists = [true, all_variable_actions[i]];
      }
      for (var i = 0; i < all_variable_actions.length; i++) {
        var local_value = config.variables[all_variable_actions[i]];

        if (local_value.name)
          if (local_value.name.toLowerCase() == search_name)
            variable_actions_exists = [true, all_variable_actions[i]];
      }
    }

    //Return statement
    if (variable_actions_exists[0])
      return (!options.return_key) ? config.variables[variable_actions_exists[1]] : variable_actions_exists[1];
  }
  
  /**
   * getVariableActionsInput() - Fetches the input object of a given variable action within config .interface.
   * @param {String} arg0_variable_action_id - The variable action ID to search for.
   * @param {String} arg1_input_id - The input ID to search for in terms of .id or input key.
   * 
   * @returns {Object}
   */
  function getVariableActionsInput (arg0_variable_action_id, arg1_input_id) {
    //Convert from parameters
    var variable_action_id = arg0_variable_action_id;
    var input_id = arg1_input_id;

    //Declare local instance variables
    var variable_action = getVariableAction();

    if (variable_action)
      //Iterate over .interface if it exists
      if (variable_action.interface) {
        //Guard clause if citing direct key
        if (variable_action.interface[input_id]) return variable_action.interface[input_id];
        
        //Iterate over all_inputs
        for (var i = 0; i < all_inputs.length; i++) {
          var local_input = variable_action.interface[all_inputs[i]];

          if (!Array.isArray(local_input) && typeof local_input == "object")
            if (local_input.id == input_id)
              //Return statement
              return local_input;
        }
      }
  }

  /**
   * getVariableActionsLowestOrder() - Fetches the lowest .order from all config.variables.
   * 
   * @returns {number}
   */
  function getVariableActionsLowestOrder () {
    //Declare local instance variables
    var flattened_variable_actions = config.flattened_variable_actions;
    var min_order = Infinity;

    //Iterate over all_flattened_variable_actions
    var all_flattened_variable_actions = Object.keys(flattened_variable_actions);

    for (var i = 0; i < all_flattened_variable_actions.length; i++) {
      var local_variable_action = flattened_variable_actions[all_flattened_variable_actions[i]];

      if (local_variable_action.order != undefined)
        min_order = Math.min(min_order, local_variable_action.order);
    }

    //Return statement
    return min_order;
  }

  /**
   * getVariableActionsNavigationObject() - Fetches the navigation object for variable actions; the initial context menu from lowest order.
   * 
   * @returns {Object}
   */
  function getVariableActionsNavigationObject () {
    //Declare local instance variables
    var flattened_variable_actions = config.flattened_variable_actions;
    var lowest_order = getVariableActionsLowestOrder(flattened_variable_actions);

    //Return statement
    return getVariableActionsAtOrder({ order: lowest_order })[0];
  }
}