/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 * 
 * Spreadsheet editor that returns a 2D array list/object using iframes for encapsulation. Excel/Google Sheets/HTML compatible with formulas and limited styling options. Note that there might be a slight initialisation delay due to lazy-loading.
 * 
 * The reason this does not always serialise to an {@link Array} is so that formulas and format data can be preserved.
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
 * - <span color=00ffff>{@link ve.Table.convertToArray|convertToArray}</span>() | {@link Array}<{@link Array}<{@link Array}<{@link any}>>>
 * - <span color=00ffff>{@link ve.Table.fromArray|fromArray}</span>(arg0_array:{@link Array}<{@link Array}<{@link Array}<{@link any}>>>, arg1_do_not_display=false:{@link boolean}) | {@link Object}
 * - <span color=00ffff>{@link ve.Table.getCellData|getCellData}</span>(arg0_sheet_index:{@link number}|{@link string}, arg1_x:{@link number}, arg2_y:{@link number}) | {f:{@link string}, v:{@link number}}
 * - <span color=00ffff>{@link ve.Table.getSelectedRange|getSelectedRange}</span>() | [[{@link number}, {@link number}, {@link number}], [{@link number}, {@link number}, {@link number}]]
 * - <span color=00ffff>{@link ve.Table.getSheetNames|getSheetNames}</span>() | {@link Array}<{@link string}>
 * - <span color=00ffff>{@link ve.Table.setCellData|setCellData}</span>(arg0_sheet_index:{@link number}|{@link string}, arg1_x:{@link number}, arg2_y:{@link number}, arg3_value:{f:{@link string}, v:{@link number}})
 * - <span color=00ffff>{@link ve.Table.setDarkMode|setDarkMode}</span>(arg0_value=false:{@link boolean})
 * - <span color=00ffff>{@link ve.Table.setSelectedRange|setSelectedRange}</span>(arg0_sheet_index:{@link number}|{@link string}, arg1_start_coords:[{@link number}, {@link number}, {@link number}], arg2_end_coords:[{@link number}, {@link number}, {@link number}])
 * 
 * ##### Static Fields:
 * - `.instances`: {@link Array}<this:{@link ve.Table}>
 *
 * ##### Static Methods:
 * - <span color=00ffff>{@link ve.Table.fireToBinding|fireToBinding}</span>(arg0_table_id:{@link string})
 * 
 * @augments ve.Component
 * @memberof ve.Component
 * @type {ve.Table}
 */
ve.Table = class extends ve.Component {
	static demo_value = [[["Test","hello",1,7,"Row 1"],["","world",2,8,"Row 2"],["","this",3,9,"Row 3"],["","is",4,10,"Row 4"],["","a",5,11,"Row 5"],["","test",6,12,"Row 6"],["","",7,"",""]]];
	static instances = [];
	
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = arg0_value;
		let options = (arg1_options) ? arg1_options : {};
			super(options);
			
		//Declare local instance variables
		this.element = document.createElement("div");
		this.element.setAttribute("component", "ve-table");
		this.element.instance = this;
		this.element.style.height = "100%";
			this.name_el = document.createElement("div");
			this.name_el.id = "name";
			this.element.appendChild(this.name_el);
		
			this.iframe_el = document.createElement("iframe");
			this.iframe_el.src = "./UF/js/vercengen/components/ComponentTable/table_iframe.html";
			this.iframe_el.style.height = "100%";
			this.iframe_el.style.width = "100%";
			this.element.appendChild(this.iframe_el);
			
			if (options.attributes)
				Object.keys(options.attributes, (local_key, local_value) => {
					this.element.setAttribute(local_key, local_value.toString());
				});
		this.id = Class.generateRandomID(ve.Table);
		this.options = options;
		this.value = value;
		
		this.initialisation_loop = setInterval(() => {
			try {
				this.v = this.value;
				
				//Parse options
				if (this.options.dark_mode)
					this.setDarkMode(this.options.dark_mode);
				this.iframe_el.contentWindow.setID(this.id);
				
				clearInterval(this.initialisation_loop);
			} catch (e) {}
		});
		ve.Table.instances.push(this);
		
		if (options.name) this.name = options.name;
	}
	
	/**
	 * Returns the current Object value, including both formulas/cells.
	 * - Accessor of: {@link ve.Table}
	 *
	 * @alias v
	 * @memberof ve.Component.ve.Table
	 * @type {Object}
	 */
	get v () {
		//Return statement
		return this.iframe_el.contentWindow.getData();
	}
	
	/**
	 * Sets the Object value contained in the Component, including both formulas/cells.
	 * - Accessor of: {@link ve.Table}
	 * 
	 * @alias v
	 * @memberof ve.Component.ve.Table
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
	 * - Method of: {@link ve.Table}
	 *
	 * @alias convertToArray
	 * @memberof ve.Component.ve.Table
	 * 
	 * @returns {Array}
	 */
	convertToArray () {
		//Return statement
		return this.iframe_el.contentWindow.getArrayData();
	}
	
	/**
	 * Sets the present component value from an exported 3D array.
	 * - Method of: {@link ve.Table}
	 * 
	 * @alias fromArray
	 * @memberof ve.Component.ve.Table
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
		
		//Iterate over array; transform into valid sheets
		for (let i = 0; i < array.length; i++) {
			let local_data_obj = {};
			
			for (let x = 0; x < array[i].length; x++) {
				let local_row_obj = {};
				
				for (let y = 0; y < array[i][x].length; y++) {
					let local_value = array[i][x][y];
					
					//Coerce types based on local_value
					if (local_value.startsWith("=")) {
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
	 * Returns cell data as an Object. Coords are 1-indexed.
	 *
	 * @alias getCellData
	 * @memberof ve.Component.ve.Table
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
	 * @memberof ve.Component.ve.Table
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
	 * Returns the currently selected range as a 2D array of [[start_x, start_y], [end_x, end_y]]. Coords are 1-indexed.
	 *
	 * @alias getSelectedRange
	 * @memberof ve.Component.ve.Table
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
	 * @memberof ve.Component.ve.Table
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
	 * @memberof ve.Component.ve.Table
	 * 
	 * @returns {string[]}
	 */
	getSheetNames () {
		return this.iframe_el.contentWindow.getSheetNames();
	}
	
	/**
	 * Sets cell data at a target coordinate to a given Object value. Coords are 1-indexed.
	 *
	 * @alias setCellData
	 * @memberof ve.Component.ve.Table
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
	 * - Method of: {@link ve.Table}
	 *
	 * @alias setDarkMode
	 * @memberof ve.Component.ve.Table
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
	 * @memberof ve.Component.ve.Table
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
	 * Fires to_binding statically, used by the embedded iframe since it has no `this` context.
	 * - Static method of: {@link ve.Table}
	 * 
	 * @alias #fireToBinding
	 * @memberof ve.Component.ve.Table
	 * 
	 * @param {string} arg0_table_id
	 */
	static fireToBinding (arg0_table_id) {
		//Convert from parameters
		let table_id = arg0_table_id;
		
		//Declare local instance variables
		let table_obj = ve.Table.instances.filter((v) => v.id === table_id)[0];
		
		if (table_obj)
			table_obj.fireToBinding();
	}
};

//Functional binding

/**
 * @returns {ve.Table}
 */
veTable = function () {
	//Return statement
	return new ve.Table(...arguments);
};