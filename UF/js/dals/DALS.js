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

//Initialise functions
{
	/**
	 * Loads the current state for DALS/{@link ve.UndoRedo}. Contract function.
	 *
	 * @param {Object|string} arg0_json
	 */
	DALS.fromJSON = function (arg0_json) {
		console.error(`DALS.fromJSON(arg0_json) has not been manually overridden by the program!`);
	};
	
	/**
	 * Loads in a new state based upon the JSON data contained at a file path.
	 *
	 * @param {string} arg0_file_path
	 */
	DALS.load = function (arg0_file_path) {
		//Convert from parameters
		let file_path = arg0_file_path.toString();
		
		//Read file, then attempt to call DALS.fromJSON() with it
		fs.readFile(file_path, "utf8", (err, data) => {
			if (err) {
				console.log(err);
				return;
			}
			DALS.fromJSON(data);
		});
	};
	
	DALS.initialise = function () {
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
	};
	
	/**
	 * Saves the present state as JSON to a new file path.
	 *
	 * @param {string} arg0_file_path
	 */
	DALS.save = function (arg0_file_path) {
		//Convert from parameters
		let file_path = arg0_file_path.toString();
		
		//Write to file
		fs.writeFile(file_path, JSON.stringify(DALS.toJSON()), (err) => {
			if (err) console.error(err);
		});
	};
	
	/**
	 * Saves the current state for DALS/{@link ve.UndoRedo}. Contract function.
	 *
	 * @returns {Object}
	 */
	DALS.toJSON = function () {
		console.error(`DALS.toJSON() has not been manually overridden by the program! Returning an empty object.\n- If you are seeing this for the first time, it is likely because of state initialisation.`);
		
		//Return statement
		return {};
	};
}

//Call initialisation
DALS.initialise();