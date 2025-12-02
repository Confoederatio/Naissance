/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 * 
 * Creates a Maptalks {@link maptalks.Map} that can be used for mounting and displaying geometries and tilelayers to.
 * - Functional binding: <span color=00ffff>veMap</span>().
 * 
 * ##### Constructor:
 * - `arg0_value`: {@link Object} - The {@link maptalks.Map} `.options` that determines the projection and base layer.
 * - `arg1_options`: {@link Object}
 * 
 * ##### Instance:
 * - `.map`: {@link maptalks.Map}
 * - `.v`: {@link maptalks.Map}
 * 
 * ##### Methods:
 * - <span color=00ffff>{@link ve.Component.Map.clear|clear}</span>()
 * 
 * @augments ve.Component
 * @augments {@link ve.Component}
 * @memberof ve.Component
 * @type {ve.Map}
 */
ve.Map = class extends ve.Component {
	static instances = [];
	
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let options = (arg1_options) ? arg1_options : {};
			super(options);
		let value = {
			center: [51.505, -0.09],
			zoom: 5,
			baseLayer: this.getDefaultBaseLayer(),
			...arg0_value
		};
			
		//Declare local instance variables
		this.id = Class.generateRandomID(ve.Map);
		
		this.element = document.createElement("div");
			this.element.setAttribute("component", "ve-map");
		this.element.id = this.id;
		this.element.instance = this;
		HTML.setAttributesObject(this.element, options.attributes);
		
		this.options = options;
		this.map = undefined;
		
		//Set this.v
		this.v = value;
	}
	
	/**
	 * Returns the current mounted map.
	 * - Accessor of: {@link ve.Map}
	 * 
	 * @returns {ve.Map}
	 */
	get v () {
		//Return statement
		return this.map;
	}
	
	/**
	 * Redraws and sets a new map with the same options as determined by `arg0_value`.
	 * - Accessor of: {@link ve.Map}
	 * 
	 * @param {Object} arg0_value
	 */
	set v (arg0_value) {
		//Convert from parameters
		let value = arg0_value;
		
		//Declare local instance variables
		this.map = new maptalks.Map(this.element, value);
	}
	
	/**
	 * Clears the present map whilst preserving any {@link maptalks.VectorLayer} where possible.
	 * - Method of: {@link ve.Map}
	 */
	clear () {
		//Declare local instance variables
		let all_layers = this.map.getLayers();
		
		//Iterate over all_layers and remove all geometries in them
		for (let i = 0; i < all_layers.length; i++)
			if (all_layers[i] instanceof maptalks.VectorLayer) {
				//Iterate over all_geometries in the local layer
				let all_geometries = all_layers[i].getGeometries();
				
				for (let x = 0; x < all_geometries.length; x++)
					all_geometries[x].remove();
			} else {
				//Simply remove the layer itself from the map if possible
				all_layers[i].remove();
			}
		
		//Reset base layer
		this.map.setBaseLayer(this.getDefaultBaseLayer());
		this.map.setSpatialReference(this.getDefaultSpatialReference());
	}
	
	/**
	 * Returns options for the default {@link maptalks.TileLayer} used for the main map.
	 * - Method of: {@link ve.Map}
	 * 
	 * @returns {maptalks.TileLayer}
	 */
	getDefaultBaseLayer () {
		//Return statement
		return new maptalks.TileLayer("base", {
			urlTemplate: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
			subdomains: ["a", "b", "c"],
			repeatWorld: false
		});
	}
	
	/**
	 * Returns the default spatial reference for {@link maptalks.Map}.
	 * - Method of: {@link ve.Map}
	 * 
	 * @returns {{projection: string}}
	 */
	getDefaultSpatialReference () {
		//Return statement
		return {
			projection: "EPSG:3857" //Ensure that both Maptalks and Leaflet use the same projection
		}
	}
}

//Functional binding

/**
 * @returns {ve.Map}
 */
veMap = function () {
	//Return statement
	return new ve.Map(...arguments);
};