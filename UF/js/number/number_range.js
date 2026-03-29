//Initialise methods
{
	if (!global.Math) global.Math = {};
	
	/**
	 * Adds a number to a range.
	 * @alias Math.addRange
	 * 
	 * @param {number[]} arg0_range
	 * @param {number} arg1_number
	 * 
	 * @returns {number[]}
	 */
	Math.addRange = function (arg0_range, arg1_number) {
		//Convert from parameters
		let range = arg0_range;
		let number = arg1_number;
		
		if (isNaN(number)) return range; //Internal guard clause for number
		
		//Add number to range
		range[0] += number;
		range[1] += number;
		
		//Return statement
		return range;
	};
	
	/**
	 * Adds a range by another.
	 * @alias Math.addRanges
	 * 
	 * @param {number[]} arg0_range
	 * @param {number[]} arg1_range
	 * 
	 * @returns {number[]}
	 */
	Math.addRanges = function (arg0_range, arg1_range) {
		//Convert from parameters
		let range = Math.getRange(arg0_range);
		let ot_range = Math.getRange(arg1_range);
		
		//Declare local instance variables
		let return_range = structuredClone(range);
		
		//Apply operator
		return_range[0] += ot_range[0];
		return_range[1] += ot_range[1];
		
		//Return statement
		return return_range.sort();
	};
	
	/**
	 * Divides a range by another.
	 * @alias Math.divideRange
	 * 
	 * @param {number[]} arg0_range
	 * @param {number} arg1_number
	 * 
	 * @returns {number[]}
	 */
	Math.divideRange = function (arg0_range, arg1_number) {
		//Convert from parameters
		let range = arg0_range;
		let number = arg1_number;
		
		//Guard clause for number
		if (isNaN(number)) return range;
		
		//Divide range by number
		range[0] /= number;
		range[1] /= number;
		
		//Return statement
		return range;
	};
	
	/**
	 * Divides a range by another.
	 * @alias Math.divideRanges
	 * 
	 * @param {number[]} arg0_range
	 * @param {number[]} arg1_range
	 * 
	 * @returns {number[]}
	 */
	Math.divideRanges = function (arg0_range, arg1_range) {
		//Convert from parameters
		let range = Math.getRange(arg0_range);
		let ot_range = Math.getRange(arg1_range);
		
		//Apply operator
		range[0] /= ot_range[0];
		range[1] /= ot_range[1];
		
		//Return statement
		return range.sort();
	};
	
	/**
	 * Exponentiates a range by a given power.
	 * @alias Math.exponentiateRange
	 * 
	 * @param {number[]} arg0_range
	 * @param {number} arg1_power
	 * 
	 * @returns {any|number[]}
	 */
	Math.exponentiateRange = function (arg0_range, arg1_power) {
		//Convert from parameters
		let range = Math.getRange(arg0_range);
		let power = arg1_power;
		
		//Guard clause for power
		if (isNaN(power)) return power;
		
		//Exponentiate range by power
		range[0] = Math.pow(range[0], power);
		range[1] = Math.pow(range[1], power);
		
		//Return statement
		return range.sort();
	};
	
	/**
	 * Exponentiates a range by another.
	 * @alias Math.exponentiateRanges
	 * 
	 * @param {number[]} arg0_range
	 * @param {number[]} arg1_range
	 * 
	 * @returns {number[]}
	 */
	Math.exponentiateRanges = function (arg0_range, arg1_range) {
		//Convert from parameters
		let range = Math.getRange(arg0_range);
		let ot_range = Math.getRange(arg1_range);
		
		//Apply operator
		range[0] = Math.pow(range[0], ot_range[0]);
		range[1] = Math.pow(range[1], ot_range[1]);
		
		//Return statement
		return range.sort();
	};
	
	/**
	 * Fetches the midpoint of a range.
	 * @alias Math.getMidpoint
	 * 
	 * @param {number[]} arg0_range
	 * 
	 * @returns {number}
	 */
	Math.getMidpoint = function (arg0_range) {
		//Convert from parameters
		let range = Math.getRange(arg0_range);
		
		//Return statement
		return (range[0] + range[1])/2;
	};
	
	/**
	 * Gets a range from a given variable.
	 * @alias Math.getRange
	 * 
	 * @param {any} arg0_range
	 * 
	 * @returns {number[]}
	 */
	Math.getRange = function (arg0_range) {
		//Convert from parameters
		let range = arg0_range;
		
		//Declare local instance variables
		let range_array = [];
		
		//Check if range is Array
		if (Array.isArray(range)) {
			if (range.length >= 2) {
				range_array = [range[0], range[1]];
			} else if (range.length === 1) {
				range_array = [range[0], range[0]];
			} else {
				range_array = [0, 0];
			}
		} else if (typeof range == "number") {
			range_array = [range, range];
		}
		
		//Return statement
		return JSON.parse(JSON.stringify(range_array.sort()));
	};
	
	/**
	 * Multiplies a range by a number.
	 * @alias Math.multiplyRange
	 * 
	 * @param {number[]} arg0_range
	 * @param {number} arg1_number
	 * 
	 * @returns {number[]}
	 */
	Math.multiplyRange = function (arg0_range, arg1_number) {
		//Convert from parameters
		let range = Math.getRange(arg0_range);
		let number = arg1_number;
		
		//Apply operator
		range[0] *= number;
		range[1] *= number;
		
		//Return statement
		return range.sort();
	};
	
	/**
	 * Multiplies a range by another. 
	 * @alias Math.multiplyRanges
	 * 
	 * @param {number[]} arg0_range
	 * @param {number[]} arg1_range
	 * 
	 * @returns {number[]}
	 */
	Math.multiplyRanges = function (arg0_range, arg1_range) {
		//Convert from parameters
		let range = Math.getRange(arg0_range);
		let ot_range = Math.getRange(arg1_range);
		
		//Apply operator
		range[0] *= ot_range[0];
		range[1] *= ot_range[1];
		
		//Return statement
		return range.sort();
	};
	
	/**
	 * Roots a range by a given number.
	 * @alias Math.rootRange
	 * 
	 * @param {number[]} arg0_range
	 * @param {number} arg1_root
	 * 
	 * @returns {number[]}
	 */
	Math.rootRange = function (arg0_range, arg1_root) {
		//Convert from parameters
		let range = Math.getRange(arg0_range);
		let root = Math.returnSafeNumber(arg1_root);
		
		//Apply operator
		range[0] = root(range[0], root);
		range[1] = root(range[1], root);
		
		//Return statement
		return range.sort();
	};
	
	/**
	 * Roots ranges by one another.
	 * @alias Math.rootRanges
	 * 
	 * @param {number[]} arg0_range
	 * @param {number[]} arg1_range
	 * 
	 * @returns {number[]}
	 */
	Math.rootRanges = function (arg0_range, arg1_range) {
		//Convert from parameters
		let range = Math.getRange(arg0_range);
		let ot_range = Math.getRange(arg1_range);
		
		//Apply operator
		range[0] = Math.root(range[0], ot_range[0]);
		range[1] = Math.root(range[1], ot_range[1]);
		
		//Return statement
		return range.sort();
	};
	
	/**
	 * Subtracts a number from a range.
	 * @alias Math.subtractRange
	 * 
	 * @param {number[]} arg0_range
	 * @param {number} arg1_number
	 * 
	 * @returns {number[]}
	 */
	Math.subtractRange = function (arg0_range, arg1_number) {
		//Convert from parameters
		let range = Math.getRange(arg0_range);
		let number = arg1_number;
		
		//Apply operator
		range[0] -= number;
		range[1] -= number;
		
		//Return statement
		return range.sort();
	};
	
	/**
	 * Subtracts a range from another.
	 * @alias Math.subtractRanges
	 * 
	 * @param {number[]} arg0_range
	 * @param {number[]} arg1_range
	 * 
	 * @returns {number[]}
	 */
	Math.subtractRanges = function (arg0_range, arg1_range) {
		//Convert from parameters
		let range = Math.getRange(arg0_range);
		let ot_range = Math.getRange(arg1_range);
		
		//Apply operator
		range[0] -= ot_range[0];
		range[1] -= ot_range[1];
		
		//Return statement
		return range.sort();
	};
}

//KEEP AT BOTTOM! Initialise function aliases
{
	/**
	 * @alias Math.modifyRange
	 * @type function
	 */
	Math.modifyRange = Math.addRange;
}