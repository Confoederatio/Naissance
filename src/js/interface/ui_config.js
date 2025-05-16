//Initialise config if it doesn't exist
if (!global.config) global.config = {};

//Initialise helper functions
{
  function getUISelector (arg0_key, arg1_return_array) {
    //Convert from parameters
    var key = arg0_key;
    var return_array = arg1_return_array;

    //Declare local instance variables
    var common_defines = config.defines.common;
    var common_selectors = common_defines.selectors;

    //Return statement
    if (common_selectors[key]) {
      return (!return_array) ? document.querySelector(common_selectors[key]) : document.querySelectorAll(common_selectors[key]);
    } else {
      console.error(`Could not find selector in config.defines.common:`, key);
    }
  }
}
