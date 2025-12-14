/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 * 
 * File explorer used either for navigation (i.e. saving/loading) or as a generic file explorer primitive.
 * - Functional binding: <span color=00ffff>veFileExplorer</span>().
 * 
 * ##### Constructor:
 * - `arg0_value`: {@link string} - The file path in which the FileExplorer should be initialised.
 * - `arg1_options`: {@link Object}
 *   - `.file_components_obj={select: ...}`: {@link Object}<{@link ve.Component}>
 *   - `.file_icon="<icon>description</icon>"`: {@link string}
 *   - `.file_options`: {@link Object}
 *   - `.folder_components_obj={select: ...}`: {@link Object}<{@link ve.Component}>
 *   - `.folder_icon="<icon>folder</icon>"`: {@link string}
 *   - `.folder_options`: {@link Object}
 *   - `.name`: {@link string}
 *   - `.navigation_only=false`: {@link boolean}
 *   - 
 *   - `.load_function`: {@link function}(arg0_data:{@link string}, arg1_file_path:{@link string}) - Automatically loads the text content of a valid extension into this function.
 *   - `.save_extension`: {@link Array}<{@link string}>|{@link string} - The save dot extension that files can be loaded from. `.*` refers to all file extensions.
 *   - `.save_function`: {@link function} - Returns the value of the current savedata state.
 *   
 * ##### Instance:
 * - `.clipboard`: {@link Array}<{@link string}> - The list of full file paths currently stored in the clipboard.
 * - `.selected`: {@link Array}<{@link string}> - The list of selected file paths.
 * - `.v`: {@link string} - Accessor. The current file path.
 * 
 * ##### Methods:
 * - <span color=00ffff>{@link ve.FileExplorer.clearClipboard|clearClipboard}</span>()
 * - <span color=00ffff>{@link ve.FileExplorer.deselect|deselect}</span>(arg0_file_path:{@link string}, arg1_options:{do_not_modify_classes: {@link boolean}}) | {@link Array}<{@link string}>
 * - <span color=00ffff>{@link ve.FileExplorer.deselectAll|deselectAll}</span>()
 * - <span color=00ffff>{@link ve.FileExplorer.fireSelectToggle|fireSelectToggle}(v:{@link boolean}, e:{@link ve.Toggle}) - Internal handler for toggling file/folder selection.
 * - <span color=00ffff>{@link ve.FileExplorer.select|select}</span>(arg0_file_path:{@link string}) | {@link Array}<{@link string}>
 * - <span color=00ffff>{@link ve.FileExplorer.selectAll|selectAll}</span>()
 * - <span color=00ffff>{@link ve.FileExplorer.setClipboard|setClipboard}</span>() - Sets the clipboard to currently selected file paths.
 * - <span color=00ffff>{@link ve.FileExplorer.refresh|refresh}</span>() - Refreshes the current ve.FileExplorer display. Handled automatically.
 * - 
 * - <span color=00ffff>{@link ve.FileExplorer.getFiles|getFiles}</span>(arg0_file_paths:{@link Array}<{@link string}>) | {@link Array}<{@link string}> - Returns all the subpaths in the set of file/folder paths given.
 * - <span color=00ffff>{@link ve.FileExplorer.copy|copy}</span>(arg0_file_paths:{@link Array}<{@link string}>, arg1_file_path:{@link string}, arg2_function:{@link function}) - Opens a copy files modal with a callback function.
 * - <span color=00ffff>{@link ve.FileExplorer.delete|delete}</span>(arg0_file_paths:{@link Array}<{@link string}>, arg1_file_path:{@link string}, arg2_function:{@link function}) - Opens a delete files modal with a callback function.
 * - <span color=00ffff>{@link ve.FileExplorer.move|move}</span>(arg0_file_paths:{@link Array}<{@link string}>, arg1_file_path:{@link string}, arg2_function:{@link function}) - Opens a move files modal with a callback function.
 * - <span color=00ffff>{@link ve.FileExplorer.rename|rename}</span>(arg0_file_path:{@link string}, arg1_function:{@link function}) - Opens a rename file modal with a callback function.
 *
 * @augments ve.Component
 * @memberof ve.Component
 * @type {ve.FileExplorer}
 */
