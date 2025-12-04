//Initialise class
if (!global.DALS) global.DALS = {
	/**
	 * This is an example of how to declare documentation for a specific variable.
	 *
	 * @type {DALS.Timeline}
	 * @typedef {DALS.timeline}
	 */
	timeline: undefined
};

//Define DALS.timeline as DALS.Timeline.current_timeline
Object.defineProperty(DALS, "timeline", {
	get () {
		return DALS.Timeline.current_timeline;
	},
	
	/**
	 * @param {string} v
	 */
	set (v) {
		DALS.Timeline.current_timeline = v;
	}
});

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
 * ##### Static Fields:
 * - `.current_index`: {@link number} - The index of the current timeline the state is at.
 * - `.current_timeline`: {@link string} - The ID of the current timeline being displayed.
 * - `.instances`: {@link Array}<{@link DALS.Timeline}>
 * 
 * ##### Static Methods:
 * - <span color=00ffff>{@link DALS.Timeline.getTimeline|getTimeline}</span>(arg0_timeline_id:{@link string}) | {@link DALS.Timeline} - Returns a DALS.Timeline object given a timeline ID.
 * - <span color=00ffff>{@link DALS.Timeline.load|load}</span>(arg0_file_path:{@link string}) - Loads a new head state from a given file.
 * - <span color=00ffff>{@link DALS.Timeline.jumpToTimeline|jumpToTimeline}</span>(arg0_timeline_id:{@link string}) - Jumps to the head state of a specific timeline.
 * - <span color=00ffff>{@link DALS.Timeline.save|save}</span>(arg0_file_path:{@link string}) - Saves the present state to a given file.
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
		this.name = (options.name) ? options.name : `Timeline ${this.id}`;
		this.options = options;
		this.parent_timeline = options.parent_timeline;
		this.value = [DALS.Timeline.saveState()];
		
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
	 *  @param {boolean} [arg1_options.di_not_parse_action=false]
	 * 
	 * @returns {DALS.Action}
	 */
	addAction (arg0_json, arg1_options) {
		//Convert from parameters
		let json = (typeof arg0_json !== "string") ? JSON.stringify(arg0_json) : arg0_json;
		let options = (arg1_options) ? arg1_options : {};
		
		//Declare local instance variables
		let json_obj = JSON.parse(json);
			if (json_obj.options === undefined) json_obj.options = {};
				if (json_obj.options.timeline === undefined) json_obj.options.timeline = this.id;
		let new_action = new DALS.Action(json_obj);
			if (options.do_not_parse_action !== false)
				DALS.Timeline.parseAction(json_obj, true);
			
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
	delete () {
		if (DALS.Timeline.instances.length <= 1) {
			//Simply clear the entire state since the last timeline is being removed
			this.value = [];
			delete DALS.Timeline.current_timeline;
			DALS.Timeline.instances = [];
			DALS.Timeline.loadState({});
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
					parent_timeline_obj.jumpToAction(this.parent_timeline[1]);
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
			for (let i = 0; i < timeline_obj.child_timelines.length; i++) { //[WIP] - local_x_offset is not reflective of the actual branch domain
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
				timeline_graph[local_id].value.options = first_action.value.options;
					timeline_graph[local_id].value.options.domain = [
						first_action.options.timeline_index,
						group[group.length - 1].options.timeline_index
					];
			timeline_graph[local_id].value.options.length = group.length;
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
	 * Groups together actions with the same `.key` field to avoid their duplication and returns the grouped `.value` of the present timeline acoordingly.
	 * - Method of: {@link DALS.Timeline}
	 * 
	 * @returns {DALS.Action[][]}
	 */
	getGroups () {
		//Declare local instance variables
		let current_group = [];
		let timeline_groups = [];
		
		if (this.value.length > 1) {
			//Start with first action after state head
			current_group.push(this.value[1]);
			
			//Iterate over remaining mutations in timeline
			for (let i = 2; i < this.value.length; i++) {
				let current_action = this.value[i];
				let previous_action = this.value[i - 1];
				
				//Continue the same group if .key is the same
				current_action.options.timeline_index = i;
				if (current_action.options.key === previous_action.options.key) {
					current_group.push(current_action);
				} else {
					//Different .key, push finished group, start new one
					timeline_groups.push(current_group);
					current_group = [current_action];
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
	jumpToAction (arg0_action_id) {
		//Convert from parameters
		let action_id = arg0_action_id;
		
		//1. Cast index to action_id if typeof number, assuming that it is valid
		if (typeof action_id === "number")
			if (action_id <= this.value.length - 1)
				action_id = this.value[action_id].id;
		
		//2. Load initial state at head
		this.jumpToStart();
		
		//3. Redo actions starting from the state head using DALS.Timeline.parseAction() until we hit the target action ID
		for (let i = 1; i < this.value.length; i++) {
			DALS.Timeline.parseAction(this.value[i].value, true);
			DALS.Timeline.current_index = i;
			if (this.value[i].id === action_id) break;
		}
	}
	
	/**
	 * Jumps to the end of this timeline.
	 * - Method of: {@link DALS.Timeline}
	 */
	jumpToEnd () {
		//Jump to action if there are actions to jump to, otherwise load state head
		if (this.value.length > 1) {
			this.jumpToAction(this.value[this.value.length - 1].id);
		} else {
			this.jumpToStart();
		}
	}
	
	/**
	 * Jumps to the start of this timeline.
	 * - Method of: {@link DALS.Timeline}
	 */
	jumpToStart () {
		//Load initial state
		DALS.Timeline.current_index = 0;
		DALS.Timeline.current_timeline = this.id;
		DALS.Timeline.loadState(this.value[0]);
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
			for (let i = 1; i < this.value.length; i++)
				if (this.value[i].id === action_id) {
					action_index = i;
					break;
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
	 * Loads in a new state based upon the JSON data contained at a file path.
	 * - Static method of: {@link DALS.Timeline}
	 * 
	 * @param {string} arg0_file_path
	 */
	static load (arg0_file_path) {
		//Convert from parameters
		let file_path = arg0_file_path.toString();
		
		//Read file, then attempt to call DALS.Timeline.loadState() with it
		fs.readFile(file_path, "utf8", (err, data) => {
			if (err) {
				console.log(err);
				return;
			}
			DALS.Timeline.loadState(data);
		})
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
	static redo () {
		//Declare local instance variables
		let timeline_obj = DALS.Timeline.getTimeline(DALS.Timeline.current_timeline);
		
		//Iterate over all timeline_groups and figure out the last_group to rewind to
		let current_index = 1;
		let next_index = 1;
		let timeline_groups = timeline_obj.getGroups();
		
		for (let i = 0; i < timeline_groups.length; i++) {
			let local_domain = [current_index, current_index + timeline_groups[i].length];
			
			//Check if DALS.Timeline.current_index is within local_domain
			if (DALS.Timeline.current_index > local_domain[0] && DALS.Timeline.current_index <= local_domain[1]) {
				let next_group = timeline_groups[i + 1];
				if (next_group) {
					next_index = local_domain[1] + next_group.length; 
				} else {
					next_index = local_domain[1];
				}
				
				break;
			}
			
			//Increment current_index to keep track of things
			current_index += timeline_groups[i].length;
		}
		
		//Jump to next_index
		timeline_obj.jumpToAction(next_index);
		
		//Return statement
		return next_index;
	}
	
	/**
	 * Saves the present state as JSON to a new file path.
	 * - Static method of: {@link DALS.Timeline}
	 * 
	 * @param {string} arg0_file_path
	 */
	static save (arg0_file_path) {
		//Convert from parameters
		let file_path = arg0_file_path.toString();
		
		//Declare local instance variables
		fs.writeFile(file_path, JSON.stringify(DALS.Timeline.saveState()), (err) => {
			if (err) console.error(err);
		});
	}
	
	/**
	 * Undoes an action group in the current timeline. Returns the jumped to index.
	 * - Static method of: {@link DALS.Timeline}
	 * 
	 * @returns {number}
	 */
	static undo () {
		//Declare local instance variables
		let timeline_obj = DALS.Timeline.getTimeline(DALS.Timeline.current_timeline);
		
		//Iterate over all timeline_groups and figure out the last_group to rewind to
		let current_index = 1;
		let last_index = 1;
		let timeline_groups = timeline_obj.getGroups();
		
		for (let i = 0; i < timeline_groups.length; i++) {
			let local_domain = [current_index, current_index + timeline_groups[i].length];
			
			//Check if DALS.Timeline.current_index is within local_domain
			if (DALS.Timeline.current_index > local_domain[0] && DALS.Timeline.current_index <= local_domain[1]) {
				let last_group = timeline_groups[i - 1];
				if (last_group) {
					last_index = local_domain[0] - 1;
				} else {
					last_index = local_domain[1];
				}
				
				break;
			}
			
			//Increment current_index to keep track of things
			current_index += timeline_groups[i].length;
		}
		
		//Jump to next_index
		timeline_obj.jumpToAction(last_index);
		
		//Return statement
		return last_index;
	}
};