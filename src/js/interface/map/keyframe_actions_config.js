config.entity_keyframes.keyframe_actions = {
  name: "Keyframe Actions",
  scope_type: ["polities"],

  adjust_time: {
    id: "adjust_time",
    name: "Adjust Time",
    order: 2,

    interface: {
      date: {
        id: "new_date",
        name: "Adjust Time:",
        type: "date",
        x: 0,
        y: 0,

        multiple_rows: true,
        placeholder: "timestamp" //[WIP] - This means the interface defaults to the timestamp the keyframe is tied to.
      },
      change_date_button: {
        id: "change_date_button",
        name: "Change Date",
        type: "button",
        x: 0,
        y: 1,

        effect: {
          move_keyframe: "new_date"
        }
      }
    }
  },
  delete_keyframe: {
    id: "delete_keyframe",
    name: "Delete Keyframe",
    order: 2,

    effect: {
      close_menus: true,
      delete_keyframe: "timestamp"
    }
  },
  edit_keyframe: {
    id: "edit_keyframe",
    name: "Edit Keyframe",
    order: 2,

    effect: {
      close_menus: true,
      edit_keyframe: "timestamp"
    }
  }
};
