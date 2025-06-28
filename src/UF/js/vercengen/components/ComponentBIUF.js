ve.ComponentBIUF = class {
	constructor (arg0_parent, arg1_options) { //From BrowserUI createInput()
		//Convert from parameters
		this.parent = arg0_parent; //Class: Component
		this.options = (arg1_options) ? arg1_options : {};

		//Declare local instance variables
		this.element = document.createElement("span");
		var html_string = [];

		if (options.name)
			html_string.push(`<div class = "header">${options.name}</div>`);

		//Create a contenteditable div with onchange handlers to strip formatting
		html_string.push(`<div id = "biuf-toolbar" class = "biuf-toolbar">`);
			html_string.push(`<button id = "bold-button" class = "bold-icon">B</button>`);
			html_string.push(`<button id = "italic-button" class = "italic-icon">I</button>`);
			html_string.push(`<button id = "underline-button" class = "underline-icon">U</button>`);
			html_string.push(`<button id = "clear-button" class = "clear-icon">T</button>`);
		html_string.push(`</div>`);

		html_string.push(`<div id = "biuf-input" class = "biuf-input" contenteditable = "true" ${objectToAttributes(options.options)}>`);
			html_string.push((options.placeholder) ? options.placeholder : "Name");
		html_string.push(`</div>`);

		//Populate element and initialise handlers
		this.element.innerHTML = html_string.join("");
		this.element.querySelector(`#biuf-input`).addEventListener("input", (e) => {
			this.handleBIUF(e.target);
		});
		this.initBIUFToolbar();

		//Return statement
		return this.element;
	}

	getInput () {

	}

	setInput () {
		
	}

	//Internal helper functions
	handleBIUF (arg0_biuf_el) {
		//Convert from parameters
		var biuf_el = arg0_biuf_el;

		//Declare local instance variables
		var child = biuf_el.firstChild;

		//Declare while loop, break when next sibling element can no longer be found.
		while (child) {
			var remove_node = null;

			//Check if child is not of <b><i><u> tags.
			if (child.tagName && (!["b", "i", "u"].includes(child.tagName.toLowerCase())))
				remove_node = child;
			child = child.nextSibling;

			//Remove node if flag is true
			if (remove_node)
				remove_node.parentNode.removeChild(remove_node);
		}
	}

	initBIUFToolbar () {
		//Declare local instance variables
		var toolbar_el = this.element.querySelector(`#biuf-toolbar`);

		//Declare element references
		var bold_button = toolbar_el.querySelector("#bold-button");
		var clear_button = toolbar_el.querySelector("#clear-button");
		var italic_button = toolbar_el.querySelector("#italic-button");
		var underline_button = toolbar_el.querySelector("#underline-button");

		//Show toolbar when text is selected
		document.addEventListener("mouseup", (e) => {
			var selection = window.getSelection();

			if (selection.toString() != "" && this.element.querySelector(`#biuf-input:focus`)) {
				var range = selection.getRangeAt(0);
				var rect = range.getBoundingClientRect();

				toolbar_el.style.display = "block";
				toolbar_el.style.top = rect.top - toolbar_el.offsetHeight + "px";
				toolbar_el.style.left = rect.left + "px";
			} else {
				toolbar_el.style.display = "none";
			}
		});

		//Apply formatting when various toolbar buttons are clicked
		bold_button.addEventListener("click", function () {
			document.execCommand("bold");
		});
		clear_button.addEventListener("click", function () {
			document.execCommand("removeFormat");
		});
		italic_button.addEventListener("click", function () {
			document.execCommand("italic");
		});
		underline_button.addEventListener("click", function () {
			document.execCommand("underline");
		});
	}
};

//External helper functions on Class DOM load
{
	function handleBIUF (arg0_biuf_el) {
		//Convert from parameters
		var biuf_el = arg0_biuf_el;

		//Declare local instance variables
		var child = biuf_el.firstChild;

		//Declare while loop, break when next sibling element can no longer be found.
		while (child) {
			var remove_node = null;

			//Check if child is not of <b><i><u> tags.
			if (child.tagName && (!["b", "i", "u"].includes(child.tagName.toLowerCase())))
				remove_node = child;
			child = child.nextSibling;

			//Remove node if flag is true
			if (remove_node)
				remove_node.parentNode.removeChild(remove_node);
		}
	}

	function initBIUFToolbar (arg0_parent_el_id) {
		//Convert from parameters
		var biuf_element_id = arg0_parent_el_id;

		//Declare local instance variables
		var biuf_el = document.querySelector(`div#${biuf_element_id} #biuf-input`);
		var toolbar_el = document.querySelector(`div#${biuf_element_id} #biuf-toolbar`);

		//Declare element references
		var bold_button = toolbar_el.querySelector("#bold-button");
		var clear_button = toolbar_el.querySelector("#clear-button");
		var italic_button = toolbar_el.querySelector("#italic-button");
		var underline_button = toolbar_el.querySelector("#underline-button");

		//Show toolbar when text is selected
		document.addEventListener("mouseup", function () {
			var selection = window.getSelection();

			if (selection.toString() != "" && document.querySelector(`div#${biuf_element_id} #biuf-input:focus`)) {
				var range = selection.getRangeAt(0);
				var rect = range.getBoundingClientRect();

				toolbar_el.style.display = "block";
				toolbar_el.style.top = rect.top - toolbar_el.offsetHeight + "px";
				toolbar_el.style.left = rect.left + "px";
			} else {
				toolbar_el.style.display = "none";
			}
		});

		//Apply formatting when various toolbar buttons are clicked
		bold_button.addEventListener("click", function () {
			document.execCommand("bold");
		});
		clear_button.addEventListener("click", function () {
			document.execCommand("removeFormat");
		});
		italic_button.addEventListener("click", function () {
			document.execCommand("italic");
		});
		underline_button.addEventListener("click", function () {
			document.execCommand("underline");
		});
	}
}