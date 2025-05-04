//Declare functions
{
  //groupActions() - Groups the current action with the last action if it is the same.
  function groupActions (arg0_action) {
    //Convert from parameters
    var current_action = arg0_action;

    //Declare local instance variables
    var action_grouped = false;
    var last_action = getCurrentAction();

    //Check to make sure last_action exists
    if (last_action)
      if (last_action.id == current_action.id) {
        //Guard clause if action cannot be grouped
        {
          var current_index = global.actions.current_index;
          var current_timeline = global.timelines[global.actions.current_timeline];

          if (current_index != current_timeline.length - 1) return;
        }

        var current_redo_parameters = current_action.redo_function_parameters;
        var current_undo_parameters = current_action.undo_function_parameters;
        var current_timeline = global.timelines[global.actions.current_timeline];
        var last_redo_parameters = last_action.redo_function_parameters;
        var last_undo_parameters = last_action.undo_function_parameters;

        //Action ID handler
        if (["add_to_brush"].includes(current_action.id)) {
          try {
            //1. Set brush coords
            last_action.redo_function_parameters[0] = current_redo_parameters[0];
            last_action.undo_function_parameters[0] = current_undo_parameters[0];

            //2. Mask handling (remember to only update .redo_function_parameters here
            if (current_redo_parameters.length > 1)
              for (var i = 1; i < current_redo_parameters.length; i++)
                last_action.redo_function_parameters[i] = current_redo_parameters[i];

            action_grouped = true;
          } catch (e) {
            console.log(e);
          }
        } else if (["remove_from_brush"].includes(current_action.id)) {
          try {
            last_action.redo_function_parameters = current_redo_parameters;
            last_action.undo_function_parameters = current_undo_parameters;

            action_grouped = true;
          } catch (e) {
            console.log(e);
          }
        }
      }

    //Return statement
    return action_grouped;
  }

  //initialiseUndoRedoActions() - Sets up undo/redo actions.
  function initialiseUndoRedoActions () {
    //Brush
    {
      createAction("add_to_brush", {
        name: "Add To Brush",
  
        function: "addToBrush",
        reverse_function: "removeFromBrush"
      });
  
      createAction("remove_from_brush", {
        name: "Remove From Brush",
  
        function: "removeFromBrush",
        reverse_function: "addToBrush"
      });
    }

    //Date
    {
      createAction("change_date", {
        name: "Change Date",

        function: "loadDate",
        reverse_function: "loadDate"
      });
    }
    
    //Entities
    {
      //Entity Actions (Generic)
      createAction("delete_entity", {
        name: "Delete Entity",

        function: "deleteEntity",
        reverse_function: "undoDeleteEntity"
      });
      createAction("finish_entity", {
        name: "Finish Entity",

        function: "finishEntity",
        reverse_function: "undoFinishEntity"
      });
      createAction("hide_entity", {
        name: "Hide Entity",

        function: "hideEntity",
        reverse_function: "showEntity"
      });
      createAction("rename_entity", {
        name: "Rename Entity",

        function: "renameEntity",
        reverse_function: "renameEntity"
      });
      createAction("show_entity", {
        name: "Show Entity",

        function: "showEntity",
        reverse_function: "hideEntity"
      });

      //Entity Actions
      createAction("clean_keyframes", {
        name: "Clean Keyframes",

        function: "cleanKeyframes",
        reverse_function: "undoCleanKeyframes"
      });

      //Keyframes
      createAction("edit_keyframe", {
        name: "Edit Keyframe",

        function: "editKeyframe",
        reverse_function: "undoEditKeyframe"
      });
    }

    //Call initialiseUndoRedoUI()
    initialiseUndoRedoUI();
  }
}
