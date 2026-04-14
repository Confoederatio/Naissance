/**
 * ##### Constructor:
 * - `arg0_value`: {@link string} - The `.id` of the geometry to refer to.
 * - `arg1_options`: {@link Object}
 *   - `.filter_types`: {@link Array}<{@string}> - The list of `.class_name`s to filter, i.e. `["FeatureLayer"]`.
 *
 * ##### Instance:
 * - `.v`: {@link string}
 *
 * @type {UI_FeatureDatalist}
 */
global.UI_FeatureDatalist = class extends ve.Component {
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
		
		this.value = value;
		if (this.datalist) this.datalist.v = value;
		this.fireFromBinding();
	}
	
	draw () {
		if (this.datalist) this.datalist.remove();
		if (!this.element) this.element = document.createElement("div");
			this.element.setAttribute("component", "naissance-feature-datalist");
			this.element.instance = this;
		
		//Declare local instance variables
		let feature_map = {};
		
		//Fetch all current features and their names
		for (let i = 0; i < naissance.Feature.instances.length; i++) {
			let is_valid = true;
			let local_feature = naissance.Feature.instances[i];
			
			//Deal with options.filter_types
			if (this.options.filter_types)
				if (!this.options.filter_types.includes(local_feature.class_name))
					is_valid = false;
			
			//Append to map if valid feature
			if (is_valid)
				feature_map[local_feature.id] = local_feature.name;
		}
		
		let current_value = this.v;
		this.datalist = veDatalist(feature_map, {
			name: (this.options.name) ? this.options.name : undefined,
			onuserchange: (v) => {
				this.value = v;
				this.fireToBinding();
			},
			selected: (feature_map[current_value]) ? feature_map[current_value] : undefined
		});
		this.datalist.element.style.padding = 0;
		this.datalist.bind(this.element);
	}
};