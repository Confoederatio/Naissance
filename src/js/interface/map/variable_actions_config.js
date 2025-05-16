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
      settings_checkbox: {
        id: "settings_checkbox",
        type: "checkbox",
        x: 0,
        y: 1,
        
        default: false,
        options: {
          is_global_variable: "Global Variable",
          is_view_in_graph: "View in Graph"
        }
      },

      //Row 3
      zero_bound_interpolation_checkbox: {
        id: "zero_bound_interpolation_checkbox",
        name: "Zero Bound Interpolation",
        type: "checkbox",
        x: 0,
        y: 2,
        
        default: true,
        options: {
          zero_bound_interpolation: "Zero-bound Interpolation"
        }
      },
      interpolation_select: {
        id: "interpolation_select",
        name: "Interpolation",
        type: "select",
        x: 1,
        y: 2,

        options: {
          none: "None",
          linear: "Linear",
          cubic_spline: "Cubic Spline"
        }
      },

      //Row 4
      current_variable_value_input: {
        id: "current_variable_value_input",
        name: "Current Value",
        type: "text",
        x: 0,
        y: 3,
        
        placeholder: "0"
      },
      variable_history: {
        id: "variable_history",
        name: "Variable History",
        type: "html",
        x: 0,
        y: 4,
        
        html: `<div class = "variable-history-container"></div>`
      } //HTML type; populates all keyframes for variable changes
    }
  }
};