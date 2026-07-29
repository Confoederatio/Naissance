/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 *
 * Time input for selecting a given hour/minute. For longer date components with years, see {@link ve.Date} or {@link ve.DateLength} for time durations.
 * - Functional binding: <span color=00ffff>veTime</span>().
 *
 * ##### Constructor:
 * - `arg0_value`: {hour: {@link number}, minute: {@link number}}
 * - `arg1_options`: {@link Object}
 *   - `.disabled=false`: {@link boolean}
 *   - `.max`: {@link number}
 *   - `.min`: {@link number}
 *   - `.type`: {@link string} - Either 'time'/'hh:mm:ss'/'hh:mm'
 *
 * ##### Instance:
 * - `.v`: {hour: {@link number}, minute: {@link number}} | {@link number} - If a number, this represents the number of seconds in the input.
 *
 * @augments ve.Component
 * @memberof ve.Component
 * @type {ve.Time}
 */
ve.Time = class extends ve.Component {
	static demo_value = { hour: 10, minute: 10 };
	
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = (arg0_value !== undefined) ? arg0_value : {
			hour: 0,
			minute: 0,
			second: 0
		};
		let options = (arg1_options) ? arg1_options : {};
			super(options);
			
		//Initialise options
		options.attributes = (options.attributes) ? options.attributes : {};
		if (!options.type) options.type = "time";
		
		//Declare local instance variables
		let attributes = {
			readonly: options.disabled,
			placeholder: (options.type === "hh:mm") ? "HH:mm" : "HH:mm:ss",
			...options.attributes
		};
		this.element = document.createElement("div");
			this.element.setAttribute("component", "ve-time");
			this.element.instance = this;
		
		this.options = options;
		this.value = value;
		
		//Format html_string
		let html_string = [];
		html_string.push(`<span id = "name"></span> `);
		html_string.push(`<input type = "text"${HTML.objectToAttributes(attributes)}>`);
		
		//Populate element and initialise handlers
		this.element.innerHTML = html_string.join("");
		
		let input_el = this.element.querySelector("input");
		input_el.addEventListener("change", (e) => {
			let split_value = e.target.value.split(":");
			let h = 0, m = 0, s = 0;

			if (split_value.length === 3) {
				h = parseInt(split_value[0]) || 0;
				m = parseInt(split_value[1]) || 0;
				s = parseFloat(split_value[2]) || 0;
			} else if (split_value.length === 2) {
				m = parseInt(split_value[0]) || 0;
				s = parseFloat(split_value[1]) || 0;
			} else {
				s = parseFloat(split_value[0]) || 0;
			}
			
			this.from_binding_fire_silently = true;
			this.v = (typeof this.value === "number") ? (h * 3600) + (m * 60) + s : { hour: h, minute: m, second: parseFloat(s.toFixed(2)) };
			delete this.from_binding_fire_silently;
			this.fireToBinding();
		});
		this.v = this.value;
	}

	/**
	 * Returns the present time value.
	 * - Accessor of: {@link ve.Time}
	 *
	 * @alias v
	 * @memberof ve.Component.ve.Time
	 * @type {{hour: number, minute: number, second: number} | number}
	 */
	get v () {
		return this.value;
	}
	
	/**
	 * Sets the time value for the component.
	 * - Accessor of: {@link ve.Time}
	 *
	 * @alias v
	 * @memberof ve.Component.ve.Time
	 * 
	 * @param {{hour: number, minute: number, second: number} | number} arg0_value
	 */
	set v (arg0_value) {
		//Convert from parameters
		let value = arg0_value;
		this.value = value;
		
		let h, m, s;
		if (typeof value === "number") {
			h = Math.floor(value / 3600);
			m = Math.floor((value % 3600) / 60);
			s = parseFloat((value % 60).toFixed(2));
		} else {
			h = value.hour || 0;
			m = value.minute || 0;
			s = parseFloat((value.second || 0).toFixed(2));
		}
		
		let h_str = h.toString().padStart(2, "0");
		let m_str = m.toString().padStart(2, "0");
		let s_str = (s < 10) ? "0" + s.toString() : s.toString();
		
		let time_str = (this.options.type === "hh:mm") ? `${h_str}:${m_str}` : `${h_str}:${m_str}:${s_str}`;
		
		this.element.querySelector("input").value = time_str;
		this.fireFromBinding();
	}
};

//Functional binding

/**
 * @returns {ve.Toggle}
 */
veTime = function () {
	//Return statement
	return new ve.Time(...arguments);
};