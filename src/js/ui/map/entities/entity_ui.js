//Declare Entity UI functions
{
  /*
    closeEntityContextMenu() - Closes an entity context menu and removes it from interfaces.
    arg0_entity_id: (String) - The entity ID to close the context menu for.
  */
  function closeEntityContextMenu (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var entity_el = getEntityElement(entity_id);

    if (entity_el)
      if (!entity_el.isMap) {
        //Close entity_el
        entity_el.remove();
        delete interfaces[entity_id];
      }
    cleanEntityContextMenus();
  }

  //cleanEntityContextMenus() - Cleans up any empty context menus leftover.
  function cleanEntityContextMenus () {
    var all_ui_els = document.querySelectorAll(`.maptalks-front .maptalks-ui > div`);

    for (var i = 0; i < all_ui_els.length; i++)
      if (all_ui_els[i].innerHTML.length == 0)
        all_ui_els[i].remove();
  }

  /*
    createPopup() - Creates an on-map popup at a given set of coordinates.
    arg0_coords: (Array<Number, Number>) - The coords at which to place the new popup.
    arg1_content: (String) - The innerHTML value which to print on the popup.
    arg2_options: (Object)
      className: (String) - The class name of the given popup.

    Returns: (Object)
  */
  function createPopup (arg0_coords, arg1_content, arg2_options) {
    //Convert from parameters
    var coords = (Array.isArray(arg0_coords)) ?
      { x: arg0_coords[1], y: arg0_coords[0], z: undefined } : arg0_coords;
    var content = (arg1_content) ? arg1_content : "";
    var options = (arg2_options) ? arg2_options : {};

    //Initialise options
    if (!options.className) options.className = "default";

    //Declare local instance variables
    content = `<div class = "leaflet-popup${(options.className) ? ` ${options.className}` : ""}">${content}</div>`;
    var popup = new maptalks.ui.UIMarker(coords, {
      draggable: true,
      single: false,
      content: content
    });
    popup.addTo(map).show();

    //interfaces[options.className]
    var popup_window_el = document.querySelector(`.leaflet-popup${(options.className) ? `[class~="${options.className}"]` : ""}`);

    if (!interfaces[options.className]) {
      interfaces[options.className] = {
        content: popup_window_el,
        options: {}
      };
    } else {
      var local_interface = interfaces[options.className];
      if (!local_interface.content) local_interface.content = popup_window_el;
      if (!local_interface.options) local_interface.options = {};
    }


    //Enforce proper pointer events
    ["click", "mousedown", "mouseup", "mousemove", "touchstart", "touchend", "wheel"].forEach((event) => {
      popup_window_el.addEventListener(event, function (e) {
        e.stopPropagation();
      });
    });

    //Return statement
    return interfaces[options.className];
  }

  /*
    getEntityElement() - Fetches the current entity UI element.
    arg0_entity_id: (String) - The entity ID for whose element to return.
    arg1_options: (Object)
      return_selector: (Boolean) - Optional. Whether to return the selector instead of the element. False by default.

    Returns: (HTMLElement/String)
  */
  function getEntityElement (arg0_entity_id, arg1_options) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var common_selectors = config.defines.common.selectors;
    var entity_selector = `${common_selectors.entity_ui}[class~="${entity_id}"]`;

    //Return statement
    return (!options.return_selector) ? document.querySelector(entity_selector) : entity_selector;
  }

  function onEntityUISetEntityName (arg0_name_element) {
    //Convert from parameters
    var name_el = arg0_name_element;

    //Declare local instance variables
    var entity_obj = getEntity(name_el.getAttribute("class"));

    if (entity_obj)
      renameEntity(entity_obj, name_el.value);
  }

  function populateEntityColour (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var current_history = getHistoryFrame(entity_id);
    var entity_obj = getEntity(entity_id);
    var entity_selector = getEntityElement(entity_id, { return_selector: true });
    var entity_ui_obj = global.interfaces[entity_id];
    var page = entity_ui_obj.page;

    //Initialise setColourWheelCursor()
    if (current_history.options)
      if (Object.keys(current_history.options).length > 0)
        if (page == "fill") {
          setColourWheelCursor(`${entity_selector} #colour_input`, hexToRGB(current_history.options.fillColor));
        } else if (page == "stroke") {
          setColourWheelCursor(`${entity_selector} #colour_input`, hexToRGB(current_history.options.color));
        }
  }

  function populateEntityTooltips (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var entity_class = `[class~='${entity_id}']`;

    //Initialise tooltips - Header
    tippy(`${entity_class} #close-popup`, {
      content: "Close",
      arrow: false
    });
    tippy(`${entity_class} #delete-entity`, {
      content: "Delete Entity",
      arrow: false
    });
    tippy(`${entity_class} .pin-icon`, {
      content: "Pin Entity",
      arrow: false
    });
    tippy(`${entity_class} .reverse-pin-icon`, {
      content: "Unpin Entity",
      arrow: false
    });

    //Initialise tooltips - Bio
    tippy(`${entity_class} .bio-context-menu-icon`, {
      content: "Entry Options",
      arrow: false
    });
    tippy(`${entity_class} .bio-jump-to-icon`, {
      content: "Jump to Date",
      arrow: false
    });
  }

  function populateEntityUI (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variable
    var entity_ui_obj = global.interfaces[entity_id];
    var page = entity_ui_obj.page;
    var tabs = ["actions", "customisation", "timeline"];

    //Begin populating entity UI
    printEntityBio(entity_id);
    populateEntityColour(entity_id);
    populateTimelineGraph(entity_id);

    //Initialise tooltips
    setTimeout(function(){
      populateEntityTooltips(entity_id);
    }, 100);

    //Keep collapsed tabs
    for (var i = 0; i < tabs.length; i++)
      if (entity_ui_obj[`${tabs[i]}_collapsed`])
        minimiseUI(`${tabs[i]}-minimise-btn-${entity_id}`, tabs[i]);
  }

  function printEntityBio (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var common_selectors = config.defines.common.selectors;
    var entity_el = getEntityElement(entity_id);

    var bio_container_el = entity_el.querySelector(common_selectors.entity_bio_table);
    var bio_el = entity_el.querySelector(common_selectors.entity_bio_table);
    var bio_string = [];
    var context_menu_el = entity_el.querySelector(common_selectors.entity_keyframe_context_menu_anchor);
    var entity_obj = getEntity(entity_id);

    if (entity_obj) {
      var actual_timestamp;
      var all_histories = Object.keys(entity_obj.options.history);

      //Set actual_timestamp
      if (context_menu_el)
        if (context_menu_el.parentElement.getAttribute("timestamp"))
          actual_timestamp = convertTimestampToInt(context_menu_el.parentElement.getAttribute("timestamp"));
      closeEntityKeyframeContextMenus(entity_id); //Close previously open context menus

      //Format bio_string; populate header
      bio_string.push(`<tr class = "no-select top-bio-header">
        <th class = "uppercase">Date</th>
        <th>
          <img class = "bio-add-keyframe-icon plus-icon" draggable = "false" src = "./gfx/interface/plus_icon.png">
        </th>
      </tr>`);
      bio_string.push(`<tr class = "no-select header-padding"><th></th><th></th></tr>`);

      //Iterate over all_history_entries
      for (var i = 0; i < all_histories.length; i++) {
        var old_history_frame = getHistoryFrame(entity_obj, all_histories[i - 1]);
        var new_history_frame = getHistoryFrame(entity_obj, all_histories[i]);

        bio_string.push(getHistoryFrameLocalisation(entity_obj, old_history_frame, new_history_frame));
      }

      //Set bio_el to bio_string
      bio_el.innerHTML = bio_string.join("");

      //Append context menu button
      var all_table_entries = entity_el.querySelectorAll(`${common_selectors.entity_bio_table} tr:not(.no-select) > td:last-child`);

      for (var i = 0; i < all_table_entries.length; i++) {
        var local_timestamp = convertTimestampToInt(all_table_entries[i].parentElement.getAttribute("timestamp"));

        all_table_entries[i].innerHTML += `
          <img class = "bio-context-menu-icon" draggable = "false" timestamp = "${local_timestamp}" src = "./gfx/interface/context_menu_icon.png">
          <img class = "bio-jump-to-icon" draggable = "false" timestamp = "${local_timestamp}" src = "./gfx/interface/jump_to_icon.png"">
        `;
      }

      //Move context_menu_el back to relevant element if available
      var new_history_entry_el = entity_el.querySelector(`${common_selectors.entity_bio_table} tr[timestamp="${actual_timestamp}"]`);

      //Add keyframe context menul; jump to functionality
      var all_context_menu_btns = entity_el.querySelectorAll(`img.bio-context-menu-icon`);
      var all_jump_to_btns = entity_el.querySelectorAll(`img.bio-jump-to-icon`);

      for (var i = 0; i < all_context_menu_btns.length; i++)
        all_context_menu_btns[i].onclick = function (e) {
          printEntityKeyframeNavigationMenu(entity_id, this.parentElement);
        }
      for (var i = 0; i < all_jump_to_btns.length; i++)
        all_jump_to_btns[i].onclick = function (e) {
          var local_timestamp = parseInt(this.getAttribute("timestamp"));

          main.date = convertTimestampToDate(local_timestamp);
          loadDate();
        };
    } else {
      //Hide the Bio UI if entity_obj is not defined yet
      if (!bio_container_el.getAttribute("class").includes("display-none"))
        bio_container_el.setAttribute("class", bio_container_el.getAttribute("class") + " display-none");
    }
  }

  /*
  printEntityContextMenu() - Prints an Entity context menu on the current map.
  arg0_entity_id: (String)
  arg1_options: (Object)
    coords: (Array<Number, Number>) - Optional. The coordinates to use for the popup instead of the default. Centroid of entity by default.
    is_being_edited: (Boolean) - Optional. Whether the entity is currently being edited. False by default.
    pin: (Boolean) - Optional. Whether the entity is currently pinned. False by default.
  */
  function printEntityContextMenu (arg0_entity_id, arg1_options) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var common_selectors = config.defines.common.selectors;

    var brush_obj = main.brush;
    var coords_string;
    var common_selectors = config.defines.common.selectors;
    var entity_interface = interfaces[entity_id];
    var entity_obj = getEntity(entity_id);
    var is_being_edited = (options.is_being_edited);
    var is_pinned = (options.pin);
    var reload_popup = false;
    var to_pin = (!is_pinned);

    //Fetch is_being_edited; pin status, coords_string
    if (brush_obj.editing_entity == entity_id) is_being_edited = true;
    if (options.coords)
      coords_string = (typeof options.coords == "object" && !Array.isArray(options.coords)) ?
        `[${[options.coords.x, options.coords.y]}]` :
        `[${options.coords.toString()}]`;

    //Check if reload_popup is true; only close existing UI and open a new popup if the popup is not already pinned
    if (entity_interface) {
      if (!entity_interface.options.is_pinned) reload_popup = true;

      //Also reload popup if pin argument is different to is_pinned
      if (is_pinned != entity_interface.options.is_pinned) reload_popup = true;
    } else {
      //Popup for entity doesn't exist, so create a new one
      reload_popup = true;
    }

    //Reload leaflet popup if reload_popup is true
    if (reload_popup) {
      closeEntityContextMenu(entity_id);

      //Bind popup
      var popup_options = {
        id: "entity-ui-popup",
        class: entity_id,
        className: entity_id
      };

      //Create entity options to serve as flags
      if (entity_obj)
      if (!entity_obj.options.selected_keyframes)
        entity_obj.options.selected_keyframes = [];
      if (!is_pinned) popup_options.is_pinned = is_pinned;
      if (is_pinned) {
        popup_options.autoClose = false;
        popup_options.closeOnClick = false;
        popup_options.is_pinned = true;
      }

      //Set popup
      var last_history_coords = getEntityCoords(entity_id);
      var leaflet_centre_coords;

      //Fetch centroid for leaflet_centre_coords if options.coords is not available
      if (!options.coords) {
        var turf_polygon = getTurfObject(last_history_coords);
        var turf_polygon_centre = turf.center(turf_polygon).geometry.coordinates;

        leaflet_centre_coords = [turf_polygon_centre[1], turf_polygon_centre[0]]; //Convert from Turf LatLng to LngLat
      } else {
        leaflet_centre_coords = options.coords;
      }
      options.coords = leaflet_centre_coords;

      //Open popup
      var html_content = `
        <!-- 1. Entity UI Header -->
        ${printEntityContextMenuHeaderSection(entity_id, options)}

        <!-- 2. Timeline/Data Section -->
        ${printEntityContextMenuHeader(entity_id, { id: "entity-timeline-data-header", name: "Timeline/Data"})}
        ${printEntityContextMenuTimelineDataSection(entity_id)}
        ${printEntityContextMenuBioSection(entity_id)}

        <!-- 3. Customisation -->
        ${printEntityContextMenuHeader(entity_id, { id: "entity-customisation-header", name: "Customisation"})}
        <div id = "customisation-top-parent" class = "entity-ui-container customisation-top-parent">
          <div id = "entity-ui-customisation-colour"></div>
          <div id = "entity-ui-customisation-other">
            <div id = "customisation-tab-container"></div>
            <div id = "customisation-options"></div>
          </div>
        </div>

        <!-- 4. Actions UI -->
        ${printEntityContextMenuHeader(entity_id, { id: "entity-actions-header", name: "Actions" })}

        <!-- 5. Context Menu Anchors -->
        <div id = "entity-actions-context-menu"></div>
        <div id = "entity-keyframe-context-menu"></div>
      `;
      var popup = createPopup(leaflet_centre_coords, html_content, popup_options);
      interfaces[entity_id] = popup;

      //Call createContextMenu() after the popup content is set
      setTimeout(function(){
        var entity_actions_el = getEntityActionsAnchorElement(entity_id)
        var entity_actions_ui = printEntityActionsNavigationMenu(entity_id, entity_actions_el);

        var entity_customisation_ui = printEntityContextMenuCustomisationSection(entity_id);

        //Populate entity UI
        populateEntityUI(entity_id);
      }, 1);
    }
  }

  function printEntityContextMenuBioSection (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Return statement
    return `<div id = "entity-ui-timeline-bio-container" class = "entity-ui-container bio">
      <div id = "entity-ui-timeline-bio-subcontainer" class = "relative">
        <table id = "entity-ui-timeline-bio-table" class = "timeline-bio-table">
          <tr>
            <th>YEAR</th>
            <th></th>
          </tr>
        </table>
      </div>
    </div>`;
  }

  function printEntityContextMenuCustomisationSection (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var common_selectors = config.defines.common.selectors;
    var current_history = getHistoryFrame(entity_id, main.date);
    var entity_el = getEntityElement(entity_id);

    var entity_customisation_content_selector = `div.leaflet-popup[class~="${entity_id}"] ${common_selectors.entity_customisation_options}`;
    var entity_customisation_selector = `div.leaflet-popup[class~="${entity_id}"] ${common_selectors.entity_colour_picker}`;
    var entity_maximum_zoom = (current_history.options.maximum_zoom_level) ? current_history.options.maximum_zoom_level : 0;
    var entity_minimum_zoom = (current_history.options.minimum_zoom_level) ? current_history.options.minimum_zoom_level : 0;

    //Define colour picker
    var entity_customisation_fill_tab_el = createContextMenu({
      anchor: entity_customisation_selector,
      class: `colour-picker-container unique`,
      id: "entity-colour-picker",
      name: "Colour Picker:",

      colour_input: {
        id: "colour_input",
        type: "colour",

        x: 0,
        y: 0,

        onclick: function (arg0_colour) {
          //Convert from parameters
          var colour = arg0_colour;

          //Declare local instance variables
          var entity_obj = getEntity(entity_id);
          var entity_ui_obj = global.interfaces[entity_id];

          if (entity_ui_obj.page == "fill") {
            setEntityFillColour(entity_id, colour);
          } else if (entity_ui_obj.page == "stroke") {
            setEntityStrokeColour(entity_id, colour);
          }
        }
      }
    });

    //Define tab options in #entity-ui-customisation-options-container
    var entity_customisation_content_el = createPageMenu({
      id: entity_id,

      anchor: entity_customisation_content_selector,
      tab_anchor: common_selectors.entity_customisation_tab_container,
      default: "fill",

      class: `customisation-options-container`,
      name: "Customisation Options:",

      pages: {
        fill: {
          name: "Fill"
        },
        stroke: {
          name: "Stroke"
        },
        other: {
          name: "Other",

          maximum_zoom_level: {
            id: "maximum_zoom_level",
            name: "Maximum Zoom Level: ",
            type: "number",
            attributes: {
              min: 0,
              max: 20,
              value: entity_maximum_zoom
            },
            onclick: function (e) {
              setEntityMaximumZoomLevel(entity_id, e.target.value);
            }
          },
          minimum_zoom_level: {
            id: "minimum_zoom_level",
            name: "Minimum Zoom Level: ",
            type: "number",
            attributes: {
              min: 0,
              max: 20,
              value: entity_minimum_zoom
            },
            onclick: function (e) {
              setEntityMinimumZoomLevel(entity_id, e.target.value);
            }
          },

          custom_data_fields: {
            id: "custom_data_fields",
            name: "<b>Custom Data Fields:</b>",
            type: "html"
          }
        }
      }
    });
  }

  /*
    printEntityContextMenuHeader() - Returns an entity context menu header innerHTML string.
    arg0_entity_id: (String) - The entity ID for which to print a header.
    arg1_options: (Object)
      id: (String) - The ID of the header.
      name: (String) - The name of the header.
  */
  function printEntityContextMenuHeader (arg0_entity_id, arg1_options) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var options = (arg1_options) ? arg1_options : {};

    //Initialise options
    if (!options.id) options.id = "entity-header";
    if (!options.name) options.name = "";

    //Return statement
    return `<div id = "${options.id}" class = "entity-ui-container small">${options.name}</div>`;
  }

  /*
    printEntityContextMenuHeaderSection() - Returns innerHTML string for the entity context menu header section.
    arg0_entity_id: (String) - The entity ID for which to print 1. Header.
    arg1_options: (Object)
      coords: (Array<Number, Number>) - Optional. The coordinates to use for the popup instead of the default. Centroid of entity by default.
      is_being_edited: (Boolean) - Optional. Whether the entity is currently being edited. False by default.
      pin: (Boolean) - Optional. Whether the entity is currently pinned. False by default.
  */
  function printEntityContextMenuHeaderSection (arg0_entity_id, arg1_options) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var brush_obj = main.brush;
    var entity_el = getEntityElement(entity_id);
    var entity_obj = getEntity(entity_id);
    var entity_name = getEntityName(entity_obj);
    var is_being_edited = (options.is_being_edited);
    var is_pinned = (options.pin);
    var coords_string;

    //Fetch is_being_edited; pin status, coords_string
    if (brush_obj.editing_entity == entity_id) is_being_edited = true;
    if (options.coords)
      coords_string = (typeof options.coords == "object" && !Array.isArray(options.coords)) ?
        `[${[options.coords.x, options.coords.y]}]` :
        `[${options.coords.toString()}]`;

    //Return statement
    return `<div id = "entity-header" class = "entity-ui-container">
      <input id = "polity-name" class = "${entity_id}" value = "${entity_name}" onkeyup = "onEntityUISetEntityName(this);"></input>

      <img src = "gfx/interface/empty_icon.png" class = "button cross-icon" id = "close-popup" onclick = "closeEntityContextMenu('${entity_id}');" draggable = "false">
      <img src = "gfx/interface/empty_icon.png" class = "button delete-icon" id = "delete-entity" onclick = "deleteEntity('${entity_id}');" draggable = "false">
      <img src = "gfx/interface/empty_icon.png" class = "button ${(!is_pinned) ? "pin-icon" : "reverse-pin-icon"}" id = "pin-popup" onclick = "printEntityContextMenu(${entity_id}, { coords: ${coords_string}, is_being_edited: ${options.is_being_edited}, pin: ${!options.pin} });" draggable = "false">

      <div id = "polity-id">ID: ${entity_id}</div>
    </div>`;
  }

  function printEntityContextMenuTimelineDataSection (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var data_graph_types = [{ id: "land_area", name: "Land Area" }];
    var data_select_ui = [];

    //Format data_select_ui
    for (var i = 0; i < data_graph_types.length; i++)
      data_select_ui.push(`<option value = "${data_graph_types[i].id}">${data_graph_types[i].name}</option>`);

    //Return statement
    return `<div id = "entity-ui-timeline-graph-container" class = "entity-ui-container timeline">
      <div id = "entity-ui-timeline-graph-subcontainer" class = "relative">
        <select id = "entity-ui-timeline-graph-type" class = "entity-select">${data_select_ui.join("\n")}</select>
        <canvas id = "entity-ui-timeline-graph" class = "entity-ui-graph"></canvas>

        <span id = "entity-ui-timeline-graph-y-axis" class = "entity-ui-graph-y-axis"></span>
        <span id = "entity-ui-timeline-graph-y-top-axis-label" class = "graph-label">100%</span>
        <span id = "entity-ui-timeline-graph-y-bottom-axis-label" class = "graph-label">0%</span>

        <div id = "entity-ui-timeline-graph-x-axis" class = "entity-ui-graph-x-axis">
          <span id = "entity-ui-timeline-graph-x-left-axis-label" class = "left-align graph-label">START</span>
          <span id = "entity-ui-timeline-graph-x-right-axis-label" class = "right-align graph-label">END</span>
        </div>
      </div>
    </div>`;
  }
}
