if (!global.naissance) global.naissance = {};
naissance.Geometry = class extends ve.Class {
	static instances = [];
	static reserved_keys = ["name"];
	
	constructor () {
		//Convert from parameters
		super();
		this.history = new naissance.History({}, {
			localisation_function: (new_keyframe, old_keyframe) => { //[WIP] - Finish function
				//Declare local instance variables
				let return_string = [];
				
				//[0] .geometry change
				if (new_keyframe.value[0])
					return_string.push(`Geometry changed`);
				if (new_keyframe.value[0] === null)
					return_string.push(`Geometry removed`);
				
				//[1] .symbol change
				if (new_keyframe.value[1])
					return_string.push(`Symbol changed to: ${String.formatObject(new_keyframe.value[1])}`);
				
				//[2] .properties change
				if (new_keyframe.value[2]?.hidden === false)
					return_string.push(`Geometry visible`);
				if (new_keyframe.value[2]?.hidden === true)
					return_string.push(`Geometry hidden`);
				if (new_keyframe.value[2]?.max_zoom !== undefined)
					return_string.push(`Maximum zoom set to ${new_keyframe.value[2].max_zoom}`);
				if (new_keyframe.value[2]?.min_zoom !== undefined)
					return_string.push(`Minimum zoom set to ${new_keyframe.value[2].min_zoom}`);
				if (new_keyframe.value[2]?.name)
					return_string.push(`Name changed to ${new_keyframe.value[2].name}`);
				if (new_keyframe.value[2]?.variables)
					return_string.push(`Variables changed to: ${String.formatObject(new_keyframe.value[2].variables)}`);
				
				//Return statement
				return String.formatArray(return_string);
			}
		});
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
		 * @type {maptalks.Label[]|undefined}
		 */
		this.label_geometries = [];
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
	
	get current_keyframe () {
		//Return statement
		return this.history.getKeyframe();
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
			multitag: veButton(() => {
				if (this.tags_editor) this.tags_editor.close();
				this.tags_editor = veWindow({
					tags_list: veMultiTag(this.metadata.tags, {
						onuserchange: (v) => this.metadata.tags = v
					})
				}, {
					name: `Edit Tags (${this.name})`,
					can_rename: false,
					width: "20rem",
					
					onuserchange: (v) => {
						if (v.close)
							DALS.Timeline.parseAction({
								options: { name: "Edit Geometry Tags", key: "edit_geometry_tags" },
								value: [{ type: "Geometry", geometry_id: this.id, set_tags: this.metadata.tags }]
							});
					}
				})
			}, {
				name: "<icon>new_label</icon>", tooltip: "Manage Tags",
				style: {
					marginLeft: "auto", order: 99, padding: 0
				}
			}),
			hide_geometry: veButton(() => {
				DALS.Timeline.parseAction({
					options: { name: "Hide Geometry", key: "hide_geometry" },
					value: [{ type: "Geometry", geometry_id: this.id, set_properties: { hidden: true } }]
				});
			}, {
				name: `<icon>visibility</icon>`,
				limit: () => !this.current_keyframe.value[2]?.hidden,
				tooltip: "Hide Geometry",
				style: { order: 100, padding: 0 }
			}),
			show_geometry: veButton(() => {
				DALS.Timeline.parseAction({
					options: { name: "Show Geometry", key: "show_geometry" },
					value: [{ type: "Geometry", geometry_id: this.id, set_properties: { hidden: false } }]
				});
			}, {
				name: "<icon>visibility_off</icon>",
				limit: () =>  this.current_keyframe.value[2]?.hidden,
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
	
	/**
	 * Parses a JSON action for a target Geometry.
	 * - Static method of: {@link naissance.Geometry}
	 * 
	 * `arg0_json`: {@link Object|string}
	 * - `.geometry_id`: {@link string} - Identifier. The {@link naissance.Geometry} ID to target changes for, if any.
	 * <br>
	 * - #### Extraneous Commands:
	 * - `.delete_geometry`: {@link boolean}
	 * - `.set_history`: {@link string} - The JSON `.history` string to set for the target Geometry.
	 * - `.set_name`: {@link string}
	 * - `.set_polygon`: {@link string} - The JSON to set the polygon geometry to.
	 * - `.set_properties`: {@link Object}
	 *   - `<data_key>`: {@link any}
	 * - `.set_tags`: {@link Array}<{@link string}>
	 * - `.set_symbol`: {@link Object}
	 *   - `<symbol_key>`: {@link any}
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
			
			//set_geometry
			if (json.set_geometry) {
				geometry_obj.addKeyframe(main.date, json.set_geometry);
			} else if (json.set_geometry === null) {
				geometry_obj.addKeyframe(main.date, null);
			}
			
			//set_history
			if (json.set_history)
				geometry_obj.history.fromJSON(json.set_history);
			
			//set_name
			if (json.set_name) {
				if (typeof json.set_name === "object") {
					let date = (json.set_name.date) ? json.set_name.date : main.date;
					let new_name = json.set_name.name;
					geometry_obj.history.addKeyframe(date, undefined, undefined, { name: new_name });
					geometry_obj.draw();
				} else if (typeof json.set_name === "string") {
					geometry_obj.history.addKeyframe(main.date, undefined, undefined, { name: json.set_name });
					geometry_obj.draw();
				}
				
				//Refresh .instance_window .name if visible
				if (geometry_obj.instance_window) {
					let current_keyframe = geometry_obj.history.getKeyframe();
					
					if (current_keyframe.value[2] && current_keyframe.value[2].name)
						geometry_obj.instance_window.setName(current_keyframe.value[2].name);
				}
			}
			
			//set_properties
			if (json.set_properties) {
				if (json.set_properties.date) {
					geometry_obj.addKeyframe(json.set_properties.date, undefined, undefined, json.set_properties.value);
				} else {
					geometry_obj.addKeyframe(main.date, undefined, undefined, json.set_properties);
				}
			} else if (json.set_properties === null) {
				geometry_obj.addKeyframe(main.date, undefined, undefined, null);
			}
			
			//set_symbol
			if (json.set_symbol) {
				geometry_obj.addKeyframe(main.date, undefined, json.set_symbol);
			} else if (json.set_symbol === null) {
				geometry_obj.addKeyframe(main.date, undefined, null);
			}
			
			//set_tags
			if (json.set_tags)
				geometry_obj.metadata.tags = Array.toArray(json.set_tags);
		}
	}
};