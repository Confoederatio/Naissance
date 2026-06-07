global.UI_Symbol = class {
	/**
	 * 
	 * @param {Object} arg0_value
	 * @param {Object} arg1_options
	 *  @param {ve.Component} arg1_options.instance
	 *  @param {Object} arg1_options.key_map_obj
	 */
	static setValue (arg0_value, arg1_options) {
		//Convert from parameters
		let value = (arg0_value) ? arg0_value : {};
		let options = (arg1_options) ? arg1_options : {};
		
		//Declare local instance variables
		let instance = options.instance;
		let key_map_obj = options.key_map_obj;
		
		//Update instance.components_obj if possible
		if (instance.components_obj) {
			Object.iterate(value, (local_key, local_value) => {
				let local_component = Object.getValue(instance.components_obj, key_map_obj[local_key]);
				if (local_component) local_component.v = local_value;
			});
		} else {
			instance.value = value;
			instance.element = instance.draw().element;
		}
		instance.fireFromBinding();
	}
};