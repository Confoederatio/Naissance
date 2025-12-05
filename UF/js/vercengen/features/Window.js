/**
 * Refer to <span color = "yellow">{@link ve.Feature}</span> for methods or fields inherited from the parent, such as automatic destructuring.
 * 
 * Represents a Window Feature that contains a set of components which are wrapped inside an Interface.
 * - Inherited by: {@link ve.ContextMenu}, {@link ve.Modal}, {@link ve.PageMenuWindow}
 *
 * ##### Constructor:
 * - `arg0_components_obj`: {@link Object}<{@link ve.Component}>
 * - `arg1_options`: {@link Object}
 *   - `.anchor="top_left"` - Either 'bottom_left'/'bottom_right'/'top_left'/'top_right'.
 *   - `.height="auto"`: {@link number}
 *   - `.width="12rem"`: {@link number}
 *   - `.x=HTML.mouse_x`: {@link number}
 *   - `.y=HTML.mouse_y`: {@link number}
 *   -
 *   - `.do_not_wrap=false`: {@link boolean} - Whether to disable wrapping in an always open ve.Interface.
 *   - `.id`: {@link string}
 *   - `.mode="window"`: {@link string} - Either 'static_ui'/'static_window'/'window'.
 *   - `.name=""`: {@link string} - Auto-resolves to 'Window' instead if `.can_rename=true`.
 *   - `.theme`: {@link string} - The CSS theme to apply to the Feature.
 *   -
 *   - `.can_close`: {@link boolean}
 *   - `.can_rename`: {@link boolean}
 *   - `.draggable`: {@link boolean}
 *   - `.headless`: {@link boolean}
 *   - `.resizeable`: {@link boolean}
 *   - 
 *   - `.onuserchange`: {@link function}(arg0_v:{@link Object}, arg1_e:{@link Event}) - Fires upon user changes to the window. Changes are discrete, and the set of Object keys may vary.
 *     - `arg0_v`: {@link Object}
 *       - `.close`: {@link boolean} - Whether the change is a close event.
 *       - `.name`: {@link string}
 *   
 * ##### Instance:
 * - `.v`: {@link Object}<{@link ve.Component}>
 *
 * ##### Methods:
 * - <span color=00ffff>{@link ve.Window.getZIndex|getZIndex}</span>() | {@link number}
 * - <span color=00ffff>{@link ve.Window.select|select}</span>()
 * - <span color=00ffff>{@link ve.Window.setCoords|setCoords}</span>(arg0_x:{@link number}, arg1_y:{@link number})
 * - <span color=00ffff>{@link ve.Window.setName|setName}</span>(arg0_name:{@link string})
 * - <span color=00ffff>{@link ve.Window.setSize|setSize}</span>(arg0_width:{@link number}|{@link string}, arg1_height:{@link number}|{@link string})
 * - <span color=00ffff>{@link ve.Window.refresh|refresh}</span>(arg0_components_obj:{@link Object}<{@link ve.Component}>)
 * 
 * ##### Static Fields:
 * - `.instances`: {@link Array}<{@link ve.Window}>
 * 
 * ##### Static Methods:
 * - <span color=00ffff>{@link ve.Window.getHighestZIndex}</span>(arg0_options:{ return_object=false: {@link boolean} }) | {@link number}|{@link ve.Window}
 *   
 * @augments ve.Feature
 * @memberof ve.Feature
 * @type {ve.Window}
 */
