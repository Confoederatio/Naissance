// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/5/LICENSE

(function(mod) {
	if (typeof exports == "object" && typeof module == "object") // CommonJS
		mod(require("../../lib/codemirror"));
	else if (typeof define == "function" && define.amd) // AMD
		define(["../../lib/codemirror"], mod);
	else // Plain browser env
		mod(CodeMirror);
})(function(CodeMirror) {
	"use strict";
	
	function doFold(cm, pos, options, force) {
		if (options && options.call) {
			var finder = options;
			options = null;
		} else {
			var finder = getOption(cm, options, "rangeFinder");
		}
		if (typeof pos == "number") pos = CodeMirror.Pos(pos, 0);
		var minSize = getOption(cm, options, "minFoldSize");
		
		function getRange(allowFolded) {
			var range = finder(cm, pos);
			if (!range || range.to.line - range.from.line < minSize) return null;
			if (force === "fold") return range;
			
			var marks = cm.findMarksAt(range.from);
			for (var i = 0; i < marks.length; ++i) {
				if (marks[i].__isFold) {
					if (!allowFolded) return null;
					range.cleared = true;
					marks[i].clear();
				}
			}
			return range;
		}
		
		var range = getRange(true);
		if (getOption(cm, options, "scanUp")) while (!range && pos.line > cm.firstLine()) {
			pos = CodeMirror.Pos(pos.line - 1, 0);
			range = getRange(false);
		}
		if (!range || range.cleared || force === "unfold") return;
		
		var myWidget = makeWidget(cm, options, range);
		CodeMirror.on(myWidget, "mousedown", function(e) {
			myRange.clear();
			CodeMirror.e_preventDefault(e);
		});
		var myRange = cm.markText(range.from, range.to, {
			replacedWith: myWidget,
			clearOnEnter: getOption(cm, options, "clearOnEnter"),
			__isFold: true
		});
		myRange.on("clear", function(from, to) {
			CodeMirror.signal(cm, "unfold", cm, from, to);
		});
		CodeMirror.signal(cm, "fold", cm, range.from, range.to);
	}
	
	function makeWidget(cm, options, range) {
		var widget = getOption(cm, options, "widget");
		
		if (typeof widget == "function") {
			widget = widget(range.from, range.to);
		}
		
		if (typeof widget == "string") {
			var text = document.createTextNode(widget);
			widget = document.createElement("span");
			widget.appendChild(text);
			widget.className = "CodeMirror-foldmarker";
		} else if (widget) {
			widget = widget.cloneNode(true)
		}
		return widget;
	}
	
	// Clumsy backwards-compatible interface
	CodeMirror.newFoldFunction = function(rangeFinder, widget) {
		return function(cm, pos) { doFold(cm, pos, {rangeFinder: rangeFinder, widget: widget}); };
	};
	
	// New-style interface
	CodeMirror.defineExtension("foldCode", function(pos, options, force) {
		doFold(this, pos, options, force);
	});
	
	CodeMirror.defineExtension("isFolded", function(pos) {
		var marks = this.findMarksAt(pos);
		for (var i = 0; i < marks.length; ++i)
			if (marks[i].__isFold) return true;
	});
	
	CodeMirror.commands.toggleFold = function(cm) {
		cm.foldCode(cm.getCursor());
	};
	CodeMirror.commands.fold = function(cm) {
		cm.foldCode(cm.getCursor(), null, "fold");
	};
	CodeMirror.commands.unfold = function(cm) {
		cm.foldCode(cm.getCursor(), { scanUp: false }, "unfold");
	};
	CodeMirror.commands.foldAll = function(cm) {
		cm.operation(function() {
			for (var i = cm.firstLine(), e = cm.lastLine(); i <= e; i++)
				cm.foldCode(CodeMirror.Pos(i, 0), { scanUp: false }, "fold");
		});
	};
	CodeMirror.commands.unfoldAll = function(cm) {
		cm.operation(function() {
			for (var i = cm.firstLine(), e = cm.lastLine(); i <= e; i++)
				cm.foldCode(CodeMirror.Pos(i, 0), { scanUp: false }, "unfold");
		});
	};
	
	CodeMirror.registerHelper("fold", "combine", function() {
		var funcs = Array.prototype.slice.call(arguments, 0);
		return function(cm, start) {
			for (var i = 0; i < funcs.length; ++i) {
				var found = funcs[i](cm, start);
				if (found) return found;
			}
		};
	});
	
	CodeMirror.registerHelper("fold", "auto", function(cm, start) {
		var helpers = cm.getHelpers(start, "fold");
		for (var i = 0; i < helpers.length; i++) {
			var cur = helpers[i](cm, start);
			if (cur) return cur;
		}
	});
	
	var defaultOptions = {
		rangeFinder: CodeMirror.fold.auto,
		widget: "\u2194",
		minFoldSize: 0,
		scanUp: false,
		clearOnEnter: true
	};
	
	CodeMirror.defineOption("foldOptions", null);
	
	function getOption(cm, options, name) {
		if (options && options[name] !== undefined)
			return options[name];
		var editorOptions = cm.options.foldOptions;
		if (editorOptions && editorOptions[name] !== undefined)
			return editorOptions[name];
		return defaultOptions[name];
	}
	
	CodeMirror.defineExtension("foldOption", function(options, name) {
		return getOption(this, options, name);
	});
});

