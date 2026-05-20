if (!global.Class)
	/**
	 * The namespace for all UF/Class utility functions, typically for static methods.
	 * 
	 * @namespace Class
	 */
	global.Class = {};

{
	/**
	 * Generates a random ID given the values in the `.instances` Array.
	 * @alias Class.generateRandomID
	 *
	 * @param {Class} arg0_class
	 *
	 * @returns {string}
	 */
	Class.generateRandomID = function (arg0_class) {
		//Convert from parameters
		let local_class = arg0_class;
		
		//Declare local instance variables
		let is_array = Array.isArray(local_class?.instances);
		let random_id = Math.randomNumber(0, 100000000000).toString();
		
		//Check if local_class is defined
		if (typeof local_class == "function") {
			//Internal guard clause if class doesn't have .instances
			if (local_class.instances === undefined) {
				console.warn(`${local_class.constructor.name} has an undefined .instances dictionary. Returning default random ID.`);
				return random_id;
			}
			if (!is_array && typeof local_class.instances !== "object") {
				console.warn(`${local_class.constructor.name} has an .instances field, but it is not of type Array/Object. Returning default random ID.`);
				return random_id;
			}
			
			//Continually iterate over .instances in class until we can guarantee that the generated ID is not a duplicate
			while (true) {
				let is_duplicate_id = false;
				let local_id = Class.generateRandomID();
				
				//Return and break once a true ID is found
				if (is_array) {
					for (let i = 0; i < local_class.instances.length; i++)
						if (local_class.instances[i].id === local_id) {
							is_duplicate_id = true;
							break;
						}
				} else { is_duplicate_id = (local_class.instances[local_id] !== undefined); }
				
				if (!is_duplicate_id)
					//Return statement
					return local_id;
			}
		} else {
			//Return statement
			return random_id;
		}
	};
}
