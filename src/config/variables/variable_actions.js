config.variables.variable_actions = { //[WIP] - Finish config body
  name: "Variable Actions",
  scope_type: ["entities"],

  edit_variable: {
    id: "edit_variable",
    name: "Edit Variable",
    order: 1,

    interface: {
      //Row 1
      variable_key_input: {
        id: "variable_key_input",
        name: "Key",
        type: "text",
        x: 0,
        y: 0,

        placeholder: "VARIABLE_OBJ.key",
        effect: {
          update_variable_key: {
            FROM: "VARIABLE_OBJ.key",
            TO: "variable_key_input"
          }
        }
      },
      add_subvariable_button: {
        id: "add_subvariable_button",
        name: "Add Subvariable",
        type: "button",
        x: 1,
        y: 0,

        effect: {
          add_subvariable: "VARIABLE_OBJ.key"
        }
      },
      delete_variable_button: {
        id: "delete_variable_button",
        name: "Delete Variable",
        type: "button",
        x: 2,
        y: 0,
        
        effect: {
          delete_variable: "VARIABLE_OBJ.key"
        }
      },

      //Row 2
      global_variable_checkbox: {},
      view_in_graph_checkbox: {},

      //Row 3
      zero_bound_interpolation_checkbox: {},
      interpolation_select: {},

      //Row 4
      current_variable_value_input: {},
      variable_history: {} //HTML type; populates all keyframes for variable changes
    }
  }
};