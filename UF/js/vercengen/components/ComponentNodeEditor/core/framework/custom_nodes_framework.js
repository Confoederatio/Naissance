//Initialise methods
{
	/**
	 * Generates logic for custom nodes.
	 * - Method of: {@link ve.NodeEditor}
	 *
	 * @alias ve.Component.NodeEditor.prototype.createCustomExecutionLogic
	 * @instance
	 * @memberof ve.NodeEditor
	 * @this ve.NodeEditor
	 *
	 * @param {Object} arg0_subgraph
	 *
	 * @returns {{value: Object}}
	 */
	ve.NodeEditor.prototype.createCustomExecutionLogic = function (arg0_subgraph) {
		//Convert from parameters
		let subgraph = arg0_subgraph;
		
		//Return statement
		return async function (...args) {
			let subeditor = new ve.NodeEditor(subgraph, {
				...this.options,
				headless: true,
				show_internal: true,
			});
			let subinputs = subeditor.main.nodes.filter((n) => n.value.key === "ve_input");
			subinputs.sort((a, b) => a.value.coords.y - b.value.coords.y);
			
			//Iterate over all subinputs and fetch their runtime value
			for (let i = 0; i < subinputs.length; i++)
				if (args[i] !== undefined)
					subinputs[i].runtime_value = args[i];
			
			let results = await subeditor.run(false);
			let sub_output = subeditor.main.nodes.find((n) => n.value.key === "ve_output");
			
			let return_value = sub_output ? results[sub_output.id] : undefined;
			
			//Return statement
			return { value: return_value };
		}
	};
	
	/**
	 * Deletes a custom node definition.
	 * - Method of: {@link ve.NodeEditor}
	 *
	 * @alias ve.Component.NodeEditor.prototype.deleteCustomNode
	 * @instance
	 * @memberof ve.NodeEditor
	 * @this ve.NodeEditor
	 *
	 * @param {string} arg0_key
	 */
	ve.NodeEditor.prototype.deleteCustomNode = function (arg0_key) {
		//Convert from parameters
		let key = arg0_key;
		
		//Handle deleting custom nodes
		if (this.main.custom_node_types[key]) {
			delete this.main.custom_node_types[key];
			delete this.options.node_types[key];
			
			if (this.toolbox_window) {
				this.toolbox_window.close();
				this.drawToolbox();
			}
			
			veToast(loc("ve.registry.localisation.NodeEditor_toast_custom_node_deleted"));
		}
	};
}