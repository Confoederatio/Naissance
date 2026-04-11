//Initialise functions
{
	if (!global.Colour)
		/**
		 * The namespace for all UF/Colour utility functions, typically for static methods.
		 * 
		 * @namespace Colour
		 */
		global.Colour = {};
	
	/**
	 * Converts a single component to hex.
	 * @alias Colour.componentToHex
	 * 
	 * @param {number} arg0_hex_component
	 * 
	 * @returns {string}
	 */
	Colour.componentToHex = function (arg0_hex_component) {
		//Convert from parameters
		let hex = arg0_hex_component.toString(16);
		
		//Return statement
		return (hex.length === 1) ? "0" + hex : hex;
	}
	
	/**
	 * Converts a hex string to RGB.
	 * @alias Colour.convertHexToRGB
	 *
	 * @param {string} arg0_hex
	 * 
	 * @returns {number[]}
	 */
	Colour.convertHexToRGB = function (arg0_hex) {
		//Convert from parameters
		let hex = arg0_hex;
		
		//Internal guard clause if hex is already an array
		if (Array.isArray(hex)) return hex;
		
		//Clear leading #
		hex = hex.replace("#", "");
		
		//Handle shorthand hex like #abc
		if (hex.length === 3)
			hex = hex
			.split("")
			.map((c) => c + c)
			.join("");
		
		//Extract R, G, B
		let r = parseInt(hex.slice(0, 2), 16);
		let g = parseInt(hex.slice(2, 4), 16);
		let b = parseInt(hex.slice(4, 6), 16);
		
		//Return statement
		return [r, g, b];
	};
	
	/**
	 * Converts a hex string to RGBA.
	 * @alias Colour.convertHexToRGBA
	 *
	 * @param {string} arg0_hex
	 * 
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
	 * @alias Colour.convertRGBAToHex
	 *
	 * @param {number[]|string} arg0_rgba
	 * 
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
	 * @alias Colour.convertRGBToHex
	 *
	 * @param {number[]|string} arg0_rgb
	 * 
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
	
	/**
	 * Decodes an RGBA pixel to a number.
	 * @alias Colour.decodeRGBAAsNumber
	 * 
	 * @param {number[]} arg0_rgba
	 * 
	 * @returns {number}
	 */
	Colour.decodeRGBAAsNumber = function (arg0_rgba) {
		//Convert from parameters
		let rgba = arg0_rgba;
		
		//Declare local instance variables
		let r = rgba[0];
		let g = rgba[1];
		let b = rgba[2];
		let a = rgba[3];
		
		//Return statement (rebuild 32-bit integer)
		return ((r << 24) | (g << 16) | (b << 8) | a) >>> 0;
	};
	
	/**
	 * Calculates the deltaE between two RGB values.
	 * @alias Colour.deltaE
	 * 
	 * @param {number[]} arg0_rgb
	 * @param {number[]} arg1_rgb
	 * 
	 * @returns {number}
	 */
	Colour.deltaE = function (arg0_rgb, arg1_rgb) {
		//Convert from parameters
		let labA = Colour.RGBToLab(arg0_rgb);
		let labB = Colour.RGBToLab(arg1_rgb);
		
		//Declare local instance variables
		let deltaL = labA[0] - labB[0];
		let deltaA = labA[1] - labB[1];
		let deltaB = labA[2] - labB[2];
		let c1 = Math.sqrt(labA[1]*labA[1] + labA[2]*labA[2]);
		let c2 = Math.sqrt(labB[1]*labB[1] + labB[2]*labB[2]);
		let deltaC = c1 - c2;
		let deltaH = deltaA*deltaA + deltaB*deltaB - deltaC*deltaC;
		deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
		let sc = 1.0 + 0.045*c1;
		let sh = 1.0 + 0.015*c1;
		let deltaLKlsl = deltaL/(1.0);
		let deltaCkcsc = deltaC/(sc);
		let deltaHkhsh = deltaH/(sh);
		let i = deltaLKlsl*deltaLKlsl + deltaCkcsc*deltaCkcsc + deltaHkhsh*deltaHkhsh;
		
		//Return statement
		return (i < 0) ? 0 : Math.sqrt(i);
	};
	
	/**
	 * Returns a random [R, G, B] colour.
	 * @alias Colour.generateRandomColour
	 * 
	 * @returns {number[]}
	 */
	Colour.generateRandomColour = function () {
		//Return statement
		return [Math.randomNumber(0, 255), Math.randomNumber(0, 255), Math.randomNumber(0, 255)];
	};
	
	/**
	 * Returns the actual [R, G, B, A] colour of a given string. Depends on a browser/HTML context to work.
	 * @alias Colour.getColour
	 * 
	 * @param {any} arg0_colour
	 * 
	 * @returns {number[]|any}
	 */
	Colour.getColour = function (arg0_colour) {
		//Convert from parameters
		let colour = arg0_colour;
		
		if (Array.isArray(colour)) return colour; //Internal guard clause if the colour is already an array
		
		try {
			//Declare local instance variables
			let colour_el = document.createElement("div");
				colour_el.style.color = colour;
			document.body.appendChild(colour_el);	
			
			let actual_colour = window.getComputedStyle(colour_el).color;
				colour_el.remove();
			
			if (actual_colour.startsWith("rgb(") || actual_colour.startsWith("rgba(")) {
				actual_colour = actual_colour.replace("rgb(", "")
					.replace("rgba(", "")
					.replace(")", "");
				actual_colour = actual_colour.split(",");
				
				//Iterate over actual_colour and set it
				for (let i = 0; i < actual_colour.length; i++)
					actual_colour[i] = parseFloat(actual_colour[i].trim());
				if (actual_colour.length >= 4)
					actual_colour[3] *= 255;
			}
			
			//Return statement
			return actual_colour;
		} catch (e) { console.error(e); }
		
		//Return statement
		if (Colour._map[colour]) colour = Colour._map[colour];
		return Colour.convertHexToRGBA(colour);
	};
	
	/**
	 * Returns the best text colour given a certain colour background. Either 'black'/'white'.
	 * @alias Colour.getBestTextColour
	 * 
	 * @param {number[]|string} arg0_colour
	 * @param {Object} [arg1_options]
	 *  @param {boolean} [arg1_options.return_rgb=false]
	 * 
	 * @returns {number[]|string}
	 */
	Colour.getBestTextColour = function (arg0_colour, arg1_options) {
		//Convert from parameters
		let colour = Colour.getColour(arg0_colour);
		let options = (arg1_options) ? arg1_options : {};
		
		//Declare local instance variables
		let luminance = Colour.getLuminance(colour);
		
		let best_colour = (luminance > 0.179) ? "black" : "white";
		
		//Return statement
		if (options.return_rgb) {
			if (best_colour === "black") return [0, 0, 0];
			if (best_colour === "white") return [255, 255, 255];
		}
		return best_colour;
	};
	
	/**
	 * Encodes a number as an RGBA pixel.
	 * @alias Colour.encodeNumberAsRGBA
	 * 
	 * @param {number} arg0_number
	 * @returns {number[]}
	 */
	Colour.encodeNumberAsRGBA = function (arg0_number) {
		//Convert from parameters
		let number = Math.returnSafeNumber(Math.ceil(arg0_number));
		
		//Declare local instance variables
		let r = (number >> 24) & 0xFF; //Extract highest 8 bits
		let g = (number >> 16) & 0xFF; //Extract next 8 bits
		let b = (number >> 8) & 0xFF;  //Extract next 8 bits
		let a = number & 0xFF;         //Extract lowest 8 bits
		
		//Return statement
		return [r, g, b, a];
	};
	
	/**
	 * Returns the luminance of a given colour.
	 * @alias Colour.getLuminance
	 * 
	 * @param {number[]|string} arg0_colour
	 * 
	 * @returns {number}
	 */
	Colour.getLuminance = function (arg0_colour) {
		//Convert from parameters
		let colour = Colour.getColour(arg0_colour);
		
		//Declare local instance variables
		let a = colour.map((v) => {
			v /= 255;
			return v <= 0.03928 ? v/12.92 : Math.pow((v + 0.055)/1.055, 2.4);
		});
		
		//Return statement
		return a[0]*0.2126 + a[1]*0.7152 + a[2]*0.0722;
	};
	
	/**
	 * Returns a random hex colour.
	 * @alias Colour.randomHex
	 * 
	 * @returns {string}
	 */
	Colour.randomHex = function () {
		//Return statement
		return Colour.convertRGBToHex(Colour.randomRGB());
	};
	
	/**
	 * Returns a random RGB colour.
	 * @alias Colour.randomRGBA
	 * 
	 * @returns {number[]}
	 */
	Colour.randomRGB = function () {
		//Return statement
		return [
			Math.randomNumber(0, 255),
			Math.randomNumber(0, 255),
			Math.randomNumber(0, 255)
		];
	};
	
	/**
	 * Returns a random RGBA colour.
	 * 
	 * @returns {number[]}
	 */
	Colour.randomRGBA = function () {
		return [
			Math.randomNumber(0, 255),
			Math.randomNumber(0, 255),
			Math.randomNumber(0, 255),
			Math.randomNumber(0, 255)
		];
	};
	
	/**
	 * Converts an RGB value to Lab distance.
	 * @alias Colour.RGBToLab
	 * 
	 * @param {number[]} arg0_rgb
	 * 
	 * @returns {number[]}
	 */
	Colour.RGBToLab = function (arg0_rgb) {
		//Convert from parameters
		let rgb = arg0_rgb;
		
		//Declare local instance variables
		let r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255, x, y, z;
		r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
		g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
		b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
		x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
		y = (r * 0.2126 + g * 0.7152 + b * 0.0722);
		z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
		x = (x > 0.008856) ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
		y = (y > 0.008856) ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
		z = (z > 0.008856) ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;
		
		//Return statement
		return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)]
	}
}