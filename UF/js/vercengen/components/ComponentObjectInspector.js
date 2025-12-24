/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 * 
 * Object inspector similar to DevTools that has nested dropdowns and parses Javascript Object Literals (as opposed to JSON.stringify).
 * - Functional binding: <span color=00ffff>veObjectInspector</span>().
 * 
 * ##### Constructor:
 * - `arg0_value`: {@link any}|{@link Object}
 * - `arg1_options`: {@link Object}
 *   - `.key_name="Object"`: {@link string} - The key name of the root object if relevant. Affects IDs in generated HTML.
 *   - `.max_depth=15`: {@link number} - The maximum recursion depth to display.
 * 
 * ##### Instance:
 * - `.v`: {@link any}|{@link Object} - The object to display in the inspector window.
 * 
 * @augments ve.Component
 * @memberof ve.Component
 * @type {ve.ObjectInspector}
 */
ve.ObjectInspector = class extends ve.Component {
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = (arg0_value) ? arg0_value : {};
		let options = (arg1_options) ? arg1_options : {};
			super(options);
			
		//Initialise options
		options.attributes = (options.attributes) ? options.attributes : {};
		options.key_name = (options.key_name) ? options.key_name : "Object";
		options.max_depth = Math.returnSafeNumber(options.max_depth, 15);
			
		//Declare local instance variables
		this.element = document.createElement("div");
			this.element.setAttribute("component", "ve-object-inspector");
			HTML.setAttributesObject(this.element, options.attributes);
			this.element.instance = this;
		this.options = options;
		this.value = value;
		
		//Format HTML string
		this.v = this.value;
	}
	
	/**
	 * Returns the current Object displayed in the inspector.
	 * - Accessor of: {@link ve.ObjectInspector}
	 * 
	 * @alias v
	 * @memberof ve.Component.ve.ObjectInspector
	 * @type {any}
	 */
	get v () {
		//Return statement
		return this.value;
	}
	
	/**
	 * Sets the new Object to be displayed in the inspector.
	 * - Accessor of: {@link ve.ObjectInspector}
	 * 
	 * @alias v
	 * @memberof ve.Component.ve.ObjectInspector
	 * 
	 * @param {any} arg0_value
	 */
	set v (arg0_value) {
		//Convert from parameters
		let value = arg0_value;
		
		//Set this.element.innerHTML to reflect the object at hand
		this.element.innerHTML = ve.ObjectInspector.generateHTMLRecursively(this.value, this.options.key_name, {
			max_depth: this.options.max_depth
		});
		this.value = value;
	}
	
	/**
	 * Recursively parses a JS Object to HTML with collapsible folders.
	 * - Static method of: {@link ve.ObjectInspector}
	 * 
	 * @alias #generateHTMLRecursively
	 * @memberof ve.Component.ve.ObjectInspector
	 *
	 * @param {any} arg0_object - The item to parse.
	 * @param {string} [arg1_object_key="object"] - The root name of the Object being inspected.
	 * @param {Object} [arg2_options]
	 *  @param {number} [arg2_options.current_depth=0] - Current recursion depth.
	 *  @param {number} [arg2_options.max_depth=15] - Max depth to recurse.
	 *  @param {WeakSet} [arg2_options.seen] - Circular reference tracking.
	 *  
	 * @returns {string}
	 */
	static generateHTMLRecursively (arg0_object, arg1_object_key, arg2_options) {
		//Convert from parameters
		let object = arg0_object;
		let path = (arg1_object_key) ? arg1_object_key : "Object";
		let options = (arg2_options) ? arg2_options : {};
		
		//Initialise options
		options.current_depth = Math.returnSafeNumber(options.current_depth, 0);
		options.max_depth = Math.returnSafeNumber(options.max_depth, 15);
		if (!options.seen) options.seen = new WeakSet();
		
		//Internal guard clause for Circular References
		if (object !== null && (typeof object === "object" || typeof object === "function")) {
			if (options.seen.has(object))
				return `<span class = "error-circular-reference">[Circular Reference]</span>`;
			options.seen.add(object);
		}
		//Internal guard clause if options.current_depth exceeds options.max_depth
		if (options.current_depth > options.max_depth)
			return `<span class = "error-depth-limit" title = "Depth limit reached">... (Max Depth)</span>`;
		
		//1. Primitive handling
		if (object === null || (typeof object !== "object" && typeof object !== "function")) {
			let type_name;
				if (object === undefined) {
					type_name = "undefined";
				} else if (object === null) { 
					type_name = "null";
				} else {
					type_name = (typeof object); //'boolean'/'number'/'string'
				}
			
			//Return statement
			return `<span id = "${path}" class = "${type_name}">${HTML.getEscapedString(object)}</span>`;
		}
		
		//2. Arrays, Classes, Functions
		let all_keys = [];
		let ignored_keys = ["arguments", "caller", "length", "name", "__proto__", "prototype", "[[Scopes]]"];
		let is_function = (typeof object === "function");
		let is_date = (object instanceof Date);
		let is_regexp = (object instanceof RegExp);
		
		if (Array.isArray(object)) {
			//Arrays
			Object.getOwnPropertyNames(object).forEach((local_key) => {
				if (local_key !== "length" && local_key !== "__proto__")
					all_keys.push(local_key);
			});
		} else if (is_function) {
			//Functions
			Object.getOwnPropertyNames(object).forEach((local_key) => {
				if (!ignored_keys.includes(local_key)) 
					all_keys.push(local_key);
			});
		} else if (!is_date && !is_regexp) {
			//Objects
			Object.getOwnPropertyNames(object).forEach((local_key) => {
				if (local_key !== "__proto__") all_keys.push(local_key);
			});
			
			//Walk proto chain safely (limited to 1 level up for massive globals to save memory)
			let current_obj = Object.getPrototypeOf(object);
			
			if (current_obj && current_obj !== Object.prototype) {
				Object.getOwnPropertyNames(current_obj).forEach((local_key) => {
					if (local_key !== "constructor" && local_key !== "__proto__") 
						all_keys.push(local_key);
				});
			}
		}
		
		//Sort keys (approximate for performance)
		let sorted_keys = Array.from(all_keys).slice(0, 500); //Limit to first 500 keys per object to prevent crashes
			sorted_keys.sort();
		
		//Render summary for Object
		let inner_html = "";
		let label = String.formatTypeName(object);
		let preview = "";
			if (is_date) preview = ` <span class = "type-date">"${object.toISOString()}"</span>`;
			if (is_regexp) preview = ` <span class = "type-regexp">${HTML.getEscapedString(object.toString())}</span>`;
		let summary_html = `
			<summary id = "${path}" style = "cursor: pointer">
				<span class = "label-key">${path.split('.').pop()}</span> 
				<span class = "label-type">(${HTML.getEscapedString(label)})${preview}</span>
			</summary>`;
		
		//Render inner Object content
		//Functions - code View (Truncated)
		if (is_function) {
			let function_code = object.toString();
			if (function_code.length > 500) 
				function_code = `${function_code.substring(0, 500)}... (${function_code.length - 500} more characters)`;
			
			inner_html += `
        <details class = "indent">
					<summary class = "view-source" style = "cursor: pointer;">
						<span class = "view-source-function">f</span> View Source
					</summary>
					<div class = "view-source-function-code" style = "overflow-x: auto;">
						<pre>${HTML.getEscapedString(function_code)}</pre>
					</div>
        </details>`;
		}
		
		//Objects - recursion; iterate over all sorted_keys
		for (let key of sorted_keys) {
			let child_id = `${path}.${key}`;
			let local_value;
				try { local_value = object[key]; } catch (e) { continue; }
			
			//Recursive call with incremented depth
			let child_html = ve.ObjectInspector.generateHTMLRecursively(local_value, child_id, {
				current_depth: options.current_depth + 1,
				max_depth: options.max_depth,
				seen: options.seen,
			});
			
			if ((typeof local_value === "object" && local_value !== null) || typeof local_value === "function") {
				inner_html += `<div class = "indent">${child_html}</div>`;
			} else {
				inner_html += `
					<div class = "indent">
						<span id = "${child_id}" class = "label-key">${HTML.getEscapedString(key)}</span>: 
						${child_html}
					</div>`;
			}
		}
		
		if (sorted_keys.length === 0 && !is_function && !is_date && !is_regexp)
			inner_html += `<div class = "code indent">{}</div>`;
		
		//Return statement
		return `<details class = "ve-object-inspector" open>${summary_html}${inner_html}</details>`;
	}
};

//Functional binding

/**
 * @returns {ve.ObjectInspector}
 */
veObjectInspector = function () {
	//Return statement
	return new ve.ObjectInspector(...arguments);
};