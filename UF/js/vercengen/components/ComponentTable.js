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
 *   - `.disable_hide_columns=[]`: {@link Array}<{@link number}> - The indices of columns to disable hiding for.
 *   - `.hide_columns=[]`: {@link Array}<{@link number}>|{@link string} - The indices of columns to hide. If set to 'all', columns are not able to be hidden.
 *   - `.non_sortable_columns`: {@link number} - The indices that shouldn't be sortable.
 *   - `.ondraw`: {@link function}(v:{@link ve.Table})
 *   - `.oncellclick`: {@link function}(v:{@link Array}<{@link any}>, e:{@link Event})
 *   - `.onrowclick`: {@link function}(v:{@link any}, e:{@link Event})
 *   - `.page_sizes=ve.registry.settings.Table.page_sizes`: {@link number[]} - Set by default to [10, 20, 50, 100].
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
    options.disable_hide_columns = (options.disable_hide_columns) ? options.disable_hide_columns : [];
    options.hide_columns = (options.hide_columns) ? options.hide_columns : [];
		options.non_sortable_columns = (options.non_sortable_columns) ? options.non_sortable_columns : [];
		options.page_size = Math.returnSafeNumber(options.page_size, 50);
		options.page_sizes = ve.registry.settings.Table.page_sizes;
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
		//Declare local instance variables
		let current_data = [this.v]; //Wrap 2D Table data into 3D Spreadsheet format
		
		//Initialise ve.Spreadsheet component
		if (!this.spreadsheet_component) {
			// Create the counterpart and link them
			this.spreadsheet_component = new ve.Spreadsheet(current_data, this.options);
			this.spreadsheet_component.table_component = this;
		} else {
			// Sync current data to existing spreadsheet
			this.spreadsheet_component.v = current_data;
			setTimeout(() => this.spreadsheet_component.v = current_data, 1000);
		}
		
		//Swap DOM
		if (this.element.parentNode)
			this.element.replaceWith(this.spreadsheet_component.element);
		
		//Return statement
		return this.spreadsheet_component;
	}
	
	/**
	 * Restores the Table view. If the Spreadsheet is currently active, it syncs the data back from the Spreadsheet before swapping.
	 * - Method of: {@link ve.Spreadsheet}
	 * 
	 * @alias convertToTable
	 * @memberof ve.Component.ve.Table
	 * 
	 * @returns {ve.Table|ve.Component.Table}
	 */
	convertToTable () {
		//If we are coming back from a spreadsheet, sync the data first
		if (this.spreadsheet_component) {
			const spreadsheet_data = this.spreadsheet_component.convertToArray();
			if (spreadsheet_data && spreadsheet_data[0])
				this.v = spreadsheet_data[0];
			
			// Swap DOM back if the spreadsheet is currently visible
			if (this.spreadsheet_component.element.parentNode)
				this.spreadsheet_component.element.replaceWith(this.element);
		}
		
		//Return statement
		return this;
	}
	
	/**
	 * Draws the current component.
	 * - Method of: {@link ve.Table}
	 * 
	 * @alias draw
	 * @memberof ve.Component.ve.draw
	 * 
	 * @returns {ve.Table|undefined}
	 */
	draw () {
    //Declare local instance variables
    let max_pages = Math.ceil(this._rows.length/this.options.page_size);
      if (this.current_page >= max_pages) this.current_page = max_pages - 1;
      if (this.current_page < 0) this.current_page = 0;

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
      //Hidden column handling
      if (this.options.hide_columns.includes(i)) return;

			let local_th_el = document.createElement("th");
				local_th_el.innerHTML = local_text;
				
			//Sortable handling
			if (this.options.sortable && !this.options.non_sortable_columns.includes(i)) {
				local_th_el.style.cursor = "pointer";
				local_th_el.addEventListener("click", () => this.sort(i));
				if (this.options.sort_column === i)
					local_th_el.innerHTML += (this.options.sort_ascending) ? " ▴" : " ▾";
			}
			header_row_el.appendChild(local_th_el);
		});
    if (this.options.hide_columns !== "all")
      header_row_el.addEventListener("contextmenu", () => this.openViewSettings());

		thead_el.appendChild(header_row_el);
		table_el.appendChild(thead_el);
		
		//Render body (paginated)
		let tbody_el = document.createElement("tbody");
		let start_index = this.current_page*this.options.page_size;
		
		let page_data = this._rows.slice(start_index, start_index + this.options.page_size);
		
		page_data.forEach((row_data) => {
			let local_tr_el = document.createElement("tr");
			
			row_data.forEach((cell_data, i) => {
        //Hidden column handling
        if (this.options.hide_columns.includes(i)) return;

				//Push cell
				let local_td_el = document.createElement("td");
					if (cell_data instanceof HTMLElement) {
						local_td_el.appendChild(cell_data);
					} else {
						local_td_el.innerHTML = cell_data;
					}
					
				//oncellclick handler
				if (this.options.oncellclick)
					local_td_el.addEventListener("click", (e) => {
						this.options.oncellclick(cell_data, e);
					});
				
				//Push row
				local_tr_el.appendChild(local_td_el);
			});
			
			//onrowclick handler
			if (this.options.onrowclick)
				local_tr_el.addEventListener("click", (e) => {
					this.options.onrowclick(row_data, e);
				});
			
			tbody_el.appendChild(local_tr_el);
		});
		table_el.appendChild(tbody_el);
		this.element.appendChild(table_el);
		this.drawPages();

    //Handle .ondraw()
    if (this.options.ondraw) this.options.ondraw(this);
	}
	
	/**
	 * Draws the pagination menu at the bottom.
	 * - Method of: {@link ve.Table}
	 * 
	 * @alias drawPages
	 * @memberof ve.Component.ve.Table
	 * 
	 * @returns {ve.Table}
	 */
	drawPages () {
		//Declare local instance variables
		let total_pages = Math.ceil(this._rows.length/this.options.page_size);
		
		//Declare local instance variables
		let current_page_label = document.createElement("span");
			current_page_label.className = "label-current-page";
			current_page_label.style.display = "inline-flex";
			
			let current_page_number = new ve.Number(this.current_page + 1, {
				attributes: {
					size: Math.returnSafeNumber((this.current_page + 1).toString().length, 1) + 1
				},
				name: loc("ve.registry.localisation.Table_page"),
				max: total_pages,
				min: 1,
				onuserchange: (v, e) => {
					this.current_page = v - 1;
					this.draw();
				}
			});
			current_page_number.element.querySelector("input").style.minWidth = "auto";
			current_page_number.bind(current_page_label);
			
			let max_label = new ve.HTML(loc("ve.registry.localisation.Table_page_of_max", String.formatNumber(total_pages)));
			max_label.bind(current_page_label);
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
		
		//Page size handler
		if (this.options.page_sizes) {
			let select_btn = new ve.Select(this.options.page_sizes, {
				name: loc("ve.registry.localisation.Table_max_per_page"),
				selected: this.options.page_size.toString(),
				
				onuserchange: (v) => {
					//Declare local instance variables
					let old_page_size = this.options.page_size;
					let new_page_size = parseInt(v);
					
					let first_item_index = this.current_page*old_page_size;
					
					this.options.page_size = new_page_size;
					this.current_page = Math.floor(first_item_index/new_page_size);
					this.draw();
				}
			});
			
			select_btn.bind(nav_el);
		}
		
		this.element.appendChild(nav_el);
	}
	
	/**
	 * Returns the current view state of the component.
	 * - Method of: {@link ve.Table}
	 * 
	 * @alias getViewState
	 * @memberof ve.Component.ve.Table
	 * 
	 * @returns {{current_page: number, items_per_page: number, sort_ascending: boolean, sort_column: number|undefined}}
	 */
	getViewState () {
		//Return statement
		return {
			current_page: this.current_page,
      hide_columns: this.options.hide_columns,
			items_per_page: this.options.page_size,
			sort_ascending: this.options.sort_ascending,
			sort_column: this.options.sort_column
		};
	}

  /**
   * Opens the view settings tab for the component.
   * - Method of: {@link ve.Table}
   * 
   * @alias openViewSettings
   * @memberof ve.Component.ve.Table
   */
  openViewSettings () {
    //Declare local instance variables
    let checkbox_components_obj = {};

    //Iterate over all this._headers
    for (let i = 0; i < this._headers.length; i++) {
      if (this.options.disable_hide_columns.includes(i)) continue; //Internal guard clause for disable_hide_columns

      let is_shown = (!this.options.hide_columns.includes(i));

      checkbox_components_obj[i] = new ve.Checkbox(is_shown, {
        name: this._headers[i],
        onuserchange: (v) => {
          //Hide is opposite of shown
          if (v === false) {
            if (!this.options.hide_columns.includes(i))
              this.options.hide_columns.push(i);
          } else {
            //Iterate over this.options.hide_columns and splice it
            for (let x = this.options.hide_columns.length - 1; x >= 0; x--)
              if (this.options.hide_columns[x] === i)
                this.options.hide_columns.splice(x, 1);
          }

          //Draw call
          this.draw();
        }
      });
    }

    let local_context_menu = new ve.ContextMenu({
      view_header: new ve.HTML(`<b>Show Columns:</b><br><br>`, { x: 0, y: 0 }),
      ...checkbox_components_obj
    }, {
      id: "table_view_columns"
    });
  }
	
	/**
	 * Sets the view state from an existing view object.
	 * 
	 * @param {Object} arg0_view_obj
	 */
	setViewState (arg0_view_obj) {
		//Convert from parameters
		let view_obj = (arg0_view_obj) ? arg0_view_obj : {};
		
		//Set options and render
		if (view_obj.current_page !== undefined) this.current_page = view_obj.current_page;
    if (view_obj.hide_columns !== undefined) this.options.hide_columns = view_obj.hide_columns;
		if (view_obj.items_per_page !== undefined) this.options.page_size = view_obj.items_per_page;
		if (view_obj.sort_column !== undefined) {
			if (view_obj.sort_ascending !== undefined) this.options.sort_ascending = view_obj.sort_ascending;
			this.sort(view_obj.sort_column, { do_not_change_sort_order: true });
		} else {
			this.draw();
		}
	}
	
	/**
	 * Sorts the current Table component and calls this.draw(). If the value is an HTMLElement with attribute 'data-value', it will use that to sort instead of innerHTML.
	 * - Method of: {@link ve.Table}
	 * 
	 * @alias sort
	 * @memberof ve.Component.ve.Table
	 * 
	 * @param {number} [arg0_index]
	 * @param {Object} [arg1_options]
	 *  @param {boolean} [arg1_options.do_not_change_sort_order=false]
	 */
	sort (arg0_index, arg1_options) {
		//Convert from parameters
		let index = Math.returnSafeNumber(arg0_index);
		let options = (arg1_options) ? arg1_options : {};
		
		if (!this.options.sortable || this.options.non_sortable_columns.includes(index)) 
			return; //Internal guard clause if table is not sortable
		
		//Declare local instance variables
    let getSortValue = (local_value) => {
      //Declare local instance variables
      let sort_value = local_value;

      if (local_value instanceof HTMLElement) {
        let data_value = local_value.getAttribute("data-value");

        if (data_value) {
          sort_value = data_value;
        } else {
          sort_value = local_value.innerHTML;
        }
      }

      //Return statement
      return sort_value;
    };

		if (this.options.sort_column === index) {
			if (!options.do_not_change_sort_order)
				this.options.sort_ascending = (!this.options.sort_ascending);
		} else {
			this.options.sort_column = index;
			
			if (!options.do_not_change_sort_order)
				this.options.sort_ascending = true;
		}
		
		//Sort rows
		this._rows.sort((a, b) => {
			let a_value = getSortValue(a[index]);
			let b_value = getSortValue(b[index]);
			
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