/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 *
 * Creates a drag-and-drop Node Editor using Maptalks as a backend. Nodes are executed from a root node using a parallelised version of Kahn's algorithm, and nodes must form a directed acyclic graph (DAG). Circular references will not be executed if forced.
 * 
 * Compilation for {@link ve.NodeEditor} is 3-way and roundtrippable between Nodes <-> Code <-> Blocks through the default visual editor, as NodeEditor extends {@link ve.ScriptManager} and its subcomponents. Nodes can be recursively grouped via custom nodes creation and Forse support. Round-tripping is ES6+ compatible.
 *
 * If you need a loop, call `async run()` multiple times instead. For Forse as a DSL, see {@link ve.NodeEditor.Forse}.
 * - Functional binding: <span color=00ffff>veNodeEditor</span>().
 *
 * ##### Constructor:
 * - `arg0_value`: {@link Object} - The JSON object for the Maptalks instance attached to the current NodeEditor, including properties data.
 * - `arg1_options`: {@link Object}
 *   - `.bg_ctx`: {@link function} | {@link Object} - Returns the context of a Canvas.
 *   - `.category_types`: {@link Object}
 *     - `<category_key>`: {@link Object}
 *       - `.colour`: {@link Array}<{@link number}, {@link number}, {@link number}>|{@link string} - Either a hex/RGB value.
 *   - `.disable_custom_nodes=false`: {@link boolean} - Whether to disable custom nodes editing.
 *   - `.disable_file_explorer=false`: {@link boolean} - Whether to disable the leftbar file explorer, used for saving/loading files.
 *   - `.disable_forse=false`: {@link boolean} - Whether to disable Forse Nodes, which is the default DSL used by Vercengen.
 *   - `.exclude_all=false`: {@link boolean} - Whether to exclude the default 'All' category at the start.
 *   - `.node_types`: {@link Object}
 *     - `<node_key>`: {@link Object} - Current valid types for `.input_parameters` and `.output_type` include 'any'/'number[]'/'string[]'/'boolean'/'number'/'script'/'string'.
 *       - `.category="Expression"` - The category that any {@link ve.NodeEditorDatatype} instances should belong to. Typically should either be 'Filter'/'Expression'.
 *       - `.input_parameters=[]`: {@link Array}<{@link Object}> - The types of input parameters that will be accepted for evaluation.
 *         - `[n]`: {@link Object}
 *           - `.name`: {@link string}
 *           - `.type`: {@link string}
 *       - `.output_type="any"`: {@link string}
 *     - `.name`: {@link string}
 *     - `.output_type="any"`: {@link string} - What the output (return) type is regarded as being. There can only be a single return type per Node, similar to functions in most programming languages.
 *     - `.special_function`: {@link function}(argn_arguments:{@link any}) ¦ {@link Object}
 *       - Returns:
 *       - `.abort=false`: {@link boolean} - Whether to abort the current node branch from further execution (conditional branching).
 *       - `.alluvial_width=1`: {@link number}
 *       - `.display_value`: {@link string} - The actual display_value to show.
 *       - `.iterations=1`; {@link number} - The number of iterations to run for sub-nodes.
 *       - `.run`: {@link function} - The actual expression to execute upon running it in non-preview mode.
 *       - `.value`: {@link any} - If a filter, it should return an {@link Array}<{@link any}>.
 *     -
 *     - `.options`: {@link Object}
 *       - `.alluvial_scaling=1`: {@link number} - How much to scale alluvial widths by when displayed compared to their actual number.
 *   	   - `.id=Class.generateRandomID(ve.NodeEditorDatatype)`: {@link string} - The ID to assign to the present datatype at a class level.
 *       - `.show_alluvial=false`: {@link boolean}
 *   - `.project_folder`: {@link string}
 *   - `.save_extension=".ve-ne"`: {@link string}
 *
 * ##### Instance:
 * - `.id`: {@link string}
 * - `.main`: {@link Object}
 *   - `.variables`: {@link Object} - Where values during the run-cycle are stored.
 * - `.map`: {@link maptalks.Map} - Not an actual map instance. Used for rendering the node environment in 3D space.
 * - `.node_layer`: {@link maptalks.VectorLayer}
 * - `.v`: {@link Object}
 *
 * ##### Methods:
 * **Note.** User interactions are privated within ve.NodeEditor.
 * 
 * - <span color=00ffff>{@link ve.NodeEditor._connect|_connect}</span>(arg0_node:{@link ve.NodeEditorDatatype}, arg1_node:{@link ve.NodeEditorDatatype}, arg2_index:{@link number}, arg3_options:{@link Object})
 * - <span color=00ffff>{@link ve.NodeEditor._disconnect|_disconnect}</span>(arg0_node:{@link ve.NodeEditorDatatype}, arg1_node:{@link ve.NodeEditorDatatype}, arg2_index:{@link number})
 * - <span color=00ffff>{@link ve.NodeEditor._select|_select}</span>(arg0_node:{@link ve.NodeEditorDatatype}, arg1_index:{@link number})
 *
 * - <span color=00ffff>{@link ve.NodeEditor.clear|clear}</span>()
 * - <span color=00ffff>{@link ve.NodeEditor.drawToolbox|drawToolbox}</span>()
 * - <span color=00ffff>{@link ve.NodeEditor.getCanvas|getCanvas}</span>() | {@link HTMLCanvasElement}
 * - <span color=00ffff>{@link ve.NodeEditor.getDAGSequence|getDAGSequence}</span>() | {@link Array}<{@link Array}<{@link ve.NodeEditorDatatype}>>
 * - <span color=00ffff>{@link ve.NodeEditor.getDefaultBaseLayer|getDefaultBaseLayer}</span>() | {@link Object}
 * - <span color=00ffff>{@link ve.NodeEditor.loadSettings|loadSettings}</span>(arg0_settings:{@link Object})
 * - async <span color=00ffff>{@link ve.NodeEditor.run|run}</span>(arg0_preview_mode:{@link boolean}) | {@link Object}
 * 
 * - <span color=00ffff>{@link ve.NodeEditor.createCustomExecutionLogic|createCustomExecutionLogic}</span>(arg0_subgraph:{@link Object})
 * - <span color=00ffff>{@link ve.NodeEditor.deleteCustomNode|deleteCustomNode}</span>(arg0_key:{@link string})
 * 
 * ##### Static Fields:
 * - `.instances`: {@link Array}<{@link ve.NodeEditor}>
 *
 * @augments ve.Component
 * @memberof ve.Component
 * @type {ve.NodeEditor}
 */
