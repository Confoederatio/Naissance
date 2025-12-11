if (!global.ve) global.ve = {};

/**
 * <span color = "yellow">{@link ve.Feature}</span>: Features in Vercengen represent special containers such as panels, windows, tooltips, or interface which encapsulate <span color = "yellow">{@link ve.Component}</span> types. 
 * 
 * Used to automatically destructure `arg0_components_obj`.
 * 
 * ##### Constructor:
 * - `arg0_components_obj`: {@link function}|{@link Object}<{@link ve.Component}>|{@link string}|{@link ve.Component}
 * - `arg1_options`: {@link Object} - Fed into this.options for localised parsing.
 * 
 * ##### DOM:
 * - `.instance`: this:{@link ve.Component}
 * 
 * ##### Instance:
 * - `.child_class=this.constructor`: {@link ve.Feature} - The constructor object of the child class.
 * - `.child_class_obj=ve[htis.child_class.prototype.constructor.name]`: {@link ve.Feature} - The actual object of the child class.
 * - `.components_obj`: {@link Array}<{@link ve.Component}>
 * - `.id`: {@link string}
 * - `.is_vercengen_feature=true`: {@link boolean} - Whether to mark this ve.Feature as a Vercengen feature.
 * - `.options`: {@link Object}
 * 
 * ##### Methods:
 * - <span color=00ffff>{@link ve.Feature.addComponents|addComponents}</span>(arg0_components_obj:{@link Object}<{@link ve.Component}>) - Appends new components to the present ve.Feature.
 * - <span color=00ffff>{@link ve.Feature.close|close}</span>() - Alias for .remove()
 * - <span color=00ffff>{@link ve.Feature.remove|remove}</span>() - Removes the current feature.
 * - <span color=00ffff>{@link ve.Feature.removeComponents|removeComponents}</span>(arg0_components_obj:{@link Object}<{@link ve.Component}>) - Removes components from the current {@link this.element} based on key names.
 * - <span color=00ffff>{@link ve.Feature.updateOwner|updateOwner}</span>() - Updates the `.owner`/`.owners` fields for all encapsulated components to ve.Feature if no {@link ve.Class} owner could be found.
 * 
 * ##### Static Fields:
 * - `.instances`: {@link Array}<{@link ve.Feature}>
 * 
 * ##### Types:
 * - {@link ve.Feature.ve.Confirm|ve.Confirm}(arg0_components_obj:{@link Object}<{@link ve.Component}>, arg1_options:{@link Object}) - Confirm dialogue/modal.
 * - {@link ve.Feature.ve.ContextMenu|ve.ContextMenu}(arg0_components_obj:{@link Object}<{@link ve.Component}>, arg1_options:{@link Object}) - Pop-up context menu located at the cursor with an assigned `.id` to prevent duplicates.
 * - {@link ve.Feature.ve.Modal|ve.Modal}(arg0_components_obj:{@link Object}<{@link ve.Component}>, arg1_options:{@link Object}) - Overlays a modal on top of the current Vercengen overlay interface. Must be responded to before conventional windows.
 * - {@link ve.Feature.ve.Navbar|ve.Navbar}(arg0_navbar_obj:{@link Object}, arg1_options:{@link Object}) - Creates an action topbar with recursive dropdown menus and keybind settings.
 * - {@link ve.Feature.ve.PageMenuWindow|ve.PageMenuWindow}(arg0_page_obj:{@link Object}, arg1_options:{@link Object}) - Creates a page menu window, which encapsulates components in pages instead of interfaces.
 * - {@link ve.Feature.ve.Scene|ve.Scene}(arg0_components_obj:{@link Object}<{@link ve.Component}>, arg1_options:{@link Object}) - Creates a full-viewport rendering scene.
 * - {@link ve.Feature.ve.Toast|ve.Toast}(arg0_components_obj:{@link Object}<{@link ve.Component}>|{@link string}, arg1_options:{@link Object}) - Spawns a toast at the current cursor.
 * - {@link ve.Feature.ve.Tooltip|ve.Tooltip}(arg0_components_obj:{@link Object}<{@link ve.Component}>|{@link string}|{@link ve.Component}, arg1_options:{@link Object}) - Spawns a tooltip for the given `.options.element`.
 * - {@link ve.Feature.ve.Window|ve.Window}(arg0_components_obj:{@link Object}<{@link ve.Component}>|{@link string}, arg1_options:{@link Object}) - Default ve.Feature for encapsulating components in <span color = "yellow">{@link ve.Class}</span>.
 * 
 * @class
 * @memberof ve
 * @namespace ve.Feature
 * @type {ve.Feature}
 */
