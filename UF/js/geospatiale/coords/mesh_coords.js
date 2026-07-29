//Initialise functions
{
	if (!global.Geospatiale) global.Geospatiale = {};
	
	/**
	 * Computes the Thin Plate Spline (TPS) coefficients for a given set of mesh points.
	 * @alias Geospatiale.computeTPSCoefficients
	 * 
	 * @param {Object[]} arg0_mesh_points - An array of points containing x, y (target) and src_x, src_y (source).
	 * 
	 * @returns {Object} An object containing the solved coefficients for the x and y dimensions.
	 */
	Geospatiale.computeTPSCoefficients = function (arg0_mesh_points) {
		//Convert from parameters
		let mesh_points = arg0_mesh_points;
		
		//Declare local instance variables
		let n = mesh_points.length;
		let rhs_x = new Array(n + 3).fill(0);
		let rhs_y = new Array(n + 3).fill(0);
		
		let matrix = Array.from({ length: n + 3 }, () => new Array(n + 3).fill(0));
		
		//Iterate over all mesh_points
		for (let i = 0; i < n; i++) {
			rhs_x[i] = mesh_points[i].x;
			rhs_y[i] = mesh_points[i].y;
			
			//Iterate over all mesh_points
			for (let j = 0; j < n; j++) {
				let dx = mesh_points[i].src_x - mesh_points[j].src_x;
				let dy = mesh_points[i].src_y - mesh_points[j].src_y;
				
				let r2 = dx*dx + dy*dy;
				matrix[i][j] = (r2 === 0) ? 0 : r2*Math.log(Math.sqrt(r2));
			}
			
			//Adjust cell values
			matrix[i][n] = 1;
			matrix[i][n + 1] = mesh_points[i].src_x;
			matrix[i][n + 2] = mesh_points[i].src_y;
			matrix[n][i] = 1;
			matrix[n + 1][i] = mesh_points[i].src_x;
			matrix[n + 2][i] = mesh_points[i].src_y;
		}
		
		//Return statement
		return {
			x: Geospatiale.solveLinearSystem(matrix.map((row) => [...row]), rhs_x),
			y: Geospatiale.solveLinearSystem(matrix.map((row) => [...row]), rhs_y),
		};
	};
	
	/**
	 * Converts a browser mouse event into world/canvas coordinate space.
	 * @alias Geospatiale.convertEventToWorld
	 * 
	 * @param {MouseEvent} arg0_e - The mouse event object.
	 * @param {DOMRect} arg1_canvas_rect - The bounding client rectangle of the canvas.
	 * @param {number} arg2_factor - The current scale/zoom factor.
	 * @param {number} arg3_buffer_offset - The offset buffer applied to the coordinates.
	 * 
	 * @returns {Object} An object containing the x and y coordinates in world space.
	 */
	Geospatiale.convertEventToWorld = function (arg0_e, arg1_canvas_rect, arg2_factor, arg3_buffer_offset) {
		//Convert from parameters
		let e = arg0_e;
		let canvas_rect = arg1_canvas_rect;
		let factor = arg2_factor;
		let buffer_offset = arg3_buffer_offset;
		
		//Return statement
		return {
			x: (e.clientX - canvas_rect.left)/factor - buffer_offset,
			y: (e.clientY - canvas_rect.top)/factor - buffer_offset,
		};
	};
	
	/**
	 * Performs Delaunay triangulation on a set of 2D points.
	 * @alias Geospatiale.delaunayTriangulate
	 * 
	 * @param {Object[]} arg0_points - Array of objects with x and y properties.
	 * @param {number} arg1_image_centre - The coordinate to be treated as the centre for the super-triangle calculation.
	 * 
	 * @returns {number[]} A flat array of indices representing triangles.
	 */
	Geospatiale.delaunayTriangulate = function (arg0_points, arg1_image_centre) {
		//Convert from parameters
		let pts = arg0_points;
		let img_centre = arg1_image_centre;
		
		//Declare local instance variables
		let big_value = 1e12;
		let indices = [];
		let st_p1 = { x: img_centre, y: -big_value };
		let st_p2 = { x: -big_value, y: big_value };
		let st_p3 = { x: big_value, y: big_value };
		let triangles = [{ 
			p1: st_p1, p2: st_p2, p3: st_p3, 
			i1: -1, i2: -2, i3: -3 
		}];
		
		//Iterate over all pts
		pts.forEach((p, idx) => {
			let edges = [];
			let unique_edges = [];
			
			triangles = triangles.filter((tri) => {
				let circum = Geospatiale.getCircumcircle(tri.p1, tri.p2, tri.p3);
				
				if (Math.hypot(p.x - circum.x, p.y - circum.y) < circum.r) {
					edges.push([tri.i1, tri.i2], [tri.i2, tri.i3], [tri.i3, tri.i1]);
					
					//Return statement
					return false;
				}
				return true;
			});
			
			//Iterate over all edges
			edges.forEach((e1, i) => {
				let is_duplicate = false;
				
				edges.forEach((e2, j) => {
					if (i !== j && (
						(e1[0] === e2[0] && e1[1] === e2[1]) || (e1[0] === e2[1] && e1[1] === e2[0])
					)) is_duplicate = true;
				});
				
				if (!is_duplicate) unique_edges.push(e1);
			});
			
			//Iterate over all unique_edges
			unique_edges.forEach((edge) => {
				let p_a, p_b;
				
				if (edge[0] === -1) { p_a = st_p1; }
				else if (edge[0] === -2) { p_a = st_p2; }
				else if (edge[0] === -3) { p_a = st_p3; }
				else { p_a = pts[edge[0]]; }
				
				if (edge[1] === -1) { p_b = st_p1; }
				else if (edge[1] === -2) { p_b = st_p2; }
				else if (edge[1] === -3) { p_b = st_p3; }
				else { p_b = pts[edge[1]]; }
				
				triangles.push({ 
					p1: p_a, p2: p_b, p3: p, 
					i1: edge[0], i2: edge[1], i3: idx 
				});
			});
		});
		
		//Iterate over all triangles
		triangles.forEach((tri) => {
			if (tri.i1 >= 0 && tri.i2 >= 0 && tri.i3 >= 0) 
				indices.push(tri.i1, tri.i2, tri.i3);
		});
		
		//Return statement
		return indices;
	};
	
	/**
	 * Draws the mesh wireframe and control points onto a canvas context.
	 * @alias Geospatiale.drawMeshOverlay
	 * 
	 * @param {CanvasRenderingContext2D} arg0_ctx - The target canvas context.
	 * @param {Object[]} arg1_mesh_points - Array of points representing the vertices.
	 * @param {number[]} arg2_mesh_triangles - Flat array of vertex indices for triangles.
	 * @param {number} arg3_factor - Scale factor for line width and radius.
	 * @param {number} arg4_base_point_radius - The base radius for rendering control points.
	 * @param {number|null} arg5_selected_point_index - The index of the currently selected point, if any.
	 */
	Geospatiale.drawMeshOverlay = function (arg0_ctx, arg1_mesh_points, arg2_mesh_triangles, arg3_factor, arg4_base_point_radius, arg5_selected_point_index) {
		//Convert from parameters
		let ctx = arg0_ctx;
		let mesh_points = arg1_mesh_points;
		let mesh_triangles = arg2_mesh_triangles;
		let factor = arg3_factor;
		let base_point_radius = arg4_base_point_radius;
		let selected_point_index = arg5_selected_point_index;
		
		//Declare local instance variables
		let stroke_width = 1/factor;
		let visual_radius = base_point_radius/factor;
		
		//Draw on canvas
		ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
		ctx.lineWidth = stroke_width;
		
		//Iterate over all mesh_triangles and draw them
		for (let i = 0; i < mesh_triangles.length; i += 3) {
			ctx.beginPath();
			ctx.moveTo(mesh_points[mesh_triangles[i]].x, mesh_points[mesh_triangles[i]].y);
			ctx.lineTo(mesh_points[mesh_triangles[i + 1]].x, mesh_points[mesh_triangles[i + 1]].y);
			ctx.lineTo(mesh_points[mesh_triangles[i + 2]].x, mesh_points[mesh_triangles[i + 2]].y);
			ctx.closePath();
			ctx.stroke();
		}
		
		//Iterate over all mesh_points and draw them
		mesh_points.forEach((p, i) => {
			ctx.fillStyle = (selected_point_index === i) ? 
				"#00ff00" : "rgba(255, 200, 100, 0.9)";
			ctx.beginPath();
			ctx.arc(p.x, p.y, visual_radius, 0, Math.PI*2);
			ctx.fill();
			ctx.strokeStyle = "white";
			ctx.stroke();
		});
	}
	
	/**
	 * Draws a textured triangle onto the canvas by mapping source points to destination points using an affine transform.
	 * @alias Geospatiale.drawTriangle
	 * 
	 * @param {CanvasRenderingContext2D} arg0_ctx - The target canvas context.
	 * @param {HTMLImageElement} arg1_image - The source image to sample from.
	 * @param {number} arg2_image_display_size - The display size of the image coordinates.
	 * @param {Object} arg3_src_point - First source point {x, y}.
	 * @param {Object} arg4_src_point - Second source point {x, y}.
	 * @param {Object} arg5_src_point - Third source point {x, y}.
	 * @param {Object} arg6_dest_point - First destination point {x, y}.
	 * @param {Object} arg7_dest_point - Second destination point {x, y}.
	 * @param {Object} arg8_dest_point - Third destination point {x, y}.
	 */
	Geospatiale.drawTriangle = function (arg0_ctx, arg1_image, arg2_image_display_size, arg3_src_point, arg4_src_point, arg5_src_point, arg6_dest_point, arg7_dest_point, arg8_dest_point) {
		//Convert from parameters
		let ctx = arg0_ctx;
		let image = arg1_image;
		let img_display_size = arg2_image_display_size;
		let src_p1 = arg3_src_point;
		let src_p2 = arg4_src_point;
		let src_p3 = arg5_src_point;
		let dst_p1 = arg6_dest_point;
		let dst_p2 = arg7_dest_point;
		let dst_p3 = arg8_dest_point;
		
		//Declare local instance variables
		let matrix = Geospatiale.getTransformMatrix(src_p1, src_p2, src_p3, dst_p1, dst_p2, dst_p3);
			if (!matrix) return;
		
		//Draw on canvas ctx
		ctx.save();
		ctx.beginPath();
		ctx.moveTo(dst_p1.x, dst_p1.y);
		ctx.lineTo(dst_p2.x, dst_p2.y);
		ctx.lineTo(dst_p3.x, dst_p3.y);
		ctx.closePath();
		ctx.clip();
		ctx.transform(matrix.a, matrix.c, matrix.b, matrix.d, matrix.e, matrix.f);
		ctx.drawImage(image, 0, 0, img_display_size, img_display_size);
		ctx.restore();
	};
	
	/**
	 * Calculates the barycentric coordinates of a point relative to a triangle.
	 * @alias Geospatiale.getBarycentric
	 * 
	 * @param {Object} arg0_point - The point to test {x, y}.
	 * @param {Object} arg1_point - First triangle vertex.
	 * @param {Object} arg2_point - Second triangle vertex.
	 * @param {Object} arg3_point - Third triangle vertex.
	 * 
	 * @returns {Object} An object containing weights u, v, w and a boolean 'inside'.
	 */
	Geospatiale.getBarycentric = function (arg0_point, arg1_point, arg2_point, arg3_point) {
		//Convert from parameters
		let p = arg0_point;
		let p1 = arg1_point;
		let p2 = arg2_point;
		let p3 = arg3_point;
		
		//Declare local instance variables
		let det = (p2.y - p3.y)*(p1.x - p3.x) + (p3.x - p2.x)*(p1.y - p3.y);
		let u = ((p2.y - p3.y)*(p.x - p3.x) + (p3.x - p2.x)*(p.y - p3.y))/det;
		let v = ((p3.y - p1.y)*(p.x - p3.x) + (p1.x - p3.x)*(p.y - p3.y))/det;
		let w = 1 - u - v;
		
		//Return statement
		return { u: u, v: v, w: w, inside: (u >= 0 && v >= 0 && w >= 0) };
	};
	
	/**
	 * Calculates the circumcircle of a triangle defined by three points.
	 * @alias Geospatiale.getCircumcircle
	 * 
	 * @param {Object} arg0_point - First point.
	 * @param {Object} arg1_point - Second point.
	 * @param {Object} arg2_point - Third point.
	 * 
	 * @returns {Object} An object containing the centre coordinates x, y and the radius r.
	 */
	Geospatiale.getCircumcircle = function (arg0_point, arg1_point, arg2_point) {
		//Convert from parameters
		let p1 = arg0_point;
		let p2 = arg1_point;
		let p3 = arg2_point;
		
		//Declare local instance variables
		let x1 = p1.x, y1 = p1.y, 
			x2 = p2.x, y2 = p2.y, 
			x3 = p3.x, y3 = p3.y;
		
		let d = 2*(x1*(y2 - y3) + x2*(y3 - y1) + x3*(y1 - y2));
		let ux = (
			(x1*x1 + y1*y1)*(y2 - y3) + 
			(x2*x2 + y2*y2)*(y3 - y1) + 
			(x3*x3 + y3*y3)*(y1 - y2)
		)/d;
		let uy = (
			(x1*x1 + y1*y1)*(x3 - x2) + 
			(x2*x2 + y2*y2)*(x1 - x3) + 
			(x3*x3 + y3*y3)*(x2 - x1)
		)/d;
		
		//Return statement
		return { 
			x: ux, 
			y: uy, 
			r: Math.hypot(x1 - ux, y1 - uy) 
		};
	};
	
	/**
	 * Identifies the index of a mesh point within a specific hitbox radius.
	 * @alias Geospatiale.getPointIndexAt
	 * 
	 * @param {number} arg0_x - X coordinate to check.
	 * @param {number} arg1_y - Y coordinate to check.
	 * @param {Object[]} arg2_mesh_points - Array of mesh points.
	 * @param {number} arg3_factor - Scale factor to adjust the hitbox.
	 * @param {number} arg4_hitbox_radius - The base radius for the selection hitbox.
	 * 
	 * @returns {number|null} The index of the point if found, otherwise null.
	 */
	Geospatiale.getPointIndexAt = function (arg0_x, arg1_y, arg2_mesh_points, arg3_factor, arg4_hitbox_radius) {
		//Convert from parameters
		let x = arg0_x;
		let y = arg1_y;
		let mesh_points = arg2_mesh_points;
		let factor = arg3_factor;
		let hitbox_radius = arg4_hitbox_radius;
		
		//Declare local instance variables
		let threshold = hitbox_radius/factor;
		
		//Iterate over all mesh_points
		for (let i = 0; i < mesh_points.length; i++) {
			let p = mesh_points[i];
			if (Math.hypot(p.x - x, p.y - y) < threshold) return i; //Return statement if hypot < threshold
		}
		
		//Return statement
		return null;
	};
	
	/**
	 * Calculates the warped position of a source point using TPS coefficients.
	 * @alias Geospatiale.getTPSPosition
	 * 
	 * @param {number} arg0_src_x - The source x coordinate.
	 * @param {number} arg1_src_y - The source y coordinate.
	 * @param {Object[]} arg2_mesh_points - The original mesh points.
	 * @param {number[]} arg3_coeffs_x - Solved TPS coefficients for the X dimension.
	 * @param {number[]} arg4_coeffs_y - Solved TPS coefficients for the Y dimension.
	 * 
	 * @returns {Object} The transformed coordinates {x, y}.
	 */
	Geospatiale.getTPSPosition = function (arg0_src_x, arg1_src_y, arg2_mesh_points, arg3_coeffs_x, arg4_coeffs_y) {
		//Convert from parameters
		let src_x = arg0_src_x;
		let src_y = arg1_src_y;
		let mesh_points = arg2_mesh_points;
		let coeffs_x = arg3_coeffs_x;
		let coeffs_y = arg4_coeffs_y;
		
		//Declare local instance variables
		let n = mesh_points.length;
		let res_x = coeffs_x[n] + coeffs_x[n + 1]*src_x + coeffs_x[n + 2]*src_y;
		let res_y = coeffs_y[n] + coeffs_y[n + 1]*src_x + coeffs_y[n + 2]*src_y;
		
		//Iterate over all mesh_points
		for (let i = 0; i < n; i++) {
			let dx = src_x - mesh_points[i].src_x;
			let dy = src_y - mesh_points[i].src_y;
			let r2 = dx*dx + dy*dy;
			
			let kernel = (r2 === 0) ? 0 : r2*Math.log(Math.sqrt(r2));
			
			//Adjust res_x, res_y
			res_x += coeffs_x[i]*kernel;
			res_y += coeffs_y[i]*kernel;
		}
		
		//Return statement
		return { x: res_x, y: res_y };
	};
	
	/**
	 * Computes the 2D affine transform matrix to map one triangle to another.
	 * @alias Geospatiale.getTransformMatrix
	 * 
	 * @param {Object} arg0_src_point - First source point.
	 * @param {Object} arg1_src_point - Second source point.
	 * @param {Object} arg2_src_point - Third source point.
	 * @param {Object} arg3_dest_point - First destination point.
	 * @param {Object} arg4_dest_point - Second destination point.
	 * @param {Object} arg5_dest_point - Third destination point.
	 * 
	 * @returns {Object|null} The matrix components {a, b, c, d, e, f} or null if the triangle is degenerate.
	 */
	Geospatiale.getTransformMatrix =  function (arg0_src_point, arg1_src_point, arg2_src_point, arg3_dest_point, arg4_dest_point, arg5_dest_point) {
		//Convert from parameters
		let src_p1 = arg0_src_point;
		let src_p2 = arg1_src_point;
		let src_p3 = arg2_src_point;
		let dst_p1 = arg3_dest_point;
		let dst_p2 = arg4_dest_point;
		let dst_p3 = arg5_dest_point;
		
		//Declare local instance variables
		let x1 = src_p1.x, y1 = src_p1.y, 
			x2 = src_p2.x, y2 = src_p2.y, 
			x3 = src_p3.x, y3 = src_p3.y;
		let dx1 = x2 - x1, 
			dy1 = y2 - y1, 
			dx2 = x3 - x1, 
			dy2 = y3 - y1;
		let det = dx1*dy2 - dy1*dx2;
		if (Math.abs(det) < 0.001) return null; //Internal guard clause if det is too small
		
		//Inverse det
		let inv_det = 1/det;
		let u1 = dst_p1.x, v1 = dst_p1.y, 
			u2 = dst_p2.x, v2 = dst_p2.y, 
			u3 = dst_p3.x, v3 = dst_p3.y;
		
		let du1 = u2 - u1, dv1 = v2 - v1, 
			du2 = u3 - u1, dv2 = v3 - v1;
		let ma = (du1*dy2 - du2*dy1)*inv_det, 
			mb = (dx1*du2 - dx2*du1)*inv_det;
		let mc = (dv1*dy2 - dv2*dy1)*inv_det, 
			md = (dx1*dv2 - dx2*dv1)*inv_det;
		let me = u1 - ma*x1 - mb*y1, 
			mf = v1 - mc*x1 - md*y1;
		
		//Return statement
		return { a: ma, b: mb, c: mc, d: md, e: me, f: mf };
	};
	
	/**
	 * Renders an image using a Thin Plate Spline grid warp.
	 * @alias Geospatiale.renderTPSGrid
	 * 
	 * @param {CanvasRenderingContext2D} arg0_ctx - The target canvas context.
	 * @param {HTMLImageElement} arg1_image - The image to warp.
	 * @param {number} arg2_image_display_size - The logical size of the source image.
	 * @param {number} arg3_grid_resolution - The number of grid segments per axis.
	 * @param {Object[]} arg4_mesh_points - The control points for the warp.
	 * @param {number[]} arg5_coeffs_x - TPS coefficients for the X dimension.
	 * @param {number[]} arg6_coeffs_y - TPS coefficients for the Y dimension.
	 */
	Geospatiale.renderTPSGrid = function (arg0_ctx, arg1_image, arg2_image_display_size, arg3_grid_resolution, arg4_mesh_points, arg5_coeffs_x, arg6_coeffs_y) {
		//Convert from parameters
		let ctx = arg0_ctx;
		let image = arg1_image;
		let img_display_size =  arg2_image_display_size;
		let grid_res = arg3_grid_resolution;
		let mesh_points = arg4_mesh_points;
		let coeffs_x = arg5_coeffs_x;
		let coeffs_y = arg6_coeffs_y;
		
		//Declare local instance variables
		let step = img_display_size/grid_res;
		
		//Iterate over grid_res iy, ix
		for (let iy = 0; iy < grid_res; iy++)
			for (let ix = 0; ix < grid_res; ix++) {
				let sx0 = ix*step, sy0 = iy*step, 
					sx1 = (ix + 1)*step, sy1 = (iy + 1)*step;
				
				let p00 = Geospatiale.getTPSPosition(sx0, sy0, mesh_points, coeffs_x, coeffs_y);
				let p10 = Geospatiale.getTPSPosition(sx1, sy0, mesh_points, coeffs_x, coeffs_y);
				let p01 = Geospatiale.getTPSPosition(sx0, sy1, mesh_points, coeffs_x, coeffs_y);
				let p11 = Geospatiale.getTPSPosition(sx1, sy1, mesh_points, coeffs_x, coeffs_y);
				
				//Draw triangles
				Geospatiale.drawTriangle(ctx, image, img_display_size, { x: sx0, y: sy0 }, { x: sx1, y: sy0 }, { x: sx0, y: sy1 }, p00, p10, p01);
				Geospatiale.drawTriangle(ctx, image, img_display_size, { x: sx1, y: sy0 }, { x: sx1, y: sy1 }, { x: sx0, y: sy1 }, p10, p11, p01);
			}
	};
	
	/**
	 * Solves a linear system of equations using Gaussian elimination with partial pivoting.
	 * @alias Geospatiale.solveGaussianElimination
	 * 
	 * @param {Array.<number[]>} arg0_matrix - The coefficient matrix.
	 * @param {number[]} arg1_target - The right-hand side vector.
	 * 
	 * @returns {number[]} The solution vector x.
	 */
	Geospatiale.solveLinearSystem = function (arg0_matrix, arg1_target) {
		//Convert from parameters
		let matrix = arg0_matrix;
		let target = arg1_target;
		
		//Declare local instance variables
		let n = target.length;
		
		//Iterate over all rows in the matrix
		for (let i = 0; i < n; i++) {
			let max = i;
			
			//Iterate over all cells in the row
			for (let j = i + 1; j < n; j++)
				if (Math.abs(matrix[j][i]) > Math.abs(matrix[max][i])) max = j;
			
			let temp_row = matrix[i];
			matrix[i] = matrix[max];
			matrix[max] = temp_row;
			
			let temp_val = target[i];
			target[i] = target[max];
			target[max] = temp_val;
			
			//Iterate over all cells in the row
			for (let j = i + 1; j < n; j++) {
				let factor = matrix[j][i]/matrix[i][i];
				target[j] -= factor*target[i];
				
				//Adjust factor
				for (let k = i; k < n; k++) 
					matrix[j][k] -= factor*matrix[i][k];
			}
		}
		
		let x = new Array(n);
		
		//Iterate in reverse over all rows in the matrix
		for (let i = n - 1; i >= 0; i--) {
			let sum = 0;
			
			//Iterate over all cells in the row
			for (let j = i + 1; j < n; j++) 
				sum += matrix[i][j]*x[j];
			x[i] = (target[i] - sum)/matrix[i][i];
		}
		
		//Return statement
		return x;
	};
}