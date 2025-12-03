if (!global.naissance) global.naissance = {};
naissance.History = class extends ve.Class {
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
		this.interface = new ve.Interface({}, { name: "Keyframes", width: 99 });
	}
	
	addKeyframe (arg0_date, ...argn_arguments) {
		//Convert from parameters
		let date = (arg0_date) ? Date.convertTimestampToDate(arg0_date) : main.date;
		
		//Declare local instance variables
		let timestamp = Date.getTimestamp(date);
		
		//Create a new keyframe, otherwise concatenate with existing options if history is already defined
		if (this.keyframes[timestamp] === undefined) {
			this.keyframes[timestamp] = new naissance.HistoryKeyframe(date, ...argn_arguments);
		} else {
			let local_keyframe = this.keyframes[timestamp];
				local_keyframe.addData(...argn_arguments);
		}
		if (!this.do_not_draw) this.draw();
		
		//Return statement
		return this.keyframes[timestamp];
	}
	
	draw () {
		//Declare local instance variables
		let components_obj = {};
		this.interface = new ve.Interface({}, { name: "Keyframes", width: 99 });
		
		//Iterate over all_keyframes and push it to components_obj
		Object.iterate(this.keyframes, (local_key, local_value) => {
			//Set components_obj
			components_obj[local_key] = new ve.Interface({
				date_info: new ve.HTML(String.formatDate(local_value.date), { 
					tooltip: `Timestamp: ${local_value.timestamp}`,
					x: 0, y: 0
				}),
				jump_to_date: veButton((e) => {
					DALS.Timeline.parseAction({
						options: { name: "Set Date", key: "load_date" },
						value: [
							{ type: "global", set_date: Date.convertTimestampToDate(local_key) },
							{ type: "global", refresh_date: true }
						]
					});
				}, { 
					name: "<icon>arrow_forward</icon>",
					tooltip: "Jump to Date", 
					style: { cursor: "pointer" }, 
					x: 1, y: 0 
				})
			}, {
				is_folder: false
			});
		}, { sort_mode: "date_descending" });
		
		this.interface.v = components_obj;
	}
	
	fromJSON (arg0_json) {
		//Convert from parameters
		let json = JSON.parse(arg0_json);
		
		//Iterate over all_json_keys and assume them as keyframes
		if (json.keyframes) {
			let all_keyframes = Object.keys(json.keyframes).sort();
			
			this.do_not_draw = true;
			this.keyframes = {};
			for (let i = 0; i < all_keyframes.length; i++) {
				let local_date = Date.convertTimestampToDate(all_keyframes[i]);
				let local_keyframe = json.keyframes[all_keyframes[i]];
				
				this.addKeyframe(local_date, ...local_keyframe.value);
			}
			this.do_not_draw = false;
			this.draw();
		} else {
			console.error(`naissance.History.fromJSON() requires arg0_json to have a .keyframes Array<Object>.`, json);
		}
	}
	
	getKeyframe (arg0_options) {
		//Convert from parameters
		let options = (arg0_options) ? arg0_options : {};
		
		//Initialise options
		if (options.date === undefined) options.date = main.date;
		
		//Declare local instance variables
		let return_keyframe = {};
		let timestamp = Date.getTimestamp(options.date);
		
		//1. If options.absolute_keyframe = true, iterate over all keyframes in this.keyframes, and return the most recent one
		let all_keyframes = Object.keys(this.keyframes).sort().reverse();
		
		if (options.absolute_keyframe) {
			Object.iterate(this.keyframes, (local_key, local_keyframe) => {
				if (Date.convertTimestampToInt(local_keyframe) <= Date.convertTimestampToInt(timestamp))
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
				value: []
			};
			Object.iterate(this.keyframes, (local_key, local_keyframe) => {
				if (Date.convertTimestampToInt(local_key) <= Date.convertTimestampToInt(timestamp))
				for (let x = 0; x < local_keyframe.value.length; x++)
					if (typeof local_keyframe.value[x] === "object") {
						let old_variables = (return_keyframe.value[x]?.variables) ? return_keyframe.value[x].variables : {};
						
						return_keyframe.value[x] = {
							...(return_keyframe.value[x]) ? return_keyframe.value[x] : {},
							...local_keyframe.value[x]
						};
						
						//Handle nested .variables
						if (local_keyframe.value[x] && local_keyframe.value[x].variables)
							return_keyframe.value[x].variables = {
								...old_variables,
								...local_keyframe.value[x].variables
							};
					} else if (local_keyframe.value[x] !== undefined) {
						return_keyframe.value[x] = local_keyframe.value[x];
					}
			}, { sort_mode: "date_ascending" });
			
			//Return statement
			return return_keyframe;
		}
	}
	
	removeKeyframe (arg0_date) {
		//Convert from parameters
		let date = (arg0_date) ? Date.convertTimestampToDate(arg0_date) : main.date;
		
		//Declare local instance variables
		let timestamp = Date.getTimestamp(date);
		
		//Delete target keyframe 
		delete this.keyframes[timestamp];
	}
	
	toJSON () {
		//Convert from parameters
		let json_obj = {
			keyframes: {}
		};
		
		//Iterate over all this.keyframes and parse them to a minimal JSON contract
		let all_keyframes = Object.keys(this.keyframes).sort();
		
		for (let i = 0; i < all_keyframes.length; i++) {
			let local_keyframe = this.keyframes[all_keyframes[i]];
			
			json_obj.keyframes[all_keyframes[i]] = { value: local_keyframe.value };
		}
		
		//Return statement
		console.log(json_obj);
		return JSON.stringify(json_obj);
	}
};