ve.Feature = class {
	//Declare local static variables
	
	/**
	 * @type ve.Feature[]
	 */
	static instances = [];
	
	constructor (arg0_components_obj, arg1_options) {
		//Convert from parameters
		let components_obj = arg0_components_obj;
		let options = (arg1_options) ? arg1_options : {};
		
		//Declare local instance variables
		this.child_class = this.constructor;
		this.child_class_obj = ve[this.child_class.prototype.constructor.name];
		this.class_name = this.constructor.class_name;
		this.id = Class.generateRandomID(ve.Feature);
		this.is_vercengen_feature = true;
		if (typeof components_obj === "function" || typeof components_obj === "string") {
			this.components_obj = {
				html: new ve.HTML(components_obj)
			};
		} else if (components_obj.is_vercengen_component) {
			this.components_obj = {
				component: components_obj
			};
		} else {
			this.components_obj = components_obj;
		}
		this.options = (options) ? options : {};
		
		//Destructure this.components_obj into available variables
		try {
			this.updateOwner();
			Object.iterate(this.components_obj, (local_key, local_value) => {
				if (!this[local_key]) this[local_key] = local_value;
			});
		} catch (e) { console.error(e); }
		ve.Feature.instances.push(this);
	}
	
	/**
	 * Adds components to the present {@link this.element}.
	 * - Method of: {@link ve.Feature}
	 * 
	 * @param {{"<component_key>": ve.Component}} arg0_components_obj
	 */
	addComponents (arg0_components_obj) {
		//Convert from parameters
		let components_obj = (arg0_components_obj) ? arg0_components_obj : {};
		
		//Iterate over all components_obj
		Object.iterate(components_obj, (local_key, local_value) => {
			try {
				//Remove any extant element that already exists
				if (this.components_obj[local_key])
					this.removeComponent(this.components_obj[local_key]);
				
				//Set and destructure new component in this.components_obj
				if (!this[local_key]) this[local_key] = local_value;
				if (this.element)
					this.element.appendChild(local_value.element);
				this.components_obj[local_key] = local_value;
				this.updateOwner();
			} catch (e) { console.error(e); }
		});
		
	}
	
	/**
	 * Alias for {@link remove|this.remove}().
	 * - Method of: {@link ve.Feature}
	 */
	close (arg0_options) {
		this.remove(arg0_options);
	}
	
	/**
	 * Removes the {@link ve.Feature} from its static `.instances` field in addition to unmounting the feature from the DOM.
	 * - Method of: {@link ve.Feature}
	 */
	remove (arg0_options) {
		//Convert from parameters
		let options = (arg0_options) ? arg0_options : {};
		
		//VercengenClass handler
		if (this.options && this.options.class_instance && !options.do_not_close)
			this.options.class_instance.close((this.options.class_instance_type) ? "instance" : "class");
		
		//Iterate over all instances in ve.Feature.instances
		for (let i = 0; i < ve.Feature.instances.length; i++)
			if (ve.Feature.instances[i].id === this.id) {
				ve.Feature.instances.splice(i, 1);
				break;
			}
		
		//Iterate over all instances in ve.Window.instances
		if (this.class_name && ve[this.class_name].instances && this.id)
			for (let i = 0; i < ve[this.class_name].instances.length; i++)
				if (ve[this.class_name].instances[i].id === this.id) {
					ve[this.class_name].instances.splice(i, 1);
					break;
				}
		
		//Reset any child owners if their first owner is this ve.Feature
		if (this.components_obj)
			Object.iterate(this.components_obj, (local_key, local_value) => {
				if (local_value.owner && local_value.owner.is_vercengen_feature)
					if (local_value.owner.id === this.id) {
						//Remove the .owner
						delete local_value.owner;
						
						//Splice .owners to remove the present .owner
						if (local_value.owners.length >= 1)
							local_value.owners.splice(0, 1);
					}
			});
		
		//Remove element
		if (this.element) this.element.remove();
	}
	
	/**
	 * Removes components from the present {@link this.element}.
	 * - Method of: {@link ve.Feature}
	 * 
	 * @param {{"<component_key>": ve.Component}} arg0_components_obj
	 */
	removeComponents (arg0_components_obj) {
		//Convert from parameters
		let components_obj = (arg0_components_obj) ? arg0_components_obj : {};
		
		//Iterate over all components_obj and remove them based on keys
		Object.iterate(components_obj, (local_key, local_value) => {
			try {
				if (local_value) {
					local_value.removeComponent();
					if (local_value.owner && local_value.owner.is_vercengen_feature)
						if (local_value.owner.id === this.id) {
							//Remove the .owner
							delete local_value.owner;
							
							//Splice .owners to remove the present .owner
							if (local_value.owners.length >= 1)
								local_value.owners.splice(0, 1);
						}
				}
				delete this.components_obj[local_key];
			} catch (e) { console.error(e); }
		});
	}
	
	/**
	 * Iterates over all present Vercengen components in {@link ve.Feature} and sets their owner to the current Feature if they do not already have populated `.owner`/`.owners` fields.
	 * - Method of: {@link ve.Feature}
	 */
	updateOwner () {
		//Iterate over all this.components_obj
		if (this.components_obj)
			Object.iterate(this.components_obj, (local_key, local_value) => {
				if (local_value.is_vercengen_component)
					if (!local_value.owner || local_value.owner.is_vercengen_feature)
						this.components_obj[local_key].setOwner(this, [this]);
			});
	}
	
	/**
	 * Runs over all Vercengen features that extend <span color="yellow">{@link ve.Feature}</span> and lints them in addition to declaring `ve[local_key]`() as a functional binding for each.
	 * - Static method of: {@link ve.Feature}
	 * 
	 * Ensures the following properties if `ve.registry.debug_mode=true`:
	 * - Not a duplicate feature
	 */
	static linter () {
		Object.iterate(global.ve, (local_key, local_value) => {
			try {
				if (Object.getPrototypeOf(local_value) === ve.Feature) {
					let local_prefix = `ve.Feature: ve.${local_key}`;
					
					if (!global[`ve${local_key}`]) {
						global[`ve${local_key}`] = function () {
							return new ve[local_key](...arguments);
						};
					} else if (typeof global[`ve${local_key}`] !== "function") {
						console.error(`ve.${local_key} cannot have its functional binding registered, since it is already reserved elsewhere as a non-function. Use Ctrl + F to find where it has been reserved in your codebase.`);
					}
					
					//Append to ve.registry.features
					if (!ve.registry.components[local_key] && !ve.registry.features[local_key]) {
						local_value.class_name = local_key;
						ve.registry.features[local_key] = local_value;
					} else {
						let error_value = (ve.registry.components[local_key]) ?
							ve.registry.components[local_key] : ve.registry.features[local_key];
						
						console.error(`Could not replace with duplicate component. A component/feature with the key: ${local_key} already exists as:`, error_value, "Duplicate registered as", local_value);
					}
				}
			} catch (e) { console.error(e); }
		});
	}
};