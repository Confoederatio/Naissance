//Initialise functions
{
	if (!global.Blacktraffic)
		/**
		 * The namespace for all UF/Blacktraffic utility functions, typically for static methods.
		 * 
		 * @namespace Blacktraffic
		 */
		global.Blacktraffic = {};
	
	/**
	 * Executes a shell command.
	 * 
	 * @param {string} arg0_command
	 * @param argn_arguments
	 * 
	 * @returns {{stderr: string, stdout: string}}
	 */
	Blacktraffic.execCommand = function (arg0_command, ...argn_arguments) {
		//Convert from parameters
		let command = arg0_command;
		let local_arguments = argn_arguments;
		
		//Declare local instance variables
		let exec_result = child_process.spawnSync(command, local_arguments, { encoding: "utf8" });
		let stderr = exec_result.stderr;
		let stdout = exec_result.stdout;
		
		//Return statement
		return { stderr: stderr, stdout: stdout };
	};
	
	/**
	 * Executes a shell command asynchronously.
	 * 
	 * @param {string} arg0_command
	 * @param argn_arguments
	 * 
	 * @returns {Promise<{stderr: string, stdout: string}>}
	 */
	Blacktraffic.execCommandAsync = async function (arg0_command, ...argn_arguments) {
		//Convert from parameters
		let command = arg0_command;
		let local_arguments = argn_arguments;
		
		//Return statement
		return new Promise((resolve, reject) => {
			let local_process = child_process.spawn(command, local_arguments);
			let stderr = "";
			let stdout = "";
			
			local_process.stdout.on("data", (data) => {
				data = data.toString();
				stdout += data;
			});
			local_process.stderr.on("data", (data) => {
				data = data.toString();
				stderr += data;
			});
			local_process.on("error", (e) => {
				reject(e);
			});
			local_process.on("exit", (code) => {
				if (code !== 0) {
					reject(`${command} ${local_arguments.join(" ")} exited with code ${code} and error: ${stderr}`);
				} else {
					resolve(stdout);
				}
			});
		});
	};
	
	/**
	 * Returns any available port that can be used by Puppeteer/Selenium agents, or for server work.
	 * 
	 * @returns {Promise<number>}
	 */
	Blacktraffic.getFreePort = async function () {
		//Return statement
		return new Promise((resolve, reject) => {
			let server = net.createServer();
				server.unref();
				server.on("error", reject);
				server.listen(0, () => {
					let port = server.address().port;
					server.close(() => resolve(port));
				});
		});
	};
	
	/**
	 * Returns the current operating system. Either 'lin'/'mac'/'win'.
	 *
	 * @returns {string}
	 */
	Blacktraffic.getOS = function () {
		//Declare local instance variables
		let process_platform = process.platform;
		
		//Return statement
		if (process_platform === "win32") return "win";
		if (["freebsd", "linux", "openbsd"].includes(process_platform)) return "lin";
		return "mac";
	};
	
	/**
	 * Waits a certain number of ms before continuing with the current process as a synchronous command.
	 * 
	 * @param {number} arg0_ms
	 * 
	 * @returns {Promise<unknown>}
	 */
	Blacktraffic.sleep = function (arg0_ms) {
		//Convert from parameters
		let ms = arg0_ms;
		
		//Return statement
		return new Promise(resolve => setTimeout(resolve, ms));
	};
}