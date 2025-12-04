/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 * 
 * Undo/Redo interface with the ability for users to navigate between different {@link DALS.Timeline} instances. Undo/Redo tree by default with both a canvas interface and HTML list.
 * 
 * ##### Constructor:
 * - `arg0_value=DALS.Timeline.current_timeline`: {@link string} - The timeline ID the initial value should be set to.
 * - `arg1_options`: {@link Object}
 * 
 * ##### Instance:
 * - `.v`: {@link string}
 * 
 * ##### Methods:
 * - <span color=00ffff>{@link ve.UndoRedo.draw|draw}</span>() - Redraws both HTML/canvas-side elements.
 * - <span color=00ffff>{@link ve.UndoRedo.handleEvents|handleEvents}</span>() - Handles events for zooming/panning around canvas.
 * 
 * @augments ve.Component
 * @augments {@link ve.Component}
 * @class
 * @memberof ve.Component
 * @type {ve.UndoRedo}
 */
ve.UndoRedo = class extends ve.Component {
	constructor (arg0_value, arg1_options) {
		let value = arg0_value;
		let options = {
			sort_mode: "last_modified",
			...arg1_options
		};
			super(options);
			
		//Initialise options
		if (options.flipped !== false) options.flipped = true;
		
		//Declare local instance variables
		this.element = document.createElement("div");
			this.element.setAttribute("component", "ve-undo-redo");
			this.element.instance = this;
			if (options.attributes)
				Object.iterate(options.attributes, (local_key, local_value) => this.element.setAttribute(local_key, local_value.toString()));
			
		this.options = options;
		this.value = value; //Stores timeline_id
		
		//Add HTML list, canvas
		this.canvas_container_el = document.createElement("div");
			this.canvas_el = document.createElement("canvas");
			this.canvas_container_el.id = `canvas-container`;
			this.canvas_container_el.appendChild(this.canvas_el);
		this.html_list_el = document.createElement("div");
		
		//Create a ve.PageMenu with this.html_list_el, this.canvas_container_el, and mount it to this.element
		let actions_bar = () => new ve.RawInterface({
			undo_button: new ve.Button(() => DALS.Timeline.undo(), {
				name: "<icon>undo</icon>", tooltip: "Undo" }),
			redo_button: new ve.Button(() => DALS.Timeline.redo(), {
				name: "<icon>redo</icon>", tooltip: "Redo" })
		}, { name: " " });
		
		this.page_menu = new ve.PageMenu({
			current_timeline: {
				name: "Timeline View",
				components_obj: {
					actions_bar: actions_bar(),
					html: new ve.HTML(this.html_list_el)
				}
			},
			timeline_map: {
				name: "Actions Map",
				components_obj: {
					actions_bar: actions_bar(),
					html: new ve.HTML(this.canvas_container_el),
					coords_display: new ve.HTML(() => `X: ${String.formatNumber(this.translate_x, 2)}, Y: ${String.formatNumber(this.translate_y, 2)} | Scale: ${String.formatNumber(this.scale, 2)}`)
				}
			}
		}, { 
			name: this.options.name,
			onchange: (v, e) => {
				if (v === "current_timeline") {
					this.from_binding_fire_silently = true;
					this.v = DALS.Timeline.current_timeline;
					delete this.from_binding_fire_silently;
				}
			}
		});
		this.element.appendChild(this.page_menu.element);
		
		//KEEP AT BOTTOM!
		setTimeout(() => {
			this.draw();
			this.handleEvents();
		});
		this.v = DALS.Timeline.current_timeline;
	}
	
	/**
	 * Returns the current {@link DALS.Timeline} object of the present Component.
	 * - Accessor of: {@link ve.UndoRedo}
	 *
	 * @alias v
	 * @memberof ve.Component.ve.UndoRedo
	 * @type {DALS.Timeline}
	 * 
	 * @returns {DALS.Timeline}
	 */
	get v () {
		//Return statement
		return DALS.Timeline.getTimeline(this.value);
	}
	
	/**
	 * Sets the new {@link DALS.Timeline} from a timeline ID.
	 * - Method of: {@link ve.UndoRedo}
	 *
	 * @alias v
	 * @memberof ve.Component.ve.UndoRedo
	 * @type {DALS.Timeline}
	 * 
	 * @param arg0_value
	 */
	set v (arg0_value) {
		//Convert from parameters
		let value = DALS.Timeline.current_timeline;
			if (arg0_value instanceof DALS.Timeline) value = arg0_value.id;
			if (typeof arg0_value === "string") value = arg0_value;
			if (arg0_value === undefined) value = DALS.Timeline.current_timeline;
		
		//Declare local instance variables
		this.value = value;
		
		//Render Canvas list; scavenge code from old Naissance
		{
			this.draw(true);
			this.fireFromBinding();
		}
	}
	
	/**
	 * Redraws the current interface.
	 * - Method of: {@link ve.Interface}
	 *
	 * @alias draw
	 * @memberof ve.Component.ve.UndoRedo
	 */
	draw (arg0_force_update) {
		//Convert from parameters
		let force_update = arg0_force_update;
		
		//Force update if DALS.Timeline.current_timeline has changed
		if (
			DALS.Timeline.current_timeline !== this.current_timeline ||
			DALS.Timeline.current_index !== this.current_index
		) {
			force_update = true;
			this.value = DALS.Timeline.current_timeline;
		}
		
		//Render canvas
		{
			//Declare local instance variables
			let ctx = this.canvas_el.getContext("2d");
			let timeline_graph;
			if (!this.options.flipped) {
				timeline_graph = DALS.Timeline.generateGraph();
			} else {
				for (let i = 0; i < DALS.Timeline.instances.length; i++)
					if (DALS.Timeline.instances[i].initial_timeline) {
						timeline_graph = DALS.Timeline.instances[i].generateFlippedGraph();
						break;
					}
			}
			
			let canvas_height = 0;
			let canvas_width = 0;
			let node_height = 14;
			let spacing_x = 240;
			let spacing_y = 60;
			
			//Store node positions for event handling
			let node_positions = {};
			let row_tracker = {};
			
			//Clear previous render
			ctx.clearRect(0, 0, this.canvas_el.width, this.canvas_el.height);
			
			//1. Iterate over timeline_graph keys and render nodes
			this.unique_timeline_ids = (this.unique_timeline_ids) ? this.unique_timeline_ids : [];
			
			Object.iterate(timeline_graph, (local_key, local_value) => {
				let local_x = local_value.x*spacing_x - 50;
				let local_y = local_value.y*spacing_y + 10;
				
				//Initialise row_tracker
				if (!row_tracker[local_value.y]) row_tracker[local_value.y] = [];
				row_tracker[local_value.y].push(local_key);
				
				//Measure text width and define node height
				let is_selected = false;
				if (
					local_value.timeline_id === DALS.Timeline.current_timeline && 
					DALS.Timeline.current_index >= local_value.value.options.domain[0] + 1 &&
					DALS.Timeline.current_index <= local_value.value.options.domain[1] + 1
				)
					is_selected = true;
				
				let node_text;
				if (local_value.value.options && local_value.value.options.name)
					node_text = `${local_value.value.options.name} (${String.formatNumber(local_value.value.options.length)})`;
				if (node_text === undefined) node_text = "Unlisted";
				if (local_value.child_timelines && local_value.x === 1)
					node_text = "S. Init";
				if (local_value.parent_timeline)
					node_text = "Split From Timeline";
				let text_height = node_text.split("\n").length*node_height;
				let text_width = ctx.measureText(node_text).width;
				
				//Store position for click detection
				//console.log(local_value, local_value.timeline_index);
				node_positions[local_key] = {
					id: `${local_value.x}-${local_value.y}`,
					name: node_text,
					
					is_selected: is_selected,
					timeline_id: local_value.timeline_id,
					timeline_index: local_value.timeline_index,
					value: local_value.value,
					is_branch_point: (local_value.timeline_group_index === 0),
					
					height: text_height,
					width: text_width,
					x: local_x,
					y: local_y
				};
			});
			
			//2. Calculate canvas.height, canvas.width
			Object.iterate(node_positions, (local_key, local_value) => {
				canvas_height = Math.max(canvas_height, Math.returnSafeNumber(local_value.y + local_value.height));
				canvas_width = Math.max(canvas_width, Math.returnSafeNumber(local_value.x + local_value.width));
			});
			this.canvas_el.setAttribute("height", canvas_height);
			this.canvas_el.setAttribute("width", canvas_width);
			
			//3. Draw DALS.Action nodes
			Object.iterate(node_positions, (local_key, local_value) => {
				if (local_value.is_selected) {
					ctx.fillStyle = `rgb(235, 235, 235)`;
					ctx.fillRect(local_value.x - local_value.width/2 - local_value.height/2, local_value.y - local_value.height, local_value.width + local_value.height, local_value.height*2);
				}
				ctx.fillStyle = (!local_value.is_selected) ? "white" : "black";
				ctx.font = `${node_height}px Karla Light`;
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";
				ctx.fillText(local_value.name, local_value.x, local_value.y);
			});
			
			//4. Draw horizontal lines
			Object.iterate(row_tracker, (local_key, local_value) => {
				local_value = local_value.sort((a, b) => node_positions[a].x - node_positions[b].x);
				
				for (let i = 0; i < local_value.length - 1; i++) {
					let local_start_key = local_value[i];
					let local_end_key = local_value[i + 1];
					
					let local_start_node = node_positions[local_start_key];
					let local_end_node = node_positions[local_end_key];
					
					//Only draw if end node is a branch point
					if (local_end_node.is_branch_point) {
						let local_start_x = local_start_node.x + local_start_node.width/2 + local_start_node.height/2;
						let local_start_y = local_start_node.y;
						let local_end_x = local_end_node.x - local_end_node.width/2 - local_end_node.height/2;
						let local_end_y = local_end_node.y;
						
						ctx.beginPath();
						ctx.moveTo(local_start_x, local_start_y);
						ctx.lineTo(local_end_x, local_end_y);
						ctx.strokeStyle = "white";
						ctx.lineWidth = 2;
						ctx.stroke();
						ctx.closePath();
					}
				}
			});
			
			//5. Draw vertical lines
			Object.iterate(timeline_graph, (local_key, local_value) => {
				let local_node = node_positions[local_key];
				let local_start_x = local_node.x;
				let local_start_y = local_node.y - local_node.height;
				
				if (local_value.connection_ids)
					for (let i = 0; i < local_value.connection_ids.length; i++)
						if (node_positions[local_value.connection_ids[i]]) {
							let local_connecting_node = node_positions[local_value.connection_ids[i]];
							let local_end_x = local_connecting_node.x;
							let local_end_y = local_connecting_node.y + local_node.height;
							
							//Draw line between nodes
							ctx.beginPath();
							ctx.moveTo(local_start_x, local_start_y);
							ctx.lineTo(local_end_x, local_end_y);
							ctx.strokeStyle = "white";
							ctx.lineWidth = 2;
							ctx.stroke();
							ctx.closePath();
						}
			});
			
			//6. Add click event listener to detect node clicks
			this.canvas_el.onclick = (e) => {
				let canvas_el_rect = this.canvas_el.getBoundingClientRect();
				let click_x = (e.clientX - canvas_el_rect.left)/this.scale;
				let click_y = (e.clientY - canvas_el_rect.top)/this.scale;
				
				//Iterate over all node_positions
				Object.iterate(node_positions, (local_key, local_value) => {
					if (
						click_x >= local_value.x - local_value.width/2 && click_x <= local_value.x + local_value.width/2 && click_y >= local_value.y - local_value.height/2 && click_y <= local_value.y + local_value.height/2
					) {
						let local_timeline = DALS.Timeline.getTimeline(local_value.timeline_id);
						console.log(`Calling local_timeline.jumpToAction(${Math.returnSafeNumber(local_value.value.options.domain[1]) + 1})!`);
						local_timeline.jumpToAction(Math.returnSafeNumber(local_value.value.options.domain[1]) + 1);
						
						if (local_timeline.id !== DALS.Timeline.current_timeline) {
							this.from_binding_fire_silently = true;
								DALS.Timeline.current_timeline = local_timeline.id;
								this.v = local_timeline.id;
								this.fireToBinding();
							delete this.from_binding_fire_silently;
						}
					}
				});
			};
		}
		
		//1. Render HTML
		{
			//Declare local instance variables
			let skip_html_redraw = false;
			let skip_timeline_redraw = false;
			let timeline_obj = DALS.Timeline.getTimeline(this.value);
			
			if (this.html_timeline_length === timeline_obj.value.length) skip_html_redraw = true;
			if (this.timeline_select_obj)
				if (DALS.Timeline.instances.length === Object.keys(this.timeline_select_obj).length) skip_timeline_redraw = true;
				
			if (!(skip_html_redraw && skip_timeline_redraw) || force_update) {
				this.html_timeline_length = timeline_obj.value.length;
				
				if (!timeline_obj) {
					this.value = DALS.Timeline.current_timeline;
					timeline_obj = DALS.Timeline.getTimeline(this.value);
				}
				
				this.html_list_el.innerHTML = "";
				this.timeline_select_obj = {};
				
				//Iterate over all DALS.Timeline.instances and list them in order of length
				if (this.options.sort_mode === "alphabetical_ascending") {
					DALS.Timeline.instances.sort((a, b) => a.name.localeCompare(b.name));
				} else if (this.options.sort_mode === "alphabetical_descending") {
					DALS.Timeline.instances.sort((a, b) => a.name.localeCompare(b.name));
					DALS.Timeline.instances.reverse();
				} else if (this.options.sort_mode === "chronological_ascending") {
					DALS.Timeline.instances.sort((a, b) => a.date_created.getTime() - b.date_created.getTime());
				} else if (this.options.sort_mode === "chronological_descending") {
					DALS.Timeline.instances.sort((a, b) => b.date_created.getTime() - a.date_created.getTime());
				} else if (this.options.sort_mode === "last_modified") {
					DALS.Timeline.instances.sort((a, b) => b.last_modified.getTime() - a.last_modified.getTime());
				} else if (this.options.sort_mode === "least_actions") {
					DALS.Timeline.instances.sort((a, b) => a.value.length - b.value.length);
				} else if (this.options.sort_mode === "most_actions") {
					DALS.Timeline.instances.sort((a, b) => b.value.length - a.value.length);
				}
				
				for (let i = 0; i < DALS.Timeline.instances.length; i++) {
					let local_timeline = DALS.Timeline.instances[i];
					
					this.timeline_select_obj[local_timeline.id] = {
						name: `${(local_timeline.name) ? local_timeline.name : local_timeline.id} (${String.formatNumber(local_timeline.value.length)})`,
						selected: (local_timeline.id === this.value)
					};
				}
				
				this.html_select = new ve.Interface({
					select_field: new ve.Select(this.timeline_select_obj, {
						name: "Viewing:",
						onchange: (v, e) => {
							this.value = v;
							this.draw(true);
							this.fireToBinding();
						},
						x: 0, y: 0
					}),
					filter_button: new ve.Button(() => {
						let local_context_menu = new ve.ContextMenu({
							radio_select: new ve.Radio({
								"Alphabetical (A-Z)": (this.options.sort_mode === "alphabetical_ascending"),
								"Alphabetical (Z-A)": (this.options.sort_mode === "alphabetical_descending"),
								"Chronological (Ascending)": (this.options.sort_mode === "chronological_ascending"),
								"Chronological (Descending)": (this.options.sort_mode === "chronological_descending"),
								"Last Modified": (this.options.sort_mode === "last_modified"),
								"Least Actions": (this.options.sort_mode === "least_actions"),
								"Most Actions": (this.options.sort_mode === "most_actions")
							}, {
								name: "<b>Sort Timelines:</b><br><br>",
								onchange: (v, e) => {
									let local_dictionary = {
										"Alphabetical (A-Z)": "alphabetical_ascending",
										"Alphabetical (Z-A)": "alphabetical_descending",
										"Chronological (Ascending)": "chronological_ascending",
										"Chronological (Descending)": "chronological_descending",
										"Last Modified": "last_modified",
										"Least Actions": "least_actions",
										"Most Actions": "most_actions"
									};
									
									this.options.sort_mode = local_dictionary[v];
									this.draw(true);
								}
							})
						}, { id: "ve_undo_redo_html_select_filter" });
					}, { name: "<icon>filter_alt</icon>", tooltip: "Sorting Filter", x: 1, y: 0 }),
					timeline_name: new ve.Text(timeline_obj.name, { 
						name: "Name: ",
						onchange: (v, e) => {
							timeline_obj.name = v;
							this.draw(true);
						},
						x: 0, y: 1, width: 99 
					})
				}, { is_folder: false }); 
				
				this.html_information = new ve.HTML(() => `Timeline ID: ${DALS.Timeline.current_timeline} | Index: #${DALS.Timeline.current_index}<br><li style = "margin-left: calc(var(--padding)*2);"><b>Active Branch</b>: ${DALS.Timeline.getTimeline(DALS.Timeline.current_timeline).name}</li>`);
				this.html_list_el.appendChild(this.html_select.element);
				this.html_list_el.appendChild(this.html_information.element);
				
				//Iterate over timeline_groups, and add list items depending on the length
				let current_index = 1;
				let timeline_groups = timeline_obj.getGroups();
				let ul_el = document.createElement("ul");
					ul_el.classList.add("no-markers");
				
				for (let i = 0; i < timeline_groups.length; i++) { //[WIP] - Worth checking if we need a +/-1 offset later
					//Create header_el with Jump To/Branch buttons
					let group_el = document.createElement("li");
					let local_domain =  timeline_groups[i][0].options.domain;
						local_domain = [Math.returnSafeNumber(local_domain[0]), Math.returnSafeNumber(local_domain[1])];
					let local_index = JSON.parse(JSON.stringify(current_index));
					let local_name = `New Action`;
					if (timeline_groups[i] && timeline_groups[i][0] && timeline_groups[i][0].name)
						local_name = timeline_groups[i][0].name;
					
					let is_selected = (DALS.Timeline.current_timeline === timeline_obj.id && DALS.Timeline.current_index >= local_domain[0] && DALS.Timeline.current_index <= local_domain[1]) 
						|| (local_domain[0] === 0 && DALS.Timeline.current_index === 1);
					
					let header_el = new ve.RawInterface({
						action_name: new ve.HTML(`${local_name} (${String.formatNumber(timeline_groups[i].length)})&nbsp;&nbsp;<br>#${Math.max(local_domain[0], 1)} - ${Math.max(local_domain[1], 1)}`, {
							attributes: {
								"data-is-selected": is_selected
							},
							style: {
								display: "inline-block"
							}
						}),
							
						jump_to_button: new ve.Button(() => {
							console.log(`timeline_obj.jumpToAction(${local_index} + ${timeline_groups[i].length});`, local_index + timeline_groups[i].length);
							console.log(`- local_index:`, local_index, `+ timeline_groups[i].length:`, timeline_groups[i].length);
							timeline_obj.jumpToAction(local_index + timeline_groups[i].length - 1);
							this.fireToBinding();
						}, { 
							name: `<icon>arrow_right_alt</icon>`, tooltip: `Jump To`,
							style: { 
								"button": {
									marginLeft: "var(--padding)"
								},
								marginLeft: "auto", order: 99 
							}
						}),
						branch: new ve.Button(() => {
							DALS.Timeline.current_index = current_index + timeline_groups[i].length;
							let new_timeline = timeline_obj.branch();
								DALS.Timeline.current_timeline = new_timeline.id;
								DALS.Timeline.current_index = 0;
								new_timeline.jumpToStart();
							this.fireToBinding();
						}, { 
							name: `<icon>alt_route</icon>`, tooltip: `Branch At Node`,
							style: { order: 100 }
						})
					}, {
						style: {
							alignItems: "center",
							display: "flex"
						}
					});
					
					//Append main header in div; don't split it up to prevent DOM lag
					group_el.appendChild(header_el.element);
					ul_el.appendChild(group_el);
					
					//Keep track of current_index
					current_index += timeline_groups[i].length;
				}
				
				this.html_list_el.appendChild(ul_el);
			}
		}
		
		this.current_index = JSON.parse(JSON.stringify(DALS.Timeline.current_index));
		this.current_timeline = JSON.parse(JSON.stringify(DALS.Timeline.current_timeline));
	}
	
	/**
	 * Handles events for {@link this.canvas_container_el}.
	 * - Method of: {@link ve.Interface}
	 *
	 * @alias handleEvents
	 * @memberof ve.Component.ve.UndoRedo
	 */
	handleEvents () {
		//Declare local instance variables
		this.is_panning = false;
		this.scale = 1;
		this.start_x = 0;
		this.start_y = 0;
		this.translate_x = 0;
		this.translate_y = 0;
		
		//Add drag/pan options
		this.canvas_container_el.parentElement.addEventListener("mousedown", (e) => {
			if (e.button === 1) { //Middle Mouse Button (MMB)
				this.is_panning = true;
				this.start_x = e.clientX - this.translate_x;
				this.start_y = e.clientY - this.translate_y;
				e.preventDefault(); //Prevent scrolling
			}
		});
		this.canvas_container_el.parentElement.addEventListener("mouseleave", () => this.is_panning = false); //Mouseleave (stop panning)
		this.canvas_container_el.parentElement.addEventListener("mousemove", (e) => {
			if (this.is_panning) {
				this.translate_x = e.clientX - this.start_x;
				this.translate_y = e.clientY - this.start_y;
				internalHelperUndoRedoUITransform();
			}
		}); //Mousemove (only when panning)
		this.canvas_container_el.parentElement.addEventListener("mouseup", () => this.is_panning = false); //Mouseup (stop panning)
		
		//Zoom handling (scroll to zoom)
		this.canvas_container_el.parentElement.addEventListener("wheel", (e) => {
			e.preventDefault();
			let zoom_factor = 1.1;
			
			//Limit new_scale to a reasonable range
			let new_scale = (e.deltaY < 0) ? this.scale*zoom_factor : this.scale/zoom_factor;
				new_scale = Math.max(0.1, Math.min(new_scale, 5));
			let current_rect = this.canvas_container_el.getBoundingClientRect();
			let offset_x = (e.clientX - current_rect.left)/current_rect.width;
			let offset_y = (e.clientY - current_rect.top)/current_rect.height;
			
			//Adjust translation based on zoom centre
			this.scale = new_scale;
			this.translate_x -= (offset_x - 0.5)*current_rect.width*(new_scale - this.scale);
			this.translate_y -= (offset_y - 0.5)*current_rect.height*(new_scale - this.scale);
			
			internalHelperUndoRedoUITransform();
		});
		this.undo_redo_loop = setInterval(() => this.draw(), 100);
		
		let internalHelperUndoRedoUITransform = () => {
			this.canvas_container_el.style.transform = `translate(${this.translate_x}px, ${this.translate_y}px) scale(${this.scale})`;
		}
	}
};