if (!global.Blacktraffic) global.Blacktraffic = {};

/**
 * Refer to <span color = "yellow">{@link Blacktraffic.AgentBrowser}</span> for methods or fields inherited from automatic destructuring.
 * 
 * Creates a new Puppeteer browser agent (Chrome) used for scraping tasks and purposes. Requires npm puppeteer.
 * 
 * ##### Constructor:
 * - `arg0_key=Class.generateRandomID(Blacktraffic.AgentBrowserPuppeteer)`: {@link string} - The key to use for the given browser agent. Used for ID.
 * - `arg1_options`: {@link Object}
 *   - `.chrome_binary_path`: {@link string}
 *   - `.debug_console=false`: {@link boolean}
 *   - `.debugging_port=0`: {@link number}
 *   - `.headless=false`: {@link boolean}
 *   - `.onload`: {@link function}
 *   - `.user_data_folder`: {@link string} - Refers to a Chrome profile necessary for spoofing.
 *   - 
 *   - `.connection_attempts_threshold=3`: {@link number} - The number of connection attempts to use when opening the browser.
 *   - `.log_channel="console"`: {@link string}
 *   - `.unique_ports=false`: {@link boolean}
 *   
 * ##### Instance:
 * - `.key`: {@link string}
 * - `.options`: {@link Object}
 *   - `.onload`: {@link function}
 * - `.tab_obj`: {@link Object}<{@link Object}>
 * 
 * ##### Methods:
 * - <span color=00ffff>{@link Blacktraffic.AgentBrowserPuppeteer.captureConsoleToChannel|captureConsoleToChannel}</span>(arg0_tab_key:{@link Object}|{@link string}, arg1_channel_key:{@link string})
 * - <span color=00ffff>{@link Blacktraffic.AgentBrowserPuppeteer.close|close}</span>() | {@link Blacktraffic.AgentBrowserPuppeteer}
 * - <span color=00ffff>{@link Blacktraffic.AgentBrowserPuppeteer.closeTab|closeTab}</span>(arg0_tab_key:{@link Object}|{@link string}) | {@link Blacktraffic.AgentBrowserPuppeteer}
 * - <span color=00ffff>{@link Blacktraffic.AgentBrowserPuppeteer.closeUserTabs|closeUserTabs}</span>() | {@link Blacktraffic.AgentBrowserPuppeteer}
 * - <span color=00ffff>{@link Blacktraffic.AgentBrowserPuppeteer.focusTab|focusTab}</span>(arg0_tab_key:{@link Object}|{@link string}) | {@link Object}
 * - <span color=00ffff>{@link Blacktraffic.AgentBrowserPuppeteer.getElement|getElement}</span>(arg0_tab_key:{@link Object}|{@link string}, arg1_selector:{@link string}, arg2_options:{@link Object}) | {@link HTMLElement}
 * - <span color=00ffff>{@link Blacktraffic.AgentBrowserPuppeteer.getTab|getTab}</span>(arg0_tab_key:{@link Object}|{@link string}) | {@link Object}
 * - <span color=00ffff>{@link Blacktraffic.AgentBrowserPuppeteer.getTabs|getTabs}</span>() | {@link Array}<{@link Object}>
 * - <span color=00ffff>{@link Blacktraffic.AgentBrowserPuppeteer.injectScript|injectScript}</span>(arg0_tab_key:{@link Object}|{@link string}, arg1_function:{@link function}, arg2_options:{@link Object}) | {@link Object}
 * - <span color=00ffff>{@link Blacktraffic.AgentBrowserPuppeteer.injectScriptOnload|injectScriptOnload}</span>(arg0_tab_key:{@link Object}|{@link string}, arg1_function:{@link function}, arg2_options:{@link Object}) | {@link Object}
 * - <span color=00ffff>{@link Blacktraffic.AgentBrowserPuppeteer.open|open}</span>() | {@link Blacktraffic.AgentBrowserPuppeteer}
 * - <span color=00ffff>{@link Blacktraffic.AgentBrowserPuppeteer.openTab|openTab}</span>(arg0_tab_key:{@link Object}|{@link string}, arg1_url:{@link string}) | {@link Object}
 * - <span color=00ffff>{@link Blacktraffic.AgentBrowserPuppeteer.reloadTab|reloadTab}</span>(arg0_tab_key:{@link Object}|{@link string}) | {@link Object}
 * - <span color=00ffff>{@link Blacktraffic.AgentBrowserPuppeteer.remove|remove}</span>()
 * - <span color=00ffff>{@link Blacktraffic.AgentBrowserPuppeteer.screenshotHTML|screenshotHTML}</span>(arg0_tab_key:{@link Object}|{@link string}, arg1_path:{@link string}, arg2_options:{@link Object})
 * - <span color=00ffff>{@link Blacktraffic.AgentBrowserPuppeteer.tabExists|tabExists}</span>(arg0_tab_key:{@link Object}|{@link string}, arg1_options:{@link Object})
 * - <span color=00ffff>{@link Blacktraffic.AgentBrowserPuppeteer.updateLogChannel|updateLogChannel}</span>(arg0_channel_key:{@link string})
 * - <span color=00ffff>{@link Blacktraffic.AgentBrowserPuppeteer.waitForStableContent|waitForStableContent}</span>(arg0_tab_key:{@link Object}|{@link string}, arg1_selector:{@link string}, arg2_interval=3000:{@link number}) | {@link boolean}
 * 
 * ##### Static Fields:
 * - `.instances`: {@link Array}<{@link Blacktraffic.AgentBrowserPuppeteer}>
 * 
 * @augments Blacktraffic.AgentBrowser
 * @memberof Blacktraffic.AgentBrowser
 * @type {Blacktraffic.AgentBrowserPuppeteer}
 */