(function(mod) {
	if (typeof exports == "object" && typeof module == "object") // CommonJS
		mod(require("../../lib/codemirror"));
	else if (typeof define == "function" && define.amd) // AMD
		define(["../../lib/codemirror"], mod);
	else // Plain browser env
		mod(CodeMirror);
})(function(CodeMirror) {
	"use strict";
	
	CodeMirror.registerHelper("fold", "brace", function(cm, start) {
		var line = start.line, lineText = cm.getLine(line);
		var startCh, tokenType;
		
		function findOpening(openCh) {
			for (var at = start.ch, pass = 0;;) {
				var found = at <= 0 ? -1 : lineText.lastIndexOf(openCh, at - 1);
				if (found == -1) {
					if (pass == 1) break;
					pass = 1;
					at = lineText.length;
					continue;
				}
				if (pass == 1 && found < start.ch) break;
				tokenType = cm.getTokenTypeAt(CodeMirror.Pos(line, found + 1));
				if (!/^(comment|string)/.test(tokenType)) return found + 1;
				at = found - 1;
			}
		}
		
		var startToken = "{", endToken = "}", startCh = findOpening("{");
		if (startCh == null) {
			startToken = "[", endToken = "]";
			startCh = findOpening("[");
		}
		
		if (startCh == null) return;
		var count = 1, lastLine = cm.lastLine(), end, endCh;
		outer: for (var i = line; i <= lastLine; ++i) {
			var text = cm.getLine(i), pos = i == line ? startCh : 0;
			for (;;) {
				var nextOpen = text.indexOf(startToken, pos), nextClose = text.indexOf(endToken, pos);
				if (nextOpen < 0) nextOpen = text.length;
				if (nextClose < 0) nextClose = text.length;
				pos = Math.min(nextOpen, nextClose);
				if (pos == text.length) break;
				if (cm.getTokenTypeAt(CodeMirror.Pos(i, pos + 1)) == tokenType) {
					if (pos == nextOpen) ++count;
					else if (!--count) { end = i; endCh = pos; break outer; }
				}
				++pos;
			}
		}
		if (end == null || line == end && endCh == startCh) return;
		return {from: CodeMirror.Pos(line, startCh),
			to: CodeMirror.Pos(end, endCh)};
	});
	
	CodeMirror.registerHelper("fold", "import", function(cm, start) {
		function hasImport(line) {
			if (line < cm.firstLine() || line > cm.lastLine()) return null;
			var start = cm.getTokenAt(CodeMirror.Pos(line, 1));
			if (!/\S/.test(start.string)) start = cm.getTokenAt(CodeMirror.Pos(line, start.end + 1));
			if (start.type != "keyword" || start.string != "import") return null;
			// Now find closing semicolon, return its position
			for (var i = line, e = Math.min(cm.lastLine(), line + 10); i <= e; ++i) {
				var text = cm.getLine(i), semi = text.indexOf(";");
				if (semi != -1) return {startCh: start.end, end: CodeMirror.Pos(i, semi)};
			}
		}
		
		var start = start.line, has = hasImport(start), prev;
		if (!has || hasImport(start - 1) || ((prev = hasImport(start - 2)) && prev.end.line == start - 1))
			return null;
		for (var end = has.end;;) {
			var next = hasImport(end.line + 1);
			if (next == null) break;
			end = next.end;
		}
		return {from: cm.clipPos(CodeMirror.Pos(start, has.startCh + 1)), to: end};
	});
	
	CodeMirror.registerHelper("fold", "include", function(cm, start) {
		function hasInclude(line) {
			if (line < cm.firstLine() || line > cm.lastLine()) return null;
			var start = cm.getTokenAt(CodeMirror.Pos(line, 1));
			if (!/\S/.test(start.string)) start = cm.getTokenAt(CodeMirror.Pos(line, start.end + 1));
			if (start.type == "meta" && start.string.slice(0, 8) == "#include") return start.start + 8;
		}
		
		var start = start.line, has = hasInclude(start);
		if (has == null || hasInclude(start - 1) != null) return null;
		for (var end = start;;) {
			var next = hasInclude(end + 1);
			if (next == null) break;
			++end;
		}
		return {from: CodeMirror.Pos(start, has + 1),
			to: cm.clipPos(CodeMirror.Pos(end))};
	});
	
});


