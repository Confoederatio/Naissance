/**
 * <span color = "yellow">{@link DALS.Timeline}</span>: Represents a singular timeline in an undo/redo tree within the Delta Action Logging System (DALS). `.value` is structured as an {@link Array}<{@link Object}>, with [0] representing the head state, and subsequent elements state mutations.
 * 
 * Note that actions should generally be pushed to a timeline using the corresponding <span color=00ffff>{@link DALS.Timeline.addAction|addAction}</span>(arg0_json:{@link Object}|{@link string}) function. <span color=00ffff>DALS.undo</span>()/<span color=00ffff>DALS.redo</span>() should generally be called instead of specific jumpTo() instructions within a timeline.
 * 
 * ##### Constructor:
 * - `arg0_options`: {@link Object}
 *   - `.name`: {@link string}
 *   - `.parent_timeline`: {@link Array}<{@link string}, {@link number}> - [0] represents the {@link DALS.Timeline} `.id` belonging to the parent timeline, and [1] the index of the parent branch node.
 * 
 * ##### Instance:
 * - `.id=Class.generateRandomID(DALS.Timeline)`: {@link string}
 * - `.initial_timeline`: {@link boolean}
 * - `.name="Timeline " + this.id`: {@link string}
 * - `.parent_timeline`: {@link Array}<{@link string}, {@link number}>
 * - `.value`: {@link Array}<{@link string}> - Array of JSON strings. [0] represents the state head, [n] represents state mutations.
 * 
 * ##### Methods:
 * - <span color=00ffff>{@link DALS.Timeline.addAction|addAction}</span>(arg0_json:{@link Object}|{@link string}, arg1_options:{ do_not_parse_action:{@link boolean} }) | {@link DALS.Action} - Pushes an action to the timeline, and attempts to parse it automatically.
 * - <span color=00ffff>{@link DALS.Timeline.branch|branch}</span>(arg0_options:{@link Object}) | {@link DALS.Timeline} - `arg0_options` is the same as the options asked for DALS.Timeline.
 * - <span color=00ffff>{@link DALS.Timeline.delete|delete}</span>() - Deletes and removes the present timeline.
 * - <span color=00ffff>{@link DALS.Timeline.jumpToAction|jumpToAction}</span>(arg0_action_id:{@link number}|{@link string})
 * - <span color=00ffff>{@link DALS.Timeline.jumpToEnd|jumpToEnd}</span>()
 * - <span color=00ffff>{@link DALS.Timeline.jumpToStart|jumpToStart}</span>()
 * - <span color=00ffff>{@link DALS.Timeline.removeAction|removeAction}</span>(arg0_action_id:{@link number}|{@link string}) - `arg0_action_id` is either the index of the action, or its `.id`.
 * 
 * - <span color=00ffff>{@link DALS.Timeline.fromJSON|fromJSON}</span>(arg0_json:{@link Object}|{@link string}) | {@link DALS.Timeline}
 * - <span color=00ffff>{@link DALS.Timeline.toJSON|toJSON}</span>() | {@link Object}
 * 
 * ##### Static Fields:
 * - `.current_index`: {@link number} - The index of the current timeline the state is at.
 * - `.current_timeline`: {@link string} - The ID of the current timeline being displayed.
 * - `.instances`: {@link Array}<{@link DALS.Timeline}>
 * 
 * ##### Static Methods:
 * - <span color=00ffff>{@link DALS.Timeline.fromJSON|fromJSON}</span>(arg0_json:{@link Object}|{@link string}, arg1_options:{@link Object})
 * - <span color=00ffff>{@link DALS.Timeline.getTimeline|getTimeline}</span>(arg0_timeline_id:{@link string}) | {@link DALS.Timeline} - Returns a DALS.Timeline object given a timeline ID.
 * - <span color=00ffff>{@link DALS.Timeline.jumpToTimeline|jumpToTimeline}</span>(arg0_timeline_id:{@link string}) - Jumps to the head state of a specific timeline.
 * - <span color=00ffff>{@link DALS.Timeline.load|load}</span>(arg0_file_path:{@link string}, arg1_options:{@link Object})
 * - <span color=00ffff>{@link DALS.Timeline.save|save}</span>(arg0_file_path:{@link string})
 * - <span color=00ffff>{@link DALS.Timeline.toJSON|toJSON}</span>() | {@link Object}
 * 
 * @class
 * @memberof DALS
 * @type {DALS.Timeline}
 */
