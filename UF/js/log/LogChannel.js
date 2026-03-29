//Initialise functions
{
	if (!global.log)
		/**
		 * The namespace for all UF/Log utility functions, typically for designating log channels.
		 * 
		 * @namespace log
		 */
		global.log = {};
	
	/**
	 * Creates a new log channel that can be accessed by log.<channel_key>() for logging. Should ideally be initialised upon startup. This is used for custom multi-channel logging. Channels are mirrored in DevTools as well as having DOM-facing viewports and consoles via {@link ve.Log}, {@link ve.ScriptManager}.
	 * 
	 * ##### Constructor:
	 * - `arg0_key`; {@link string} - The key to use for channel logging. log.<channel_key>, log.<channel_key>_warn, log.<channel_key>_error are valid channels afterwards.
	 * - `arg1_options`: {@link Object}
	 *   - `.colour`: {@link Array}<{@link number}, {@link number}, {@link number}, {@link number}>|{@link string} - The colour to use for the background.
	 *   - `.do_not_print=false`: {@link boolean} - Whether to not print to console.
	 *   - `.large_object_limit=10000`: {@link number} - The limit at which large object warnings should be emitted.
	 *   - `.text_colour`: {@link Array}<{@link number}, {@link number}, {@link number}, {@link number}>|{@link string} - The text colour to use for the foreground. Detected as either 'white/'black' based on luminance by default.
	 * 
	 * ##### Instance:
	 * - `.log_el`: {@link HTMLElement}
	 * - `.key`: {@link string}
	 * - `.options`: {@link Object}
	 * 
	 * ##### Methods:
	 * - <span color=00ffff>{@link ve.Log.clear|clear}</span>()
	 * - <span color=00ffff>{@link ve.Log.close|close}</span>()
	 * - <span color=00ffff>{@link ve.Log.error|error}</span>(argn_arguments:{@link any})
	 * - <span color=00ffff>{@link ve.Log.fromJSON|fromJSON}</span>(arg0_json:{@link string})
	 * - <span color=00ffff>{@link ve.Log.log|log}</span>(argn_arguments:{@link any})
	 * - <span color=00ffff>{@link ve.Log.open|open}</span>()
	 * - <span color=00ffff>{@link ve.Log.warn|warn}</span>(argn_arguments:{@link any})
	 * - <span color=00ffff>{@link ve.Log.print|print}</span>(arg0_type:{@link string}, argn_arguments:{@link any})
	 * - <span color=00ffff>{@link ve.Log.remove|remove}</span>()
	 * - <span color=00ffff>{@link ve.Log.save|save}</span>(arg0_file_path:{@link string}, arg1_options:{@link Object}) | {@link string}
	 * - <span color=00ffff>{@link ve.Log.toJSON|toJSON}</span>() | {@link string}
	 * 
	 * ##### Static Fields:
	 * - `.instances`: {@link Array}<{@link log.Channel}>
	 *   
	 * ##### Static Methods:
	 * - <span color=00ffff>{@link ve.Log.update|update}</span>() - Updates all {@link ve.Log} instances and alphabetically sorts channel order.
	 * 
	 * @type {log.Channel}
	 */
	log.Channel = class {
		static instances = [];
		
		constructor (arg0_key, arg1_options) {
			//Convert from parameters
			let key = arg0_key;
			let options = (arg1_options) ? arg1_options : {};
			
			//Initialise options
			let bg_colour = (options.colour) ? 
				options.colour : ve.registry.settings.Channel.default_bg_colour;
			options.large_object_limit = Math.returnSafeNumber(options.large_object_limit, 10000);
			let text_colour = (options.text_colour) ? 
				options.text_colour : ve.registry.settings.Channel.default_text_colour;
				if (text_colour === "auto") text_colour = Colour.getBestTextColour(bg_colour);
			
			let default_post_css = `background: transparent; color: inherit;`;
			let default_pre_css = `background: ${bg_colour}; color: ${text_colour}; padding: 2px 5px; border-radius: 3px; font-weight: bold;`;
			
			if (options.do_not_print === undefined) options.do_not_print = false;
			options.post_css = (options.post_css) ? `${default_post_css} ${options.post_css}` : default_post_css;
			options.pre_css = (options.pre_css) ? `${default_pre_css} ${options.pre_css}` : default_pre_css;
			
			//Declare local instance variables
			this.log_el = document.createElement("div");
				this.log_el.classList.add("log-element");
			this.key = key;
			this.options = options;
			
			//Internal guard clause if duplicate
			if (!log[key]) {
				log[key] = this.log.bind(this);
				log[`${key}_error`] = this.error.bind(this);
				log[`${key}_instance`] = this;
				log[`${key}_warn`] = this.warn.bind(this);
			} else {
				console.warn(`log.${key} already exists as a custom logging channel. It cannot be overridden.`);
			}
			
			//Push to instances
			log.Channel.instances.push(this);
			log.Channel.update();
		}
		
		/**
		 * Clears the current console channel.
		 * - Method of: {@link log.Channel}
		 */
		clear () { this.log_el.innerHTML = ""; }
		
		/**
		 * Closes the available console window if already open.
		 * - Method of: {@link log.Channel}
		 */
		close () { if (this.console_window) this.console_window.close(); }
		
		/**
		 * Prints an error message to the console channel, analogous to {@link console.error}.
		 * - Method of: {@link log.Channel}
		 * 
		 * @param argn_arguments
		 */
		error (...argn_arguments) { this.print("error", argn_arguments); }
		
		/**
		 * Loads a log history from a JSON string and restores the internal HTML.
		 * - Method of: {@link log.Channel}
		 *
		 * @param {string} arg0_json - The JSON string to load.
		 */
		fromJSON (arg0_json) {
			//Convert from parameters
			let data = JSON.parse(arg0_json);
			
			//Hydrate current log from data
			if (data.key) this.key = data.key;
			if (data.options) this.options = data.options;
			if (data.html !== undefined) this.log_el.innerHTML = data.html;
		}
		
		/**
		 * Prints a log message to the console channel, analogous to {@link console.log}.
		 * - Method of: {@link log.Channel}
		 * 
		 * @param argn_arguments
		 */
		log (...argn_arguments) { this.print("log", argn_arguments); }
		
		/**
		 * Opens a UI for the given console channel. DOM-facing.
		 * - Method of: {@link log.Channel}
		 */
		open () {
			if (this.console_window) this.console_window.close();
			this.console_window = new ve.Window({
				current_log_el: new ve.HTML(this.log_el)
			}, {
				can_rename: false,
				name: this.key,
				width: "20rem"
			});
		}
		
		/**
		 * Prints a warning message to the console channel, analogous to {@link console.warn}.
		 * - Method of: {@link log.Channel}
		 *
		 * @param argn_arguments
		 */
		warn (...argn_arguments) { this.print("warn", argn_arguments); }
		
		/**
		 * Prints a message to the given console channel.
		 * - Method of: {@link log.Channel}
		 * 
		 * @param {string} arg0_type - The console type. Either 'log'/'warn'/'error'.
		 * @param {any[]} argn_arguments - The arguments passed to the log function
		 */
		print (arg0_type, argn_arguments) {
			//Convert from parameters
			let type = arg0_type;
			let args = [...argn_arguments];
			
			//Declare local instance variables
			let template = `%c${this.key.toUpperCase()}%c `;
			
			//If the first argument is a string, we can merge it into the template; this allows the user to still use %s, %d, etc. in their own messages
			if (!this.options.do_not_print)
				if (typeof args[0] === "string") {
					let message = args.shift();
					console[type](
						`${template}${message}`,
						this.options.pre_css,
						this.options.post_css,
						...args,
					);
				} else {
					console[type](template, this.options.pre_css, this.options.post_css, ...args);
				}
			
			//Push to current this.log_el
			let local_msg_el = document.createElement("div");
				local_msg_el.classList.add("uf-log-line");
				local_msg_el.classList.add(type);
				argn_arguments.forEach((local_arg) => {
					let part_el = document.createElement("span");
						part_el.classList.add("log-part");
						part_el.style.marginRight = `var(--padding)`;
						
					//Handle errors
					if (type === "error" && local_arg instanceof Error) {
						let error_el = document.createElement("pre");
						error_el.innerText = local_arg.stack || local_arg.message;
						part_el.appendChild(error_el);
					} else if (typeof local_arg === "string") {
						part_el.innerText = String(local_arg);
					} else {
						let local_object_inspector = new ve.ObjectInspector(local_arg, {
							style: { padding: 0 }
						});
						
						if (local_object_inspector.element.innerHTML.length > this.options.large_object_limit) {
							let placeholder = document.createElement("button");
							placeholder.innerText = loc("ve.registry.localisation.Log_show_large_object");
							placeholder.onclick = () => {
								let local_confirm_modal = new ve.Confirm(loc("ve.registry.localisation.Log_large_object_confirmation", String.formatNumber(local_object_inspector.element.innerHTML.length)), {
									special_function: () => {
										placeholder.replaceWith(local_object_inspector.element);
										local_object_inspector.bind(part_el);
									}
								});
							};
							part_el.appendChild(placeholder);
						} else {
							local_object_inspector.bind(part_el);
						}
					}
					
					local_msg_el.appendChild(part_el);
				});
			
			this.log_el.appendChild(local_msg_el);
		}
		
		/**
		 * Removes the given console channel.
		 * - Method of: {@link log.Channel}
		 */
		remove () {
			//Iterate over all channels and remove it
			for (let i = 0; i < log.Channel.instances.length; i++)
				if (log.Channel.instances[i] === this.key)
					log.Channel.instances.splice(i, 1);
			
			//Remove log[key]
			delete log[this.key];
			delete log[`${this.key}_error`];
			delete log[`${this.key}_instance`];
			delete log[`${this.key}_warn`];
			log.Channel.update();
		}
		
		/**
		 * Saves the present log to a given file path. Returns the output text written.
		 * - Method of: {@link log.Channel}
		 * 
		 * @param {string} arg0_file_path
		 * @param {Object} [arg1_options]
		 *   @param {string} [arg1_options.format="plaintext"] - Either 'json'/'plaintext'.
		 *   
		 * @returns {string}
		 */
		save (arg0_file_path, arg1_options) {
			//Convert from parameters
			let file_path = path.resolve(arg0_file_path);
			let options = (arg1_options) ? arg1_options : {};
			
			//Initialise options
			if (!options.format) options.format = "plaintext";
			
			//Declare local instance variables
			let output_folder = path.dirname(file_path); 
			let output_text;
			
			//Make sure folder exists first
			if (!fs.existsSync(output_folder))
				fs.mkdirSync(output_folder, { recursive: true });
			
			if (options.format === "json") {
				output_text = this.toJSON();
			} else {
				output_text = this.log_el.innerText;
			}
			fs.writeFileSync(file_path, output_text, "utf8");
			
			//Return statement
			return file_path;
		}
		
		/**
		 * Serialises the current log channel's entire history and configuration to a JSON string.
		 * - Method of: {@link log.Channel}
		 *
		 * @returns {string}
		 */
		toJSON () {
			//Return statement
			return JSON.stringify({
				key: this.key,
				options: this.options,
				html: this.log_el.innerHTML
			});
		}
		
		/**
		 * Updates all associated {@link log.Channel} components to ensure that they remain in-sync.
		 * 
		 * @alias #update
		 * @memberof log.Channel
		 */
		static update () {
			//Sort ve.Log.instances first
			ve.Log.instances.sort((a, b) => a.key.localeCompare(b.key));
			
			//Iterate over all ve.Log.instances and draw them
			for (let i = 0; i < ve.Log.instances.length; i++)
				ve.Log.instances[i].draw();
		}
	};
	
	/**
	 * Returns logging functions, resolving them either to a custom logging channel or to the default console.
	 * 
	 * @param {string} [arg0_channel_key="console"]
	 * 
	 * @returns {{error_fn: function, log_fn: function, warn_fn: function}}
	 */
	log.getLoggingFunctions = function (arg0_channel_key) {
		//Convert from parameters
		let channel_key = (arg0_channel_key) ? arg0_channel_key : "console";
		
		//Return statement
		return {
			error_fn: (channel_key !== "console") ? log[`${channel_key}_error`] : console.error,
			log_fn: (channel_key !== "console") ? log[`${channel_key}_log`] : console.log,
			warn_fn: (channel_key !== "console") ? log[`${channel_key}_warn`] : console.warn
		};
	};
}