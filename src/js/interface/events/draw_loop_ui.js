//Initialise functions
{
  function initialiseUIDrawLoops () {
    //100ms; 1s draw loops  
    global.ui_100ms_draw_loop = setInterval(function(){
      var entity_panel_container_open = document.querySelector("#entity-panel-container")
        .querySelector(".entity-ui-pane");
      var hide_left_sidebar = (entity_panel_container_open);

      if (hide_left_sidebar) {
        document.querySelector("#left-sidebar").classList.add("hide-left-sidebar");
      } else {
        document.querySelector("#left-sidebar").classList.remove("hide-left-sidebar");
      }
    }, 100);
  }
}