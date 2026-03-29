if (!global.Blacktraffic) global.Blacktraffic = {};

/**
 * Refer to <span color = "yellow">{@link Blacktraffic.AgentBrowser}</span> for methods or fields inherited from automatic destructuring.
 * 
 * Creates a new Selenium browser agent (Firefox) used for scraping tasks and purposes. Requires npm selenium-webdriver.
 *
 * **Note.** This shared resource type is currently a beta test, and may not be equivalent to Puppeteer logic, which is recommended for production use.
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
 * 
 * ##### Instance:
 * - `.key`: {@link string}
 * - `.options`: {@link Object}
 *   - `.onload`: {@link function}
 * - `.tab_obj`: {@link Object}<{@link Object}>
 *
 * ##### Methods:
 * - <span color=00ffff>{@link Blacktraffic.AgentBrowserSelenium.captureConsoleToChannel|captureConsoleToChannel}</span>(arg0_tab_key:{@link Object}|{@link string}, arg1_channel_key:{@link string})
 * - <span color=00ffff>{@link Blacktraffic.AgentBrowserSelenium.close|close}</span>() | {@link Blacktraffic.AgentBrowserSelenium}
 * - <span color=00ffff>{@link Blacktraffic.AgentBrowserSelenium.closeTab|closeTab}</span>(arg0_tab_key:{@link Object}|{@link string}) | {@link Blacktraffic.AgentBrowserSelenium}
 * - <span color=00ffff>{@link Blacktraffic.AgentBrowserSelenium.closeUserTabs|closeUserTabs}</span>() | {@link Blacktraffic.AgentBrowserSelenium}
 * - <span color=00ffff>{@link Blacktraffic.AgentBrowserSelenium.focusTab|focusTab}</span>(arg0_tab_key:{@link Object}|{@link string}) | {@link Object}
 * - <span color=00ffff>{@link Blacktraffic.AgentBrowserSelenium.getElement|getElement}</span>(arg0_tab_key:{@link Object}|{@link string}, arg1_selector:{@link string}, arg2_options:{@link Object}) | {@link HTMLElement}
 * - <span color=00ffff>{@link Blacktraffic.AgentBrowserSelenium.getTab|getTab}</span>(arg0_tab_key:{@link Object}|{@link string}) | {@link Object}
 * - <span color=00ffff>{@link Blacktraffic.AgentBrowserSelenium.getTabs|getTabs}</span>() | {@link Array}<{@link Object}>
 * - <span color=00ffff>{@link Blacktraffic.AgentBrowserSelenium.injectScript|injectScript}</span>(arg0_tab_key:{@link Object}|{@link string}, arg1_function:{@link function}, arg2_options:{@link Object}) | {@link Object}
 * - <span color=00ffff>{@link Blacktraffic.AgentBrowserSelenium.injectScriptOnload|injectScriptOnload}</span>(arg0_tab_key:{@link Object}|{@link string}, arg1_function:{@link function}, arg2_options:{@link Object}) | {@link Object}
 * - <span color=00ffff>{@link Blacktraffic.AgentBrowserSelenium.open|open}</span>() | {@link Blacktraffic.AgentBrowserSelenium}
 * - <span color=00ffff>{@link Blacktraffic.AgentBrowserSelenium.openTab|openTab}</span>(arg0_tab_key:{@link Object}|{@link string}, arg1_url:{@link string}) | {@link Object}
 * - <span color=00ffff>{@link Blacktraffic.AgentBrowserSelenium.reloadTab|reloadTab}</span>(arg0_tab_key:{@link Object}|{@link string}) | {@link Object}
 * - <span color=00ffff>{@link Blacktraffic.AgentBrowserSelenium.remove|remove}</span>()
 * - <span color=00ffff>{@link Blacktraffic.AgentBrowserSelenium.tabExists|tabExists}</span>(arg0_tab_key:{@link Object}|{@link string}, arg1_options:{@link Object})
 * - <span color=00ffff>{@link Blacktraffic.AgentBrowserSelenium.updateLogChannel|updateLogChannel}</span>(arg0_channel_key:{@link string})
 * - <span color=00ffff>{@link Blacktraffic.AgentBrowserSelenium.waitForStableContent|waitForStableContent}</span>(arg0_tab_key:{@link Object}|{@link string}, arg1_selector:{@link string}, arg2_interval=3000:{@link number}) | {@link boolean}
 *
 * ##### Static Fields:
 * - `.instances`: {@link Array}<{@link Blacktraffic.AgentBrowserPuppeteer}>
 *
 * @augments Blacktraffic.AgentBrowser
 * @memberof Blacktraffic.AgentBrowser
 * @type {Blacktraffic.AgentBrowserSelenium}
 */
