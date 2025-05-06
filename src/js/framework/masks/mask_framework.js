//Declare Mask framework functions
{
  /*
    addEntityMask() - Adds a mask to a given entity.
    arg0_entity_id: (String) - The entity ID to add to the mask.
    arg1_mode: (String) - The preset config.mask_types to use.
  */
  function addEntityMask (arg0_entity_id, arg1_mode) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var mode = (arg1_mode) ? arg1_mode : "add";

    //Declare local instance variables
    var brush_obj = main.brush;
    var entity_obj = getEntity(entity_id);

    //Make sure entity_obj exists to add a mask to
    if (entity_obj) {
      var actual_entity_id = entity_obj.options.className;

      removeEntityMask(actual_entity_id);
      brush_obj.masks[mode].push(entity_obj);
      entity_obj.options.mask = mode;
    }
  }

  /*
    addGroupMask() - Sets an entire group to have a mask according to mode.
    arg0_group_id: (String) - The group ID to add to the mask.
    arg1_mode: (String) - The preset config.mask_types type to use.
  */
  function addGroupMask (arg0_group_id, arg1_mode) {
    //Convert from parameters
    var group_id = arg0_group_id;
    var mode = (arg1_mode) ? arg1_mode : "add";

    //Declare local instance variables
    var brush_obj = main.brush;
    var group_obj = getGroup("hierarchy", group_id);

    if (group_obj) {
      removeGroupMask(group_obj.id);

      //Mode handling
      var all_selected_entities = getGroupEntities("hierarchy", group_obj.id);

      for (var i = 0; i < all_selected_entities.length; i++)
        addEntityMask(all_selected_entities[i], mode);
    }
  }

  /*
    getGroupMask() - Returns the given mask of a group. Undefined for none.
    arg0_group_id: (String) - The group ID to return the mask for.

    Returns: (String)
  */
  function getGroupMask (arg0_group_id) {
    //Convert from parameters
    var group_id = arg0_group_id;

    //Declare local instance variables
    var has_entity_without_first_mask = false;
    var first_mask;
    var group_obj = getGroup("hierarchy", group_id);

    if (group_obj) {
      var all_selected_entities = getGroupEntities("hierarchy", group_obj.id, { first_order_layer: true });

      for (var i = 0; i < all_selected_entities.length; i++) {
        if (!first_mask)
          first_mask = all_selected_entities[i].options.mask;
        if (!all_selected_entities[i].options.mask || all_selected_entities[i].options.mask != first_mask) {
          has_entity_without_first_mask = true;
          break;
        }
      }
    }

    //Return statement
    return (!has_entity_without_first_mask) ? first_mask : undefined;
  }

  /*
    processGeometryMask() - Processes a given geometry mask.
    arg0_geometry: (Variable) - The geometry to input.
    arg2_options: (Object)
      mask_type: (String) - The mask type to input.
  */
  function processGeometryMask (arg0_geometry, arg1_scope, arg2_options) {
    //Convert from parameters
    var geometry = arg0_geometry;
    var scope = (arg1_scope) ? arg1_scope : {};
    var options = (arg2_options) ? arg2_options : {};

    //Declare local instance variables
    var all_scope_keys = Object.keys(scope);
    var brush_obj = main.brush;
    var selected_polity = brush_obj.current_selection;

    //Iterate over all_scope_keys
    for (var i = 0; i < all_scope_keys.length; i++) {
      var local_value = getList(scope[all_scope_keys[i]]);

      if (all_scope_keys[i] == "remove_brush_coords_from_selected_polities") {
        var mask_geometries = main.brush.masks[options.mask_type];

        for (var x = 0; x < mask_geometries.length; x++)
          if (mask_geometries[x]) {
            try {
              //Guard clause if selected_polity is mask_geometries[x]
              if (selected_polity.options.className == mask_geometries[x].options.className) continue;

              var local_coords = getEntityCoords(mask_geometries[x].options.className, main.date, { is_non_inclusive: true });

              var local_difference = difference(local_coords, geometry);

              //Log before delta actions before setting entity coords
              if (!main.cache.old_mask_changes)
                main.cache.old_mask_changes = [];
              main.cache.old_mask_changes.push({
                type: "entity",

                date: JSON.parse(JSON.stringify(main.date)),
                entity_id: mask_geometries[x].options.className,
                polygon: local_coords
              });
              setEntityCoords(mask_geometries[x].options.className, local_difference);

              //Log after delta actions after setting entity coords
              if (!main.cache.new_mask_changes)
                main.cache.new_mask_changes = [];
              main.cache.new_mask_changes.push({
                type: "entity",

                date: JSON.parse(JSON.stringify(main.date)),
                entity_id: mask_geometries[x].options.className,
                polygon: local_difference
              });
            } catch (e) {
              console.log(e);
            }
          }
      } else if (all_scope_keys[i] == "remove_brush_coords_outside_selected_polities") {
        var mask_geometries = main.brush.masks[options.mask_type];
        var mask_union;
        var no_init = true;

        for (var x = 0; x < mask_geometries.length; x++)
          try {
            //Guard clause if selected_polity is mask_geometries[x]
            if (
              selected_polity.options.className == mask_geometries[x].options.className ||
              isEntityHidden(mask_geometries[x])
            ) continue;

            var local_coords = getEntityCoords(mask_geometries[x], main.date);
            if (!local_coords) continue;

            mask_union = (no_init) ?
              local_coords : union(mask_union, local_coords);
            no_init = false;
          } catch (e) {
            console.log(e);
          }

        if (mask_union && main.brush.current_path)
          geometry = intersection(geometry, mask_union);
      } else if (all_scope_keys[i] == "remove_selected_polities_from_brush_coords") {
        var mask_geometries = main.brush.masks[options.mask_type];
        var mask_union;
        var no_init = true;

        for (var x = 0; x < mask_geometries.length; x++)
          try {
            //Guard clause if selected_polity is mask_geometries[x]
            if (
              selected_polity.options.className == mask_geometries[x].options.className ||
              isEntityHidden(mask_geometries[x])
            ) continue;

            var local_coords = getEntityCoords(mask_geometries[x], main.date);
            if (!local_coords) continue;

            mask_union = (no_init) ?
              local_coords : union(mask_union, local_coords);
            no_init = false;
          } catch (e) {
            console.log(e);
          }

        if (mask_union && main.brush.current_path)
          geometry = difference(geometry, mask_union);
      }
    }

    //Return statement
    return geometry;
  }

  /*
    processGeometryMasks() - Parses all masks currently in config.mask_types and applies each of them to the input geometry.
    arg0_geometry: (Variable) - The geometry to input.

    Returns: (Object, Maptalks)
  */
  function processGeometryMasks (arg0_geometry) {
    //Convert from parameters
    var geometry = arg0_geometry;

    //Declare local instance variables
    var all_mask_types_keys = Object.keys(config.mask_types);

    //Iterate over all_mask_types_keys and parse each effect
    for (let i = 0; i < all_mask_types_keys.length; i++) {
      let local_value = config.mask_types[all_mask_types_keys[i]];

      if (local_value.effect)
        if (main.brush.masks[all_mask_types_keys[i]])
          if (main.brush.masks[all_mask_types_keys[i]].length > 0)
            if (local_value.effect)
              try {
                geometry = processGeometryMask(geometry, local_value.effect, {
                  mask_type: all_mask_types_keys[i]
                });
              } catch (e) {
                console.log(e);
              }
    }

    //Return statement
    return geometry;
  }

  /*
    removeEntityMask() - Removes an entity from all current masks.
    arg0_entity_id: (String) - The entity ID to remove from all masks.
  */
  function removeEntityMask (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var all_mask_types_keys = Object.keys(config.mask_types);
    var brush_obj = main.brush;
    var entity_obj = (typeof entity_id != "object") ? getEntity(entity_id) : entity_id;

    //Initialise local instance variables
    if (entity_obj)
      if (entity_obj.options)
        if (entity_obj.options.className)
          entity_id = entity_obj.options.className;

    //Iterate over all mask types
    for (var i = 0; i < all_mask_types_keys.length; i++) {
      var local_mask = brush_obj.masks[all_mask_types_keys[i]];

      //Remove entity_id from mask
      if (local_mask)
        if (Array.isArray(local_mask))
          if (local_mask.length > 0)
            for (var x = local_mask.length - 1; x >= 0; x--) {
              var local_entity = local_mask[x];

              if (local_entity.options.className == entity_id) {
                delete local_entity.options.mask;
                delete entity_obj.options.mask;
                local_mask.splice(x, 1);
              }
            }
    }

    //Delete entity_obj.options.mask for sure
    delete entity_obj.options.mask;
  }

  /*
    removeGroupMask() - Removes an entire group from all current masks.
    arg0_group_id: (String) - The group ID to remove from all masks.
  */
  function removeGroupMask (arg0_group_id) {
    //Convert from parameters
    var group_id = arg0_group_id;

    //Declare local instance variables
    var brush_obj = main.brush;
    var group_el = document.querySelector(`#hierarchy .group[data-id="${group_id}"]`);
    var group_obj = getGroup("hierarchy", group_id);

    //Edit class display
    if (group_obj) {
      var all_selected_entities = getGroupEntities("hierarchy", group_obj.id);
      console.log("Called removeGroupMask() on:", group_id);

      for (var i = 0; i < all_selected_entities.length; i++)
        removeEntityMask(all_selected_entities[i]);
    }
  }

  /*
    setGroupMask() - Sets a group's current mask state.
    arg0_group_id: (String) - The group ID to set the mask for.
    arg1_mode: (String) - The preset config.mask_types to use.
  */
  function setGroupMask (arg0_group_id, arg1_mode) {
    //Convert from parameters
    var group_id = arg0_group_id;
    var mode = (arg1_mode) ? arg1_mode : "clear";

    //If mask_select_el exists, read and set mask
    (mode != "clear") ?
      addGroupMask(group_id, mode) :
      removeGroupMask(group_id, mode);
    refreshHierarchy();
  }
}
