/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 * 
 * ##### Constructor:
 * - `arg0_value`: {@link Object}
 *   - `.data_scripts`: {@link Object}
 *     - `<script_key>`: {@link string}
 *       - `.name`: {@link string}
 *       - 
 *       - `.description`: {@link string}
 *       - `.tags`: {@link Array}<{@link string}>
 *       - `.value`; {@link Object} - The JSON object that stores the current script from which to serialise/deserialise.
 *   - `.graphs`: {@link Object}
 *     - `<graph_key>`: {@link Object}
 *       - `.height`: {@link string}
 *       - `.width`: {@link string}
 *       - `.x`: {@link string}
 *       - `.y`: {@link string}
 *       - 
 *       - `.overlay_components`: {@link Array}<{@link ve.Component}>
 *       - `.symbol`: {@link Object} - Echarts bindings.
 *       - `.type`: {@link string}
 *   - `.series`: {@link Object}
 *     - `<series_key>`: {@link Object}
 *       - `.coords`: {@link Array}<{@link Array}<{@link string}, {@link number}, {@link number}>, {@link Array}<{@link string}, {@link number}, {@link number}>> - The coords/range of the series using the Spreadsheet Name for the [0] element.
 *       - `.name`: {@link string} - The name of the series, data column header value by default.
 *       - `.pivot="column"`: {@link string} - Either 'column'/'row'
 *       - `.symbol`: {@link Object} - Echarts bindings per series.
 *   - `.table_value`: {@link Object} - The ve.Table value that can be used to restore both formulas and values.
 * - `arg1_options`: {@link Object}
 *   - `.dark_mode=true`: {@link boolean}
 *
 * @type {ve.DatavisSuite}
 */
