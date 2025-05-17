//Initialise functions
{
  function initialiseHierarchyDrawLoops () {
    //Declare local instance variables
    var hierarchies_obj = main.hierarchies;
    var hierarchy_el = getUISelector("hierarchy");

    //100ms; 1s draw loops  
    global.hierarchy_100ms_draw_loop = setInterval(function(){
      refreshHierarchy({ do_not_reload: true });
    }, 100);
    global.hierarchy_1s_draw_loop = setInterval(function(){
      var hierarchy_obj = main.hierarchies.hierarchy;

      //Iterate over all entities
      for (var i = 0; i < hierarchy_obj.entities.length; i++) try {
        var local_entity_id = hierarchy_obj.entities[i].options.className;

        var entity_hierarchy_el = getEntityHierarchyElement(local_entity_id);

        entity_hierarchy_el.querySelector(".item-name").textContent = getEntityName(local_entity_id);
      } catch (e) {}

      if (main.previous_hierarchy_html != hierarchy_el.innerHTML) {
        var exported_hierarchies = exportHierarchies({ naissance_hierarchy: "hierarchy" });

        hierarchies_obj.hierarchy.groups = exported_hierarchies.hierarchy.groups;
        main.groups = hierarchies_obj.hierarchy.groups;
        main.previous_hierarchy_html = hierarchy_el.innerHTML;
      }
    }, 1000);
  }

  function refreshHierarchy (arg0_options) {
    //Convert from parameters
    var options = (arg0_options) ? arg0_options : {};

    //Declare local instance variables
    var brush_obj = main.brush;
    var hierarchy_obj = main.hierarchies.hierarchy;

    if (!options.do_not_reload)
      renderHierarchy("hierarchy", { naissance_hierarchy: true });

    //Iterate over all groups in main.hierarchies.hierarchy.groups
    var all_group_keys = Object.keys(hierarchy_obj.groups);

    for (var i = 0; i < all_group_keys.length; i++) {
      var class_suffix = "";
      var local_group = hierarchy_obj.groups[all_group_keys[i]];
      var local_group_el = getGroupElement(all_group_keys[i]);
      var local_group_mask = getGroupMask(all_group_keys[i]);
      var selected_group_string = (all_group_keys[i] == main.brush.selected_group_id) ? "selected" : "";

      if (local_group_mask)
        class_suffix += ` ${local_group_mask}`;
      class_suffix += ` ${selected_group_string}`;

      local_group_el.setAttribute("class", `group${class_suffix}`);

      //Iterate over local_group.entities
      for (var x = 0; x < local_group.entities.length; x++) {
        var local_entity_id = local_group.entities[x];
        var local_entity_el = document.querySelector(`.entity[data-id="${local_entity_id}"]`);
        var local_entity = getEntity(local_entity_id);

        if (isEntityHidden(local_entity))
          local_entity_el.classList.add("entity-hidden");
        if (local_entity.options.mask)
          if (!local_entity_el.classList.contains(local_entity.options.mask))
            local_entity_el.classList.add(local_entity.options.mask);
      }
    }
  }
}