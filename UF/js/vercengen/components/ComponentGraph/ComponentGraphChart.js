ve.GraphChart = class extends ve.Component {
	constructor (arg0_value, arg1_options) {
		let value = (arg0_value) ? arg0_value : []; //Either Array for CSV or Object for JSON. If the array is 3D, assume it to be a list of CSVs.
		let options = (arg1_options) ? arg1_options : {};
		super(options);
	}
};