ve.DatavisSuite = class extends ve.Component { //[WIP] - Finish function body
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = (arg0_value) ? arg0_value : {};
		let options = (arg1_options) ? arg1_options : {};
			super(options);
			
		//Initialise options
		options.attributes = (options.attributes) ? options.attributes : {};
		options.dark_mode = (options.dark_mode !== undefined) ? options.dark_mode : true;
			
		//Declare local instance variables
		let topbar_button_style = { marginLeft: "var(--cell-padding)" };
		
		this.element = document.createElement("div");
			this.element.setAttribute("component", "ve-datavis-suite");
			this.element.instance = this;
			this.element.style.display = "flex";
			this.element.style.flexDirection = "column";
			this.element.style.height = "100%";
			HTML.setAttributesObject(this.element, options.attributes);
		this.options = options;
		
		this.data_scripts = (value.data_scripts) ? value.data_scripts : {};
		this.graphs = (value.graphs) ? value.graphs : {};
		this.series = (value.series) ? value.series : {};
		this.table_value = (value.table_value) ? value.table_value : {};
		
		//Populate this.components_obj here so that it can be changed piecemeal by set v()
		this.components_obj = {
			topbar_interface: new ve.RawInterface({
				edit_graph_button: new ve.Button(() => {
					this.openEditGraph();
				}, { 
					name: "Graph", style: topbar_button_style }),
				edit_series_button: new ve.Button(() => {
					this.openEditSeries();
				}, { name: "Series",
					style: topbar_button_style }),
				script_button: new ve.Button(() => {}, { name: "ScriptManager", 
					style: topbar_button_style }),
				view_button: new ve.Button(() => {}, { name: "View", 
					style: topbar_button_style })
			}),
			table: new ve.Table(this.table_value, {
				dark_mode: this.options.dark_mode,
				style: {
					flex: 1,
					height: "auto",
					padding: 0 
				}
			})
		};
		this.redraw();
	}
	
	get v () {
		//Return statement
		return {
			data_scripts: this.data_scripts,
			graphs: this.graphs,
			series: this.series,
			table_value: this.table_value
		};
	}
	
	set v (arg0_value) {
		//Convert from parameters
		let value = (arg0_value) ? arg0_value : {};
	}
	
	drawEditGraph () {
		
	}
	
	drawEditSeriesHierarchy () {
		//Declare local instance variables
		let actions_bar = new ve.HierarchyDatatype({
			create_new_series: new ve.Button(() => {
				let new_series_id = Object.generateRandomID(this.series);
				
				//Create new series and redraw hierarchy
				this.series[new_series_id] = {
					pivot: "column",
					symbol: {}
				};
				this.drawEditSeriesHierarchy();
			}, { name: "<icon>add</icon> New Series", tooltip: "Create New Series" })
		});
		let hierarchy_obj = {};
		
		//Populate hierarchy_obj based off current .series
		Object.iterate(this.series, (local_key, local_value) => { //[WIP] - Finish population function
			let series_name = this.getSeriesName(local_value);
			let table_obj =  this.components_obj.table;
			
			hierarchy_obj[local_key] = new ve.HierarchyDatatype({
				icon: new ve.HTML("<icon>legend_toggle</icon>"),
				
				delete_button: new ve.Button(() => {
					new ve.Confirm(`Are you sure you wish to delete ${series_name}?`, {
						special_function: () => {
							delete this.series[local_key];
							this.drawEditSeriesHierarchy();
						}
					});
				}, {
					name: "<icon>delete</icon>",
					tooltip: "Delete Series",
					style: {
						marginLeft: "auto",
						order: 100
					}
				}),
				context_menu_button: new ve.Button(() => {
					if (this.edit_series_window) this.edit_series_window.close();
					
					this.edit_series_window = new ve.Window({
						range_information: new ve.HTML(() => `Series Range: ${table_obj.getRangeName(local_value.coords)}`),
						range_selection: new ve.RawInterface({
							clear_range: new ve.Button(() => {
								delete local_value.coords;
								this.drawEditSeriesHierarchy();
								
								veToast(`Cleared selected series range.`);
							}, { name: "Clear Range", limit: () => local_value.coords }),
							select_series_range: new ve.Button(() => {
								this.components_obj.table.setSelectedRange(local_value.coords[0], local_value.coords[1]);
							}, { name: "Select Series Range", limit: () => local_value.coords }),
							set_series_range: new ve.Button(() => {
								try {
									local_value.coords = this.components_obj.table.getSelectedRange();
									this.drawEditSeriesHierarchy();
									
									veToast(`New series range set.`);
								} catch (e) { console.error(e); }
							}, { name: "Set Series Range" })
						})
					}, {
						name: `Edit ${series_name}`,
						can_rename: false,
						width: "30rem"
					});
				}, { 
					name: "<icon>more_vert</icon>",
					tooltip: "Modify Series",
					style: {
						order: 101
					}
				})
			}, {
				name: series_name,
				name_options: {
					onuserchange: (v) => {
						local_value.name = v;
					}
				}
			});
		});
		
		//Declare new_hierarchy and push it to this.series_window.hierarchy if possible
		let new_hierarchy = new ve.Hierarchy({
			actions_bar: actions_bar,
			...hierarchy_obj
		});
		
		if (this.series_window) {
			this.series_window.hierarchy.element.innerHTML = "";
			this.series_window.hierarchy.element.appendChild(new_hierarchy.element);
		}
		
		//Return statement
		return new_hierarchy;
	}
	
	getSeriesName (arg0_series_obj) {
		//Convert from parameters
		let series_obj = (arg0_series_obj) ? arg0_series_obj : {};
		
		//Declare local instance variables
		let series_name = "New Series";
			if (!series_obj.name) {
				if (series_obj.coords)
					//The series_name is located in the top left of the current range
					series_name = this.components_obj.table.getCellData(...series_obj.coords[0])?.v;
				if (series_name === undefined || series_name.length === 0)
					series_name = "New Series";
			} else {
				series_name = series_obj.name;
			}
			
		//Return statement
		return series_name;
	}
	
	openEditGraph () {
		//Close this.graph_window if already open
		if (this.graph_window) this.graph_window.close();
		
		//Open this.graph_window with controls on the left and visualisation on the right
		this.graph_window = new ve.Window({
			container: new ve.RawInterface({
				graph_options: new ve.HTML("Loading ..", {
					style: {
						width: "50%"
					}
				}),
				graph: new ve.RawInterface({}, {
					style: {
						width: "50%"
					}
				})
			})
		}, {
			name: "Edit Graph",
			can_rename: false,
			width: "30rem"
		});
		this.drawEditGraph();
	}
	
	openEditSeries () {
		//Close this.series_window if already open
		if (this.series_window) this.series_window.close();
		
		//Open this.series_window
		this.series_window = new ve.Window({ //Use ve.Hierarchy for list creation
			hierarchy: new ve.HTML("Loading ..", { style: { padding: 0 } })
		}, { 
			name: "Data Series", 
			can_rename: false,
			width: "30rem"
		});
		this.drawEditSeriesHierarchy();
	}
	
	openScriptManager () {
		
	}
	
	redraw () {
		//Reset HTML, then rebind all this.components_obj
		//this.element.innerHTML = "";
		Object.iterate(this.components_obj, (local_key, local_value) => local_value.bind(this.element));
	}
};