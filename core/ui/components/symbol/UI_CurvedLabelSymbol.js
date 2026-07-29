/**
 * Represents a {@link Geospatiale.maptalks_CurvedLabel} symbol for {@link naissance.GeometryLabelEditor}.
 * 
 * @param {Object} [arg0_value={}]
 * @param {Object} [arg1_options]
 *  @param {Object} [arg1_options.interface_options]
 *  @param {string} [arg1_options.name="Curved Label Symbol"]
 *  @param {Object} [arg1_options.style]
 * 
 * @type {UI_CurvedLabelSymbol}
 */
global.UI_CurvedLabelSymbol = class extends ve.Component {
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = arg0_value;
		let options = (arg1_options) ? arg1_options : {};
			super(options);
			
		//Declare local instance variables
		this.options = options;
		this.value = (value || {});
		
		this.list_component = veList(veRawInterface({ 
			css_key: veText("", { name: "Key" }), 
			css_value: veText("", { name: "Value" }) 
		}), {
			name: "CSS Style",
			onuserchange: () => this.fireToBinding()
		});
		this.element = this.draw().element;
		
		HTML.applyTelestyle(this.element, {
			"[component='ve-text']": { display: "inline" },
			...this.options.style
		});
	}
	
	get v () {
		//Declare local instance variables
		let list_component_value = this.list_component.v;
		let return_obj = {};
		
		for (let i = 0; i < list_component_value.length; i++) {
			let local_component = list_component_value[i];
			
			if (local_component.css_key.v.length > 0)
				return_obj[local_component.css_key.v]= local_component.css_value.v;
		}
		
		//Return statement
		return return_obj;
	}
	
	set v (arg0_value) {
		//Convert from parameters
		let value = (arg0_value) ? arg0_value : {};
		
		//Declare local instance variables
		let css_list = [];
		
		//Iterate over all keys in value
		Object.iterate(value, (local_key, local_value) => {
			css_list.push(veRawInterface({
				css_key: veText(local_key, { name: "Key" }),
				css_value: veText(local_value, { name: "Value" })
			}));
		});
		
		this.list_component.v = css_list;
	}
	
	draw () {
		return veInterface({
			list_component: this.list_component
		}, { 
			name: (this.options.name || "Curved Label Symbol"),
			...this.options.interface_options
		});
	}
};