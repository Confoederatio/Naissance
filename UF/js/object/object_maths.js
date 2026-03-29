{
	if (!global.Object)
		/**
		 * The namespace for all UF/Object utility functions, typically for static methods.
		 *
		 * @namespace Object
		 */
		global.Object = {};
	
	/**
	 * Adds a value to an object, recursively.
	 * @alias Object.add
	 *
	 * @param {Object} arg0_object - The object to pass.
	 * @param {number} arg1_value - The value to add to each variable in the object.
	 *
	 * @returns {Object}
	 */
	Object.add = function (arg0_object, arg1_value) {
		//Convert from parameters
		let object = arg0_object;
		let value = arg1_value;
		
		//Return statement
		return Object.operate(object, `n + ${value}`);
	};
	
	/**
	 * Adds values between two objects, recursively.
	 * @alias Object.addObjects
	 *
	 * @param {Object} arg0_object - The 1st object to pass.
	 * @param {Object} arg1_object - The 2nd object to pass.
	 * @param {Object} [arg2_options]
	 *  @param {boolean} [arg2_options.recursive=true] - Whether the operation is recursive.
	 *
	 * @returns {Object}
	 */
	Object.addObjects = function (arg0_object, arg1_object, arg2_options) {
		//Convert from parameters
		let object = arg0_object;
		let ot_object = arg1_object;
		let options = (arg2_options) ? arg2_options : {};
		
		//Return statement
		return Object.operateObjects(object, ot_object, `i = i + x;`, options);
	};
	
	/**
	 * Changes object ranges, non-recursively, for a given key.
	 * @alias Object.changeRange
	 *
	 * @param {Object} arg0_object - The object to pass.
	 * @param {string} arg1_key - The key corresponding to the range to modify.
	 * @param {string} [arg2_min_max_argument="both"] - Either 'minimum'/'maximum'/'both'.
	 * @param {number} arg3_value - The number to change these ranges by.
	 *
	 * @returns {Object}
	 */
	Object.changeRange = function (arg0_object, arg1_key, arg2_min_max_argument, arg3_value) {
		//Convert from parameters
		let object = arg0_object;
		let key = arg1_key;
		let min_max_argument = arg2_min_max_argument;
		let value = Math.round(Math.returnSafeNumber(arg3_value));
		
		//Add to object
		if (object[key]) {
			if (min_max_argument === "minimum") {
				object[key][0] += value;
			} else if (min_max_argument === "maximum") {
				object[key][1] += value;
			} else {
				object[key][0] += value;
				object[key][1] += value;
			}
		} else {
			if (min_max_argument === "minimum") {
				object[key] = [value, 0];
			} else if (min_max_argument === "maximum") {
				object[key] = [0, value];
			} else {
				object[key] = [value, value];
			}
		}
		
		//Return statement
		return object;
	};
	
	/**
	 * Divides an object by a value, recursively.
	 * @alias Object.divide
	 *
	 * @param {Object} arg0_object - The object to pass.
	 * @param {number} arg1_value - The value to divide each variable in the object by.
	 *
	 * @returns {Object}
	 */
	Object.divide = function (arg0_object, arg1_value) {
		//Convert from parameters
		let object = arg0_object;
		let value = arg1_value;
		
		//Return statement
		return Object.operate(object, `n/${value}`);
	};
	
	/**
	 * Divides two objects, recursively.
	 * @alias Object.divideObjects
	 *
	 * @param {Object} arg0_object - The 1st object to pass.
	 * @param {Object} arg1_object - The 2nd object to pass.
	 * @param {Object} [arg2_options]
	 *  @param {boolean} [arg2_options.recursive=true] - Whether the operation is recursive.
	 *
	 * @returns {Object}
	 */
	Object.divideObjects = function (arg0_object, arg1_object, arg2_options) {
		//Convert from parameters
		let object = arg0_object;
		let ot_object = arg1_object;
		let options = (arg2_options) ? arg2_options : {};
		
		//Return statement
		return Object.operateObjects(object, ot_object, `i = i/x`, options);
	};
	
	/**
	 * Expands a target value to its natural [min, max] boundaries, i.e. zero-values.
	 * @alias Object.expandValue
	 * 
	 * @param {Object<number>} arg0_object
	 * @param {Object} [arg1_options]
	 *  @param {boolean} [arg1_options.expand_max=true]
	 *  @param {boolean} [arg1_options.expand_min=true]
	 *  @param {number} [arg1_options.value=0] - The value to expand.
	 */
	Object.expandValue = function (arg0_object, arg1_options) {
		//Convert from parameters
		let object = (arg0_object) ? arg0_object : {};
		let options = (arg1_options) ? arg1_options : {};
		
		if (options.expand_max === undefined) options.expand_max = true;
		if (options.expand_min === undefined) options.expand_min = true;
		options.value = Math.returnSafeNumber(options.value);
		
		//Declare local instance variables
		let all_keys = Object.keys(object).map(Number).sort((a, b) => a - b);
		let return_obj = { ...object };
		
		//Iterate over all keys and expand options.value
		for (let i = 0; i < all_keys.length; i++)
			if (object[all_keys[i]] === options.value) {
				//Expand left: look for a neighbour that is not the target value
				if (options.expand_min && i > 0) {
					let left_key = all_keys[i - 1];
					
					if (object[left_key] !== options.value)
						return_obj[left_key + 1] = options.value;
				}
				
				//Expand right: look for a neighbour that is not the target value
				if (options.expand_max && i < all_keys.length - 1) {
					let right_key = all_keys[i + 1];
					
					if (object[right_key] !== options.value)
						return_obj[right_key - 1] = options.value;
				}
			}
		
		//Return statement
		return return_obj;
	};
	
	/**
	 * Calculates the average deviation of one object from another based on domain.
	 * @alias Object.getAverageDeviationFromObject
	 *
	 * @param {Object} arg0_object
	 * @param {Object} arg1_object
	 *
	 * @returns {number}
	 */
	Object.getAverageDeviationFromObject = function (arg0_object, arg1_object) {
		//Convert from parameters
		let object = arg0_object;
		let ot_object = arg1_object;
		
		//Declare local instance variables
		let all_object_keys = Object.keys(object);
		let all_ot_object_keys = Object.keys(ot_object);
		let average_deviations = [];
		let object_domain = [
			parseInt(all_object_keys[0]),
			parseInt(all_object_keys[all_object_keys.length - 1])
		];
		
		//Iterate over all_ot_object_keys
		for (let i = 0; i < all_ot_object_keys.length; i++) {
			let local_value = ot_object[all_ot_object_keys[i]];
			
			let closest_object_key = Array.findClosestPointInDomain(object_domain, local_value);
			let closest_object_value = object[closest_object_key];
			
			average_deviations.push(Math.returnSafeNumber(local_value)/Math.returnSafeNumber(closest_object_value, 1));
		}
		
		//Return statement
		return Array.getAverage(average_deviations);
	};
	
	/**
	 * Fetches the maximum value within an object.
	 * @alias Object.getMaximum
	 *
	 * @param {Object} arg0_object - The object to pass.
	 * @param {Object} [arg1_options]
	 *  @param {boolean} [arg1_options.include_ranges=false] - Whether to include ranges.
	 *  @param {boolean} [arg1_options.recursive=true] - Whether function is recursive.
	 *
	 * @returns {number}
	 */
	Object.getMaximum = function (arg0_object, arg1_options) {
		//Convert from parameters
		let object = arg0_object;
		let options = (arg1_options) ? arg1_options : {};
		
		//Initialise options
		if (options.recursive !== false) options.recursive = true;
		
		//Declare local instance variables
		let all_object_keys = Object.keys(object);
		let local_maximum = -Infinity;
		
		//Iterate over all_object_keys
		for (let i = 0; i < all_object_keys.length; i++) {
			let local_value = object[all_object_keys[i]];
			
			if (typeof local_value == "number")
				local_maximum = (local_maximum === undefined) ? local_value : Math.max(local_value, local_maximum);
			
			//Ranges handler
			if (options.include_ranges && Array.isArray(local_value))
				if (local_value.length === 2 && Array.isType(local_value, "number"))
					for (let x = 0; x < local_value.length; x++)
						local_maximum = (local_maximum === undefined) ? local_value[x] : Math.max(local_value[x], local_maximum);
			
			//Object handler
			if (options.recursive)
				if (typeof local_value == "object" && !Array.isArray(local_value)) {
					let subobject_maximum = Object.getMaximum(local_value, options);
					local_maximum = (local_maximum === undefined) ? subobject_maximum : Math.max(local_maximum, subobject_maximum);
				}
		}
		
		//Return statement
		return local_maximum;
	};
	
	/**
	 * Fetches the minimum value within an object.
	 * @alias Object.getMinimum
	 *
	 * @param {Object} arg0_object - The object to pass.
	 * @param {Object} [arg1_options]
	 *  @param {boolean} [arg1_options.include_ranges=false] - Whether to include ranges.
	 *  @param {boolean} [arg1_options.recursive=true] - Whether function is recursive.
	 *
	 * @returns {number}
	 */
	Object.getMinimum = function (arg0_object, arg1_options) {
		//Convert from parameters
		let object = arg0_object;
		let options = (arg1_options) ? arg1_options : {};
		
		//Declare local instance variables
		let all_object_keys = Object.keys(object);
		let local_minimum = Infinity;
		
		//Iterate over all_object_keys
		for (let i = 0; i < all_object_keys.length; i++) {
			let local_value = object[all_object_keys[i]];
			
			if (typeof local_value == "number")
				local_minimum = (local_minimum === undefined) ? local_value : Math.min(local_value, local_minimum);
			
			//Ranges handler
			if (options.include_ranges && Array.isArray(local_value))
				if (local_value.length === 2 && Array.isType(local_value, "number"))
					for (let x = 0; x < local_value.length; x++)
						local_minimum = (local_minimum === undefined) ? local_value[x] : Math.min(local_value[x], local_minimum);
			
			//Object handler
			if (options.recursive !== false)
				if (typeof local_value == "object" && !Array.isArray(local_value)) {
					let subobject_minimum = Object.getMinimum(local_value, options);
					local_minimum = (local_minimum === undefined) ? subobject_minimum : Math.min(local_minimum, subobject_minimum);
				}
		}
		
		//Return statement
		return local_minimum;
	};
	
	/**
	 * Fetches the object sum, recursively.
	 * @alias Object.getSum
	 *
	 * @param {Object} arg0_object - The object to pass.
	 * @param {Object} [arg1_options]
	 *  @param {boolean} [arg1_options.recursive=true] - Whether to sum recursively.
	 *
	 * @returns {number}
	 */
	Object.getSum = function (arg0_object, arg1_options) {
		//Convert from parameters
		let object = arg0_object;
		let options = (arg1_options) ? arg1_options : {};
		
		//Initialise options
		if (options.recursive !== false) options.recursive = true;
		
		//Declare local instance variables
		let all_object_keys = Object.keys(object);
		let total_sum = 0;
		
		//Iterate over all_object_keys
		for (let i = 0; i < all_object_keys.length; i++) {
			let local_value = object[all_object_keys[i]];
			
			if (typeof local_value == "number") {
				total_sum += local_value;
			} else if (typeof local_value == "object" && !Array.isArray(local_value)) {
				//Recursively call function
				total_sum += Object.getSum(local_value, options);
			}
		}
		
		//Return statement
		return total_sum;
	};
	
	/**
	 * Interpolates and normalises data given an absolute Ground Truth (GT) and an absolute, but relativistic rates map.
	 * @alias Object.interpolateGT
	 *
	 * @param {Object<number>} arg0_object - The Ground Truth (GT) map
	 * @param {Object<number>} arg1_object - The Relativistic Rates (RR) map
	 */
	//[QUARANTINE]
	Object.interpolateGT = function (arg0_object, arg1_object) {
		// Convert from parameters
		let object = { ...arg0_object };
		let ot_object = arg1_object;
	
		// Declare local instance variables
		let object_keys = Object.keys(object)
			.map(Number)
			.sort((a, b) => a - b);
		let ot_object_keys = Object.keys(ot_object)
			.map(Number)
			.sort((a, b) => a - b);
		let return_obj = {};
	
		// Create a sorted union of all unique keys from both objects
		let union_keys = [...new Set([...object_keys, ...ot_object_keys])].sort(
			(a, b) => a - b
		);
	
		// Handle extraneous values:
		// If RR contains years outside the GT range, add them to our GT anchors
		let min_gt = object_keys[0];
		let max_gt = object_keys[object_keys.length - 1];
	
		for (let i = 0; i < ot_object_keys.length; i++) {
			let current_rr_year = ot_object_keys[i];
			if (current_rr_year < min_gt || current_rr_year > max_gt) {
				object[current_rr_year] = ot_object[current_rr_year];
			}
		}
	
		// Re-evaluate object keys after adding extraneous RR values
		let all_anchor_keys = Object.keys(object)
			.map(Number)
			.sort((a, b) => a - b);
	
		let getRRValue = (ot_key) => {
			if (ot_object[ot_key] !== undefined) return ot_object[ot_key];
			if (ot_key <= ot_object_keys[0]) return ot_object[ot_object_keys[0]];
			if (ot_key >= ot_object_keys[ot_object_keys.length - 1])
				return ot_object[ot_object_keys[ot_object_keys.length - 1]];
	
			let lower_key = ot_object_keys.findLast((local_key) => local_key < ot_key);
			let upper_key = ot_object_keys.find((local_key) => local_key > ot_key);
			let weight = (ot_key - lower_key) / (upper_key - lower_key);
	
			return (
				ot_object[lower_key] +
				weight * (ot_object[upper_key] - ot_object[lower_key])
			);
		};
	
		// Iterate through GT segments (including augmented RR anchors)
		for (let i = 0; i < all_anchor_keys.length - 1; i++) {
			let start_key = all_anchor_keys[i];
			let end_key = all_anchor_keys[i + 1];
	
			let start_value_gt = object[start_key];
			let end_value_gt = object[end_key];
	
			let start_value_rr = getRRValue(start_key);
			let end_value_rr = getRRValue(end_key);
	
			// Calculate the correction ratios at anchor points
			// Safety check: if RR is 0, we treat the ratio as 0 if GT is 0, otherwise 1
			let start_ratio =
				start_value_rr === 0 ? (start_value_gt === 0 ? 0 : 1) : start_value_gt / start_value_rr;
			let end_ratio =
				end_value_rr === 0 ? (end_value_gt === 0 ? 0 : 1) : end_value_gt / end_value_rr;
	
			// Filter union_keys to only those that fall within this segment
			let segment_keys = union_keys.filter((k) => k >= start_key && k <= end_key);
	
			for (let x of segment_keys) {
				// If we already processed this year in a previous segment, skip it
				if (x === start_key && i > 0) continue;
	
				let current_rr = getRRValue(x);
				let progress = (x - start_key) / (end_key - start_key);
	
				// Linearly interpolate the discrepancy ratio
				let interpolated_ratio =
					start_ratio + progress * (end_ratio - start_ratio);
	
				return_obj[x] = current_rr * interpolated_ratio;
			}
		}
	
		// Return statement
		return return_obj;
	};
	
	/**
	 * Interpolates negative values by carrying over the last positive value found.
	 * @alias Object.interpolateNegatives
	 *
	 * @param {Object} arg0_object
	 *
	 * @returns {Object}
	 */
	Object.interpolateNegatives = function (arg0_object) {
		//Convert from parameters
		let object = arg0_object;
		
		//Declare local instance variables
		let all_object_keys = Object.keys(object)
			.map(Number).sort((a, b) => a - b);
		let last_positive = null;
		
		for (let local_key of all_object_keys) {
			let local_value = object[local_key];
			
			if (local_value >= 0) {
				last_positive = local_value;
			} else if (local_value < 0) {
				object[local_key] = last_positive;
			}
		}
		
		//Return object
		return object;
	};
	
	/**
	 * Inverts a fraction object, fetching the reciprocal of percentage values (1 - n).
	 * @alias Object.invertFraction
	 *
	 * @param {Object} arg0_object - The object to pass.
	 *
	 * @returns {Object}
	 */
	Object.invertFraction = function (arg0_object) {
		//Convert from parameters
		let object = JSON.parse(JSON.stringify(arg0_object));
		
		//Declare local instance variables
		let all_object_keys = Object.keys(object);
		
		//Iterate over all_object_keys
		for (let i = 0; i < all_object_keys.length; i++) {
			let local_value = object[all_object_keys[i]];
			
			object[all_object_keys[i]] = 1 - local_value;
		}
		
		//Return statement
		return object;
	};
	
	/**
	 * linearInterpolationObject() - Performs a linear interpolation operation on an object.
	 * @param {Object} arg0_object - The object to perform the linear interpolation on.
	 * @param {Object} [arg1_options]
	 *  @param {boolean} [arg1_options.all_years=false] - Optional. Whether to interpolate for every single year in the domain.
	 *  @param {Array<number>} [arg1_options.years] - Optional. The years to interpolate over if possible.
	 *
	 * @return {Object}
	 */
	Object.linearInterpolation = function (arg0_object, arg1_options) {
		// Convert from parameters
		let object = arg0_object;
		let options = arg1_options ? arg1_options : {};
		
		// Declare local instance variables
		let sorted_indices = Object.sortYearValues(object);
		let values = sorted_indices.values;
		let years = sorted_indices.years;
		
		// Guard clause if there are less than 2 years
		if (years.length < 2) return object;
		
		// Initialise target years for interpolation
		let target_years = options.years ? Array.toArray(options.years) : years;
		
		if (options.all_years) {
			var object_domain = Object.getDomain(object);
			target_years = [];
			
			// Iterate between object_domain[0] and object_domain[1]
			for (var i = object_domain[0]; i <= object_domain[1]; i++)
				target_years.push(i);
		}
		
		// Iterate over all requested years
		for (let i = 0; i < target_years.length; i++) {
			let current_year = target_years[i];
			let min_year = Math.returnSafeNumber(years[0]);
			let max_year = Math.returnSafeNumber(years[years.length - 1]);
			
			if (current_year >= min_year && current_year <= max_year) {
				// Find the two bounding points for linear interpolation
				let left_index = 0;
				
				for (let j = 0; j < years.length - 1; j++)
					if (current_year >= years[j] && current_year <= years[j + 1]) {
						left_index = j;
						break;
					}
				
				let pair_x = [years[left_index], years[left_index + 1]];
				let pair_y = [values[left_index], values[left_index + 1]];
				
				object[current_year] = Array.linearInterpolation(
					pair_x,
					pair_y,
					current_year,
				);
			}
		}
		
		// Return statement
		return object;
	};
	
	/**
	 * Modifies ranges in an object recursively, by operating on objects.
	 * @alias Object.modifyRanges
	 *
	 * @param {Object} arg0_object - The object to pass.
	 * @param {number} arg1_value - The value to modify ranges by.
	 * @param {Object} [arg2_options]
	 *  @param {boolean} [arg2_options.include_numbers=true] - Whether to include single numbers.
	 *
	 * @returns {Object}
	 */
	Object.modifyRanges = function (arg0_object, arg1_value, arg2_options) {
		//Convert from parameters
		let object = arg0_object;
		let value = Math.returnSafeNumber(arg1_value);
		let options = (arg2_options) ? arg2_options : {};
		
		//Initialise options
		options.include_numbers = (options.include_numbers !== false);
		
		//Declare local instance variables
		let all_object_keys = Object.keys(object);
		
		//Iterate over all_object
		for (let i = 0; i < all_object_keys.length; i++) {
			let local_value = object[all_object_keys[i]];
			
			//Check if local_value is a range
			if (Array.isArray(local_value))
				if (local_value.length === 2)
					if (Array.isType(local_value, "number")) {
						local_value[0] += value;
						local_value[1] += value;
					}
			//Check if local_value is a number
			if (options.include_numbers && typeof local_value === "number")
				object[all_object_keys[i]] += value;
		}
		
		//Return statement
		return object;
	};
	
	/**
	 * Multiplies an object by a value, recursively.
	 * @alias Object.multiply
	 *
	 * @param {Object} arg0_object - The object to pass.
	 * @param {number} arg1_value - The value to multiply each variable by.
	 *
	 * @returns {Object}
	 */
	Object.multiply = function (arg0_object, arg1_value) {
		//Convert from parameters
		let object = arg0_object;
		let value = arg1_value;
		
		//Return statement
		return Object.operate(object, `n*${value}`);
	};
	
	/**
	 * Multiplies an object recursively.
	 * @alias Object.multiplyObjects
	 *
	 * @param {Object} arg0_object - The 1st object to pass.
	 * @param {Object} arg1_object - The 2nd object to pass.
	 * @param {Object} [arg2_options]
	 *  @param {boolean} [arg2_options.recursive=true] - Whether the operation is recursive.
	 *
	 * @returns {Object}
	 */
	Object.multiplyObjects = function (arg0_object, arg1_object, arg2_options) {
		//Convert from parameters
		let object = arg0_object;
		let ot_object = arg1_object;
		let options = (arg2_options) ? arg2_options : {};
		
		//Return statement
		return Object.operate(object, ot_object, `i = i*x`, options);
	};
	
	/**
	 * Performs an operation on a single object, recursively.
	 * @alias Object.operate
	 *
	 * @param {Object} arg0_object - The object to pass.
	 * @param {string} arg1_equation - The string literal to use as an equation ('n' = current value).
	 * @param {Object} [arg2_options]
	 *  @param {boolean} [arg2_options.log_errors=false] - Whether to log errors.
	 *  @param {boolean} [arg2_options.only_numbers=true] - Whether only numbers can be operated on.
	 *  @param {boolean} [arg2_options.recursive=true] - Whether the operation is recursive.
	 *
	 * @returns {Object}
	 */
	Object.operate = function (arg0_object, arg1_equation, arg2_options) {
		//Convert from parameters
		let object = arg0_object;
		let equation = arg1_equation;
		let options = (arg2_options) ? arg2_options : {};
		
		//Declare local instance variables
		let all_object_keys = Object.keys(object);
		let log_error_string = (options.log_errors) ? `console.log(e);` : "";
		let only_numbers = (options.only_numbers !== false);
		
		let equation_expression = `
			try { return ${equation}; } catch (e) {${log_error_string}};
		`;
		let equation_function = new Function("n", equation_expression);
		let processed_object = {};
		
		//Calculate the operation recursively
		for (let i = 0; i < all_object_keys.length; i++) {
			let local_value = object[all_object_keys[i]];
			
			if (typeof local_value == "object" && !Array.isArray(local_value)) {
				if (options.recursive !== false)
					processed_object[all_object_keys[i]] = Object.operate(local_value, equation, options);
			} else {
				if ((only_numbers && typeof local_value == "number") || !only_numbers) {
					processed_object[all_object_keys[i]] = equation_function(local_value);
				} else {
					processed_object[all_object_keys[i]] = local_value;
				}
			}
		}
		
		//Return statement
		return processed_object;
	};
	
	/**
	 * Performs an operation on two objects together, recursively.
	 * @alias Object.operateObjects
	 *
	 * @param {Object} arg0_object - The 1st object to pass.
	 * @param {Object} arg1_object - The 2nd object to pass.
	 * @param {string} arg2_equation - The string literal ('i' = 1st obj, 'x' = 2nd obj).
	 * @param {Object} [arg3_options]
	 *  @param {boolean} [arg3_options.log_errors=false] - Whether to log errors.
	 *  @param {boolean} [arg3_options.only_numbers=true] - Whether only numbers can be operated on.
	 *  @param {boolean} [arg3_options.recursive=true] - Whether the operation is recursive.
	 *
	 * @returns {{object: Object, ot_object: Object}}
	 */
	Object.operateObjects = function (arg0_object, arg1_object, arg2_equation, arg3_options) {
		//Convert from parameters
		let object = arg0_object;
		let ot_object = arg1_object;
		let equation = arg2_equation;
		let options = (arg3_options) ? arg3_options : {};
		
		//Declare local instance variables
		let all_object_keys = Object.keys(object);
		let all_ot_object_keys = Object.keys(ot_object);
		let only_numbers = (options.only_numbers !== false);
		
		let equation_expression = `
			try { ${equation} } catch (e) {};
			return { object: i, ot_object: x };
		`;
		let equation_function = new Function("i", "x", equation_expression);
		let processed_object = {};
		let processed_ot_object = {};
		
		//Combine keys from both objects to ensure full coverage
		let combined_keys = Array.from(new Set([...all_object_keys, ...all_ot_object_keys]));
		
		for (let key of combined_keys) {
			let i_value = object[key];
			let x_value = ot_object[key];
			
			//Defaults
			if (i_value === undefined) i_value = 0;
			if (x_value === undefined) x_value = 0;
			
			if (typeof i_value === "object" && !Array.isArray(i_value)) {
				if (options.recursive !== false) {
					let local_return_values = Object.operateObjects(i_value, x_value, equation, options);
					processed_object[key] = local_return_values.object;
					processed_ot_object[key] = local_return_values.ot_object;
				}
			} else {
				let local_return_values = equation_function(i_value, x_value);
				
				if ((only_numbers && typeof i_value === "number" && typeof x_value === "number") || !only_numbers) {
					processed_object[key] = local_return_values.object;
					processed_ot_object[key] = local_return_values.ot_object;
				} else {
					processed_object[key] = i_value;
					processed_ot_object[key] = x_value;
				}
			}
		}
		
		//Return statement
		return {
			object: processed_object,
			ot_object: processed_ot_object
		};
	};
	
	/**
	 * Standardises the object to maximum = 1, adjusting all other values proportionally.
	 * @alias Object.standardiseFraction
	 *
	 * @param {Object} arg0_object - The object to pass.
	 *
	 * @returns {Object}
	 */
	Object.standardiseFraction = function (arg0_object) {
		//Convert from parameters
		let object = JSON.parse(JSON.stringify(arg0_object));
		
		//Declare local instance variables
		let all_object_keys = Object.keys(object);
		let object_maximum = Object.getMaximum(object);
		
		//Iterate over all_object_keys
		for (let i = 0; i < all_object_keys.length; i++) {
			let local_value = object[all_object_keys[i]];
			
			if (object_maximum === 0) {
				object[all_object_keys[i]] = 0;
			} else {
				object[all_object_keys[i]] = local_value/object_maximum;
			}
		}
		
		//Return statement
		return object;
	};
	
	/**
	 * Standardises the object to a given total.
	 * @alias Object.standardisePercentage
	 *
	 * @param {Object} arg0_object - The object to pass.
	 * @param {number} [arg1_total=1] - The total figure to adjust the object to.
	 * @param {boolean} [arg2_round=false] - Whether to force rounding.
	 *
	 * @returns {Object}
	 */
	Object.standardisePercentage = function (arg0_object, arg1_total, arg2_round) {
		//Convert from parameters
		let object = JSON.parse(JSON.stringify(arg0_object));
		let total = (arg1_total) ? arg1_total : 1;
		let round = arg2_round;
		
		//Declare local instance variables
		let all_object_keys = Object.keys(object);
		let object_total = 0;
		
		//Fetch object_total
		for (let i = 0; i < all_object_keys.length; i++)
			object_total += Math.returnSafeNumber(object[all_object_keys[i]]);
		
		//Standardise to object_total
		for (let i = 0; i < all_object_keys.length; i++) {
			let local_value = object[all_object_keys[i]];
			
			//Set local_value to % value
			local_value = local_value/object_total;
			
			//Multiply % value by total
			object[all_object_keys[i]] = (round) ?
				Math.ceil(local_value*total) : local_value * total;
		}
		
		//Return statement
		return object;
	};
	
	/**
	 * Subtracts a value from an object, recursively.
	 * @alias Object.subtract
	 *
	 * @param {Object} arg0_object - The object to pass.
	 * @param {number} arg1_value - The value to subtract.
	 *
	 * @returns {Object}
	 */
	Object.subtract = function (arg0_object, arg1_value) {
		//Convert from parameters
		let object = arg0_object;
		let value = arg1_value;
		
		//Return statement
		return Object.operate(object, `n - ${value}`);
	};
	
	/**
	 * Subtracts one object from another, recursively.
	 * @alias Object.subtractObjects
	 *
	 * @param {Object} arg0_object - The 1st object.
	 * @param {Object} arg1_object - The 2nd object.
	 * @param {Object} [arg2_options]
	 *  @param {boolean} [arg2_options.recursive=true] - Whether recursive.
	 *
	 * @returns {{object: Object, ot_object: Object}}
	 */
	Object.subtractObjects = function (arg0_object, arg1_object, arg2_options) {
		//Convert from parameters
		let object = arg0_object;
		let ot_object = arg1_object;
		let options = (arg2_options) ? arg2_options : {};
		
		//Return statement
		return Object.operateObjects(object, ot_object, `i = i - x`, options);
	};
	
	/**
	 * Trims a specific value from the start and/or end of an object map.
	 * @alias Object.trimValue
	 *
	 * @param {Object<number>} arg0_object
	 * @param {Object} [arg1_options]
	 *  @param {boolean} [arg1_options.trim_start=true] - Remove leading target values.
	 *  @param {boolean} [arg1_options.trim_end=true] - Remove trailing target values.
	 *  @param {number} [arg1_options.value=0] - The value to trim.
	 */
	Object.trimValue = function (arg0_object, arg1_options) {
		// Convert from parameters
		let object = arg0_object ? arg0_object : {};
		let options = arg1_options ? arg1_options : {};
		
		if (options.trim_start === undefined) options.trim_start = true;
		if (options.trim_end === undefined) options.trim_end = true;
		options.value =
			typeof Math.returnSafeNumber === "function"
				? Math.returnSafeNumber(options.value)
				: options.value || 0;
		
		// Declare local instance variables
		let all_keys = Object.keys(object)
		.map(Number)
		.sort((a, b) => a - b);
		let return_obj = {};
		
		let start_index = 0;
		let end_index = all_keys.length - 1;
		
		// Find the first index that is NOT the target value
		if (options.trim_start) {
			while (
				start_index < all_keys.length &&
				object[all_keys[start_index]] === options.value
				) {
				start_index++;
			}
		}
		
		// Find the last index that is NOT the target value
		if (options.trim_end) {
			while (
				end_index >= start_index &&
				object[all_keys[end_index]] === options.value
				) {
				end_index--;
			}
		}
		
		// Build the new object from the sliced range
		for (let i = start_index; i <= end_index; i++) {
			let current_key = all_keys[i];
			return_obj[current_key] = object[current_key];
		}
		
		return return_obj;
	};
}