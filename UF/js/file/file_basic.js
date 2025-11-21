//Initialise functions
{
	if (!global.File) global.File = {};
	
	File.getAllDrives = function () { //[WIP] - Refactor at a later date
		const platform = process.platform;
		
		try {
			if (platform === "win32") {
				// Run WMIC command to list logical drives
				const output = child_process.execSync("wmic logicaldisk get name", { encoding: "utf8" });
				return output
				.split("\n")
				.map((line) => line.trim())
				.filter((line) => /^[A-Z]:$/i.test(line)) // e.g. "C:"
				.map((drive) => drive + "\\");
			} else {
				// POSIX systems
				// Common mount points: "/", "/Volumes/*" (macOS), "/mnt/*" or "/media/*" (Linux)
				const drives = ["/"];
				
				const possibleDirs = ["/Volumes", "/mnt", "/media"];
				for (const dir of possibleDirs) {
					if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
						const subMounts = fs
						.readdirSync(dir)
						.map((name) => path.join(dir, name))
						.filter((p) => {
							try {
								return fs.statSync(p).isDirectory();
							} catch {
								return false;
							}
						});
						drives.push(...subMounts);
					}
				}
				return drives;
			}
		} catch (err) {
			console.error("getAllDrives() failed:", err);
			return [];
		}
	};
	
	File.isDrive = function (arg0_file_path) {
		//Convert from parameters
		let file_path = arg0_file_path;
		
		//Declare local instance variables
		let resolved = path.resolve(file_path);
		
		//Check if file_path is drive
		try {
			let stats = fs.statSync(resolved);
			if (!stats.isDirectory()) return false; //Internal guard clause if not a directory
		} catch (e) {
			//Return statement
			return false;
		}
		
		//Return statement
		return (resolved === path.parse(resolved).root);
	};
}