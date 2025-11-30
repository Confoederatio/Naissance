//Initialise functions
{
	/**
	 * Applies dynamic (function-based) styles recursively for each frame.
	 * 
	 * @param {HTMLElement} arg0_el
	 * @param {Object} arg1_style_obj - Telestyle object for dynamic styles.
	 */
	HTML.applyDynamicTelestyle = function (arg0_el, arg1_style_obj) {
		let el = arg0_el;
		let dynamic_obj = arg1_style_obj;
		
		//Iterate over all values in dyanmic_obj
		Object.iterate(dynamic_obj, (local_key, local_value) => {
			if (typeof local_value === "object" && !Array.isArray(local_value)) {
				let targets = HTML.resolveSelector(el, local_key);
				
				//Iterate over all targets in targets
				for (let local_target of targets)
					HTML.applyDynamicTelestyle(local_target, local_value);
			} else if (typeof local_value === "function") {
				let computed_style = local_value(el);
				
				if (computed_style !== undefined && computed_style !== null) {
					if (local_key.startsWith("--")) {
						el.style.setProperty(local_key, computed_style.toString());
					} else {
						el.style[local_key] = computed_style.toString();
					}
				}
			}
		});
	};
	
	/**
	 * Applies static (non-function) styles recursively, once.
	 * 
	 * @param {HTMLElement} arg0_el
	 * @param {Object} arg1_style_obj - Telestyle object for static styles.
	 */
	HTML.applyStaticTelestyle = function (arg0_el, arg1_style_obj) {
		let el = arg0_el;
		let style_obj = arg1_style_obj;
		
		//Iterate over all values in style_obj
		Object.iterate(style_obj, (local_key, local_value) => {
			if (typeof local_value === "object" && !Array.isArray(local_value)) {
				let targets = HTML.resolveSelector(el, local_key);
				for (let i = 0; i < targets.length; i++)
					HTML.applyStaticTelestyle(targets[i], local_value);
			} else if (typeof local_value !== "function") {
				if (local_key.startsWith("--"))
					el.style.setProperty(local_key, local_value.toString());
				else el.style[local_key] = local_value.toString();
			}
		});
	};
	
	/**
	 * Applies Telestyle to a given element, accepting both {@link Object} and {@link string} formats.
	 * 
	 * @param {HTMLElement} arg0_el
	 * @param {Object|string} arg1_style
	 */
	HTML.applyTelestyle = function (arg0_el, arg1_style) {
		//Convert from parameters
		let el = (typeof arg0_el === "object") ? arg0_el : document.querySelector(arg0_el);
		let style = arg1_style;
		
		//Apply CSS style to el
		if (typeof style === "object") {
			HTML.applyTelestyleObject(el, style);
		} else if (typeof style === "string") {
			el.setAttribute("style", style);
		}
	};
	
	/**
	 * Applies a persistent Telestyle {@link Object} to an element.
	 * 
	 * @param {HTMLElement} arg0_el
	 * @param {Object} arg1_style_obj
	 */
	HTML.applyTelestyleObject = function (arg0_el, arg1_style_obj) { //[WIP] - To be refactored at a later date
		// Convert arguments
		let el =
			typeof arg0_el === "object" ? arg0_el : document.querySelector(arg0_el.toString());
		let style_obj = arg1_style_obj ? arg1_style_obj : {};
		
		if (!el) return; //Internal guard clause if element could not be found
		
		//Declare local instance variables
		let mutated_style_obj = structuredClone(style_obj);
		let { static: staticStyles, dynamic: dynamic_styles } =
			HTML.splitStaticDynamicTelestyle(mutated_style_obj);
		let registry = HTML.ve_css_registry;
		
		//Apply existing static styles immediately to current subtree
		HTML.applyStaticTelestyle(el, staticStyles);
		registry.set(el, { mutated_style_obj, dynamic: dynamic_styles });
		
		//Set up smart, silent observers to detect element/attribute mutations
		if (el._telestyleObserver) el._telestyleObserver.disconnect();
		
		let observer = new MutationObserver((all_mutations) => {
			//Iterate over all observed mutations
			for (let local_mutation of all_mutations) {
				if (local_mutation.type === "childList") {
					//Iterate over all added nodes; handle added nodes
					for (let local_added_node of local_mutation.addedNodes) {
						if (!(local_added_node instanceof HTMLElement)) continue;
						
						let nodes_to_check = [local_added_node, ...local_added_node.querySelectorAll("*")];
						
						//Iterate over all nodes_to_check
						for (let node of nodes_to_check) {
							//Reapply static and dynamic styles for any match
							Object.iterate(staticStyles, (selector, local_value) => {
								if (
									typeof local_value === "object" &&
									typeof selector === "string"
								) {
									try {
										if (node.matches(selector)) {
											HTML.applyStaticTelestyle(node, local_value);
										}
									} catch (err) {}
								}
							});
							Object.iterate(dynamic_styles, (selector, local_value) => {
								if (
									typeof local_value === "object" &&
									typeof selector === "string"
								) {
									try {
										if (node.matches(selector)) {
											HTML.applyDynamicTelestyle(node, local_value);
										}
									} catch (err) {}
								}
							});
						}
					}
					
					//Iterate over all .removedNodes if cleanup registry needed
					for (let local_removed_node of local_mutation.removedNodes)
						if (HTML.ve_css_registry?.has(local_removed_node))
							HTML.ve_css_registry.delete(local_removed_node);
				} else if (local_mutation.type === "attributes") {
					//Re-trigger style application when attributes change
					let target = local_mutation.target;
					
					//Iterate over all static styles and apply them to target if match
					Object.iterate(staticStyles, (selector, local_value) => {
						try {
							if (target.matches(selector)) {
								HTML.applyStaticTelestyle(target, local_value);
							}
						} catch (err) {}
					});
				}
			}
		});
		
		observer.observe(el, {
			childList: true,
			subtree: true,
			attributes: true,
		});
		
		el._telestyleObserver = observer;
		
		//Apply dynamic styles once
		if (Object.keys(dynamic_styles).length > 0) {
			HTML.applyDynamicTelestyle(el, dynamic_styles);
		}
	};
	
	/**
	 * Resolves a selector relative to an element.
	 * Supports :nth-parent(n) and normal query selectors.
	 * 
	 * @param {HTMLElement} arg0_el
	 * @param {string} arg1_selector
	 */
	HTML.resolveSelector = function (arg0_el, arg1_selector) {
		//Convert from parameters
		let el = arg0_el;
		let selector = arg1_selector;
		
		//Declare local instance variables
		let parent_match = selector.match(/^:nth-parent\((\d+)\)$/);
		
		if (parent_match) {
			let n = parseInt(parent_match[1]);
			let target = el;
			
			//While loop until parent element is found
			while (n-- > 0 && target.parentElement) 
				target = target.parentElement;
			
			//Return statement
			return target ? [target] : [];
		}
		
		//Return statement; normal descendant functions
		try {
			return el.querySelectorAll(selector);
		} catch (e) {
			console.error(e);
			return [];
		}
	}
	
	/**
	 * Splits static and dynamic properties into two trees.
	 * 
	 * @param {Object} arg0_object - Telestyle object to split into static/dynamic objects.
	 * @returns {{dynamic: Object, static: Object}} - Static and dynamic Telestyle objects.
	 */
	HTML.splitStaticDynamicTelestyle = function (arg0_object) {
		//Convert from parameters
		let object = arg0_object;
		
		//Declare local instance variables
		let static_obj = {};
		let dynamic_obj = {};
		
		//Iterate over all values in object
		Object.iterate(object, (local_key, local_value) => {
			if (typeof local_value === "object" && !Array.isArray(local_value)) {
				let nested = HTML.splitStaticDynamicTelestyle(local_value);
				
				static_obj[local_key] = nested.static;
				dynamic_obj[local_key] = nested.dynamic;
			} else if (typeof local_value === "function") {
				dynamic_obj[local_key] = local_value;
			} else {
				static_obj[local_key] = local_value;
			}
		});
		
		//Return statement
		return {
			dynamic: dynamic_obj,
			static: static_obj
		};
	}
}
