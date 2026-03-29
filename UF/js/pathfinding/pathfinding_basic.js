//Initialise functions
{
	if (!global.Pathfinding)
		/**
		 * The namespace for all UF/Pathfinding utility functions, typically for static methods.
		 * 
		 * @namespace Pathfinding
		 */
		global.Pathfinding = {};
	
	/**
	 * Performs the A* algorithm between a starting point and destination within an object graph.
	 * @alias Pathfinding.aStar
	 * 
	 * @param {Object} arg0_graph
	 * @param {string} arg1_start_key
	 * @param {string} arg2_end_key
	 * 
	 * @returns {string[]}
	 */
	Pathfinding.aStar = function (arg0_graph, arg1_start_key, arg2_end_key) {
		//Convert from parameters
		let graph = arg0_graph;
		let start = arg1_start_key;
		let goal = arg2_end_key;
		
		//Declare local instance variables
		let came_from = {};
		let f_score = {};
		let g_score = {};
		let open_set = [start];
		let path = [];
		
		let _placeholder_heuristic_cost = 0;
		
		//Initialise f_score, g_score
		g_score[start] = 0;
		f_score[start] = _placeholder_heuristic_cost; //[WIP] - Replace with Pathfinding.aStarHeuristicCost later
		
		//Recursive traversal
		while (open_set.length > 0) {
			let current = Pathfinding.getLowestFScoreNode(open_set, f_score);
			
			if (current === goal) {
				path = Pathfinding.reconstructPath(came_from, current);
				break;
			}
			
			//Check sub-nodes
			open_set = open_set.filter((node) => node !== current);
			
			let neighbours = graph[current];
			
			//Consider neighbours looking forwards
			for (let neighbour in neighbours) {
				let tentative_g_score = g_score[current] + neighbours[neighbour];
				
				if (!g_score.hasOwnProperty(neighbour) || tentative_g_score < g_score[neighbour]) {
					came_from[neighbour] = current;
					g_score[neighbour] = tentative_g_score;
					f_score[neighbour] = g_score[neighbour] + _placeholder_heuristic_cost;
					
					if (!open_set.includes(neighbour))
						open_set.push(neighbour);
				}
			}
			
			//Consider neighbours in the reverse direction for bidirectional connections
			let reverse_neighbours = Pathfinding.getReverseNeighbours(graph, current);
			
			for (let reverse_neighbour in reverse_neighbours) {
				let tentative_g_score_reverse = g_score[current] + reverse_neighbours[reverse_neighbour];
				
				if (!g_score.hasOwnProperty(reverse_neighbour) || tentative_g_score_reverse < g_score[reverse_neighbour]) {
					came_from[reverse_neighbour] = current;
					g_score[reverse_neighbour] = g_score[reverse_neighbour] + _placeholder_heuristic_cost;
					
					if (!open_set.includes(reverse_neighbour))
						open_set.push(reverse_neighbour);
				}
			}
		}
		
		//Return statement
		return path;
	};
	
	/**
	 * Fetches the node with the lowest F-score.
	 * @alias Pathfinding.getLowestFScoreNode
	 *
	 * @param {string[]} arg0_nodes
	 * @param {number} arg1_f_score
	 * 
	 * @returns {string}
	 */
	Pathfinding.getLowestFScoreNode = function (arg0_nodes, arg1_f_score) {
		//Convert from parameters
		let nodes = arg0_nodes;
		let f_score = arg1_f_score;
		
		//Declare local instance variables
		let lowest = nodes[0];
		
		//Iterate over all nodes
		for (let i = 1; i < nodes.length; i++)
			if (f_score[nodes[i]] < f_score[lowest])
				lowest = nodes[i];
		
		//Return statement
		return lowest;
	};
	
	/**
	 * Fetches the reverse neighbours in a path graph.
	 * @alias Pathfinding.getReverseNeighbours
	 * 
	 * @param {Object} arg0_graph
	 * @param {string} arg1_node
	 * 
	 * @returns {Object}
	 */
	Pathfinding.getReverseNeighbours = function (arg0_graph, arg1_node) {
		//Convert from parameters
		let graph = arg0_graph;
		let node = arg1_node;
		
		//Declare local instance variables
		let reverse_neighbours = {};
		
		//Iterate over graph
		for (let key in graph)
			if (graph.hasOwnProperty(key)) {
				let connections = graph[key];
				
				for (let neighbour in connections)
					if (neighbour === node)
						reverse_neighbours[key] = connections[neighbour];
			}
		
		//Return statement
		return reverse_neighbours;
	};
	
	/**
	 * Internal helper function for reconstructing a path.
	 * @alias Pathfinding.reconstructPath
	 * 
	 * @param {Object} arg0_came_from - The starting node.
	 * @param {Object} arg1_current - The ending node.
	 * 
	 * @returns {Object[]}
	 */
	Pathfinding.reconstructPath = function (arg0_came_from, arg1_current) {
		//Convert from parameters
		let came_from = arg0_came_from;
		let current = arg1_current;
		
		//Declare local instance variables
		let total_path = [current];
		
		//While loop to reconstruct path
		while (came_from.hasOwnProperty(current)) {
			current = came_from[current];
			total_path.unshift(current);
		}
		
		//Return statement
		return total_path;
	};
}