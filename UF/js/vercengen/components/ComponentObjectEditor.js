/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 *
 * A recursive editor for JavaScript Objects, Arrays, and primitives.
 * Layout: [Icon] [Key] : [Value] ... [Delete]
 * - Functional binding: <span color=00ffff>veObjectEditor</span>().
 *
 * ##### Constructor:
 * - `arg0_value`: {@link Object}|{@link Array} - The object to edit.
 * - `arg1_options`: {@link Object}
 *   - `.auto_collapse_depth=1`: {@link number} - The depth at which folders start collapsing automatically.
 *   - `.do_not_allow_deletion=false`: {@link boolean}
 *   - `.do_not_allow_insertion=false`: {@link boolean}
 *   - `.do_not_allow_key_change=false`: {@link boolean}
 *   - `.do_not_allow_type_change=false`: {@link boolean}
 *   - `.do_not_display_icons=false`: {@link boolean} - Whether to show type icons.
 *   - `.preserve_structure=false`: {@link boolean} - Whether to only allow changes to primitives, and not to the data structure itself.
 *
 * ##### Instance:
 * - `.hierarchy`: {@link ve.Hierarchy} - The internal hierarchy component.
 * - `.v`: {@link Object}|{@link Array}
 *
 * ##### Methods:
 * - <span color=00ffff>{@link ve.ObjectEditor.refresh|refresh}</span>()
 *
 * @augments ve.Component
 * @memberof ve.Component
 * @type {ve.ObjectEditor}
 */
