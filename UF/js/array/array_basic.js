//Initialise functions
{
	Array.toArray = function (arg0_value) {
		//Convert from parameters
		let value = arg0_value;
		
		//Return statement
		if (Array.isArray(value)) return value; //Internal guard clause if value is already an array
		return [value];
	};
	
	Array.moveElement = function (arg0_array, arg1_old_index, arg2_new_index) {
		//Convert from parameters
		let array = Array.toArray(arg0_array);
		let old_index = Math.returnSafeNumber(arg1_old_index);
		let new_index = Math.returnSafeNumber(arg2_new_index);
		
		//Move old_index to new_index
		if (new_index >= array.length) {
			let local_index = new_index - array.length + 1;
			
			while (local_index--)
				array.push(undefined);
		}
		array.splice(new_index, 0, array.splice(old_index, 1)[0]);
		
		//Return statement
		return array;
	};
}