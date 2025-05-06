//Initialise functions
{
  function entityVariableExists (arg0_entity_id, arg1_variable_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var variable_id = arg1_variable_id;
    
    //Declare local instance variables
    var all_entity_variables = getAllEntityVariables(entity_id);

    //Return statement
    return all_entity_variables.includes(variable_id);
  }

  /**
   * getAllEntityVariables() - Returns an array of all unique entity variables for a given entity.
   * @param {String} arg0_entity_id
   * 
   * @returns {Array<String>}
   */
  function getAllEntityVariables (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var entity_obj = getEntity(entity_id);
    var unique_variables = [];

    if (entity_obj)
      if (entity_obj.options)
        if (entity_obj.options.history) {
          var all_history_frames = Object.keys(entity_obj.options.history);

          //Iterate over all_history_frames
          for (var i = 0; i < all_history_frames.length; i++) {
            var local_history_frame = entity_obj.options.history[all_history_frames[i]];
            
            if (local_history_frame)
              if (local_history_frame.options)
                if (local_history_frame.options.variables) {
                  //Iterate over all_local_variables per history frame
                  var all_local_variables = Object.keys(local_history_frame.options.variables);

                  for (var x = 0; x < all_local_variables.length; x++)
                    if (!unique_variables.includes(all_local_variables[x]))
                      unique_variables.push(all_local_variables[x]);
                }
          }
        }
    
    //Return statement
    return unique_variables;
  }
}
