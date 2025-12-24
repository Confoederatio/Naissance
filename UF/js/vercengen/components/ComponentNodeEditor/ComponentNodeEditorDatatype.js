/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 * 
 * Represents a single node instance within a {@link ve.NodeEditor} that can have acyclic connections to other nodes within the same editor for DAG execution.
 * - Functional binding: <span color=00ffff>veNodeEditorDatatype</span>().
 * 
 * ##### Constructor:
 * - `arg0_value`: {@link Object}
 *   - `.category="Expression"` - The category that any {@link ve.NodeEditorDatatype} instances should belong to. Typically should either be 'Filter'/'Expression'.
 *   - `.coords`: {@link maptalks.Coordinate}|{x: {@link number}, y: {@link number}}
 *   - `.input_parameters=[]`: {@link Array}<{@link Object}> - The types of input parameters that will be accepted for evaluation.
 *     - `[n]`: {@link Object}
 *       - `.name`: {@link string}
 *       - `.type`: {@link string}
 *   - `.key`: {@link string}
 *   - `.name`: {@link string}
 *   - `.output_type="any"`: {@link string} - What the output (return) type is regarded as being. There can only be a single return type per Node, similar to functions in most programming languages.
 *   - `.special_function`: {@link function}(argn_arguments:{@link any}) ¦ {@link any} - If a filter, it should return an {@link Array}<{@link any}>.
 * - `arg1_options`: {@link Object}
 *   - `.alluvial_scaling=1`: {@link number} - How much to scale alluvial widths by when displayed compared to their actual number.
 *   - `.id=Class.generateRandomID(ve.NodeEditorDatatype)`: {@link string} - The ID to assign to the present datatype at a class level.
 *   - `.node_editor`: {@link ve.NodeEditor} - The node editor that this ve.NodeEditorDatatype is attached to.
 *   - `.show_alluvial=false`: {@link boolean}
 *   
 * ##### Instance:
 * - `.connections`: {@link Array}<{@link Array}<{@link ve.NodeEditorDatatype}, {@link number}>>
 * - `.constant_values`: {@link Array}
 * - `.dynamic_values`: {@link Array}
 * - `.geometries`: {@link Array}
 * - `.id`: {@link string}
 * - `.ui`: {@link Object}
 *   - `.information`: {@link Object}
 * - `.v`: {@link Object}
 * 
 * ##### Methods:
 * - <span color=00ffff>{@link ve.Component.NodeEditorDatatype.draw|draw}</span>()
 * - <span color=00ffff>{@link ve.Component.NodeEditorDatatype.getConnection|getConnection}</span>(arg0_node:{@link ve.NodeEditorDatatype}, arg1_index:{@link number}) | {@link number}
 * - <span color=00ffff>{@link ve.Component.NodeEditorDatatype.handleEvents|handleEvents}</span>()
 * - <span color=00ffff>{@link ve.Component.NodeEditorDatatype.hasConnection|hasConnection}</span>(arg0_index:{@link number}) | {@link boolean}
 * - <span color=00ffff>{@link ve.Component.NodeEditorDatatype.isSelected|isSelected}</span>(arg0_index:{@link number})
 * - <span color=00ffff>{@link ve.Component.NodeEditorDatatype.openContextMenu|openContextMenu}</span>()
 * - <span color=00ffff>{@link ve.Component.NodeEditorDatatype.remove|remove}</span>()
 * 
 * ##### Static Methods:
 * - <span color=00ffff>{@link ve.NodeEditorDatatype.draw|draw}</span>(arg0_options:{@link Object})
 * - <span color=00ffff>{@link ve.NodeEditorDatatype.getNode|getNode}</span>(arg0_node_id:{@link string}) | {@link ve.NodeEditorDatatype}
 *
 * @augments ve.Component
 * @memberof ve.Component
 * @type {ve.NodeEditorDatatype}
 */
