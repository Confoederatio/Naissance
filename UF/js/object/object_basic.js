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
	 * 
	 * @param {Object} arg0_object
	 * @param {string} arg1_variable_string
	 * @param {Object} [arg2_options]
	 *  @param {function} [arg2_options.get_function]
	 *  @param {function} [arg2_options.set_function]
	 *  
	 * @returns {*}
	 */
	Object.addGetterSetter = function (arg0_object, arg1_variable_string, arg2_options) {
		//Convert from parameters
		let object = arg0_object;
		let variable_string = (arg1_variable_string) ? arg1_variable_string : "";
		let options = (arg2_options) ? arg2_options : {};
		
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
		let old_value;
		try {
			// Try to clone, but fallback to original if it fails
			try {
				old_value = structuredClone(current_obj[all_keys[all_keys.length - 1]]);
			} catch {
				old_value = current_obj[all_keys[all_keys.length - 1]];
			}
		} catch (e) {}
		
		let internal_value = old_value;
		let proxied_objects = new WeakSet();
		let setter_context;
		
		function createDeepProxy(target, rootOnChange) {
			if (typeof target !== "object" || target === null) return target;
			
			// Check if this object is already proxied
			if (proxied_objects.has(target)) {
				return target;
			}
			
			let handler = {
				set(obj, prop, value, receiver) {
					// If setting an object/array, make it a proxy too
					if (typeof value === "object" && value !== null) {
						value = createDeepProxy(value, rootOnChange);
					}
					
					const result = Reflect.set(obj, prop, value, receiver);
					
					// Call the root change handler
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
				}
			};
			
			// Recursively proxy existing properties
			for (let key in target) {
				if (target.hasOwnProperty(key) && typeof target[key] === "object" && target[key] !== null) {
					target[key] = createDeepProxy(target[key], rootOnChange);
				}
			}
			
			const proxy = new Proxy(target, handler);
			
			// Mark both the original object and proxy as proxied
			proxied_objects.add(target);
			proxied_objects.add(proxy);
			
			return proxy;
		}
		
		//Add getter/setter
		Object.defineProperty(current_obj, all_keys[all_keys.length - 1], {
			configurable: true,
			enumerable: true,
			
			get() {
				if (options.get_function)
					return options.get_function.call(this);
				return internal_value;
			},
			
			set(value) {
				setter_context = this;
				
				// Create change handler that triggers set_function
				let rootOnChange = function() {
					if (typeof options.set_function === "function") {
						options.set_function.call(setter_context, internal_value);
					}
				};
				
				// Always proxy objects/arrays, keep primitives as-is
				// No cloning - work with original object
				if (typeof value === "object" && value !== null) {
					internal_value = createDeepProxy(value, rootOnChange);
				} else {
					internal_value = value;
				}
				
				// Call set_function for initial assignment
				if (options.set_function) {
					options.set_function.call(this, internal_value);
				}
			}
		});
		
		//Return statement
		return old_value;
	};
	
	/**
	 * Generates and returns a random unique ID given a specific object.
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
	 * Fetches a given value with a root object and variable string.
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
	 *
	 * @param {Object} arg0_object
	 * @param {function(arg0_local_key, arg1_local_value)|function(arg0_local_value)} arg1_function
	 * @param {Object} [arg2_options]
	 *  @param [arg2_options.sort_mode] - Either 'ascending'/'descending'. Sorts object keys.
	 */
	Object.iterate = function (arg0_object, arg1_function, arg2_options) {
		//Convert from parameters
		let object = arg0_object;
		let local_function = arg1_function;
		let options = (arg2_options) ? arg2_options : {};
		
		//Internal guard clauses
		if (typeof object !== "object")
			console.error("arg0_object is not of type Object.", object);
		if (!local_function)
			throw new Error("arg1_function is not defined.");
		if (local_function.length === 0)
			throw new Error("Invalid number of arguments accepted for arg1_function. Should either be (arg0_local_key, arg1_local_value), or less preferably, (arg0_local_value).");
		
		//Declare local instance variables
		let all_local_keys = Object.keys(object);
			//Sort all_local_keys by .sort_mode
			if (options.sort_mode === "date_ascending") {
				all_local_keys = all_local_keys.sort((a, b) => {
					return parseInt(a) - parseInt(b);
				});
			} else if (options.sort_mode === "date_descending") {
				all_local_keys = all_local_keys.sort((a, b) => {
					return parseInt(b) - parseInt(a);
				});
			}
		
		//Call functions
		if (local_function.length === 1) {
			for (let i = 0; i < all_local_keys.length; i++)
				local_function(object[all_local_keys[i]]);
		} else {
			for (let i = 0; i < all_local_keys.length; i++)
				local_function(all_local_keys[i], object[all_local_keys[i]]);
		}
	};
	
	/**
	 * Sets a given value with a root object and variable string.
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
}
