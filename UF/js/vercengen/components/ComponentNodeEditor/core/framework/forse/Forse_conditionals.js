ve.NodeEditor.Forse.conditionals = {
	//Conditionals
	is_equal: {
		name: loc("ve.registry.localisation.Forse_node_is_equal"),
		
		category: loc("ve.registry.localisation.Forse_category_conditionals"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_variable"),
			type: "any"
		}, {
			name: loc("ve.registry.localisation.Forse_param_arg1_variable"),
			type: "any"
		}],
		output_type: "boolean",
		special_function: (arg0_variable, arg1_variable) => {
			//Convert from parameters
			let variable = arg0_variable;
			let ot_variable = arg1_variable;
			
			//Return statement
			return {
				display_value: (variable == ot_variable) ? loc("ve.registry.localisation.Forse_value_true") : loc("ve.registry.localisation.Forse_value_false"),
				value: (variable == ot_variable)
			};
		}
	},
	is_strictly_equal: {
		name: loc("ve.registry.localisation.Forse_node_is_strictly_equal"),
		category: loc("ve.registry.localisation.Forse_category_conditionals"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_variable"),
			type: "any"
		}, {
			name: loc("ve.registry.localisation.Forse_param_arg1_variable"),
			type: "any"
		}],
		output_type: "boolean",
		special_function: (arg0_variable, arg1_variable) => {
			//Convert from parameters
			let variable = arg0_variable;
			let ot_variable = arg1_variable;
			
			//Return statement
			return {
				display_value: (variable === ot_variable) ? loc("ve.registry.localisation.Forse_value_true") : loc("ve.registry.localisation.Forse_value_false"),
				value: (variable === ot_variable)
			};
		}
	},
	is_not_equal: {
		name: loc("ve.registry.localisation.Forse_node_is_not_equal"),
		category: loc("ve.registry.localisation.Forse_category_conditionals"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_variable"),
			type: "any"
		}, {
			name: loc("ve.registry.localisation.Forse_param_arg1_variable"),
			type: "any"
		}],
		output_type: "boolean",
		special_function: (arg0_variable, arg1_variable) => {
			//Convert from parameters
			let variable = arg0_variable;
			let ot_variable = arg1_variable;
			
			//Return statement
			return {
				display_value: (variable != ot_variable) ? loc("ve.registry.localisation.Forse_value_true") : loc("ve.registry.localisation.Forse_value_false"),
				value: (variable != ot_variable)
			};
		}
	},
	is_not_strictly_equal: {
		name: loc("ve.registry.localisation.Forse_node_is_not_strictly_equal"),
		category: loc("ve.registry.localisation.Forse_category_conditionals"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_variable"),
			type: "any"
		}, {
			name: loc("ve.registry.localisation.Forse_param_arg1_variable"),
			type: "any"
		}],
		output_type: "boolean",
		special_function: (arg0_variable, arg1_variable) => {
			//Convert from parameters
			let variable = arg0_variable;
			let ot_variable = arg1_variable;
			
			//Return statement
			return {
				display_value: (variable !== ot_variable) ? loc("ve.registry.localisation.Forse_value_true") : loc("ve.registry.localisation.Forse_value_false"),
				value: (variable !== ot_variable)
			};
		}
	},
	geq: {
		name: loc("ve.registry.localisation.Forse_node_geq"),
		category: loc("ve.registry.localisation.Forse_category_conditionals"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_variable"),
			type: "any"
		}, {
			name: loc("ve.registry.localisation.Forse_param_arg1_variable"),
			type: "any"
		}],
		output_type: "boolean",
		special_function: (arg0_variable, arg1_variable) => {
			//Convert from parameters
			let variable = arg0_variable;
			let ot_variable = arg1_variable;
			
			//Return statement
			return {
				display_value: (variable >= ot_variable) ? loc("ve.registry.localisation.Forse_value_true") : loc("ve.registry.localisation.Forse_value_false"),
				value: (variable >= ot_variable)
			};
		}
	},
	greater_than: {
		name: loc("ve.registry.localisation.Forse_node_greater_than"),
		category: loc("ve.registry.localisation.Forse_category_conditionals"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_variable"),
			type: "any"
		}, {
			name: loc("ve.registry.localisation.Forse_param_arg1_variable"),
			type: "any"
		}],
		output_type: "boolean",
		special_function: (arg0_variable, arg1_variable) => {
			//Convert from parameters
			let variable = arg0_variable;
			let ot_variable = arg1_variable;
			
			//Return statement
			return {
				display_value: (variable > ot_variable) ? loc("ve.registry.localisation.Forse_value_true") : loc("ve.registry.localisation.Forse_value_false"),
				value: (variable > ot_variable)
			};
		}
	},
	leq: {
		name: loc("ve.registry.localisation.Forse_node_leq"),
		category: loc("ve.registry.localisation.Forse_category_conditionals"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_variable"),
			type: "any"
		}, {
			name: loc("ve.registry.localisation.Forse_param_arg1_variable"),
			type: "any"
		}],
		output_type: "boolean",
		special_function: (arg0_variable, arg1_variable) => {
			//Convert from parameters
			let variable = arg0_variable;
			let ot_variable = arg1_variable;
			
			//Return statement
			return {
				display_value: (variable <= ot_variable) ? loc("ve.registry.localisation.Forse_value_true") : loc("ve.registry.localisation.Forse_value_false"),
				value: (variable <= ot_variable)
			};
		}
	},
	less_than: {
		name: loc("ve.registry.localisation.Forse_node_less_than"),
		category: loc("ve.registry.localisation.Forse_category_conditionals"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_variable"),
			type: "any"
		}, {
			name: loc("ve.registry.localisation.Forse_param_arg1_variable"),
			type: "any"
		}],
		output_type: "boolean",
		special_function: (arg0_variable, arg1_variable) => {
			//Convert from parameters
			let variable = arg0_variable;
			let ot_variable = arg1_variable;
			
			//Return statement
			return {
				display_value: (variable < ot_variable) ? loc("ve.registry.localisation.Forse_value_true") : loc("ve.registry.localisation.Forse_value_false"),
				value: (variable < ot_variable)
			};
		}
	},
	
	//Conditionals (If Statements)
	if_then: {
		name: loc("ve.registry.localisation.Forse_node_if_then"),
		category: loc("ve.registry.localisation.Forse_category_conditionals"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_boolean"),
			type: "boolean"
		}],
		output_type: "boolean",
		special_function: (arg0_boolean) => {
			//Convert from parameters
			let boolean = arg0_boolean;
			
			//Return statement
			return {
				abort: (!boolean),
				display_value: (boolean) ? loc("ve.registry.localisation.Forse_value_true") : loc("ve.registry.localisation.Forse_value_false"),
				value: boolean
			};
		}
	},
	"false": {
		name: loc("ve.registry.localisation.Forse_node_false"),
		category: loc("ve.registry.localisation.Forse_category_conditionals"),
		output_type: "boolean",
		special_function: () => {
			//Return statement
			return {
				display_value: loc("ve.registry.localisation.Forse_value_false"),
				value: false
			};
		}
	},
	"true": {
		name: loc("ve.registry.localisation.Forse_node_true"),
		category: loc("ve.registry.localisation.Forse_category_conditionals"),
		output_type: "boolean",
		special_function: () => {
			//Return statement
			return {
				display_value: loc("ve.registry.localisation.Forse_value_true"),
				value: true
			};
		}
	},
	"null": {
		name: loc("ve.registry.localisation.Forse_node_null"),
		category: loc("ve.registry.localisation.Forse_category_conditionals"),
		output_type: "any",
		special_function: () => {
			//Return statement
			return {
				display_value: loc("ve.registry.localisation.Forse_value_null"),
				value: null
			};
		}
	},
	"undefined": {
		name: loc("ve.registry.localisation.Forse_node_undefined"),
		category: loc("ve.registry.localisation.Forse_category_conditionals"),
		output_type: "any",
		special_function: () => {
			//Return statement
			return {
				display_value: loc("ve.registry.localisation.Forse_value_undefined"),
				value: undefined
			};
		}
	},
	
	//Conditionals (Logic)
	and: {
		name: loc("ve.registry.localisation.Forse_node_and"),
		category: loc("ve.registry.localisation.Forse_category_conditionals"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_variable"),
			type: "any"
		}, {
			name: loc("ve.registry.localisation.Forse_param_arg1_variable"),
			type: "any"
		}],
		output_type: "boolean",
		special_function: (arg0_variable, arg1_variable) => {
			//Convert from parameters
			let variable = arg0_variable;
			let ot_variable = arg1_variable;
			
			//Return statement
			return {
				display_value: (variable && ot_variable) ? loc("ve.registry.localisation.Forse_value_true") : loc("ve.registry.localisation.Forse_value_false"),
				value: (variable && ot_variable)
			};
		}
	},
	not: {
		name: loc("ve.registry.localisation.Forse_node_not"),
		category: loc("ve.registry.localisation.Forse_category_conditionals"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_variable"),
			type: "any"
		}],
		output_type: "boolean",
		special_function: (arg0_variable) => {
			//Convert from parameters
			let variable = arg0_variable;
			
			//Return statement
			return {
				display_value: (!variable) ? loc("ve.registry.localisation.Forse_value_true") : loc("ve.registry.localisation.Forse_value_false"),
				value: (!variable)
			};
		}
	},
	or: {
		name: loc("ve.registry.localisation.Forse_node_or"),
		category: loc("ve.registry.localisation.Forse_category_conditionals"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_variable"),
			type: "any"
		}, {
			name: loc("ve.registry.localisation.Forse_param_arg1_variable"),
			type: "any"
		}],
		output_type: "boolean",
		special_function: (arg0_variable, arg1_variable) => {
			//Convert from parameters
			let variable = arg0_variable;
			let ot_variable = arg1_variable;
			
			//Return statement
			return {
				display_value: (variable || ot_variable) ? loc("ve.registry.localisation.Forse_value_true") : loc("ve.registry.localisation.Forse_value_false"),
				value: (variable || ot_variable)
			};
		}
	},
	xor: {
		name: loc("ve.registry.localisation.Forse_node_xor"),
		category: loc("ve.registry.localisation.Forse_category_conditionals"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_arg0_variable"),
			type: "any"
		}, {
			name: loc("ve.registry.localisation.Forse_param_arg1_variable"),
			type: "any"
		}],
		output_type: "boolean",
		special_function: (arg0_variable, arg1_variable) => {
			//Convert from parameters
			let variable = arg0_variable;
			let ot_variable = arg1_variable;
			
			//Return statement
			let is_false = false;
			
			if (variable && ot_variable) is_false = true;
			if (!variable && !ot_variable) is_false = true;
			
			return {
				display_value: (!is_false) ? loc("ve.registry.localisation.Forse_value_true") : loc("ve.registry.localisation.Forse_value_false"),
				value: (!is_false)
			};
		}
	},
};