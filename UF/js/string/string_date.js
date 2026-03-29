//Initialise functions
{
	if (!global.String) global.String = {};
	
	/**
	 * Returns a given Date as a timestamp string.
	 * @alias String.getDateString
	 * 
	 * @param {Date|any} [arg0_date=new Date()]
	 * @param {Object} [arg1_options]
	 *  @param {string} [arg1_options.mode="day"] - Either 'day'/'month'/'year'.
	 */
	//[WIP] - Add additional modes in the future
	String.getDateString = function (arg0_date, arg1_options) {
		//Convert from parameters
		let date = (arg0_date) ? Date.getDate(arg0_date) : new Date();
		let options = (arg1_options) ? arg1_options : {};
		
		//Initialise options
		if (!options.mode) options.mode = "day";
		
		//Return statement
		if (options.mode === "day") return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
		if (options.mode === "month") return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}`;
		if (options.mode === "year") return `${date.getFullYear()}`;
	};
}