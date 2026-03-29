ve.DatavisSuite.VisualMapSymbol = class extends ve.Component {
	constructor (arg0_value, arg1_options) {
		//Convert from parameters
		let value = (arg0_value) ? arg0_value : {};
		let options = (arg1_options) ? arg1_options : {};
		super(options);
		
		//Initialise options
		options.attributes = (options.attributes) ? options.attributes : {};
		
		//Declare local instance variables
		this.element = document.createElement("div");
		this.element.setAttribute("component", "ve-datavis-suite-visual-map-symbol");
		this.element.instance = this;
		HTML.setAttributesObject(this.element, options.attributes);
		this.options = options;
		this.value = {};
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
		
		//Declare local instance variables
		let all_pieces = [];
		
		if (value.pieces)
			for (let i = 0; i < value.pieces.length; i++) {
				let local_gt = Math.returnSafeNumber(value.pieces[i].gt);
				let local_lte = Math.returnSafeNumber(value.pieces[i].lte);
				
				all_pieces.push(new ve.Interface({
					colour: new ve.Colour((value.pieces[i].color) ? value.pieces[i].color : [255, 255, 255, 1], {
						is_rgba: true
					}),
					gt: new ve.Number(local_gt, {
						name: loc("ve.registry.localisation.VisualMapSymbol_gt")
					}),
					lte: new ve.Number(local_lte, {
						name: loc("ve.registry.localisation.VisualMapSymbol_lte")
					})
				}, { name: `(${String.formatNumber(local_gt)} - ${String.formatNumber(local_lte)})` }));
			}
		
		
		//Parse value
		this.element.innerHTML = "";
		this.interface = new ve.Interface({
			position: new ve.Interface({
				centre: new ve.RawInterface({
					centre_x: new ve.Text(value.center?.[0], { name: loc("ve.registry.localisation.VisualMapSymbol_x") }),
					centre_y: new ve.Text(value.center?.[1], { name: loc("ve.registry.localisation.VisualMapSymbol_y") })
				}, {
					name: loc("ve.registry.localisation.VisualMapSymbol_centre"),
					onuserchange: (v) => {
						let centre_x = (!isNaN(parseFloat(v.centre_x.v))) ?
							parseFloat(v.centre_x.v) : v.centre_x.v;
						if (centre_x === "") centre_x = 0;
						let centre_y = (!isNaN(parseFloat(v.centre_y.v))) ?
							parseFloat(v.centre_y.v) : v.centre_y.v
						if (centre_y === "") centre_y = 0;
						this.value.center = [centre_x, centre_y];
					},
					style: {
						alignItems: "center",
						display: "flex"
					}
				}),
				
				bottom: new ve.Text(value.bottom, {
					name: loc("ve.registry.localisation.VisualMapSymbol_bottom"),
					onuserchange: (v) => {
						if (!isNaN(parseFloat(v))) v = parseFloat(v);
						this.value.bottom = v;
					}
				}),
				left: new ve.Text(value.left, {
					name: loc("ve.registry.localisation.VisualMapSymbol_left"),
					onuserchange: (v) => {
						if (!isNaN(parseFloat(v))) v = parseFloat(v);
						this.value.left = v;
					}
				}),
				top: new ve.Text(value.top, {
					name: loc("ve.registry.localisation.VisualMapSymbol_top"),
					onuserchange: (v) => {
						if (!isNaN(parseFloat(v))) v = parseFloat(v);
						this.value.top = v;
					}
				}),
				right: new ve.Text(value.right, {
					name: loc("ve.registry.localisation.VisualMapSymbol_right"),
					onuserchange: (v) => {
						if (!isNaN(parseFloat(v))) v = parseFloat(v);
						this.value.right = v;
					}
				})
			}, { name: loc("ve.registry.localisation.VisualMapSymbol_position") }),
			
			pieces: new ve.List(all_pieces, {
				name: loc("ve.registry.localisation.VisualMapSymbol_pieces"),
				onuserchange: (v) => {
					if (v.length === 0) {
						delete this.value.pieces;
						return;
					} //Internal guard clause if value is unset
					
					//Declare local instance variables
					let all_pieces = [];
					
					//Iterate over all list components
					for (let i = 0; i < v.length; i++)
						all_pieces.push({
							colour: v[i].colour.getHex(),
							gt: v[i].gt.v,
							lte: v[i].lte.v
						});
					this.value.pieces = all_pieces;
				},
				options: { name: loc("ve.registry.localisation.VisualMapSymbol_local_piece") },
				placeholder: new ve.Interface({
					colour: new ve.Colour([255, 255, 255, 1, { is_rgba: true }]),
					gt: new ve.Number(0, { name: loc("ve.registry.localisation.VisualMapSymbol_gt") }),
					lte: new ve.Number(0, { name: loc("ve.registry.localisation.VisualMapSymbol_lte") })
				})
			})
		}, {
			name: (this.options.name) ? this.options.name : loc("ve.registry.localisation.VisualMapSymbol_visual_map_symbol"),
			onuserchange: (v, e) => {
				delete this.do_not_fire_to_binding;
				this.fireToBinding();
			}
		});
	}
}