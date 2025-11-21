if (!global.Class) global.Class = {};

Class.generateRandomID = function (arg0_class) {
	//Convert from parameters
	let local_class = arg0_class;
	
	//Declare local instance variables
	let random_id = Math.randomNumber(0, 100000000000).toString();
	
	//Check if local_class is defined
	if (typeof local_class == "function") {
		//Internal guard clause if class doesn't have .instances
		if (local_class.instances === undefined) {
			console.warn(`${local_class.constructor.name} has an undefined .instances dictionary. Returning default random ID.`);
			return random_id;
		}
		if (!Array.isArray(local_class.instances)) {
			console.warn(`${local_class.constructor.name} has an .instances field, but it is not of type Array. Returning default random ID.`);
			return random_id;
		}
		
		//Continually iterate over .instances in class until we can guarantee that the generated ID is not a duplicate
		while (true) {
			let is_duplicate_id = false;
			let local_id = Class.generateRandomID();
			
			//Return and break once a true ID is found
			for (let i = 0; i < local_class.instances.length; i++)
				if (local_class.instances[i].id === local_id) {
					is_duplicate_id = true;
					break;
				}
			
			if (!is_duplicate_id)
				//Return statement
				return local_id;
		}
	} else {
		//Return statement
		return random_id;
	}
};