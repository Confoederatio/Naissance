config.group_actions.group_masks = {
  name: "Group Masks",
  scope_type: ["groups"],

  set_mask: {
    id: "context_menu_two_set_mask",
    name: "Group Masks:",
    order: 2,

    interface: {
      group_mask_select: {
        id: "group_mask_select",
        name: "Group Mask:",
        type: "select",

        attributes: {
          global_key: "GROUP_OBJ.mask_select"
        },
        options: {
          add: "Add (Brush > Mask)",
          intersect_add: "Intersect Add (Brush > Intersection)",
          intersect_overlay: "Intersect Overlay (Brush in Intersection)",
          subtract: "Subtract (Mask > Brush)",
          clear: "None"
        }
      },
      confirm_mask_button: {
        id: "confirm_mask_button",
        name: "Confirm Mask",
        type: "button",

        effect: {
          set_group_mask: "group_mask_select"
        }
      }
    }
  }
};
