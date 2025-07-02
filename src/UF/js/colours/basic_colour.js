//Colours framework
{
  /*
    componentToHex() - Fetches the hex of a single component.
    c: (Number) - The individual r/g/b component to pass to the function.

    Returns: (String)
  */
  global.componentToHex = function (c) {
    var hex = c.toString(16);

    //Return statement
    return hex.length == 1 ? "0" + hex : hex;
  }

  global.decodeRGBAAsNumber = function (arg0_rgba) {
    //Convert from parameters
    var rgba = arg0_rgba;

    //Declare local instance variables
    var r = rgba[0];
    var g = rgba[1];
    var b = rgba[2];
    var a = rgba[3];

    //Return statement (rebuild 32-bit integer)
    return ((r << 24) | (g << 16) | (b << 8) | a) >>> 0;
  };

  /*
    deltaE() - Calculates the deltaE between two RGB values
    rgbA: (Array<Number, Number, Number>) - The 1st RGB code to pass.
    rgbB: (Array<Number, Number, Number>) - The 2nd RGB code to pass.

    Returns: (Number)
  */
  function deltaE (rgbA, rgbB) {
    var labA = RGB2Lab(rgbA);
    var labB = RGB2Lab(rgbB);
    var deltaL = labA[0] - labB[0];
    var deltaA = labA[1] - labB[1];
    var deltaB = labA[2] - labB[2];
    var c1 = Math.sqrt(labA[1] * labA[1] + labA[2] * labA[2]);
    var c2 = Math.sqrt(labB[1] * labB[1] + labB[2] * labB[2]);
    var deltaC = c1 - c2;
    var deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
    deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
    var sc = 1.0 + 0.045 * c1;
    var sh = 1.0 + 0.015 * c1;
    var deltaLKlsl = deltaL / (1.0);
    var deltaCkcsc = deltaC / (sc);
    var deltaHkhsh = deltaH / (sh);
    var i = deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh;

    //Return statement
    return i < 0 ? 0 : Math.sqrt(i);
  }

  function encodeNumberAsRGBA (arg0_number) {
    //Convert from parameters
    var number = returnSafeNumber(Math.round(arg0_number));

    //Declare local instance variables
    var r = (number >> 24) & 0xFF; //Extract highest 8 bits
    var g = (number >> 16) & 0xFF; //Extract next 8 bits
    var b = (number >> 8) & 0xFF;  //Extract next 8 bits
    var a = number & 0xFF;         //Extract lowest 8 bits

    //Return statement
    return [r, g, b, a];
  };

  /*
    generateRandomColour() - Generates a random RGB colour.

    Returns: (Array<Number, Number, Number>)
  */
  function generateRandomColour () {
    //Return statement
    return [randomNumber(0, 255), randomNumber(0, 255), randomNumber(0, 255)];
  }

  /*
    getColourDistance() - Fetches the absolute colour distance between two colours.
    arg0_rgb: (Array<Number, Number, Number>) - The 1st RGB code to pass

    arg1_rgb: (Array<Number, Number, Number>) - The 2nd RGB code to pass.
    Returns: (Number)
  */
  function getColourDistance (arg0_rgb, arg1_rgb) {
    //Convert from parameters
    var colour_one = arg0_rgb;
    var colour_two = arg1_rgb;

    //Declare local instance variables
    var distance = Math.sqrt(
      Math.pow((colour_one[0] - colour_two[0]), 2) +
      Math.pow((colour_one[1] - colour_two[1]), 2) +
      Math.pow((colour_one[2] - colour_two[2]), 2)
    );

    //Return statement
    return distance;
  }

  /*
    hexToRGB() - Converts a hex to RGB.
    hex: (String) - The hex code to pass to the function.

    Returns: (Array<Number, Number, Number>)
  */
  function hexToRGB (hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    //Return statement
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : undefined;
  }

  /*
    RGBToHex() - Converts an RGB value to hex.
    r: (Number) - The r value.
    g: (Number) - The g value.
    b: (Number) - The b value.

    Returns: (String)
  */
  function RGBToHex (r, g, b) {
    //Convert from parameters
    if (Array.isArray(r)) { //This is an RGB array instead
      g = r[1];
      b = r[2];
      r = r[0];
    }

    //Return statement
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
  }

  /*
    RGB2Lab() - Converts an RGB value to lab distance.
    rgb: (Array<Number, Number, Number>) - The RGB value to pass.

    Returns: (Array<Number, Number, Number>)
  */
  function RGB2Lab (rgb) {
    let r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255, x, y, z;
    r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
    x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
    y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
    z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
    x = (x > 0.008856) ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
    y = (y > 0.008856) ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
    z = (z > 0.008856) ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;

    //Return statement
    return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)]
  }
}
