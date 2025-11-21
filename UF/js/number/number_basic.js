//Initialise methods
{
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
	
	/**
	 * Generates a random number between [arg0_min, arg1_max].
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
	
	Math.returnSafeNumber = function (arg0_number, arg1_default) {
		//Convert from parameters
		let number = parseFloat(arg0_number);
		let default_value = (arg1_default !== undefined) ? arg1_default : 0;
		
		//Return statement
		return (!isNaN(number)) ? number : default_value;
	};
	
	Math.roundNumber = function (arg0_number, arg1_places) {
		//Convert from parameters
		let number = parseFloat(arg0_number);
		let places = Math.returnSafeNumber(arg1_places, 1);
		
		//Declare local instance variables
		return number.toFixed(places);
	};
}