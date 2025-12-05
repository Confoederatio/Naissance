/**
 * Refer to <span color = "yellow">{@link ve.Feature}</span> for methods or fields inherited from the parent, such as automatic destructuring. 
 * 
 * Represents a Navbar Feature, ideally at the global level (unless it is specifically bound to an element in .options).
 * - Functional binding: <span color=00ffff>veNavbar</span>().
 * 
 * ##### Constructor:
 * - `arg0_navbar_obj`: {@link Object}
 *   - `<tab_key>`: {@link Object}
 *     - `name`: {@link string}
 *     - 
 *     - `active`: {@link boolean}
 *     - `<dropdown_key>`: {@link Object}
 *       - `<dropdown_key>`: {@link Object} - Nested dropdown if available.
 *       - `.active`: {@link boolean}
 *       - `.onclick`: {@link function}({@link HTMLElement})
 *       - `.keybind`: {@link string} - Mousetrap key combo which triggers the bound `.onclick` event if possible.
 *       - `.name`: {@link string}
 * - `arg1_options`: {@link Object}
 *   - `.anchor_element`: {@link HTMLElement}|{@link string}
 *   - `.attributes`: {@link Object}
 *     - `<attribute_key>`: {@link string}
 *   - `.name`: {@link string}
 *   - `.style`: {@link Object}
 *     - `<style_key>`: {@link string}
 *     
 * ##### Methods:
 * - <span color=00ffff>{@link ve.Navbar.generateHTMLRecursively|generateHTMLRecursively}</span>(arg0_navbar_obj: {@link Object}) | {@link HTMLUListElement}
 * 
 * @augments ve.Feature
 * @memberof ve.Feature
 * @type {ve.Navbar}
 */
ve.Navbar = class extends ve.Feature {
	constructor (arg0_navbar_obj, arg1_options) {
		//Convert from parameters
		let navbar_obj = (arg0_navbar_obj) ? arg0_navbar_obj : {};
		let options = (arg1_options) ? arg1_options : {};
			super(navbar_obj, options);
		
		//Declare local instance variables
		this.element = document.createElement("div");
			this.element.setAttribute("class", "ve navbar");
			this.element.instance = this;
			HTML.setAttributesObject(this.element, options.attributes);
			
		
		//Format this.element
		this.element.appendChild(this.generateHTMLRecursively(navbar_obj));
		if (options.name) {
			let name_el = document.createElement("div");
			name_el.innerHTML = options.name;
			this.element.querySelector("ul").prepend(name_el);
		}
		
		//Append child to body unless an anchor_element is defined
		if (options.anchor_element) {
			options.anchor_element = (typeof options.anchor_element === "object") ? 
				options.anchor_element : document.querySelector(options.anchor_element.toString());
			
			options.anchor_element.appendChild(this.element);
		} else {
			document.body.appendChild(this.element);
		}
	}
	
	/**
	 * Generates HTML recursively for ve.Navbar.
	 * - Method of: {@link ve.Navbar}
	 *
	 * @alias generateHTMLRecursively
	 * @memberof ve.Feature.ve.Navbar
	 * 
	 * @param {Object} arg0_navbar_obj
	 * 
	 * @returns {HTMLUListElement}
	 */
	generateHTMLRecursively (arg0_navbar_obj) {
		//[WIP] - Refactor at a later date
		//Convert from parameters
		let navbar_obj = arg0_navbar_obj;
		
		//Declare local instance variables
		let reserved_keys = ["name", "active", "onclick", "keybind"];
		let ul_el = document.createElement("ul");
		
		//Iterate over all keys in navbar_obj and parse them recursively
		Object.iterate(navbar_obj, (key, value) => {
			if (reserved_keys.includes(key) || typeof value !== "object") return;
			
			let li_el = document.createElement("li");
			
			let all_keys = Object.keys(value);
			let has_dropdowns = all_keys.some(
				(k) => !reserved_keys.includes(k) && typeof value[k] === "object"
			);
			
			// If the entry has nested structure, it's a dropdown group
			if (has_dropdowns) {
				// Set label
				let label_el = document.createElement("div");
				label_el.innerHTML = value.name || key.replace(/_/g, " ");
				li_el.appendChild(label_el);
				
				// Recursively build its children
				let child_ul = this.generateHTMLRecursively(value);
				li_el.appendChild(child_ul);
				
				// Onclick - attach to parent but exclude child ul
				if (typeof value.onclick === "function") {
					li_el.addEventListener("click", (e) => {
						if (child_ul.contains(e.target)) return;
						
						e.stopPropagation();
						value.onclick(e);
					});
				}
			} else {
				// Otherwise, it's a simple link
				li_el.classList.add("link");
				let a_el = document.createElement("a");
				a_el.innerHTML = value.name || key.replace(/_/g, " ");
				li_el.appendChild(a_el);
				
				// Active state
				if (value.active) a_el.classList.add("active");
				
				// Onclick
				if (typeof value.onclick === "function") {
					a_el.addEventListener("click", (e) => {
						e.preventDefault();
						value.onclick(a_el);
					});
				}
				
				// Keybind
				if (typeof value.keybind === "string" && typeof Mousetrap !== "undefined") {
					let kbd_el = document.createElement("kbd");
					kbd_el.innerText = value.keybind;
					a_el.appendChild(kbd_el);
					
					Mousetrap.bind(value.keybind, (e) => {
						if (typeof value.onclick === "function") value.onclick(a_el);
						e.preventDefault();
						return false;
					});
				}
			}
			
			ul_el.appendChild(li_el);
		});
		
		return ul_el;
	}
};

//Functional binding

/**
 * @returns {ve.Navbar}
 */
veNavbar = function () {
	//Return statement
	return new ve.Navbar(...arguments);
};