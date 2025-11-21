//Initialise class
if (!global.DALS) global.DALS = {};

/**
 * Refer to <span color = "yellow">{@link DALS.Timeline}</span> for the encapsulating element, as {@link DALS.Action} is stored after the head state ([0]) of a DALS.Timeline `.value`.
 * 
 * Represents a state mutation that changes the head state, from which a new relative state can be computed.
 * 
 * ##### Constructor:
 * - `arg0_json`: {@link Object}|{@link string}
 *   - `.options`: {@link Object}
 *     - `.name`: {@link string}
 * 
 * ##### Instance:
 * - `.id=Class.generateRandomID(DALS.Action)`: {@link string}
 * - `.options`: {@link Object} - Reference variable to `json.options`.
 * - `.name="New Action"`: {@link string} - Reference variable to `json.options.name`.
 * - `.timeline`: {@link string}
 * - `.value`: {@link Object} - The parsed JSON object contained within the object.
 * 
 * ##### Methods:
 * - <span color=00ffff>{@link DALS.Action.delete|delete}</span>(arg0_options:{ removed_from_timeline:{@link boolean} }) - Deletes the present action and removes it from the associated timeline.
 * - <span color=00ffff>{@link DALS.Action.jumpTo|jumpTo}</span>() - Forces program state to jump to the present action.
 * 
 * ##### Static Fields:
 * - `.instances`: {@link Object}<{@link DALS.Action}>
 * 
 * @type {DALS.Action}
 */
DALS.Action = class {
	//Declare local static variables
	/**
	 * @type {DALS.Action[]}
	 */
	static instances = [];
	
	constructor (arg0_json) {
		//Convert from parameters
		let json = arg0_json;
		
		//Serialise/deserialise to JSON to ensure syntactic correctness
		if (typeof json !== "string") json = JSON.stringify(json);
		if (typeof json === "string") json = JSON.parse(json);
		
		//Declare local instance variables
		this.id = Class.generateRandomID(DALS.Action);
		this.options = (json.options) ? json.options : {};
			this.name = (json.options.name) ? json.options.name : "New Action";
		this.timeline = undefined; //Populated upon .addAction()
		this.value = json;
		
		//Assign Action to DALS.Timeline
		if (!this.options.timeline) {
			//If current_index is not at the end of the present timeline, branch off into new timeline
			let old_timeline = DALS.Timeline.getTimeline(DALS.Timeline.current_timeline);
			
			if (DALS.Timeline.current_index !== old_timeline.value.length - 1) {
				let new_timeline = old_timeline.branch();
					DALS.Timeline.current_timeline = new_timeline.id;
					DALS.Timeline.current_index = 0;
				
				//Assign to new_timeline if state is behind current
				new_timeline.last_modified = new Date();
				new_timeline.value.push(this);
			} else {
				//Assign to old_timeline if state is at current
				old_timeline.last_modified = new Date();
				old_timeline.value.push(this);
			}
			
			DALS.Timeline.current_index++;
		} else {
			//Assign to specified timeline
			let local_timeline = DALS.Timeline.getTimeline(this.options.timeline);
			local_timeline.last_modified = new Date();
			local_timeline.value.push(this);
		}
		DALS.Action.instances.push(this);
	}
	
	/**
	 * Deletes the present action and removes it from the associated timeline.
	 * - Method of: {@link DALS.Action}
	 * 
	 * @param {Object} [arg0_options]
	 *  @param {boolean} [arg0_options.removed_from_timeline=false]
	 */
	delete (arg0_options) {
		//Declare local instance variables
		let options = (arg0_options) ? arg0_options : {
			removed_from_timeline: false
		};
		
		//Iterate over DALS.Action.instances; delete rom DALS.Action.instances
		for (let i = 0; i < DALS.Action.instances.length; i++)
			if (DALS.Action.instances[i] === this) {
				DALS.Action.instances.splice(i, 1);
				break;
			}
		if (!options.removed_from_timeline)
			if (this.timeline)
				this.timeline.removeAction(this.id);
	}
	
	/**
	 * Forces the current program state to jump to this {@link DALS.Action}.
	 * - Method of: {@link DALS.Action}
	 */
	jumpTo () {
		this.timeline.jumpToAction(this.id);
	}
};