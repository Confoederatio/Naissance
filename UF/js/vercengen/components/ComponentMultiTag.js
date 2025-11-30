ve.MultiTag = class extends ve.Component {
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = Array.toArray(arg0_value);
		let options = (arg1_options) ? arg1_options : {};
			super(options);
			
		//Initialise options
		options.attributes = (options.attributes) ? options.attributes : {};
		
		//Declare local instance variables
		let attributes = {
			...options.attributes
		};
		this.element = document.createElement("div");
			this.element.setAttribute("component", "ve-multi-tag");
			this.element.instance = this;
		this.options = options;
		this.value = value;
		
		this.components_obj = {};
		this.refresh();
	}
	
	get v () {
		//Return statement
		return this.components_obj.list.v;
	}	
	
	set v (arg0_value) {
		//Convert from parameters
		let value = (arg0_value) ? Array.toArray(arg0_value) : arg0_value;
		
		//Set statement
		this.components_obj.list.v = value;
	}
	
	refresh () {
		//Declare local instance variables
		this.refreshArray();
		this.datalist_options = {};
		
		//1. Iterate over this.datalist_array; populate this.datalist_options
		for (let i = 0; i < this.datalist_array.length; i++)
			this.datalist_options[this.datalist_array[i]] = this.datalist_array[i];
		
		//2. Make sure that this.components_obj.datalist exists
		if (this.components_obj.datalist) {
			this.components_obj.datalist.v = this.datalist_options;
		} else {
			this.components_obj.datalist = new ve.Datalist(this.datalist_options);
		}
		
		//3. 1-time initialisation for Datalist by setting .placeholder
		if (!this.components_obj.list) {
			//First-element handling
			let element_options = {
				onuserchange: (v, e) => {
					if (!this.datalist_array.includes(v)) {
						this.datalist_array.push(v);
						this.refreshArray();
					} else {
						veToast(`<icon>warning</icon> This tag is a duplicate of a previous tag, and will not be registered.`);
						e.v = "";
					}
					
					this.refresh();
				}
			};
			this.components_obj.datalist.options = element_options;
			
			//Nth-element handling
			this.components_obj.list = new ve.List([this.components_obj.datalist], {
				onuserchange: (v, e) => {
					this.refreshArray();
					this.refresh();
				},
				
				options: element_options
			});
			this.components_obj.list.bind(this.element);
		} else {
			this.components_obj.list.placeholder = this.datalist_options;
		}
	}
	
	refreshArray () {
		//Declare local instance variables
		let new_array = [];
		
		//Iterate over all components in ve.List
		if (this.components_obj.list)
			for (let i = 0; i < this.components_obj.list.v.length; i++) {
				let local_value = this.components_obj.list.v[i].v;
				
				if (local_value.length > 0)
					new_array.push(this.components_obj.list.v[i].v);
			}
		this.datalist_array = new_array;
		
		//Synchronise with registry
		if (this.options.tags_key) {
			ve.registry.settings.MultiTag[this.options.tags_key] = this.datalist_array;
		} else {
			ve.registry.settings.MultiTag.global = this.datalist_array;
		}
	}
};