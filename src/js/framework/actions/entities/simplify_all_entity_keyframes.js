//Initialise functions
{
  /**
   * simplifyAllEntityKeyframes() - Simplifes all entity keyframe paths to a given tolerance.
   * @param {String} arg0_entity_id
   * @param {boolean} [arg1_simplify_all_entity_keyframes=false] - Whether to simplify all entity keyframes.
   * @param {Object} [arg2_options]
   *  @param {number} [arg2_options.tolerance=main.brush.simplify_tolerance] - The tolerance to simplify this entity to.
   *
   * @returns {*}
   */
  function simplifyAllEntityKeyframes (arg0_entity_id, arg1_simplify_all_entity_keyframes, arg2_options) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var simplify_all_entity_keyframes = arg1_simplify_all_entity_keyframes;
    var options = (arg2_options) ? arg2_options : {};

    //Guard clause
    if (simplify_all_entity_keyframes != true) return;
    console.log(`Attempting to simplify all entity keyframes`);

    //Declare local instance variables
    var entity_obj = (typeof entity_id != "object") ? getEntity(entity_id) : entity_id;
    var tolerance = (options.tolerance) ?
      options.tolerance : main.brush.simplify_tolerance;

    if (entity_obj) {
      if (entity_obj.options.history) {
        var all_history_entries = Object.keys(entity_obj.options.history);

        for (let i = 0; i < all_history_entries.length; i++) {
          var local_history_frame = entity_obj.options.history[all_history_entries[i]];

          simplifyEntity(entity_obj, tolerance, {
            date: convertTimestampToDate(all_history_entries[i])
          });
        }
      }
    }

    //Return statement
    return entity_obj;
  }
}
