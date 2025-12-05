/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 * 
 * Hierarchy datatype used as a nested draggable item/group for {@link ve.Hierarchy}. Item by default.
 * - Functional binding: <span color=00ffff>veHierarchyDatatype</span>().
 * 
 * [WIP] - This section, especially with `.oncollapse` and `.instance.is_collapsed`:{@link boolean} reflection is scheduled to be reworked in future updates.
 *  
 * ##### Constructor:
 * - `arg0_value`: {@link Object}<{@link ve.Component}>
 * - `arg1_options`: {@link Object}
 *   - `.disabled=false`: {@link boolean} - Whether the item is draggable within the hierarchy.
 *   - `.id`: {@link string}
 *   - `.name_options`: {@link Object} - Any options that should be carried over to `.components_obj.name`. Same options as {@link ve.Text}.
 *   - `.no_folders=false`: {@link boolean} - Whether minimising/maximising individual folders should be allowed.
 *   - `.type="item"`: {@link string} - Either 'group'/'item'.
 * 
 * ##### Instance:
 * - `.components_obj`: {@link Object}<{@link ve.Component}>
 * - `.instance`: {@link any} - The bound object which this HierarchyDatatype is visualising.
 * - `.is_vercengen_hierarchy_datatype=true`: {@link boolean}
 * - `.name`; {@link string} - Accessor. Differs from {@link ve.Component.name} in that it is a {@link ve.Text}.v value instead of a span element.
 * - `.oncollapse`: {@link function}(v:{@link boolean}, e:{@link ve.HierarchyDatatype}) - Fires upon a user toggling the collapse button.
 * - `.type="item"`: {@link string} - Determined by `.options.type`.
 * - `.v`: {@link Object}<{@link ve.Component}> - Accessor. Same as `.components_obj`.
 * 
 * ##### Methods:
 * - <span color=00ffff>{@link ve.HierarchyDatatype.refresh|refresh}</span>() - Refreshes the display of the current datatype.
 * 
 * ##### Static Fields:
 * - `.instances`: {@link Array}<this:{@link ve.HierarchyDatatype}>
 *
 * @augments ve.Component
 * @memberof ve.Component
 * @type {ve.HierarchyDatatype}
 */
