//Initialise functions
{
	/**
	 * Formats a Date object into a default string.
	 * @param {Object} arg0_date
	 * 
	 * @returns {string}
	 */
	String.formatDate = function (arg0_date) {
		//Convert from parameters
		let date = (arg0_date) ? arg0_date : Date.getCurrentDate();
		
		//Declare local instance variables
		let day_name = String.ordinalise(date.day);
		let minute_name =  date.minute.toString().padStart(2, "0");
		let month_name = Date.months[Object.keys(Date.months)[date.month - 1]].name;
		let hour_name = date.hour.toString().padStart(2, "0");
		
		//Return statement
		return `${day_name} ${month_name} ${Math.abs(date.year)}${(date.year >= 0) ? "AD" : "BC"} - ${hour_name}:${minute_name}`;
	};
	
	String.formatDateLength = function (arg0_seconds) {
		//Convert from parameters
		let seconds = Math.returnSafeNumber(arg0_seconds);
		
		//Declare local instance variables
		let days = Math.floor(seconds/86400);
			seconds %= 86400;
		let hours = Math.floor(seconds/3600);
			seconds %= 3600;
		let minutes = Math.floor(seconds/60);
			seconds %= 60;
		
		//Return statement
		return `${String.formatNumber(days)} day(s), ${String.formatNumber(hours)} hour(s), ${String.formatNumber(minutes)} minute(s), ${String.formatNumber(seconds)} second(s)`;
	};
	
	/**
	 * Formats a number based off of the selected locale, rounding it to the specified number of places.
	 * @param {number} arg0_number
	 * @param {number} [arg1_places=0]
	 * 
	 * @returns {string}
	 */
	String.formatNumber = function (arg0_number, arg1_places) {
		//Convert from parameters
		let number = parseFloat(arg0_number);
		let places = Math.returnSafeNumber(arg1_places, 0);
		
		//Round to sigfigs first
		number = Math.roundNumber(number, places);
		
		//Return statement
		return new Intl.NumberFormat("de-DE").format(number);
	};
	
	/**
	 * Ordinalises a given number and returns it as a string.
	 * @param {number} arg0_number
	 * 
	 * @returns {string}
	 */
	String.ordinalise = function (arg0_number) {
		//Convert from parameters
		let number = Math.returnSafeNumber(arg0_number);
		
		//Declare local instance variables
		let negative_suffix = (number < 0) ? "-" : "";
			number = Math.abs(number);
		let n_a = number % 10, n_b = number % 100;
		
		//Return statement
		if (n_a === 1 && n_b !== 11)
			return `${negative_suffix}${number}st`;
		if (n_a === 2 && n_b !== 12)
			return `${negative_suffix}${number}nd`;
		if (n_a === 3 && n_b !== 13)
			return `${negative_suffix}${number}rd`;
		return `${negative_suffix}${number}th`;
	};
	
	/**
	 * Checks whether a given string is loosely a valid URL.
	 * 
	 * @returns {boolean}
	 */
	String.prototype.isURL = function () {
		//Return statement
		try {
			new URL(this);
			return true;
		} catch (e) {
			return false;
		}
	};
}