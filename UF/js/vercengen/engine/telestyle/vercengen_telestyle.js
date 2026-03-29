//Initialise functions
//[QUARANTINE]
{
	/**
	 * Scope counter for unique telestyle identifiers.
	 * @type {number}
	 */
	HTML._telestyleScopeCounter = 0;
	
	/**
	 * Converts a camelCase CSS property name to kebab-case.
	 *
	 * @param {string} arg0_string
	 * @returns {string}
	 */
	HTML.camelToKebab = function (arg0_string) {
		return arg0_string.replace(
			/[A-Z]/g,
			(match) => "-" + match.toLowerCase()
		);
	};
	
	/**
	 * Compiles a static Telestyle object into an array of scoped CSS rule
	 * strings. Only emits rules for nested (descendant) selectors — root-level
	 * properties are handled inline by applyTelestyleObject.
	 * Skips :nth-parent selectors (not expressible in CSS).
	 *
	 * @param {string} arg0_scope_selector - e.g. '[data-telestyle="ts-1"]'
	 * @param {Object} arg1_style_obj - Static Telestyle object.
	 * @param {string} [arg2_context_selector] - Accumulated descendant selector.
	 * @returns {string[]} - Array of CSS rule strings.
	 */
	HTML.compileTelestyleCSS = function (
		arg0_scope_selector,
		arg1_style_obj,
		arg2_context_selector
	) {
		//Convert from parameters
		let scope_selector = arg0_scope_selector;
		let style_obj = arg1_style_obj;
		let context = arg2_context_selector || null;
		
		//Declare local instance variables
		let declarations = [];
		let rules = [];
		
		//Iterate over all values in style_obj
		Object.iterate(style_obj, (local_key, local_value) => {
			if (
				typeof local_value === "object" &&
				!Array.isArray(local_value)
			) {
				let parent_match = local_key.match(/^:nth-parent\((\d+)\)$/);
				
				//Skip :nth-parent — not expressible in CSS, handled separately
				if (!parent_match) {
					let nested_context = context
						? `${context} ${local_key}`
						: local_key;
					
					rules.push(
						...HTML.compileTelestyleCSS(
							scope_selector,
							local_value,
							nested_context
						)
					);
				}
			} else if (typeof local_value !== "function") {
				//Only emit declarations for nested contexts, not root level
				if (context) {
					let css_prop = local_key.startsWith("--")
						? local_key
						: HTML.camelToKebab(local_key);
					
					declarations.push(`  ${css_prop}: ${local_value};`);
				}
			}
		});
		
		//Emit a rule block if there are declarations at this level
		if (declarations.length > 0 && context) {
			let full_selector = `${scope_selector} ${context}`;
			
			rules.push(
				`${full_selector} {\n${declarations.join("\n")}\n}`
			);
		}
		
		//Return statement
		return rules;
	};
	
	/**
	 * Walks the static Telestyle tree and applies inline styles only for
	 * :nth-parent selectors, which cannot be expressed in CSS.
	 *
	 * @param {HTMLElement} arg0_el
	 * @param {Object} arg1_style_obj - Static Telestyle object.
	 */
	HTML.applyParentTelestyles = function (arg0_el, arg1_style_obj) {
		//Convert from parameters
		let el = arg0_el;
		let style_obj = arg1_style_obj;
		
		//Iterate over all values in style_obj
		Object.iterate(style_obj, (local_key, local_value) => {
			if (
				typeof local_value === "object" &&
				!Array.isArray(local_value)
			) {
				let parent_match = local_key.match(/^:nth-parent\((\d+)\)$/);
				
				if (parent_match) {
					//Resolve the parent target and apply inline
					let targets = HTML.resolveSelector(el, local_key);
					
					for (let local_target of targets)
						HTML.applyInlineTelestyle(local_target, local_value);
				} else {
					//Recurse into descendant selectors to find deeper :nth-parent
					try {
						let targets = el.querySelectorAll(local_key);
						
						for (let local_target of targets)
							HTML.applyParentTelestyles(local_target, local_value);
					} catch (err) {}
				}
			}
		});
	};
	
	/**
	 * Applies non-function styles as inline styles to a single element.
	 * Used only for :nth-parent targets that cannot use the stylesheet path.
	 *
	 * @param {HTMLElement} arg0_el
	 * @param {Object} arg1_style_obj
	 */
	HTML.applyInlineTelestyle = function (arg0_el, arg1_style_obj) {
		//Convert from parameters
		let el = arg0_el;
		let style_obj = arg1_style_obj;
		
		//Iterate over all values in style_obj
		Object.iterate(style_obj, (local_key, local_value) => {
			if (
				typeof local_value === "object" &&
				!Array.isArray(local_value)
			) {
				let targets = HTML.resolveSelector(el, local_key);
				
				for (let local_target of targets)
					HTML.applyInlineTelestyle(local_target, local_value);
			} else if (typeof local_value !== "function") {
				let val_str = local_value.toString();
				
				if (local_key.startsWith("--")) {
					if (el.style.getPropertyValue(local_key) !== val_str)
						el.style.setProperty(local_key, val_str);
				} else {
					if (el.style[local_key] !== val_str)
						el.style[local_key] = val_str;
				}
			}
		});
	};
	
	/**
	 * Applies dynamic (function-based) styles recursively for each frame.
	 *
	 * @param {HTMLElement} arg0_el
	 * @param {Object} arg1_style_obj - Telestyle object for dynamic styles.
	 */
	HTML.applyDynamicTelestyle = function (arg0_el, arg1_style_obj) {
		let el = arg0_el;
		let dynamic_obj = arg1_style_obj;
		
		//Iterate over all values in dynamic_obj
		Object.iterate(dynamic_obj, (local_key, local_value) => {
			if (
				typeof local_value === "object" &&
				!Array.isArray(local_value)
			) {
				let targets = HTML.resolveSelector(el, local_key);
				
				//Iterate over all targets in targets
				for (let local_target of targets)
					HTML.applyDynamicTelestyle(local_target, local_value);
			} else if (typeof local_value === "function") {
				let computed_style = local_value(el);
				
				if (computed_style !== undefined && computed_style !== null) {
					let val_str = computed_style.toString();
					
					if (local_key.startsWith("--")) {
						if (el.style.getPropertyValue(local_key) !== val_str)
							el.style.setProperty(local_key, val_str);
					} else {
						if (el.style[local_key] !== val_str)
							el.style[local_key] = val_str;
					}
				}
			}
		});
	};
	
	/**
	 * Applies Telestyle to a given element, accepting both {@link Object}
	 * and {@link string} formats.
	 *
	 * @param {HTMLElement} arg0_el
	 * @param {Object|string} arg1_style
	 */
	HTML.applyTelestyle = function (arg0_el, arg1_style) {
		//Convert from parameters
		let el =
			typeof arg0_el === "object"
				? arg0_el
				: document.querySelector(arg0_el);
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
	 * Root-level static styles are applied inline (preserving specificity).
	 * Descendant static styles are compiled into a scoped <style> sheet
	 * appended as a child of the element to ensure it is garbage collected
	 * when the element is removed.
	 *
	 * @param {HTMLElement} arg0_el
	 * @param {Object} arg1_style_obj
	 */
	HTML.applyTelestyleObject = function (arg0_el, arg1_style_obj) {
		//Convert arguments
		let el =
			typeof arg0_el === "object"
				? arg0_el
				: document.querySelector(arg0_el.toString());
		let style_obj = arg1_style_obj ? arg1_style_obj : {};
		
		if (!el) return; //Internal guard clause if element could not be found
		
		//Declare local instance variables
		let mutated_style_obj = style_obj;
		let split_styles = HTML.splitStaticDynamicTelestyle(mutated_style_obj);
		let static_styles = split_styles.static;
		let dynamic_styles = split_styles.dynamic;
		let registry = HTML.ve_css_registry;
		
		//Clean up previous telestyle artefacts
		if (el._telestyleSheet) {
			el._telestyleSheet.remove();
			el._telestyleSheet = null;
		}
		if (el._telestyleObserver) {
			el._telestyleObserver.disconnect();
			el._telestyleObserver = null;
		}
		
		//Generate a unique scope identifier and assign it to the element
		let scope_id = `ts-${++HTML._telestyleScopeCounter}`;
		el.setAttribute("data-telestyle", scope_id);
		
		let scope_selector = `[data-telestyle="${scope_id}"]`;
		
		//Apply root-level static properties inline (preserves specificity)
		Object.iterate(static_styles, (local_key, local_value) => {
			if (typeof local_value !== "object" || Array.isArray(local_value)) {
				let val_str = local_value.toString();
				
				if (local_key.startsWith("--")) {
					if (el.style.getPropertyValue(local_key) !== val_str)
						el.style.setProperty(local_key, val_str);
				} else {
					if (el.style[local_key] !== val_str)
						el.style[local_key] = val_str;
				}
			}
		});
		
		//Compile descendant static styles into a native CSS stylesheet
		let css_rules = HTML.compileTelestyleCSS(scope_selector, static_styles);
		
		if (css_rules.length > 0) {
			let style_el = document.createElement("style");
			style_el.setAttribute("data-telestyle-scope", scope_id);
			style_el.textContent = css_rules.join("\n");
			
			//Append to the element itself so it dies when the element is removed
			el.appendChild(style_el);
			el._telestyleSheet = style_el;
		}
		
		//Apply :nth-parent static styles inline (not expressible in CSS)
		HTML.applyParentTelestyles(el, static_styles);
		
		//Update registry
		if (registry)
			registry.set(el, { mutated_style_obj, dynamic: dynamic_styles });
		
		//Handle dynamic styles: initial apply + observer for new child nodes
		let has_dynamic = Object.keys(dynamic_styles).length > 0;
		
		if (has_dynamic) {
			HTML.applyDynamicTelestyle(el, dynamic_styles);
			
			let is_applying = false;
			
			let observer = new MutationObserver((all_mutations) => {
				//Guard clause to prevent re-entrant application
				if (is_applying) return;
				
				is_applying = true;
				
				//Iterate over all observed mutations
				for (let local_mutation of all_mutations) {
					if (local_mutation.type === "childList") {
						//Iterate over all added nodes; apply dynamic styles
						for (let local_added_node of local_mutation.addedNodes) {
							if (!(local_added_node instanceof HTMLElement)) continue;
							
							let nodes_to_check = [
								local_added_node,
								...local_added_node.querySelectorAll("*"),
							];
							
							//Iterate over all nodes_to_check
							for (let node of nodes_to_check) {
								Object.iterate(
									dynamic_styles,
									(selector, local_value) => {
										if (
											typeof local_value === "object" &&
											typeof selector === "string"
										) {
											try {
												if (node.matches(selector))
													HTML.applyDynamicTelestyle(node, local_value);
											} catch (err) {}
										}
									}
								);
							}
						}
						
						//Iterate over all .removedNodes for cleanup
						for (let local_removed_node of local_mutation.removedNodes)
							if (registry?.has(local_removed_node))
								registry.delete(local_removed_node);
					}
				}
				
				is_applying = false;
			});
			
			//Only observe childList
			observer.observe(el, {
				childList: true,
				subtree: true,
			});
			
			el._telestyleObserver = observer;
		}
	};
	
	/**
	 * Removes all Telestyle artefacts from an element (sheet, observer, scope).
	 *
	 * @param {HTMLElement} arg0_el
	 */
	HTML.removeTelestyle = function (arg0_el) {
		//Convert from parameters
		let el =
			typeof arg0_el === "object"
				? arg0_el
				: document.querySelector(arg0_el);
		
		if (!el) return;
		
		//Remove sheet if reference exists (it might have already been removed by DOM clear)
		if (el._telestyleSheet) {
			el._telestyleSheet.remove();
			el._telestyleSheet = null;
		}
		if (el._telestyleObserver) {
			el._telestyleObserver.disconnect();
			el._telestyleObserver = null;
		}
		
		el.removeAttribute("data-telestyle");
		
		if (HTML.ve_css_registry?.has(el)) HTML.ve_css_registry.delete(el);
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
			return [];
		}
	};
	
	/**
	 * Splits static and dynamic properties into two trees.
	 *
	 * @param {Object} arg0_object - Telestyle object to split.
	 * @returns {{dynamic: Object, static: Object}}
	 */
	HTML.splitStaticDynamicTelestyle = function (arg0_object) {
		//Convert from parameters
		let object = arg0_object;
		
		//Declare local instance variables
		let static_obj = {};
		let dynamic_obj = {};
		
		//Iterate over all values in object
		Object.iterate(object, (local_key, local_value) => {
			if (
				typeof local_value === "object" &&
				!Array.isArray(local_value)
			) {
				let nested =
					HTML.splitStaticDynamicTelestyle(local_value);
				
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
			static: static_obj,
		};
	};
}