ve.Window = class extends ve.Feature {
	//Declare local static variables
	static instances = [];
	
	constructor (arg0_components_obj, arg1_options) {
		//Convert from parameters
		let components_obj = arg0_components_obj;
		let options = (arg1_options) ? arg1_options : {};
			super(components_obj, options);
		
		//Initialise options
		let is_coords_well_defined = (typeof options.x === "number" && typeof options.y === "number");
		if (options.mode === undefined)
			options.mode = (is_coords_well_defined) ? "static_ui" : "window";
		
		options.anchor = (options.anchor) ? options.anchor : "top_left";
		options.height = (options.height !== undefined) ? options.height : "auto";
		options.width = (options.width !== undefined) ? options.width : "12rem";
		options.x = (options.x !== undefined) ? options.x : HTML.mouse_x;
		options.y = (options.y !== undefined) ? options.y : HTML.mouse_y;
		
		//Parse options
		let mode_behaviour = {
			static_ui: {
				can_close: false,
				can_rename: false,
				draggable: false,
				resizeable: false,
				headless: true,
				is_static: true
			},
			static_window: {
				can_close: false,
				can_rename: false,
				draggable: false,
				resizeable: false,
				headless: false,
				is_static: true
			},
			window: {
				can_close: true,
				can_rename: true,
				draggable: true,
				resizeable: true,
				headless: false,
				is_static: false
			}
		};
		options = {
			...mode_behaviour[options.mode],
			...options
		};
		
		options.name = (options.name) ? options.name : "";
			if (options.can_rename && options.name === "") options.name = `Window`;
			this.name = options.name;
			
		//Declare local instance variables
		this.options = options;
		
		//Parse to ve.HTML if components_obj is typeof function or string
		//this.components_obj
		if (typeof components_obj === "function" || typeof components_obj === "string") {
			this.components_obj = {
				html: new ve.HTML(components_obj)
			};
		} else if (components_obj.is_vercengen_component) {
			this.components_obj = {
				component: components_obj
			};
		} else {
			this.components_obj = components_obj;
		}
		this.element = document.createElement("div");
		
		//Iterate over all .attributes if extant to set them
		if (typeof options.attributes === "object")
			Object.iterate(options.attributes, (local_key, local_value) => {
				if (local_key === "class") {
					this.element.classList.add(...local_value.toString().split(" "));
				} else {
					this.element.setAttribute(local_key, local_value.toString());
				}
			});
		
		this.id = (this.options.id) ? this.options.id : Class.generateRandomID(ve.Window);
		this.x = options.x;
		this.y = options.y;
		
		//Adjust height/width, position
		{
			setTimeout(() => {
				this.setCoords(this.x, this.y);
				this.setSize(options.width, options.height);
				
				if (this.options.theme)
					HTML.applyTelestyle(this.element, ve.registry.themes[this.options.theme]);
			});
		}
		
		//Populate Window element
		this.element.instance = this;
		this.element.classList.add("class", `ve`, `window`);
		this.element.id = this.id;
		this.element.innerHTML = `
			${(!options.headless) ? `<div id = "feature-header" class = "feature-header">
				<span id = "window-name"${(this.options.can_rename) ? ` contenteditable = "plaintext-only"` : ""}>${this.name}</span>
			</div>` : ""}
			<div id = "feature-body" class = "feature-body"></div>
		`;
		this.element.style.zIndex = ve.Window.instances.length.toString();
		
		let window_name_el = this.element.querySelector(`#window-name`);
		if (window_name_el)
			window_name_el.addEventListener("focusout", (e) => {
				if (this.options.onuserchange)
					this.options.onuserchange({ name: window_name_el.innerHTML }, e);
			});
		
		//Instantiate element handlers
		if (this.options.can_close && !this.options.headless) {
			let close_button = document.createElement("img");
				close_button.id = "close-button";
				close_button.src = `./UF/gfx/close_icon_dark.png`;
			this.element.querySelector(`#feature-header`).appendChild(close_button);
			
			close_button.onclick = (e) => {
				if (this.options.onuserchange)
					this.options.onuserchange({ close: true }, e);
				this.remove();
			};
		}
		if (!this.options.headless)
			HTML.createSection({
				selector: `.ve.window[id="${this.id}"] #feature-header, .ve.window[id="${this.id}"] #feature-body`
			});
		if (this.options.draggable) {
			this.element.classList.add("draggable");
			HTML.elementDragHandler(this.element, {
				is_resizable: (this.options.resizeable)
			});
		}
		
		//Improved window ergonomics by only listening to headers, allowing for casual body editing
		this.element.addEventListener("mousedown", (e) => {
			let feature_header_el = this.element.querySelector(`#feature-header`);
			
			if (feature_header_el)
				if (this.element.querySelector(`#feature-header`).contains(e.target))
					this.select();
		});
		this.element.addEventListener("dblclick", () => {
			if (this.element.querySelector(`#feature-header`))
				this.select();
		});
		
		//Push Window instance to ve.Window.instances
		this.refresh(this.components_obj);
		ve.window_overlay_el.appendChild(this.element);
		ve.Window.instances.push(this);
		this.select();
	}
	
	/**
	 * Returns the components currently visible in the Window.
	 * - Accessor of: {@link ve.Window}
	 *
	 * @alias v
	 * @memberof ve.Feature.ve.Window
	 * @type {{"<component_key>": ve.Component}}
	 * 
	 * @returns {{"<component_key>": ve.Component}}
	 */
	get v () {
		//Return statement
		return this.components_obj;
	}
	
	/**
	 * Sets the components visible in the current window.
	 * - Accessor of: {@link ve.Window}
	 *
	 * @alias v
	 * @memberof ve.Feature.ve.Window
	 * @type {{"<component_key>": ve.Component}}
	 * 
	 * @param {{"<component_key>": ve.Component}} arg0_components_obj
	 */
	set v (arg0_components_obj) {
		//Convert from parameters
		let components_obj = arg0_components_obj;
		
		//Refresh local instance
		this.refresh(components_obj);
	}
	
	/**
	 * Returns the current z-index of this {@link ve.Window}.
	 * - Method of: {@link ve.Window}
	 *
	 * @alias getZIndex
	 * @memberof ve.Feature.ve.Window
	 *
	 * @returns {number}
	 */
	getZIndex () {
		//Return statement
		return parseInt(getComputedStyle(this.element)["z-index"]);
	}
	
	/**
	 * Refreshes the components display for the current Window.
	 * - Method of: {@link ve.Window}
	 *
	 * @alias refresh
	 * @memberof ve.Feature.ve.Window
	 * 
	 * @param {{"<component_key>": ve.Component}} arg0_components_obj
	 */
	refresh (arg0_components_obj) {
		//Convert from parameters
		this.components_obj = arg0_components_obj;
		
		//Declare local instance variables
		let feature_body_el = this.element.querySelector(`#feature-body`);
		
		//Automatically wrap this.components_obj in a ve.Interface object (.is_folder=false)
		if (!this.options.do_not_wrap) {
			feature_body_el.innerHTML = "";
			this._interface = new ve.Interface(this.components_obj, { //[WIP] - Make generic via .is_container field for ve.Interface
				is_folder: false,
				name: " ",
				
				style: {
					padding: 0
				}
			});
			this._interface.element.setAttribute("class", "ve-disable-nesting");
			feature_body_el.appendChild(this._interface.element);
		} else {
			delete this._interface;
			
			//Append all components in components_obj to this.element.querySelector("#feature-body")
			feature_body_el.innerHTML = "";
			Object.iterate(this.components_obj, (local_key, local_value) => {
				if (local_value.element) {
					local_value.element.id = local_key;
					feature_body_el.appendChild(local_value.element);
				}
				if (local_value.name === undefined || local_value.name === "")
					local_value.name = local_key;
			});
		}
	}
	
	/**
	 * Selects the current {@link ve.Window} instance, raising its z-index above all other Windows.
	 * - Method of: {@link ve.Window}
	 *
	 * @alias select
	 * @memberof ve.Feature.ve.Window
	 */
	select () {
		//Declare local instance variables
		let current_highest_z_index = ve.Window.getHighestZIndex() + 1;
		
		//Swap z-indices
		this.element.style.zIndex = current_highest_z_index.toString();
		ve.Window.normaliseZIndexes();
	}
	
	/**
	 * Sets the present coords of the window to a given X, Y coordinate relative to the present anchor.
	 * - Method of: {@link ve.Window}
	 *
	 * @alias setCoords
	 * @memberof ve.Feature.ve.Window
	 * 
	 * @param {number} arg0_x
	 * @param {number} arg1_y
	 */
	setCoords (arg0_x, arg1_y) {
		//Convert from parameters
		let x = parseInt(arg0_x);
		let y = parseInt(arg1_y);
		
		//Set element X, Y position
		this.element.style.position = "absolute";
		this.element.style.bottom = "";
		this.element.style.left = "";
		this.element.style.right = "";
		this.element.style.top = "";
		HTML.applyTelestyle(this.element, {
			...HTML.getCSSPosition(this.options.anchor, x, y)
		});
	}
	
	/**
	 * Sets the current name of the window.
	 * - Method of: {@link ve.Window}
	 *
	 * @alias setName
	 * @memberof ve.Feature.ve.Window
	 * 
	 * @param {string} arg0_name
	 */
	setName (arg0_name) {
		//Convert from parameters
		let name = (arg0_name) ? arg0_name : "";
		
		//Set name
		this.name = name;
		try {
			this.element.querySelector(`#feature-header #window-name`).innerText = this.name;
		} catch (e) {}
	}
	
	/**
	 * Sets the given size of the current window using either numbers or CSS calculated strings in Telestyle. Any functions must return either a number/string.
	 * - Method of: {@link ve.Window}
	 *
	 * @alias setSize
	 * @memberof ve.Feature.ve.Window
	 * 
	 * @param {function|number|string} arg0_width
	 * @param {function|number|string} arg1_height
	 */
	setSize (arg0_width, arg1_height) {
		//Convert from parameters
		let width = arg0_width;
		let height = arg1_height;
		
		//Apply style
		HTML.applyTelestyle(this.element, {
			...HTML.getCSSSize(width, height)
		});
	}
	
	/**
	 * Returns the highest z-index over the set of all Windows in {@link ve.Window.instances}.
	 * - Static method of: {@link ve.Window}
	 *
	 * @alias #getHighestZIndex
	 * @memberof ve.Feature.ve.Window
	 * 
	 * @param {Object} [arg0_options]
	 *  @param {boolean} [arg0_options.return_object=false] - Whether to return a ve.Window instance.
	 *
	 * @returns {number|ve.Window}
	 */
	static getHighestZIndex (arg0_options) {
		//Convert from parameters
		let options= (arg0_options) ? arg0_options : {};
		
		//Declare local instance variables
		let highest_z_index = [-Infinity, undefined];
		
		//Iterate over all ve.Window.instances
		for (let i = 0; i < ve.Window.instances.length; i++) {
			let local_instance = ve.Window.instances[i];
			
			if (!local_instance.element.classList.contains("ve-context-menu"))
				if (local_instance.getZIndex() > highest_z_index[0])
					highest_z_index = [local_instance.getZIndex(), local_instance];
		}
		
		//Return statement
		return (!options.return_object) ? highest_z_index[0] : highest_z_index[1];
	}
	
	/** 
	 * Normalises all z-indexes over the set of ve.Windows.
	 *
	 * @alias #normaliseZIndexes
	 * @memberof ve.Feature.ve.Window
	 * */
	static normaliseZIndexes () {
		//Declare local instance variables
		let overlay_el = ve.window_overlay_el;
		
		//Get all elements with [data-window-id] and their z-index values
		let all_windows = Array.from(overlay_el.querySelectorAll(`.ve.window`));
		
		// Extract z-index values and sort them numerically
		let z_indexes = all_windows
		.map((window) => ({
			element: window,
			z_index: parseInt(window.style.zIndex || 0, 10),
		}))
		.sort((a, b) => a.z_index - b.z_index);
		
		// Assign normalized z-index values (1, 2, 3, ...)
		z_indexes.forEach((item, index) => {
			item.element.style.zIndex = (index + 1).toString();
			item.element.style.setProperty("--local-z-index", (index + 1).toString());
		});
	}
};

//Functional binding

/**
 * @returns {ve.Window}
 */
veWindow = function () {
	//Return statement
	return new ve.Window(...arguments);
};