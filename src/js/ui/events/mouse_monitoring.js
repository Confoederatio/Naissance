//Map popup events
{
  map.on("popupopen", function (e) {
    var local_popup = e.popup;

    console.log(`popupopen event triggered for entity ${entity_id}`);
    if (local_popup.options.id == "entity-ui-popup")
      setTimeout(function(){
        var entity_id = local_popup.options.class;

        populateEntityUI(entity_id);
      }, 200);
  });

  map.on("popupclose", function (e) {
    var local_popup = e.popup;

    if (local_popup.options.id == "entity-ui-popup")
      //Close entity UI
      delete interfaces[local_popup.options.class];
  });
}

//Mouse down/up events
{
  document.getElementById("map").onmousedown = function (e) {
    var sidebar_container_el = document.querySelector("sidebar-ui-container:hover");

    if (!(e.which == 2 || e.button == 4) && !sidebar_container_el) {
      main.events.mouse_pressed = true;
      map.config("draggable", false);
    }

    if (e.button == 2)
      main.events.right_mouse = true;
    main.events.left_mouse = (!main.events.right_mouse);
  };

  document.body.onmouseup = function (e) {
    main.events.mouse_pressed = false;
    main.events.right_mouse = false;

    map.config("draggable", true);
  };
}
