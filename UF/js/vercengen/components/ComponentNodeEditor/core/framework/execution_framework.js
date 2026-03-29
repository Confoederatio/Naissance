//Initialise methods
{
	/**
	 * Aborts the current run cycle, assuming `arg0_preview_mode=false`.
	 * - Method of: {@link ve.NodeEditor}
	 * 
	 * @alias ve.Component.NodeEditor.prototype.abort
	 * @instance
	 * @memberof ve.NodeEditor
	 * @this ve.NodeEditor
	 */
	ve.NodeEditor.prototype.abort = function () {
		if (this._is_running) this._abort_execution = true;
	};
	
	/**
	 * Returns the current DAG sequence as a node.
	 * - Method of: {@link ve.NodeEditor}
	 * 
	 * @alias ve.Component.NodeEditor.prototype.getDAGSequence
	 * @instance
	 * @memberof ve.NodeEditor
	 * @this ve.NodeEditor
	 * 
	 * @returns {Array.<ve.NodeEditorDatatype[]>}
	 */
	ve.NodeEditor.prototype.getDAGSequence = function () {
		//Declare local instance variables
		let adjacency = new Map();
		let in_degree = new Map();
		let layers = [];
		let nodes = ve.NodeEditorDatatype.instances.filter((local_node) => 
			local_node.options.node_editor === this);
		let processed_count = 0;
		let queue = [];
		
		//Iterate over all nodes
		for (let i = 0; i < nodes.length; i++) {
			adjacency.set(nodes[i].id, new Set());
			in_degree.set(nodes[i].id, 0);
		}
		
		//Iterate over all nodes and their connections to calculate DAG sequence
		for (let i = 0; i < nodes.length; i++)
			for (let x = 0; x < nodes[i].connections.length; x++) {
				let local_target_node = nodes[i].connections[x][0];
				if (!in_degree.has(local_target_node.id)) continue; //Continue if node is already in the current degree
				
				if (!adjacency.get(nodes[i].id).has(local_target_node.id)) {
					adjacency.get(nodes[i].id).add(local_target_node.id);
					in_degree.set(local_target_node.id, in_degree.get(local_target_node.id) + 1);
				}
			}
		
		//Iterate over all nodes and process queue
		for (let i = 0; i < nodes.length; i++)
			if (in_degree.get(nodes[i].id) === 0) queue.push(nodes[i]);
		while (queue.length > 0) {
			let layer = [];
			let next_queue = [];
			
			for (let i = 0; i < queue.length; i++) {
				layer.push(queue[i]);
				processed_count++;
				
				let edges = adjacency.get(queue[i].id);
				if (!edges) continue;
				
				edges.forEach((to_id) => {
					in_degree.set(to_id, in_degree.get(to_id) - 1);
					if (in_degree.get(to_id) === 0)
						next_queue.push(ve.NodeEditorDatatype.getNode(to_id, this));
				});
			}
			layers.push(layer);
			queue = next_queue;
		}
		
		//Return statement
		if (processed_count !== nodes.length) return undefined;
		return layers;
	};
	
	/**
	 * Run the current execution cycle/model as a DAG.
	 * - Method of {@link ve.NodeEditor}
	 *
	 * @alias ve.Component.NodeEditor.prototype.run
	 * @instance
	 * @memberof ve.NodeEditor
	 * @this ve.NodeEditor
	 *
	 * @param {boolean} [arg0_preview_mode=false]
	 * @param {ve.NodeEditorDatatype} [arg1_start_node]
	 *
	 * @returns {Object}
	 */
	ve.NodeEditor.prototype.run = async function (arg0_preview_mode, arg1_start_node) {
		//Convert from parameters
		let preview_mode = arg0_preview_mode;
		let start_node = arg1_start_node;
		
		if (this._is_running) return this.main.variables; //Internal guard clause to abort if is running
		this._is_running = true;
		if (!preview_mode) this._is_running_non_preview = true;
		this._abort_execution = false;
		
		//Declare local instance variables
		try {
			let dag_sequence = this.getDAGSequence();
			
			//Reset DAG draws if preview_mode = false
			if (this._is_running_non_preview)
				for (let i = 0; i < dag_sequence.length; i++)
					for (let x = 0; x < dag_sequence[i].length; x++) {
						delete dag_sequence[i][x].ui.information.status;
						dag_sequence[i][x].draw();
					}
			
			//Filter dag_sequence if running from a specific node
			if (start_node) {
				let downstream = new Set([start_node.id]);
				let queue = [start_node];
				
				while (queue.length > 0) {
					let current = queue.shift();
					for (let x = 0; x < current.connections.length; x++)
						if (!downstream.has(current.connections[x][0].id)) {
							downstream.add(current.connections[x][0].id);
							queue.push(current.connections[x][0]);
						}
				}
				
				dag_sequence = dag_sequence.map(layer =>
					layer.filter(node => downstream.has(node.id))
				).filter(layer => layer.length > 0);
			} else {
				this.main.node_iterations = {}; //Track branch iteration counts
				this.main.variables = {};
			}
			
			this.main.skipped_nodes = new Set();
			
			let resolve_arguments = (arg0_node, iteration_index = 0) => {
				let args = [];
				let node = arg0_node;
				
				if (node.value.input_parameters)
					//Iterate over all input_parameters
					for (let i = 0; i < node.value.input_parameters.length; i++) {
						let local_parameter = node.value.input_parameters[i];
						
						if (node.dynamic_values[i]) {
							let resolved;
							
							//Iterate over all node instances
							for (let x = 0; x < ve.NodeEditorDatatype.instances.length; x++) {
								let source = ve.NodeEditorDatatype.instances[x];
								if (source.options.node_editor !== this) continue;
								
								//Iterate over all connections per node
								for (let y = 0; y < source.connections.length; y++) {
									let target_data = source.connections[y];
									
									if (target_data[0].id === node.id && target_data[1] === i + 1) {
										let source_val = this.main.variables[source.id];
										let source_iters = this.main.node_iterations[source.id] || 1;
										
										//Pick specific value for this iteration, or fallback to scalar
										resolved = (Array.isArray(source_val) && source_iters > 1) ?
											source_val[iteration_index % source_iters] : source_val;
										break;
									}
								}
								if (resolved !== undefined) break;
							}
							args.push(resolved);
						} else if (node.constant_values[i] !== undefined) {
							args.push(node.constant_values[i]);
						} else {
							let local_type = JSON.parse(JSON.stringify(local_parameter.type));
							if (ve.NodeEditorDatatype.types[local_type] === undefined)
								local_type = "any";
							args.push(ve.NodeEditorDatatype.types[local_type]);
						}
					}
				
				//Return statement
				return args;
			};
			
			//Iterate over all layers in the current dag_sequence
			for (let i = 0; i < dag_sequence.length; i++) {
				if (!preview_mode && this._abort_execution) break;
				let layer = dag_sequence[i];
				
				//Iterate over all layers and redraw them prior to running
				if (!preview_mode)
					for (let x = 0; x < layer.length; x++) {
						delete layer[x].ui.information.status;
						layer[x].draw();
					}
				
				//Wait for all nodes to finish being executed
				await Promise.all(layer.map(async (local_node) => {
					//Determine if we are inside an iterating branch by checking parents
					let is_aborted = false;
					let information_obj = local_node.ui.information;
					let last_descriptor;
					let max_iterations = 1;
					let results = [];
					
					//Iterate over all ve.NodeEditorDatatype.instances
					for (let local_instance of ve.NodeEditorDatatype.instances) {
						if (local_instance.options.node_editor !== this) continue; //Internal guard clause if node_editor is not defined
						
						//Iterate over all connections in local_instance.connections
						for (let local_connection of local_instance.connections)
							if (local_connection[0].id === local_node.id)
								max_iterations = Math.max(max_iterations,
									Math.returnSafeNumber(this.main.node_iterations[local_instance.id], 1));
					}
					
					//Iterate over the branch logic for all n iterations
					for (let x = 0; x < max_iterations; x++) {
						if (!preview_mode && this._abort_execution) { is_aborted = true; break; }
						let args = resolve_arguments(local_node, x);
						let descriptor, value;
						let special_function = local_node.value.special_function;
						
						try {
							if (!preview_mode) {
								information_obj.status = "is_running";
								ve.NodeEditorDatatype.draw(this, true);
							}
							
							descriptor = (typeof special_function === "function") ?
								await special_function.call(this, ...args, local_node) : special_function;
							if (descriptor && descriptor.abort === true) { //Check if execution should be aborted
								is_aborted = true;
								break;
							}
							value = (descriptor && typeof descriptor === "object") ?
								descriptor.value : descriptor;
							
							//Set to is_running and execute node
							if (!preview_mode && descriptor && typeof descriptor.run === "function") {
								await descriptor.run();
								if (!preview_mode && this._abort_execution) { is_aborted = true; break; }
							}
							results.push(value);
							last_descriptor = descriptor;
						} catch (e) {
							console.error(`Execution failed (${local_node.id})`, e);
							is_aborted = true;
							break;
						}
					}
					
					if (is_aborted) {
						this.main.skipped_nodes.add(local_node.id);
						information_obj.status = "aborted";
					} else {
						//Check if this node triggers a new iteration count for its branch
						let explicit_iterations = Math.returnSafeNumber(last_descriptor?.iterations);
						let special_function = local_node.value.special_function;
						
						if (explicit_iterations > 0) {
							this.main.node_iterations[local_node.id] = explicit_iterations;
							
							//Iterate over all explicit_iterations
							for (let x = 1; x < explicit_iterations; x++) {
								if (!preview_mode && this._abort_execution) break;
								let args = resolve_arguments(local_node, x);
								let descriptor = await special_function.call(this, ...args, local_node);
								
								results.push((descriptor && typeof descriptor === "object") ? descriptor.value : descriptor);
							}
							this.main.variables[local_node.id] = results;
						} else {
							this.main.node_iterations[local_node.id] = max_iterations;
							this.main.variables[local_node.id] = (max_iterations > 1) ? results : results[0];
						}
						information_obj.status = "finished";
					}
					
					if (!preview_mode) {
						information_obj.alluvial_width = Math.returnSafeNumber(last_descriptor?.alluvial_width, 1);
						information_obj.value = (last_descriptor?.display_value !== undefined) ?
							last_descriptor.display_value : `${this.main.variables[local_node.id]}`;
						information_obj.value = information_obj.value.truncate(information_obj.value, 40);
						ve.NodeEditorDatatype.draw(this, true);
					}
				}));
			}
		} finally {
			this._is_running = false; //Ensure that execution is over
			if (!preview_mode) this._is_running_non_preview = false;
			this._abort_execution = false;
		}
		
		//Return statement
		return this.main.variables;
	};
}