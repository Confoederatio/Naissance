//[VERCENGEN]
if (!global.Boolean)
	/**
	 * The namespace for all UF/Boolean utility functions, typically for static methods.
	 *
	 * @namespace Boolean
	 */
	global.Boolean = {};
if (!global?.History) global.History = {};

//[WIP] - Temporary util functions
{
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
	
	String.formatObject = function (arg0_object) {
		//Convert from parameters
		let object = (arg0_object) ? arg0_object : {};
		
		//Internal guard clause if object is empty
		if (Object.keys(object).length === 0) return "None";
		
		//Declare local instance variables
		let string_array = [];
		
		//Iterate over object and parse it to a string
		let all_keys = Object.keys(object);
		
		for (let i = 0; i < all_keys.length; i++) {
			let local_value = object[all_keys[i]];
			
			if (typeof local_value === "object" && local_value !== null) {
				if (Array.isArray(local_value)) {
					string_array.push(`${all_keys[i]}: [${local_value.length}]`);
				} else {
					string_array.push(`${all_keys[i]}: {${Object.keys(local_value).length}}`);
				}
			} else if (local_value !== undefined) {
				string_array.push(`${all_keys[i]}: ${local_value}`);
			}
		}
		
		//Return statement
		return string_array.join(", ");
	};
}

History.addKeyframe = function (arg0_keyframes, arg1_timestamp, ...argn_arguments) {
	//Convert from parameters
	let keyframes_obj = arg0_keyframes;
	let timestamp = arg1_timestamp;
	
	//Declare local instance variables
	let keyframe_obj = keyframes_obj[timestamp];
	
	//Iterate over all argn_arguments and add it to .value, concatenating any objects if they exist
	for (let i = 0; i < argn_arguments.length; i++)
		if (argn_arguments[i] !== undefined)
			if (typeof argn_arguments === "object" && argn_arguments[i] !== null) {
				let old_variables = (keyframe_obj.value[i]?.variables) ? 
					keyframe_obj.value[i].variables : {};
				
				//Handle initial value naively
				keyframe_obj.value[i] = {
					...(keyframe_obj.value[i]) ? keyframe_obj.value[i] : {},
					...argn_arguments[i]
				};
				//Handle shallow nesting for .variables if extant
				if (argn_arguments[i].variables)
					keyframe_obj.value[i].variables = { 
					...old_variables, 
						...argn_arguments[i].variables 
				};
			} else {
				keyframe_obj.value[i] = argn_arguments[i];
			}
	
	//Set new keyframe_obj by mutating keyframes_obj
	keyframes_obj[timestamp] = keyframe_obj;
	
	//Return statement
	return keyframes_obj;
};
	
History.cleanKeyframes = function (arg0_keyframes) {
	//Convert from parameters
	let keyframes_obj = arg0_keyframes;
	
	//Declare local instance variables
	let all_timestamps = History.getTimestamps(keyframes_obj);
	let running_state = []; //Tracks the accumulated values to find redundancies
	
	//Iterate over all_timestamps in the current history
	for (let i = 0; i < all_timestamps.length; i++) {
		let timestamp = all_timestamps[i];
		let local_keyframe = keyframes_obj[timestamp];
		let has_meaningful_change = false;
		
		//Don't clean the very first keyframe, as it serves as the baseline
		if (i === 0) {
			//Update running state with the first keyframe's data
			running_state = JSON.parse(JSON.stringify(local_keyframe.value));
			continue;
		}
		
		for (let x = 0; x < local_keyframe.value.length; x++) {
			let current_val = local_keyframe.value[x];
			let prev_val = running_state[x];
			
			//Skip only if undefined; null is treated as a meaningful value change
			if (current_val === undefined) continue;
			
			if (typeof current_val === "object" && current_val !== null) {
				// Handle object merging and variable delta checks
				let is_redundant_obj = true;
				let cleaned_obj = { ...current_val };
				if (current_val.variables)
					cleaned_obj.variables = { ...current_val.variables };
				
				//Check nested variables
				if (current_val.variables && prev_val && prev_val.variables) {
					for (let key in current_val.variables)
						if (Boolean.isDeepEqual(current_val.variables[key], prev_val.variables[key])) {
							delete cleaned_obj.variables[key];
						} else {
							is_redundant_obj = false;
						}
					//If variables becomes empty, remove the key
					if (Object.keys(cleaned_obj.variables).length === 0) delete cleaned_obj.variables;
				} else if (current_val.variables) {
					is_redundant_obj = false;
				}
				
				//Check other properties of the object (excluding variables which we just handled)
				for (let key in current_val) {
					if (key === "variables") continue;
					if (prev_val && Boolean.isDeepEqual(current_val[key], prev_val[key])) {
						delete cleaned_obj[key];
					} else {
						is_redundant_obj = false;
					}
				}
				
				if (is_redundant_obj) {
					//Remove this index from keyframe if it changes nothing
					local_keyframe.value[x] = undefined;
				} else {
					//Update the keyframe with cleaned object and update running state
					local_keyframe.value[x] = cleaned_obj;
					has_meaningful_change = true;
					
					//Update running state for next iteration; ensure state is an object if merging
					if (typeof running_state[x] !== "object" || running_state[x] === null)
						running_state[x] = { variables: {} };
					
					if (cleaned_obj.variables)
						running_state[x].variables = {
							...running_state[x].variables,
							...cleaned_obj.variables
						};
					running_state[x] = { ...running_state[x], ...cleaned_obj };
				}
			} else {
				//Handle primitive values and null
				if (current_val === prev_val) {
					local_keyframe.value[x] = undefined;
				} else {
					running_state[x] = current_val;
					has_meaningful_change = true;
				}
			}
		}
		
		//If the keyframe now contains no unique data, delete the keyframe entirely
		let is_empty = local_keyframe.value.every((val) => val === undefined);
		if (is_empty || !has_meaningful_change) {
			delete keyframes_obj[timestamp];
		}
	}
	
	//Return stateement
	return keyframes_obj;
};

