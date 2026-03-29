//Initialise functions
{
	if (!global.Geospatiale) global.Geospatiale = {};
	
	/**
	 * Calculates the haversine distance in km between two [lng, lat] coords.
	 * @alias Geospatiale.haversineDistance
	 * 
	 * @param {number[]} arg0_coords
	 * @param {number[]} arg1_coords
	 * 
	 * @returns {number}
	 */
	Geospatiale.haversineDistance = function (arg0_coords, arg1_coords) {
		//Convert from parameters
		let coords = arg0_coords;
		let ot_coords = arg1_coords;
		
		//Declare local instance variables
		let R = 6371; //Earth's radius in km
		let toRad = (deg) => (deg*Math.PI)/180;
		
		let [lng_one, lat_one] = coords, [lng_two, lat_two] = ot_coords;
		let d_lat = toRad(lat_two - lat_one);
		let d_lng = toRad(lng_two - lng_one);
		
		let a = Math.sin(d_lat/2)**2 +
			Math.cos(toRad(lat_one))*Math.cos(toRad(lat_two))*Math.sin(d_lng/2)**2;
		let c = 2*Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		
		//Return statement
		return R*c;
	};
}