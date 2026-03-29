/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 * 
 * ##### Constructor:
 * - `arg0_value`: {@link Object}
 *   - `.series`: {@link Object}
 *     - `.name`: {@link string}
 *     - `.origin`: {@link Array}<{@link number}, {@link number}, {@link number}> - The sheet index, X, Y origin of the top-left corner of `.value`, the first top-left populated cell.
 *     - `.pivot="column"`: {@link string} - Either 'column'/'row'.
 *     - `.symbol`: {@link Object} - The symbol the data line takes on.
 *     - `.labels`: {@link Array}<{@link string}> - The labels for each datapoint.
 *     - `.value`: {@link Array}<{@link Array}<{@link number}>> - 2D dataframe storing values within this series.
 * - `arg1_options`: {@link Object}
 *   - `.symbol`: {@link Object}
 *     - `.title`: {@link Object}
 *       - `.text`: {@link string}
 *   - `.type="line_chart"`: {@link string} - The type of chart to show in the graph.
 *   - 
 *   - `.height`: {@link number}
 *   - `.width`: {@link number}
 *   - `.x`: {@link number}
 *   - `.y`: {@link number}
 * 
 * @augments ve.Component
 * @memberof ve.Component
 * @type {ve.Graph}
 */
ve.Graph = class extends ve.Component { //[WIP] - Flatten all <key_name>.symbol keys into a single .symbol that contains all Echarts Options; Remove private _get functions to make things more straightforwards
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = (arg0_value) ? arg0_value : {};
		let options = (arg1_options) ? arg1_options : {};
			super(options);
		
		//Initialise options
		options.attributes = (options.attributes) ? options.attributes : {};
		if (!options.symbol) options.symbol = {};
			if (!options.symbol.polar) options.symbol.polar = {};
			if (!options.symbol.xAxis) options.symbol.xAxis = {};
				if (options.symbol.xAxis.boundaryGap === undefined) options.symbol.xAxis.boundaryGap = false;
				if (options.symbol.xAxis.type === undefined) options.symbol.xAxis.type = "category";
				
			if (!options.symbol.yAxis) options.symbol.yAxis = {};
				if (options.symbol.yAxis.type === undefined) options.symbol.yAxis.type = "value";
		if (!options.type) options.type = "line_chart";
			
		//Declare local instance variables
		this.element = document.createElement("div");
			this.element.setAttribute("component", "ve-graph");
			this.element.instance = this;
			HTML.setAttributesObject(this.element, options.attributes);
		this.options = options;
		this.overlays = [];
		
		this.from_binding_fire_silently = true;
		this.v = value;
		delete this.from_binding_fire_silently;
	}
	
	get v () {
		//Return statement
		return this.value;
	}
	
	set v (arg0_value) {
		//Convert from parameters
		let value = (arg0_value) ? arg0_value : {};
		
		//Initialise value
		this.value = value;
		
		if (!this.value.series) this.value.series = {};
		if (!this.value.type) this.value.type = "line_chart";
		this.draw();
	}
	
	addSeries (arg0_series_obj, arg1_options) { //[WIP] - Finish function body
		//Convert from parameters
		let series_obj = arg0_series_obj;
		let options = (arg1_options) ? arg1_options : {};
		
		if (series_obj === undefined) return; //Internal guard clause if series_obj is undefined
		if (series_obj.coords === undefined) return; //Internal guard clause if series_obj.coords is undefined
		
		//Declare local instance variables
		let series_key = (options.key) ? 
			options.key : Object.generateRandomID(this.value.series);
		let return_obj = {};
		
		if (options.table_obj) {
			let series_values = options.table_obj.getRangeValue(series_obj.coords, { 
				return_raw_values: true 
			});
			
			if (!series_obj.pivot || series_obj.pivot === "column") {
				return_obj.labels = [];
				
				//Iterate over all series_values to fetch needed labels
				for (let i = 0; i < series_values.length; i++) {
					return_obj.labels.push(series_values[i][0]);
					series_values[i].splice(0, 1);
				}
			} else {
				return_obj.labels = [];
				
				//Iterate over all series_values in the header to fetch needed labels
				for (let i = 0; i < series_values[0].length; i++)
					return_obj.labels.push(series_values[0][i]);
				series_values.splice(0, 1);
			}
			
			return_obj.origin = series_obj.coords[0];
			return_obj.value = series_values;
		} else { //[WIP] - Implement this .pivot mode later
			
		}
		
		//Concatenate with .symbol
		return_obj.symbol = series_obj.symbol;
		
		//Set new series and draw
		this.value.series[series_key] = return_obj;
		this.draw();
		
		console.log(`Input series_obj:`, series_obj);
		console.log(`Output series_obj:`, return_obj);
		
		//Return statement
		return this.value.series[series_key];
	}
	
	draw () { //[WIP] - Finish function body
		//Declare local instance variables
		let has_coords = (this.x !== undefined || this.y !== undefined);
		let root_style = window.getComputedStyle(document.body);
		
		//this.element.innerHTML = "";
		this.element.style.position = "absolute";
		if (has_coords) {
			this.element.style.left = (typeof this.x === "number") ? `${this.x}px` : this.x;
			this.element.style.top = (typeof this.y === "number") ? `${this.y}px` : this.y;
			
			this.element.style.height = (typeof this.height === "number") ? `${this.height}px` : this.height;
			this.element.style.width = (typeof this.width === "number") ? `${this.width}px` : this.width;
		} else {
			this.element.style.height = "100%";
			this.element.style.width = `100%`;
		}
		
		//Draw chart
		if (this.chart) this.chart.clear();
		this.chart = echarts.init(this.element, null, {
			renderer: "canvas",
			useDirtyRect: false
		});
		this.chart_options = {};
			Object.iterate(this.options.symbol, (local_key, local_value) => {
				if (Object.keys(local_value).length > 0)
					this.chart_options[local_key] = local_value;
			});
			if (!this.chart_options?.polar?.type) delete this.chart_options.polar;
			if (!this.chart_options?.xAxis?.type) delete this.chart_options.xAxis;
			if (!this.chart_options?.yAxis?.type) delete this.chart_options.yAxis;
		this.chart_options.series = [];
		
		if (this.value.series)
			Object.iterate(this.value.series, (local_key, local_value) => {
				let local_data = local_value.value;
				
				//Create new this.chart_options.series
				for (let i = 0; i < local_data.length; i++)
					this.chart_options.series.push({
						name: (local_value.name) ? local_value.name : local_key,
						data: local_data[i],
						type: "line",
						
						areaStyle: {
							color: "transparent"
						},
						emphasis: { focus: "series" },
						stack: local_key,
						...local_value.symbol
					});
			});
		
		try {
			this.chart.setOption(this.chart_options);	
		} catch (e) {
			console.error(`Echarts options error:`, e, `\n- Options object:`, this.chart_options);
		}
		//}
		
		this.chart.resize();
	}
	
	static getDefaultColours () {
		//Return statement
		return ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'];
	}
};