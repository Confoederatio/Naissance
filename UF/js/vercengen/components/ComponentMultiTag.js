ve.MultiTag = class extends ve.Component {
	static instances = {};
	
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = Array.toArray(arg0_value);
		let options = (arg1_options) ? arg1_options : {};
		super(options);
		
		//Initialise options
		options.attributes = (options.attributes) ? options.attributes : {};
		
		//Declare local instance variables
		this.element = document.createElement("div");
		this.element.setAttribute("component", "ve-multi-tag");
		Object.iterate(options.attributes, (local_key, local_value) => {
			this.element.setAttribute(local_key, local_value.toString());
		});
		this.element.instance = this;
		this.options = options;
		this.local_tags = value.filter(v => v != null && v !== "");
		
		this.components_obj = {};
		
		// Register this instance for syncing
		const key = this.options.tags_key || 'global';
		if (!ve.MultiTag.instances[key]) {
			ve.MultiTag.instances[key] = [];
		}
		ve.MultiTag.instances[key].push(this);
		
		// Populate registry with initial local_tags
		for (let tag of this.local_tags) {
			if (!this.registry_array.includes(tag)) {
				this.registry_array.push(tag);
			}
		}
		
		this.refresh();
	}
	
	get registry_array () {
		const key = this.options.tags_key || 'global';
		if (!ve.registry.settings.MultiTag[key]) {
			ve.registry.settings.MultiTag[key] = [];
		}
		return ve.registry.settings.MultiTag[key];
	}
	
	get v () {
		return this.local_tags;
	}
	
	set v (arg0_value) {
		let value = (arg0_value) ? Array.toArray(arg0_value) : arg0_value;
		this.local_tags = value;
		this.refresh();
	}
	
	notifyAllInstances () {
		const key = this.options.tags_key || 'global';
		const instances = ve.MultiTag.instances[key] || [];
		
		instances.forEach(instance => {
			instance.refresh();
		});
	}
	
	refresh () {
		this.datalist_options = {};
		
		// Build suggestions from registry_array
		for (let i = 0; i < this.registry_array.length; i++)
			this.datalist_options[this.registry_array[i]] = this.registry_array[i];
		
		if (!this.components_obj.datalist) {
			this.components_obj.datalist = new ve.Datalist(this.datalist_options);
		} else {
			this.components_obj.datalist.v = this.datalist_options;
		}
		
		if (!this.components_obj.list) {
			let element_options = {
				onuserchange: (v, e) => {
					if (!this.local_tags.includes(v)) {
						this.local_tags.push(v);
						if (!this.registry_array.includes(v)) {
							this.registry_array.push(v);
						}
						this.notifyAllInstances();
					} else {
						veToast(`<icon>warning</icon> This tag is a duplicate of a previous tag, and will not be registered.`);
						e.v = "";
					}
				}
			};
			this.components_obj.datalist.options = element_options;
			
			this.components_obj.list = new ve.List([this.components_obj.datalist], {
				onuserchange: (v, e) => {
					this.updateLocalTags();
					this.notifyAllInstances();
				},
				style: {
					padding: 0
				},
				options: element_options,
			});
			this.components_obj.list.bind(this.element);
			
			// Initialize list items from local_tags
			for (let i = 0; i < this.local_tags.length; i++) {
				this.components_obj.list.addItem();
			}
			for (let i = 0; i < this.local_tags.length; i++) {
				this.components_obj.list.v[i + 1].v = this.local_tags[i];
			}
		} else {
			// Update suggestions on all datalist items in the list
			this.components_obj.datalist.v = this.datalist_options;
			this.components_obj.list.placeholder = this.datalist_options;
			
			for (let i = 0; i < this.components_obj.list.v.length; i++) {
				this.components_obj.list.v[i].v = this.datalist_options;
			}
		}
	}
	
	updateLocalTags () {
		let new_array = [];
		
		if (this.components_obj.list)
			for (let i = 0; i < this.components_obj.list.v.length; i++) {
				let local_value = this.components_obj.list.v[i].v;
				if (local_value && local_value.length > 0)
					new_array.push(local_value);
			}
		
		this.local_tags = new_array;
		
		// Add new tags to registry
		for (let tag of new_array) {
			if (!this.registry_array.includes(tag)) {
				this.registry_array.push(tag);
			}
		}
	}
};