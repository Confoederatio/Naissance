if (!global.Geospatiale) global.Geospatiale = {};

/**
 * Returns stops fixed to map-space (i.e. for rendering borders) rather than to screen-space. Used inside of `{ stops: number[][] }` symbols for certain Maptalks geometries.
 * 
 * @param {number} [arg0_base_size=1]
 * @param {number} [arg1_base_zoom=0]
 * 
 * @returns {Array.<number[]>}
 */
Geospatiale.getMaptalksConstantStops = function (arg0_base_size, arg1_base_zoom) {
	//Convert from parameters
	let base_size = Math.returnSafeNumber(arg0_base_size, 1);
	let base_zoom = Math.returnSafeNumber(arg1_base_zoom);
	
	//Declare local instance variables
	let stops = [];
	
	//Iterate over Maptalks' defined zoom range
	for (let i = 0; i <= 22; i++) {
		let calculated_size = base_size*Math.pow(2, i - base_zoom);
		
		stops.push([i, Math.round(calculated_size*100)/100]);
	}
	
	//Return statement
	return stops;
};