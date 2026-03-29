//Initialise functions
{
	ve.ScriptManager._autosave = function () {
		if (!this._settings.manual_synchronisation || !this._file_path) return; //Internal guard clause if manual synchronisation is not turned on
		
		//Save to current file if possible
		fs.writeFileSync(this._file_path, this.v, "utf8");
	};
	
	ve.ScriptManager._synchroniseViews = function (arg0_synchronsing_from) {
		//Convert from parameters
		let synchronising_from = (arg0_synchronsing_from) ? arg0_synchronsing_from : "monaco";
		
		if (!this._settings.manual_synchronisation) return;
		
		//Open new confirm prompt if not already open
		if (this.synchronise_confirm_window) this.synchronise_confirm_window.close();
		console.log(`Sync from:`, synchronising_from);
		this.synchronise_confirm_window = new ve.Confirm(`${loc("ve.registry.localisation.ScriptManager_confirm_synchronise")} ${(synchronising_from === "monaco") ? loc("ve.registry.localisation.ScriptManager_blockly") : loc("ve.registry.localisation.ScriptManager_monaco")} to ${(synchronising_from === "monaco") ? loc("ve.registry.localisation.ScriptManager_monaco") : loc("ve.registry.localisation.ScriptManager_blockly")}?`, {
			special_function: () => {
				if (synchronising_from === "blockly") {
					this.scene_blockly._exportToMonaco(true);
					delete this._blockly_change;
				} else if (synchronising_from === "monaco") {
					this.scene_monaco._exportToBlockly(true);
					delete this._monaco_change;
				}
			}
		});
	};
}