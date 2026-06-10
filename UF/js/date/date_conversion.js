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
			if (isNaN(parseFloat(date_array[i])))
				return;
		
		//Iterate over all elements in date_array and cast them to a date object
		for (let i = 0; i < date_array.length; i++)
			if (date_properties[i])
				date_obj[date_properties[i]] = parseFloat(date_array[i]);
		
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
		
		timestamp = parseFloat(timestamp);
		if (isNaN(timestamp)) return Date.getBlankDate();
		
		//Declare local instance variables
		let do_not_cache_timestamps = ve.registry.settings.Date.do_not_cache_timestamps;
		
		// Map cache for extremely fast O(1) repeat lookups
		if (!do_not_cache_timestamps) {
			if (!Date._conversion_cache) Date._conversion_cache = new Map();
			let cached_val = Date._conversion_cache.get(timestamp);
			if (cached_val) {
				return {
					year: cached_val.year,
					month: cached_val.month,
					day: cached_val.day,
					hour: cached_val.hour,
					minute: cached_val.minute
				};
			}
		}
		
		let date_obj = Date.getBlankDate();
		let minutes = timestamp;
		let minutes_per_400_years = 210379680; // 146097 days * 24 * 60
		
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
				
				// Fast-jump after passing the custom BCE leap year boundary (-45)
				if (date_obj.year === -46) {
					let four_hundred_years = Math.floor((-minutes) / minutes_per_400_years);
					minutes += four_hundred_years * minutes_per_400_years;
					date_obj.year -= four_hundred_years * 400;
				}
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
				
				// Fast-jump after passing the custom CE leap year boundary (45)
				if (date_obj.year === 46) {
					let four_hundred_years = Math.floor(minutes / minutes_per_400_years);
					minutes -= four_hundred_years * minutes_per_400_years;
					date_obj.year += four_hundred_years * 400;
				}
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
		
		// Store a copy in the Map cache before returning
		if (!do_not_cache_timestamps)
			Date._conversion_cache.set(timestamp, {
				year: date_obj.year,
				month: date_obj.month,
				day: date_obj.day,
				hour: date_obj.hour,
				minute: date_obj.minute
			});
		
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
		return parseFloat(
			Math.numerise(timestamp.toString().replace("t_", "").replace("tz_", ""))
		);
	};
}