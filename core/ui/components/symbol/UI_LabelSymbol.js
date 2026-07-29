/**
 * @param {Object} [arg1_options]
 *  @param {string} [arg1_options.name="Label Symbol"]
 *  @param {boolean} [arg1_options.enable_custom_labels=false]
 *  @param {naissance.Geometry} [arg1_options.geometry_obj]
 *  @param {function} [arg1_options.special_function] | {@link Object} - The function to call when setting the symbol. Uses Maptalks keys.
 */
global.UI_LabelSymbol = class extends ve.Component {
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
				hide_label: "hide_label",
				textFill: "font_colour",
				textFaceName: "font_family",
				textSize: "font_size",
				textHaloFill: "font_stroke",
				textHaloRadius: "font_stroke_width"
			}
		});
	}
	
	draw () {
		//Declare local instance variables
		let font_select_obj = {};
			main.settings.font_registry.forEach((local_value) => {
				font_select_obj[local_value] = { name: local_value };
			});
		
		//Declare local components
		if (this.components_obj) //If this.components_obj is already defined, remove all components
			Object.iterate(this.components_obj, (local_key, local_component) => {
				local_component.remove();
			});
		this.components_obj = {
			...(this.options.enable_custom_labels ? {
				open_label_editor: veButton(() => {
					//Declare local instance variables
					let geometry_obj = this.options.geometry_obj;
					
					//Open label editor
					if (geometry_obj.label_editor) geometry_obj.label_editor.remove();
					geometry_obj.label_editor = new naissance.GeometryLabelEditor(geometry_obj);
					geometry_obj.label_editor.open();
				}, { name: "Open Label Editor" })
			} : {}),
			
			hide_label: veToggle(main.settings.hide_labels_by_default, {
				name: "Hide Label",
				onuserchange: (v) => {
					this.value.hide_label = v;
					this.options.special_function({ hide_label: v })
				}
			}),
			font_colour: veColour((this.value.textFill || "#ffffff"), {
				name: "Font Colour",
				onuserchange: (v, e) => {
					this.value.textFill = e.getHex();
					this.options.special_function({ textFill: e.getHex() })
				}
			}),
			font_family: veSelect({
				monospace: { name: "Monospace" },
				...font_select_obj
			}, {
				name: "Font Family",
				onuserchange: (v) => {
					this.value.textFaceName = v;
					this.options.special_function({ textFaceName: v })
				}
			}),
			font_size: veNumber(Math.returnSafeNumber(this.value.textSize, 14), {
				name: "Font Size",
				onuserchange: (v) => {
					this.value.textSize = v;
					this.options.special_function({ textSize: v });
				}
			}),
			font_stroke: veColour((this.value.textHaloFill || "#000000"), {
				name: "Font Stroke",
				onuserchange: (v, e) => {
					this.value.textHaloFill = e.getHex();
					this.options.special_function({ textHaloFill: e.getHex() })
				}
			}),
			font_stroke_width: veNumber(Math.returnSafeNumber(this.value.textHaloRadius, 2), {
				name: "Font Stroke Width",
				
				min: 0,
				onuserchange: (v) => {
					this.value.textHaloRadius = v;
					this.options.special_function({ textHaloRadius: v });
				}
			})
		};
		
		//Return statement
		return veInterface({
			...this.components_obj
		}, { name: (this.options.name || "Label Symbol") });
	}
};