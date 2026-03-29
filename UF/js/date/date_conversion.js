//Initialise functions
{
	/**
	 * Converts a given string to a Date object if possible.
	 * @alias Date.convertStringToDate
	 * 
	 * @param {string} arg0_date_string
	 * @param [arg1_delimiter="."]
	 * 
	 * @returns {{year: number, month: number, day: number, hour: number, minute: number}|undefined}
	 */
	Date.convertStringToDate = function (arg0_date_string, arg1_delimiter) {
		//Convert from parameters
		let date_string = arg0_date_string;
		let delimiter = (arg1_delimiter) ? arg1_delimiter : ".";
		
		//Declare local instance variables
		let date_array = date_string.split(delimiter);
		let date_obj = Date.getBlankDate();
		let date_properties = ["year", "month", "day", "hour", "minute"];
		
		//Check to make sure that the inputted date_string is valid
		for (let i = 0; i < date_array.length; i++)
			if (isNaN(parseInt(date_array[i])))
				return;
		
		//Iterate over all elements in date_array and cast them to a date object
		for (let i = 0; i < date_array.length; i++)
			if (date_properties[i])
				date_obj[date_properties[i]] = parseInt(date_array[i]);
		
		//Return statement
		return date_obj;
	};
	
	/**
	 * Converts a timestamp to a Date object.
	 * @alias Date.convertTimestampToDate
	 * 
	 * @param {number|string} arg0_timestamp
	 * 
	 * @returns {{year: number, month: number, day: number, hour: number, minute: number}|*}
	 */
	Date.convertTimestampToDate = function (arg0_timestamp) {
		let timestamp = arg0_timestamp;
		
		if (typeof timestamp === "object") return timestamp;
		
		timestamp = parseInt(timestamp);
		if (isNaN(timestamp)) return Date.getBlankDate();
		
		let date_obj = Date.getBlankDate();
		let minutes = timestamp;
		
		// --- Handle BCE (negative timestamps) ---
		if (minutes < 0) {
			// Walk backwards through years until the remaining magnitude
			// fits within one year.
			while (true) {
				let prev_year = date_obj.year - 1;
				let year_minutes =
					(Date.isLeapYear(prev_year) ? 366 : 365) * 24 * 60;
				
				if (-minutes <= year_minutes) break;
				minutes += year_minutes;
				date_obj.year--;
			}
			
			// We're now inside (date_obj.year - 1). Enter that year.
			date_obj.year--;
			
			// Convert negative remainder into a positive offset from the
			// START of this year.  Total minutes in this year:
			let total_year_minutes =
				(Date.isLeapYear(date_obj.year) ? 366 : 365) * 24 * 60;
			minutes = total_year_minutes + minutes; // minutes is negative, so this is (total - |minutes|)
			
			// Fall through to the same month/day/hour/minute decomposition
			// as the CE path below, using the now-positive `minutes`.
		} else {
			// --- CE (positive or zero timestamp) ---
			while (true) {
				let y_minutes =
					(Date.isLeapYear(date_obj.year) ? 366 : 365) * 24 * 60;
				if (minutes < y_minutes) break;
				minutes -= y_minutes;
				date_obj.year++;
			}
		}
		
		// Decompose remaining minutes into month/day/hour/minute
		let all_months = Object.keys(Date.months);
		for (let i = 0; i < all_months.length; i++) {
			let m = Date.months[all_months[i]];
			let dim = Date.isLeapYear(date_obj.year)
				? m.leap_year_days || m.days
				: m.days;
			let m_minutes = dim * 24 * 60;
			if (minutes < m_minutes) {
				date_obj.month = i + 1;
				break;
			}
			minutes -= m_minutes;
		}
		
		date_obj.day = Math.floor(minutes / (24 * 60)) + 1;
		minutes -= (date_obj.day - 1) * 24 * 60;
		
		date_obj.hour = Math.floor(minutes / 60);
		date_obj.minute = minutes % 60;
		
		return date_obj;
	};
	
	/**
	 * Converts a timestamp to an integer if possible.
	 * @alias Date.convertTimestampToInt
	 * 
	 * @param {number|string} arg0_timestamp
	 * 
	 * @returns {number}
	 */
	Date.convertTimestampToInt = function (arg0_timestamp) {
		//Convert from parameters
		let timestamp = arg0_timestamp;
		
		//Return statement
		return parseInt(
			Math.numerise(timestamp.toString().replace("t_", "").replace("tz_", ""))
		);
	};
}