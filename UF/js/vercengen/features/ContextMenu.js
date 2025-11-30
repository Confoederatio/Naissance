/**
 * Refer to <span color = "yellow">{@link ve.Feature}</span> for methods or fields inherited from the parent, such as automatic destructuring.
 * 
 * Represents a ContextMenu Feature that contains a set of components. {@link ve.Window} instances are stored in `.windows`. Recursive.
 * - Functional binding: <span color=00ffff>veContextMenu</span>().
 * - Inherits feature: {@link ve.Window}
 * 
 * The immediate {@link ve.Button} element bound to the ContextMenu instance is contained in `.element`.
 * 
 * ##### Constructor:
 * - `arg0_components_obj`: {@link Object}<{@link ve.Component}>
 * - `arg1_options`: {@link Object}
 *   - `.anchor="left"/"right"` - Either 'left'/'right'. Position defaults to the side that has the most space.
 *   - `.button_options`: {@link ve.Button|ve.Button.options}
 *   - `.id`: {@link string}
 *   - `.mode="static_ui"` - Either 'static_ui'/'static_window'/'window'.
 *   - `.x=HTML.mouse_x`: {@link number}
 *   - `.y=HTML.mouse_y`: {@link number}
 *   
 * ##### Methods:
 * - <span color=00ffff>{@link ve.ContextMenu.addContextMenu|addContextMenu}</span>(arg0_components_obj: {@link Object}<{@link ve.Component}>, arg1_options: {@link ve.Window|ve.Window.options}) | {@link ve.ContextMenu}
 *   - `arg1_options`: {@link ve.Window|ve.Window.options}
 *     - `.id`: {@link string} - The ID to prevent duplicate context menus from being opened.
 * - <span color=00ffff>{@link ve.ContextMenu.close|close}</span>() | this:{@link ve.ContextMenu}
 * - <span color=00ffff>{@link ve.ContextMenu.getCurrentOffset|getCurrentOffset}</span>() | {@link number}
 * - <span color=00ffff>{@link ve.ContextMenu.open|open}</span>() | this:{@link ve.ContextMenu}
 * - <span color=00ffff>{@link ve.ContextMenu.removeContextMenu|removeContextMenu}</span>(arg0_index: this:{@link number}) | {@link ve.ContextMenu}
 * 
 * @augments ve.Feature
 * @augments {@link ve.Feature}
 * @memberof ve.Feature
 * @type {ve.ContextMenu}
 */
