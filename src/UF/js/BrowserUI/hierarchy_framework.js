//Hierarchies
//Initialisation functions
{
  /*
    getHierarchyFromID() - Fetches hierarchy from hierarchy ID.
    arg0_hierarchy_id: (String)
    arg1_options: (Object)
      return_key: (Boolean)
  */
  function getHierarchyFromID (arg0_hierarchy_id, arg1_options) {
    //Convert from parmaeters
    var hierarchy_id  = arg0_hierarchy_id;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var all_hierarchies = Object.keys(main.hierarchy_options);

    //Iterate over all_hierarchies
    for (var i = 0; i < all_hierarchies.length; i++) {
      var hierarchy_obj = main.hierarchy_options[all_hierarchies[i]];

      if (hierarchy_obj.id == hierarchy_id)
        //Return statement
        return (!options.return_key) ? hierarchy_obj : all_hierarchies[i];
    }
  }

  /*
    initHierarchy() - Initialises a new hierarchy.
    arg0_options: (Object)
      hide_add_group: (Boolean) - Optional. Whether to hide the 'Add Group' button from .controls. False by default.
      hide_add_entity: (Booelan) - Optional. Whether to hide the 'Add Entity' button from .controls. False by default.
      hide_context_menus: (Boolean) - Optional. Whether to hide context menus. False by default.
      hierarchy_selector: (String) - The selector of the hierarchy container.
      id: (String) - The ID to initialise the hierarchy with.

      delete_function: (String) - The function to apply when an entity is deleted
      rename_function: (String) - The function to apply when an entity is renamed
  */
  function initHierarchy (arg0_options) {
    //Convert from parameters
    var options = (arg0_options) ? arg0_options : {};

    //Make sure main.hierarchies exists
    if (!global.main) global.main = {};
    if (!global.main.hierarchies) global.main.hierarchies = {};
    if (!global.main.hierarchy_options) global.main.hierarchy_options = {};

    //Declare local instance variables
    var hierarchy_el = (options.hierarchy_selector) ?
      document.querySelector(options.hierarchy_selector) : document.querySelector("#hierarchy");
    var hierarchies = main.hierarchies;
    var hierarchy_id = (options.id) ? options.id : generateRandomID(hierarchies);
    var hierarchy_options = main.hierarchy_options;

    hierarchies[hierarchy_id] = {
      groups: {}
    };
    hierarchy_options[hierarchy_id] = {
      id: hierarchy_id
    };
    var hierarchy_obj = hierarchies[hierarchy_id];
    var hierarchy_options_obj = hierarchy_options[hierarchy_id];

    //Set function options
    hierarchy_options_obj.context_menu_selector = options.context_menu_selector;

    hierarchy_options_obj.context_menu_function = options.context_menu_function;
    hierarchy_options_obj.delete_function = options.delete_function;
    hierarchy_options_obj.disable_delete = options.disable_delete;
    hierarchy_options_obj.disable_renaming = options.disable_renaming;
    hierarchy_options_obj.entity_context_menu_function = options.entity_context_menu_function;
    hierarchy_options_obj.group_context_menu_function = options.group_context_menu_function;

    hierarchy_options_obj.rename_function = options.rename_function;

    //Create hierarchy_div
    hierarchy_div = document.createElement("div");
    hierarchy_div.className = "hierarchy";
    hierarchy_div.id = hierarchy_id;

    //Create controls_div
    {
      var controls_div = document.createElement("div");
      controls_div.className = "controls";

      //Add Group button
      if (!options.hide_add_group) {
        var add_group_button = document.createElement("button");
        add_group_button.textContent = `Add Group`;
        add_group_button.addEventListener("click", function () {
          addGroup(hierarchy_id);
        });
        controls_div.appendChild(add_group_button);
      }

      //Add Entity button
      if (!options.hide_add_entity) {
        var add_entity_button = document.createElement("button");
        add_entity_button.textContent = `Add Entity`;
        add_entity_button.addEventListener("click", function () {
          addEntity(hierarchy_id);
        });
        controls_div.appendChild(add_entity_button);
      }

      //Populate controls_div
      hierarchy_el.appendChild(controls_div);
    }
  }
}

