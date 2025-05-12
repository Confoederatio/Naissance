//Initialise functions
{
  function initialiseHierarchyDrawLoops () {
    //Declare local instance variables
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
}