/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 * 
 * Represents a {@link Blockly} sub-component used as a visual editor for {@link ve.ComponentScriptManager}.
 * 
 * **Note.** Declaring duplicate {@link ve.ScriptManager} components will reset the main Blockly workspace for each new instance.
 * - Functional binding: <span color=00ffff>veScriptManagerBlockly</span>().
 * 
 * ##### Constructor:
 * - `arg0_value`: {@link string} - The code to input into the present Blockly viewer.
 * - `arg1_options`: {@link Object}
 * 
 * ##### Instance:
 * - `.workspace`: {@link Blockly.Workspace}
 * - `.v`: {@link string}
 * 
 * ##### Methods:
 * - <span color=00ffff>{@link ve.ScriptManagerBlockly.disable|disable}</span>()
 * - <span color=00ffff>{@link ve.ScriptManagerBlockly.enable|enable}</span>()
 * - <span color=00ffff>{@link ve.ScriptManagerBlockly.fixBlocklyScaling|fixBlocklyScaling}</span>()
 * - <span color=00ffff>{@link ve.ScriptManagerBlockly.handleCSS|handleCSS}</span>()
 * - <span color=00ffff>{@link ve.ScriptManagerBlockly.hide|hide}</span>()
 * - <span color=00ffff>{@link ve.ScriptManagerBlockly.interceptBlocklyTransforms|interceptBlocklyTransforms}</span>()
 * - <span color=00ffff>{@link ve.ScriptManagerBlockly.setTheme|setTheme}</span>(arg0_theme:{@link string}) - Either 'theme_default'/'theme_light'.
 * - <span color=00ffff>{@link ve.ScriptManagerBlockly.show|show}</span>()
 * 
 * @augments ve.Component
 * @augments {@link ve.Component}
 * @type {ve.ScriptManagerBlockly}
 */
