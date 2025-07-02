/*
  alphabetiseNumber() - Alphabetises a number based on a0-j9.
  arg0_string: (String) - The string of the number to numerise; if applicable.
  Returns: (String)
*/
function alphabetiseNumber (arg0_string) {
  //Convert from parameters
  var string = arg0_string.toString();

  //Declare local instance variables
  var alphabet_array = "abcdefghij";
	var alphabetised_string = "";

  //Iterate over number to alphabetise it
	for (var i = 0; i < string.length; i++)
		if (!isNaN(parseInt(string[i]))) {
			alphabetised_string += alphabet_array[parseInt(string[i])];
		} else {
			alphabetised_string += string[i];
		}

	//Return statement
	return alphabetised_string;
}

/*
  arabicise() - Arabicises a Roman numeral string.
  arg0_number: (String) - The number to arabicise.

  Returns: (Number)
*/
function arabicise (arg0_number) {
  //Convert from parameters
  var number = arg0_number;

  //Declare local instance variables and reference arrays
  var previous_value = 0;
  var result = 0;
  var roman_dictionary = {
    M: 1000, D: 500, C: 100, L: 50, X: 10, V: 5, I: 1,
    m: 1000, d: 500, c: 100, l: 50, x: 10, v: 5, i: 1
  };
  var total = 0;

  for (var i = number.length - 1; i >= 0; i--) {
    var current_value = roman_dictionary[number[i]];

    result += (current_value < previous_value) ?
      current_value*-1 :
      current_value;

    previous_value = current_value;
  }

  //Return statement
  return result;
}

/*
  degreesToRadians() - Converts degrees to radians.
  arg0_degrees: (Number) - The number of degrees.

  Returns: (Number)
*/
function degreesToRadians (arg0_degrees) {
  //Convert from parameters
  var degrees = arg0_degrees;

  //Return statement
  return degrees*(Math.PI/180);
}

/*
  deordinalise() - Deordinalises a string.
  arg0_string: (String) - The string to deordinalise.

  Returns: (String)
*/
function deordinalise (arg0_string) {
  //Convert from parameters
  var string = arg0_string;

  //Declare local instance variables
	var ordinals = ["st", "nd", "rd", "th"];

	//Iterate through all ordinals and replace them with nothing
	for (var i = 0; i < ordinals.length; i++)
		string = string.replace(ordinals[i], "");

	//Return string as number
	return parseInt(string);
}

/*
  exp() - Exponentiates a number.
  arg0_number: (Number) - The base to exponentiate.
  arg1_number: (Number) - The power to exponentiate by.

  Returns: (Number)
*/
function exp (arg0_number, arg1_number) {
  //Convert from parameters
  var base = arg0_number;
  var power = arg1_number;

  //Return statement
  return Math.pow(base, power);
}

/*
  factorial() - Calculates the factorial of a number.
  arg0_number: (Number) - The number to calculate for.

  Returns: (Number)
*/
function factorial (arg0_number) {
  //Convert from parameters
  var number = parseInt(arg0_number);

  //Guard clause
  if (isNaN(number)) return number;

  //Declare local instance variables
  var f_array = [];

  //Memorisation algorithm
  if (number == 0 || number == 1)
    return 1;
  if (f_array[number] > 0)
    return f_array[number];

  //Return statement
  return f_array[number] = factorial(number - 1)*number;
}

/*
  generateRandomID() - Generates a random ID.
  arg0_object: (Object) - The object relative to which the ID is being generated; making sure to avoid duplicate IDs.

  Returns: (Number)
*/
function generateRandomID (arg0_object) {
  //Convert from parameters
  var input_object = arg0_object;

  //Declare local instance variables
  var random_id = randomNumber(0, 100000000000).toString();

  //Check if input_object is defined
  if (typeof input_object == "object") {
    while (true) {
      var local_id = generateRandomID();

      //Return and break once a true ID is found
      if (!input_object[local_id]) {
        return local_id;
        break;
      }
    }
  } else {
    return random_id;
  }
}

/*
  logarithm() - Calculates logarithm/natural logarithm
  arg0_x: (Number) - The x to calculate the logarithm for.
  arg1_y: (Number) - The y to calculate the logarithm for.

  Returns: (Number)
*/
function logarithm (arg0_x, arg1_y) {
  //Convert from parameters
  var x = arg0_x;
  var y = arg1_y;

  //Return statement
  return (x != undefined && y != undefined) ?
    Math.log(y)/Math.log(x) :
    Math.log(x);
}

/*
  logFactorial() - Calculates the log of a factorial
  arg0_number: (Number) - The number to pass to the function.

  Returns: (Number)
*/
function logFactorial (arg0_number) {
  //Convert from parameters
  var number = arg0_number;

  //Return statement
  if (number == 0 || number == 1) {
    return 0; //log(0!) = log(1!) = 0
  } else {
    var result = 0;

    for (var i = 2; i <= number; i++)
      result += Math.log(i);

    return result;
  }
}

