//Initialise Monaco
async function initMonaco() {
	//Save Node.js require 
	try { global.node_require = require; } catch (e) {}
	
	return new Promise((resolve, reject) => {
		// 1. Environment Detection
		const isElectron =
			typeof process !== "undefined" &&
			process.versions &&
			!!process.versions.electron;
		const isNode = typeof require !== "undefined" && !!require.extensions;
		
		let monacoPath;
		
		if (isElectron) {
			// In Electron, we use the local filesystem path
			const path = require("path");
			// Use your specific path: 'libraries/monaco/min/vs'
			// We must ensure the path is absolute and uses correct slashes
			monacoPath = path
			.join(process.cwd(), "UF/libraries/monaco/min/vs")
			.replace(/\\/g, "/");
			
			// Fix for Windows: Ensure it doesn't start with a leading slash 
			// which causes the \\D: error
			if (/^[A-Z]:/i.test(monacoPath)) {
				// It's a windows path, keep as is
			} else if (!monacoPath.startsWith("file://")) {
				monacoPath = "file://" + monacoPath;
			}
		} else {
			// In Browser/Web, use the CDN
			monacoPath = "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs";
		}
		
		// 2. Load the loader.js script
		const loaderScript = document.createElement("script");
		loaderScript.src = `${monacoPath}/loader.js`;
		
		loaderScript.onload = () => {
			window.monaco_require = window.require;
			
			window.monaco_require.config({
				paths: { vs: monacoPath },
				"vs/nls": { availableLanguages: { "*": "" } },
			});
			
			/**
			 * DEFINITIVE FIX FOR 0.55.1
			 * We manually define the product module that the core commands expect.
			 * This must be called BEFORE window.monaco_require(["vs/editor/editor.main"], ...)
			 */
			window.monaco_require.define(
				"vs/platform/product/common/product",
				[],
				function () {
					return {
						product: {
							urlProtocol: "vscode",
							version: "0.55.1",
							nameShort: "Monaco",
							nameLong: "Monaco Editor",
							// Add these specifically for 0.55.x clipboard logic
							commit: "unknown",
							date: new Date().toISOString(),
						},
					};
				},
			);
			
			// In some builds of 0.55.1, the service also looks for this path
			window.monaco_require.define(
				"vs/platform/product/browser/browserProductService",
				["vs/platform/product/common/product"],
				function (m) {
					return m;
				},
			);
			
			// 4. Now load the Main module
			window.monaco_require(["vs/editor/editor.main"], () => {
				resolve(window.monaco);
			});
		};
		
		loaderScript.onerror = reject;
		document.body.appendChild(loaderScript);
	});
}
initMonaco().then(() => {
	try {
		global.require = global.node_require;
	} catch (e) {}
});