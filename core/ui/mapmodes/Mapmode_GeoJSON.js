global.Mapmode_GeoJSON = class {
	constructor (arg0_options) {
		//Declare local instance variables
		this.geojson_obj = JSON.parse(fs.readFileSync(polities_Cliopatria_UI.input_path, "utf8"));
		this.geometries = [];
	}
	
	clear () {
		//Iterate over all this.geometries and remove them from the map
		for (let i = 0; i < this.geometries.length; i++)
			this.geometries[i].remove();
		this.geometries = [];
	}
	
	draw (arg0_file) {
		//Convert from parameters
		this.geojson_obj = JSON.parse(fs.readFileSync(arg0_file, "utf8"));
		
		//Clear map first
		this.clear();
		
		//Iterate over this.geojson_obj.features and plot them
		for (let i = 0; i < this.geojson_obj.features.length; i++) {
			let local_feature = this.geojson_obj.features[i];
			let local_geometry = new maptalks.GeoJSON.toGeometry(local_feature);
			
			if (local_geometry.properties)
				local_geometry.updateSymbol({
					lineWidth: 1,
					polygonFill: local_geometry.properties?.rgba,
					polygonOpacity: 0.5
				});
			this.geometries.push(local_geometry);
		}
		
		//Iterate over all this.geometries and render them on the map
		for (let i = 0; i < this.geometries.length; i++)
			this.geometries[i].addTo(main.layers.entity_layer); 
	}
};