(function(mod) {
	if (typeof exports == "object" && typeof module == "object") // CommonJS
		mod(require("../../lib/codemirror"));
	else if (typeof define == "function" && define.amd) // AMD
		define(["../../lib/codemirror"], mod);
	else // Plain browser env
		mod(CodeMirror);
})(function(CodeMirror) {
	"use strict";
	
	var Pos = CodeMirror.Pos;
	function cmp(a, b) { return a.line - b.line || a.ch - b.ch; }
	
	var nameStartChar = "A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD";
	var nameChar = nameStartChar + "\-\:\.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040";
	var xmlTagStart = new RegExp("<(/?)([" + nameStartChar + "][" + nameChar + "]*)", "g");
	
	function Iter(cm, line, ch, range) {
		this.line = line; this.ch = ch;
		this.cm = cm; this.text = cm.getLine(line);
		this.min = range ? range.from : cm.firstLine();
		this.max = range ? range.to - 1 : cm.lastLine();
	}
	
	function tagAt(iter, ch) {
		var type = iter.cm.getTokenTypeAt(Pos(iter.line, ch));
		return type && /\btag\b/.test(type);
	}
	
	function nextLine(iter) {
		if (iter.line >= iter.max) return;
		iter.ch = 0;
		iter.text = iter.cm.getLine(++iter.line);
		return true;
	}
	function prevLine(iter) {
		if (iter.line <= iter.min) return;
		iter.text = iter.cm.getLine(--iter.line);
		iter.ch = iter.text.length;
		return true;
	}
	
	function toTagEnd(iter) {
		for (;;) {
			var gt = iter.text.indexOf(">", iter.ch);
			if (gt == -1) { if (nextLine(iter)) continue; else return; }
			if (!tagAt(iter, gt + 1)) { iter.ch = gt + 1; continue; }
			var lastSlash = iter.text.lastIndexOf("/", gt);
			var selfClose = lastSlash > -1 && !/\S/.test(iter.text.slice(lastSlash + 1, gt));
			iter.ch = gt + 1;
			return selfClose ? "selfClose" : "regular";
		}
	}
	function toTagStart(iter) {
		for (;;) {
			var lt = iter.ch ? iter.text.lastIndexOf("<", iter.ch - 1) : -1;
			if (lt == -1) { if (prevLine(iter)) continue; else return; }
			if (!tagAt(iter, lt + 1)) { iter.ch = lt; continue; }
			xmlTagStart.lastIndex = lt;
			iter.ch = lt;
			var match = xmlTagStart.exec(iter.text);
			if (match && match.index == lt) return match;
		}
	}
	
	function toNextTag(iter) {
		for (;;) {
			xmlTagStart.lastIndex = iter.ch;
			var found = xmlTagStart.exec(iter.text);
			if (!found) { if (nextLine(iter)) continue; else return; }
			if (!tagAt(iter, found.index + 1)) { iter.ch = found.index + 1; continue; }
			iter.ch = found.index + found[0].length;
			return found;
		}
	}
	function toPrevTag(iter) {
		for (;;) {
			var gt = iter.ch ? iter.text.lastIndexOf(">", iter.ch - 1) : -1;
			if (gt == -1) { if (prevLine(iter)) continue; else return; }
			if (!tagAt(iter, gt + 1)) { iter.ch = gt; continue; }
			var lastSlash = iter.text.lastIndexOf("/", gt);
			var selfClose = lastSlash > -1 && !/\S/.test(iter.text.slice(lastSlash + 1, gt));
			iter.ch = gt + 1;
			return selfClose ? "selfClose" : "regular";
		}
	}
	
	function findMatchingClose(iter, tag) {
		var stack = [];
		for (;;) {
			var next = toNextTag(iter), end, startLine = iter.line, startCh = iter.ch - (next ? next[0].length : 0);
			if (!next || !(end = toTagEnd(iter))) return;
			if (end == "selfClose") continue;
			if (next[1]) { // closing tag
				for (var i = stack.length - 1; i >= 0; --i) if (stack[i] == next[2]) {
					stack.length = i;
					break;
				}
				if (i < 0 && (!tag || tag == next[2])) return {
					tag: next[2],
					from: Pos(startLine, startCh),
					to: Pos(iter.line, iter.ch)
				};
			} else { // opening tag
				stack.push(next[2]);
			}
		}
	}
	function findMatchingOpen(iter, tag) {
		var stack = [];
		for (;;) {
			var prev = toPrevTag(iter);
			if (!prev) return;
			if (prev == "selfClose") { toTagStart(iter); continue; }
			var endLine = iter.line, endCh = iter.ch;
			var start = toTagStart(iter);
			if (!start) return;
			if (start[1]) { // closing tag
				stack.push(start[2]);
			} else { // opening tag
				for (var i = stack.length - 1; i >= 0; --i) if (stack[i] == start[2]) {
					stack.length = i;
					break;
				}
				if (i < 0 && (!tag || tag == start[2])) return {
					tag: start[2],
					from: Pos(iter.line, iter.ch),
					to: Pos(endLine, endCh)
				};
			}
		}
	}
	
	CodeMirror.registerHelper("fold", "xml", function(cm, start) {
		var iter = new Iter(cm, start.line, 0);
		for (;;) {
			var openTag = toNextTag(iter), end;
			if (!openTag || iter.line != start.line || !(end = toTagEnd(iter))) return;
			if (!openTag[1] && end != "selfClose") {
				var start = Pos(iter.line, iter.ch);
				var close = findMatchingClose(iter, openTag[2]);
				return close && {from: start, to: close.from};
			}
		}
	});
	CodeMirror.findMatchingTag = function(cm, pos, range) {
		var iter = new Iter(cm, pos.line, pos.ch, range);
		if (iter.text.indexOf(">") == -1 && iter.text.indexOf("<") == -1) return;
		var end = toTagEnd(iter), to = end && Pos(iter.line, iter.ch);
		var start = end && toTagStart(iter);
		if (!end || end == "selfClose" || !start || cmp(iter, pos) > 0) return;
		var here = {from: Pos(iter.line, iter.ch), to: to, tag: start[2]};
		
		if (start[1]) { // closing tag
			return {open: findMatchingOpen(iter, start[2]), close: here, at: "close"};
		} else { // opening tag
			iter = new Iter(cm, to.line, to.ch, range);
			return {open: here, close: findMatchingClose(iter, start[2]), at: "open"};
		}
	};
	
	CodeMirror.findEnclosingTag = function(cm, pos, range) {
		var iter = new Iter(cm, pos.line, pos.ch, range);
		for (;;) {
			var open = findMatchingOpen(iter);
			if (!open) break;
			var forward = new Iter(cm, pos.line, pos.ch, range);
			var close = findMatchingClose(forward, open.tag);
			if (close) return {open: open, close: close};
		}
	};
	
	// Used by addon/edit/closetag.js
	CodeMirror.scanForClosingTag = function(cm, pos, name, end) {
		var iter = new Iter(cm, pos.line, pos.ch, end ? {from: 0, to: end} : null);
		return !!findMatchingClose(iter, name);
	};
});

