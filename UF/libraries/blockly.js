let Blockly;

try {
	// When running in browser (renderer) context
	if (typeof window !== "undefined") {
		Blockly = require("node-blockly/browser-raw.js");
	} else {
		Blockly = require("node-blockly/_blockly.js");
	}
	
	biBlocks = require(path.join(process.cwd(), "UF/libraries/bi_blockly/blocks/bi_blockly.js"));
	biBlocks(Blockly);
	
	blocklyJS = require("node-blockly/lib/javascript_compressed");
	blocklyJS(Blockly);
	
	biBlocksJS = require(path.join(
		process.cwd(),
		"UF/libraries/bi_blockly/generators/javascript/bi_blockly.js"
	));
	biBlocksJS(Blockly);
	
	js2blocks = require(path.join(process.cwd(), "UF/libraries/js2blocks.mjs"));
	
	console.log("Blockly loaded successfully");
	module.exports = Blockly;
} catch (error) {
	console.error("Blockly load error:", error);
}