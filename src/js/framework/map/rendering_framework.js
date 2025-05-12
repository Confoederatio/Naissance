//Initialise Layer rendering functions
{
  /*
    getGroupRenderingOrder() - Fetches the group rendering order.
    arg0_group_obj: (Object) - The group to fetch the rendering order for.
    arg1_rendering_order: (Array<String>) - Optional. The cached rendering order to store between recursive iterations.

    Returns: (Array<String>)
  */
  function getGroupRenderingOrder (arg0_group_obj, arg1_rendering_order) {
    //Convert from parameters
    var group_obj = arg0_group_obj;
    var rendering_order = (arg1_rendering_order) ? arg1_rendering_order : [];

    //Render all entities first
    if (group_obj.entities)
      for (var i = 0; i < group_obj.entities.length; i++)
        if (!rendering_order.includes(group_obj.entities[i]))
          rendering_order.push(group_obj.entities[i]);

    //Render all subgroups next
    if (group_obj.subgroups)
      for (var i = 0; i < group_obj.subgroups.length; i++) {
        var local_subgroup = main.groups[group_obj.subgroups[i]];
        var local_subgroup_rendering_order = getGroupRenderingOrder(local_subgroup, rendering_order);

        for (var x = 0; x < local_subgroup_rendering_order.length; x++)
          if (!rendering_order.includes(local_subgroup_rendering_order[x]))
            rendering_order.push(local_subgroup_rendering_order[x]);
      }

    //Return statement
    return rendering_order;
  }

  /*
    getHierarchyRenderingOrder() - Renders polities within a hierarchy.
    arg0_options: (Object)
      exclude_selection: (Boolean), - Whether to exclude the selected ID. False by default.
      return_objects: (Boolean) - Whether to return entity objects instead. False by default.

    Returns: (String)
  */
  function getHierarchyRenderingOrder (arg0_options) {
    //Convert from parameters
    var options = (arg0_options) ? arg0_options : {};

    //Declare local instance variables
    var brush_obj = main.brush;
    var rendering_order = [];
    var ungrouped_entities = getUngroupedEntities("hierarchy");

    var all_groups = Object.keys(main.groups);

    //Iterate over all_groups and start only with surface groups
    for (var i = 0; i < all_groups.length; i++) {
      var local_group = main.groups[all_groups[i]];

      if (local_group)
        if (!local_group.parent_group)
          rendering_order = appendArrays(rendering_order, getGroupRenderingOrder(local_group));
    }

    //Append ungrouped_entities to end of rendering order
    if (ungrouped_entities.length > 0)
      rendering_order = appendArrays(rendering_order, ungrouped_entities);

    //Current selection handling - remove from array if extant and push to end
    {
      var selected_id = "";

      if (brush_obj.current_selection)
        if (brush_obj.current_selection.options)
          if (brush_obj.current_selection.options.className)
            selected_id = brush_obj.current_selection.options.className;

      //Splice from rendering order
      if (selected_id != "") {
        for (var i = 0; i < rendering_order.length; i++)
          if (rendering_order[i] == selected_id) {
            rendering_order.splice(i, 1);
            break;
          }

        if (!options.exclude_selection)
          //Make sure brush_obj.editing_entity is defined before pushing
          if (brush_obj.editing_entity)
            rendering_order.push(selected_id);
      }
    }

    //Entity object handling
    if (options.return_objects) {
      var new_rendering_order = [];

      for (var i = 0; i < rendering_order.length; i++)
        new_rendering_order.push(getEntity(rendering_order[i]));

      rendering_order = new_rendering_order;
    }

    //Return statement
    return rendering_order;
  }

  /**
   * renderAllPolities() - Renders all polities in the correct order.
   */
  function renderAllPolities () {
    //Declare local instance variables
    var render_order = getHierarchyRenderingOrder({ exclude_selection: true });

    //Renders need to happen in render_order; so iterate over that instead
    for (var i = 0; i < render_order.length; i++) {
      var local_entity = getEntity(render_order[i]);

      if (local_entity)
        updateEntityVisibility(local_entity);
    }
  }
}