History.diffKeyframe = function (arg0_keyframe, arg1_keyframe) {
	//Convert from parameters
	let keyframe = (arg0_keyframe) ? arg0_keyframe : { value: [] };
	let ot_keyframe = (arg1_keyframe) ? arg1_keyframe : {};
	
	//Declare local instance variables
	if (ot_keyframe.value)
		for (let i = 0; i < ot_keyframe.value.length; i++) {
			if (typeof ot_keyframe.value[i] === "object" && ot_keyframe.value[i] !== null) {
				let old_variables = (keyframe.value[i] && keyframe.value[i].variables) ?
					keyframe.value[i].variables : {};
				
				if (!keyframe.value[i]) keyframe.value[i] = {};
				
				keyframe.value[i] = { ...keyframe.value[i], ...ot_keyframe.value[i] };
				
				if (ot_keyframe.value[i] && ot_keyframe.value[i].variables)
					keyframe.value[i].variables = { ...old_variables, ...ot_keyframe.value[i].variables };
			} else if (ot_keyframe.value[i] !== undefined) {
				if (ot_keyframe.value[i] === "undefined") continue;
				if (i !== 0 && ot_keyframe.value[i] === null) continue;
				keyframe.value[i] = ot_keyframe.value[i];
			}
		}
	
	//Return statement
	return keyframe;
};

History.getFirstKey = function (arg0_keyframes) {
	//Convert from parameters
	let keyframes_obj = (arg0_keyframes) ? arg0_keyframes : {};
	
	//Declare local instance variables
	let all_timestamps = History.getTimestamps(keyframes_obj);
	
	//Return statement
	return (all_timestamps.length > 0) ? all_timestamps[0] : null;
};

History.getFirstKeyframe = function (arg0_keyframes) {
	//Convert from parameters
	let keyframes_obj = (arg0_keyframes) ? arg0_keyframes : {};
	
	//Declare local instance variables
	let all_timestamps = History.getTimestamps(keyframes_obj);
	
	//Return statement
	return (all_timestamps.length > 0) ? 
		keyframes_obj[all_timestamps[0]] : null;
};

History.getLastKey = function (arg0_keyframes) {
	//Convert from parameters
	let keyframes_obj = (arg0_keyframes) ? arg0_keyframes : {};
	
	//Declare local instance variables
	let all_timestamps = History.getTimestamps(keyframes_obj);
	
	//Return statement
	return (all_timestamps.length > 0) ? all_timestamps[all_timestamps.length - 1] : null;
};

History.getLastKeyframe = function (arg0_keyframes) {
	//Convert from parameters
	let keyframes_obj = (arg0_keyframes) ? arg0_keyframes : {};
	
	//Declare local instance variables
	let all_timestamps = History.getTimestamps(keyframes_obj);
	
	//Return statement
	return (all_timestamps.length > 0) ? 
		keyframes_obj[all_timestamps[all_timestamps.length - 1]] : null;
};
	
History.getLocalisation = function (arg0_keyframe, arg1_keyframe) {
	//Convert from parameters
	let old_keyframe = (arg0_keyframe) ? arg0_keyframe : {};
	let new_keyframe = (arg1_keyframe) ? arg1_keyframe  : {};
	
	//Declare local instance variables
	let return_string = [];
	
	try {
		//[0] .geometry change
		if (new_keyframe.value[0])
			return_string.push(`Geometry changed`);
		if (new_keyframe.value[0] === null)
			return_string.push(`Geometry removed`);
		
		//[1] .symbol change
		if (new_keyframe.value[1])
			return_string.push(`Symbol changed to: ${String.formatObject(new_keyframe.value[1])}`);
		
		//[2] .properties change
		if (new_keyframe.value[2]?.hidden === false)
			return_string.push(`Geometry visible`);
		if (new_keyframe.value[2]?.hidden === true)
			return_string.push(`Geometry hidden`);
		if (new_keyframe.value[2]?.label_geometries)
			if (new_keyframe.value[2].label_geometries.length > 0)
				return_string.push(`Set custom label geometries`);
		if (new_keyframe.value[2]?.label_name)
			return_string.push(`Label name changed to: ${new_keyframe.value[2].label_name}`);
		if (new_keyframe.value[2]?.label_symbol)
			return_string.push(`Label symbol changed to: ${String.formatObject(new_keyframe.value[2].label_symbol)}`);
		if (new_keyframe.value[2]?.max_zoom !== undefined)
			return_string.push(`Maximum zoom set to ${new_keyframe.value[2].max_zoom}`);
		if (new_keyframe.value[2]?.min_zoom !== undefined)
			return_string.push(`Minimum zoom set to ${new_keyframe.value[2].min_zoom}`);
		if (new_keyframe.value[2]?.name)
			return_string.push(`Name changed to ${new_keyframe.value[2].name}`);
		if (new_keyframe.value[2]?.variables)
			return_string.push(`Variables changed to: ${String.formatObject(new_keyframe.value[2].variables)}`);
	} catch (e) {
		console.error(`History.getLocalisation - new_keyframe:`, new_keyframe, `old_keyframe:`, old_keyframe, `Error:`, e);
	}
	
	return return_string;
};

