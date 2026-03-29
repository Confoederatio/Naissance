/**
 * Internal DSL of <span color="yellow">{@link ve.NodeEditor}</span>.
 *
 * **Custom Nodes** (6):
 * - Config: Node Category, Node Name, Node Output Type, Comment
 * - Parameters: Input (Parameter), Output (Return)
 *
 * **Default Nodes** (81):
 * - __Booleans__: Is Equal, Is Strictly Equal, Is Not Equal, Is Not Strictly Equal, Greater or Equal Than, Greater Than, Less Than or Equal, To Less Than, If Then, False, True, Null, Undefined, AND, NOT, OR, XOR
 * - __Functions__: Call Function, Call Function (Preview), Call Method, Call Method (Preview), Get Class Field, Set Class Field, (Log) ERROR, (Log) INFO, (Log) WARN, Run Script
 * - __Loops__: For Loop, Get Obj.Iter. Key, Get Obj.Iter. Value, Iterate over Object, Set Timeout
 * - __Variables__: Set Any, Set String Array, Set Number Array, Set Boolean, Set Number, Set String, Set Array, Set Null, Set Object, Get Any, Get String Array, Get Number Array, Get Boolean, Get Number, Get String, Get Array, Get Null, Get Object, Get Global
 *   - <u>Variables (Casting)</u>: Convert to Any, Convert to Array, Convert to String Array, Convert to Number Array, Convert to Boolean, Convert to Number, Convert to Script, Convert to String
 *   - <u>Variables (Expressions)</u>: Array Concat, Array Indexof, Array Length, Array Pop, Array Push, Array Reverse, Array Shift, Array Splice, Array Unshift, Join Array, Split String, Merge Objects, Get Object Keys, Get Object Values, Add Numbers, Exponentiate Numbers, Modulo, Multiply Numbers, Divide Numbers, Subtract Numbers, Add Strings, Ends With, Matches, Replace, Replace All, String Length, Starts With
 *
 * ##### Static Methods:
 * - <span color=00ffff>{@link ve.NodeEditor.Forse.getForseCustomNodesObject|getForseCustomNodesObject}</span>() | {@link Object}
 * - <span color=00ffff>{@link ve.NodeEditor.Forse.getForseObject|getForseObject}</span>(arg0_options:{@link Object}) | {@link Object}
 *
 * @memberof ve.Component.ve.NodeEditor
 * @type {ve.NodeEditor.Forse}
 */
