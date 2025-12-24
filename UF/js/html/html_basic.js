//Initialise functions
{
	if (!global.HTML)
		/**
		 * The namespace for all UF/HTML utility functions, typically for static methods.
		 * 
		 * @namespace HTML
		 */
		global.HTML = {};
	
	/**
	 * Returns a list of all parent elements from a given child.
	 * 
	 * @param {HTMLElement} arg0_el
	 * 
	 * @returns {HTMLElement[]}
	 */
	HTML.getAllParentElements = function (arg0_el) {
		//Convert from parameters
		let el = (typeof arg0_el === "object") ? arg0_el : document.querySelector(arg0_el);
		
		if (!el) return []; //Internal guard clause if element is invalid
		
		//Declare local instance variables
		let current_el = el.parentElement;
		let parent_els = [];
		
		//Iterate over all ancestors
		while (current_el) {
			parent_els.push(current_el);
			current_el = current_el.parentElement;
		}
		
		//Return statement
		return parent_els;
	};
	
	/**
	 * Converts a set anchor, and x/y_coord to a valid CSS {@link Object}.
	 * 
	 * @param {HTMLElement} arg0_anchor - Either 'top_left'/'top_right'/'bottom_left'/'bottom_right'.
	 * @param {number} arg1_x
	 * @param {number} arg2_y
	 * 
	 * @returns {{bottom: number, left: number, right: number, top: number}}
	 */
	HTML.getCSSPosition = function (arg0_anchor, arg1_x, arg2_y) {
		//Convert from parameters
		let anchor = (arg0_anchor) ? arg0_anchor : "top_left";
		let x_coord = parseInt(arg1_x);
		let y_coord = parseInt(arg2_y);
		
		//Declare local instance variables
		let return_obj = {};
		let x_string = (typeof x_coord === "string") ? x_coord : `${x_coord}px`;
		let y_string = (typeof y_coord === "string") ? y_coord : `${y_coord}px`;
		
		//Set return_obj styles based on anchor
		if (anchor === "top_left") {
			return_obj.left = x_string;
			return_obj.top = y_string;
		} else if (anchor === "top_right") {
			return_obj.right = x_string;
			return_obj.top = y_string;
		} else if (anchor === "bottom_left") {
			return_obj.bottom = y_string;
			return_obj.left = x_string;
		} else if (anchor === "bottom_right") {
			return_obj.bottom = y_string;
			return_obj.right = x_string;
		}
		
		//Return statement
		return return_obj;
	};
	
	/**
	 * Converts width, height numbers into a valid CSS {@link Object}.
	 * 
	 * @param {number} arg0_width
	 * @param {number} arg1_height
	 * 
	 * @returns {{height: string, width: string}}
	 */
	HTML.getCSSSize = function (arg0_width, arg1_height) {
		//Convert from parameters
		let width = arg0_width;
		let height = arg1_height;
		
		//Return statement
		return {
			height: (typeof height === "string") ? height : `${height}px`,
			width: (typeof width === "string") ? width : `${width}px`
		};
	};
	
	/**
	 * Returns an escaped string in HTML terms such that it renders properly.
	 * 
	 * @param {any|string} arg0_string
	 * 
	 * @returns {string}
	 */
	HTML.getEscapedString = function (arg0_string) {
		//Convert from parameters
		let string = arg0_string;
			try { if (typeof string !== "string") string = string.toString(); } catch (e) {}
			if (typeof string !== "string") string = "";
		
		//Return statement
		return string.replace(/[&<>"']/g, (local_match) => ({
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;", 
			'"': "&quot;", 
			"'": "&#039;"
		})[local_match]);
	};
	
	/**
	 * Returns the actual `.innerText` content of a given element.
	 * 
	 * @param {HTMLElement} arg0_el
	 * 
	 * @returns {string}
	 */
	HTML.getInnerText = function (arg0_el) {
		//Convert from parameters
		let el = (typeof arg0_el === "object") ? arg0_el : document.querySelector(arg0_el);
		
		//Declare local instance variables
		let child  = el.firstChild;
		let texts = [];
		
		//Iterate over all children
		while (child) {
			if (child.nodeType === 3)
				texts.push(child.data);
			child = child.nextSibling;
		}
		
		//Return statement
		return texts.join("");
	};
	
	/**
	 * Traverses an ordered list with `arg1_function` executing in sequential order.
	 * 
	 * @param {HTMLElement} arg0_ol_el
	 * @param {function} arg1_function - (arg0_el:{@link HTMLElement}) - Defines what to do with each <li>/<ol> node.
	 * @param {boolean} [arg2_is_nested=false] - Internal helper flag. Whether the current layer has already been nested.
	 * 
	 * @returns {Object}
	 */
	HTML.listToObject = function (arg0_ol_el, arg1_function, arg2_is_nested) {
		//Convert from parameters
		let ol_el = arg0_ol_el;
		let local_function = arg1_function;
		let is_nested = arg2_is_nested;
		
		//Declare local instance variables
		let return_obj = {};
			if (is_nested) return_obj = (local_function) ? local_function(ol_el) : {};
		
		//Iterate over all <li> children
		ol_el.querySelectorAll(":scope > li").forEach((li_el) => {
			let local_id = (li_el.id || null);
			if (!local_id) return; //Skip <li> without ID
			
			//Look for nested <ol> inside the <li>
			let nested_ol = li_el.querySelector(":scope > ol");
			
			return_obj[local_id] = (nested_ol) ? 
				HTML.listToObject(nested_ol, local_function, true) : local_function(li_el);
		});
		
		//Return statement
		return return_obj;
	};
	
	/**
	 * Converts an object into an HTML attributes string.
	 * 
	 * @param {Object|{"<attribute_key>": string}} arg0_object
	 * 
	 * @returns {string}
	 */
	HTML.objectToAttributes = function (arg0_object) {
		//Convert from parameters
		let object = (arg0_object) ? arg0_object : {};
		
		//Declare local instance variables
		let attribute_string = [];
		
		//Iterate over object and put together attribute_string
		Object.iterate(object, (local_key, local_value) => {
			if (local_value !== undefined)
				attribute_string.push(`${local_key} = "${local_value}"`);
		});
		
		//Format attribute_string
		attribute_string = attribute_string.join(" ");
		
		//Return statement
		return (attribute_string) ? ` ${attribute_string}` : "";
	};
	
	/**
	 * Sets the attributes of a given element based off of an {@link Object}.
	 * 
	 * @param {HTMLElement} arg0_element
	 * 
	 * @param {{"<attribute_key>": string}} arg1_attributes_obj
	 * 
	 * @returns {HTMLElement}
	 */
	HTML.setAttributesObject = function (arg0_element, arg1_attributes_obj) {
		//Convert from parameters
		let element = arg0_element;
		let attributes_obj = (arg1_attributes_obj) ? arg1_attributes_obj : {};
		
		//Declare local instance variables
		let local_el = (typeof element === "string") ? 
			document.querySelector(element) : element;
		
		//Iterate over attributes_obj and apply it to local_el
		Object.iterate(attributes_obj, (local_key, local_value) => {
			local_el.setAttribute(local_key, local_value.toString());
		});
		
		//Return statement
		return element;
	};
	
	/**
	 * Traverses the DOM recursively from a given root element.
	 * 
	 * @param {HTMLElement} arg0_element
	 * @param {function} arg1_function - Accepts (arg0_local_el, arg1_return_obj) as parameters.
	 * @param {Object} [arg2_return_obj={}]
	 */
	HTML.traverseDOM = function (arg0_element, arg1_function, arg2_return_obj) {
		//Convert from parameters
		let element = arg0_element;
		let local_function = arg1_function;
		let return_obj = (arg2_return_obj) ? arg2_return_obj : {};
		
		//Declare local instance variables
		let children = element.childNodes;
		
		//Iterate over all child elements in element
		for (let i = 0; i < children.length; i++)
			HTML.traverseDOM(children[i], local_function, return_obj);
		return_obj = local_function(element, return_obj);
		
		//Return statement
		return return_obj;
	};
}