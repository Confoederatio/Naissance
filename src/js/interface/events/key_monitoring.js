//Key monitoring
document.body.onkeydown = function (e) {
  main.events.keys[e.keyCode] = true;

  if (e.keyCode == 17) {
    map.scrollWheelZoom.disable();
    window.ctrl_pressed = true;
  }
};
document.body.onkeyup = function (e) {
  delete main.events.keys[e.keyCode];

  if (e.keyCode == 17) {
    map.scrollWheelZoom.enable();
    delete window.ctrl_pressed;
  }
};
