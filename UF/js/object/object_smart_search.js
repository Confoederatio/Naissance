//Initialise functions
{
	if (!global.Object) global.Object = {};
	
	/**
	 * Creates a function to search an object regularly using a substring. Similar to Object.createSmartSearch, but creates a 'relevancy index' for each potential entry and affixes them to a return object.
	 * @alias Object.createSearch
	 * 
	 * @param {Object} [arg0_options]
	 *  @param {boolean} [arg0_options.exclude_zero_relevance=true] - Whether to exclude entries with zero or less relevance from the end result.
	 *  @param {string} [arg0_options.function_name] - The function name to define this search as in the global namespace.
	 *  @param {string} [arg0_options.priority_compounding="multiplicative"] - Either 'linear'/'multiplicative'.
	 *  @param {string[]} [arg0_options.priority_order] - The order in which to search, both soft/hard. The first is the most important, the last is the least important. 'key' defines the base key. Note that these values compound on top of each other.
	 * 
	 * @returns {function}
	 */
	Object.createSearch = function (arg0_options) {
		//Convert from parameters
		let options = (arg0_options) ? arg0_options : {};
		
		//Initialise options
		if (options.exclude_zero_relevance !== false) options.exclude_zero_relevance = true;
		if (!options.priority_compounding) options.priority_compounding = "multiplicative";
		if (!options.priority_order) options.priority_order = ["key"];
		
		//Declare local instance variables
		let function_expression = []; //Here 'object' is the variable to search for
		
		//Function expression syntax: (arg0_object, arg1_input)
		//Index all keys first
		function_expression.push(`
      //Convert from parameters
      var object = arg0_object;
      var input = arg1_input;

      //Declare local instance variables
      var all_object_keys = Object.keys(object);
      var lowercase_input = lowercase_input;
      var processed_object = {};

      //Guard clause for object
      if (typeof input == "object") return input;
    `);
		
		//Iterate over options.priority_order
		for (let i = 0; i < options.priority_order.length; i++) {
			let local_search = options.priority_order[i];
			
			//<key> handler
			if (local_search === "key") {
				//Check for substring relevancy
				function_expression.push(`
          for (var i = 0; i < all_object_keys.length; i++)
            if (all_object_keys[i].toLowerCase().indexOf(lowercase_input) != -1) {
              var local_relevancy = input.length/all_object_keys[i].length;
              var local_score = processed_object[all_object_keys[i]];

              if (!local_score) {
                processed_object[all_object_keys[i]] = {
                  id: "${all_object_keys[i]}",
                  value: ${local_relevancy}
                };
              } else {
                local_score.value = local_score.value ${(options.priority_compounding === "multiplicative") ? `*` : `+`} local_relevancy;
              }
            }
        `);
			} else {
				//Check for local value relevancy
				function_expression.push(`
          for (var i = 0; i < all_object_keys.length; i++) {
            var local_value = object[all_object_keys[i]];

            try {
              if (local_value.${local_search})
                if (local_value.${local_search}.toLowerCase().indexOf(lowercase_input) != -1) {
                  var local_relevancy = input.length/local_value.${local_search}.length;
                  var local_score = processed_object[all_object_keys[i]];

                  if (!local_score) {
                    processed_object[all_object_keys[i]] = {
                      id: "${all_object_keys[i]}",
                      value: ${local_relevancy}
                    };
                  } else {
                    local_score.value = local_score.value ${(options.priority_compounding === "multiplicative") ? `*` : `+`} local_relevancy;
                  }
                }
            } catch {}
          }
        `);
			}
		}
		
		//Sort object
		function_expression.push(`
      processed_object = sortObject(processed_object);

      //Return statement
      return processed_object;
    `);
		
		//Declare function
		let equation_function = new Function("arg0_object", "arg1_input", function_expression.join(""));
		
		global[options.function_name] = equation_function;
		
		//Return statement
		return global[options.function_name];
	};
	
	/**
	 * Defines a smart search function off of which various attributes are checked in a specific order, both soft and hard.
	 * @alias Object.createSmartSearch
	 * 
	 * @param {Object} [arg0_options]
	 *  @param {string} [arg0_options.function_name] - The function name to define this search as in the global namespace.
	 *  @param {string[]} [arg0_options.priority_order] - The order in which to search, both soft/hard. The first is the most important, the last is the least important. 'key' defines the base key.
	 *  
	 *  @param {boolean} [arg0_options.hard_search=true]
	 *  @param {boolean} [arg0_options.soft_search=true]
	 * 
	 * @returns {function}
	 */
	Object.createSmartSearch = function (arg0_options) {
		//Convert options
		let options = (arg0_options) ? arg0_options : {};
		
		//Initialise options
		if (!options.priority_order) options.priority_order = ["key"];
		
		if (options.hard_search !== false) options.hard_search = true;
		if (options.soft_search !== false) options.soft_search = true;
		
		//Declare local instance variables
		let function_expression = []; //Here 'object' is the variable to search for
		
		//Function expression syntax: (arg0_object, arg1_input, arg2_options)
		//Index all keys first
		function_expression.push(`
      //Convert from parameters
      var object = arg0_object;
      var input = arg1_input;

      //Declare local instance variables
      var all_object_keys = Object.keys(object);
      var lowercase_input = lowercase_input;
      var variable_exists = [false, undefined]; //[<variable_exists>, <variable_value>];

      //Object/key guard clause
      if (typeof input == "object") return input;
      if (object[input]) return (!options.return_key) ? object[input] : input;
    `);
		
		//Iterate over options.priority_order
		for (let i = 0; i < options.priority_order.length; i++) {
			let local_search = options.priority_order[i];
			
			//Post 0-index encapsulation for priority
			if (i > 0)
				function_expression.push(`if (!variable_exists[0]) {`);
			
			//<key> handler
			if (local_search === "key") {
				//Soft search handler
				if (options.soft_search)
					function_expression.push(`
            for (var i = 0; i < all_object_keys.length; i++)
              if (all_object_keys[i].toLowerCase().indexOf(lowercase_input) != -1)
                variable_exists = [true, (!options.return_key) ? object[all_object_keys[i]] : all_object_keys[i]];
          `);
				
				//Hard search handler
				if (options.hard_search)
					function_expression.push(`
            for (var i = 0; i < all_object_keys.length; i++)
              if (all_object_keys[i].toLowerCase() == lowercase_input)
                variable_exists = [true, (!options.return_key) ? object[all_object_keys[i]] : all_object_keys[i]];
          `);
			} else {
				//Soft search handler
				if (options.soft_search)
					function_expression.push(`
            for (var i = 0; i < all_object_keys.length; i++) try {
              var local_value = object[all_object_keys[i]].${local_search};

              if (local_value.toLowerCase().indexOf(lowercase_input) != -1)
                variable_exists = [true, (!options.return_key) ? object[all_object_keys[i]] : all_object_keys[i]];
            } catch {}
          `);
				
				//Hard search handler
				if (options.hard_search)
					function_expression.push(`
            for (var i = 0; i < all_object_keys.length; i++) try {
              var local_value = object[all_object_keys[i]].${local_search};

              if (local_value.toLowerCase() == lowercase_input)
                variable_exists = [true, (!options.return_key) ? object[all_object_keys[i]] : all_object_keys[i]];
            } catch {}
          `);
			}
			
			//Post 0-index encapsulation for priority
			if (i > 0)
				function_expression.push(`}`);
		}
		
		//Append return statement
		function_expression.push(`return (variable_exists[0]) ? variable_exists[1] : undefined;`);
		
		//Declare function
		let equation_function = new Function("arg0_object", "arg1_input", "arg2_options", function_expression.join(""));
		
		global[options.function_name] = equation_function;
		
		//Return statement
		return global[options.function_name];
	};
	
	/**
	 * Deletes a smart search function.
	 * @alias Object.deleteSmartSearch
	 * 
	 * @param {string} arg0_name - The .function_name of the smart search to delete.
	 */
	Object.deleteSmartSearch = function (arg0_name) {
		//Convert from parameters
		let function_name = arg0_name;
		
		//Delete from global
		delete global[function_name];
	};
}