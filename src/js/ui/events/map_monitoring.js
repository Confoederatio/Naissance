//Add event listeners
map.on("zoomend", function (e) {
  //Declare local instance variables
  var brush_obj = main.brush;
  var zoom_level = e.target._zoom;

  renderAllPolities();
});