ve.NodeEditorDatatype = class extends ve.Component {
	/**
	 * @type {ve.NodeEditorDatatype[]}
	 */
	static instances = [];
	/**
	 * Defines default type values for ve.NodeEditorDatatype parameters. 'any' is a fallback type if undefined.
	 * @type {{"<type_key>": any}}
	 */
	static types = {
		"number[]": [],
		"string[]": [],
		"boolean": false,
		"number": 0,
		"script": "",
		"string": "",
		
		"any": ""
	};
	
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = arg0_value;
		let options = (arg1_options) ? arg1_options : {};
			super(options);
			
		//Declare local instance variables
		this.connections = []; //[[ve.NodeEditorDatatype, index], ...];
		this.constant_values = [];
		this.dynamic_values = [];
		this.geometries = [];
		this.id = Class.generateRandomID(ve.NodeEditorDatatype);
		this.options = options;
		this.ui = {
			information: {}
		};
		this.value = (value) ? value : {};
		
		//Initialise value
		if (!this.value.name) this.value.name = this.value.key;
		
		//Draw call
		this.draw();
		ve.NodeEditorDatatype.instances.push(this);
		ve.NodeEditorDatatype.draw();
	}
	
	/**
	 * Returns the current JSON object from the component.
	 * - Accessor of: {@link ve.NodeEditorDatatype}
	 * 
	 * @alias v
	 * @memberof ve.Component.ve.NodeEditorDatatype
	 * @type {Object}
	 */
	get v () {
		return {
			id: this.id,
			key: this.value.key,
			// Strip Maptalks class methods, keep raw data
			coords: { x: this.value.coords.x, y: this.value.coords.y },
			constant_values: JSON.parse(JSON.stringify(this.constant_values)),
			// Map object references to IDs
			connections: this.connections.map(conn => [conn[0].id, conn[1]]),
			ui: {
				information: {
					alluvial_width: this.ui.information.alluvial_width,
					value: this.ui.information.value,
					dag_layer: this.ui.information.dag_layer
				}
			}
		};
	}
	
	/**
	 * Sets the current value of the ve.NodeEditorDatatype from available JSON.
	 * - Accessor of: {@link ve.NodeEditorDatatype}
	 *
	 * @alias v
	 * @memberof ve.Component.ve.NodeEditorDatatype
	 * 
	 * @param {Object} arg0_value
	 */
	set v (arg0_value) {
		let json = (typeof arg0_value === "string") ? JSON.parse(arg0_value) : arg0_value;
		if (!json) return;
		
		this.id = json.id || this.id;
		this.constant_values = Array.isArray(json.constant_values) ? json.constant_values : [];
		
		// Store connections temporarily; ve.NodeEditor.v will resolve these in Pass 2
		this._serialised_connections = json.connections || [];
		
		if (json.ui && json.ui.information)
			this.ui.information = { ...this.ui.information, ...json.ui.information };
	}
	
	/**
	 * Renders the current component's geometries as part of a partial draw() refresh.
	 * - Method of: {@link ve.NodeEditorDatatype}
	 *
	 * @alias _render
	 * @memberof ve.Component.ve.NodeEditorDatatype
	 * 
	 * @private
	 */
	_render () {
		//Add all geometries to layer
		for (let i = 0; i < this.geometries.length; i++) try {
			this.geometries[i].addTo(this.options.node_editor.node_layer);
		} catch (e) { console.warn(e); }
	}
	
	/**
	 * Draws the current component and refreshes it on the {@link ve.NodeEditor} scene.
	 * - Method of: {@link ve.NodeEditorDatatype}
	 *
	 * @alias draw
	 * @memberof ve.Component.ve.NodeEditorDatatype
	 */
	draw () {
		//Declare local instance variables
		let category_options = this.options.category_options;
		let coords = this.value.coords;
		
		let fill_colour = (category_options.colour) ? category_options.colour : "white";
			fill_colour = Colour.convertRGBAToHex(fill_colour);
		let marker_symbol = {
			textFill: "white",
			textHaloFill: "black",
			textHaloRadius: 1,
			textName: "•",
			textSize: { stops: [[12, 2], [14, 36]] }
		};
		let polygon_symbol = {
			polygonFill: fill_colour,
			textFaceName: "Karla",
			textFill: "white",
			textHaloFill: "black",
			textHaloRadius: 2,
			textSize: { stops: [[12, 2], [14, 14]] }
		};
		
		//Remove all this.geometries first
		for (let i = 0; i < this.geometries.length; i++)
			this.geometries[i].remove();
		this.geometries = [];
		
		//Set this.primary_geometry based on .coords
		{
			let extra_geometries = [];
			let primary_geometry = new maptalks.Rectangle(coords, 2000, 400, {
				properties: { id: this.id },
				symbol: {
					...polygon_symbol,
					lineColor: (this.isSelected(0)) ? "yellow" : "black",
					polygonOpacity: 0.8,
					
					textName: `${this.value.name} | ${(this.value.output_type) ? this.value.output_type : "any"}`
				}
			});
				let primary_left_marker = new maptalks.Marker(
					Geospatiale.translatePoint(coords, 0, -400*0.5),
					{ symbol: marker_symbol }
				);
				let primary_right_marker = new maptalks.Marker(
					Geospatiale.translatePoint(coords, 2000, -400*0.5),
					{ symbol: marker_symbol }
				);
				if (this.ui.information.dag_layer !== undefined) {
					let sequence_status_colour;
					let sequence_status_colours = {
						"other": "rgb(25, 25, 25)",
						"is_running": "rgb(240, 240, 140)",
						"finished": "rgb(44,108,53)"
					};
						if (this.ui.information.status) {
							sequence_status_colour = sequence_status_colours[this.ui.information.status];
						} else {
							sequence_status_colour = sequence_status_colours.other;
						}
					
					let primary_sequence_circle = new maptalks.Marker(
						Geospatiale.translatePoint(coords, 2000, 0),
						{
							symbol: {
								...marker_symbol,
								textFill: sequence_status_colour,
								textSize: { stops: [[12, 4], [14, 96]] }
							}
						}
					);
					let primary_sequence_text_marker = new maptalks.Marker(
						Geospatiale.translatePoint(coords, 2000, 14/2),
						{
							symbol: {
								...marker_symbol,
								textFaceName: "Karla",
								textName: `${this.ui.information.dag_layer}`,
								textSize: { stops: [[12, 2], [14, 14]] }
							}
						}
					);
					extra_geometries.push(primary_sequence_circle);
					extra_geometries.push(primary_sequence_text_marker);
				}
			let primary_geometry_collection = new maptalks.GeometryCollection([primary_geometry, primary_left_marker, primary_right_marker, ...extra_geometries], {
				draggable: true
			});
				primary_geometry_collection.addEventListener("click", (e) => {
					this.options.node_editor._select(this, 0);
				});
				primary_geometry_collection.addEventListener("contextmenu", (e) => {
					this.openContextMenu();
				});
			
			this.geometries.push(primary_geometry_collection);
		}
		
		//Iterate over all this.value.input_parameters and insert them from 1-n
		for (let i = 0; i < this.value.input_parameters.length; i++) {
			let local_parameter = this.value.input_parameters[i];
			let local_value_name = (this.constant_values[i]) ? ` | ${this.constant_values[i]}` : "";
				if (this.dynamic_values[i]) local_value_name = "";
				if (local_parameter.type === "script")
					local_value_name = ` | ${path.basename(local_value_name)}`;
			
			let local_rect = new maptalks.Rectangle(
				Geospatiale.translatePoint(coords, 0, -400*(i + 1)),
				2000, 400,
				{
					symbol: {
						...polygon_symbol,
						lineColor: (this.isSelected(i + 1)) ? "yellow" : "black",
						polygonOpacity: 0.5,
						
						textName: `${this.value.input_parameters[i].name} (${this.value.input_parameters[i].type})${local_value_name}`
					}
				}
			);
				let local_left_marker = new maptalks.Marker(
					Geospatiale.translatePoint(coords, 0, -400*(i + 1) - 400*0.5),
					{
						symbol: { ...marker_symbol, textFill: "rgba(255, 255, 255, 0.5)" }
					}
				);
			
			//Refresh this.geometries[i + 1]
			let local_geometry_collection = new maptalks.GeometryCollection([local_rect, local_left_marker]);
				local_geometry_collection.addEventListener("click", (e) => {
					this.options.node_editor._select(this, i + 1);
				});
				local_geometry_collection.addEventListener("contextmenu", (e) => {
					this.openContextMenu();
				});
			
			this.geometries.push(local_geometry_collection);
		}
		
		//Call local this._render(), then this.handleEvents()
		this._render();
		this.handleEvents();
	}
	
	/**
	 * Returns the index of a connection to another node.
	 * - Method of: {@link ve.NodeEditorDatatype}
	 *
	 * @alias getConnection
	 * @memberof ve.Component.ve.NodeEditorDatatype
	 * 
	 * @param {ve.NodeEditorDatatype} arg0_node
	 * @param {number} arg1_index
	 * 
	 * @returns {number}
	 */
	getConnection (arg0_node, arg1_index) {
		//Convert from parameters
		let node = arg0_node;
		let index = Math.returnSafeNumber(arg1_index);
		
		//Iterate over all this.connections for an exact match
		for (let i = 0; i < this.connections.length; i++)
			if (this.connections[i][0].id === node.id && this.connections[i][1] === index)
				//Return statement
				return i;
		return -1;
	}
	
	/**
	 * Handles events for the current component, especially for on-map click events.
	 * - Method of: {@link ve.NodeEditorDatatype}
	 *
	 * @alias handleEvents
	 * @memberof ve.Component.ve.NodeEditorDatatype
	 */
	handleEvents () {
		this.geometries[0].addEventListener("dragend", (e) => {
			this.value.coords = this.geometries[0].getFirstCoordinate();
			ve.NodeEditorDatatype.draw();
		});
	}
	
	/**
	 * Whether the current component has a connection with another node.
	 * - Method of: {@link ve.NodeEditorDatatype}
	 *
	 * @alias hasConnection
	 * @memberof ve.Component.ve.NodeEditorDatatype
	 * 
	 * @param {number} arg0_index
	 * @returns {boolean}
	 */
	hasConnection (arg0_index) {
		//Convert from parameters
		let index = Math.returnSafeNumber(arg0_index);
		
		//Iterate over all ve.NodeEditorDatatype.instances
		for (let i = 0; i < ve.NodeEditorDatatype.instances.length; i++) {
			let local_node = ve.NodeEditorDatatype.instances[i];
			
			//Iterate over all local_node.connections
			for (let x = 0; x < local_node.connections.length; x++)
				if (local_node.connections[x][0].id === this.id && local_node.connections[x][1] === index)
					//Return statement
					return true;
		}
	}
	
	/**
	 * Returns a boolean depending on whether the current index is selected.
	 * - Method of: {@link ve.NodeEditorDatatype}
	 *
	 * @alias isSelected
	 * @memberof ve.Component.ve.NodeEditorDatatype
	 * 
	 * @param {number} arg0_index
	 * @returns {boolean}
	 */
	isSelected (arg0_index) {
		//Convert from parameters
		let index = Math.returnSafeNumber(arg0_index);
		
		//Look over this.options.node_editor.main.user.selected_nodes
		let selected_nodes = this.options.node_editor.main.user.selected_nodes;
		
		//Iterate over all selected_nodes
		for (let i = 0; i < selected_nodes.length; i++)
			if (selected_nodes[i][0].id === this.id && selected_nodes[i][1] === index)
				//Return statement
				return true;
	}
	
	/**
	 * Opens the context menu UI for the given component.
	 * - Method of: {@link ve.NodeEditorDatatype}
	 *
	 * @alias openContextMenu
	 * @memberof ve.Component.ve.NodeEditorDatatype
	 */
	openContextMenu () {
		//Declare local instance variables
		let parameter_fields = {};
		
		//Iterate over all this.input_parameters and append them as fields to menu
		for (let i = 0; i < this.value.input_parameters.length; i++) {
			let is_actually_disabled = (this.dynamic_values[i] !== undefined); //Whether the parameter field should show up as being disabled because of a connection
			let local_parameter = this.value.input_parameters[i];
			let local_parameter_type = JSON.parse(JSON.stringify(local_parameter.type));
			let local_script_file_path = "";
			
			let local_parameter_options = {
				name: local_parameter.name ,
				x: 0, y: i,
				
				onuserchange: (v) => {
					if (!parameter_fields[`${local_parameter.name}_toggle`].v) return;
					this.constant_values[i] = v;
					ve.NodeEditorDatatype.draw();
				}
			};
			
			if (ve.NodeEditorDatatype.types[local_parameter_type] === undefined)
				local_parameter_type = "any";
			let local_default_value = (this.constant_values[i] !== undefined) ? 
				this.constant_values[i] : ve.NodeEditorDatatype.types[local_parameter_type];
			
			if (local_parameter_type === "number[]") {
				parameter_fields[local_parameter.name] = new ve.Number(local_default_value, local_parameter_options);
			} else if (local_parameter_type === "string[]") {
				parameter_fields[local_parameter.name] = new ve.Text(local_default_value, local_parameter_options);
			} else if (local_parameter_type === "boolean") {
				parameter_fields[local_parameter.name] = new ve.Toggle(local_default_value, local_parameter_options);
			} else if (local_parameter_type === "number") {
				parameter_fields[local_parameter.name] = new ve.Number(local_default_value, local_parameter_options);
			} else if (local_parameter_type === "script") { //[WIP] - Implement ve.ScriptManager window; read ve.ScriptManager's ._file_path upon closing and set the file path to that. If unavailable, ask for ._file_path using ve.File instead
				parameter_fields[local_parameter.name] = new ve.Button(() => {
					let local_script_value = "";
						if (fs.existsSync(local_default_value))
							local_script_value = fs.readFileSync(local_default_value, "utf8");
					let node_editor_registry = ve.registry.settings.NodeEditor;
					let settings_obj = {};
						let autosave_folder = this.options.node_editor.options.autosave_folder;
							if (autosave_folder) settings_obj.autosave_folder = autosave_folder;
					
					if (node_editor_registry.script_window) node_editor_registry.script_window.close();
					node_editor_registry.script_window = new ve.Window(new ve.ScriptManager(local_script_value, {
						folder_path: autosave_folder,
						settings: settings_obj,
						style: {
							height: "50rem"
						}
					}), {
						name: "ScriptManager",
						
						can_rename: false,
						height: "60rem",
						width: "50rem",
						
						onuserchange: (v) => {
							if (v.close) {
								let script_manager = node_editor_registry.script_window.component;
								
								if (script_manager._file_path) {
									this.constant_values[i] = script_manager._file_path;
									ve.NodeEditorDatatype.draw();
								} else {
									let file_prompt = new ve.File(undefined, {
										onuserchange: (v) => {
											if (v.length > 0) {
												this.constant_values[i] = v[0];
											} else {
												this.constant_values[i] = "";
											}
										},
										save_function: () => script_manager.v
									});
										file_prompt.openModal();
								}
							}
						}
					});
					if (fs.existsSync(local_default_value))
						node_editor_registry.script_window.component._file_path = local_default_value;
				}, {
					name: (this.constant_values[i]) ? "Edit Script" : "Create Script",
					tooltip: (this.constant_values[i]) ? this.constant_values[i] : undefined,
					x: 0, y: i
				});
			} else {
				parameter_fields[local_parameter.name] = new ve.Text(local_default_value, local_parameter_options);
			}
			
			parameter_fields[`${local_parameter.name}_toggle`] = new ve.Toggle(
				(this.constant_values[i] && !is_actually_disabled), { 
				off_name: `<icon class = "toggle-icon off">toggle_off</icon> &nbsp; ${(is_actually_disabled) ? "Is Connected" : "Disabled"}`,
				on_name: `<icon class = "toggle-icon on">toggle_on</icon> &nbsp; Enabled`,
				x: 1, y: i,
				
				onuserchange: (v) => {
					if (v === false) {
						this.constant_values[i] = undefined;
					} else if (v === true) {
						if (is_actually_disabled) {
							this.constant_values[i] = undefined;
							parameter_fields[`${local_parameter.name}_toggle`].v = false;
							
							veToast(`<icon>warning</icon> Constants will not apply here, since the given node is already connected.`);
						} else {
							if (local_parameter_type !== "script") {
								this.constant_values[i] = parameter_fields[local_parameter.name].v;
							} else {
								this.constant_values[i] = local_script_file_path;
							}
						}
					}
					ve.NodeEditorDatatype.draw();
				}
			});
		}
		
		//Redraw context menu
		if (this.context_menu) this.context_menu.close();
		this.context_menu = new ve.Window({
			...parameter_fields,
			delete_button: veButton(() => {
				this.remove();
			}, { 
				name: `<icon>delete</icon> Delete`
			})
		}, { 
			name: this.value.name, 
			width: "20rem", 
			
			can_rename: false
		});
	}
	
	/**
	 * Removes the component from the scene and memory.
	 * - Method of: {@link ve.NodeEditorDatatype}
	 *
	 * @alias remove
	 * @memberof ve.Component.ve.NodeEditorDatatype
	 */
	remove () {
		// 1. Remove from the parent Editor's local node list
		const editor = this.options.node_editor;
		if (editor && editor.main.nodes.includes(this)) {
			const local_index = editor.main.nodes.indexOf(this);
			editor.main.nodes.splice(local_index, 1);
		}
		
		// 2. Remove from static global instances and prune connections
		for (let i = ve.NodeEditorDatatype.instances.length - 1; i >= 0; i--) {
			let local_node = ve.NodeEditorDatatype.instances[i];
			
			if (local_node.id === this.id) {
				ve.NodeEditorDatatype.instances.splice(i, 1);
			} else {
				for (let x = local_node.connections.length - 1; x >= 0; x--)
					if (local_node.connections[x][0].id === this.id)
						local_node.connections.splice(x, 1);
			}
		}
		
		// 3. Remove all Maptalks geometries from the map
		for (let i = 0; i < this.geometries.length; i++)
			this.geometries[i].remove();
		this.geometries = [];
		
		// 4. UI cleanup
		if (this.context_menu) this.context_menu.close();
		ve.NodeEditorDatatype.draw();
	}
	
	/**
	 * Draws all node instances for all {@link ve.NodeEditor}s.
	 * - Static method of: {@link ve.NodeEditorDatatype}
	 *
	 * @alias #draw
	 * @memberof ve.Component.ve.NodeEditorDatatype
	 */
	static draw () {
		//1. Iterate over all ve.NodeEditor.instances; update all ve.NodeEditorDatatype.instances with their position in the dag_sequence
		for (let i = 0; i < ve.NodeEditor.instances.length; i++) {
			let local_node_editor = ve.NodeEditor.instances[i];
			
			let local_dag_sequence = local_node_editor.getDAGSequence();
			if (local_dag_sequence === undefined) continue;
			
			for (let x = 0; x < local_dag_sequence.length; x++)
				for (let y = 0; y < local_dag_sequence[x].length; y++) {
					let local_node = local_dag_sequence[x][y];
					local_node.ui.information.dag_layer = x;
				}
			local_node_editor.run(true);
		}
		
		//2. Iterate over all ve.NodeEditorDatatypes and call their draw functions
		for (let i = 0; i < ve.NodeEditorDatatype.instances.length; i++)
			ve.NodeEditorDatatype.instances[i].draw();
		
		//3. Iterate over all ve.NodeEditorDatatypes and draw connections
		for (let i = 0; i < ve.NodeEditorDatatype.instances.length; i++) {
			let local_node = ve.NodeEditorDatatype.instances[i];
			
			//Iterate over all local_node.connections
			for (let x = 0; x < local_node.connections.length; x++) {
				let arc_connector_name = (local_node.ui.information.value !== undefined) ? 
					local_node.ui.information.value : undefined;
				let arc_connector_text_symbol = (arc_connector_name !== undefined) ? {
					textName  : arc_connector_name.toString(),
					textFaceName: "Karla",
					textFill: "white",
					textHaloFill: "black",
					textHaloRadius: 2,
					textPlacement: "line",
					textSize: { stops: [[12, 2], [14, 14]] }
				} : undefined;
				let local_ot_node = ve.NodeEditorDatatype.getNode(local_node.connections[x][0]);
				
				let arc_connector_line = new maptalks.ArcConnectorLine(
					local_node.geometries[0].getGeometries()[2],
					local_ot_node.geometries[local_node.connections[x][1]].getGeometries()[1],
					{
						arcDegree: 90,
						arrowStyle : 'classic',
						arrowPlacement : 'vertex-last',
						showOn: "always",
						properties: {
							from_geometry_id: local_node.id,
							to_geometry_id: local_ot_node.id
						},
						symbol: {
							lineColor: 'white',
							lineWidth: Math.returnSafeNumber(local_node?.ui?.information?.alluvial_width, 1),
							...arc_connector_text_symbol
						}
					}
				);
				arc_connector_line.addTo(local_node.options.node_editor.node_layer);
				arc_connector_line._showConnect();
				local_node.geometries.push(arc_connector_line);
			}
		}
	}
	
	/**
	 * Returns a NodeEditorDatatype instance depending on its id.
	 * - Static method of: {@link ve.NodeEditorDatatype}
	 *
	 * @alias #getNode
	 * @memberof ve.Component.ve.NodeEditorDatatype
	 * 
	 * @param {string|ve.NodeEditorDatatype} arg0_node_id
	 * 
	 * @returns {ve.NodeEditorDatatype}
	 */
	static getNode (arg0_node_id) {
		//Convert from parameters
		let node_id = arg0_node_id;
		if (node_id instanceof ve.NodeEditorDatatype) return node_id; //Internal guard clause for ve.NodeEditorDatatype
		
		//Iterate over all ve.NodeEditorDatatype instances
		for (let i = 0; i < ve.NodeEditorDatatype.instances.length; i++)
			if (ve.NodeEditorDatatype.instances[i].id === node_id)
				//Return statement; first exact match
				return ve.NodeEditorDatatype.instances[i];
	}
}

//Functional binding

/**
 * @returns {ve.NodeEditorDatatype}
 */
veNodeEditorDatatype = function () {
	//Return statement
	return new ve.NodeEditorDatatype(...arguments);
};