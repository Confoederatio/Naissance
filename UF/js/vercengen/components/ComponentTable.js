/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 * 
 * Table that be converted to and from {@link ve.Spreadsheet} and back. Only takes in a 2D array list. Any edits in spreadsheet mode will be converted back to the view-only mode if possible.
 * - Functional binding: <span color=00ffff>veTable</span>().
 * 
 * ##### Constructor:
 * - `arg0_value`: {@link Array}<{@link Array}<{@link any}>> 
 *   - Nested arrays: [n1] - Sheet, [n2] - Row
 * - `arg1_options`: {@link Object}
 *   - `.page_size=50`: {@link number}
 *   - `.sortable=true`: {@link boolean}
 *   - `.sort_ascending=true`: {@link boolean}
 *   - `.sort_column`: {@link number} - Which column should have its sort indicator active. 0-indexed.
 *   - `.dark_mode=false`: {@link boolean} - Whether the spreadsheet editor should launch in dark mode.
 *   
 * ##### Instance:
 * - `.v`: {@link Array}<{@link Array}<{@link any}>>
 *   
 * ##### Methods:
 * - <span color=00ffff>{@link ve.Table.convertToSpreadsheet|convertToSpreadsheet}</span>() | {@link ve.Spreadsheet}
 * - <span color=00ffff>{@link ve.Table.convertToTable|convertToTable}</span>() | {@link ve.Table}
 * - <span color=00ffff>{@link ve.Table.draw|draw}</span>()
 * - <span color=00ffff>{@link ve.Table.drawPages|drawPages}</span>()
 * - <span color=00ffff>{@link ve.Table.sort|sort}<span>(arg0_index:{@link number})
 * 
 * @augments ve.Component
 * @memberof ve.Component
 * @type {ve.Table}
 */
