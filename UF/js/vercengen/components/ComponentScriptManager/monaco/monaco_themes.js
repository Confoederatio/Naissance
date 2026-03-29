var MonacoThemes = (function(exports, fast_plist) {

//#region rolldown:runtime
	var __create = Object.create;
	var __defProp = Object.defineProperty;
	var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
	var __getOwnPropNames = Object.getOwnPropertyNames;
	var __getProtoOf = Object.getPrototypeOf;
	var __hasOwnProp = Object.prototype.hasOwnProperty;
	var __copyProps = (to, from, except, desc) => {
		if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
			key = keys[i];
			if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
				get: ((k) => from[k]).bind(null, key),
				enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
			});
		}
		return to;
	};
	var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
		value: mod,
		enumerable: true
	}) : target, mod));

//#endregion
	fast_plist = __toESM(fast_plist);

//#region src/index.ts
	/**
	 * Taken from ACE editor
	 */
	function rgbColor(color) {
		if (typeof color === "object") return color;
		if (color[0] === "#") return color.match(/^#(..)(..)(..)/).slice(1).map((c) => parseInt(c, 16));
		else return color.match(/\(([^,]+),([^,]+),([^,]+)/).slice(1).map((c) => parseInt(c, 10));
	}
	function darkness(color) {
		const rgb = rgbColor(color);
		return (.21 * rgb[0] + .72 * rgb[1] + .07 * rgb[2]) / 255;
	}
	function parseColor(color) {
		if (!color.length) return null;
		let normalizedColor = color;
		if (normalizedColor.length === 4) normalizedColor = normalizedColor.replace(/[a-fA-F\d]/g, "$&$&");
		if (normalizedColor.length === 7) return normalizedColor;
		if (normalizedColor.length === 9) return normalizedColor;
		else {
			const match = normalizedColor.match(/^#(..)(..)(..)(..)$/);
			if (!match) {
				console.error("can't parse color", normalizedColor);
				return null;
			}
			const rgba = match.slice(1).map((c) => parseInt(c, 16));
			rgba[3] = parseFloat((rgba[3] / 255).toPrecision(2));
			return `rgba(${rgba.join(", ")})`;
		}
	}
	const COLOR_MAP = [
		{
			tm: "foreground",
			mn: "editor.foreground"
		},
		{
			tm: "background",
			mn: "editor.background"
		},
		{
			tm: "selection",
			mn: "editor.selectionBackground"
		},
		{
			tm: "inactiveSelection",
			mn: "editor.inactiveSelectionBackground"
		},
		{
			tm: "selectionHighlightColor",
			mn: "editor.selectionHighlightBackground"
		},
		{
			tm: "findMatchHighlight",
			mn: "editor.findMatchHighlightBackground"
		},
		{
			tm: "currentFindMatchHighlight",
			mn: "editor.findMatchBackground"
		},
		{
			tm: "hoverHighlight",
			mn: "editor.hoverHighlightBackground"
		},
		{
			tm: "wordHighlight",
			mn: "editor.wordHighlightBackground"
		},
		{
			tm: "wordHighlightStrong",
			mn: "editor.wordHighlightStrongBackground"
		},
		{
			tm: "findRangeHighlight",
			mn: "editor.findRangeHighlightBackground"
		},
		{
			tm: "findMatchHighlight",
			mn: "peekViewResult.matchHighlightBackground"
		},
		{
			tm: "referenceHighlight",
			mn: "peekViewEditor.matchHighlightBackground"
		},
		{
			tm: "lineHighlight",
			mn: "editor.lineHighlightBackground"
		},
		{
			tm: "rangeHighlight",
			mn: "editor.rangeHighlightBackground"
		},
		{
			tm: "caret",
			mn: "editorCursor.foreground"
		},
		{
			tm: "invisibles",
			mn: "editorWhitespace.foreground"
		},
		{
			tm: "guide",
			mn: "editorIndentGuide.background"
		},
		{
			tm: "activeGuide",
			mn: "editorIndentGuide.activeBackground"
		},
		{
			tm: "selectionBorder",
			mn: "editor.selectionHighlightBorder"
		}
	];
	const ansiColorMap = [
		"ansiBlack",
		"ansiRed",
		"ansiGreen",
		"ansiYellow",
		"ansiBlue",
		"ansiMagenta",
		"ansiCyan",
		"ansiWhite",
		"ansiBrightBlack",
		"ansiBrightRed",
		"ansiBrightGreen",
		"ansiBrightYellow",
		"ansiBrightBlue",
		"ansiBrightMagenta",
		"ansiBrightCyan",
		"ansiBrightWhite"
	];
	ansiColorMap.forEach((color) => {
		COLOR_MAP.push({
			tm: color,
			mn: "terminal." + color
		});
	});
	const GUTTER_COLOR_MAP = [];
	/**
	 * @param rawTmThemeString - The contents read from a tmTheme file.
	 * @returns A monaco compatible theme definition. See https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.istandalonethemedata.html
	 */
	function parseTmTheme(rawTmThemeString) {
		const rawData = fast_plist.parse(rawTmThemeString);
		const globalSettings = rawData.settings[0]?.settings || {};
		const gutterSettings = rawData.gutterSettings;
		const rules = [];
		rawData.settings.forEach((setting) => {
			if (!setting.settings) return;
			let scopes;
			if (typeof setting.scope === "string") scopes = setting.scope.replace(/^[,]+/, "").replace(/[,]+$/, "").split(",");
			else if (Array.isArray(setting.scope)) scopes = setting.scope;
			else scopes = [""];
			const rule = {};
			const settings = setting.settings;
			if (settings.foreground) {
				const foregroundColor = parseColor(settings.foreground);
				if (foregroundColor) rule.foreground = foregroundColor.toLowerCase().replace("#", "");
			}
			if (settings.background) {
				const backgroundColor = parseColor(settings.background);
				if (backgroundColor) rule.background = backgroundColor.toLowerCase().replace("#", "");
			}
			if (settings.fontStyle && typeof settings.fontStyle === "string") rule.fontStyle = settings.fontStyle;
			scopes.forEach((scope) => {
				if (!scope || !Object.keys(rule).length) return;
				const r = {
					...rule,
					token: scope.trim()
				};
				rules.push(r);
			});
		});
		const globalColors = {};
		COLOR_MAP.forEach((obj) => {
			if (globalSettings[obj.tm]) {
				const color = parseColor(globalSettings[obj.tm]);
				if (color) globalColors[obj.mn] = color;
			}
		});
		if (gutterSettings) GUTTER_COLOR_MAP.forEach((obj) => {
			if (gutterSettings[obj.tm]) {
				const color = parseColor(gutterSettings[obj.tm]);
				if (color) globalColors[obj.mn] = color;
			}
		});
		const editorBg = globalColors["editor.background"];
		const base = editorBg && darkness(editorBg) < .5 ? "vs-dark" : "vs";
		return {
			base,
			inherit: true,
			rules,
			colors: globalColors
		};
	}

//#endregion
	exports.parseTmTheme = parseTmTheme;
	return exports;
})({});
//# sourceMappingURL=monaco-themes.js.map