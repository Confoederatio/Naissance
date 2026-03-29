ve.NodeEditor.Forse.variables_expression = {
	array_concatenate: {
		name: loc("ve.registry.localisation.Forse_node_array_concat"),
		category: loc("ve.registry.localisation.Forse_category_variables_expressions"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_array"),
			type: "any[]"
		}, {
			name: loc("ve.registry.localisation.Forse_param_arg1_array"),
			type: "any[]"
		}],
		output_type: "any[]",
		special_function: function (arg0_array, arg1_array) {
			//Convert from parameters
			let array = arg0_array;
			let ot_array = arg1_array;
			
			//Declare local instance variables
			let concat_array = array.concat(ot_array);
			
			//Return statement
			return {
				display_value: loc("ve.registry.localisation.Forse_display_any_array_len", concat_array.length),
				value: concat_array
			};
		}
	},
	array_indexof: {
		name: loc("ve.registry.localisation.Forse_node_array_indexof"),
		category: loc("ve.registry.localisation.Forse_category_variables_expressions"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_array"),
			type: "any[]"
		}, {
			name: loc("ve.registry.localisation.Forse_param_arg1_element"),
			type: "any"
		}],
		output_type: "number",
		special_function: function (arg0_array, arg1_element) {
			//Convert from parameters
			let array = arg0_array;
			let element = arg1_element;
			
			//Declare local instance variables
			let index = array.indexOf(element);
			
			//Return statement
			return {
				display_value: `${index}`,
				value: index
			};
		}
	},
	array_length: {
		name: loc("ve.registry.localisation.Forse_node_array_length"),
		category: loc("ve.registry.localisation.Forse_category_variables_expressions"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_array"),
			type: "any[]"
		}],
		output_type: "number",
		special_function: function (arg0_array) {
			//Convert from parameters
			let array = arg0_array;
			
			//Return statement
			return {
				display_value: `${array.length}`,
				value: array.length
			};
		}
	},
	array_pop: {
		name: loc("ve.registry.localisation.Forse_node_array_pop"),
		category: loc("ve.registry.localisation.Forse_category_variables_expressions"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_array"),
			type: "any[]"
		}],
		output_type: "any[]",
		special_function: function (arg0_array) {
			//Convert from parameters
			let array = arg0_array;
			
			//Declare local instance variables
			array.pop();
			
			//Return statement
			return {
				display_value: loc("ve.registry.localisation.Forse_display_any_array_len", array.length),
				value: array
			};
		}
	},
	array_push: {
		name: loc("ve.registry.localisation.Forse_node_array_push"),
		category: loc("ve.registry.localisation.Forse_category_variables_expressions"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_array"),
			type: "any[]"
		}, {
			name: loc("ve.registry.localisation.Forse_param_arg1_element"),
			type: "any"
		}],
		output_type: "any[]",
		special_function: function (arg0_array, arg1_element) {
			//Convert from parameters
			let array = arg0_array;
			let element = arg1_element;
			
			//Declare local instance variables
			array.push(element);
			
			//Return statement
			return {
				display_value: loc("ve.registry.localisation.Forse_display_pushed_element", element),
				value: array
			};
		}
	},
	array_reverse: {
		name: loc("ve.registry.localisation.Forse_node_array_reverse"),
		category: loc("ve.registry.localisation.Forse_category_variables_expressions"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_array"),
			type: "any[]"
		}],
		output_type: "any[]",
		special_function: function (arg0_array) {
			//Convert from parameters
			let array = arg0_array;
			
			//Declare local instance variables
			let local_value = array.reverse();
			
			//Return statement
			return {
				display_value: loc("ve.registry.localisation.Forse_display_any_array_len", local_value.length),
				value: local_value
			};
		}
	},
	array_shift: {
		name: loc("ve.registry.localisation.Forse_node_array_shift"),
		category: loc("ve.registry.localisation.Forse_category_variables_expressions"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_array"),
			type: "any[]"
		}],
		output_type: "any",
		special_function: function (arg0_array) {
			//Convert from parameters
			let array = arg0_array;
			
			//Declare local instance variables
			let shifted_element = array.shift();
			
			//Return statement
			return {
				display_value: loc("ve.registry.localisation.Forse_display_shifted_element", shifted_element),
				value: shifted_element
			};
		}
	},
	array_splice: {
		name: loc("ve.registry.localisation.Forse_node_array_splice"),
		category: loc("ve.registry.localisation.Forse_category_variables_expressions"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_array"),
			type: "any[]"
		}, {
			name: loc("ve.registry.localisation.Forse_param_arg1_index"),
			type: "number"
		}, {
			name: loc("ve.registry.localisation.Forse_param_arg2_how_many"),
			type: "number"
		}],
		output_type: "any[]",
		special_function: function (arg0_array, arg1_index, arg2_how_many) {
			//Convert from parameters
			let array = arg0_array;
			let index = arg1_index;
			let how_many = arg2_how_many;
			
			//Declare local instance variables
			array.splice(index, how_many);
			
			//Return statement
			return {
				display_value: loc("ve.registry.localisation.Forse_display_spliced_items", how_many),
				value: array
			};
		}
	},
	array_unshift: {
		name: loc("ve.registry.localisation.Forse_node_array_unshift"),
		category: loc("ve.registry.localisation.Forse_category_variables_expressions"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_array"),
			type: "any[]"
		}, {
			name: loc("ve.registry.localisation.Forse_param_arg1_element"),
			type: "any"
		}],
		output_type: "any[]",
		special_function: function (arg0_array, arg1_element) {
			//Convert from parameters
			let array = arg0_array;
			let element = arg1_element;
			
			//Declare local instance variables
			array.unshift(element);
			
			//Return statement
			return {
				display_value: loc("ve.registry.localisation.Forse_display_unshifted_element", element),
				value: array
			};
		}
	},
	join_array: {
		name: loc("ve.registry.localisation.Forse_node_join_array"),
		category: loc("ve.registry.localisation.Forse_category_variables_expressions"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_array"),
			type: "any[]"
		}, {
			name: loc("ve.registry.localisation.Forse_param_arg1_separator"),
			type: "string"
		}],
		output_type: "string",
		special_function: function (arg0_array, arg1_separator) {
			//Convert from parameters
			let array = arg0_array;
			let separator = arg1_separator;
			
			//Declare local instance variables
			let result = array.join(separator);
			
			//Return statement
			return {
				display_value: loc("ve.registry.localisation.Forse_display_quoted_string", result),
				value: result
			};
		}
	},
	split_string: {
		name: loc("ve.registry.localisation.Forse_node_split_string"),
		category: loc("ve.registry.localisation.Forse_category_variables_expressions"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_string"),
			type: "string"
		}, {
			name: loc("ve.registry.localisation.Forse_param_arg1_separator"),
			type: "string"
		}],
		output_type: "string[]",
		special_function: function (arg0_string, arg1_separator) {
			//Convert from parameters
			let string = arg0_string;
			let separator = arg1_separator;
			
			//Declare local instance variables
			let result = string.split(separator);
			
			//Return statement
			return {
				display_value: loc("ve.registry.localisation.Forse_display_elements_count", result.length),
				value: result
			};
		}
	},
	
	//Object
	concatenate_objects: {
		name: loc("ve.registry.localisation.Forse_node_merge_objects"),
		category: loc("ve.registry.localisation.Forse_category_variables_expressions"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_object"),
			type: "any"
		}, {
			name: loc("ve.registry.localisation.Forse_param_arg1_object"),
			type: "any"
		}],
		output_type: "any",
		special_function: function (arg0_object, arg1_object) {
			//Convert from parameters
			let object = arg0_object;
			let ot_object = arg1_object;
			
			//Declare local instance variables
			let merged = Object.assign({}, object, ot_object);
			
			//Return statement
			return {
				display_value: loc("ve.registry.localisation.Forse_display_merged_object"),
				value: merged
			};
		}
	},
	get_object_keys: {
		name: loc("ve.registry.localisation.Forse_node_get_object_keys"),
		category: loc("ve.registry.localisation.Forse_category_variables_expressions"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_object"),
			type: "any"
		}],
		output_type: "string[]",
		special_function: function (arg0_object) {
			//Convert from parameters
			let object = arg0_object;
			
			//Declare local instance variables
			let keys = Object.keys(object);
			
			//Return statement
			return {
				display_value: loc("ve.registry.localisation.Forse_display_keys_count", keys.length),
				value: keys
			};
		}
	},
	get_object_values: {
		name: loc("ve.registry.localisation.Forse_node_get_object_values"),
		category: loc("ve.registry.localisation.Forse_category_variables_expressions"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_object"),
			type: "any"
		}],
		output_type: "any[]",
		special_function: function (arg0_object) {
			//Convert from parameters
			let object = arg0_object;
			
			//Declare local instance variables
			let values = Object.values(object);
			
			//Return statement
			return {
				display_value: loc("ve.registry.localisation.Forse_display_values_count", values.length),
				value: values
			};
		}
	},
	
	//Number
	add_numbers: {
		name: loc("ve.registry.localisation.Forse_node_add_numbers"),
		category: loc("ve.registry.localisation.Forse_category_variables_expressions"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_number"),
			type: "number"
		}, {
			name: loc("ve.registry.localisation.Forse_param_arg1_number"),
			type: "number"
		}],
		output_type: "number",
		special_function: function (arg0_number, arg1_number) {
			//Convert from parameters
			let number = arg0_number;
			let ot_number = arg1_number;
			
			//Declare local instance variables
			let sum = number + ot_number;
			
			//Return statement
			return {
				display_value: `${sum}`,
				value: sum
			};
		}
	},
	exponentiate_numbers: {
		name: loc("ve.registry.localisation.Forse_node_exponentiate_numbers"),
		category: loc("ve.registry.localisation.Forse_category_variables_expressions"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_number"),
			type: "number"
		}, {
			name: loc("ve.registry.localisation.Forse_param_arg1_number"),
			type: "number"
		}],
		output_type: "number",
		special_function: function (arg0_number, arg1_number) {
			//Convert from parameters
			let number = arg0_number;
			let ot_number = arg1_number;
			
			//Declare local instance variables
			let result = Math.pow(number, ot_number);
			
			//Return statement
			return {
				display_value: `${result}`,
				value: result
			};
		}
	},
	modulo_numbers: {
		name: loc("ve.registry.localisation.Forse_node_modulo"),
		category: loc("ve.registry.localisation.Forse_category_variables_expressions"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_number"),
			type: "number"
		}, {
			name: loc("ve.registry.localisation.Forse_param_arg1_number"),
			type: "number"
		}],
		output_type: "number",
		special_function: function (arg0_number, arg1_number) {
			//Convert from parameters
			let number = arg0_number;
			let ot_number = arg1_number;
			
			//Declare local instance variables
			let result = number % ot_number;
			
			//Return statement
			return {
				display_value: `${result}`,
				value: result
			};
		}
	},
	multiply_numbers: {
		name: loc("ve.registry.localisation.Forse_node_multiply_numbers"),
		category: loc("ve.registry.localisation.Forse_category_variables_expressions"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_number"),
			type: "number"
		}, {
			name: loc("ve.registry.localisation.Forse_param_arg1_number"),
			type: "number"
		}],
		output_type: "number",
		special_function: function (arg0_number, arg1_number) {
			//Convert from parameters
			let number = arg0_number;
			let ot_number = arg1_number;
			
			//Declare local instance variables
			let result = number * ot_number;
			
			//Return statement
			return {
				display_value: `${result}`,
				value: result
			};
		}
	},
	divide_numbers: {
		name: loc("ve.registry.localisation.Forse_node_divide_numbers"),
		category: loc("ve.registry.localisation.Forse_category_variables_expressions"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_number"),
			type: "number"
		}, {
			name: loc("ve.registry.localisation.Forse_param_arg1_number"),
			type: "number"
		}],
		output_type: "number",
		special_function: function (arg0_number, arg1_number) {
			//Convert from parameters
			let number = arg0_number;
			let ot_number = arg1_number;
			
			//Declare local instance variables
			let result = number / ot_number;
			
			//Return statement
			return {
				display_value: `${result}`,
				value: result
			};
		}
	},
	subtract_numbers: {
		name: loc("ve.registry.localisation.Forse_node_subtract_numbers"),
		category: loc("ve.registry.localisation.Forse_category_variables_expressions"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_number"),
			type: "number"
		}, {
			name: loc("ve.registry.localisation.Forse_param_arg1_number"),
			type: "number"
		}],
		output_type: "number",
		special_function: function (arg0_number, arg1_number) {
			//Convert from parameters
			let number = arg0_number;
			let ot_number = arg1_number;
			
			//Declare local instance variables
			let result = number - ot_number;
			
			//Return statement
			return {
				display_value: `${result}`,
				value: result
			};
		}
	},
	
	//String
	add_strings: {
		name: loc("ve.registry.localisation.Forse_node_add_strings"),
		category: loc("ve.registry.localisation.Forse_category_variables_expressions"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_string"),
			type: "string"
		}, {
			name: loc("ve.registry.localisation.Forse_param_arg1_string"),
			type: "string"
		}],
		output_type: "string",
		special_function: function (arg0_string, arg1_string) {
			//Convert from parameters
			let string = arg0_string;
			let ot_string = arg1_string;
			
			//Declare local instance variables
			let result = string + ot_string;
			
			//Return statement
			return {
				display_value: result,
				value: result
			};
		}
	},
	string_endswith: {
		name: loc("ve.registry.localisation.Forse_node_ends_with"),
		category: loc("ve.registry.localisation.Forse_category_variables_expressions"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_string"),
			type: "string"
		}, {
			name: loc("ve.registry.localisation.Forse_param_arg1_search"),
			type: "string"
		}],
		output_type: "boolean",
		special_function: function (arg0_string, arg1_search) {
			//Convert from parameters
			let string = arg0_string;
			let search = arg1_search;
			
			//Declare local instance variables
			let result = string.endsWith(search);
			
			//Return statement
			return {
				display_value: result ? loc("ve.registry.localisation.Forse_value_true") : loc("ve.registry.localisation.Forse_value_false"),
				value: result
			};
		}
	},
	string_matches: {
		name: loc("ve.registry.localisation.Forse_node_matches"),
		category: loc("ve.registry.localisation.Forse_category_variables_expressions"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_string"),
			type: "string"
		}, {
			name: loc("ve.registry.localisation.Forse_param_arg1_regex"),
			type: "string"
		}],
		output_type: "string[]",
		special_function: function (arg0_string, arg1_regex) {
			//Convert from parameters
			let string = arg0_string;
			let regex_string = arg1_regex;
			
			//Declare local instance variables
			let regex = new RegExp(regex_string, "g");
			let result = string.match(regex) || [];
			
			//Return statement
			return {
				display_value: loc("ve.registry.localisation.Forse_display_matches_count", result.length),
				value: result
			};
		}
	},
	string_replace: {
		name: loc("ve.registry.localisation.Forse_node_replace"),
		category: loc("ve.registry.localisation.Forse_category_variables_expressions"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_string"),
			type: "string"
		}, {
			name: loc("ve.registry.localisation.Forse_param_arg1_pattern"),
			type: "string"
		}, {
			name: loc("ve.registry.localisation.Forse_param_arg2_replacement"),
			type: "string"
		}],
		output_type: "string",
		special_function: function (arg0_string, arg1_pattern, arg2_replacement) {
			//Convert from parameters
			let string = arg0_string;
			let pattern = arg1_pattern;
			let replacement = arg2_replacement;
			
			//Declare local instance variables
			let result = string.replace(pattern, replacement);
			
			//Return statement
			return {
				display_value: result,
				value: result
			};
		}
	},
	string_replace_all: {
		name: loc("ve.registry.localisation.Forse_node_replace_all"),
		category: loc("ve.registry.localisation.Forse_category_variables_expressions"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_string"),
			type: "string"
		}, {
			name: loc("ve.registry.localisation.Forse_param_arg1_pattern"),
			type: "string"
		}, {
			name: loc("ve.registry.localisation.Forse_param_arg2_replacement"),
			type: "string"
		}],
		output_type: "string",
		special_function: function (arg0_string, arg1_pattern, arg2_replacement) {
			//Convert from parameters
			let string = arg0_string;
			let pattern = arg1_pattern;
			let replacement = arg2_replacement;
			
			//Declare local instance variables
			let result = string.replaceAll(pattern, replacement);
			
			//Return statement
			return {
				display_value: result,
				value: result
			};
		}
	},
	string_length: {
		name: loc("ve.registry.localisation.Forse_node_string_length"),
		category: loc("ve.registry.localisation.Forse_category_variables_expressions"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_string"),
			type: "string"
		}],
		output_type: "number",
		special_function: function (arg0_string) {
			//Convert from parameters
			let string = arg0_string;
			
			//Return statement
			return {
				display_value: `${string.length}`,
				value: string.length
			};
		}
	},
	string_startswith: {
		name: loc("ve.registry.localisation.Forse_node_starts_with"),
		category: loc("ve.registry.localisation.Forse_category_variables_expressions"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_string"),
			type: "string"
		}, {
			name: loc("ve.registry.localisation.Forse_param_arg1_search"),
			type: "string"
		}],
		output_type: "boolean",
		special_function: function (arg0_string, arg1_search) {
			//Convert from parameters
			let string = arg0_string;
			let search = arg1_search;
			
			//Declare local instance variables
			let result = string.startsWith(search);
			
			//Return statement
			return {
				display_value: result ? loc("ve.registry.localisation.Forse_value_true") : loc("ve.registry.localisation.Forse_value_false"),
				value: result
			};
		}
	}
};