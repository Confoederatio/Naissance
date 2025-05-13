config.brush_actions.brush_bottombar = {
  name: "Brush Navigation",
  scope_type: ["brush"],
  base_navigation: true, //This is the 1st-order navigation menu, which is displayed by default in the Brush UI on the bottombar.

  simplify_path_button: {
    icon: "gfx/interface/simplify_icon.png",
    name: "Simplify Path",
    order: 1,

    effect: {
      trigger: "brush_simplify_path"
    }
  },
  finish_entity_button: {
    icon: "gfx/interface/checkmark_icon.png",
    name: "Finish Entity",
    order: 1,

    /*limit: { [WIP] - parseBrushLimit() is not defined.
      entity_is_being_edited: true
    },*/
    effect: {
      finish_entity: true,
      refresh_entity_actions: true
    }
  }
};
