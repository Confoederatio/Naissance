if (!global.naissance) global.naissance = {};
naissance.HistoryKeyframe = class extends ve.Class {
	constructor (arg0_date, ...argn_arguments) {
		//Convert from parameters
		super();
		let date = arg0_date;
		
		//Declare local instance variables
		this.date = Date.convertTimestampToDate(JSON.parse(JSON.stringify(date))); //Needs to be deep-copied since date can be a Proxy
		this.timestamp = Date.getTimestamp(date);
		this.value = [];
		
		this.setData(...argn_arguments);
	}
	
	/**
	 * Adds the constructor/data structure of another object as an {@link Array}<{@link Object}>. Concatenates any objects passed to the function.
	 * 
	 * @param {...any} argn_arguments
	 */
	addData (...argn_arguments) {
		//Iterate over all arguments and add it to .value, concatenating any objects if they exist
		for (let i = 0; i < argn_arguments.length; i++)
			if (argn_arguments[i] !== undefined)
				if (typeof argn_arguments[i] === "object" && argn_arguments[i] !== null) {
					let old_variables = (this.value[i]?.variables) ? this.value[i].variables : {};
					
					//Handle initial value naively
					this.value[i] = {
						...(this.value[i]) ? this.value[i] : {},
						...argn_arguments[i]
					};
					//Handle shallow nesting for .variables if extant
					if (argn_arguments[i].variables)
						this.value[i].variables = {
							...old_variables,
							...argn_arguments[i].variables
						};
				} else {
					this.value[i] = argn_arguments[i];
				}
	}
	
	/**
	 * Overrides the present value, replacing it with the constructor/data structure of another object as an {@link Array}<{@link Object}>.
	 * 
	 * @param {...any} argn_arguments
	 */
	setData (...argn_arguments) {
		this.value = [];
		this.addData(...argn_arguments);
	}
};