Blacktraffic.AgentBrowserSelenium = class extends Blacktraffic.AgentBrowser { //[WIP] - Finish documentation and method refactoring
	static instances = [];
	
	constructor (arg0_key, arg1_options) {
		//Convert from parameters
		let key = arg0_key ? arg0_key : Class.generateRandomID(Blacktraffic.AgentBrowserSelenium);
		let options = arg1_options ? arg1_options : {};
			super(key, options);
		
		//Initialise options
		if (options.debug_console === undefined) options.debug_console = false;
		if (options.headless === undefined) options.headless = false;
		
		options.connection_attempts_threshold = Math.returnSafeNumber(options.connection_attempts_threshold, 3);
		
		//Declare local instance variables
		this.updateLogChannel(options.log_channel);
		this.key = key;
		this.options = options;
		this.tab_obj = {};
		
		//Initialise and push to instances
		this.open().then(() => {
			if (this.options.onload) this.options.onload.call(this);
		});
		Blacktraffic.AgentBrowserSelenium.instances.push(this);
	}
	
	/**
	 * Captures the current tab's console and feeds it into a {@link log.Channel}.
	 * - Method of: {@link Blacktraffic.AgentBrowserSelenium}
	 *
	 * @alias captureConsoleToChannel
	 * @memberof Blacktraffic.AgentBrowser.Blacktraffic.AgentBrowserSelenium
	 */
	async captureConsoleToChannel (arg0_tab_key, arg1_channel_key) {
		//Convert from parameters
		let tab = this.getTab(arg0_tab_key);
		let log_obj = log.getLoggingFunctions(arg1_channel_key);
		
		//Attempt to capture console in channel using polling loop
		let logic_loop = setInterval(async () => {
			try {
				//Note: Firefox log retrieval via Selenium is limited compared to Chrome
				let logs = await tab.manage().logs().get("browser");
				
				//Iterate over all entries in logs
				for (let entry of logs)
					log_obj.log_fn(`[${entry.level.name}]: ${entry.message}`);
				
				clearInterval(logic_loop);
			} catch (e) {}
		}, 1000);
	}
	
	/**
	 * Closes the browser currently mounted to the AgentBrowser.
	 * - Method of: {@link Blacktraffic.AgentBrowserSelenium}
	 *
	 * @alias close
	 * @memberof Blacktraffic.AgentBrowser.Blacktraffic.AgentBrowserSelenium
	 * 
	 * @returns {Promise<Blacktraffic.AgentBrowser.AgentBrowserSelenium>}
	 */
	async close () {
		//Close browser
		if (this.browser) await this.browser.quit();
		this.browser = undefined;
		
		//Return statement
		return this;
	}
	
	/**
	 * Closes the tab specified.
	 * - Method of: {@link Blacktraffic.AgentBrowserSelenium}
	 *
	 * @alias closeTab
	 * @memberof Blacktraffic.AgentBrowser.Blacktraffic.AgentBrowserSelenium
	 * 
	 * @param {Object|string} arg0_tab_key
	 * 
	 * @returns {Promise<Blacktraffic.AgentBrowser.AgentBrowserSelenium>}
	 */
	async closeTab (arg0_tab_key) {
		//Convert from parameters
		let tab_obj = this.getTab(arg0_tab_key);
		
		//Closes the given tab if possible
		if (tab_obj) {
			let target_handle = await tab_obj.getWindowHandle();
			await this.browser.switchTo().window(target_handle);
			await this.browser.close();
			
			let handles = await this.browser.getAllWindowHandles();
			if (handles.length > 0) {
				await this.browser.switchTo().window(handles[0]);
			} else {
				this.browser = undefined;
			}
		}
		
		//Return statement
		return this;
	}
	
	/**
	 * Closes all user tabs from the current browser.
	 * - Method of: {@link Blacktraffic.AgentBrowserSelenium}
	 *
	 * @alias closeUserTabs
	 * @memberof Blacktraffic.AgentBrowser.Blacktraffic.AgentBrowserSelenium
	 * 
	 * @returns {Promise<Blacktraffic.AgentBrowser.AgentBrowserSelenium>}
	 */
	async closeUserTabs () {
		//Iterate over all_tab_keys and close tabs that do not have a _blacktraffic_key attached
		let all_tab_keys = Object.keys(this.tab_obj);
		
		for (let i = 0; i < all_tab_keys.length; i++) {
			let local_tab = this.tab_obj[all_tab_keys[i]];
			if (!local_tab._blacktraffic_key) await this.closeTab(local_tab);
		}
		
		//Return statement
		return this;
	}
	
	/**
	 * Focuses the specified tab.
	 * - Method of: {@link Blacktraffic.AgentBrowserSelenium}
	 *
	 * @alias focusTab
	 * @memberof Blacktraffic.AgentBrowser.Blacktraffic.AgentBrowserSelenium
	 * 
	 * @param {string} arg0_tab_key
	 * 
	 * @returns {Promise<Object|undefined>}
	 */
	async focusTab (arg0_tab_key) {
		//Convert from parameters
		let tab_key = arg0_tab_key;
		
		//Declare local instance variables
		let tab_obj = this.getTab(tab_key);
		
		if (tab_obj) {
			let handle = await tab_obj.getWindowHandle();
			await this.browser.switchTo().window(handle);
		} else {
			this.warn_fn(`Blacktraffic.AgentBrowserSelenium: Could not focus ${tab_key}, as it doesn't exist.`);
		}
		
		//Return statement
		return tab_obj;
	}
	
	/**
	 * Fetches a specific element handle using CSS selectors.
	 * - Method of: {@link Blacktraffic.AgentBrowserSelenium}
	 *
	 * @alias getElement
	 * @memberof Blacktraffic.AgentBrowser.Blacktraffic.AgentBrowserSelenium
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
		let options = arg2_options ? arg2_options : {};
		
		//Initialise options
		options.timeout = Math.returnSafeNumber(options.timeout, 10000);
		
		//Declare local instance variables
		let condition = until.elementLocated(By.css(selector));
		let element = await tab_obj.wait(condition, options.timeout);
		
		await tab_obj.wait(until.elementIsVisible(element), options.timeout);
		await tab_obj.wait(until.elementIsEnabled(element), options.timeout);
		
		//Return statement
		return element;
	}
	
	/**
	 * Returns a tab object based on its key.
	 * - Method of: {@link Blacktraffic.AgentBrowserSelenium}
	 *
	 * @alias getTab
	 * @memberof Blacktraffic.AgentBrowser.Blacktraffic.AgentBrowserSelenium
	 * 
	 * @param {Object|string} arg0_tab_key
	 * 
	 * @returns {Object}
	 */
	getTab (arg0_tab_key) {
		//Convert from parameters
		let tab_key = arg0_tab_key;
		
		if (typeof tab_key === "object") return tab_key; //Internal guard clause if tab already exists
		
		//Return statement
		return this.tab_obj[tab_key];
	}
	
	/**
	 * Returns all tabs in the current browser.
	 * - Method of: {@link Blacktraffic.AgentBrowserSelenium}
	 *
	 * @alias getTabs
	 * @memberof Blacktraffic.AgentBrowser.Blacktraffic.AgentBrowserSelenium
	 * 
	 * @returns {Promise<Object[]>}
	 */
	async getTabs () {
		//Return statement
		if (this.browser) return await this.browser.getAllWindowHandles();
	}
	
	/**
	 * Injects a script within the current tab.
	 * **Note.** Contexts are fully isolated when passing a function.
	 * - Method of: {@link Blacktraffic.AgentBrowserSelenium}
	 *
	 * @alias injectScript
	 * @memberof Blacktraffic.AgentBrowser.Blacktraffic.AgentBrowserSelenium
	 * 
	 * @param arg0_tab_key
	 * @param {function} arg1_function
	 *  @param {Object} [arg2_options]
	 *  	@param {Object} [arg2_options.options] - Any options to pass down to the local function.
	 *  	
	 * @returns {Promise<Object>}
	 */
	async injectScript (arg0_tab_key, arg1_function, arg2_options) {
		let tab_obj = this.getTab(arg0_tab_key);
		let local_function = arg1_function;
		let options = arg2_options ? arg2_options : {};
		
		//Execute function if possible
		if (tab_obj && local_function)
			await tab_obj.executeScript(local_function, (options.options) ? options.options : {});
		
		//Return statement
		return tab_obj;
	}
	
	/**
	 * Registers an onload script for future page visits using the mounted tab.
	 * **Note.** Contexts are fully isolated when passing a function.
	 * - Method of: {@link Blacktraffic.AgentBrowserSelenium}
	 *
	 * @alias injectScriptOnload
	 * @memberof Blacktraffic.AgentBrowser.Blacktraffic.AgentBrowserSelenium
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
		let options = arg2_options ? arg2_options : {};
		
		//Execute script on load
		if (tab_obj && arg1_function)
			if (options.url) {
				await tab_obj.get(options.url);
				await tab_obj.executeScript(local_function, (options.options) ? options.options : {});
			}
		
		//Return statement
		return tab_obj;
	}
	
	/**
	 * Initialises a Firefox instance and connects Selenium.
	 * - Method of: {@link Blacktraffic.AgentBrowserSelenium}
	 *
	 * @alias open
	 * @memberof Blacktraffic.AgentBrowser.Blacktraffic.AgentBrowserSelenium
	 * 
	 * @returns {Promise<Blacktraffic.AgentBrowserSelenium>}
	 */
	async open () {
		//Declare local instance variables
		let attempts = 0;
		
		//Iterate over all connection attempts to make sure Firefox is initialised
		for (let i = 0; i < this.options.connection_attempts_threshold; i++) {
			try {
				let target_port = await Blacktraffic.getFreePort();
				
				//Firefox uses --marionette for remote control on a specific port
				this.launch_cmd = `"${Blacktraffic.getFirefoxBinaryPath()}" --marionette --start-debugger-server ${target_port}${
					this.options.user_data_folder ? ` -profile "${this.options.user_data_folder}"` : ""
				}${this.options.headless ? " -headless" : ""}`;
				
				exec(this.launch_cmd);
				await Blacktraffic.sleep(3500);
				
				let firefox_options = new firefox.Options();
				
				// Setting up the builder for Firefox
				this.browser = await new Builder()
				.forBrowser("firefox")
				.setFirefoxOptions(firefox_options)
				.build();
				
				this.log_fn(`Blacktraffic.AgentBrowserSelenium: ${this.key} (Firefox) started.`);
				break;
			} catch (e) {
				attempts++;
				this.warn_fn(`Launch failure, retrying .. ${attempts}/${this.options.connection_attempts_threshold}`);
				await Blacktraffic.sleep(500);
			}
		}
		
		if (!this.browser)
			this.error_fn(`Blacktraffic.AgentBrowserSelenium: ${this.key} failed to connect to Firefox.`);
		
		//Return statement
		return this;
	}
	
	/**
	 * Opens a tab at the corresponding URL. Corresponding URLs are optional.
	 * - Method of: {@link Blacktraffic.AgentBrowserSelenium}
	 *
	 * @alias openTab
	 * @memberof Blacktraffic.AgentBrowser.Blacktraffic.AgentBrowserSelenium
	 * 
	 * @param {string} [arg0_tab_key=Object.generateRandomID(this.tab_obj)]
	 * @param {string} arg1_url
	 * 
	 * @returns {Promise<Object>}
	 */
	async openTab (arg0_tab_key, arg1_url) {
		//Convert from parameters
		let tab_key = arg0_tab_key ? arg0_tab_key : Object.generateRandomID(this.tab_obj);
		let url = arg1_url;
		
		//Make sure browser is open first
		if (!this.browser) await this.open();
		
		await this.browser.switchTo().newWindow("tab");
		this.tab_obj[tab_key] = this.browser;
		this.tab_obj[tab_key]["_blacktraffic_key"] = tab_key;
		
		if (url) await this.browser.get(url);
		
		//Return statement
		return this.tab_obj[tab_key];
	}
	/**
	 * Reloads the given tab.
	 * - Method of: {@link Blacktraffic.AgentBrowserSelenium}
	 *
	 * @alias reloadTab
	 * @memberof Blacktraffic.AgentBrowser.Blacktraffic.AgentBrowserSelenium
	 *
	 * @param {string} arg0_tab_key
	 *
	 * @returns {Promise<Object>}
	 */
	async reloadTab (arg0_tab_key) {
		//Convert from parameters
		let tab_obj = this.getTab(arg0_tab_key);
		
		//Refresh the current tab
		await tab_obj.navigate().refresh();
		
		//Return statement
		return tab_obj;
	}
	
	/**
	 * Checks if a given tab exists.
	 * - Method of: {@link Blacktraffic.AgentBrowserSelenium}
	 *
	 * @alias tabExists
	 * @memberof Blacktraffic.AgentBrowser.Blacktraffic.AgentBrowserSelenium
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
		let options = arg1_options ? arg1_options : {};
		
		//Declare local instance variables
		let is_connected = false;
		
		if (tab_obj && options.strict) {
			try {
				await tab_obj.getTitle();
				is_connected = true;
			} catch (e) {}
		}
		
		//Return statement
		if (!options.strict && tab_obj) return true;
		if (options.strict && is_connected) return true;
	}
	
	/**
	 * Removes the current {@link Blacktraffic.AgentBrowser}.
	 * - Method of: {@link Blacktraffic.AgentBrowserSelenium}
	 *
	 * @alias remove
	 * @memberof Blacktraffic.AgentBrowser.Blacktraffic.AgentBrowserSelenium
	 */
	async remove () {
		await this.close(); //Close browser first
		super.remove();
		
		//Iterate over all Blacktraffic.AgentBrowserSelenium.instances and remove the current instances
		for (let i = 0; i < Blacktraffic.AgentBrowserSelenium.instances.length; i++) {
			let local_browser = Blacktraffic.AgentBrowserSelenium.instances[i];
			if (local_browser.key === this.key) {
				Blacktraffic.AgentBrowserSelenium.instances.splice(i, 1);
				break;
			}
		}
	}
	
	/**
	 * Updates the default logging channel for the current agent.
	 * - Method of: {@link Blacktraffic.AgentBrowserSelenium}
	 *
	 * @alias updateLogChannel
	 * @memberof Blacktraffic.AgentBrowser.Blacktraffic.AgentBrowserSelenium
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
	 * - Method of: {@link Blacktraffic.AgentBrowserSelenium}
	 *
	 * @alias waitForStableSelector
	 * @memberof Blacktraffic.AgentBrowser.Blacktraffic.AgentBrowserSelenium
	 *
	 * @param {Object|string} arg0_tab_key - The given tab key.
	 * @param {string} arg1_selector
	 * @param {number} [arg2_interval=3000]
	 */
	async waitForStableContent(arg0_tab_key, arg1_selector, arg2_interval) {
		// Convert from parameters
		let tab_obj = this.getTab(arg0_tab_key);
		let selector = arg1_selector;
		let interval = Math.returnSafeNumber(arg2_interval, 3000);
		
		//Wait for function inside of tab should it exist
		if (tab_obj) {
			let state_key = `_Blacktraffic_stable_${selector.replace(/\W/g, "")}`;
			
			await tab_obj.waitForFunction((selector, state_key) => {
				let local_els = document.querySelectorAll(selector);
				if (local_els.length === 0) return false;
				
				let last_el = local_els[local_els.length - 1];
				let current_html = last_el.innerHTML;
				
				//Check if this is the first execution
				if (window[state_key] === undefined) {
					window[state_key] = current_html;
					return false;
				}
				
				//Compare current state to previous state
				if (current_html === window[state_key]) {
					//Cleanup the global variable before finishing
					delete window[state_key];
					return true;
				} else {
					//Update the state and continue polling
					window[state_key] = current_html;
					return false;
				}
			}, { polling: interval, timeout: 0 }, selector, state_key);
		}
	}
};

/**
 * Attempts to return the Firefox binary path.
 *
 * @returns {string}
 */
Blacktraffic.getFirefoxBinaryPath = function () {
	//Declare local instance variables
	let os_platform = Blacktraffic.getOS();
	
	//Parse Firefox binary path based on returned OS
	if (os_platform === "win") {
		let suffix = "/Mozilla Firefox/firefox.exe";
		let prefixes = [process.env.LOCALAPPDATA, process.env.ProgramFiles, process.env["PROGRAMFILES(X86)"]];
		for (let local_prefix of prefixes)
			if (local_prefix) {
				let ff_path = path.join(local_prefix, suffix);
				if (fs.existsSync(ff_path)) return ff_path;
			}
	} else if (os_platform === "lin") {
		let ff_path = "/Applications/Firefox.app/Contents/MacOS/firefox";
		if (fs.existsSync(ff_path)) return ff_path;
	} else {
		let binaries = ["firefox", "firefox-stable", "iceweasel"];
		for (let local_binary of binaries)
			try {
				let ff_path = child_process.execSync(`which ${local_binary}`, { stdio: "pipe" })
				.toString().trim();
				if (ff_path && fs.existsSync(ff_path)) return ff_path;
			} catch (e) {}
	}
};