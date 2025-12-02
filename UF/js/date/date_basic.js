//Initialise functions
{
	Date.bc_leap_years = [
		-45, -42, -39, -36, -33, -30, -27, -24, -21, -18, -15, -12, -9 //(Ideler 1825); Triennial leap years
	];
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
	
	Date.all_months = Object.keys(Date.months);
	
	for (let i = 0; i < Date.all_months.length; i++)
		Date.months[Date.all_months[i]].month = i;
	
	Date.getBlankDate = function () {
		//Return statement
		return { year: 0, month: 0, day: 0, hour: 0, minute: 0 };
	};
	
	Date.getCurrentDate = function () {
		//Declare local instance variables
		let current_date = new Date();
		
		//Return statement
		return {
			year: current_date.getFullYear(),
			month: current_date.getMonth() + 1,
			day: current_date.getDate(),
			hour: current_date.getHours(),
			minute: current_date.getMinutes()
		};
	};
	
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
	
	Date.getLeapYearsBefore = function (arg0_year) {
		//Convert from parameters
		let year = parseInt(arg0_year);
		
		//Return statement
		return year/4 - year/100 + year/400 - 1; //4AD was not a leap year
	};
	
	Date.getLeapYearsBetween = function (arg0_start_year, arg1_end_year) {
		//Convert from parameters
		let start_year = parseInt(arg0_start_year);
		let end_year = parseInt(arg1_end_year);
		
		//Return statement
		return Date.getLeapYearsBefore(end_year) - Date.getLeapYearsBefore(start_year + 1);
	};
	
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
	
	Date.getMonthsFromDays = function (arg0_date_object) {
		//Convert from parameters
		let date_obj = Date.convertTimestampToDate(arg0_date_object);
		
		//Declare local instance variables
		let is_leap_year = Date.isLeapYear(date_obj.year);
		let months = 0;
		
		//Iterate over all_months and calculate months
		Object.iterate(Date.months, (local_key, local_value) => {
			let local_days_in_month = local_value.days;
				if (is_leap_year && local_value.leap_year_days)
					local_days_in_month = local_value.leap_year_days;
			date_obj.day -= local_days_in_month;
			if (date_obj.day >= 0) months++;
		});
		
		//Return statement
		return months + 1;
	};
	
	Date.getTimestamp = function (arg0_date_object) { //[WIP] - Refactor function later
		//Convert from parameters
		let date_obj = {
			...Date.getBlankDate(),
			...arg0_date_object
		};
		
		//Declare local instance variables
		let minutes = 0;
		
		// Normalise date_obj (1-based months)
		{
			// 1. Normalise minutes to hours
			if (date_obj.minute >= 60) {
				date_obj.hour += Math.floor(date_obj.minute / 60);
				date_obj.minute = date_obj.minute % 60;
			}
			
			// 2. Normalise hours to days
			if (date_obj.hour >= 24) {
				date_obj.day += Math.floor(date_obj.hour / 24);
				date_obj.hour = date_obj.hour % 24;
			}
			
			// 3. Normalise months to years (since 1–12)
			while (date_obj.month > 12) {
				date_obj.month -= 12;
				date_obj.year++;
			}
			
			while (date_obj.month < 1) {
				date_obj.month += 12;
				date_obj.year--;
			}
			
			// 4. Normalise days to months
			while (true) {
				let all_months = Object.keys(Date.months);
				let local_month = Date.months[all_months[date_obj.month - 1]]; // -1 for index
				let days_in_month = local_month.days;
				
				// Handle leap years
				if (Date.isLeapYear(date_obj.year) && local_month.leap_year_days)
					days_in_month = local_month.leap_year_days;
				
				if (date_obj.day > days_in_month) {
					date_obj.day -= days_in_month;
					date_obj.month++;
					
					if (date_obj.month > 12) {
						date_obj.year++;
						date_obj.month = 1;
					}
				} else {
					break;
				}
			}
		}
		
		// Calculate timestamp
		{
			// 1. Add years
			if (date_obj.year >= 0) {
				for (let i = 0; i < date_obj.year; i++)
					minutes += (Date.isLeapYear(i) ? 366 : 365) * 24 * 60;
			} else {
				for (let i = -1; i >= date_obj.year; i--)
					minutes -= (Date.isLeapYear(i) ? 366 : 365) * 24 * 60;
			}
			
			// 2. Add months (1-based)
			let all_months = Object.keys(Date.months);
			
			for (let i = 1; i < date_obj.month; i++) {
				let local_month = Date.months[all_months[i - 1]];
				let days_in_month = local_month.days;
				
				if (Date.isLeapYear(date_obj.year) && local_month.leap_year_days)
					days_in_month = local_month.leap_year_days;
				
				minutes += days_in_month * 24 * 60;
			}
			
			// 3. Add days
			minutes += date_obj.day * 24 * 60;
			
			// 4. Add hours and minutes
			minutes += date_obj.hour * 60 + date_obj.minute;
		}
		
		// Return absolute timestamp
		return Math.abs(minutes);
	};
	
	Date.isLeapYear = function (arg0_year) {
		//Convert from parameters
		let year = parseInt(arg0_year);
		
		//Return statement
		if (Date.bc_leap_years.indexOf(year) !== -1) return true;
		return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0) && year !== 4);
	};
	
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
		date_obj.month = 1; // ✅ Start at January
		
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