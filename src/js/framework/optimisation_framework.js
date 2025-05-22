//Declare function
{
  function initOptimisation () {
    //BRUSH ACTIONS
    //Set .all_brush_actions; .all_brush_actions_keys
    createContextMenuIndex({
      config_key: "brush_actions",
      namespace: "BrushAction"
    });

    //ENTITY ACTIONS
    //Set .all_entity_actions; .all_entity_actions_keys
    createContextMenuIndex({
      config_key: "entity_actions",
      namespace: "EntityAction"
    });

    //ENTITY KEYFRAMES
    //Set .all_entity_keyframes; .all_entity_keyframe_keys
    createContextMenuIndex({
      config_key: "entity_keyframes",
      namespace: "EntityKeyframe"
    }); //This is seemingly glitched for no reason
    config.flattened_entity_keyframes = dumbFlattenObject(config.entity_keyframes);

    config.all_entity_keyframes = getAllEntityKeyframes();
    config.all_entity_keyframe_keys = getAllEntityKeyframes({ return_keys: true });
    config.entity_keyframes_lowest_order = getEntityKeyframesLowestOrder();

    //GROUP ACTIONS
    //Set .all_group_actions; .all_group_actions_keys
    createContextMenuIndex({
      config_key: "group_actions",
      namespace: "GroupAction"
    });

    //VARIABLES
    createContextMenuIndex({
      config_key: "variables",
      namespace: "VariableActions"
    });
  }
}
