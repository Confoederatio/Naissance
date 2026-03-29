/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 *
 * Spreadsheet editor that returns a 2D array list/object using iframes for encapsulation. Excel/Google Sheets/HTML compatible with formulas and limited styling options. Note that there might be a slight initialisation delay due to lazy-loading.
 *
 * The reason this does not always serialise to an {@link Array} is so that formulas and format data can be preserved.
 * - Functional binding: <span color=00ffff>veSpreadsheet</span>().
 *
 * ##### Constructor:
 * - `arg0_value`: {@link Array}<{@link Array}<{@link Array}<{@link any}>>>|{@link Object}
 *   - Nested arrays: [n1] - Container, [n2] - Sheet, [n3] - Row
 * - `arg1_options`: {@link Object}
 *   - `.dark_mode=false`: {@link boolean} - Whether the spreadsheet editor should launch in dark mode.
 *
 * ##### Instance:
 * - `.v`: {@link Object}
 *
 * ##### Methods:
 * - <span color=00ffff>{@link ve.Spreadsheet.convertToArray|convertToArray}</span>() | {@link Array}<{@link Array}<{@link Array}<{@link any}>>>
 * - <span color=00ffff>{@link ve.Spreadsheet.convertToSpreadsheet|convertToSpreadsheet}</span>() | {@link ve.Spreadsheet}
 * - <span color=00ffff>{@link ve.Spreadsheet.convertToTable|convertToTable}</span>() | {@link ve.Table}
 * - <span color=00ffff>{@link ve.Spreadsheet.fromArray|fromArray}</span>(arg0_array:{@link Array}<{@link Array}<{@link Array}<{@link any}>>>, arg1_do_not_display=false:{@link boolean}) | {@link Object}
 * - <span color=00ffff>{@link ve.Spreadsheet.fromJSON|fromJSON}</span>(arg0_json:{@link Object})
 * - <span color=00ffff>{@link ve.Spreadsheet.getCellData|getCellData}</span>(arg0_sheet_index:{@link number}|{@link string}, arg1_x:{@link number}, arg2_y:{@link number}) | {f:{@link string}, v:{@link number}}
 * - <span color=00ffff>{@link ve.Spreadsheet.getSelectedRange|getSelectedRange}</span>() | [[{@link number}, {@link number}, {@link number}], [{@link number}, {@link number}, {@link number}]]
 * - <span color=00ffff>{@link ve.Spreadsheet.getSheetNames|getSheetNames}</span>() | {@link Array}<{@string}>
 * - <span color=00ffff>{@link ve.Spreadsheet.setCellData|setCellData}</span>(arg0_sheet_index:{@link number}|{@link string}, arg1_x:{@link number}, arg2_y:{@link number}, arg3_value:{f:{@link string}, v:{@link number}})
 * - <span color=00ffff>{@link ve.Spreadsheet.setDarkMode|setDarkMode}</span>(arg0_value=false:{@link boolean})
 * - <span color=00ffff>{@link ve.Spreadsheet.setSelectedRange|setSelectedRange}</span>(arg0_sheet_index:{@link number}|{@link string}, arg1_start_coords:[{@link number}, {@link number}, {@link number}], arg2_end_coords:[{@link number}, {@link number}, {@link number}])
 * - <span color=00ffff>{@link ve.Spreadsheet.toJSON|toJSON}</span>() | {@link Object}
 *
 * ##### Static Fields:
 * - `.instances`: {@link Array}<this:{@link ve.Spreadsheet}>
 *
 * ##### Static Methods:
 * - <span color=00ffff>{@link ve.Spreadsheet.fireToBinding|fireToBinding}</span>(arg0_table_id:{@link string})
 *
 * @augments ve.Component
 * @memberof ve.Component
 * @type {ve.Spreadsheet}
 */
