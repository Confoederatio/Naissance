config.entity_keyframes.keyframe_navigation = {
  name: "Keyframe Navigation",
  scope_type: ["polities"],

  navigation_ui: {
    id: "context_menu_one_navigation",
    name: "Entity Keyframe:",
    order: 1,

    interface: {
      adjust_time_button: {
        id: "adjust_time_button",
        name: "Adjust Time",
        type: "button",
        x: 0,
        y: 0,

        effect: {
          open_ui: "adjust_time"
        }
      },
      edit_keyframe_button: {
        id: "edit_keyframe_button",
        name: "Edit Keyframe",
        type: "button",

        effect: {
          trigger: "edit_keyframe"
        }
      },
      delete_keyframe_button: {
        id: "delete_keyframe_button",
        name: "Delete Keyframe",
        type: "button",

        effect: {
          trigger: "delete_keyframe"
        }
      }
    }
  }
};
