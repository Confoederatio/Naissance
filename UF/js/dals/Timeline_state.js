//Initialise functions
{
	/**
	 * Loads the current state for DALS/{@link ve.UndoRedo}. Contract function.
	 * @alias DALS.Timeline.loadState
	 * 
	 * @param {Object|string} arg0_json
	 */
	DALS.Timeline.loadState = function (arg0_json) {
		console.error(`DALS.Timeline.loadState(arg0_json) has not been manually overridden by the program!`);
	};
	
	/**
	 * Parses an action for DALS/{@link ve.UndoRedo}. Contract function.
	 * @alias DALS.Timeline.parseAction
	 * 
	 * @param {Object|string} [arg0_json]
	 *  @param {Object} [arg0_json.options]
	 *   @param {string} [arg0_json.options.name="New Action"]
	 *   @param {string} [arg0_json.options.key]
	 *  @param {Object[]} [arg0_json.value] - [n]: { type: {@link string}, <action_key>: {@link any} }
	 */
	DALS.Timeline.parseAction = function (arg0_json) {
		//Convert from parameters
		let json = (typeof arg0_json === "string") ? JSON.parse(arg0_json) : arg0_json;
		
		//Initialise JSON
		if (json.options === undefined) json.options = {};
		if (json.value === undefined) json.value = [];
		
		//Iterate over multi-value packet (MVP) and filter it down to superclass single-value packets (SVPs)
		for (let i = 0; i < json.value.length; i++) try {
			if (json.value[i].type === "global") {
				if (json.value[i].load_save)
					DALS.Timeline.loadState(json.value[i].load_save);
			}
		} catch (e) { console.error(e); }
		console.error(`DALS.Timeline.parseAction(arg0_json) does not have a parser bound to it.`);
	};
	
	/**
	 * Saves the current state for DALS/{@link ve.UndoRedo}. Contract function.
	 * @alias DALS.Timeline.saveState
	 * 
	 * @returns {Object}
	 */
	DALS.Timeline.saveState = function () {
		console.error(`DALS.Timeline.saveState() has not been manuially overridden by the program! Returning an empty object.\n- If you are seeing this for the first time, it is likely because of state initialisation.`);
		
		//Return statement
		return {};
	};
}
