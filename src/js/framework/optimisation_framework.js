//Initialise functions
{
  function initOptimisation () {
    //1. Optimise config
    {
      //BRUSH ACTIONS
      //Set .all_brush_actions; .all_brush_actions_keys
      createContextMenuIndex({
        config_key: "brush_actions",
        namespace: "BrushAction"
      });
      createContextMenuInterface({
        anchor: config.defines.common.selectors.brush_actions_context_menu_anchor,
        class: "brush-action-button",
        config_key: "brush_actions", // Used for config lookups like config.brush_actions_lowest_order
        interface_key: "brush", // Key for global.interfaces.brush
        namespace: "BrushAction", // Used for function names like closeBrushActionContextMenu
        navigation_mode: "icons", // Navigation items are direct DOM elements (img, span)
        right_margin: "0px", //Custom right margin
        type: "default", // Operates on a global anchor, not entity/group specific
      });

      //ENTITY ACTIONS
      //Set .all_entity_actions; .all_entity_actions_keys
      createContextMenuIndex({
        config_key: "entity_actions",
        namespace: "EntityAction"
      });
      createContextMenuInterface({
        anchor: `#entity-actions-context-menu`,
        config_key: "entity_actions",
        interface_key: "entity_actions",
        left_margin: "var(--entity-ui-width) + 12px + 4px",
        limit_key: "entity_id",
        namespace: "EntityAction",
        navigation_mode: "list_icons",
        type: "entity"
      });

      //ENTITY KEYFRAMES
      //Set .all_entity_keyframes; .all_entity_keyframe_keys
      createContextMenuIndex({
        config_key: "entity_keyframes",
        namespace: "EntityKeyframe"
      });
      createContextMenuInterface({
        anchor: config.defines.common.selectors.entity_keyframe_context_menu_anchor,
        config_key: "entity_keyframes",
        interface_key: "entity_keyframes",
        limit_key: "entity_id",
        namespace: "EntityKeyframe",
        navigation_mode: "list",
        type: "entity"
      });

      //GROUP ACTIONS
      //Set .all_group_actions; .all_group_actions_keys
      createContextMenuIndex({
        config_key: "group_actions",
        namespace: "GroupAction"
      });
      createContextMenuInterface({
        anchor: config.defines.common.selectors.group_actions_context_menu_anchor,
        config_key: "group_actions",
        interface_key: "group_actions",
        limit_key: "group_id",
        namespace: "GroupAction",
        navigation_mode: "list",
        type: "group"
      });

      //VARIABLES
      createContextMenuIndex({
        config_key: "variables",
        namespace: "VariableActions"
      });
    }

    //2. Scripts
    {
      var { ipcRenderer } = require('electron');

      var frame_count = 0;
      var last_time = performance.now();

      function trackFPS() {
        frame_count++;
        const now = performance.now();

        //Report back to the main process once per second
        if (now - last_time >= 1000) {
          ipcRenderer.send('update-fps', frame_count);
          frame_count = 0;
          last_time = now;
        }

        //Keep the loop going
        requestAnimationFrame(trackFPS);
      }

      //Start the counter
      trackFPS();
    }
  }
}
