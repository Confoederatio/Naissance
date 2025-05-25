config.brush_actions.brush_rightbar = {
  name: "Brush Navigation",
  scope_type: ["brush"],
  base_navigation: true, //This is the 1st-order navigation menu, which is displayed by default in the Brush UI on the bottombar.
  
  finish_entity_button: {
    icon: "gfx/interface/checkmark_icon_small.png",
    name: "Finish Entity",
    order: 1,

    limit: {
      is_editing_entity: true
    },
    effect: {
      finish_entity: true,
      refresh_brush_actions: true,
      refresh_entity_actions: true
    }
  },
  disable_brush_button: {
    icon: "gfx/interface/brush_enable_icon.png",
    name: "Disable Brush",    
    order: 1,
    
    limit: {
      brush_is_disabled: false
    },
    effect: {
      disable_brush: true,
      refresh_brush_actions: true
    }
  },
  enable_brush_button: {
    icon: "gfx/interface/brush_disable_icon.png",
    name: "Enable Brush",
    order: 1,

    limit: {
      brush_is_disabled: true
    },
    effect: {
      disable_brush: false,
      refresh_brush_actions: true
    }
  },
  simplify_path_button: {
    icon: "gfx/interface/simplify_icon.png",
    name: "Simplify Path",
    order: 1,

    effect: {
      trigger: "brush_simplify_path"
    }
  }
};