ve.ObjectEditor = class extends ve.Component { //[WIP] - Refactor at a later date. Fix documentation.
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = (arg0_value) ? arg0_value : {};
		let options = (arg1_options) ? arg1_options : {};
			super(options);
		
		//Initialise options
		options.attributes = (options.attributes) ? options.attributes : {};
		options.auto_collapse_depth = Math.returnSafeNumber(options.auto_collapse_depth, 1);
		
		//.preserve_structure handling
		if (options.preserve_structure) {
			options.do_not_allow_deletion = (options.do_not_allow_deletion === undefined) ? 
				true : options.do_not_allow_deletion;
			options.do_not_allow_insertion = (options.do_not_allow_insertion === undefined) ?
				true : options.do_not_allow_insertion;
			options.do_not_allow_key_change = (options.do_not_allow_key_change === undefined) ? 
				true : options.do_not_allow_key_change;
			options.do_not_allow_type_change = (options.do_not_allow_type_change === undefined) ? 
				true : options.do_not_allow_type_change;
		}
		
		//Declare local instance variables
		this.element = document.createElement("div");
		this.element.setAttribute("component", "ve-object-editor");
		HTML.setAttributesObject(this.element, options.attributes);
		this.element.instance = this;
		
		this.value = value;
		this.options = options;
		
		this.refresh();
	}
	
	/**
	 * Returns the component value to a JSON object.
	 * - Accessor of: {@link ve.ObjectEditor}
	 *
	 * @alias v
	 * @memberof ve.Component.ve.ObjectEditor
	 * @type {Object}
	 */
	get v () {
		//Return statement
		return this.value;
	}
	
	/**
	 * Sets the new component value to a JSON object.
	 * - Accessor of: {@link ve.ObjectEditor}
	 *
	 * @alias v
	 * @memberof ve.Component.ve.ObjectEditor
	 *
	 * @param {Object} arg0_value
	 */
	set v (arg0_value) {
		//Convert from parameters
		this.value = arg0_value;
		
		//Fire binding
		this.refresh();
		this.fireFromBinding();
	}
	
	_getType (arg0_value) {
		//Convert from parameters
		let value = arg0_value;
		
		//Return statement
		if (Array.isArray(value)) return "array";
		if (value === null) return "null";
		return typeof value;
	}
	
	_moveArrayItem (arg0_array, arg1_old_index, arg2_new_index) {
		//Convert from parameters
		let arr = arg0_array;
		let old_index = arg1_old_index;
		let new_index = arg2_new_index;
		
		//new_index; old_index handling
		if (new_index >= arr.length) new_index = arr.length - 1;
		if (new_index < 0) new_index = 0;
		if (old_index === new_index) return; //Internal guard clause if it is being moved into the same item
		
		let item = arr.splice(old_index, 1)[0];
		arr.splice(new_index, 0, item);
		
		//Refresh view and fire to binding
		this.refresh();
		this.fireToBinding();
	}
	
	_openAddModal (arg0_target_obj) {
		//Convert from parameters
		let target_obj = arg0_target_obj;
		
		//Declare local instance variables
		let is_array = Array.isArray(target_obj);
		
		let components_obj = {
			info: new ve.HTML((is_array) ? loc("ve.registry.localisation.ObjectEditor_add_array_info") : loc("ve.registry.localisation.ObjectEditor_add_object_info")),
			type_select: new ve.Select({
				string: { name: loc("ve.registry.localisation.ObjectEditor_type_string"), selected: true },
				number: { name: loc("ve.registry.localisation.ObjectEditor_type_number") },
				boolean: { name: loc("ve.registry.localisation.ObjectEditor_type_boolean") },
				object: { name: loc("ve.registry.localisation.ObjectEditor_type_object") },
				array: { name: loc("ve.registry.localisation.ObjectEditor_type_array") },
				null: { name: loc("ve.registry.localisation.ObjectEditor_type_null") }
			}, {
				style: { width: "100%", marginBottom: "var(--cell-padding)" }
			}),
			confirm_button: new ve.Button(() => {
				let selected_type = this.modal_window.components_obj.type_select.v;
				let new_key = (is_array) ? target_obj.length : this.modal_window.components_obj.key_name.v;
				
				if (!is_array && !new_key) {
					new ve.Toast(loc("ve.registry.localisation.ObjectEditor_toast_enter_property_name"));
					return;
				}
				if (!is_array && target_obj.hasOwnProperty(new_key)) {
					new ve.Toast(loc("ve.registry.localisation.ObjectEditor_toast_property_exists", new_key));
					return;
				}
				
				let new_value = null;
				switch (selected_type) {
					case "string": new_value = ""; break;
					case "number": new_value = 0; break;
					case "boolean": new_value = false; break;
					case "object": new_value = {}; break;
					case "array": new_value = []; break;
					case "null": new_value = null; break;
				}
				
				if (is_array) target_obj.push(new_value);
				else target_obj[new_key] = new_value;
				
				this.modal_window.close();
				this.refresh();
				this.fireToBinding();
				
			}, { name: loc("ve.registry.localisation.ObjectEditor_button_add_item"), style: { width: "100%" } })
		};
		if (!is_array)
			components_obj.key_name = new ve.Text("", {
				placeholder: loc("ve.registry.localisation.ObjectEditor_placeholder_property_name"),
				style: { marginBottom: "var(--cell-padding)" }
			});
		
		//Open modal_window if possible
		if (this.modal_window) this.modal_window.close();
		this.modal_window = new ve.Window(components_obj, {
			name: (is_array) ? loc("ve.registry.localisation.ObjectEditor_window_add_array_element") : loc("ve.registry.localisation.ObjectEditor_window_add_variable"),
			can_rename: false
		});
	}
	
	_openChangeTypeModal (arg0_target_object, arg1_key) {
		//Convert from parameters
		let target_obj = arg0_target_object;
		let key = arg1_key;
		
		//Declare local instance variables
		let current_val = target_obj[key];
		let current_type = this._getType(current_val);
		
		let components_obj = {
			info: new ve.HTML(loc("ve.registry.localisation.ObjectEditor_change_type_info", key)),
			type_select: new ve.Select({
				string: { name: loc("ve.registry.localisation.ObjectEditor_type_string"), selected: current_type === "string" },
				number: { name: loc("ve.registry.localisation.ObjectEditor_type_number"), selected: current_type === "number" },
				boolean: { name: loc("ve.registry.localisation.ObjectEditor_type_boolean"), selected: current_type === "boolean" },
				object: { name: loc("ve.registry.localisation.ObjectEditor_type_object"), selected: current_type === "object" },
				array: { name: loc("ve.registry.localisation.ObjectEditor_type_array"), selected: current_type === "array" },
				null: { name: loc("ve.registry.localisation.ObjectEditor_type_null"), selected: current_type === "null" }
			}, {
				style: { width: "100%", marginBottom: "var(--cell-padding)" }
			}),
			confirm_button: new ve.Button(() => {
				let selected_type = this.change_type_window.components_obj.type_select.v;
				
				// Don't do anything if type didn't change
				if (selected_type === current_type) {
					this.change_type_window.close();
					return;
				}
				
				let new_value = null;
				switch (selected_type) {
					case "string": new_value = ""; break;
					case "number": new_value = 0; break;
					case "boolean": new_value = false; break;
					case "object": new_value = {}; break;
					case "array": new_value = []; break;
					case "null": new_value = null; break;
				}
				
				target_obj[key] = new_value;
				
				this.change_type_window.close();
				this.refresh();
				this.fireToBinding();
				
			}, {
				name: loc("ve.registry.localisation.ObjectEditor_button_change_type"),
				style: { width: "100%" }
			})
		};
		
		//Open change_type_window if possible
		if (this.change_type_window) this.change_type_window.close();
		this.change_type_window = new ve.Window(components_obj, {
			name: loc("ve.registry.localisation.ObjectEditor_window_change_type"),
			can_rename: false,
			width: "300px",
			height: "auto"
		});
	}
	
	_renameObjectKey(obj, old_key, new_key) {
		if (old_key === new_key) return;
		if (obj.hasOwnProperty(new_key)) {
			new ve.Toast(loc("ve.registry.localisation.ObjectEditor_toast_key_exists", new_key));
			this.refresh();
			return;
		}
		const keys = Object.keys(obj);
		const new_obj = {};
		keys.forEach(key => {
			if (key === old_key) new_obj[new_key] = obj[old_key];
			else new_obj[key] = obj[key];
		});
		Object.keys(obj).forEach(k => delete obj[k]);
		Object.assign(obj, new_obj);
		this.refresh();
		this.fireToBinding();
	}
	
	/**
	 * Generates HTML recursively for the current component.
	 * - Private method of: {@link ve.ObjectEditor}
	 * 
	 * @param arg0_current_data
	 * @param arg1_current_key
	 * @param arg2_depth
	 * @param arg3_parent_object
	 * @returns {*|ve.Component.HierarchyDatatype}
	 * 
	 * @private
	 */
	_generateRecursive (arg0_current_data, arg1_current_key, arg2_depth, arg3_parent_object) { //[WIP] - Refactor later
		//Convert from parameters
		let current_data = arg0_current_data;
		let current_key = arg1_current_key;
		let depth = arg2_depth;
		let parent_object = arg3_parent_object;
		
		//Declare local instance variables
		let components_obj = {};
		let type = this._getType(current_data);
		
		let is_group = (type === "object" || type === "array");
		let parent_is_array = Array.isArray(parent_object);
		
		//1. Icon (Order 0)
		if (!this.options.do_not_display_icons) {
			let icon_name = "help_outline";
			switch(type) {
				case "object": icon_name = "data_object"; break;
				case "array": icon_name = "data_array"; break;
				case "string": icon_name = "short_text"; break;
				case "number": icon_name = "123"; break;
				case "boolean": icon_name = "toggle_on"; break;
				case "null": icon_name = "do_not_disturb_on"; break;
			}
			let icon_style = {
				order: 0,
				marginRight: "0.5rem",
				opacity: 0.7,
				display: "flex",
				alignItems: "center",
				border: "none",
				padding: 0
			};
			
			//Changed to ve.Button to allow clicking to change type
			if (!this.options.do_not_allow_type_change) {
				components_obj.icon = new ve.Button((e) => {
					this._openChangeTypeModal(parent_object, current_key);
				}, {
					name: `<icon>${icon_name}</icon>`,
					
					attributes: {
						"data-is-type": true
					},
					style: icon_style,
					tooltip: loc("ve.registry.localisation.ObjectEditor_tooltip_change_type", type)
				});
			} else {
				components_obj.icon = new ve.HTML(`<icon>${icon_name}</icon>`, {
					attributes: { "data-is-type": true },
					style: icon_style,
					tooltip: loc("ve.registry.localisation.ObjectEditor_tooltip_type", type)
				})
			}
		}
		
		//2. Key Input (Order 1)
		if (!this.options.do_not_allow_key_change) {
			if (parent_is_array) {
				components_obj.key_input = new ve.Number(current_key, {
					min: 0,
					max: parent_object.length - 1,
					onuserchange: (new_index) => {
						this._moveArrayItem(parent_object, current_key, new_index);
					},
					style: {
						width: "3rem"
					}
				});
			} else {
				components_obj.key_input = new ve.Text(current_key, {
					onuserchange: (new_key) => {
						this._renameObjectKey(parent_object, current_key, new_key);
					},
					style: {
						maxWidth: "6rem"
					}
				});
			}
		} else {
			components_obj.key_name = new ve.HTML(current_key, {
				style: {
					maxWidth: "4rem"
				}
			})
		}
		
		//3. Separator (Order 2)
		components_obj.separator = new ve.HTML("<b>&nbsp;:&nbsp;</b>", {
			style: { opacity: 0.5 }
		});
		
		//4. Value Input (Order 3)
		if (!is_group) {
			if (type === "string") {
				components_obj.input = new ve.Text(current_data, {
					onuserchange: (v) => { parent_object[current_key] = v; this.fireToBinding(); },
					style: { order: 3, flex: "1 1 auto" }
				});
			} else if (type === "number") {
				components_obj.input = new ve.Number(current_data, {
					onuserchange: (v) => { parent_object[current_key] = v; this.fireToBinding(); },
					style: { order: 3 }
				});
			} else if (type === "boolean") {
				components_obj.input = new ve.Toggle(current_data, {
					onuserchange: (v) => { parent_object[current_key] = v; this.fireToBinding(); },
					on_name: loc("ve.registry.localisation.ObjectEditor_value_true"),
					off_name: loc("ve.registry.localisation.ObjectEditor_value_false"),
					style: { order: 3 }
				});
			} else {
				//Null or other types
				components_obj.input = new ve.HTML(`<span style="opacity:0.5">${String(current_data)}</span>`, {
					style: { order: 3 }
				});
			}
		} else {
			//Group Add Button
			components_obj.add_child_btn = new ve.Button((e) => {
				this._openAddModal(current_data);
			}, {
				name: "<icon>add</icon>",
				limit: () => (!this.options.do_not_allow_insertion),
				tooltip: loc("ve.registry.localisation.ObjectEditor_tooltip_add_item"),
				style: { order: 3 }
			});
		}
		
		//5. Delete Button (Order 4)
		//This gets marginLeft: auto to push it to the far right edge of the container
		components_obj.delete_btn = new ve.Button((e) => {
			veConfirm(loc("ve.registry.localisation.ObjectEditor_confirm_delete", current_key), {
				special_function: () => {
					if (Array.isArray(parent_object)) {
						parent_object.splice(current_key, 1);
					} else {
						delete parent_object[current_key];
					}
					this.refresh();
					this.fireToBinding();
				}
			});
		}, {
			name: "<icon>delete</icon>",
			limit: () => (!this.options.do_not_allow_deletion),
			tooltip: loc("ve.registry.localisation.ObjectEditor_tooltip_delete"),
			style: {
				order: 4,
				color: "var(--color-error)"
			}
		});
		
		//Handle children
		if (is_group)
			Object.keys(current_data).forEach((key) => {
				let safe_key = key;
				if (Array.isArray(current_data)) safe_key = parseInt(key);
				components_obj[`child_${key}`] = this._generateRecursive(current_data[key], safe_key, depth + 1, current_data);
			});
		
		//Return statement
		return new ve.HierarchyDatatype(components_obj, {
			name: (typeof current_key === "string") ? current_key : current_key.toString(),
			type: is_group ? "group" : "item",
			is_collapsed: (depth >= this.options.auto_collapse_depth),
			
			// Metadata for reordering
			data_container: parent_object,
			data_key: current_key,
			data_value: current_data,
			
			style: {
				".nst-content": {
					display: "flex",
					alignItems: "center",
					gap: "0px" // Removing gap to rely on element margins
				},
				'input': { maxWidth: "8rem" },
				width: "20rem"
			}
		});
	}
	
	_handleReorder (arg0_v, arg1_e) {
		//Convert from parameters
		let v = arg0_v;
		let e = arg1_e;
		
		let stop_data = e.on_stop_data;
		if (!stop_data) return; //Internal guard clause if no event date
		
		//Declare local instance variables
		let moved_instance = stop_data.movedNode.instance;
		let original_parent_instance = stop_data.originalParentItem?.instance;
		let new_parent_instance = stop_data.newParentItem?.instance;
		let source_container = (original_parent_instance) ?
			original_parent_instance.options.data_value : this.value;
		
		let dest_container = (new_parent_instance) ?
			new_parent_instance.options.data_value : this.value;
		let key_to_move = moved_instance.options.data_key;
		let val_to_move = source_container[key_to_move];
		
		let parent_ol = stop_data.newParentItem ?
			stop_data.newParentItem.querySelector("ol") :
			this.element.querySelector("ol.ve-hierarchy");
		
		let siblings = Array.from(parent_ol.children).filter(el =>
			el.getAttribute("component") === "ve-hierarchy-datatype" && !el.classList.contains("actions-bar")
		);
		let new_index = siblings.indexOf(stop_data.movedNode);
		
		//Add
		if (Array.isArray(dest_container)) {
			dest_container.splice(new_index, 0, val_to_move);
		} else {
			dest_container[key_to_move] = val_to_move;
		}
		
		//Remove
		if (Array.isArray(source_container)) {
			source_container.splice(key_to_move, 1);
		} else {
			delete source_container[key_to_move];
		}
		
		//Refresh and fire to binding
		this.refresh();
		this.fireToBinding();
	}
	
	/**
	 * Refreshes the given {@link ve.ObjectEditor} to be in sync with the JSON object passed in.
	 * - Method of: {@link ve.ObjectEditor}
	 *
	 * @alias refresh
	 * @memberof ve.Component.ve.ObjectEditor
	 */
	refresh () {
		//Declare local instance varioables
		this.element.innerHTML = "";
		let actions_bar = new ve.HierarchyDatatype({
			add_root_btn: new ve.Button(() => {
				if (this.value === null) this.value = {};
				this._openAddModal(this.value);
			}, {
				name: "<icon>playlist_add</icon>",
				tooltip: loc("ve.registry.localisation.ObjectEditor_tooltip_add_variable")
			}),
			information: new ve.Button(() => {}, {
				name: "<icon>info</icon>",
				tooltip: loc("ve.registry.localisation.ObjectEditor_tooltip_info")
			})
		}, {
			disabled: true,
			attributes: { class: "actions-bar" },
			style: {
				marginTop: `calc(var(--padding))`,
				width: "20rem"
			}
		});
		let hierarchy_obj = (!this.options.do_not_allow_insertion) ?
			{ actions_bar: actions_bar } : {};
		
		//Assign objects recursively when drawing UI
		if (this.value && typeof this.value === "object")
			Object.keys(this.value).forEach((key) => {
				let safe_key = key;
				if (Array.isArray(this.value)) safe_key = parseInt(key);
				hierarchy_obj[`root_${key}`] = this._generateRecursive(this.value[key], safe_key, 0, this.value);
			});
		
		this.hierarchy = new ve.Hierarchy(hierarchy_obj, {
			disable_searchbar: false,
			searchbar_style: { marginBottom: "0" },
			onuserchange: (v, e) => this._handleReorder(v, e)
		});
			this.hierarchy.element.style.height = "100%";
			this.hierarchy.element.style.overflowY = "auto";
		
		if (this.owner) this.hierarchy.setOwner(this.owner);
		this.element.appendChild(this.hierarchy.element);
	}
};

//Functional binding

/**
 * @returns {ve.ObjectEditor}
 */
veObjectEditor = function () {
	return new ve.ObjectEditor(...arguments);
};