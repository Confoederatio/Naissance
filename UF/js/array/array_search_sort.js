//Initialise functions
{
	if (!global.Array) global.Array = {};
	
	/**
	 * Fetches array elements that fulfil the following criteria and returns it as an array. If an element being compared to is not of a valid type to the comparison (e.g. .greater option on an object), the element will be returned as-is in the new array.
	 * @alias Array.getElements
	 * 
	 * @param {any[]} arg0_array - The array to pass to the function.
	 * @param [arg1_options]
	 *  @param {number} [arg1_options.cardinality] - Elements in array must have a length of this.
	 *  @param {number} [arg1_options.cardinality_geq] - Elements in array must have a length greater to or equal to this number.
	 *  @param {number} [arg1_options.cardinality_greater] - Elements in array must have a length greater than this number. 
	 *  @param {number} [arg1_options.cardinality_leq] - Elements in array must have a length less than this number.
	 *  @param {number} [arg1_options.cardinality_less_than] - Elements in array mus thave a length less than or equal to this number.
	 *  
	 *  @param {number} [arg1_options.eq] - Elements in returned array are equal to this number.
	 *  @param {number} [arg1_options.geq] - Elements in returned array must be greater to or equal than this number.
	 *  @param {number} [arg1_options.greater] - Elements in returned array must be greater than this number.
	 *  @param {any[]} [arg1_options.in_array] - Fetches elements that are also included in this set.
	 *  @param {any[]} [arg1_options.in_set] - Fetches elements that are also included in this set.
	 *  @param {number[]} [arg1_options.indexes] - Fetches the following indexes.
	 *  @param {number[]} [arg1_options.not_indexes] - Compares only indexes not mentioned in this array.
	 *  @param {number} [arg1_options.leq] - Elements in returned array must be less than or equal to this number.
	 *  @param {number} [arg1_options.less] - Elements in returned array must be less than this number.
	 *  @param {number[]} [arg1_options.not_range] - Returns array values within this range. Has an array length of 2.
	 *  @param {number[]} [arg1_options.range] - Returns array values within this range.
	 *  @param {boolean} [arg1_options.recursive=false] - Whether the array is recursive.
	 *  
	 * @returns {any[]}
	 */
	Array.getElements = function (arg0_array, arg1_options) {
		//Convert from parameters
		let array = arg0_array;
		let options = (arg1_options) ? arg1_options : {};
		
		//Declare local instance variables
		array = JSON.parse(JSON.stringify(array));
		let comparison_array;
		let return_array = [];
		
		//Initialise local instance variables
		if (options.in_array) comparison_array = options.in_array;
		if (options.in_set) comparison_array = options.in_set;
		
		//Iterate over all elements in array
		for (let i = 0; i < array.length; i++) {
			//Check if element meets criteria
			let meets_criteria = true;
			
			//Array condition handling
			if (Array.isArray(array[i])) {
				if (!(
					(options.cardinality === undefined || array[i].length === options.cardinality) &&
					(options.cardinality_greater === undefined || array[i].length > options.cardinality_greater) &&
					(options.cardinality_geq === undefined || array[i].length >= options.cardinality_geq) &&
					(options.cardinality_leq === undefined || array[i].length <= options.cardinality_leq) &&
					(options.cardinality_less_than === undefined || array[i].length < options.cardinality_less_than)
				))
					meets_criteria = false;
				
				//Subarray recursive handler
				if (meets_criteria)
					if (options.recursive)
						array[i] = Array.getElements(array[i], options);
			}
			//Numeric condition handling
			if (typeof array[i] == "number") {
				if (!(
					(options.eq === undefined || array[i] === options.eq) &&
					(options.geq === undefined || array[i] >= options.geq) &&
					(options.less === undefined || array[i] < options.less) &&
					(options.leq === undefined || array[i] <= options.leq) &&
					(options.range === undefined || (array[i] >= options.range[0] && array[i] <= options.range[1])) &&
					(options.not_range === undefined || (array[i] < options.range[0] && array[i] > options.range[1]))
				))
					meets_criteria = false;
			}
			//Generic element handling
			if (!(
				(options.indexes === undefined || options.indexes.includes(i)) &&
				(options.not_indexes === undefined || !options.not_indexes.includes(i))
			))
				meets_criteria = false;
			
			//Check if element is contained within in_array/in_set
			if (comparison_array) {
				let in_other_set = false;
				let stringified_local_element = JSON.stringify(array[i]);
				
				for (let x = 0; x < comparison_array.length; x++)
					if (stringified_local_element === JSON.stringify(comparison_array[x])) {
						in_other_set = true;
						break;
					}
				
				if (!in_other_set)
					meets_criteria = false;
			}
			
			//Push to array if meets_criteria
			if (meets_criteria)
				return_array.push(array[i]);
		}
		
		//Return statement
		return return_array;
	};
	
	/**
	 * Recursively fetches the element of an array containing a substring.
	 * @alias Array.getSubstringElements
	 * 
	 * @param {any[]} arg0_array - The array to pass to the function.
	 * @param {string} arg1_string - The substring to search array elements for.
	 * @param {Object} [arg2_options]
	 *  @param {boolean} [arg2_options.recursive=true] - Whether to traverse recursively.
	 * 
	 * @returns {string[]}
	 */
	Array.getSubstringElements = function (arg0_array, arg1_string, arg2_options) {
		//Convert from parameters
		let array = Array.toArray(arg0_array);
		let substring = arg1_string;
		let options = (arg2_options) ? arg2_options : {};
		
		//Initialise options
		if (options.recursive === undefined)
			options.recursive = true;
		
		//Declare local instance variables
		let array_substring_elements = [];
		
		//Iterate over array
		for (let i = 0; i < array.length; i++)
			if (Array.isArray(array[i])) {
				//Recursively call getArraySubstring().
				if (options.recursive)
					array_substring_elements = Array.append(array_substring_elements, Array.getSubstringElements(array, substring, options));
			} else {
				if (JSON.stringify(array[i]).contains(substring))
					array_substring_elements.push(array[i]);
			}
		
		//Return statement
		return array_substring_elements;
	};
	
	/**
	 * Returns the indexes of an array of strings.
	 * @alias Array.indexesOf
	 * 
	 * @param {any[]} arg0_array
	 * @param {number[]} arg1_index_array
	 * @param {Object} [arg2_options]
	 *  @param {boolean} [arg2_options.return_values=false] - Optional. Whether to return array values instead of indices.
	 *  
	 * @returns {any[]}
	 */
	Array.indexesOf = function (arg0_array, arg1_index_array, arg2_options) {
		//Convert from parameters
		let array = Array.toArray(arg0_array);
		let index_array = Array.toArray(arg1_index_array);
		let options = (arg2_options) ? arg2_options : {};
		
		//Declare local instance variables
		let filtered_array = array.filter((element, index) => index_array.includes(index));
		let return_array = [];
		
		//Iterate through each element in filtered array
		for (let i = 0; i < filtered_array.length; i++)
			(options.return_values) ?
				return_array.push(filtered_array[i]) :
				return_array.push(i);
		
		//Return statement
		return return_array;
	};
	
	/**
	 * Sorts an array. Can be based on subkey values (recursive, e.g. 'population.size').
	 * @alias Array.sort
	 * 
	 * @param {any[]} arg0_array
	 * @param {Object} [arg1_options]
	 *  @param {string} [arg1_options.sort_key=""] - The sort subkey to specify. Empty (indicating the base index) by default.
	 *  @param {string} [arg1_options.mode="descending"] - "alphabetical"/"ascending"/"descending".
	 *  @param {boolean} [arg1_options.recursive=false] - Whether the sort is recursive.
	 * 
	 * @returns {any[]}
	 */
	Array.sort = function (arg0_array, arg1_options) {
		//Convert from parameters
		let array = Array.toArray(arg0_array);
		let options = (arg1_options) ? arg1_options : {};
		
		//Initialise options
		if (!options.mode) options.mode = "descending";
		
		//Declare local instance variables
		let comparisonFunction = (a, b) => {
			if (options.mode === "alphabetical") {
				return a.localeCompare(b);
			} else if (options.mode === "ascending") {
				return a - b;
			} else {
				return b - a;
			}
		};
		//Recursive sort function
		let recursiveSort = (array, key) => {
			array.sort((a, b) => {
				var a_value = (key) ? Object.getValue(a, key) : a;
				var b_value = (key) ? Object.getValue(b, key) : b;
				
				return comparisonFunction(a_value, b_value);
			});
			
			if (options.recursive)
				array.forEach((item) => {
					if (typeof item == "object")
						recursiveSort(item, key);
				});
		}
		
		//Perform sorting
		recursiveSort(array, options.sort_key);
		
		//Return statement
		return array;
	}
}