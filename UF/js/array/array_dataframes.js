//Initialise functions
{
	if (!global.Array) global.Array = {};
	
	/**
	 * Appends two dataframes to one another.
	 * @alias Array.appendDataframes
	 * 
	 * @param {Array.<any[]>} arg0_dataframe - The dataframe to input into the function.
	 * @param {Array.<any[]>} arg1_dataframe - The dataframe to append.
	 * @param {Object} [arg2_options]
	 *  @param {any} [arg2_options.default_value] - Optional. What the default variable should be.
	 * 
	 * @returns {Array.<any[]>}
	 */
	Array.appendDataframes = function (arg0_dataframe, arg1_dataframe, arg2_options) {
		//Convert from parameters
		let dataframe = arg0_dataframe;
		let ot_dataframe = arg1_dataframe;
		let options = (arg2_options) ? arg2_options : {};
		
		//Declare local instance variables
		let headers = Array.from(new Set([...dataframe[0], ...ot_dataframe[0]]));
		let new_dataframe = [headers];
		
		//Remove headers from original dataframes
		let dataframe_one = dataframe.slice(1);
		let dataframe_two = ot_dataframe.slice(1);
		
		//Append data from first dataframe
		new_dataframe.push(...dataframe_one);
		
		//Append data from the second dataframe
		for (let row of dataframe_two) {
			let new_row = new Array(headers.length).fill(options.default_value);
			
			for (let x = 0; x < row.length; x++) {
				let column_index = headers.indexOf(ot_dataframe[0][x]);
				new_row[column_index] = row[x];
			}
			
			new_dataframe.push(new_row);
		}
		
		//Return statement
		return new_dataframe;
	};
	
	/**
	 * Converts a dataframe to an object.
	 * @alias Array.convertDataframeToObject
	 * 
	 * @param {Array.<any[]>} arg0_dataframe - The dataframe to convert to an object
	 * 
	 * @returns {any[]}
	 */
	Array.convertDataframeToObject = function (arg0_dataframe) {
		//Convert from parameters
		let dataframe = arg0_dataframe;
		
		//Guard clause
		if (!Array.isArray(dataframe)) return dataframe;
		
		//Declare local instance variables
		let dataframe_header = dataframe[0];
		let dataframe_obj = {};
		
		//Guard clause if dataframe has no header, or is not 2D array
		if (!dataframe_header || !Array.isArray(dataframe_header))
			return dataframe;
		
		//Initialise dataframe_obj subobjects
		for (let i = 0; i < dataframe_header.length; i++)
			dataframe_obj[dataframe_header[i]] = {};
		
		//Iterate over dataframe (rows)
		for (let i = 1; i < dataframe.length; i++)
			for (let x = 0; x < dataframe[i].length; x++)
				if (dataframe_header[x])
					dataframe_obj[dataframe_header[x]][i] = dataframe[i][x];
		
		//Return statement
		return dataframe_obj;
	};
	
	/**
	 * Converts a given object to a dataframe.
	 * @alias Array.convertObjectToDataframe
	 * 
	 * @param {Object} arg0_dataframe_obj - The object to convert into a dataframe.
	 * 
	 * @returns {Array.<any[]>}
	 */
	Array.convertObjectToDataframe = function (arg0_dataframe_obj) {
		//Convert from parameters
		let dataframe_obj = arg0_dataframe_obj;
		
		//Guard clause
		if (typeof dataframe_obj != "object") return dataframe_obj;
		
		//Declare local instance variables
		let all_variables = Object.keys(dataframe_obj);
		let return_dataframe = [];
		
		//Set header
		return_dataframe.push(all_variables);
		
		//Iterate over all_variables
		for (let i = 0; i < all_variables.length; i++) {
			let local_subobj = dataframe_obj[all_variables[i]];
			
			let all_local_keys = Object.keys(local_subobj);
			
			for (let x = 0; x < all_local_keys.length; x++) {
				let local_value = local_subobj[all_local_keys[x]];
				
				//Initialise array if nonexistent
				if (!return_dataframe[all_local_keys[x]])
					return_dataframe[all_local_keys[x]] = [];
				return_dataframe[all_local_keys[x]][i] = local_value;
			}
		}
		
		//Return statement
		return return_dataframe;
	};
	
	/**
	 * Fetches the number of columns in a given dataframe.
	 * @alias Array.getColumns
	 * 
	 * @param {Object} arg0_dataframe - The dataframe to pass to the function.
	 * 
	 * @returns {number}
	 */
	Array.getColumns = function (arg0_dataframe) {
		//Convert from parameters
		let dataframe = arg0_dataframe;
		
		//Guard clause
		if (dataframe.length === 0) return 0;
		
		//Declare local instance variables
		let max_columns = 0;
		
		//Iterate over all rows in the dataframe
		for (let i = 0; i < dataframe.length; i++)
			if (Array.isArray(dataframe[i]))
				max_columns = Math.max(dataframe[i].length, max_columns);
		
		//Return statement
		return max_columns;
	};
	
	/**
	 * Returns the number of columns and rows.
	 * @alias Array.getDimensions
	 * 
	 * @param {Array.<any[]>} arg0_dataframe
	 * 
	 * @returns {number[]}
	 */
	Array.getDimensions = function (arg0_dataframe) {
		//Convert from parameters
		let dataframe = arg0_dataframe;
		
		//Return statement
		return [Array.getColumns(dataframe), Array.getRows(dataframe)];
	};
	
	/**
	 * Fetches the number of rows in a dataframe.
	 * @alias Array.getRows
	 * 
	 * @param {Array.<any[]>} arg0_dataframe - The dataframe to pass to the function.
	 * 
	 * @returns {number}
	 */
	Array.getRows = function (arg0_dataframe) {
		//Convert from parameters
		let dataframe = arg0_dataframe;
		
		//Return statement
		return dataframe.length;
	};
	
	/**
	 * Checks whether a dataframe has a true header.
	 * @alias Array.getHeader
	 * 
	 * @param {Array.<any[]>} arg0_dataframe - The dataframe to pass to the function.
	 * 
	 * @returns {boolean}
	 */
	Array.hasHeader = function (arg0_dataframe) {
		//Convert from parameters
		let dataframe = Array.toArray(arg0_dataframe);
		
		//Declare local instance variables
		let has_header = false;
		
		if (Array.isArray(dataframe[0])) {
			let all_strings = true;
			
			for (let i = 0; i < dataframe[0].length; i++)
				if (typeof dataframe[0][i] != "string") {
					all_strings = false;
					break;
				}
			
			if (all_strings)
				has_header = true;
		}
		
		//Return statement
		return has_header;
	};
	
	/**
	 * Merges two dataframes; with the second dataframe's columns being appended to the first dataframe post-operation. Mathematical operations can be applied here as a system of equations. Dataframes may have different dimensions, non-corresponding values are assumed to be zero or undefined.
	 * 
	 * Dataframes are a 2D array, typically with a header row.
	 * 
	 * @alias Array.mergeDataframes
	 * 
	 * @param {Array.<any[]>} arg0_dataframe - The 1st dataframe to pass to the function.
	 * @param {Array.<any[]>} arg1_dataframe - The 2nd dataframe to pass to the function.
	 * @param {Object} [arg2_options]
	 *  @param {string} [arg2_options.equation] - The string literal to use as an equation (e.g. 'i + x*5'). If no equal sign is provided, this applies to every cell, regardless of column. Equations are split by semicolons.<br>- <br>As an example, x$D = i$B, replaces the D column of the 2nd dataframe with the B column of the 1st.<br>- 'i' represents the corresponding element of the first dataframe,<br>  - 'i$Column' represents the selection of a 1st dataframe column named 'Column'.<br>- 'x' represents the corresponding element of the second dataframe,<br>  - 'x$Column' represents the selection of a 2nd dataframe column named 'Column'.
	 * 
	 * @returns {Array.<any[]>}
	 */
	Array.mergeDataframes = function (arg0_dataframe, arg1_dataframe, arg2_options) {
		//Convert from parameters
		let dataframe = arg0_dataframe;
		let ot_dataframe = arg1_dataframe;
		let options = (arg2_options) ? arg2_options : {};
		
		//Process options.equation
		if (options.equation) {
			let operate_dataframes = Array.operateDataframes(dataframe, ot_dataframe, options);
			
			dataframe = operate_dataframes.dataframe;
			ot_dataframe = operate_dataframes.ot_dataframe;
		}
		
		//Append dataframes
		let return_dataframe = Array.appendDataframes(dataframe, ot_dataframe);
		
		//Return statement
		return return_dataframe;
	};
	
	/**
	 * Operates on two dataframes by applying an equation string.
	 * @alias Array.operateDataframes
	 * 
	 * @param {Array.<any[]>} arg0_dataframe - The 1st dataframe to operate on as i.
	 * @param {Array.<any[]>} arg1_dataframe - The 2nd dataframe to operate on as x.
	 * @param {Object} [arg2_options]
	 *  @param {string} [arg2_options.equation] - The string literal to use as an equation (e.g. 'i + x*5'). If no equal sign is provided, this applies to every cell, regardless of column. Equations are split by semicolons.<br>- <br>As an example, x$D = i$B, replaces the D column of the 2nd dataframe with the B column of the 1st.<br>- 'i' represents the corresponding element of the first dataframe,<br>  - 'i$Column' represents the selection of a 1st dataframe column named 'Column'.<br>- 'x' represents the corresponding element of the second dataframe,<br>  - 'x$Column' represents the selection of a 2nd dataframe column named 'Column'.
	 * 
	 * @returns {{dataframe: Array.<any[]>, ot_dataframe: Array.<any[]>}}
	 */
	Array.operateDataframes = function (arg0_dataframe, arg1_dataframe, arg2_options) {
		//Convert from parameters
		let dataframe = arg0_dataframe;
		let ot_dataframe = arg1_dataframe;
		let options = (arg2_options) ? arg2_options : {};
		
		//Initialise options
		if (options.return_safe_number !== false)
			options.return_safe_number = true;
		
		//Parse options.equation
		if (options.equation) {
			//Convert dataframes to objects for easier corresponding manipulation
			let dataframe_length = dataframe.length;
			let ot_dataframe_length = ot_dataframe.length;
			
			//Formatting variables
			let f_0 = (options.return_safe_number) ? `returnSafeNumber(` : "";
			let f_1 = (options.return_safe_number) ? `)` : "";
			
			dataframe = Array.convertDataframeToObject(dataframe);
			ot_dataframe = Array.convertDataframeToObject(ot_dataframe);
			
			let split_equation = options.equation.split(";");
			
			//Iterate over split_equation to apply them to dataframe; ot_dataframe
			for (let i = 0; i < split_equation.length; i++) {
				let local_regex = /\$(\w+)/g;
				
				let converted_string = split_equation[i].replace(local_regex, `["$1"]`);
				
				//Replace "/" with the division operator
				converted_string = converted_string.replace(/\//g, "/");
				
				//Equation function declaration; fetching the max length of variables involved in that equation; then performing iterative equations. Non-values assumed to be zero
				let max_length = (dataframe.length > ot_dataframe.length) ?
					dataframe_length : ot_dataframe_length;
				
				//Iterate over all max_length
				for (let x = 1; x < max_length; x++) {
					let processed_equation = converted_string.replace(/"]/g, `"][${x}]`);
					let regex_i = /i\["(\w+)"\]\[(\d+)\]/g;
					let regex_x = /x\["(\w+)"\]\[(\d+)\]/g;
					
					//Split processed_equation
					processed_equation = processed_equation.split("=");
					
					processed_equation[1] = processed_equation[1].replace(regex_i, `${f_0}i["$1"][${x}]${f_1}`);
					processed_equation[1] = processed_equation[1].replace(regex_x, `${f_0}x["$1"][${x}]${f_1}`);
					
					let equation_expression = `${processed_equation[0]} = ${processed_equation[1]};`;
					let equation_function = new Function("i", "x", equation_expression);
					
					//Process function
					equation_function(dataframe, ot_dataframe);
				}
			}
			
			//Reconvert back to dataframe arrays
			dataframe = Array.convertObjectToDataframe(dataframe);
			ot_dataframe = Array.convertObjectToDataframe(ot_dataframe);
		}
		
		//Return statement
		return {
			dataframe: dataframe,
			ot_dataframe: ot_dataframe
		};
	};
	
	/**
	 * Sets the upper header variables.
	 * @alias Array.setHeader
	 * 
	 * @param {Array.<any[]>} arg0_dataframe - The dataframe to pass to the function.
	 * @param {string[]} arg1_header_array - The names of variables to set on the 0th row.
	 * 
	 * @returns {Array.<any[]>}
	 */
	Array.setHeader = function (arg0_dataframe, arg1_header_array) {
		//Convert from parameters
		let dataframe = arg0_dataframe;
		let headers = Array.toArray(arg1_header_array);
		
		//Set header
		dataframe[0] = headers;
		
		//Return statement
		return dataframe;
	};
	
	/**
	 * Selects a 2D array column (by header name).
	 * @alias Array.selectColumn
	 * 
	 * @param {Array.<any[]>} arg0_dataframe - The dataframe to pass to the function.
	 * @param {string} arg1_column_name - The name of the variable/column to select.
	 * @param {Object} [arg2_options]
	 *  @param {boolean} [arg2_options.return_index=false] - Whether to return an index.
	 * 
	 * @returns {any[]|boolean|number}
	 */
	Array.selectColumn = function (arg0_dataframe, arg1_column_name, arg2_options) {
		//Convert from parameters
		let dataframe = arg0_dataframe;
		let column_name = arg1_column_name.toString().toLowerCase();
		let options = (arg2_options) ? arg2_options : {};
		
		//Declare local instance variables
		let column_exists = [false, -1]; //[column_exists, column_index];
		let return_array = [];
		
		//Iterate over dataframe header
		if (Array.isArray(dataframe))
			if (dataframe[0]) {
				//Soft-match first
				for (let i = 0; i < dataframe[0].length; i++) {
					//Check against local string
					if (dataframe[0][i].toString().toLowerCase().indexOf(column_name) !== -1)
						column_exists = [true, i];
				}
				
				//Hard-match second
				for (let i = 0; i < dataframe[0].length; i++) {
					//Check against local string
					if (dataframe[0][i].toString().toLowerCase() === column_name)
						column_exists = [true, i];
				}
			}
		
		//Return statement; options.return_index guard clause
		if (options.return_index) return column_exists[1];
		
		//If column_exists[0], process return_array
		if (column_exists[0])
			for (let i = 0; i < dataframe.length; i++)
				return_array.push(dataframe[i][column_exists[1]]);
		
		//Return statement
		return return_array;
	};
	
	/**
	 * Selects a 2D array row (by header name or index).
	 * @alias Array.selectRow
	 * 
	 * @param {Array.<any[]>} arg0_dataframe - The dataframe to pass to the function.
	 * @param {number} arg1_row_index - The row index to pass to the function.
	 * @param {Object} [arg2_options]
	 *  @param {boolean} [arg2_options.exclude_header=false] - Whether to exclude the header.
	 * 
	 * @returns {any[]}
	 */
	Array.selectRow = function (arg0_dataframe, arg1_row_index, arg2_options) {
		//Convert from parameters
		let dataframe = arg0_dataframe;
		let row_index = arg1_row_index;
		let options = (arg2_options) ? arg2_options : {};
		
		//Return statement
		return (!options.exclude_header) ? dataframe[row_index] : dataframe[row_index + 1];
	};
	
	/**
	 * Sets a 2D array column.
	 * @alias Array.setColumn
	 * 
	 * @param {Array.<any[]>} arg0_dataframe - The dataframe to pass to the function.
	 * @param {string} arg1_column_name - The name of the variable/column to set.
	 * @param {any[]} arg2_values - The list of values to set for this column.
	 * 
	 * @returns {any[]}
	 */
	Array.setColumn = function (arg0_dataframe, arg1_column_name, arg2_values) {
		//Convert from parameters
		let dataframe = arg0_dataframe;
		let column_name = arg1_column_name;
		let values = Array.toArray(arg2_values);
		
		//Declare local instance variables
		let column_index = (isNaN(column_name)) ? 
			Array.selectColumn(dataframe, column_name, { return_index : true }) : column_name;
		
		//Set new values, delete rest
		for (let i = 0; i < dataframe.length; i++)
			dataframe[i][column_index] = values[i];
		
		//Return statement
		return dataframe.filter((row) => {
			row.some(element => element !== undefined && element !== null);
		});
	};
	
	/**
	 * Sets a 2D array row.
	 * @alias Array.setRow
	 * 
	 * @param {Array.<any[]>} arg0_dataframe - The dataframe to pass to the function.
	 * @param {number} arg1_row_index - The row index to pass to the function.
	 * @param {any[]} arg2_values - The list of values to set for this row.
	 * 
	 * @returns {any[]}
	 */
	Array.setRow = function (arg0_dataframe, arg1_row_index, arg2_values) {
		//Convert from parameters
		let dataframe = arg0_dataframe;
		let row_index = arg1_row_index;
		let values = Array.toArray(arg2_values);
		
		//Set local row_index to values
		if (Array.isEmpty(dataframe)) {
			dataframe[row_index] = values;
		} else {
			dataframe.splice(row_index, 1);
		}
		
		//Return statement
		return dataframe;
	};
}
