//Direct Brush UI functions
{
  function initBrush () { //[WIP] - Fix addToBrush(), removeToBrush() to log only the simplified brush to timelines.
    //Declare local instance variables
    var brush_obj = main.brush;

    main.cursor_layer = new maptalks.VectorLayer("cursor_layer", [], {
      hitDetect: true,
      interactive: true
    }).addTo(map);

    //On mousemove event for map
    map.on("mousemove", function (e) {
      if (brush_obj.disable_brush) return; //Internal guard clause if brush is disabled

      window.mouse_dragged = true;

      //Set cursor
      {
        //Remove previous cursor
        if (brush_obj.cursor)
          brush_obj.cursor.remove();

        //Set new cursor
        brush_obj.cursor = new maptalks.Circle(e.coordinate, brush_obj.radius, {
          symbol: {
            lineColor: RGBToHex(0, 0, 0),
            lineDasharray: [4, 4],
            polygonFill: "transparent",
            lineWidth: 2
          }
        });
        main.cursor_layer.addGeometry(brush_obj.cursor);
      }

      //Left click to paint
      if (main.events.mouse_pressed) {
        if (main.events.left_mouse) {
          //Initialise brush_obj.current_path if not defined
          if (!brush_obj.current_path) {
            brush_obj.current_path = brush_obj.cursor;
            if (!brush_obj.entity_options)
              brush_obj.entity_options = {};
              if (!brush_obj.entity_options.className)
                brush_obj.entity_options.className = generateEntityID();
              if (!brush_obj.entity_options.history)
                brush_obj.entity_options.history = {};
          }

          brush_obj.brush_change = true;
          brush_obj.current_path = union(brush_obj.current_path, brush_obj.cursor);
        } else if (main.events.right_mouse) {
          //Only delete if brush_obj.current_path exists
          if (brush_obj.current_path)
            try {
              brush_obj.brush_change = true;
              brush_obj.current_path = difference(brush_obj.current_path, brush_obj.cursor);
            } catch (e) {
              //The selection has been completely deleted
              delete brush_obj.current_path;

              brush_obj.brush_change = true;
            }
        }

        //Refresh selection display
        refreshBrush();
      }
    });

    //Process brush onmouseup
    map.on("mouseup", function (e) {
      if (brush_obj.disable_brush) return; //Internal guard clause if brush is disabled

      if (main.events.mouse_pressed) {
        if (!brush_obj.only_simplify_brush)
          brush_obj.current_path = simplify(brush_obj.current_path, brush_obj.simplify_tolerance);

        if (main.events.left_mouse) {
          brush_obj.current_path = addToBrush(brush_obj.current_path);
          refreshBrush();
        } else if (main.events.right_mouse) {
          removeFromBrush(brush_obj.current_path);
          refreshBrush();
        }
      }
    });

    //Brush cursor outline
    map.getContainer().addEventListener("wheel", function (e) {
      if (brush_obj.disable_brush) return; //Internal guard clause if brush is disabled
      
      //Normalise the wheel delta across different browsers
      var delta_y = e.deltaY*-1;

      if (window.ctrl_pressed) {
        if (delta_y < 0)
          brush_obj.radius = brush_obj.radius*1.1;
        if (delta_y > 0)
          brush_obj.radius = brush_obj.radius*0.9;
      }
    });
  }

  function processBrush (arg0_polygon) {
    //Convert from parameters
    var polygon = arg0_polygon;

    //Declare local instance variables
    var brush_obj = main.brush;
    var selected_id = "";

    if (brush_obj.brush_change) { //brush_obj.brush_change here refers to discrete changes; not continuous changes
      if (brush_obj.current_path) {
        if (brush_obj.current_selection)
          selected_id = brush_obj.current_selection.options.className;

        //Simplify processing
        if (brush_obj.auto_simplify_when_editing)
          if (brush_obj.current_path)
            try {
              if (brush_obj.only_simplify_brush)
                polygon = simplify(polygon, brush_obj.simplify_tolerance);
            } catch (e) {}
        try {
          polygon = processGeometryMasks(polygon);
        } catch (e) {
          console.log(e);
        }

        //Set new poly now
        refreshBrush();
        reloadEntitiesArray();
      }

      //Set brush_obj.brush_change to false to avoid repeat processing
      brush_obj.brush_change = false;
    }

    //Return statement
    return polygon;
  }

  function refreshBrush () {
    //Declare local instance variables
    var brush_obj = main.brush;


    //Refresh polity
    {
      refreshBrushActions();
      
      if (brush_obj.current_selection) {
        brush_obj.current_selection.remove();
        delete brush_obj.current_selection; //current_selection has to actually be deleted to avoid refresh errors
      }
      if (brush_obj.current_path) {
        brush_obj.current_selection = createPolygon(brush_obj.current_path, brush_obj.entity_options);
        brush_obj.current_selection.remove();
        brush_obj.current_selection.addTo(main.cursor_layer);
        
        //Sync history and options
        brush_obj.current_selection.options.history = brush_obj.entity_options.history;
      }

      //Bind tooltip to selection
      if (brush_obj.current_selection) {
        brush_obj.current_selection.setSymbol(brush_obj.entity_options);
        brush_obj.current_selection.addEventListener("mouseup", function (e) {
          if (!window.mouse_dragged && e.domEvent.button == 0)
            printEntityContextMenu(e.target.options.className, { coords: e.coordinate, is_being_edited: true });
        });
      }
    }
  }
}
