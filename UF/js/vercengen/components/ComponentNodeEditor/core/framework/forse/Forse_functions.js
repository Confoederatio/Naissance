ve.NodeEditor.Forse.functions = {
	//Functions
	call_function: {
		name: loc("ve.registry.localisation.Forse_node_call_function"),
		category: loc("ve.registry.localisation.Forse_category_functions"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_function_key"),
			type: "string"
		}, {
			name: loc("ve.registry.localisation.Forse_param_arguments_array"),
			type: "any[]"
		}],
		output_type: "any",
		special_function: (arg0_function_key, arg1_arguments_array) => {
			//Convert from parameters
			let function_key = arg0_function_key;
			let arguments_array = arg1_arguments_array;
			
			//Return statement
			return {
				display_value: loc("ve.registry.localisation.Forse_display_run_global", function_key),
				run: () => {
					try {
						return Object.getValue(global, function_key)(...arguments_array);
					} catch (e) { console.error(e); }
				}
			};
		}
	},
	call_function_in_preview: {
		name: loc("ve.registry.localisation.Forse_node_call_function_preview"),
		category: loc("ve.registry.localisation.Forse_category_functions"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_function_key"),
			type: "string"
		}, {
			name: loc("ve.registry.localisation.Forse_param_arguments_array"),
			type: "any[]"
		}],
		output_type: "any",
		special_function: (arg0_function_key, arg1_arguments_array) => {
			//Convert from parameters
			let function_key = arg0_function_key;
			let arguments_array = arg1_arguments_array;
			
			//Declare local instance variables
			let return_value;
			try {
				return_value = Object.getValue(global, function_key)(...arguments_array);
			} catch (e) { console.error(e); }
			
			//Return statement
			return {
				display_value: loc("ve.registry.localisation.Forse_display_run_global", function_key),
				run: () => return_value,
				value: return_value
			};
		}
	},
	
	//Functions (Class)
	call_class_method: {
		name: loc("ve.registry.localisation.Forse_node_call_method"),
		category: loc("ve.registry.localisation.Forse_category_functions"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_variable"),
			type: "any"
		}, {
			name: loc("ve.registry.localisation.Forse_param_method_key"),
			type: "string"
		}, {
			name: loc("ve.registry.localisation.Forse_param_arguments_array"),
			type: "any[]"
		}],
		output_type: "any",
		special_function: (arg0_variable, arg1_method_key, arg2_arguments_array) => {
			//Convert from parameters
			let variable = arg0_variable;
			let method_key = arg1_method_key;
			let arguments_array = arg2_arguments_array;
			
			//Return statement
			return {
				display_value: loc("ve.registry.localisation.Forse_display_run_class_method", method_key),
				run: () => {
					try {
						return variable[method_key](...arguments_array);
					} catch (e) { console.error(e); }
				},
			};
		}
	},
	call_class_method_in_preview: {
		name: loc("ve.registry.localisation.Forse_node_call_method_preview"),
		category: loc("ve.registry.localisation.Forse_category_functions"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_variable"),
			type: "any"
		}, {
			name: loc("ve.registry.localisation.Forse_param_method_key"),
			type: "string"
		}, {
			name: loc("ve.registry.localisation.Forse_param_arguments_array"),
			type: "any[]"
		}],
		output_type: "any",
		special_function: (arg0_variable, arg1_method_key, arg2_arguments_array) => {
			//Convert from parameters
			let variable = arg0_variable;
			let method_key = arg1_method_key;
			let arguments_array = arg2_arguments_array;
			
			//Declare local instance variables
			let return_value;
			try {
				return_value = variable[method_key](...arguments_array);
			} catch (e) { console.error(e); }
			
			//Return statement
			return {
				display_value: loc("ve.registry.localisation.Forse_display_run_class_method", method_key),
				run: () => return_value,
				value: return_value
			};
		}
	},
	get_class_field: {
		name: loc("ve.registry.localisation.Forse_node_get_class_field"),
		category: loc("ve.registry.localisation.Forse_category_functions"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_variable"),
			type: "any"
		}, {
			name: loc("ve.registry.localisation.Forse_param_field_key"),
			type: "string"
		}],
		output_type: "any",
		special_function: (arg0_variable, arg1_field_key) => {
			//Convert from parameters
			let variable = arg0_variable;
			let field_key = arg1_field_key;
			
			//Return statement
			return {
				display_value: loc("ve.registry.localisation.Forse_display_field_access", field_key, variable[field_key]),
				value: variable[field_key]
			};
		}
	},
	set_class_field: {
		name: loc("ve.registry.localisation.Forse_node_set_class_field"),
		category: loc("ve.registry.localisation.Forse_category_functions"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_variable"),
			type: "any"
		}, {
			name: loc("ve.registry.localisation.Forse_param_field_key"),
			type: "string"
		}, {
			name: loc("ve.registry.localisation.Forse_param_arg2_value"),
			type: "any"
		}],
		output_type: "any",
		special_function: (arg0_variable, arg1_field_key, arg2_value) => {
			//Convert from parameters
			let variable = arg0_variable;
			let field_key = arg1_field_key;
			let value = arg2_value;
			
			variable[field_key] = value;
			
			//Return statement
			return {
				display_value: loc("ve.registry.localisation.Forse_display_field_access", field_key, variable[field_key]),
				value: variable[field_key]
			};
		}
	},
	
	//Functions (Expressions)
	log_error: {
		name: loc("ve.registry.localisation.Forse_node_log_error"),
		
		category: loc("ve.registry.localisation.Forse_category_functions"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_variable"),
			type: "any"
		}],
		output_type: "any",
		special_function: (arg0_variable) => {
			//Convert from parameters
			let variable = arg0_variable;
			
			console.error("[FORSE] [ERROR]", variable);
			
			//Return statement
			return {
				display_value: loc("ve.registry.localisation.Forse_display_logged_error"),
				value: variable
			};
		}
	},
	log_info: {
		name: loc("ve.registry.localisation.Forse_node_log_info"),
		
		category: loc("ve.registry.localisation.Forse_category_functions"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_variable"),
			type: "any"
		}],
		output_type: "any",
		special_function: (arg0_variable) => {
			//Convert from parameters
			let variable = arg0_variable;
			
			console.log("[FORSE] [INFO]", variable);
			
			//Return statement
			return {
				display_value: loc("ve.registry.localisation.Forse_display_logged_info"),
				value: variable
			};
		}
	},
	log_warn: {
		name: loc("ve.registry.localisation.Forse_node_log_warn"),
		
		category: loc("ve.registry.localisation.Forse_category_functions"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_variable"),
			type: "any"
		}],
		output_type: "any",
		special_function: (arg0_variable) => {
			//Convert from parameters
			let variable = arg0_variable;
			
			console.warn("[FORSE] [WARN]", variable);
			
			//Return statement
			return {
				display_value: loc("ve.registry.localisation.Forse_display_logged_warning"),
				value: variable
			};
		}
	},
	run_script: {
		name: loc("ve.registry.localisation.Forse_node_run_script"),
		
		category: loc("ve.registry.localisation.Forse_category_functions"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_script"),
			type: "script"
		}],
		output_type: "any",
		special_function: (arg0_script) => {
			//Convert from parameters
			let script = arg0_script;
			
			//Declare local instance variables
			let return_value;
			
			//Run script
			try {
				if (fs.existsSync(script)) {
					let script_value = fs.readFileSync(script, "utf8");
					return_value = eval(script_value);
				}
			} catch (e) { console.error(e); }
			
			//Return statement
			return {
				display_value: loc("ve.registry.localisation.Forse_display_run_script", path.basename(script)),
				run: () => return_value,
				value: return_value
			};
		}
	},
};