if (!global.naissance) global.naissance = {};
naissance.Geometry = class extends ve.Class {
	static instances = [];
	static reserved_keys = ["name"];
	
	constructor () {
		//Convert from parameters
		super();
		this.history = new naissance.History();
		this.id = Class.generateRandomID(naissance.Geometry);
		this.instance = this;
		this.is_naissance_geometry = true; //Identifier flag for Naissance-bound reflection engine
		this.metadata = {};
		
		//Initialise this.options
		if (!this.options) this.options = {};
			this.options.instance = this;
		
		//Declare local instance variables
		this.fire_action_silently = true;
		this.name = undefined;
		delete this.fire_action_silently;
		
		//Define naissance.Geometry contract
		
		/** 
		 * The current geometry as rendered on {@link global.map}.
		 * @type {maptalks.Geometry|undefined} 
		 */
		this.geometry = undefined;
		/** 
		 * Renders any assigned name to the geometry/label.
		 * @type {maptalks.Label|undefined}
		 */
		this.label = undefined;
		/** @type {boolean} */
		this.selected = false; //Should be overridden by a getter/setter that attempts to render this.selected_geometry
		/**
		 * Selected geometry overlay.
		 * - Mirror of: {@link this.geometry}
		 * @type {maptalks.Geometry|undefined} 
		 */
		this.selected_geometry = undefined;
		/**
		 * Holds the currently rendered keyframe at this date.
		 * @type {naissance.HistoryKeyframe.value|undefined}
		 */
		this.value = undefined;
		
		//Push to naissance.Geometry.instances
		naissance.Geometry.instances.push(this);
		if (main.brush.selected_feature?.entities) {
			this.parent = main.brush.selected_feature;
			main.brush.selected_feature.entities.push(this);
		}
	}
	
	get name () {
		//Declare local instance variables
		let current_keyframe = this.history.getKeyframe();
		let current_value = current_keyframe.value;
		
		//Return statement
		return (current_value[2] && current_value[2].name) ? 
			current_value[2].name : `New ${(this.class_name) ? this.class_name : "Geometry"}`;
	}
	
	set name (arg0_value) {
		//Convert from parameters
		let value = (arg0_value) ? arg0_value : `New ${(this.class_name) ? this.class_name : "Geometry"}`;
		
		//Send DALS.Timeline.parseAction() command
		DALS.Timeline.parseAction({
			options: { name: "Rename Geometry", key: "rename_Geometry" },
			value: [{ type: "Geometry", geometry_id: this.id, set_name: value }]
		}, this.fire_action_silently);
	}
	
	drawHierarchyDatatypeGenerics () {
		//Return statement
		return {
			multitag: veButton(() => {}, {
				name: "<icon>new_label</icon>", tooltip: "Manage Tags",
				style: {
					marginLeft: "auto", order: 99, padding: 0
				}
			}),
			hide_visibility: veButton(() => {
				DALS.Timeline.parseAction({
					options: { name: "Show Geometry", key: "show_geometry" },
					value: [{ type: "Geometry", geometry_id: this.id, set_visibility: false }]
				});
			}, {
				name: `<icon>visibility</icon>`,
				limit: () => this._is_visible,
				tooltip: "Hide Geometry",
				style: { order: 100, padding: 0 }
			}),
			show_visibility: veButton(() => {
				DALS.Timeline.parseAction({
					options: { name: "Show Geometry", key: "show_geometry" },
					value: [{ type: "Geometry", geometry_id: this.id, set_visibility: true }]
				});
			}, {
				name: "<icon>visibility_off</icon>",
				limit: () =>  !this._is_visible,
				tooltip: "Show Geometry",
				style: { order: 100, padding: 0 }
			}),
			delete_button: veButton(() => {
				DALS.Timeline.parseAction({
					options: { name: "Delete Geometry", key: "delete_geometry" },
					value: [{ type: "Geometry", geometry_id: this.id, delete_geometry: true }]
				});
			}, {
				name: "<icon>delete</icon>",
				tooltip: "Delete Geometry",
				style: { order: 101, padding: 0 }
			})
		};
	}
	
	fromJSON () {
		console.warn(`naissance.Geometry.fromJSON() was called for: ${this.class_name}, but was not defined.`);
	}
	
	getLayer () {
		//Iterate over naissance.Feature.instances
		for (let i = 0; i < naissance.Feature.instances.length; i++) {
			let local_feature = naissance.Feature.instances[i];
			
			if (local_feature instanceof naissance.FeatureLayer) {
				let local_geometries = local_feature.getAllGeometries();
				
				for (let x = 0; x < local_geometries.length; x++)
					if (local_geometries[x].id === this.id)
						//Return statement
						return local_feature;
			}
		}
	}
	
	hide () {
		this._is_visible = false;
		if (this.draw) this.draw();
	}
	
	toJSON () {
		console.warn(`naissance.Geometry.toJSON() was called for: ${this.class_name}, but was not defined.`);
	}
	
	remove () {
		//Remove from naissance.Feature .entities
		for (let i = 0; i < naissance.Feature.instances.length; i++) {
			let local_feature = naissance.Feature.instances[i];
			
			if (local_feature.entities)
				for (let x = 0; x < local_feature.entities.length; x++)
					if (local_feature.entities[x].id === this.id)
						naissance.Feature.instances.splice(x, 1);
		}
		
		//Remove from naissance.Geometry.instances
		for (let i = 0; i < naissance.Geometry.instances.length; i++)
			if (naissance.Geometry.instances[i].id === this.id)
				naissance.Geometry.instances.splice(i, 1);
			
		//Rerender deleted geometry and remove it from the map
		this.history = new naissance.History();
		this.draw();
	}
	
	show () {
		this._is_visible = true;
		if (this.draw) this.draw();
	}
	
	/**
	 * Parses a JSON action for a target Geometry.
	 * - Static method of: {@link naissance.Geometry}
	 * 
	 * `arg0_json`: {@link Object|string}
	 * - `.geometry_id`: {@link string} - Identifier. The {@link naissance.Geometry} ID to target changes for, if any.
	 * <br>
	 * - #### Extraneous Commands:
	 * - `.delete_geometry`: {@link boolean}
	 * - `.set_name`: {@link string}
	 * - `.set_visibility`: {@link boolean}
	 */
	static parseAction (arg0_json) {
		//Convert from parameters
		let json = (typeof arg0_json === "string") ? JSON.parse(arg0_json) : arg0_json;
		
		//Declare local instance variables
		let geometry_obj = naissance.Geometry.instances.filter((v) => v.id === json.geometry_id)[0];
		
		//Parse commands for geometry_obj
		if (geometry_obj) {
			//delete_geometry
			if (json.delete_geometry === true)
				geometry_obj.remove();
			
			//set_visibility
			if (json.set_visibility === true) {
				geometry_obj.show();
			} else if (json.set_visibility === false) {
				geometry_obj.hide();
			}
			
			//set_name
			if (typeof json.set_name === "object") {
				let date = (json.set_name.date) ? json.set_name.date : main.date;
				let new_name = json.set_name.name;
				geometry_obj.history.addKeyframe(date, undefined, undefined, { name: new_name });
				geometry_obj.draw();
			} else if (typeof json.set_name === "string") {
				geometry_obj.history.addKeyframe(main.date, undefined, undefined, { name: json.set_name });
				geometry_obj.draw();
			}
		}
	}
};