(function(mod) {
	if (typeof exports == "object" && typeof module == "object") // CommonJS
		mod(require("../../lib/codemirror"));
	else if (typeof define == "function" && define.amd) // AMD
		define(["../../lib/codemirror"], mod);
	else // Plain browser env
		mod(CodeMirror);
})(function(CodeMirror) {
	"use strict";
	
	CodeMirror.registerGlobalHelper("fold", "comment", function(mode) {
		return mode.blockCommentStart && mode.blockCommentEnd;
	}, function(cm, start) {
		var mode = cm.getModeAt(start), startToken = mode.blockCommentStart, endToken = mode.blockCommentEnd;
		if (!startToken || !endToken) return;
		var line = start.line, lineText = cm.getLine(line);
		
		var startCh;
		for (var at = start.ch, pass = 0;;) {
			var found = at <= 0 ? -1 : lineText.lastIndexOf(startToken, at - 1);
			if (found == -1) {
				if (pass == 1) return;
				pass = 1;
				at = lineText.length;
				continue;
			}
			if (pass == 1 && found < start.ch) return;
			if (/comment/.test(cm.getTokenTypeAt(CodeMirror.Pos(line, found + 1)))) {
				startCh = found + startToken.length;
				break;
			}
			at = found - 1;
		}
		
		var depth = 1, lastLine = cm.lastLine(), end, endCh;
		outer: for (var i = line; i <= lastLine; ++i) {
			var text = cm.getLine(i), pos = i == line ? startCh : 0;
			for (;;) {
				var nextOpen = text.indexOf(startToken, pos), nextClose = text.indexOf(endToken, pos);
				if (nextOpen < 0) nextOpen = text.length;
				if (nextClose < 0) nextClose = text.length;
				pos = Math.min(nextOpen, nextClose);
				if (pos == text.length) break;
				if (pos == nextOpen) ++depth;
				else if (!--depth) { end = i; endCh = pos; break outer; }
				++pos;
			}
		}
		if (end == null || line == end && endCh == startCh) return;
		return {from: CodeMirror.Pos(line, startCh),
			to: CodeMirror.Pos(end, endCh)};
	});
	
});
