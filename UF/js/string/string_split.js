//Initialise functions
{
	if (!global.String) global.String = {};
	
	/**
	 * Splits a string equally by character count.
	 * @alias String.splitByCharacterCount
	 *
	 * @param {string} arg0_string
	 * @param {number} [arg1_length=200]
	 *
	 * @returns {string[]}
	 */
	String.splitByCharacterCount = function (arg0_string, arg1_length) {
		//Convert from parameters
		let string = arg0_string;
		let length = Math.returnSafeNumber(arg1_length, 200);
		
		//Declare local instance variables
		let current_string = "";
		let string_array = [];
		
		//Process string
		for (let i = 0; i < string.length; i++) {
			current_string += string[i];
			
			if ((i % length === 0 || i === string.length - 1) && i !== 0) {
				string_array.push(current_string);
				current_string = "";
			}
		}
		
		//Return statement
		return string_array;
	};
	
	/**
	 * Splits a string in two based on a character index. Returns a string[] with a length of 2.
	 * @alias String.prototype.splitIndex
	 * 
	 * @param {string} arg0_string
	 * @param {number} arg1_index
	 * 
	 * @returns {string[]}
	 */
	String.splitIndex = function (arg0_string, arg1_index) {
		//Convert from parameters
		let string = arg0_string;
		let index = Math.returnSafeNumber(arg1_index, 200);
		
		//Return statement
		return [string.slice(0, index), string.slice(index)];
	};
	
	/**
	 * Splits a string according to Markdown, preserving lists, with \n as breakpoints.
	 * @alias String.splitMarkdown
	 * 
	 * @param {string} arg0_string
	 * @param {Object} [arg1_options]
	 *  @param {number} [arg1_options.maximum_characters=1024]
	 *  @param {number} [arg1_options.maximum_lines]
	 *  @param {boolean} [arg1_options.split_bullet_points] - Whether to try and keep boolean points together.
	 * 
	 * @returns {string[]}
	 */
	String.splitMarkdown = function (arg0_string, arg1_options) {
		//Convert from parameters
		let input_string = arg0_string;
		let options = (arg1_options) ? arg1_options : {};
		
		//Initialise options
		options.maximum_characters = Math.returnSafeNumber(options.maximum_characters, 1024);
		
		//Declare local instance variables
		let all_strings = [];
		let array_string = (!Array.isArray(input_string)) ? Array.toArray(input_string.split("\n")) : input_string;
		let local_array_string = [];
		
		//Error trapping
		let local_indices_to_remove;
		try {
			//Join all bullet point blocks together
			let new_array_string = [];
			
			if (!options.split_bullet_points) {
				let local_joined_string = [];
				let local_starting_element = -1;
				
				for (let i = 0; i < array_string.length; i++) {
					let next_element_length = 0;
					
					if (array_string[i + 1])
						next_element_length = array_string[i].length;
					
					if (array_string[i].startsWith("- ") ||
						(local_joined_string.join("\n").length + next_element_length > Math.ceil(options.maximum_characters/1.5)) ||
						i === array_string.length - 1
					) {
						if (i === array_string.length - 1)
							local_joined_string.push(array_string[i]);
						
						//Set local_joined_string
						new_array_string.push(local_joined_string.join("\n"));
						local_indices_to_remove = [];
						
						//1st bullet point, mark as local_starting_element
						local_joined_string = [];
						local_starting_element = i;
					}
					
					local_joined_string.push(array_string[i]);
				}
			}
			
			array_string = new_array_string;
			
			if (!options.maximum_lines) {
				//Split text based on characters
				for (let i = 0; i < array_string.length; i++) {
					let added_line = false;
					let bullets = "";
					let hit_maximum = false;
					let nesting = array_string[i].getNesting();
					
					if (local_array_string.join("\n").length + array_string[i].length <= options.maximum_characters) {
						local_array_string.push(array_string[i]);
						added_line = true;
					} else {
						hit_maximum = true;
					}
					
					//Adjust bullet points if off
					if (nesting === 1)
						bullets = "- "
					if (nesting >= 1) {
						for (let x = 0; x < nesting; x++)
							bullets += " - ";
						
						array_string[i] = array_string[i].split(" - ");
						
						if (array_string[i].length > 1)
							array_string[i].shift();
						
						array_string[i] = `${bullets} ${array_string[i].join(" - ")}`;
					}
					
					if (i !== 0 || array_string.length === 1)
						if ((i === array_string.length - 1 &&
							//Check to see that string is not empty
							local_array_string.join("\n").length > 0
						) || hit_maximum) {
							//Push to all_strings
							all_strings.push(local_array_string.join("\n"));
							local_array_string = [];
							
							//Maximum safeguard to prevent max call stack size
							if (hit_maximum) i--; //Potentially leads to a fatal crash
						}
				}
			} else {
				//Split embeds based on lines
				for (let i = 0; i < array_string.length; i++) {
					local_array_string.push(array_string[i]);
					
					if (i !== 0 || array_string.length === 1)
						if (i % options.maximum_lines === 0 || i === array_string.length - 1) {
							//Push to all_strings
							all_strings.push(local_array_string.join("\n"));
							local_array_string = [];
						}
				}
			}
			
			//Return statement
			return all_strings;
		} catch (e) {}
	};
}