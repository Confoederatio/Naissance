/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 * 
 * Timeline with both {@link ve.TimelineChronology} and {@link ve.TimelineVerticalBar} views.
 * 
 * ##### Constructor:
 * - `arg0_value=Date.getCurrentDate()`: {@link number}|{@link Object} - The Date at which to start the ve.Timeline.
 * - `arg1_options`: {@link Object}
 *   - `.bar_options`: {@link Object}
 *     - `.layout="vertical"`: {@link string} - Either 'horizontal'/'vertical'.
 *     - `.zoom=1`: {@link number}
 *   - `.chronology_options`: {@link Object}
 *     - `.page_sizes`: {@link Array}<{@link Object}>
 *       - `[n].date_window`: {@link Object} - Whether to apply a date window. Supersedes `.page_sizes.max_items`.
 *       - `[n].max_items=20`: {@link number}
 *     - `.starting_page`: {@link number}
 *   - `.filter`: {@link Object}
 *     - `.enabled=false`: {@link boolean}
 *     - 
 *     - `.date_window`: {@link Array}<{@link Object}|{@link number}, {@link Object}|{@link number}> - The start_date, end_date window to display values from.
 *     - `.groups`: {@link Array}<{@link string}> - Group IDs to filter for.
 *     - `.unique_timestamps=false`: {@link boolean} - Ensures only unique timestamps are filtered for.
 *   - `.groups`: {@link Object}
 *     - `<group_id>`: {@link Object}
 *       - `.key`: {@link string}
 *       - `.name`: {@link string}
 *       - `.colour`: {@link Array}<{@link number}, {@link number}, {@link number}>|{@link string}
 *       - `.types=["All"]`: {@link Array}<{@link string}> - The types to use when rendering the filter.
 *   - `.keyframes`: {@link Object}
 *     - `<timestamp>`: {@link Object}
 *       - `.groups`: {@link Array}<{@link string}> - The Group IDs this keyframe belongs to.
 *       - `.name`: {@link string}
 *       - 
 *       - `.description`: {@link string}
 *   - `.onkeyframeclick`: {@link function}(v:{@link Object}, e:{@link ve.Timeline})
 *   - `.onkeyframedelete`: {@link function}(v:{@link Object}, e:{@link ve.Timeline})
 *   - `.onkeyframemove`: {@link function}(v:{@link Object}, e:{@link ve.Timeline})
 *   - `.multiselect=true`: {@link boolean}
 *   
 * ##### Instance:
 * - `.v`: {@link Object}
 * 
 * ##### Methods:
 * - <span color=00ffff>{@link ve.UndoRedo.draw|draw}</span>() - 
 *
 * @augments ve.Component
 * @memberof ve.Component
 * @type {ve.Timeline}
 */
ve.Timeline = class extends ve.Component {
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = (arg0_value !== undefined) ? arg0_value : Date.getCurrentDate();
		let options = {
			bar_options: {},
			chronology_options: {},
			filter: {},
			groups: {},
			keyframes: {},
			...arg1_options
		};
			super(options);
			
		//Declare local instance variables
		this.element = document.createElement("div");
			this.element.setAttribute("component", "ve-timeline");
			this.element.instance = this;
			if (options.attributes) HTML.setAttributesObject(this.element, options.attributes);
		this.options = options;
		this.value = value;
		
		this.chronology = new ve.TimelineChronology(value, { timeline_instance: this });
		this.page_menu = new ve.PageMenu({
			chronology: {
				name: "Chronology",
				components_obj: { 
					chronology_instance: this.chronology
				}
			},
			timeline_map: {
				name: "Timeline Map",
				components_obj: {
					label: veHTML("Timeline maps remain to be implemented in future versions of Vercengen.")
				}
			}
		});
		
		//Append to body
		this.element.appendChild(this.page_menu.element);
		
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
	
	draw () {
		//Update chronology; update timeline bar
		this.chronology.draw();
	}
	
	setKeyframes (arg0_keyframes_obj) {
		//Convert from parameters
		let keyframes_obj = (arg0_keyframes_obj) ? arg0_keyframes_obj : {};
		
		//Declare local instance variables
		this.options.keyframes = keyframes_obj;
		this.draw();
	}
};

//Functional binding

/**
 * @returns {ve.Timeline}
 */
veTimeline = function () {
	//Return statement
	return new ve.Timeline(...arguments);
};