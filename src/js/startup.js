//Import modules
window.child_process = require("child_process");
window.fs = require("fs");
window.path = require("path");

//Load config
{
  global.load_order = {
    load_directories: [
      "config"
    ],
    load_files: [
      ".config_backend.js"
    ]
  };
  loadConfig();
}

//Init global
{
  //Declare local initialisation constants
  var current_date = new Date();

  //Initialise global.interfaces
  global.interfaces = {};

  //Initialise global.main
  global.main = {};

  //Layer handling
  main.brush = {
    //Specify main brush/selection variables
    cursor: undefined,

    current_selection: undefined, //Renamed selection. The selection entity currently being edited.
    current_path: undefined, //The raw path currently being edited.
    editing_entity: undefined, //The entity ID currently being edited
    entity_options: {}, //Used to store the options of the entity selected.

    simplify_tolerance: 0.005, //The current simplify tolerance for brushes.

    //Brush settings
    auto_simplify_when_editing: true,
    radius: 50000,

    //Brush cache variables
    brush_change: false, //Is updated on brush change

    //Subobjects and masks
    masks: {
      brush_only_mask: false, //Whether the masks only apply to the current brush, and not the entire selection. False by default
      add: [], //Mask override (Array<Object, Polity>)
      intersect_add: [], //Mask intersect override (Array<Object, Polity>)
      intersect_overlay: [], //Mask intersect overlap (Array<Object, Polity>)
      subtract: [] //Overrides mask (Array<Object, Polity>)
    }
  };
  main.cache = {};
  main.date = {
    year: current_date.getFullYear(),
    month: current_date.getMonth() + 1,
    day: current_date.getDate(),
    hour: current_date.getHours(),
    minute: current_date.getMinutes()
  };
  main.entities = [];
  main.events = {
    //Key events
    keys: {},

    //Mouse events
    left_mouse: false,
    mouse_pressed: false,
    right_mouse: false
  };
  main.groups = {
    polities: {}
  };
  main.saves_folder = `${path.dirname(__dirname, "\\..")}\\saves`;
  main.selected_path = `${path.dirname(__dirname, "\\..")}\\saves`;
}

/*
  Hierarchy group data structure:
  <group_name>: {
    name: "France",
    layer: true, //Either true/false

    subgroups: ["departments"],
    entities: ["1", ..]
  },
  <group_name>_departments: {
    name: "Departments",
    parent_group: "France", //Immediate parent

    entities: ["38179137582", "38179137583"] //Entity ID's
  }
*/

//Optimisation
if (!global.config) global.config = {};
  if (!config.mask_classes) config.mask_classes = [];
  if (!config.mask_types) config.mask_types = ["add", "intersect_add", "intersect_overlay", "subtract"];

//Process optimisation
{
  //Masks
  for (var i = 0; i < config.mask_types.length; i++)
    config.mask_classes.push(` ${config.mask_types[i]}`);
}

//UI
{
  //Entity UI
  window.actions_with_context_menu = ["apply-path", "hide-polity", "simplify-entity"];
  window.entity_options = {
    className: "current-union"
  };

  //Sidebar UI
  window.sidebar_selected_entities = [];
}

//Initialise optimisation; map, other UI elements after everything else
{
  initOptimisation();
  
  var map = new maptalks.Map("map", {
    center: [51.505, -0.09],
    zoom: 5,
    spatialReference: {
      projection: 'EPSG:3857' // Ensure that both Maptalks and Leaflet use the same projection
    },
    baseLayer: new maptalks.TileLayer("base", {
      urlTemplate: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      subdomains: ["a"],
      repeatWorld: false
    })
  });
  main.entity_layer = new maptalks.VectorLayer("entity_layer").addTo(map);

  //Initialise Basic Frameworks
  {
    //Initialise Date
    initDateFramework();
  }

  //Initialise Brush UI
  initBrush();
  initBrushUI();

  //KEEP AT BOTTOM!
  //Initialise Undo/Redo
  initialiseUndoRedo();
  initialiseUndoRedoActions();

  initialiseUndoRedoUI();
  initialiseUI();

  //UI loop
  setInterval(function(){
    //Fix main.brush.current_selection
    var reset_brush = false;
    if (main.brush)
      if (main.brush.current_selection)
        if (main.brush.current_selection.options)
          if (!main.brush.current_selection.options.className)
            reset_brush = true;
    if (reset_brush)
      clearBrush();

    //Update bottom-right sidebar UI
    printBrush();
  }, 100);
  setInterval(function(){
    window.mouse_dragged = false;
  }, 500);
}

//Test scripts
setTimeout(function(){
  var hierarchies_obj = main.hierarchies;
  var hierarchy_el = getUISelector("hierarchy");
  loadSave(`${main.saves_folder}\\atlas.js`);

  //Sync entities
  main.equate_entities_interval = equateObject(hierarchies_obj.hierarchy, "entities", global.main, "entities");
  main.previous_hierarchy_html = hierarchy_el.innerHTML;

  //Sync groups
  setInterval(function(){
    refreshHierarchy({ do_not_reload: true });
  }, 100);
  setInterval(function() {
    if (main.previous_hierarchy_html != hierarchy_el.innerHTML) {
      var exported_hierarchies = exportHierarchies({ naissance_hierarchy: "hierarchy" });

      hierarchies_obj.hierarchy.groups = exported_hierarchies.hierarchy.groups;
      main.groups = hierarchies_obj.hierarchy.groups;
      main.previous_hierarchy_html = hierarchy_el.innerHTML;
    }
  }, 1000);
}, 100);
