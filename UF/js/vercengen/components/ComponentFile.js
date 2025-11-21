/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 * 
 * Basic file input that can also accept folders. Note that if you need a file explorer, you should refer to {@link ve.FileExplorer}.
 * - Functional binding: <span color=00ffff>veFile</span>().
 * 
 * ##### Constructor:
 * - `arg0_value`: {@link string} - The current file path, if any.
 * - `arg1_options`: {@link Object}
 *   - `.is_folder=false`: {@link boolean} - Whether the input is asking for a folder.
 *   - `.multifile=false`: {@link boolean} - Whether the input can accept multiple files/folders.
 * 
 * ##### Instance:
 * - `.v`: {@link string}
 * 
 * @augments ve.Component
 * @augments {@link ve.Component}
 * @memberof ve.Component
 * @type {ve.File}
 */
ve.File = class extends ve.Component {
	static demo_value = "./README.md";
	
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = arg0_value;
		let options = (arg1_options) ? arg1_options : {};
			super(options);
		
		//Initialise options
		options.attributes = (options.attributes) ? options.attributes : {};
		
		//Declare local instance variables
		this.element = document.createElement("div");
			this.element.setAttribute("component", "ve-file");
			this.element.instance = this;
		
		this.options = options;
		this.value = value;
		
		//Format HTML string
		let folder_string = (options.is_folder) ? `webkitdirectory directory ` : "";
		let multifile_string = (options.is_multifile) ? `multiple ` : "";
		
		let html_string = [];
		html_string.push(`<span id = "name"></span> `);
		if (!options.is_save) {
			html_string.push(`<input type = "file" ${HTML.objectToAttributes(options.attributes)} ${folder_string}${multifile_string}>`);
		} else {
			html_string.push(`<button id = "confirm-file">${(options.label) ? options.label : "Confirm File"}</button>`);
		}
		
		//Populate element and initialise handlers
		let confirm_file_el = this.element.querySelector(`#confirm-file`);
		this.element.innerHTML = html_string.join("");
		
		if (confirm_file_el)
			confirm_file_el.addEventListener("click", (e) => {
				this.fireToBinding();
			});
		this.v = this.value;
	}
	
	/**
	 * Returns the current file path pointed to by the component.
	 * - Accessor of: {@link ve.File}
	 * 
	 * @returns {string}
	 */
	get v () {
		//Declare local instance variables
		let file_el = this.element.querySelector(`input[type="file"]`);
		
		//Return statement
		if (file_el) return file_el.value;
		return this.element.querySelector(`button[id="confirm-file"]`).value;
	}
	
	/**
	 * Sets the current file path pointed to by the component.
	 * - Accessor of {@link ve.File}
	 * 
	 * @param {string} arg0_value
	 */
	set v (arg0_value) {
		//Convert from parameters
		let value = arg0_value;
		
		//Declare local instance variables
		let file_input_el = this.element.querySelector(`input[type="file"]`);
		let save_file_el = this.element.querySelector(`button[id="confirm-file"]`);
		
		if (file_input_el) {
			file_input_el.setAttribute("value", value);
		} else if (save_file_el) {
			save_file_el.setAttribute("value", value);
		}
		this.fireFromBinding();
	}
};

//Functional binding

/**
 * @returns {ve.File}
 */
veFile = function () {
	//Return statement
	return new ve.File(...arguments);
};