ve.Spreadsheet = class extends ve.Component {
	static demo_value = [[["Test","hello",1,7,"Row 1"],["","world",2,8,"Row 2"],["","this",3,9,"Row 3"],["","is",4,10,"Row 4"],["","a",5,11,"Row 5"],["","test",6,12,"Row 6"],["","",7,"",""]]];
	static instances = [];
	
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = arg0_value;
		let options = (arg1_options) ? arg1_options : {};
			super(options);
		
		//Declare local instance variables
		this.element = document.createElement("div");
		this.element.setAttribute("component", "ve-spreadsheet");
		this.element.instance = this;
		this.element.style.height = "100%";
		this.name_el = document.createElement("div");
		this.name_el.id = "name";
		this.element.appendChild(this.name_el);
		
		this.iframe_el = document.createElement("iframe");
		this.iframe_el.src = "./UF/js/vercengen/components/ComponentSpreadsheet/spreadsheet_iframe.html";
		this.iframe_el.style.height = "100%";
		this.iframe_el.style.width = "100%";
		this.element.appendChild(this.iframe_el);
		
		if (options.attributes)
			Object.keys(options.attributes, (local_key, local_value) => {
				this.element.setAttribute(local_key, local_value.toString());
			});
		this.id = Class.generateRandomID(ve.Spreadsheet);
		this.options = options;
		this.value = value;
		
		this.initialisation_loop = setInterval(() => {
			try {
				if (this.value?.is_snapshot) {
					this.fromJSON(this.value);
				} else {
					this.v = this.value;
				}
				
				//Parse options
				if (this.options.dark_mode)
					this.setDarkMode(this.options.dark_mode);
				this.iframe_el.contentWindow.setID(this.id);
				
				clearInterval(this.initialisation_loop);
			} catch (e) {}
		});
		ve.Spreadsheet.instances.push(this);
		
		if (options.name) this.name = options.name;
	}
	
	/**
	 * Returns the current Object value, including both formulas/cells.
	 * - Accessor of: {@link ve.Spreadsheet}
	 *
	 * @alias v
	 * @memberof ve.Component.ve.Spreadsheet
	 * @type {Object}
	 */
	get v () {
		//Return statement
		return this.iframe_el.contentWindow.getData();
	}
	
	/**
	 * Sets the Object value contained in the Component, including both formulas/cells.
	 * - Accessor of: {@link ve.Spreadsheet}
	 *
	 * @alias v
	 * @memberof ve.Component.ve.Spreadsheet
	 *
	 * @param {Object} arg0_value
	 */
	set v (arg0_value) {
		//Convert from parameters
		let value = arg0_value;
		
		//Internal guard clause; array handling by parsing to valid object first
		if (Array.isArray(value))
			value = this.fromArray(value, true);
		
		//Set data in iframe_el if object
		this.iframe_el.contentWindow.setData(value);
		this.fireFromBinding();
	}
	
	/**
	 * Converts the present value to a 3D array.
	 * - Method of: {@link ve.Spreadsheet}
	 *
	 * @alias convertToArray
	 * @memberof ve.Component.ve.Spreadsheet
	 *
	 * @returns {Array}
	 */
	convertToArray () {
		//Return statement
		return this.iframe_el.contentWindow.getArrayData();
	}
	
	/**
	 * Restores the Spreadsheet view. If the Table is currently active, it syncs the data back from the Table before swapping.
	 * - Method of: {@link ve.Spreadsheet}
	 *
	 * @alias convertToSpreadsheet
	 * @memberof ve.Component.ve.Spreadsheet
	 *
	 * @returns {ve.Spreadsheet}
	 */
	convertToSpreadsheet () { //[WIP] - Refactor later
		//If we are coming back from a table, sync the data first
		if (this.table_component) {
			this.v = [this.table_component.v];
			
			// Swap DOM back if the table is currently visible
			if (this.table_component.element.parentNode)
				this.table_component.element.replaceWith(this.element);
		}
		
		//Return statement
		return this;
	}
	
	/**
	 * Switches the view to the bound Table. If no Table exists, creates one.
	 * - Method of: {@link ve.Spreadsheet}
	 *
	 * @alias convertToTable
	 * @memberof ve.Component.ve.Table
	 *
	 * @returns {ve.Table}
	 */
	convertToTable () { //[WIP] - Refactor later
		// Extract 2D data from the 3D Spreadsheet
		const spreadsheet_data = this.convertToArray();
		const table_data = (spreadsheet_data && spreadsheet_data[0]) ? spreadsheet_data[0] : [];
		
		if (!this.table_component) {
			// Create the counterpart and link them
			this.table_component = new ve.Table(table_data, this.options);
			this.table_component.spreadsheet_component = this;
		} else {
			// Sync current data to existing table
			this.table_component.v = table_data;
		}
		
		// Swap DOM
		if (this.element.parentNode)
			this.element.replaceWith(this.table_component.element);
		
		return this.table_component;
	}
	
	/**
	 * Sets the present component value from an exported 3D array.
	 * - Method of: {@link ve.Spreadsheet}
	 *
	 * @alias fromArray
	 * @memberof ve.Component.ve.Spreadsheet
	 * @param {Array} arg0_array
	 * @param {boolean} [arg1_do_not_display=false]
	 *
	 * @returns {Object}
	 */
	fromArray (arg0_array, arg1_do_not_display) {
		//Convert from parameters
		let array = arg0_array;
		let do_not_display = arg1_do_not_display;
		
		//Declare local instance variables
		let data_obj = {};
		
		console.log("fromArray() called")
		
		//Iterate over array; transform into valid sheets
		for (let i = 0; i < array.length; i++) {
			let local_data_obj = {};
			
			for (let x = 0; x < array[i].length; x++) {
				let local_row_obj = {};
				
				for (let y = 0; y < array[i][x].length; y++) {
					let local_value = array[i][x][y];
					
					//Coerce types based on local_value
					if (local_value && typeof local_value === "string" && local_value.startsWith("=")) {
						local_row_obj[y] = { f: local_value };
					} else {
						if (isNaN(parseFloat(local_value))) {
							local_row_obj[y] = { v: local_value, t: 1 };
						} else {
							local_row_obj[y] = { v: local_value, t: 2 };
						}
					}
				}
				
				local_data_obj[x] = local_row_obj;
			}
			
			data_obj[`sheet-${i + 1}`] = {
				id: `sheet-${i + 1}`,
				index: i,
				name: `Sheet ${i + 1}`,
				
				data: local_data_obj
			}
		}
		
		if (!do_not_display)
			this.v = data_obj;
		
		//Return statement
		return data_obj;
	}
	
	/**
	 * Loads a complete JSON snapshot into the workbook, restoring all sheets, styles, and cell dimensions.
	 * - Method of: {@link ve.Spreadsheet}
	 *
	 * @alias fromJSON
	 * @memberof ve.Component.ve.Spreadsheet
	 *
	 * @param {Object} arg0_json
	 */
	fromJSON (arg0_json) {
		this.iframe_el.contentWindow.setData(arg0_json);
	}
	
	/**
	 * Returns cell data as an Object. Coords are 1-indexed.
	 *
	 * @alias getCellData
	 * @memberof ve.Component.ve.Spreadsheet
	 *
	 * @param {number|string} arg0_sheet_index
	 * @param {number} arg1_x
	 * @param {number} arg2_y
	 *
	 * @returns {{f: string, v: number}}
	 */
	getCellData (arg0_sheet_index, arg1_x, arg2_y) {
		return this.iframe_el.contentWindow.getCellData(arg0_sheet_index, arg1_x, arg2_y);
	}
	
	/**
	 * Returns the range name given a set of coordinates.
	 *
	 * @alias getRangeName
	 * @memberof ve.Component.ve.Spreadsheet
	 *
	 * @param {Array.<number[]>} arg0_coords
	 *
	 * @returns {string}
	 */
	getRangeName (arg0_coords) {
		//Convert from parameters
		let coords = arg0_coords;
		
		//Declare local instance variables
		let all_sheet_names = this.getSheetNames();
		let series_range_string = "None";
		let series_sheet_name = "None";
		
		if (coords) {
			series_sheet_name = all_sheet_names[coords[0][0]];
			series_range_string = `${String.getSpreadsheetCell(coords[0][1], coords[0][2])}:${String.getSpreadsheetCell(coords[1][1], coords[1][2])}`;
		}
		
		//Return statement
		return (coords) ? `${series_sheet_name} ${series_range_string}` : "None";
	}
	
	/**
	 * Returns the range value without padding the origin. Note that this does not return raw values unless specified.
	 *
	 * @alias getRangeValue
	 *
	 * @param {Array.<number[]>} arg0_coords
	 * @param {Object} [arg1_options]
	 *  @param {boolean} [arg1_options.return_raw_values=false]
	 *
	 * @returns {Array.<Object[]>}
	 */
	getRangeValue (arg0_coords, arg1_options) {
		//Convert from parameters
		let coords = (arg0_coords) ? arg0_coords : [];
		let options = (arg1_options) ? arg1_options : {};
		
		//Declare local instance variables
		let return_array = [];
		
		//Iterate from start_x to end_x
		for (let i = coords[0][1]; i < coords[1][1] + 1; i++) {
			let local_value_array = [];
			
			//Iterate from start_y to end_y
			for (let x = coords[0][2]; x < coords[1][2] + 1; x++) try {
				let local_cell_data = this.getCellData(coords[0][0], i, x);
				if (options.return_raw_values)
					local_cell_data = local_cell_data?.v;
				local_value_array.push(local_cell_data);
			} catch (e) {}
			return_array.push(local_value_array);
		}
		
		//Return statement
		return return_array;
	}
	
	/**
	 * Returns the currently selected range as a 2D array of [[sheet_index, start_x, start_y], [sheet_index, end_x, end_y]]. Coords are 1-indexed.
	 *
	 * @alias getSelectedRange
	 * @memberof ve.Component.ve.Spreadsheet
	 *
	 * @returns {Array.<number[]>}
	 */
	getSelectedRange () {
		return this.iframe_el.contentWindow.getSelectedRange();
	}
	
	/**
	 * Returns the name of the currently selected range.
	 *
	 * @alias getSelectedRangeName
	 * @memberof ve.Component.ve.Spreadsheet
	 *
	 * @returns {string}
	 */
	getSelectedRangeName () {
		//Return statement
		return this.getRangeName(this.getSelectedRange());
	}
	
	/**
	 * Returns all current sheet names.
	 *
	 * @alias getSheetNames
	 * @memberof ve.Component.ve.Spreadsheet
	 *
	 * @returns {string[]}
	 */
	getSheetNames () {
		try {
			return this.iframe_el.contentWindow.getSheetNames();
		} catch (e) {
			return [];
		}
	}
	
	/**
	 * Sets cell data at a target coordinate to a given Object value. Coords are 1-indexed.
	 *
	 * @alias setCellData
	 * @memberof ve.Component.ve.Spreadsheet
	 *
	 * @param {number|string} arg0_sheet_index
	 * @param {number} arg1_x
	 * @param {number} arg2_y
	 * @param {{f: string, v: number}} arg3_value
	 */
	setCellData (arg0_sheet_index, arg1_x, arg2_y, arg3_value) {
		return this.iframe_el.contentWindow.setCellData(arg0_sheet_index, arg1_x, arg2_y, arg3_value);
	}
	
	/**
	 * Sets the theme of the current Table component, either to dark mode or light mode.
	 * - Method of: {@link ve.Spreadsheet}
	 *
	 * @alias setDarkMode
	 * @memberof ve.Component.ve.Spreadsheet
	 *
	 * @param {boolean} [arg0_value=false]
	 */
	setDarkMode (arg0_value) {
		//Convert from parameters
		let value = arg0_value;
		
		this.iframe_el.contentWindow.toggleDarkMode(value);
	}
	
	/**
	 * Sets the currently selected range to a target coordinate range. Coords are 1-indexed.
	 *
	 * @alias setSelectedRange
	 * @memberof ve.Component.ve.Spreadsheet
	 *
	 * @param {number[]} arg0_start_coords
	 * @param {number[]} arg1_end_coords
	 */
	setSelectedRange (arg0_start_coords, arg1_end_coords) {
		//Convert from parameters
		let start_coords = arg0_start_coords;
		let end_coords = arg1_end_coords;
		
		if (start_coords.length >= 3) {
			this.iframe_el.contentWindow.setActiveSheet(start_coords[0]);
			this.iframe_el.contentWindow.setSelectedRange(start_coords[0], [
				start_coords[1],
				start_coords[2]
			], [
				end_coords[1],
				end_coords[2]
			]);
		} else {
			let selected_sheet_index =  this.iframe_el.contentWindow.getSelectedSheet();
			
			this.iframe_el.contentWindow.setSelectedRange(selected_sheet_index,[start_coords[0], start_coords[1]], [end_coords[0], end_coords[1]]);
		}
	}
	
	/**
	 * Returns a complete JSON snapshot of the workbook, including styles, formatting, column widths, and row heights for all sheets.
	 * - Method of: {@link ve.Spreadsheet}
	 *
	 * @alias toJSON
	 * @memberof ve.Component.ve.Spreadsheet
	 *
	 * @returns {Object}
	 */
	toJSON () {
		//Return statement
		try {
			let return_obj = {
				is_snapshot: true,
				...this.iframe_el.contentWindow.getData()
			};
			
			return return_obj;
		} catch (e) {
			console.error("Failed to save spreadsheet snapshot:", e);
			return {};
		}
	}
	
	/**
	 * Fires to_binding statically, used by the embedded iframe since it has no `this` context.
	 * - Static method of: {@link ve.Spreadsheet}
	 *
	 * @alias #fireToBinding
	 * @memberof ve.Component.ve.Spreadsheet
	 *
	 * @param {string} arg0_table_id
	 */
	static fireToBinding (arg0_table_id) {
		//Convert from parameters
		let table_id = arg0_table_id;
		
		//Declare local instance variables
		let table_obj = ve.Spreadsheet.instances.filter((v) => v.id === table_id)[0];
		
		if (table_obj)
			table_obj.fireToBinding();
	}
};

//Functional binding

/**
 * @returns {ve.Spreadsheet}
 */
veSpreadsheet = function () {
	//Return statement
	return new ve.Spreadsheet(...arguments);
};