DALS.Timeline = class {
	//Declare local static variables
	/** @type {number} */
	static current_index = 0;
	/** @type {string} */
	static current_timeline;
	/** @type {DALS.Timeline[]} */
	static instances = [];
	
	constructor (arg0_options) {
		//Convert from parameters
		let options = (arg0_options) ? arg0_options : {};
		
		//Declare local instance variables
		if (DALS.Timeline.instances.length === 0)
			this.initial_timeline = true;
		this.child_timelines = []; //Cache: tracker variable
		this.date_created = new Date();
		this.id = Class.generateRandomID(DALS.Timeline);
		this.last_modified = new Date();
		this.name = (options.name) ? options.name : `${loc("ve.registry.localisation.UndoRedo_timeline")} ${this.id}`;
		this.options = options;
		this.parent_timeline = options.parent_timeline;
		this.value = [DALS.toJSON()];
		
		//Ensure that the current timeline is always the last timeline created/split off
		if (options.current_timeline !== false)
			DALS.Timeline.current_timeline = this.id;
		DALS.Timeline.instances.push(this);
	}
	
	/**
	 * Adds a given action to the current timeline and immediately parses it by default.
	 * - Method of: {@link DALS.Timeline}
	 * 
	 * @param {Object|string} arg0_json
	 * @param {Object} [arg1_options]
	 *  @param {boolean} [arg1_options.do_not_parse_action=false]
	 * 
	 * @returns {DALS.Action}
	 */
	async addAction (arg0_json, arg1_options) {
		//Convert from parameters
		let json = (typeof arg0_json !== "string") ? JSON.stringify(arg0_json) : arg0_json;
		let options = (arg1_options) ? arg1_options : {};
		
		//Declare local instance variables
		let json_obj = JSON.parse(json);
		
		if (json_obj.options === undefined) json_obj.options = {};
		if (json_obj.options.timeline === undefined) json_obj.options.timeline = this.id;
		
		let new_action = new DALS.Action(json_obj);
		
		if (!options.do_not_parse_action) {
			let action_key = json_obj.key || json_obj.options?.key;
			let action_value = (json_obj.value !== undefined) ? json_obj.value : json_obj;
			
			await DALS.Timeline.parseAction(action_key, action_value, true);
		}
		
		//Return statement
		return new_action;
	}
	
	/**
	 * Assigns the `.child_timelines` field for the present timeline by looking for any attached {@link DALS.Timeline} instances.
	 * - Method of: {@link DALS.Timeline}
	 */
	assignChildTimelines () {
		//Declare local instance variables
		let timeline_obj = true;
		
		//Iterate over DALS.Timeline.instances
		for (let i = 0; i < DALS.Timeline.instances.length; i++) {
			let local_child_timelines = [];
			let local_timeline = DALS.Timeline.instances[i];
			
			//Iterate over all DALS.Timeline.instances again to finish assignment
			for (let x = 0; x < DALS.Timeline.instances.length; x++) {
				let local_second_timeline = DALS.Timeline.instances[x];
				
				if (local_second_timeline.parent_timeline && local_second_timeline.parent_timeline[0] === local_timeline.id)
					if (!local_child_timelines.includes(local_second_timeline.id) && local_second_timeline.id !== local_timeline.id)
						local_child_timelines.push(local_second_timeline.id);
			}
			
			if (local_child_timelines.length > 0)
				local_timeline.child_timelines = local_child_timelines;
		}
	}
	
	/**
	 * Branches off a new timeline from the current timeline. If the current timeline is not selected, the branch node is automatically placed at the end of the timeline.
	 * - Method of: {@link DALS.Timeline}
	 * 
	 * @param {Object} [arg0_options={}] - Refer to {@link DALS.Timeline}.options for information on what options are acceptable.
	 * 
	 * @returns {DALS.Timeline}
	 */
	branch (arg0_options) {
		//Convert from parameters
		let options = (arg0_options) ? arg0_options : {};
		
		//Declare local instance variables
		options.current_timeline = false;
		let new_timeline = new DALS.Timeline(options);
			if (DALS.Timeline.current_timeline === this.id) {
				new_timeline.parent_timeline = [this.id, DALS.Timeline.current_index];
			} else {
				new_timeline.parent_timeline = [this.id, this.value.length - 1];
			}
		
		//Return statement
		return new_timeline;
	}
	
	/**
	 * Deletes the present timeline and removes its references.
	 * - Method of: {@link DALS.Timeline}
	 */
	async delete () {
		if (DALS.Timeline.instances.length <= 1) {
			//Simply clear the entire state since the last timeline is being removed
			this.value = [];
			delete DALS.Timeline.current_timeline;
			DALS.Timeline.instances = [];
			DALS.fromJSON({});
		} else {
			//1. Reassign all branched timelines to this timeline's .parent_timeline
			for (let i = 0; i < DALS.Timeline.instances.length; i++) {
				let local_timeline = DALS.Timeline.instances[i];
				
				if (local_timeline.parent_timeline === this.id)
					local_timeline.parent_timeline = this.parent_timeline;
			}
			
			//2. If the current timeline is being removed, jump to this.parent_timeline index
			if (DALS.Timeline.current_timeline === this.id) {
				let parent_timeline_obj = DALS.Timeline.getTimeline(this.parent_timeline[0]);
				await parent_timeline_obj.jumpToAction(this.parent_timeline[1]);
			}
			
			//3. Iterate over DALS.Timeline.instances; delete from DALS.Timeline.instances
			for (let i = 0; i < DALS.Timeline.instances.length; i++)
				if (DALS.Timeline.instances[i].id === this.id) {
					DALS.Timeline.instances.splice(i, 1);
					break;
				}
		}
	}
	
	/**
	 * Overwrites the current timeline instance with data from a JSON object.
	 * - Method of: {@link DALS.Timeline}
	 *
	 * @param {Object|string} arg0_json
	 *
	 * @returns {DALS.Timeline}
	 */
	fromJSON (arg0_json) {
		//Convert from parameters
		let json = (typeof arg0_json === "string") ? JSON.parse(arg0_json) : arg0_json;
		
		//Declare local instance variables
		this.id = json.id;
		this.initial_timeline = (json.initial_timeline !== undefined) ? json.initial_timeline : this.initial_timeline;
		this.name = json.name;
		this.parent_timeline = json.parent_timeline;
		this.date_created = new Date(json.date_created);
		this.last_modified = new Date(json.last_modified);
		
		//Reconstruct value array. [0] is the head state JSON
		this.value = [json.value[0]];
		
		//Reconstruct Actions for indices [1...n]
		for (let i = 1; i < json.value.length; i++) {
			let action_json = json.value[i];
			
			//Inject current timeline ID into options to ensure the Action constructor attaches correctly
			if (!action_json.options) action_json.options = {};
			action_json.options.timeline = this.id;
			
			//Re-instantiate action; the constructor handles placement into this.value
			DALS.Action.fromJSON(action_json);
		}
		
		//Return statement
		return this;
	}
	
	/**
	 * Flips a generated graph from generateGraph() by switching the `.x`/`.y` coordinates of each node.
	 * - Method of: {@link DALS.Timeline}
	 * 
	 * @returns {Object}
	 */
	generateFlippedGraph () {
		//Declare local instance variables
		let timeline_graph = this.generateGraph();
		
		//Iterate over timeline_graph and flip coordinates
		Object.iterate(timeline_graph, (local_key, local_value) => {
			if (local_value.x !== undefined && local_value.y !== undefined) {
				let old_x = JSON.parse(JSON.stringify(local_value.x));
				let old_y = JSON.parse(JSON.stringify(local_value.y));
				
				//Flip coordinates
				local_value.x = old_y;
				local_value.y = old_x;
			}
		});
		
		//Return statement
		return timeline_graph;
	}
	
	/**
	 * Generates a timeline graph starting from the current {@link DALS.Timeline} instance with plotted `.x`/`.y` fields for node positions. Used in {@link ve.Component.UndoRedo} for rendering canvas displays.
	 * - Method of: {@link DALS.Timeline}
	 *
	 * @param {Object} arg0_options
	 *
	 * @returns {Object}
	 */
	generateGraph (arg0_options) {
		//Convert from parameters
		let options = (arg0_options) ? arg0_options : {};
		
		//Declare local instance variables
		/**
		 * Object list of UI elements.
		 * - `.connections`: ({@link Array}<{@link Array}<x:{@link number}, y:{@link number}>>
		 * @type {{x: number, y: number, name: string, connections: number[][]}}
		 */
		let current_y_offset = Math.returnSafeNumber(options.y_offset);
		let timeline_graph = {};
		let timeline_obj = this;
		let x_offset = Math.returnSafeNumber(options.x_offset);
		let y_offset = Math.returnSafeNumber(options.y_offset);
		
		//1. Create list of .child_timelines first
		if (this.initial_timeline)
			this.assignChildTimelines();
		
		//Get groups early for use in both Stage 2 and Stage 3
		let timeline_groups = this.getGroups.call(timeline_obj);
		
		//2. Produce graph at this layer only for the current timeline and all .child_timelines connected to it, then call recursively
		if (timeline_obj.child_timelines)
			for (let i = 0; i < timeline_obj.child_timelines.length; i++) {
				let branch_group = 0;
				let local_child_timeline = DALS.Timeline.getTimeline(this.child_timelines[i]);
					//Iterate over all timeline_groups; determine branch_group
					let target_index = local_child_timeline.parent_timeline[1];
				
					for (let x = 0; x < timeline_groups.length; x++) try {
						let local_domain = timeline_groups[x][0].options.domain;
						
						if (target_index >= local_domain[0] && target_index < local_domain[1]) {
							branch_group = x;
							break;
						}
					} catch (e) {}
				
				let local_x_offset = x_offset + branch_group; //In vertical ve.UndoRedo components, this determines the Y offset the new child timeline has
				let child_y_offset = y_offset + i;
				
				//Iterate recursively
				let new_timeline_graph = local_child_timeline.generateGraph({
					x_offset: local_x_offset,
					y_offset: child_y_offset,
					
					x_original: x_offset,
					y_original: y_offset
				});
				Object.iterate(new_timeline_graph, (local_key, local_value) => {
					timeline_graph[local_key] = new_timeline_graph[local_key];
				});
			}
		
		//3. Parse connections
		let last_id = "";
		
		for (let i = 0; i < timeline_groups.length; i++) {
			let group = timeline_groups[i];
			let local_id = Object.generateRandomID(timeline_graph);
			timeline_graph[local_id] = {};
			
			let first_action = group[0];
			
			//Connect to previous group
			if (last_id) timeline_graph[local_id].connection_ids = [last_id];
			
			timeline_graph[local_id].timeline_id = timeline_obj.id;
			timeline_graph[local_id].timeline_index = first_action.options.timeline_index;
			timeline_graph[local_id].timeline_group_index = i;
			timeline_graph[local_id].value = group;
				timeline_graph[local_id].options = first_action.options;
					timeline_graph[local_id].options.domain = [
						first_action.options.timeline_index,
						group[group.length - 1].options.timeline_index
					];
			timeline_graph[local_id].options.length = group.length;
			timeline_graph[local_id].x = i;
			timeline_graph[local_id].y = current_y_offset;
			
			last_id = local_id;
		}
		
		//4. Add x_offset; y_offset to timeline graph and to connections
		Object.iterate(timeline_graph, (local_key, local_value) => {
			if (local_value.timeline_id === timeline_obj.id)
				local_value.x += x_offset;
			local_value.y++;
		});
		
		//Return statement
		return timeline_graph;
	}
	
	/**
	 * Groups together actions with the same `.key` field to avoid their duplication and returns the grouped `.value` of the present timeline accordingly.
	 * - Method of: {@link DALS.Timeline}
	 *
	 * @returns {DALS.Action[][]}
	 */
	getGroups () {
		//Declare local instance variables
		let current_group = [];
		let timeline_groups = [];
		
		if (this.value.length > 1) {
			let action_1 = (typeof this.value[1] === "string") ?
				JSON.parse(this.value[1]) : this.value[1];
			
			if (action_1.options === undefined) action_1.options = {};
			action_1.options.timeline_index = 1;
			
			//Start with first action after state head
			current_group.push(action_1);
			
			//Iterate over remaining mutations in timeline
			for (let i = 2; i < this.value.length; i++) {
				let local_current = (typeof this.value[i] === "string") ?
					JSON.parse(this.value[i]) : this.value[i];
				let local_previous = (typeof this.value[i - 1] === "string") ?
					JSON.parse(this.value[i - 1]) : this.value[i - 1];
				
				if (local_current.options === undefined) local_current.options = {};
				if (local_previous.options === undefined) local_previous.options = {};
				
				local_current.options.timeline_index = i;
				
				let current_key = local_current.key || local_current.options?.key;
				let previous_key = local_previous.key || local_previous.options?.key;
				
				if (current_key === previous_key) {
					current_group.push(local_current);
				} else {
					//Different .key, push finished group, start new one
					timeline_groups.push(current_group);
					current_group = [local_current];
				}
			}
		}
		
		//Push the final group after loop
		if (current_group.length > 0) timeline_groups.push(current_group);
		
		//Return statement
		return timeline_groups;
	}
	
	/**
	 * Returns the width of the present timeline, accounting for any `.child_timelines` that may exist.
	 * - Method of: {@link DALS.Timeline}
	 * 
	 * @returns {number}
	 */
	getTimelineWidth () {
		//Declare local instance variables
		let timeline_width = 0;
		
		//1. Iterate over all DALS.Timeline.instances; assign child_timelines to parent first
		for (let i = 0; i < DALS.Timeline.instances.length; i++)
			if (DALS.Timeline.instances[i].initial_timeline)
				DALS.Timeline.instances[i].assignChildTimelines();
		
		//2. Check if timeline has child_timelines
		if (this.child_timelines)
			for (let i = 0; i < this.child_timelines.length; i++) {
				let local_child_timeline = DALS.Timeline.getTimeline(this.child_timelines[i]);
				
				timeline_width += this.child_timelines.length;
				timeline_width += local_child_timeline.getTimelineWidth();
			}
		
		//Return statement
		return timeline_width;
	}
	
	/**
	 * Jumps to a specific action ID in the timeline, starting from its head, utilising .parseAction()
	 * - Method of: {@link DALS.Timeline}
	 * 
	 * @param {number|string} arg0_action_id
	 */
	async jumpToAction (arg0_action_id) {
		//Convert from parameters
		let action_id = arg0_action_id;
		
		//Declare local instance variables
		let target_index = -1;
		
		if (DALS.Timeline.jump_token === undefined)
			DALS.Timeline.jump_token = 0;
		
		DALS.Timeline.jump_token++;
		let local_jump_token = DALS.Timeline.jump_token;
		
		//1. Resolve the target index before touching state
		if (typeof action_id === "number") {
			target_index = Math.floor(action_id);
		} else {
			for (let i = 1; i < this.value.length; i++) {
				let action_obj = (typeof this.value[i] === "string") ?
					JSON.parse(this.value[i]) : this.value[i];
				
				if (action_obj.id === action_id) {
					target_index = i;
					break;
				}
			}
		}
		
		if (target_index < 0)
			return DALS.Timeline.current_index;
		
		if (target_index > this.value.length - 1)
			target_index = this.value.length - 1;
		
		//2. Load initial state at head
		DALS.Timeline.current_index = 0;
		DALS.Timeline.current_timeline = this.id;
		await Promise.resolve(DALS.fromJSON(this.value[0]));
		
		if (local_jump_token !== DALS.Timeline.jump_token)
			return DALS.Timeline.current_index;
		
		//3. If jumping to the head, stop after loading the head state
		if (target_index === 0)
			return DALS.Timeline.current_index;
		
		//4. Redo actions from the state head up to the requested absolute index
		for (let i = 1; i <= target_index; i++) {
			let action_obj = (typeof this.value[i] === "string") ?
				JSON.parse(this.value[i]) : this.value[i];
			
			let action_key = action_obj.key || action_obj.options?.key;
			let action_value = (action_obj.value !== undefined) ?
				action_obj.value : action_obj;
			
			await DALS.Timeline.parseAction(action_key, action_value, true);
			
			if (local_jump_token !== DALS.Timeline.jump_token)
				return DALS.Timeline.current_index;
			
			DALS.Timeline.current_index = i;
		}
		
		//Return statement
		return DALS.Timeline.current_index;
	}
	
	/**
	 * Jumps to the end of this timeline.
	 * - Method of: {@link DALS.Timeline}
	 */
	async jumpToEnd () {
		//Jump to action if there are actions to jump to, otherwise load state head
		if (this.value.length > 1) {
			await this.jumpToAction(this.value.length - 1);
		} else {
			await this.jumpToAction(0);
		}
	}
	
	/**
	 * Jumps to the start of this timeline.
	 * - Method of: {@link DALS.Timeline}
	 */
	jumpToStart () {
		//Invalidate any in-progress jump/replay
		if (DALS.Timeline.jump_token === undefined)
			DALS.Timeline.jump_token = 0;
		DALS.Timeline.jump_token++;
		
		//Load initial state
		DALS.Timeline.current_index = 0;
		DALS.Timeline.current_timeline = this.id;
		DALS.fromJSON(this.value[0]);
	}
	
	/**
	 * Removes an action from the timeline based upon its ID.
	 * - Method of: {@link DALS.Timeline}
	 * 
	 * @param {string} arg0_action_id
	 */
	removeAction (arg0_action_id) {
		//Convert from parameters
		let action_id = arg0_action_id;
		
		//Declare local instance variables
		let action_index = -1;
		
		//1. Cast action_id to index, assuming that it is valid
		if (typeof action_id === "string") {
			//Iterate over all actions in this.value
			for (let i = 1; i < this.value.length; i++) {
				let action_obj = (typeof this.value[i] === "string") ? JSON.parse(this.value[i]) : this.value[i];
				if (action_obj.id === action_id) {
					action_index = i;
					break;
				}
			}
		} else {
			action_index = action_id;
		}
		
		//2. Go over all DALS.Timeline instances that branch from this timeline at an index greater or equal to the action being removed and set their new .parent_timeline to the end of the present timeline
		for (let i = 0; i < DALS.Timeline.instances.length; i++) {
			let local_timeline = DALS.Timeline.instances[i];
			
			if (local_timeline.parent_timeline && local_timeline.parent_timeline[0] === this.id)
				if (local_timeline.parent_timeline[1] >= action_index)
					local_timeline.parent_timeline[1] = action_index - 1;
		}
		
		//3. Splice all actions at and after the index from the current timeline
		if (action_index >= 1)
			for (let i = this.value.length - 1; i >= action_index; i--)
				this.value.splice(i, 1);
	}
	
	/**
	 * Returns a JSON representation of the current timeline.
	 * - Method of: {@link DALS.Timeline}
	 *
	 * @returns {Object}
	 */
	toJSON () {
		//Declare local instance variables
		let serialised_values = [];
		
		//Iterate over value; if element is an Action, call its toJSON, otherwise keep as is (for head state)
		for (let i = 0; i < this.value.length; i++) {
			let local_value = this.value[i];
			
			serialised_values.push((local_value instanceof DALS.Action) ? local_value.toJSON() : local_value);
		}
		
		//Return statement
		return {
			id: this.id,
			initial_timeline: this.initial_timeline,
			name: this.name,
			parent_timeline: this.parent_timeline,
			value: serialised_values,
			date_created: this.date_created,
			last_modified: this.last_modified
		};
	}
	
	/**
	 * Reconstructs all timelines from a JSON object or string.
	 * - Static method of: {@link DALS.Timeline}
	 *
	 * @param {Object|string} arg0_json
	 * @param {Object} [arg1_options]
	 *  @param {boolean} [arg1_options.do_not_overwrite=false] - If true, existing timelines and actions are preserved.
	 */
	static async fromJSON (arg0_json, arg1_options) {
		//Convert from parameters
		let json = (typeof arg0_json === "string") ? JSON.parse(arg0_json) : arg0_json;
		let options = (arg1_options) ? arg1_options : {};
		
		//1. Wipe existing registry if overwriting is enabled
		if (!options.do_not_overwrite) {
			DALS.Timeline.instances = [];
			DALS.Action.instances = [];
		}
		
		//2. Reconstruct each timeline object from the JSON array
		if (json.timelines)
			for (let i = 0; i < json.timelines.length; i++) {
				let path_data = json.timelines[i];
				let local_timeline = DALS.Timeline.getTimeline(path_data.id);
				
				//If timeline doesn't exist, create a shell to be populated
				if (!local_timeline)
					local_timeline = new DALS.Timeline({
						current_timeline: false,
					});
				
				local_timeline.fromJSON(path_data);
			}
		
		//3. Re-seat global pointers and synchronize application state if overwriting
		if (!options.do_not_overwrite) {
			DALS.Timeline.current_index = (json.current_index !== undefined) ? json.current_index : 0;
			DALS.Timeline.current_timeline = json.current_timeline;
			
			let active_timeline = DALS.Timeline.getTimeline(DALS.Timeline.current_timeline);
			
			//Perform jump to sync the application state with the loaded current_index
			if (active_timeline)
				await active_timeline.jumpToAction(DALS.Timeline.current_index);
		}
	}
	
	/**
	 * Generates a global timeline graph from the root {@link DALS.Timeline.initial_timeline}.
	 * - Static method of: {@link DALS.Timeline}
	 * 
	 * @returns {Object}
	 */
	static generateGraph () {
		//Return statement
		for (let i = 0; i < DALS.Timeline.instances.length; i++)
			if (DALS.Timeline.instances[i].initial_timeline)
				return DALS.Timeline.instances[i].generateGraph();
	}
	
	/**
	 * Returns the max `.x` value from a given graph from <span color=00ffff>{@link DALS.Timeline.generateGraph}</span>() to assess its dimensions.
	 * - Static method of: {@link DALS.Timeline}
	 *
	 * @param {Object} arg0_graph
	 *
	 * @returns {number}
	 */
	static getGraphMaxX (arg0_graph) {
		//Convert from parameters
		let timeline_graph = arg0_graph;
		
		//Declare local instance variables
		let max_x = 0;
		
		//Iterate over timeline_graph
		Object.iterate(timeline_graph, (local_key, local_value) => {
			if (local_value.x > max_x)
				max_x = local_value.x;
		});
		
		//Return statement
		return max_x;
	}
	
	/**
	 * Returns the max `.y` value from a given graph from <span color=00ffff>{@link DALS.Timeline.generateGraph}</span>() to assess its dimensions.
	 * - Static method of: {@link DALS.Timeline}
	 * 
	 * @param {Object} arg0_graph
	 * 
	 * @returns {number}
	 */
	static getGraphMaxY (arg0_graph) {
		//Convert from parameters
		let timeline_graph = arg0_graph;
		
		//Declare local instance variables
		let max_y = 0;
		
		//Iterate over timeline_graph
		Object.iterate(timeline_graph, (local_key, local_value) => {
			if (local_value.y > max_y)
				max_y = local_value.y;
		});
		
		//Return statement
		return max_y;
	}
	
	/**
	 * Returns a {@link DALS.Timeline} object based upon a timeline ID string.
	 * - Static method of: {@link DALS.Timeline}
	 * 
	 * @param {Object|string} arg0_timeline_id
	 * 
	 * @returns {DALS.Timeline}
	 */
	static getTimeline (arg0_timeline_id) {
		//Convert from parameters
		let timeline_id = arg0_timeline_id;
		
		//Internal guard clause if timeline_id is of type object
		if (typeof timeline_id === "object") return timeline_id;
		
		//Iterate over all .instances otherwise and return if the timeline ID is a match
		for (let i = 0; i < DALS.Timeline.instances.length; i++)
			if (DALS.Timeline.instances[i].id === timeline_id)
				//Return statement
				return DALS.Timeline.instances[i];
	}
	
	/**
	 * Loads DALS from a given filepath.
	 * - Static method of: {@link DALS.Timeline}
	 * 
	 * @param {string} arg0_file_path
	 * @param {Object} [arg1_options] - The same options passed for {@link DALS.Timeline.fromJSON}.
	 */
	static load (arg0_file_path, arg1_options) {
		//Convert from parameters
		let file_path = arg0_file_path.toString();
		let options = (arg1_options) ? arg1_options : {};
		
		//Read file, then attempt to call DALS.Timeline.fromJSON() with it
		fs.readFile(file_path, "utf8", (err, data) => {
			if (err) {
				console.log(err);
				return;
			}
			DALS.Timeline.fromJSON(data, options);
		});
	}
	
	/**
	 * Jumps to the start of a timeline based off its ID.
	 * - Static method of: {@link DALS.Timeline}
	 * 
	 * @param {DALS.Timeline|string} arg0_timeline_id
	 */
	static jumpToTimeline (arg0_timeline_id) {
		//Convert from parameters
		let timeline_id = arg0_timeline_id;
		
		//jumpToStart of target timeline
		DALS.Timeline.getTimeline(timeline_id).jumpToStart();
	}
	
	/**
	 * Redoes an action group in the current timeline. Returns the jumped to index.
	 * - Static method of: {@link DALS.Timeline}
	 *
	 * @returns {number}
	 */
	static async redo () {
		//Declare local instance variables
		let timeline_obj = DALS.Timeline.getTimeline(DALS.Timeline.current_timeline);
		let timeline_groups = timeline_obj.getGroups();
		
		//Generate running endpoints list starting with the initial state (0)
		let end_points = [0];
		let current_offset = 0;
		
		for (let i = 0; i < timeline_groups.length; i++) {
			current_offset += timeline_groups[i].length;
			end_points.push(current_offset);
		}
		
		//Find the smallest endpoint strictly greater than the current index
		let next_index = DALS.Timeline.current_index;
		for (let i = 0; i < end_points.length; i++) {
			if (end_points[i] > DALS.Timeline.current_index) {
				next_index = end_points[i];
				break;
			}
		}
		
		if (next_index !== DALS.Timeline.current_index)
			await timeline_obj.jumpToAction(next_index);
		
		//Return statement
		return next_index;
	}
	
	/**
	 * Saves DALS to an existing file if possible.
	 * - Static method of: {@link DALS.Timeline}
	 * 
	 * @param {string} arg0_file_path
	 */
	static save (arg0_file_path) {
		//Convert from parameters
		let file_path = arg0_file_path;
		
		//Write to file
		fs.writeFile(file_path, JSON.stringify(DALS.Timeline.toJSON()), (err) => {
			if (err) console.error(err);
		});
	}
	
	/**
	 * Serialises all DALS.Timeline instances and global registry state into a single JSON-compatible object.
	 * - Static method of: {@link DALS.Timeline}
	 *
	 * @returns {Object}
	 */
	static toJSON () {
		//Declare local instance variables
		let serialised_timelines = [];
		
		//Iterate over all instances and call their respective toJSON methods
		for (let i = 0; i < DALS.Timeline.instances.length; i++) {
			serialised_timelines.push(DALS.Timeline.instances[i].toJSON());
		}
		
		//Return statement
		return {
			current_index: DALS.Timeline.current_index,
			current_timeline: DALS.Timeline.current_timeline,
			timelines: serialised_timelines,
		};
	}
	
	/**
	 * Undoes an action group in the current timeline. Returns the jumped to index.
	 * - Static method of: {@link DALS.Timeline}
	 *
	 * @returns {number}
	 */
	static async undo () {
		//Declare local instance variables
		let timeline_obj = DALS.Timeline.getTimeline(DALS.Timeline.current_timeline);
		let timeline_groups = timeline_obj.getGroups();
		
		//Generate running endpoints list starting with the initial state (0)
		let end_points = [0];
		let current_offset = 0;
		
		for (let i = 0; i < timeline_groups.length; i++) {
			current_offset += timeline_groups[i].length;
			end_points.push(current_offset);
		}
		
		//Find the largest endpoint strictly less than the current index
		let last_index = 0;
		for (let i = 0; i < end_points.length; i++) {
			if (end_points[i] < DALS.Timeline.current_index) {
				last_index = end_points[i];
			} else {
				break;
			}
		}
		
		if (last_index !== DALS.Timeline.current_index)
			await timeline_obj.jumpToAction(last_index);
		
		//Return statement
		return last_index;
	}
};