ve.Table = class extends ve.Component {
	static demo_value = [
		["ID", "Name", "Score"], //First row is header
		[1, "Alice", 85],
		[2, "Bob", 92],
		[3, "Charlie", 78],
		[4, "David", 95],
		[5, "Eve", 88],
		[6, "Frank", 70]
	];
	
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = (arg0_value) ? arg0_value : {};
		let options = (arg1_options) ? arg1_options : {};
			super(options);
		
		//Initialise options
		options.attributes = (options.attributes) ? options.attributes : {};
		options.page_size = Math.returnSafeNumber(options.page_size, 50);
		options.sortable = (options.sortable !== undefined) ? options.sortable : true;
		options.sort_ascending = (options.sort_ascending !== undefined) ? 
			options.sort_ascending : true;
		options.sort_column = (options.sort_column !== undefined) ? 
			options.sort_column : null;
			
		//Declare local instance variables
		this.element = document.createElement("div");
			this.element.setAttribute("component", "ve-table");
			this.element.instance = this;
			HTML.setAttributesObject(this.element, options.attributes);
		this.options = options;
		
		this._data = []; //Full 2D array
		this._headers = [];
		this._rows = [];
		this.current_page = 0;
		
		this.from_binding_fire_silently = true;
		this.v = value;
		delete this.from_binding_fire_silently;
	}
	
	/**
	 * Returns a 2D array of current values.
	 * - Accessor of: {@link ve.Table}
	 * 
	 * @alias v
	 * @memberof ve.Component.ve.Table
	 * @type {Array.<any[]>}
	 */
	get v () {
		//Return statement
		return [this._headers, ...this._rows];
	}
	
	/**
	 * Sets the current component value given a 2D dataframe. The first row refers to the header.
	 * - Accessor of: {@link ve.Table}
	 * 
	 * @param {Array.<any[]>} arg0_value
	 */
	set v (arg0_value) {
		//Convert from parameters
		let value = arg0_value;
		
		//Parse value
		if (!Array.isArray(value) || value.length === 0) {
			this._headers = [];
			this._rows = [];
		} else {
			//First row is headers, remaining are data
			[this._headers, ...this._rows] = value;
		}
		this.current_page = 0;
		this.options.sort_column = null;
		this.draw();
	}
	
	/**
	 * Switches the view to the bound Spreadsheet. If no Spreadsheet exists, creates one.
	 * - Method of: {@link ve.Table}
	 * 
	 * @alias convertToSpreadsheet
	 * @memberof ve.Component.ve.Table
	 * 
	 * @returns {ve.Spreadsheet}
	 */
	convertToSpreadsheet () {
		const current_data = [this.v]; // Wrap 2D Table data into 3D Spreadsheet format
		
		if (!this.spreadsheet_component) {
			// Create the counterpart and link them
			this.spreadsheet_component = new ve.Spreadsheet(current_data, this.options);
			this.spreadsheet_component.table_component = this;
		} else {
			// Sync current data to existing spreadsheet
			this.spreadsheet_component.v = current_data;
			setTimeout(() => this.spreadsheet_component.v = current_data, 1000);
		}
		
		// Swap DOM
		if (this.element.parentNode)
			this.element.replaceWith(this.spreadsheet_component.element);
		
		return this.spreadsheet_component;
	}
	
	/**
	 * Restores the Table view. If the Spreadsheet is currently active, it syncs the data back from the Spreadsheet before swapping.
	 * - Method of: {@link ve.Spreadsheet}
	 * 
	 * @alias convertToTable
	 * @memberof ve.Component.ve.Table
	 * 
	 * @returns {ve.Table}
	 */
	convertToTable () {
		// If we are coming back from a spreadsheet, sync the data first
		if (this.spreadsheet_component) {
			const spreadsheet_data = this.spreadsheet_component.convertToArray();
			if (spreadsheet_data && spreadsheet_data[0])
				this.v = spreadsheet_data[0];
			
			// Swap DOM back if the spreadsheet is currently visible
			if (this.spreadsheet_component.element.parentNode)
				this.spreadsheet_component.element.replaceWith(this.element);
		}
		return this;
	}
	
	/**
	 * Draws the current component.
	 * - Method of: {@link ve.Table}
	 * 
	 * @alias draw
	 * @memberof ve.Component.ve.draw
	 * 
	 * @returns {ve.Table}
	 */
	draw () {
		//Clear .innerHTML
		this.element.innerHTML = "";
		
		//Internal guard clause if this._headers is empty
		if (this._headers.length === 0) {
			this.element.innerHTML = `<p>${loc("ve.registry.localisation.Table_no_data")}</p>`;
			return;
		}
		
		//Declare local instance variables
		let table_el = document.createElement("table");
		let thead_el = document.createElement("thead");
		
		let header_row_el = document.createElement("tr");
		
		//Render header
		this._headers.forEach((local_text, i) => {
			let local_th_el = document.createElement("th");
				local_th_el.innerHTML = local_text;
				
			//Sortable handling
			if (this.options.sortable) {
				local_th_el.style.cursor = "pointer";
				local_th_el.addEventListener("click", () => this.sort(i));
				if (this.options.sort_column === i)
					local_th_el.innerHTML += (this.options.sort_ascending) ? " ▴" : " ▾";
			}
			header_row_el.appendChild(local_th_el);
		});
		thead_el.appendChild(header_row_el);
		table_el.appendChild(thead_el);
		
		//Render body (paginated)
		let tbody_el = document.createElement("tbody");
		let start_index = this.current_page*this.options.page_size;
		
		let page_data = this._rows.slice(start_index, start_index + this.options.page_size);
		
		page_data.forEach((row_data) => {
			let local_tr_el = document.createElement("tr");
			
			row_data.forEach((cell_data) => {
				let local_td_el = document.createElement("td");
					local_td_el.innerHTML = cell_data;
				local_tr_el.appendChild(local_td_el);
			});
			tbody_el.appendChild(local_tr_el);
		});
		table_el.appendChild(tbody_el);
		this.element.appendChild(table_el);
		this.drawPages();
	}
	
	/**
	 * Draws the pagination menu at the bottom.
	 * - Method of: {@link ve.Table}
	 * 
	 * @alias drawPages
	 * @memberof ve.Component.ve.drawPages
	 * 
	 * @returns {ve.Table}
	 */
	drawPages () {
		//Declare local instance variables
		let total_pages = Math.ceil(this._rows.length/this.options.page_size);
		
		if (total_pages <= 1) return; //Internal guard clause if there is only one page
		
		//Declare local instance variables
		let current_page_label = document.createElement("span");
			current_page_label.className = "label-current-page";
			current_page_label.innerHTML = loc("ve.registry.localisation.Table_pagination_info", String.formatNumber(this.current_page + 1), String.formatNumber(total_pages));
		let nav_el = document.createElement("div");
			nav_el.className = "pagination-controls";
			nav_el.style.marginTop = "var(--cell-padding)";
		let next_btn = new ve.Button(() => {
			this.current_page++;
			this.draw();
		}, {
			attributes: {
				[(this.current_page >= total_pages + 1) ? "disabled" : "enabled"]: true,
				id: "next-button"
			},
			name: loc("ve.registry.localisation.Table_next")
		});
		let prev_btn = new ve.Button(() => {
			this.current_page--;
			this.draw();
		}, {
			attributes: {
				[(this.current_page === 0) ? "disabled" : "enabled"]: true,
				id: "previous-button"
			},
			name: loc("ve.registry.localisation.Table_previous")
		});
		
		prev_btn.bind(nav_el);
		nav_el.appendChild(current_page_label);
		next_btn.bind(nav_el);
		this.element.appendChild(nav_el);
	}
	
	/**
	 * Sorts the current Table component and calls this.draw().
	 * - Method of: {@link ve.Table}
	 * 
	 * @alias sort
	 * @memberof ve.Component.ve.sort
	 * 
	 * @param {number} arg0_index
	 */
	sort (arg0_index) {
		//Convert from parameters
		let index = Math.returnSafeNumber(arg0_index);
		
		if (!this.options.sortable) return; //Internal guard clause if table is not sortable
		
		//Declare local instance variables
		if (this.options.sort_column === index) {
			this.options.sort_ascending = (!this.options.sort_ascending);
		} else {
			this.options.sort_column = index;
			this.options.sort_ascending = true;
		}
		
		//Sort rows
		this._rows.sort((a, b) => {
			let a_value = a[index];
			let b_value = b[index];
			
			//Attempt numeric sort if possible
			let a_number = parseFloat(a_value);
			let b_number = parseFloat(b_value);
			
			if (!isNaN(a_number) && !isNaN(b_number)) {
				a_value = a_number;
				b_value = b_number;
			}
			
			//Return statement
			if (a_value < b_value) return (this.options.sort_ascending) ? -1 : 1;
			if (a_value > b_value) return (this.options.sort_ascending) ? 1 : -1;
			return 0;
		});
		this.draw();
	}
};

//Functional binding

/**
 * {@returns ve.Table}
 */
veTable = function () {
	//Return statement
	return new ve.Table(...arguments);
};