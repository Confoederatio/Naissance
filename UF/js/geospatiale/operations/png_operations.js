{
	if (!global.GeoPNG) global.GeoPNG = {};
	
	GeoPNG.getPolygonCentroid = function (arg0_pixels) {
		//Convert from parameters
		let pixels = arg0_pixels;
		
		if (!pixels.length) return null; //Internal guard clause if pixels are not provided
		
		//Declare local instance variables
		let sum_x = 0;
		let sum_y = 0;
		
		//Iterate over all pixels
		for (let [x, y] of pixels) {
			sum_x += x;
			sum_y += y;
		}
		
		//Return statement
		return [sum_x/pixels.length, sum_y/pixels.length];
	};
	
	GeoPNG.getRasterNeighbourAverage = function (arg0_geopng_array, arg1_x, arg2_y, arg3_height, arg4_width) {
		//Convert from parameters
		let geopng_array = arg0_geopng_array;
		let local_x = arg1_x;
		let local_y = arg2_y;
		let height = arg3_height;
		let width = arg4_width;
		
		//Declare local instance variables
		let count = 0;
		let sum = 0;
		
		for (let i = -1; i <= 1; i++)
			for (let x = -1; x <= 1; x++) {
				if (i === 0 && x === 0) continue;
				
				let neighbour_x = local_x + i;
				let neighbour_y = local_y + x;
				
				if (neighbour_x >= 0 && neighbour_x < height && neighbour_y >= 0 && neighbour_y < width) {
					let local_index = neighbour_x*width + neighbour_y;
					let local_value = geopng_array[local_index];
					
					if (!isNaN(local_value)) {
						sum += local_value;
						count++;
					}
				}
			}
		
		//Return statement
		return (count > 0) ? sum/count : NaN;
	};
	
	//[QUARANTINE]
	/**
	 * Robustly eliminates specific colours by binning them to the nearest available non-binned colour.
	 * @param {string} arg0_input_path
	 * @param {string} arg1_output_path
	 * @param {Object} arg2_options
	 * @param {Array<Array<number>>} arg2_options.bin_colours - Colours to be destroyed.
	 * @param {Array<Array<number>>} arg2_options.ignore_colours - Colours to leave untouched.
	 */
	GeoPNG.kNNBin = async function (arg0_input_path, arg1_output_path, arg2_options) {
		const yieldToEventLoop = () =>
			new Promise((resolve) => setImmediate(resolve));
		
		const bin_set = new Set(
			(arg2_options.bin_colours || []).map((c) => c.join(","))
		);
		const ignore_set = new Set(
			(arg2_options.ignore_colours || []).map((c) => c.join(","))
		);
		
		const buffer = await fs.promises.readFile(arg0_input_path);
		const png = await new Promise((resolve, reject) => {
			new pngjs.PNG().parse(buffer, (err, data) =>
				err ? reject(err) : resolve(data)
			);
		});
		
		const { width, height, data } = png;
		const seedMap = new Array(width * height);
		let fallback_seed = null;
		
		// Step 1: Initialize Seed Map
		for (let y = 0; y < height; y++) {
			if (y % 500 === 0) await yieldToEventLoop();
			for (let x = 0; x < width; x++) {
				const idx = (width * y + x) << 2;
				const rgba = `${data[idx]},${data[idx + 1]},${data[idx + 2]},${data[idx + 3]}`;
				
				if (!bin_set.has(rgba) && !ignore_set.has(rgba)) {
					seedMap[width * y + x] = { sx: x, sy: y, dist: 0 };
					if (!fallback_seed) fallback_seed = { x, y };
				} else {
					seedMap[width * y + x] = { sx: -1, sy: -1, dist: Infinity };
				}
			}
		}
		
		const checkNeighbor = (x, y, curData, neighbor) => {
			if (neighbor && neighbor.sx !== -1) {
				const dx = x - neighbor.sx;
				const dy = y - neighbor.sy;
				const d2 = dx * dx + dy * dy;
				if (d2 < curData.dist) {
					curData.sx = neighbor.sx;
					curData.sy = neighbor.sy;
					curData.dist = d2;
				}
			}
		};
		
		// Step 2: Forward Raster Scan
		for (let y = 0; y < height; y++) {
			if (y % 500 === 0) await yieldToEventLoop();
			for (let x = 0; x < width; x++) {
				const idx = width * y + x;
				const curData = seedMap[idx];
				if (curData.dist === 0) continue;
				
				if (x > 0) checkNeighbor(x, y, curData, seedMap[idx - 1]);
				if (y > 0) checkNeighbor(x, y, curData, seedMap[idx - width]);
				if (x > 0 && y > 0) checkNeighbor(x, y, curData, seedMap[idx - width - 1]);
				if (x < width - 1 && y > 0)
					checkNeighbor(x, y, curData, seedMap[idx - width + 1]);
			}
		}
		
		// Step 3: Backward Raster Scan
		for (let y = height - 1; y >= 0; y--) {
			if (y % 500 === 0) await yieldToEventLoop();
			for (let x = width - 1; x >= 0; x--) {
				const idx = width * y + x;
				const curData = seedMap[idx];
				if (curData.dist === 0) continue;
				
				if (x < width - 1) checkNeighbor(x, y, curData, seedMap[idx + 1]);
				if (y < height - 1) checkNeighbor(x, y, curData, seedMap[idx + width]);
				if (x < width - 1 && y < height - 1)
					checkNeighbor(x, y, curData, seedMap[idx + width + 1]);
				if (x > 0 && y < height - 1)
					checkNeighbor(x, y, curData, seedMap[idx + width - 1]);
			}
		}
		
		// Step 4: Apply Transformation
		const fallback_rgba = [0, 0, 0, 0];
		for (let y = 0; y < height; y++) {
			if (y % 500 === 0) await yieldToEventLoop();
			for (let x = 0; x < width; x++) {
				const idx = (width * y + x) << 2;
				const rgba = `${data[idx]},${data[idx + 1]},${data[idx + 2]},${data[idx + 3]}`;
				
				if (bin_set.has(rgba)) {
					const seed = seedMap[width * y + x];
					let finalIdx = -1;
					
					if (seed.sx !== -1) {
						finalIdx = (width * seed.sy + seed.sx) << 2;
					} else if (fallback_seed) {
						finalIdx = (width * fallback_seed.y + fallback_seed.x) << 2;
					}
					
					if (finalIdx !== -1) {
						data[idx] = data[finalIdx];
						data[idx + 1] = data[finalIdx + 1];
						data[idx + 2] = data[finalIdx + 2];
						data[idx + 3] = data[finalIdx + 3];
					} else {
						data[idx] = fallback_rgba[0];
						data[idx + 1] = fallback_rgba[1];
						data[idx + 2] = fallback_rgba[2];
						data[idx + 3] = fallback_rgba[3];
					}
				}
			}
		}
		
		// Step 5: Save Output
		await new Promise((resolve, reject) => {
			png
			.pack()
			.pipe(fs.createWriteStream(arg1_output_path))
			.on("finish", resolve)
			.on("error", reject);
		});
	};
}