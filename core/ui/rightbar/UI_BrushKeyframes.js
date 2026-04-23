global.UI_BrushKeyframes = class extends ve.Class {
	constructor () {
		super();
	}
	
	/**
	 * @returns {ve.Interface}
	 */
	draw () {
		//Declare local instance variables
		let end_date = (this.end_date) ? this.end_date : JSON.parse(JSON.stringify(main.date));
		let start_date = (this.start_date) ? this.start_date : JSON.parse(JSON.stringify(main.date));
		
		//Return statement
		return new ve.Interface({
			info: new ve.HTML(`<b>Note.</b> Date ranges are currently only applied to Node Brushes to prevent accidental data erasures. Regular brushes can be used on temporary Polygons and transferred over using the <kbd>Node Transfer</kbd> brush.`, {
				style: { padding: 0 }
			}),
			
			apply_date_range: new ve.Toggle(this.enabled, {
				name: "Apply Date Range",
				onuserchange: (v) => this.enabled = v,
				tooltip: "Whether to apply brush edits to the given date range."
			}),
			start_date: new ve.Date(start_date, {
				name: "Start Date",
				onuserchange: (v) => this.start_date = v
			}),
			end_date: new ve.Date(end_date, {
				name: "End Date",
				onuserchange: (v) => this.end_date = v
			})
		}, {
			is_folder: false,
			style: { padding: 0 }
		});
	}
	
	getDateRange () {
		//Return statement
		if (!this.enabled) return;
		return [
			(this.start_date) ? this.start_date : main.date,
			(this.end_date) ? this.end_date : main.date
		];
	}
}