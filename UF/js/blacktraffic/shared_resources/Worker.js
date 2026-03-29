if (!global.Blacktraffic) global.Blacktraffic = {};

/**
 * Represents a Blacktraffic.Worker type that can be repeatedly called to execute browser automation or other tasks. A tab is currently provided by default per task, regardless of whether it actually needs a browser context to execute.
 * 
 * ##### Constructor:
 * - `arg0_type`: {@link string} - The worker type to identify with.
 * - `arg1_options`: {@link Object}
 *   - `.config_file_path`: {@link string} - The config JSON5 file to load. Accessible at `.config`.
 *   - `.do_not_close_tab`: {@link boolean}
 *   - `.interval`: {@link number} - The interval in seconds at which to execute run().
 *   - `.log_channel="${worker}_type"`: {@link string}
 *   - `.tags=[]`: {@link Array}<{@link string}>
 *   - 
 *   - `.console_persistence=false`: {@link boolean} - Whether console outputs should persist between worker jobs.
 *   
 * ##### Instance:
 * - `.current_job_status="idle"`: {@link string}
 * - `.is_enabled=true`: {@link boolean}
 * - `.jobs=[]`: {@link Array}<{@link Object}>
 * - `.options`: {@link Object}
 * - `.type`: {@link string}
 * 
 * ##### Methods:
 * - <span color=00ffff>{@link Blacktraffic.Worker.disable|disable}</span>()
 * - <span color=00ffff>{@link Blacktraffic.Worker.enable|enable}</span>()
 * - <span color=00ffff>{@link Blacktraffic.Worker.error|error}</span>(argn_arguments:{@link any})
 * - <span color=00ffff>{@link Blacktraffic.Worker.execute|execute}</span>(argn_arguments:{@link any})
 * - <span color=00ffff>{@link Blacktraffic.Worker.getBrowser|getBrowser}</span>() | {@link Blacktraffic.AgentBrowserPuppeteer}
 * - <span color=00ffff>{@link Blacktraffic.Worker.getCurrentStatus|getCurrentStatus}</span>() | {@link string}
 * - <span color=00ffff>{@link Blacktraffic.Worker.getCurrentTimeStatus|getCurrentTimeStatus}</span>() | { status: {@link string}, timestamp: {@link number} }
 * - <span color=00ffff>{@link Blacktraffic.Worker.getJobList|getJobList}</span>() | {@link Array}<{@link Object}>
 * - <span color=00ffff>{@link Blacktraffic.Worker.getLastSuccessfulJob|getLastSuccessfulJob}</span>() | {@link Date}
 * - <span color=00ffff>{@link Blacktraffic.Worker.getTab|getTab}</span>() | {@link Object}
 * - <span color=00ffff>{@link Blacktraffic.Worker.getTabID|getTabID}</span>() | {@link string}
 * - <span color=00ffff>{@link Blacktraffic.Worker.log|log}</span>(argn_arguments:{@link any})
 * - <span color=00ffff>{@link Blacktraffic.Worker.print|print}</span>(arg0_type:{@link string}, argn_arguments:{@link any})
 * - <span color=00ffff>{@link Blacktraffic.Worker.remove|remove}</span>()
 * - <span color=00ffff>{@link Blacktraffic.Worker.run|run}</span>()
 * - <span color=00ffff>{@link Blacktraffic.Worker.startInterval|startInterval}</span>()
 * - <span color=00ffff>{@link Blacktraffic.Worker.stopInterval|stopInterval}</span>()
 * - <span color=00ffff>{@link Blacktraffic.Worker.warn|warn}</span>(argn_arguments:{@link any})
 *   
 * ##### Static Fields:
 * - `.browser_obj`: {@link Blacktraffic.AgentBrowserPuppeteer}
 * - `.input_chrome_profile`: {@link string}
 * - `.saves_folder`: {@link string}
 * - `.workers_id_obj`: {@link Object}<{@link number}>
 * - `.workers_obj`: {@link Object}<{@link Array}<{@link Object}>>
 * 
 * @type {Blacktraffic.Worker}
 */
