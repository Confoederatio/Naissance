//Initialise functions
global.ve = {
	//Set defines
	default_class: `ve context-menu`,
	windows: {}, //Stores all Windows in state

	//1. State functions
	initialise: function () {
		//Declare Windows overlay element
		ve.window_overlay_el = document.createElement("div");
		ve.window_overlay_el.id = "ve-overlay";
		ve.window_overlay_el.setAttribute("class", "ve-overlay");
		document.body.appendChild(ve.window_overlay_el);
	},

	//2. Window class
	Window: class {
		constructor (arg0_options) {
			//Convert from parameters
			var options = (arg0_options) ? arg0_options : {};

			//Declare local instance variables
		}
	},

	//3. Pane class
	Pane: class {

	},

	//4. Interface class
	/*
		new Interface()
		arg0_options: (Object)
			anchor: (String/Element) - The query selector to pin a context menu to.
			class: (String) - The class prefix to prepend.
			close_function: (String) - The function to execute when the close button is clicked.
			do_not_add_close_button: (Boolean) - Whether to not add a close button to the input. False by default.
			do_not_append: (Boolean) - Whether to append or not.
			id: (String) - The ID of the context menu.
			is_resizable: (Boolean) - Whether to allow the context menu to be resized. True by default if is_window is true.
			is_window: (Boolean) - Whether to treat the context menu as a window. False by default.
			name: (String) - Optional. Title of the context menu. Undefined; will not display by default.
			maximum_height: (String) - Optional. The height after which a scrollbar should appear in CSS units.
			maximum_width: (String) - Optional. Maximum width in CSS units.

			<input_key>: (Object)
				type: (String) - The type of HTML input to grab.
					- biuf
					- rich_text/wysiwyg

					- basic_colour
					- button
					- checkbox
					- color/colour
					- context_menu
					- datalist
					- date
					- date_length
					- email
					- file
					- hierarchy
					- hidden
					- html
					- image
					- number
					- password
					- radio
					- range
					- reset
					- search_select
					- select
					- sortable_list
					- submit
					- tel/telephone
					- text
					- time
					- url/URL

				icon: (String) - Optional. The path to the display icon image.
				name: (String) - Optional. The HTML text of the button to display.
				onclick: (String) - Optional. The JS code to execute on button click.
				options: (Object) - For 'checkbox'/'search_select'/'select'/'sortable_list'/'radio'
					<option_key>: (String) - The datalist/select option ID to pass to the focus element.
				tooltip: (String) - Optional. The HTML tooltip a user can see by hovering over this input.

				height: (Number) - Optional. The row height of this element in a grid. 1 by default.
				width: (Number) - Optional. The column width of this element in a grid. 1 by default.

				x: (Number) - Optional. The X position of the element in a grid. 0 by default.
				y: (Number) - Optional. The Y position of the element in a grid. n + 1 by default, where n = last row.

				return_html: (Boolean) - Optional. Whether to return the html_string instead of modifying the anchor element. False by default.

		Returns: (HTMLElement)
	 */
	Interface: class { //[WIP] - Refactor to make sure that this.interface_el is used throughout instead of .innerHTML at any point
		constructor (arg0_options) {
			//Convert from parameters
			var options = (arg0_options) ? arg0_options : {};

			//Initialise options
			if (!options.class) options.class = "";

			//Declare local instance variables
			var all_options = Object.keys(options);
			var default_keys = ["anchor", "class", "id", "maximum_height", "maximum_width"];
			var html_string = [];
			this.interface_el = document.createElement("div");
			var query_selector_el;
			var table_columns = 0;
			this.table_rows = 0;

			//Format CSS strings
			var height_string = (options.maximum_height) ? `height: ${options.maximum_height}; overflow-y: auto;` : "";
			var width_string = (options.maximum_width) ? `width: ${options.maximum_width}; overflow-x: hidden;` : "";

			var parent_style = `${height_string}${width_string}`;

			//Format html_string
			if (options.id) this.interface_el.id = options.id;
			this.interface_el.setAttribute("class", `${(options.class) ? options.class + " " : ""}${global.ve.default_class}`);
			if (parent_style.length > 0) this.interface_el.setAttribute("style", `${parent_style}`);

			//Add close button
			var do_not_add_close_button = (options.do_not_add_close_button);
			if (options.class)
				if (options.class.includes("unique"))
					do_not_add_close_button = true;

			if (!do_not_add_close_button)
				html_string.push(`<img id = "close-button" src = "./UF/gfx/close_icon_dark.png" class = "uf-close-button" draggable = "false" onclick = "${(options.close_function) ? options.close_function : "this.parentElement.remove();"}">`);

			//Fetch table_columns; table_rows
			for (var i = 0; i < all_options.length; i++) {
				var local_option = options[all_options[i]];

				//This is an input field; process .x, .y
				if (typeof local_option == "object") {
					if (local_option.x)
						table_columns = Math.max(table_columns, local_option.x);
					if (local_option.y) {
						this.table_rows = Math.max(this.table_rows, local_option.y);
					} else {
						this.table_rows++;
					}
				}
			}

			//Iterate over all_options; format them
			html_string.push(`<table>`);

			var current_row = 0;
			this.table_rows = [];

			//1. Initialise table_rows
			for (var i = 0; i < all_options.length; i++) {
				var local_option = options[all_options[i]];

				if (typeof local_option == "object") {
					if (local_option.y != undefined) {
						current_row = local_option.y;
					} else {
						current_row++;
						local_option.y = current_row;
					}

					//Initialise table_rows[current_row]:
					this.table_rows[current_row] = [];
				}
			}

			//2. Populate table_rows
			for (var i = 0; i < all_options.length; i++) {
				var local_option = options[all_options[i]];

				if (typeof local_option == "object") {
					var local_el_html = [];
					var local_row = this.table_rows[local_option.y];
					var local_x = (local_option.x != undefined) ?
						local_option.x : local_row.length;

					local_option.x = local_x;
					var local_component = new ve.Component(this, local_option);
					local_el_html = local_component.processed_html;

					//Set local_row[local_x]
					local_row[local_x] = local_el_html.join("");
				}
			}

			//3. Push table_rows to html_string
			for (var i = 0; i < this.table_rows.length; i++)
				if (this.table_rows[i]) {
					html_string.push(`<tr>${this.table_rows[i].join("")}</tr>`);
				} else {
					//Add a blank row if specified
					html_string.push(`<tr></tr>`);
				}

			//Close html_string
			html_string.push(`</table>`);
			this.interface_el.innerHTML = html_string.join("");
			handleContextMenu(this.interface_el, options);

			//Window handler
			{
				if (options.is_window) {
					var is_resizable = (options.is_resizable != false) ? true : false;

					//Invoke elementDragHandler()
					elementDragHandler(this.interface_el, { is_resizable: is_resizable });
				}
			}

			if (!options.return_html) {
				if (options.anchor) {
					query_selector_el = (isElement(options.anchor)) ? options.anchor : document.querySelector(options.anchor);

					if (!options.do_not_append) {
						query_selector_el.appendChild(this.interface_el);
					} else {
						query_selector_el.replaceChildren(this.interface_el);
					}
				}

				//Return statement
				return this.interface_el;
			} else {
				//Return statement
				return this.interface_el.innerHTML;
			}
		}
	},

	//5. Component class
	Component: class {
		constructor (arg0_parent, arg1_options) {
			//Convert from parameters
			var parent = arg0_parent; //Class: Interface
			var options = (arg1_options) ? arg1_options : {};

			//Set component state
			this.id = (options.id) ? options.id : "generic-component";
			this.name = (options.name) ? options.name : "";

			this.css_class = (options.css_class) ? options.css_class : "";
			this.defines = (options.defines) ? options.defines : undefined;
			this.disabled = (options.disabled == true) ? true : false;
			this.do_not_change = (options.do_not_change == true) ? true : false;
			this.type = (options.type) ? options.type : "text";
			this.variable = options.variable;

			this.attributes = (options.attributes) ? options.attributes : undefined;
			this.height = returnSafeNumber(options.height, 1);
			this.width = returnSafeNumber(options.width, 1);
			this.x = returnSafeNumber(options.x);
			this.y = returnSafeNumber(options.y);

			this.processed_html = [];
			this.raw_html = createInput(options);
			var component_row = parent.table_rows[options.y];
			var component_x;

			if (this.raw_html) {
				this.processed_html.push(`<td${(options.width) ? ` colspan = "${options.width}"` : ""}${(options.height) ? ` rowspan = "${options.height}"` : ""}>`);
				this.processed_html.push(this.raw_html);
				this.processed_html.push(`</td>`);

				component_x = (options.x != undefined) ? options.x : component_row.length;
				component_row[component_x] = this.processed_html.join("");
			} else {
				console.error(`Error when attempting to add UI element with options:`, options);
			}

			//Return Component
			return this;
		}
	},
};