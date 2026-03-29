/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 * 
 * DatavisSuite used for visualising data either from a {@link ve.Spreadsheet}, {@link ve.NodeEditor}, or {@link ve.ScriptManager}. Has 1-to-1 GUI bindings with Echarts and visual macro support, please read [Echarts Bindings](https://confoederatiodocs.info/CTD+(Confoederatio%2C+Technical+Division)/Documentation/Technical+(Backend)/External+Dependencies/Echarts/Echarts+Bindings) for more details. Spreadsheets support all Google Sheets and Excel formulas, but inline chart support has been removed in favour of a separate window in which multiple graphs can be composed and analysed.
 * 
 * The default file extension is `.ve-ds`.
 * - Functional binding: <span color=00ffff>veDatavisSuite</span>().
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
 *     - `<graph_key>`: {@link ve.Graph}
 *   - `.series`: {@link Object}
 *     - `<series_key>`: {@link Object}
 *       - `.coords`: {@link Array}<{@link Array}<{@link string}, {@link number}, {@link number}>, {@link Array}<{@link string}, {@link number}, {@link number}>> - The coords/range of the series using the Spreadsheet Name for the [0] element.
 *       - `.name`: {@link string} - The name of the series, data column header value by default.
 *       - `.pivot="column"`: {@link string} - Either 'column'/'row'.
 *       - `.symbol`: {@link Object} - Echarts bindings per series.
 *   - `.table_value`: {@link Object} - The ve.Spreadsheet value that can be used to restore both formulas and values.
 * - `arg1_options`: {@link Object}
 *   - `.dark_mode=true`: {@link boolean}
 *   
 * ##### Methods:
 * - <span color=00ffff>{@link ve.DatavisSuite.drawEditGraph|drawEditGraph}</span>()
 * - <span color=00ffff>{@link ve.DatavisSuite.drawEditSeriesHierarchy|drawEditSeriesHierarchy}</span>() | {@link ve.Hierarchy}
 * - <span color=00ffff>{@link ve.DatavisSuite.drawGraphs|drawGraphs}</span>(arg0_resize_only:{@link boolean})
 * - <span color=00ffff>{@link ve.DatavisSuite.getAllSeriesNames|getAllSeriesNames}</span>() | {@link Object}
 * - <span color=00ffff>{@link ve.DatavisSuite.getSeriesData|getSeriesData}</span>(arg0_series_id:{@link string}) | {@link Array}<{@link Array}<{@link Object}>>
 * - <span color=00ffff>{@link ve.DatavisSuite.getSeriesName|getSeriesName}</span>(arg0_series_obj:{@link Object}) | {@link string}
 * - <span color=00ffff>{@link ve.DatavisSuite.openEditGraph|openEditGraph}</span>()
 * - <span color=00ffff>{@link ve.DatavisSuite.openEditSeries|openEditSeries}</span>(arg0_series_obj:{@link Object})
 * - <span color=00ffff>{@link ve.DatavisSuite.openScriptManager|openEditScriptManager}</span>()
 * - <span color=00ffff>{@link ve.DatavisSuite.redraw|redraw}</span>()
 *
 * @augments ve.Component
 * @memberof ve.Component
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
					name: loc("ve.registry.localisation.DatavisSuite_graph"), style: topbar_button_style }),
				edit_series_button: new ve.Button(() => {
					this.openEditSeriesHierarchy();
				}, { name: loc("ve.registry.localisation.DatavisSuite_series"),
					style: topbar_button_style }),
				script_button: new ve.Button(() => {
					this.openScriptManager();
				}, { name: loc("ve.registry.localisation.DatavisSuite_script_manager"), 
					style: topbar_button_style }),
				view_button: new ve.Button(() => {}, { name: loc("ve.registry.localisation.DatavisSuite_view"), 
					style: topbar_button_style })
			}),
			scene_interface: new ve.RawInterface({
				file_explorer: new ve.FileExplorer(undefined, {
					style: {
						flex: "0 0 20rem",
						maxHeight: "50rem",
						overflowY: "auto"
					},
					x: 0, y: 0,
					
					load_function: (arg0_value) => this.v = arg0_value,
					save_extension: ".ve-ds",
					save_function: () => this.v
				}),
				table: new ve.Spreadsheet(this.table_value, {
					dark_mode: this.options.dark_mode,
					style: {
						height: "auto",
						flex: "1 1 auto"
					},
					x: 1, y: 0,
					
					onuserchange: (v) => {
						this.table_value = v;
						this.drawGraphs();
					}
				})
			}, {
				style: {
					display: "flex",
					flex: 1
				}
			})
		};
		this.redraw();
		
		this.table_obj = this.components_obj.scene_interface.table;
	}
	
	/**
	 * Returns the current DatavisSuite value as a JSON-compatible object.
	 * - Accessor of: {@link ve.DatavisSuite}
	 * 
	 * @alias v
	 * @memberof ve.Component.ve.DatavisSuite
	 * @type {{data_scripts: Object, graphs: Object, series: Object, table_value: Object}}
	 */
	get v () {
		//Declare local instance variables
		let graphs_obj = {};
		
		//Iterate over all graphs, populate graphs_obj
		Object.iterate(this.graphs, (local_key, local_value) => 
			graphs_obj[local_key] = {
				value: local_value.v,
				options: local_value.options
			});
		
		//Return statement
		return {
			data_scripts: this.data_scripts,
			graphs: graphs_obj,
			series: this.series,
			table_value: this.table_value
		};
	}
	
	/**
	 * Sets the current DatavisSuite value from a JSON-compatible object.
	 * - Accessor of: {@link ve.DatavisSuite}
	 * 
	 * @alias v
	 * @memberof ve.Component.ve.DatavisSuite
	 * @param {{data_scripts: Object, graphs: Object, series: Object, table_value: Object}} arg0_value
	 * @type Object
	 */
	set v (arg0_value) {
		//Convert from parameters
		let value = (arg0_value) ? arg0_value : {};
			if (typeof value === "string") value = JSON.parse(value);
		
		//Declare local instance variables
		this.data_scripts = (value.data_scripts) ? value.data_scripts : {};
		this.graphs = {};
			if (value.graphs)
				Object.iterate(value.graphs, (local_key, local_value) => this.graphs[local_key] = new ve.Graph(local_value.value, local_value.options));
		this.series = (value.series) ? value.series : {};
		this.table_value = (value.table_value) ? value.table_value : {};
		
		//1. Load data into the spreadsheet component
		//This will trigger the 'setData' logic in the Spreadsheet component to handle Univer initialization
		if (this.table_obj)
			this.table_obj.v = this.table_value;
		
		//2. Re-draw any active graphs based on the new data
		this.drawGraphs();
		
		//3. Update management windows if they are currently open
		if (this.series_window)
			this.drawEditSeriesHierarchy();
		if (this.graph_window)
			this.drawEditGraph();
	}
	
	/**
	 * Refreshes the edit graph window.
	 * - Method of: {@link ve.DatavisSuite}
	 *
	 * @alias drawEditGraph
	 * @memberof ve.Component.ve.DatavisSuite
	 */
	drawEditGraph () {
		//Declare local instance variables
		let actions_bar = new ve.HierarchyDatatype({
			create_new_graph: new ve.Button(() => {
				let new_graph_id = Object.generateRandomID(this.graphs);
				
				this.graphs[new_graph_id] = new ve.Graph();
					this.graphs[new_graph_id].options.order = Object.keys(this.graphs).length;
				this.drawEditGraph();
				
				veToast(loc("ve.registry.localisation.DatavisSuite_toast_added_chart_to_graph"));
			}, { name: "<icon>add_chart</icon>", tooltip: loc("ve.registry.localisation.DatavisSuite_tooltip_add_graph") }),
			create_new_graphlegend: new ve.Button(() => {
				
			}, { name: "<icon>format_list_bulleted</icon>", tooltip: loc("ve.registry.localisation.DatavisSuite_tooltip_add_legend") }),
			create_new_graphtext: new ve.Button(() => {
				
			}, { name: "<icon>notes</icon>", tooltip: loc("ve.registry.localisation.DatavisSuite_tooltip_add_overlay_text") })
		}, { disabled: true });
		let hierarchy_obj = {};
		
		//Declare new_hierarchy and push it to this.graph_window.container.graph_options if possible
		if (this.graph_window) {
			let graph_options = this.graph_window.container.graph_options;
			
			Object.iterate(this.graphs, (local_key, local_value) => {
				if (local_value instanceof ve.Graph) {
					let graph_name = (local_value?.options?.symbol?.title?.text) ?
						local_value.options.symbol.title.text : loc("ve.registry.localisation.DatavisSuite_new_graph")
					
					hierarchy_obj[local_key] = new ve.HierarchyDatatype({
						icon: new ve.HTML("<icon>show_chart</icon>"),
						
						delete_button: new ve.Button(() => {}, {
							name: "<icon>delete</icon>",
							tooltip: loc("ve.registry.localisation.DatavisSuite_tooltip_delete_graph"),
							style: {
								marginLeft: "auto",
								order: 100
							}
						}),
						context_menu_button: new ve.Button(() => {
							if (this.edit_graph_window) this.edit_graph_window.close();
							
							let series_names = this.getAllSeriesNames();
							let series_options = {
								onuserchange: (v) => {
									if (!this.series[v])
										veToast(`<icon>warning</icon> ${loc("ve.registry.localisation.DatavisSuite_toast_invalid_data_series")}`);
									this.assigned_series_list.fireToBinding();
								}
							};
							let series_select = new ve.Datalist(series_names, series_options);
								series_select.placeholder = series_names;
								
							let assigned_series_values = [];
								if (local_value.value.series) {
									let series_obj = local_value.value.series;
									
									Object.iterate(series_obj, (local_series_key, local_series_obj) => {
										let local_datalist = new ve.Datalist(series_names, series_options);
											local_datalist.v = series_names[local_series_key];
										assigned_series_values.push(local_datalist);
									});
								}
							
							let assigned_series_list = new ve.List((assigned_series_values.length > 0) ? assigned_series_values : [series_select], {
								name: loc("ve.registry.localisation.DatavisSuite_attached_series"),
								onuserchange: (v) => {
									local_value.value.series = {};
									
									//Iterate over all v components
									for (let i = 0; i < v.length; i++)
										local_value.addSeries(this.series[v[i].v], {
											key: v[i].v,
											table_obj: this.table_obj
										});
								},
								options: series_options 
							});
								assigned_series_list.placeholder = series_names;
								this.assigned_series_list = assigned_series_list;
							
							//All default colours handling
							let all_default_colours = [];
								if (!local_value.options.symbol.color)
									local_value.options.symbol.color = ve.Graph.getDefaultColours();
								if (local_value.options.symbol.color)
									for (let i = 0; i < local_value.options.symbol.color.length; i++)
										all_default_colours.push(new ve.Colour(local_value.options.symbol.color[i], {
											is_rgba: true
										}));
							
							this.edit_graph_window = new ve.Window({ //Add series using ve.List<ve.Datalist>
								interface: new ve.RawInterface({
									assigned_series: assigned_series_list,
									background_colour: new ve.Colour((local_value.options.symbol.backgroundColor) ? local_value.options.symbol.backgroundColor : [0, 0, 0, 0], {
										name: loc("ve.registry.localisation.DatavisSuite_background_colour"),
										is_rgba: true,
										onuserchange: (v, e) => {
											local_value.options.symbol.backgroundColor = e.getHex();
											this.drawGraphs(true);
										}
									}),
									default_colours: new ve.List(all_default_colours, {
										name: loc("ve.registry.localisation.DatavisSuite_default_colours"),
										onuserchange: (v) => {
											//Declare local instance variables
											let all_colours = [];
											
											//Iterate over all list components
											for (let i = 0; i < v.length; i++)
												all_colours.push(v[i].getHex());
											local_value.options.symbol.color = all_colours;
											this.drawGraphs(true);
										},
										placeholder: new ve.Colour([255, 255, 255, 1]),
										options: { is_rgba: true },
										style: {
											"[component='ve-colour']": { display: "block" }
										}
									}),
									
									axis_symbols: new ve.Interface({
										x_axis_symbol: new ve.DatavisSuite.AxisSymbol(local_value.options.symbol?.xAxis, {
											axis_type: "x",
											datavis_suite_obj: this,
											graph_obj: local_value,
											name: loc("ve.registry.localisation.DatavisSuite_x_axis_symbol"),
											style: { padding: 0 },
											x: 0,
											y: 0,
											
											onuserchange: (v) => {
												local_value.options.symbol.xAxis = v;
												this.drawGraphs(true);
											}
										}).interface,
										y_axis_symbol: new ve.DatavisSuite.AxisSymbol(local_value.options.symbol?.yAxis, {
											axis_type: "y",
											datavis_suite_obj: this,
											graph_obj: local_value,
											name: loc("ve.registry.localisation.DatavisSuite_y_axis_symbol"),
											style: { padding: 0 },
											x: 1,
											y: 0,
											
											onuserchange: (v) => {
												local_value.options.symbol.yAxis = v;
												this.drawGraphs(true);
											},
										}).interface,
										polar_axis_symbol: new ve.DatavisSuite.AxisSymbol_Polar(local_value.options.symbol?.polar, {
											datavis_suite_obj: this,
											graph_obj: local_value,
											name: loc("ve.registry.localisation.DatavisSuite_polar_axis_symbol"),
											style: { padding: 0 },
											x: 0,
											y: 1,
											
											onuserchange: (v) => {
												local_value.options.symbol.polar = v;
												this.drawGraphs(true);
											}
										}).interface
									}, {
										name: loc("ve.registry.localisation.DatavisSuite_axis_symbols")
									}),
									text_symbol: new ve.DatavisSuite.TextSymbol(local_value.options.symbol?.textStyle, {
										name: loc("ve.registry.localisation.DatavisSuite_text_symbol"),
										onuserchange: (v) => {
											local_value.options.symbol.textStyle = v;
											this.drawGraphs(true);
										}
									}).interface,
									title_symbol: new ve.DatavisSuite.TitleSymbol(local_value.options.symbol?.title, {
										name: loc("ve.registry.localisation.DatavisSuite_title_symbol"),
										onuserchange: (v) => {
											local_value.options.symbol.title = v;
											this.drawGraphs(true);
										}
									}).interface,
									tooltip_symbol: new ve.DatavisSuite.TooltipSymbol(local_value.options.symbol?.tooltip, {
										name: loc("ve.registry.localisation.DatavisSuite_tooltip_symbol"),
										onuserchange: (v) => {
											local_value.options.symbol.tooltip = v;
											this.drawGraphs(true);
										}
									}).interface,
									visual_map: new ve.DatavisSuite.VisualMapSymbol(local_value.options.symbol?.visualMap, {
										name: loc("ve.registry.localisation.DatavisSuite_visual_map"),
										onuserchange: (v) => {
											local_value.options.symbol.visualMap = v;
											this.drawGraphs(true);
										}
									}).interface,
								})
							}, {
								name: `${loc("ve.registry.localisation.DatavisSuite_edit")} ${graph_name}`,
								can_rename: false,
								width: "30rem"
							});
						}, {
							name: "<icon>more_vert</icon>",
							tooltip: loc("ve.registry.localisation.DatavisSuite_tooltip_modify_graph"),
							style: {
								order: 101
							}
						})
					}, {
						key: local_key,
						name: graph_name,
						name_options: {
							onuserchange: (v) => {
								if (!local_value.options.symbol.title) local_value.options.symbol.title = {};
									local_value.options.symbol.title.text = v;
								local_value.draw();
							}
						}
					});
				}
			}, {
				sort_mode: {
					key: "order",
					type: "ascending"
				}
			});
			
			let new_hierarchy = new ve.Hierarchy({
				actions_bar: actions_bar,
				...hierarchy_obj
			}, {
				onuserchange: (v, e) => {
					//Declare local instance variables
					let hierarchy_array = e.getHierarchyArray();
					
					for (let i = 0; i < hierarchy_array.length; i++) try {
						this.series[hierarchy_array[i].instance.options.key].order = i;
					} catch (e) {}
				}
			});
			
			graph_options.element.innerHTML = "";
			graph_options.element.appendChild(new_hierarchy.element);
			this.drawGraphs();
		}
	}
	
	/**
	 * Refreshes the edit series window.
	 * - Method of: {@link ve.DatavisSuite}
	 *
	 * @alias drawEditSeriesHierarchy
	 * @memberof ve.Component.ve.DatavisSuite
	 * 
	 * @returns {ve.Hierarchy}
	 */
	drawEditSeriesHierarchy () {
		let actions_bar = new ve.HierarchyDatatype({
			create_new_series: new ve.Button(() => {
				let new_series_id = Object.generateRandomID(this.series);
				
				//Create new series and redraw hierarchy
				this.series[new_series_id] = {
					coords: this.table_obj.getSelectedRange(),
					order: Object.keys(this.series).length,
					pivot: "column",
					symbol: {}
				};
				this.drawEditSeriesHierarchy();
			}, { 
				name: `<icon>add</icon> ${loc("ve.registry.localisation.DatavisSuite_new_series")}`, 
				tooltip: loc("ve.registry.localisation.DatavisSuite_tooltip_create_new_series")
			})
		}, {
			disabled: true
		});
		let hierarchy_obj = {};
		
		//Populate hierarchy_obj based off current .series
		Object.iterate(this.series, (local_key, local_value) => {
			let series_name = this.getSeriesName(local_value);
			
			hierarchy_obj[local_key] = new ve.HierarchyDatatype({
				icon: new ve.HTML("<icon>legend_toggle</icon>"),
				
				series_range: new ve.HTML(`(${this.table_obj.getRangeName(local_value.coords)})`, {
					style: { order: 1 }
				}),
				delete_button: new ve.Button(() => {
					new ve.Confirm(`${loc("ve.registry.localisation.DatavisSuite_confirm_delete_series", series_name)}`, {
						special_function: () => {
							delete this.series[local_key];
							this.drawEditSeriesHierarchy();
						}
					});
				}, {
					name: "<icon>delete</icon>",
					tooltip: loc("ve.registry.localisation.DatavisSuite_tooltip_delete_series"),
					style: {
						marginLeft: "auto",
						order: 100
					}
				}),
				context_menu_button: new ve.Button(() => {
					this.openEditSeries(local_value);
				}, { 
					name: "<icon>more_vert</icon>",
					tooltip: loc("ve.registry.localisation.DatavisSuite_tooltip_modify_series"),
					style: {
						order: 101
					}
				})
			}, {
				key: local_key,
				name: series_name,
				name_options: {
					onuserchange: (v) => {
						local_value.name = v;
					}
				}
			});
		}, {
			sort_mode: {
				key: "order",
				type: "ascending"
			}
		});
		
		//Declare new_hierarchy and push it to this.series_window.hierarchy if possible
		let new_hierarchy = new ve.Hierarchy({
			actions_bar: actions_bar,
			...hierarchy_obj
		}, {
			onuserchange: (v, e) => {
				//Declare local instance variables
				let hierarchy_array = e.getHierarchyArray();
				
				for (let i = 0; i < hierarchy_array.length; i++) try {
					this.series[hierarchy_array[i].instance.options.key].order = i;
				} catch (e) {}
			}
		});
		
		if (this.series_window) {
			this.series_window.hierarchy.element.innerHTML = "";
			this.series_window.hierarchy.element.appendChild(new_hierarchy.element);
		}
		
		//Return statement
		return new_hierarchy;
	}
	
	/**
	 * Draws graphs and attempts to update them.
	 * - Method of: {@link ve.DatavisSuite}
	 *
	 * @alias drawGraphs
	 * @memberof ve.Component.ve.DatavisSuite
	 * 
	 * @param {boolean} [arg0_resize_only=false]
	 */
	drawGraphs (arg0_resize_only) {
		//Convert from parameters
		let resize_only = arg0_resize_only;
		
		//Update graph_window if possible
		if (this.graph_window)
			if (this.graph_window.container.graph) {
				let graph_el = this.graph_window.container.graph.element;
				
				graph_el.innerHTML = "";
				Object.iterate(this.graphs, (local_key, local_value) => {
					if (!resize_only && local_value.value.series) {
						let series_obj = JSON.parse(JSON.stringify(local_value.value.series));
						
						local_value.value.series = {};
						Object.iterate(series_obj, (local_series_key, local_series_obj) =>
							local_value.addSeries(this.series[local_series_key], {
								key: local_series_key,
								table_obj: this.table_obj
							}));
					}
					
					graph_el.appendChild(local_value.element);
					setTimeout(() => local_value.draw());
				});
			}
	}
	
	/**
	 * Returns an {@link Object} of current series names.
	 * - Method of: {@link ve.DatavisSuite}
	 *
	 * @alias getAllSeriesNames
	 * @memberof ve.Component.ve.DatavisSuite
	 * 
	 * @returns {{"<series_key>": string}}
	 */
	getAllSeriesNames () {
		//Declare local instance variables
		let return_obj = {};
		
		//Iterate over this.series and populate return_obj
		Object.iterate(this.series, (local_key, local_value) =>
			return_obj[local_key] = this.getSeriesName(local_value));
		
		//Return statement
		return return_obj;
	}
	
	/**
	 * Returns series data as a 2D array of objects.
	 * - Method of: {@link ve.DatavisSuite}
	 *
	 * @alias getSeriesData
	 * @memberof ve.Component.ve.DatavisSuite
	 * 
	 * @param {string} arg0_series_id
	 * 
	 * @returns {Array.<Object[]>}
	 */
	getSeriesData (arg0_series_id) {
		//Convert from parameters
		let series_id = arg0_series_id;
		
		//Declare local instance variables
		let series_obj = (typeof series_id !== "object") ? this.series[series_id] : series_id;
		
		//Return statement
		return this.table_obj.getRangeValue(series_obj.coords, {
			return_raw_values: true
		});
	}
	
	/**
	 * Returns the series name from a given series object.
	 * - Method of: {@link ve.DatavisSuite}
	 *
	 * @alias getSeriesName
	 * @memberof ve.Component.ve.DatavisSuite
	 * 
	 * @param {Object} arg0_series_obj
	 * 
	 * @returns {string}
	 */
	getSeriesName (arg0_series_obj) {
		//Convert from parameters
		let series_obj = (arg0_series_obj) ? arg0_series_obj : {};
		
		//Declare local instance variables
		let series_name = loc("ve.registry.localisation.DatavisSuite_new_series");
			if (!series_obj.name) {
				if (series_obj.coords)
					//The series_name is located in the top left of the current range
					series_name = this.components_obj.scene_interface.table.getCellData(...series_obj.coords[0])?.v;
				if (series_name === undefined || series_name.length === 0)
					series_name = loc("ve.registry.localisation.DatavisSuite_new_series");
			} else {
				series_name = series_obj.name;
			}
			
		//Return statement
		return series_name;
	}
	
	/**
	 * Opens the edit graph window.
	 * - Method of: {@link ve.DatavisSuite}
	 *
	 * @alias openEditGraph
	 * @memberof ve.Component.ve.DatavisSuite
	 */
	openEditGraph () {
		//Close this.graph_window if already open
		if (this.graph_window) this.graph_window.close();
		
		//Declare local instance variables
		let graph_interface_obj = new ve.RawInterface({}, {
			onload: (v, e) => {
				setInterval(() => {
					if (!document.body.contains(e.element)) return;
					Object.iterate(this.graphs, (local_key, local_value) => {
						local_value.chart.resize({
							height: Math.returnSafeNumber(local_value.options.height, e.element.offsetHeight),
							width: Math.returnSafeNumber(local_value.options.width, e.element.offsetWidth)
						})
					});
				}, 100);
			},
			style: {
				height: "100%",
				width: "100%",
				
				overflow: "hidden",
				position: "relative"
			}
		});
		
		//Open this.graph_window with controls on the left and visualisation on the right
		this.graph_window = new ve.Window({
			container: new ve.FlexInterface({
				graph_options: new ve.HTML(loc("ve.registry.localisation.DatavisSuite_loading"), {
					style: {
						scrollbarWidth: "thin"
					}
				}),
				graph: graph_interface_obj
			}, {
				onuserchange: (v, e) => {
					this.drawGraphs(true);
				},
				style: {
					padding: 0
				}
			})
		}, {
			name: loc("ve.registry.localisation.DatavisSuite_edit_graph"),
			can_rename: false,
			width: "30rem",
			
			onuserchange: (v, e) => {
				if (v.resize)
					this.drawGraphs(true);
			}
		});
		this.drawEditGraph();
	}
	
	/**
	 * Opens the edit series window.
	 * - Method of: {@link ve.DatavisSuite}
	 *
	 * @alias openEditSeries
	 * @memberof ve.Component.ve.DatavisSuite
	 * 
	 * @param arg0_series_obj
	 */
	openEditSeries (arg0_series_obj) {
		//Convert from parameters
		let series_obj = (arg0_series_obj) ? arg0_series_obj : {};
		
		//Declare local instance variables
		let series_name = this.getSeriesName(series_obj);
		
		//Refresh series window
		if (this.edit_series_window) this.edit_series_window.close();
		this.edit_series_window = new ve.Window({
			range_information: new ve.HTML(() => `${loc("ve.registry.localisation.DatavisSuite_series_range")}: ${this.table_obj.getRangeName(series_obj.coords)}`),
			range_selection: new ve.RawInterface({
				clear_range: new ve.Button(() => {
					delete series_obj.coords;
					this.drawEditSeriesHierarchy();
					this.drawGraphs();
					
					veToast(loc("ve.registry.localisation.DatavisSuite_toast_cleared_range"));
				}, { name: loc("ve.registry.localisation.DatavisSuite_clear_range"), limit: () => series_obj.coords }),
				select_series_range: new ve.Button(() => {
					this.table_obj.setSelectedRange(series_obj.coords[0], series_obj.coords[1]);
				}, { name: loc("ve.registry.localisation.DatavisSuite_select_series_range"), limit: () => series_obj.coords }),
				set_series_range: new ve.Button(() => {
					try {
						series_obj.coords = this.table_obj.getSelectedRange();
						this.drawEditSeriesHierarchy();
						this.drawGraphs();
						
						veToast(loc("ve.registry.localisation.DatavisSuite_toast_range_set"));
					} catch (e) { console.error(e); }
				}, { name: loc("ve.registry.localisation.DatavisSuite_set_series_range") })
			}),
			
			symbol: new ve.DatavisSuite.SeriesSymbol(series_obj.symbol, {
				onuserchange: (v) => {
					series_obj.symbol = v;
					this.drawGraphs();
				}
			})
		}, {
			name: `${loc("ve.registry.localisation.DatavisSuite_edit")} ${series_name}`,
			can_rename: false,
			width: "30rem"
		});
	}
	
	/**
	 * Opens the edit series hierarchy window.
	 * - Method of: {@link ve.DatavisSuite}
	 *
	 * @alias openEditSeriesHierarchy
	 * @memberof ve.Component.ve.DatavisSuite
	 */
	openEditSeriesHierarchy () {
		//Close this.series_window if already open
		if (this.series_window) this.series_window.close();
		
		//Open this.series_window
		this.series_window = new ve.Window({ //Use ve.Hierarchy for list creation
			hierarchy: new ve.HTML(loc("ve.registry.localisation.DatavisSuite_loading"), { style: { padding: 0 } })
		}, { 
			name: loc("ve.registry.localisation.DatavisSuite_data_series"), 
			can_rename: false,
			width: "30rem"
		});
		this.drawEditSeriesHierarchy();
	}
	
	/**
	 * Opens the {@link ve.ScriptManager} widow for visual macro scripting.
	 * - Method of: {@link ve.DatavisSuite}
	 *
	 * @alias openScriptManager
	 * @memberof ve.Component.ve.DatavisSuite
	 */
	openScriptManager () {
		//Close script manager window if already open
		if (this.script_manager_window) this.script_manager_window.close();
		this.script_manager_window = veWindow({
			script_manager: new ve.ScriptManager()
		}, {
			name: loc("ve.registry.localisation.DatavisSuite_script_manager_window_name"),
			
			can_rename: false,
			width: "80dvw"
		})
	}
	
	/**
	 * Redraws the current {@link ve.DatavisSuite} component.
	 * - Method of: {@link ve.DatavisSuite}
	 * 
	 * @alias redraw
	 * @memberof ve.Component.ve.DatavisSuite
	 */
	redraw () {
		//Reset HTML, then rebind all this.components_obj
		//this.element.innerHTML = "";
		Object.iterate(this.components_obj, (local_key, local_value) => local_value.bind(this.element));
	}
};