/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 * 
 * Creates a wiki/<webview> element that can be used for wiki embeds in applications.
 * - Functional binding: <span color=00ffff>veWiki</span>().
 *  
 * ##### Constructor:
 * - `arg0_value` :{@link string} - The URL string of the wiki to target.
 * - `arg1_options`: {@link Object}
 *   - `.element_tag="webview"`: Either 'iframe'/'webview'.
 *   - 
 *   - `.css_file_paths`: {@link Array}<{@link string}> - The file path to inject as CSS for the target page.
 *   - `.js_file_paths`: {@link Array}<{@link string}> - The file path to inject as JS for the target page.
 *   
 * ##### Instance:
 * - `.v`: {@link string}
 * 
 * ##### Methods:
 * - <span color=00ffff>{@link ve.Wiki.applyScripts|applyScripts}</span>()
 * 
 * @augments ve.Component
 * @memberof ve.Component
 * @type {ve.Wiki}
 */
ve.Wiki = class extends ve.Component {
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = arg0_value;
		let options = (arg1_options) ? arg1_options : {};
		super(options);
		
		//Initialise options
		options.attributes = (options.attributes) ? options.attributes : {};
		let element_tag = (options.element_tag) ? options.element_tag : "webview";
		
		//Declare local instance variables
		this.element = document.createElement(element_tag);
		this.element.setAttribute("component", "ve-wiki");
		
		//Preload is specific to webviews
		if (element_tag === "webview") {
			this.element.setAttribute("preload", "./UF/js/vercengen/components/ComponentWiki/wiki_preload.js");
		}
		
		this.element.instance = this;
		
		//Standardise the event listener based on the tag type
		let event_name = (element_tag === "iframe") ? "load" : "dom-ready";
		this.element.addEventListener(event_name, () => {
			this.applyScripts();
		});
		
		this.options = options;
		this.value = value;
		
		//Set .v
		this.v = this.value;
	}
	
	/**
	 * Returns the current wiki URL.
	 * - Accessor of: {@link ve.Wiki}
	 *
	 * @alias v
	 * @memberof ve.Component.ve.Wiki
	 * @type {string}
	 */
	get v () {
		//Return statement
		return this.element.src;
	}
	
	/**
	 * Sets the wiki URL and attempts to load it.
	 * - Accessor of: {@link ve.Wiki}
	 *
	 * @alias v
	 * @memberof ve.Component.ve.Wiki
	 * @param {string} arg0_value
	 */
	set v (arg0_value) {
		//Convert from parameters
		let value = (arg0_value) ? arg0_value : "about:blank";
		
		//Load URL and fireFromBinding
		this.value = value;
		this.element.src = this.value;
		
		this.fireFromBinding();
	}
	
	/**
	 * Applies scripts to the <iframe>/<webview> element in question.
	 * - Method of: {@link ve.Wiki}
	 * 
	 * @alias applyScripts
	 * @memberof ve.Component.ve.Wiki
	 */
	applyScripts () {
		//Declare local instance variables
		let fs = require("fs");
		let is_iframe = (this.options.element_tag === "iframe");
		
		let css_files = (this.options.css_file_paths) ? this.options.css_file_paths : [];
		let js_files = (this.options.js_file_paths) ? this.options.js_file_paths : [];
		
		if (is_iframe) {
			//Iframe injection logic via DOM
			let target_doc = this.element.contentDocument || this.element.contentWindow.document;
			
			if (target_doc) {
				css_files.forEach((arg0_path) => {
					let css_content = fs.readFileSync(arg0_path, "utf8");
					let style_element = target_doc.createElement("style");
					style_element.textContent = css_content;
					target_doc.head.appendChild(style_element);
				});
				
				js_files.forEach((arg0_path) => {
					let js_content = fs.readFileSync(arg0_path, "utf8");
					let script_element = target_doc.createElement("script");
					script_element.textContent = js_content;
					target_doc.body.appendChild(script_element);
				});
			}
		} else {
			//Webview injection logic via Electron API
			css_files.forEach((arg0_path) => {
				let css_content = fs.readFileSync(arg0_path, "utf8");
				this.element.insertCSS(css_content);
			});
			
			js_files.forEach((arg0_path) => {
				let js_content = fs.readFileSync(arg0_path, "utf8");
				this.element.executeJavaScript(js_content);
			});
		}
	}
};

//Functional binding

/**
 * @returns {ve.Wiki}
 */
veWiki = function () {
	//Return statement
	return new ve.Wiki(...arguments);
};