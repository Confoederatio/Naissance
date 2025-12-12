global.stream_promises = require("stream/promises");

//Initialise functions
{
	/**
	 * Copies specific file paths in `arg0_file_paths` to `arg1_file_path`.
	 * - Method of: {@link ve.FileExplorer}
	 *
	 * @alias #copy
	 * @memberof ve.Component.ve.FileExplorer
	 * 
	 * @param {string[]} arg0_file_paths - The file paths to copy.
	 * @param {string} arg1_file_path - Where to copy the file paths to.
	 * @param {function} arg2_function - Callback function once the copy operation is finished.
	 */
	ve.FileExplorer.copy = function (arg0_file_paths, arg1_file_path, arg2_function) {
		//Convert from parameters
		let file_paths = arg0_file_paths;
		let file_path = arg1_file_path;
		let callback_function = arg2_function;
		
		//Declare local instance variables
		let currently_resolved = false;
		let dialog_window = new ve.Window({
			html: new ve.HTML([
				`<progress id = "files-progress" value = "0" max = "100"></progress><label for = "files-progress"></label>`,
				`<progress id = "file-progress" value = "0" max = "100"></progress><label for = "file-progress"></label>`,
				`<div id = "current-file"></div>`
			].join("<br>")),
			confirmation_prompt: new ve.RawInterface({
				//Limit: currently_resolved === false
				overwrite_button: new ve.Button((e) => {
					overwrite = true;
				}, { name: "Overwrite" }),
				skip_button: new ve.Button((e) => {
					skip = true;
				}, { name: "Skip" }),
				overwrite_all_button: new ve.Button((e) => {
					overwrite_all = true;
				}, { name: "Overwrite All" })
			}, { name: " ", limit: () => (currently_resolved === false), style: { display: "flex" } })
		}, { 
			attributes: { class: "file-explorer-modal" }, 
			name: loc("ve.registry.localisation.FileExplorer_copying_files_to", String.formatNumber(file_paths.length), file_path), 
			width: "24rem" 
		});
		let html_el = dialog_window.components_obj.html.element;
		let overwrite_all = false;
		let overwrite = false;
		let skip = false;
		
		function copyFileAtIndex (arg0_file_path) {
			//Convert from parameters
			let local_file_path = arg0_file_path;
			if (local_file_path === undefined) {
				if (callback_function !== undefined) callback_function(dialog_window);
				return;
			}
			
			//Declare local instance variables
			currently_resolved = false; //Call new check
			overwrite = false;
			skip = false;
			
			try {
				let file_index = file_paths.indexOf(local_file_path);
				let target_name = path.basename(local_file_path);
				let target_path =  fs.statSync(file_path).isDirectory() ?
					path.join(file_path, target_name) : file_path;
				
				//Update files-progress based on file_index
				let files_progress_bar_el = html_el.querySelector(`progress#files-progress`);
				let files_progress_label_el = html_el.querySelector(`label[for="files-progress"]`);
				
				files_progress_bar_el.value = ((file_index + 1) / file_paths.length)*100;
				files_progress_label_el.innerHTML = loc("ve.registry.FileExplorer_of_progress", String.formatNumber(file_index + 1), String.formatNumber(file_paths.length));
				
				//Polling check to make sure files meet conditions
				if (fs.existsSync(target_path) && overwrite_all === false) {
					let resolution_loop = setInterval(async () => {
						if (currently_resolved) return;
						
						//Listen for a resolution as often as possible
						if (overwrite || overwrite_all) {
							currently_resolved = true;
							fs.unlink(target_path, () => {
								copyFileWithProgress(local_file_path, target_path).then(() => {
									copyNextFile(file_index + 1);
								});
							})
						} else if (skip) {
							currently_resolved = true;
							copyNextFile(file_index + 1);
						}
						
						//KEEP AT BOTTOM! Resolves resolution_loop
						if (currently_resolved === true)
							clearInterval(resolution_loop);
					}, 100);
				} else {
					currently_resolved = true;
					copyFileWithProgress(local_file_path, target_path).then(() => {
						copyNextFile(file_index + 1);
					});
				}
			} catch (e) {
				let local_error_div = document.createElement("div");
					local_error_div.innerHTML = `<div class = "error">ERROR: ${e}</div>`;
				dialog_window.html.element.appendChild(local_error_div);
			}
			
			function copyNextFile (arg0_next_index) {
				//Convert from parameters
				let next_index = arg0_next_index;
				
				//Copy file at index
				setTimeout(() => copyFileAtIndex(file_paths[next_index]), 0);
			}
		}
		
		async function copyFileWithProgress (arg0_file_path, arg1_file_path) {
			//Convert from praameters
			let file_path = arg0_file_path;
			let ot_file_path = arg1_file_path;
			
			//Declare local instance variables
			let stats = fs.statSync(file_path);
			
			//Directory case handling
			if (stats.isDirectory()) { //[WIP] - Refactor later
				// Ensure destination directory exists
				if (!fs.existsSync(ot_file_path)) {
					await fs.promises.mkdir(ot_file_path, { recursive: true });
				}
				
				// Recursively copy subentries
				const entries = await fs.promises.readdir(file_path, { withFileTypes: true });
				for (const entry of entries) {
					const srcEntry = path.join(file_path, entry.name);
					const destEntry = path.join(ot_file_path, entry.name);
					await copyFileWithProgress(srcEntry, destEntry); // recursion
				}
				
				// When a folder finishes, render 100% for file progress bar (optional)
				renderFileProgress(1, 0);
				return;
			}
			
			//File case handling
			let copied_bytes = 0;
			let html_el = dialog_window.components_obj.html.element;
			let start_time = Date.now();
			let total_bytes = stats.size;
			
			let destination_stream = fs.createWriteStream(ot_file_path);
			let source_stream = fs.createReadStream(file_path);
			
			html_el.querySelector(`#current-file`).innerHTML = loc("ve.registry.localisation.FileExplorer_copying_to", file_path, ot_file_path);
			source_stream.on("data", (local_chunk) => {
				copied_bytes += local_chunk.length;
				
				let elapsed_time = (Date.now() - start_time)/1000;	
				let percent_progress = copied_bytes/total_bytes;
				let speed = copied_bytes/(elapsed_time || 1); //bytes_per_second
				
				let eta = (total_bytes - copied_bytes)/(speed || 1);
				renderFileProgress(percent_progress, eta);
			});
			await stream_promises.pipeline(source_stream, destination_stream).then(() => {
				renderFileProgress(1, 0);
			});
		}
		
		function renderFileProgress (arg0_percent_progress, arg1_eta_seconds) {
			//Convert from parameters
			let percent_progress = arg0_percent_progress;
			let eta_seconds = arg1_eta_seconds;
			
			//Declare local instance variables
			let file_progress_bar_el = html_el.querySelector(`progress#file-progress`);
			let file_progress_label_el = html_el.querySelector(`label[for="file-progress"]`);
			
			file_progress_bar_el.value = percent_progress*100;
			file_progress_label_el.innerHTML = (eta_seconds > 0) ? 
				loc("ve.registry.localisation.FileExplorer_eta_remaining", Math.round(file_progress_bar_el.value), String.formatDateLength(Math.ceil(eta_seconds))) :
				loc("ve.registry.localisation.FileExplorer_done");
		}
		
		//Begin copy process
		copyFileAtIndex(file_paths[0]);
	};
	
	/**
	 * Deletes selected file paths in `arg0_file_paths` recursively with error logging.
	 * - Method of: {@link ve.FileExplorer}
	 *
	 * @alias #delete
	 * @memberof ve.Component.ve.FileExplorer
	 * 
	 * @param {string[]} arg0_file_paths - The file paths to delete.
	 * @param {function} arg1_function - Callback function once the delete operation is finished.
	 */
	ve.FileExplorer.delete = function (arg0_file_paths, arg1_function) {
		// Convert parameters
		let file_paths = arg0_file_paths;
		let callback_function = arg1_function;
		
		// Create Window with simple progress UI
		let dialog_window = new ve.Window(
			{
				html: new ve.HTML(
					[
						`<progress id="files-progress" value="0" max="100"></progress><label for="files-progress"></label>`,
						`<progress id="file-progress" value="0" max="100"></progress><label for="file-progress"></label>`,
						`<div id="current-file"></div>`,
					].join("<br>")
				),
			},
			{ 
				attributes: { class: "file-explorer-modal" }, 
				name: loc("ve.registry.localisation.FileExplorer_deleting_files", String.formatNumber(file_paths.length)), 
				width: "24rem" 
			}
		);
		
		const html_el = dialog_window.components_obj.html.element;
		
		//
		// Begin deletion process
		//
		deleteFileAtIndex(file_paths[0]);
		
		// ---------------------------------------------------------
		// Helper: iterate through each file or folder sequentially
		// ---------------------------------------------------------
		function deleteFileAtIndex(arg0_file_path) {
			const local_file_path = arg0_file_path;
			if (local_file_path === undefined) {
				// All done
				if (callback_function !== undefined) callback_function(dialog_window);
				return;
			}
			
			try {
				const file_index = file_paths.indexOf(local_file_path);
				
				// Update overall progress
				const files_progress_bar_el = html_el.querySelector(`progress#files-progress`);
				const files_progress_label_el = html_el.querySelector(`label[for="files-progress"]`);
				files_progress_bar_el.value = ((file_index + 1) / file_paths.length) * 100;
				files_progress_label_el.innerHTML = loc("ve.registry.localisation.FileExplorer_of_progress", String.formatNumber(file_index + 1), String.formatNumber(file_paths.length));
				
				// Delete existing file/folder if present
				if (fs.existsSync(local_file_path)) {
					deleteWithProgress(local_file_path).then(() => {
						scheduleNextFile(file_index + 1);
					});
				} else {
					// File doesn't exist, skip to next
					scheduleNextFile(file_index + 1);
				}
			} catch (e) {
				let local_error_div = document.createElement("div");
					local_error_div.innerHTML = `<div class = "error">ERROR: ${e}</div>`;
				dialog_window.html.element.appendChild(local_error_div);
			}
			
			function scheduleNextFile(next_index) {
				setTimeout(() => deleteFileAtIndex(file_paths[next_index]), 0);
			}
		}
		
		// ---------------------------------------------------------
		// Helper: delete a file or folder, show per‑file progress
		// ---------------------------------------------------------
		async function deleteWithProgress(target_path) {
			html_el.querySelector(`#current-file`).innerHTML = loc("ve.registry.localisation.FileExplorer_deleting_path", target_path);
			
			let stats;
			try {
				stats = fs.statSync(target_path);
			} catch (err) {
				renderFileProgress(1, 0);
				return;
			}
			
			if (stats.isDirectory()) {
				// Recursively delete subentries
				const entries = await fs.promises.readdir(target_path, { withFileTypes: true });
				for (const entry of entries) {
					const subPath = path.join(target_path, entry.name);
					await deleteWithProgress(subPath);
				}
				
				// After contents removed, remove directory itself
				await fs.promises.rmdir(target_path);
				renderFileProgress(1, 0);
			} else {
				// File case
				renderFileProgress(0.5, 0.05);
				await fs.promises.unlink(target_path);
				renderFileProgress(1, 0);
			}
		}
		
		// ---------------------------------------------------------
		// Helper: render single file progress
		// ---------------------------------------------------------
		function renderFileProgress(percent_progress, eta_seconds) {
			const file_progress_bar_el = html_el.querySelector(`progress#file-progress`);
			const file_progress_label_el = html_el.querySelector(`label[for="file-progress"]`);
			
			file_progress_bar_el.value = percent_progress * 100;
			file_progress_label_el.innerHTML =
				eta_seconds > 0
					? loc("ve.registry.localisation.FileExplorer_eta_remaining", Math.round(file_progress_bar_el.value), String.formatDateLength(Math.ceil(eta_seconds)))  :
					loc("ve.registry.localisation.FileExplorer_done");
		}
	};
	
	/**
	 * Returns all the subpaths in the set of file/folder paths given.
	 * - Method of: {@link ve.FileExplorer}
	 *
	 * @alias #getFiles
	 * @memberof ve.Component.ve.FileExplorer
	 *
	 * @param {string[]} arg0_file_paths
	 *
	 * @returns {string[]}
	 */
	ve.FileExplorer.getFiles = function (arg0_file_paths) {
		//Convert from parameters
		let file_paths = arg0_file_paths;
		
		//Declare local instance variables
		let actual_paths = [];
		
		//Iterate over all file_paths
		for (let i = 0; i < file_paths.length; i++)
			if (fs.statSync(file_paths[i]).isDirectory()) {
				//Iterate over all_file_paths in local directory 
				let all_file_paths = fs.readdirSync(file_paths[i], { recursive: true });
				
				//Iterates over all_file_paths to recursively 
				for (let x = 0; x < all_file_paths.length; x++)
					actual_paths.push(path.join(file_paths[i], all_file_paths[x]));
			} else {
				actual_paths.push(file_paths[i]);
			}
		
		//Return statement
		return actual_paths;
	};
	
	/**
	 * Moves files from selected file paths in `arg0_file_paths` to `arg1_file_path`.
	 * - Method of: {@link ve.FileExplorer}
	 *
	 * @alias #move
	 * @memberof ve.Component.ve.FileExplorer
	 * 
	 * @param {string[]} arg0_file_paths - The file paths to move.
	 * @param {string} arg1_file_path - The folder path to move to.
	 * @param {function} arg2_function - Callback function once the move operation is finished.
	 */
	ve.FileExplorer.move = function (arg0_file_paths, arg1_file_path, arg2_function) {
		//Convert from parameters
		let file_paths = arg0_file_paths;
		let file_path = arg1_file_path;
		let callback_function = arg2_function;
		
		//Declare local instance variables
		let files_total = String.formatNumber(ve.FileExplorer.getFiles(file_paths).length);
		
		//1. Copy files into new folder first
		ve.FileExplorer.copy(file_paths, file_path, (local_modal) => {
			local_modal.remove();
			
			//2. Delete files afterwards
			ve.FileExplorer.delete(file_paths, (local_modal) => {
				local_modal.remove();
				
				let modal = new ve.Window(loc("ve.registry.localisation.FileExplorer_moved_files", files_total, file_path), { 
					name: loc("ve.registry.localisation.FileExplorer_finished_moving_files"), 
					width: "24rem" 
				});
				if (callback_function)
					callback_function(modal);
			});
		});
	};
	
	/**
	 * Creates a modal for renaming a specific file path in `arg0_file_path`.
	 * - Method of: {@link ve.FileExplorer}
	 *
	 * @alias #rename
	 * @memberof ve.Component.ve.FileExplorer
	 * 
	 * @param {string} arg0_file_path - The file path to rename.
	 * @param {function} arg1_function - Callback function after the rename operation is complete.
	 */
	ve.FileExplorer.rename = function (arg0_file_path, arg1_function) {
		//Convert from parameters
		let file_path = arg0_file_path;
		let callback_function = arg1_function;
		
		//Declare local instance variables
		let base_name = path.basename(file_path);
		let dir_name = path.dirname(file_path);
		let local_modal = new ve.Window({
			html: new ve.HTML(loc("ve.registry.localisation.FileExplorer_rename_file_to", base_name)),
			new_file_name: new ve.Text(base_name, { name: " " }),
			confirm_button: new ve.Button((e) => {
				try {
					let new_path = path.join(dir_name, local_modal.components_obj.new_file_name.v);
					fs.rename(file_path, new_path, () => {
						local_modal.remove();
						if (callback_function !== undefined)
							callback_function(local_modal);
					});
				} catch (e) {
					new ve.Toast(loc("ve.registry.localisation.FileExplorer_error_could_not_be_renamed", base_name, e));
				}
			})
		}, { name: loc("ve.registry.localisation.FileExplorer_rename_file"), width: "24rem" });
	};
}