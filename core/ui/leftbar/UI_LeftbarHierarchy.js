global.UI_LeftbarHierarchy = class {
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
		
		//Persistent elements
		this.topbar_el = document.createElement("div");
		this.topbar_el.classList.add("topbar");
		this.results_el = document.createElement("div");
		this.results_el.id = "results";
		
		this.value.element.innerHTML = "";
		this.value.element.appendChild(this.topbar_el);
		
		this.hierarchy = new ve.Hierarchy({}, {
			attributes: { class: "ui-leftbar-hierarchy" },
			disable_default_search: true,
			onuserchange: (v, e) => {
				this.handleHierarchyChange(v, e);
			},
			onsearch: async (v) => {
				this.handleSearch(v);
			},
			searchbar_placeholder: "Search the map ..."
		});
		this.value.element.appendChild(this.hierarchy.element);
		
		this.value.element.appendChild(this.results_el);
		
		this.refresh();
		this.attachDelegatedEvents();
		
		UI_LeftbarHierarchy.instances.push(this);
	}
	
	applySelectionClasses () {
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
	
	attachDelegatedEvents () {
		this.value.element.addEventListener("click", (e) => {
			if (document.querySelector(`button:hover, input:focus, [component="ve-button"]:hover`)) return;
			
			let content_el = e.target.closest(".nst-content");
			if (!content_el) return;
			
			let datatype_el = content_el.closest("li[component='ve-hierarchy-datatype']");
			if (!datatype_el) return;
			
			let local_instance = datatype_el?.instance?.options?.instance;
			if (!local_instance) return;
			
			if (local_instance instanceof naissance.Feature && local_instance.entities !== undefined) {
				DALS.Timeline.parseAction("select_feature", [{ type: "Brush", select_feature_id: local_instance.id }]);
			} else {
				let already_selected = (main.brush.selected_geometry?.id === local_instance.id);
				
				if (!already_selected) {
					(!HTML.ctrl_pressed) ?
						DALS.Timeline.parseAction("select_geometry", [{ type: "Brush", select_geometry_id: local_instance.id }]) :
						(local_instance.selected = !local_instance.selected);
				} else {
					DALS.Timeline.parseAction("deselect_geometry", [{ type: "Brush", select_geometry_id: false }]);
				}
			}
		});
	}
	
	handleHierarchyChange (v, e) {
		let allow_reassignment = [true, undefined];
		let instance = e.on_stop_data.movedNode?.instance?.options?.instance;
		let new_parent = e.on_stop_data.newParentItem?.instance?.options?.instance;
		
		let all_child_els = e.on_stop_data.movedNode.querySelectorAll("li[component='ve-hierarchy-datatype']");
		let cannot_nest_class_names = [];
		
		if (instance.cannot_nest_self) cannot_nest_class_names.push(instance.class_name);
		for (let i = 0; i < all_child_els.length; i++) {
			let local_child_instance = all_child_els[i].instance.options.instance;
			if (local_child_instance?.cannot_nest_self && !cannot_nest_class_names.includes(local_child_instance.class_name))
				cannot_nest_class_names.push(local_child_instance.class_name);
		}
		
		let all_parent_els = HTML.getAllParentElements(e.on_stop_data.movedNode);
		for (let i = all_parent_els.length - 1; i >= 0; i--) {
			if (all_parent_els[i].getAttribute("component") === "ve-hierarchy-datatype") {
				let local_parent_instance = all_parent_els[i].instance.options.instance;
				if (cannot_nest_class_names.includes(local_parent_instance.class_name))
					allow_reassignment = [false, local_parent_instance.class_name];
			}
		}
		
		let all_sibling_li_els = e.on_stop_data.movedNode.parentElement.children;
		for (let i = 0; i < all_sibling_li_els.length; i++) {
			if (all_sibling_li_els[i].classList.contains("actions-bar") && i > 0) {
				veToast(`You cannot drag an item before the actions bar.`);
				this.refresh();
				return;
			}
		}
		
		if (allow_reassignment[0]) {
			Object.iterate(naissance.Feature.instances, (local_key, local_feature) => {
				if (local_feature.entities)
					for (let i = local_feature.entities.length - 1; i >= 0; i--)
						if (local_feature.entities[i].id === instance.id)
							local_feature.entities.splice(i, 1);
			});
			
			if (new_parent && new_parent.entities) {
				let new_parent_entity_els = e.on_stop_data.newParentItem.querySelectorAll("ol > li[component='ve-hierarchy-datatype']");
				new_parent.entities = [];
				for (let i = 0; i < new_parent_entity_els.length; i++) try {
					new_parent.entities.push(new_parent_entity_els[i].instance.options.instance);
				} catch (err) { console.warn(err); }
				instance.parent = new_parent;
			} else {
				instance.parent = undefined;
				let root_level_els = this.hierarchy.element.querySelectorAll(":scope > ol > li[component='ve-hierarchy-datatype']");
				let root_instances = Array.from(root_level_els).map(el => el.instance.options.instance);
				
				let sort_fn = (a, b) => (root_instances.indexOf(a) - root_instances.indexOf(b));
				
				let sorted_features = Object.values(naissance.Feature.instances).sort(sort_fn);
				let new_feature_map = {};
				for (let i = 0; i < sorted_features.length; i++) new_feature_map[sorted_features[i].id] = sorted_features[i];
				naissance.Feature.instances = new_feature_map;
				
				if (naissance.Geometry?.instances) {
					let sorted_geoms = Object.values(naissance.Geometry.instances).sort(sort_fn);
					let new_geom_map = {};
					for (let i = 0; i < sorted_geoms.length; i++) new_geom_map[sorted_geoms[i].id] = sorted_geoms[i];
					naissance.Geometry.instances = new_geom_map;
				}
			}
			this.refresh();
		} else {
			veToast(`${allow_reassignment[1]} cannot nest itself.`);
			setTimeout(() => this.refresh(), 100);
		}
		main.renderer.update();
	}
	
	handleSearch (arg0_value) {
		//Convert from parameters
		let value = (arg0_value) ? arg0_value : "";
			value = value.trim().toLowerCase();
		
		//Declare local instance variables
		let hierarchy_obj = {};
		
		//1. OSM search handler
		if (!this.osm_search) this.osm_search = new UI_OSMSearch(undefined, {
			onprogramchange: (v, e) => {
				if (v === "") {
					delete UI_LeftbarHierarchy.do_not_refresh;
					UI_Leftbar.refresh();
				} else {
					this.hierarchy.element.prepend(e.element);
				}
			}
		});
		this.osm_search.v = value;
		
		//2. Clear default hierarchy search
		let all_hierarchy_datatype_els = this.hierarchy.element.querySelectorAll("[component='ve-hierarchy-datatype']");
		let all_result_els = this.hierarchy.element.querySelectorAll("[data-is-search]");
		
		for (let i = 0; i < all_hierarchy_datatype_els.length; i++)
			all_hierarchy_datatype_els[i].style.display = "none";
		for (let i = 0; i < all_result_els.length; i++)
			all_result_els[i].remove();
		
		//If name is nothing, restore visibility to all hidden results, and move temporarily appended results
		this.results_el.innerHTML = "";
		
		if (value.length === 0) {
			delete UI_LeftbarHierarchy.do_not_refresh;
			UI_Leftbar.refresh();
		} else {
			let checkEntity = (local_entity) => {
				//Declare local instance variables
				let all_names = (typeof local_entity.getAllNames === "function") ? 
					local_entity.getAllNames().join(", ") : local_entity.name;
				all_names = all_names.trim().toLowerCase();
				
				//Return statement
				if (all_names.includes(value)) return true;
			};
			
			//Feature search
			Object.iterate(naissance.Feature.instances, (local_key, local_value) => {
				if (checkEntity(local_value))
					hierarchy_obj[local_value.id] = local_value.drawHierarchyDatatype({ is_search: true });
			});
			//Geometry search
			Object.iterate(naissance.Geometry.instances, (local_key, local_value) => {
				if (checkEntity(local_value))
					hierarchy_obj[local_value.id] = local_value.drawHierarchyDatatype({ is_search: true });
			});
			
			//Append matches to this.results_el
			Object.iterate(hierarchy_obj, (local_key, local_value) =>
				this.hierarchy.element.appendChild(local_value.element));
		}
	}
	
	drawFeatures () {
		Object.iterate(naissance.Feature.instances, (local_key, local_feature) => {
			if (!local_feature.parent)
				this.hierarchy_obj[`${local_feature.class_name}-${local_feature.id}`] = local_feature.drawHierarchyDatatype();
		});
	}
	
	drawGeometries () {
		Object.iterate(naissance.Geometry.instances, (local_key, local_geometry) => {
			if (!local_geometry.parent && local_geometry.drawHierarchyDatatype)
				this.hierarchy_obj[`${local_geometry.class_name}-${local_geometry.id}`] = local_geometry.drawHierarchyDatatype();
		});
	}
	
	drawTopbar (arg0_hierarchy_el) {
		let actions_bar_el = arg0_hierarchy_el.querySelector(`[ve-hierarchy-actions-bar="true"]`);
		let searchbar_el = arg0_hierarchy_el.querySelector(`[ve-searchbar="true"]`);
		
		// Clear topbar before re-appending to fix the duplication visual bug
		this.topbar_el.innerHTML = "";
		
		if (actions_bar_el) this.topbar_el.appendChild(actions_bar_el);
		
		let divider_el = document.createElement("hr");
		this.topbar_el.appendChild(divider_el);
		
		if (searchbar_el) searchbar_el.instance.bind(this.topbar_el);
	}
	
	refresh () {
		this.hierarchy_obj = {};
		let actions_bar = new ve.HierarchyDatatype({
			toolbox_label: veHTML("<b>Toolbox:</b>", { attributes: { class: "label" } }),
			geometries: veRawInterface({
				create_new_polygon: new ve.Button(() => { new UI_CreateGeometry("GeometryPolygon"); }, {
					attributes: { class: "add-button" },
					name: "<icon>pentagon</icon>",
					tooltip: "Create New Polygon"
				}),
				create_new_line: new ve.Button(() => { new UI_CreateGeometry("GeometryLine"); }, {
					attributes: { class: "add-button" },
					name: "<icon>polyline</icon>",
					tooltip: "Create New Line"
				}),
				create_new_point: new ve.Button(() => { new UI_CreateGeometry("GeometryPoint"); }, {
					attributes: { class: "add-button" },
					name: "<icon>location_on</icon>",
					tooltip: "Create New Point"
				}),
				line_label: veHTML("", {
					style: {
						borderLeft: "1px solid var(--body-colour)",
						height: "calc(2rem - var(--padding))",
						marginLeft: "calc(var(--padding) - var(--cell-padding))",
						marginRight: "var(--padding)",
						marginTop: "calc(var(--padding)/2)"
					}
				}),
				create_new_group: new ve.Button(() => {
					let feature_id = Class.generateRandomID(naissance.Feature);
					DALS.Timeline.parseAction("create_group", [{ type: "FeatureGroup", create_group: { id: feature_id } }]);
				}, {
					attributes: { class: "add-button" },
					name: "<icon>folder</icon>",
					tooltip: "Create New Group"
				}),
				create_new_layer: new ve.Button(() => {
					let feature_id = Class.generateRandomID(naissance.Feature);
					DALS.Timeline.parseAction("create_layer", [{ type: "FeatureLayer", create_layer: { id: feature_id } }]);
				}, {
					attributes: { class: "add-button" },
					name: "<icon>layers</icon>",
					tooltip: "Create New Layer"
				}),
				more_button: new ve.Button(() => {
					if (main.interfaces.add_other_features) main.interfaces.add_other_features.remove();
					main.interfaces.add_other_features = veWindow({
						create_new_sketch_map: new ve.Button(() => {
							let f_id = Class.generateRandomID(naissance.Feature);
							DALS.Timeline.parseAction("create_sketch_map", [{ type: "FeatureSketchMap", create_sketch_map: { id: f_id } }]);
						}, { attributes: { class: "add-button" }, name: "<icon>app_registration</icon> Create Sketch Map" }),
						create_new_tile_layer: new ve.Button(() => {
							let f_id = Class.generateRandomID(naissance.Feature);
							DALS.Timeline.parseAction("create_tile_layer", [{ type: "FeatureTileLayer", create_tile_layer: { id: f_id } }]);
						}, { attributes: { class: "add-button" }, name: "<icon>view_module</icon> Create Tile Layer" }),
					}, { can_rename: false, name: "Add Features" });
				}, { name: "<icon>add</icon> More", tooltip: "View Different Features" })
			}, { attributes: { class: "create-bar" }}),
			features: veRawInterface({})
		}, { attributes: { "ve-hierarchy-actions-bar": "true", "ve-sticky": "true" }, disabled: true });
		actions_bar.element.classList.add("actions-bar");
		
		let geometries_at_top = (global?.main?.settings?.hierarchy_ordering === "geometries_at_top");
		
		if (!geometries_at_top) {
			this.drawFeatures();
			this.drawGeometries();
		} else {
			this.drawGeometries();
			this.drawFeatures();
		}
		
		// ve.Hierarchy's 'v' setter handles scroll saving and internal diffing
		this.hierarchy.v = {
			actions_bar: actions_bar,
			...this.hierarchy_obj
		};
		
		this.drawTopbar(this.hierarchy.element);
		this.applySelectionClasses();
	}
	
	static refresh () {
		if (UI_LeftbarHierarchy.do_not_refresh) return;
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