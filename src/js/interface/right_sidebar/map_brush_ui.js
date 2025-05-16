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

  function refreshBrushActions () {
    //Declare local instance variables
    var common_defines = config.defines.common;
    
    var brush_container_el = getUISelector("brush_actions_container");

    //Set brush_actions_container.innerHTML to ""
    brush_container_el.innerHTML = "";
    printBrushActionsNavigationMenu(brush_container_el);
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
}
