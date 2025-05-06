//Entity localisation functions
{
  function getHistoryFrameLocalisation (arg0_entity_id, arg1_history_frame, arg2_history_frame) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var old_history_frame = (arg1_history_frame) ? arg1_history_frame : { coords: [], options: {} };
    var new_history_frame = (arg2_history_frame) ? arg2_history_frame : { coords: [], options: {} };

    //Declare local instance variables
    var current_date = convertTimestampToDate(new_history_frame.id);
    var entity_obj = (typeof entity_id != "object") ? getEntity(entity_id) : entity_id;
    var founding_frame = false;
    var old_land_area = getPolityArea(entity_id, old_history_frame.id);
    var old_options = old_history_frame.options;
    var new_land_area = getPolityArea(entity_id, new_history_frame.id);
    var new_options = new_history_frame.options;

    var entity_name = getEntityName(entity_obj, new_history_frame.id);
    var land_percentage_change = (Math.round((1 - (old_land_area/new_land_area))*100*100)/100/100);

    //Format history_string
    var history_string = [];

    //Founded handler - KEEP AT TOP!
    if (new_history_frame.is_founding) {
      history_string.push(`${entity_name} was founded.`);
      founding_frame = true;
    }

    //Colour/customisation handler
    {
      //Cosmetic changes
      if (new_options.entity_name != undefined)
        if (new_options.entity_name != old_options.entity_name)
          history_string.push(`Name changed from ${getEntityName(entity_obj, old_history_frame.id)} to ${new_options.entity_name}.`);
      if (new_options.fillColor != undefined)
        if (new_options.fillColor != old_options.fillColor)
          history_string.push(`Fill colour changed to <span class = "bio-box" style = "color: ${new_options.fillColor};">&#8718;</span>.`);
      if (new_options.color != undefined)
        if (new_options.color != old_options.color)
          history_string.push(`Stroke colour changed to <span class = "bio-box" style = "color: ${new_options.color};">&#8718;</span>.`);
      if (new_options.opacity != undefined)
        if (new_options.opacity != old_options.opacity)
          history_string.push(` Stroke opacity changed to ${printPercentage(new_options.opacity)}.`);

      //Variables
      if (new_options.variables) {
        var all_variables = Object.keys(new_options.variables);

        //Iterate over all_variables
        for (var i = 0; i < all_variables.length; i++) {
          var local_variable = all_variables[i];
          var local_value = new_options.variables[local_variable];

          history_string.push(`- ${local_variable} set to ${local_value}.`);
        }
      }

      //Zoom levels
      if (new_options.maximum_zoom_level != undefined)
        if (new_options.maximum_zoom_level != old_options.maximum_zoom_level)
        history_string.push(`Maximum zoom set to ${new_options.maximum_zoom_level}.`);
      if (new_options.minimum_zoom_level != old_options.minimum_zoom_level)
        history_string.push(`Minimum zoom set to ${new_options.minimum_zoom_level}.`);
    }

    //Extinct/hide polity handler
    {
      if (new_options.extinct != undefined)
        if (new_options.extinct != old_options.extinct)
          (new_options.extinct) ?
            history_string.push(`${entity_name} is abolished.`) :
            history_string.push(`${entity_name} is re-established.`);
    }

    //Land area handler
    if (!founding_frame)
      if (isFinite(land_percentage_change)) {
        if (land_percentage_change < 0)
          history_string.push(`${entity_name} lost ${printPercentage(Math.abs(land_percentage_change), { display_float: true })} of her land.`);
        if (land_percentage_change > 0)
          history_string.push(`${entity_name} gained ${printPercentage(Math.abs(land_percentage_change), { display_float: true })} more land.`);
      }

    //Blank handler
    if (history_string.length == 0)
      history_string.push(`No detectable changes were made.`);

    //Return statement
    return (history_string.length > 0) ? `<tr timestamp = ${new_history_frame.id}>
      <td>${printDate(current_date)}</td>
      <td><span>${history_string.join(`<br>`)}</span></td>
    </tr>` : "";
  }
}
