/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 * 
 * Basic file input that can also accept folders. Note that if you need a file explorer, you should refer to {@link ve.FileExplorer}, though this component uses its subtype.
 * - Functional binding: <span color=00ffff>veFile</span>().
 * 
 * ##### Constructor:
 * - `arg0_value`: {@link string} - The current file path, if any.
 * - `arg1_options`: {@link Object}
 *   - `.do_not_display=false`: {@link boolean} - Whether to display the file name to the left of the select file prompt
 *   - `.is_folder=false`: {@link boolean} - Whether the input is asking for a folder.
 *   - `.multifile=false`: {@link boolean} - Whether the input can accept multiple files/folders.
 *   - `.save_function`: {@link function} - If set, the current component will be a save prompt.
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
		this.value = (value) ? value : [];
		
		this.interface = new ve.RawInterface({
			select_file_text: new ve.HTML(() => {
				//Return statement
				if (!this.options.do_not_display) {
					if (this.v.length === 0) {
						return "None";
					} else if (this.v.length === 1) {
						return `${this.v[0]}`;
					} else {
						return `${this.v[0]} and ${String.formatNumber(this.v.length - 1)} other(s)`;
					}
				} else {
					return "";
				}
			}, {
				style: { padding: 0 }
			}),
			select_file_button: new veButton(() => {
				if (this.file_explorer_modal) this.file_explorer_modal.close();
				
				let window_name = "Open File";
					if (this.options.multifile && !this.options.is_folder) {
						window_name = "Open Files";
					} else if (this.options.multifile && this.options.is_folder) {
						window_name = "Open Folders";
					} else if (this.options.is_folder) {
						window_name = "Open Folder";
					}
					if (this.options.save_function)
						window_name = "Save File";
				
				this.file_explorer_modal = new ve.Window({
					file_explorer: new ve.FileExplorer(__dirname, { 
						name: " ",
						style: {
							width: "24rem"
						}
					}),
					actions_bar: new ve.RawInterface({
						save_name: new ve.Text("", {
							attributes: { placeholder: "Save file as ..." },
							limit: () => this.options.save_function
						}),
						confirm_button: new ve.Button(() => {
							if (!this.options.save_function) {
								let selected_paths = this.file_explorer_modal.file_explorer.selected;
								
								//Internal guard clauses - Error handling
								{
									if (selected_paths.length === 0) {
										veToast(`<icon>warning</icon> You must select a valid file/folder path.`);
										return;
									}
									if (!this.options.multifile && selected_paths.length > 1) {
										veToast(`<icon>warning</icon> You can only select 1 file/folder path.`);
										return;
									}
									if (this.options.is_folder) {
										let has_file = false;
										
										//Iterate over all files to ensure validity
										for (let i = 0; i < selected_paths.length; i++)
											if (!fs.statSync(selected_paths[i]).isDirectory()) {
												has_file = true;
												
												veToast(`<icon>warning</icon> You can only select folders.`);
												return;
											}
									} else {
										let has_folder = false;
										
										//Iterate over all files to ensure validity
										for (let i = 0; i < selected_paths.length; i++)
											if (fs.statSync(selected_paths[i]).isDirectory()) {
												has_folder = true;
												
												veToast(`<icon>warning</icon> You can only select files.`);
												return;
											}
									}
								}
								
								//Set selected paths
								this.v = selected_paths;
								this.fireToBinding();
								veToast(`Selected ${String.formatNumber(selected_paths.length)} file(s).`);
								this.file_explorer_modal.close();
							} else {
								let save_name = this.file_explorer_modal.actions_bar.save_name.v;
								
								//Internal guard clauses - Error handling
								{
									if (save_name.length === 0) {
										veToast(`<icon>warning</icon> Save files must have a name.`);
										return;
									}
								}
								
								//Execute save function to directory name
								let full_save_path = path.join(this.file_explorer_modal.file_explorer.v, save_name);
								
								try {
									let save_data = this.options.save_function();
									
									if (typeof save_data === "object") {
										save_data = JSON.styringify(save_data);
									} else {
										save_data = save_data.toString();
									}
									
									//Check if file already exists, if so send a confirmation prompt
									let save_function = () => {
										fs.writeFile(full_save_path, save_data, () => {
											veToast(`Successfully saved file in: ${full_save_path}`);
											this.file_explorer_modal.close();
										})
										this.v = [full_save_path];
										this.fireToBinding();
									};
									
									(!fs.existsSync(full_save_path)) ?
										save_function() :
										veConfirm(`File already exists. Do you want to overwrite it?`, {
											special_function: () => save_function()
										});
								} catch (e) {
									console.error(e);
									veWindow(`<span style = "align-items: center; display: flex"><icon>warning</icon><span style = "margin-left: var(--padding)">Error saving file: ${e}</span></span>`, { can_rename: false, name: "Error Saving File", width: "20rem" });
								}
							}
						}, { name: "Confirm" }),
						cancel_button: new ve.Button(() => this.file_explorer_modal.close(), { name: "Cancel" })
					}, {
						can_rename: false,
						name: " ",
						style: {
							alignItems: "center",
							display: "flex"
						}
					})
				}, { 
					can_rename: false, 
					name: window_name, 
					resizeable: false, 
					width: "26rem" 
				});
			}, {
				name: (this.options.name) ? this.options.name : "Select File",
				style: {
					marginLeft: (!this.options.do_not_display) ? `calc(var(--cell-padding))` : 0,
					whiteSpace: "nowrap"
				}
			})
		}, { 
			name: " ",
			style: {
				alignItems: "center",
				display: "flex",
				padding: 0
			}
		});
		this.interface.bind(this.element);
		
		this.v = this.value;
	}
	
	/**
	 * Returns the current file path pointed to by the component.
	 * - Accessor of: {@link ve.File}
	 * 
	 * @returns {string}
	 */
	get v () {
		//Return statement
		return this.value;
	}
	
	/**
	 * Sets the current file path pointed to by the component.
	 * - Accessor of {@link ve.File}
	 * 
	 * @param {string[]} arg0_value
	 */
	set v (arg0_value) {
		//Convert from parameters
		let value = Array.toArray(arg0_value);
		
		//Declare local instance variables
		this.value = value;
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