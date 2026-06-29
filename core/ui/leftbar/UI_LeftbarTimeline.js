global.UI_LeftbarTimeline = class { //[WIP] - Add Shift/Ctrl + Left/Right Arrow modes for scrolling through keyframes
	static instances = [];
	static refresh_frame = false;
	
	constructor () {
		//Declare local instance variables
		this.ui = {};
		this.value = new ve.Timeline(undefined, {
			onkeyframeclick: (v, e) => {
				//Declare local instance variables
				let keyframe_obj = v[1].keyframe;
				let timestamp = Date.getTimestamp(keyframe_obj.key);
				
				//Jump to keyframe for sure
				DALS.Timeline.parseAction("load_date", [
					{ set_date: Date.convertTimestampToDate(timestamp) },
					{ refresh_date: true }
				]);
				
				//Context menu handling
				if (e.right_click) {
					if (this.keyframe_window) this.keyframe_window.close();
					this.keyframe_window = veWindow({
						move_keyframe_to: veButton(() => {
							if (this.move_keyframe_to_window) this.move_keyframe_to_window.close();
							this.move_keyframe_to_window = veWindow({
								end_date: veDate((this.ui.move_keyframe_to_date !== undefined) ? this.ui.move_keyframe_to_date : timestamp, {
									onuserchange: (v) => this.ui.move_keyframe_to_date = v
								}),
								confirm: veButton(() => {
									//Internal guard clause for this.ui.move_keyframe_to_date
									if (this.ui.move_keyframe_to_date === undefined) {
										veToast("The date to move the keyframe to cannot be the same as the initial date.");
										return;
									}
									
									//Declare local instance variables
									let to_timestamp = Date.getTimestamp(this.ui.move_keyframe_to_date);
									
									//Move global keyframe
									DALS.Timeline.parseAction("move_global_keyframe", [{
										type: "Renderer",
										move_keyframe: {
											from_timestamp: timestamp,
											to_timestamp: to_timestamp
										}
									}]);
									UI_Leftbar.refresh();
									
									let date_string = String.formatDate(Date.convertTimestampToDate(timestamp));
									let ot_date_string = String.formatDate(Date.convertTimestampToDate(to_timestamp));
									
									veToast(`Moved global keyframe from ${date_string} to ${ot_date_string}.`);
									
									if (this.move_keyframe_to_window) this.move_keyframe_to_window.close();
									if (this.keyframe_window) this.keyframe_window.close();
								}, { name: "Confirm" })
							}, {
								name: "Move Keyframe To",
								can_rename: false,
								width: "15rem"
							})
						}, { name: "Move Keyframe To" }),
						jump_to_date: veButton(() => {
							DALS.Timeline.parseAction("load_date", [
								{ set_date: Date.convertTimestampToDate(timestamp) },
								{ refresh_date: true }
							]);
						}, { name: "Jump to Date" })
					}, {
						name: v[0],
						can_rename: false,
						width: "15rem"
					});
				}
				
			}
		});
		if (!UI_LeftbarTimeline.onkeydown) {
			UI_LeftbarTimeline.onkeydown = true;
			
			//Left/Right Arrow key handling for Timeline
			document.addEventListener("keydown", (e) => {
				let all_focus_els = document.querySelectorAll(":focus");
				if (all_focus_els.length > 0) return; //Internal guard clause for text inputs
				
				let amount = 1;
				let key = e.key;
				
				if (HTML.shift_pressed) amount = 5;
				if (HTML.ctrl_pressed) amount = 10;
				
				if (key === "ArrowLeft") UI_LeftbarTimeline.jumpToPreviousKeyframe(amount);
				if (key === "ArrowRight") UI_LeftbarTimeline.jumpToNextKeyframe(amount);
			});
		}
		
		this.refresh();
		
		UI_LeftbarTimeline.instances.push(this);
	}
	
	refresh () {
		if (!(global.main || window.main)) return; //Internal guard clause if main is not defined
		
		//Declare local instance variables
		let all_timestamps = main.renderer.getTimestamps();
		let has_timestamp = (all_timestamps.includes(main.timestamp));
		let keyframes_obj = {};
		
		//Iterate over all_timestamps and push to keyframes_obj
		for (let i = 0; i < all_timestamps.length; i++) {
			if (!has_timestamp && all_timestamps[i] > main.timestamp) {
				keyframes_obj[main.timestamp] = {
					name: "No keyframe",
					is_current: true
				};
				has_timestamp = true;
			}
			keyframes_obj[all_timestamps[i]] = {
				name: "Global keyframe",
				is_current: (all_timestamps[i] === main.timestamp)
			};
		}
		
		this.value.setKeyframes(keyframes_obj);
	}
	
	static cache () {
		//Declare local instance variables
		UI_LeftbarTimeline._cache = {
			timestamps: main.renderer.getTimestamps()
		};
	}
	
	static jumpToNextKeyframe (arg0_jump_amount) {
		//Convert from parameters
		let jump_amount = Math.returnSafeNumber(arg0_jump_amount, 1);
		
		if (jump_amount <= 0) { //Internal guard clause if jump_amount is negative
			UI_LeftbarTimeline.jumpToPreviousKeyframe(jump_amount*-1);
			return;
		}
		if (jump_amount === 0) return; //Internal guard clause if jump_amount is 0
		
		//Declare local instance variables
		UI_LeftbarTimeline.cache();
		let all_timestamps = UI_LeftbarTimeline._cache.timestamps;
		let current_jump_count = 0;
		
		//Iterate over all_timestamps and try to jump as close to jump_amount as possible
		for (let i = 0; i < all_timestamps.length; i++) {
			if (all_timestamps[i] > main.timestamp)
				current_jump_count++;
			if (current_jump_count >= jump_amount || i === all_timestamps.length - 1) {
				DALS.Timeline.parseAction("load_date", [
					{ set_date: Date.convertTimestampToDate(all_timestamps[i]) },
					{ refresh_date: true }
				]);
				break;
			}
		}
	}
	
	static jumpToPreviousKeyframe (arg0_jump_amount) {
		//Convert from parameters
		let jump_amount = Math.returnSafeNumber(arg0_jump_amount, 1);
		
		if (jump_amount <= 0) { //Internal guard clause if jump_amount is negative
			UI_LeftbarTimeline.jumpToNextKeyframe(jump_amount*-1);
			return;
		}
		if (jump_amount === 0) return; //Internal guard clause if jump_amount is 0
		
		//Declare local instance variables
		UI_LeftbarTimeline.cache();
		let all_timestamps = UI_LeftbarTimeline._cache.timestamps;
		let current_jump_count = 0;
		
		//Iterate over all_timestamps and try to jump as close to jump_amount as possible
		for (let i = all_timestamps.length - 1; i >= 0; i--) {
			if (all_timestamps[i] < main.timestamp)
				current_jump_count++;
			if (current_jump_count >= jump_amount || i === 0) {
				DALS.Timeline.parseAction("load_date", [
					{ set_date: Date.convertTimestampToDate(all_timestamps[i]) },
					{ refresh_date: true }
				]);
				break;
			}
		}
	}
	
	static refresh () {
		if (UI_LeftbarTimeline.do_not_refresh) return;
		this.refresh_frame = true;
		
		if (!this.logic_loop) this.logic_loop = setInterval(() => {
			if (this.refresh_frame) {
				UI_LeftbarTimeline.cache();
				for (let i = 0; i < this.instances.length; i++)
					this.instances[i].refresh();
				delete this.refresh_frame;
			}
		}, 100);
	}
};