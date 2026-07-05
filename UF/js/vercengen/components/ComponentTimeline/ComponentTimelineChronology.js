/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 * 
 * ##### Constructor:
 * - `arg0_value=Date.getCurrentDate()`: {@link number}|{@link Object} - The Date at which to start the Chronology.
 * - `arg1_options`: {@link Object}
 *   - `.timeline_instance`: {@link ve.Timeline}
 *
 * @augments ve.Component
 * @memberof ve.Component
 * @type {ve.TimelineChronology}
 */
ve.TimelineChronology = class extends ve.Component {
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = (arg0_value !== undefined) ? arg0_value : Date.getCurrentDate();
		let options = {
			...arg1_options
		};
			super(options);
			
		//Declare local instance variables
		this.element = document.createElement("div");
			this.element.setAttribute("component", "ve-timeline-chronology");
			this.element.instance = this;
			if (options.attributes) HTML.setAttributesObject(this.element, options.attributes);
		this.options = options;
		this.value = value;
		
		//Declare table and draw
		this.table = new ve.Table([], {
			non_sortable_columns: [0, 1],
			onrowclick: (v, e) => {
				let timeline_options = this.options.timeline_instance.options;
				
				if (timeline_options.onkeyframeclick)
					timeline_options.onkeyframeclick(v, e);
			},
			onrowrightclick: (v, e) => {
				let timeline_options = this.options.timeline_instance.options;
				e.right_click = true;
				
				if (timeline_options.onkeyframeclick)
					timeline_options.onkeyframeclick(v, e);
			},
			retain: true,
			page_size: 30,
			page_sizes: [10, 20, 30, 40, 50],
			...this.options.table_options
		});
		this.table.bind(this.element);
		
		this.from_binding_fire_silently = true;
		this.v = value;
		delete this.from_binding_fire_silently;
	}
	
	get v () {
		//Return statement
		return Date.getDate(this.value);
	}
	
	set v (arg0_date) {
		//Convert from parameters
		let date = arg0_date;
		
		//Declare local instance variables
		this.timestamp = Date.getTimestamp(date);
		this.value = Date.getDate(date);
		
		//Update draw
		this.draw();
		this.fireFromBinding();
	}
	
	draw () { //[WIP] - Finish event handlers; add handling for .filter_obj.unique_timestamps
		//Declare local instance variables
		let table_array = [];
		let timeline_obj = this.options.timeline_instance;
		let timeline_options = timeline_obj.options;
		let timestamps_obj = {}; //<timestamp>: { count: number, row_value: Array } - Stores both the keyframe count and row_value, updating the description localisation if .filter_obj.unique_timestamps is true
		
		let filter_obj = timeline_options.filter;
			if (filter_obj?.date_window) {
				filter_obj.date_window[0] = Date.getTimestamp(filter_obj.date_window[0]);
				filter_obj.date_window[1] = Date.getTimestamp(filter_obj.date_window[1]);
				filter_obj.date_window.sort((a, b) => a - b); //Sort in ascending order
			}
			
		//Push table_array header
		table_array.push(["Date", "Keyframe"]);
		
		//Iterate over .timeline_options.keyframes; operate over .options.filter
		if (timeline_options.keyframes)
			Object.iterate(timeline_options.keyframes, (local_key, local_value) => {
				//Check against filter_obj
				let display_keyframe = false;
				let local_groups = (local_value.groups) ? local_value.groups : [];
				let local_timestamp = parseFloat(local_key);
				
				//Update timestamps_obj
				if (!timestamps_obj[local_timestamp]) timestamps_obj[local_timestamp] = {
					count: 0, row_value: []
				};
					let local_timestamp_obj = timestamps_obj[local_timestamp];
					local_timestamp_obj.count++;
				
				//Check for filter_obj pass
				if (filter_obj.enabled) {
					if (filter_obj.groups.length > 0)
						for (let i = 0; i < filter_obj.groups.length; i++)
							if (local_groups.includes(filter_obj.groups[i])) {
								display_keyframe = true;
								break;
							}
					if (filter_obj?.date_window)
						if (local_timestamp < filter_obj.date_window[0] || local_timestamp > filter_obj.date_window[1])
							display_keyframe = false;
				} else {
					display_keyframe = true;
				}
				
				//Render keyframe if display_keyframe is true
				if (display_keyframe) {
					let is_unique_timestamps = (filter_obj.enabled && filter_obj?.unique_timestamps);
					
					if (local_timestamp_obj.row_value.length === 0) {
						let keyframe_el = document.createElement("div");
							keyframe_el.id = "keyframe";
							
							//Set keyframe_el attributes
							if (local_value.is_current) {
								keyframe_el.setAttribute("data-is-current", String(local_value.is_current));
								this.current_index = table_array.length;
							}
							keyframe_el.keyframe = {
								key: local_key,
								value: local_value
							};
						local_timestamp_obj.row_value = [String.formatDate(local_timestamp), keyframe_el];
					}
					let local_keyframe_el = local_timestamp_obj.row_value[1];
					
					//.name handler; only format if timestamps are not grouped
					if (local_value.name) {
						let append_name = false;
						let local_name_el = local_keyframe_el.querySelector(".keyframe-name"); 
							if (!local_name_el) {
								local_name_el = document.createElement("div");
								append_name = true;
							}
							local_name_el.setAttribute("class", "keyframe-name");
							
							//Format local_value.name
							local_name_el.innerHTML = (!is_unique_timestamps) ? 
								local_value.name : `${String.formatNumber(local_timestamp_obj.count)} Keyframe(s) changed.`;
							if (append_name) local_keyframe_el.appendChild(local_name_el);
					}
					//.description handler; only show if timestamps are not grouped
					if (local_value.description && !is_unique_timestamps) {
						let local_description_el = document.createElement("div");
							local_description_el.setAttribute("class", "keyframe-description");
							local_description_el.innerHTML = local_value.description;
							local_keyframe_el.appendChild(local_description_el);
					}
					
					//Push to table_array
					if (!local_timestamp_obj.row_value)
						local_timestamp_obj.row_value = [String.formatDate(local_timestamp), local_keyframe_el];
					table_array.push(local_timestamp_obj.row_value);
				}
			}, { sort_mode: "date_ascending" });
		
		//Set table .v
		this.table.do_not_draw = true;
		this.table.v = table_array;
		delete this.table.do_not_draw;
		if (this.current_index !== undefined)
			this.table.jumpToIndex(this.current_index);
	}
};

//Functional binding

/**
 * @returns {ve.TimelineChronology}
 */
veTimelineChronology = function () {
	//Return statement
	return new ve.TimelineChronology(...arguments);
};