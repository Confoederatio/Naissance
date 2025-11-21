//Initialise functions
{
	if (!global.Colour) global.Colour = {};
	
	/**
	 * Converts a hex string to RGB.
	 *
	 * @param {string} arg0_hex
	 * @returns {number[]}
	 */
	Colour.convertHexToRGB = function (arg0_hex) {
		// Convert from parameters
		let hex = arg0_hex;
		
		// Internal guard clause if hex is already an array
		if (Array.isArray(hex)) return hex;
		
		// Clear leading #
		hex = hex.replace("#", "");
		
		// Handle shorthand hex like #abc
		if (hex.length === 3)
			hex = hex
			.split("")
			.map((c) => c + c)
			.join("");
		
		// Extract R, G, B
		let r = parseInt(hex.slice(0, 2), 16);
		let g = parseInt(hex.slice(2, 4), 16);
		let b = parseInt(hex.slice(4, 6), 16);
		
		// Return as RGB array
		return [r, g, b];
	};
	
	/**
	 * Converts a hex string to RGBA.
	 *
	 * @param {string} arg0_hex
	 * @returns {number[]}
	 */
	Colour.convertHexToRGBA = function (arg0_hex) {
		//Convert from parameters
		let hex = arg0_hex;
		
		//Internal guard clause if hex is of type Array
		if (Array.isArray(hex)) return hex;
		
		//Declare local instance variables
		let alpha = 255;
		
		hex = hex.replace("#", "");
		if (hex.length === 3 || hex.length === 4)
			hex = hex.split("").map((c) => c + c).join("");
		
		//Process hex
		let r = parseInt(hex.slice(0, 2), 16);
		let g = parseInt(hex.slice(2, 4), 16);
		let b = parseInt(hex.slice(4, 6), 16);
		
		if (hex.length === 6) //RGB
			//Return statement
			return [r, g, b, 1];
		if (hex.length === 8) //RGBA
			return [r, g, b, parseInt(hex.slice(6, 8), 16)/255 ];
	};
	
	/**
	 * Converts an RGBA Array to hex.
	 *
	 * @param {number[]|string} arg0_rgba
	 * @returns {string}
	 */
	Colour.convertRGBAToHex = function (arg0_rgba) {
		//Convert from parameters
		let rgba = arg0_rgba;
		
		//Internal guard clause if rgba is of type string and begins with #
		if (typeof rgba === "string" && rgba.startsWith("#")) return rgba;
		
		//Declare local instance variables
		rgba = rgba.slice(); //Copy to avoid mutating input
		
		//Clamp R, G, B values
		rgba[0] = Math.max(0, Math.min(255, rgba[0]));
		rgba[1] = Math.max(0, Math.min(255, rgba[1]));
		rgba[2] = Math.max(0, Math.min(255, rgba[2]));
		
		//Handle alpha
		if (!(rgba[3] === undefined || rgba[3] > 1))
			if (rgba[3] <= 1) rgba[3] = Math.round(rgba[3]*255);
		
		//Return statement; no alpha, just #rrggbb
		return `#${rgba.map((c) => c.toString(16).padStart(2, "0")).join("").toLowerCase()}`;
	};
	
	/**
	 * Converts an RGB Array to a hex string.
	 *
	 * @param {number[]|string} arg0_rgb
	 * @returns {string}
	 */
	Colour.convertRGBToHex = function (arg0_rgb) {
		// Convert from parameters
		let rgb = arg0_rgb;
		
		// Internal guard clause if input is already a hex string
		if (typeof rgb === "string" && rgb.startsWith("#")) return rgb;
		
		// Copy array to avoid mutation
		try {
			rgb = rgb.slice();
		} catch (e) { 
			console.error("RGB:", rgb, e); 
		}
		
		// Clamp each value between 0 and 255
		rgb[0] = Math.max(0, Math.min(255, rgb[0]));
		rgb[1] = Math.max(0, Math.min(255, rgb[1]));
		rgb[2] = Math.max(0, Math.min(255, rgb[2]));
		
		// Return hex string in format #rrggbb
		return `#${rgb
		.map((c) => c.toString(16).padStart(2, "0"))
		.join("")
		.toLowerCase()}`;
	};
}