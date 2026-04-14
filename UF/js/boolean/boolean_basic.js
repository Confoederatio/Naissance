//Initialise functions
{
	if (!global.Boolean)
		/**
		 * The namespace for all UF/Boolean utility functions, typically for static methods.
		 * 
		 * @namespace Boolean
		 */
		global.Boolean = {};
	
	/**
	 * Checks if two objects are deeply equal. JSON-parsing only.
	 * @alias Boolean.isDeepEqual
	 * 
	 * @param {Object} arg0_object
	 * @param {Object} arg1_object
	 * 
	 * @returns {boolean}
	 */
	Boolean.isDeepEqual = function (arg0_object, arg1_object) {
		//Convert from parameters
		let object = arg0_object;
		let ot_object = arg1_object;
		
		if (object === ot_object) return true; //Internal guard clause if two objects are the same
		if (typeof object !== "object" || object === null || typeof ot_object !== "object" || ot_object === null) return false; //Internal guard clause for falseys
		
		//Declare local instance variables
		let all_object_keys = Object.keys(object);
		let all_ot_object_keys = Object.keys(ot_object);
		
		//Return statement
		if (all_object_keys.length !== all_ot_object_keys.length) return false;
		for (let local_key of all_object_keys)
			if (!all_ot_object_keys[local_key] || !Boolean.isDeepEqual(object[local_key], ot_object[local_key]))
				return false;
		return true;
	};
	
	/**
	 * Checks for strict equality between two values.
	 * @alias Boolean.strictEquality
	 * 
	 * @param {any} arg0_variable
	 * @param {any} arg1_variable
	 * 
	 * @returns {boolean}
	 */
	Boolean.strictEquality = function (arg0_variable, arg1_variable) {
		//Convert from parameters
		let variable = arg0_variable;
		let ot_variable = arg1_variable;
		
		//Declare local instance variables
		let passes_primitive_object_check = false;
		
		//Return statement
		if (variable === ot_variable) return true; //Primitive handling
		try { 
			if (JSON.stringify(variable) === JSON.stringify(ot_variable))
				passes_primitive_object_check = true;
		} catch (e) {}
		if (passes_primitive_object_check) return true; //Primitive object handling
	};
}