//Initialise functions
{
	/**
	 * Performs an absolute value operation on every valid element in an array, recursively.
	 * @alias Array.absoluteValue
	 * 
	 * @param {number[]} arg0_array
	 * @param {Object} [arg1_options]
	 *  @param {boolean} [arg1_options.recursive=true]
	 * 
	 * @returns {number[]}
	 */
	Array.absoluteValue = function (arg0_array, arg1_options) {
		//Convert from parameters
		let array = Array.toArray(arg0_array);
		let options = (arg1_options) ? arg1_options : {};
		
		//Return statement
		return Array.operate(array, `Math.abs(n)`, options);
	};
	
	/**
	 * Absolute value the distance between two arrays, recursively.
	 * @alias Array.absoluteValueArrays
	 * 
	 * @param {number[]} arg0_array - The array to perform absolute distances on.
	 * @param {number[]} arg1_array - The second array with which to compare distances.
	 * @param {Object} [arg2_options]
	 *  @param {boolean} [arg2_options.recursive=true]
	 * 
	 * @returns {number[]}
	 */
	Array.absoluteValueArrays = function (arg0_array, arg1_array, arg2_options) {
		//Convert from parameters
		let array = Array.toArray(arg0_array);
		let ot_array = Array.toArray(arg1_array);
		let options = (arg2_options) ? arg2_options : {};
		
		//Return statement
		return Array.operate(array, ot_array, `Math.abs(i - x)`, options);
	};
	
	/**
	 * Performs an addition operation on every valid element in an array, recursively.
	 * @alias Array.add
	 * 
	 * @param {number[]} arg0_array - The array to pass to the function.
	 * @param {number} arg1_number - The value to add to the array.
	 * @param {Object} [arg2_options]
	 *  @param {boolean} [arg2_options.recursive=true]
	 * 
	 * @returns {number[]}
	 */
	Array.add = function (arg0_array, arg1_number, arg2_options) {
		//Convert from parameters
		let array = Array.toArray(arg0_array);
		let number = arg1_number;
		let options = (arg2_options) ? arg2_options : {};
		
		//Return statement
		return Array.operate(array, `n + ${number}`, options);
	};
	
	/**
	 * Adds two arrays together recursively.
	 * @alias Array.addArrays
	 * 
	 * @param {number[]} arg0_array - The first array to add to.
	 * @param {number[]} arg1_array - The second array to add with.
	 * @param {Object} [arg2_options]
	 *  @param {boolean} [arg2_options.recursive=true]
	 * 
	 * @returns {number[]}
	 */
	Array.addArrays = function (arg0_array, arg1_array, arg2_options) {
		//Convert from parameters
		let array = Array.toArray(arg0_array);
		let ot_array = Array.toArray(arg1_array);
		let options = (arg2_options) ? arg2_options : {};
		
		//Return statement
		return Array.operate(array, ot_array, `i + x`, options);
	};
	
	/**
	 * Adds 2 matrices represented as 2D arrays together.
	 * @alias Array.addMatrices
	 * 
	 * @param {Array.<number[]>} arg0_matrix - The first matrix to add.
	 * @param {Array.<number[]>} arg1_matrix - The second matrix to add.
	 * 
	 * @returns {Array.<number[]>}
	 */
	Array.addMatrices = function (arg0_matrix, arg1_matrix) {
		//Convert from parameters
		let matrix = arg0_matrix;
		let ot_matrix = arg1_matrix;
		
		//Declare local instance variables
		let return_matrix = [];
		
		//Iterate over matrix rows
		for (let i = 0; i < matrix.length; i++) {
			//Create a new row for return_matrix
			return_matrix.push([]);
			
			//Iterate over columns
			for (let x = 0; x < matrix[i].length; x++)
				//Add corresponding elements and push to the result matrix
				return_matrix[i].push(matrix[i][x] + ot_matrix[i][x]);
		}
		
		//Return statement
		return return_matrix;
	};
	
	/**
	 * Concatenates two arrays and returns it.
	 * @alias Array.append
	 * 
	 * @param {Array.<any[]>} arg0_array
	 * @param {Array.<any[]>} arg1_array
	 * 
	 * @returns {Array.<any[]>}
	 */
	Array.append = function (arg0_array, arg1_array) {
		//Convert from parameters
		let array = Array.toArray(arg0_array);
		let ot_array = Array.toArray(arg1_array);
		
		//Return statement
		return array.concat(ot_array);
	};
	
	/**
	 * Combine the columns of two matrices to form a new matrix.
	 * @alias Array.augmentMatrices
	 * 
	 * @param {Array.<any[]>} arg0_matrix - The first matrix to augment on.
	 * @param {Array.<any[]>} arg1_matrix - The second matrix to augment with.
	 * 
	 * @returns {Array.<any[]>}
	 */
	Array.augmentMatrices = function (arg0_matrix, arg1_matrix) {
		//Convert from parameters
		let matrix = arg0_matrix;
		let ot_matrix = arg1_matrix;
		
		//Declare local instance variables
		let return_matrix = [];
		
		for (let i = 0; i < matrix.length; i++)
			return_matrix.push(matrix[i].concat(ot_matrix[i]));
		
		//Return statement
		return return_matrix;
	};
	
	/**
	 * Performs a Cholesky decomposition on a matrix.
	 * @alias Array.choleskyDecompositionMatrix
	 * 
	 * @param {Array.<any[]>} arg0_matrix - The matrix to pass to the function.
	 * 
	 * @returns {Array.<any[]>}
	 */
	Array.choleskyDecompositionMatrix = function (arg0_matrix) {
		//Convert from parameters
		let matrix = arg0_matrix;
		
		//Declare local instance variables
		let lower_triangular_matrix = Array.from({ length: matrix.length }, () => Array(matrix.length).fill(0));
		
		//Perform Cholesky decomposition
		for (let i = 0; i < matrix.length; i++)
			for (let x = 0; x <= i; x++) {
				let local_sum = 0;
				
				if (i === x) {
					//Diagonal element handling
					for (let y = 0; y < x; y++)
						local_sum += Math.pow(lower_triangular_matrix[i][x], 2);
					
					lower_triangular_matrix[x][x] = Math.sqrt(matrix[x][x] - local_sum);
				} else {
					//Non-diagonal element handling
					for (let y = 0; y < x; y++)
						local_sum += (lower_triangular_matrix[i][y]*lower_triangular_matrix[x][y]);
					
					lower_triangular_matrix[i][x] = (matrix[i][x] - local_sum)/lower_triangular_matrix[x][x];
				}
			}
		
		//Return statement
		return lower_triangular_matrix;
	};
	
	/**
	 * Cubic spline interpolates a given X position, assuming that points to be interpolated are along the X-axis.
	 * @alias Array.cubicSplineInterpolation
	 * 
	 * @param {number[]} arg0_x_values - Extant X values with data.
	 * @param {number[]} arg1_y_values - Y values corresponding to X values.
	 * @param {number|string} arg2_x_to_interpolate - The X value to interpolate for.
	 * 
	 * @returns {number}
	 */
	//[QUARANTINE]
	Array.cubicSplineInterpolation = function (arg0_x_values, arg1_y_values, arg2_x_to_interpolate) {
		let x_values = Array.toArray(arg0_x_values);
		let y_values = Array.toArray(arg1_y_values).map(y => (y > 0 ? Math.log(y) : Math.log(1e-6)));
		let x_to_interpolate = parseInt(arg2_x_to_interpolate);
		
		// 1. Calculate the Spline in log-space
		let interpolation = new cubic_spline(x_values, y_values);
		let interpolated_value = Math.exp(interpolation.at(x_to_interpolate));
		
		// 2. Find bounds only for clamping
		let prev_val = -Infinity, next_val = Infinity;
		for (let i = 0; i < x_values.length; i++) {
			if (x_values[i] <= x_to_interpolate) prev_val = Math.exp(y_values[i]);
			if (x_values[i] >= x_to_interpolate) { next_val = Math.exp(y_values[i]); break; }
		}
		
		// 3. Clamp the SPLINE value, don't overwrite it with a linear one
		let lower = Math.min(prev_val, next_val);
		let upper = Math.max(prev_val, next_val);
		
		return Math.max(lower, Math.min(interpolated_value, upper));
	};
	
	/**
	 * Performs a division operation on every valid element in an array, recursively.
	 * @alias Array.divide
	 * 
	 * @param {number[]} arg0_array - The array to pass to the function.
	 * @param {number[]} arg1_number - The value to divide by.
	 * @param {Object} [arg2_options]
	 *  @param {boolean} [arg2_options.recursive=true]
	 *  
	 * @returns {number[]}
	 */
	Array.divide = function (arg0_array, arg1_number, arg2_options) {
		//Convert from parameters
		let array = Array.toArray(arg0_array);
		let number = arg1_number;
		let options = (arg2_options) ? arg2_options : {};
		
		//Return statement
		return Array.operate(array, `n/${number}`, options);
	};
	
	/**
	 * Divides two arrays together recursively.
	 * @alias Array.divideArrays
	 * 
	 * @param {number[]} arg0_array - The base array.
	 * @param {number[]} arg1_array - The divisor array.
	 * @param {Object} [arg2_options]
	 *  @param {boolean} [arg2_options.recursive=true]
	 * 
	 * @returns {number[]}
	 */
	Array.divideArrays = function (arg0_array, arg1_array, arg2_options) {
		//Convert from parameters
		let array = Array.toArray(arg0_array);
		let ot_array = Array.toArray(arg1_array);
		let options = (arg2_options) ? arg2_options : {};
		
		//Return statement
		return Array.operate(array, ot_array, `i/x`, options);
	};
	
	/**
	 * Performs an exponent operation on every valid element in an array, recursively.
	 * @alias Array.exponentiate
	 * 
	 * @param {number[]} arg0_array - The array to pass to the function.
	 * @param {number} arg1_number - The value to exponentiate by.
	 * @param {Object} [arg2_options]
	 *  @param {boolean} [arg2_options.recursive=true]
	 * 
	 * @returns {number[]}
	 */
	Array.exponentiate = function (arg0_array, arg1_number, arg2_options) {
		//Convert from parameters
		let array = Array.toArray(arg0_array);
		let number = arg1_number;
		let options = (arg2_options) ? arg2_options : {};
		
		//Return statement
		return Array.operate(array, `Math.pow(n, ${number})`, options);
	};
	
	/**
	 * Exponentiates two arrays recursively.
	 * @alias Array.exponentiateArrays
	 * 
	 * @param {number[]} arg0_array
	 * @param {number[]} arg1_array
	 * @param {Object} [arg2_options]
	 *  @param {boolean} [arg2_options.recursive=true]
	 *  
	 * @returns {number[]}
	 */
	Array.exponentiateArrays = function (arg0_array, arg1_array, arg2_options) {
		//Convert from parameters
		let array = Array.toArray(arg0_array);
		let ot_array = Array.toArray(arg1_array);
		let options = (arg2_options) ? arg2_options : {};
		
		//Return statement
		return Array.operate(array, ot_array, `Math.pow(i, x)`, options);
	};
	
	/**
	 * Performs Gauss elimination on a matrix.
	 * @alias Array.gaussEliminationMatrix
	 * 
	 * @param {Array.<number[]>} arg0_matrix - The matrix to pass to the function.
	 * 
	 * @returns {Array.<number[]>}
	 */
	Array.gaussEliminationMatrix = function (arg0_matrix) {
		//Convert from parameters
		let matrix = arg0_matrix;
		
		//Declare local instance variables
		let augmented_matrix = JSON.parse(JSON.stringify(matrix));
		
		//Apply Gaussian elimination
		for (let i = 0; i < matrix.length; i++) {
			//Partial pivoting
			let max_row_index = i;
			
			for (let x = i + 1; x < matrix.length; x++)
				if (Math.abs(augmented_matrix[x][i]) > Math.abs(augmented_matrix[max_row_index][i]))
					max_row_index = x;
			
			//Swap rows
			[augmented_matrix[i], augmented_matrix[max_row_index]] = [augmented_matrix[max_row_index], augmented_matrix[i]];
			
			for (let x = i + 1; x < matrix.length; x++) {
				let local_ratio = augmented_matrix[x][i]/augmented_matrix[i][i];
				for (let y = i; y < matrix.length + 1; y++)
					augmented_matrix[x][y] -= local_ratio*augmented_matrix[i][y];
			}
		}
		
		//Back substitution
		let solution = new Array(matrix.length);
		
		for (let i = matrix.length - 1; i >= 0; i--) {
			solution[i] = augmented_matrix[i][matrix.length]/augmented_matrix[i][i];
			for (let x = i - 1; x >= 0; x--)
				augmented_matrix[x][matrix.length] -= augmented_matrix[x][i]*solution[i];
		}
		
		//Return statement
		return solution;
	};
	
	/**
	 * Performs Gauss-Jacobi on a matrix.
	 * @alias Array.gaussJacobiMatrix
	 * 
	 * @param {Array.<number[]>} arg0_matrix - The matrix to pass to the function.
	 * @param {number} [arg1_tolerance=1e-6] - The level of accuracy to tolerate.
	 * @param {number} [arg2_max_iterations=1000] - The number of max iterations.
	 * 
	 * @returns {Array.<number[]>}
	 */
	Array.gaussJacobiMatrix = function (arg0_matrix, arg1_tolerance, arg2_max_iterations) {
		//Convert from parameters
		let matrix = arg0_matrix;
		let tolerance = (arg1_tolerance) ? arg1_tolerance : 1e-6;
		let max_iterations = (arg2_max_iterations) ? arg2_max_iterations : 1000;
		
		//Declare local instance variables
		let error = tolerance + 1;
		let iteration = 0;
		let solution = new Array(matrix.length).fill(0);
		
		//While loop to process Gauss-Jacobi method
		while (error > tolerance && iteration < max_iterations) {
			let next_solution = new Array(matrix.length);
			
			for (let i = 0; i < matrix.length; i++) {
				let local_sum = 0;
				
				for (var x = 0; x < matrix.length; x++)
					if (i !== x)
						local_sum += matrix[i][x]*solution[x];
				
				next_solution[i] = (matrix[i][matrix.length] - local_sum)/matrix[i][i];
			}
			
			error = Math.max(...next_solution.map((value, index) => Math.abs(value - solution[index])));
			solution.splice(0, solution.length, ...next_solution);
			iteration++;
		}
		
		//Return statement
		return solution;
	};
	
	/**
	 * Performs Gauss-Jordan on a matrix.
	 * @alias Array.gaussJacobMatrix
	 * 
	 * @param {Array.<number[]>} arg0_matrix - The matrix to pass to the function.
	 * 
	 * @returns {number[]}
	 */
	Array.gaussJacobMatrix = function (arg0_matrix) {
		//Convert from parameters
		let matrix = arg0_matrix;
		
		//Forwards elimination
		for (let i = 0; i < matrix.length; i++) {
			//Find pivot row (maximum element in current column)
			let max_row_index = i;
			
			for (let x = i + 1; x < matrix.length; x++)
				if (Math.abs(matrix[x][i]) > Math.abs(matrix[max_row_index][i]))
					max_row_index = x;
			
			//Swap rows
			[matrix[i], matrix[max_row_index]] = [matrix[max_row_index], matrix[i]];
			
			//Set all elements of the current column except matrix[i][i] equal to 0
			for (let x = 0; x < matrix.length; x++)
				if (x !== i) {
					let factor = matrix[x][i]/matrix[i][i];
					
					for (let y = 0; y <= x; y++)
						matrix[x][y] -= factor*matrix[i][x];
				}
		}
		
		//Back substitution
		for (let i = 0; i < matrix.length; i++) {
			let divisor = matrix[i][i];
			
			for (let x = 0; x < matrix.length; x++)
				matrix[i][x] /= divisor;
		}
		
		//Return statement
		return matrix.map((row) => row[matrix.length]);
	};
	
	/**
	 * Performs Gauss-Seidel on a matrix.
	 * @alias Array.gaussSeidelMatrix
	 * 
	 * @param {Array.<number[]>} arg0_matrix - The matrix to pass to the function.
	 * @param {number} [arg1_tolerance=1e-6] - The level of accuracy to tolerate.
	 * @param {number} [arg2_max_iterations=1000] - The number of max iterations.
	 * 
	 * @returns {Array.<number[]>}
	 */
	Array.gaussSeidelMatrix = function (arg0_matrix, arg1_tolerance, arg2_max_iterations) {
		//Convert from parameters
		let matrix = arg0_matrix;
		let tolerance = (arg1_tolerance) ? arg1_tolerance : 1e-6;
		let max_iterations = (arg2_max_iterations) ? arg2_max_iterations : 1000;
		
		//Declare local instance variables
		let error = tolerance + 1;
		let iteration = 0;
		let solution = new Array(matrix.length).fill(0);
		
		//While loop to process Gauss-Seidel method
		while (error > tolerance && iteration < max_iterations) {
			let next_solution = new Array(matrix.length);
			
			for (let i = 0; i < matrix.length; i++) {
				let local_sum = 0;
				
				for (let x = 0; x < matrix.length; x++)
					if (i !== x)
						local_sum += matrix[i][x]*(j < i ? next_solution[x] : solution[x]);
				
				next_solution[i] = (matrix[i][matrix.length] - local_sum)/matrix[i][i];
			}
			
			error = Math.max(...next_solution.map((value, index) => Math.abs(value - solution[index])));
			solution.splice(0, solution.length, ...next_solution);
			iteration++;
		}
		
		//Return statement
		return solution;
	};
	
	/**
	 * Returns the mean of an array.
	 * @alias Array.getAverage
	 * 
	 * @param {number[]} arg0_array - The input array.
	 * 
	 * @returns {number}
	 */
	Array.getAverage = function (arg0_array) {
		//Convert from parameters
		let input_array = Array.toArray(arg0_array);
		
		//Declare local instance variables
		let array_sum = 0;
		
		//Iterate over input_array
		for (let i = 0; i < input_array.length; i++)
			array_sum += input_array[i];
		
		//Return statement
		return array_sum/input_array.length;
	};
	
	/**
	 * Finds the closest number in an array to a given target value.
	 * @alias Array.getClosest
	 * 
	 * @param {number[]} arg0_array
	 * @param {number} arg1_value
	 * 
	 * @returns {number|null}
	 */
	//[QUARANTINE]
	Array.getClosest = function (arg0_array, arg1_value) {
		//Convert from parameters
		let array = arg0_array;
		let value = Math.returnSafeNumber(arg1_value);
		
		if (!array || array.length === 0)
			return null;
		
		return array.reduce((closest, current) => {
			let currentDiff = Math.abs(current - value);
			let closestDiff = Math.abs(closest - value);
			
			return (currentDiff < closestDiff) ? current : closest;
		});
	};
	
	/**
	 * Finds the closest point in a domain for a given value.
	 * @alias Array.getClosestInDomain
	 * 
	 * @param {number[]} arg0_domain_array - The array to search.
	 * @param {number} arg1_value - The value to find the closest point for.
	 *
	 * @returns {number}
	 */
	Array.getClosestInDomain = function (arg0_domain_array, arg1_value) {
		//Convert from parameters
		let input_array = arg0_domain_array.sort((a, b) => a - b);
		let value = Math.returnSafeNumber(arg1_value);
		
		//Ensure the target is within the domain
		if (value < input_array[0]) return input_array[0];
		if (value > input_array[input_array.length - 1]) return input_array[input_array.length - 1];
		
		//Return statement
		return value;
	};
	
	/**
	 * Fetches the cofactor in a matrix.
	 * @alias Array.getCofactor
	 * 
	 * @param {Array.<number[]>} arg0_matrix - The matrix to pass to the function.
	 * @param {number} arg1_row - The row to calculate cofactor for.
	 * @param {number} arg2_column - The column to calculate cofactor for.
	 * 
	 * @returns {Array.<number[]>}
	 */
	Array.getCofactor = function (arg0_matrix, arg1_row, arg2_column) {
		//Convert from parameters
		let matrix = arg0_matrix;
		let row = arg1_row;
		let column = arg2_column;
		
		//Declare local instance variables
		let minor_matrix = [];
		
		// Iterate over matrix rows
		for (let i = 0; i < matrix.length; i++) {
			if (i !== row) {
				let new_row = [];
				
				// Iterate over matrix columns
				for (let x = 0; x < matrix[i].length; x++) {
					if (x !== column) {
						new_row.push(matrix[i][x]);
					}
				}
				
				minor_matrix.push(new_row);
			}
		}
		
		// Return the resulting minor matrix
		return minor_matrix;
	};
	
	/**
	 * Calculates the matrix determinant.
	 * @alias Array.getMatrixDeterminant
	 * 
	 * @param {Array.<number[]>} arg0_matrix - The matrix to pass to the function.
	 * 
	 * @returns {number}
	 */
	Array.getMatrixDeterminant = function (arg0_matrix) {
		//Convert from parameters
		let matrix = arg0_matrix;
		
		//Guard clause
		if (matrix.length === 2 && matrix[0].length === 2)
			return matrix[0][0]*matrix[1][1] - matrix[0][1]*matrix[1][0];
		
		//Declare local instance variables
		let determinant = 0;
		
		//Iterate over matrix to fetch determinant
		for (let i = 0; i < matrix.length; i++) {
			let minor = matrix.filter((row, index) => index !== i)
				.map((row) => row.slice(1));
			let sign = (i % 2 === 0) ? 1 : -1;
			
			determinant += sign*matrix[i][0]*Array.getMatrixDeterminant(minor);
		}
		
		//Return statement
		return determinant;
	};
	
	/**
	 * Returns the maximum value within an array.
	 * @alias Array.getMaximum
	 * 
	 * @param {any[]} arg0_array
	 * @param {number} arg1_max_value
	 * 
	 * @returns {number}
	 */
	Array.getMaximum = function (arg0_array, arg1_max_value) {
		//Convert from parameters
		let array = arg0_array;
		let max_value = arg1_max_value;
		
		//Iterate over array recursively
		for (let i = 0; i < array.length; i++)
			if (Array.isArray(array[i])) {
				max_value = Array.getMaximum(array[i], max_value);
			} else {
				if (typeof array[i] === "number")
					if (max_value) {
						max_value = Math.max(array[i], max_value);
					} else {
						max_value = array[i];
					}
			}
		
		//Return statement
		return max_value;
	};
	
	/**
	 * Returns the midpoint of an array.
	 * @alias Array.getMidpoint
	 * 
	 * @param {number[]} arg0_array
	 * 
	 * @returns {number}
	 */
	Array.getMidpoint = function (arg0_array) {
		//Convert from parameters
		let array = arg0_array;
		
		if (array.length === 0) return 0; //Internal guard clause if array has no elements
		if (array.length === 1) return array[0]; //Internal guard clause if array has only 1 element
		
		//Declare local instance variables
		let max_value = Array.getMaximum(array);
		let min_value = Array.getMinimum(array);
		
		//Return statement
		return (max_value + min_value)/2;
	};
	
	/**
	 * Returns the maximum value within an array.
	 * @alias Array.getMinimum
	 *
	 * @param {any[]} arg0_array
	 * @param {number} arg1_min_value
	 *
	 * @returns {number}
	 */
	Array.getMinimum = function (arg0_array, arg1_min_value) {
		//Convert from parameters
		let array = arg0_array;
		let min_value = arg1_min_value;
		
		//Iterate over array recursively
		for (let i = 0; i < array.length; i++)
			if (Array.isArray(array[i])) {
				min_value = Array.getMinimum(array[i], min_value);
			} else {
				if (typeof array[i] === "number")
					if (min_value) {
						min_value = Math.max(array[i], min_value);
					} else {
						min_value = array[i];
					}
			}
		
		//Return statement
		return min_value;
	};
	
	/**
	 * Performs Householder transformation on a matrix.
	 * @alias Array.householderTransformationMatrix
	 * 
	 * @param {Array.<number[]>} arg0_matrix - The matrix to pass to the function.
	 * 
	 * @returns {any}
	 */
	Array.householderTransformationMatrix = function (arg0_matrix) {
		//Convert from parameters
		let matrix = arg0_matrix;
		
		//Declare local instance variables
		let tridiagonal_matrix = JSON.parse(JSON.stringify(matrix));
		
		//Iterate over matrix
		for (let i = 0; i < matrix.length - 2; i++) {
			let x_vector = [];
			
			for (let x = i + 1; x < matrix.length; x++)
				x_vector.push(tridiagonal_matrix[x][i]);
			
			let alpha = x_vector.reduce((acc, value) => acc + Math.pow(value, 2), 0);
			let sign = (tridiagonal_matrix[i + 1][i] > 0) ? 1 : -1;
			let v1 = Math.sqrt(alpha)*sign;
			
			let beta = alpha - sign*v1*tridiagonal_matrix[i + 1][i];
			
			x_vector.unshift(0); //Pad x_vector with beginning 0
			
			for (let x = i + 1; x < matrix.length; x++) {
				let v2 = x_vector[x - i]/beta;
				
				for (let y = i + 1; y < matrix.length; y++)
					tridiagonal_matrix[x][y] -= 2*v2*x_vector[y - i];
				for (let y = 0; y < matrix.length; y++)
					tridiagonal_matrix[y][x] -= 2*v2*x_vector[y - i]*tridiagonal_matrix[i + 1][x];
			}
		}
		
		//Return statement
		return tridiagonal_matrix;
	};
	
	/**
	 * Inverts a matrix.
	 * @alias Array.inverseMatrix
	 * 
	 * @param {Array.<number[]>} arg0_matrix - The matrix to pass to the function.
	 * 
	 * @returns {Array.<number[]>}
	 */
	Array.inverseMatrix = function (arg0_matrix) {
		//Convert from parameters
		let matrix = arg0_matrix;
		
		//Declare local instance variables
		let adjugate = [];
		let determinant = Array.getMatrixDeterminant(matrix);
		
		//Iterate over matrix rows
		for (let i = 0; i < matrix.length; i++) {
			adjugate.push([]);
			
			//Iterate over columns in row
			for (let x = 0; x < matrix.length; x++) {
				let sign = ((i + x) % 2 === 0) ? 1 : -1;
				
				let minor = matrix.filter((row, index) => index !== i).map(
					row => row.filter((_, col_index) => col_index !== x)
				);
				adjugate[i].push(sign*Array.getMatrixDeterminant(minor));
			}
		}
		
		//Transpose matrix
		let transposed_matrix = Array.transposeMatrix(adjugate);
		let inverse = transposed_matrix.map(row => row.map(entry => entry/determinant));
		
		//Return statement
		return inverse;
	};
	
	/**
	 * Whether an array is purely of a given type.
	 * @alias Array.isType
	 * 
	 * @param {Array.<any[]>} arg0_array - The array to pass to the function.
	 * @param {string} arg1_type - The typeof to compare to.
	 * 
	 * @returns {boolean}
	 */
	Array.isType = function (arg0_array, arg1_type) {
		//Convert from parameters
		let array = Array.toArray(arg0_array);
		let type = arg1_type;
		
		//Declare local instance variables
		let check_failed = false;
		
		//Iterate over array
		for (let i = 0; i < array.length; i++)
			if (typeof array[i] !== type)
				check_failed = true;
		
		//Return statement
		return (!check_failed);
	};
	
	/**
	 * Performs Lagrange interpolation for a given X-value in a data series.
	 * @alias Array.lagrangeInterpolation
	 * 
	 * @param {number[]} arg0_x_values
	 * @param {number[]} arg1_y_values
	 * @param {number} arg2_x_to_interpolate
	 * 
	 * @returns {number}
	 */
	Array.lagrangeInterpolation = function (arg0_x_values, arg1_y_values, arg2_x_to_interpolate) {
		//Convert from parameters
		let x_values = Array.toArray(arg0_x_values);
		let y_values = Array.toArray(arg1_y_values);
		let x_to_interpolate = parseInt(arg2_x_to_interpolate);
		
		//Declare local instance variables
		let result = 0;
		
		//Iterate over all x_values
		for (let i = 0; i < x_values.length; i++) {
			let term = y_values[i];
			
			for (let x = 0; x < x_values.length; x++)
				if (i !== x)
					term = term*(x_to_interpolate - x_values[x])/(x_values[i] - x_values[x]);
			result += term;
		}
		
		//Return statement
		return result;
	};
	
	/**
	 * Performs linear interpolation for a given X-value in a data series.
	 * @alias Array.linearInterpolation
	 * 
	 * @param {number[]} arg0_x_values
	 * @param {number[]} arg1_y_values
	 * @param {number|string} arg2_x_to_interpolate
	 * 
	 * @returns {any|number}
	 */
	Array.linearInterpolation = function (arg0_x_values, arg1_y_values, arg2_x_to_interpolate) {
		let x_values = Array.toArray(arg0_x_values);
		let y_values = Array.toArray(arg1_y_values);
		let x = parseFloat(arg2_x_to_interpolate);
		
		//Guard clause to make sure x_values and y_values are valid
		if (x_values.length < 2 || y_values.length < 2) return y_values[0];
		if (x_values[0] === x_values[1]) return y_values[0];
		
		//Declare local instance variables
		let left_x = x_values[0];
		let right_x = x_values[1];
		let left_y = y_values[0];
		let right_y = y_values[1];
		
		//Use exponential growth if both values are positive
		if (left_y > 0 && right_y > 0) {
			let growth_rate = Math.log(right_y/left_y)/(right_x - left_x);
			if (x < left_x)
				return left_y*Math.exp(growth_rate * (x - left_x));
			if (x > right_x)
				return right_y*Math.exp(growth_rate * (x - right_x));
			return left_y + (x - left_x) * (right_y - left_y)/(right_x - left_x); //Linear interpolation
		}
		
		//Return statement; fallback to standard linear if growth is not defined
		let slope = (right_y - left_y)/(right_x - left_x);
		if (x < left_x)
			return left_y + (x - left_x)*slope;
		if (x > right_x)
			return right_y + (x - right_x)*slope;
		return left_y + (x - left_x)*slope;
	};
	
	/**
	 * Performs LUD decomposition on a matrix.
	 * @alias Array.LUDecompositionMatrix
	 * 
	 * @param {Array.<number[]>} arg0_matrix - The matrix to pass to the function.
	 * 
	 * @returns {{L: Array.<number[]>, U: Array.<number[]>}}
	 */
	Array.LUDecompositionMatrix = function (arg0_matrix) {
		let matrix = arg0_matrix;
		
		//Declare local instance variables
		let n = matrix.length;
		
		let L = Array.from({ length: n }, () => new Array(n).fill(0));
		let U = Array.from({ length: n }, () => new Array(n).fill(0));
		
		// Calculate LU Decomposition
		for (let i = 0; i < n; i++) {
			//1. Calculate the Upper Triangular matrix (U)
			for (let x = i; x < n; x++) {
				let sum = 0;
				for (let y = 0; y < i; y++)
					sum += L[i][y] * U[y][x];
				U[i][x] = matrix[i][x] - sum;
			}
			
			//2. Calculate the Lower Triangular matrix (L)
			for (let x = i; x < n; x++) {
				if (i === x) {
					L[i][i] = 1; //Diagonal of L is 1 (Doolittle's method)
				} else {
					let sum = 0;
					for (let y = 0; y < i; y++)
						sum += L[x][y] * U[y][i];
					
					//Handle division by zero if U[i][i] is 0 (Matrix is singular)
					if (U[i][i] === 0) {
						L[x][i] = 0;
					} else {
						L[x][i] = (matrix[x][i] - sum)/U[i][i];
					}
				}
			}
		}
		
		//Return statement
		return { L, U };
	};
	
	/**
	 * Performs a multiplication operation on every valid element in an array, recursively.
	 * @alias Array.multiply
	 * 
	 * @param {Array.<number[]>} arg0_array - The array to pass to the function.
	 * @param {number} arg1_number
	 * @param {Object} [arg2_options]
	 *  @param {boolean} [arg2_options.recursive=true]
	 * 
	 * @returns {Array.<number[]>}
	 */
	Array.multiply = function (arg0_array, arg1_number, arg2_options) {
		//Convert from parameters
		let array = Array.toArray(arg0_array);
		let number = arg1_number;
		let options = (arg2_options) ? arg2_options : {};
		
		//Return statement
		return Array.operate(array, `n*${number}`, options);
	};
	
	/**
	 * Multiplies two matrices.
	 * @alias Array.multiplyMatrices
	 * 
	 * @param {Array.<number[]>} arg0_matrix
	 * @param {Array.<number[]>} arg1_matrix
	 * 
	 * @returns {Array.<number[]>}
	 */
	Array.multiplyMatrices = function (arg0_matrix, arg1_matrix) {
		//Convert from parameters
		let matrix = arg0_matrix;
		let ot_matrix = arg1_matrix;
		
		//Declare local instance variables
		let m1_rows = matrix.length;
		let m1_columns = matrix[0].length;
		let m2_columns = ot_matrix.length;
		let return_matrix = [];
		
		//Iterate over matrix rows to multiply
		for (let i = 0; i < m1_rows; i++) {
			return_matrix.push([]);
			
			for (let x = 0; x < m2_columns; x++) {
				let local_sum = 0;
				
				for (let y = 0; y < m1_columns; y++)
					local_sum += matrix[i][y]*ot_matrix[y][x];
				return_matrix[i][x] = local_sum;
			}
		}
		
		//Return statement
		return return_matrix;
	};
	
	/**
	 * Applies a mathematical equation to every element of an array, recursively.
	 * @alias Array.operate
	 * 
	 * @param {any[]} arg0_array
	 * @param {string} arg1_equation - The string literal to use as an equation.<br>- 'n' represents the current array element.
	 * @param {Object} [arg2_options]
	 *  @param {boolean} [arg2_options.recursive=true] - Whether to recursively operate on the given array.
	 * 
	 * @returns {any[]}
	 */
	Array.operate = function (arg0_array, arg1_equation, arg2_options) {
		//Convert from parameters
		let array = Array.toArray(arg0_array);
		let equation = arg1_equation;
		let options = (arg2_options) ? arg2_options : {};
		
		//Initialise options
		if (options.recursive === undefined) options.recursive = true;
		
		//Guard clause if input is not array
		if (!Array.isArray(array)) return array;
		
		//Declare local instance variables
		let equation_expression = `return ${equation};`;
		let equation_function = new Function("n", equation_expression);
		
		//Return statement; recursively process each element of the array
		return array.map((element) => {
			if (Array.isArray(element) && options.recursive) {
				//Recursively call operateArray() if subarray is found
				return Array.operate(element, equation);
			} else {
				if (!isNaN(element)) {
					return equation_function(element);
				} else {
					//If element is not valid, return as is
					return element;
				}
			}
		});
	};
	
	/**
	 * Performs an operation when merging two arrays together, recursively.
	 * @alias Array.operateArrays
	 * 
	 * @param {number[]} arg0_array - The first array to pass to operate on.
	 * @param {number[]} arg1_array - The second array to pass to operate with.
	 * @param {string} arg2_equation - The string literal to use as an equation.<br>- 'i' represents the corresponding element of the first array,<br>- 'x' represents the corresponding element of the second array.
	 * @param {Object} [arg3_options]
	 *  @param {boolean} [arg3_options.recursive=true]
	 * 
	 * @returns {number[]} - The 1st array.
	 */
	Array.operateArrays = function (arg0_array, arg1_array, arg2_equation, arg3_options) {
		//Convert from parameters
		let array = Array.toArray(arg0_array);
		let ot_array = Array.toArray(arg1_array);
		let equation = arg2_equation;
		let options = (arg3_options) ? arg3_options : {};
		
		//Initialise options
		if (options.recursive === undefined) options.recursive = true;
		
		//Guard clause if both arrays are empty
		if (array.length + ot_array.length === 0) return [];
		
		//Declare local instance variables
		let equation_expression = `return ${equation};`;
		let equation_function = new Function("i", "x", equation_expression);
		
		//Return statement
		return array.map((element_one, index) => {
			let element_two = ot_array[index] || 0; //Consider missing elements as being zero
			
			if (Array.isArray(element_one)) {
				//Recursively call operateArrays() on subarrays
				if (options.recursive !== false)
					return Array.operate(element_one, element_two, equation, options);
			} else {
				return equation_function(element_one, element_two);
			}
		});
	};
	
	/**
	 * Performs QR decomposition on a matrix.
	 * @alias Array.QRDecompositionMatrix
	 * 
	 * @param {Array.<number[]>} arg0_matrix
	 * 
	 * @returns {{Q: Array.<number[]>, R: Array.<number[]>}}
	 */
	Array.QRDecompositionMatrix = function (arg0_matrix) {
		//Convert from parameters
		let matrix = arg0_matrix;
		
		//Declare local instance variables
		let m = matrix.length;
		let n = matrix[0].length;
		let Q = [];
		let R = [];
		
		//Initialise Q as a copy of the original matrix
		for (let i = 0; i < m; i++)
			Q.push(matrix[i].slice());
		for (let i = 0; i < n; i++)
			R.push(new Array(n).fill(0));
		
		//Perform Gram-Schmidt orthogonalisation
		for (let i = 0; i < n; i++) {
			//Compute the ith column of R
			for (let x = 0; x <= i; x++) {
				let local_sum = 0;
				
				for (let y = 0; y < m; y++)
					local_sum += Q[y][i]*Q[y][x];
				R[x][i] = local_sum;
			}
			
			//Subtract the projections of previous basis vectors from the ith column of Q
			for (let x = 0; x < m; x++)
				for (let y = 0; y <= i; y++)
					Q[x][i] -= R[y][i]*Q[x][y];
			
			// Normalize the ith column of Q
			let norm = 0;
			for (let x = 0; x < m; x++)
				norm += Q[x][i]*Q[x][i];
			norm = Math.sqrt(norm);
			
			for (let x = 0; x < m; x++)
				Q[x][i] /= norm;
		}
		
		//Return statement
		return { Q, R };
	};
	
	/**
	 * Performs QR least squared on two matrices.
	 * @alias Array.QRLeastSquaredMatrix
	 * 
	 * @param {Array.<number[]>} arg0_matrix
	 * @param {Array.<number[]>} arg1_matrix
	 * 
	 * @returns {number[]}
	 */
	Array.QRLeastSquaredMatrix = function (arg0_matrix, arg1_matrix) {
		//Convert from parameters
		let A = arg0_matrix;
		let b = arg1_matrix;
		
		//Declare local instance variables
		let { Q, R } = Array.QRDecompositionMatrix(A); //Perform QR Decomposition
		let Qt_b = []; //Calculate Q_transpose*b
		
		//Iterate over Q
		for (let i = 0; i < Q[0].length; i++) {
			let local_sum = 0;
			
			for (let x = 0; x < b.length; x++)
				local_sum += Q[x][i]*b[x];
			Qt_b.push(local_sum);
		}
		
		//Back-substitution to solve Rx = Q_transpose*b
		let n = R.length;
		let x_vector = new Array(n).fill(0);
		
		for (let i = n - 1; i >= 0; i--) {
			let local_sum = 0;
			
			for (let x = i + 1; x < n; x++)
				local_sum += R[i][x]*x_vector[x];
			x_vector[i] = (Qt_b[i] - local_sum)/R[i][i];
		}
		
		//Return statement
		return x_vector;
	};
	
	/**
	 * Roots an array recursively.
	 * @alias Array.root
	 * 
	 * @param {number[]} arg0_array
	 * @param {number} arg1_number
	 * @param {Object} [arg2_options]
	 *  @param {boolean} [arg2_options.recursive=true]
	 *  
	 * @returns {number[]}
	 */
	Array.root = function (arg0_array, arg1_number, arg2_options) {
		//Convert from parameters
		let array = Array.toArray(arg0_array);
		let number = arg1_number;
		let options = (arg2_options) ? arg2_options : {};
		
		//Return statement
		return Array.operate(array, `root(n, ${number})`, options);
	};
	
	/**
	 * Roots two arrays recursively.
	 * @alias Array.rootArrays
	 * 
	 * @param {number[]} arg0_array - The 1st array to pass to the function.
	 * @param {number[]} arg1_array - The 2nd array to pass to the function.
	 * @param {Object} [arg2_options]
	 *  @param {boolean} [arg2_options.recursive=true]
	 *  
	 * @returns {number[]}
	 */
	Array.rootArrays = function (arg0_array, arg1_array, arg2_options) {
		//Convert from parameters
		let array = Array.toArray(arg0_array);
		let ot_array = Array.toArray(arg1_array);
		let options = (arg2_options) ? arg2_options : {};
		
		//Return statement
		return Array.operate(array, ot_array, `root(i, x)`, options);
	};
	
	/**
	 * Performs successive over-relaxation (SOR) for a given matrix and target b_vectors.
	 * @alias Array.SORMatrix
	 * 
	 * @param {Array.<number[]>} arg0_matrix
	 * @param {Array.<number[]>} arg1_b_vectors
	 * @param {number} [arg2_omega=1]
	 * @param {Object} [arg3_options]
	 *  @param {number} [arg3_options.max_iterations=1000]
	 *  @param {number} [arg3_options.tolerance=1e-10]
	 * 
	 * @returns {number[]}
	 */
	Array.SORMatrix = function (arg0_matrix, arg1_b_vectors, arg2_omega, arg3_options) {
		//Convert from parameters
		let matrix = arg0_matrix;
		let b_vector = arg1_b_vectors;
		let omega = Math.returnSafeNumber(arg2_omega, 1);
		let options = (arg3_options) ? arg3_options : {};
		
		//Initialise options
		options.max_iterations = Math.returnSafeNumber(options.max_iterations, 1000);
		options.tolerance = Math.returnSafeNumber(options.tolerance, 1e-10);
		
		//Declare local instance variables
		let n = matrix.length;
		let x = new Array(n).fill(0); // Initial guess (usually zeros)
		
		//Iterate over all options.max_iterations
		for (let iter = 0; iter < options.max_iterations; iter++) {
			let oldX = [...x];
			
			for (let i = 0; i < n; i++) {
				let sigma = 0;
				for (let j = 0; j < n; j++) {
					if (j !== i) {
						sigma += matrix[i][j] * x[j];
					}
				}
				
				//The SOR Formula:
				//x_new = (1 - omega) * x_old + (omega / a_ii) * (b_i - sigma)
				x[i] = (1 - omega) * x[i] + (omega / matrix[i][i]) * (b_vector[i] - sigma);
			}
			
			// Check for convergence (stop if the change is tiny)
			let error = 0;
			for (let i = 0; i < n; i++)
				error += Math.abs(x[i] - oldX[i]);
			if (error < options.tolerance) break;
		}
		
		//Return statement
		return x;
	};
	
	/**
	 * Subtracts from an array recursively.
	 * @alias Array.subtract
	 * 
	 * @param {number[]} arg0_array
	 * @param {number} arg1_number
	 * @param {Object} [arg2_options]
	 *  @param {boolean} [arg2_options.recursive=true]
	 * 
	 * @returns {number[]}
	 */
	Array.subtract = function (arg0_array, arg1_number, arg2_options) {
		//Convert from parameters
		let array = Array.toArray(arg0_array);
		let number = arg1_number;
		let options = (arg2_options) ? arg2_options : {};
		
		//Return statement
		return Array.operate(array, `n - ${number}`, options);
	};
	
	/**
	 * Subtract two arrays recursively.
	 * @alias Array.subtractArrays
	 * 
	 * @param {number[]} arg0_array
	 * @param {number[]} arg1_array
	 * @param {Object} [arg2_options]
	 *  @param {boolean} [arg2_options.recursive=true]
	 *  
	 * @returns {number[]}
	 */
	Array.subtractArrays = function (arg0_array, arg1_array, arg2_options) {
		//Convert from parameters
		let array = Array.toArray(arg0_array);
		let ot_array = Array.toArray(arg1_array);
		let options = (arg2_options) ? arg2_options : {};
		
		//Return statement
		return Array.operate(array, ot_array, `i - x`, options);
	};
	
	/**
	 * Subtracts one matrix from another.
	 * @alias Array.subtractMatrices
	 * 
	 * @param {Array.<number[]>} arg0_matrix - The 1st base matrix to subtract from.
	 * @param {Array.<number[]>} arg1_matrix - The 2nd matrix to subtract with.
	 * 
	 * @returns {Array.<number[]>}
	 */
	Array.subtractMatrices = function (arg0_matrix, arg1_matrix) {
		//Convert from parameters
		let matrix = arg0_matrix;
		let ot_matrix = arg1_matrix;
		
		//Declare local instance variables
		let return_matrix = [];
		
		//Iterate over initial matrix to subtract second one from it
		for (let i = 0; i < matrix.length; i++) {
			return_matrix.push([]);
			
			for (let x = 0; x < matrix[0].length; x++)
				return_matrix[i][x] = matrix[i][x] - ot_matrix[i][x];
		}
		
		//Return statement
		return return_matrix;
	};
	
	/**
	 * Transposes a matrix.
	 * @alias Array.transposeMatrix
	 * 
	 * @param {Array.<number[]>} arg0_matrix
	 * 
	 * @returns {Array.<number[]>}
	 */
	Array.transposeMatrix = function (arg0_matrix) {
		//Convert from parameters
		let matrix = arg0_matrix;
		
		//Declare local instance variables
		let columns = matrix[0].length;
		let rows = matrix.length;
		
		//Create a new matrix with switched rows and columns
		let transposed_matrix = [];
		
		for (let i = 0; i < columns; i++) {
			let new_row = [];
			
			for (let x = 0; x < rows; x++)
				new_row.push(matrix[i][x]);
			
			//Push new_row to transposed_matrix
			transposed_matrix.push(new_row);
		}
		
		//Return statement
		return transposed_matrix;
	};
	
	//KEEP AT BOTTOM! Initialise function aliases
	{
		/**
		 * @type function
		 */
		Array.invertMatrix = Array.inverseMatrix;
		/**
		 * @type function
		 */
		Array.solveMatrices = Array.multiplyMatrices;
	}
}