Blacktraffic.AgentBrowserPuppeteer = class extends Blacktraffic.AgentBrowser { //[WIP] - Finish documentation
	static instances = [];
	
	constructor (arg0_key, arg1_options) {
		//Convert from parameters
		let key = (arg0_key) ? arg0_key : Class.generateRandomID(Blacktraffic.AgentBrowserPuppeteer);
		let options = (arg1_options) ? arg1_options : {};
			super(key, options);
		
		//Initialise options
		if (options.debug_console === undefined) options.debug_console = false;
		if (options.headless === undefined) options.headless = false;
		if (options.unique_ports === undefined) options.unique_ports = false;
		
		options.connection_attempts_threshold = Math.returnSafeNumber(options.connection_attempts_threshold, 3);
		
		//Declare local instance variables
		this.updateLogChannel(options.log_channel);
		this.key = key;
		this.options = options;
		this.tab_obj = {};
		
		//Initialise and push to instances
		this.open().then(() => {
			if (this.options.onload)
				this.options.onload.call(this);
		});
		Blacktraffic.AgentBrowserPuppeteer.instances.push(this);
	}
	
	/**
	 * Captures the current tab's console and feeds it into a {@link log.Channel}.
	 * - Method of: {@link Blacktraffic.AgentBrowserPuppeteer}
	 * 
	 * @alias captureConsoleToChannel
	 * @memberof Blacktraffic.AgentBrowser.Blacktraffic.AgentBrowserPuppeteer
	 * 
	 * @param {Object|string} arg0_tab_key
	 * @param {string} arg1_channel_key
	 * 
	 * @returns {Promise<void>}
	 */
	async captureConsoleToChannel (arg0_tab_key, arg1_channel_key) {
		//Convert from parameters
		let tab = this.getTab(arg0_tab_key);
		let channel_key = arg1_channel_key;
		
		//Declare local instance variables
		let log_obj = log.getLoggingFunctions(channel_key);
		
		//Set listener on tab page if possible
		tab.on("console", async (message) => {
			let args = await Promise.all(message.args().map((local_arg) => local_arg.jsonValue()));
			let type = message.type();
			
			log_obj.log_fn(`${tab.url()} [${type.toUpperCase()}]:`, ...args);
		});
	}
	
	/**
	 * Closes the browser currently mounted to the AgentBrowser.
	 * - Method of: {@link Blacktraffic.AgentBrowserPuppeteer}
	 * 
	 * @returns {Promise<Blacktraffic.AgentBrowserPuppeteer>}
	 */
	async close () {
		//Close browser first
		if (this.browser) await this.browser.close();
		this.browser = undefined;
		
		//Return statement
		return this;
	}
	
	/**
	 * Closes the tab specified.
	 * - Method of: {@link Blacktraffic.AgentBrowserPuppeteer}
	 * 
	 * @alias closeTab
	 * @memberof Blacktraffic.AgentBrowser.Blacktraffic.AgentBrowserPuppeteer
	 * 
	 * @param {Object|string} arg0_tab_key
	 * 
	 * @returns {Promise<Blacktraffic.AgentBrowserPuppeteer>}
	 */
	async closeTab (arg0_tab_key) {
		//Convert from parameters
		let tab_obj = this.getTab(arg0_tab_key);
		
		//Attempt to close the tab if found
		if (tab_obj) {
			await tab_obj.close();
			if (this.browser && !this.browser.isConnected())
				this.browser = undefined;
		}
		
		//Return statement
		return this;
	}
	
	/**
	 * Closes all user tabs from the current browser.
	 * - Method of: {@link Blacktraffic.AgentBrowserPuppeteer}
	 * 
	 * @alias closeUserTabs
	 * @memberof Blacktraffic.AgentBrowser.Blacktraffic.AgentBrowserPuppeteer
	 * 
	 * @returns {Promise<Blacktraffic.AgentBrowserPuppeteer>}
	 */
	async closeUserTabs () {
		//Declare local instance variables
		let all_tab_keys = Object.keys(this.tab_obj);
		
		//Iterate over all_tab_keys and determine which tabs do not have a _blacktraffic_key, then close them
		for (let i = 0; i < all_tab_keys.length; i++) {
			let local_tab = this.tab_obj[all_tab_keys[i]];
			
			if (!local_tab._blacktraffic_key)
				await this.closeTab(local_tab);
		}
		
		//Return statement
		return this;
	}
	
	/**
	 * Focuses the specified tab.
	 * - Method of: {@link Blacktraffic.AgentBrowserPuppeteer}
	 *
	 * @alias focusTab
	 * @memberof Blacktraffic.AgentBrowser.Blacktraffic.AgentBrowserPuppeteer
	 *
	 * @param {Object|string} arg0_tab_key
	 *
	 * @returns {Promise<Object|undefined>}
	 */
	async focusTab (arg0_tab_key) {
		//Convert from parameters
		let tab_key = arg0_tab_key;
		
		//Declare local instance variables
		let tab_obj = this.getTab(tab_key);
		
		//Focus the current tab
		if (tab_obj) {
			await tab_obj.bringToFront();
		} else {
			this.warn_fn(`Blacktraffic.AgentBrowserPuppeteer: Could not focus ${tab_key}, as it doesn't exist.`)
		}
		
		//Return statement
		return tab_obj;
	}
	
	/**
	 * Fetches a specific element handle using CSS selectors.
	 * - Method of: {@link Blacktraffic.AgentBrowserPuppeteer}
	 *
	 * @alias getElement
	 * @memberof Blacktraffic.AgentBrowser.Blacktraffic.AgentBrowserPuppeteer
	 * 
	 * @param {Object|string} arg0_tab_key
	 * @param {string} arg1_selector
	 * @param {Object} [arg2_options]
	 *  @param {number} [arg2_options.timeout=10000]
	 * 
	 * @returns {Promise<HTMLElement>}
	 */
	async getElement (arg0_tab_key, arg1_selector, arg2_options) {
		//Convert from parameters
		let tab_obj = this.getTab(arg0_tab_key);
		let selector = arg1_selector;
		let options = (arg2_options) ? arg2_options : {};
		
		//Initialise options
		options.timeout = Math.returnSafeNumber(options.timeout, 10000);
		
		//Return statement
		return await tab_obj.waitForSelector(selector, {
			visible: true,
			timeout: options.timeout,
		});
	}
	
	/**
	 * Returns a tab object based on its key.
	 * - Method of: {@link Blacktraffic.AgentBrowserPuppeteer}
	 *
	 * @alias getTab
	 * @memberof Blacktraffic.AgentBrowser.Blacktraffic.AgentBrowserPuppeteer
	 * 
	 * @param {Object|string} arg0_tab_key
	 * 
	 * @returns {Object}
	 */
	getTab (arg0_tab_key) {
		//Convert from parameters
		let tab_key = arg0_tab_key;
		
		if (typeof tab_key === "object") return tab_key; //Internal guard clause if tab_key is already a tab object
		
		//Return statement
		return this.tab_obj[tab_key];
	}
	
	/**
	 * Returns all tabs in the current browser.
	 * - Method of: {@link Blacktraffic.AgentBrowserPuppeteer}
	 *
	 * @alias getTabs
	 * @memberof Blacktraffic.AgentBrowser.Blacktraffic.AgentBrowserPuppeteer
	 * 
	 * @returns {Promise<Object[]>}
	 */
	async getTabs () {
		//Return statement
		if (this.browser)
			return await this.browser.pages();
	}
	
	/**
	 * Injects a script within the current tab. 
	 * **Note.** Contexts are fully isolated when passing a function.
	 * - Method of: {@link Blacktraffic.AgentBrowserPuppeteer}
	 *
	 * @alias injectScript
	 * @memberof Blacktraffic.AgentBrowser.Blacktraffic.AgentBrowserPuppeteer
	 * 
	 * @param {string} arg0_tab_key
	 * @param {function} arg1_function
	 *  @param {Object} [arg2_options]
	 *  	@param {Object} [arg2_options.options] - Any options to pass down to the local function.
	 * 
	 * @returns {Promise<Object>}
	 */
	async injectScript (arg0_tab_key, arg1_function, arg2_options) {
		//Convert from parameters
		let tab_obj = this.getTab(arg0_tab_key);
		let local_function = arg1_function;
		let options = (arg2_options) ? arg2_options : {};
		
		//Inject script if possible
		if (tab_obj && local_function)
			await tab_obj.evaluate(local_function, (options.options) ? options.options : {});
		
		//Return statement
		return tab_obj;
	}
	
	/**
	 * Registers an onload script for future page visits using the mounted tab. 
	 * **Note.** Contexts are fully isolated when passing a function.
	 * - Method of: {@link Blacktraffic.AgentBrowserPuppeteer}
	 *
	 * @alias injectScriptOnload
	 * @memberof Blacktraffic.AgentBrowser.Blacktraffic.AgentBrowserPuppeteer
	 * 
	 * @param {Object|string} arg0_tab_key
	 * @param {function} arg1_function
	 * @param {Object} [arg2_options]
	 *  @param {Object} [arg2_options.options] - Any options to pass down to the local function.
	 *  @param {string} [arg2_options.url]
	 * 
	 * @returns {Promise<Object>}
	 */
	async injectScriptOnload (arg0_tab_key, arg1_function, arg2_options) {
		//Convert from parameters
		let tab_obj = this.getTab(arg0_tab_key);
		let local_function = arg1_function;
		let options = (arg2_options) ? arg2_options : {};
		
		//Inject script at document start if possible
		if (tab_obj && local_function) {
			await tab_obj.evaluateOnNewDocument(local_function, (options.options) ? options.options : {});
			if (options.url) await tab_obj.goto(options.url, { waitUntil: "networkidle2" });
		}
		
		//Return statement
		return tab_obj;
	}
	
	/**
	 * Initialises a Chrome instance and connects Puppeteer.
	 * - Method of: {@link Blacktraffic.AgentBrowserPuppeteer}
	 *
	 * @alias open
	 * @memberof Blacktraffic.AgentBrowser.Blacktraffic.AgentBrowserPuppeteer
	 * 
	 * @returns {Promise<Blacktraffic.AgentBrowserPuppeteer>}
	 */
	async open () {
		//Declare local instance variables
		let attempts = 0;
		
		//Iterate over all attempts until threshold or the for loop exits
		for (let i = 0; i < this.options.connection_attempts_threshold; i++)
			try {
				let target_port = (!this.options.unique_ports) ? 
					9222 : await Blacktraffic.getFreePort();
					
				let flags = [
					`--remote-debugging-port=${Math.returnSafeNumber(this.options.debugging_port, target_port)}`,
					`--no-first-run`,
					`--no-default-browser-check`
				];
				
				if (this.options.user_data_folder) {
					flags.push(`--user-data-dir="${this.options.user_data_folder}"`);
					flags.push(`--remote-allow-origins=*`);
				}
				
				//1. Run launch command
				this.launch_cmd = `"${Blacktraffic.getChromeBinaryPath()}" ${flags.join(" ")}`;
				exec(this.launch_cmd);
				
				//2. Connect to browser instance
				await Blacktraffic.sleep(3500);
				this.browser = await puppeteer.connect({
					browserURL: `http://127.0.0.1:${target_port}`,
					defaultViewport: null
				});
				this.log_fn(`Blacktraffic.AgentBrowserPuppeteer: ${this.key} connected to port ${target_port}.`);
				break;
			} catch (e) {
				attempts++;
				this.warn_fn(`Port collision or launch failure, retrying .. ${attempts}/${this.options.connection_attempts_threshold}`);
				await Blacktraffic.sleep(500);
			}
		
		if (!this.browser) this.error_fn(`Blacktraffic.AgentBrowserPuppeteer: ${this.key} failed to connect to a browser.`);
		
		//Return statement
		return this;
	}
	
	/**
	 * Opens a tab at the corresponding URL. Corresponding URLs are optional.
	 * - Method of: {@link Blacktraffic.AgentBrowserPuppeteer}
	 *
	 * @alias openTab
	 * @memberof Blacktraffic.AgentBrowser.Blacktraffic.AgentBrowserPuppeteer
	 * 
	 * @param {string} [arg0_tab_key=Object.generateRandomID(this.tab_obj)]
	 * @param {string} arg1_url
	 * 
	 * @returns {Promise<Object>}
	 */
	async openTab (arg0_tab_key, arg1_url) {
		//Convert from parameters
		let tab_key = (arg0_tab_key) ? arg0_tab_key : Object.generateRandomID(this.tab_obj);
		let url = arg1_url;
		
		//Open tab first
		if (!this.browser) await this.open();
		this.tab_obj[tab_key] = await this.browser.newPage();
			this.tab_obj[tab_key][`_blacktraffic_key`] = tab_key;
		let tab_obj = this.tab_obj[tab_key];
		
		//Load WebAPI in tab
		let serialised_api = Object.serialise(Blacktraffic.AgentBrowser.webapi);
		
		await tab_obj.evaluateOnNewDocument((encoded_api) => {
			//HELPER: Recursive Rehydrator
			const rehydrate = (obj) => {
				if (obj === null || typeof obj !== "object") return obj;
				
				if (obj.__type === "function") {
					// Reconstruct the function/class using indirect eval
					return (0, eval)(`(${obj.source})`);
				}
				
				const result = Array.isArray(obj) ? [] : {};
				for (const key in obj) {
					result[key] = rehydrate(obj[key]);
				}
				return result;
			};
			
			window.webapi = rehydrate(encoded_api);
		}, serialised_api);
		if (url) await tab_obj.goto(url, { waitUntil: "networkidle2" });
		
		//Return statement
		return this.tab_obj[tab_key];
	}
	
	/**
	 * Reloads the given tab.
	 * - Method of: {@link Blacktraffic.AgentBrowserPuppeteer}
	 *
	 * @alias reloadTab
	 * @memberof Blacktraffic.AgentBrowser.Blacktraffic.AgentBrowserPuppeteer
	 * 
	 * @param {string} arg0_tab_key
	 * 
	 * @returns {Promise<Object>}
	 */
	async reloadTab (arg0_tab_key) {
		//Convert from parameters
		let tab_obj = this.getTab(arg0_tab_key);
		
		//Reload the current tab
		await tab.reload({ waitUntil: "networkidle2" });
		
		//Return statement
		return tab_obj;
	}
	
	/**
	 * Removes the current {@link Blacktraffic.AgentBrowser}.
	 * - Method of: {@link Blacktraffic.AgentBrowserPuppeteer}
	 *
	 * @alias remove
	 * @memberof Blacktraffic.AgentBrowser.Blacktraffic.AgentBrowserPuppeteer
	 */
	async remove () {
		await this.close(); //Close browser first
		super.remove();
		
		//Iterate over all Blacktraffic.AgentBrowserPuppeteer.instances and remove the current instance
		for (let i = 0; i < Blacktraffic.AgentBrowserPuppeteer.instances.length; i++) {
			let local_browser = Blacktraffic.AgentBrowserPuppeteer.instances[i];
			
			if (local_browser.key === this.key) {
				Blacktraffic.AgentBrowserPuppeteer.instances.splice(i, 1);
				break;
			}
		}
	}
	
	/**
	 * Takes multi-page or full-page screenshots from a Puppeteer instance. A4 page format by default, hence strange px values.
	 * - Method of: {@link Blacktraffic.AgentBrowserPuppeteer}
	 *
	 * @alias screenshotHTML
	 * @memberof Blacktraffic.AgentBrowser.Blacktraffic.AgentBrowserPuppeteer
	 *
	 * @param {Object} arg0_tab_key
	 * @param {string} arg1_path
	 * @param {Object} [arg2_options]
	 *  @param {boolean} [arg2_options.full_page=false]
	 *  @param {number} [arg2_options.height=794]
	 *  @param {number} [arg2_options.width=1531]
	 *  @param {number} [arg2_options.margin_bottom=20]
	 */
	async screenshotHTML (arg0_tab_key, arg1_path, arg2_options) {
		//Convert from parameters
		let tab_obj = this.getTab(arg0_tab_key);
		let path = arg1_path;
		let options = (arg2_options) ? arg2_options : {};
		
		//Initialise options
		if (options.height === undefined) options.height = 794;
		if (options.width === undefined) options.width = 1531;
		
		if (options.margin_bottom === undefined) options.margin_bottom = 20;
		if (options.margin_left === undefined) options.margin_left = 20;
		if (options.margin_top === undefined) options.margin_top = 20;
		if (options.margin_right === undefined) options.margin_right = 20;
		
		//Function body
		try {
			await tab_obj.setViewport({ width: options.width, height: options.height });
			
			if (!options.full_page) {
				let body_handle = await tab_obj.$("body");
				let { height } = await body_handle.boundingBox();
				await body_handle.dispose();
				
				let line_positions = await tab_obj.evaluate(() => {
					let lines = [];
					let node;
					let walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
					
					while (node = walker.nextNode()) {
						let range = document.createRange();
						range.selectNodeContents(node);
						let rects = range.getClientRects();
						for (let rect of rects) lines.push(rect.top);
					}
					return lines;
				});
				
				let split_points = [0];
				for (let i = 1; i < line_positions.length; i++)
					if (line_positions[i] - split_points[split_points.length - 1] > options.height)
						split_points.push(line_positions[i - 1]);
				split_points.push(height);
				
				for (let i = 0; i < split_points.length - 1; i++) {
					let clip_height = split_points[i + 1] - split_points[i];
					let screenshot_buffer = await tab_obj.screenshot({
						clip: {
							x: 0,
							y: split_points[i],
							width: await (tab_obj.evaluate(() => document.body.clientWidth)),
							height: clip_height
						}
					});
					
					let padded_screenshot_buffer = await CURL.addMarginsToScreenshot(screenshot_buffer, {
						height: clip_height + options.margin_top + options.margin_bottom,
						width: options.width,
						margin_bottom: options.margin_bottom,
						margin_left: options.margin_left,
						margin_right: options.margin_right,
						margin_top: options.margin_top
					});
					
					fs.writeFileSync(`${path}_${i + 1}.png`, padded_screenshot_buffer);
				}
			} else {
				let height = await tab_obj.evaluate(() => document.documentElement.scrollHeight);
				await tab_obj.setViewport({ width: options.width, height: Math.ceil(height) + 48 });
				await tab_obj.screenshot({ path: `${path}_full.png` });
			}
		} catch (e) {
			console.error(`Error taking A4 screenshots: ${e}`);
		}
	}
	
	/**
	 * Checks if a given tab exists.
	 * - Method of: {@link Blacktraffic.AgentBrowserPuppeteer}
	 *
	 * @alias tabExists
	 * @memberof Blacktraffic.AgentBrowser.Blacktraffic.AgentBrowserPuppeteer
	 *
	 * @param {Object|string} arg0_tab_key
	 * @param {Object} [arg1_options]
	 *  @param {boolean} [arg1_options.strict=false] - Whether to also ensure the current tab is connected.
	 *
	 * @returns {Promise<boolean>}
	 */
	async tabExists (arg0_tab_key, arg1_options) {
		//Convert from parameters
		let tab_obj = this.getTab(arg0_tab_key);
		let options = (arg1_options) ? arg1_options : {};
		
		//Declare local instance variables
		let is_connected = false;
		
		//options.strict handler
		if (tab_obj && options.strict)
			try {
				await tab_obj.title();
				is_connected = true;
			} catch (e) {}
		
		//Return statement
		if (!options.strict && tab_obj) return true;
		if (options.strict && is_connected) return true;
	}
	
	/**
	 * Updates the default logging channel for the current agent.
	 * - Method of: {@link Blacktraffic.AgentBrowserPuppeteer}
	 *
	 * @alias updateLogChannel
	 * @memberof Blacktraffic.AgentBrowser.Blacktraffic.AgentBrowserPuppeteer
	 * 
	 * @param {string} arg0_channel_key
	 */
	updateLogChannel (arg0_channel_key) {
		//Convert from parameters
		let channel_key = arg0_channel_key;
		
		this.log_obj = log.getLoggingFunctions(channel_key);
			this.error_fn = this.log_obj.error_fn;
			this.log_fn = this.log_obj.log_fn;
			this.warn_fn = this.log_obj.warn_fn;
	}
	
	/**
	 * Waits for content to stop changing within a selector.
	 * - Method of: {@link Blacktraffic.AgentBrowserPuppeteer}
	 *
	 * @alias waitForStableContent
	 * @memberof Blacktraffic.AgentBrowser.Blacktraffic.AgentBrowserPuppeteer
	 *
	 * @param {Object|string} arg0_tab_key - The given tab key.
	 * @param {string} arg1_selector
	 * @param {number} [arg2_interval=3000]
	 */
	async waitForStableContent (arg0_tab_key, arg1_selector, arg2_interval) {
		//Convert from parameters
		let tab_obj = this.getTab(arg0_tab_key);
		let selector = arg1_selector;
		let interval = Math.returnSafeNumber(arg2_interval, 3000);
		
		//Wait for function inside of tab should it exist
		if (tab_obj) {
			let state_key = `_Blacktraffic_stable_${selector}`;
			
			await tab_obj.waitForFunction((selector, state_key) => {
				let local_els = document.querySelectorAll(selector);
				if (local_els.length === 0) return false;
				
				let last_el = local_els[local_els.length - 1];
				
				//Check if HTML has changed
				if (!window[state_key]) {
					window[state_key] = last_el.innerHTML;
					return false;
				}
				
				let current_html = last_el.innerHTML;
				if (current_html === window[state_key]) {
					return true;
				} else {
					window[state_key] = current_html;
					return false;
				}
			}, { polling: interval, timeout: 0 }, selector, state_key);
		}
	}
};

