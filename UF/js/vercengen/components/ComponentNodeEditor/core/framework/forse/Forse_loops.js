ve.NodeEditor.Forse.loops = {
	//Loops (For loop, [WIP] - setInterval, setTimeout, Object.iterate (Get Iteration Key, Get Iteration Value))
	for_loop: {
		name: loc("ve.registry.localisation.Forse_node_for_loop"),
		category: loc("ve.registry.localisation.Forse_category_loops"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_times"),
			type: "number"
		}],
		output_type: "number",
		special_function: function (arg0_number) {
			//Convert from parameters
			let number = arg0_number;
			
			//Declare local instance variables
			let local_node = arguments[arguments.length - 1]; //local_node (ve.NodeEditorDatatype) is always the final argument passed by run()
			let state_key = `${local_node.id}_current_index`;
			if (this.main.node_iterations[state_key] === undefined)
				this.main.node_iterations[state_key] = 0;
			
			let current_index = this.main.node_iterations[state_key]++;
			
			//Return statement
			return {
				display_value: loc("ve.registry.localisation.Forse_display_iterate_x", number),
				iterations: number,
				value: current_index,
			};
		}
	},
	get_object_iteration_key: {
		name: loc("ve.registry.localisation.Forse_node_get_obj_iter_key"),
		category: loc("ve.registry.localisation.Forse_category_loops"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_object_iteration"),
			type: "object_iteration"
		}],
		output_type: "string",
		special_function: function (arg0_object_iteration) {
			//Convert from parameters
			let object_iteration_obj = arg0_object_iteration;
			
			//Return statement
			return {
				display_value: loc("ve.registry.localisation.Forse_display_dot_key", object_iteration_obj.local_key),
				value: object_iteration_obj.local_key
			};
		}
	},
	get_object_iteration_value: {
		name: loc("ve.registry.localisation.Forse_node_get_obj_iter_value"),
		category: loc("ve.registry.localisation.Forse_category_loops"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_object_iteration"),
			type: "object_iteration"
		}],
		output_type: "any",
		special_function: function (arg0_object_iteration) {
			//Convert from parameters
			let object_iteration_obj = arg0_object_iteration;
			
			//Return statement
			return {
				display_value: loc("ve.registry.localisation.Forse_display_iteration_value"),
				value: object_iteration_obj.local_value
			};
		}
	},
	object_iterate: {
		name: loc("ve.registry.localisation.Forse_node_iterate_over_object"),
		category: loc("ve.registry.localisation.Forse_category_loops"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_object"),
			type: "any",
		}],
		output_type: "object_iteration",
		special_function: function (arg0_object) {
			//Convert from parameters
			let object = (typeof arg0_object === "object" && arg0_object !== null) ?
				arg0_object : {};
			
			//Declare local instance variables
			let entries = Object.entries(object);
			let iteration_count = entries.length;
			let local_node = arguments[arguments.length - 1];
			let state_key = `${local_node.id}_current_index`;
			
			//Make sure node_iterations is defined first
			if (this.main.node_iterations[state_key] === undefined)
				this.main.node_iterations[state_key] = 0;
			let current_index = this.main.node_iterations[state_key]++;
			
			//Get the key and value for the current index
			let current_entry = entries[current_index] || [null, null];
			let [key, value] = current_entry;
			
			//Return statement
			return {
				display_value: key !== null ? loc("ve.registry.localisation.Forse_display_key", key) : loc("ve.registry.localisation.Forse_display_empty_object"),
				iterations: iteration_count,
				value: { local_key: key, local_value: value }
			};
		},
	},
	set_timeout: {
		name: loc("ve.registry.localisation.Forse_node_set_timeout"),
		category: loc("ve.registry.localisation.Forse_category_loops"),
		input_parameters: [{
			name: loc("ve.registry.localisation.Forse_param_timeout"),
			type: "number"
		}, {
			name: loc("ve.registry.localisation.Forse_param_value"),
			type: "any"
		}],
		output_type: "any",
		special_function: async function (arg0_number, arg1_value) {
			//Convert from parameters
			let number = arg0_number;
			let value = arg1_value;
			let local_node = arguments[arguments.length - 1];
			
			//Declare local instance variables
			let delay_time = Math.returnSafeNumber(number);
			
			//Return statement
			return {
				display_value: loc("ve.registry.localisation.Forse_display_wait_ms", delay_time),
				run: async () => {
					await new Promise((resolve) => setTimeout(resolve, delay_time));
					ve.NodeEditorDatatype.draw(local_node.options.node_editor, true);
					await new Promise((resolve) => setTimeout(resolve, 10));
				},
				value: value
			};
		}
	},
};