/*
  max() - Fetches the maximum value inside a variable.
  arg0_variable: (Array<Number, ...>) - The array to calculate the max. val for
  Returns: (Number)
*/
function max (arg0_variable) {
  //Convert from parameters
  var list_variable = getList(arg0_variable);

  //Declare local instance variables
  var maximum;

  //Iterate over list_variable
  for (var i = 0; i < list_variable.length; i++) {
    if (typeof list_variable[i] == "number")
      if (!maximum || list_variable[i] > maximum)
        maximum = list_variable[i];
  }

  //Return statement
  return maximum;
}

/*
  min() - Fetches the minimum value inside a variable.
  arg0_variable: (Array<Number, ...>) - The array to calculate the min. val for
  Returns: (Number)
*/
function min (arg0_variable) {
  //Convert from parameters
  var list_variable = getList(arg0_variable);

  //Declare local instance variables
  var minimum;

  //Iterate over list_variable
  for (var i = 0; i < list_variable.length; i++) {
    if (typeof list_variable[i] == "number")
      if (!minimum || list_variable[i] < minimum)
        minimum = list_variable[i];
  }

  //Return statement
  return minimum;
}

/*
  numeriseAlphabet() - Numerises an alphabetical string, assuming a0-j9.
  arg0_string: (String) - The string to numerise.

  Returns: (String)
*/
function numeriseAlphabet (arg0_string) {
  //Convert from parameters
	var string = arg0_string.toString();

	//Declare local instance variables
	var alphabet_array = {
		a: 0, b: 1, c: 2, d: 3, e: 4, f: 5, g: 6, h: 7, i: 8, j: 9
	}
	var alphabetised_string = "";

  //Iterate over string to convert it back into numbers
	for (var i = 0; i < string.length; i++)
		if (alphabet_array[string[i]] != undefined) {
			alphabetised_string += alphabet_array[string[i]];
		} else {
			alphabetised_string += string[i];
		}

	//Return statement
	return alphabetised_string;
}

/*
  oldDeordinalise() - Strip ordinals from a string and convert it to a number (e.g. '2nd' = 2).
  arg0_string: (String) - The string to deordinalise, using the old list specification pattern.

  Returns: (String)
*/
function oldDeordinalise (arg0_string) {
  //Convert from parameters
  var deordinalised_string = arg0_string;

  //Declare local instance variables
  var ordinals = ["st", "nd", "rd", "th"];

  //Split deordinalised_string into multiple chunks, remove stray ordinals
  deordinalised_string = (deordinalised_string.includes(" ")) ?
    deordinalised_string.split(" ") : [deordinalised_string];

  for (var i = 0; i < deordinalised_string.length; i++) {
    for (var x = 0; x < ordinals.length; x++)
      if (deordinalised_string[i].indexOf(ordinals[x]) == 0)
        deordinalised_string[i] = deordinalised_string[i].replace(ordinals[x], "");
    if (deordinalised_string[i] == "")
      deordinalised_string.splice(i, 1);
  }

  //Iterate over to purge ordinals
  for (var i = 0; i < deordinalised_string.length; i++) {
		//Look for ordinal
		var ordinal_found = false;

    //Check if an ordinal was found
		for (var x = 0; x < ordinals.length; x++)
			if (deordinalised_string[i].indexOf(ordinals[x]) != -1)
				ordinal_found = true;

		var total_ordinal_amount = (ordinal_found) ? 2 : 0;
		var ordinal_percentage = total_ordinal_amount/deordinalised_string[i].length;

		if (ordinal_percentage > 0.67) //Ordinal makes up majority of string, so delete
			deordinalised_string.splice(i, 1);
	}

  //Return statement
	return deordinalised_string.join(" ").trim();
}

/*
  ordinalise() - Ordinalises a number.
  arg0_number: (Number) - The input number to pass.
  Returns: (String)
*/
function ordinalise (arg0_number) {
  //Convert from parameters
  var i = arg0_number;

  //Declare local instance variables
  var negative_suffix = (i < 0) ? `-` : "";

  i = Math.abs(i);
  var j = i % 10, k = i % 100;

  //Return statement
  if (j == 1 && k != 11)
    return `${negative_suffix}${i}st`;
  if (j == 2 && k != 12)
    return `${negative_suffix}${i}nd`;
  if (j == 3 && k != 13)
    return `${negative_suffix}${i}rd`;
  return `${negative_suffix}${i}th`;
}

/*
  radiansToDegrees() - Converts radians to degrees.
  arg0_radians: (Number) - The number of radians to pass.
  Returns: (Number)
*/
function radiansToDegrees (arg0_radians) {
  //Convert from parameters
  var radians = arg0_radians;

  //Return statement
  return (radians*180)/Math.PI;
}

