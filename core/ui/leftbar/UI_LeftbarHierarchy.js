global.UI_LeftbarHierarchy = class { //[WIP] - Finish naissance.Feature first
	static instances = [];
	static refresh_frame = false;
	
	constructor () {
		this.groups = {};
		this.hierarchy_obj = {};
		this.items = {};
		this.value = new ve.HTML("Loading ..", {
			attributes: {
				"naissance-ui": "LeftbarHierarchy"
			},
			style: { padding: 0 }
		});
		this.refresh();
		this._attachDelegatedEvents();
		
		UI_LeftbarHierarchy.instances.push(this);
	}
	
	_applySelectionClasses () {
		let all_hierarchy_els = this.hierarchy.element.querySelectorAll("li[component='ve-hierarchy-datatype']");
		
		for (let i = 0; i < all_hierarchy_els.length; i++) {
			let local_instance = all_hierarchy_els[i]?.instance?.options?.instance;
			let local_value = all_hierarchy_els[i]?.instance;
			
			if (local_instance) {
				(main.brush?.selected_feature?.id === local_instance.id) ?
					local_value.element.classList.add("naissance-selected-feature") :
					local_value.element.classList.remove("naissance-selected-feature");
			}
		}
	}
	
	_attachDelegatedEvents () {
		//Single delegated click handler on root element — survives DOM diffs
		this.value.element.addEventListener("click", (e) => {
			if (document.querySelector(`button:hover, input:focus, [component="ve-button"]:hover`)) return;
			
			let contentEl = e.target.closest(".nst-content");
			if (!contentEl) return;
			
			let datatypeEl = contentEl.closest("li[component='ve-hierarchy-datatype']");
			if (!datatypeEl) return;
			
			let local_instance = datatypeEl?.instance?.options?.instance;
			if (!local_instance) return;
			
			if (local_instance instanceof naissance.Feature && local_instance.entities !== undefined) {
				DALS.Timeline.parseAction({
					options: { name: "Select Feature", key: "select_feature" },
					value: [{ type: "Brush", select_feature_id: local_instance.id }]
				});
			} else {
				//Selection logic for naissance.Geometry
				let already_selected = (main.brush.selected_geometry?.id === local_instance.id);
				
				if (!already_selected) {
					if (!HTML.ctrl_pressed) {
						DALS.Timeline.parseAction({
							options: { name: "Select Geometry", key: "select_geometry" },
							value: [{ type: "Brush", select_geometry_id: local_instance.id }]
						});
					} else {
						local_instance.selected = (!local_instance.selected);
					}
				}
				//Deselect if already selected
				else {
					DALS.Timeline.parseAction({
						options: { name: "Deselect Geometry", key: "deselect_geometry" },
						value: [{ type: "Brush", select_geometry_id: false }]
					});
				}
			}
		});
	}
	
	_getScrollContainer () {
		return this.value.element.querySelector(".ui-leftbar-hierarchy") || this.value.element;
	}
	
	_restoreScrollState () {
		requestAnimationFrame(() => {
			let container = this._getScrollContainer();
			if (container) container.scrollTop = this._savedScrollTop || 0;
			
			//Restore nested scrolls
			if (this._savedNestedScrolls?.size) {
				let allOls = this.value.element.querySelectorAll("ol");
				
				for (let i = 0; i < allOls.length; i++) {
					let parentLi = allOls[i].closest("li[component='ve-hierarchy-datatype']");
					let key = parentLi?.instance?.options?.instance?.id;
					
					if (key && this._savedNestedScrolls.has(key))
						allOls[i].scrollTop = this._savedNestedScrolls.get(key);
				}
			}
		});
	}
	
	_saveScrollState () {
		let container = this._getScrollContainer();
		this._savedScrollTop = container ? container.scrollTop : 0;
		
		//Also save any nested scrollable OL containers
		this._savedNestedScrolls = new Map();
		let scrollables = this.value.element.querySelectorAll("ol");
		
		for (let i = 0; i < scrollables.length; i++) {
			if (scrollables[i].scrollTop > 0) {
				let parentLi = scrollables[i].closest("li[component='ve-hierarchy-datatype']");
				let key = parentLi?.instance?.options?.instance?.id;
				
				if (key) this._savedNestedScrolls.set(key, scrollables[i].scrollTop);
			}
		}
	}
	
	drawFeatures () {
		//Iterate over all naissance.FeatureGroups/naissance.FeatureLayers and render them recursively
		for (let i = 0; i < naissance.Feature.instances.length; i++) {
			let local_feature = naissance.Feature.instances[i];
			
			if (!local_feature.parent)
				this.hierarchy_obj[`${local_feature.class_name}-${local_feature.id}`] = local_feature.drawHierarchyDatatype();
		}
	}
	
	drawGeometries () {
		//Iterate over all naissance.Geometries and render them at base
		for (let i = 0; i < naissance.Geometry.instances.length; i++) {
			let local_geometry = naissance.Geometry.instances[i];
			
			if (!local_geometry.parent && local_geometry.drawHierarchyDatatype)
				this.hierarchy_obj[`${local_geometry.class_name}-${local_geometry.id}`] = local_geometry.drawHierarchyDatatype();
		}
	}
	
	drawHierarchy () {
		let actions_bar = new ve.HierarchyDatatype({
			create_new_group: new ve.Button(() => {
				let feature_id = Class.generateRandomID(naissance.Feature);
				DALS.Timeline.parseAction({
					options: { name: "Create Group", key: "create_group" },
					value: [{ type: "FeatureGroup", create_group: { id: feature_id } }]
				});
			}, { name: "<icon>create_new_folder</icon>", tooltip: "Create New Group" }),
			create_new_layer: new ve.Button(() => {
				let feature_id = Class.generateRandomID(naissance.Feature);
				DALS.Timeline.parseAction({
					options: { name: "Create Layer", key: "create_layer" },
					value: [{ type: "FeatureLayer", create_layer: { id: feature_id } }]
				});
			}, { name: "<icon>layers</icon>", tooltip: "Create New Layer" }),
			create_new_sketch_map: new ve.Button(() => {
				let feature_id = Class.generateRandomID(naissance.Feature);
				DALS.Timeline.parseAction({
					options: { name: "Create Sketch Map", key: "create_sketch_map" },
					value: [{ type: "FeatureSketchMap", create_sketch_map: { id: feature_id } }]
				});
			}, { name: "<icon>app_registration</icon>", tooltip: "Create New Sketch Map" }),
			create_new_tile_layer: new ve.Button(() => {
				let feature_id = Class.generateRandomID(naissance.Feature);
				DALS.Timeline.parseAction({
					options: { name: "Create Tile Layer", key: "create_tile_layer" },
					value: [{ type: "FeatureTileLayer", create_tile_layer: { id: feature_id } }]
				});
			}, { name: "<icon>view_module</icon>", tooltip: "Create New Tile Layer" })
		}, {
			attributes: {
				"ve-hierarchy-actions-bar": "true",
				"ve-sticky": "true"
			},
			disabled: true,
			style: {
				listStyle: "none",
				".nst-handle": { display: "none" },
				".nst-content": {
					paddingRight: 0
				}
			}
		});
		actions_bar.element.classList.add("actions-bar");
		let geometries_at_top = (global?.main?.settings?.hierarchy_ordering === "geometries_at_top");
		
		this.hierarchy_obj = {};
		if (!geometries_at_top) {
			this.drawFeatures();
			this.drawGeometries();
		} else {
			this.drawGeometries();
			this.drawFeatures();
		}
		
		//Init pattern for top actions bar, since it is being manually moved out in UI_Leftbar
		let current_hierarchy = new ve.Hierarchy({
			actions_bar: actions_bar,
			...this.hierarchy_obj
		}, {
			attributes: { class: "ui-leftbar-hierarchy" },
			onuserchange: (v, e) => {
				let allow_reassignment = [true, undefined];
				let instance = e.on_stop_data.movedNode?.instance?.options?.instance;
				let old_parent = e.on_stop_data.originalParentItem?.instance?.options?.instance;
				let new_parent = e.on_stop_data.newParentItem?.instance?.options?.instance;
				
				//1. Check if allow_reassignment[0] is true
				{
					//1.1. Fetch all_child_els class names that may forbid nesting
					let all_child_els = e.on_stop_data.movedNode.querySelectorAll("li[component='ve-hierarchy-datatype']");
					let cannot_nest_class_names = [];
					
					//Make sure that instances cannot be directly nested if disallowed
					if (!instance)
						console.warn(`UI_LeftbarHierarchy: .options.instance is not defined. Are you sure that the class name associated with`, e.on_stop_data.movedNode, `has a defined .options.instance in its drawHierarchyDatatype()?`);
					
					//Populate cannot_nested_class_names
					if (instance.cannot_nest_self)
						if (!cannot_nest_class_names.includes(instance.class_name))
							cannot_nest_class_names.push(instance.class_name);
					for (let i = 0; i < all_child_els.length; i++) {
						let local_instance = all_child_els[i].instance.options.instance;
						
						if (local_instance && !cannot_nest_class_names.includes(local_instance.class_name))
							if (local_instance.cannot_nest_self)
								cannot_nest_class_names.push(local_instance.class_name);
					}
					
					//1.2. Check if reassignment is allowed, or if it violates self-nesting rules
					let all_parent_els = HTML.getAllParentElements(e.on_stop_data.movedNode);
					
					//Iterate over all_parent_els in reverse to check if the same class_name is up the tree
					for (let i = all_parent_els.length - 1; i >= 0; i--)
						if (all_parent_els[i].getAttribute("component") === "ve-hierarchy-datatype") {
							let local_instance = all_parent_els[i].instance.options.instance;
							
							if (cannot_nest_class_names.includes(local_instance.class_name))
								allow_reassignment = [false, local_instance.class_name];
						}
				}
				
				//2. Check if user is attempting to drag it before the control element
				let all_sibling_li_els = e.on_stop_data.movedNode.parentElement.children;
				
				for (let i = 0; i < all_sibling_li_els.length; i++)
					if (all_sibling_li_els[i].classList.contains("actions-bar"))
						if (i > 0) {
							veToast(`You cannot drag an item before the actions bar.`);
							this.refresh();
							return;
						}
				
				//3. If reassignment is allowed, reassign the present entity to its new group
				if (allow_reassignment[0]) {
					//3.1. Remove from the .entities of any old naissance.Feature that contains it
					for (let i = 0; i < naissance.Feature.instances.length; i++) {
						let local_feature = naissance.Feature.instances[i];
						
						if (local_feature.entities)
							for (let x = local_feature.entities.length - 1; x >= 0; x--)
								if (local_feature.entities[x].class_name === instance.class_name && local_feature.entities[x].id === instance.id)
									local_feature.entities.splice(x, 1);
					}
					
					//3.2. Handle Root/Parent assignment and Sorting
					if (new_parent && new_parent.entities) {
						let new_parent_entity_els = e.on_stop_data.newParentItem.querySelectorAll("ol > li[component='ve-hierarchy-datatype']");
						
						new_parent.entities = [];
						for (let i = 0; i < new_parent_entity_els.length; i++) try {
							new_parent.entities.push(new_parent_entity_els[i].instance.options.instance);
						} catch (e) { console.warn(e); }
						instance.parent = new_parent;
					} else {
						// Moved to the base level
						instance.parent = undefined;
						
						// Reorder the global instance arrays based on the new root-level DOM order
						let root_level_els = current_hierarchy.element.querySelectorAll(":scope > ol > li[component='ve-hierarchy-datatype']");
						let root_instances = Array.from(root_level_els).map(el => el.instance.options.instance);
						
						// Sort Features and Geometries globally based on their index in the visual hierarchy
						const sortFn = (a, b) => {
							let indexA = root_instances.indexOf(a);
							let indexB = root_instances.indexOf(b);
							if (indexA === -1 || indexB === -1) return 0;
							return indexA - indexB;
						};
						
						naissance.Feature.instances.sort(sortFn);
						if (naissance.Geometry?.instances) naissance.Geometry.instances.sort(sortFn);
					}
					
					this.refresh();
				} else {
					veToast(`${allow_reassignment[1]} cannot nest itself.`);
					setTimeout(() => this.refresh(), 100);
				}
				
				//3.3. Call renderer update
				main.renderer.update();
			},
			style: {
				padding: 0,
				"li.nst-item > .nst-content": {
					width: "20rem"
				},
				".nst-content .nst-button": { display: "block" },
				
				"[data-entities='0']": {
					".nst-content .nst-button": { display: "none" }
				}
			}
		});
		
		return current_hierarchy;
	}
	
	drawTopbar (arg0_hierarchy_el) {
		//Convert from parameters
		let leftbar_hierarchy_el = arg0_hierarchy_el;
		
		//Declare local instance variables
		let topbar_el = document.createElement("div");
		topbar_el.classList.add("topbar");
		
		let searchbar_el = leftbar_hierarchy_el.querySelector(`[ve-searchbar="true"]`);
			if (searchbar_el) searchbar_el.instance.bind(topbar_el);
		let actions_bar_el = leftbar_hierarchy_el.querySelector(`[ve-hierarchy-actions-bar="true"]`);
			if (actions_bar_el) topbar_el.appendChild(actions_bar_el);
		
		return topbar_el;
	}
	
	refresh () {
		//1. Save scroll state before rerender
		this._saveScrollState();
		
		//2. Build the new hierarchy
		if (this.hierarchy?.remove) this.hierarchy.remove();
		this.hierarchy_obj = {};
		
		let current_hierarchy = this.drawHierarchy();
		this.hierarchy = current_hierarchy;
		
		//3. Apply selection classes
		this._applySelectionClasses();
		
		//4. Build topbar and render
		let topbar_el = this.drawTopbar(current_hierarchy.element);
		
		this.value.element.innerHTML = "";
		this.value.element.appendChild(topbar_el);
		this.value.element.appendChild(current_hierarchy.element);
		
		//5. Restore scroll state
		this._restoreScrollState();
	}
	
	static refresh () {
		this.refresh_frame = true;
		
		if (!this.logic_loop) this.logic_loop = setInterval(() => {
			if (this.refresh_frame) {
				for (let i = 0; i < this.instances.length; i++)
					this.instances[i].refresh();
				delete this.refresh_frame;
			}
		}, 100);
	}
};