/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 * 
 * Multipage menu with a relative topbar for the user to switch between tabs. Contains an interface otherwise.
 * - Functional binding: <span color=00ffff>vePageMenu</span>().
 * 
 * ##### Constructor:
 * - `arg0_page_obj`: {@link Object}
 *   - `<page_key>`: {@link Object}
 *     - `.name`: {@link string}
 *     - `.options`: {@link Object} - Same as the `.options` in {@link ve.Interface}.
 *     - `.components_obj`: {@link Object}<{@link ve.Component}>
 * - `arg1_options`: {@link Object}
 *   - `.starting_page=Object.keys(page_obj)[0]`
 * 
 * ##### Instance:
 * - `.interface_el`: {@link HTMLElement}
 * - `.interfaces_obj`: {@link Object}<{@link ve.Interface}> - Contains all interfaces in all pages.
 * - `.navbar_el`: {@link HTMLElement}
 * - `.underline_el`: {@link HTMLElement}
 * - `.v`: {@link string} - The current `<page_key>` selected by the ve.PageMenu.
 * 
 * ##### Methods:
 * - <span color=00ffff>{@link ve.PageMenu.updateUnderline|updateUnderline}</span>()
 * 
 * @augments ve.Component
 * @augments {@link ve.Component}
 * @class
 * @memberof ve.Component
 * @type {ve.PageMenu}
 */
ve.PageMenu = class extends ve.Component { //[WIP] - This should be updated later to allow arg0_page_obj to take in Array<components_obj> instead, which would create a conventional paginated menu instead of a tabbed one.
	static demo_value = {
		page_one: {
			name: "Home",
			components_obj: {}
		},
		page_two: {
			name: "About",
			components_obj: {}
		}
	};
	
	constructor (arg0_page_obj, arg1_options) {
		//Convert from parameters
		let page_obj = arg0_page_obj;
		let options = (arg1_options) ? arg1_options : {};
			super(options);
			
		//Initialise options
		options.attributes = (options.attributes) ? options.attributes : {};
		options.starting_page = (options.starting_page) ? options.starting_page : Object.keys(page_obj)[0];
		
		//Declare local instance variables
		this.element = document.createElement("div");
			this.element.setAttribute("component", "ve-page-menu");
			Object.iterate(options.attributes, (local_key, local_value) => {
				this.element.setAttribute(local_key, local_value.toString());
			});
			this.element.instance = this;
			
		this.interfaces_obj = {};
		this.options = options;
		this.navbar_el = document.createElement("nav");
			this.navbar_el.classList.add("navbar");
		
		//1. Navbar handling
		{
			//Append header element; navbar_el
			//Iterate over all keys in page_obj and create ve.Interface; tab instances for them
			Object.iterate(page_obj, (local_key, local_value) => {
				let local_name = (local_value.name) ? local_value.name : local_key;
				let local_name_el = document.createElement("div");
				
				local_name_el.classList.add("tab");
				if (local_key === options.starting_page)
					local_name_el.classList.add("active");
				local_name_el.id = local_key;
				local_name_el.innerHTML = local_name;
				
				//Format navbar_el; populate this.interfaces_obj
				this.navbar_el.appendChild(local_name_el);
				if (!local_value.options) local_value.options = {};
					if (local_value.options.is_folder !== true) local_value.options.is_folder = false;
					
				this.interfaces_obj[local_key] = new ve.Interface(local_value.components_obj, local_value.options);
			});
			this.underline_el = document.createElement("span");
			this.underline_el.classList.add("underline");
			this.navbar_el.appendChild(this.underline_el);
			
			//Append body element; interface_el
			this.interface_el = document.createElement("div");
			this.interface_el.id = "component-body";
			
			this.element.append(this.navbar_el, this.interface_el);
			
			//Add tab onclick handlers for this.navbar_el
			let all_tabs = this.navbar_el.querySelectorAll(`.tab`);
			
			all_tabs.forEach((local_tab) => {
				local_tab.addEventListener("click", () => {
					all_tabs.forEach((local_tab) => local_tab.classList.remove("active"));
					local_tab.classList.add("active");
					this.from_binding_fire_silently = true;
					this.v = local_tab.id;
					delete this.from_binding_fire_silently;
					this.updateUnderline();
					this.fireToBinding();
				});
			});
		}
		
		//2. Body handling; display starting interface
		{
			let initialise_underline_loop = setInterval(() => {
				if (!document.contains(this.element)) return;
				this.updateUnderline();
				clearInterval(initialise_underline_loop);
			});
			this.v = options.starting_page;
			if (options.name) this.name = options.name;
		}
	}
	
	/**
	 * Returns the current page visible in the component.
	 * - Accessor of: {@link ve.Interface}
	 *
	 * @alias v
	 * @memberof ve.Component.ve.PageMenu
	 * @type {string}
	 * 
	 * @returns {string}
	 */
	get v () {
		//Return statement
		return this.navbar_el.querySelector(`.tab.active`).id;
	}
	
	/**
	 * Sets the new page visible by the component.
	 * - Accessor of: {@link ve.Interface}
	 *
	 * @alias v
	 * @memberof ve.Component.ve.PageMenu
	 * @type {string}
	 * 
	 * @param {string} arg0_page_key
	 */
	set v (arg0_page_key) {
		//Convert from parameters
		let page_key = arg0_page_key;
		
		//Declare local instance variables
		let active_tab_el = this.navbar_el.querySelector(`.tab[id="${page_key}"]`);
		let all_tabs = this.navbar_el.querySelectorAll(`.tab`);
		
		//Modify active tab
		all_tabs.forEach((local_tab) => local_tab.classList.remove("active"));
		if (active_tab_el) {
			active_tab_el.classList.add("active");
		} else {
			console.error(`active_tab_el could not be found for ${page_key}.`);
		}
		
		//Switch interface to selected page
		this.interface_el.innerHTML = "";
		this.interface_el.appendChild(this.interfaces_obj[page_key].element);
		setTimeout(() => {
			this.updateUnderline();
		}, 100);
		this.fireFromBinding();
	}
	
	/**
	 * Updates the underline underneath the active tab and animates it.
	 * - Method of: {@link ve.PageMenu}
	 *
	 * @alias updateUnderline
	 * @memberof ve.Component.ve.PageMenu
	 */
	updateUnderline () {
		//Declare local instance variables
		let active_tab = this.navbar_el.querySelector(`.tab.active`);
			if (!active_tab) return;
		let underline_computed_style = window.getComputedStyle(this.underline_el);
		
		let offset_left = active_tab.offsetLeft;
		let tab_width = active_tab.offsetWidth;
		let underline_y = active_tab.offsetTop + active_tab.offsetHeight - parseFloat(underline_computed_style.height);
		
		//Snap vertically, animate horizontally
		this.underline_el.style.transition = "none";
		this.underline_el.style.top = `${underline_y}px`;
		
		requestAnimationFrame(() => {
			this.underline_el.style.left = `${offset_left}px`;
			this.underline_el.style.transition = `left 0.5s ease, width 0.5s ease`;
			this.underline_el.style.width = `${tab_width}px`;
		});
	}
};

//Functional binding

/**
 * @returns {ve.PageMenu}
 */
vePageMenu = function () {
	//Return statement
	return new ve.PageMenu(...arguments);
};