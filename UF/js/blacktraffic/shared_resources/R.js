//Initialise functions
{
	if (!global.Blacktraffic) global.Blacktraffic = {};
	
	Blacktraffic.R_compile_error_string = `[R]: Compile Error: `;
	Blacktraffic.R_not_found_string = `[R]: Binary could not be found. See www.r-project.org for installation.`;
	
	/**
	 * Calls an R function located in an external script with parameters and returns the result.
	 * 
	 * @param {string} arg0_input_file_path
	 * @param {string} arg1_method_name
	 * @param {any[]} arg2_params
	 * @param {string|undefined} arg3_R_path
	 * 
	 * @returns {string}
	 */
	Blacktraffic.R_callMethod = function (arg0_input_file_path, arg1_method_name, arg2_params, arg3_R_path) {
		//Convert from parameters
		let input_file_path = arg0_input_file_path;
		let method_name = arg1_method_name;
		let params = arg2_params;
		let R_path = Blacktraffic.R_getBinaryPath(arg3_R_path);
		
		if (!method_name || !input_file_path || !params)
			throw new Error(`[R]: Please provide valid parameters - arg0_input_file_path, arg1_method_name, arg2_params cannot be null.`);
		
		//Declare local instance variables
		let method_syntax = Blacktraffic.R_convertMethodSyntaxToString(method_name, params);
		let output;
		
		output = Blacktraffic.R_execCommand(`source('${input_file_path}'); print(${method_syntax})`, R_path);
		
		//Return statement
		return output;
	};
	
	/**
	 * Calls an R function located in an external script with parameters and returns the result asynchronously.
	 * 
	 * @param {string} arg0_input_file_path
	 * @param {string} arg1_method_name
	 * @param {any[]} arg2_params
	 * @param {string|undefined} arg3_R_path
	 * 
	 * @returns {Promise<string>}
	 */
	Blacktraffic.R_callMethodAsync = function (arg0_input_file_path, arg1_method_name, arg2_params, arg3_R_path) {
		//Convert from parameters
		let input_file_path = arg0_input_file_path;
		let method_name = arg1_method_name;
		let params = arg2_params;
		let R_path = Blacktraffic.R_getBinaryPath(arg3_R_path);
		
		//Return statement
		return new Promise((resolve, reject) => {
			if (!method_name || !input_file_path || !params) 
				return reject(`[R]: Please provide valid parameters - arg0_input_file_path, arg1_method_name, arg2_params cannot be null.`);
			
			//Declare local instance variables
			let method_syntax = Blacktraffic.R_convertMethodSyntaxToString(method_name, params);
			
			Blacktraffic.R_execCommandAsync(`source('${input_file_path}'); print(${method_syntax})`, R_path).then((result) => {
				resolve(result);
			}).catch((err) => {
				reject(err);
			});
		});
	};
	
	/**
	 * Calls a standard R function with parameters and returns the result.
	 * 
	 * @param {string} arg0_method_name
	 * @param {any[]} arg1_params
	 * @param {string|undefined} arg2_R_path
	 * 
	 * @returns {string}
	 */
	Blacktraffic.R_callStandardMethod = function (arg0_method_name, arg1_params, arg2_R_path) {
		//Convert from parameters
		let method_name = arg0_method_name;
		let params = arg1_params;
		let R_path = Blacktraffic.R_getBinaryPath(arg2_R_path);
		
		//Internal guard clause for valid parameters
		if (!method_name || !params)
			throw new Error(`[R]: Please provide valid parameters - arg0_method_name, arg1_params cannot be null.`);
		
		//Declare local instance variables
		let method_syntax = Blacktraffic.R_convertMethodSyntaxToString(method_name, params);
		
		//Return statement
		return Blacktraffic.R_execCommand(`print(${method_syntax})`, R_path);
	};
	
	/**
	 * Converts a JS method syntax to a string. Internal helper function.
	 * 
	 * @param {string} arg0_method_name
	 * @param {any[]} arg1_params
	 * 
	 * @returns {string}
	 */
	Blacktraffic.R_convertMethodSyntaxToString = function (arg0_method_name, arg1_params) {
		//Convert from parameters
		let method_name = arg0_method_name;
		let params = arg1_params;
		
		//Declare local instance variables
		let method_syntax = `${method_name}(`;
		
		//Check if params is an array of parameters or an object
		if (Array.isArray(params)) {
			method_syntax += Blacktraffic.R_convertParamsArray(params);
		} else {
			for (let [local_key, local_value] of Object.entries(params))
				if (Array.isArray(local_value)) {
					method_syntax += `${local_key}=${Blacktraffic.R_convertParamsArray(local_value)}`;
				} else if (typeof local_value === "string") {
					method_syntax += `${local_key}='${local_value}',`; //String preserve quotes
				} else if (local_value === undefined) {
					method_syntax +=`${local_key}=NA,`;
				} else {
					method_syntax += `${local_key}=${local_value},`;
				}
		}
		
		method_syntax = method_syntax.slice(0, -1);
		method_syntax += ")";
		
		//Return statement
		return method_syntax;
	};
	
	/**
	 * Formats the parameters so that R can read them.
	 * 
	 * @param {any[]} arg0_params
	 * 
	 * @returns {string}
	 */
	Blacktraffic.R_convertParamsArray = function (arg0_params) {
		//Convert from parameters
		let params = arg0_params;
		
		//Declare local instance variables
		let method_syntax = "";
		
		//Convert method syntax to R
		if (Array.isArray(params)) {
			method_syntax += "c(";
			
			for (let i = 0; i < params.length; i++)
				method_syntax += Blacktraffic.R_convertParamsArray(params[i]);
			method_syntax = method_syntax.slice(0, -1);
			method_syntax += "),";
		} else if (typeof params === "string") {
			method_syntax += `'${params}',`;
		} else if (params === undefined) {
			method_syntax += `NA,`;
		} else {
			method_syntax += `${params},`;
		}
		
		//Return statement
		return method_syntax;
	};
	
	/**
	 * Executes a specific 1-line command for R.
	 * 
	 * @param {string} arg0_command
	 * @param {string|undefined} arg1_R_path
	 * 
	 * @returns {any[]}
	 */
	Blacktraffic.R_execCommand = function (arg0_command, arg1_R_path) {
		//Convert from parameters
		let command = arg0_command;
		let R_path = Blacktraffic.R_getBinaryPath(arg1_R_path);
		
		//Declare local instance variables
		let output;
		
		if (R_path) {
			let args = ["-e", command];
			let command_result = Blacktraffic.execCommand(R_path, ...args);
			
			if (command_result.stdout) {
				output = command_result.stdout;
				output = Blacktraffic.R_filterMultiline(output);
			} else {
				throw new Error(`${Blacktraffic.R_compile_error_string}${command_result.stderr}`);
			}
		} else {
			throw new Error(Blacktraffic.R_not_found_string);
		}
		
		//Return statement
		return output;
	};
	
	/**
	 * Executes a specific 1-line command for R asynchronously.
	 * 
	 * @param {string} arg0_command
	 * @param {string|undefined} arg1_R_path
	 * 
	 * @returns {Promise<any[]>}
	 */
	Blacktraffic.R_execCommandAsync = async function (arg0_command, arg1_R_path) {
		//Convert from parameters
		let command = arg0_command;
		let R_path = Blacktraffic.R_getBinaryPath(arg1_R_path);
		
		//Return statement
		return new Promise((resolve, reject) => {
			if (R_path) {
				let args = ["-e", command];
				
				Blacktraffic.execCommandAsync(R_path, ...args).then((output) => {
					output = Blacktraffic.R_filterMultiline(output);
					resolve(output);
				}).catch((stderr) => {
					reject(`${Blacktraffic.R_compile_error_string}${stderr}`);
				});
			} else {
				reject(Blacktraffic.R_not_found_string);
			}
		});
	};
	
	/**
	 * Executes all the commands in a file specified by the given `arg0_input_file_path`.
	 * 
	 * **Note.** The function reads only variables printed to stdout by the cat() or print() function. It is recommended to use the print() function instead of cat() to avoid line break issues. If you use cat(), remember to add the newline character `"\n"` at the end of each cat: for example, `cat("...\n")`. 
	 * 
	 * @param {string} arg0_input_file_path
	 * @param {string|undefined} arg1_R_path
	 * 
	 * @returns {any[]}
	 */
	Blacktraffic.R_execScript = function (arg0_input_file_path, arg1_R_path) {
		//Convert from parameters
		let input_file_path = arg0_input_file_path;
		let R_path = Blacktraffic.R_getBinaryPath(arg1_R_path);
		
		//Declare local instance variables
		let output;
		
		if (!fs.existsSync(input_file_path))
			throw new Error(`[R]: The file ${input_file_path} could not be found.`); //Internal guard clause if no file found
		
		if (R_path) {
			let command_result = Blacktraffic.execCommand(R_path, input_file_path);
			
			if (command_result.stdout) {
				output = command_result.stdout;
				output = Blacktraffic.R_filterMultiline(output);
			} else {
				throw new Error(`${Blacktraffic.R_compile_error_string}${command_result.stderr}`);
			}
		} else {
			throw new Error(Blacktraffic.R_not_found_string);
		}
		
		//Return statement
		return output;
	};
	
	/**
	 * Filters the multiline output from {@link Blacktraffic.R_execCommand} and {@link Blacktraffic.R_execScript} functions using RegEx and cast filtering.
	 * 
	 * @param {string} arg0_command_result
	 * 
	 * @returns {any[]}
	 */
	Blacktraffic.R_filterMultiline = function (arg0_command_result) {
		//Convert from parameters
		let command_result = arg0_command_result;
		
		//Declare local instance variables
		let data;
		
		//Command result parsing based off Windows or Linux/MacOS
		command_result = command_result.replace(/\[\d+\] /g, "").trim();
		
		//Check if data is JSON parseable
		try {
			data = [JSON.parse(command_result)];
		} catch (e) {
			//The result if not JSON parseable > split
			data = command_result.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
			
			//Find undefined or NaN and remove quotes
			for (let i = 0; i < data.length; i++)
				if (data[i] === "NA") {
					data[i] = undefined;
				} else if (data[i] === "NaN") {
					data[i] = NaN;
				} else if (!isNaN(parseFloat(data[i]))) {
					data[i] = parseFloat(data[i]);
				} else {
					data[i] = data[i].replace(/\"/g, "");
				}
		}
		
		//Return statement
		return data;
	};
	
	/**
	 * Check if Rscript(R) is installed od the system and returns the path where the binary is installed. Returns the file path of the given installation.
	 *
	 * @param {string} arg0_R_path Alternative path to use as binaries directory.
	 *
	 * @returns {string}
	 */
	Blacktraffic.R_getBinaryPath = function (arg0_R_path) {
		//Convert from parameters
		let R_path = arg0_R_path;
		
		//Internal guard clause if R_path is already defined
		if (typeof R_path === "string")
			if (fs.existsSync(R_path) && !fs.lstatSync(R_path).isDirectory()) return R_path;
		if (!fs.existsSync(R_path)) R_path = undefined; //Internal guard clause for undefined R paths if provided as being malformed
		
		//Declare local instance variables
		let current_os = Blacktraffic.getOS();
		let installation_dir;
		
		if (current_os === "win") {
			if (!R_path) R_path = path.join("C:\\Program Files\\R");
			
			if (fs.existsSync(R_path)) {
				//R is installed, find the path dependent on its version
				let dir_content = fs.readdirSync(R_path);
				if (dir_content.length !== 0) {
					let last_version = dir_content[dir_content.length - 1];
					installation_dir = path.join(R_path, last_version, "bin", "Rscript.exe");
				}
			}
		} else if (["lin", "mac"].includes(current_os)) {
			if (!R_path) {
				//The command which is used to find the Rscript installation directory
				R_path = Blacktraffic.execCommand("which", "Rscript").stdout;
				if (R_path)
					installation_dir = R_path.trim().replace("\n", "");
			} else {
				R_path = path.join(R_path, "Rscript");
				if (fs.existsSync(R_path))
					installation_dir = R_path;
			}
		}
		
		//Return statement
		return installation_dir;
	};
}