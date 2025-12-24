//Initialise functions
{
	if (!global.String)
		/**
		 * The namespace for all UF/String utility functions, typically for static methods.
		 * 
		 * @namespace String
		 */
		global.String = {};
	
	/**
	 * Formats an array into a string.
	 * @memberof String
	 * 
	 * @param {Array} arg0_array
	 * 
	 * @returns {string}
	 */
	String.formatArray = function (arg0_array) {
		//Convert from parameters
		let array = Array.toArray(arg0_array);
		
		//Declare local instance variables
		let name_string = "";
		
		//Modify ending
		if (array.length > 2) {
			array[array.length - 1] = `and ${array[array.length - 1]}`;
			name_string = array.join(", ");
		} else if (array.length === 2) {
			array[array.length - 1] = `and ${array[array.length - 1]}`;
			name_string = array.join(" ");
		} else {
			name_string = array[0];	
		}
		
		//Return statement
		return name_string;
	};
	
	/**
	 * Formats a Date object into a default string.
	 * @memberof String
	 * 
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
	
	/**
	 * Formats a date length into a string given a number of seconds.
	 * @memberof String
	 * 
	 * @param {number} arg0_seconds
	 * 
	 * @returns {string}
	 */
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
	 * Formats an object as a given string.
	 * @memberof String
	 * 
	 * @param {Object} arg0_object
	 * 
	 * @returns {string}
	 */
	String.formatObject = function (arg0_object) {
		//Convert from parameters
		let object = (arg0_object) ? arg0_object : {};
		
		//Internal guard clause if object is empty
		if (Object.keys(object).length === 0) return "None";
		
		//Declare local instance variables
		let string_array = [];
		
		//Iterate over object and parse it to a string
		Object.iterate(object, (local_key, local_value) => {
			if (typeof string_array === "object") {
				string_array.push(`${local_key}: ${JSON.stringify(local_value)}`);
			} else {
				string_array.push(`${local_key}: ${local_value.toString()}`);
			}
		});
		
		//Return statement
		return string_array.join(", ");
	};
	
	/**
	 * Formats a number based off of the selected locale, rounding it to the specified number of places.
	 * @memberof String
	 * 
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
	 * Formats the type name of a given value based off its actual JS type.
	 * @memberof String
	 * 
	 * @param {any} arg0_value
	 * 
	 * @returns {string}
	 */
	String.formatTypeName = function (arg0_value) {
		//Convert from parameters
		let value = (arg0_value) ? arg0_value : undefined;
		
		//Return statement; internal guard clauses
		if (value === null) return "null";
		if (Array.isArray(value)) return `Array(${value.length})`;
		if (typeof value === "function") {
			let function_string = value.toString();
			if (function_string.startsWith("class")) return "Class";
			if (function_string.startsWith("[native code]")) return "Native Function";
			return "Function";
		}
		if (value.constructor && value.constructor.name) return value.constructor.name;
		return typeof value;
	};
	
	/**
	 * Returns spreadsheet formatted coords (i.e. 'A1', 'ZZ15') given a numeric coords pair (1-indexed).
	 * @memberof String
	 * 
	 * @param {number} arg0_x
	 * @param {number} arg1_y
	 * 
	 * @returns {string}
	 */
	String.getSpreadsheetCell = function (arg0_x, arg1_y) {
		//Convert from parameters
		let x_coord = Math.returnSafeNumber(arg0_x);
		let y_coord = Math.returnSafeNumber(arg1_y);
		
		//Declare local instance variables
		let column = String.getSpreadsheetColumn(x_coord);
		
		//Return statement
		return `${column}${y_coord}`;
	};
	
	/**
	 * Returns the spreadsheet column (i.e. 'A', 'ZZ') given an X coordinate number.
	 * @memberof String
	 * 
	 * @param {number} arg0_x
	 * 
	 * @returns {string}
	 */
	String.getSpreadsheetColumn = function (arg0_x) {
		//Convert from parameters
		let x_coord = Math.returnSafeNumber(arg0_x);
		
		//Declare local instance variables
		let column = "";
		
		while (x_coord > 0) {
			x_coord--; //Spreadsheet is 1-based
			column = String.fromCharCode(65 + (x_coord % 26)) + column;
			x_coord = Math.floor(x_coord/26);
		}
		
		//Return statement
		return column;
	};
	
	/**
	 * Ordinalises a given number and returns it as a string.
	 * @memberof String
	 * 
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
	 * @memberof String
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