/**
 * Attempts to return the Chrome binary path.
 * 
 * @returns {string}
 */
Blacktraffic.getChromeBinaryPath = function () {
	//Declare local instance variables
	let os_platform = Blacktraffic.getOS();
	
	//Handle Windows
	if (os_platform === "win") {
		let suffix = "/Google/Chrome/Application/chrome.exe";
		let prefixes = [process.env.LOCALAPPDATA, process.env.ProgramFiles, process.env["PROGRAMFILES(X86)"]];
		
		for (let local_prefix of prefixes)
			if (local_prefix) {
				let chrome_path = path.join(local_prefix, suffix);
				if (fs.existsSync(chrome_path)) return chrome_path;
			}
	} else if (os_platform === "lin") {
		let chrome_path = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
		if (fs.existsSync(chrome_path)) return chrome_path;
	} else {
		let binaries = ["google-chrome", "google-chrome-stable", "chromium"];
		
		for (let local_binary of binaries)
			try {
				let chrome_path = child_process.execSync(`which ${local_binary}`, { stdio: "pipe" })
					.toString().trim();
				if (chrome_path && fs.existsSync(chrome_path)) return chrome_path;
			} catch (e) {} //Which returns non-zero exit code if not found
	}
};

/**
 * Attempts to return the default Chrome profile path.
 * 
 * @param {string} [arg0_profile]
 * 
 * @returns {string}
 */
