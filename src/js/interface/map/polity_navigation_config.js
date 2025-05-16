config.entity_actions.polity_navigation = {
  name: "Polity Navigation",
  scope_type: ["polities"],
  base_navigation: true, //This is the 1st-order navigation menu, which is displayed by default in the Entity UI.

  edit_polity: {
    icon: "gfx/interface/pencil_filled_icon.png",
    name: "Edit Polity",
    order: 1, //order: 1 is keymapped to the initial Entity Actions menu displayed by default.
    x: 0,
    y: 0,

    limit: {
      entity_is_being_edited: false
    },
    effect: {
      edit_entity: true
    }
  },
  edit_nodes: {
    icon: "gfx/interface/edit_entity_nodes.png",
    name: "Edit Nodes",
    order: 1,
    x: 1,
    y: 0,

    effect: {
      edit_entity_nodes: true,
      refresh_entity_actions: true
    }
  },
  stop_editing_nodes: {
    icon: "gfx/interface/finish_editing_entity_nodes.png",
    name: "Stop Editing Nodes",
    order: 1,
    x: 1,
    y: 0,

    limit: {
      is_editing_entity_nodes: true
    },
    effect: {
      edit_entity_nodes: false,
      refresh_entity_actions: true
    }
  },
  finish_polity: {
    icon: "gfx/interface/checkmark_icon.png",
    name: "Finish Polity",
    order: 1,
    x: 0,
    y: 0,

    limit: {
      is_editing_entity_nodes: false,
      entity_is_being_edited: true
    },
    effect: {
      finish_entity: true,
      refresh_entity_actions: true
    }
  },
  hide_polity: {
    icon: "gfx/interface/hide_polity_icon.png",
    name: "Hide Polity",
    order: 1,
    x: 2,
    y: 0,

    limit: {
      entity_is_being_edited: false,
      entity_is_hidden: false
    },
    effect: {
      hide_entity: true,
      refresh_entity_actions: true
    }
  },
  show_polity: {
    icon: "gfx/interface/hide_polity_icon.png",
    name: "Show Polity",
    order: 1,
    x: 2,
    y: 0,

    limit: {
      entity_is_being_edited: false,
      entity_is_hidden: true
    },
    effect: {
      hide_entity: false,
      refresh_entity_actions: true
    }
  },

  apply_path: {
    icon: "gfx/interface/apply_path_icon.png",
    name: "Apply Path",
    order: 1,
    x: 0,
    y: 1,

    effect: {
      trigger: "apply_path_two"
    }
  },
  clean_keyframes: {
    icon: "gfx/interface/clean_keyframes_icon.png",
    name: "Clean Keyframes",
    order: 1,
    x: 1,
    y: 1,

    effect: {
      trigger: "clean_keyframes_two"
    }
  },
  simplify_path: {
    icon: "gfx/interface/simplify_icon.png",
    name: "Simplify Path",
    order: 1,
    x: 2,
    y: 1,

    effect: {
      trigger: "simplify_path_two"
    }
  }
};
