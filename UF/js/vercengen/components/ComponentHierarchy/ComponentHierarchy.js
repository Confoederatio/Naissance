/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 *
 * Hierarchy used for organising both nested and un-nested lists via item/group distinctions.
 * - Functional binding: <span color=00ffff>veHierarchy</span>().
 *
 * ##### Constructor:
 * - `arg0_components_obj`: {@link Object}<{@link ve.Component}|{@link ve.HierarchyDatatype}> - The individual items to append to the current hierarchy.
 * - `arg1_options`: {@link Object}
 *   - `.allow_disabled_reordering=false`: {@link boolean}
 *   - `.disable_searchbar=false`: {@link boolean}
 *   - `.namespace=Class.generateRandomID(ve.Hierarchy)`: {@link string}
 *   - `.onitemchange`: {@link function}(v:{@link Object}, e:{ item_el:{@link HTMLElement}, old_parent_el:{@link HTMLElement}, old_parent_order:{@link Array}<{@link HTMLElement}>, new_parent_el:{@link HTMLElement}, new_parent_order:{@link Array}<{@link HTMLElement}> })
 *   - `.searchbar_style`: {@link Object} - The Telestyle object to apply to the searchbar.
 *
 * ##### Instance:
 * - `.components_obj`: {@link Object}<{@link ve.Component}|{@link ve.HierarchyDatatype}>
 * - `.nestable`: {@link Nestable}
 * - `.v`: {@link this.components_obj} - Accessor. The current components_obj mounted to the ve.Hierarchy.
 *
 * ##### Methods:
 * - <span color=00ffff>{@link ve.Hierarchy.addItem|addItem}</span>(arg0_parent_el:{@link HTMLElement}, arg1_hierarchy_datatype:{@link ve.HierarchyDatatype})
 * - <span color=00ffff>{@link ve.Hierarchy.getHierarchyArray|getHierarchyArray}</span>(arg0_options:{flatten_object: {@link boolean} }) | {@link Object[]}
 * - <span color=00ffff>{@link ve.Hierarchy.getHierarchyObject|getHierarchyObject}</span>(arg0_options:{flatten_object: {@link boolean} }) | {@link Object}
 * - <span color=00ffff>{@link ve.Hierarchy.removeItem|removeItem}</span>(arg0_hierarchy_datatype:{@link ve.HierarchyDatatype})
 *
 * @augments ve.Component
 * @memberof ve.Component
 * @type {ve.Hierarchy}
 */
