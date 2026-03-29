//Initialise methods
{
	/**
	 * UI function. Draws a connection between two nodes as a user interaction.
	 * - Method of: {@link ve.NodeEditor}
	 * 
	 * @alias ve.Component.ve.NodeEditor.prototype._connect
	 * @instance
	 * @memberof ve.NodeEditor
	 * @this ve.NodeEditor
	 * 
	 * @param {ve.NodeEditorDatatype} arg0_node
	 * @param {ve.NodeEditorDatatype} arg1_node
	 * @param {number} arg2_index
	 * @param {Object} [arg3_options]
	 *  @param {boolean} [arg3_options.toggle_connection]
	 */
	ve.NodeEditor.prototype._connect = function (arg0_node, arg1_node, arg2_index, arg3_options) {
		//Convert from parameters
		let index = arg2_index;
		let node = arg0_node;
		let options = arg3_options ? arg3_options : {};
		let ot_node = arg1_node;
		
		//Declare local instance variables
		if (node.getConnection(ot_node, index) !== -1)
			if (options.toggle_connection) { //Internal guard clause for redundant connections
				this._disconnect(node, ot_node, index);
				return;
			} else { //Internal guard clause if toggle_connection is not true
				return;
			}
		node.connections.push([ot_node, index]); //Push new connection before handling and redrawing
		
		//Check DAG sequence to make sure connection is valid
		let dag_sequence = this.getDAGSequence();
		
		if (dag_sequence === undefined) { //Internal guard clause for circular dependencies
			node.connections.pop();
			veToast(`<icon>warning</icon> Circular dependencies are not allowed.`);
			return;
		}
		
		if (index > 0) { //Internal guard clause for type safety
			let input_type = (ot_node.value.input_parameters[index - 1].type) ? 
				ot_node.value.input_parameters[index - 1].type : "any";
			let output_type = node.value.output_type ? node.value.output_type : "any";
			
			if (input_type !== output_type && input_type !== "any") {
				node.connections.pop();
				veToast(`<icon>warning</icon> ${output_type} to ${input_type} are not of the same types.`);
				return;
			}
		}
		
		if (index > 0) ot_node.dynamic_values[index - 1] = true;
		ve.NodeEditorDatatype.draw(this);
	};
	
	/**
	 * UI function. Disconnects two nodes as a user interaction.
	 * - Method of: {@link ve.NodeEditor}
	 * 
	 * @alias ve.Component.ve.NodeEditor.prototype._disconnect
	 * @instance
	 * @memberof ve.NodeEditor
	 * @this ve.NodeEditor
	 * 
	 * @param {ve.NodeEditorDatatype} arg0_node
	 * @param {ve.NodeEditorDatatype} arg1_node
	 * @param {number} arg2_index
	 */
	ve.NodeEditor.prototype._disconnect = function (arg0_node, arg1_node, arg2_index) {
		//Convert from parameters
		let node = arg0_node;
		let ot_node = arg1_node;
		let index = arg2_index;
		
		//Declare local instance variables
		let node_connection_index = node.getConnection(ot_node, index);
		
		//Check to make sure that disconnection index is valid
		if (node_connection_index !== -1) {
			node.connections.splice(node_connection_index, 1);
			if (index > 0) ot_node.dynamic_values[index - 1] = undefined;
			ve.NodeEditorDatatype.draw(this);
		}
	}
	
	/**
	 * UI function. Selects a node index.
	 * - Method of: {@link ve.NodeEditor}
	 * 
	 * @alias ve.Component.ve.NodeEditor.prototype._select
	 * @instance
	 * @memberof ve.NodeEditor
	 * @this ve.NodeEditor
	 * 
	 * @param {ve.NodeEditorDatatype} arg0_node
	 * @param {number} arg1_index
	 */
	ve.NodeEditor.prototype._select = function (arg0_node, arg1_index) {
		//Convert from parameters
		let index = arg1_index;
		let node = arg0_node;
		
		//Declare local instance variables
		let selected_nodes = this.main.user.selected_nodes;
		
		//Iterate over all selected_nodes and handle them
		for (let i = selected_nodes.length - 1; i >= 0; i--)
			if (selected_nodes[i][0].id === node.id && selected_nodes[i][1] === index) {
				this.main.user.selected_nodes.splice(i, 1);
				ve.NodeEditorDatatype.draw(this);
				return; //Handle 1st node
			} else if (selected_nodes[i][0].id === node.id) {
				this.main.user.selected_nodes.splice(i, 1);
				continue; //Handle 2nd node
			}
		
		//Push selected_nodes based on their present length (toggle connection)
		if (selected_nodes.length >= 1)
			if (selected_nodes[0][1] > 0 && index > 0) return;
		selected_nodes.push([node, index]);
		
		if (selected_nodes.length >= 2) {
			this._connect(selected_nodes[0][0], selected_nodes[1][0], selected_nodes[1][1], {
				toggle_connection: true,
			});
			selected_nodes = [];
		}
		
		//Set selected_nodes
		this.main.user.selected_nodes = selected_nodes;
		ve.NodeEditorDatatype.draw(this);
	}
}