//Initialise functions
{
	/**
	 * Converts a given string to a Date object if possible.
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
	 * 
	 * @param {number|string} arg0_timestamp
	 * 
	 * @returns {{year: number, month: number, day: number, hour: number, minute: number}|*}
	 */
	Date.convertTimestampToDate = function (arg0_timestamp) {
		// Convert from parameters
		let timestamp = arg0_timestamp;
		
		// Guard: if already a date object, return it
		if (typeof timestamp === "object") return timestamp;
		
		// Force numeric
		timestamp = parseInt(timestamp);
		if (isNaN(timestamp)) return Date.getBlankDate();
		
		// Epoch: Year 1, Month 1, Day 1 => timestamp 0
		let date_obj = Date.getBlankDate();
		let minutes = timestamp;
		
		// --- Handle BCE (negative timestamps) ---
		// If minutes < 0, we will reduce year instead of increasing it.
		// We count *backwards* in complete years before year 1.
		if (minutes < 0) {
			while (true) {
				const prev_year = date_obj.year - 1;
				const year_minutes =
					(Date.isLeapYear(prev_year) ? 366 : 365) * 24 * 60;
				
				// See if remaining negative minutes fit within this previous year
				if (minutes + year_minutes >= 0) break;
				minutes += year_minutes;
				date_obj.year--;
			}
			
			// Now minutes is within that previous year: move month/day from start
			date_obj.year--; // Adjust because loop stops one step early
			
			let all_months = Object.keys(Date.months);
			for (let i = 0; i < all_months.length; i++) {
				const m = Date.months[all_months[i]];
				const dim = Date.isLeapYear(date_obj.year)
					? m.leap_year_days || m.days
					: m.days;
				const m_minutes = dim * 24 * 60;
				
				if (Math.abs(minutes) < m_minutes) {
					date_obj.month = i + 1;
					break;
				}
				minutes += m_minutes;
			}
			
			date_obj.day = Math.floor(Math.abs(minutes) / (24 * 60)) + 1;
			minutes += (date_obj.day - 1) * 24 * 60;
			date_obj.hour = Math.floor(Math.abs(minutes) / 60);
			date_obj.minute = Math.abs(minutes) % 60;
			
			if (date_obj.year < 0) date_obj.year++; //Fix 1AD offset
			
			return date_obj;
		}
		
		// --- CE (positive timestamp) ---
		// Step 1: Increase years
		while (true) {
			const y_minutes = (Date.isLeapYear(date_obj.year)
				? 366
				: 365) * 24 * 60;
			if (minutes < y_minutes) break;
			minutes -= y_minutes;
			date_obj.year++;
		}
		
		// Step 2: Increase months
		const all_months = Object.keys(Date.months);
		for (let i = 0; i < all_months.length; i++) {
			const m = Date.months[all_months[i]];
			const dim = Date.isLeapYear(date_obj.year)
				? m.leap_year_days || m.days
				: m.days;
			const m_minutes = dim * 24 * 60;
			if (minutes < m_minutes) {
				date_obj.month = i + 1;
				break;
			}
			minutes -= m_minutes;
		}
		
		// Step 3: Days
		date_obj.day = Math.floor(minutes / (24 * 60)) + 1;
		minutes -= (date_obj.day - 1) * 24 * 60;
		
		// Step 4: Hours + Minutes
		date_obj.hour = Math.floor(minutes / 60);
		date_obj.minute = minutes % 60;
		
		return date_obj;
	};
	
	/**
	 * Converts a timestamp to an integer if possible.
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