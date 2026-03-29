ve.NodeEditor.Forse.variables_casting = {
	//Variables (Convert)
	convert_to_any: {
		name: loc("ve.registry.localisation.Forse_node_convert_to_any"),
		category: loc("ve.registry.localisation.Forse_category_variables_casting"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_variable"),
			type: "any"
		}],
		output_type: "any",
		special_function: function (arg0_variable) {
			//Convert from parameters
			let variable = arg0_variable;
			
			//Return statement
			return {
				display_value: loc("ve.registry.localisation.Forse_display_type_any"),
				value: variable
			};
		}
	},
	convert_to_array: {
		name: loc("ve.registry.localisation.Forse_node_convert_to_array"),
		category: loc("ve.registry.localisation.Forse_category_variables_casting"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_variable"),
			type: "any"
		}],
		output_type: "any[]",
		special_function: function (arg0_variable) {
			//Convert from parameters
			let variable = arg0_variable;
			
			//Declare local instance variables
			let local_value = variable;
			
			//Convert to array if not already an array
			if (!Array.isArray(local_value)) local_value = Array.toArray(local_value);
			
			//Return statement
			return {
				display_value: loc("ve.registry.localisation.Forse_display_any_array_len", local_value.length),
				value: local_value
			};
		}
	},
	convert_to_string_array: {
		name: loc("ve.registry.localisation.Forse_node_convert_to_string_array"),
		category: loc("ve.registry.localisation.Forse_category_variables_casting"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_variable"),
			type: "any"
		}],
		output_type: "string[]",
		special_function: function (arg0_variable) {
			//Convert from parameters
			let variable = arg0_variable;
			
			//Declare local instance variables
			let local_value = variable;
			
			//Convert to array if not already an array
			if (!Array.isArray(local_value)) local_value = Array.toArray(local_value);
			for (let i = 0; i < local_value.length; i++)
				if (local_value[i].toString) {
					local_value[i] = local_value[i].toString();
				} else if (typeof local_value[i] !== "string") {
					try {
						local_value[i] = JSON.stringify(local_value[i]);
					} catch (e) {
						local_value[i] = `${local_value[i]}`;
					}
				}
			
			//Return statement
			return {
				display_value: loc("ve.registry.localisation.Forse_display_string_array_len", local_value.length),
				value: local_value
			};
		}
	},
	convert_to_number_array: {
		name: loc("ve.registry.localisation.Forse_node_convert_to_number_array"),
		category: loc("ve.registry.localisation.Forse_category_variables_casting"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_variable"),
			type: "any"
		}],
		output_type: "number[]",
		special_function: function (arg0_variable) {
			//Convert from parameters
			let variable = arg0_variable;
			
			//Declare local instance variables
			let local_value = variable;
			
			//Convert to array if not already an array
			if (!Array.isArray(local_value)) local_value = Array.toArray(local_value);
			for (let i = 0; i < local_value.length; i++)
				if (typeof local_value[i] !== "number")
					local_value[i] = parseFloat(local_value[i]);
			
			//Return statement
			return {
				display_value: loc("ve.registry.localisation.Forse_display_number_array_len", local_value.length),
				value: local_value
			};
		}
	},
	convert_to_boolean: {
		name: loc("ve.registry.localisation.Forse_node_convert_to_boolean"),
		category: loc("ve.registry.localisation.Forse_category_variables_casting"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_variable"),
			type: "any"
		}],
		output_type: "boolean",
		special_function: function (arg0_variable) {
			//Convert from parameters
			let variable = arg0_variable;
			
			//Return statement
			return {
				display_value: loc("ve.registry.localisation.Forse_display_boolean_value", (variable) ? loc("ve.registry.localisation.Forse_value_true") : loc("ve.registry.localisation.Forse_value_false")),
				value: (variable) ? true : false
			};
		}
	},
	convert_to_number: {
		name: loc("ve.registry.localisation.Forse_node_convert_to_number"),
		category: loc("ve.registry.localisation.Forse_category_variables_casting"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_variable"),
			type: "any"
		}],
		output_type: "number",
		special_function: function (arg0_variable) {
			//Convert from parameters
			let variable = arg0_variable;
			
			//Declare local instance variables
			let casted_number = Math.returnSafeNumber(variable);
			
			//Return statement
			return {
				display_value: casted_number,
				value: casted_number
			};
		}
	},
	convert_to_script: {
		name: loc("ve.registry.localisation.Forse_node_convert_to_script"),
		category: loc("ve.registry.localisation.Forse_category_variables_casting"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_file_path"),
			type: "string"
		}],
		output_type: "string",
		special_function: function (arg0_file_path) {
			//Convert from parameters
			let file_path = arg0_file_path;
			
			//Return statement
			return {
				display_value: file_path,
				value: file_path
			};
		}
	},
	convert_to_string: {
		name: loc("ve.registry.localisation.Forse_node_convert_to_string"),
		category: loc("ve.registry.localisation.Forse_category_variables_casting"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_variable"),
			type: "any"
		}],
		output_type: "string",
		special_function: function (arg0_variable) {
			//Convert from parameters
			let variable = arg0_variable;
			
			//Declare local instance variables
			let local_value = variable;
			
			if (local_value.toString) {
				local_value = local_value.toString();
			} else if (typeof local_value !== "string") {
				try {
					local_value = JSON.stringify(local_value);
				} catch (e) {
					local_value = `${local_value}`;
				}
			}
			
			//Return statement
			return {
				display_value: local_value,
				value: local_value
			};
		}
	},
};