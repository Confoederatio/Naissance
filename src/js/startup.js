//Import modules
global.child_process = require("child_process");
global.fs = require("fs");
global.path = require("path");

//Load config
{
  global.load_order = {
    load_directories: [
      "config",
      "UF",
      "js/framework",
      "js/interface"
    ],
    load_files: [
      ".config_backend.js",
      "./js/interface/*_config.js"
    ]
  };

  loadAllScripts();
}

//Begin load process only once all elements in the DOM are loaded
window.onload = function () {
  //1. Init global, maps, and optimisation
  initialiseGlobal();

  global.map = new maptalks.Map("map", {
    center: [51.505, -0.09],
    zoom: 5,
    /*spatialReference: {
			projection: 'EPSG:3857' // Ensure that both Maptalks and Leaflet use the same projection
		},*/
    baseLayer: new maptalks.TileLayer("base", {
      spatialReference: {
        projection:'EPSG:3857'
      },
      urlTemplate: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      subdomains: ["a", "b", "c"],
      repeatWorld: false
    })
  });
  if (!global.main) global.main = {};
  main.entity_layer = new maptalks.VectorLayer("entity_layer").addTo(map)

  initOptimisation();
  ve.initialise(); //Initialise Vercengen

  //2. Scripts
  initDateFramework();
  initBrushUI();

  //2.1. Undo/Redo
  initialiseUndoRedo();
  initialiseUndoRedoActions();
  initialiseUndoRedoUI();

  //2.2. UI loops
  initialiseUI();
  initialiseMapEventDrawLoops();
  initialiseUIDrawLoops();

  //2.3. UI Event handlers
  initialiseMapHandler();
  initialiseMouseHandler();
  initBrush();
};

//Test scripts
global.load_scripts = setInterval(function(){
  try {
    var hierarchies_obj = main.hierarchies;
    var hierarchy_el = getUISelector("hierarchy");

    //Sync entities
    main.equate_entities_interval = equateObject(hierarchies_obj.hierarchy, "entities", global.main, "entities");
    main.previous_hierarchy_html = hierarchy_el.innerHTML;

    //Sync groups
    initialiseHierarchyDrawLoops();
    loadNaissanceSave(`./saves/project_atlas.js`);

    //KEEP AT BOTTOM! Clear interval once successfully loaded
    clearInterval(global.load_scripts);
  } catch (e) {
    console.error(e);
  }
}, 100);