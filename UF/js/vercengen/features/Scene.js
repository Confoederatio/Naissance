/**
 * Refer to <span color = "yellow">{@link ve.Feature}</span> for methods or fields inherited from the parent, such as automatic destructuring.
 * 
 * Creates a background scene, typically meant as a full viewport screen with a draw/initialisation loop. Elements are mounted to {@link ve.scene_el}.
 * - Functional binding: <span color=00ffff>veScene</span>().
 * 
 * ##### Constructor:
 * - `arg0_components_obj`: {@link function}|{@link Object}<{@link ve.Component}>|{@link string}|{@link ve.Component}
 * - `arg1_options`: {@link Object}
 * 
 * ##### Instance:
 * - `.v`: {@link Object}<{@link ve.Component}>
 * 
 * @augments ve.Feature
 * @augments {@link ve.Feature}
 * @memberof ve.Feature
 * @type {ve.Scene}
 */
ve.Scene = class extends ve.Feature {
	constructor (arg0_components_obj, arg1_options) {
		//Convert from parameters
		let components_obj = (arg0_components_obj) ? arg0_components_obj : {};
		let options = (arg1_options) ? arg1_options : {};
			super({}, options);
		
		//Declare local instance variables
		this.components_obj = components_obj;
		this.element = document.createElement("div");
			this.element.setAttribute("class", "ve-feature-scene");
			this.element.instance = this;
			HTML.setAttributesObject(this.element, options.attributes);
			HTML.applyTelestyle(this.element, {
				height: "100%",
				width: "100%",
				...options.style
			});
			if (options.theme)
				HTML.applyTelestyle(this.element, ve.registry.themes[options.theme]);
			
		//Append ve.scene_el
		ve.scene_el.appendChild(this.element);
		this.v = this.components_obj;
	}
	
	/**
	 * Returns {@link this.components_obj}
	 * - Accessor of: {@link ve.Scene}
	 *
	 * @returns {{"<component_key>": ve.Component}}
	 */
	get v () {
		//Return statement
		return this.components_obj;
	}
	
	/**
	 * Sets the `components_obj` variable stored in the present scene.
	 * - Accessor of: {@link ve.Scene}
	 *
	 * @param {{"<component_key>": ve.Component}} arg0_components_obj
	 */
	set v (arg0_components_obj) {
		//Convert from parameters
		let components_obj = (arg0_components_obj) ? arg0_components_obj : {};
		
		//Declare local instance variables
		this.components_obj = components_obj;
		
		//Iterate over this.components_obj after resetting this.element
		this.element.innerHTML = "";
		Object.iterate(this.components_obj, (local_key, local_value) => {
			if (this[local_key] === undefined) {
				this[local_key] = local_value;
			} else {
				console.error(`ve.Scene: ${local_key} is already defined and is thus a reserved keyword.`);
			}
			
			//Append local_value.element if present
			if (local_value.element)
				this.element.appendChild(local_value.element);
		});
	}
	
	/**
	 * Creates a draw loop for the present scene using {@link setInterval}() polling.
	 * - Method of: {@link ve.Scene}
	 * 
	 * @param {function} arg0_function - (this:{@link ve.Scene}
	 * @param {number} [arg1_interval=100]
	 */
	draw (arg0_function, arg1_interval) {
		//Convert from parameters
		let local_function = arg0_function;
		let interval = Math.returnSafeNumber(arg1_interval, 100);
		
		//Add this.draw_loop for element
		this.draw_loop = setInterval(() => {
			local_function(this);
		}, interval);
	}
};

//Functional binding

/**
 * @returns {ve.Scene}
 */
veScene = function () {
	//Return statement
	return new ve.Scene(...arguments);
};