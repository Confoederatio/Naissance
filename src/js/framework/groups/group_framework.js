//Initialise functions
{
  function selectGroup (arg0_group_id) {
    //Convert from parameters
    var group_id = arg0_group_id;

    //Declare local instance variables
    var brush_obj = main.brush;
    var common_selectors = config.defines.common.selectors;
    var group_el = getGroupElement(group_id);
    var group_obj = getGroup("hierarchy", group_id);

    var all_group_els = document.querySelector(common_selectors.hierarchy).querySelectorAll(`.group`);

    brush_obj.selected_group_id = group_id;
    for (var i = 0; i < all_group_els.length; i++)
      all_group_els[i].setAttribute("class", `${group_el.getAttribute("class").replace(" selected", "")}`);
    group_el.setAttribute("class", `${group_el.getAttribute("class")} selected`);
  }
}
