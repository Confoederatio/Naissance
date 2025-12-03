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
		//Convert from parameters
		let timestamp = arg0_timestamp;
		
		//Internal guard clause if timestamp is already a date object
		if (typeof timestamp === "object") return timestamp;
		
		//1. Decode if string
		if (typeof timestamp === "string") {
			timestamp = timestamp.toString().replace("t_", "").replace("tz_", "");
			timestamp = parseInt(Math.numerise(timestamp));
			
			if (arg0_timestamp.startsWith("t_")) 
				timestamp = -timestamp;
		}
		
		//2. Declare local instance variables
		let date_obj = Date.getBlankDate();
		let minutes = parseInt(timestamp);
		
		//4. Calculate years
		if (minutes >= 0) {
			while (true) {
				let year_minutes = (Date.isLeapYear(date_obj.year) ? 366 : 365)*24*60;
				if (minutes < year_minutes) break;
				minutes -= year_minutes;
				
				date_obj.year++;
			}
		} else {
			while (true) {
				let year_minutes = (Date.isLeapYear(date_obj.year - 1) ? 366 : 365)*24*60;
				if (minutes*-1 < year_minutes) break;
				minutes += year_minutes;
				
				date_obj.year--;
			}
		}
		
		//5. Calculate months; iterate over all_months
		let all_months = Object.keys(Date.months);
		
		for (let i = 0; i < all_months.length; i++) {
			let local_month = Date.months[all_months[i]];
			let days_in_month = local_month.days;
			
			if (Date.isLeapYear(date_obj.year) && local_month.leap_year_days)
				days_in_month = local_month.leap_year_days;
			
			let month_minutes = days_in_month*24*60;
			if (minutes < month_minutes) {
				date_obj.month = i + 1; //1 = January
				break;
			}
			
			minutes -= month_minutes;
		}
		
		//6. Calculate days
		date_obj.day = Math.floor(minutes/(24*60));
		minutes -= date_obj.day*24*60;
		
		//7. Calculate hours
		date_obj.hour = Math.floor(minutes/60);
		minutes -= date_obj.hour*60;
		
		//8. Calculate minutes
		date_obj.minute = minutes;
		
		//Return statement
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