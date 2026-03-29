//Initialise functions
{
	if (!global.String) global.String = {};
	
	/**
	 * Strips Markdown from a string.
	 * @alias String.stripMarkdown
	 * 
	 * @returns {string}
	 */
	String.stripMarkdown = function (arg0_string) {
		//Convert from parameters
		let string = arg0_string;
		
		//Declare local instance variables
		let processed_string = string.toString();
		
		//Return statement
		return processed_string.replace(/(__)|(\*\*)/gm, "");
	};
	
	/**
	 * Strips all non-numeric characters (0-9) from a string.
	 * @alias String.stripNonNumerics
	 * 
	 * @param {string} arg0_string
	 * 
	 * @returns {string}
	 */
	String.stripNonNumerics = function (arg0_string) {
		//Convert from parameters
		let string = arg0_string;
		
		//Return statement
		return string.replace(/[^0-9]/g, "");
	};
}