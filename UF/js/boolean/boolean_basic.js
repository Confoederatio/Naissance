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
	 * Checks for strict equality between two values.
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