//Initialise functions
{
	if (!global.Object) global.Object = {};
	
	/**
	 * Computes object-level diff. Returns only the keys of 'prev_obj' whose values differ from or are absent in 'next_obj'. This is what gets stored in every non-head keyframe.
	 * @alias Object.computeNegativeDiff
	 * 
	 * @param {Object} arg0_prev_obj
	 * @param {Object} arg1_next_obj
	 * 
	 * @returns {Object} 
	 */
	Object.computeNegativeDiff = function (arg0_prev_obj, arg1_next_obj) {
		//Convert from parameters
		let prev_obj = (arg0_prev_obj) ? arg0_prev_obj : {};
		let next_obj = (arg1_next_obj) ? arg1_next_obj : {};
		
		//Declare local instance variables
		let all_keys = new Set([...Object.keys(prev_obj), ...Object.keys(next_obj)]);
		let diff_obj = {};
		
		//Iterate over all_keys
		for (let local_key of all_keys) {
			let next_value = (next_obj || {})[local_key];
			let previous_value = (prev_obj || {})[local_key];
			
			let next_json = JSON.stringify(next_value);
			let previous_json = JSON.stringify(previous_value);
			
			if (previous_json !== next_json)
				//Store what the previous keyframe had (or undefined sentinel)
				diff_obj[local_key] = (previous_value !== undefined) ? structuredClone(previous_value) : null;
		}
		
		//Return statement
		return diff_obj;
	};
}