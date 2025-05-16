//Initialise functions
{
  function editEntityNodes (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var brush_obj = main.brush;
    var entity_obj = getEntity(entity_id);

    disableBrush();
    entity_obj.is_editing = true;
    entity_obj.startEdit();
  }

  function isEditingEntityNodes (arg0_entity_id) {
    //Convert from parameters
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var entity_obj = getEntity(entity_id);

    //Return statement
    return (entity_obj.isEditing() || entity_obj.is_editing);
  }

  function stopEditingEntityNodes (arg0_entity_id) {
    var entity_id = arg0_entity_id;

    //Declare local instance variables
    var brush_obj = main.brush;
    var entity_obj = getEntity(entity_id);

    enableBrush();
    delete entity_obj.is_editing;
    entity_obj.endEdit();
  }
}