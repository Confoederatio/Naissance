/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 * 
 * Represents a multi tag input with unique metadata attributes for keywording.
 * - Functional binding: <span color=00ffff>veMultiTag</span>().
 * 
 * [WIP] - Arrays appear to be 1-indexed when shifting or deleting. This behaviour should be changed.
 * 
 * ##### Constructor:
 * - `arg0_value`: {@link Array}<{@link string}>
 * - `arg1_options`: {@link Object}
 *   - `.tags_key="global"`: {@link string} - The namespace to assign to the current MultiTag component to be shared between instances.
 * 
 * ##### Instance:
 * - `.registry_array`: {@link Array}<{@link string}> - Read-only. Global registry array shared between instances.
 * - `.v`: {@link Array}<{@link string}>
 *   
 * ##### Methods:
 * - <span color=00ffff>{@link ve.MultiTag.notifyAllInstances|notifyAllInstances}</span>()
 * - <span color=00ffff>{@link ve.MultiTag.refresh|refresh}</span>()
 * - <span color=00ffff>{@link ve.MultiTag.updateLocalTags|updateLocalTags}</span>()
 * 
 * @augments ve.Component
 * @augments {@link ve.Component}
 * @memberof ve.Component
 * @type {ve.MultiTag}
 */
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
		
		this.components_obj = {};
		/**
		 * @type {string[]}
		 */
		this.local_tags = value.filter(v => v != null && v !== "");
		
		//Register the current instance for synchronisation
		let key = this.options.tags_key || "global";
		if (!ve.MultiTag.instances[key])
			ve.MultiTag.instances[key] = [];
		ve.MultiTag.instances[key].push(this);
		
		//Populate registry with initial local_tags; call this.refresh()
		for (let tag of this.local_tags)
			if (!this.registry_array.includes(tag))
				this.registry_array.push(tag);
		this.refresh();
		this.v = this.value;
	}
	
	/**
	 * Returns the global registry array shared by all {@link ve.MultiTag} components with this namespace.
	 * - Accessor of: {@link ve.MultiTag}
	 * 
	 * @returns {string[]}
	 */
	get registry_array () {
		//Declare local instance variables
		let key = this.options.tags_key || "global";
		
		//Initialise registry array first if not defined
		if (!ve.registry.settings.MultiTag[key])
			ve.registry.settings.MultiTag[key] = [];
		
		//Return statement
		return ve.registry.settings.MultiTag[key];
	}
	
	/**
	 * Returns the string array stored by the component.
	 * - Accessor of: {@link ve.MultiTag}
	 * 
	 * @returns {string[]}
	 */
	get v () {
		//Return statement
		return this.local_tags;
	}
	
	/**
	 * Sets the string array stored by the component.
	 * - Accessor of: {@link ve.MultiTag}
	 * 
	 * @param {string[]} arg0_value
	 */
	set v (arg0_value) {
		//Declare local instance variables
		let value = (arg0_value) ? Array.toArray(arg0_value) : arg0_value;
		
		//Refresh, set value, then fire from binding
		this.local_tags = value;
		this.refresh();
		this.fireFromBinding();
	}
	
	/**
	 * Notifies all instances sharing the same `.options.tags_key` and updates their tag suggestions.
	 * - Method of: {@link ve.MultiTag}
	 */
	notifyAllInstances () {
		//Declare local instance variables
		let key = this.options.tags_key || "global";
		
		//Refresh all instances with this key
		let instances = ve.MultiTag.instances[key] || [];
			instances.forEach(instance => instance.refresh());
	}
	
	/**
	 * Refreshes the current {@link ve.List} display as well as any {@link ve.Datalist} components attached to it.
	 * - Method of: {@link ve.MultiTag}
	 */
	refresh () {
		//Declare local instance variables
		this.datalist_options = {};
		
		//Iterate over this.registry_array; build suggestions from registry_array
		for (let i = 0; i < this.registry_array.length; i++)
			this.datalist_options[this.registry_array[i]] = this.registry_array[i];
		
		//Create this.components_obj.datalist if ill-defined
		if (!this.components_obj.datalist) {
			this.components_obj.datalist = new ve.Datalist(this.datalist_options);
		} else {
			this.components_obj.datalist.v = this.datalist_options;
		}
		
		//Create this.components_obj.list if ill-defined
		if (!this.components_obj.list) {
			let element_options = {
				onuserchange: (v, e) => {
					if (this.local_tags)
						if (!this.local_tags.includes(v)) {
							this.local_tags.push(v);
							if (!this.registry_array.includes(v))
								this.registry_array.push(v);
							this.notifyAllInstances();
							this.fireToBinding();
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
					this.fireToBinding();
				},
				style: {
					padding: 0
				},
				options: element_options,
			});
			this.components_obj.list.bind(this.element);
			
			//Iterate over all this.local_tags; initialise list items from local_tags
			for (let i = 0; i < this.local_tags.length; i++)
				this.components_obj.list.addItem();
			for (let i = 0; i < this.local_tags.length; i++)
				this.components_obj.list.v[i + 1].v = this.local_tags[i];
		} else {
			//Update suggestions on all datalist items in the list
			this.components_obj.datalist.v = this.datalist_options;
			this.components_obj.list.placeholder = this.datalist_options;
			
			//Iterate over all items in the current list
			for (let i = 0; i < this.components_obj.list.v.length; i++) {
				this.components_obj.list.v[i].v = this.datalist_options;
			}
		}
	}
	
	/**
	 * Updates tags locally and ensures that {@link this.registry_array} is synchronised correctly to account for them.
	 * - Method of: {@link ve.MultiTag}
	 */
	updateLocalTags () {
		//Declare local instance variables
		let new_array = [];
		
		//Iterate over all entries in the current list
		if (this.components_obj.list)
			for (let i = 0; i < this.components_obj.list.v.length; i++) {
				let local_value = this.components_obj.list.v[i].v;
				if (local_value && local_value.length > 0)
					new_array.push(local_value);
			}
		
		//Refresh this.local_tags
		this.local_tags = new_array;
		
		//Add new tags to registry
		for (let tag of new_array)
			if (!this.registry_array.includes(tag))
				this.registry_array.push(tag);
	}
};

//Functional binding

/**
 * @returns {ve.MultiTag}
 */
veMultiTag = function () {
	//Return statement
	return new ve.MultiTag(...arguments);
};