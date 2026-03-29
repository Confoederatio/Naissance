//Initialise methods
{
	if (!global.Object)
		/**
		 * The namespace for all UF/Object utility functions, typically for static methods.
		 * 
		 * @namespace Object
		 */
		global.Object = {};
	
	/**
	 * Adds a getter/setter to a given variable string with a root object.
	 * @alias Object.addGetterSetter
	 *
	 * @param {Object} arg0_object
	 * @param {string} arg1_variable_string
	 * @param {Object} [arg2_options]
	 *  @param {function} [arg2_options.get_function]
	 *  @param {function} [arg2_options.set_function]
	 *
	 * @returns {Proxy}
	 */
	Object.addGetterSetter = function (
		arg0_object,
		arg1_variable_string,
		arg2_options
	) {
		//Convert from parameters
		let object = arg0_object;
		let variable_string = arg1_variable_string ? arg1_variable_string : "";
		let options = arg2_options ? arg2_options : {};
		
		//Declare local instance variables
		let all_keys = variable_string.split(".");
		let current_obj = object;
		
		//Iterate up to the second-to-last key
		for (let i = 0; i < all_keys.length - 1; i++)
			try {
				if (current_obj[all_keys[i]] === undefined)
					current_obj[all_keys[i]] = {};
				current_obj = current_obj[all_keys[i]];
			} catch (e) {
				console.error(e);
			}
		
		//Set the value at the last key if available
		let final_key = all_keys[all_keys.length - 1];
		let old_value;
		try {
			try {
				old_value = structuredClone(current_obj[final_key]);
			} catch {
				old_value = current_obj[final_key];
			}
		} catch (e) {}
		
		let internal_value = current_obj[final_key];
		let proxied_objects = new WeakSet();
		let setter_context;
		
		function createDeepProxy(target, rootOnChange) {
			if (typeof target !== "object" || target === null) return target;
			
			if (proxied_objects.has(target)) return target;
			
			let handler = {
				set(obj, prop, value, receiver) {
					if (typeof value === "object" && value !== null) {
						value = createDeepProxy(value, rootOnChange);
					}
					
					const result = Reflect.set(obj, prop, value, receiver);
					
					if (typeof rootOnChange === "function") {
						rootOnChange();
					}
					
					return result;
				},
				deleteProperty(obj, prop) {
					const result = Reflect.deleteProperty(obj, prop);
					if (typeof rootOnChange === "function") {
						rootOnChange();
					}
					return result;
				},
			};
			
			for (let key in target) {
				if (
					target.hasOwnProperty(key) &&
					typeof target[key] === "object" &&
					target[key] !== null
				) {
					target[key] = createDeepProxy(target[key], rootOnChange);
				}
			}
			
			const proxy = new Proxy(target, handler);
			
			proxied_objects.add(target);
			proxied_objects.add(proxy);
			
			return proxy;
		}
		
		//Add getter/setter
		Object.defineProperty(current_obj, final_key, {
			configurable: true,
			enumerable: true,
			
			get() {
				if (options.get_function) return options.get_function.call(this);
				return internal_value;
			},
			
			set(value) {
				setter_context = this;
				
				let rootOnChange = function () {
					if (typeof options.set_function === "function") {
						options.set_function.call(setter_context, internal_value);
					}
				};
				
				if (typeof value === "object" && value !== null) {
					// Always fully replace with a new deep proxy
					proxied_objects = new WeakSet();
					internal_value = createDeepProxy(value, rootOnChange);
					
					// Fire set_function once with the fully-updated value
					if (options.set_function) {
						options.set_function.call(this, internal_value);
					}
				} else {
					// Primitives
					internal_value = value;
					
					if (options.set_function) {
						options.set_function.call(this, internal_value);
					}
				}
			},
		});
		
		//Return statement
		return old_value;
	};
	
	/**
	 * Removes both zero values and undefined/null values from an object by default.
	 * @alias Object.clean
	 * 
	 * @param {Object} arg0_object - The object to pass.
	 * @param {Object} [arg1_options]
	 *  @param {boolean} [arg1_options.remove_falsey=false] - Whether to remove falsey values.
	 *  @param {boolean} [arg1_options.remove_zeroes=false] - Whether to remove zero values from the cleaned object.
	 *  
	 * @returns {Object}
	 */
	Object.clean = function (arg0_object, arg1_options) {
		//Convert from parameters
		let object = arg0_object;
		let options = (arg1_options) ? arg1_options : {};
		
		//Clean stringify object first before parsing remove_zeroes
		let cleaned_object = String.cleanStringify(object);
		
		let all_cleaned_keys = Object.keys(cleaned_object);
		
		//Iterate over all_cleaned_keys
		for (let i = 0; i < all_cleaned_keys.length; i++) {
			let local_value = cleaned_object[all_cleaned_keys[i]];
			
			if (local_value === undefined || local_value === null)
				delete cleaned_object[all_cleaned_keys[i]];
			if (options.remove_falsey) {
				if (!local_value)
					delete cleaned_object[all_cleaned_keys[i]];
			} else if (options.remove_zeroes) {
				if (local_value === 0)
					delete cleaned_object[all_cleaned_keys[i]];
			}
			
			//Recursively call function
			if (typeof local_value == "object")
				cleaned_object[all_cleaned_keys[i]] = Object.clean(local_value, options);
		}
		
		//Return statement
		return cleaned_object;
	};
	
	/**
	 * Recursively merges two objects, but only on undefined keys.
	 * @alias Object.concat
	 * 
	 * @param arg0_object
	 * @param arg1_object
	 * 
	 * @returns {Object}
	 */
	Object.concat = function (arg0_object, arg1_object) {
		//Convert from parameters
		let object = arg0_object;
		let ot_object = arg1_object;
		
		//Iterate over ot_object and attempt to merge if the corresponding key in object is undefined
		Object.iterate(ot_object, (local_key, local_value) => {
			if (object[local_key] === undefined) {
				object[local_key] = local_value;
			} else if (
				typeof object[local_key] === "object" && !Array.isArray(object[local_key]) &&
				typeof local_value === "object" && !Array.isArray(local_value)
			) {
				object[local_key] = Object.concat(object[local_key], local_value);
			}
		});
		
		//Return statement
		return object;
	};
	
	/**
	 * Performs a cubic spline interpolation operation on an object.
	 * @alias Object.cubicSplineInterpolation
	 * 
	 * @param {Object} arg0_object
	 * @param {Object} [arg1_options]
	 *  @param {boolean} [arg1_options.all_years=false] - Whether to interpolate for every single year in the domain.
	 *  @param {Array<number>} [arg1_options.years] - The years to interpolate over if possible.
	 * 
	 * @returns {Object}
	 */
	Object.cubicSplineInterpolation = function (arg0_object, arg1_options) {
		//Convert from parameters
		let object = arg0_object;
		let options = (arg1_options) ? arg1_options : {};
		
		//Declare local instance variables
		let sorted_indices = Object.sortYearValues(object);
		let values = sorted_indices.values;
		let years = sorted_indices.years;
		
		//Guard clause if there are less than 2 years
		if (years.length < 2) return object;
		
		//Initialise options post-local instance variables
		options.years = (options.years) ?
			Array.toArray(options.years) : years;
		if (options.all_years) {
			let object_domain = Object.getDomain(object);
			years = [];
			
			//Iterate between object_domain[0] and object_domain[1]
			for (let i = object_domain[0]; i <= object_domain[1]; i++)
				years.push(i);
		}
		
		//Iterate over all years in domain
		for (let i = 0; i < options.years.length; i++)
			if (options.years[i] >= Math.returnSafeNumber(years[0]) && options.years[i] <= Math.returnSafeNumber(years[years.length - 1])) {
				let current_year = options.years[i];
				
				if (current_year <= Math.returnSafeNumber(years[years.length - 1]))
					object[current_year] = Array.cubicSplineInterpolation(years, values, current_year);
			}
		
		//Return statement
		return object;
	};
	
	/**
	 * Performs cubic spline interpolation over the entire Object domain.
	 * @alias Object.cubicSplineInterpolationDomain
	 * 
	 * @param {Object} arg0_object
	 * 
	 * @returns {Object}
	 */
	Object.cubicSplineInterpolationDomain = function (arg0_object) {
		//Convert from parameters
		let object = arg0_object;
		
		//Declare local instance variables  
		let all_object_keys = Object.keys(object);
		let object_domain = [
			parseInt(all_object_keys[0]),
			parseInt(all_object_keys[all_object_keys.length - 1])
		];
		let object_years = [];
		
		//Fill in object_domain for all years
		for (let i = object_domain[0]; i <= object_domain[1]; i++)
			object_years.push(i);
		
		//Return statement
		return Object.cubicSplineInterpolation(object, {
			years: object_years
		});
	};
	
	/**
	 * Moves all keys into the 1st nesting.
	 * @alias Object.flatten
	 * 
	 * @param {Object} arg0_object
	 * 
	 * @returns {Object}
	 */
	Object.flatten = function (arg0_object) {
		//Convert from parameters
		let object = arg0_object;
		
		//Declare local instance variables
		let all_object_keys = Object.keys(object);
		
		//Iterate over all_object_keys to move keys into current object
		for (let i = 0; i < all_object_keys.length; i++) {
			let flattened_subobj = {};
			let local_subobj = object[all_object_keys[i]];
			
			if (typeof local_subobj === "object") {
				flattened_subobj = Object.flatten(local_subobj);
				
				let all_flattened_keys = Object.keys(flattened_subobj);
				
				for (let x = 0; x < all_flattened_keys.length; x++)
					if (!object[all_flattened_keys[x]]) {
						object[all_flattened_keys[x]] = flattened_subobj[all_flattened_keys[x]];
					} else {
						object[all_flattened_keys[x]] += flattened_subobj[all_flattened_keys[x]];
					}
			} else if (typeof local_subobj === "number") {
				if (!object[all_object_keys[i]])
					object[all_object_keys[i]] = local_subobj;
				//Do not implement an else object here because that would add 1n per depth
			} else {
				object[all_object_keys[i]] = local_subobj;
			}
		}
		
		//Delete any remanent typeof object in the current object
		all_object_keys = Object.keys(object);
		
		for (let i = 0; i < all_object_keys.length; i++)
			if (typeof object[all_object_keys[i]] === "object")
				delete object[all_object_keys[i]];
		
		//Return statement
		return object;
	};
	
	/**
	 * Generates and returns a random unique ID given a specific object.
	 * @alias Object.generateRandomID
	 * 
	 * @param {Object} arg0_object
	 * 
	 * @returns {string}
	 */
	Object.generateRandomID = function (arg0_object) {
		//Convert from parameters
		let object = arg0_object;
		
		//Declare local instance variables
		let random_id = Math.randomNumber(0, 100000000000).toString();
		
		//Check if object is defined
		if (typeof object === "object") {
			while (true) {
				let local_id = Object.generateRandomID();
				
				//Return statement; break once a true ID is found
				if (!object[local_id])
					return local_id;
			}
		} else {
			//Return statement
			return random_id;
		}
	};
	
	/**
	 * Returns object depth as a number.
	 * @alias Object.getDepth
	 * 
	 * @param {Object} arg0_object - The object to fetch depth for.
	 * @param {number} [arg1_depth=1] - Optimisation parameter used as an internal helper.
	 */
	Object.getDepth = function (arg0_object, arg1_depth) {
		//Convert from parameters
		let object = arg0_object;
		let depth = (arg1_depth) ? arg1_depth : 1;
		
		//Iterate over object
		for (let key in object) {
			if (!object.hasOwnProperty(key)) continue;
			
			if (typeof object[key] == "object") {
				let level = Object.getDepth(object[key]) + 1;
				depth = Math.max(depth, level);
			}
		}
		
		//Return statement
		return depth;
	};
	
	/**
	 * Returns the Object domain with [min, max] numbers.
	 * @alias Object.getDomain
	 * 
	 * @param {Object} arg0_object
	 * 
	 * @returns {number[]}
	 */
	Object.getDomain = function (arg0_object) {
		//Convert from parameters
		let object = arg0_object;
		
		//Declare local instance variables
		let keys_as_numbers = Object.keys(object).map(Number);
		let max_key = Math.max(...keys_as_numbers);
		let min_key = Math.min(...keys_as_numbers);
		
		//Return statement
		return [min_key, max_key];
	};
	
	/**
	 * Returns the Object as an array list.
	 * @alias Object.getList
	 * 
	 * @param {Object} arg0_object_list
	 * 
	 * @returns {any[]}
	 */
	Object.getList = function (arg0_object_list) {
		//Convert from parameters
		let list_obj = arg0_object_list;
		
		//Declare local instance variables
		if (list_obj) {
			let all_list_keys = Object.keys(list_obj);
			let object_array = [];
			
			//Append everything in object as object_array
			for (let i = 0; i < all_list_keys.length; i++)
				object_array.push(list_obj[all_list_keys[i]]);
			
			//Return statement
			return object_array;
		} else {
			return [];
		}
	};
	
	/**
	 * Returns the nearest negative number in an Object from a given value.
	 * @alias Object.getNearestNegativeNumberToValue
	 * 
	 * @param {Object} arg0_object
	 * @param {string} arg1_key
	 * 
	 * @returns {number}
	 */
	Object.getNearestNegativeNumberToValue = function (arg0_object, arg1_key) {
		//Convert from parameters
		let object = arg0_object;
		let key = parseInt(arg1_key);
		
		//Declare local instance variables
		let min_distance = Infinity;
		let nearest_key = null;
		
		//Iterate over all keys in object
		for (let local_key in object)
			//Ensure we only check the object's own properties
			if (Object.hasOwnProperty.call(object, local_key)) {
				let local_value = object[local_key];
				
				//Check that the value is a positive number
				if (typeof local_value === "number" && local_value < 0) {
					let candidate_key_number = Number(local_key);
					let distance = Math.abs(candidate_key_number - key);
					
					//Check if this key is a better candidate
					if (distance < min_distance) {
						min_distance = distance;
						nearest_key = candidate_key_number;
					} else if (distance === min_distance) {
						if (candidate_key_number > nearest_key)
							nearest_key = candidate_key_number;
					}
				}
			}
		
		//Return statement
		return object[nearest_key];
	};
	
	/**
	 * Returns the nearest positive number in an Object from a given value.
	 * @alias Object.getNearestPositiveNumberToValue
	 * 
	 * @param {Object} arg0_object
	 * @param {string} arg1_key
	 * 
	 * @returns {number}
	 */
	Object.getNearestPositiveNumberToValue = function (arg0_object, arg1_key) {
		//Convert from parameters
		let object = arg0_object;
		let key = parseInt(arg1_key);
		
		//Declare local instance variables
		let min_distance = Infinity;
		let nearest_key = null;
		
		//Iterate over all keys in object
		for (let local_key in object)
			//Ensure we only check the object's own properties
			if (Object.hasOwnProperty.call(object, local_key)) {
				let local_value = object[local_key];
				
				//Check that the value is a positive number
				if (typeof local_value == "number" && local_value > 0) {
					let candidate_key_number = Number(local_key);
					let distance = Math.abs(candidate_key_number - key);
					
					//Check if this key is a better candidate
					if (distance < min_distance) {
						min_distance = distance;
						nearest_key = candidate_key_number;
					} else if (distance === min_distance) {
						if (candidate_key_number > nearest_key)
							nearest_key = candidate_key_number;
					}
				}
			}
		
		//Return statement
		return object[nearest_key];
	};
	
	/**
	 * Fetches a subobject.
	 * @alias Object.getSubobject
	 * 
	 * @param {Object} arg0_object - The object to pass.
	 * @param {string} arg1_key - The key to recursively look for to fetch the local subobject.
	 * @param {boolean} arg2_restrict_search - Whether to restrict the search to the 1st layer.
	 * 
	 * @returns {Object}
	 */
	Object.getSubobject = function (arg0_object, arg1_key, arg2_restrict_search) {
		//Convert from parameters
		let object = arg0_object;
		let key = arg1_key;
		let restrict_search = arg2_restrict_search;
		
		//Declare local instance variables
		let all_object_keys = Object.keys(object);
		
		//Process key
		if (!Array.isArray(key))
			key = getList(key.split("."));
		
		//Iterate over all_object_keys
		for (let i = 0; i < all_object_keys.length; i++) {
			let local_subobj = object[all_object_keys[i]];
			
			if (all_object_keys[i] === key[key.length - 1]) {
				//Guard clause
				return local_subobj;
			} else if (typeof local_subobj == "object") {
				let explore_object = false;
				let new_key = JSON.parse(JSON.stringify(key));
				if (key.length > 1)
					restrict_search = true;
				
				if (restrict_search && all_object_keys[i] === key[0]) {
					new_key.splice(0, 1);
					explore_object = true;
				}
				if (!restrict_search) explore_object = true;
				
				//Restrict search for certain arguments
				if (explore_object) {
					let has_subobj = Object.getSubobject(local_subobj, new_key, restrict_search);
					
					if (has_subobj)
						//Return statement
						return has_subobj;
				}
			}
		}
	};
	
	/**
	 * Fetches the keys in a subobject that match the given criteria.
	 * @alias Object.getSubobjectKeys
	 * 
	 * @param {Object} arg0_object
	 * @param {Object} [arg1_options]
	 *  @param {string[]} [arg1_options.exclude_keys] - A list of keys to exclude
	 *  @param {boolean} [arg1_options.include_objects=false] - Whether to include object keys.
	 *  @param {boolean} [arg1_options.only_objects=false] - Whether to only include objects.
	 *  
	 * @returns {string[]}
	 */
	Object.getSubobjectKeys = function (arg0_object, arg1_options) {
		//Convert from parameters
		let object = arg0_object;
		let options = (arg1_options) ? arg1_options : {};
		
		//Initialise options
		if (!options.exclude_keys) options.exclude_keys = [];
		
		//Declare local instance variables
		let all_keys = [];
		let all_object_keys = Object.keys(object);
		
		//Iterate over all_object_keys
		for (let i = 0; i < all_object_keys.length; i++) {
			let local_subobj = object[all_object_keys[i]];
			
			if (typeof local_subobj == "object") {
				//Push key itself first
				if (!options.exclude_keys.includes(all_object_keys[i]))
					all_keys.push(all_object_keys[i]);
				
				let all_subkeys = Object.getSubobjectKeys(local_subobj, options);
				
				if (options.include_objects || options.only_objects)
					if (!options.exclude_keys.includes(all_object_keys[i]))
						all_keys.push(all_object_keys[i]);
				
				for (let x = 0; x < all_subkeys.length; x++)
					if (!options.exclude_keys.includes(all_subkeys[x]))
						all_keys.push(all_subkeys[x]);
			} else {
				if (!options.only_objects)
					if (!options.exclude_keys.includes(all_object_keys[i]))
						all_keys.push(all_object_keys[i]);
			}
		}
		
		//Return statement
		return all_keys;
	};
	
	/**
	 * Determines whether an object has all the keys mentioned.
	 * @alias Object.hasKeys
	 * 
	 * @param {Object} arg0_object
	 * @param {string[]} arg1_keys
	 * @param {Object} [arg2_options]
	 *  @param {string} [arg2_options.mode="all"] - Either 'all'/'any'.
	 * 
	 * @returns {boolean}
	 */
	Object.hasKeys = function (arg0_object, arg1_keys, arg2_options) {
		//Convert from parameters
		let object = (arg0_object) ? arg0_object : {};
		let keys = (arg1_keys) ? arg1_keys : [];
		let options = (arg2_options) ? arg2_options : {};
		
		//Initialise options
		if (!options.mode) options.mode = "all";
		
		//Declare local instance variables
		let has_any_key = false;
		let has_all_keys = true;
		let object_keys = Object.keys(object);
		
		//Iterate over all keys
		for (let i = 0; i < keys.length; i++)
			if (!object_keys.includes(keys[i])) {
				//Return statement
				has_all_keys = false;
				if (options.mode === "all") break;
			} else {
				has_any_key = true;
				if (options.mode === "any") break;
			}
		
		//Return statement
		if (options.mode === "all") return has_all_keys;
		if (options.mode === "any") return has_any_key;
	};
	
	/**
	 * Fetches a given value with a root object and variable string.
	 * @alias Object.getValue
	 * 
	 * @param {Object} arg0_object
	 * @param {string} arg1_variable_string
	 * 
	 * @returns {string}
	 */
	Object.getValue = function (arg0_object, arg1_variable_string) {
		//Convert from parameters
		let object = arg0_object;
		let variable_string = (arg1_variable_string) ? arg1_variable_string : "";
		
		//Return statement
		return variable_string.split(".")
			.reduce((local_object, local_key) => local_object?.[local_key], object);
	};
		
	/**
	 * Iterates over an object, with similar conventions to other Object static methods.
	 * @alias Object.iterate
	 *
	 * @param {Object} arg0_object
	 * @param {function(arg0_local_key, arg1_local_value, arg2_index)|function(arg0_local_value)} arg1_function
	 * @param {Object} [arg2_options]
	 *  @param {Object|string} [arg2_options.sort_mode] - Either 'ascending'/'descending'. Sorts object keys.
	 *   @param {string} [arg2_options.sort_mode.key] - Refers to a subobject key to iterate by.
	 *   @param {string} [arg2_options.sort_mode.type="descending"] - Either 'ascending'/'descending'.
	 */
	Object.iterate = function (arg0_object, arg1_function, arg2_options) {
		//Convert from parameters
		let object = arg0_object;
		let local_function = arg1_function;
		let options = arg2_options ? arg2_options : {};
		
		//Internal guard clauses
		if (typeof object !== "object")
			console.error("arg0_object is not of type Object.", object);
		if (!local_function) throw new Error("arg1_function is not defined.");
		if (local_function.length === 0)
			throw new Error("Invalid number of arguments accepted for arg1_function. Should either be (arg0_local_key, arg1_local_value), or less preferably, (arg0_local_value).");
		
		//Declare local instance variables
		let all_local_keys = Object.keys(object);
		if (typeof options.sort_mode === "object") {
			let sort_key = options.sort_mode.key;
			let sort_type = (options.sort_mode.type) 
				? options.sort_mode.type : "descending";
			
			all_local_keys = all_local_keys.sort((a, b) => {
				//Declare local instance variables
				let value_a = Object.getValue(object[a], sort_key);
				let value_b = Object.getValue(object[b], sort_key);
				
				//Make local comparison
				let comparison = 0;
				if (value_a < value_b) comparison = -1;
				if (value_a > value_b) comparison = 1;
				
				//Return statement
				if (sort_type === "descending") return comparison * -1;
				return comparison;
			});
		} else if (typeof options.sort_mode === "string") {
			//Sort all_local_keys by .sort_mode
			if (["ascending", "date_ascending"].includes(options.sort_mode)) {
				all_local_keys = all_local_keys.sort((a, b) => {
					return parseInt(a) - parseInt(b);
				});
			} else if (["date_descending", "descending"].includes(options.sort_mode)) {
				all_local_keys = all_local_keys.sort((a, b) => {
					return parseInt(b) - parseInt(a);
				});
			}
		}
		
		//Check if the function is asynchronous
		let is_async = (local_function.constructor.name === "AsyncFunction");
		
		//Call functions
		if (is_async) {
			return (async () => {
				for (let i = 0; i < all_local_keys.length; i++) {
					let key = all_local_keys[i];
					let value = object[key];
					
					if (local_function.length === 1) {
						await local_function(value);
					} else {
						await local_function(key, value, i);
					}
				}
			})();
		} else {
			if (local_function.length === 1) {
				for (let i = 0; i < all_local_keys.length; i++)
					local_function(object[all_local_keys[i]]);
			} else {
				for (let i = 0; i < all_local_keys.length; i++)
					local_function(all_local_keys[i], object[all_local_keys[i]], i);
			}
		}
	};
	
	/**
	 * Merges two objects together.
	 * @alias Object.mergeObjects
	 *
	 * @param {Object} arg0_object
	 * @param {Object} arg1_object
	 * @param {Object} [arg2_options]
	 *  @param {boolean} [arg2_options.must_have_difference=false] - Whether values must be different before they can be added/subtracted from one another.
	 *  @param {boolean} [arg2_options.overwrite=false] - Whether to overwrite objects when merging.
	 *  @param {boolean} [arg2_options.recursive=false] - Whether merging is recursive.
	 *
	 * @returns {Object}
	 */
	Object.mergeObjects = function (arg0_object, arg1_object, arg2_options) {
		//Convert from parameters - merge_obj overwrites onto merged_obj
		let merged_obj = JSON.parse(JSON.stringify(arg0_object));
		let merge_obj = JSON.parse(JSON.stringify(arg1_object));
		let options = (arg2_options) ? arg2_options : {};
		
		//Initialise options
		if (options.recursive === undefined) options.recursive = true;
		
		//Declare local instance variables
		let all_merge_keys = Object.keys(merge_obj);
		
		//Iterate over all_merge_keys
		for (let i = 0; i < all_merge_keys.length; i++) {
			let current_value = merged_obj[all_merge_keys[i]];
			let local_value = merge_obj[all_merge_keys[i]];
			
			if (typeof local_value == "number") {
				if (merged_obj[all_merge_keys[i]]) {
					//Check if variable should be overwritten
					let to_overwrite = (options.overwrite || (options.must_have_difference && current_value === local_value));
					
					merged_obj[all_merge_keys[i]] = (!to_overwrite) ?
						merged_obj[all_merge_keys[i]] + local_value :
						local_value; //Add numbers together
				} else {
					merged_obj[all_merge_keys[i]] = local_value;
				}
			} else if (typeof local_value == "object" && current_value && local_value) {
				if (options.recursive)
					merged_obj[all_merge_keys[i]] = Object.mergeObjects(current_value, local_value, options); //Recursively merge objects if possible
			} else {
				merged_obj[all_merge_keys[i]] = local_value;
			}
		}
		
		//Return statement
		return merged_obj;
	};
	
	/**
	 * Modifies a given value in an object by a numeric value.
	 * @alias Object.modifyValue
	 * 
	 * @param {Object} arg0_object
	 * @param {string} arg1_key
	 * @param {number|string} arg2_number
	 * @param {boolean} [arg3_delete_negative=false] - Whether to delete negative values.
	 * 
	 * @returns {number}
	 */
	Object.modifyValue = function (arg0_object, arg1_key, arg2_number, arg3_delete_negative) {
		//Convert from parameters
		let object = arg0_object;
		let key = arg1_key;
		let number = parseFloat(arg2_number);
		let delete_negative = arg3_delete_negative;
		
		//Set value
		object[key] = (object[key]) ? object[key] + number : number;
		
		if (delete_negative)
			if (object[key] <= 0)
				delete object[key];
		
		//Return statement
		return object[key];
	};
	
	/**
	 * Removes zero values from an object.
	 * @alias Object.removeZeroes
	 * 
	 * @param {Object} arg0_object
	 * 
	 * @returns {Object}
	 */
	Object.removeZeroes = function (arg0_object) {
		//Convert from parameters
		let object = JSON.parse(JSON.stringify(arg0_object));
		
		//Declare local instance variables
		let all_object_keys = Object.keys(object);
		
		//Iterate over all_object_keys
		for (let i = 0; i < all_object_keys.length; i++) {
			let local_subobj = object[all_object_keys[i]];
			
			if (typeof local_subobj === "number")
				if (local_subobj === 0)
					delete object[all_object_keys[i]];
			if (typeof local_subobj === "object")
				object[all_object_keys[i]] = Object.removeZeroes(local_subobj);
		}
		
		//Return statement
		return object;
	};
	
	/**
	 * Serialises a given object into a compatible object for hydration (i.e. browser-side).
	 * @alias Object.serialise
	 * 
	 * @param {Array|Object} arg0_object
	 * 
	 * @returns {Object}
	 */
	Object.serialise = function (arg0_object) {
		//Convert from parameters
		let object = (arg0_object) ? arg0_object : {};
		
		//Internal guard clause for null object or non-objects
		if (object === null || typeof object !== "object") 
			return (typeof object === "function") ? object.toString() : object;
		
		//Declare local instance variables
		let return_obj = (Array.isArray(object)) ? [] : {};
		
		//Iterate over object and serialise it
		for (let local_key in object) {
			let local_value = object[local_key];
			
			if (typeof local_value === "function") {
				return_obj[local_key] = {
					__type: "function",
					source: local_value.toString()
				};
			} else if (typeof local_value === "object" && local_value !== null) {
				return_obj[local_key] = Object.serialise(local_value);
			} else {
				return_obj[local_key] = local_value;
			}
		}
		
		//Return statement
		return return_obj;
	};
	
	/**
	 * Sets a given value with a root object and variable string.
	 * @alias Object.setValue
	 * 
	 * @param {Object} arg0_object
	 * @param {string} arg1_variable_string
	 * @param {any} arg2_value
	 * 
	 * @returns {any}
	 */
	Object.setValue = function (arg0_object, arg1_variable_string, arg2_value) {
		//Convert from parameters
		let object = arg0_object;
		let variable_string = (arg1_variable_string) ? arg1_variable_string : "";
		let value = arg2_value;
		
		//Declare local instance variables
		let all_keys = variable_string.split(".");
		let current_obj = object;
		
		//Iterate up to the second-to-last key
		for (let i = 0; i < all_keys.length - 1; i++) try {
			if (current_obj[all_keys[i]] === undefined)
				current_obj[all_keys[i]] = {};
			current_obj = current_obj[all_keys[i]];
		} catch (e) { console.error(e); }
		
		//Set the value at the last key if available
		current_obj[all_keys[all_keys.length - 1]] = value;
		
		//Return statement
		return current_obj[all_keys[all_keys.length - 1]];
	};
	
	/**
	 * Sorts an object.
	 * @alias Object.sort
	 * 
	 * @param {Object} arg0_object
	 * @param {Object} [arg1_options]
	 *  @param {string} [arg1_options.type="descending"] - The order to sort the object in. 'ascending'/'descending'.
	 */
	Object.sort = function (arg0_object, arg1_options) {
		//Convert from parameters
		let object = arg0_object;
		let options = (arg1_options) ? arg1_options : {};
		
		//Declare local instance variables
		let mode = (options.type) ? options.type : "descending";
		
		//Return statement
		return Object.fromEntries(
			Object.entries(object).sort(([, a], [, b]) => {
				//Standardise array values
				if (Array.isArray(a))
					a = getSum(a);
				if (Array.isArray(b))
					b = getSum(b);
				
				return (mode === "descending") ? b - a : a - b;
			})
		);
	};
	
	/**
	 * Sorts an object by their key's numeric values.
	 * @alias Object.sortKeys
	 * 
	 * @param {Object} arg0_object
	 * @param {Object} [arg1_options]
	 *  @param {string} [arg1_options.type="descending"] - The order to sort the object in. 'ascending'/'descending'. 'descending by default.
	 *  
	 * @returns {Object}
	 */
	Object.sortKeys = function (arg0_object, arg1_options) {
		//Convert from parameters
		let object = arg0_object;
		let options = (arg1_options) ? arg1_options : {};
		
		//Initialise options
		if (!options.type) options.type = "ascending";
		
		//Declare local instance variables
		let sorted_keys = Object.keys(object).sort((a, b) => {
			//Return statement
			if (options.type === "ascending") return Number(a) - Number(b);
			return Number(b) - Number(a);
		});
		let return_obj = {};
		
		//Build new return_obj
		for (let i = 0; i < sorted_keys.length; i++)
			return_obj[sorted_keys[i]] = object[sorted_keys[i]];
		
		//Return statement
		return return_obj;
	};
	
	/**
	 * Sorts values chronologically by their year (key) per object.
	 * @alias Object.sortYearValues
	 * 
	 * @param {Object} arg0_object
	 * 
	 * @returns {{values: any[], years: number[]}}
	 */
	Object.sortYearValues = function (arg0_object) {
		//Convert from parameters
		let object = arg0_object;
		
		//Declare local instance variables
		let values = Object.values(object).map((value) => value);
		let years = Object.keys(object).map((year) => parseInt(year));
		
		//Ensure values; years are sorted properly
		let sorted_indices = years.map((_, i) => i).sort((a, b) => years[a] - years[b]);
		values = sorted_indices.map(i => values[i]);
		years = sorted_indices.map(i => years[i]);
		
		//Return statement
		return { values: values, years: years };
	};
	
	/**
	 * Removes values with duplicate values in an object.
	 * @alias Object.strictRemoveDuplicates
	 * 
	 * @param {Object} arg0_object
	 * 
	 * @returns {Object}
	 */
	Object.strictRemoveDuplicates = function (arg0_object) {
		//Convert from parameters
		let object = arg0_object;
		
		//Declare local instance variables
		let values = Object.values(object);
		
		let duplicates = values.filter((value, index, array) => array.indexOf(value) !== array.lastIndexOf(value));
		let return_obj = {};
		
		//Remove keys with duplicate values
		for (let [key, value] of Object.entries(object))
			if (!duplicates.includes(value))
				return_obj[key] = value;
		
		//Return statement
		return return_obj;
	};
	
	/**
	 * Casts an object to array.
	 * @alias Object.toArray
	 * 
	 * @param {Object} arg0_object
	 * 
	 * @returns {any[]}
	 */
	Object.toArray = function (arg0_object) {
		//Convert from parameters
		let input_object = arg0_object;
		
		//Declare local instance variables
		let all_object_keys = Object.keys(input_object);
		let return_array = [];
		
		//Iterate over object
		for (let i = 0; i < all_object_keys.length; i++)
			return_array.push(input_object[all_object_keys[i]]);
		
		//Return statement
		return return_array;
	};
}
