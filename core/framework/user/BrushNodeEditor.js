if (!global.naissance) global.naissnace = {};
naissance.BrushNodeEditor = class extends ve.Class {
	constructor () {
		super();
		
		//Declare local instance variables
		this.draw_tool = new maptalks.DrawTool({ mode: "Polygon" }).addTo(map).disable();
		this.node_editor_modes = ["node", "node_override"];
		
		this.handleEvents();
	}
	
	disable () { 
		this.draw_tool.disable(); 
	}
	
	enable () {
		this.draw_tool.enable(); 
	}
	
	handleEvents () {
		this.draw_tool.on("drawend", (e) => {
			if (main.brush.disabled) try { this.draw_tool.disable(); } catch (e) {}
			if (main.brush._selected_geometry.handleNodeEditorEnd)
				main.brush._selected_geometry.handleNodeEditorEnd(e);
			e.geometry.remove();
		});
		this.draw_tool.on("drawstart", (e) => {
			if (main.brush.disabled) try { this.draw_tool.disable(); } catch (e) {}
			if (HTML.ctrl_pressed) {
				this.draw_tool.setSymbol({
					polygonFill: "rgba(240, 60, 60, 0.5)"
				});
				this.mode = "remove";
			} else {
				this.draw_tool.setSymbol({
					polygonFill: "rgba(255, 255, 255, 0.5)"
				});
				this.mode = "add";
			}
		});
	}
	
	update () {
		if (["node", "node_override"].includes(main.brush.mode)) {
			if (main.brush._selected_geometry)
				if (main.brush._selected_geometry.node_editor_mode)
					this.draw_tool.setMode(main.brush._selected_geometry.node_editor_mode).enable();
		} else {
			if (main.brush._selected_geometry instanceof naissance.GeometryLine) {
				this.draw_tool.setMode("FreeHandLineString").enable();
			} else {
				this.draw_tool.disable();
			}
		}
	}
};