/**
 * Creates a {@link History} Object which stores {@link HistoryKeyframe|HistoryKeyframes}.
 * 
 * ##### Constructor:
 * - `arg0_keyframes_obj`: {@link Object} - Map of keyframes.
 * - `arg1_options`: {@link Object}
 *   - `.components_obj`: {@link Object}
 *   - `.draw_keyframes_function`: {@link function}({ components_obj:{@link Object}, key:{@link string}, value:{@link Array}})
 *   - `.localisation_function`: {@link function}(arg0_new_keyframe:{@link HistoryKeyframe}, arg1_old_keyframe:{@link HistoryKeyframe}) | {@link string} - Localisation function to generate descriptions per keyframe. 
 *   
 * ##### Instance:
 * - `.do_not_draw=false`: {@link boolean}
 * - `.keyframes`: {@link Object} - Map of keyframes.
 * - `.options`: {@link Object}
 *   - `.components_obj`: {@link Object}
 * 
 * ##### Methods:
 * - <span color=00ffff>{@link ve.History._getUniqueKeyframes|_getUniqueKeyframes}</span>(arg0_options:{@link Object}) | {@link Array}<{@link string}>
 * - <span color=00ffff>{@link ve.History._hasTimestampAfter|_hasTimestampAfter}</span>(arg0_timestamp:{@link number|Object}) | {@link boolean}
 * - <span color=00ffff>{@link ve.History.addKeyframe|addKeyframe}</span>(arg0_date:{@link number|Object}, ...argn_arguments) | {@link HistoryKeyframe}</span>
 * - <span color=00ffff>{@link ve.History.callFunctionInDateRange|callFunctionInDateRange}</span>(arg0_date_range:{@link Array}<{@link number}>|{@link Array}<{@link Object}>, arg1_function:{@link function}(arg0_local_keyframe:{@link HistoryKeyframe}))
 * - <span color=00ffff>{@link ve.History.cleanKeyframes|cleanKeyframes}</span>()
 * - <span color=00ffff>{@link ve.History.draw|draw}</span>(arg0_interface_obj:{@link ve.Interface}) | {@link ve.Interface}
 * - <span color=00ffff>{@link ve.History.fromJSON|fromJSON}</span>(arg0_json:{@link Object}|{@link string})
 * - <span color=00ffff>{@link ve.History.getFirstKeyframe|getFirstKeyframe}</span>() | {@link HistoryKeyframe}
 * - <span color=00ffff>{@link ve.History.getLastKeyframe|getLastKeyframe}</span>() | {@link HistoryKeyframe}
 * - <span color=00ffff>{@link ve.History.getKeyframe|getKeyframe}</span>(arg0_options:{@link Object}) | {@link HistoryKeyframe}
 * - <span color=00ffff>{@link ve.History.getTimestamps|getTimestamps}</span>() | {@link Array}<{@link number}>
 * - <span color=00ffff>{@link ve.History.moveKeyframe|moveKeyframe}</span>(arg0_date:{@link number|Object}, arg1_new_date:{@link number|Object})
 * - <span color=00ffff>{@link ve.History.removeKeyframe|removeKeyframe}</span>(arg0_date:{@link number|Object})
 * - <span color=00ffff>{@link ve.History.replaceKeyframe|replaceKeyframe}</span>(arg0_date:{@link number|Object}, ...argn_arguments:{@link any}) | {@link HistoryKeyframe}
 * - <span color=00ffff>{@link ve.History.toJSON|toJSON}</span>() | {@link string}
 * 
 * @augments ve.Class
 * @class
 * @type {History}
 */
