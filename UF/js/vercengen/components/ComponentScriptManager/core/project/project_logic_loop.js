//Initialise functions
{
	ve.ScriptManager._projectLogicLoop = function () {
		//File synchronisation/outline
		if (this._file_path) {
			let current_data = fs.promises.readFile(this._file_path, {
				encoding: "utf8"
			}).then((data) => {
				//Flag is the file is saved to the present value
				this._is_file_saved = (data === this.v);
			}).catch((err) => console.error(`ve.ScriptManager._projectLogicLoop`, err.message));
		} else {
			this._is_file_saved = (this.v.length === 0);
		}
		
		//Tracker attributes
		this.scene_el.setAttribute("data-blockly-change", this._blockly_change);
		this.scene_el.setAttribute("data-monaco-change", this._monaco_change);
	};
}