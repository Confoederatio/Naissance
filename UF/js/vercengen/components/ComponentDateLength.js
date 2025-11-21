/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 * 
 * Date length component used for managing historical time durations. The value stored is an object with the structure { year: {@link number}, month: {@link number}, day: {@link number}, hour: {@link number}, minute: {@link number} }, with negative years representing BC. This data structure is otherwise known as a {@link UF.Date}.
 * - Functional binding: <span color=00ffff>veDateLength</span>().
 * 
 * ##### Constructor:
 * - `arg0_value`: {@link UF.Date}
 * - `arg1_options`: {@link Object}
 *   - `.disabled=false`: {@link boolean}
 * 
 * ##### Instance:
 * - `.v`: {@link UF.Date}
 * 
 * @augments ve.Component
 * @augments {@link ve.Component}
 * @memberof ve.Component
 * @type {ve.veDateLength}
 */
ve.DateLength = class extends ve.Component {
	static demo_value = { year: 1000, month: 12, day: 31 };
	
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = (arg0_value) ? arg0_value : {};
		let options = (arg1_options) ? arg1_options : {};
			super(options);
			
		//Initialise options
		options.attributes = (options.attributes) ? options.attributes : {};
		
		//Declare local instance variables
		let attributes = {
			readonly: options.disabled,
			...options.attributes
		};
		this.element = document.createElement("div");
			this.element.setAttribute("component", "ve-datelength");
			this.element.instance = this;
		
		this.options = options;
		this.value = value;
		
		//Format HTML string
		let attributes_string = HTML.objectToAttributes(attributes);
		let html_string = [];
		html_string.push(`<span id = "name"></span> `);
		html_string.push(`
			<div class = "date-container">
				<input id = "years" size = "6" type = "number" placeholder = "Years"${attributes_string}>
				<input id = "months" size = "6" type = "number" min = "1" max = "12" placeholder = "Months"${attributes_string}>
				<input id = "days" size = "5" type = "number" placeholder = "Days"${attributes_string}>
			</div>
			<div class = "clock-container">
				<input id = "hours" size = "2" min = "0" max = "23" type = "number" placeholder = "HH"${attributes_string}> :
				<input id = "minutes" size = "2" min = "0" max = "23" type = "number" placeholder = "MM"${attributes_string}>
			</div>
		`);
		
		//Populate element and initialise handlers
		this.element.innerHTML = html_string.join("");
		let all_input_els = this.element.querySelectorAll("input");
		
		all_input_els.forEach((local_el) => local_el.addEventListener("change", (e) => {
			this.fireToBinding();
		}));
		this.v = value;
	}
	
	/**
	 * Returns the date length contained in the current component.
	 * 
	 * @returns {{year: number, month: number, day: number, hour: number, minute: number}} arg0_value
	 */
	get v () {
		//Return statement
		return Date.convertTimestampToDate(Date.getTimestamp({
			year: parseInt(this.element.querySelector(`#years`).value),
			month: parseInt(this.element.querySelector(`#months`).value),
			day: parseInt(this.element.querySelector(`#days`).value),
			hour: parseInt(this.element.querySelector(`#hours`).value),
			minute: parseInt(this.element.querySelector(`#minutes`).value)
		}));
	}
	
	/**
	 * Sets the date length contained in the current component.
	 * 
	 * @param {{year: number, month: number, day: number, hour: number, minute: number}} arg0_value
	 */
	set v (arg0_value) {
		//Convert from parameters
		let value = arg0_value;
		
		//Declare local instance variables
		this.element.querySelector(`#years`).value = Math.returnSafeNumber(value.year);
		this.element.querySelector(`#months`).value = Math.returnSafeNumber(value.month)
		this.element.querySelector(`#days`).value = Math.returnSafeNumber(value.day);
		this.element.querySelector(`#hours`).value = Math.returnSafeNumber(value.hour);
		this.element.querySelector(`#minutes`).value = Math.returnSafeNumber(value.minute);
		this.fireFromBinding();
	}
}

//Functional binding

/**
 * @returns {ve.DateLength}
 */
veDateLength = function () {
	//Return statement
	return new ve.DateLength(...arguments);
};