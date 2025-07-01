//Initialise functions
{
  /**
   * createSection() - Creates a foldable element that can be minimised/expanded.
   * @param {Object} [arg0_options]
   *  @param {String} [arg0_options.expand_class="uf-expanded"] - The class to add when the section is expanded.
   *  @param {String} [arg0_options.minimise_class="uf-minimised"] - The class to add when the section is collapsed.
   *  @param {String} [arg0_options.selector] - The selector of the elements that can be minimised/expanded. Note that the first element covered by the selector will have the chevron controller.
   *  @param {String} [arg0_options.selector_class="uf-chevron minimise"] - The class to add to the chevron controller.
   *  @param {String} [arg0_options.src="./UF/gfx/chevron_icon.png"] - The source of the chevron image.
   *  @param {Boolean} [arg0_options.is_collapsed=false] - Whether the section should start in a collapsed state.
   */
  function createSection (arg0_options) {
    //Convert from parameters
    var options = (arg0_options) ? arg0_options : {};

    //Initialise options
    if (!options.expand_class) options.expand_class = "uf-expanded";
    if (!options.minimise_class) options.minimise_class = "uf-minimised";
    if (!options.selector) options.selector = "";
    if (!options.selector_class) options.selector_class = "uf-chevron minimise";
    if (!options.src) options.src = "./UF/gfx/chevron_icon.png";
    if (options.is_collapsed === undefined) options.is_collapsed = false;

    //Declare local instance variables
    var all_collapsible_els = document.querySelectorAll(options.selector);
    console.log(`createSection()`, all_collapsible_els, options);

    //Set chevron image on first collapsible el
    var chevron_btn = document.createElement("img");
      chevron_btn.setAttribute("class", options.selector_class);
      chevron_btn.setAttribute("draggable", false);
      chevron_btn.src = options.src;

    //Add chevron to first element if it exists
    if (all_collapsible_els.length > 0) {
      var first_el = all_collapsible_els[0];
      first_el.appendChild(chevron_btn, first_el.firstChild);
    }

    //Set initial state if collapsed
    if (options.is_collapsed && all_collapsible_els.length > 1) {
      for (var i = 1; i < all_collapsible_els.length; i++) {
        var el = all_collapsible_els[i];
        el.classList.remove(options.expand_class);
        el.classList.add(options.minimise_class);
      }
      chevron_btn.style.transform = "rotate(0deg)";
    }

    //Add click handler to toggle section
    chevron_btn.addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation();

      //Toggle classes on all collapsible elements
      if (all_collapsible_els.length > 1)
        for (var i = 1; i < all_collapsible_els.length; i++) {
          var el = all_collapsible_els[i];
          
          if (!el.classList.contains(options.minimise_class)) {
            el.classList.remove(options.expand_class);
            el.classList.add(options.minimise_class);
          } else {
            el.classList.remove(options.minimise_class);
            el.classList.add(options.expand_class);
          }
        }

      //Toggle chevron rotation
      if (chevron_btn.style.transform === "rotate(180deg)") {
        chevron_btn.style.transform = "rotate(0deg)";
      } else {
        chevron_btn.style.transform = "rotate(180deg)";
      }
    });

    //Return the chevron button for external control if needed
    return chevron_btn;
  }
}