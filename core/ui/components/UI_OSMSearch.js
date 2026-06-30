global.UI_OSMSearch = class extends ve.Component {
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = arg0_value;
		let options = (arg1_options) ? arg1_options : {};
			super(options);
		
		//Declare local instance variables
		this.element = document.createElement("div");
			this.element.setAttribute("component", "naissance-osm-search");
			this.element.instance = this;
		this.options = options;
		this.value = value;
	}
	
	get v () { return this.value; }

	set v (arg0_value) {
		//Convert from parameters
		let value = (arg0_value) ? arg0_value : "";
		
		//Draw call
		this.value = value;
		this.draw().then(() => {
			if (!this.from_binding_fire_silently) {
				if (this.options.onchange) this.options.onchange(this.v, this);
				if (this.options.onprogramchange) this.options.onprogramchange(this.v, this);
			}
			this.fireFromBinding();
		});
	} 
	
	async draw () {
		//Declare local instance variables
		let osm_search_results = (this.value && this.value.length > 0) ? 
			await Geospatiale.getPhotonSearch(this.value) : { features: [] };
			osm_search_results = osm_search_results.features;
		
		this.element.innerHTML = `<div class = "osm-search-results"><b>Search Results (OSM):</b></div>`;
		
		//Iterate over all osm_search_results and format them
		for (let i = 0; i < osm_search_results.length; i++) {
			let local_result = osm_search_results[i];
			
			let local_geometry = osm_search_results[i].geometry;
			let local_properties = osm_search_results[i].properties;
			
			let local_result_el = document.createElement("div");
			local_result_el.classList.add("osm-search-result");
			local_result_el.innerHTML = `
				<icon id = "create-marker">location_on</icon><span id = "goto"><span style = 'font-weight: 500'>${local_properties.name}</span><br>
				${Geospatiale.getPhotonSearchName(local_result)}</span>
			`;
			local_result_el.addEventListener("click", () => {
				try {
					let extent = new maptalks.Extent(Geospatiale.getPhotonExtent(local_result));
					map.fitExtent(extent, 0);
				} catch (e) { console.error(`Error zooming to extent:`, local_result, e); }
			});
			local_result_el.querySelector(`#create-marker`).addEventListener("click", () => {
				let select_geometry_id = Class.generateRandomID(naissance.Geometry);
				
				DALS.Timeline.parseAction("create_point", [{
					type: "GeometryPoint",
					create_point: {
						id: select_geometry_id,
						name: local_properties.name,
						coordinates: [local_geometry.coordinates],
						is_search: true
					}
				}, {
					type: "Brush",
					select_geometry_id: select_geometry_id
				}]);
			});
			
			this.element.appendChild(local_result_el);
		}
		if (osm_search_results.length === 0) {
			let no_results_el = document.createElement("div");
			no_results_el.classList.add("osm-no-results");
			no_results_el.innerText = "No results found.";
			this.element.appendChild(no_results_el);
		}
		
		let hr_el = document.createElement("hr");
		this.element.appendChild(hr_el);
		
		//Return statement
		return true;
	}
}