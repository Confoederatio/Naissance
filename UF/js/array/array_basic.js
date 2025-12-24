//Initialise functions
{
	if (!global.Array)
		/**
		 * The namespace for all UF/Array utility functions, typically for static methods.
		 * 
		 * @namespace Array
		 */
		global.Array = {};
	
	/**
	 * Converts an spreadsheet cell string (e.g. 'A1', 'ZZ15') into 1-based coordinates.
	 * 
	 * @param {string} arg0_cell_string
	 * 
	 * @returns {number[]}
	 */
	Array.fromSpreadsheetCell = function (arg0_cell_string) {
		//Convert from parameters
		let cell_string = (arg0_cell_string) ? arg0_cell_string : "";
		
		if (cell_string.length === 0) return [0, 0]; //Internal guard clause if no cell_string is provided
		
		//Declare local instance variables
		let match = cell_string.match(/^([A-Z]+)(\d+)$/i);
			if (!match) return [0, 0]; //Internal guard clause if no match is found
		
		let column_number = 0;
		let column_string = match[1].toUpperCase();
		let row_number = parseInt(match[2], 10);
		
		//Iterate over column_string
		for (let i = 0; i < column_string.length; i++) {
			//Convert character to value (A1-Z26)
			let char_value = column_string.charCodeAt(i) - 64;
				column_number = column_number*26 + char_value;
		}
		
		//Return statement
		return [column_number, row_number];
	};
	
	/**
	 * Moves an element within an array from an old index to a new index.
	 * 
	 * @param {Array} arg0_array
	 * @param {number} arg1_old_index
	 * @param {number} arg2_new_index
	 * 
	 * @returns {Array}
	 */
	Array.moveElement = function (arg0_array, arg1_old_index, arg2_new_index) {
		//Convert from parameters
		let array = Array.toArray(arg0_array);
		let old_index = Math.returnSafeNumber(arg1_old_index);
		let new_index = Math.returnSafeNumber(arg2_new_index);
		
		//Move old_index to new_index
		if (new_index >= array.length) {
			let local_index = new_index - array.length + 1;
			
			while (local_index--)
				array.push(undefined);
		}
		array.splice(new_index, 0, array.splice(old_index, 1)[0]);
		
		//Return statement
		return array;
	};
	
	/**
	 * Returns a list/{@link Array} from a given input value.
	 *
	 * @param {any|any[]} arg0_value
	 *
	 * @returns {any[]}
	 */
	Array.toArray = function (arg0_value) {
		//Convert from parameters
		let value = arg0_value;
		
		//Return statement
		if (Array.isArray(value)) return value; //Internal guard clause if value is already an array
		return [value];
	};
}