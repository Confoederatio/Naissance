//Initialise Sidebar functions
{
  function initHierarchyUI () {
    var hierarchy_el = document.getElementById("hierarchy");

    initHierarchy({
      hide_add_entity: true,
      hierarchy_selector: "#hierarchy",
      id: "hierarchy",

      //Selectors
      context_menu_selector: `#hierarchy-context-menu, #hierarchy-context-menu-two`,

      //Functions
      delete_function: "deleteEntity",
      entity_context_menu_function: "printHierarchyEntityContextMenu",
      group_context_menu_function: "printGroupActionsNavigationMenuHandler",
      rename_function: "renameEntity"
    });
    initHierarchyEvents();
  }
}

//Sidebar UI functions
{
  function initHierarchyEvents () {
    //Declare local instance variables
    var dragged;
    var hierarchy_el = getUISelector("hierarchy");

    //Function body
    var placeholder = document.createElement("div");
    placeholder.className = "placeholder";

    //DragStart handler on placeholder
    hierarchy_el.addEventListener("dragstart", function (e) {
      dragged = e.target;
      e.target.style.opacity = 0.8;
    });

    //DragEnd handler on placeholder
    hierarchy_el.addEventListener("dragend", function (e) {
      e.target.style.opacity = "";
      if (placeholder.parentNode)
        placeholder.parentNode.removeChild(placeholder);
    });

    //DragOver handler for groups and entities
    hierarchy_el.addEventListener("dragover", function (e) {
      e.preventDefault();
      var target = e.target;

      //Check to make sure target is valid
      if (target.className.includes("group") || target.className.includes("entity") || target.className.includes("hierarchy")) {
        var rect = target.getBoundingClientRect();
        var offset = e.clientY - rect.top;

        (offset > rect.height/2) ?
          target.parentNode.insertBefore(placeholder, target.nextSibling) :
          target.parentNode.insertBefore(placeholder, target);
      }
    });

    //Drop handler for groups and entities
    hierarchy_el.addEventListener("drop", function (e) {
      e.preventDefault();
      var dragged_hierarchy = getHierarchyID(dragged);
      var dragged_type = dragged.dataset.type;
      var target = e.target;
      var target_hierarchy = getHierarchyID(target);

      //Guard clause; prevent cross-contamination between hierarchies
      if (target_hierarchy != dragged_hierarchy) return;

      //Group/entity/base-hierarchy handling
      console.log(target.className, dragged_type, placeholder.parentNode);
      if (target.className.trim() == "group") {
        if (dragged_type == "group" || dragged_type == "entity") {
          dragged.parentNode.removeChild(dragged);
          target.appendChild(dragged);
        }
      } else if (target.className.trim() == "entity" && dragged_type == "entity" && placeholder.parentNode) {
        //Only allow entities to be dropped before or after other entities, not inside them
        dragged.parentNode.removeChild(dragged);
        placeholder.parentNode.replaceChild(dragged, placeholder);
      } else if (target.className == "hierarchy") {
        dragged.parentNode.removeChild(dragged);

        //Check to see dragged_type
        if (dragged_type == "group") {
          insertGroupAtTop(target, dragged);
        } else if (dragged_type == "entity") {
          insertEntityAtBottom(target, dragged);
        }

        if (placeholder.parentNode) placeholder.parentNode.removeChild(placeholder);
      }
    });
  }

  function getEntityHierarchyElement (arg0_entity_id, arg1_options) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var common_selectors = config.defines.common.selectors;
    var entity_obj = getEntity(entity_id);

    var actual_entity_id = entity_obj.options.className;

    //Return statement
    return (!options.return_selector) ?
      document.querySelector(`${common_selectors.hierarchy} .entity[data-id="${actual_entity_id}"]`) :
      `${common_selectors.hierarchy} .entity[data-id="${actual_entity_id}"]`;
  }

  function getGroupElement (arg0_group_id, arg1_options) {
    //Convert from parameters
    var group_id = arg0_group_id;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var group_obj = getGroup("hierarchy", group_id);
      if (!group_obj) return; //Guard clause if group_obj doesn't exist
    var common_selectors = config.defines.common.selectors;

    //Return statement
    return (!options.return_selector) ?
    document.querySelector(`${common_selectors.hierarchy} .group[data-id="${group_obj.id}"]`) :
    `${common_selectors.hierarchy} .group[data-id="${group_obj.id}"]`;
  }
}
