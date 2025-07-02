config.entity_actions.polity_actions = {
  name: "Polity Actions",
  scope_type: ["polities"],

  apply_path_two: {
    id: "apply_path_two",
    name: "Apply Path",
    order: 2,

    immediate: {
      select_multiple_keyframes: "selected_keyframes"
    },
    interface: {
      confirm_button: {
        id: "confirm_button",
        name: "Apply Path to Selected Keyframes",
        type: "button",
        x: 0,
        y: 0,

        effect: {
          apply_path: "selected_keyframes"
        }
      }
    }
  },
  clean_keyframes_two: {
    id: "clean_keyframes_two",
    name: "Clean Keyframes",
    order: 2,

    interface: {
      date_range: {
        id: "date_range",
        name: "Delete duplicate keyframes within the following threshold range.",
        type: "date_length",
        x: 0,
        y: 0,

        multiple_rows: true,
        placeholder: "ENTITY_RELATIVE_AGE"
      },
      confirm_button: {
        id: "confirm_button",
        name: "Confirm",
        type: "button",
        x: 0,
        y: 1,

        effect: {
          clean_keyframes: "date_range"
        }
      }
    }
  },
  simplify_path_two: {
    id: "simplify_path_two",
    name: "Simplify Path",
    order: 2,

    interface: {
      simplify_check_options: {
        id: "simplify_check_options",
        name: "Simplify Options:",
        type: "checkbox",
        options: {
          simplify_apply_to_all_keyframes: "Apply to All Keyframes",
          simplify_auto_simplify_when_editing: "Auto-Simplify When Editing"
        },
        placeholder: {
          simplify_auto_simplify_when_editing: `BRUSH_OBJ.auto_simplify_when_editing`,
        },
        x: 0,
        y: 0
      },
      simplify_range: {
        id: "simplify_range",
        name: "Strength {VALUE}:",
        type: "range",
        x: 0,
        y: 1,

        attributes: {
          global_key: "BRUSH_OBJ.simplify_tolerance",
          min: 0,
          max: 100,
          step: 0.001 //This controls the resolution of control
        },
        placeholder: 0.05,
        value_equation: `VALUE/Math.pow(10, 3)`, //1 represents 0,001; 100 represents 0,1

        effect: {
          set_brush_simplify_tolerance: "simplify_range"
        }
      },
      confirm_button: {
        id: "confirm_button",
        name: "Confirm",
        type: "button",
        x: 0,
        y: 2,

        effect: {
          set_brush_auto_simplify: "simplify_auto_simplify_when_editing",
          simplify_all_keyframes: "simplify_apply_to_all_keyframes",
          simplify_entity: "BRUSH_OBJ.simplify_tolerance"
        }
      }
    }
  }
};
