config.brush_actions.brush_options = {
  name: "Brush Actions",
  scope_type: ["brush"],
  order: 1,

  brush_simplify_path: {
    id: "brush_simplify_path",
    name: "Simplify Path",

    interface: {
      simplify_check_options: {
        id: "simplify_check_options",
        name: "Simplify Options:",
        type: "checkbox",
        options: {
          simplify_apply_to_all_keyframes: "Apply to All Keyframes",
          simplify_auto_simplify_when_editing: "Auto-Simplify When Editing",
          simplify_only_simplify_brush: "Only Simplify Brush"
        },
        placeholder: {
          simplify_auto_simplify_when_editing: `BRUSH_OBJ.auto_simplify_when_editing`,
          simplify_only_simplify_brush: `BRUSH_OBJ.only_simplify_brush`
        },
        x: 0,
        y: 0
      },
      simplify_path: {
        id: "brush_simplify_range",
        name: "Strength {VALUE}:",
        type: "range",
        x: 0,
        y: 1,

        attributes: {
          global_key: "BRUSH_OBJ.simplify_tolerance",
          min: 0,
          max: 100,
          step: 0.001, //This controls the resolution of control
        },
        placeholder: 0.05,
        value_equation: `VALUE/Math.pow(10, 3)`, //1 represents 0,001; 100 represents 0,1

        effect: {
          set_brush_simplify_tolerance: "brush_simplify_range"
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
          set_only_simplify_brush: "simplify_only_simplify_brush"
        }
      }
    }
  }
};
