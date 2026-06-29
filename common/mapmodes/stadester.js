config.mapmodes.stadester = {
	name: "Stadestér 1.0",
	icon: "location_city",
	description: "Displays urban locations from Stadestér 1.0.",
	tooltip: "Urban data (3000BC-2025AD).",
	
	special_function: () => {
		//Declare local instance variables
		let all_geometries = [];
		let config_obj = config.mapmodes.stadester;
		if (!config_obj.stadester_obj) config_obj.stadester_obj = JSON.parse(fs.readFileSync(`${h6}/stadester/stadester_1.0.json`));
		
		if (config_obj.last_year === undefined || config_obj.last_year !== main.date.year) {
			config_obj.last_year = main.date.year;
			Object.iterate(config_obj.stadester_obj, (local_key, local_city) => {
				//Check if year is in domain
				if (local_city.population) {
					let all_population_keys = Object.keys(local_city.population).map(Number)
					.sort((a, b) => a - b); //Sort numbers in ascending order
					let center = new maptalks.Coordinate(0, 0);
					let end_year = all_population_keys[all_population_keys.length - 1];
					let start_year = all_population_keys[0];
					
					if ((main.date.year >= start_year && main.date.year <= end_year) || (end_year >= 1975 && main.date.year >= 1975))
						if (local_city.coords) {
							let local_population = 0;
							
							//Iterate over all_population_keys
							for (let i = 0; i < all_population_keys.length; i++)
								if (all_population_keys[i] <= main.date.year)
									local_population = local_city.population[all_population_keys[i]];
							if (local_population !== 0) {
								let city_label = `${String.truncate((local_city.name) ? local_city.name : "Unknown City", 40)} (${String.formatNumber(local_population)})`;
								
								all_geometries.push(new maptalks.Circle(center.add([
									Math.returnSafeNumber(local_city.coords[1]),
									Math.returnSafeNumber(local_city.coords[0])
								]), Math.sqrt(Math.abs(local_population*10000)/Math.PI), {
									symbol: {
										lineColor: "#34495e",
										lineWidth: 2,
										polygonFill: (local_population > 0) ? "#34cc48" : "rgb(240, 60, 60)",
										polygonOpacity: 0.2,
									}
								}));
								
								let local_label = new maptalks.Label(city_label, [
									Math.returnSafeNumber(local_city.coords[1]),
									Math.returnSafeNumber(local_city.coords[0]),
									0
								], {
									textSymbol: {
										textFaceName: "Karla",
										textSize: 12,
										textFill: "rgba(255, 255, 255, 0.5)",
										textHaloFill: "rgba(0, 0, 0, 0.5)",
										textHaloRadius: 2
									}
								});
								local_label.setZIndexSilently(local_population*-1);
								
								all_geometries.push(local_label);
							}
						}
				}
			});
			
			//Return statement
			config_obj.geometries = all_geometries;
			return config_obj.geometries;
		}
		
		//Return statement if redraw is not called
		return config_obj.geometries;
	}
};