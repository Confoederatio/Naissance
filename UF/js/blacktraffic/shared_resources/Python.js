//Initialise functions
{
	if (!global.Blacktraffic) global.Blacktraffic = {};
	
	/**
	 * Executes an `.ipynb` notebook with both an input and output file path to which the job output is written to.
	 * 
	 * @param {string} arg0_input_file_path
	 * @param {string} arg1_output_file_path
	 * 
	 * @returns {Promise<string>}
	 */
	Blacktraffic.Python_execNotebook = async function (arg0_input_file_path, arg1_output_file_path) {
		//Convert from parameters
		let input_file_path = arg0_input_file_path;
		let output_file_path = arg1_output_file_path;
		
		//Return statement
		return new Promise((resolve, reject) => {
			let stderr_data = "";
			let stdout_data = "";
			let python_process = child_process.spawn("jupyter", [
				"nbconvert", "--to", "notebook", "--execute", input_file_path, "--output", output_file_path,
				"--ExecutePreprocessor.timeout=-1"
			]);
			
			python_process.stderr.on("data", (data) => stderr_data += data.toString());
			python_process.stdout.on("data", (data) => stdout_data += data.toString());
			python_process.on("close", (code) => {
				if (code === 0) {
					resolve(path.resolve(output_file_path));
				} else {
					reject(new Error(`[Jupyter]: Notebook execution failed with code ${code}: ${stderr_data}`));
				}
			});
			python_process.on("error", (err) => reject(new Error(`Failed to start Jupyter process: ${err.message}`)));
		});
	};
	
	/**
	 * Executes an `.ipynb` notebook using Papermill to pass parameters.
	 * 
	 * @param {string} arg0_input_file_path
	 * @param {string} arg1_output_file_path
	 * @param {Object} arg2_parameters_obj
	 * @returns {Promise<string>}
	 */
	Blacktraffic.Python_execNotebookWithPapermill = async function (arg0_input_file_path, arg1_output_file_path, arg2_parameters_obj) {
		//Convert from parameters
		let input_file_path = arg0_input_file_path;
		let output_file_path = arg1_output_file_path;
		let parameters_obj = (arg2_parameters_obj) ? arg2_parameters_obj : {};
		
		//Return statement
		return new Promise((resolve, reject) => {
			let args = [
				input_file_path,
				output_file_path,
				"--json-params",
				JSON.stringify(parameters_obj),
				"--progress-bar", // Optional: cleaner logs
				"--log-output", // Redirects notebook cell output to stderr/stdout
			];
			let papermill = child_process.spawn("papermill", args);
			let stdout_data = "";
			let stderr_data = "";
			
			papermill.stdout.on("data", (data) => stdout_data += data.toString());
			papermill.stderr.on("data", (data) => stderr_data += data.toString());
			papermill.on("close", (code) => {
				if (code === 0) {
					console.log("Notebook execution successful.");
					resolve(path.resolve(output_file_path));
				} else {
					let err = new Error(`Papermill exited with code ${code}`);
						err.details = stderr_data;
					reject(err);
				}
			});
			papermill.on("error", (err) => {
				reject(new Error(`Failed to start Papermill: ${err.message}`));
			});
		});
	};
	
	/**
	 * Runs a `.py` file within the current Node.js process asynchronously.
	 * 
	 * @param {string} arg0_input_file_path
	 * @param argn_arguments
	 * 
	 * @returns {Promise<Object|string>}
	 */
	Blacktraffic.Python_run = async function (arg0_input_file_path, ...argn_arguments) {
		//Convert from parameters
		let input_file_path = arg0_input_file_path;
		let local_arguments = argn_arguments;
		
		//Return statement
		return new Promise((resolve, reject) => {
			let current_os = Blacktraffic.getOS();
			let python_prefix = (current_os === "win") ? "python" : "python3";
			let stderr_data = "";
			let stdout_data = "";
			
			let python_process = child_process.spawn(python_prefix, [input_file_path, ...local_arguments]);
			
			python_process.stdout.on("data", (data) => stdout_data += data.toString());
			python_process.stderr.on("data", (data) => stderr_data += data.toString());
			python_process.on("close", (code) => {
				if (code !== 0) return reject(new Error(`[Python]: Python script failed with code ${code}: ${stderr_data}`));
				
				try {
					//Attempt to parse output as JSON, fallback to raw string
					let result = JSON.parse(stdout_data);
					resolve(result);
				} catch (e) {
					resolve(stdout_data.trim());
				}
			});
			python_process.on("error", (err) => reject(new Error(`[Python]: Failed to start Python process: ${err.message}`)));
		});
	};
}