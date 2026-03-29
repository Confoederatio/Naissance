//Initialise functions
{
	if (!global.Geospatiale) global.Geospatiale = {};
	
	/**
	 * Returns a [lat, lng] array for a given pixel coordinate.
	 * 
	 * @param {number} arg0_x
	 * @param {number} arg1_y
	 * @param {number} [arg2_width=4320]
	 * @param {number} [arg3_height=2160]
	 * 
	 * @returns {number[]}
	 */
	Geospatiale.getEquirectangularPixelCoords = function (arg0_x, arg1_y, arg2_width, arg3_height) {
		//Convert from parameters
		let x_coord = arg0_x;
		let y_coord = arg1_y;
		let width = Math.returnSafeNumber(arg2_width, 4320);
		let height = Math.returnSafeNumber(arg3_height, 2160);
		
		//Declare local instance variables
		let lat = 90 - (y_coord/height)*180;
		let lng = (x_coord/width)*360 - 180;
		
		//Return statement
		return [lng, lat];
	};
	
	/**
	 * Fetches the x, y coordinate pair for a given pixel given latitude and longitude coordinates for WGS84 Equirectangular.
	 * @alias Geospatiale.getEquirectangularCoordsPixel
	 * 
	 * @param {number} arg0_latitude
	 * @param {number} arg1_longitude
	 * @param {Object} [arg2_options]
	 *  @param {boolean} [arg2_options.return_object=false] - Whether to return a structured object instead.
	 *
	 * @returns {Array<number, number>|{x_coord: number, y_coord: number}}
	 */
	Geospatiale.getEquirectangularCoordsPixel = function (arg0_latitude, arg1_longitude, arg2_options) {
		//Convert from parameters
		let latitude = Math.returnSafeNumber(arg0_latitude);
		let longitude = Math.returnSafeNumber(arg1_longitude);
		let options = (arg2_options) ? arg2_options : {};
		
		//Initialise options
		options.height = Math.returnSafeNumber(options.height, 2160); //5-arcminute resolution default
		options.width = Math.returnSafeNumber(options.width, 4320); //5-arcminute resolution default
		
		//Declare local instance variables
		let bbox = [-180, -90, 180, 90]; //Full Earth latlng
		let x_coord = Math.floor(((longitude - bbox[0])/(bbox[2] - bbox[0]))*options.width);
		let y_coord = Math.floor(((latitude - bbox[1])/(bbox[3] - bbox[1]))*options.height);
		//South Pole is origin by default; flip it to North-facing
		y_coord = options.height - y_coord;
		
		//Return statement
		return (!options.return_object) ?
			[x_coord, y_coord] : { x_coord, y_coord };
	};
}