ve.ContextMenu = class extends ve.Feature {
	constructor (arg0_components_obj, arg1_options) {
		//Convert from parameters
		let components_obj = arg0_components_obj;
		let options = (arg1_options) ? arg1_options : {};
			super(components_obj, options);
		
		//Initialise options
		options.anchor = (options.anchor) ? options.anchor :
			(HTML.mouse_x < window.innerHeight/2) ? "left" : "right";
		options.button_options = (options.button_options) ? options.button_options : {};
		options.mode = (options.mode) ? options.mode : "static_ui";
		options.x = (options.x !== undefined) ? options.x : HTML.mouse_x;
		options.y = (options.y !== undefined) ? options.y : HTML.mouse_y;
		
		//Declare local instance variables
		this.button = new ve.Button((e) => {
			this.close();
			this.open();
		}, options.button_options);
		this.components_obj = components_obj;
		this.element = this.button.element;
		this.options = options;
		this.windows = [];
		
		this.addContextMenu(this.components_obj, { 
			id: options.id
		});
	}
	
	/**
	 * Adds a given context menu with a set `.options.id` to prevent duplicates.
	 * - Method of: {@link ve.ContextMenu}
	 * 
	 * @param {{"<component_key>": ve.Component}} arg0_components_obj
	 * @param {Object} [arg1_options]
	 *  @param {string} [arg1_options.anchor] - Either 'left'/'right', depending on available screen-space.
	 *  @param {string} [arg1_options.id]
	 *  
	 * @returns {ve.Window}
	 */
	addContextMenu (arg0_components_obj, arg1_options) {
		//Convert from parameters
		let components_obj = arg0_components_obj;
		let options = (arg1_options) ? arg1_options : {};
		
		//Initialise options
		if (options.id !== undefined) {
			//Iterate over all extant this.windows; internal guard clause if ID already exists
			let all_window_els = document.querySelectorAll("div.ve.window");
			let break_function = false;
			
			all_window_els.forEach((local_el) => {
				if (local_el.context_menu_instance)
					if (local_el.context_menu_instance.options.id === options.id)
						break_function = true;
			});
			this.windows.forEach((local_window) => {
				if (local_window.id === options.id)
					break_function = true;
			});
			
			if (break_function) return;
		} else {
			console.warn(`ve.ContextMenu: addContextMenu - options.id is not defined! options.id should be defined to prevent duplicate context menus from opening up.`);
		}
		
		//Declare local instance variables
		let actual_x;
			//Populate actual_x
			if (this.windows.length > 0) {
				actual_x = this.windows[0].element.offsetLeft;
			} else {
				actual_x = this.options.x;
			}
		let actual_y;
			//Populate actual_y
			if (this.windows.length > 0) {
				actual_y = this.windows[0].element.offsetTop;
			} else {
				actual_y = this.options.y;
			}
		let current_x_offset = this.getCurrentOffset();
			
		//Modify actual_x, actual_y
		if (this.options.anchor === "left") {
			actual_x += current_x_offset;
		} else if (this.options.anchor === "right") {
			actual_x -= current_x_offset;
		}
		
		//Create new ve.Window to represent the current context menu
		let window_obj = new ve.Window(components_obj, {
			mode: this.options.mode,
			x: actual_x,
			y: actual_y,
			...options
		});
		let close_window_button = document.createElement("div");
			close_window_button.classList.add("context-menu-close-button");
			close_window_button.innerHTML = `<icon>close</icon>`;
			close_window_button.onclick = (e) => {
				//Close preceding context menus
				let local_index = parseInt(close_window_button.getAttribute("data-index"));
				this.removeContextMenu(local_index);
			};
			close_window_button.setAttribute("data-index", this.windows.length.toString());
			
			window_obj.element.appendChild(close_window_button);
			window_obj.element.context_menu_instance = this;
			if (options.id)
				window_obj.id = options.id;
			window_obj.element.classList.add("ve-context-menu");
			
		this.windows.push(window_obj);
		
		//Post-processing
		//Right-align handling
		if (this.windows.length === 1 && this.options.anchor === "right") {
			actual_x -= this.windows[0].element.offsetWidth;
			setTimeout(() => {
				this.windows[0].element.style.left = `${actual_x}px`;
			}, 100);
		}
		
		//Return statement
		return window_obj;
	}
	
	/**
	 * Closes the present context menu and all its associated layers.
	 * - Method of: {@link ve.ContextMenu}
	 * 
	 * @returns {ve.ContextMenu}
	 */
	close () {
		//Iterate over all open context menus to close them in this.windows
		for (let i = 0; i < this.windows.length; i++)
			this.windows[i].remove();
		this.windows = [];
		
		//Return statement
		return this;
	}
	
	/**
	 * Returns the current X offset in px from the anchored first layer. Default padding is 4px.
	 * - Method of: {@link ve.ContextMenu}
	 * 
	 * @returns {number}
	 */
	getCurrentOffset () {
		//Declare local instance variables
		let offset_x = 0;
		
		//Iterate over all current windows in the context menu 
		for (let i = 0; i < this.windows.length; i++)
			offset_x += this.windows[i].element.offsetWidth + 4;
		
		//Return statement
		return offset_x;
	}
	
	/**
	 * Opens the present context menu with its bound {@link this.components_obj}.
	 * - Method of: {@link ve.ContextMenu}
	 * 
	 * @returns {ve.ContextMenu}
	 */
	open () {
		//Open current context menu with bound this.components_obj
		this.addContextMenu(this.components_obj);
		
		//Return statement
		return this;
	}
	
	/**
	 * Removes a context menu layer based on its order.
	 * - Method of: {@link ve.ContextMenu} 
	 * 
	 * @param {number} arg0_index
	 * 
	 * @returns {ve.ContextMenu}
	 */
	removeContextMenu (arg0_index) {
		//Convert from parameters
		let index = parseInt(arg0_index);
		
		//Attempt to remove all the context menus from ve.Windows after the current index
		try {
			for (let i = this.windows.length - 1; i >= index; i--) {
				this.windows[i].remove();
				this.windows.splice(i, 1);
			}
		} catch (e) {
			console.error(`ve.ContextMenu: The present index ${index} does not exist in this.windows:`, this.windows);
		}
		
		//Return statement
		return this;
	}
};

//Functional binding

/**
 * @returns {ve.ContextMenu}
 */
veContextMenu = function () {
	//Return statement
	return new ve.ContextMenu(...arguments);
};