//Initialise functions
{
  /*
    arg0_coords: (Array<Array<Number, Number>>) - The initial coords to create a polygon with.
    arg1_options: (Object)
      do_not_display: (Boolean) - Optional. Whether to not display the polygon. False by default.
      <key>: (Variable) - Other values for options.

    Returns: (Object, MapTalks)
  */
  function createPolygon (arg0_coords, arg1_options) {
    //Convert from parameters
    var coords = arg0_coords;
    var options = (arg1_options) ? convertLeafletOptionsToMaptalks(arg1_options) : {
      "test": true, //Note that this actually moves it in
      'lineColor': '#34495e',
      'lineWidth': 2,
      'polygonFill': '#1bbc9b',
      'polygonOpacity': 0.6
    };

    //Initialise options
    if (!options.lineColor) options.lineColor = "#34495e";
    if (!options.lineWidth) options.lineWidth = 2;
    if (!options.polygonFill) options.polygonFill = "#1bbc9b";
    if (!options.polygonOpacity) options.polygonOpacity = 0.6;

    if (!isGeoJSONStrictCoords(coords))
      coords = flipCoordinates(convertLeafletCoordsToGeoJSONCoords(coords));
    coords = flipCoordinates(coords);

    //Declare local instance variables
    var old_options = JSON.parse(JSON.stringify(options));

    //This specifies the core rendering of the entity
    var maptalks_polygon = new maptalks.Polygon(coords, {
      properties: options,
      symbol: options
    });

    try {
      if (maptalks_polygon.getExtent()) {
        if (!options.do_not_display)
          main.entity_layer.addGeometry(maptalks_polygon);
        maptalks_polygon.options = dumbMergeObjects(maptalks_polygon.options, old_options);
      } else {
        maptalks_polygon = new maptalks.GeoJSON.toGeometry(new L.Polygon(flipCoordinates(coords)).toGeoJSON(), (geometry) => {
          if (!options.do_not_display)
            geometry.addTo(main.entity_layer);
          geometry.options = dumbMergeObjects(maptalks_polygon.options, old_options);
        });
        maptalks_polygon.setSymbol(options);
      }
    } catch (e) {
      maptalks_polygon = createPolygonFallback(coords, options);
    }

    //Return statement
    return maptalks_polygon;
  }

  function createPolygonFallback (arg0_coords, arg1_options) {
    //Convert from parameters
    var coords = arg0_coords;
    var options = (arg1_options) ? arg1_options : {};

    coords = flipCoordinates(coords);

    //Declare local instance variables
    var local_geometry = maptalks.GeoJSON.toGeometry((new L.Polygon(coords)).toGeoJSON());
    var old_options = JSON.parse(JSON.stringify(options));

    if (!options.do_not_display)
      local_geometry.addTo(main.entity_layer);
    local_geometry.setSymbol(options);
    local_geometry.options = dumbMergeObjects(local_geometry.options, old_options);

    //Return statement
    return local_geometry;
  }
  
  /*
    getPolityArea() - Fetches the total area of a given polity in square metres.
    arg0_entity_id: (String) - The entity ID for which to fetch the total area.
    arg1_date: (Object, Date) - The date for which to fetch the entity area.

    Returns: (Number)
  */
    function getPolityArea (arg0_entity_id, arg1_date) {
      //Convert from parameters
      var entity_id = arg0_entity_id;
      var date = arg1_date;
  
      //Declare local instance variables
      var entity_area = 0;
      var entity_obj = getEntity(entity_id);
  
      //Check to make sure entity_obj exists
      if (entity_obj) {
        var is_extinct = isEntityHidden(entity_id, date);
        var last_coords = getEntityCoords(entity_id, date);
  
        if (last_coords)
          try {
            var local_coordinates = convertToTurfGeometry(last_coords);
  
            entity_area = (!is_extinct) ? turf.area(local_coordinates) : 0;
          } catch (e) {
            console.log(e);
            entity_area = 0;
          }
      }
  
      //Return statement
      return entity_area;
    }
}
