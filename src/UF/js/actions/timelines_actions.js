//Action Timelines - Used for undo/redo trees.
//Initialise functions
{
  /*
    createTimeline() - Creates a new timeline from a parent (or an unassociated one if no parent is defined). The parent may be cloned into the new timeline if necessary.
    arg0_parent_timeline: (String) - Optional. The ID of the parent timeline to split off from. global.actions.initial_timeline by default
    arg1_options: (Object)
      timeline_index: (Number) - Optional. The index off of which the timeline should split. The last index of the timeline by default
      return_key: (Boolean) - Optional. Whether to return the timeline key. False by default.

    Returns: (Object, Timeline)/(String)
  */
  function createTimeline (arg0_parent_timeline, arg1_options) {
    //Convert from parameters
    var parent_timeline_id = (arg0_parent_timeline) ? arg0_parent_timeline : global.actions.initial_timeline;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var new_timeline_id = generateRandomID(global.timelines);
    var parent_timeline_array = global.timelines[parent_timeline_id];

    //Create a new timeline with a base action
    global.timelines[new_timeline_id] = [];

    var new_timeline = global.timelines[new_timeline_id];
    var root_action = {};

    root_action.id = new_timeline_id;
    root_action.parent_timeline_id = parent_timeline_id;
    root_action.parent_timeline_index = (options.timeline_index) ?
      options.timeline_index : Math.max(parent_timeline_array.length - 1, 0);

    //Push root_action to timeline
    new_timeline.push(root_action);

    //Return statement
    return (!options.return_key) ? global.timelines[new_timeline_id] : options.return_key;
  }

  /*
    constructTimelineGraph() - Returns an A* compatible graph of global.timelines.

    Returns: (Object)
      <Timeline ID-index>: (Object)
        <Timeline ID-index>: (Number) - Represents the connection cost between the current Timeline Position and another Timeline Position.
  */
  function constructTimelineGraph () {
    //Declare local instance variables
    var all_timelines = Object.keys(global.timelines);
    var timeline_graph = {};

    //Iterate over all timelines
    for (var i = 0; i < all_timelines.length; i++) {
      var local_timeline = global.timelines[all_timelines[i]];

      for (var x = 0; x < local_timeline.length; x++) {
        var local_connections = [];
        var local_key = `${all_timelines[i]}-${x}`;

        //parent_timeline_id-parent_timeline_index connection handler
        if (local_timeline[x].parent_timeline_id) {
          var parent_timeline_index = returnSafeNumber(local_timeline[x].parent_timeline_index);

          var parent_key = `${local_timeline[x].parent_timeline_id}-${parent_timeline_index}`;

          //Check if parent_timeline_obj is defined
          if (!timeline_graph[parent_key])
            timeline_graph[parent_key] = {};
          var parent_node = timeline_graph[parent_key];

          //Set look-forwards connection to current node
          parent_node[local_key] = 1;
        }

        //Look forwards to see if there's a connection here
        if (local_timeline[x + 1])
          local_connections.push(`${all_timelines[i]}-${x + 1}`);

        //Initialise local node
        if (!timeline_graph[local_key])
          timeline_graph[local_key] = {};
        var local_node = timeline_graph[local_key];

        //Add local_connections
        for (var y = 0; y < local_connections.length; y++)
          if (!local_node[local_connections[y]])
            local_node[local_connections[y]] = 1;
      }
    }

    //Return statement
    return timeline_graph;
  }

  /*
    deleteTimeline() - Deletes a timeline and the timelines that branch off of it.
    arg0_timeline_id: (String) - The timeline ID to delete.
  */
  function deleteTimeline (arg0_timeline_id) {
    //Convert from parameters
    var timeline_id = arg0_timeline_id;

    //Declare local instance variables
    var all_timelines = Object.keys(global.timelines);
    var timeline = global.timelines[timeline_id];

    //Delete all timelines that branch off of this one recursively
    for (var i = 0; i < all_timelines.length; i++) {
      var local_timeline = all_timelines[i];

      if (local_timeline[0])
        if (local_timeline[0].parent_timeline_id == timeline_id)
          deleteTimeline(all_timelines[i]); //Recursive deletion
    }

    //If this timeline is the current_timeline, shift current_timeline to initial_timeline
    if (timeline_id == global.actions.current_timeline)
      global.actions.current_timeline = global.actions.initial_timeline;

    //Delete timeline
    delete global.timelines[timeline_id];

    //If this timeline is the initial timeline, delete global.actions.current_timeline; initialise undo/redo again
    if (timeline_id == global.actions.initial_timeline) {
      delete global.actions.current_timeline;
      delete global.actions.initial_timeline;

      initialiseUndoRedo();
    }
  }

  /*
    generateTimelineGraph() - Returns a graph of all timelines starting from initial_timeline[0].
    arg0_timeline_id: (String) - The ID of the timeline to start generating a graph from.
    arg1_options: (Object)
      x_offset: (Number) - Optional. The current x offset. 0 by default.
      y_offset: (Number) - Optional. The current y offset. 0 by default.

      excluded_timelines: (Array<String>) - Optional. Optimisation parameter.
      is_recursive: (Boolean) - Optional. Whether this is a recursive call. Optimisation parameter.

    Returns: (Object) - A timeline graph object to render.
  */
  function generateTimelineGraph (arg0_timeline_id, arg1_options) {
    //Convert from parameters
    var timeline_id = (arg0_timeline_id) ? arg0_timeline_id : global.actions.initial_timeline;
    var options = (arg1_options) ? arg1_options : {};

    //Initialise options
    if (!options.excluded_timelines) options.excluded_timelines = [];

    //Guard clause for excluded_timelines
    if (options.recursive && !arg0_timeline_id) return {};
    if (options.excluded_timelines.includes(timeline_id)) return {};

    //Declare local instance variables
    var all_timelines = Object.keys(global.timelines);
    var current_y_offset = returnSafeNumber(options.y_offset);
    var timeline_array = global.timelines[timeline_id];
    var timeline_coordinates = {};
    var timeline_graph = {}; //Object list of UI elements: { x: (Number), y: (Number), name: (String), connections: (Array<Array<x, y>>) };
    var x_offset = returnSafeNumber(options.x_offset);
    var y_offset = returnSafeNumber(options.y_offset);

    //Create list of .child_timelines first
    if (timeline_id == global.actions.initial_timeline) {
      for (var i = 0; i < all_timelines.length; i++) {
        var local_child_timelines = [];
        var local_timeline = global.timelines[all_timelines[i]];

        for (var x = 0; x < all_timelines.length; x++) {
          var local_second_timeline = global.timelines[all_timelines[x]];

          if (local_second_timeline[0])
            if (local_second_timeline[0].parent_timeline_id == all_timelines[i]) {
              var local_parent_timeline_id = local_second_timeline[0].parent_timeline_id;

              var local_parent_timeline = global.timelines[local_parent_timeline_id];

              if (!local_child_timelines.includes(all_timelines[x]) && all_timelines[x] != all_timelines[i])
                local_child_timelines.push(all_timelines[x]);
            }
        }

        if (!local_timeline[0] && local_child_timelines.length > 0)
          local_timeline.push({});
        if (local_child_timelines.length > 0)
          local_timeline[0].child_timelines = local_child_timelines;
      }
    }

    //Produce graph at this layer only for the current timeline and immediate all_timelines connected to it, then call recursively
    if (timeline_array[0])
      if (timeline_array[0].child_timelines) {
        for (var i = 0; i < timeline_array[0].child_timelines.length; i++) {
          var local_child_timeline = global.timelines[timeline_array[0].child_timelines[i]];
          var local_child_timeline_id = timeline_array[0].child_timelines[i];

          var child_timeline_width = getTimelineWidth(local_child_timeline_id);

          //Calculate x_offset; y_offset
          var local_x_offset = returnSafeNumber(local_child_timeline[0].parent_timeline_index);
          var local_y_offset = child_timeline_width;

          //Iterate recursively - This causes a max. stack call size error for some reason
          var new_timeline_graph = generateTimelineGraph(local_child_timeline_id, {
            width: child_timeline_width,
            x_offset: local_x_offset,
            y_offset: i,

            x_original: x_offset,
            y_original: y_offset,

            is_recursive: true
          });

          var all_new_timeline_keys = Object.keys(new_timeline_graph);

          for (var x = 0; x < all_new_timeline_keys.length; x++)
            timeline_graph[all_new_timeline_keys[x]] = new_timeline_graph[all_new_timeline_keys[x]];
        }
      }

    //Parse connections
    var last_id = "";

    //Iterate over current timeline_array; parse connection_ids
    for (var i = 0; i < timeline_array.length; i++) {
      var local_connection_ids = [];
      var local_id = generateRandomID(timeline_graph);

      timeline_graph[local_id] = {};

      //.x_original/.y_original handler
      if (options.x_original != undefined && options.y_original != undefined)
        local_connection_ids.push([last_id]);

      //Connections handler
      if (local_connection_ids.length > 0)
        timeline_graph[local_id].connection_ids = local_connection_ids;

      //Add .data field
      timeline_graph[local_id].data = timeline_array[i];
      timeline_graph[local_id].timeline_id = timeline_id;
      timeline_graph[local_id].timeline_index = i;
      timeline_graph[local_id].x = i;
      timeline_graph[local_id].y = current_y_offset;

      //Set last_id
      last_id = local_id;
    }

    //Add x_offset; y_offset to timeline graph and to connections
    var all_elements = Object.keys(timeline_graph);

    //Iterate over all_elements to adjust x_offset; y_offset
    for (var i = 0; i < all_elements.length; i++) {
      var local_element = timeline_graph[all_elements[i]];

      local_element.x += x_offset;
      local_element.y++;

      if (local_element.connections)
        for (var x = 0; x < local_element.connections.length; x++) {
          local_element.connections[x][0] += x_offset;
          local_element.connections[x][1]++;
        }
    }

    //Return statement
    return timeline_graph;
  }

  /*
    getFlippedTimeline() - Flips a timeline's .x, .y coordinates.
    arg0_graph: (Object) - The graph of the timeline to pass to the function.

    Returns: (Object)
  */
  function getFlippedTimeline (arg0_graph) {
    //Convert from parameters
    var graph = arg0_graph;

    //Declare local instance variables
    var all_graph_keys = Object.keys(graph);

    //Iterate over all_graph_keys
    for (var i = 0; i < all_graph_keys.length; i++) {
      var local_graph_entry = graph[all_graph_keys[i]];

      //Check to make sure local_graph_entry coordinates exist
      if (local_graph_entry.x != undefined && local_graph_entry.y != undefined) {
        var old_x = JSON.parse(JSON.stringify(local_graph_entry.x));
        var old_y = JSON.parse(JSON.stringify(local_graph_entry.y));

        //Flip coordinates
        local_graph_entry.x = old_y;
        local_graph_entry.y = old_x;
      }
    }

    //Return statement
    return graph;
  }

  /*
    getCurrentAction() - Fetches the last action loaded in the current timeline.

    Returns: (Object)
  */
  function getCurrentAction () {
    //Declare local instance variables
    var current_timeline = global.timelines[global.actions.current_timeline];

    var current_action = current_timeline[global.actions.current_index];

    //Return statement
    if (current_action)
      return current_action;
  }

  function getPreviousAction () {
    //Declare local instance variables
    var current_action = global.timelines[global.actions.current_timeline][global.actions.current_index];

    try {
      if (current_action.parent_timeline_id && global.actions.current_index == 0) {
        //Return statement
        return global.timelines[current_action.parent_timeline_id][current_action.parent_timeline_index];
      } else {
        //Return statement
        return global.timelines[global.actions.current_timeline][global.actions.current_index - 1];
      }
    } catch {}

    //Return statement
    return current_action;
  }

  /*
    getTimelineMaxX() - Fetches the maximum .x value in a timeline graph.
    arg0_graph: (Object) - The timeline graph to insert.

    Returns: (Number)
  */
  function getTimelineMaxX (arg0_graph) {
    //Convert from parameters
    var graph = arg0_graph;

    //Declare local instance variables
    var all_graph_keys = Object.keys(graph);
    var max_x = 0;

    //Iterate over all_graph_keys
    for (var i = 0; i < all_graph_keys.length; i++) {
      var local_graph_entry = graph[all_graph_keys[i]];

      if (local_graph_entry.x > max_x)
        max_x = local_graph_entry.x;
    }

    //Return statement
    return max_x;
  }

  /*
    getTimelineMaxY() - Fetches the maximum .y value in a timeline graph.
    arg0_graph: (Object) - The timeline graph to insert.

    Returns: (Number)
  */
  function getTimelineMaxY (arg0_graph) {
    //Convert from parameters
    var graph = arg0_graph;

    //Declare local instance variables
    var all_graph_keys = Object.keys(graph);
    var max_y = 0;

    //Iterate over all_graph_keys
    for (var i = 0; i < all_graph_keys.length; i++) {
      var local_graph_entry = graph[all_graph_keys[i]];

      if (local_graph_entry.y > max_y)
        max_y = local_graph_entry.y;
    }

    //Return statement
    return max_y;
  }

  /*
    getTimelineWidth() - Fetches the total X/Y width of a timeline from all future descendant timelines.
    arg0_timeline_id: (String) - The ID of the timeline to measure the descendant width of

    Returns: (Number)
  */
  function getTimelineWidth (arg0_timeline_id) {
    //Convert from parameters
    var timeline_id = arg0_timeline_id;

    //Declare local instance variables
    var all_timelines = Object.keys(global.timelines);
    var timeline_array = global.timelines[timeline_id];
    var timeline_width = 0;

    //Check if array has .child_timelines
    if (timeline_array) {
      if (!timeline_array[0])
        timeline_array.push({});
      if (timeline_array[0])
        if (timeline_array[0].child_timelines)
          for (var i = 0; i < timeline_array[0].child_timelines.length; i++) {
            var local_child_timeline_id = timeline_array[0].child_timelines[i];

            timeline_width += timeline_array[0].child_timelines.length;
            timeline_width += getTimelineWidth(local_child_timeline_id);
          }
    }

    //Return statement
    return timeline_width;
  }

  /*
    loadTimeline() - Loads in the current timeline, undoing/redoing all actions needed to get there.
    arg0_timeline_id: (String) - The ID of the timeline to load into the current state
    arg1_options: (Object)
      timeline_index: (Number) - Optional. The index off of which the timeline should split. The last index of the timeline by default
  */
  function loadTimeline (arg0_timeline_id, arg1_options) {
    //Convert from parameters
    var timeline_id = arg0_timeline_id;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var current_index = returnSafeNumber(global.actions.current_index);
    var timeline_graph = constructTimelineGraph();

    //A* traversal from current_timeline-current_index to destination timeline_id-options.timeline_index
    var end_key = `${timeline_id}-${returnSafeNumber(options.timeline_index)}`;
    var start_key = `${global.actions.current_timeline}-${current_index}`;

    var path = aStar(timeline_graph, start_key, end_key);

    //Iterate over path and perform delta toggles
    for (var i = 0; i < path.length; i++) {
      var split_key = path[i].split("-");

      var local_element = global.timelines[split_key[0]][parseInt(split_key[1])];

      if (local_element.delta_toggle) {
        //Perform current delta action, then set toggle
        if (local_element.delta_toggle == "undo") {
          global[local_element.undo_function].apply(null, local_element.undo_function_parameters);
          local_element.delta_toggle = "redo";
        } else {
          global[local_element.redo_function].apply(null, local_element.redo_function_parameters);
          local_element.delta_toggle = "undo";
        }
      } else {
        if (local_element.parent_timeline_id) {
          global.actions.current_timeline = local_element.parent_timeline_id;
          global.actions.current_index = (local_element.parent_timeline_index) ?
            local_element.parent_timeline_index : global.timelines[global.actions.current_timeline].length - 1;
        }
      }
    }

    //Set global.actions.current_timeline, global.actions.current_index
    global.actions.current_timeline = timeline_id;
    global.actions.current_index = returnSafeNumber(options.timeline_index);
  }

  /*
    jumpToTimeline() - Jumps to a specific timeline.
    arg0_timeline_id: (String) - The timeline ID to jump to
  */
  function jumpToTimeline (arg0_timeline_id, arg1_options) {
    //Convert from parameters
    var timeline_id = arg0_timeline_id;
    var options = (arg1_options) ? arg1_options : {};

    //Invoke loadTimeline()
    loadTimeline(timeline_id, { timeline_index: returnSafeNumber(options.timeline_index, 1) });
  }

  /*
    performAction() - Logs a delta action in the current timeline.
    arg0_options: (Object)
      action_id: (String) - The ID of the action currently being performed.
      redo_function: (String) - The corresponding redo function.
      redo_function_parameters: (Array<Variable, ...>) - The current arguments passed to perform the delta action.
      undo_function: (String) - The corresponding undo function.
      undo_function_parameters: (Array<Variable, ...>) - The arguments needed to undo the delta action.
  */
  function performAction (arg0_options) {
    //Convert from parameters
    var options = (arg0_options) ? arg0_options : {};

    //Declare local instance variables
    var current_timeline = global.timelines[global.actions.current_timeline];
    var current_index = returnSafeNumber(global.actions.current_index);
    var local_action = global.actions[options.action_id];
    var new_action = {
      id: options.action_id,
      name: (local_action.name) ? local_action.name : options.action_id,

      delta_toggle: "undo",

      redo_function: options.redo_function,
      redo_function_parameters: options.redo_function_parameters,
      undo_function: options.undo_function,
      undo_function_parameters: options.undo_function_parameters
    };

    //Check if action was grouped
    var action_grouped = (!options.do_not_group) ?
      groupActions(new_action) : undefined;

    if (!action_grouped)
      //If the current_index is not the same as the length of the current timeline - 1, split off a new timeline; and set current_timeline to that.
      if (!global.no_undo_redo_trees) {
        if (current_index != current_timeline.length - 1) {
          var new_timeline = createTimeline(global.actions.current_timeline);

          //Push new action
          new_timeline.push(new_action);

          //Set current_timeline; current_index to new_timeline
          new_timeline[0].parent_timeline_index = JSON.parse(JSON.stringify(global.actions.current_index));
          global.actions.current_timeline = new_timeline[0].id;
          global.actions.current_index = 1;
        } else {
          current_timeline.push(new_action);

          //Set current_index
          global.actions.current_index = current_timeline.length - 1;
        }
      } else {
        //Splice element into current_timeline
        current_timeline.push(new_action);

        //Set current_index
        global.actions.current_index++;
        global.actions.current_index = Math.min(global.actions.current_index, current_timeline.length - 1);
      }
  }

  /*
    redoAction() - Redos an action in the current timeline.

    Returns: (Boolean) - Whether the action was successfully redone.
  */
  function redoAction () {
    //Declare local instance variables
    var current_timeline = global.timelines[global.actions.current_timeline];
    var local_element = current_timeline[global.actions.current_index + 1];

    //Ensure there's an action to redo
    if (global.actions.current_index < current_timeline.length - 1) {
      global.actions.current_index++;
      if (global.actions.current_index >= current_timeline.length - 1)
        global.actions.current_index = current_timeline.length - 1;

      //Execute redo function
      if (global[local_element.redo_function]) {
        global[local_element.redo_function].apply(null, local_element.redo_function_parameters);
        local_element.delta_toggle = "undo";
      }

      //Return statement
      return true;
    } else {
      local_element = current_timeline[global.actions.current_index];

      if (local_element.child_timelines) {
        global.actions.current_timeline = local_element.child_timelines[0];
        global.actions.current_index = 0;
      }
    }

    return false;
  }

  /*
    undoAction() - Undos an action in the current timeline.

    Returns: (Boolean) - Whether the action was successfully undone.
  */
  function undoAction (arg0_options) { //[WIP] - Why is this so janky?
    //Convert from parameters
    var options = (arg0_options) ? arg0_options : {};

    //Declare local instance variables
    var current_timeline = global.timelines[global.actions.current_timeline];

    //Ensure there's an action to undo
    if (global.actions.current_index > 0) {
      //Make sure delta_toggles are up to date
      if (global.actions.current_index == current_timeline.length - 1)
        current_timeline[current_timeline.length - 1].delta_toggle = "redo";

      //Update global index
      global.actions.current_index--; //This doesn't work all the time but is still needed to be able to undo the latest action
      var local_element = current_timeline[global.actions.current_index];
      //global.actions.current_index--; //This is incorrect, but suddenly correct when masks are involved? Yet all masks are placed in the same data structure as all other delta actions

      //Execute undo function
      if (global[local_element.undo_function]) {
        global[local_element.undo_function].apply(null, local_element.undo_function_parameters);
        local_element.delta_toggle = "redo";
      }

      //Return statement
      return true;
    } else {
      var local_element = current_timeline[global.actions.current_index];

      if (local_element.parent_timeline_id) {
        global.actions.current_timeline = local_element.parent_timeline_id;
        global.actions.current_index = (local_element.parent_timeline_index) ?
          local_element.parent_timeline_index : global.timelines[global.actions.current_timeline].length - 1;
      }
    }

    return false;
  }
}
