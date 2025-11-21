/**
 * Refer to <span color = "yellow">{@link ve.Feature}</span> for methods or fields inherited from the parent, such as automatic destructuring.
 * 
 * Creates a toast spawned at the present cursor. For this component, it is recommended to use a string rather than {@link ve.Component} types for the first parameter (`arg0_components_obj`).
 * - Functional binding: <span color=00ffff>veToast</span>().
 * 
 * ##### Constructor:
 * - `arg0_components_obj`: {@link function}|{@link Object}<{@link ve.Component}>|{@link string}|{@link ve.Component}
 * - `arg1_options`: {@link Object}
 *   - `.duration=1200`: {@link number} - The duration the toast should last in ms. 1,2 seconds by default.
 * 
 * ##### Methods:
 * - <span color=00ffff>{@link ve.Toast.refresh|refresh}</span>(arg0_components_obj:{@link Object}<{@link ve.Component}>) - Refreshes the Toast display if possible.
 * 
 * @augments ve.Feature
 * @augments {@link ve.Feature}
 * @memberof ve.Feature
 * @type {ve.Toast}
 */
ve.Toast = class extends ve.Feature {
	constructor (arg0_components_obj, arg1_options) {
		//Convert from parameters
		let components_obj = arg0_components_obj;
		let options = (arg1_options) ? arg1_options : {};
			super(components_obj, options);
		
		//Initialise options
		options.attributes = (options.attributes) ? options.attributes : {};
		options.duration = Math.returnSafeNumber(options.duration, 1200);
		
		//Declare local instance variables
		this.element = document.createElement("div");
			this.element.classList.add("ve", "toast");
			this.element.instance = this;
		
		
		if (typeof components_obj === "string") {
			this.element.innerHTML = components_obj;
		} else {
			this.refresh(components_obj);
		}
		
		//Append ve.window_overlay_el and immediately delay a frame to calculate centre positions and start animation
		ve.window_overlay_el.appendChild(this.element);
		requestAnimationFrame(() => {
			let rect = this.element.getBoundingClientRect();
				let centred_x = HTML.mouse_x - rect.width/2;
				let centred_y = HTML.mouse_y - rect.height/2;
				
			//Centre this.element at mouse position
			this.element.style.left = `${centred_x}px`;
			this.element.style.top = `${centred_y}px`;
			
			//Trigger animation
			this.element.style.animation = `toast-fade-up ${options.duration/1000}s ease-out forwards`;
			this.element.style.opacity = "1";
			this.element.addEventListener("animationend", () => this.remove());
		});
	}
	
	/**
	 * Refreshes the toast display with a set of new components.
	 * - Method of: {@link ve.Toast}
	 * 
	 * @param {{"<component_key>": ve.Component}} arg0_components_obj
	 */
	refresh (arg0_components_obj) {
		//Convert from parameters
		this.components_obj = arg0_components_obj;
		
		//Append all components in components_obj to this.element
		this.element.innerHTML = "";
		Object.iterate(this.components_obj, (local_key, local_value) => {
			if (this[local_key] === undefined) {
				this[local_key] = local_value;
			} else {
				console.error(`ve.Toast: ${local_key} is already defined by ve.Toast and cannot be destructured.`);
			}
			
			//Add component element to this.element
			if (local_value.element) {
				local_value.element.id = local_key;
				this.element.appendChild(local_value.element);
			}
			if (local_value.name === undefined || local_value.name === "")
				local_value.name = local_key;
		});
	}
}

//Functional binding

/**
 * @returns {ve.Toast}
 */
veToast = function () {
	//Return statement
	return new ve.Toast(...arguments);
};