let Blockly;
if (typeof window !== 'undefined') {
	Blockly = require('./node_modules/node-blockly/browser-raw.js');
} else {
	Blockly = require('./node_modules/node-blockly/_blockly.js');
}
const biBlocks = require('./UF/libraries/bi_blockly/blocks/bi_blockly.js')
biBlocks(Blockly);

const blocklyJS = require('./node_modules/node-blockly/lib/javascript_compressed');
blocklyJS(Blockly);

const biBlocksJS = require('./UF/libraries/bi_blockly/generators/javascript/bi_blockly.js')
biBlocksJS(Blockly);

const js2blocks = require("./UF/libraries/js2blocks.mjs");

console.log("Blockly")

module.exports = Blockly;