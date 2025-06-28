ve.ComponentWYSIWYG = class {
	constructor (arg0_parent, arg1_options) {
		//Convert from parameters
		this.parent = arg0_parent; //Class: Component
		this.options = (arg1_options) ? arg1_options : {};

		//Declare local instance variables
		this.element = document.createElement("span");
		var html_string = [];
	}
};