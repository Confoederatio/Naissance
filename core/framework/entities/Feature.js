if (!global.naissance) global.naissance = {};
naissance.Feature = class extends ve.Class {
	static instances = [];
	
	constructor () {
		//Convert from parameters
		super();
		this.id = Class.generateRandomID(naissance.Feature);
		this.instance = this;
		this.is_naissance_feature = true;
		this._is_visible = true;
		
		//Initialise this.options
		if (!this.options) this.options = {};
			this.options.instance = this;
			
		//Declare local instance variables
		this._name = "New Feature";
		this._parent = undefined;
		
		//Push to naissance.Feature.instances
		naissance.Feature.instances.push(this);
		setTimeout(() => {
			if (main.brush.selected_feature?.entities && !this.cannot_nest_self) { //Sanity check to make sure .cannot_nest_self is invalid for nesting
				this.parent = main.brush.selected_feature;
				main.brush.selected_feature.entities.push(this);
			}
		});
	}
	
	get name () {
		//Return statement
		return this._name;
	}
	
	set name (arg0_value) {
		//Convert from parameters
		let value = (arg0_value) ? arg0_value : "";
		
		//Send DALS.Timeline.parseAction() command
		DALS.Timeline.parseAction({
			options: { name: "Rename Feature", key: "rename_Feature" },
			value: [{ type: "Feature", feature_id: this.id, set_name: value }]
		}, this.fire_action_silently);
	}
	
	get parent () {
		//Return statement
		return this._parent;
	}
	
	set parent (arg0_v) {
		//Convert from parameters
		let value = arg0_v;
		
		//Make sure parent cannot be self
		if (value && value.id !== this.id)
			this._parent = value;
	}
	
	hide () {
		//Declare local instance variables
		this._is_visible = false;
		
		//Iterate over all entities; attempt to hide all entities
		if (this.entities)
			for (let i = 0; i < this.entities.length; i++)
				if (this.entities[i].hide)
					this.entities[i].hide();
	}
	
	remove () {
		//Remove from local_feature.entities
		for (let i = 0; i < naissance.Feature.instances.length; i++) {
			let local_feature = naissance.Feature.instances[i];
			
			if (local_feature.hide) local_feature.hide();
			if (local_feature.entities)
				for (let x = 0; x < local_feature.entities.length; x++)
					if (local_feature.entities[x].id === this.id)
						naissance.Feature.instances.splice(x, 1);
		}
		
		//Remove from naissance.Feature.instances
		for (let i = 0; i < naissance.Feature.instances.length; i++)
			if (naissance.Feature.instances[i].id === this.id)
				naissance.Feature.instances.splice(i, 1);
		
		//Rerender deleted feature and remove it from the map
		if (this.draw) this.draw();
		UI_LeftbarHierarchy.refresh();
	}
	
	show () {
		this._is_visible = true;``
		
		//Iterate over all entities; attempt to show all entities
		if (this.entities)
			for (let i = 0; i < this.entities.length; i++)
				if (this.entities[i].show)
					this.entities[i].show();
	}
	
	static parseAction (arg0_json) {
		//Convert from parameters
		let json = (typeof arg0_json === "string") ? JSON.parse(arg0_json) : arg0_json;
		
		//Declare local instance variables
		let feature_obj = naissance.Feature.instances.filter((v) => v.id === json.feature_id)[0];
		
		//Parse commands for feature_obj
		if (feature_obj) {
			//delete_feature
			if (json.delete_feature === true)
				feature_obj.remove();
			
			//set_name
			if (typeof json.set_name === "string")
				feature_obj._name = json.set_name;
			
			//set_visibility
			if (json.set_visibility !== undefined)
				if (json.set_visibility === true) {
					feature_obj.show();
				} else if (json.set_visibility === false) {
					feature_obj.hide();
				}
		}
	}
};