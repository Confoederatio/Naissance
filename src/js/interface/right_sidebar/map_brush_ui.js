//Button functionality
{
  function initBrushUI () {
    window.brush_buttons_container_el = document.getElementById("brush-buttons-container");
    window.brush_container_el = document.getElementById("brush-container");
    window.brush_context_menu_el = document.getElementById("brush-context-menu-container");

    /*brush_container_el.onclick = function (e) {
      //Hide element only e.target is not a button
      if (!e.target.getAttribute("onclick"))
        hideElement(brush_context_menu_el);
    };*/

    printBrushActionsNavigationMenu(window.brush_buttons_container_el);
  }
}

//Brush UI functions
{
  function printBrush () {
    //Declare local instance variables
    var brush_info_el = document.getElementById("brush-information-container");
    var brush_obj = main.brush;

    //Format brush_string
    var brush_string = [];

    //Push brush_string
    brush_string.push(`Radius: ${parseNumber(brush_obj.radius)}m`);

    //Additional information handler
    {
      //Selected entity editing
      if (brush_obj.editing_entity) {
        var entity_name = getEntityName(brush_obj.editing_entity, main.date);

        brush_string.push(`Selected Entity: ${entity_name}`);
      }

      //Simplification handler
      if (brush_obj.auto_simplify_when_editing)
        brush_string.push(`Auto-Simplify`);
      if (brush_obj.auto_simplify_when_editing && brush_obj.simplify_tolerance)
        brush_string.push(`Simplify Tolerance: ${parseNumber(brush_obj.simplify_tolerance, { display_float: true })}`);
    }


    //Set .innerHTML
    var actual_brush_string = brush_string.join(` &nbsp;|&nbsp; `);

    if (brush_info_el.innerHTML != actual_brush_string)
      brush_info_el.innerHTML = brush_string.join(` &nbsp;|&nbsp; `);

    //Return statement
    return brush_string;
  }

  /*
    printBrushOptions() - Changes the brush options UI to the selected page
    mode: "simplify"
  */
  /*function printBrushOptions (arg0_mode) {
    //Convert from parameters
    var mode = arg0_mode;

    //Declare local instance variables
    var brush_obj = main.brush;
    var brush_ui = document.getElementById("brush-context-menu-container");

    //Show element
    showElement(brush_context_menu_el);

    //Set brush_ui.innerHTML according to mode
    if (mode == "simplify") {
      brush_ui.innerHTML = `
        <div class = "context-menu-subcontainer">
          <b>Simplify Path:</b>
        </div>
        <div class = "context-menu-subcontainer">
          <input type = "checkbox" id = "auto-simplify-when-editing" checked> <span>Auto-Simplify When Editing</span>
        </div>
        <div class = "context-menu-subcontainer">
          <span>Strength: </span> <input type = "range" id = "simplify-tolerance" min = "0" max = "100" value = "10">
        </div>
      `;

      //Populate UI options
      var auto_simplify_when_editing_el = document.getElementById("auto-simplify-when-editing");
      var simplify_tolerance_el = document.getElementById("simplify-tolerance");

      simplify_tolerance_el.value = parseInt(brush_obj.simplify_tolerance*Math.pow(10, 3));

      //Set listener events
      auto_simplify_when_editing_el.onclick = function (e) {
        //Set global flag
        brush_obj.auto_simplify_when_editing = e.target.checked;
      };

      onRangeChange(simplify_tolerance_el, function (e) {
        //Set global flag
        brush_obj.simplify_tolerance = getSimplifyTolerance(e.target.value);
      });
    }
  }*/
}
