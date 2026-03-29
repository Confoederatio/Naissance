//Initialise functions
{
	if (!global.Array) global.Array = {};
	
	/**
	 * Casts an array to object.
	 * @alias Array.toObject
	 * 
	 * @param {Array} arg0_array
	 * 
	 * @returns {Object}
	 */
	Array.toObject = function (arg0_array) {
		//Convert from parameters
		let array = arg0_array;
		
		//Declare local instance variables
		let return_object = {};
		
		//Iterate over array
		for (let i = 0; i < array.length; i++)
			return_object[i] = array[i];
		
		//Return statement
		return return_object;
	};
}