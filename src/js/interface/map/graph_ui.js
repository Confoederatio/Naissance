/*
  Graph data structure:
  [{
    date: { year: 1501 },
    value: 0.68
  }]
  options: {
    type: "percentage"/"number" - The type of graph to render labels for
  }
*/
//Statistics visualiser functions
{
  function createTimelineGraph (arg0_element, arg1_start_date, arg2_end_date, arg3_data, arg4_options) { //[WIP] - Finish function
    //Convert from parameters
    var element = arg0_element;
    var start_date = arg1_start_date;
    var end_date = arg2_end_date;
    var data = arg3_data;
    var options = (arg4_options) ? arg4_options : {};

    //Declare local instance variables
    var begin_date = JSON.parse(JSON.stringify(start_date));
    var canvas = element;
    var dragging = false;
    var finish_date = JSON.parse(JSON.stringify(end_date));
    var last_x = 0;
    var zoom = 1;

    //Initialise graph on current domain to start out with
    canvas.setAttribute("x", 0); //In years after start
    canvas.setAttribute("zoom", zoom);

    drawTimelineGraph(element, start_date, end_date, data, options);

    //Mouse drag handler
    canvas.onmousedown = function (e) {
      var evt = e || event;
      dragging = true;
      last_x = evt.offsetX;
    };

    canvas.onmousemove = function (e) {
      var evt = e || event;
      var x = parseInt(canvas.getAttribute("x"));
      var zoom = parseInt(canvas.getAttribute("zoom"));

      if (dragging) {
        var delta_x = evt.offsetX - last_x;
        x += delta_x;
        last_x = evt.offsetX;

        canvas.setAttribute("x", x);

        //Redraw timeline graph
        drawTimelineGraph(element, begin_date, finish_date, data, options);
      }
    };

    canvas.onmouseup = function () {
      dragging = false;
    };

    canvas.onwheel = function (e) {
      begin_date = JSON.parse(JSON.stringify(start_date));
      finish_date = JSON.parse(JSON.stringify(end_date));

      var natural_timespan = (finish_date.year - begin_date.year);
      var timespan = (natural_timespan*zoom) - natural_timespan;

      begin_date.year = begin_date.year - timespan/2;
      finish_date.year = finish_date.year + timespan/2;

      if (e.deltaY > 0 && zoom < 4)
        zoom = zoom*2;
      if (e.deltaY < 0 && zoom > 0.01)
        zoom = zoom*0.5;

      canvas.setAttribute("zoom", zoom);
      drawTimelineGraph(element, begin_date, finish_date, data, options);
    };
  }

  function drawTimelineGraph (arg0_element, arg1_start_date, arg2_end_date, arg3_data, arg4_options) { //[WIP] - Finish rest of function with labels
    //Convert from parameters
    var canvas = arg0_element;
    var start_date = arg1_start_date;
    var end_date = arg2_end_date;
    var data = arg3_data;
    var options = (arg4_options) ? arg4_options : {};

    //Initialise options
    if (!options.colour) options.colour = [255, 255, 255, 0.8];
    if (!options.type) options.type = "number";

    //Declare local instance variables; set up canvas context
    var canvas_height = canvas.getBoundingClientRect().height;
    var canvas_width = canvas.getBoundingClientRect().width;
    var ctx = canvas.getContext("2d");
    var end_timestamp = convertTimestampToInt(getTimestamp(start_date));
    var start_timestamp = convertTimestampToInt(getTimestamp(end_date));
    var stroke_width = (options.stroke_width) ? options.stroke_width : 2;
    var x_coords = [];
    var x_offset = parseInt(canvas.getAttribute("x"));

    var timespan = end_timestamp - start_timestamp;

    var x_axis_left_label = document.getElementById("entity-ui-timeline-graph-x-left-axis-label");
    var x_axis_right_label = document.getElementById("entity-ui-timeline-graph-x-right-axis-label");
    var y_axis_top_label = document.getElementById("entity-ui-timeline-graph-y-top-axis-label");
    var y_axis_bottom_label = document.getElementById("entity-ui-timeline-graph-y-bottom-axis-label");

    //Fix canvas size
    canvas.height = Math.round(canvas_height);
    canvas.width = Math.round(canvas_width);

    var year_pixels = canvas.width/(end_date.year - start_date.year);
    var year_offset = (x_offset/year_pixels)*-1;

    //Fetch min/max data values
    var maximum_value;
    var maximum_visible_value;
    var minimum_value;
    var minimum_visible_value;

    for (var i = 0; i < data.length; i++) {
      //X coords are reversed for some reason, use 1 - to correct it
      var x_percentage = 1 - ((convertTimestampToInt(getTimestamp(data[i].date)) - start_timestamp)/timespan);
      var x_coord = canvas_width*x_percentage + x_offset;

      //Calculate minmax values, and minmax visible values
      if (data[i].value > maximum_value || !maximum_value)
        maximum_value = data[i].value;
      if (data[i].value < minimum_value || !minimum_value)
        minimum_value = data[i].value;

      //Set maximum_visible_value, minimum_visible_value
      if (x_coord >= 0 && x_coord <= canvas_width) {
        var local_rear_value = (data[i - 1]) ? data[i - 1].value : data[i].value;
        var local_forwards_value = (data[i + 1]) ? data[i + 1].value : data[i].value;

        var local_maximum_value = Math.max(returnSafeNumber(local_rear_value), returnSafeNumber(local_forwards_value));
        var local_minimum_value = Math.min(returnSafeNumber(local_rear_value), returnSafeNumber(local_forwards_value));

        if (local_maximum_value > maximum_visible_value || !maximum_visible_value)
          maximum_visible_value = local_maximum_value;
        if (local_minimum_value < minimum_visible_value || !minimum_visible_value)
          minimum_visible_value = local_minimum_value;
      }

      //Push x_coord to x_coords
      x_coords.push(x_coord);
    }

    //If minimum_visible_value and maximum_visible_value are not available, fetch last data point before beginning year and next data point after ending year to check for values
    if (!minimum_visible_value || !maximum_visible_value) {
      var closest_left_entry = [undefined, {}]; //[timestamp, data];
      var closest_right_entry = [undefined, {}]; //[timestamp, data];

      for (var i = 0; i < data.length; i++) {
        var local_timestamp = convertTimestampToInt(getTimestamp(data[i].date));
        var begin_distance = local_timestamp - start_timestamp;
        var end_distance = local_timestamp - end_timestamp;

        if (begin_distance >= 0)
          if (closest_left_entry[0] < begin_distance || !closest_left_entry[0])
            closest_left_entry = [local_timestamp, data[i]];
        if (end_distance >= 0)
          if (closest_right_entry[0] < end_distance || !closest_right_entry[0])
            closest_right_entry = [local_timestamp, data[i]];

        //Set minimum_visible_value, maximum_visible_value. This is inverted for some reason
        if (!minimum_visible_value)
          minimum_visible_value = Math.max(returnSafeNumber(closest_left_entry[1].value), returnSafeNumber(closest_right_entry[1].value));
        if (!maximum_visible_value)
          maximum_visible_value = Math.min(returnSafeNumber(closest_left_entry[1].value), returnSafeNumber(closest_right_entry[1].value));
      }
    }

    var begin_x_coord, end_x_coord;

    //Begin plotting all data
    ctx.fillStyle = `rgba(${options.colour[0]}, ${options.colour[1]}, ${options.colour[2]}, ${options.colour[3]})`;

    ctx.strokeStyle = `rgb(${options.colour[0]}, ${options.colour[1]}, ${options.colour[2]})`;
    ctx.lineWidth = stroke_width;

    ctx.beginPath();

    for (var i = 0; i < data.length; i++) {
      var x_coord = x_coords[i];
      var y_coord = canvas_height - canvas_height*(data[i].value/maximum_visible_value);

      //Initialise begin_x_coord, end_x_coord
      if (i == 0) begin_x_coord = x_coord;
      if (i == data.length - 1) end_x_coord = x_coord;

      //Initialise first data point at 0, then graph all data points after that
      (i == 0) ?
        ctx.moveTo(x_coord, y_coord + stroke_width) :
        ctx.lineTo(x_coord, y_coord + stroke_width);
    }

    ctx.lineTo(end_x_coord, canvas_height - stroke_width);
    ctx.lineTo(begin_x_coord, canvas_height - stroke_width);
    ctx.stroke();

    ctx.closePath();
    ctx.fill();

    //Change X and Y-axis labels
    x_axis_left_label.innerHTML = Math.floor(start_date.year + year_offset);
    x_axis_right_label.innerHTML = Math.floor(end_date.year + year_offset);
    y_axis_top_label.innerHTML = (options.type == "percentage") ? printPercentage(maximum_visible_value) : maximum_visible_value;
    y_axis_bottom_label.innerHTML = (options.type == "percentage") ? printPercentage(0) : 0;
  }

  function populateTimelineGraph (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var common_selectors = config.defines.common.selectors;
    var entity_el = getEntityElement(entity_id);
    var local_entity = getEntity(entity_id);

    //Check to make sure history exists
    if (local_entity)
      if (local_entity.options)
        if (local_entity.options.history)
          if (Object.keys(local_entity.options.history).length > 0) {
            var entity_graph_el = entity_el.querySelector(common_selectors.entity_timeline_graph_canvas);

            //Populate land area data
            {
              var all_entity_histories = Object.keys(local_entity.options.history);
              var land_area_data = [];
              var land_area_end_date;
              var land_area_start_date;
              var maximum_land_area = 0;

              //Fetch maximum_land_area
              for (var i = 0; i < all_entity_histories.length; i++) {
                var local_history = local_entity.options.history[all_entity_histories[i]];
                var local_history_date = convertTimestampToDate(local_history.id);

                var local_area = getPolityArea(entity_id, local_history_date);

                if (local_area > maximum_land_area)
                  maximum_land_area = local_area;

                //Set land_area_start_date, land_area_end_date'
                if (i == 0) land_area_start_date = local_history_date;
                if (i == all_entity_histories.length - 1) land_area_end_date = local_history_date;
              }

              //Begin populating data
              for (var i = 0; i < all_entity_histories.length; i++) {
                var local_history = local_entity.options.history[all_entity_histories[i]];
                var local_history_date = convertTimestampToDate(local_history.id);

                var local_area = getPolityArea(entity_id, local_history_date);
                var local_area_percentage = Math.round((local_area/maximum_land_area)*1000)/1000;

                //Push element with value
                land_area_data.push({
                  date: local_history_date, value: Math.abs(local_area_percentage)
                });
              }
            }

            //Default graph is always land area
            createTimelineGraph(entity_graph_el, land_area_start_date, land_area_end_date, land_area_data, { type: "percentage" });
          }
  }
}