//Hierarchy UI Functions - [WIP] - Make sure groups/entities are populated with both proper IDs and names
{
  /*
    addEntity() - Adds an entity to a hierarchy in the DOM.
    arg0_hierarchy_id: (String)
    arg1_options: (Object)
      id: (String)
      name: (String)
      parent_group: (String)

      naissance_hierarchy: (Boolean)
  */
  function addEntity (arg0_hierarchy_id, arg1_options) {
    //Convert from parameters
    var hierarchy_id = arg0_hierarchy_id;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var hierarchy_el = document.getElementById(hierarchy_id);
    var new_entity = createEntity((options.name) ? options.name : "New Entity", options);
    var parent_el = (options.parent_group) ? hierarchy_el.querySelector(`.group[data-id="${options.parent_group}"]`) : hierarchy_el;

    renderList(hierarchy_id, hierarchy_el, [new_entity], options);

    var entity_el = hierarchy_el.querySelector(`.entity[data-id="${options.id}"]`);

    if (options.parent_group)
      insertEntityAtBottom(parent_el, entity_el);

    setupDragAndDrop(hierarchy_el);

    //Return statement
    return new_entity;
  }

  /*
    arg0_hierarchy_id: (String)
    arg1_options: (Object)
      id: (String)
      name: (String)
      parent_group: (String)
  */
  function addGroup (arg0_hierarchy_id, arg1_options) {
    //Convert from parameters
    var hierarchy_id = arg0_hierarchy_id;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var hierarchy_el = document.getElementById(hierarchy_id);
    var new_group = createGroup((options.name) ? options.name : "New Group", undefined, options);
    var parent_el = (options.parent_group) ? hierarchy_el.querySelector(`.group[data-id="${options.parent_group}"]`) : hierarchy_el;

    renderList(hierarchy_id, parent_el, [new_group], options);
    try {
      insertGroupAtTop(parent_el, parent_el.lastChild);
    } catch (e) {
      console.log(`Could not find parent_el at addGroup():`, options.parent_group, hierarchy_el, parent_el);
      console.log(`Attempting to add group`, options, `at`, hierarchy_id);
      console.log(e);
    }
    setupDragAndDrop(hierarchy_el);

    //Return statement
    return new_group;
  }

  /*
    adjustHierarchyContextMenus() - Adjusts the Y position of all context menus given in a hierarchy based on their selector.
    arg0_hierarchy_key: (String)
    arg1_item_el: (HTMLElement) - The item element to sync context menus to.
  */
  function adjustHierarchyContextMenus (arg0_hierarchy_key, arg1_item_el) {
    //Convert from parameters
    var hierarchy_key = arg0_hierarchy_key;
    var item_el = arg1_item_el;

    //Declare local instance variables
    var hierarchy_options = main.hierarchy_options[hierarchy_key];

    //Open context menus
    if (hierarchy_options.context_menu_selector) {
      var all_context_menu_els = document.querySelectorAll(hierarchy_options.context_menu_selector);

      for (var i = 0; i < all_context_menu_els.length; i++) {
        all_context_menu_els[i].style.position = "absolute";
        all_context_menu_els[i].style.top = `${item_el.getBoundingClientRect().top}px`;
      }
    }
  }

  function clearHierarchy (arg0_hierarchy_key, arg1_options) {
    //Convert from parameters
    var hierarchy_key = arg0_hierarchy_key;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var hierarchy_obj = main.hierarchies[hierarchy_key];
    var hierarchy_options = main.hierarchy_options[hierarchy_key];
    var hierarchy_selector = (options.hierarchy_selector) ?
      options.hierarchy_selector : `#${hierarchy_options.id}`;

    hierarchy_obj.groups = {};
    document.querySelector(hierarchy_selector).innerHTML = "";
  }

  function closeHierarchyContextMenus (arg0_hierarchy_key) {
    //Convert from parameters
    var hierarchy_key = arg0_hierarchy_key;

    //Declare local instance variables
    var hierarchy_options = main.hierarchy_options[hierarchy_key];

    //Close context menus
    if (hierarchy_options.context_menu_selector) {
      var all_context_menu_els = document.querySelectorAll(hierarchy_options.context_menu_selector);

      for (var i = 0; i < all_context_menu_els.length; i++)
        hideElement(all_context_menu_els[i]);
    }
  }

  function createEntity (arg0_name, arg1_options) {
    //Convert from parameters
    var name = (arg0_name) ? arg0_name : "New Entity";
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var entity_obj = {
      id: (options.id) ? options.id : generateRandomID(),
      name: name,
      type: "entity"
    };
    entity_obj = mergeObjects(entity_obj, options, { overwrite: true });

    //Return statement
    return entity_obj;
  }

  function createGroup (arg0_name, arg1_children, arg2_options) {
    //Convert from parameters
    var name = (arg0_name) ? arg0_name : "New Group";
    var children = arg1_children;
    var options = (arg2_options) ? arg2_options : {};

    //Declare local instance variables
    var group_obj = {
      id: (options.id) ? options.id : generateRandomID(),
      name: name,
      type: "group",
      children: children || [],
    };
    group_obj = mergeObjects(group_obj, options, { overwrite: true });

    //Return statement
    return group_obj;
  }

  function deleteItem (arg0_hierarchy_id, arg1_el) {
    //Convert from parameters
    var hierarchy_id = arg0_hierarchy_id;
    var local_el = arg1_el;

    //Declare local instance variables
    var hierarchy_key = getHierarchyFromID(hierarchy_id, { return_key: true });
    var hierarchy_options = main.hierarchy_options[hierarchy_key];

    //Remove element and send function if necessary
    if (hierarchy_options.delete_function)
      global[hierarchy_options.delete_function](local_el.dataset.id);
    try { local_el.parentNode.removeChild(local_el) } catch (e) {};
  }

  /*
    exportHierarchies() - Exports hierarchies according to Naissance standards.
    arg0_options: (Object)
      naissance_hierarchy: (String) - Whether to export the string as a Naissance hierarchy.
  */
  function exportHierarchies (arg0_options) { //[WIP] - Work on element.querySelector('div') and replace it with a more specific selector
    //Convert from parameters
    var options = (arg0_options) ? arg0_options : {};

    //Declare local instance variables
    var hierarchies_obj = {};
    var hierarchy_divs = document.body.getElementsByClassName("hierarchy");

    //Iterate over hierarchy_divs
    for (var i = 0; i < hierarchy_divs.length; i++) {
      var hierarchy_div = hierarchy_divs[i];
      var hierarchy_id = hierarchy_div.id;
      var local_hierarchy_obj = main.hierarchies[hierarchy_id];

      //Guard clause if local_hierarchy_obj is not defined
      if (!local_hierarchy_obj) continue;

      hierarchies_obj[hierarchy_id] = {};

      //Process local groups
      var groups = {};
      var groups_container = hierarchy_div.querySelectorAll(".group, .entity");
      var entities = [];

      //Push .id if possible
      if (local_hierarchy_obj.id)
        hierarchies_obj.id = local_hierarchy_obj.id;

      //Iterate over all descendent groups
      groups_container.forEach(function (element) {
        if (element.className.includes("group")) {
          var group_id = element.dataset.id;
          var group_name = element.querySelector("div").textContent;
          var local_children = element.children;

          var new_group = {
            name: group_name,
            id: group_id,

            entities: [],
            subgroups: []
          };

          //Make sure data isn't lost from main.hierarchies
          groups[group_id] = new_group;
          if (local_hierarchy_obj.groups)
            if (local_hierarchy_obj.groups[group_id])
              groups[group_id] = dumbMergeObjects(new_group, local_hierarchy_obj.groups[group_id]);

          //Make sure group_entities; group_subgroups are refreshed
          groups[group_id].name = group_name;
          groups[group_id].entities = [];
          groups[group_id].subgroups = [];

          var group_entities = groups[group_id].entities;
          var group_subgroups = groups[group_id].subgroups;

          //Iterate over children and add them
          for (var x = 0; x < local_children.length; x++) {
            var local_child = local_children[x];
            var local_id = local_child.dataset.id;

            if (local_child.className.includes("entity")) {
              group_entities.push(local_id);
            } else if (local_child.className.includes("group")) {
              group_subgroups.push(local_id);
            }
          }
        } else if (element.className.includes("entity")) {
          var local_entity_id = element.dataset.id;
          var new_entity = {
            id: local_entity_id,
            name: element.querySelector("div").textContent
          };

          //Make sure data isn't lost from main.hierarchies
          if (local_hierarchy_obj.entities)
            for (var x = 0; x < local_hierarchy_obj.entities.length; x++) {
              var local_entity = local_hierarchy_obj.entities[x];

              //Check to see if hierarchy_id == options.naissance_hierarchy
              if (hierarchy_id == options.naissance_hierarchy) {
                //Look for .options.className
                if (local_entity.options)
                  if (local_entity.options.className == local_entity_id)
                    new_entity = dumbMergeObjects(new_entity, local_entity);
              } else {
                //Look for .id
                if (local_entity.id == local_entity_id)
                  new_entity = dumbMergeObjects(new_entity, local_entity);
              }
            }

          //Push to export entities array
          entities.push(new_entity);
        }
      });

      hierarchies_obj[hierarchy_id].groups = groups;
      hierarchies_obj[hierarchy_id].entities = entities;
    }

    //Return statement
    return hierarchies_obj;
  }

  /*
    getHierarchyElement() - Fetches a hierarchy element.
    arg0_hierarchy_key: (String)
    arg1_element_id: (String)
    arg2_options: (Object)
      naissance_hierarchy: (Boolean)
      return_key: (Boolean)
  */
  function getHierarchyElement (arg0_hierarchy_key, arg1_element_id, arg2_options) {
    //Convert from parameters
    var hierarchy_key = arg0_hierarchy_key;
    var element_id = arg1_element_id;
    var options = (arg2_options) ? arg2_options : {};

    //Declare local instance variables
    var hierarchy_obj = main.hierarchies[hierarchy_key];

    //Iterate over hierarchy_obj.entities
    if (hierarchy_obj.entities)
      for (var i = 0; i < hierarchy_obj.entities.length; i++) {
        var local_entity = hierarchy_obj.entities[i];

        if (options.naissance_hierarchy) {
          if (local_entity.options)
            if (local_entity.options.className == element_id)
              //Return statement
              return (!options.return_key) ? local_entity : options.return_key;
        } else {
          if (local_entity.id == element_id)
            //Return statement
            return (!options.return_key) ? local_entity : options.return_key;
        }
      }
  }

  function getHierarchyID (arg0_element) {
    //Convert from parameters
    var element = arg0_element;

    //Recursive loop to find parent hierarchy
    while (element)  {
      if (element.className == "hierarchy") return element.id;
      element = element.parentNode;
    }
  }

  function getUngroupedEntities (arg0_hierarchy_key) {
    //Convert from parameters
    var hierarchy_key = arg0_hierarchy_key;

    //Declare local instance variables
    var hierarchy_obj = main.hierarchies[hierarchy_key];
    var grouped_entities = [];
    var ungrouped_entities = [];

    if (hierarchy_obj.groups) {
      var all_groups = Object.keys(hierarchy_obj.groups);

      for (var i = 0; i < all_groups.length; i++) {
        var local_group = hierarchy_obj.groups[all_groups[i]];

        if (local_group.entities)
          grouped_entities = appendArrays(grouped_entities, local_group.entities);
      }
    }
    if (hierarchy_obj.entities)
      for (var i = 0; i < hierarchy_obj.entities.length; i++) {
        var local_entity = hierarchy_obj.entities[i];
        var local_entity_id;

        if (local_entity.options)
          if (local_entity.options.className)
            local_entity_id = local_entity.options.className;
        if (!local_entity_id)
          local_entity_id = local_entity.id;

        //Check to see if local_entity_id is in grouped_entities
        if (!grouped_entities.includes(local_entity_id))
          ungrouped_entities.push(local_entity_id);
      }

    //Return statement
    return ungrouped_entities;
  }

  function insertEntityAtBottom (arg0_container_el, arg1_entity_el) {
    //Convert from parameters
    var container_el = arg0_container_el;
    var entity_el = arg1_entity_el;

    container_el.appendChild(entity_el);
  }

  function insertGroupAtTop (arg0_container_el, arg1_group_el) {
    //Convert from parameters
    var container_el = arg0_container_el;
    var group_el = arg1_group_el;

    //Declare local instance variables
    var controls_el = container_el.querySelector(".controls");
    var has_entity_el = container_el.querySelector(".entity");

    (!has_entity_el) ?
      appendAfterSiblings(container_el, `#hierarchy > .group`, group_el) :
      appendBeforeSiblings(container_el, `#hierarchy > .entity`, group_el);
  }

  function renameItem (arg0_hierarchy_id, arg1_element) {
    //Convert from parameters
    var hierarchy_id = arg0_hierarchy_id;
    var element = arg1_element;

    //Declare local instance variables
    var hierarchy_key = getHierarchyFromID(hierarchy_id, { return_key: true });
    var hierarchy_options = main.hierarchy_options[hierarchy_key];
    var new_name;

    var input = document.createElement("input");
    input.type = "text";
    input.value = element.textContent;

    //Input onchange event listener
    input.addEventListener("blur", function () {
      var parent_el = input.parentNode.parentNode;
      new_name = input.value;
      element.textContent = new_name;

      //Check for hierarchy_obj.rename_function
      if (hierarchy_options.rename_function)
        global[hierarchy_options.rename_function](parent_el.dataset.id, new_name);
    });

    element.textContent = "";
    element.appendChild(input);
    input.focus();
  }

  //[WIP] - Finish renderHierarchy() - Renders hierarchy elements from object
  /*
    renderHierarchy() - Renders a hierarchy into the DOM.
    arg0_hierarchy_key: (String)
    arg1_options: (Object)
      depth: (Number)
      entity_rendering_order: (Array<String>)
      excluded_entities: (Array<String>)
      excluded_groups: (Array<String>)
      naissance_hierarchy: (Boolean)
  */
  function renderHierarchy (arg0_hierarchy_key, arg1_options) {
    //Convert from parameters
    var hierarchy_key = arg0_hierarchy_key;
    var options = (arg1_options) ? arg1_options : {};

    //Initialise optimisation parameters
    if (!options.depth) options.depth = -1;
    if (!options.entity_rendering_order) options.entity_rendering_order = getHierarchyRenderingOrder();
    if (!options.excluded_entities) options.excluded_entities = [];
    if (!options.excluded_groups) options.excluded_groups = [];

    //Declare local instance variables
    var excluded_entities = options.excluded_entities;
    var excluded_groups = options.excluded_groups;
    var hierarchy_el = document.getElementById(hierarchy_key);
    var hierarchy_obj = main.hierarchies[hierarchy_key];

    //Iterate options.depth
    options.depth++;

    //Reset hierarchy_el only if elements haven't been reset yet
    if (excluded_entities.length == 0 && excluded_groups.length == 0) {
      var all_group_els = hierarchy_el.querySelectorAll(`#${hierarchy_key} > .group`);
      var all_entity_els = hierarchy_el.querySelectorAll(`#${hierarchy_key} > .entity`);

      for (var i = 0; i < all_group_els.length; i++)
        all_group_els[i].remove();
      for (var i = 0; i < all_entity_els.length; i++)
        all_entity_els[i].remove();
    }

    //Render groups
    if (hierarchy_obj.groups) {
      var all_groups = Object.keys(hierarchy_obj.groups);

      //Render first-layer groups
      for (var i = 0; i < all_groups.length; i++)
        if (!excluded_groups.includes(all_groups[i])) {
          var local_group = hierarchy_obj.groups[all_groups[i]];

          if (!local_group.parent_group) {
            addGroup(hierarchy_key, {
              id: all_groups[i],
              name: local_group.name
            });
            excluded_groups.push(all_groups[i]);
          }
        }

      //Render nth-layer groups
      for (var i = 0; i < all_groups.length; i++)
        if (!excluded_groups.includes(all_groups[i])) {
          var local_group = hierarchy_obj.groups[all_groups[i]];

          if (local_group.parent_group) {
            addGroup(hierarchy_key, {
              id: all_groups[i],
              name: local_group.name,
              parent_group: local_group.parent_group
            });
            excluded_groups.push(all_groups[i]); //Mark as already rendered

            //Render subgroups
            renderHierarchy(hierarchy_key, options);
          }
        }
    }

    //Render entities
    var all_ungrouped_entities = getUngroupedEntities(hierarchy_key);

    //Render first-layer entities
    for (var i = 0; i < all_ungrouped_entities.length; i++)
      if (!excluded_entities.includes(all_ungrouped_entities[i])) {
        var local_entity = getHierarchyElement(hierarchy_key, all_ungrouped_entities[i], {
          naissance_hierarchy: options.naissance_hierarchy
        });

        addEntity(hierarchy_key, {
          id: all_ungrouped_entities[i],
          name: local_entity.name,

          naissance_hierarchy: options.naissance_hierarchy
        });
        excluded_entities.push(all_ungrouped_entities[i]);
      }
    //Render nth-layer entities
    for (var i = 0; i < options.entity_rendering_order.length; i++) {
      var local_entity = getEntity(options.entity_rendering_order[i]);
      var local_entity_id;
      var local_entity_name;

      //Fetch local_entity_id
      if (options.naissance_hierarchy) {
        if (local_entity.options) {
          local_entity_id = local_entity.options.className;
          local_entity_name = local_entity.options.entity_name;
        }
      } else {
        local_entity_id = local_entity.id;
        local_entity_name = local_entity.name;
      }

      if (!all_ungrouped_entities.includes(local_entity_id) && !excluded_entities.includes(local_entity_id)) {
        addEntity(hierarchy_key, {
          id: local_entity_id,
          name: local_entity_name,
          parent_group: getEntityGroup(hierarchy_key, local_entity_id, { return_key: true }),

          naissance_hierarchy: options.naissance_hierarchy
        });
        excluded_entities.push(local_entity_id);
      }
    }
  }

  function renderList (arg0_hierarchy_id, arg1_parent_el, arg2_items, arg3_options) {
    //Convert from parameters
    var hierarchy_id = arg0_hierarchy_id;
    var parent_el = arg1_parent_el;
    var items = getList(arg2_items);
    var options = (arg3_options) ? arg3_options : {};

    //Initialise options
    options.depth = returnSafeNumber(options.depth);

    //Declare local instance variables
    var hierarchy_el = document.querySelector(`#${hierarchy_id}`);
    var hierarchy_key = getHierarchyFromID(hierarchy_id, { return_key: true });
    var hierarchy_obj = main.hierarchies[hierarchy_key];
    var hierarchy_options = main.hierarchy_options[hierarchy_key];

    //Iterate over all items
    for (var i = 0; i < items.length; i++) {
      let local_div = document.createElement("div");
      let local_item = items[i];

      local_div.className = local_item.type;
      local_div.draggable = true;
      local_div.dataset.id = local_item.id;
      local_div.dataset.type = local_item.type;

      //Create name_div
      var name_div = document.createElement("div");
      name_div.setAttribute("class", "item-name");

      name_div.textContent = local_item.name;
      if (!hierarchy_options.disable_renaming)
        name_div.addEventListener("click", function (e) {
          renameItem(hierarchy_id, e.target);
        });

      //Create container interaction_el
      var interaction_container_el = document.createElement("span");
      interaction_container_el.setAttribute("class", "interaction-container");

      //Create context_menu_container
      {
        var context_menu_container = document.createElement("div");
        context_menu_container.id = "context-menu-container";
        interaction_container_el.appendChild(context_menu_container);
      }

      //Create delete_button
      {
        var delete_button = document.createElement("button");
        delete_button.textContent = "Delete";
        delete_button.setAttribute("class", "delete-button");
        delete_button.addEventListener("click", function (e) {
          if (!hierarchy_options.disable_delete)
            (local_item.type == "group") ?
              deleteGroup(hierarchy_key, local_item.id) :
              deleteItem(hierarchy_id, local_div);
        });
        interaction_container_el.appendChild(delete_button);
      }

      //Create context menu buttons if necessary
      if (!hierarchy_options.hide_context_menus) {
        var context_menu_button = document.createElement("img");
        context_menu_button.setAttribute("class", "context-menu-button");
        context_menu_button.setAttribute("src", "./gfx/interface/context_menu_icon.png");

        if (hierarchy_options.context_menu_function)
          context_menu_button.addEventListener("click", function (e) {
            global[hierarchy_options.context_menu_function](hierarchy_key, local_item.id);
          });
        if (hierarchy_options.group_context_menu_function)
          if (local_item.type == "group")
            context_menu_button.addEventListener("click", function (e) {
              global[hierarchy_options.group_context_menu_function](hierarchy_key, local_item.id);
            });
        if (hierarchy_options.entity_context_menu_function)
          if (local_item.type == "entity")
            context_menu_button.addEventListener("click", function (e) {
              global[hierarchy_options.entity_context_menu_function](hierarchy_key, local_item.id);
            });

        interaction_container_el.appendChild(context_menu_button);
      }

      //Append name_div, delete_button to local_div
      local_div.appendChild(name_div);
      local_div.appendChild(interaction_container_el);
      try {
        parent_el.appendChild(local_div);
      } catch (e) {
        console.log(`Could not find parent_el at renderList():`, parent_el, local_div);
        console.log(e)
      }

      //Recursively render list
      if (local_item.type == "group") {
        var new_options = JSON.parse(JSON.stringify(options));
          new_options.depth++;
        renderList(hierarchy_id, local_div, local_item.children, new_options);
      }
    }
  }

  function setupDragAndDrop (arg0_hierarchy_el) {
    //Convert from parameters
    var hierarchy_el = arg0_hierarchy_el;

    //Declare local instance variables
    var dragged;
    var placeholder = document.createElement("div");
    placeholder.className = "placeholder";

    //DragStart handler
    hierarchy_el.addEventListener("dragstart", function (e) {
      dragged = e.target;
      e.target.style.opacity = 0.8;
    });

    //DragEnd handler
    hierarchy_el.addEventListener("dragend", function (e) {
      e.target.style.opacity = "";
      if (placeholder.parentNode)
        placeholder.parentNode.removeChild(placeholder);
    })

    //DragOver handler
    hierarchy_el.addEventListener("dragover", function (e) {
      e.preventDefault();
      var target = e.target;

      if (target.className == "group" || target.className == "entity" || target.className == "hierarchy") {
        var rect = target.getBoundingClientRect();
        var offset = e.clientY - rect.top;

        (offset > rect.height/2) ?
          target.parentNode.insertBefore(placeholder, target.nextSibling) :
          target.parentNode.insertBefore(placeholder, target);
      }
    });

    //Drop handler
    hierarchy_el.addEventListener("drop", function (e) {
      e.preventDefault();
      var dragged_hierachy = getHierarchyID(target);
      var dragged_type = dragged.dataset.type;
      var target = e.target;
      var target_hierarchy = getHierarchyID(dragged);

      //Guard clause to prevent cross-contamination between hierarchies
      if (target_hierarchy != dragged_hierachy) return;
      
      if (target.className == "group") {
        if (dragged_type == "group" || dragged_type == "entity") {
          dragged.parentNode.removeChild(dragged);
          target.appendChild(dragged);
        }
      } else if (target.className == "entity" && dragged_type == "entity" && placeholder.parentNode) {
        dragged.parentNode.removeChild(dragged);
        placehodler.parentNode.replaceChild(dragged, placeholder);
      } else if (target.className == "hierarchy") {
        dragged.parentNode.removeChild(dragged);

        if (dragged_type == "group") {
          insertGroupAtTop(target, dragged);
        } else if (dragged_type == "entity") {
          insertEntityAtBottom(target, dragged);
        }
        if (placeholder.parentNode)
          placeholder.parentNode.removeChild(placeholder);
      }
    });
  }
}
