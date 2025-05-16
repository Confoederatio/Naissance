//UI window functions
{
  function closePopup () {
    map.closePopup();
  }

  function hideElement (arg0_element) {
    //Convert from parameters
    var element = arg0_element;

    //Declare local instance variables
    var class_name = element.getAttribute("class");

    if (!class_name.includes(" hidden"))
      (class_name) ?
        element.setAttribute("class", `${class_name} hidden`) :
        element.setAttribute("class", " hidden");
  }

  function updateSidebarHover () {
    //Declare local instance variables
    var all_hovers = document.querySelectorAll(`.hierarchy-elements-container div:hover`);
    var all_legacy_hovers = document.querySelectorAll(`.hover`);

    //Clear all elements with .hover class
    for (var i = 0; i < all_legacy_hovers.length; i++)
      all_legacy_hovers[i].setAttribute("class",
        all_legacy_hovers[i].getAttribute("class").replace(" hover", "")
      );

    //Set only last hover to be hovered
    if (all_hovers.length > 0) {
      var local_class = all_hovers[all_hovers.length - 1].getAttribute("class");

      (local_class) ?
        all_hovers[all_hovers.length - 1].setAttribute("class",
          local_class + " hover"
        ) :
        all_hovers[all_hovers.length - 1].setAttribute("class", " hover");
    }
  }

  function toggleElementVisibility (arg0_element, arg1_button_element) {
    //Convert from parameters
    var element = arg0_element;
    var btn_element = arg1_button_element;

    //Declare local instance variables
    var class_name = element.getAttribute("class");
    var is_visible = true;

    if (class_name)
      if (class_name.includes(" hidden"))
        is_visible = false;

    (is_visible) ?
      hideElement(element) :
      showElement(element);

    //Set button element class if present
    if (btn_element)
      (is_visible) ?
        btn_element.setAttribute("class", btn_element.getAttribute("class").replace(" minimise-icon", " reverse-minimise-icon")) :
        btn_element.setAttribute("class", btn_element.getAttribute("class").replace(" reverse-minimise-icon", " minimise-icon"));
  }
}
