ve.ComponentBIUF = class {
	constructor (arg0_parent, arg1_options) { //From BrowserUI createInput()
		//Convert from parameters
		var parent = arg0_parent; //Class: Component
		var options = (arg1_options) ? arg1_options : {};

		//Declare local variables
		this.element = document.createElement("td");
			this.element.setAttribute("colspan", (options.width) ? options.width : "");
			this.element.setAttribute("rowspan", (options.height) ? options.height : "");
		this.options = options;
		this.raw_html = [];

		var name_string = `<div class = "header">${options.name}</div>`;
		if (options.name && !options.right) this.raw_html.push(name_string);

		//Create a contenteditable div with onchange handlers to strip formatting
		this.raw_html.push(`<div id = "biuf-toolbar" class = "biuf-toolbar">`);
			this.raw_html.push(`<button id = "bold-button" class = "bold-icon">B</button>`);
			this.raw_html.push(`<button id = "italic-button" class = "italic-icon">I</button>`);
			this.raw_html.push(`<button id = "underline-button" class = "underline-icon">U</button>`);
			this.raw_html.push(`<button id = "clear-button" class = "clear-icon">X</button>`);
		this.raw_html.push(`</div>`);

		this.raw_html.push(`<div id = "biuf-input" class = "biuf-input" contenteditable = "true" ${objectToAttributes(options.options)}>`);
			this.raw_html.push((options.placeholder) ? options.placeholder : "Name");
		this.raw_html.push(`</div>`);

		if (options.name && options.right) this.raw_html.push(name_string);

		//Push to this.element
		this.element.innerHTML = this.raw_html.join("");
			if (options.disable_bold)
				this.element.querySelector(`#bold-button`).style.display = "none";
			if (options.disable_italics)
				this.element.querySelector(`#italic-button`).style.display = "none";
			if (options.disable_underline)
				this.element.querySelector(`#underline-button`).style.display = "none";
		this.draw();
		this.initBIUFToolbar();

		this.handlerOnLoad();

		var biuf_input_el = this.element.querySelector(`#biuf-input`);
		biuf_input_el.onclick = (e) => { //Arrow function prevents this context switching
			this.handlerOnClick();
			this.draw();
		};
		biuf_input_el.oninput = (e) => { //Arrow function prevents this context switching
			this.handleBIUF(biuf_input_el);
			this.draw();
		};
		this.element.onmouseover = (e) => { //Arrow function prevents this context switching
			this.handlerOnHover();
		};
	}

	draw () {
		//Declare local instance variables
		var biuf_input_el = this.element.querySelector(`#biuf-input`);

		//Set .variable (i.e. .placeholder)
		if (document.activeElement != this.element) {
			if (this.options.variable == undefined && this.options.placeholder != undefined)
				this.options.variable = this.options.placeholder;
			biuf_input_el.innerHTML = this.options.variable.toString();
		}
		if (this.options.max != undefined)
			if (this.getInput().length > this.options.max)
				this.setInput(truncateString(this.getInput(), this.options.max, true));

		//Update binding
		if (this.getInput().length >= returnSafeNumber(this.options.min))
			this.options.variable = this.getInput();
	}

	getHTML () {
		//Return statement
		return this.element.innerHTML;
	}

	getInput () {
		//Return statement
		return this.element.querySelector(`#biuf-input`).innerHTML;
	}

	handlerOnClick () {
		if (this.options.onclick)
			this.options.onclick(this.element, this);
	}

	handlerOnHover () {
		if (this.options.onhover)
			this.options.onhover(this.element, this);
	}

	handlerOnLoad () {
		if (this.options.onload)
			this.options.onload(this.element, this);
	}

	setInput (arg0_string) {
		//Convert from parameters
		var string = (arg0_string) ? arg0_string : "";

		//Set input
		this.element.querySelector(`#biuf-input`).innerHTML = string;
	}

	setPlaceholder (arg0_string) {
		//Convert from parameters
		var string = (arg0_string) ? arg0_string : "";

		//Set .placeholder
		this.element.querySelector(`#biuf-input`).setAttribute("placeholder", string);
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