ve.Hierarchy = class extends ve.Component {
	static instances = [];
	static reserved_keys = ["element", "id", "name"];
	
	constructor (arg0_components_obj, arg1_options) {
		//Convert from parameters
		let components_obj = (arg0_components_obj) ? arg0_components_obj : {};
		let options = (arg1_options) ? arg1_options : {};
		super(options);
		
		//Initialise options
		options.attributes = (options.attributes) ? options.attributes : {};
		
		//Declare local instance variables
		this.element = document.createElement("div");
		this.element.setAttribute("component", "ve-hierarchy");
		Object.iterate(options.attributes, (local_key, local_value) =>
			this.element.setAttribute(local_key, local_value.toString()));
		this.element.instance = this;
		this.options = options;
		
		//Append components_obj to this.element
		this.v = components_obj;
		ve.Hierarchy.instances.push(this);
	}
	
	/**
	 * Returns the current {@link this.components_obj}.
	 * - Accessor of {@link ve.Hierarchy}
	 *
	 * @alias v
	 * @memberof ve.Component.ve.Hierarchy
	 * @type {ve.Component[]}
	 */
	get v () {
		//Return statement
		return this.components_obj;
	}
	
	/**
	 * Sets the current {@link this.components_obj} displayed in the hierarchy.
	 * - Accessor of {@link ve.Hierarchy}
	 *
	 * @alias v
	 * @memberof ve.Component.ve.Hierarchy
	 * @param arg0_components_obj {ve.Component[]}
	 */
	set v (arg0_components_obj) {
		//Convert from parameters
		this.components_obj = arg0_components_obj;
		
		//Diff .v state
		{
			//Save current scroll positions before rendering updates
			this._saveScrollState();
			
			//Destroy Nestable before modifying any DOM nodes or parent structures
			if (this.nestable && typeof this.nestable.destroy === "function") {
				try {
					this.nestable.destroy();
				} catch (e) {
					console.warn("Error destroying previous Nestable instance: ", e);
				}
				delete this.nestable;
			}
			
			//Deconflict searchbar
			if (!this.options.disable_searchbar) {
				let searchbar_el = this.element.querySelector('[ve-searchbar="true"]');
				
				if (!searchbar_el || !this.searchbar_interface) {
					this.searchbar_interface = new ve.RawInterface({
						searchbar_icon: new ve.HTML("<icon>search</icon>", { style: { padding: `var(--cell-padding)` } }),
						searchbar_input: new ve.Datalist({
							
						}, {
							attributes: {
								placeholder: loc("ve.registry.localisation.Hierarchy_search_for_item")
							},
							name: " ",
							onuserchange: (v) => {
								this.updateSearchFilter(v);
							}
						})
					}, {
						name: " ",
						attributes: {
							"ve-searchbar": "true",
							"ve-sticky": "true"
						},
						style: this.options.searchbar_style
					});
					
					if (searchbar_el) {
						searchbar_el.remove();
					}
					this.searchbar_interface.bind(this.element);
				} else {
					// Keep existing searchbar at the very top of container
					if (this.element.firstChild !== searchbar_el) {
						this.element.insertBefore(searchbar_el, this.element.firstChild);
					}
				}
			} else {
				let searchbar_el = this.element.querySelector('[ve-searchbar="true"]');
				if (searchbar_el) {
					searchbar_el.remove();
				}
				this.searchbar_interface = null;
			}
			
			//Deconflict all non-hierarchy datatype components
			let expected_non_hierarchy_els = [];
			Object.iterate(this.components_obj, (local_key, local_value) => {
				if (!local_value.is_vercengen_hierarchy_datatype) {
					let elem = ve.Component.getElement(local_value);
					if (elem) {
						expected_non_hierarchy_els.push(elem);
					}
				}
			});
			
			//Deconflict redundant root-level components we explicitly manage
			let existing_children = Array.from(this.element.children);
			for (let i = 0; i < existing_children.length; i++) {
				let child = existing_children[i];
				
				//Guard: skip searchbar, root list, and any non-component node
				if (child.getAttribute("ve-searchbar") === "true") continue;
				if (child.tagName === "OL") continue;
				if (!child.hasAttribute("component")) continue;
				
				//Only remove managed components that are no longer expected
				if (!expected_non_hierarchy_els.includes(child))
					child.remove();
			}
			
			//Order elements right after searchbar dynamically
			let reference_node = this.element.querySelector('[ve-searchbar="true"]') ?
				this.element.querySelector('[ve-searchbar="true"]').nextSibling :
				this.element.firstChild;
			
			//Iterate over expected_non_hierarchy_els
			for (let i = 0; i < expected_non_hierarchy_els.length; i++) {
				let local_el = expected_non_hierarchy_els[i];
				
				if (local_el.parentElement !== this.element) {
					this.element.insertBefore(local_el, reference_node);
				} else if (local_el !== reference_node) {
					this.element.insertBefore(local_el, reference_node);
				}
				reference_node = local_el.nextSibling;
			}
			
			//Deconflict hierarchy datatype components inside root
			let ol_el = this.element.querySelector("ol.ve-hierarchy");
			if (!ol_el) {
				ol_el = document.createElement("ol");
				ol_el.id = (this.options.namespace) ?
					this.options.namespace : Class.generateRandomID(ve.Hierarchy);
				ol_el.setAttribute("class", "list ve-drag-disabled ve-hierarchy");
				this.element.appendChild(ol_el);
			}
			
			let expected_hierarchy_els = [];
			Object.iterate(this.components_obj, (local_key, local_value) => {
				if (local_value.is_vercengen_hierarchy_datatype) {
					let elem = ve.Component.getElement(local_value);
					if (elem) {
						expected_hierarchy_els.push(elem);
					}
				}
			});
			
			//Remove items that are no longer part of our incoming collection
			let existing_hierarchy_li_els = Array.from(ol_el.children);
			for (let i = 0; i < existing_hierarchy_li_els.length; i++) {
				let li = existing_hierarchy_li_els[i];
				if (!expected_hierarchy_els.includes(li)) {
					li.remove();
				}
			}
			
			//Safely order and insert hierarchy datatype elements in root OL
			let ol_ref_node = ol_el.firstChild;
			for (let i = 0; i < expected_hierarchy_els.length; i++) {
				let elem = expected_hierarchy_els[i];
				if (elem.parentElement !== ol_el) {
					ol_el.insertBefore(elem, ol_ref_node);
				} else if (elem !== ol_ref_node) {
					ol_el.insertBefore(elem, ol_ref_node);
				}
				ol_ref_node = elem.nextSibling;
			}
			
			//Ensure list is structurally placed at bottom level
			if (ol_el.parentElement !== this.element) {
				this.element.appendChild(ol_el);
			} else if (this.element.lastChild !== ol_el) {
				this.element.appendChild(ol_el);
			}
			
			//Reinstantiate Nestable instance safely after DOM has finished restructuring
			this.nestable = new Nestable(ol_el, { items: ".group, .item" });
			this.nestable.on("stop", (e) => {
				if (!this.options.allow_disabled_ordering)
					this._handleDisabledOrdering(e);
				
				//Fire onitemchange if direct parent changed
				if (this.options.onitemchange) {
					let child_selector = `:scope > ol > [component="ve-hierarchy-datatype"]`;
					let old_parent_order = [];
					if (e.originalParentItem)
						old_parent_order = e.originalParentItem.querySelectorAll(child_selector);
					let new_parent_order = [];
					if (e.newParentItem)
						new_parent_order = e.newParentItem.querySelectorAll(child_selector);
					
					this.options.onitemchange(this.v, {
						item_el: e.movedNode,
						old_parent_el: e.originalParentItem,
						old_parent_order,
						new_parent_el: e.newParentItem,
						new_parent_order,
					});
				}
				
				this.on_stop_data = e;
				this.fireToBinding();
			});
		}
		
		//Fire from binding, then restore scroll state
		this.fireFromBinding();
		this._restoreScrollState();
	}
	
	/**
	 * Restores previously saved scroll positions of this hierarchy.
	 * - Private method of: {@link ve.Hierarchy}
	 *
	 * @alias _restoreScrollState
	 * @memberof ve.Component.ve.Hierarchy
	 */
	_restoreScrollState () {
		requestAnimationFrame(() => {
			if (this.element) {
				this.element.scrollTop = this._savedScrollTop || 0;
				let ol_el = this.element.querySelector("ol");
				if (ol_el && this._savedOlScrollTop) {
					ol_el.scrollTop = this._savedOlScrollTop;
				}
			}
			
			// Restore individual sub-lists' positions matching relative parent key
			if (this._savedNestedScrolls?.size && this.element) {
				let allOls = this.element.querySelectorAll("ol");
				for (let i = 0; i < allOls.length; i++) {
					let parentLi = allOls[i].closest("li[component='ve-hierarchy-datatype']");
					let key = parentLi?.instance?.id || parentLi?.id;
					if (key && this._savedNestedScrolls.has(key)) {
						allOls[i].scrollTop = this._savedNestedScrolls.get(key);
					}
				}
			}
		});
	}
	
	/**
	 * Saves top scroll positions of this hierarchy element and children list containers.
	 * - Private method of: {@link ve.Hierarchy}
	 *
	 * @alias _saveScrollState
	 * @memberof ve.Component.ve.Hierarchy
	 */
	_saveScrollState () {
		this._savedScrollTop = this.element ? this.element.scrollTop : 0;
		
		let ol_el = this.element ? this.element.querySelector("ol") : null;
		this._savedOlScrollTop = ol_el ? ol_el.scrollTop : 0;
		
		this._savedNestedScrolls = new Map();
		if (this.element) {
			let scrollables = this.element.querySelectorAll("ol");
			for (let i = 0; i < scrollables.length; i++) {
				if (scrollables[i].scrollTop > 0) {
					let parentLi = scrollables[i].closest("li[component='ve-hierarchy-datatype']");
					let key = parentLi?.instance?.id || parentLi?.id;
					if (key) {
						this._savedNestedScrolls.set(key, scrollables[i].scrollTop);
					}
				}
			}
		}
	}
	
	/**
	 * Prevents placing items before disabled elements.
	 * - Private method of: {@link ve.Hierarchy}
	 *
	 * @alias _handleDisabledOrdering
	 * @memberof ve.Component.ve.Hierarchy
	 * @param {Object} arg0_e
	 */
	_handleDisabledOrdering (arg0_e) {
		//Convert from parameters
		let e = arg0_e;
		
		//Declare local instance variables
		let moved_node = e.movedNode;
		if (!moved_node) return; //Internal guard clause if there is no moved node
		let parent_list = moved_node.parentElement;
		if (!parent_list || parent_list.tagName !== "OL") return; //Internal guard clause if not moved and nested
		let siblings = Array.from(parent_list.children);
		
		let disabled = siblings.filter((local_el) =>
			local_el !== moved_node && (local_el.classList.contains("ve-drag-disabled") || local_el.dataset.nestableDisabled === "disabled"));
		if (!disabled.length) return; //Internal guard clause if there are no disabled elements
		let first_disabled_index = siblings.indexOf(disabled[0]);
		let moved_index = siblings.indexOf(moved_node);
		
		//If moved before disabled, move after last disabled
		if (moved_index < first_disabled_index) {
			let lastDisabled = disabled[disabled.length - 1];
			parent_list.insertBefore(moved_node, lastDisabled.nextSibling);
			
			veToast(`<icon>warning</icon> You cannot move an element before a disabled element.`);
		}
	}
	
	/**
	 * Appends the associated hierarchy datatype to the hierarchy.
	 * - Method of: {@link ve.Hierarchy}
	 *
	 * @alias addItem
	 * @memberof ve.Component.ve.Hierarchy
	 *
	 * @param {HTMLElement} arg0_parent_el
	 * @param {ve.HierarchyDatatype} arg1_hierarchy_datatype
	 */
	addItem (arg0_parent_el, arg1_hierarchy_datatype) {
		//Convert from parameters
		let parent_el = (arg0_parent_el) ? arg0_parent_el : this.element.querySelector("ol");
		let hierarchy_datatype = arg1_hierarchy_datatype;
		
		//Append child
		if (typeof parent_el === "string") parent_el = this.element.querySelector(parent_el);
		if (parent_el)
			parent_el.appendChild(hierarchy_datatype.element);
	}
	
	/**
	 * Returns a flat array representative of the items in the hierarchy, ordered top to bottom.
	 * - Method of: {@link ve.Hierarchy}
	 *
	 * @alias getHierarchyArray
	 * @memberof ve.Component.ve.Hierarchy
	 *
	 * @param {Object} [arg0_options]
	 *  @param {boolean} [arg0_options.flatten_object=false] - Whether the object should be flattened, returning only serialisable JSON keys.
	 *
	 * @returns {Object[]}
	 */
	getHierarchyArray (arg0_options) {
		//Convert from parameters
		let options = arg0_options ? arg0_options : {};
		
		//Declare local instance variables
		let ol_el = this.element.querySelector("ol");
		let reserved_keys = ["id", "element", "instance", "name", "type", "reserved_keys"];
		let result = [];
		
		/**
		 * Recursive helper to traverse the DOM tree top-to-bottom.
		 *
		 * @param {HTMLElement} current_ol - The <ol> element to traverse
		 */
		let traverse = (current_ol) => {
			// Get only direct LI children to maintain correct hierarchy order
			let children = Array.from(current_ol.children).filter((local_el) =>
				local_el.tagName === "LI");
			
			//Iterate over all children
			for (let i = 0; i < children.length; i++) {
				let li_el = children[i];
				let sub_ol = li_el.querySelector("ol");
				
				//Extract metadata (matching getHierarchyObject logic)
				let local_name = (li_el && li_el.instance && li_el.instance.name)
					? li_el.instance.name : "";
				//Determine if this is a group (has children) or a leaf item
				let type = sub_ol ? "group" : "item";
				
				result.push({
					id: li_el.id,
					element: (!options.flatten_object) ? li_el : undefined,
					instance: li_el.instance,
					name: local_name ? local_name : undefined,
					reserved_keys: reserved_keys,
					type: type,
				});
				
				//If this item has a sub-list, recurse into it immediately (Top > Bottom)
				if (sub_ol) traverse(sub_ol);
			}
		};
		
		if (ol_el) traverse(ol_el);
		
		//Return statement
		return result;
	}
	
	/**
	 * Returns an object representative of the items in the hierarchy.
	 * - Method of: {@link ve.Hierarchy}
	 *
	 * @alias getHierarchyObject
	 * @memberof ve.Component.ve.Hierarchy
	 *
	 * @param {Object} [arg0_options]
	 *  @param {boolean} [arg0_options.flatten_object=false] - Whether the object should be flattened, returning only serialisable JSON keys.
	 *
	 * @returns {Object}
	 */
	getHierarchyObject (arg0_options) {
		//Convert from parameters
		let options = (arg0_options) ? arg0_options : {};
		
		//Declare local instance variables
		let ol_el = this.element.querySelector("ol");
		let reserved_keys = ["id", "element", "instance", "name", "type", "reserved_keys"];
		
		//Return statement
		return HTML.listToObject(ol_el, (local_el) => {
			//Declare local instance variables
			let local_name = (local_el && local_el.instance && local_el.instance.name) ?
				local_el.instance.name : "";
			
			//Return statement
			if (local_el.tagName === "OL") {
				let parent_el = local_el.parentElement;
				try {
					local_name = parent_el.instance.name;
				} catch {}
				
				return {
					id: parent_el.id,
					element: (!options.flatten_object) ? parent_el : undefined,
					instance: parent_el.instance,
					name: (local_name) ? local_name : undefined,
					reserved_keys: reserved_keys,
					type: "group"
				};
			} else if (local_el.tagName === "LI") {
				return {
					id: local_el.id,
					element: (!options.flatten_object) ? local_el : undefined,
					instance: local_el.instance,
					name: (local_name) ? local_name : undefined,
					reserved_keys: reserved_keys,
					type: "item"
				};
			}
		});
	}
	
	/**
	 * Removes the associated hierarchy datatype from the hierarchy.
	 * - Method of: {@link ve.Hierarchy}
	 *
	 * @alias removeItem
	 * @memberof ve.Component.ve.Hierarchy
	 *
	 * @param {ve.HierarchyDatatype} arg0_hierarchy_datatype
	 */
	removeItem (arg0_hierarchy_datatype) {
		//Convert from parameters
		let hierarchy_datatype = arg0_hierarchy_datatype;
		
		//Remove item
		hierarchy_datatype.remove();
	}
	
	/**
	 * Updates the current search filter based on the inputted query. Ignores `.options.disabled=true` fields, since they are likely kept at the top as action menus.
	 * - Method of: {@link ve.Hierarchy}
	 *
	 * @alias updateSearchFilter
	 * @memberof ve.Component.ve.Hierarchy
	 *
	 * @param {string} arg0_name
	 */
	updateSearchFilter (arg0_name) {
		//Convert from parameters
		let name = (arg0_name) ? arg0_name : "";
		
		//Declare local instance variables
		let all_hierarchy_datatype_els = this.element.querySelectorAll(`[component="ve-hierarchy-datatype"]`);
		
		//If name is nothing, restore visibility to all hidden results
		if (name.length === 0) {
			for (let i = 0; i < all_hierarchy_datatype_els.length; i++)
				all_hierarchy_datatype_els[i].style.display = "block";
		} else {
			let all_filtered_els = [];
			
			for (let i = 0; i < all_hierarchy_datatype_els.length; i++)
				if (all_hierarchy_datatype_els[i].instance.name.toLowerCase().trim().indexOf(name.toLowerCase().trim()) !== -1) {
					all_hierarchy_datatype_els[i].style.display = "block";
					all_filtered_els.push(all_hierarchy_datatype_els[i]);
				} else {
					all_hierarchy_datatype_els[i].style.display = "none";
				}
			
			for (let i = 0; i < all_hierarchy_datatype_els.length; i++)
				for (let x = 0; x < all_filtered_els.length; x++)
					if (all_hierarchy_datatype_els[i].contains(all_filtered_els[x]) || all_hierarchy_datatype_els[i].instance.options.disabled === true)
						all_hierarchy_datatype_els[i].style.display = "block";
		}
	}
};

//Functional binding

/**
 * @returns {ve.Hierarchy}
 */
veHierarchy = function () {
	//Return statement
	return new ve.Hierarchy(...arguments);
};