ve.ScriptManagerBlockly = class extends ve.Component {
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = arg0_value;
		let options = (arg1_options) ? arg1_options : {};
			super(options);
			
		//Initialise options
		options.attributes = (options.attributes) ? options.attributes : {};
		
		//Declare local instance variables
		let toolbox = ve.ScriptManager.toolbox;
		
		this.element = document.createElement("div");
			this.element.instance = this;
			this.element.setAttribute("component", "ve-script-manager-blockly");
			this.element.style.width = "35%";
			this.element.style.position = "relative"; 
			if (options.attributes)
				Object.iterate(options.attributes, (local_key, local_value) => {
					this.element.setAttribute(local_key, local_value.toString());
				});
		this.options = options;
		this.value = value;
		
		//Initialise ScriptManagerBlockly element 
		document.body.appendChild(this.element);
		this.workspace = Blockly.inject(this.element, {
			toolbox: toolbox,
			zoom: {
				controls: true,
				wheel: true,
				startScale: 1.0,
				maxScale: 3,
				minScale: 0.2,
				scaleSpeed: 1.2
			},
			trashcan: true
		});
		window.workspace = this.workspace;
		document.body.removeChild(this.element);
		this.blockly_widget_el = document.querySelector("body > .blocklyWidgetDiv");
		this.blockly_tooltip_el = document.querySelector("body > .blocklyTooltipDiv");
		this.blockly_toolbox_el = document.querySelector("body > .blocklyToolboxDiv");
		
		//Call after Blockly initialization
		this.interceptBlocklyTransforms();
		this.workspace.addChangeListener((e) => {
			let blockly_value = Blockly.JavaScript.workspaceToCode(Blockly.mainWorkspace);
			
			if (!this.to_binding_fire_silently)
				try {
					let codemirror_obj = this.element.parentElement.querySelector(`[component="ve-script-manager-codemirror"]`).instance;
					
					codemirror_obj.to_binding_fire_silently = true;
					codemirror_obj.v = blockly_value;
					delete codemirror_obj.to_binding_fire_silently;
					
					this.fireToBinding();
				} catch (e) { console.error(e); }
		});
		
		//Initialise onresize, flyout scaling fixes
		this.element.style.left = '0px' // x + 'px';
		this.element.style.width = "100%"
		this.element.style.height = "100%";
		
		this.fixBlocklyScaling();
		this.handleCSS();
	}
	
	/**
	 * Returns the code value of the present Component by parsing ES6 JS as an Abstract Syntax Tree.
	 * - Accessor of: {@link ve.ScriptManagerBlockly}
	 * @returns {string}
	 */
	get v () {
		//Return statement
		try {
			return Blockly.Javascript.workspaceToCode(Blockly.mainWorkspace);
		} catch (e) {}
	}
	
	/**
	 * Sets the code value of the present Component if possible.
	 * - Accessor of: {@link ve.ScriptManagerBlockly}
	 * @param {string} arg0_value
	 */
	set v (arg0_value) {
		//Convert from parameters
		let value = arg0_value;
		
		if (this._disabled) return; //Internal guard clause if element is disabled
		
		//Instantiate new blocks
		this.to_binding_fire_silently = true;
		js2blocks.parseCode(value);
		setTimeout(() => delete this.to_binding_fire_silently, 100);
		this.fireFromBinding();
	}
	
	/**
	 * Disables the present workspace.
	 * - Method of: {@link ve.ScriptManagerBlockly}
	 */
	disable () {
		if (this._disabled) return; //Internal guard clause to ensure file can't be disabled twice
		
		//Declare local instance variables
		this._disabled = true;
		delete window.workspace;
		this.element.classList.add("disabled");
		
		this.blockly_tooltip_parent_el = this.blockly_tooltip_el.parentElement;
		this.blockly_tooltip_el.parentElement.removeChild(this.blockly_tooltip_el);
		this.blockly_widget_parent_el = this.blockly_widget_el.parentElement;
		this.blockly_widget_el.parentElement.removeChild(this.blockly_widget_el);
	}
	
	/**
	 * Enables the present workspace.
	 * - Method of: {@link ve.ScriptManagerBlockly}
	 */
	enable () {
		if (!this._disabled) return; //Internal guard clause to ensure file can't be enabled twice
		
		//Declare local instance variables
		delete this._disabled;
		window.workspace = this.workspace;
		this.element.classList.remove("disabled");
		
		this.blockly_tooltip_parent_el.appendChild(this.blockly_tooltip_el);
		delete this.blockly_tooltip_parent_el;
		this.blockly_widget_parent_el.appendChild(this.blockly_widget_el);
		delete this.blockly_widget_parent_el;
	}
	
	/**
	 * Internal helper method. Fixes Blockly scaling issues.
	 * - Method of: {@link ve.ScriptManagerBlockly}
	 */
	fixBlocklyScaling () {
		//Declare local instance variables
		let flyout_bg_el = this.element.querySelector('.blocklyFlyoutBackground');
		let flyout_container_el = this.element.querySelector('.blocklyFlyout');
		
		//Fix flyout scaling - CSS fix
		if (flyout_bg_el && flyout_container_el) {
			//Get the actual flyout container dimensions
			let flyout_rect = flyout_container_el.getBoundingClientRect();
			
			let height = flyout_rect.height;
			let width = flyout_rect.width;
			
			//Set flyout_bg_el's dynamic path
			flyout_bg_el.setAttribute('d', `M 0,0 h ${width} a 8 8 0 0 1 8 8 v ${height - 16} a 8 8 0 0 1 -8 8 h -${width} z`);
		}
	}
	
	/**
	 * Internal helper method. Handles CSS issues so that Blockly can be mounted into a window.
	 * - Method of: {@link ve.ScriptManagerBlockly}
	 */
	handleCSS () {
		//Declare local instance variables
		this.blockly_toolbox_mode = "canvas"; //Either 'body'/'canvas'
		this.element.style.width = "auto";
		
		//Handle blockly_toolbox_el
		this.blockly_toolbox_loop = setInterval(() => {
			if (this._hidden) return;
			if (this._disabled) { //Internal guard clause if this._disabled
				if (this.blockly_toolbox_el.parentElement)
					this.blockly_toolbox_el.parentElement.removeChild(this.blockly_toolbox_el);
				return;
			}
			this.svg_el = this.element.querySelector("svg");
			this.svg_rect = this.svg_el.getBoundingClientRect();
			
			this.max_height = this.svg_rect.height;
			this.max_width = this.svg_rect.width;
			this.svg_el.style.maxHeight = `${this.max_height}px`;
			this.svg_el.style.maxWidth = `${this.max_width}px`;
			
			//Change anchor for this.blockly_toolbox_el
			let rect = this.element.getBoundingClientRect();
			this.blockly_toolbox_mode = (this.element.querySelector(".blocklyFlyout:hover") ||
				this.blockly_toolbox_el.querySelector(":hover") ||
				document.querySelector(".blocklyDraggable:hover")
			) ? 
				"body" : "canvas";
			
			if (this.blockly_toolbox_mode === "body") {
				if (!document.querySelector("body > .blocklyToolboxDiv"))
					document.body.appendChild(this.blockly_toolbox_el);
				this.blockly_toolbox_el.style.height = `${this.svg_rect.height}px`;
				this.blockly_toolbox_el.style.left = `${rect.x}px`;
				this.blockly_toolbox_el.style.top = `calc(${rect.y}px + var(--cell-padding))`;
				this.blockly_toolbox_el.style.zIndex = 2;
			}
			if (this.blockly_toolbox_mode === "canvas") {
				if (!this.element.contains(this.blockly_toolbox_el))
					this.element.appendChild(this.blockly_toolbox_el);
				this.blockly_toolbox_el.style.height = `${this.svg_rect.height}px`;
				this.blockly_toolbox_el.style.left = "0px";
				this.blockly_toolbox_el.style.top = `calc(var(--cell-padding))`;
				this.blockly_toolbox_el.style.zIndex = 0;
			}
		});
	}
	
	/**
	 * Hides the present workspace entirely.
	 * - Method of: {@link ve.ScriptManagerBlockly}
	 */
	hide () {
		if (this._hidden) return; //Internal guard clause if already hidden
		
		//Declare local instance variables
		this._hidden = true;
		this._preserved_height = this.svg_el.style.maxHeight;
		this._preserved_width = this.svg_el.style.maxWidth;
		
		this.element.style.display = "none";
	}
	
	/**
	 * Internal helper method. Fixes Blockly transforms so that Blockly can be mounted into a window.
	 * - Method of: {@link ve.ScriptManagerBlockly}
	 */
	interceptBlocklyTransforms () {
		//Declare local instance variables
		let targets = [
			'.blocklyFlyout .blocklyBlockCanvas',
			'.blocklyFlyout .blocklyBubbleCanvas'
		];
		
		//Iterate over all targets
		targets.forEach((selector) => {
			let local_element = this.element.querySelector(selector);
			
			if (local_element) {
				// Override setAttribute to intercept transform changes
				const originalSetAttribute = local_element.setAttribute;
				local_element.setAttribute = function (name, value) {
					if (name === 'transform' && value.includes('scale(')) {
						// Preserve translate, force scale(1)
						value = value.replace(/scale\([^)]+\)/g, 'scale(1)');
					}
					return originalSetAttribute.call(this, name, value);
				};
			}
		});
	}
	
	/**
	 * Internal helper method. Propagates the main editor theme class down from {@link ve.ScriptManager}. Either 'theme-default'/'theme-light'.
	 * - Method of: {@link ve.ScriptManagerBlockly}
	 * 
	 * @param {string} arg0_theme_class
	 */
	setTheme (arg0_theme_class) {
		//Convert from parameters
		let theme_class = arg0_theme_class;
		
		//Remove previous themes
		if (this._theme)
			this.blockly_toolbox_el.classList.remove(this._theme);
		this._theme = theme_class;
		
		//Add theme to this.blockly_toolbox_el
		this.blockly_toolbox_el.classList.add(this._theme);
	}
	
	/**
	 * Displays the present workspace if hidden.
	 * - Method of: {@link ve.ScriptManagerBlockly}
	 */
	show () {
		if (!this._hidden) return; //Internal guard clause if already shown
		
		//Declare local instance variables
		delete this._hidden;
		this.element.style.display = "block";
		this.svg_el.style.maxHeight = `${this._preserved_height}px`;
		this.svg_el.style.maxWidth = `${this._preserved_width}px`;
		
		delete this._preserved_height;
		delete this._preserved_width;
	}
};

//Functional binding

/**
 * @returns {ve.ScriptManagerBlockly}
 */
veScriptManagerBlockly = function () {
	//Return statement
	return new ve.ScriptManagerBlockly(...arguments);
}