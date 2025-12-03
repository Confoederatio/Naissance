/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 * 
 * Interface used for encapsulating other {@link ve.Component}s in a grid-like formatting pattern. Recursive.
 * - Functional binding: <span color=00ffff>veInterface</span>().
 * 
 * ##### Constructor:
 * - `arg0_components_obj`: {@link Object}<{@link ve.Component}>
 * - `arg1_options`: {@link Object}
 *   - `.is_folder=false`: {@link boolean}
 *   - `.open=false`: {@link boolean}
 * 
 * ##### Instance:
 * - `<component_key>`: {@link ve.Component} - Automatic destructuring for component_key.
 * - `.components_obj`: {@link Object}<{@link ve.Component}> - Internal private field for `.v`.
 * - `.dimensions=[0,0]`: {@link Array}<{@link number}, {@link number}>
 *   `.reserved_keys`: {@link Array}<{@link string}> - Controls what keys are reserved and cannot be destructured.
 * - `.v`: {@link Object}<{@link ve.Component}>
 * 
 * ##### Methods:
 * - <span color=00ffff>{@link ve.Interface.addComponent|addComponent}</span>(arg0_component_key:{@link string}, arg1_component_obj:{@link ve.Component})
 * - <span color=00ffff>{@link ve.Interface.redraw|redraw}</span>() - Recalculates coordinates before calling {@link ve.Interface.refresh|this.refresh}().
 * - <span color=00ffff>{@link ve.Interface.refresh|refresh}</span>() - Redraws the present interface without recalculating coordinates.
 * - <span color=00ffff>{@link ve.Interface.removeComponent|removeComponent}</span>(arg0_component_obj:{@link ve.Component})
 * - <span color=00ffff>{@link ve.Interface.resize|resize}</span>(arg0_width:{@link number}, arg1_height:{@link number})
 * 
 * ##### Static Methods:
 * - <span color=00ffff>{@link ve.Interface.assignComponentCoordinates|assignComponentCoordinates}</span>(arg0_components_obj:{@link Object}<{@link ve.Component}>)
 * - <span color=00ffff>{@link ve.Interface.getDefinedComponentDimensions|getDefinedComponentDimensions}</span>(arg0_components_obj:{@link Object}<{@link ve.Component}>)
 * 
 * @augments ve.Component
 * @augments {@link ve.Component}
 * @memberof ve.Component
 * @type {ve.Interface}
 */