ve.NodeEditor.Forse = class {
	/**
	 * Returns custom nodes from Forse that are needed for recursion.
	 * - Static method of: {@link ve.NodeEditor.Forse}
	 *
	 * @alias getForseCustomNodesObject
	 * @memberof ve.Component.ve.NodeEditor.ve.NodeEditor.Forse
	 *
	 * @returns {Object}
	 */
	static getForseCustomNodesObject () {
		//Return statement
		return {
			category_types: {
				[loc("ve.registry.localisation.Forse_category_config")]: {
					colour: [70, 70, 90],
					text_colour: [200, 200, 255],
				},
				[loc("ve.registry.localisation.Forse_category_custom")]: {
					colour: [130, 90, 160],
					text_colour: [255, 255, 255]
				},
				[loc("ve.registry.localisation.Forse_category_parameters")]: {
					colour: [50, 50, 50],
					text_colour: [255, 255, 255],
				}
			},
			node_types: {
				ve_comment: {
					name: loc("ve.registry.localisation.Forse_node_comment"),
					category: loc("ve.registry.localisation.Forse_category_config"),
					input_parameters: [],
					options: { is_comment: true },
					output_type: "none",
				},
				ve_config_category: {
					name: loc("ve.registry.localisation.Forse_node_category"),
					category: loc("ve.registry.localisation.Forse_category_config"),
					input_parameters: [{ name: loc("ve.registry.localisation.Forse_param_category"), type: "string" }],
					is_internal: true,
					output_type: "string",
					special_function: (val) => {
						return { value: val };
					},
				},
				ve_config_name: {
					name: loc("ve.registry.localisation.Forse_node_name"),
					category: loc("ve.registry.localisation.Forse_category_config"),
					input_parameters: [{ name: loc("ve.registry.localisation.Forse_param_name"), type: "string" }],
					is_internal: true,
					output_type: "string",
					special_function: (val) => {
						return { value: val };
					},
				},
				ve_config_output_type: {
					name: loc("ve.registry.localisation.Forse_node_output_type"),
					category: loc("ve.registry.localisation.Forse_category_config"),
					input_parameters: [{ name: loc("ve.registry.localisation.Forse_param_type"), type: "string" }],
					is_internal: true,
					output_type: "string",
					special_function: (val) => {
						return { value: val };
					},
				},
				ve_input: {
					name: loc("ve.registry.localisation.Forse_node_input"),
					category: loc("ve.registry.localisation.Forse_category_parameters"),
					input_parameters: [
						{ name: loc("ve.registry.localisation.Forse_param_name"), type: "string" },
						{ name: loc("ve.registry.localisation.Forse_param_type"), type: "string" },
					],
					is_internal: true,
					output_type: "any",
					special_function: async function (p_name, p_type, context_node) {
						//Declare local instance variables
						let elapsed_time = 0;
						let poll_interval = 10; //Check every 10ms
						
						// Polling loop: Wait for runtime_value to be populated by createCustomExecutionLogic
						while (
							context_node.runtime_value === undefined
							) {
							await new Promise((resolve) => setTimeout(resolve, poll_interval));
							elapsed_time += poll_interval;
						}
						
						//Return statement
						return {
							value: context_node ? context_node.runtime_value : undefined,
						};
					},
				},
				ve_output: {
					name: loc("ve.registry.localisation.Forse_node_output"),
					category: loc("ve.registry.localisation.Forse_category_parameters"),
					input_parameters: [{ name: loc("ve.registry.localisation.Forse_param_result"), type: "any" }],
					is_internal: true,
					output_type: "any",
					special_function: (arg) => {
						return { value: arg };
					},
				}
			}
		};
	}
	
	/**
	 * Returns the configured DSL for the given {@link ve.NodeEditor} instance.
	 * - Static method of: {@link ve.NodeEditor.Forse}
	 *
	 * @alias getForseObject
	 * @memberof ve.Component.ve.NodeEditor.ve.NodeEditor.Forse
	 *
	 * @param {Object} [arg0_options]
	 *  @param {boolean} [arg0_options.disable_custom_nodes=false] - Whether to disable custom nodes creation.
	 *  @param {boolean} [arg0_options.disable_forse=false] - Whether to disable Forse itself.
	 *
	 * @returns {Object}
	 */
	static getForseObject (arg0_options) {
		//Convert from parameters
		let options = (arg0_options) ? arg0_options : {};
		
		//Declare local instance variables
		let custom_nodes_obj = (!options.disable_custom_nodes) ?
			ve.NodeEditor.Forse.getForseCustomNodesObject() : {};
		if (options.disable_forse && !options.disable_custom_nodes)
			return custom_nodes_obj; //Internal guard clause if only custom nodes are enabled
		
		//Return statement
		return {
			project_folder: "./settings/scripts/",
			category_types: {
				[loc("ve.registry.localisation.Forse_category_conditionals")]: {
					colour: "#7072e0",
					text_colour: [255, 255, 255]
				},
				[loc("ve.registry.localisation.Forse_category_functions")]: {
					colour: "#9ecd9e",
					text_colour: [0, 0, 0]
				},
				[loc("ve.registry.localisation.Forse_category_loops")]: {
					colour: "#d4ca60",
					text_colour: [0, 0, 0]
				},
				[loc("ve.registry.localisation.Forse_category_variables")]: {
					colour: "#eaaf6c",
					text_colour: [0, 0, 0]
				},
				[loc("ve.registry.localisation.Forse_category_variables_casting")]: {
					colour: "#d56a6a",
					text_colour: [0, 0, 0]
				},
				[loc("ve.registry.localisation.Forse_category_variables_expressions")]: {
					colour: "#a82020",
					text_colour: [255, 255, 255]
				},
				
				...custom_nodes_obj.category_types
			},
			
			node_types: {
				...ve.NodeEditor.Forse.conditionals,
				...ve.NodeEditor.Forse.functions,
				...ve.NodeEditor.Forse.loops,
				...ve.NodeEditor.Forse.variables,
				...ve.NodeEditor.Forse.variables_casting,
				...ve.NodeEditor.Forse.variables_expression,
				
				...custom_nodes_obj.node_types
			}
		};
	}
};