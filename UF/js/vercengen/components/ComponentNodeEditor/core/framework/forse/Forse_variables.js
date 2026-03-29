ve.NodeEditor.Forse.variables_get_obj = {
	category: loc("ve.registry.localisation.Forse_category_variables"),
	input_parameters: [{
		name: loc("ve.registry.localisation.Forse_param_arg0_key"),
		type: "string"
	}],
	special_function: function (arg0_key) {
		return {
			display_value: loc("ve.registry.localisation.Forse_display_variable_value", arg0_key, this.main.variables[arg0_key]),
			value: this.main.variables[arg0_key]
		};
	}
};
ve.NodeEditor.Forse.variables = {
	//Variables
	set_any: {
		name: loc("ve.registry.localisation.Forse_node_set_any"),
		category: loc("ve.registry.localisation.Forse_category_variables"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_key"),
			type: "string"
		}, {
			name: loc("ve.registry.localisation.Forse_param_arg1_value"),
			type: "any"
		}],
		output_type: "any",
		special_function: function (arg0_key, arg1_value) {
			//Convert from parameters
			let key = arg0_key;
			let value = arg1_value;
			
			//Declare local instance variables
			this.main.variables[key] = value;
			
			//Return statement
			return {
				display_value: loc("ve.registry.localisation.Forse_display_variable_value", key, value),
				value: value
			};
		}
	},
	set_string_array: {
		name: loc("ve.registry.localisation.Forse_node_set_string_array"),
		category: loc("ve.registry.localisation.Forse_category_variables"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_key"),
			type: "string"
		}, {
			name: loc("ve.registry.localisation.Forse_param_arg1_value"),
			type: "string"
		}],
		output_type: "string[]",
		special_function: function (arg0_key, arg1_value) {
			//Convert from parameters
			let key = arg0_key;
			let value = arg1_value;
			
			//Declare local instance variables
			this.main.variables[key] = value.split(",");
			let local_value = this.main.variables[key];
			
			//Iterate over all local_value elements and cast to string
			for (let i = 0; i < local_value.length; i++)
				if (local_value[i].toString)
					local_value[i] = local_value[i].toString();
			
			//Return statement
			return {
				display_value: loc("ve.registry.localisation.Forse_display_elements", key, local_value.length),
				value: this.main.variables[key]
			};
		}
	},
	set_number_array: {
		name: loc("ve.registry.localisation.Forse_node_set_number_array"),
		category: loc("ve.registry.localisation.Forse_category_variables"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_key"),
			type: "string"
		}, {
			name: loc("ve.registry.localisation.Forse_param_arg1_value"),
			type: "string"
		}],
		output_type: "number[]",
		special_function: function (arg0_key, arg1_value) {
			//Convert from parameters
			let key = arg0_key;
			let value = arg1_value;
			
			//Declare local instance variables
			this.main.variables[key] = value.split(",").map(parseFloat);
			let local_value = this.main.variables[key];
			
			//Return statement
			return {
				display_value: loc("ve.registry.localisation.Forse_display_elements", key, local_value.length),
				value: this.main.variables[key]
			};
		}
	},
	set_boolean: {
		name: loc("ve.registry.localisation.Forse_node_set_boolean"),
		category: loc("ve.registry.localisation.Forse_category_variables"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_key"),
			type: "string"
		}, {
			name: loc("ve.registry.localisation.Forse_param_arg1_value"),
			type: "boolean"
		}],
		output_type: "boolean",
		special_function: function (arg0_key, arg1_value) {
			//Convert from parameters
			let key = arg0_key;
			let value = arg1_value;
			
			//Declare local instance variables
			this.main.variables[key] = value;
			
			//Return statement
			return {
				display_value: (value) ? loc("ve.registry.localisation.Forse_display_variable_value", key, loc("ve.registry.localisation.Forse_value_true")) : loc("ve.registry.localisation.Forse_display_variable_value", key, loc("ve.registry.localisation.Forse_value_false")),
				value: value
			};
		}
	},
	set_number: {
		name: loc("ve.registry.localisation.Forse_node_set_number"),
		category: loc("ve.registry.localisation.Forse_category_variables"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_key"),
			type: "string"
		}, {
			name: loc("ve.registry.localisation.Forse_param_arg1_value"),
			type: "number"
		}],
		output_type: "number",
		special_function: function (arg0_key, arg1_value) {
			//Convert from parameters
			let key = arg0_key;
			let value = arg1_value;
			
			//Declare local instance variables
			this.main.variables[key] = value;
			
			//Return statement
			return {
				display_value: loc("ve.registry.localisation.Forse_display_variable_value", key, value),
				value: value
			};
		}
	},
	set_string: {
		name: loc("ve.registry.localisation.Forse_node_set_string"),
		category: loc("ve.registry.localisation.Forse_category_variables"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_key"),
			type: "string"
		}, {
			name: loc("ve.registry.localisation.Forse_param_arg1_value"),
			type: "string"
		}],
		output_type: "string",
		special_function: function (arg0_key, arg1_value) {
			//Convert from parameters
			let key = arg0_key;
			let value = arg1_value;
			
			//Declare local instance variables
			this.main.variables[key] = value;
			
			//Return statement
			return {
				display_value: loc("ve.registry.localisation.Forse_display_variable_value", key, value),
				value: value
			};
		}
	},
	set_array: {
		name: loc("ve.registry.localisation.Forse_node_set_array"),
		category: loc("ve.registry.localisation.Forse_category_variables"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_key"),
			type: "string"
		}, {
			name: loc("ve.registry.localisation.Forse_param_arg1_value"),
			type: "string"
		}],
		output_type: "any[]",
		special_function: function (arg0_key, arg1_value) {
			//Convert from parameters
			let key = arg0_key;
			let value = arg1_value;
			
			//Declare local instance variables
			this.main.variables[key] = value.split(",");
			let local_value = this.main.variables[key];
			
			//Return statement
			return {
				display_value: loc("ve.registry.localisation.Forse_display_elements", key, local_value.length),
				value: this.main.variables[key]
			};
		}
	},
	set_null: {
		name: loc("ve.registry.localisation.Forse_node_set_null"),
		category: loc("ve.registry.localisation.Forse_category_variables"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_key"),
			type: "string"
		}],
		output_type: "any",
		special_function: function (arg0_key) {
			//Convert from parameters
			let key = arg0_key;
			
			//Declare local instance variables
			this.main.variables[key] = null;
			
			//Return statement
			return {
				display_value: loc("ve.registry.localisation.Forse_display_variable_value", key, loc("ve.registry.localisation.Forse_value_null")),
				value: this.main.variables[key]
			};
		}
	},
	set_object: {
		name: loc("ve.registry.localisation.Forse_node_set_object"),
		category: loc("ve.registry.localisation.Forse_category_variables"),
		input_parameters:	[{
			name: loc("ve.registry.localisation.Forse_param_arg0_key"),
			type: "any"
		}, {
			name: loc("ve.registry.localisation.Forse_param_arg1_value"),
			type: "string"
		}],
		output_type: "any",
		special_function: function (arg0_key, arg1_value) {
			//Convert from parameters
			let key = arg0_key;
			let value = arg1_value;
			
			//Declare local instance variables
			this.main.variables[key] = (typeof value === "string") ?
				JSON.parse(value) : value;
			
			//Return statement
			return {
				display_value: loc("ve.registry.localisation.Forse_display_variable_value", key, value),
				value: this.main.variables[key]
			};
		}
	},
	
	//Variables (Get)
	get_any: {
		name: loc("ve.registry.localisation.Forse_node_get_any"),
		...ve.NodeEditor.Forse.variables_get_obj,
		output_type: "any"
	},
	get_string_array: {
		name: loc("ve.registry.localisation.Forse_node_get_string_array"),
		...ve.NodeEditor.Forse.variables_get_obj,
		output_type: "string[]"
	},
	get_number_array: {
		name: loc("ve.registry.localisation.Forse_node_get_number_array"),
		...ve.NodeEditor.Forse.variables_get_obj,
		output_type: "number[]"
	},
	get_boolean: {
		name: loc("ve.registry.localisation.Forse_node_get_boolean"),
		...ve.NodeEditor.Forse.variables_get_obj,
		output_type: "boolean"
	},
	get_number: {
		name: loc("ve.registry.localisation.Forse_node_get_number"),
		...ve.NodeEditor.Forse.variables_get_obj,
		output_type: "number"
	},
	get_string: {
		name: loc("ve.registry.localisation.Forse_node_get_string"),
		...ve.NodeEditor.Forse.variables_get_obj,
		output_type: "string"
	},
	get_array: {
		name: loc("ve.registry.localisation.Forse_node_get_array"),
		...ve.NodeEditor.Forse.variables_get_obj,
		output_type: "any[]"
	},
	get_null: {
		name: loc("ve.registry.localisation.Forse_node_get_null"),
		...ve.NodeEditor.Forse.variables_get_obj,
		output_type: "any"
	},
	get_object: {
		name: loc("ve.registry.localisation.Forse_node_get_object"),
		...ve.NodeEditor.Forse.variables_get_obj,
		output_type: "any"
	},
	get_global: {
		name: loc("ve.registry.localisation.Forse_node_get_global"),
		category: loc("ve.registry.localisation.Forse_category_variables"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_key"),
			type: "string"
		}],
		output_type: "any",
		special_function: function (arg0_key) {
			//Convert from parameters
			let key = arg0_key;
			
			//Declare local instance variables
			let obj_value = Object.getValue(global, key);
			
			//Return statement
			return {
				display_value: loc("ve.registry.localisation.Forse_display_variable_value", key, obj_value),
				value: obj_value
			};
		}
	},
};