global.History = class extends ve.Class {
	constructor (arg0_keyframes_obj, arg1_options) {
		//Convert from parameters
		super();
		this.do_not_draw = false;
		this.keyframes = (arg0_keyframes_obj) ? arg0_keyframes_obj : {};
		
		//Declare local instance variables
		this.options = {
			components_obj: {},
			...arg1_options
		};
	}
	
	/**
	 * Returns all unique keyframes in the current History object.
	 * - Private method of: {@link History}
	 *
	 * @param {Object} [arg0_options]
	 *  @param {number[]} [arg0_options.indexes]
	 *  @param {boolean} [arg0_options.return_timestamps=false]
	 *  
	 * @returns {string[]}
	 * @private
	 */
	_getUniqueKeyframes (arg0_options) {
		//Convert from parameters
		let options = (arg0_options) ? arg0_options : {};
		
		//Declare local instance variables
		let unique_timestamps = [];
		
		Object.iterate(this.keyframes, (local_key, local_keyframe) => {
			let has_value;
			
			//Iterate over all options.indexes
			for (let i = 0; i < options.indexes.length; i++)
				if (local_keyframe.value[options.indexes[i]] !== undefined) {
					has_value = true;
					break;
				}
			
			if (has_value) unique_timestamps.push(Date.convertTimestampToInt(local_key));
		});
		
		if (!options.return_timestamps) {
			let unique_dates = [];
			
			//Return statement
			for (let i = 0; i < unique_timestamps.length; i++)
				unique_dates.push(Date.convertTimestampToDate(unique_timestamps[i]));
			return unique_dates;
		}
		
		//Return statement
		return unique_timestamps;
	}
	
	/**
	 * Checks whether the History has an entry after a given timestamp.
	 * - Privtae method of: {@link History}
	 * 
	 * @param {number|Object} arg0_timestamp
	 * 
	 * @returns {boolean}
	 * @private
	 */
	_hasTimestampAfter (arg0_timestamp) {
		//Convert from parameters
		let timestamp = Date.getTimestamp(arg0_timestamp);
		
		//Declare local instance variables
		let all_keyframes = Object.keys(this.keyframes);
		
		for (let i = 0; i < all_keyframes.length; i++)
			if (timestamp >= parseInt(all_keyframes[i]))
				//Return statement
				return true;
		return false;
	}
	
	/**
	 * Adds a keyframe at the given timestamp with data fields.
	 * - Method of: {@link History}
	 * 
	 * @param {number|Object} arg0_date
	 * @param {any} argn_arguments
	 * 
	 * @returns {HistoryKeyframe}
	 */
	addKeyframe (arg0_date, ...argn_arguments) {
		//Convert from parameters
		let date = (arg0_date !== undefined) ? Date.convertTimestampToDate(arg0_date) : main.date;
		
		//Declare local instance variables
		let timestamp = Date.getTimestamp(date);
		
		//Create a new keyframe, otherwise concatenate with existing options if history is already defined
		if (this.keyframes[timestamp] === undefined) {
			this.keyframes[timestamp] = new HistoryKeyframe(date, ...argn_arguments);
		} else {
			let local_keyframe = this.keyframes[timestamp];
			local_keyframe.addData(...argn_arguments);
		}
		
		//Return statement
		return this.keyframes[timestamp];
	}
	
	/**
	 * Calls a function within a given Date range.
	 * - Method of: {@link History}
	 * 
	 * @param {number[]|Object[]} arg0_date_range
	 * @param {function} arg1_function - (arg0_local_keyframe:{@link HistoryKeyframe})
	 */
	callFunctionInDateRange (arg0_date_range, arg1_function) {
		//Convert from parameters
		let date_range = arg0_date_range;
		let special_function = arg1_function;
		
		//Declare local instance variables
		date_range =  [Date.getTimestamp(date_range[0]), Date.getTimestamp(date_range[1])];
		let keyframes = this._getUniqueKeyframes({ indexes: [0], return_timestamps: true });
		
		//Keyframes are look-forwards; create the keyframe at start_date; then for .value[0] changes until end_date
		if (!keyframes.includes(date_range[0]))
			keyframes.unshift(date_range[0]);
		
		//Iterate over all polygon_keyframes and apply the changes at the given date
		for (let i = 0; i < keyframes.length; i++)
			if (keyframes[i] >= date_range[0] && keyframes[i] <= date_range[1])
				special_function(keyframes[i]);
	}
	
	/**
	 * Cleans keyframes within the given History object.
	 * - Method of: {@link History}
	 */
	cleanKeyframes () {
		//Declare local instance variables
		let all_timestamps = Object.keys(this.keyframes).sort((a, b) => {
			return Date.convertTimestampToInt(a) - Date.convertTimestampToInt(b);
		});
		let running_state = []; //Tracks the accumulated values to find redundancies
		
		//Iterate over all_timestamps in the current history
		for (let i = 0; i < all_timestamps.length; i++) {
			let timestamp = all_timestamps[i];
			let local_keyframe = this.keyframes[timestamp];
			let has_meaningful_change = false;
			
			//Don't clean the very first keyframe, as it serves as the baseline
			if (i === 0) {
				//Update running state with the first keyframe's data
				running_state = JSON.parse(JSON.stringify(local_keyframe.value));
				continue;
			}
			
			for (let x = 0; x < local_keyframe.value.length; x++) {
				let current_val = local_keyframe.value[x];
				let prev_val = running_state[x];
				
				//Skip only if undefined; null is treated as a meaningful value change
				if (current_val === undefined) continue;
				
				if (typeof current_val === "object" && current_val !== null) {
					// Handle object merging and variable delta checks
					let is_redundant_obj = true;
					let cleaned_obj = { ...current_val };
					if (current_val.variables)
						cleaned_obj.variables = { ...current_val.variables };
					
					//Check nested variables
					if (current_val.variables && prev_val && prev_val.variables) {
						for (let key in current_val.variables)
							if (Boolean.isDeepEqual(current_val.variables[key], prev_val.variables[key])) {
								delete cleaned_obj.variables[key];
							} else {
								is_redundant_obj = false;
							}
						//If variables becomes empty, remove the key
						if (Object.keys(cleaned_obj.variables).length === 0) delete cleaned_obj.variables;
					} else if (current_val.variables) {
						is_redundant_obj = false;
					}
					
					//Check other properties of the object (excluding variables which we just handled)
					for (let key in current_val) {
						if (key === "variables") continue;
						if (prev_val && Boolean.isDeepEqual(current_val[key], prev_val[key])) {
							delete cleaned_obj[key];
						} else {
							is_redundant_obj = false;
						}
					}
					
					if (is_redundant_obj) {
						//Remove this index from keyframe if it changes nothing
						local_keyframe.value[x] = undefined;
					} else {
						//Update the keyframe with cleaned object and update running state
						local_keyframe.value[x] = cleaned_obj;
						has_meaningful_change = true;
						
						//Update running state for next iteration; ensure state is an object if merging
						if (typeof running_state[x] !== "object" || running_state[x] === null)
							running_state[x] = { variables: {} };
						
						if (cleaned_obj.variables)
							running_state[x].variables = {
								...running_state[x].variables,
								...cleaned_obj.variables
							};
						running_state[x] = { ...running_state[x], ...cleaned_obj };
					}
				} else {
					//Handle primitive values and null
					if (current_val === prev_val) {
						local_keyframe.value[x] = undefined;
					} else {
						running_state[x] = current_val;
						has_meaningful_change = true;
					}
				}
			}
			
			//If the keyframe now contains no unique data, delete the keyframe entirely
			let is_empty = local_keyframe.value.every(val => val === undefined);
			if (is_empty || !has_meaningful_change) {
				delete this.keyframes[timestamp];
			}
		}
	}
	
	/**
	 * Draws the current History interface and places the end component in `this.interface`.
	 * - Method of: {@link History}
	 * 
	 * @param {ve.Interface} [arg0_interface_obj]
	 * 
	 * @returns {ve.Interface}
	 */
	draw (arg0_interface_obj) {
		//Convert from parameter
		let interface_obj = arg0_interface_obj;
		
		//Declare local instance variables
		let components_obj = {};
		if (this.interface && typeof this.interface.remove === "function") this.interface.remove();
		this.getKeyframe({ refresh_localisation: true });
		
		//Iterate over all_keyframes and push it to components_obj
		Object.iterate(this.keyframes, (local_key, local_value) => {
			if (this.options.draw_keyframe_function)
				this.options.draw_keyframe_function({
					components_obj,
					key: local_key,
					value: local_value
				});
		}, { sort_mode: "date_descending" });
		
		//Set interface_obj.v
		if (interface_obj) {
			interface_obj.v = components_obj;
		} else {
			this.interface = new ve.Interface(components_obj, { name: "Keyframes", width: 99 });
		}
		
		//Return statement
		return this.interface;
	}
	
	/**
	 * Initialises a History timeline from JSON.
	 * - Method of: {@link History}
	 * 
	 * @param {Object|string} arg0_json
	 */
	fromJSON (arg0_json) {
		//Convert from parameters
		let json = (typeof arg0_json === "string") ? JSON.parse(arg0_json) : arg0_json;
		
		//Iterate over all_json_keys and assume them as keyframes
		if (json.keyframes) {
			let all_keyframes = Object.keys(json.keyframes).sort();
			this.do_not_draw = true;
			this.keyframes = {};
			
			for (let i = 0; i < all_keyframes.length; i++) {
				let local_key = all_keyframes[i];
				let local_keyframe = json.keyframes[local_key];
				this.addKeyframe(local_key, ...local_keyframe.value);
			}
			this.do_not_draw = false;
		} else {
			console.error(`naissance.History.fromJSON() requires arg0_json to have a .keyframes Array<Object>.`, json);
		}
	}
	
	/**
	 * Returns the first keyframe in `.keyframes`.
	 * - Method of: {@link History}
	 * 
	 * @returns {HistoryKeyframe|undefined}
	 */
	getFirstKeyframe () {
		//Declare local instance variables
		let all_timestamps = this.getTimestamps();
		
		//Return statement
		return (all_timestamps.length > 0) ? this.keyframes[all_timestamps[0]] : undefined;
	}
	
	/**
	 * Returns the last keyframe in `.keyframes`.
	 * - Method of: {@link History}
	 * 
	 * @returns {HistoryKeyframe|undefined}
	 */
	getLastKeyframe () {
		//Declare local instance variables
		let all_timestamps = this.getTimestamps();
		
		//Return statement
		return (all_timestamps.length > 0) ? this.keyframes[all_timestamps.length - 1] : undefined;
	}
	
	/**
	 * Resolves a keyframe at the given date.
	 * - Method of: {@link History}
	 * 
	 * @param {Object} [arg0_options]
	 *  @param {boolean} [arg0_options.bake_keyframes=false]
	 *  @param {number|Object} [arg0_options.date=main.date]
	 *  @param {number[]} [arg0_options.guaranteed_indexes]
	 *  @param {boolean} [arg0_options.refresh_localisation=false]
	 *  
	 * @return {Object}
	 */
	getKeyframe (arg0_options) {
		//Convert from parameters
		let options = (arg0_options) ? arg0_options : {};
		
		//Initialise options
		if (options.date === undefined) options.date = main.date;
		
		//Declare local instance variables
		let return_keyframes = {};
		let return_keyframe = {};
		let timestamp = Date.getTimestamp(options.date);
		
		//1. If options.absolute_keyframe = true, iterate over all keyframes in this.keyframes, and return the most recent one
		if (options.absolute_keyframe) {
			Object.iterate(this.keyframes, (local_key, local_keyframe) => {
				if (Date.convertTimestampToInt(local_key) <= Date.convertTimestampToInt(timestamp))
					return_keyframe = this.keyframes[local_key];
			}, { sort_mode: "date_ascending" });
			
			//Return statement
			return return_keyframe;
		}
		
		//2. If options.absolute_keyframe = false, iterate over all keyframes in this.keyframes, and concatenate the .value of the relative keyframe
		if (!options.absolute_keyframe) {
			return_keyframe = {
				date: options.date,
				timestamp: timestamp,
				value: [],
			};
			
			let all_keyframes = this.getTimestamps();
			let remaining_guarantees = (options.guaranteed_indexes) ?
				[...options.guaranteed_indexes] : [];
			let last_geometry;
			
			for (let i = 0; i < all_keyframes.length; i++) {
				let local_keyframe = this.keyframes[all_keyframes[i]];
				let is_past_timestamp = (Date.convertTimestampToInt(all_keyframes[i]) > Date.convertTimestampToInt(timestamp));
				
				//Parse localisation first, then concatenate
				if (options.refresh_localisation)
					local_keyframe.localisation = (this.options.localisation_function) ?
						this.options.localisation_function(local_keyframe, return_keyframe) : "";
				
				if (!is_past_timestamp || remaining_guarantees.length > 0 || options.bake_keyframes) {
					for (let x = 0; x < local_keyframe.value.length; x++) {
						let is_guaranteed = (options.guaranteed_indexes) ?
							options.guaranteed_indexes.includes(x) : false;
						let is_resolved = (return_keyframe.value[x] !== undefined && return_keyframe.value[x] !== null);
						
						//Update value if before original timestamp cutoff, or if index is a guarantee that hasn't been fixed yet
						if (!is_past_timestamp || (is_guaranteed && !is_resolved)) {
							if (typeof local_keyframe.value[x] === "object" && local_keyframe.value[x] !== null) {
								let old_variables = (return_keyframe.value[x]?.variables) ?
									return_keyframe.value[x].variables : {};
								
								//Return keyframe
								return_keyframe.value[x] = {
									...(return_keyframe.value[x] ? return_keyframe.value[x] : {}),
									...local_keyframe.value[x],
								};
								
								//Handle nested .variables
								if (local_keyframe.value[x] && local_keyframe.value[x].variables)
									return_keyframe.value[x].variables = {
										...old_variables,
										...local_keyframe.value[x].variables,
									};
							} else if (local_keyframe.value[x] !== undefined) {
								if (local_keyframe.value[x] === "undefined") continue; //Overwrite undefined strings
								if (x !== 0 && local_keyframe.value[x] === null) continue; //Null should be overridden for [1] symbols, [2] properties
								//If the value is null or a primitive, it overwrites the previous accumulated state
								return_keyframe.value[x] = local_keyframe.value[x];
							}
							
							//Remove from guarantees if now truthy
							if (is_guaranteed && return_keyframe.value[x] !== undefined && return_keyframe.value[x] !== null)
								remaining_guarantees = remaining_guarantees.filter(idx => idx !== x);
						}
					}
					
					//options.bake_keyframes handler
					if (options.bake_keyframes) {
						return_keyframes[all_keyframes[i]] = structuredClone(return_keyframe);
						let baked_keyframe = return_keyframes[all_keyframes[i]];
						
						if (baked_keyframe?.value?.[2]?.hidden === true) {
							if (baked_keyframe.value[0])
								last_geometry = structuredClone(baked_keyframe.value[0]);
							baked_keyframe.value[0] = null;
						} else if (
							baked_keyframe?.value?.[2]?.hidden === false &&
							!(return_keyframe.value[0] || return_keyframe.value[0] === null)
						) {
							if (last_geometry) baked_keyframe.value[0] = structuredClone(last_geometry);
						}
					}
				} else {
					if (!options.refresh_localisation) break;
				}
			}
			
			//Return statement
			return (!options.bake_keyframes) ? return_keyframe : return_keyframes;
		}
	}
	
	/**
	 * Sorts and returns all timestamp keys in chronological order.
	 * - Method of: {@link History}
	 * 
	 * @returns {string[]}
	 */
	getTimestamps () {
		//Return statement
		return Object.keys(this.keyframes).sort((a, b) => {
			return Date.convertTimestampToInt(a) - Date.convertTimestampToInt(b);
		});
	}
	
	/**
	 * Moves a keyframe from one date to another.
	 * - Method of: {@link History}
	 * 
	 * @param {number|Object} arg0_date - The date to move from.
	 * @param {number|Object} arg1_date - The date to move to.
	 */
	moveKeyframe (arg0_date, arg1_date) {
		//Convert from parameters
		let timestamp = Date.getTimestamp(arg0_date);
		let ot_timestamp = Date.getTimestamp(arg1_date);
		
		//Internal guard clause if timestamps are the same
		if (timestamp === ot_timestamp) return;
		
		//Check if keyframe_obj exists; if it does, move it
		let keyframe_obj = this.keyframes[timestamp];
		
		if (keyframe_obj) {
			keyframe_obj.date = Date.getDate(ot_timestamp);
			keyframe_obj.timestamp = ot_timestamp;
			this.keyframes[ot_timestamp] = this.keyframes[timestamp];
			
			delete this.keyframes[timestamp];
		}
	}
	
	/**
	 * Prunes a keyframe at the specified date.
	 * - Method of: {@link History}
	 * 
	 * @param {number|Object} arg0_date
	 */
	removeKeyframe (arg0_date) {
		//Convert from parameters
		let date = (arg0_date !== undefined) ? Date.convertTimestampToDate(arg0_date) : main.date;
		
		//Declare local instance variables
		let timestamp = Date.getTimestamp(date);
		
		//Delete target keyframe 
		delete this.keyframes[timestamp];
	}
	
	/**
	 * Replaces a keyframe at the specified date with another.
	 * - Method of: {@link History}
	 * 
	 * @param {HistoryKeyframe} arg0_keyframe
	 * @param {HistoryKeyframe} arg1_keyframe
	 * @param {Object} [arg2_options]
	 *  @param {boolean} [arg2_options.refresh_localisation=false]
	 */
	replaceKeyframe (arg0_keyframe, arg1_keyframe, arg2_options) {
		//Convert from parameters
		let keyframe = arg0_keyframe;
		let ot_keyframe = arg1_keyframe;
		let options = (arg2_options) ? arg2_options : {};
		
		//Declare local instance variables
		let timestamp = JSON.parse(JSON.stringify(keyframe.timestamp));
		
		//Swap out keyframe; refresh localisation
		this.removeKeyframe(timestamp);
		this.addKeyframe(timestamp, ...ot_keyframe.value);
		
		if (options.refresh_localisation !== false) this.getKeyframe();
	}
	
	/**
	 * Outputs the current History as a JSON string.
	 * - Method of: {@link History}
	 * 
	 * @returns {string}
	 */
	toJSON () {
		//Convert from parameters
		let json_obj = {
			keyframes: {}
		};
		
		//Iterate over all this.keyframes and parse them to a minimal JSON contract
		let all_keyframes = Object.keys(this.keyframes).sort();
		
		for (let i = 0; i < all_keyframes.length; i++) {
			let local_keyframe = this.keyframes[all_keyframes[i]];
			
			if (local_keyframe.value[0] === undefined) local_keyframe.value[0] = "undefined";
			json_obj.keyframes[all_keyframes[i]] = { value: local_keyframe.value };
		}
		
		//Return statement
		return JSON.stringify(json_obj);
	}
};