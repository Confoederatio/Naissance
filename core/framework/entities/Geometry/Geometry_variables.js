//Initialise functions
{
	naissance.Geometry.syncVariablesToSpreadsheet = function () {
		//Declare local instance variables
		let first_sheet_id;
		let snapshot =
			this.metadata.variables && this.metadata.variables.sheets
				? this.metadata.variables
				: { is_snapshot: true, sheets: {}, sheetOrder: [] };
		
		//1. Initialise skeleton snapshot if it does not exist
		if (snapshot.sheetOrder.length === 0) {
			first_sheet_id = Class.generateRandomID();
			snapshot.sheetOrder.push(first_sheet_id);
			snapshot.sheets[first_sheet_id] = {
				id: first_sheet_id,
				name: "Variables",
				cellData: { 0: { 0: { v: "Date", t: 1 } } },
				columnCount: 20,
				rowCount: 1000
			};
		}
		
		first_sheet_id = snapshot.sheetOrder[0];
		let local_sheet = snapshot.sheets[first_sheet_id];
		let local_cell_data = local_sheet.cellData;
		
		//2. Determine active variable names and valid keyframes
		let active_vars = {}; // { var_name: true }
		let valid_kf_timestamps = {}; // { timestamp: keyframe_id }
		Object.iterate(this.history.keyframes, (local_kf_id, local_keyframe) => {
			let local_val = local_keyframe.value;
			let local_variables = local_val && local_val[2] ? local_val[2].variables : null;
			let local_kf_ts = Date.getTimestamp(local_keyframe.date);
			
			if (local_variables && Object.keys(local_variables).length > 0) {
				valid_kf_timestamps[local_kf_ts] = local_kf_id;
				Object.iterate(local_variables, (local_var_name, local_var_val) => {
					active_vars[local_var_name] = true;
				});
			}
		});
		
		//3. Sync Headers (Row 0)
		let col_map = { Date: 0 };
		let max_col = 0;
		let header_row = local_cell_data[0] || (local_cell_data[0] = { 0: { v: "Date", t: 1 } });
		
		//Remove headers for variables that no longer exist
		Object.iterate(header_row, (local_col_idx, local_cell) => {
			let local_idx = parseInt(local_col_idx);
			if (local_idx === 0) return;
			let local_var_name = local_cell?.v?.toString();
			
			if (local_var_name && !active_vars[local_var_name]) {
				delete header_row[local_idx];
			} else if (local_var_name) {
				col_map[local_var_name] = local_idx;
				max_col = local_idx > max_col ? local_idx : max_col;
			}
		});
		
		//Add new headers
		Object.iterate(active_vars, (local_var_name, local_is_active) => {
			if (col_map[local_var_name] === undefined) {
				max_col++;
				col_map[local_var_name] = max_col;
				header_row[max_col] = { v: local_var_name, t: 1 };
			}
		});
		
		//4. Map existing rows and cleanup stale dates
		let timestamp_row_map = {};
		let max_row = 0;
		Object.iterate(local_cell_data, (local_row_idx, local_row) => {
			let local_idx = parseInt(local_row_idx);
			if (local_idx === 0) return;
			max_row = local_idx > max_row ? local_idx : max_row;
			
			let local_date_cell = local_row[0];
			if (local_date_cell?.v != null) {
				let local_parsed_date = Date.convertStringToDate(local_date_cell.v.toString());
				let local_ts = Date.getTimestamp(local_parsed_date);
				
				if (local_ts != null && !isNaN(local_ts)) {
					if (!valid_kf_timestamps[local_ts]) {
						delete local_cell_data[local_idx];
					} else {
						timestamp_row_map[local_ts] = local_idx;
					}
				}
			}
		});
		
		//5. Sync valid keyframes to the spreadsheet
		Object.iterate(valid_kf_timestamps, (local_ts_str, local_kf_id) => {
			let local_kf = this.history.keyframes[local_kf_id];
			let local_variables = local_kf.value[2].variables;
			let local_ts = parseInt(local_ts_str);
			let target_row_idx = timestamp_row_map[local_ts];
			
			//Create row if it doesn't exist
			if (target_row_idx === undefined) {
				max_row++;
				target_row_idx = max_row;
				let local_date = local_kf.date;
				let local_cell_obj = { t: 1 };
				
				//Format date Column 0
				if (local_date.month === 1 && local_date.day === 1 && local_date.hour === 0 && local_date.minute === 0) {
					local_cell_obj.v = local_date.year;
					local_cell_obj.t = 2;
				} else {
					let local_str = local_date.year.toString();
					if (local_date.minute > 0)
						local_str += `.${local_date.month}.${local_date.day}.${local_date.hour}.${local_date.minute}`;
					else if (local_date.hour > 0) local_str += `.${local_date.month}.${local_date.day}.${local_date.hour}`;
					else if (local_date.day > 1) local_str += `.${local_date.month}.${local_date.day}`;
					else if (local_date.month > 1) local_str += `.${local_date.month}`;
					local_cell_obj.v = local_str;
				}
				local_cell_data[target_row_idx] = { 0: local_cell_obj };
			}
			
			let target_row = local_cell_data[target_row_idx];
			
			//Sync Column values: update or delete
			Object.iterate(col_map, (local_var_name, local_col_idx) => {
				if (local_col_idx === 0) return;
				
				let local_val = local_variables[local_var_name];
				if (local_val == null) {
					delete target_row[local_col_idx];
				} else {
					let local_val_str = local_val.toString();
					let local_cell_obj = {};
					
					if (local_val_str.startsWith("=")) {
						local_cell_obj.f = local_val_str;
					} else {
						local_cell_obj.v = local_val;
						local_cell_obj.t = typeof local_val === "number" ? 2 : 1;
					}
					target_row[local_col_idx] = local_cell_obj;
				}
			});
		});
		
		this.metadata.variables = snapshot;
		if (this.variables_editor?.instance?.table_editor)
			this.variables_editor.instance.table_editor.fromJSON(snapshot);
	};
}