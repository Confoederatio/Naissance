//Initialise functions
{
  function applyMapLayersObject (arg0_map_layers_obj) {
    //Convert from parameters
    var map_layers_obj = (arg0_map_layers_obj) ? 
      arg0_map_layers_obj : getMapLayersOptionsFromUI();

    //Declare local instance variables
    var projection_dictionary = config.defines.map.projection_dictionary;

    //Remove all existing map layers first 
    var all_tile_layers = map.getLayers(function (local_layer) {
      if (local_layer instanceof maptalks.TileLayer)
        map.removeLayer(local_layer);
    });

    //Iterate over all_map_layers
    var all_map_layers = Object.keys(map_layers_obj);

    for (var i = 0; i < all_map_layers.length; i++) {
      var local_tile_layer = map_layers_obj[all_map_layers[i]];

      var local_tile_layer_obj = new maptalks.TileLayer(all_map_layers[i], {
        opacity: local_tile_layer.opacity,
        spatialReference: {
          projection: projection_dictionary[local_tile_layer.projection]
        },
        subdomains: ["a", "b", "c"],
        urlTemplate: local_tile_layer.url_template,
        repeatWorld: local_tile_layer.repeat_world,
        visible: local_tile_layer.visible,
        zIndex: local_tile_layer.z_index
      });

      if (local_tile_layer.is_base_layer) {
        map.setBaseLayer(local_tile_layer_obj);
      } else {
        map.addLayer(local_tile_layer_obj);
      }
    }

    //Set map_layers_obj in main.settings.map.tile_layers
    if (!main.settings.map) main.settings.map = {};
      main.settings.map.tile_layers = map_layers_obj;
  }
}