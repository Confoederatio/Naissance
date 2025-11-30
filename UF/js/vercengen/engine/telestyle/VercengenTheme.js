/**
 * <span color="yellow">{@link ve.Theme}</span>: Themes in Vercengen serve as **Telestyle** wrappers and can be used in {@link ve.Component}/{@link ve.Feature} option fields with the key `.theme`: {@link string} to identify them. Unlike traditional CSS, ve.Theme is fully dynamic and features custom selectors.
 * - Functional binding: <span color=00ffff>veTheme</span>().
 * 
 * ##### Constructor:
 * - `arg0_theme_key`: {@link string}
 * - `arg1_telestyle_obj`: {@link Object} - The Telestyle object that will be applied when this theme is used.
 *   - Theming variables:
 *   - `--navbar-height`: {@link string} - CSS property: `height`
 *   - 
 *   - `--accent-primary-colour`: {@link string} - CSS property:`background-color`
 *   - `--accent-secondary-colour`: {@link string} - CSS property:`background-color`
 *   - `--bg-primary-colour`: {@link string} - CSS property:`background-color`
 *   - `--bg-secondary-colour`: {@link string} - CSS property:`background-color`
 *   - `--hover-colour`: {@link string} - CSS property:`background-color`
 *   - 
 *   - `--header-colour`: {@link string} - CSS property:`color`
 *   - `--header-font-family`: {@link string} - CSS property:`font-family`
 *   - `--header-font-size`: {@link string} - CSS property:`font-size`
 *   - `--header-font-weight`: {@link number} - CSS property:`font-weight`
 *   - `--image-filter`: {@link string} - CSS property:`filter`
 *   - `--monospace-font-family`: {@link string} - CSS property:`font-family`
 *   - 
 *   - `--body-colour`: {@link string} - CSS property:`color`
 *   - `--body-font-family`: {@link string} - CSS property:`font-family`
 *   - `--body-font-size`: {@link string} - CSS property:`font-size`
 *   - `--body-font-weight`: {@link number} - CSS property:`font-weight`
 *   - 
 *   - `--cell-padding`: {@link string} - CSS property:`padding`
 *   - `--default-width`: {@link string} - CSS property:`width`
 *   - `--padding`: {@link string} - CSS property:`padding`
 * 
 * Wrapper for instantiating an object at {@link ve.registry.themes}[`arg0_theme_key`].
 * 
 * @memberof ve
 * @namespace ve.Theme
 * @type {ve.Theme}
 */
ve.Theme = class {
	constructor (arg0_theme_key, arg1_telestyle_obj) { //[WIP] - ve.Theme or Telestyle needs to be documented and tested
		//Convert from parameters
		let theme_key = arg0_theme_key;
		let telestyle_obj = (arg1_telestyle_obj) ? arg1_telestyle_obj : {};
		
		//Check if theme already exists in registry, if not, add it
		if (ve.registry.themes[theme_key]) {
			console.error(`Vercengen theme ${theme_key} already exists in registry as:`, ve.registry.themes[theme_key]);
		} else {
			ve.registry.themes[theme_key] = telestyle_obj;
		}
	}
};

//Functional binding

/**
 * @returns {ve.Theme}
 */
veTheme = function () {
	//Return statement
	return new ve.Theme(...arguments);
};