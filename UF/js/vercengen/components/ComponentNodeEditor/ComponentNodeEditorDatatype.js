/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 * 
 * Creates a Node instance within the current {@link ve.NodeEditor} that can be connected to other nodes. Note that this is a subtype of NodeEditor and must be bound as such to its {@link ve.NodeEditor.main.nodes}: {@link Array}.
 * - Functional binding: <span color=00ffff>veNodeEditorDatatype</span>().
 * 
 * ##### Constructor:
 * - `arg0_value`: {@link Object}
 * - `arg1_options`: {@link Object}
 *   - `.category_options`: {@link Object} - Used for determining colour and other related options.
 *   - `.is_comment=false`; {@link boolean}
 *   - `.node_editor`: {@link ve.NodeEditor}
 *   
 * ##### Instance:
 * - `.connections`: {@link Array}<{@link Array}<{@link ve.NodeEditorDatatype}, {@link number}>> - [0] represents the node of the given connection, [1] represents the given index.
 * - `.constant_values`: {@link Array}
 * - `.dynamic_values`: {@link Array}
 * - `.geometries`: {@link Array}<{@link maptalks.Geometry}>
 * - `.id`: {@link string}
 * - `.ui`: {@link Object}
 *   - `.information`: {@link Object}
 * - `.v`: {@link Object} - Parses to/from JSON in Object form.
 * 
 * ##### Methods:
 * - <span color=00ffff>{@link ve.NodeEditorDatatype._render|_render}</span>()
 * - <span color=00ffff>{@link ve.NodeEditorDatatype.draw|draw}</span>()
 * - <span color=00ffff>{@link ve.NodeEditorDatatype.getConnection|getConnection}</span>(arg0_node:{@link ve.NodeEditorDatatype}, arg1_index:{@link number}) | {@link number}
 * - <span color=00ffff>{@link ve.NodeEditorDatatype.handleEvents|handleEvents}</span>()
 * - <span color=00ffff>{@link ve.NodeEditorDatatype.hasConnection|hasConnection}</span>(arg0_index:{@link number}) | {@link boolean}
 * - <span color=00ffff>{@link ve.NodeEditorDatatype.isSelected|isSelected}</span>(arg0_index:{@link number}) | {@link boolean}
 * - <span color=00ffff>{@link ve.NodeEditorDatatype.openContextMenu|openContextMenu}</span>()
 * - <span color=00ffff>{@link ve.NodeEditorDatatype.remove|remove}</span>()
 * - <span color=00ffff>{@link ve.NodeEditorDatatype.toJSON|toJSON}</span>() | {@link Object}
 * 
 * ##### Static Fields:
 * - `.instances`: {@link Array}<{@link ve.NodeEditorDatatype}>
 * - `.types`: {@link Object}
 * 
 * ##### Static Methods:
 * - <span color=00ffff>{@link ve.NodeEditorDatatype.draw|draw}</span>(arg0_editor:{@link ve.NodeEditor})
 * - <span color=00ffff>{@link ve.NodeEditorDatatype.getNode|getNode}</span>(arg0_node_id:{@link string}, arg1_editor:{@link ve.NodeEditor})
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
	 * @type {Object}
	 */
	static types = {
		"number[]": [],
		"string[]": [],
		any: "",
		boolean: false,
		number: 0,
		script: "",
		string: "",
	};
	
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = arg0_value;
		let options = arg1_options ? arg1_options : {};
			super(options);
		
		//Declare local instance variables
		this.connections = [];
		this.constant_values = (value.constant_values) ? 
			JSON.parse(JSON.stringify(value.constant_values)) : [];
		this.dynamic_values = [];
		this.geometries = [];
		this.id = (value.id) ? value.id : Class.generateRandomID(ve.NodeEditorDatatype);
		this.options = options;
		this._serialised_connections = (value.connections || []);
		this.ui = { information: {} };
		
		//Draw node upon instantiation
		if (value.ui && value.ui.information)
			this.ui.information = { ...value.ui.information };
		this.value = (value) ? value : {};
		if (!this.value.name) this.value.name = this.value.key;
		
		ve.NodeEditorDatatype.instances.push(this);
		this.draw();
	}
	
	/**
	 * Returns the JSON compatible object representing the current component.
	 * - Accessor of: {@link ve.NodeEditorDatatype}
	 * 
	 * @alias v
	 * @memberof ve.Component.ve.NodeEditorDatatype
	 * @type {Object}
	 */
	get v () {
		let current_coords = this.value.coords;
		if (this.geometries[0]) {
			let geo_coords = this.geometries[0].getFirstCoordinate();
			current_coords = { x: geo_coords.x, y: geo_coords.y };
		}
		
		//Return statement
		return {
			connections: this.connections.map((conn) => [conn[0].id, conn[1]]),
			constant_values: JSON.parse(JSON.stringify(this.constant_values)),
			coords: current_coords,
			id: this.id,
			key: this.value.key,
			display_name: this.value.display_name,
			name: this.value.name,
			ui: {
				information: {
					alluvial_width: this.ui.information.alluvial_width,
					dag_layer: this.ui.information.dag_layer,
					value: this.ui.information.value,
				},
			},
		};
	}
	
	/**
	 * Sets the current value from a JSON compatible object.
	 * - Accessor of: {@link ve.NodeEditorDatatype}
	 * 
	 * @alias v
	 * @memberof ve.Component.ve.NodeEditorDatatype
	 * @param {Object|string} arg0_value
	 */
	set v (arg0_value) {
		//Convert from parameters
		let json = (typeof arg0_value === "string") ? JSON.parse(arg0_value) : arg0_value;
		if (!json) return; //Internal guard clause if JSON is not defined
		
		//Declare local instance variables
		this.id = json.id || this.id;
		this.constant_values = (Array.isArray(json.constant_values)) ? 
			json.constant_values : [];
		this._serialised_connections = json.connections || [];
		this.value.coords = json.coords || this.value.coords;
		this.value.name = json.name || this.value.name;
		if (json.display_name) this.value.display_name = json.display_name;
		
		//Draw node once value changes
		if (json.ui && json.ui.information)
			this.ui.information = { ...this.ui.information, ...json.ui.information };
		this.draw();
	}
	
	/**
	 * Renders the current node where appropriate.
	 * - Method of: {@link ve.NodeEditorDatatype}
	 *
	 * @alias _render
	 * @memberof ve.Component.ve.NodeEditorDatatype
	 * 
	 * @private
	 */
	_render() {
		//Declare local instance variables
		let layer = this.options.node_editor.node_layer;
		if (!layer) return; //Internal guard clause if the present layer is not defined
		
		//Iterate over all geometries
		for (let i = 0; i < this.geometries.length; i++)
			try {
				this.geometries[i].addTo(layer);
			} catch (e) {
				console.warn(e);
			}
	}
	
	/**
	 * Draws the present node.
	 * - Method of: {@link ve.NodeEditorDatatype}
	 *
	 * @alias draw
	 * @memberof ve.Component.ve.NodeEditorDatatype
	 */
	draw () {
		//Declare local instance variables
		let category_options = this.options.category_options || {};
		let coords = this.value.coords;
		let is_comment = this.options.is_comment === true;
		
		let fill_colour = (category_options.colour || [255, 255, 255, 1]);
			fill_colour = Colour.convertRGBAToHex(fill_colour);
			if (is_comment) fill_colour = "#fff9c4";
		let marker_symbol = {
			textFill: "white",
			textHaloFill: "black",
			textHaloRadius: 1,
			textName: "•",
			textSize: {
				stops: [
					[12, 2],
					[14, 36],
				],
			},
		};
		let polygon_symbol = {
			polygonFill: fill_colour,
			textFaceName: "Karla",
			textFill: is_comment ? "black" : "white",
			textHaloFill: is_comment ? "none" : "black",
			textHaloRadius: is_comment ? 0 : 2,
			textSize: {
				stops: [
					[12, 2],
					[14, 14],
				],
			},
		};
		
		//Iterate over all geometries and start drawing them
		for (let i = 0; i < this.geometries.length; i++) this.geometries[i].remove();
		this.geometries = [];
		
		//Draw this.geometries, then push it to the map
		{
			let comment_options = (is_comment) ? {
				textWrapCharacter: "\\n"
			} : {};
			let display_name = (this.value.display_name) ? this.value.display_name : this.value.name;
			let extra_geometries = [];
			let height = (is_comment) ? 1200 : 400;
			let width = 2000;
			
			let primary_geometry = new maptalks.Rectangle(coords, width, height, {
				properties: { id: this.id },
				symbol: {
					...polygon_symbol,
					lineColor: this.isSelected(0) ? "yellow" : "black",
					polygonOpacity: 0.8,
					textName: is_comment
						? display_name
						: `${display_name} | ${
							this.value.output_type ? this.value.output_type : loc("ve.registry.localisation.NodeEditorDatatype_any")
						}`,
					textWrapWidth: is_comment ? 1000 : undefined,
					...comment_options
				},
			});
			
			//Non-comment handling
			if (!is_comment) {
				extra_geometries.push(new maptalks.Marker(
					Geospatiale.translatePoint(coords, 0, -400 * 0.5),
					{ symbol: marker_symbol },
				));
				extra_geometries.push(new maptalks.Marker(Geospatiale.translatePoint(coords, 2000, -400 * 0.5),
					{ symbol: marker_symbol },
				));
			}
			
			if (!is_comment && this.ui.information.dag_layer !== undefined) {
				let sequence_status_colour = {
						aborted: "rgb(150, 50, 50)",
						error: "rgb(255, 0, 0)",
						finished: "rgb(44,108,53)",
						is_running: "rgb(160,160,31)",
						other: "rgb(25, 25, 25)",
					}[this.ui.information.status || "other"] || "rgb(25, 25, 25)";
				
				extra_geometries.push(new maptalks.Marker(Geospatiale.translatePoint(coords, 2000, 0), {
					symbol: {
						...marker_symbol,
						textFill: sequence_status_colour,
						textSize: {
							stops: [
								[12, 4],
								[14, 96],
							],
						},
					},
				}));
				extra_geometries.push(new maptalks.Marker(Geospatiale.translatePoint(coords, 2000, 7), {
					symbol: {
						...marker_symbol,
						textFaceName: "Karla",
						textName: `${this.ui.information.dag_layer}`,
						textSize: {
							stops: [
								[12, 2],
								[14, 14],
							],
						},
					},
				}));
			}
			
			let primary_geometry_collection = new maptalks.GeometryCollection(
				[primary_geometry, ...extra_geometries],
				{ draggable: true },
			);
			primary_geometry_collection.addEventListener("click", () => this.options.node_editor._select(this, 0));
			primary_geometry_collection.addEventListener("contextmenu", () => this.openContextMenu());
			
			this.geometries.push(primary_geometry_collection);
		}
		
		if (!is_comment) {
			if (this.value.input_parameters)
				//Iterate over all input_parameters and append them to the primary_geometry
				for (let i = 0; i < this.value.input_parameters.length; i++) {
					let local_parameter = this.value.input_parameters[i];
					let local_value_name = (this.constant_values[i]) ? 
						` | ${this.constant_values[i]}` : "";
					if (this.dynamic_values[i]) local_value_name = "";
					
					//Script type basename handling
					if (local_parameter.type === "script" && this.constant_values[i])
						local_value_name = ` | ${path.basename(this.constant_values[i])}`;
					
					//Draw local_rect and input marker
					let local_rect = new maptalks.Rectangle(
						Geospatiale.translatePoint(coords, 0, -400 * (i + 1)),
						2000, 400, {
							symbol: {
								...polygon_symbol,
								lineColor: this.isSelected(i + 1) ? "yellow" : "black",
								polygonOpacity: 0.5,
								textName: `${local_parameter.name} (${local_parameter.type})${local_value_name}`,
							},
						});
					let local_left_marker = new maptalks.Marker(
						Geospatiale.translatePoint(coords, 0, -400 * (i + 1) - 400 * 0.5), {
							symbol: {
								...marker_symbol,
								textFill: "rgba(255, 255, 255, 0.5)",
							},
						});
					
					let local_geometry_collection = new maptalks.GeometryCollection([
						local_rect,
						local_left_marker,
					]);
					local_geometry_collection.addEventListener("click", () => this.options.node_editor._select(this, i + 1));
					local_geometry_collection.addEventListener("contextmenu", (e) => this.openContextMenu());
					
					this.geometries.push(local_geometry_collection);
				}
		}
		
		//Render node and initialise events handler
		this._render();
		this.handleEvents();
	}
	
	/**
	 * Returns the given index of a connection, i.e. the node an input parameter is connected to,
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
		
		//Iterate over all connections
		for (let i = 0; i < this.connections.length; i++)
			if (this.connections[i][0].id === node.id && this.connections[i][1] === index)
				//Return statement
				return i;
		return -1;
	}
	
	/**
	 * Handles events for the given node.
	 * - Method of: {@link ve.NodeEditorDatatype}
	 *
	 * @alias handleEvents
	 * @memberof ve.Component.ve.NodeEditorDatatype
	 */
	handleEvents () {
		//Initialise event handlers
		this.geometries[0].addEventListener("dragend", (e) => {
			let first_coord = this.geometries[0].getFirstCoordinate();
			this.value.coords = { x: first_coord.x, y: first_coord.y };
			ve.NodeEditorDatatype.draw(this.options.node_editor);
		});
	}
	
	/**
	 * Checks if an index in the node, i.e. an input parameter has a connection. Note that the 0th index represents the base output.
	 * - Method of: {@link ve.NodeEditorDatatype}
	 *
	 * @alias hasConnection
	 * @memberof ve.Component.ve.NodeEditorDatatype
	 * 
	 * @param {number} arg0_index
	 * 
	 * @returns {boolean}
	 */
	hasConnection (arg0_index) {
		//Convert from parameters
		let index = Math.returnSafeNumber(arg0_index);
		
		//Iterate over all Node instances to check to check if it has a target connection
		for (let i = 0; i < ve.NodeEditorDatatype.instances.length; i++) {
			let local_node = ve.NodeEditorDatatype.instances[i];
			if (local_node.options.node_editor !== this.options.node_editor) continue;
			
			//Iterate over all indices to check for a connection with that index
			for (let x = 0; x < local_node.connections.length; x++)
				if (local_node.connections[x][0].id === this.id && local_node.connections[x][1] === index)
					//Return statement
					return true;
		}
		
		//Return statement
		return false;
	}
	
	/**
	 * Checks if a given index in the node, i.e. an input parameter is currently selected. Note that the 0th index represents the base output.
	 * - Method of: {@link ve.NodeEditorDatatype}
	 *
	 * @alias isSelected
	 * @memberof ve.Component.ve.NodeEditorDatatype
	 * 
	 * @param {number} arg0_index
	 * 
	 * @returns {boolean}
	 */
	isSelected (arg0_index) {
		//Convert from parameters
		let index = Math.returnSafeNumber(arg0_index);
		
		//Declare local instance variables
		let selected_nodes = this.options.node_editor.main.user.selected_nodes;
		
		//Iterate over all selected_nodes
		for (let i = 0; i < selected_nodes.length; i++)
			if (selected_nodes[i][0].id === this.id && selected_nodes[i][1] === index)
				//Return statement
				return true;
		return false;
	}
	
	/**
	 * Opens a context menu for editing the current node.
	 * - Method of: {@link ve.NodeEditorDatatype}
	 *
	 * @alias openContextMenu
	 * @memberof ve.Component.ve.NodeEditorDatatype
	 */
	openContextMenu () {
		//Declare local instance variables
		let parameter_fields = {};
		
		//Comment handling
		if (this.options.is_comment) {
			parameter_fields["text"] = new ve.Text(this.value.display_name, {
				name: loc("ve.registry.localisation.NodeEditorDatatype_comment_text"),
				onuserchange: (v) => {
					this.value.display_name = v;
					ve.NodeEditorDatatype.draw(this.options.node_editor);
				},
			});
		} else {
			//Non-comment handling
			
			//Iterate over all input_parameters and append them as fields
			for (let i = 0; i < this.value.input_parameters.length; i++) {
				let is_actually_disabled = this.dynamic_values[i] !== undefined;
				let local_parameter = this.value.input_parameters[i];
				let local_parameter_type = JSON.parse(JSON.stringify(local_parameter.type));
					if (ve.NodeEditorDatatype.types[local_parameter_type] === undefined)
						local_parameter_type = "any";
				let local_script_file_path = "";
				
				let local_default_value = (this.constant_values[i] !== undefined) ? 
					this.constant_values[i] : ve.NodeEditorDatatype.types[local_parameter_type];
				let local_parameter_options = {
					name: local_parameter.name,
					onuserchange: (v) => {
						if (!parameter_fields[`${local_parameter.name}_toggle`].v) return;
						this.constant_values[i] = v;
						ve.NodeEditorDatatype.draw(this.options.node_editor);
					},
					x: 0, y: i,
				};
				
				if (local_parameter_type === "number[]") {
					parameter_fields[local_parameter.name] = new ve.Number(
						local_default_value, local_parameter_options);
				} else if (local_parameter_type === "string[]") {
					parameter_fields[local_parameter.name] = new ve.Text(
						local_default_value, local_parameter_options);
				} else if (local_parameter_type === "boolean") {
					parameter_fields[local_parameter.name] = new ve.Toggle(
						local_default_value, local_parameter_options);
				} else if (local_parameter_type === "number") {
					parameter_fields[local_parameter.name] = new ve.Number(
						local_default_value, local_parameter_options);
				} else if (local_parameter_type === "script") {
					//ve.ScriptManager/IDE handling for script types
					parameter_fields[local_parameter.name] = new ve.Button(() => {
						let local_script_value = "";
						if (fs.existsSync(local_default_value))
							local_script_value = fs.readFileSync(local_default_value, "utf8");
						
						let node_editor_registry = ve.registry.settings.NodeEditor;
						let settings_obj = {};
						let project_folder =
							this.options.node_editor.options.project_folder;
						if (project_folder) settings_obj.project_folder = project_folder;
						
						//Initialise script_window
						if (node_editor_registry.script_window)
							node_editor_registry.script_window.close();
						node_editor_registry.script_window = new ve.Window(new ve.ScriptManager(local_script_value, {
							folder_path: project_folder,
							settings: settings_obj,
							style: { height: "50rem" },
						}), {
							name: loc("ve.registry.localisation.DatavisSuite_script_manager"),
							can_rename: false,
							height: "60rem",
							width: "50rem",
							onuserchange: (v) => {
								if (v.close) {
									let script_manager = node_editor_registry.script_window.component;
									
									if (script_manager._file_path) {
										this.constant_values[i] = script_manager._file_path;
										ve.NodeEditorDatatype.draw(this.options.node_editor);
									} else {
										let file_prompt = new ve.File(undefined, {
											onuserchange: (v) => {
												if (v.length > 0) {
													this.constant_values[i] = v[0];
												} else {
													this.constant_values[i] = "";
												}
											},
											save_function: () => script_manager.v,
										});
										file_prompt.openModal();
									}
								}
							}
						});
						
						if (fs.existsSync(local_default_value))
							node_editor_registry.script_window.component._file_path = local_default_value;
					}, {
						name: this.constant_values[i] ? loc("ve.registry.localisation.NodeEditorDatatype_edit_script") : loc("ve.registry.localisation.NodeEditorDatatype_create_script"),
						tooltip: (this.constant_values[i]) ? this.constant_values[i] : undefined,
						x: 0, y: i,
					});
				} else {
					parameter_fields[local_parameter.name] = new ve.Text(local_default_value, local_parameter_options);
				}
				
				//Set parameter toggles
				parameter_fields[`${local_parameter.name}_toggle`] = new ve.Toggle(this.constant_values[i] !== undefined && !is_actually_disabled, {
					off_name: `<icon class = "toggle-icon off">toggle_off</icon> &nbsp; ${is_actually_disabled ? loc("ve.registry.localisation.NodeEditorDatatype_is_connected") : loc("ve.registry.localisation.NodeEditorDatatype_disabled")}`,
					on_name: `<icon class = "toggle-icon on">toggle_on</icon> &nbsp; ${loc("ve.registry.localisation.NodeEditorDatatype_enabled")}`,
					onuserchange: (v) => {
						if (v === false) {
							this.constant_values[i] = undefined;
						} else if (v === true) {
							if (is_actually_disabled) {
								this.constant_values[i] = undefined;
								parameter_fields[`${local_parameter.name}_toggle`].v = false;
								veToast(`<icon>warning</icon> ${loc("ve.registry.localisation.NodeEditorDatatype_toast_constants_warning")}`);
							} else {
								//Script toggle condition
								if (local_parameter_type !== "script")
									this.constant_values[i] = (local_parameter_type !== "script") ? 
										parameter_fields[local_parameter.name].v : local_script_file_path;
							}
						}
						ve.NodeEditorDatatype.draw(this.options.node_editor);
					},
					x: 1, y: i
				});
			}
		}
		
		//Open context menu window for the given node
		if (this.context_menu) this.context_menu.close();
		this.context_menu = new ve.Window({
			...parameter_fields,
			actions_bar: new ve.RawInterface({
				delete_button: new ve.Button(() => this.remove(),{
					name: `<icon>delete</icon> ${loc("ve.registry.localisation.NodeEditorDatatype_delete")}`
				}),
				run_from_node: new ve.Button(() => {
					this.options.node_editor.run(false, this);
					veToast(loc("ve.registry.localisation.NodeEditorDatatype_toast_run_from_node", (this.value.display_name) ? this.value.display_name : this.value.name));
				}, {
					name: `<icon>play_arrow</icon> ${loc("ve.registry.localisation.NodeEditorDatatype_run_from_node")}`,
				})
			}, {
				style: {
					marginTop: "var(--cell-padding)",
					"button": { marginRight: "var(--cell-padding)" }
				},
				width: 99
			})
		}, { 
			name: this.value.name,
			can_rename: false,
			width: "20rem", 
	 	});
	}
	
	/**
	 * Removes the present node from its {@link ve.NodeEditor} scene.
	 * - Method of: {@link ve.NodeEditorDatatype}
	 *
	 * @alias remove
	 * @memberof ve.Component.ve.NodeEditorDatatype
	 */
	remove () {
		//Declare local instance variables
		let editor = this.options.node_editor;
		if (editor && editor.main.nodes.includes(this))
			editor.main.nodes.splice(editor.main.nodes.indexOf(this), 1);
		
		//Iterate over all datatype instances to remove the current match
		for (let i = ve.NodeEditorDatatype.instances.length - 1; i >= 0; i--) {
			let local_node = ve.NodeEditorDatatype.instances[i];
			
			if (local_node === this) {
				ve.NodeEditorDatatype.instances.splice(i, 1);
			} else if (local_node.options.node_editor === editor) {
				//Iterate over all connections and remove them
				for (let x = local_node.connections.length - 1; x >= 0; x--)
					if (local_node.connections[x][0].id === this.id)
						local_node.connections.splice(x, 1);
			}
		}
		
		//Iterate over all geometries attached to the datatype and remove it
		for (let i = 0; i < this.geometries.length; i++) 
			this.geometries[i].remove();
		this.geometries = [];
		
		if (this.context_menu) this.context_menu.close();
		ve.NodeEditorDatatype.draw(editor);
	}
	
	/**
	 * Converts the current node to a JSON-compatible object.
	 * - Method of: {@link ve.NodeEditorDatatype}
	 * 
	 * @alias toJSON
	 * @memberof ve.Component.ve.NodeEditorDatatype
	 * 
	 * @returns {Object} 
	 */
	toJSON () {
		//Return statement
		return this.v;
	}
	
	/**
	 * Draws the present node within its {@link ve.NodeEditor} context.
	 * - Static method of: {@link ve.NodeEditorDatatype}
	 * 
	 * @alias #draw
	 * @memberof ve.Component.ve.NodeEditorDatatype
	 * 
	 * @param {ve.NodeEditor} arg0_editor
	 * @param {boolean} [arg1_do_not_run=false] - Whether to run the editor when visualising the draw call.
	 */
	static draw (arg0_editor, arg1_do_not_run) {
		//Convert from parameters
		let editor = arg0_editor;
		let do_not_run = arg1_do_not_run;
		if (!editor) return; //Internal guard clause if editor doesn't exist
		
		//Declare local instance variables
		let local_dag_sequence = editor.getDAGSequence();
		if (!local_dag_sequence) return; //Internal guard clause if DAG isn't valid
		
		//Iterate over local_dag_sequence and assign .dag_layer
		for (let i = 0; i < local_dag_sequence.length; i++)
			for (let x = 0; x < local_dag_sequence[i].length; x++)
				local_dag_sequence[i][x].ui.information.dag_layer = i;
		
		//Perform background dag run
		if (!do_not_run)
			try {	editor.run(true); } catch (e) { console.error(e); }
		
		//Iterate over all nodes and draw them
		for (let i = 0; i < ve.NodeEditorDatatype.instances.length; i++) {
			let local_node = ve.NodeEditorDatatype.instances[i];
			if (local_node.options.node_editor === editor) local_node.draw();
		}
		
		//Iterate over all nodes and draw connections
		for (let i = 0; i < ve.NodeEditorDatatype.instances.length; i++) {
			let local_node = ve.NodeEditorDatatype.instances[i];
			if (local_node.options.node_editor !== editor) continue;
			
			//Iterate over all local connections and draw them
			for (let x = 0; x < local_node.connections.length; x++) {
				let arc_connector_name = local_node.ui.information.value;
				let arc_connector_text_symbol = (arc_connector_name !== undefined) ? {
					textFaceName: "Karla",
					textFill: "white",
					textHaloFill: "black",
					textHaloRadius: 2,
					textName: arc_connector_name.toString(),
					textPlacement: "line",
					textSize: {
						stops: [
							[12, 2],
							[14, 14],
						],
					},
				}	: undefined;
				
				//Pass ed to getNode to ensure we link to nodes within the same editor
				let local_ot_node = ve.NodeEditorDatatype.getNode(local_node.connections[x][0], editor);
				if (!local_ot_node) continue; //Continue if other node doesn't exist
				
				let local_alluvial_width = Math.returnSafeNumber(local_node?.ui?.information?.alluvial_width,1);
					if (local_node.options.node_editor) {
						let node_editor_obj = local_node.options.node_editor;
						
						local_alluvial_width *= Math.returnSafeNumber(node_editor_obj.options.alluvial_scaling, 1);
						if (node_editor_obj.options.show_alluvial)
							local_alluvial_width = 1;
					}
				
				let arc_connector_line = new maptalks.ArcConnectorLine(
					local_node.geometries[0].getGeometries()[2],
					local_ot_node.geometries[local_node.connections[x][1]].getGeometries()[1], {
						arcDegree: 90,
						arrowPlacement: "vertex-last",
						arrowStyle: "classic",
						properties: {
							from_geometry_id: local_node.id,
							to_geometry_id: local_ot_node.id,
						},
						showOn: "always",
						symbol: {
							lineColor: "white",
							lineWidth: local_alluvial_width,
							...arc_connector_text_symbol,
						},
					});
				
				//Add connector line
				arc_connector_line.addTo(editor.node_layer);
				arc_connector_line._showConnect();
				local_node.geometries.push(arc_connector_line);
			}
		}
	}
	
	/**
	 * Fetches a node from its {@link ve.NodeEditor} and ID.
	 * - Static method of: {@link ve.NodeEditorDatatype}
	 * 
	 * @alias #getNode
	 * @memberof ve.Component.ve.NodeEditorDatatype
	 * 
	 * @param {string} arg0_node_id
	 * @param {ve.NodeEditor} arg1_editor
	 * 
	 * @returns {ve.NodeEditorDatatype}
	 */
	static getNode (arg0_node_id, arg1_editor) {
		//Convert from parameters
		let node_id = arg0_node_id;
		let editor = arg1_editor;
		if (node_id instanceof ve.NodeEditorDatatype) return node_id; //Internal guard clause if it is already a node
		
		//Iterate over all nodes
		for (let i = 0; i < ve.NodeEditorDatatype.instances.length; i++) {
			let local_node = ve.NodeEditorDatatype.instances[i];
			if (local_node.id === node_id) {
				//If editor is provided, ensure the node belongs to that specific editor
				if (editor && local_node.options.node_editor !== editor) continue;
				
				//Return statement
				return local_node;
			}
		}
	}
};

//Functional binding
veNodeEditorDatatype = function () {
	return new ve.NodeEditorDatatype(...arguments);
};