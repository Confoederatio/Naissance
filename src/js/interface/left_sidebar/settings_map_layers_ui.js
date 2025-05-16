//Initialise functions
{
  /**
   * createMapLayerElement() - Creates a new map layer element for the settings UI.
   * @param {Object} [arg0_options] - The options for the map layer element.
   *  @param {String} [arg0_options.name="New Layer"]
   * 
   *  @param {boolean} [arg0_options.auto_assign_z_index=true]
   *  @param {boolean} [arg0_options.is_base_layer=false]
   *  @param {number} [arg0_options.opacity=1]
   *  @param {String} [arg0_options.projection="mercator"]
   *  @param {boolean} [arg0_options.repeat_world=false]
   *  @param {String} [arg0_options.url_template="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"]
   *  @param {boolean} [arg0_options.visible=true]
   *  @param {number} [arg0_options.z_index=0]
   * 
   * @returns {String} 
   */
  function createMapLayerElement (arg0_options) {
    //Convert from parameters
    var options = (arg0_options) ? arg0_options : {};

    //Initialise options
    if (options.auto_assign_z_index == undefined) options.auto_assign_z_index = true;
    if (options.name == undefined) options.name = "New Layer";
    if (options.is_base_layer == undefined) options.is_base_layer = false;
    if (options.opacity == undefined) options.opacity = 1;
    if (options.projection == undefined) options.projection = "mercator";
    if (options.url_template == undefined) options.url_template = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    if (options.visible == undefined) options.visible = true;
    if (options.z_index == undefined) options.z_index = 0;

    //Declare local instance variables
    var map_layer_html = `
      <meta data-is-map-layer = "true">
      <input id = "name" type = "text" value = "${options.name}"><br>
      <input id = "is_base_layer" type = "checkbox" ${options.is_base_layer ? "checked" : ""}> Is Base Layer<br>
      <input id = "repeat_world" type = "checkbox" ${options.repeat_world ? "checked" : ""}> Repeat World<br>
      <input id = "visible" type = "checkbox" ${options.visible ? "checked" : ""}> Visible<br>
      Z-index: <input id = "z_index" type = "number" value = "${options.z_index}"><br>
      <ul>
        <li><input id = "auto_assign_z_index" type = "checkbox" ${options.auto_assign_z_index ? "checked" : ""}> Auto Assign z-index</li>
      </ul>
      <br>
      Opacity (0-100): <input id = "opacity" type = "number" min = "0" max = "100" value = "${options.opacity*100}"><br>
      Projection: <select id = "projection">
        <option value = "equirectangular" ${options.projection == "equirectangular" ? "selected" : ""}>Equirectangular</option>
        <option value = "mercator" ${options.projection == "mercator" ? "selected" : ""}>Mercator</option>
      </select><br>
      URL: <input id = "url_template" type = "text" value = "${options.url_template}"><br>
    `;

    //Return statement
    return map_layer_html;
  }

  /**
   * getMapLayersOptionsFromUI() - Gets the map layers options from the UI.
   * @returns {Object}
   */
  function getMapLayersOptionsFromUI () {
    //Declare local instance variables
    var common_defines = config.defines.common;
    var map_layers_container_selector = common_defines.selectors.map_layers_container;

    //Declare local instance variables
    var projection_dictionary = config.defines.map.projection_dictionary;
    var return_obj = {};

    //Fetch all li items in the map layers container
    var map_layers_container_el = document.querySelector(map_layers_container_selector);

    //Iterate over all_map_layers_els
    var all_map_layers_els = map_layers_container_el.querySelectorAll("li:has(meta[data-is-map-layer='true'])");

    for (let i = 0; i < all_map_layers_els.length; i++) {
      let current_map_layer_el = all_map_layers_els[i];
      let local_id = (all_map_layers_els[i].id) ?
        all_map_layers_els[i].id : all_map_layers_els[i].querySelector("input[id='name']").value;

      console.log(current_map_layer_el);
      let local_layer = {
        name: current_map_layer_el.querySelector("input[id='name']").value,
        is_base_layer: current_map_layer_el.querySelector("input[id='is_base_layer']").checked,
        repeat_world: current_map_layer_el.querySelector("input[id='repeat_world']").checked,
        visible: current_map_layer_el.querySelector("input[id='visible']").checked,
        z_index: parseInt(current_map_layer_el.querySelector("input[id='z_index']").value),
        projection: current_map_layer_el.querySelector("select[id='projection']").value,
        url_template: current_map_layer_el.querySelector("input[id='url_template']").value,
        opacity: parseInt(current_map_layer_el.querySelector("input[id='opacity']").value)/100,
      };

      return_obj[local_id] = local_layer;
    }

    //Return statement
    return return_obj;
  }
}