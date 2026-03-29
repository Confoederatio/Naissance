//Initialise functions
{
	if (!global.Date)
		/**
		 * The namespace for all UF/Object utility functions, typically for static methods.
		 * 
		 * @namespace Date
		 */
		global.Date = {};
	
	/**
	 * @type {number[]}
	 */
	Date.bc_leap_years = [
		-45, -42, -39, -36, -33, -30, -27, -24, -21, -18, -15, -12, -9 //(Ideler 1825); Triennial leap years
	];
	/**
	 * @type {{"<month_key>": { name: string, month: number, days: number, leap_year_days: number }}}
	 */
	Date.months = {
		january: {
			name: "January",
			days: 31
		},
		february: {
			name: "February",
			days: 28,
			leap_year_days: 29
		},
		march: {
			name: "March",
			days: 31
		},
		april: {
			name: "April",
			days: 30
		},
		may: {
			name: "May",
			days: 31
		},
		june: {
			name: "June",
			days: 30
		},
		july: {
			name: "July",
			days: 31
		},
		august: {
			name: "August",
			days: 31
		},
		september: {
			name: "September",
			days: 30
		},
		october: {
			name: "October",
			days: 31
		},
		november: {
			name: "November",
			days: 30
		},
		december: {
			name: "December",
			days: 31
		}
	};
	
	/**
	 * @type {string[]}
	 */
	Date.all_months = Object.keys(Date.months);
	
	for (let i = 0; i < Date.all_months.length; i++)
		Date.months[Date.all_months[i]].month = i;
	
	/**
	 * Returns a UF Date object from a proper {@link Date} object.
	 * @alias Date.fromDate
	 * 
	 * @param arg0_date
	 * @returns {{year: number, month, day: *|number, hour: number, minute: number}}
	 */
	Date.fromDate = function (arg0_date) {
		//Convert from parameters
		let date = Date.getDate(arg0_date);
		
		//Return statement
		return {
			year: date.getFullYear(),
			month: date.getMonth() + 1,
			day: date.getDate(),
			hour: date.getHours(),
			minute: date.getMinutes()
		}
	};
	
	/**
	 * Returns a blank date template starting at '0AD'.
	 * @alias Date.getBlankDate
	 * 
	 * @returns {{year: number, month: number, day: number, hour: number, minute: number}}
	 */
	Date.getBlankDate = function () {
		//Return statement
		return { year: 0, month: 1, day: 1, hour: 0, minute: 0 }; //Must be Year 0, even if it doesn't exist
	};
	
	/**
	 * Returns the present Date.
	 * @alias Date.getCurrentDate
	 * 
	 * @returns {{year: number, month, day: number, hour: number, minute: number}}
	 */
	Date.getCurrentDate = function () {
		//Return statement
		return Date.fromDate(new Date());
	};
	
	/**
	 * Returns a Date object from a variable type.
	 * @alias Date.getDate
	 * 
	 * @param {Date|Object|number|string} arg0_date
	 * 
	 * @returns {Date}
	 */
	Date.getDate = function (arg0_date) {
		//Convert from parameters
		let date = arg0_date;
		
		//Declare local instance variables
		if (typeof date === "string" && !isNaN(parseInt(date))) date = parseInt(date);
		if (typeof date === "number") date = new Date(date);
		if (typeof date === "string") date = Date.parse(date);
		
		if (typeof date === "object" && !(date instanceof Date))
			if (Object.hasKeys(date, ["year", "month", "day", "hour", "minute"], { mode: "any" }))
				date = new Date(date.year, date.month, date.day, date.hour, date.minute);
		
		//Return statement
		return date;
	};
	
	/**
	 * Returns the number of days in the `.months` value within a Date object.
	 * @alias Date.getDaysInMonths
	 * 
	 * @param {Object} arg0_date_object
	 * 
	 * @returns {number}
	 */
	Date.getDaysInMonths = function (arg0_date_object) {
		//Convert from parameters
		let date_obj = arg0_date_object;
		
		//Declare local instance variables
		let all_months = Object.keys(Date.months);
		let days = 0;
		
		//Iterate over all elapsed months
		for (let i = 0; i < date_obj.month - 1; i++)
			days += Date.months[all_months[i]].days;
		if (Date.isLeapYear(date_obj.year) && date_obj.month >= 2) days++;
		
		//Return statement
		return days;
	};
	
	/**
	 * Fetches the number of leap years before a certain year.
	 * @alias Date.getLeapYearsBefore
	 * 
	 * @param {number} arg0_year
	 * 
	 * @returns {number}
	 */
	Date.getLeapYearsBefore = function (arg0_year) {
		//Convert from parameters
		let year = parseInt(arg0_year);
		
		//Return statement
		return year/4 - year/100 + year/400 - 1; //4AD was not a leap year
	};
	
	/**
	 * Fetches the number of leap years between two years.
	 * @alias Date.getLeapYearsBetween
	 * 
	 * @param {number|string} arg0_start_year
	 * @param {number|string} arg1_end_year
	 * 
	 * @returns {number}
	 */
	Date.getLeapYearsBetween = function (arg0_start_year, arg1_end_year) {
		//Convert from parameters
		let start_year = parseInt(arg0_start_year);
		let end_year = parseInt(arg1_end_year);
		
		//Return statement
		return Date.getLeapYearsBefore(end_year) - Date.getLeapYearsBefore(start_year + 1);
	};
	
	/**
	 * Fetches the month index from its name.
	 * @alias Date.getMonth
	 * 
	 * @param {string} arg0_month_name
	 * 
	 * @returns {number}
	 */
	Date.getMonth = function (arg0_month_name) {
		//Convert from parameters
		let month_name = arg0_month_name.toString().toLowerCase();
		
		//Declare local instance variables
		let all_months = Object.keys(Date.months);
		let month_found = all_months.indexOf(month_name) + 1;
		
		if (!month_found)
			for (let i = 0; i < all_months.length; i++)
				if (all_months[i].includes(month_name)) {
					month_found = i + 1;
					break;
				}
		if (!month_found) month_found = 1;
		
		//Return statement
		return month_found;
	};
	
	/**
	 * Returns the number of months from the number of `.day` within the date object.
	 * @alias Date.getMonthsFromDays
	 * 
	 * @param {Object} arg0_date_object
	 * 
	 * @returns {number}
	 */
	Date.getMonthsFromDays = function (arg0_date_object) {
		// Convert from parameters
		let date_obj = Date.convertTimestampToDate(arg0_date_object);
		
		//Declare local instance variables
		let is_leap_year = Date.isLeapYear(date_obj.year);
		let remaining_days = date_obj.day;
		let months = 1;
		
		// Iterate over all months and count full ones
		let all_months = Object.keys(Date.months);
		for (let i = 0; i < all_months.length; i++) {
			let local_month = Date.months[all_months[i]];
			let days_in_month = local_month.days;
			
			if (is_leap_year && local_month.leap_year_days)
				days_in_month = local_month.leap_year_days;
			
			if (remaining_days > days_in_month) {
				remaining_days -= days_in_month;
				months++;
			} else {
				break; // stop once we reach the current month
			}
		}
		
		// Clamp just in case (should never exceed 12)
		if (months > 12) months = 12;
		
		// Return statement
		return months;
	};
	
	/**
	 * Returns the modern timestamp (UNIX-based) for a given date.
	 * @alias Date.getModernTimestamp
	 * 
	 * @param {Date|any} arg0_date
	 * 
	 * @returns {number}
	 */
	Date.getModernTimestamp = function (arg0_date) {
		//Convert from parameters
		let date = Date.getDate(arg0_date);
		
		//Return statement
		return date.getTime();
	};
	
	/**
	 * Returns a numeric timestamp from a specific Date object. Number of minutes from 1 January, 00:00 on 1AD.
	 * @alias Date.getTimestamp
	 * 
	 * @param {Object} arg0_date_object
	 * 
	 * @returns {number}
	 */
	Date.getTimestamp = function (arg0_date_object) {
		let date = arg0_date_object ? arg0_date_object : Date.getBlankDate();
		
		if (typeof date === "string")
			if (!isNaN(parseFloat(date))) return parseFloat(date);
		
		let date_obj = {
			...Date.getBlankDate(),
			...date,
		};
		let minutes = 0;
		
		// Normalise minor overflows
		if (date_obj.minute >= 60) {
			date_obj.hour += Math.floor(date_obj.minute / 60);
			date_obj.minute %= 60;
		}
		if (date_obj.hour >= 24) {
			date_obj.day += Math.floor(date_obj.hour / 24);
			date_obj.hour %= 24;
		}
		while (date_obj.month > 12) {
			date_obj.month -= 12;
			date_obj.year++;
		}
		while (date_obj.month < 1) {
			date_obj.month += 12;
			date_obj.year--;
		}
		
		// 1. Add full years before the current one
		//    Epoch = start of year 0, so we sum years [0 .. year-1] or
		//    subtract years [-1 .. year] depending on direction.
		if (date_obj.year > 0) {
			for (let i = 0; i < date_obj.year; i++)
				minutes += (Date.isLeapYear(i) ? 366 : 365) * 24 * 60;
		} else if (date_obj.year < 0) {
			for (let i = -1; i >= date_obj.year; i--)
				minutes -= (Date.isLeapYear(i) ? 366 : 365) * 24 * 60;
		}
		// year === 0 contributes 0 full-year minutes (we're inside year 0)
		
		// 2. Add completed months of current year
		let all_months = Object.keys(Date.months);
		for (let i = 1; i < date_obj.month; i++) {
			let local_month = Date.months[all_months[i - 1]];
			let dim = Date.isLeapYear(date_obj.year)
				? local_month.leap_year_days || local_month.days
				: local_month.days;
			minutes += dim * 24 * 60;
		}
		
		// 3. Add completed days
		minutes += (date_obj.day - 1) * 24 * 60;
		
		// 4. Add partial day
		minutes += date_obj.hour * 60 + date_obj.minute;
		
		return minutes;
	};
	
	/**
	 * Whether the given year is a leap year.
	 * @alias Date.isLeapYear
	 * 
	 * @param {number} arg0_year
	 * 
	 * @returns {boolean}
	 */
	Date.isLeapYear = function (arg0_year) {
		//Convert from parameters
		let year = parseInt(arg0_year);
		
		//Return statement
		if (Date.bc_leap_years.indexOf(year) !== -1) return true;
		return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0) && year !== 4);
	};
	
	/**
	 * Parses a {@link float} number of years into a specific Date object.
	 * @alias Date.parseYears
	 * 
	 * @param {number} arg0_years
	 * 
	 * @returns {{year: number, month: number, day: number, hour: number, minute: number}}
	 */
	Date.parseYears = function (arg0_years) {
		// Convert from parameters
		let years = parseFloat(arg0_years);
		
		// Declare local instance variables
		let date_obj = Date.getBlankDate();
		
		// 1. Parse whole years
		date_obj.year = Math.floor(years);
		let remainder = years - date_obj.year;
		
		// 2. Convert remaining fractional years into days
		let days = remainder * 365; // Approximation
		date_obj.day = Math.floor(days);
		
		// 3. Parse months (1-based)
		date_obj.month = 1;
		
		let all_months = Object.keys(Date.months);
		for (let i = 0; i < all_months.length; i++) {
			let local_month = Date.months[all_months[i]];
			let days_in_month = local_month.days;
			
			if (
				Date.isLeapYear(date_obj.year) &&
				local_month.leap_year_days
			) {
				days_in_month = local_month.leap_year_days;
			}
			
			if (date_obj.day >= days_in_month) {
				date_obj.day -= days_in_month;
				date_obj.month++;
				
				if (date_obj.month > 12) {
					date_obj.month = 1;
					date_obj.year++;
				}
			} else {
				break;
			}
		}
		
		// 4. Convert remaining day fraction into hours
		let remaining_day_fraction = days - Math.floor(days);
		date_obj.hour = Math.floor(remaining_day_fraction * 24);
		
		// Return statement
		return date_obj;
	};
}