ve.FileExplorer = class extends ve.Component {
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = (arg0_value) ? arg0_value : process.cwd();
		let options = (arg1_options) ? arg1_options : {};
			super(options);
			
		//Initialise options
		options.attributes = (options.attributes) ? options.attributes : {};
		options.file_components_obj = (options.file_components_obj) ? options.file_components_obj : {
			select: new ve.Toggle(false, {
				off_name: `<icon>check_box_outline_blank</icon>`,
				on_name: `<icon>check_box</icon>`,
				onchange: (v, e) => this.fireSelectToggle(v, e),
				tooltip: loc("ve.registry.localisation.FileExplorer_select"),
				
				style: {
					zIndex: 99
				},
			})
		};
		options.file_icon = (options.file_icon) ? options.file_icon : "<icon>description</icon>";
		options.file_options = (options.file_options) ? options.file_options : {};
		options.folder_components_obj = (options.folder_components_obj) ? options.folder_components_obj : {
			select: new ve.Toggle(false, {
				off_name: `<icon>check_box_outline_blank</icon>`,
				on_name: `<icon>indeterminate_check_box</icon>`,
				onchange: (v, e) => this.fireSelectToggle(v, e),
				tooltip: loc("ve.registry.localisation.FileExplorer_select"),
				
				style: {
					zIndex: 99
				},
			})
		};
		options.folder_icon = (options.folder_icon) ? options.folder_icon : "<icon>folder</icon>";
		options.folder_options = (options.folder_options) ? options.folder_options : {};
		options.name = (options.name) ? options.name : "";
		if (options.save_extension) 
			options.save_extension = Array.toArray(options.save_extension);
		
		//options.navigation_only override
		if (options.navigation_only)
			options = {
				...options,
				disable_actions: true,
				file_components_obj: {},
				folder_components_obj: {},
				onload: (e) => e.name = ""
			};
		
		//Declare local instance variables
		this.element = document.createElement("div");
			this.element.setAttribute("component", "ve-file-explorer");
			Object.iterate(options.attributes, (local_key, local_value) => {
				this.element.setAttribute(local_key, local_value.toString());
			});
			this.element.instance = this;
			
		//Format html_string
		let html_string = [];
		
		html_string.push(`<span id = "name"></span>`);
		html_string.push(`<div id = "file-explorer-body"></div>`);
		this.element.innerHTML = html_string.join("");
		
		/**
		 * Contains all file paths currently in the clipboard.
		 * - Field of: {@link ve.FileExplorer}
		 * @type {string[]}
		 */
		this.clipboard = []; //Array<String> containing file paths currently in clipboard
		
		/**
		 * Contains all currently selected file paths.
		 * - Field of: {@link ve.FileExplorer}
		 * @type {string[]}
		 */
		this.selected = []; //Array<String> containing file paths that are currently selected
		
		//Refresh file explorer display
		this.options = options;
		this.name = this.options.name;
		this.value = value;
		this.refresh();
	}
	
	/**
	 * Returns the present file path.
	 * - Accessor of {@link ve.FileExplorer} 
	 * 
	 * @alias v
	 * @memberof ve.Component.ve.FileExplorer
	 * @type {string}
	 */
	get v () {
		//Return statement
		return this.value;
	}
	
	/**
	 * Sets the present file path.
	 * - Accessor of {@link ve.FileExplorer}
	 * 
	 * @alias v
	 * @memberof ve.Component.ve.FileExplorer
	 * @param arg0_value {string}
	 */
	set v (arg0_value) {
		//Convert from parameters
		let value = arg0_value;
		
		//Set new folder path before refreshing display
		this.deselectAll();
		this.value = value;
		this.refresh();
		this.fireFromBinding();
	}
	
	/**
	 * Clears the present keyboard.
	 * - Method of {@link ve.FileExplorer}
	 * 
	 * @alias clearClipboard
	 * @memberof ve.Component.ve.FileExplorer
	 */
	clearClipboard () {
		this.clipboard = [];
	}
	
	/**
	 * Deselects a specific file path and removes it from {@link this.selected}.
	 * - Method of {@link ve.FileExplorer}
	 * 
	 * @alias deselect
	 * @memberof ve.Component.ve.FileExplorer
	 * 
	 * @param {string} arg0_file_path
	 * @param {Object} [arg1_options]
	 *  @param {boolean} [arg1_options.do_not_modify_classes=false]
	 * 
	 * @returns string[]
	 */
	deselect (arg0_file_path, arg1_options) {
		//Convert from parameters
		let file_path = arg0_file_path;
		let options = (arg1_options) ? arg1_options : {};
		
		//Iterate over all this.selected and splice
		for (let i = 0; i < this.selected.length; i++)
			if (this.selected[i] === file_path) {
				//Try to find the element in question and remove .selected
				if (!options.do_not_modify_classes)
					Object.iterate(this.hierarchy.components_obj, (local_key, local_value) => {
						if (local_key === file_path)
							local_value.element.classList.remove("selected");
					});
				this.selected.splice(i, 1);
			}
		
		//Return statement
		return this.selected;
	}
	
	/**
	 * Deselects all file paths, clearing {@link this.selected}.
	 * - Method of {@link ve.FileExplorer}
	 *
	 * @alias deselectAll
	 * @memberof ve.Component.ve.FileExplorer
	 */
	deselectAll () {
		//Iterate over all this.selected and deselect them
		for (let i = this.selected.length - 1; i >= 0; i--)
			this.deselect(this.selected[i], { do_not_modify_classes: true });
		//Iterate over all this.hierarchy.components_obj and update their classes to be deselected
		Object.iterate(this.hierarchy.components_obj, (local_key, local_value) => {
			local_value.element.classList.remove("selected");
		});
	}
	
	/**
	 * Fires a select toggle element for the full path.
	 * - Method of: {@link ve.FileExplorer}
	 *
	 * @alias fireSelectToggle
	 * @memberof ve.Component.ve.FileExplorer
	 * 
	 * @param {string} v
	 * @param {ve.FileExplorer} e
	 */
	fireSelectToggle (v, e) {
		if (e.owners)
			for (let i = e.owners.length - 1; i >= 0; i--)
				if (e.owners[i] instanceof ve.HierarchyDatatype) try {
					let full_path = e.owners[i].element.getAttribute("data-path");
					(v) ? this.select(full_path) : this.deselect(full_path);
					break;
				} catch (e) { console.error(e); }
	}
	
	/**
	 * Refreshes the current file explorer path, rerendering the display for folders and files within the Component.
	 * - Method of: {@link ve.FileExplorer}
	 *
	 * @alias refresh
	 * @memberof ve.Component.ve.FileExplorer
	 */
	refresh () {
		//Declare local instance variables
		let all_files_in_directory = fs.readdirSync(this.value, { withFileTypes: true });
		let hierarchy_obj = {};
		
		//Add item button to move up one folder at the top
		let previous_folder_path = path.join(this.value, "..");
		
		hierarchy_obj.file_path = new ve.HierarchyDatatype({
			information: new ve.HTML(() => this.v)
		}, { disabled: true });
		if (!this.options.disable_actions)
			hierarchy_obj.selection = new ve.HierarchyDatatype({
				information: new ve.HTML((e) => `${(this.clipboard.length > 0) ? `${loc("ve.registry.localisation.FileExplorer_clipboard")} (${String.formatNumber(this.clipboard.length)})` : loc("ve.registry.localisation.FileExplorer_clipboard_is_empty")} &nbsp; | &nbsp; ${(this.selected.length > 0) ? `${loc("ve.registry.localisation.FileExplorer_elements_selected", String.formatNumber(this.selected.length))}` : ""}
				`, { style: { marginRight: "auto", padding: 0 }}), //[WIP] - Fix localisation
				actions_menu: new ve.RawInterface({
					copy_button: new ve.Button((e) => {
						if (this.selected.length === 0) return; //Internal guard clause if nothing is selected
						this.setClipboard();
						new ve.Toast(loc("ve.registry.localisation.FileExplorer_copied_elements_to_clipboard", String.formatNumber(this.clipboard.length)));
					}, { name: "<icon>copy</icon>", limit: () => this.selected.length, tooltip: loc("ve.registry.localisation.FileExplorer_copy_selected") }),
					cut_button: new ve.Button((e) => {
						//This has to use a new file explorer in a modal with .options.disable_actions=true, since it would be fatal otherwise
						if (this.selected.length === 0) return; //Internal guard clause if nothing is selected
						
						//Declare local instance variables
						let modal = new ve.Modal({
							file_explorer: new ve.FileExplorer(this.v, { navigation_only: true }),
							confirm_button: new ve.Button((e) => {
								modal.close();
								ve.FileExplorer.move(this.selected, modal.components_obj.file_explorer.v, () => {
									this.refresh();
									this.deselectAll();
								});
							}, { name: loc("ve.registry.localisation.FileExplorer_confirm") })
						}, { 
							name: loc("ve.registry.localisation.FileExplorer_cut_paste_files", String.formatNumber(this.selected.length)),
							draggable: true, 
							resizeable: true, 
							width: "24rem" 
						});
					}, { name: "<icon>cut</icon>", limit: () => this.selected.length, tooltip: "Cut Selected" }),
					paste_button: new ve.Button((e) => {
						let confirm = new ve.Confirm(loc("ve.registry.localisation.FileExplorer_are_you_sure_copy_paste", String.formatNumber(this.clipboard.length), this.v), {
							name: loc("ve.registry.localisation.FileExplorer_paste_files", String.formatNumber(this.clipboard.length)),
							special_function: () => {
								confirm.close();
								ve.FileExplorer.copy(this.clipboard, this.v, () => this.refresh());
							}
						});
					}, { name: "<icon>paste</icon>", limit: () => this.clipboard.length, tooltip: loc("ve.registry.localisation.FileExplorer_paste_clipboard") }),
					
					//clear_clipboard
					clear_clipboard: new ve.Button((e) => {
						this.clipboard = [];
					}, { name: "<icon>content_paste_off</icon>", limit: () => this.clipboard.length, tooltip: loc("ve.registry.localisation.FileExplorer_clear_clipboard") }),
					
					//move_button, delete_button
					move_button: new ve.Button((e) => {
						let modal = new ve.Modal({
							file_explorer: new ve.FileExplorer(this.v, { navigation_only: true }),
							confirm_button: new ve.Button((e) => {
								modal.close();
								ve.FileExplorer.move(this.selected, modal.components_obj.file_explorer.v, () => {
									this.refresh();
									this.deselectAll();
								});
							}, { name: loc("ve.registry.localisation.FileExplorer_confirm") })
						}, { 
							name: loc("ve.registry.localisation.FileExplorer_move_files", String.formatNumber(this.selected.length)),
							draggable: true, 
							resizeable: true, 
							width: "24rem"
						});
					}, { name: "<icon>arrow_forward</icon>", limit: () => this.selected.length, tooltip: "Move Selected" }),
					delete_button: new ve.Button((e) => {
						let confirm = new ve.Confirm(loc("ve.registry.localisation.FileExplorer_are_you_sure_delete", this.selected.join(", ")), {
							name: loc("ve.registry.localisation.FileExplorer_delete_files", String.formatNumber(this.selected.length)),
							special_function: () => {
								confirm.close();
								ve.FileExplorer.delete(this.selected, () => this.refresh());
							}
						});
					}, { name: "<icon>delete</icon>", limit: () => this.selected.length, tooltip: "Delete Selected" }),
					
					new_folder_button: new ve.Button((e) => {
						let local_modal = new ve.Window({
							html: new ve.HTML(loc("ve.registry.localisation.FileExplorer_create_a_new_folder")),
							new_folder_name: new ve.Text("",  { name: " " }),
							confirm_button: new ve.Button((e) => {
								let new_folder_path = path.join(this.v, local_modal.components_obj.new_folder_name.v);
								
								if (local_modal.components_obj.new_folder_name.v.length > 0) {
									fs.mkdirSync(new_folder_path, { recursive: true });
									this.refresh();
								} else {
									new ve.Toast(loc("ve.registry.localisation.FileExplorer_cannot_create_unnamed_folder"));
								}
							})
						}, { can_rename: false, name: loc("ve.registry.localisation.FileExplorer_create_new_folder") })
					}, { name: "<icon>create_new_folder</icon>", tooltip: loc("ve.registry.localisation.FileExplorer_create_new_folder") }),
					new_file_button: new ve.Button((e) => {
						let local_modal = new ve.Window({
							html: new ve.HTML(loc("ve.registry.localisation.FileExplorer_create_a_new_file")),
							new_file_name: new ve.Text("", { name: " " }),
							confirm_button: new ve.Button((e) => {
								let new_file_path = path.join(this.v, local_modal.components_obj.new_file_name.v);
								
								if (!fs.existsSync()) {
									fs.closeSync(fs.openSync(new_file_path, "w"));
									this.refresh();
									new ve.Toast(loc("ve.registry.localisation.FileExplorer_created_empty_text_file", new_file_path));
								} else {
									new ve.Toast(loc("ve.registry.localisation.FileExplorer_specified_file_path_already_exists"));
								}
							})
						}, { can_rename: false, name: loc("ve.registry.localisation.FileExplorer_create_new_file") });
					}, { name: "<icon>note_add</icon>", tooltip: loc("ve.registry.localisation.FileExplorer_create_new_file") } )
				}, {
					style: { marginLeft: "auto", order: 99, marginTop: "var(--cell-padding)", padding: 0 }
				}),
			}, {
				attributes: { "data-ve-is-information": true },
				disabled: true,
				style: {
					".nst-content": { 
						display: "flex", 
						flexDirection: "column",
						paddingBottom: `var(--cell-padding)`,
						paddingTop: `var(--cell-padding)`
					},
				}
			});
		
		//options.save_function
		if (this.options.save_function) {
			hierarchy_obj.save_button = new ve.HierarchyDatatype({
				save_as_icon: new ve.HTML(`<icon>save_as</icon>`),
				save_name: new ve.HTML(loc("ve.registry.localisation.FileExplorer_save_file"))
			}, { disabled: true });
			hierarchy_obj.save_button.element.onclick = () => {
				let local_modal = new ve.Window({
					html: new ve.HTML(loc("ve.registry.localisation.FileExplorer_save_file_as")),
					new_file_name: new ve.Text(`autosave${(this.options.save_extension[0]) ? this.options.save_extension[0] : ""}`, { name: " " }),
					confirm_button: new ve.Button((e) => {
						let save_file_name = path.join(this.v, local_modal.new_file_name.v);
						
						if (this.options.save_function)
							try {
								let save_string;
								let save_value = this.options.save_function();
								
								if (typeof save_value === "object") {
									save_string = JSON.stringify(save_value);
								} else {
									save_string = save_value.toString();
								}
								
								//Check if file already exists, if so send a confirmation prompt
								let save_function = () => {
									fs.writeFile(save_file_name, save_string, () => {
										veToast(loc("ve.registry.localisation.FileExplorer_successfully_saved_file_as", save_file_name));
										local_modal.remove();
										this.refresh();
									});
								};
								
								(!fs.existsSync(save_file_name)) ?
									save_function() :
									veConfirm(loc("ve.registry.localisation.FileExplorer_do_you_want_to_overwrite_file"), {
										special_function: () => save_function()
									});
							} catch (e) {
								veToast(e.toString());
								console.error(e);
							}
					})
				}, { can_rename: false, name: loc("ve.registry.localisation.FileExplorer_save_file") });
			};
		}
		
		hierarchy_obj[previous_folder_path] = new ve.HierarchyDatatype({
			up_icon: new ve.HTML(`<icon>subdirectory_arrow_left</icon>`),
			two_dots: new ve.HTML(loc("ve.registry.localisation.FileExplorer_back"))
		}, { disabled: true, limit: () => !File.isDrive(this.v) });
		
		let previous_folder_obj = hierarchy_obj[previous_folder_path];
		previous_folder_obj.element.ondblclick = (e) => {
			this.from_binding_fire_silently = true;
			this.v = previous_folder_path;
			this.from_binding_fire_silently = false;
			this.fireToBinding();
		};
		
		//Special handling for drive switching
		if (File.isDrive(this.v)) {
			let all_drives = File.getAllDrives();
			
			for (let i = 0; i < all_drives.length; i++) {
				if (path.resolve(this.v) === path.resolve(all_drives[i])) continue; //Internal guard clause if paths are the same
				hierarchy_obj[all_drives[i]] = new ve.HierarchyDatatype({
					drive_icon: new ve.HTML(`<icon>storage</icon>`, { style: { padding: 0 } })
				}, {
					attributes: {
						"data-folder": true,
						"data-path": all_drives[i]
					},
					name: all_drives[i],
					disabled: true
				});
				hierarchy_obj[all_drives[i]].element.ondblclick = () => {
					this.from_binding_fire_silently = true;
					this.v = all_drives[i];
					this.from_binding_fire_silently = false;
					this.fireToBinding();
				};
			}
		}
		
		//Iterate over all files and folders in the current directory
		for (let i = 0; i < all_files_in_directory.length; i++) {
			let local_full_path = path.join(this.value, all_files_in_directory[i].name);
			
			//Check to make sure local_full_path is a directory
			if (all_files_in_directory[i].isDirectory()) {
				hierarchy_obj[local_full_path] = new ve.HierarchyDatatype(
					{
						folder_icon: new ve.HTML(this.options.folder_icon, {
							tooltip: `/${all_files_in_directory[i].name}/`
						}),
						actions_menu: new ve.RawInterface({
							rename: new ve.Button((e) => {
								ve.FileExplorer.rename(local_full_path, () => this.refresh());
							}, {
								name: `<icon>drive_file_rename_outline</icon>`,
								limit: () => (!this.options.navigation_only),
								tooltip: loc("ve.registry.localisation.FileExplorer_rename"),
								style: { padding: `var(--cell-padding)` }
							}),
							...Object.fromEntries(
								Object.entries(this.options.folder_components_obj).map(([local_key, local_component]) => {
									return [local_key, local_component.clone ?
										local_component.clone() :
										new local_component.constructor(local_component.value, local_component.options)];
								})
							)
						}, {
							attributes: { "data-ve-is-actions-menu": true },
							style: { display: "flex", marginLeft: "auto", order: 99, padding: 0 },
							...this.options.folder_options
						})
					}, {
						attributes: {
							"data-folder": true,
							"data-path": local_full_path
						},
						name: all_files_in_directory[i].name,
						disabled: true,
						...this.options.folder_options
					}
				);
				
				//Add onclick event handler to hierarchy_obj[local_full_path] since we need navigation to work into a folder
				let local_folder_obj = hierarchy_obj[local_full_path];
				//local_folder_obj.setOwner(this.owner);
				local_folder_obj.element.ondblclick = (e) => {
					//Internal guard clause for protected elements
					if (e.target.closest(`button, input, .tippy-arrow, .tippy-box, .tippy-content`)) return;
					
					this.from_binding_fire_silently = true;
					this.v = local_full_path;
					this.from_binding_fire_silently = false;
					this.fireToBinding();
				};
			}
		}
		for (let i = 0; i < all_files_in_directory.length; i++) {
			let local_full_path = path.join(this.value, all_files_in_directory[i].name);
			
			//Check to make sure local_full_path is a directory is a file
			if (all_files_in_directory[i].isFile()) {
				hierarchy_obj[local_full_path] = new ve.HierarchyDatatype(
					{
						file_icon: new ve.HTML(this.options.file_icon, {
							style: { opacity: 0.6 },
							tooltip: all_files_in_directory[i].name
						}),
						actions_menu: new ve.RawInterface({
							rename: new ve.Button((e) => {
								ve.FileExplorer.rename(local_full_path, () => this.refresh());
							}, {
								name: `<icon>drive_file_rename_outline</icon>`,
								limit: () => (this.options.navigation_only && this.options?.save_extension.includes(path.extname(local_full_path))) || !this.options.navigation_only,
								tooltip: loc("ve.registry.localisation.FileExplorer_rename"),
								style: { padding: `var(--cell-padding)` }
							}),
							load_file: new ve.Button((e) => {
								veConfirm(loc("ve.registry.localisation.FileExplorer_are_you_sure_load", local_full_path), {
									special_function: () => {
										fs.readFile(local_full_path, "utf8", (err, data) => {
											if (err) {
												veToast(loc("ve.registry.localisation.FileExplorer_error_load", local_full_path, e));
												return;
											}
											if (this.options.load_function)
												try {
													this.options.load_function(data, local_full_path);
													veToast(loc("ve.registry.localisation.FileExplorer_loaded_save_file", local_full_path));
												} catch (e) {
													veWindow(`${loc("ve.registry.localisation.FileExplorer_error_load_save_file")}: ${e}`, { name: loc("ve.registry.localisation.FileExplorer_error_load_save_file") });
													console.error(e);
												}
										});
									}
								});
							}, {
								name: `<icon>sync_arrow_down</icon>`,
								tooltip: loc("ve.registry.localisation.FileExplorer_load_save_file"),
								limit: () => this.options.load_function && (this.options.save_extension === undefined || this.options.save_extension.includes(path.extname(local_full_path)) || this.options.save_extension.includes(".*")),
								style: { padding: `var(--cell-padding)` }
							}),
							...Object.fromEntries(
								Object.entries(this.options.file_components_obj).map(([local_key, local_component]) => {
									return [local_key, local_component.clone ?
										local_component.clone() :
										new local_component.constructor(local_component.value, local_component.options)];
								})
							)
						}, {
							style: { display: "flex", marginLeft: "auto", order: 99, padding: 0 },
							...this.options.folder_options
						})
					}, {
						attributes: {
							"data-file": true,
							"data-path": local_full_path
						},
						name: all_files_in_directory[i].name,
						disabled: true,
						...this.options.file_options
					}
				);
			}
		}
		
		//Set hierarchy depending on whether it already exists or not
		let file_explorer_el = this.element.querySelector(`#file-explorer-body`);
		
		this.hierarchy = new ve.Hierarchy(hierarchy_obj, { disable_searchbar: true });
		file_explorer_el.innerHTML = "";
		file_explorer_el.appendChild(this.hierarchy.element);
		
		//[WIP] - Set .name.options.onuserchange listener for all this.hierarchy.components_obj
		
		setTimeout(() => {
			this.hierarchy.setOwner(this.owner, [this.owner]);
		});
	}
	
	/**
	 * Selects a specific file path, then returns {@link this.selected}.
	 * - Method of {@link ve.FileExplorer}
	 *
	 * @alias select
	 * @memberof ve.Component.ve.FileExplorer
	 * 
	 * @param {string} arg0_file_path
	 * 
	 * @returns string[]
	 */
	select (arg0_file_path) {
		//Convert from parameters
		let file_path = arg0_file_path;
		
		//Push to this.selected if not already selected
		if (!this.selected.includes(file_path)) {
			this.selected.push(file_path);
			if (this.hierarchy.components_obj[file_path])
				this.hierarchy.components_obj[file_path].element.classList.add("selected");
		}
		
		//Return statement
		return this.selected;
	}
	
	/**
	 * Selects all file paths in the current folder being navigated.
	 * - Method of {@link ve.FileExplorer}
	 *
	 * @alias selectAll
	 * @memberof ve.Component.ve.FileExplorer
	 */
	selectAll () {
		//Declare local instance variables
		let all_files_in_directory = fs.readdirSync(this.value, { withFileTypes: true });
		this.deselectAll(); //Reset this.selected
		
		//Iterate over all_files_in_directory and select them
		for (let i = 0; i < all_files_in_directory.length; i++) {
			let local_full_path = path.join(this.value, all_files_in_directory[i].name);
			this.select(local_full_path);
		}
	}
	
	/**
	 * Sets the clipboard to the current selection.
	 * - Method of {@link ve.FileExplorer}
	 *
	 * @alias setClipboard
	 * @memberof ve.Component.ve.FileExplorer
	 */
	setClipboard () {
		this.clipboard = structuredClone(this.selected);
	}
};

//Functional binding

/**
 * @returns {ve.FileExplorer}
 */
veFileExplorer = function () {
	//Return statement
	return new ve.FileExplorer(...arguments);
};