ve.Interface = class extends ve.Component {
	static demo_value = {
		submenu_html: new ve.HTML("This is hidden HTML.")
	};
	
	constructor (arg0_components_obj, arg1_options) {
		//Convert from parameters
		let components_obj = (arg0_components_obj) ? arg0_components_obj : {};
		let options = (arg1_options) ? arg1_options : {};
			super(options);
			
		//Initialise options
		if (options.is_folder !== false) options.is_folder = true;
		
		//Declare local instance variables
		let attributes = {
			open: options.open,
			...options.attributes
		};
		
		this.components_obj = components_obj;
		this.dimensions = [0, 0]; //Populate this.dimensions to [width, height];
		this.element = document.createElement("div");
			this.element.setAttribute("component", "ve-interface");
			this.element.instance = this;
			
		this.options = options;
			
		let html_string = [];
		if (options.is_folder) {
			html_string.push(`<details class = "ve interface-folder"${HTML.objectToAttributes(attributes)}>`);
			html_string.push(`<summary id = "name"></summary>`);
		}
			html_string.push(`<table></table>`);
		if (options.is_folder)
			html_string.push(`</details>`);
		
		this.element.innerHTML = html_string.join("");
		
		//KEEP AT BOTTOM!
		this.name = (options.name) ? options.name : "Folder";
		this.reserved_keys = Object.keys(this).concat(["reserved_keys", "v"]);
		this.v = components_obj;
	}
	
	/**
	 * Returns the  `this.components_obj` variable of the present Component.
	 * - Accessor of: {@link ve.Interface}
	 * 
	 * @returns {{"<component_key>": ve.Component}}
	 */
	get v () {
		//Return statement
		return this.components_obj;
	}
	
	/**
	 * Sets a new `this.components_obj` variable for the present Component and redraws the interface.
	 * - Accessor of: {@link ve.Interface}
	 * 
	 * @param {{"<component_key>": ve.Component}} arg0_components_obj
	 */
	set v (arg0_components_obj) { //[WIP] - Work on destructuring bindings
		//Convert from parameters
		let components_obj = arg0_components_obj;
		
		//Set this.components_obj; invoke this.redraw()
		//1. Reset old destructured bindings for components_obj by deleting their addresses
		Object.iterate(this.components_obj, (local_key, local_value) => {
			if (!this.reserved_keys.includes(local_key)) delete this[local_key];
			if (this.components_obj[local_key])
				this.removeComponent(this.components_obj[local_key]);
		});
		
		this.components_obj = components_obj;
		//2. Set new destructured bindings for components_obj by deleting their addresses
		Object.iterate(components_obj, (local_key, local_value) => {
			if (!this.reserved_keys.includes(local_key)) {
				if (
					(local_value.name === undefined || local_value.name.length === 0) &&
					(local_value.options.name === undefined || local_value.options.name.length === 0) &&
					ve.registry.settings.automatic_naming
				)
					local_value.name = local_key;
				this[local_key] = local_value;
			} else {
				console.warn(`ve.Interface: ${local_key} is a reserved key. It can therefore not be set to:`, local_value);
			}
		})
		this.redraw();
		if (this.options.onchange) this.options.onchange(this.value);
	}
	
	/**
	 * Adds a new component and destructures it to the present component before redrawing the ve.Interface.
	 * - Method of: {@link ve.Interface}
	 * 
	 * @param {string} arg0_component_key
	 * @param {ve.Component} arg1_component_obj
	 */
	addComponent (arg0_component_key, arg1_component_obj) {
		//Convert from parameters
		let component_key = arg0_component_key;
		let component_obj = arg1_component_obj;
		
		//Assign x, y coordinates to component_obj
		this.components_obj[component_key] = component_obj;
		this.redraw();
	}
	
	/**
	 * Redraws the entire UI for {@link ve.Interface}, including refreshing individual table cells.
	 * - Method of: {@link ve.Interface}
	 */
	redraw () {
		//Reset this.element.querySelector("table")
		this.element.querySelector("table").innerHTML = "";
		
		this.components_obj = ve.Interface.assignComponentCoordinates(this.components_obj);
		this.dimensions = ve.Interface.getDefinedComponentDimensions(this.components_obj);
		this.resize(this.dimensions[0] + 1, this.dimensions[1] + 1);
		
		//Populate x-y with individual Vercengen components in mutated components_obj
		this.refresh();
	}
	
	/**
	 * Refreshes the current UI without recalculating coordinates.
	 * - Method of: {@link ve.Interface}
	 */
	refresh () {
		//Iterate over all extant this.components_obj and remove all their elements
		Object.iterate(this.components_obj, (local_key, local_value) => {
			try {
				if (local_value.element.parentElement)
					local_value.element.parentElement.removeChild(local_value.element);
			} catch (e) { console.error(e); }
		});
		
		//Iterate over all this.components_obj and re-append them. This way components can share same coordinates
		Object.iterate(this.components_obj, (local_key, local_value) => {
			try {
				if (local_value.is_vercengen_component) {
					let all_candidate_cell_els = this.element.querySelectorAll(`table td[id="${local_value.x}-${local_value.y}"]`);
					let target_cell_el = all_candidate_cell_els[all_candidate_cell_els.length - 1];
					
					//Parse height, width
					if (local_value.height !== undefined) {
						target_cell_el.setAttribute("rowspan", local_value.height);
					} else {
						target_cell_el.removeAttribute("rowspan");
					}
					if (local_value.width !== undefined) {
						target_cell_el.setAttribute("colspan", local_value.width);
					} else {
						target_cell_el.removeAttribute("colspan");
					}
					
					//Set inner cell contents
					target_cell_el.appendChild(local_value.element);
				}
			} catch (e) { console.error(e); }
		});
	}
	
	/**
	 * Removes a component mounted to the current interface.
	 * - Method of: {@link ve.Interface}
	 * 
	 * @param {ve.Component} arg0_component_obj
	 */
	removeComponent (arg0_component_obj) {
		//Convert from parameters
		let component_obj = arg0_component_obj;
		
		//Remove component_obj, refresh this ve.Interface
		if (component_obj.element)
			if (component_obj.element.parentElement)
				component_obj.element.parentElement.removeChild(component_obj.element);
	}
	
	/**
	 * Resizes the `.dimensions` of the present interface component.
	 * 
	 * @param {number} arg0_width
	 * @param {number} arg1_height
	 */
	resize (arg0_width, arg1_height) {
		//Convert from parameters
		let width = parseInt(arg0_width);
		let height = parseInt(arg1_height);
		
		//Declare local instance variables
		let table_el = this.element.querySelector("table");
		
		//Adjust height
		{
			//1. Add missing rows
			let current_height = table_el.rows.length;
			
			//Iterate over height to insert missing rows
			for (let i = current_height; i < height; i++) {
				let local_row = table_el.insertRow();
				
				//Iterate over width to populate the given row
				for (let x = 0; x < width; x++)
					local_row.insertCell();
			}
			
			//2. Remove extra rows
			for (let i = table_el.rows.length - 1; i >= height; i--)
				table_el.deleteRow(i);
		}
		
		//Adjust width
		{
			//1. Add missing columns
			let current_height = Math.min(height, table_el.rows.length); //Bound current_height so that we never go out of bounds
			
			for (let i = 0; i < current_height; i++) {
				let local_row = table_el.rows[i];
				
				let current_width = local_row.cells.length;
				
				for (let x = current_width; x < width; x++)
					local_row.insertCell();
				
				//2. Remove missing columns
				for (let x = current_width - 1; x >= width; x--)
					table_el.deleteCell(x);
			}
		}
		
		//Assign x, y IDs to each cell
		for (let i = 0; i < table_el.rows.length; i++)
			for (let x = 0; x < table_el.rows[i].cells.length; x++)
				table_el.rows[i].cells[x].id = `${x}-${i}`;
	}
	
	/**
	 * Iterates over all components and assigns their coordinates.
	 * - Static method of: {@link ve.Interface}
	 * 
	 * @param {Object} arg0_components_obj
	 */
	static assignComponentCoordinates (arg0_components_obj) {
		//Convert from parameters
		let components_obj = arg0_components_obj;
		
		//Declare local instance variables
		let defined_dimensions = ve.Interface.getDefinedComponentDimensions(components_obj);
		
		//2. Append undefined coordinates vertically to their relevant X or Y axis, depending on which is defined. Vertical stacking with X = 0 defined by default
		Object.iterate(components_obj, (local_key, local_value) => {
			try {
				if (local_value.is_vercengen_component) {
					let has_x = (typeof local_value.x === "number");
					let has_y = (typeof local_value.y === "number");
					
					if (has_x && has_y) return;
					
					if (!has_x && has_y) {
						defined_dimensions[0]++;
						local_value.x = defined_dimensions[0];
					} else if (has_x && !has_y) {
						defined_dimensions[1]++;
						local_value.y = defined_dimensions[1];
					} else {
						local_value.x = 0;
						
						defined_dimensions[1]++;
						local_value.y = defined_dimensions[1];
					}
				}
			} catch (e) { console.error(e); }
		});
		
		//Return statement
		return components_obj;
	}
	
	/**
	 * Returns the current `.dimensions` [width, height] of defined components prior to assigning coordinates to non-defined coordinates.
	 * 
	 * @param {{"<component_key>": ve.Component}} arg0_components_obj
	 * 
	 * @returns {number[]}
	 */
	static getDefinedComponentDimensions (arg0_components_obj) {
		//Convert from parameters
		let components_obj = arg0_components_obj;
		
		//Declare local instance variables
		let defined_dimensions = [0, 0];
		
		//Fetch defined dimensions [width, height] by iterating over components_obj
		Object.iterate(components_obj, (local_key, local_value) => {
			try {
				if (local_value.is_vercengen_component)
					if (typeof local_value.x === "number" && typeof local_value.y === "number") {
						defined_dimensions[0] = Math.max(defined_dimensions[0], local_value.x);
						defined_dimensions[1] = Math.max(defined_dimensions[1], local_value.y);
					}
			} catch (e) { console.error(e); }
		});
		
		//Return statement
		return defined_dimensions;
	}
};

//Functional binding

/**
 * @returns {ve.Interface}
 */
veInterface = function () {
	//Return statement
	return new ve.Interface(...arguments);
};