History.getKeyframe = function (arg0_keyframes, arg1_timestamp) {
	//Convert from parameters
	let keyframes = arg0_keyframes;
	let timestamp = parseInt(arg1_timestamp);
	
	//Declare local instance variables
	let all_keyframes = History.getTimestamps(keyframes);
	let return_keyframe = { timestamp: timestamp, value: [] };
	
	//Iterate over all_keyframes in order
	for (let i = 0; i < all_keyframes.length; i++) {
		let local_keyframe = keyframes[all_keyframes[i]];
		
		//Check that the keyframe is still valid
		if (parseInt(all_keyframes[i]) <= return_keyframe.timestamp) {
			if (!local_keyframe.value) continue;
			
			//Merge keys using diffKeyframe
			return_keyframe = History.diffKeyframe(return_keyframe, local_keyframe);
		} else { break; }
	}
	
	//Return statement
	return return_keyframe.value;
};

History.getKeyframes = function (arg0_keyframes) {
	//Convert from parameters
	let keyframes = arg0_keyframes;
	
	//Declare local instance variables
	let all_keyframes = History.getTimestamps(keyframes);
	let return_keyframe = { value: [] };
	
	//Iterate over all_keyframes in order
	for (let i = 0; i < all_keyframes.length; i++) {
		let local_keyframe = keyframes[all_keyframes[i]];
		
		local_keyframe.localisation = History.getLocalisation(return_keyframe, local_keyframe);
		return_keyframe = History.diffKeyframe(return_keyframe, local_keyframe);
	}
	
	//Return statement
	return keyframes;
};

History.getName = function (arg0_keyframes) {
	//Convert from parameters
	let keyframes = arg0_keyframes;
	
	//Declare local instance variables
	let all_keyframes = History.getTimestamps(keyframes);
	let entity_name;
	
	//Iterate over all_keyframes in order
	for (let i = 0; i < all_keyframes.length; i++) {
		let local_keyframe = keyframes[all_keyframes[i]];
		
		if (local_keyframe.value?.[2]?.name) entity_name = local_keyframe.value[2].name;
	}
	
	//Return statement
	return entity_name;
};

History.getTimestamps = function (arg0_keyframes) {
	//Convert from parameters
	let keyframes = (arg0_keyframes) ? arg0_keyframes : {};
	
	//Return statement
	return Object.keys(keyframes)
		.sort((a, b) => parseInt(a) - parseInt(b));
};

History.moveKeyframe = function (arg0_keyframes, arg1_timestamp, arg2_timestamp) {
	//Convert from parameters
	let keyframes_obj = arg0_keyframes;
	let timestamp = parseInt(arg1_timestamp);
	let ot_timestamp = parseInt(arg2_timestamp);
	
	//Internal guard clause if timestamps are the same
	if (timestamp === ot_timestamp) return keyframes_obj;
	
	//Check if keyframe_obj exists; if it does, move it
	let keyframe_obj = keyframes_obj[timestamp];
	
	if (keyframe_obj) {
		keyframe_obj[ot_timestamp] = keyframe_obj[timestamp];
		delete keyframe_obj[timestamp];
	}
	
	//Return statement
	return keyframes_obj;
};

History.removeKeyframe = function (arg0_keyframes, arg1_timestamp) {
	//Convert from parameters
	let keyframes_obj = arg0_keyframes;
	let timestamp = parseInt(arg1_timestamp);
	
	//Return statement; delete timestamp key
	delete keyframes_obj[timestamp];
	return keyframes_obj;
};

History.replaceKeyframe = function (arg0_keyframes, arg1_timestamp, arg2_keyframe, arg3_options) {
	//Convert from parameters
	let keyframes_obj = arg0_keyframes;
	let timestamp = arg1_timestamp;
	let keyframe = arg2_keyframe;
	let options = (arg3_options) ? arg3_options : {};
	
	//Declare local instance variables
	keyframes_obj = History.removeKeyframe(keyframes_obj, timestamp);
	keyframes_obj = History.addKeyframe(keyframes_obj, timestamp, ...keyframe.value);
	
	//Return statement
	return keyframes_obj;
};