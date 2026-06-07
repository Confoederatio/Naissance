global.UI_PointSymbol = class extends ve.Component {
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = arg0_value;
		let options = (arg1_options) ? arg1_options : {};
			super(options);
		
		//Declare local instance variables
		this.options = options;
		this.value = (value) ? value : {};
		
		this.element = this.draw().element;
	}
	
	get v () { return this.value; }
	
	set v (arg0_value) {
		//Convert from parameters
		let value = (arg0_value) ? arg0_value : {};
		
		//Fire setValue
		UI_Symbol.setValue(value, {
			instance: this,
			key_map_obj: {
				markerFile: "point_icon",
				markerOpacity: "point_opacity",
				
				markerHeight: "advanced_options.marker_height",
				markerWidth: "advanced_options.marker_width",
				markerDx: "advanced_options.marker_offset_x",
				markerDy: "advanced_options.marker_offset_y"
			}
		});
	}
	
	draw () {
		//Declare local instance variables
		if (this.components_obj) //If this.components_obj is already defined, remove all components
			Object.iterate(this.components_obj, (local_key, local_component) => {
				local_component.remove();
			});
		this.components_obj = {
			point_icon: veFile((this.value.markerFile || "gfx/icons/marker_default.png"), {
				name: "Change Icon",
				onuserchange: (v) => {
					if (v.length === 0) {
						delete this.value.markerFile;
					} else {
						this.value.markerFile = v;
					}
					this.options.special_function({ markerFile: v });
				}
			}),
			point_opacity: veRange(Math.returnSafeNumber(this.value.markerOpacity, 1), {
				name: "Point Opacity",
				onuserchange: (v) => {
					this.value.markerOpacity = v;
					this.options.special_function({ markerOpacity: v });
				}
			}),
			
			advanced_options: veInterface({
				marker_height: veNumber(Math.returnSafeNumber(this.value.markerHeight, 40), {
					name: "Height",
					onuserchange: (v) => {
						this.value.markerHeight = v;
						this.options.special_function({ markerHeight: v });
					},
					x: 0, y: 0
				}),
				marker_width: veNumber(Math.returnSafeNumber(this.value.markerWidth, 40), {
					name: "Width",
					onuserchange: (v) => {
						this.value.markerWidth = v;
						this.options.special_function({ markerWidth: v });
					},
					x: 1, y: 0
				}),
				
				marker_offset_x: veNumber(Math.returnSafeNumber(this.value.markerDx, 0), {
					name: "Offset X",
					onuserchange: (v) => {
						this.value.markerDx = v;
						this.options.special_function({ markerDx: v });
					},
					x: 0, y: 1
				}),
				marker_offset_y: veNumber(Math.returnSafeNumber(this.value.markerDy, 0), {
					name: "Offset Y",
					onuserchange: (v) => {
						this.value.markerDy = v;
						this.options.special_function({ markerDy: v });
					},
					x: 1, y: 1
				})
			}, {
				name: "Advanced Options"
			})
		};
		
		//Return statement
		return veInterface(this.components_obj, {
			name: (this.options.name || "Point Symbol")
		})
	}
};