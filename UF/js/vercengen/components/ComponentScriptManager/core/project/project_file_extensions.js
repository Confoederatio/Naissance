//Initialise functions
{ //[WIP] - Refactor logic at a later date to not have redundant file extension maps
	ve.ScriptManager._getFileExtension = function (arg0_file_extension) {
		//Convert from parameters
		let file_extension = (arg0_file_extension) ? arg0_file_extension : "";
		
		//Declare local instance variables
		let file_extension_obj = ve.ScriptManager._getFileExtensions();
		if (!file_extension_obj[file_extension]) file_extension = ".txt";
		
		//Return statement
		return file_extension;
	};
	
	ve.ScriptManager._getFileExtensions = function (arg0_options) {
		//Convert from parameters
		let options = (arg0_options) ? arg0_options : {};
		
		//Declare local instance variables
		let file_extension_names_obj = {
			//Web & Stylesheets
			".css": "CSS",
			".scss": "SCSS",
			".less": "Less",
			".html": "HTML",
			".htm": "HTML",
			".xhtml": "XHTML",
			".js": "JavaScript",
			".mjs": "JavaScript (ES Module)",
			".cjs": "JavaScript (CommonJS)",
			".ts": "TypeScript",
			".tsx": "TypeScript (JSX)",
			".jsx": "JavaScript (JSX)",
			".json": "JSON",
			".md": "Markdown",
			".markdown": "Markdown",
			".mdx": "MDX",
			".txt": "Plain Text",
			
			//Programming Languages
			".c": "C",
			".h": "C Header",
			".cpp": "C++",
			".cc": "C++",
			".cxx": "C++",
			".hpp": "C++ Header",
			".hh": "C++ Header",
			".cs": "C#",
			".java": "Java",
			".py": "Python",
			".pyw": "Python (Windowed)",
			".rb": "Ruby",
			".go": "Go",
			".rs": "Rust",
			".swift": "Swift",
			".kt": "Kotlin",
			".kts": "Kotlin Script",
			".php": "PHP",
			".phtml": "PHP (HTML)",
			".dart": "Dart",
			".ex": "Elixir",
			".exs": "Elixir Script",
			".erl": "Erlang",
			".hrl": "Erlang Header",
			".fs": "F#",
			".fsi": "F# Interface",
			".fsx": "F# Script",
			".scala": "Scala",
			".sc": "Scala Script",
			".lua": "Lua",
			".pl": "Perl",
			".pm": "Perl Module",
			".r": "R",
			".jl": "Julia",
			
			//Data, Config & Database
			".xml": "XML",
			".xsd": "XML Schema",
			".rss": "RSS Feed",
			".xaml": "XAML",
			".yaml": "YAML",
			".yml": "YAML",
			".ini": "INI Config",
			".conf": "Config",
			".sql": "SQL",
			".redis": "Redis",
			".graphql": "GraphQL",
			".gql": "GraphQL",
			".proto": "Protocol Buffers",
			
			//Shell & Scripting
			".sh": "Shell Script",
			".bash": "Bash Script",
			".bat": "Batch File",
			".cmd": "Command File",
			".ps1": "PowerShell Script",
			".psm1": "PowerShell Module",
			
			//Template Engines
			".hbs": "Handlebars",
			".handlebars": "Handlebars",
			".twig": "Twig",
			".pug": "Pug",
			".jade": "Jade (Pug)",
			".liquid": "Liquid",
			".cshtml": "Razor (C# HTML)",
			".ftl": "FreeMarker",
			
			//Infrastructure & Low Level
			".dockerfile": "Dockerfile",
			"dockerfile": "Dockerfile",
			".tf": "Terraform (HCL)",
			".hcl": "HCL",
			".bicep": "Bicep",
			".wgsl": "WGSL",
			".sv": "SystemVerilog",
			".svh": "SystemVerilog Header",
			".v": "Verilog",
			".s": "Assembly (MIPS)",
			
			//Specialised
			".abap": "ABAP",
			".cls": "Apex Class",
			".azcli": "Azure CLI",
			".clj": "Clojure",
			".cljs": "ClojureScript",
			".coffee": "CoffeeScript",
			".cypher": "Cypher (Neo4j)",
			".ecl": "ECL",
			".flow": "Flow",
			".pq": "Power Query",
			".qs": "Q#",
			".rst": "reStructuredText",
			".sol": "Solidity",
			".aes": "Sophia",
			".st": "Structured Text",
			".tcl": "Tcl",
			".vb": "Visual Basic",
		};
		let file_extension_obj = {
			".abap": "abap",
			".aes": "aes",
			".azcli": "azcli",
			".bash": "shell",
			".bat": "bat",
			".bicep": "bicep",
			".c": "c",
			".cc": "cpp",
			".cjs": "javascript",
			".clj": "clojure",
			".cljs": "clojure",
			".cls": "apex",
			".cmd": "bat",
			".coffee": "coffeescript",
			".conf": "ini",
			".cpp": "cpp",
			".cs": "csharp",
			".cshtml": "razor",
			".css": "css",
			".cxx": "cpp",
			".cypher": "cypher",
			".dart": "dart",
			".dockerfile": "dockerfile",
			".ecl": "ecl",
			".erl": "erlang",
			".ex": "elixir",
			".exs": "elixir",
			".flow": "flow9",
			".fs": "fsharp",
			".fsi": "fsharp",
			".fsx": "fsharp",
			".ftl": "freemarker2",
			".go": "go",
			".gql": "graphql",
			".graphql": "graphql",
			".h": "c",
			".handlebars": "handlebars",
			".hbs": "handlebars",
			".hcl": "hcl",
			".hh": "cpp",
			".hpp": "cpp",
			".hrl": "erlang",
			".htm": "html",
			".html": "html",
			".ini": "ini",
			".jade": "pug",
			".java": "java",
			".jl": "julia",
			".js": "javascript",
			".json": "json",
			".jsx": "javascript",
			".kt": "kotlin",
			".kts": "kotlin",
			".less": "less",
			".liquid": "liquid",
			".lua": "lua",
			".markdown": "markdown",
			".md": "markdown",
			".mdx": "mdx",
			".mjs": "javascript",
			".php": "php",
			".phtml": "php",
			".pl": "perl",
			".pm": "perl",
			".pq": "powerquery",
			".proto": "proto",
			".ps1": "powershell",
			".psm1": "powershell",
			".pug": "pug",
			".py": "python",
			".pyw": "python",
			".qs": "qsharp",
			".r": "r",
			".rb": "ruby",
			".redis": "redis",
			".rs": "rust",
			".rss": "xml",
			".rst": "restructuredtext",
			".s": "mips",
			".sc": "scala",
			".scala": "scala",
			".scss": "scss",
			".sh": "shell",
			".sol": "sol",
			".sql": "sql",
			".st": "st",
			".sv": "systemverilog",
			".svh": "systemverilog",
			".swift": "swift",
			".tcl": "tcl",
			".tf": "hcl",
			".ts": "typescript",
			".tsx": "typescript",
			".twig": "twig",
			".txt": "markdown",
			".v": "verilog",
			".vb": "vb",
			".wgsl": "wgsl",
			".xaml": "xml",
			".xhtml": "html",
			".xml": "xml",
			".xsd": "xml",
			".yaml": "yaml",
			".yml": "yaml",
			"dockerfile": "dockerfile",
		};
		
		//Parse to select_obj if appropriate
		if (options.return_select_obj)
			Object.iterate(file_extension_obj, (local_key, local_value) => {
				file_extension_obj[local_key] = {
					name: `${file_extension_names_obj[local_key]} (${local_key})`
				};
			});
		
		//Return statement
		return file_extension_obj;
	};
	
	ve.ScriptManager._loadFileExtension = function (arg0_file_extension) {
		//Convert from parameters
		let file_extension = (arg0_file_extension) ? arg0_file_extension : "";
		
		//Declare local instance variables
		let file_extension_obj = ve.ScriptManager._getFileExtensions();
		let model_obj = this.scene_monaco.editor.getModel();
		
		//Set new syntax highlighting
		if (file_extension === "") file_extension = ".txt";
		if (file_extension_obj[file_extension])
			monaco.editor.setModelLanguage(model_obj, file_extension_obj[file_extension]);
	};
	
	ve.ScriptManager._setFileExtension = function (arg0_file_path, arg1_type) {
		//Convert from parameters
		let file_path = arg0_file_path;
		let type = (arg1_type) ? arg1_type : ".txt";
		
		//Declare local instance variables
		let actual_type = "";
		let default_file_extension = ve.ScriptManager._getFileExtension(path.extname(file_path));
		
		if (!this.config.files[file_path]) this.config.files[file_path] = {};
		let local_file_config = this.config.files[file_path];
		
		if (type !== default_file_extension) {
			local_file_config.type = type;
			actual_type = type;
		} else {
			delete local_file_config.type;
			actual_type = default_file_extension;
		}
		
		//Call update functions
		if (this._file_path === file_path)
			ve.ScriptManager._loadFileExtension.call(this, actual_type);
		ve.ScriptManager._saveConfig.call(this);
	};
}