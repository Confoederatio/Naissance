//Import modules
global.child_process = require("child_process");
global.electron = require("electron");
global.fs = require("fs");
global.path = require("path");

//Initialise functions
{
  global.initialiseGlobal = function () {
		//Initialise global.scene
		global.scene = new ve.Scene({
			map_component: new ve.Map()
		});
			global.map = scene.map_component.map;
		
    //Declare global variables
		global.main_navbar = new UI_Navbar();
    global.main = {
			date: Date.getCurrentDate(),
			hierarchy: {},
			interfaces: {
				//Leftbar
				leftbar_ui: new UI_Leftbar(),
				
				//Rightbar
				edit_geometry_label: new UI_EditGeometryLabel(),
				edit_geometry_line: new UI_EditGeometryLine(),
				edit_geometry_point: new UI_EditGeometryPoint(),
				edit_geometry_polygon: new UI_EditGeometryPolygon(),
				edit_selected_geometries_ui: new UI_EditSelectedGeometries(),
				
				//Topbar
				date_ui: new UI_DateMenu(),
				navbar: global.main_navbar,
			},
			layers: {
				//Foreground layers
				overlay_layer: new maptalks.VectorLayer("overlay_layer", [], { hitDetect: true, interactive: true, zIndex: 99 }),
				cursor_layer: new maptalks.VectorLayer("cursor_layer", [], { hitDetect: false, interactive: false, zIndex: 98 }),
				label_layer: new maptalks.VectorLayer("label_layer", [], { hitDetect: false, interactive: false, zIndex: 97 }),
				
				//Background layers
				selection_layer: new maptalks.VectorLayer("selection_layer", [], { hitDetect: false, interactive: false, zIndex: 2 }),
				entity_layer: new maptalks.VectorLayer("entity_layer", [], {
					hitDetect: true,
					interactive: true,
					zIndex: 1 
				})
			},
			map: map,
			renderer: new naissance.Renderer(map),
			settings: {},
			user: {}
    };
		if (!global.naissance) global.naissance = {};
			main.map.settings = {
				autoload_last_date: true
			};
			UI_Settings.loadSettings();
			main.user.brush = new naissance.Brush();
		
		//1.1. Append all layers to map
		Object.iterate(main.layers, (local_key, local_value) => local_value.addTo(map));
		
		//1.2. Add event handlers to map
		//mousedown
		let mousedown_dictionary = ["left_click", "middle_click", "right_click"];
		map.on("mousedown", (e) => {
			for (let i = 0; i < mousedown_dictionary.length; i++)
				delete HTML[mousedown_dictionary[i]];
			HTML[mousedown_dictionary[e.domEvent.which - 1]] = true;
		});
		
		//mouseup
		map.on("mouseup", (e) => {
			for (let i = 0; i < mousedown_dictionary.length; i++)
				delete HTML[mousedown_dictionary[i]];
		});
		
		//2. Set aliases
		main.brush = main.user.brush;
  }

  function trackPerformance () {
    //Declare local instance variables
		let { ipcRenderer } = require('electron');
    let frame_count = 0;
		let last_time = performance.now();

		//Track FPS
    function trackFPS() {
      frame_count++;
			let now = performance.now();

      //Report back to the main process once per second
      if (now - last_time >= 1000) {
        ipcRenderer.send('update-fps', frame_count);
        frame_count = 0;
        last_time = now;
      }

      //Keep the loop going
      requestAnimationFrame(trackFPS);
    }

    //Start the counter
    trackFPS();
  }
}

//Startup process
{
	global.is_naissance = true;
	ve.start({
		//Accepts wildcards (*), exclusionary patterns (!), and folders/file paths
		load_files: [
			"common",
			"!core/startup.js",
			"!core/archives",
			"core"
		],
		special_function: function () {
			try {
				initialiseGlobal();	
			} catch (e) {
				console.error(e);
			}	
		}
	});

  trackPerformance();
}