Blacktraffic.Worker = class {
	//[WIP] - Should be refactored in future to work with multiple browsers. Requires multiple copychecks and passes to ensure the contract is fulfilled.
	
	/**
	 * @type {Blacktraffic.AgentBrowserPuppeteer}
	 */
	static browser_obj;
	
	/**
	 * @type {string}
	 */
	static input_chrome_profile = Blacktraffic.getChromeDefaultProfilePath();
	
	/**
	 * [WIP] - Should probably really be set to a default like ./settings/Blacktraffic/workers.
	 * @type {string}
	 */
	static saves_folder = ve.registry.settings.Blacktraffic.worker_saves_folder;
	
	/**
	 * @type {{ "<worker_type_key>": number }}
	 */
	static workers_id_obj = {};
	
	/**
	 * @type {{ "<worker_type_key>": Object[] }}
	 */
	static workers_obj = {};
	
	constructor (arg0_type, arg1_options) {
		//Convert from parameters
		let type = arg0_type;
		let options = (arg1_options) ? arg1_options : {};
		
		//Initialise options
		if (options.console_persistence === undefined) options.console_persistence = false;
		if (options.do_not_close_tab === undefined) options.do_not_close_tab = false;
		options.interval = Math.returnSafeNumber(options.interval);
		options.log_channel = (options.log_channel) ? options.log_channel : `worker_${type}`;
		options.tags = (options.tags) ? options.tags : [];
		
		//Declare local instance variables
		this.config = (options.config_file_path && fs.existsSync(options.config_file_path)) ? 
			JSON5.parse(fs.readFileSync(options.config_file_path)) : {};
		this.is_enabled = true;
		this.options = options;
		this.static = Blacktraffic.Worker;
		this.type = type;
		
		this._interval_timer = null;
		this.current_job_status = "idle";
		this.jobs = []; //Internal job history
		
		//Append to workers_obj
		Object.modifyValue(this.static.workers_id_obj, type, 1); //Ensure unique ID
		
		if (!this.static.workers_obj[type]) this.static.workers_obj[type] = [];
			let worker_array = this.static.workers_obj[type];
			worker_array.push(this);
			this.worker_id = structuredClone(this.static.workers_id_obj[type]);
		this.name = `${type} ${this.worker_id}`;
		
		//Declare consoles
		/**
		 * @type {log.Channel}
		 * @memberof Blacktraffic.Worker
		 */
		this.console = (!log[options.log_channel]) ?
			new log.Channel(options.log_channel, { do_not_print: true }) : log[`${options.log_channel}_instance`];
		/**
		 * @type {log.Channel}
		 * @memberof Blacktraffic.Worker
		 */
		this.console_local = (!log[this.name]) ? 
			new log.Channel(this.name) : log[`${this.name}_instance`];
		
		//Start interval loop if provided
		if (this.options.interval > 0) this.startInterval();
	}
	
	/**
	 * Disables the current worker and aborts the task it is carrying out.
	 * - Method of: {@link Blacktraffic.Worker}
	 * 
	 * @alias disable
	 * @memberof Blacktraffic.Worker
	 * 
	 * @returns {Promise<void>}
	 */
	async disable () {
		//Declare local instance variables
		let current_tab = await this.getTab();
		this.is_enabled = false;
		this.stopInterval();
		
		//Close any currently open tasks
		if (current_tab) await current_tab.close();
		if (this.console) this.log(`${this.name} disabled.`);
	}
	
	/**
	 * Attempts execution of the current worker, used by child classes.
	 * - Method of: {@link Blacktraffic.Worker}
	 * 
	 * @alias execute
	 * @memberof Blacktraffic.Worker
	 */
	async execute () {
		this.warn(`execute() attempted, but an actual method was not bound to the child class.`);
		
		//Return statement
		return [];
	}
	
	/**
	 * Enables the current worker. Does not necessarily resume the task.
	 * - Method of: {@link Blacktraffic.Worker}
	 *
	 * @alias enable
	 * @memberof Blacktraffic.Worker
	 * 
	 * @returns {Promise<void>}
	 */
	async enable () {
		//Declare local instance variables
		this.is_enabled = true;
		if (this.options.interval > 0) this.startInterval();
		
		if (this.console) this.log(`${this.name} enabled.`);
	}
	
	/**
	 * Returns the current stored browser object.
	 * - Method of: {@link Blacktraffic.Worker}
	 *
	 * @alias getBrowser
	 * @memberof Blacktraffic.Worker
	 * 
	 * @returns {Promise<Blacktraffic.AgentBrowserPuppeteer>}
	 */
	async getBrowser () {
		//Ensure a browser context is accessible
		if (!this.static.browser_obj?.browser) 
			this.static.browser_obj = await new Promise((resolve) => {
				let browser = new Blacktraffic.AgentBrowserPuppeteer(undefined, {
					onload: () => resolve(browser),
					user_data_folder: this.static.input_chrome_profile
				});
			}); 
		this._browser = this.static.browser_obj;
		
		//Return statement
		return this._browser;
	}
	
	/**
	 * Returns the current status. Either 'done'/'failed'/'idle'/'partially_failed'/'running'/.
	 * - Method of: {@link Blacktraffic.Worker}
	 *
	 * @alias getCurrentStatus
	 * @memberof Blacktraffic.Worker
	 * 
	 * @returns {string}
	 */
	getCurrentStatus () { return this.current_job_status; }
	
	/**
	 * Returns the current status element and report.
	 * - Method of: {@link Blacktraffic.Worker}
	 *
	 * @alias getCurrentStatusElement
	 * @memberof Blacktraffic.Worker
	 * 
	 * @returns {HTMLSpanElement}
	 */
	getCurrentStatusElement () {
		//Declare local instance variables
		let last_job = this.jobs[this.jobs.length - 1];
		let status = this.getCurrentStatus();
		let status_el = document.createElement("span");
		
		//Set innerText and colour based off status
		if (status === "done") {
			status_el.innerText = "Done";
			status_el.style.color = "lime";
		} else if (status === "failed") {
			status_el.innerText = "Failed";
			status_el.style.color = "red";
		} else if (status === "idle") {
			status_el.innerText = "Idle";
			status_el.style.color = "lightgrey";
		} else if (status === "partially_failed") {
			status_el.innerText = "Partially Failed";
			status_el.style.color = "orange";
		} else if (status === "running") {
			let time_string = (last_job) ? new Date(last_job.timestamp).toLocaleTimeString() : ' ..'; //[WIP] - Add time elapsed later
			status_el.innerText = `Running (Time Elapsed) - Started [${time_string}]`;
			status_el.style.color = "cyan";
		}
		status_el.classList.add(`data-status-${status}`);
		
		//Return statement
		return status_el;
	}
	
	/**
	 * Returns the current time status. Either 'idle'/'running'/'done'.
	 * - Method of: {@link Blacktraffic.Worker}
	 *
	 * @alias getCurrentTimeStatus
	 * @memberof Blacktraffic.Worker
	 * 
	 * @returns {{status: string, timestamp: number}}
	 */
	getCurrentTimeStatus () {
		//Declare local instance variables
		let current_status;
			if (this.jobs.length === 0) {
				current_status = "idle";
			} else {
				current_status = (this.current_job_status === "running") ? "running" : "done";
			}
		let last_job = this.jobs[this.jobs.length - 1];
		
		//Return statement
		return {
			status: current_status,
			timestamp: (last_job) ? last_job.timestamp : Date.now()
		};
	}
	
	/**
	 * Returns the list of previous jobs carried out by the worker in-session.
	 * - Method of: {@link Blacktraffic.Worker}
	 *
	 * @alias getJobList
	 * @memberof Blacktraffic.Worker
	 * 
	 * @returns {Object[]}
	 */
	getJobList () { return this.jobs; }
	
	/**
	 * Returns the last successful job that was successfully completed.
	 * - Method of: {@link Blacktraffic.Worker}
	 *
	 * @alias getLastSuccessfulJob
	 * @memberof Blacktraffic.Worker
	 * 
	 * @returns {Date}
	 */
	getLastSuccessfulJob () {
		//Return statement
		for (let i = this.jobs.length - 1; i >= 0; i--)
			if (this.jobs[i].status === "done") return new Date(this.jobs[i].timestamp);
	}
	
	/**
	 * Returns the tab the Worker is currently executing tasks on.
	 * - Method of: {@link Blacktraffic.Worker}
	 *
	 * @alias getTab
	 * @memberof Blacktraffic.Worker
	 * 
	 * @returns {Promise<Object>}
	 */
	async getTab () {
		//Ensure a tab context is accessible
		if (!this._browser) await this.getBrowser();
		
		//Declare local instance variables
		let tab_id = this.getTabID();
		
		let current_tab = this._browser.getTab(tab_id);
		
		//Return statement
		if (!current_tab || (typeof current_tab.isClosed === "function" && current_tab.isClosed())) {
			if (current_tab) try { this._browser.closeTab(tab_id); } catch (e) {} //Cleanup stale reference
			return this._browser.openTab(this.getTabID());
		} else {
			//Return statement
			return current_tab;
		}
	}
	
	/**
	 * Returns the current tab ID.
	 * - Method of: {@link Blacktraffic.Worker}
	 *
	 * @alias getTabID
	 * @memberof Blacktraffic.Worker
	 * 
	 * @returns {string}
	 */
	getTabID () { return `${this.type}_${this.worker_id}`; }
	
	/**
	 * Prints an error to both logging channels.
	 * - Method of: {@link Blacktraffic.Worker}
	 * 
	 * @memberof Blacktraffic.Worker
	 * 
	 * @param argn_arguments
	 */
	error (...argn_arguments) { this.print("error", ...argn_arguments); }
	
	/**
	 * Prints a log to both logging channels.
	 * - Method of: {@link Blacktraffic.Worker}
	 *
	 * @memberof Blacktraffic.Worker
	 * 
	 * @param argn_arguments
	 */
	log (...argn_arguments) { this.print("log", ...argn_arguments); }
	
	/**
	 * Prints a message type to both logging channels.
	 * - Method of: {@link Blacktraffic.Worker}
	 *
	 * @memberof Blacktraffic.Worker
	 * 
	 * @param {string} arg0_type - Either 'error'/'log'/'warn'.
	 * @param argn_arguments
	 */
	print (arg0_type, ...argn_arguments) {
		//Convert from parameters
		let type = (arg0_type) ? arg0_type : "log";
		let local_arguments = argn_arguments;
		
		//Dual-channel logging
		this.console.print(type, local_arguments);
		this.console_local.print(type, local_arguments);
	}
	
	/**
	 * Removes the current worker.
	 * - Method of: {@link Blacktraffic.Worker}
	 *
	 * @memberof Blacktraffic.Worker
	 */
	remove () {
		//Declare local instance variables
		let worker_array = this.static.workers_obj[this.type];
		
		//Clear console_local as well
		if (worker_array) {
			let index = worker_array.indexOf(this);
			if (index > -1) worker_array.splice(index, 1);
		}
		this.console_local.remove();
	}
	
	/**
	 * Runs the current worker thread and executes its `.execute`() method.
	 * - Method of: {@link Blacktraffic.Worker}
	 *
	 * @alias run
	 * @memberof Blacktraffic.Worker
	 * 
	 * @returns {Promise<Ontology[]>}
	 */
	async run () {
		if (!this.is_enabled) return []; //Internal guard clause if disabled
		if (this.current_job_status === "running") {
			this.warn(`[${this.name}] Worker is already running. Are you sure your jobs are scheduled correctly? Aborting most recent request.`);
			return []; //Internal guard clause if already running
		}
		
		//Declare local instance variables
		let log_folder = path.join(this.static.saves_folder, "logs", this.type);
			if (!fs.existsSync(log_folder)) fs.mkdirSync(log_folder, { recursive: true });
		let start_time = Date.now();
		
		let log_file_name = `${this.name}_${start_time}.log`;
		let log_path = path.join(log_folder, log_file_name);
		
		this.current_job_status = "running";
		let job_obj = {
			log_file_path: log_path,
			status: "running",
			time_elapsed: 0,
			timestamp: start_time
		};
		
		//Initialise job; begin logging to console
		if (this.console_local && !this.options.console_persistence) this.console_local.clear();
		this.jobs.push(job_obj);
		this.log(`[${this.name}] Executing run() at ${new Date(start_time).toISOString()}.`);
		
		try {
			let ontologies = [];
			let tab_obj = await this.getTab();
			
			//Execute worker logic
			if (typeof this.execute === "function") {
				ontologies = await this.execute(tab_obj, this);
			} else if (Array.isArray(this.execute)) {
				ontologies = this.execute;
			}
			
			//Job is only successful if it returns Ontology[]
			if (!Array.isArray(ontologies)) {
				this.warn(`[${this.name}] Worker failed to return Ontology[], returned:`, ontologies);
				job_obj.status = "partially_failed";
				this.current_job_status = "partially_failed";
			} else {
				job_obj.status = "done";
				this.current_job_status = "done";
			}
			
			if (!this.options.do_not_close_tab) await tab_obj.close();
			
			//Return statement
			return ontologies;
		} catch (e) {
			this.error(`[${this.name}] Worker failed to execute properly:`, (e.stack || e));
			job_obj.status = "failed";
			this.current_job_status = "failed";
		} finally {
			job_obj.time_elapsed = Date.now() - start_time;
			this.log(`[${this.name}] Worker finished in ${job_obj.time_elapsed}ms`);
			
			try {
				this.console.save(log_path, { format: "plaintext" }); //Save the console in plaintext form
				this.console_local.save(log_path, { format: "plaintext" }); //Save the console in plaintext form
			} catch (e) {
				this.error(`[${this.name}] Failed to write worker log to ${log_path}:`, (e.stack || e));
			}
		}
	}
	
	/**
	 * Starts the interval timer for the worker.
	 * - Method of: {@link Blacktraffic.Worker}
	 * 
	 * @alias startInterval
	 * @memberof Blacktraffic.Worker
	 */
	startInterval () {
		//Clear interval first before starting a new one
		if (this._interval_timer) clearInterval(this._interval_timer);
		
		//Declare local instance variables
		let checkAndRun = async () => {
			if (!this.is_enabled || this.current_job_status === "running") return;
			
			let last_job = (this.jobs.length > 0) ? 
				this.jobs[this.jobs.length - 1] : undefined;
			let now = Date.now();
			
			//If never run before, or if time elapsed since last run > interval
			if (!last_job || now - last_job.timestamp >= this.options.interval*1000)
				await this.run();
		};
		
		//Run check first
		checkAndRun();
		this._interval_timer = setInterval(checkAndRun, 1000);
	}
	
	/**
	 * Stops the interval timer for the worker.
	 * - Method of: {@link Blacktraffic.Worker}
	 *
	 * @alias stopInterval
	 * @memberof Blacktraffic.Worker
	 */
	stopInterval () {
		//Clear interval
		if (this._interval_timer) {
			clearInterval(this._interval_timer);
			this._interval_timer = null;
		}
	}
	
	/**
	 * Logs a warning to both logging channels.
	 * - Method of: {@link Blacktraffic.Worker}
	 *
	 * @memberof Blacktraffic.Worker
	 * 
	 * @param argn_arguments
	 */
	warn (...argn_arguments) { this.print("warn", ...argn_arguments); }
};