ve.HierarchyDatatype = class extends ve.Component {
	/*static demo_value = {
		name: veText(`Entry #${Math.randomNumber(0, 1000000)}`),
		context_menu_button: veButton((e) => {
			console.log(e);
		}, { name: "Options"})
	};*/
	
	/**
	 * Contains a list of all instances of {@link ve.HierarchyDatatype}s.
	 * @type ve.HierarchyDatatype[]
	 */
	static instances = [];
	
	constructor (arg0_components_obj, arg1_options) {
		//Convert from parameters
		let components_obj = (arg0_components_obj) ? arg0_components_obj : {};
		let options = (arg1_options) ? arg1_options : {};
			super(options);
		
		//Initialise options
		options.attributes = (options.attributes) ? options.attributes : {};
		options.type = (options.type) ? options.type : "item"; //Either 'item'/'group'
		
		//Declare local instance variables
		this.id = (options.id) ? options.id : Class.generateRandomID(ve.HierarchyDatatype);
		
		this.element = document.createElement("li");
			this.element.classList.add(options.type, "nst-item");
			if (options.disabled === true)
				this.element.setAttribute("data-nestable-disabled", "dragging");
			if (options.type === "item" && !options.disabled)
				this.element.setAttribute("data-nestable-disabled", "nesting");
			this.element.setAttribute("component", "ve-hierarchy-datatype");
			Object.iterate(options.attributes, (local_key, local_value) => {
				this.element.setAttribute(local_key, local_value.toString());
			});
			this.element.id = this.id;
			this.element.instance = this;
		this.is_vercengen_hierarchy_datatype = true;
		this.options = options;
		this.type = options.type;
		
		//Append components_obj elements to this.element
		this.components_obj = components_obj;
		this.refresh();
		if (options.name) this.name = options.name;
		ve.HierarchyDatatype.instances.push(this);
	}
	
	/**
	 * Returns the present name value of the hierarchy datatype.
	 * - Accessor of {@link ve.HierarchyDatatype}
	 *
	 * @alias name
	 * @memberof ve.Component.ve.HierarchyDatatype
	 * @type {string}
	 */
	get name () {
		//Return statement
		return (this.components_obj.name) ? this.components_obj.name.v : "";
	}
	
	/**
	 * Sets the new name of the hierarchy datatype.
	 * - Accessor of {@link ve.HierarchyDatatype}
	 *
	 * @alias name
	 * @memberof ve.Component.ve.HierarchyDatatype
	 * @param arg0_value {string}
	 */
	set name (arg0_value) {
		//Convert from parameters
		let value = arg0_value;
		
		//Set name
		if (this.components_obj.name) {
			this.components_obj.name.v = value;
		} else {
			this.components_obj.name = new ve.Text(value, { 
				disabled: this.options.disabled,
				...this.options.name_options
			});
			this.v = this.components_obj;
		}
	}
	
	/**
	 * Returns the current {@link this.components_obj}, which contains the actions bar.
	 * - Accessor of {@link ve.HierarchyDatatype}
	 *
	 * @alias v
	 * @memberof ve.Component.ve.HierarchyDatatype
	 * @type {{"<component_key>": ve.Component}}
	 * 
	 * @returns {{"<component_key>": ve.Component}}
	 */
	get v () {
		//Return statement
		return this.components_obj;
	}
	
	/**
	 * Sets a new {@link this.components_obj}, which contains the actions bar.
	 * - Accessor of {@link ve.HierarchyDatatype}
	 *
	 * @alias v
	 * @memberof ve.Component.ve.HierarchyDatatype
	 * @type {{"<component_key>": ve.Component}}
	 * 
	 * @param {{"<component_key>": ve.Component}} arg0_components_obj
	 */
	set v (arg0_components_obj) {
		//Convert from parameters
		let components_obj = arg0_components_obj;
		
		//Reset this.components_obj
		this.components_obj = components_obj;
		this.refresh();
		this.fireFromBinding();
	}
	
	/**
	 * Refreshes the display of this.components_obj within the present instance.
	 * - Method of: {@link ve.HierarchyDatatype}
	 * 
	 * @alias refresh
	 * @memberof ve.Component.ve.HierarchyDatatype
	 * 
	 * @typedef ve.HierarchyDatatype.refresh
	 */
	refresh () {
		//Declare local instance variables
		let has_subitems = false;
		
		//0. Append .nst-handle, .nst-button element
		this.element.innerHTML = [
			`<div class = "nst-handle">⋯</div>`,
			(this.type === "group" && this.options.no_folders !== true) ? `<button class = "nst-button" type = "button">${(this.options.is_collapsed) ? "+" : "-"}</button>` : ""
		].join("");
		
		//1. Append regular components first as group components
		Object.iterate(this.components_obj, (local_key, local_value) => {
			if (!local_value.is_vercengen_hierarchy_datatype) {
				this.element.appendChild(local_value.element);
			} else {
				has_subitems = true;
			}
		});
		
		//2. Append ol components if .is_group resolves to true
		if (has_subitems && this.type === "group") {
			let ol_el = document.createElement("ol");
				ol_el.id = this.id;
			
			//Iterate over all this.components_obj and append the sublist at the end
			Object.iterate(this.components_obj, (local_key, local_value) => {
				if (local_value.is_vercengen_hierarchy_datatype)
					ol_el.appendChild(local_value.element);
			});
			this.element.appendChild(ol_el);
		}
		
		//3. Check if folder is meant to be collapsed
		let button_el = this.element.querySelector(`.nst-button`);
		if (button_el) button_el.onclick = () => {
			this.options.is_collapsed = this.element.classList.contains("nst-collapsed");
			if (this.options.instance) this.options.instance.is_collapsed = this.options.is_collapsed;
			if (this.options.oncollapse) this.options.oncollapse(this.options.is_collapsed, this);
		};
		if (this.options.is_collapsed === true)
			this.element.classList.add("nst-collapsed");
	}
};

//Functional binding

/**
 * @returns {ve.HierarchyDatatype}
 */
veHierarchyDatatype = function () {
	//Return statement
	return new ve.HierarchyDatatype(...arguments);
};