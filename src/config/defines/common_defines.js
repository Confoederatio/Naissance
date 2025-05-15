config.defines.common = {
  reserved_brush_actions: ["name", "scope_type"], //The types of keys that are reserved for config.brush_actions categories
  reserved_entity_actions: ["name", "scope_type"], //The types of keys that are reserved for config.entity_actions categories
  reserved_entity_keyframes: ["name", "scope_type"], //The types of keys that are reserved for config.entity_keyframes categories
  reserved_group_actions: ["name", "scope_type"], //The types of keys that are reserved for config.group_actions categories

  months_lowercase: ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"],
  months_uppercase: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  selectors: {
    //Interface
    map: "map", //The query selector for the main map element.
    left_sidebar: `#left-sidebar`, //The query selector for the left sidebar container.
    right_sidebar: `#right-sidebar`, //The query selector for the right sidebar container.
    topbar: `#topbar`, //The query selector for the topbar container.

    //Interface - Left Sidebar
    //Files - Save/Load
      files_hierarchy: `.file-container .hierarchy`,
      files_interaction_container: `.file-container #file-interaction-container`,
        files_interaction_save_file_button: `.file-container #file-interaction-container #save-file-button`,
        files_interaction_save_file_input: `.file-container #file-interaction-container #save-file-input`,
    //Hierarchy
      hierarchy: `#hierarchy`, //The query selector for the actual hierarchy tab or supercontainer.
      hierarchy_container: `#hierarchy-container`, //The query selector for the actual hierarchy container.
        group_actions_context_menu_anchor: `#context-menu-container`,
    //Scripts
      scripts_container: `#scripts-content-container`, //The query selector for the actual scripts container.
    //Settings
      settings_container: `#settings-content-container`, //The query selector for the actual settings container.
        map_layers_container: `#settings-content-container #map_layers_sortable_list`,
    //Undo/Redo
      undo_redo_canvas_container: `#undo-redo-tab .undo-redo-canvas-container`,
      undo_redo_container: `#undo-redo-ui-container`, //The query selector for the actual Undo/Redo container.
      undo_redo_tab: `#undo-redo-container`,
    date_container: `#date-container`, //The query selector for the global date container to be populated automatically.
    date_fields: `#date-container input`, //The query selector on which to apply 'keyup' update interactivity.
      day_el: `#date-container #day-input`,
      month_el: `#date-container #month-input`,
      year_el: `#date-container #year-input`,
      year_type_el: `#date-container #year-type`,

      hour_el: `#date-container #hour-input`,
      minute_el: `#date-container #minute-input`,

    //Interface - Right Sidebar
    brush_actions_context_menu_anchor: `#brush-actions-context-menu`,

    //Interface - Topbar
    left_sidebar_pages: `#left-sidebar [page="true"]`,
    topbar_tab_buttons: `#topbar > ul li, #topbar-action-buttons-container > span`, //The query selector for all topbar tab buttons.
      file_button: `#topbar .file`, //The FILE button query selector.
      undo_redo_button: `#topbar .undo_redo`, //The UNDO-REDO button query selector
      map_button: `#topbar .map`, //The MAP button query selector.
      scripts_button: `#topbar-action-buttons-container .scripts-button`, //The SCRIPTS button query selector.
      settings_button: `#topbar-action-buttons-container .settings-button`, //The SETTINGS button query selector.

      file_page: `#left-sidebar #file-tab`,
      map_page: `#left-sidebar #hierarchy-tab`,
      scripts_page: `#left-sidebar #scripts-tab`,
      settings_page: `#left-sidebar #settings-tab`,
      undo_redo_page: `#left-sidebar #undo-redo-tab`,

    //Map
    entity_ui: `.leaflet-popup`,
      //Entity UI - All of these are prefixed by {entity_selector}
      //Entity UI - 1st Row - Header
      entity_ui_header: `#entity-header`, //The query selector for the Entity UI header.

      //Entity UI - 2nd Row - Timeline/Data
      entity_timeline_graph: `#entity-ui-timeline-graph-container`, //The query selector for the Entity Timeline header
      entity_timeline_graph_canvas: `#entity-ui-timeline-graph`, //The query selector for the Entity Timeline graph canvas
      entity_timeline_header: `#entity-ui-timeline-data-header`, //The query selector for the Entity Timeline header.

      entity_bio_container: `#entity-ui-timeline-bio-container`, //The query selector containing the Entity Bio container.
      entity_bio_header: `.top-bio-header`, //The query selector for tyhe Entity Bio header.
      entity_bio_table: `#entity-ui-timeline-bio-table`, //The query selector containing the Entity Bio table with history frames.
        entity_bio_entries_dates: `table tbody tr td:first-child`, //The query selector containing all entity bio entry dates.
        entity_bio_entries: `table tbody tr td:not(:first-child) span`, //The query selector for all entity bio entries generated.

      entity_keyframe_context_menu_anchor: `#entity-keyframe-context-menu`,

      //Entity UI - 3rd Row - Customisation
      entity_colour_picker: `#entity-ui-customisation-colour`,
      entity_customisation_tab_container: `#entity-ui-customisation-other #customisation-tab-container`,
      entity_customisation_options: `#entity-ui-customisation-other #customisation-options`,
      
      entity_variable_container: `#custom-data-fields-container`,
      entity_variable_context_menu_anchor: `#entity-variable-context-menu`,

      //Entity UI - 4th Row - Actions
      entity_actions_context_menu_anchor: `#entity-actions-context-menu`
  }
};
