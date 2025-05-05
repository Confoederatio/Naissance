//Initialise functions
{
  /**
   * getAllVariableActions() - Fetches all variable actions as either an array of keys or objects.
   * @param {Object} [arg0_options]
   *  @param {boolean} [arg0_options.return_keys=false] - Optional. Whether or not to return an array of keys instead of objects.
   * 
   * @returns {Array<Object>|Array<String>}
   */
  function getAllVariableActions (arg0_options) { //[WIP] - Finish function body
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
}