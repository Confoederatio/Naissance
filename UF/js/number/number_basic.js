//Initialise methods
{
	if (!global.Math)
		/**
		 * The namespace for all UF/Number utility functions, typically for static methods.
		 * 
		 * @namespace Math
		 */
		global.Math = {};
	
	/**
	 * Alphabetises a given number into a string (a0-j9).
	 * @alias Math.alphabetise
	 * 
	 * @param {number} arg0_string
	 * 
	 * @returns {string}
	 */
	Math.alphabetise = function (arg0_string) {
		//Convert from parameters
		let string = arg0_string.toString();
		
		//Declare local instance variables
		let alphabet_array = "abcdefghij";
		let alphabetised_string = "";
		
		//Iterate over number to alphabetise it
		for (let i = 0; i < string.length; i++)
			if (!isNaN(parseInt(string[i]))) {
				alphabetised_string += alphabet_array[parseInt(string[i])];
			} else {
				alphabetised_string += string[i];
			}
		
		//Return statement
		return alphabetised_string;
	};
	
	/**
	 * Converts degrees to radians.
	 * @alias Math.degreesToRadians
	 * 
	 * @param {number} arg0_degrees
	 * 
	 * @returns {number}
	 */
	Math.degreesToRadians = function (arg0_degrees) {
		//Convert from parameters
		let degrees = arg0_degrees;
		
		//Return statement
		return degrees*(Math.PI/180);
	};
	
	/**
	 * Deordinalises a string.
	 * @alias Math.deordinalise
	 * 
	 * @param {string} arg0_string
	 * 
	 * @returns {number}
	 */
	Math.deordinalise = function (arg0_string) {
		//Convert from parameters
		let string = arg0_string;
		
		//Declare local instance variables
		let ordinals = ["st", "nd", "rd", "th"];
		
		//Iterate through all ordinals and replace them with nothing
		for (let i = 0; i < ordinals.length; i++)
			string = string.replace(ordinals[i], "");
		
		//Return string as number
		return parseInt(string);
	};
	
	Math.exponentiate = function (arg0_number, arg1_number) {
		//Convert from parameters
		let base = arg0_number;
		let power = arg1_number;
		
		//Return statement
		return Math.pow(base, power);
	};
	
	Math.factorial = function (arg0_number) {
		//Convert from parameters
		let number = parseInt(arg0_number);
		
		//Guard clause
		if (isNaN(number)) return number;
		
		//Declare local instance variables
		let f_array = [];
		
		//Memorisation algorithm
		if (number === 0 || number === 1)
			return 1;
		if (f_array[number] > 0)
			return f_array[number];
		
		//Return statement
		return f_array[number] = Math.factorial(number - 1)*number;
	};
	
	Math.generateRandomID = function (arg0_object) {
		//Convert from parameters
		let input_object = arg0_object;
		
		//Declare local instance variables
		let random_id = Math.randomNumber(0, 100000000000).toString();
		
		//Check if input_object is defined
		if (typeof input_object == "object") {
			while (true) {
				let local_id = Math.generateRandomID();
				
				//Return and break once a true ID is found
				if (!input_object[local_id])
					//Return statement
					return local_id;
			}
		} else {
			//Return statement
			return random_id;
		}
	};
	
	Math.geometricMean = function (arg0_values) {
		//Convert from parameters
		let values = Array.toArray(arg0_values);
		
		//Guard clause if array is empty
		if (values.length === 0) return 0;
		
		//Declare local instance variables
		let product = values.reduce((acc, val) => acc*val, 1);
		
		//Return statement
		return Math.pow(product, 1/values.length);
	};
	
	Math.logarithm = function (arg0_x, arg1_y) {
		//Convert from parameters
		let x = arg0_x;
		let y = arg1_y;
		
		//Return statement
		return (x !== undefined && y !== undefined) ?
			Math.log(y)/Math.log(x) :
			Math.log(x);
	};
	
	Math.logFactorial = function (arg0_number) {
		//Convert from parameters
		let number = arg0_number;
		
		//Return statement
		if (number === 0 || number === 1) {
			//Return statement
			return 0;
		} else {
			let result = 0;
			
			//Iterate over lengths longer than 2
			for (let i = 2; i <= number; i++)
				result += Math.log(i);
			
			//Return statement
			return result;
		}
	};
	
	/**
	 * Numerises a given string back into a number (a0-j9).
	 * @alias Math.numerise
	 * 
	 * @param {string} arg0_string
	 * 
	 * @returns {number}
	 */
	Math.numerise = function (arg0_string) {
		//Convert from parameters
		let string = arg0_string.toString();
		
		//Declare local instance variables
		let alphabet_array = { a: 0, b: 1, c: 2, d: 3, e: 4, f: 5, g: 6, h: 7, i: 8, j: 9 };
		let alphabetised_string = "";
		
		//Iterate over string to convert it back into numbers
		for (let i = 0; i < string.length; i++)
			if (alphabet_array[string[i]] !== undefined) {
				alphabetised_string += alphabet_array[string[i]];
			} else {
				alphabetised_string += string[i];
			}
		
		//Return statement
		return parseFloat(alphabetised_string);
	};
	
	Math.oldDeordinalise = function (arg0_string) {
		//Convert from parameters
		let deordinalised_string = arg0_string;
		
		//Declare local instance variables
		let ordinals = ["st", "nd", "rd", "th"];
		
		//Split deordinalised_string into multiple chunks, remove stray ordinals
		deordinalised_string = (deordinalised_string.includes(" ")) ?
			deordinalised_string.split(" ") : [deordinalised_string];
		
		for (let i = 0; i < deordinalised_string.length; i++) {
			for (let x = 0; x < ordinals.length; x++)
				if (deordinalised_string[i].indexOf(ordinals[x]) == 0)
					deordinalised_string[i] = deordinalised_string[i].replace(ordinals[x], "");
			if (deordinalised_string[i] == "")
				deordinalised_string.splice(i, 1);
		}
		
		//Iterate over to purge ordinals
		for (let i = 0; i < deordinalised_string.length; i++) {
			//Look for ordinal
			let ordinal_found = false;
			
			//Check if an ordinal was found
			for (let x = 0; x < ordinals.length; x++)
				if (deordinalised_string[i].indexOf(ordinals[x]) !== -1)
					ordinal_found = true;
			
			let total_ordinal_amount = (ordinal_found) ? 2 : 0;
			let ordinal_percentage = total_ordinal_amount/deordinalised_string[i].length;
			
			if (ordinal_percentage > 0.67) //Ordinal makes up majority of string, so delete
				deordinalised_string.splice(i, 1);
		}
		
		//Return statement
		return deordinalised_string.join(" ").trim();
	};
	
	Math.ordinalise = function (arg0_number) {
		//Convert from parameters
		let i = arg0_number;
		
		//Declare local instance variables
		let negative_suffix = (i < 0) ? `-` : "";
		
		i = Math.abs(i);
		let j = i % 10, k = i % 100;
		
		//Return statement
		if (j === 1 && k !== 11)
			return `${negative_suffix}${i}st`;
		if (j === 2 && k !== 12)
			return `${negative_suffix}${i}nd`;
		if (j === 3 && k !== 13)
			return `${negative_suffix}${i}rd`;
		return `${negative_suffix}${i}th`;
	};
	
	Math.parseNumber = function (arg0_number, arg1_options) {
		//Convert from parameters
		let number = Math.returnSafeNumber(arg0_number);
		let options = (arg1_options) ? arg1_options : {};
		
		//Return statement
		return (
			(options.display_prefix) ?
				(number > 0) ? "+" : ""
				: ""
		) + Intl.NumberFormat((options.locale) ? options.locale : "de").format(
			(typeof number === "number") ?
				(options.display_float) ?
					parseInt(number*100*100)/100/100 :
					parseInt(number) :
				parseInt(number)
		);
	};
	
	Math.radiansToDegrees = function (arg0_radians) {
		//Convert from parameters
		let radians = arg0_radians;
		
		//Return statement
		return (radians*180)/Math.PI;
	};
	
	/**
	 * Generates a random number between [arg0_min, arg1_max].
	 * @alias Math.randomNumber
	 *
	 * @param {number} arg0_min
	 * @param {number} arg1_max
	 * @param {Object} [arg2_options]
	 *  @param {boolean} [arg2_options.do_not_round]
	 *
	 * @returns {number}
	 */
	Math.randomNumber = function (arg0_min, arg1_max, arg2_options) {
		//Convert from parameters
		let min = arg0_min;
		let max = arg1_max;
		let options = (arg2_options) ? arg2_options : {
			do_not_round: false
		};
		
		//Declare local instance variables
		let random_number = Math.random()*(max - min) + min;
		
		//Return statement
		return (!options.do_not_round) ? Math.round(random_number) : random_number;
	};
	
	/**
	 * Returns a safe number from a given variable.
	 * @alias Math.returnSafeNumber
	 * 
	 * @param {any} arg0_number
	 * @param {number} [arg1_default=0]
	 * 
	 * @returns {number}
	 */
	Math.returnSafeNumber = function (arg0_number, arg1_default) {
		//Convert from parameters
		let number = parseFloat(arg0_number);
		let default_value = (arg1_default !== undefined) ? arg1_default : 0;
		
		//Return statement
		return (!isNaN(number) && isFinite(number)) ? number : default_value;
	};
	
	/**
	 * Nth roots a number.
	 * @alias Math.root
	 * 
	 * @param {number} arg0_number
	 * @param {number} arg1_root
	 * 
	 * @returns {number}
	 */
	Math.root = function (arg0_number, arg1_root) {
		//Convert from parameters
		let number = arg0_number;
		let root = arg1_root;
		
		//Conduct nth root operation
		try {
			let negate = (root % 2 === 1 && number < 0);
			let possible = Math.pow(number, 1/root);
			
			if (negate) number = -number;
			root = Math.pow(possible, root);
			
			//Return statement
			if (Math.abs(number - root) < 1 && (number > 0 === root > 0))
				return negate ? -possible : possible;
		} catch {}
	}
	
	/**
	 * Rounds a number to a specific number of places.
	 * @alias Math.roundNumber
	 * 
	 * @param arg0_number
	 * @param arg1_places
	 * @returns {string}
	 */
	Math.roundNumber = function (arg0_number, arg1_places) {
		//Convert from parameters
		let number = parseFloat(arg0_number);
		let places = Math.returnSafeNumber(arg1_places, 1);
		
		//Declare local instance variables
		return number.toFixed(places);
	};
	
	Math.sigfig = function (arg0_number, arg1_sigfigs) {
		//Convert from parameters
		let number = arg0_number;
		let sigfigs = arg1_sigfigs;
		
		//Guard clause
		if (number === 0) return 0;
		
		//Declare local instance variables
		let magnitude = Math.floor(Math.log10(Math.abs(number))) + 1;
		let multiplier = Math.pow(10, n - magnitude);
		
		//Return statement
		return Math.round(number*multiplier)/multiplier;
	};
	
	Math.splitNumber = function (arg0_number, arg1_parts) {
		//Convert from parameters
		let number = arg0_number;
		let parts = arg1_parts;
		
		//Return statement
		return [...Math.splitNumberParts(number, parts)];
	};
	
	Math.splitNumberParts = function* (arg0_number, arg1_parts) {
		//Convert from parameters
		let number = arg0_number;
		let parts = arg1_parts;
		
		//Declare local instance variables
		let sum_parts = 0;
		
		//Split number randomly
		for (let i = 0; i < parts - 1; i++) {
			let part_number = Math.random()*(number - sum_parts);
			yield part_number;
			sum_parts += part_number;
		}
		
		yield number - sum_parts;
	};
	
	Math.unzero = function (arg0_number, arg1_default) {
		//Convert from parameters
		let number = Math.returnSafeNumber(arg0_number);
		let default_number = (arg1_default) ? arg1_default : 1;
		
		//Return statement
		return (number !== 0) ? number : default_number;
	};
	
	Math.weightedGeometricMean = function (arg0_values) {
		//Convert from parameters
		let values = Array.toArray(arg0_values);
		
		//Guard clause if no values are present
		if (values.length === 0) return 0;
		
		//Declare local instance variables
		let negatives = values.filter(v => v < 0).map(Math.abs);
		let positives = values.filter(v => v > 0);
		
		//Guard clause if there are only zeroes
		if (negatives.length + positives.length === 0) return 0;
		
		let negative_gm = negatives.length > 0 ? Math.geometricMean(negatives) : 0;
		let positive_gm = positives.length > 0 ? Math.geometricMean(positives) : 0;
		
		//Return statement; weighted geometric mean
		return (positives.length/values.length)*positive_gm - (negatives.length/values.length)*negative_gm;
	};
}