/*
  randomNumber() - Generates a random number between min and max.
  arg0_min: (Number) - The min range.
  arg1_max: (Number) - The max range.
  arg2_do_not_round: (Boolean) - Optional. Whether to round. False by default.

  Returns: (Number)
*/
function randomNumber (arg0_min, arg1_max, arg2_do_not_round) {
  //Convert from parameters
  var min = arg0_min;
  var max = arg1_max;
  var do_not_round = arg2_do_not_round;

  //Declare local instance variables
  var random_number = Math.random()*(max - min) + min;

  //Return statement
  return (!do_not_round) ? Math.round(random_number) : random_number;
}

/*
  returnSafeNumber() - Returns a safe number.
  arg0_operation: (Number) - The variable, preferably a number to check for.
  arg1_default: (Number) - Optional. The default to pass. 0 by default.

  Returns: (Number)
*/
function returnSafeNumber (arg0_operation, arg1_default) {
  //Convert from parameters
  var operation = parseFloat(arg0_operation);
  var default_number = (arg1_default) ? arg1_default : 0;

  //Return statement
  return (!isNaN(operation) && isFinite(operation) && operation != undefined && operation != null) ?
    operation :
    default_number;
}

/*
  romanise() - Romanises an arabic number and returns it as a string.
  arg0_number: (Number) - The number to romanise.

  Returns: (String)
*/
function romanise (arg0_number) {
  //Convert from parameters
  var number = arg0_number;

  //Declare local instance variables
  var i;
  var roman_dictionary = {
    M: 1000, D: 500, C: 100, L: 50, X: 10, V: 5, I: 1,
    m: 1000, d: 500, c: 100, l: 50, x: 10, v: 5, i: 1
  };
  var roman_string = "";

  //i in roman_dictionary
  for (i in roman_dictionary)
    while (number >= roman_dictionary[i]) {
      roman_string += i;
      number -= roman_dictionary[i];
    }

  //Return statement
  return roman_string;
}

/*
  root() - Nth roots a number.
  arg0_number: (Number) - The number to root.
  arg1_root: (Number) - The root.

  Returns: (Number)
*/
function root (arg0_number, arg1_root) {
  //Convert from parameters
  var number = arg0_number;
  var root = arg1_root;

  //Conduct nth root operation
  try {
    var negate = (root % 2 == 1 && number < 0);
    var possible = Math.pow(number, 1/root);

    if (negate) number = -number;
    root = Math.pow(possible, root);

    //Return statement
    if (Math.abs(number - root) < 1 && (number > 0 == root > 0))
      return negate ? -possible : possible;
  } catch {}
}

/*
  round() - Rounds a number to n places.
  arg0_number: (Number) - The number to round.
  arg1_rounding_places: (Number) - The number of places to round by.

  Returns: (Number)
*/
function round (arg0_number, arg1_rounding_places) {
  //Convert from parameters
  var number = arg0_number;
  var rounding_places = arg1_rounding_places;

  //Declare local instance variables
  var multiplier = Math.pow(10, rounding_places);

  //Return statement
  return Math.round(number*multiplier)/multiplier;
}

/*
  sigfig() - Rounds a number to n significant figures.
  arg0_number: (Number) - The number to round to significant figures.
  arg1_sigfigs: (Number) - The number of sigfigs to round by

  Returns: (Number)
*/
function sigfig (arg0_number, arg1_sigfigs) {
  //Convert from parameters
  var number = arg0_number;
  var sigfigs = arg1_sigfigs;

  //Guard clause
  if (number == 0) return 0;

  //Declare local instance variables
  var magnitude = Math.floor(Math.log10(Math.abs(number))) + 1;
  var multiplier = Math.pow(10, n - magnitude);

  //Return statement
  return Math.round(number*multiplier)/multiplier;
}

/*
  splitNumber() - Splits a number randomly into multiple parts.
  arg0_number: (Number) - The number to split.
  arg1_parts: (Number) - How many parts to split it into.

  Returns: (Array<Number, ...>)
*/
function splitNumber (arg0_number, arg1_parts) {
  //Convert from parameters
  var number = arg0_number;
  var parts = arg1_parts;

  //Return statement
  return [...splitNumberParts(number, parts)];
}

//splitNumberParts() - Internal helper function for splitNumber()
function* splitNumberParts (arg0_number, arg1_parts) {
  //Convert from parameters
  var number = arg0_number;
  var parts = arg1_parts;

  //Declare local instance variables
  var sum_parts = 0;

  //Split number randomly
  for (var i = 0; i < parts - 1; i++) {
    var part_number = Math.random()*(number - sum_parts);
    yield part_number;
    sum_parts += part_number;
  }

  yield number - sum_parts;
}

/*
  unzero() - Makes sure to unzero a figure. Useful to avoid dividing by 0. 1 by default.
  arg0_number: (Number) - The number to unzero.
  arg1_default: (Number) - Optional. The default to set it to. 1 by default.

  Returns: (Number)
*/
function unzero (arg0_number, arg1_default) {
  //Convert from parameters
  var number = returnSafeNumber(arg0_number);
  var default_number = (arg1_default) ? arg1_default : 1;

  //Return statement
  return (number != 0) ? number : default_number;
}

//KEEP AT BOTTOM! Initialise function aliases
{
  global.random = Math.random;
}
