//Initialise functions
{
	/**
	 * The number of milliseconds ago a Date was from the present timestamp.
	 * @alias Date.getMillisecondsAgo
	 *
	 * @param {Date|any} arg0_date
	 *
	 * @returns {number}
	 */
	Date.getMillisecondsAgo = function (arg0_date) {
		//Convert from parameters
		let timestamp = Date.getModernTimestamp(arg0_date);
		
		//Declare local instance variables
		let now = Date.now();
		
		//Return statement
		return now - timestamp*1000;
	};
	
	/**
	 * The number of seconds ago a Date was from the present timestamp.
	 * @alias Date.getSecondsAgo
	 * 
	 * @param {Date|any} arg0_date
	 * 
	 * @returns {number}
	 */
	Date.getSecondsAgo = function (arg0_date) {
		//Return statement
		return Math.floor(Date.getMillisecondsAgo(arg0_date)/1000);
	};
	
	/**
	 * The number of seconds ago a Date was from the present timestamp.
	 * @alias Date.getMinutesAgo
	 *
	 * @param {Date|any} arg0_date
	 *
	 * @returns {number}
	 */
	Date.getMinutesAgo = function (arg0_date) {
		//Return statement
		return Math.floor(Date.getMillisecondsAgo(arg0_date)/(1000*60));
	};
	
	/**
	 * The number of seconds ago a Date was from the present timestamp.
	 * @alias Date.getHoursAgo
	 *
	 * @param {Date|any} arg0_date
	 *
	 * @returns {number}
	 */
	Date.getHoursAgo = function (arg0_date) {
		//Return statement
		return Math.floor(Date.getMillisecondsAgo(arg0_date)/(1000*60*60));
	};
	
	/**
	 * The number of days ago a Date was from the present timestamp.
	 * @alias Date.getDaysAgo
	 * 
	 * @param {Date|any} arg0_date
	 * 
	 * @returns {number}
	 */
	Date.getDaysAgo = function (arg0_date) {
		//Return statement
		return Math.floor(Date.getMillisecondsAgo(arg0_date)/(1000*60*60*24));
	};
}