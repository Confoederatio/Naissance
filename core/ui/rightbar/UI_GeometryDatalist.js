/**
 * ##### Constructor:
 * - `arg0_value`: {@link string} - The `.id` of the geometry to refer to.
 * - `arg1_options`: {@link Object}
 *   - `.filter_types`: {@link Array}<{@string}> - The list of `.class_name`s to filter, i.e. `["GeometryPolygon"]`.
 * 
 * ##### Instancee:
 * - `.v`: {@link string}
 * 
 * @type {UI_GeometryDatalist}
 */
global.UI_GeometryDatalist = class extends ve.Component {
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = arg0_value;
		let options = (arg1_options) ? arg1_options : {};
			super(options);
			
		//Declare local instance variables
		this.options = options;
		this.value = value;
		
		//Loop-draw pattern
		this.draw();
		this.logic_loop = setInterval(() => {
			let is_focused = this.element.querySelector("input:focus");
			
			if (!is_focused) this.draw();
		}, 1000);
	}
	
	get v () {
		//Return statement
		return this.value;
	}
	
	set v (arg0_value) {
		//Convert from parameters
		let value = arg0_value;
		
		if (this.datalist) this.datalist.v = value;
		this.fireFromBinding();
	}
	
	draw () {
		if (this.datalist) this.datalist.remove();
		if (!this.element) this.element = document.createElement("div");
			this.element.setAttribute("component", "naissance-geometry-datalist");
			this.element.instance = this;
			
		//Declare local instance variables
		let geometry_map = {};
		
		//Fetch all current geometries and their names
		for (let i = 0; i < naissance.Geometry.instances.length; i++) {
			let local_geometry = naissance.Geometry.instances[i];
			let is_valid = true;
			
			if (is_valid)
				geometry_map[local_geometry.id] = local_geometry.name;
		}
		
		let current_value = this.v;
		this.datalist = veDatalist(geometry_map, {
			name: (this.options.name) ? this.options.name : undefined,
			onuserchange: (v) => {
				this.value = v;
				this.fireFromBinding();
			},
			selected: (geometry_map[current_value]) ? geometry_map[current_value] : undefined
		});
		this.datalist.element.style.padding = 0;
		this.datalist.bind(this.element);
	}
};