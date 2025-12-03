//Initialise functions
{
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
	
	Date.convertTimestampToDate = function (arg0_timestamp) {
		let timestamp = arg0_timestamp;
		if (typeof timestamp === "object") return timestamp;
		
		if (typeof timestamp === "string") {
			timestamp = timestamp.replace("t_", "").replace("tz_", "");
			timestamp = parseInt(Math.numerise(timestamp));
			if (arg0_timestamp.startsWith("t_")) timestamp = -timestamp;
		}
		
		let date_obj = Date.getBlankDate();
		let minutes = parseInt(timestamp);
		
		// --- 1. Recover year ---
		while (true) {
			let y_minutes = (Date.isLeapYear(date_obj.year)
				? 366
				: 365) * 24 * 60;
			if (minutes < y_minutes) break;
			minutes -= y_minutes;
			date_obj.year++;
		}
		
		// --- 2. Recover month ---
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
		
		// --- 3. Recover day (1-indexed) ---
		date_obj.day = Math.floor(minutes / (24 * 60)) + 1;
		minutes -= (date_obj.day - 1) * 24 * 60;
		
		// --- 4. Recover hours/minutes ---
		date_obj.hour = Math.floor(minutes / 60);
		date_obj.minute = minutes % 60;
		
		return date_obj;
	};
	
	Date.convertTimestampToInt = function (arg0_timestamp) {
		//Convert from parameters
		let timestamp = arg0_timestamp;
		
		//Return statement
		return parseInt(
			Math.numerise(timestamp.toString().replace("t_", "").replace("tz_", ""))
		);
	};
}