Blacktraffic.getChromeDefaultProfilePath = function (arg0_profile) {
	//Convert from parameters
	let profile = arg0_profile;
	
	//Declare local instance variables
	let os_platform = Blacktraffic.getOS();
	let profile_name = (profile) ? profile : "Profile 1";
	let user_home = process.env.HOME || process.env.USERPROFILE;
	
	//Handle Windows
	if (os_platform === "win") {
		if (process.env.LOCALAPPDATA) {
			let profile_path = path.join(
				process.env.LOCALAPPDATA,
				"Google/Chrome/User Data",
				profile_name
			);
			if (fs.existsSync(profile_path)) return profile_path;
		}
	} else if (os_platform === "lin") {
		if (user_home) {
			let profile_path = path.join(user_home, "Library/Application Support/Google/Chrome", profile_name);
			if (fs.existsSync(profile_path)) return profile_path;
		}
	} else {
		if (user_home) {
			//Check for both official Google Chrome and Chromium paths
			let potential_paths = [
				path.join(user_home, ".config/google-chrome", profile_name),
				path.join(user_home, ".config/chromium", profile_name),
			];
			
			//Iterate over all potential_paths
			for (let local_path of potential_paths)
				if (fs.existsSync(local_path)) return local_path;
		}
	}
	
	//Fallback after Profile 1 to Default
	if (profile !== "Default") {
		let default_profile_path = Blacktraffic.getChromeDefaultProfilePath("Default");
		if (default_profile_path) return default_profile_path;
	}
	
	//Return statement; fallback return if no path is found
	console.error(`Blacktraffic.getChromeDefaultProfile() called, but path could not be found.`);
	return undefined;
};