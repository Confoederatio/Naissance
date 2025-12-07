global.UI_EditGeometryPolygon = class extends ve.Class {
	constructor () {
		super();
	}
	
	/**
	 * @returns {ve.Interface}
	 */
	draw () {
		//Return statement
		return new ve.Interface({
			//Row 1: Fill
			fill_options: new ve.Interface({
				fill_colour: veColour(main.brush.colour, {
					name: "Fill Colour",
					onuserchange: (v, e) => {
						naissance.Brush.setSelectedSymbol({ polygonFill: e.getHex() });
					}
				}),
				fill_opacity: veRange(main.brush.opacity/100, {
					name: "Fill Opacity",
					onuserchange: (v) => {
						naissance.Brush.setSelectedSymbol({ polygonOpacity: v });
					}
				}),
				fill_pattern_url: new ve.Text("", {
					name: "Fill Pattern",
					attributes: {
						placeholder: "File path or URL ..."
					},
					onuserchange: (v) => {
						if (v.length === 0) {
							veToast("Reset fill pattern!");
						} else {
							naissance.Brush.setSelectedSymbol({ polygonPatternFile: v });
						}
					}
				})
			}, { name: "Fill", open: true }),
			
			//Row 2: Stroke
			stroke_options: new ve.Interface({
				stroke_colour: veColour(main.brush.stroke_colour, {
					name: "Stroke Colour",
					onuserchange: (v, e) => {
						naissance.Brush.setSelectedSymbol({ lineColor: e.getHex() });
					}
				}),
				stroke_opacity: veRange(main.brush.stroke_opacity/100, {
					name: "Stroke Opacity",
					onuserchange: (v, e) => {
						naissance.Brush.setSelectedSymbol({ lineOpacity: e });
					}
				}),
				stroke_width: veNumber(main.brush.stroke_width, {
					name: "Stroke Width",
					onuserchange: (v) => {
						naissance.Brush.setSelectedSymbol({ lineWidth: v });
					}
				}),
				
				stroke_line_cap: new ve.Select({
					butt: {
						name: "Butt",
						selected: true
					},
					round: {
						name: "Round"
					},
					square: {
						name: "Square"
					}
				}, {
					name: "Line Cap",
					onuserchange: (v) => {
						naissance.Brush.setSelectedSymbol({ lineCap: v });
					}
				}),
				stroke_line_join: new ve.Select({
					bevel: {
						name: "Bevel"
					},
					miter: {
						name: "Miter",
						selected: true
					},
					round: {
						name: "Round",
					}
				}, {
					name: "Line Join",
					onuserchange: (v) => {
						naissance.Brush.setSelectedSymbol({ lineJoin: v });
					}
				}),
			}, { name: "Stroke", open: true })
		}, { name: "Polygon Symbol" });
	}
}