config.group_actions.actions_navigation = {
  name: "Group Actions Navigation",
  scope_type: ["groups"],

  navigation_ui: {
    id: "context_menu_one_navigation",
    name: "Group Actions:",
    order: 1,

    interface: {
      create_subgroup_button: {
        id: "create_subgroup_button",
        name: "Create Subgroup",
        type: "button",
        x: 0,
        y: 0,

        effect: {
          create_subgroup: "FROM.current_group"
        }
      },
      customise_group_button: {
        id: "customise_group_button",
        name: "Customise Group",
        type: "button",
        x: 0,
        y: 1,

        effect: {
          //[WIP] - Finish customise group options later.
        }
      },
      delete_group_button: {
        id: "delete_group_button",
        name: "Delete Group",
        type: "button",
        x: 0,
        y: 2,

        effect: {
          delete_group: "FROM.current_group"
        }
      },
      delete_all_button: {
        id: "delete_all_button",
        name: "Delete All",
        type: "button",
        x: 0,
        y: 3,

        effect: {
          delete_group_recursively: "FROM.current_group"
        }
      },
      set_mask_button: {
        id: "set_mask_button",
        name: "Set Mask",
        type: "button",
        x: 0,
        y: 4,

        effect: {
          open_ui: "set_mask"
        }
      }
    }
  }
};

