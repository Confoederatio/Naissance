/**
 * Refer to <span color = "yellow">{@link ve.Feature}</span> for methods or fields inherited from the parent, such as automatic destructuring.
 * 
 * Represents a Modal Feature that contains a set of components which are wrapped inside a ve.Modal.
 * - Functional binding: <span color=00ffff>veModal</span>().
 * - Inherited by: {@link ve.Confirm}
 * - Inherits Feature: {@link ve.Window}
 * 
 * ##### Constructor:
 * - `arg0_components_obj`: {@link function}|{@link Object}<{@link ve.Component}>|{@link string}|{@link ve.Component}
 * - `arg1_options`: {@link Object} - Set of `.options` for {@link ve.Window}
 * 
 * ##### Methods:
 * - <span color=00ffff>{@link ve.Modal.close|close}</span>()
 * 
 * @augments ve.Feature
 * @augments {@link ve.Feature}
 * @class
 * @memberof ve.Feature
 * @type {ve.Modal}
 */
ve.Modal = class extends ve.Feature {
	constructor (arg0_components_obj, arg1_options) {
		//Convert from parameters
		let components_obj = arg0_components_obj;
		let options = (arg1_options) ? arg1_options : {};
			super(components_obj, options);
		
		//Declare local instance variables; this.window
		this.components_obj = components_obj;
		this.window = new ve.Window(this.components_obj, {
			can_close: true,
			mode: "static_window",
			...options
		});
		this.window.element.classList.add("modal");
		
		//Modify background element on #ve-overlay to disable user interaction anywhere else
		let overlay_el = document.querySelector(`#ve-overlay`);
			overlay_el.classList.add("modal-disabled");
		
		//Adjust this.window to be in the centre of the screen
		let offset_height = this.window.element.offsetHeight;
		let offset_width = this.window.element.offsetWidth;
		
		let actual_x = (window.innerWidth - offset_width)/2;
		let actual_y = (window.innerHeight - offset_height)/2;
		
		//Set this.window.options.x/y
		setTimeout(() => {
			this.window.element.style.left = `${actual_x}px`;
			this.window.element.style.top = `${actual_y}px`;
			this.window.options.x = actual_x;
			this.window.options.y = actual_y;
		}, 100);
		
		//Override #feature-header #close-button onclick behaviour
		this.window.element.querySelector(`#feature-header #close-button`).onclick = (e) => {
			this.close();
		};
	}
	
	/**
	 * Removes the current Modal from the DOM.
	 * - Method of: {@link ve.Modal}
	 *
	 * @alias close
	 * @memberof ve.Feature.ve.Modal
	 */
	close () {
		//Declare local instance variables
		let overlay_el = document.querySelector(`#ve-overlay`);
			overlay_el.classList.remove("modal-disabled");
		
		//Remove this.window after .modal-disabled is finished
		this.window.remove();
	}
};

//Functional binding

/**
 * @returns {ve.Modal}
 */
veModal = function () {
	//Return statement
	return new ve.Modal(...arguments);
};