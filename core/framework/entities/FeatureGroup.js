if (!global.naissance) global.naissance = {};
/**
 * @type {naissance.FeatureGroup}
 */
naissance.FeatureGroup = class extends naissance.Feature {
	static hierarchy_symbol = {
		icon: "folder",
		name: "Group"
	};
	
	constructor (arg0_entities, arg1_options) {
		//Convert from parameters
		super();
		//this.cannot_nest_self = true;
		this.class_name = "FeatureGroup";
		this.entities = (arg0_entities) ? arg0_entities : [];
		this.options = (arg1_options) ? arg1_options : {};
		
		//Declare local instance variables
		this._name = "New Group";
	}
	
	addEntity (arg0_naissance_obj, arg1_do_not_refresh) {
		//Convert from parameters
		let naissance_obj = arg0_naissance_obj;
		let do_not_refresh = arg1_do_not_refresh;
		
		//Declare local instance variables
		let has_entity = this.hasEntity(naissance_obj);
		
		if (!has_entity) {
			naissance_obj.parent = this;
			this.entities.push(naissance_obj);
			if (!do_not_refresh) this.drawHierarchyDatatype();
		}
	}
	
	drawUI () {
		//Return statement
		return {
			actions: this.drawActionsPalette({
				name: "Group",
				type: "group",
				
				move_to_filters: ["FeatureGroup"]
			})
		};
	}
	
	fromJSON (arg0_json) {
		//Convert from parameters
		let json = (typeof arg0_json !== "object") ? JSON.parse(arg0_json) : arg0_json;
		
		//Declare local instance variables
		this.id = json.id;
		this.is_collapsed = json.is_collapsed;
		this._name = (json.name) ? json.name : "New Group";
		this.options = json.options;
		
		//Iterate over json.entities IN SAVED ORDER to restore them
		for (let x = 0; x < json.entities.length; x++) {
			let entity_def = json.entities[x];
			let local_feature = naissance.Feature.instances[entity_def.id];
			
			if (entity_def.class_name === local_feature?.class_name)
				this.addEntity(local_feature, true);
			
			//Check naissance.Geometry.instances
			if (naissance.Geometry.instances[entity_def.id]) {
				let local_geometry = naissance.Geometry.instances[entity_def.id];
				
				if (entity_def.class_name === local_geometry.class_name)
					this.addEntity(local_geometry, true);
			}
		}
		
		//Draw HierarchyDatatype if possible
		this.drawHierarchyDatatype();
	}
	
	hasEntity (arg0_naissance_obj) {
		//Convert from parameters
		let naissance_obj = arg0_naissance_obj;
		
		//Iterate over this.entities and flag anything with the same .id
		for (let i = 0; i < this.entities.length; i++)
			if (
				this.entities[i].class_name === naissance_obj.class_name &&
				this.entities[i].id === naissance_obj.id
			)
				//Return statement
				return true;
	}
	
	removeEntity (arg0_naissance_obj) {
		//Convert from parameters
		let naissance_obj = arg0_naissance_obj;
		
		//Iterate over all entities and then redraw the current hierarchy datatype
		for (let i = 0; i < this.entities.length; i++)
			if (
				this.entities[i].class_name === naissance_obj.class_name &&
				this.entities[i].id === naissance_obj.id
			) {
				this.entities.splice(i, 1);
				break;
			}
		this.drawHierarchyDatatype();
	}
	
	toJSON () {
		//Declare local instance variables
		let entity_ids = [];
		
		//Iterate over all this.entities
		for (let i = 0; i < this.entities.length; i++)
			entity_ids.push({
				class_name: this.entities[i].class_name,
				id: this.entities[i].id
			});
		
		//Return statement
		return JSON.stringify({
			id: this.id,
			name: this._name,
			
			entities: entity_ids,
			is_collapsed: this.is_collapsed,
			metadata: this.metadata,
			options: this.options
		});
	}
};