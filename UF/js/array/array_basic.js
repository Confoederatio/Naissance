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
	 * Creates an array from the following options.
	 * @alias Array.create
	 * 
	 * @param {Object} [arg0_options]
	 *  @param {number[]} [arg0_options.domain] - Creates an integer array between [min, max].
	 *  @param {number[]} [arg0_options.linear_sequence] - Generates a linear sequence from linear_sequence[0] to linear_sequence[1] in steps of linear_sequence[2].
	 *  @param {number|string[]} - Generates a sequenced array according to a mathematical equation. [0]: Mathematical equation as a string literal. The current iteration when generating the sequence is referred to as 'n'. [1]: The total number of iterations to repeat the sequence for.
	 *  @param {any[]} - Repeats an array x times.
	 *  @param {any[]} - Repeats each element of an array x times.
	 * 
	 * @returns {any[]}
	 */
	Array.create = function (arg0_options) {
		//Convert from parameters
		let options = (arg0_options) ? arg0_options : {};
		
		//Declare local instance variables
		let return_array = [];
		
		//Process array
		if (options.domain) {
			let domain_range = Math.getRange(options.domain);
			
			for (let i = domain_range[0]; i <= domain_range[1]; i++)
				return_array.push(i);
		}
		if (options.linear_sequence) {
			let domain_range = Math.getRange(options.linear_sequence);
			let step = (options.linear_sequence[2]) ? options.linear_sequence[2] : 1;
			
			for (let i = domain_range[0]; i <= domain_range[1]; i+= step)
				return_array.push(step);
		}
		if (options.sequence) {
			let sequence_literal = options.sequence[0];
			
			for (let i = 0; i < options.sequence[1]; i++) {
				let local_expression = `var n = ${i}; return ${sequence_literal};`;
				let local_result = new Function(local_expression)();
				
				return_array.push(local_result);
			}
		}
		if (options.repeat) {
			for (let i = 0; i < options.repeat[1]; i++)
				for (let x = 0; x < options.repeat[0].length; x++)
					return_array.push(options.repeat[0][x]);
		}
		if (options.repeat_each) {
			for (let i = 0; i < options.repeat_each[0].length; i++)
				for (let x = 0; x < options.repeat_each[1]; x++)
					return_array.push(options.repeat_each[0][i]);
		}
		
		//Return statement
		return return_array;
	};
	
	/**
	 * Formats an array with n dimensions with zero-indexed dimensionality.
	 * @alias Array.dimensionality
	 * 
	 * @param {any[]} arg0_input_array
	 * @param {number[]} arg1_dimension_array - An array providing the dimensions of the current array (what to break it down into), starting with the Y dimension.
	 * 
	 * @returns {Array.<any[]>}
	 */
	Array.dimensionality = function (arg0_input_array, arg1_dimension_array) {
		//Convert from parameters
		let input_array = Array.toArray(arg0_input_array);
		let dimension_array = Array.toArray(arg1_dimension_array);
		
		//Deep copy to avoid modifying original array
		input_array = JSON.parse(JSON.stringify(input_array));
		
		//Guard clause for recursion
		if (dimension_array.length === 0) return input_array;
		
		//Declare local instance variables
		let current_dimension = dimension_array.shift();
		let return_array = [];
		
		while (input_array.length > 0) {
			let sub_array = input_array.splice(0, current_dimension);
			return_array.push(Array.dimensionality(sub_array, [...dimension_array]));
		}
		
		//Return statement
		return return_array;
	};
	
	/**
	 * Finds the closest point in a domain for a given value.
	 * @alias Array.findClosestPointInDomain
	 * 
	 * @param {number[]} arg0_input_array
	 * @param {number} arg1_value
	 * 
	 * @returns {number}
	 */
	Array.findClosestPointInDomain = function (arg0_input_array, arg1_value) {
		//Convert from parameters
		let input_array = Array.toArray(arg0_input_array).sort((a, b) => a - b);
		let value = Math.returnSafeNumber(arg1_value);
		
		//Ensure the target is within the domain
		if (value < input_array[0]) return input_array[0];
		if (value > input_array[input_array.length - 1]) return input_array[input_array.length - 1];
		
		//Return statement
		return value;
	};
	
	/**
	 * Finds the closest valid domain in an array for a given value.
	 * @alias Array.findDomain
	 * 
	 * @param {number[]} arg0_input_array
	 * @param {number} arg1_value - The value to find the closest valid domain for.
	 * 
	 * @returns {number[]}
	 */
	Array.findDomain = function (arg0_input_array, arg1_value) {
		//Convert from parameters
		let input_array = Array.toArray(arg0_input_array);
		let value = Math.returnSafeNumber(arg1_value);
		
		//Guard clause if input_array has less than 2 elements
		if (input_array.length < 2) return;
		
		//Declare local instance variables
		let sorted_array = [...new Set(input_array)].sort((a, b) => a - b);
		
		//Return statement
		//Return cases if value is outside domain
		if (value <= sorted_array[0])
			return [sorted_array[0], sorted_array[1]];
		if (value >= sorted_array[sorted_array.length - 1])
			return [sorted_array[sorted_array.length - 2], sorted_array[sorted_array.length - 1]];
		
		//Iterate over all elements in sorted_array
		for (let i = 0; i < sorted_array.length - 1; i++)
			if (value >= sorted_array[i] && value <= sorted_array[i + 1])
				return [sorted_array[i], sorted_array[i + 1]];
	};
	
	/**
	 * Flattens a nested array to be 1-deep.
	 * @alias Array.flatten
	 * 
	 * @param {any[]} arg0_input_array
	 * 
	 * @returns {any[]}
	 */
	Array.flatten = function (arg0_input_array) {
		//Convert from parameters
		let input_array = Array.toArray(arg0_input_array);
		
		//Return statement
		return input_array.flat(Infinity);
	};
	
	/**
	 * Converts a spreadsheet cell string (e.g. 'A1', 'ZZ15') into 1-based coordinates.
	 * @alias Array.fromSpreadsheetCell
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
	 * Fetches the cardinality of an array/object/variable.
	 * @alias Array.getCardinality
	 * 
	 * @param {any} arg0_variable
	 * 
	 * @returns {number}
	 */
	Array.getCardinality = function (arg0_variable) {
		//Convert from parameters
		let input_variable = arg0_variable;
		
		//Return statement
		if (Array.isArray(input_variable)) {
			return input_variable.length;
		} else if (typeof input_variable == "object") {
			return Object.keys(input_variable).length;
		} else {
			return 1;
		}
	};
	
	/**
	 * Returns a filled domain range between [min, max].
	 * @alias Array.getFilledDomain
	 * 
	 * @param {number} arg0_min
	 * @param {number} arg1_max
	 * 
	 * @returns {number[]}
	 */
	Array.getFilledDomain = function (arg0_min, arg1_max) {
		//Convert from parameters
		let min = Math.returnSafeNumber(arg0_min);
		let max = Math.returnSafeNumber(arg1_max);
		
		//Declare local instance variables
		let array = [];
		
		//Iterate between min and max
		for (let i = min; i <= max; i++)
			array.push(i);
		
		//Return statement
		return array;
	};
	
	/**
	 * Fetches the total number of elements in an array, including subarrays.
	 * @alias Array.getRecursiveCardinality
	 * 
	 * @param {any[]} arg0_input_array
	 * 
	 * @returns {number}
	 */
	Array.getRecursiveCardinality = function (arg0_input_array) {
		//Convert from parameters
		let input_array = arg0_input_array;
		
		//Return statement
		if (Array.isArray(input_array))
			return input_array.flat().length;
	};
	
	/**
	 * Checks whether an array is empty.
	 * @alias Array.isEmpty
	 * 
	 * @param {any[]} arg0_input_array
	 * 
	 * @returns {boolean}
	 */
	Array.isEmpty = function (arg0_input_array) {
		//Convert from parameters
		let input_array = Array.toArray(arg0_input_array);
		
		//Return statement
		return (input_array.length === 0 || input_array.every((element) => element === undefined));
	};
	
	/**
	 * Concatenates two arrays.
	 * 
	 * @param {any[]} arg0_input_array
	 * @param {any[]} arg1_array
	 * 
	 * @returns {any[]}
	 */
	Array.mergeArrays = function (arg0_input_array, arg1_array) {
		//Convert from parameters
		let input_array = Array.toArray(arg0_input_array);
		let array = Array.toArray(arg1_array);
		
		//Return statement
		return input_array.concat(array);
	};
	
	/**
	 * Moves an element within an array from an old index to a new index.
	 * @alias Array.moveElement
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
	 * Reverses an input array.
	 * @alias Array.reverse
	 * 
	 * @param {any[]} arg0_input_array
	 * 
	 * @returns {any[]}
	 */
	Array.reverse = function (arg0_input_array) {
		//Convert from parameters
		let input_array = arg0_input_array;
		
		//Return statement
		if (Array.isArray(input_array)) {
			return JSON.parse(JSON.stringify(input_array)).reverse();
		} else {
			return input_array;
		}
	};
	
	/**
	 * Performs a Fisher-Yates shuffle on an input array and returns the shuffle.
	 * @alias Array.shuffle
	 * 
	 * @param {any[]} arg0_input_array
	 * 
	 * @returns {any[]}
	 */
	Array.shuffle = function (arg0_input_array) {
		//Convert from parameters
		let input_array = [...arg0_input_array];
		
		//Iterate over input_array and shuffle it
		for (let i = input_array.length - 1; i > 0; i--) {
			let j = Math.floor(Math.random()*(i + 1));
			
			[input_array[i], input_array[j]] = [input_array[j], input_array[i]];
		}
		
		//Return statement
		return input_array;
	};
	
	/**
	 * Returns a list/{@link Array} from a given input value.
	 * @alias Array.toArray
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
	
	/**
	 * Truncates an array to a given length.
	 * @alias Array.truncate
	 * 
	 * @param arg0_input_array
	 * @param arg1_length
	 * 
	 * @returns {*}
	 */
	Array.truncate = function (arg0_input_array, arg1_length) {
		//Convert from parameters
		let input_array = Array.toArray(arg0_input_array);
		let length = Math.returnSafeNumber(arg1_length);
		
		//Set length
		input_array.length = length;
		
		//Return statement
		return input_array;
	};
	
	/**
	 * Removes any duplicate elements from an input array.
	 * @alias Array.unique
	 * 
	 * @param {any[]} arg0_input_array
	 * 
	 * @returns {any[]}
	 */
	Array.unique = function (arg0_input_array) {
		//Convert from parameters
		let input_array = arg0_input_array;
		
		//Deep copy just in-case
		input_array = JSON.parse(JSON.stringify(input_array));
		
		//Initial filter for non-nested arrays; convert any sub-arrays to strings for comparison
		let unique_array = input_array.filter((item, index, array) => {
			//Convert sub-arrays to strings for comparison
			if (Array.isArray(item)) {
				item = item.map(sub_item => {
					if (typeof sub_item == "object")
						return JSON.stringify(sub_item);
					return sub_item;
				}).join(",");
				
				array[index] = item;
			}
			
			//Local filter return statement
			return (array.indexOf(item) === index);
		});
		
		//Return statement; convert sub-arrays back to arrays
		return unique_array.map(item => {
			if (typeof item == "string")
				return item.split(",").map(sub_item => {
					try {
						return JSON.parse(sub_item);
					} catch {
						return sub_item;
					}
				});
			
			//Local map return statement
			return item;
		});
	};
}