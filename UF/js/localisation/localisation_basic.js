//Initialise functions
{
	/**
	 * Performs a localisation replacement for the text in question.
	 * 
	 * @param {string} arg0_localisation_key - Starts from the `global` root {@link Object}.
	 * @param {...string} argn_arguments - Any arguments that should be replaced by the key text in £n£ form, i.e. £1£, £2£.
	 * 
	 * @returns {string}
	 */
	global.loc = function (arg0_localisation_key, argn_arguments) {
		//Convert from parameters
		let localisation_key = arg0_localisation_key;
		
		//Declare local instance variables
		let current_locale = (ve.registry.locale) ? 
			`_${ve.registry.locale}` : "";
		let json_key = `${localisation_key}${current_locale}`;
		
		//Parse localisation_string if available
		let localisation_string;
			try { 
				localisation_string = Object.getValue(global, json_key); 
			} catch (e) {
				localisation_string = `MISSING_LOCALISATION`;
				console.warn(e);
			}
		
		//Iterate over all remaining arguments now that we have the template string, and replace £ delimited numbers with it
		if (arguments.length > 1)
			for (let i = 1; i < arguments.length; i++)
				localisation_string = localisation_string.replaceAll(`£${i}£`, arguments[i]);
		
		//Return statement
		return localisation_string;
	};
}