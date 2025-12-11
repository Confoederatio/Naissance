//Initialise functions
{
	if (!global.Geospatiale)
		global.Geospatiale = {};
	
	Geospatiale.hashGeometry = function (arg0_geometry, arg1_options) {
		//Convert from parameters
		let geometry = arg0_geometry;
		let options = (arg1_options) ? arg1_options : {};
		
		//Initialise options
		options.precision = Math.returnSafeNumber(options.precision, 6);
		
		//Return statement
		return JSON.stringify(turf.truncate(geometry, { precision: options.precision }));
	};
	
	Geospatiale.splitFeature = function (arg0_geometry, arg1_divisor_layer) {
		//Convert from parameters
	};
}