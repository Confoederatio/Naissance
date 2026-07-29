if (!global.naissance) global.naissance = {};
naissance.History = class {
	static draw_keyframe_function (arg0_history, arg1_options) {
		//Convert from parameters
		let history_obj = arg0_history;
		let options = (arg1_options) ? arg1_options : {};
		
		//Declare local instance variables
		let components_obj = options.components_obj;
		let local_key = options.key;
		let local_value = options.value;
		
		//Set components_obj
		components_obj[`t_${local_key}`] = new ve.Interface({
			date_info: new ve.HTML(String.formatDate(parseInt(local_key)), {
				tooltip: `Timestamp: ${local_value.timestamp}`,
				x: 0, y: 0
			}),
			localisation: veHTML(() =>
				(local_value.localisation) ? local_value.localisation : "", { x: 1, y: 0 }),
			actions_bar: veRawInterface({
				jump_to_date: veButton((e) => {
					DALS.Timeline.parseAction("load_date", [
						{ set_date: Date.convertTimestampToDate(local_key) },
						{ refresh_date: true }
					]);
				}, {
					name: "<icon>arrow_forward</icon>",
					tooltip: "Jump to Date"
				}),
				move_keyframe: veButton(() => {
					let move_keyframe_window = veWindow({
						new_date: veDate(local_value.timestamp, { name: "New Date" }),
						confirm: veButton(() => {
							DALS.Timeline.parseAction("move_keyframe", [{
								geometry_obj: history_obj.options._id(),
								move_keyframe: {
									date: local_value.timestamp,
									ot_date: move_keyframe_window.new_date.v
								}
							}]);
							move_keyframe_window.close();
						})
					}, {
						can_rename: false,
						name: "Move Keyframe"
					});
				}, {
					name: "<icon>height</icon>",
					tooltip: "Move Keyframe to Date"
				}),
				remove_keyframe: veButton((e) => {
					DALS.Timeline.parseAction("delete_keyframe", [
						{ geometry_obj: history_obj.options._id(), remove_keyframe: local_key },
						{ refresh_date: true }
					]);
				}, {
					name: "<icon>delete</icon>",
					tooltip: "Delete Keyframe"
				})
			}, {
				attributes: { class: "actions-bar" },
				x: 2, y: 0
			})
		}, {
			attributes: { "naissance-ui": "HistoryKeyframes" },
			gc: true,
			is_folder: false
		});
		
		let local_keyframe_ui = components_obj[`t_${local_key}`];
		local_keyframe_ui.element.addEventListener("contextmenu", (e) => {
			if (history_obj.keyframe_context_menu) history_obj.keyframe_context_menu.close();
			
			history_obj.keyframe_context_menu = veContextMenu({
				copy_timestamp: veButton(() => {
					navigator.clipboard.writeText(local_key);
					veToast(`Copied timestamp to keyboard.`);
				}, { name: "Copy Timestamp" }),
				copy_geometry_to_date: veButton(() => {
					history_obj.addKeyframe(main.timestamp, ...[local_value.value[0]]);
					veToast(`Copied geometry keyframe to present date.`);
				}, { name: "Copy Geometry To Date" }),
				
				//Edit Symbol, Edit Properties
				edit_symbol_button: veButton(() => {
					if (history_obj.edit_symbol_object_window) history_obj.edit_symbol_object_window.close();
					history_obj.edit_symbol_object_window = veWindow({
						symbol_obj: veObjectEditor(local_value.value[1], {
							onuserchange: (v) => history_obj.edit_symbol_object = v
						}),
						confirm: veButton(() => {
							if (history_obj.edit_symbol_object)
								if (Object.keys(history_obj.edit_symbol_object).length > 0) {
									history_obj.addKeyframe(local_key, undefined, history_obj.edit_symbol_object);
									veToast(`Edited symbol at timestamp.`);
								} else {
									local_value.value[1] = undefined;
									veToast(`Deleted symbol at timestamp.`);
								}
							history_obj.getKeyframe({ refresh_localisation: true });
						}, { name: "Confirm" })
					}, { name: "Edit Symbol", can_rename: false, width: "20rem" })
				}, { name: "Edit Symbol" }),
				edit_properties_button: veButton(() => {
					if (history_obj.edit_properties_object_window) history_obj.edit_properties_object_window.close();
					history_obj.edit_properties_object_window = veWindow({
						symbol_obj: veObjectEditor(local_value.value[2], {
							onuserchange: (v) => history_obj.edit_properties_object = v
						}),
						confirm: veButton(() => {
							if (history_obj.edit_properties_object)
								if (Object.keys(history_obj.edit_properties_object).length > 0) {
									history_obj.addKeyframe(local_key, undefined, undefined, history_obj.edit_properties_object);
									veToast(`Edited properties at timestamp.`);
								} else {
									local_value.value[2] = undefined;
									veToast(`Deleted properties at timestamp.`);
								}
							history_obj.getKeyframe({ refresh_localisation: true });
						}, { name: "Confirm" })
					}, { name: "Edit Properties", can_rename: false, width: "20rem" });
				}, { name: "Edit Properties" })
			}, { id: "ui_keyframe_context_menu" })
		});
	}
};