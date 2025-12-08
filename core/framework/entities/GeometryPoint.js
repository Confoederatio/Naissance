if (!global.naissance) global.naissance = {};

naissance.GeometryPoint = class extends naissance.Geometry {
	constructor () {
		super();
		this.class_name = "GeometryPoint";
		this.node_editor_mode = "Point";
		
		//Declare UI
		this.interface = veInterface({
			information: veHTML(() => `ID: ${this.id}`, { x: 0, y: 0 })
		}, { is_folder: false });
		this.keyframes_ui = veInterface({}, {
			name: "Keyframes", open: true
		});
		super.drawVariablesEditor();
		
		//Add keyframe with default brush symbol upon instantiation
		let brush_symbol = main.brush.getBrushSymbol();
		if (brush_symbol)
			this.addKeyframe(main.date, undefined, brush_symbol);
		
		//KEEP AT BOTTOM!
		this.updateOwner();
	}
	
	draw () {
		//Declare local instance variables
		
	}
	
	static parseAction (arg0_json) {
		
	}
};