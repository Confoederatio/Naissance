//Initialise functions
{
  function initialiseMapEventDrawLoops () {
    //Set up draw loop
    global.map_event_100ms_draw_loop = setInterval(function(){
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
    global.map_event_500ms_draw_loop = setInterval(function(){
      window.mouse_dragged = false;
    }, 500);
  }
} 