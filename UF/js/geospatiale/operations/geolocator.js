//Initialise functions
{
	if (!global.Geospatiale) global.Geospatiale = {};
	
	/**
	 * Geolocates a city on Google Maps if possible.
	 * @alias Geospatiale.getGoogleMapsCityCoords
	 * 
	 * @param {string} arg0_city_name
	 * @param {Object} [arg1_options]
	 *  @param {string} [arg1_options.google_maps_api_key]
	 * 
	 * @returns {number[]}
	 */
	Geospatiale.getGoogleMapsCityCoords = async function (arg0_city_name, arg1_options) {
		//Convert from parameters
		let city_name = arg0_city_name;
		let options = (arg1_options) ? arg1_options : {};
		
		//Declare local instance variables
		let lat_value = 0;
		let local_exec = util.promisify(exec);
		let lng_value = 0;
		let processed_city_name = city_name.replace(/ /gm, "+");
		
		//Run exec call to CURL
		let { stdout, stderr } = await local_exec(`curl -s "https://maps.googleapis.com/maps/api/geocode/json?components=locality:${processed_city_name}&key=${options.google_maps_api_key}"`);
		
		//Guard clause if error occurs from CURL call
		if (stderr) {
			console.error(stderr);
			return;
		}
		
		let gmaps_obj = JSON.parse(stdout);
		console.log(gmaps_obj);
		try {
			let location_obj = gmaps_obj.results[0].geometry.location;
			
			lat_value = location_obj.lat;
			lng_value = location_obj.lng;
		} catch (e) {
			console.error(e);
		}
		
		//Return statement
		return [parseFloat(lat_value), parseFloat(lng_value)];
	};
	
	/**
	 * Geolocates a city using OSM if possible.
	 * @alias Geospatiale.getOSMCityCoords 
	 * 
	 * @param {string} arg0_city_name
	 * 
	 * @returns {number[]}
	 */
	Geospatiale.getOSMCityCoords = async function (arg0_city_name) {
		//Convert from parameters
		let city_name = arg0_city_name;
		
		//Declare local instance variables
		let params = new URLSearchParams({
			q: city_name,
			format: "jsonv2",
			addressdetails: "1",
			extratags: "1",
			limit: "10"
		});
		let url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
		
		console.log(`Fetching data from ${url}:`);
		try {
			let response = await fetch(url, { 
				headers: { "User-Agent": "Naissance HGIS" } 
			});
			if (!response.ok) console.error(`HTTP Error. Status: ${response.status}`);
			let results = await response.json();
			
			if (!results || results.length === 0) {
				console.warn(`No results found for ${city_name}.`);
				return [0, 0];
			}
			let max_population = -1;
			let most_populous_result = null;
			
			for (let local_result of results) {
				//Population data is in local_result.extratags.population if it exists
				let local_population_string = local_result.extratags?.population;
				
				if (local_population_string) {
					let local_population = parseInt(local_population_string, 10);
					
					if (!isNaN(local_population) && local_population > max_population) {
						max_population = local_population;
						most_populous_result = local_result;
					}
				}
			}
			
			//If we found a result with population data return it; otherwise return the first result.
			let processed_result = (most_populous_result) ?
				most_populous_result : results[0];
			
			//Return statement
			return [processed_result.lat, processed_result.lon];
		} catch (e) {
			console.error(e);
		}
	};
	
	/**
	 * Performs a Nominatim search and returns the results in JSON form.
	 * @alias Geospatiale.getNominatimSearch
	 * 
	 * @param {string} arg0_search_query
	 * 
	 * @returns {Promise<Object[]>|undefined}
	 */
	Geospatiale.getNominatimSearch = async function (arg0_search_query) {
		//Convert from parameters
		let search_query = arg0_search_query;
		
		if (!search_query || search_query.length === 0) return; //Internal guard clause if search_query is nonexistent
		
		//Declare local instance variables
		let params = new URLSearchParams({
			q: search_query,
			format: "jsonv2",
			addressdetails: "1",
			entrances: "1",
			extratags: "1"
		});
		let url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
		
		console.log(`Fetching data from ${url}:`);
		try {
			let response = await fetch(url, {
				headers: { "User-Agent": "Naissance HGIS" }
			});
			if (!response.ok) console.error(`HTTP Error. Status: ${response.status}`);
			return await response.json(); //Return statement
		} catch (e) { console.error(e); }
	};
	
	Geospatiale.getPhotonExtent = function (arg0_result_obj) {
		//Convert from parameters
		let result_obj = arg0_result_obj;
		
		//Declare local instance variables
		if (result_obj.properties.extent) {
			let bbox = result_obj.properties.extent;
			
			//Return statement
			return {
				xmin: parseFloat(bbox[0]),
				xmax: parseFloat(bbox[2]),
				ymin: parseFloat(bbox[1]),
				ymax: parseFloat(bbox[3])
			};
		} else {
			let coords = result_obj.geometry.coordinates;
			
			//Return statement
			return {
				xmin: coords[0] - 0.05,
				xmax: coords[0] + 0.05,
				ymin: coords[1] - 0.05,
				ymax: coords[1] + 0.05
			};
		}
	};
	
	Geospatiale.getPhotonSearch = async function (arg0_search_query) {
		//Convert from parameters
		let search_query = arg0_search_query;
		
		if (!search_query || search_query.length === 0) return; //Internal guard clause if search_query is nonexistent
		
		//Declare local instance variables
		let params = new URLSearchParams({
			q: search_query
		});
		let url = `https://photon.komoot.io/api/?${params.toString()}`;
		
		console.log(`Fetching data from ${url}:`);
		try {
			let response = await fetch(url, {
				headers: { "User-Agent": "Naissance HGIS" }
			});
			if (!response.ok) console.error(`HTTP Error. Status: ${response.status}`);
			return await response.json(); //Return statement
		} catch (e) { console.error(e); }
	};
	
	Geospatiale.getPhotonSearchName = function (arg0_result_obj) {
		//Convert from parameters
		let result_obj = arg0_result_obj;
		
		//Declare local instance variables
		let name_array = [];
		let properties_obj = result_obj.properties;
		
		if (properties_obj.osm_value) name_array.push(properties_obj.osm_value);
		if (properties_obj.city) name_array.push(properties_obj.city);
		if (properties_obj.state) name_array.push(properties_obj.state);
		if (properties_obj.country) name_array.push(properties_obj.country);
		
		//Return statement
		return name_array.join(", ");
	};
}