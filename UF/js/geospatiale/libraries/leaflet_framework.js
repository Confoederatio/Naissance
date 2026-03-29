if (!global.Geospatiale) global.Geospatiale = {};

Geospatiale.convertLeafletSymbolToMaptalks = function (arg0_symbol) {
	//Convert from parameters
	let symbol_obj = (arg0_symbol) ? arg0_symbol : {};
	
	//Declare local instance variables
	let return_obj = {
		lineColor: symbol_obj.color,
		lineOpacity: parseFloat(symbol_obj.opacity),
		lineWidth: parseFloat(symbol_obj.weight),
		
		polygonFill: symbol_obj.fillColor,
		polygonOpacity: parseFloat(symbol_obj.fillOpacity),
	};
	
	//markerHeight, markerWidth handler
	if (symbol_obj.iconSize) {
		return_obj.markerHeight = symbol_obj.iconSize[0];
		return_obj.markerWidth = symbol_obj.iconSize[1];
	}
	
	//iconUrl handler
	if (symbol_obj.iconUrl)
		return_obj.markerFile = symbol_obj.iconUrl;
	
	//Return statement
	return return_obj;
};

Geospatiale.getLeafletGeometryType = function (arg0_geometry) {
	//Convert from parameters
	let geometry = arg0_geometry;
	
	//Return statement
	if (geometry instanceof L.Polygon) {
		return 'polygon';
	} else if (geometry instanceof L.Polyline) {
		// Note: Polygons are instances of Polylines, 
		// so we check Polygon first.
		return 'line';
	} else if (geometry instanceof L.Marker || geometry instanceof L.CircleMarker) {
		return 'point';
	}
};