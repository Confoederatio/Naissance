config.settings.global = {
  global_settings_html: {
    id: `global_settings_header`,
    type: "html",

    innerHTML: `
      <div class = "primary-header">Global Settings</div>
    `,
  },
  global_ui_layout_toggles: { //[WIP] - Functionality not yet added
    id: `global_ui_layout_toggles`,
    type: "checkbox",

    options: {
      "anchor_entity_popups": "Anchor Entity Popups",
      "hide_entity_data_graph_by_default": "Hide Entity Data Graph by Default"
    }
  },
  document_settings_html: {
    id: `document_settings_header`,
    type: "html",

    innerHTML: `
      <div class = "primary-header">Document Settings</div>
    `,
  }
};