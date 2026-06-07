global.UI_PolygonSymbol = class extends ve.Component {
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
				polygonFill: "polygon_fill",
				polygonOpacity: "polygon_opacity"
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
			polygon_fill: veColour((this.value.polygonFill || "#1bbc9b"), {
				name: "Polygon Fill",
				onuserchange: (v, e) => {
					this.value.polygonFill = e.getHex();
					this.options.special_function({ polygonFill: e.getHex() });
				}
			}),
			polygon_opacity: veRange(Math.returnSafeNumber(this.value.polygonOpacity, 0.7), {
				name: "Polygon Opacity",
				onuserchange: (v) => {
					this.value.polygonOpacity = v;
					this.options.special_function({ polygonOpacity: v });
				}
			})
		};
		
		//Return statement
		return veInterface(this.components_obj, {
			name: (this.options.name || "Polygon Symbol")
		});
	}
};