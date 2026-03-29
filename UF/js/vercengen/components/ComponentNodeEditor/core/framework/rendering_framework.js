//Initialise methods
{
	/**
	 * Clears the current instance, disposing all existing nodes and user interactions.
	 * - Method of: {@link ve.NodeEditor}
	 * 
	 * @alias ve.Component.NodeEditor.prototype.clear
	 * @instance
	 * @memberof ve.NodeEditor
	 * @this ve.NodeEditor
	 */
	ve.NodeEditor.prototype.clear = function () {
		//Declare local instance variables
		if (this.node_layer) this.node_layer.clear();
		
		//Iterate over all nodes and remove them
		for (let i = this.main.nodes.length - 1; i >= 0; i--)
			this.main.nodes[i].remove();
		
		//Reset ve.NodeEditor trackers
		this.main.nodes = [];
		this.main.user.selected_nodes = [];
		this.main.variables = {};
	};
	
	/**
	 * Returns the canvas element of the NodeEditor.
	 * - Method of: {@link ve.NodeEditor}
	 * 
	 * @alias ve.Component.NodeEditor.prototype.getCanvas
	 * @instance
	 * @memberof ve.NodeEditor
	 * @this ve.NodeEditor
	 * 
	 * @returns {HTMLCanvasElement}
	 */
	ve.NodeEditor.prototype.getCanvas = function () {
		//Declare local instance variables
		if (!this._canvas) this._canvas = document.createElement("canvas");
		
		//Return statement
		return this._canvas;
	};
	
	/**
	 * Fetches the default base layer as a tile layer. Used for the actual dark graph background.
	 * - Method of: {@link ve.NodeEditor}
	 * 
	 * @alias ve.Component.NodeEditor.prototype.getDefaultBaseLayer
	 * @instance
	 * @memberof ve.NodeEditor
	 * @this ve.NodeEditor
	 * 
	 * @returns {maptalks.TileLayer}
	 */
	ve.NodeEditor.prototype.getDefaultBaseLayer = function () {
		//Declare local instance variables
		let base_layer = new maptalks.TileLayer("base", {
			urlTemplate: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
			subdomains: ["a", "b", "c"],
			repeatWorld: true,
		});
		base_layer.getBase64Image = (arg0_image) => {
			//Convert from parameters
			let img = arg0_image;
			
			//Declare local instance variables
			let canvas = this.getCanvas();
				canvas.height = img.height;
				canvas.width = img.width;
			let ctx = canvas.getContext("2d");
			
			//Draw background, then grid lines
			if (this.options.bg_ctx) {
				ctx = this.options.bg_ctx(ctx); //Pass context to .bg_ctx() method option if defined
			} else {
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.drawImage(img, 0, 0);
				ctx.fillStyle = `rgba(25, 25, 25, 1)`;
				ctx.fillRect(0, 0, canvas.width, canvas.height);
				ctx.save();
				ctx.strokeStyle = `rgba(255, 255, 255, 0.5)`;
				ctx.lineWidth = 1;
				
				let columns = 8;
				let rows = 8;
				let cell_height = canvas.height / rows;
				let cell_width = canvas.width / columns;
				
				//Iterate over all columns (draw vertical lines)
				for (let i = 0; i <= columns; i++) {
					let local_x = i*cell_width;
					ctx.beginPath();
					ctx.moveTo(local_x, 0);
					ctx.lineTo(local_x, canvas.height);
					ctx.stroke();
				}
				//Iterate over all rows (draw horizontal lines)
				for (let i = 0; i <= rows; i++) {
					let local_y = i*cell_height;
					ctx.beginPath();
					ctx.moveTo(0, local_y);
					ctx.lineTo(canvas.width, local_y);
					ctx.stroke();
				}
				ctx.restore();
			}
			
			//Return statement
			return canvas.toDataURL("image/jpg", 0.7);
		};
		base_layer.getTileUrl = function (x, y, z) {
			//Return statement
			return maptalks.TileLayer.prototype.getTileUrl.call(this, x, y, z);
		};
		
		//Create current renderer
		base_layer.on("renderercreate", (e) => {
			e.renderer.loadTileImage = (arg0_image, arg1_url) => {
				//Convert from parameters
				let img = arg0_image;
				let url = arg1_url;
				
				//Declare local instance variables
				let remote_image = new Image();
					remote_image.crossOrigin = "anonymous";
					remote_image.onload = () =>
						(img.src = base_layer.getBase64Image(remote_image));
					remote_image.src = url;
			};
		});
		
		//Return statement
		return base_layer;
	};
}