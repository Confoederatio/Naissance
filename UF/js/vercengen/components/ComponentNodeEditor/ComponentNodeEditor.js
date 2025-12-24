/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 * 
 * Creates a drag-and-drop Node Editor using Maptalks. Note that the entire state is stored in Maptalks, with scripts and metadata in the properties portion of Geometry symbols.
 * 
 * All nodes are implemented as a {@link maptalks.GeometryCollection}, with [0] containing node data and [n] containing other visual geometries. The ID of the GeometryCollection is the same as that of the Node. Their class type is implemented as a {@link ve.NodeEditorDatatype}.
 * - Functional binding: <span color=00ffff>veNodeEditor</span>().
 * 
 * [WIP] - Settings remain to be concretely implemented.
 * 
 * ##### Constructor:
 * - `arg0_value`: {@link Object} - The JSON object for the Maptalks instance attached to the current NodeEditor, including properties data.
 * - `arg1_options`: {@link Object}
 *   - `.autosave_folder`: {@link string}
 *   - `.bg_ctx`: {@link function} | {@link Object} - Returns the context of a Canvas.
 *   - `.category_types`: {@link Object}
 *     - `<category_key>`: {@link Object}
 *       - `.colour`: {@link Array}<{@link number}, {@link number}, {@link number}>|{@link string} - Either a hex/RGB value.
 *   - `.node_types`: {@link Object}
 *     - `<node_key>`: {@link Object}
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
 *       - `.alluvial_width=1`: {@link number}
 *       - `.display_value`: {@link string} - The actual display_value to show.
 *       - `.run`: {@link function} - The actual expression to execute upon running it in non-preview mode.
 *       - `.value`: {@link any} - If a filter, it should return an {@link Array}<{@link any}>.
 *     - 
 *     - `.options`: {@link Object}
 *       - `.alluvial_scaling=1`: {@link number} - How much to scale alluvial widths by when displayed compared to their actual number.
 *   	   - `.id=Class.generateRandomID(ve.NodeEditorDatatype)`: {@link string} - The ID to assign to the present datatype at a class level.
 *       - `.show_alluvial=false`: {@link boolean}
 *   - `.exclude_all=false`: {@link boolean} - Whether to exclude the default 'All' category at the start.
 * 
 * ##### Instance:
 * - `.id`: {@link string}
 * - `.main`: {@link Object}
 *   - `.variables`: {@link Object} - Where values during the run-cycle are stored.
 * - `.map`: {@link maptalks.Map}
 * - `.node_layer`: {@link maptalks.VectorLayer}
 * - `.v`: {@link Object}
 * 
 * ##### Methods:
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
		let options = (arg1_options) ? arg1_options : {};
			super(options);
		
		//Initialise options
		options.attributes = (options.attributes) ? options.attributes : {};
		options.category_types = (options.category_types) ? options.category_types : {};
		options.node_types = (options.node_types) ? options.node_types : {};
		options.polling = Math.returnSafeNumber(options.polling, 100);
		options.style = {
			height: "50vh",
			width: "50vw",
			
			"#map-container": {
				height: "100%",
				width: "100%"
			},
			".maptalks-all-layers, .maptalks-canvas-layer, .maptalks-wrapper": {
				position: "static"
			},
			".maptalks-attribution": {
				display: "none"
			},
			...options.style
		};
		
		//Declare local instance variables
		this.element = document.createElement("div");
			this.element.setAttribute("component", "ve-node-editor");
			HTML.setAttributesObject(this.element, options.attributes);
			this.element.instance = this;
			
			this.map_el = document.createElement("div");
			this.map_el.id = "map-container";
			this.element.appendChild(this.map_el);
			
			if (ve.registry.debug_mode) {
				let debug_button = veButton(() => {
					console.log(this.getDAGSequence());
				}, { name: "Debug" });
				debug_button.bind(this.element);
			}
			let run_button = veButton(() => {
				this.run().then(() => ve.NodeEditorDatatype.draw());
			}, { name: "Run" });
			run_button.bind(this.element);
		this.id = Class.generateRandomID(ve.NodeEditor);
		this.map = new maptalks.Map(this.map_el, {
			center: [0, 0],
			zoom: 14,
			baseLayer: this.getDefaultBaseLayer(),
		});
			this.node_layer = new maptalks.VectorLayer("nodes", [], { hitDetect: true });
		this.node_layer.addTo(this.map);
		this.options = options;
		
		this.main = {
			nodes: [],
			settings: { //[WIP] - Implement settings
				display_expressions_with_values: true,
				display_filters_as_alluvial: true,
				display_filters_with_numbers: true
			},
			user: {
				selected_nodes: []
			},
			variables: {} //Used to store variables during a single run-cycle
		};
		this.value = value;
		
		//Set map bindings
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
		
		//Set .v
		this.v = this.value;
		ve.NodeEditor.instances.push(this);
	}
	
	/**
	 * Returns the current JSON object from the component.
	 * 
	 * @alias v
	 * @memberof ve.Component.ve.NodeEditor
	 * @type {{nodes: ve.NodeEditorDatatype[], settings: {}}}
	 */
	get v () {
		//Return statement
		return {
			settings: this.main.settings,
			nodes: this.main.nodes.map(node => node.toJSON())
		};
	}
	
	/**
	 * Sets the current value of the ve.NodeEditor from available JSON.
	 * - Accessor of: {@link ve.NodeEditor}
	 * 
	 * @alias v
	 * @memberof ve.Component.ve.NodeEditor
	 * 
	 * @param {{nodes: ve.NodeEditorDatatype[], settings: {}}} arg0_value
	 */
	set v (arg0_value) {
		//Convert from parameters
		let data = (typeof arg0_value === "string") ? JSON.parse(arg0_value) : arg0_value;
			if (!data) return; //Internal guard clause if data is not defined
		
		//Clear current state
		this.clear();
		
		//1. 1st-pass: Instantiate all nodes
		//We create the instances first so that IDs are registered in ve.NodeEditorDatatype.instances
		if (data.nodes && Array.isArray(data.nodes)) {
			data.nodes.forEach(node_data => {
				//Find the original definition based on the key
				let definition = this.options.node_types[node_data.key];
				if (definition) {
					let category_options = this.options.category_types[definition.category] || {};
					
					//Create instance with definition logic
					let new_node = new ve.NodeEditorDatatype({
						coords: node_data.coords,
						key: node_data.key,
						...definition
					}, {
						category_options: category_options,
						node_editor: this,
						...definition.options
					});
					
					//Use fromJSON to restore instance-specific data (ID, constant_values, etc.)
					new_node.fromJSON(node_data);
					this.main.nodes.push(new_node);
				}
			});
			
			//3. 2nd-pass: Resolve Connections
			//Now that all nodes exist, we can map ID strings back to object references
			this.main.nodes.forEach(node => {
				if (node._serialised_connections) {
					node.connections = [];
					node._serialised_connections.forEach(([target_id, target_index]) => {
						let target_node = ve.NodeEditorDatatype.getNode(target_id);
						if (target_node) {
							node.connections.push([target_node, target_index]);
							
							// Re-flag dynamic inputs so the UI knows not to show constant fields
							if (target_index > 0)
								target_node.dynamic_values[target_index - 1] = true;
						}
					});
					// Clean up temporary property
					delete node._serialised_connections;
				}
			});
		}
		
		//4. Restore Editor Settings
		if (data.settings)
			this.main.settings = { ...this.main.settings, ...data.settings };
		
		//5. Finalise UI
		ve.NodeEditorDatatype.draw();
	}
	
	/**
	 * Draws a connection between two nodes as a user interaction.
	 * - Method of: {@link ve.NodeEditor}
	 * 
	 * @alias _connect
	 * @memberof ve.Component.ve.NodeEditor
	 * 
	 * @param {ve.NodeEditorDatatype} arg0_node
	 * @param {ve.NodeEditorDatatype} arg1_node
	 * @param {number} arg2_index
	 * @param {Object} [arg3_options]
	 *  @param {boolean} [arg3_options.toggle_connection=false]
	 *  
	 * @private
	 */
	_connect (arg0_node, arg1_node, arg2_index, arg3_options) {
		//Convert from parameters
		let node = arg0_node;
		let ot_node = arg1_node;
		let index = arg2_index;
		let options = (arg3_options) ? arg3_options : {};
		
		if (node.getConnection(ot_node, index) !== -1) //Internal guard clause if connection already exists
			if (options.toggle_connection) {
				this._disconnect(node, ot_node, index);
				return;
			} else {
				return;
			}
		
		//Attempt to connect the two nodes
		node.connections.push([ot_node, index]);
		let dag_sequence = this.getDAGSequence();
		
		//Check if connection causes cycle, if so pop, break, and return
		if (dag_sequence === undefined) {
			node.connections.pop();
			veToast(`<icon>warning</icon> Circular dependencies are not allowed.`);
			
			return;
		}
		//Check if connection are between same types (.output_type to .input_parameters[index - 1].type)
		if (index > 0) {
			let input_type = (ot_node.value.input_parameters[index - 1].type) ?
				ot_node.value.input_parameters[index - 1].type : "any";
			let output_type = (node.value.output_type) ? node.value.output_type : "any";
			
			if (input_type !== output_type && input_type !== "any") {
				node.connections.pop();
				veToast(`<icon>warning</icon> ${output_type} to ${input_type} are not of the same types.`);
				
				return;
			}
		}
				
		if (index > 0)
			ot_node.dynamic_values[index - 1] = true;
		ve.NodeEditorDatatype.draw();
	}
	
	/**
	 * Disconnects two nodes as a user interaction or from `arg3_options.toggle_connection` in the <span color=00ffff>{@link ve.NodeEditor._connect|_connect}</span>() function.
	 * - Method of: {@link ve.NodeEditor}
	 * 
	 * @alias _disconnect
	 * @memberof ve.Component.ve.NodeEditor
	 * 
	 * @param {ve.NodeEditorDatatype} arg0_node
	 * @param {ve.NodeEditorDatatype} arg1_node
	 * @param {number} arg2_index
	 * 
	 * @private
	 */
	_disconnect (arg0_node, arg1_node, arg2_index) {
		//Convert from parameters
		let node = arg0_node;
		let ot_node = arg1_node;
		let index = arg2_index;
		
		//Check to make sure that node_connection isn't 1
		let node_connection_index = node.getConnection(ot_node, index);
		
		if (node_connection_index !== -1) {
			node.connections.splice(node_connection_index, 1);
			if (index > 0)
				ot_node.dynamic_values[index - 1] = undefined;
			ve.NodeEditorDatatype.draw();
		}
	}
	
	/**
	 * Selects a specific node index as a suer interaction.
	 * - Method of: {@link ve.NodeEditor}
	 *
	 * @alias _select
	 * @memberof ve.Component.ve.NodeEditor
	 * 
	 * @param {ve.NodeEditorDatatype} arg0_node
	 * @param {number} arg1_index - [0] refers to the function itself, and [n + 1] to any parameters thereafter.
	 * 
	 * @private
	 */
	_select (arg0_node, arg1_index) {
		//Convert from parameters
		let node = arg0_node;
		let index = arg1_index;
		
		//Declare local instance variables
		let selected_nodes = this.main.user.selected_nodes;
		
		//Internal guard clauses
		{
			//0. If selection already exists, clear it instead
			for (let i = selected_nodes.length - 1; i >= 0; i--) {
				
				if (selected_nodes[i][0].id === node.id && selected_nodes[i][1] === index) {
					this.main.user.selected_nodes.splice(i, 1);
					ve.NodeEditorDatatype.draw();
					return;
				} else if (selected_nodes[i][0].id === node.id) {
					this.main.user.selected_nodes.splice(i, 1);
					continue;
				}
			}
				
			//1. Check if selection is valid first
			if (selected_nodes.length >= 1)
				if (selected_nodes[0][1] > 0 && index > 0) return; //Input > Input isn't valid
		}
		
		//Manage selected_nodes
		selected_nodes.push([node, index]);
		
		if (selected_nodes.length >= 2) {
			//Attempt to connect the two nodes
			this._connect(selected_nodes[0][0], selected_nodes[1][0], selected_nodes[1][1], {
				toggle_connection: true
			});
			selected_nodes = [];
		}
		this.main.user.selected_nodes = selected_nodes;
		ve.NodeEditorDatatype.draw();
	}
	
	/**
	 * Clears the current component.
	 * - Method of: {@link ve.NodeEditor}
	 *
	 * @alias clear
	 * @memberof ve.Component.ve.NodeEditor
	 */
	clear () {
		// 1. Iterate backwards to safely call remove() on all nodes
		// This cleans up the global static instances and Maptalks geometries
		for (let i = this.main.nodes.length - 1; i >= 0; i--)
			this.main.nodes[i].remove();
		
		// 2. Explicitly wipe the local tracking arrays
		this.main.nodes = [];
		this.main.user.selected_nodes = [];
		
		// 3. Clear transient execution data
		this.main.variables = {};
		
		// 4. Ensure the map layer is empty
		if (this.node_layer) this.node_layer.clear();
	}
	
	/**
	 * Opens the toolbox UI for the current node editor.
	 * - Method of: {@link ve.NodeEditor}
	 *
	 * @alias drawToolbox
	 * @memberof ve.Component.ve.NodeEditor
	 */
	drawToolbox () {
		//Declare local instance variables
		let page_menu_obj = {};
		let unique_categories = [];
		
		//Populate unique_categories
		Object.iterate(this.options.node_types, (local_key, local_value) => {
			if (local_value.category && !unique_categories.includes(local_value.category))
				unique_categories.push(local_value.category);
		});
		if (unique_categories.length === 0)
			unique_categories = ["Expressions", "Filters"];
		if (!this.options.exclude_all)
			unique_categories.unshift("All");
		
		//Populate page_menu_obj
		for (let i = 0; i < unique_categories.length; i++) {
			let filter_names_obj = {};
			let local_search_select_obj = {};
			
			//Iterate over all unique_categories; populate filter_names_obj
			for (let x = 0; x < unique_categories.length; x++)
				filter_names_obj[`data-${unique_categories[x].toLowerCase().split(" ").join("_")}`] = unique_categories[x];
			
			//Iterate over all this.options.node_types
			Object.iterate(this.options.node_types, (local_key, local_value) => {
				let local_category_options = this.options.category_types[local_value.category];
					local_category_options = (local_category_options) ? local_category_options : {};
				
				let local_category_colour = (local_category_options.colour) ? 
					local_category_options.colour : [255, 255, 255];
					local_category_colour = Colour.convertRGBAToHex(local_category_colour);
					
				let local_category_text_colour = (local_category_options.text_colour) ?
					local_category_options.text_colour : [0, 0, 0];
					local_category_text_colour = Colour.convertRGBAToHex(local_category_text_colour);
				
				if (local_value.category === unique_categories[i] || unique_categories[i] === "All")
					local_search_select_obj[local_key] = new ve.Button(() => {
						this.main.nodes.push(new ve.NodeEditorDatatype({
							coords: this._mouse_coords,
							key: local_key,
							...local_value
						}, {
							category_options: local_category_options,
							node_editor: this,
							...local_value.options
						}));
					}, { 
						attributes: {
							[`data-${local_value.category.split(" ").join("_")}`]: "true"
						},
						name: (local_value.name) ? local_value.name : local_key,
						style: {
							"button": { 
								backgroundColor: local_category_colour,
								color: local_category_text_colour
							}
						}
					});
			});
			
			page_menu_obj[unique_categories[i]] = {
				name: unique_categories[i],
				components_obj: {
					search_select: new ve.SearchSelect(local_search_select_obj, { 
						hide_filter: (unique_categories[i] !== "All"),
						filter_names: filter_names_obj
					})
				}
			};
		}
		
		//Draw ve.PageMenuWindow
		if (this.toolbox_window) this.toolbox_window.close();
		this.toolbox_window = new ve.PageMenuWindow(page_menu_obj, {
			name: "Toolbox",
			width: "23rem",
			
			can_rename: false
		});
	}
	
	/**
	 * Returns the canvas element for the current node editor.
	 * - Method of: {@link ve.NodeEditor}
	 *
	 * @alias getCanvas
	 * @memberof ve.Component.ve.NodeEditor
	 * 
	 * @returns {HTMLCanvasElement}
	 */
	getCanvas () {
		//Declare local instance variables
		if (!this._canvas)
			this._canvas = document.createElement("canvas");
		
		//Return statement
		return this._canvas;
	};
	
	/**
	 * Returns DAG sequence layers. Inner arrays are run-order agnostic, whilst the outer array must be executed in order. Returns 'undefined' if the current graph has circular dependencies (which should never happen).
	 * - Method of: {@link ve.NodeEditor}
	 *
	 * @alias getDAGSequence
	 * @memberof ve.Component.ve.NodeEditor
	 * 
	 * @returns {Array.<Array.<ve.NodeEditorDatatype>>|undefined}
	 */
	getDAGSequence () {
		//Declare local instance variables
		let adjacency = new Map(); //node.id -> Set<node.id>
		let in_degree = new Map(); //node.id -> number
		let nodes = ve.NodeEditorDatatype.instances.filter(
			(local_node) => local_node.options.node_editor === this);
		
		//Iterate over all nodes; initialise maps
		for (let i = 0; i < nodes.length; i++) {
			in_degree.set(nodes[i].id, 0);
			adjacency.set(nodes[i].id, new Set());
		}
		
		//Iterate over all nodes; build graph
		for (let i = 0; i < nodes.length; i++)
			for (let x = 0; x < nodes[i].connections.length; x++) {
				let local_target_node = nodes[i].connections[x][0];
				
				//Only consider nodes in this editor
				if (!in_degree.has(local_target_node.id)) continue;
				
				//node -> local_target_node
				if (!adjacency.get(nodes[i].id).has(local_target_node.id)) {
					adjacency.get(nodes[i].id).add(local_target_node.id);
					in_degree.set(local_target_node.id, in_degree.get(local_target_node.id) + 1);
				}
			}
		
		//Kahn's algorithm (layered/parallelised)
		let layers = [];
		let processed_count = 0;
		let queue = [];
		
		//Iterate over all nodes; initial zero‑in‑degree (root) nodes
		for (let i = 0; i < nodes.length; i++)
			if (in_degree.get(nodes[i].id) === 0)
				queue.push(nodes[i]);
		
		//Populate each queue
		while (queue.length > 0) {
			let layer = [];
			let next_queue = [];
			
			// All nodes currently in queue form one parallel layer
			for (let i = 0; i < queue.length; i++) {
				layer.push(queue[i]);
				processed_count++;
				
				let edges = adjacency.get(queue[i].id);
					if (!edges) continue;
				
				edges.forEach((to_id) => {
					in_degree.set(to_id, in_degree.get(to_id) - 1);
					
					if (in_degree.get(to_id) === 0)
						next_queue.push(ve.NodeEditorDatatype.getNode(to_id));
				});
			}
			
			//Push layer and move onto next queue
			layers.push(layer);
			queue = next_queue;
		}
		
		//Return statement; cycle detection guard clause
		if (processed_count !== nodes.length)
			return undefined;
		return layers;
	};
	
	/**
	 * Returns the default base layer for initialisation purposes.
	 *
	 * @alias getDefaultBaseLayer
	 * @memberof ve.Component.ve.NodeEditor
	 * 
	 * @returns {maptalks.TileLayer}
	 */
	getDefaultBaseLayer () {
		//Declare local instance variables
		let base_layer = new maptalks.TileLayer("base", {
			urlTemplate: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
			subdomains: ["a", "b", "c"],
			repeatWorld: true
		});
		
		//Set base_layer functions
		base_layer.getBase64Image = (arg0_image) => {
			//Convert from parameters
			let img = arg0_image;
			
			//Declare local instance variables
			let canvas = this.getCanvas();
				canvas.height = img.height;
				canvas.width = img.width;
			let ctx = canvas.getContext('2d');
			
			//Draw scene for rect
			if (this.options.bg_ctx) {
				ctx = this.options.bg_ctx(ctx);
			} else {
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.drawImage(img, 0, 0);
				
				//Draw background
				ctx.fillStyle = `rgba(25, 25, 25, 1)`;
				ctx.fillRect(0, 0, canvas.width, canvas.height);
				
				ctx.save();
				ctx.strokeStyle = `rgba(255, 255, 255, 0.5)`;
				ctx.lineWidth = 1;

				//Draw 8x8 grid
				let columns = 8;
				let rows = 8;
				
				let cell_height = canvas.height/rows;
				let cell_width = canvas.width/columns;

				//Draw vertical lines
				for (let i = 0; i <= columns; i++) {
					let local_x = i*cell_width;
					
					ctx.beginPath();
					ctx.moveTo(local_x, 0);
					ctx.lineTo(local_x, canvas.height);
					ctx.stroke();
				}

				//Draw horizontal lines
				for (let i = 0; i <= rows; i++) {
					let local_y = i*cell_height;
					
					ctx.beginPath();
					ctx.moveTo(0, local_y);
					ctx.lineTo(canvas.width, local_y);
					ctx.stroke();
				}
				
				ctx.restore();
			}
			
			//Return statement
			return canvas.toDataURL('image/jpg', 0.7);
		};
		base_layer.getTileUrl = function (x, y, z) {
			//Return statement
			return maptalks.TileLayer.prototype.getTileUrl.call(this, x, y, z);
		}
		base_layer.on("renderercreate", (e) => {
			e.renderer.loadTileImage = (arg0_image, arg1_url) => {
				//Convert from parameters
				let img = arg0_image;
				let url = arg1_url;
				
				//Declare local instance variables
				let remote_image = new Image();
					remote_image.crossOrigin = "anonymous";
					remote_image.onload = () =>
						img.src = base_layer.getBase64Image(remote_image);
					remote_image.src = url;
			};
		});
		
		//Return statement
		return base_layer;
	}
	
	loadSettings (arg0_settings) {
		
	}
	
	/**
	 * Runs the current DAG graph, either in preview mode which simply displays values, or in non-preview mode, which runs it for real.
	 *
	 * @alias run
	 * @memberof ve.Component.ve.NodeEditor
	 * 
	 * @async
	 * @param {boolean} [arg0_preview_mode=false]
	 * @returns {Object}
	 */
	async run (arg0_preview_mode) {
		//Convert from parameters
		let preview_mode = arg0_preview_mode;
		
		//Declare local instance variables
		let dag_sequence = this.getDAGSequence();
		let resolve_arguments = (arg0_node) => {
			//Convert from parameters
			let node = arg0_node;
			
			//Declare local instance variables
			let args = [];
			
			//Iterate over input parameters
			for (let i = 0; i < node.value.input_parameters.length; i++) {
				let local_parameter = node.value.input_parameters[i];
				
				if (node.dynamic_values[i]) {
					let resolved;
					
					//Find source node connected to this input
					for (let x = 0; x < ve.NodeEditorDatatype.instances.length; x++) {
						let source = ve.NodeEditorDatatype.instances[x];
						
						for (let y = 0; y < source.connections.length; y++) {
							let target_data = source.connections[y];
							let target_node = target_data[0];
							let target_index = target_data[1];
							
							if (target_node.id === node.id && target_index === (i + 1)) {
								resolved = this.main.variables[source.id];
								break;
							}
						}
						if (resolved !== undefined) break;
					}
					
					args.push(resolved);
				} else if (node.constant_values[i] !== undefined) {
					args.push(node.constant_values[i]);
				} else {
					//Fetch the default for this type
					let local_parameter_type = JSON.parse(JSON.stringify(local_parameter.type));
						if (ve.NodeEditorDatatype.types[local_parameter_type] === undefined)
							local_parameter_type = "any";
					args.push(ve.NodeEditorDatatype.types[local_parameter_type]);
				}
			}
			
			//Return statement
			return args;
		};
		
		//Reset execution context
		this.main.variables = {};
		
		//Iterate over DAG layers (execute)
		for (let i = 0; i < dag_sequence.length; i++) {
			let layer = dag_sequence[i];
			
			if (!preview_mode)
				for (let x = 0; x < dag_sequence[i].length; x++) {
					delete dag_sequence[i][x].ui.information.status;
					dag_sequence[i][x].draw();
				}
			
			await Promise.all(layer.map(async (local_node) => {
				//Declare local instance variables
				let args = resolve_arguments(local_node);
				let sf = local_node.value.special_function;
				let descriptor;
				let value;
				
				try {
					//1. Obtain execution descriptor
					if (typeof sf === "function") {
						descriptor = sf.call(this, ...args);
					} else {
						descriptor = sf;
					}
					
					//2. Propagate value
					if (descriptor && typeof descriptor === "object")
						value = descriptor.value;
					
					//3. Execute side effects (Non-preview only)
					if (!preview_mode && descriptor && typeof descriptor.run === "function") {
						local_node.ui.information.status = "is_running";
						local_node.draw();
						await descriptor.run();
						local_node.ui.information.status = "finished";
						local_node.draw();
					} else if (!preview_mode) {
						local_node.ui.information.status = "finished";
						local_node.draw();
					}
				} catch (e) {
					console.error(`Node execution failed (${local_node.id})`, e);
					value = undefined;
				}
				
				this.main.variables[local_node.id] = value;
				local_node.ui.information.alluvial_width = Math.returnSafeNumber(descriptor?.alluvial_width, 1);
				local_node.ui.information.value = (descriptor?.display_value !== undefined) ? 
					descriptor.display_value : value;
				
				//Return statement
				return value;
			}));
		}
		
		//Return statement
		console.log(`Run finished.`);
		return this.main.variables;
	}
};

//Functional binding

/**
 * @returns {ve.NodeEditor}
 */
veNodeEditor = function () {
	//Return statement
	return new ve.NodeEditor(...arguments);
};