ve.NodeEditor = class extends ve.Component {
	/**
	 * @type {ve.NodeEditor[]}
	 */
	static instances = [];
	
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = arg0_value;
		let options = arg1_options ? arg1_options : {};
			super(options);
			
		//Initialise options
		options.attributes = options.attributes ? options.attributes : {};
		options.category_types = options.category_types ? options.category_types : {};
		options.node_types = options.node_types ? options.node_types : {};
		options.polling = Math.returnSafeNumber(options.polling, 100);
		options.style = {
			display: "flex",
			flexDirection: "column",
			height: "100%",
			width: "100%",
			padding: "0",
			".maptalks-attribution": {
				display: "none",
			},
			...options.style,
		};
		
		let forse_obj = ve.NodeEditor.Forse.getForseObject({
			disable_custom_nodes: options.disable_custom_nodes,
			disable_forse: options.disable_forse
		});
			if (forse_obj.category_types)
				options.category_types = { ...forse_obj.category_types, ...options.category_types };
			if (forse_obj.node_types)
				options.node_types = { ...forse_obj.node_types, ...options.node_types };
		
		//Declare local instance variables
		this.element = document.createElement("div");
			this.element.instance = this;
			this.element.setAttribute("component", "ve-node-editor");
			HTML.setAttributesObject(this.element, options.attributes);
		
		//1. Topbar; actions bar
		let debug_components_obj = (ve.registry.debug_mode) ? {
			debug_button: new ve.Button(() => console.log(this.getDAGSequence()), {
				name: loc("ve.registry.localisation.NodeEditor_debug")
			})
		} : {};
		
		let actions_bar = new ve.RawInterface({
			run_button: new ve.Button(() => {
				if (this.run_window) this.run_window.close();
				this.run_window = new ve.Window({
					run_button: new ve.Button(() => {
						this.run(false).then(() => {
							ve.NodeEditorDatatype.draw(this, true);
						});
					}, {
						name: loc("ve.registry.localisation.NodeEditor_run")
					}),
					abort_button: new ve.Button(() => {
						this.abort();
						console.log(this._is_running_non_preview)
					}, {
						name: loc("ve.registry.localisation.NodeEditor_abort_current_run"),
						limit: () => (this._is_running_non_preview)
					})
				}, {
					name: loc("ve.registry.localisation.NodeEditor_run_window"),
					can_rename: false
				});
			}, {
				name: loc("ve.registry.localisation.NodeEditor_run"),
				can_rename: false,
				do_not_wrap: true,
				width: "20rem"
			}),
			view_button: new ve.Button(() => {
				let nodeeditor_settings = ve.registry.settings.NodeEditor;
				
				if (this.view_window) this.view_window.close();
				this.view_window = new ve.Window({
					alluvial_scaling: new ve.Number(Math.returnSafeNumber(this.options.alluvial_scaling, 1), {
						name: loc("ve.registry.localisation.NodeEditor_alluvial_scaling"),
						onuserchange: (v) => {
							this.options.alluvial_scaling = v;
							ve.NodeEditorDatatype.draw(this, true);
						}
					}),
					show_alluvial_width: new ve.Toggle(this.options.show_alluvial, {
						name: loc("ve.registry.localisation.NodeEditor_show_alluvial_width"),
						onuserchange: (v) => {
							this.options.show_alluvial = v;
							ve.NodeEditorDatatype.draw(this, true);
						}
					}),
					actions_bar: new ve.RawInterface({
						load_settings: new ve.File(undefined, {
							name: loc("ve.registry.localisation.NodeEditor_load_settings"),
							do_not_display: true,
							onuserchange: (v) => {
								let display_error = false;
								let error_msg;
								try {
									let settings_obj = JSON.parse(fs.readFileSync(v[0], "utf8"));
									this.loadSettings(settings_obj);
								} catch (e) {
									display_error = true;
									error_msg = e;
								}
								if (display_error)
									veWindow(`<span style = "align-items: center; display: flex"><icon>warning</icon> ${loc("ve.registry.localisation.NodeEditor_error_msg_load_settings", error_msg)}</span>`, {
										can_rename: false,
										name: loc("ve.registry.localisation.NodeEditor_error_loading_settings_window"),
										width: "20rem"
									});
							}
						}),
						save_settings: (nodeeditor_settings.save_file === false) ? 
							new ve.File(undefined, {
								name: loc("ve.registry.localisation.NodeEditor_save_settings"),
								do_not_display: true,
								save_function: () => this.saveSettings()
							}) :
							new ve.Button(() => {
								let dirname = path.dirname(nodeeditor_settings.save_file);
								fs.mkdir(dirname, { recursive: true }, (err) => {
									if (err) {
										console.error(err);
										return;
									}
									fs.writeFileSync(nodeeditor_settings.save_file, this.saveSettings());
									veToast(loc("ve.registry.localisation.NodeEditor_toast_saved_settings", nodeeditor_settings.save_file));
								});
							}, { name: loc("ve.registry.localisation.NodeEditor_save_settings") })
					}, {
						style: {
							alignItems: "center",
							display: "flex",
							
							"[component='ve-button']": { whiteSpace: "nowrap" }
						}
					})
				}, {
					name: loc("ve.registry.localisation.NodeEditor_view_settings"),
					can_rename: false,
					do_not_wrap: true,
					width: "20rem"
				})
			}, {
				name: loc("ve.registry.localisation.NodeEditor_view")
			}),
			...debug_components_obj
		}, {
			style: {
				marginBottom: `var(--cell-padding)`,
				"button": {
					marginRight: `var(--cell-padding)`
				}
			}
		});
		actions_bar.bind(this.element);
		
		//2. Scene 
		this.map_el = document.createElement("div");
		this.map_el.id = "map-container";
		this.map_el.setAttribute("style", "height: 100%; width: 100%;");
		
		this.scene_interface = new ve.FlexInterface({
			type: "horizontal",
			file_explorer: (!options.disable_file_explorer) ? new ve.FileExplorer(options.project_folder, {
				style: { flex: 1, maxHeight: "40rem" },
				load_function: (arg0_data) => {
					//Convert from parameters
					let local_data = arg0_data;
					
					this.v = JSON.parse(local_data);
				},
				save_extension: (options.save_extension) ? options.save_extension : [".ve-ne"],
				save_function: () => this.v,
			}) : undefined,
			map_el: new ve.HTML(this.map_el, {
				style: { flex: 3, minHeight: "8rem", height: "100%", padding: 0 }
			})
		});
		this.scene_interface.bind(this.element);
		
		this.id = Class.generateRandomID(ve.NodeEditor);
		this.map = new maptalks.Map(this.map_el, {
			autoResize: false,
			center: [0, 0],
			zoom: 14,
			baseLayer: this.getDefaultBaseLayer(),
		});
		this.node_layer = new maptalks.VectorLayer("nodes", [], { hitDetect: true });
			this.node_layer.addTo(this.map);
		this.options = options;
		
		this.main = {
			custom_node_types: {},
			nodes: [],
			settings: {
				display_expressions_with_values: true,
				display_filters_as_alluvial: true,
				display_filters_with_numbers: true,
			},
			user: { selected_nodes: [] },
			variables: {},
		};
		
		//Handle map events; populate values
		this.map.addEventListener("click", (e) => {
			this._mouse_coords = e.coordinate;
		});
		this.map.addEventListener("contextmenu", (e) => {
			this._mouse_coords = e.coordinate;
			this.drawToolbox();
		});
		this.map.addEventListener("mousemove", (e) => {
			this._mouse_coords = e.coordinate;
		});
		
		//Load settings
		let nodeeditor_settings = ve.registry.settings.NodeEditor;
		
		if (nodeeditor_settings.save_file !== false)
			if (fs.existsSync(nodeeditor_settings.save_file)) try {
				this.loadSettings(fs.readFileSync(nodeeditor_settings.save_file, "utf8"));
			} catch (e) { console.warn(e); }
		
		this.v = value;
		ve.NodeEditor.instances.push(this);
	}
	
	/**
	 * Returns the current JSON object from the component.
	 * - Accessor of: {@link ve.NodeEditor}
	 *
	 * @alias v
	 * @memberof ve.Component.ve.NodeEditor
	 * @type {Object}
	 */
	get v () {
		//Return statement
		return {
			custom_node_types: this.main.custom_node_types,
			map_state: {
				center: this.map.getCenter().toArray(),
				zoom: this.map.getZoom(),
			},
			nodes: this.main.nodes.map((node) => node.v),
			settings: this.main.settings,
		};
	}
	
	/**
	 * Sets the current value of the ve.NodeEditor from available JSON.
	 * - Accessor of: {@link ve.NodeEditor}
	 *
	 * @alias v
	 * @memberof ve.Component.ve.NodeEditor
	 * @param {Object} arg0_value
	 * @type Object
	 */
	set v (arg0_value) {
		//Convert from parameters
		let data = (typeof arg0_value === "string") ? JSON.parse(arg0_value) : arg0_value;
		
		//Declare local instance variables
		if (!data) return; //Internal guard clause if data is not valid
			this.clear(); //Reset instance first
		
		//Handle custom nodes
		if (data.custom_node_types) {
			this.main.custom_node_types = data.custom_node_types;
			Object.keys(this.main.custom_node_types).forEach((key) => {
				let local_custom_node = this.main.custom_node_types[key];
				if (local_custom_node.subgraph)
					local_custom_node.special_function = this.createCustomExecutionLogic(local_custom_node.subgraph);
			});
			this.options.node_types = {
				...this.options.node_types,
				...this.main.custom_node_types,
			};
		}
		//Handle map state (zoom/position)
		if (data.map_state) {
			this.map.setCenter(data.map_state.center);
			this.map.setZoom(data.map_state.zoom);
		}
		//Handle non-custom nodes
		if (data.nodes && Array.isArray(data.nodes)) {
			data.nodes.forEach((node_data) => {
				let definition = this.options.node_types[node_data.key];
				if (definition) {
					let category_options = this.options.category_types[definition.category] || {};
					let new_node = new ve.NodeEditorDatatype({
						...definition,
						...node_data,
					}, {
						category_options: category_options,
						node_editor: this,
						...definition.options,
					});
					this.main.nodes.push(new_node);
				} else {
					console.warn(`Node type '${node_data.key}' not found in registry. Skipping node.`);
				}
			});
			
			//Iterate over all nodes and set their connections
			this.main.nodes.forEach((local_node) => {
				if (local_node._serialised_connections) {
					local_node.connections = [];
					local_node._serialised_connections.forEach(([target_id, target_index]) => {
						//Pass 'this' to getNode to scope lookup to this editor
						let target_node = ve.NodeEditorDatatype.getNode(target_id, this);
						
						if (target_node) {
							local_node.connections.push([target_node, target_index]);
							if (target_index > 0)
								target_node.dynamic_values[target_index - 1] = true;
						}
					});
					delete local_node._serialised_connections;
				}
			});
		}
		//Handle settings
		if (data.settings)
			this.main.settings = { ...this.main.settings, ...data.settings };
		
		//Draw NodeEditor
		ve.NodeEditorDatatype.draw(this);
	}
	
	loadSettings (arg0_settings) {
		//Convert from parameters
		let settings_obj = arg0_settings;
		if (typeof settings_obj === "string") settings_obj = JSON.parse(settings_obj);
		
		//Set this.options, redraw
		this.options = {
			...this.options,
			...settings_obj
		};
		ve.NodeEditorDatatype.draw(this);
	}
	
	saveSettings () {
		//Return statement
		return JSON.stringify({
			alluvial_scaling: this.options.alluvial_scaling,
			show_alluvial: this.options.show_alluvial
		});
	}
};

//Functional binding
veNodeEditor = function () {
	return new ve.NodeEditor(...arguments);
};