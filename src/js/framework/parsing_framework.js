//Parser handling
{
  /*
    parseEffect() - Applies an entity effect from a given .effect scope.
    arg0_entity_id: (String) - The entity ID to which this effect applies.
    arg1_scope: (Object) - The effect scope to apply.
    arg2_options: (Object)
      options: (Object) - The actual options of various inputs and the data given, treated as global variables.

      depth: (Number) - The current recursive depth. Starts at 1.
      scope_type: (Array<String>) - Optional. What the current scope_type currently refers to (e.g. 'polities', 'markers'). All if undefined. Undefined by default.
      timestamp: (String) - Optional. The current timestamp of the keyframe being referenced, if any.
      ui_type: (String) - Optional. Whether the ui_type is 'brush_actions'/'entity_actions'/'entity_keyframes'. 'entity_keyframes' by default.
  */
  function parseEffect (arg0_entity_id, arg1_scope, arg2_options) { //[WIP] - Finish function body.
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var scope = (arg1_scope) ? arg1_scope : {};
    var options = (arg2_options) ? arg2_options : {};

    //Initialise options
    if (options.depth == undefined) options.depth = 0;
      options.depth++;
    if (!options.ui_type) options.ui_type = "entity_keyframes";

    //Declare local instance variables
    var all_scope_keys = Object.keys(scope);
    var brush_obj = main.brush;
    var entity_obj = getEntity(entity_id);
    var limit_fulfilled = true;
    scope = JSON.parse(JSON.stringify(scope)); //Deep-copy scope

    //.interface parser; load inputs into .options
    if (options.depth == 1) {
      var common_selectors = config.defines.common.selectors;
      var entity_el = (["entity_actions", "entity_keyframes"].includes(options.ui_type)) ?
        getEntityElement(entity_id) : undefined;
      var actions_container_el;
      var actions_input_obj;
      var brush_actions_container_el;
      var brush_actions_input_obj;
      var group_actions_container_el;
      var group_actions_input_obj;
      var keyframe_container_el;
      var keyframe_input_obj;

      //'entity_actions', 'entity_keyframes' local instance variables
      if (entity_el) {
        actions_container_el = entity_el.querySelector(`${common_selectors.entity_actions_context_menu_anchor}`);
        actions_input_obj = getInputsAsObject(actions_container_el, { entity_id: entity_id });
        keyframe_container_el = entity_el.querySelector(`${common_selectors.entity_keyframe_context_menu_anchor}`);
        keyframe_input_obj = getInputsAsObject(keyframe_container_el, { entity_id: entity_id });

        options.options = dumbMergeObjects(actions_input_obj, keyframe_input_obj);
      } else if (options.ui_type == "group_actions") {
        group_actions_el = getGroupActionsAnchorElement({ group_id: main.brush.selected_group_id });
        group_actions_input_obj = getInputsAsObject(group_actions_el);

        options.options = group_actions_input_obj;
      } else {
        //'brush_actions' local instanace variables
        brush_actions_container_el = getBrushActionsAnchorElement();
        brush_actions_input_obj = getInputsAsObject(brush_actions_container_el); //[WIP] - This function is flawed when it comes to checkboxes for some reason

        options.options = brush_actions_input_obj;
      }

      //Set options.timestamp to be passed down
      if (!options.options) options.options = {};
      options.options.timestamp = options.timestamp;

      //Iterate over all_scope_keys and replace any strings with values in options.options if they indeed exist
      var all_recursive_scope_keys = getAllObjectKeys(scope, { include_parent_keys: true });

      for (var i = 0; i < all_recursive_scope_keys.length; i++) {
        var local_value = getList(getObjectKey(scope, all_recursive_scope_keys[i]));

        //Test to make sure that local_value[0] is indeed a string; and that local_value is 1 long
        if (local_value.length == 1)
          if (typeof local_value[0] == "string") {
            //Direct variable substitution if detected as valid
            if (getObjectKey(options.options, local_value[0]) != undefined)
              setObjectKey(scope, all_recursive_scope_keys[i], getObjectKey(options.options, local_value[0]));

            //If the string is more complex; attempt to use parseVariableString() on it
            try {
              options.options.ignore_errors = true;
              setObjectKey(scope, all_recursive_scope_keys[i], parseVariableString(local_value[0], options.options));
              delete options.options.ignore_errors;
            } catch (e) {
              console.log(scope, all_recursive_scope_keys[i], local_value[0], options.options);
              console.log(e);
            }
          }
      }
    }
    var suboptions = options.options;

    //.limit parser
    if (scope.limit) {
      var new_options = JSON.parse(JSON.stringify(options));
      limit_fulfilled = parseLimit(entity_id, scope.limit, new_options);
    }

    //.effect parser
    //Iterate over all_scope_keys, recursively parsing the scope whenever 'effect_<key>' is encountered.
    if (limit_fulfilled)
      for (var i = 0; i < all_scope_keys.length; i++) {
        var local_value = getList(scope[all_scope_keys[i]]);

        //Recursive parsers/scoping
        if (all_scope_keys[i].startsWith("effect_")) {
          var new_options = JSON.parse(JSON.stringify(options));
          var parsed_effect = parseEffect(entity_id, local_value[0], new_options);
        }

        //Same-scope effects
        {
          //Action effects - [WIP] - Finish adding action effects
          if (all_scope_keys[i] == "apply_path")
            applyPathToKeyframes(entity_id, local_value);
          if (all_scope_keys[i] == "clean_all_keyframes")
            cleanKeyframes(entity_id, options.ENTITY_ABSOLUTE_AGE);
          if (all_scope_keys[i] == "clean_keyframes")
            cleanKeyframes(entity_id, local_value[0]);
          if (all_scope_keys[i] == "disable_brush")
            if (local_value[0]) {
              disableBrush();
            } else {
              enableBrush();
            }
          if (all_scope_keys[i] == "edit_entity")
            editEntity(entity_id);
          if (all_scope_keys[i] == "edit_entity_nodes")
            if (local_value[0]) {
              editEntity(entity_id);
              editEntityNodes(entity_id);
            } else {
              stopEditingEntityNodes(entity_id);
              finishEntity(entity_id);
            }
          if (all_scope_keys[i] == "finish_entity")
            finishEntity(entity_id);
          if (all_scope_keys[i] == "hide_entity")
            if (local_value[0]) {
              hideEntity(entity_id);
            } else {
              showEntity(entity_id);
            }
          if (all_scope_keys[i] == "set_brush_auto_simplify")
            setBrushAutoSimplify(local_value[0]);
          if (all_scope_keys[i] == "set_brush_simplify_tolerance")
            setBrushSimplifyTolerance(parseFloat(local_value[0]));
          if (all_scope_keys[i] == "set_only_simplify_brush")
            setBrushOnlySimplifyBrush(local_value[0]);
          if (all_scope_keys[i] == "simplify_all_keyframes")
            simplifyAllEntityKeyframes(entity_id, returnSafeNumber(local_value[0]));

          //Group actions
          if (all_scope_keys[i] == "create_subgroup")
            addGroup("hierarchy", { parent_group: local_value[0].id });
          if (all_scope_keys[i] == "delete_group")
            deleteGroup("hierarchy", local_value[0].id);
          if (all_scope_keys[i] == "delete_group_recursively")
            deleteGroupRecursively("hierarchy", local_value[0].id);
          if (all_scope_keys[i] == "set_group_mask")
            if (typeof local_value[0] == "object") {
              setGroupMask(local_value[0].group_id, local_value[0].value);
            } else {
              setGroupMask(main.brush.selected_group_id, local_value[0]);
            }

          //History effects
          if (all_scope_keys[i] == "delete_keyframe")
            deleteKeyframe(entity_id, suboptions[local_value[0]]);
          if (all_scope_keys[i] == "edit_keyframe")
            editKeyframe(entity_id, suboptions[local_value[0]]);
          if (all_scope_keys[i] == "move_keyframe")
            moveKeyframe(entity_id, options.timestamp, local_value[0]);

          //UI interface effects
          if (all_scope_keys[i] == "close_ui")
            //Parse the entity_effect being referenced
            for (var x = 0; x < local_value.length; x++) {
              if (entity_el) {
                //[WIP] - Refactor this so it is compatible with 'entity_action'
                if (options.ui_type == "entity_actions") {
                  var local_entity_action = getEntityAction(local_value[x]);
                  var local_entity_order = (local_entity_action.order != undefined) ?
                    local_entity_action.order : 1;

                  closeEntityActionContextMenu(local_entity_order, { entity_id: entity_id });
                }
                if (options.ui_type == "entity_keyframes") {
                  var local_entity_keyframe = getEntityKeyframe(local_value[x]);
                  var local_entity_order = (local_entity_keyframe.order != undefined) ?
                    local_entity_keyframe.order : 1;

                  closeEntityKeyframeContextMenu(entity_id, local_entity_order);
                }
              } else {
                var local_brush_action = getBrushAction(local_value[x]);
                var local_brush_order = (local_brush_action.order != undefined) ?
                  local_brush_action.order : 1;

                closeBrushActionContextMenu(local_brush_action);
              }
            }
          if (all_scope_keys[i] == "close_menus")
            if (local_value[0]) closeEntityKeyframeContextMenus(entity_id);
          if (all_scope_keys[i] == "close_select_multiple_keyframes")
            selectMultipleKeyframes(entity_id, { close_selection: true });
          if (all_scope_keys[i] == "interface")
            printEntityKeyframesContextMenu(scope, { entity_id: entity_id });
          if (["open_ui", "trigger"].includes(all_scope_keys[i]))
            if (options.ui_type == "brush_actions") {
              //Parse the brush_effect being referenced
              for (var x = 0; x < local_value.length; x++)
                if (local_value[x]) {
                  var local_brush_action = getBrushAction(local_value[x]);
                  var new_options = JSON.parse(JSON.stringify(options));
                  var parsed_effect, parsed_immediate;

                  //Initialise options
                  if (!new_options.BRUSH_ACTION)
                    new_options.BRUSH_ACTION = local_value[x];

                  //Parse scope
                  if (local_brush_action.effect)
                    parsed_effect = parseEffect(undefined, local_brush_action.effect, new_options);
                  if (local_brush_action.immediate)
                    parsed_immediate = parseEffect(undefined, local_brush_action.immediate, new_options);
                  if (local_brush_action)
                    printBrushActionsContextMenu(local_brush_action, new_options);
                }
            } else if (options.ui_type == "entity_actions") {
              //Parse the entity_effect being referenced
              for (var x = 0; x < local_value.length; x++) {
                var local_entity_action = getEntityAction(local_value[x]);
                var new_options = JSON.parse(JSON.stringify(options));
                var parsed_effect, parsed_immediate;

                //Initialise options
                if (!new_options.ENTITY_ACTION)
                  new_options.ENTITY_ACTION = local_value[x];

                //Parse scope
                if (local_entity_action.effect)
                  parsed_effect = parseEffect(entity_id, local_entity_action.effect, new_options);
                if (local_entity_action.immediate)
                  parsed_immediate = parseEffect(entity_id, local_entity_action.immediate, new_options);
                if (local_entity_action)
                  printEntityActionsContextMenu(local_entity_action, {
                    entity_id: entity_id,
                    timestamp: convertTimestampToInt(getTimestamp(main.date)),
                    ...new_options
                  });
              }
            } else if (options.ui_type == "entity_keyframes") {
              //Parse the entity_effect being referenced
              for (var x = 0; x < local_value.length; x++) {
                var local_entity_keyframe = getEntityKeyframe(local_value[x]);
                var new_options = JSON.parse(JSON.stringify(options));
                var parsed_effect, parsed_immediate;

                //Initialise options
                if (!new_options.ENTITY_KEYFRAME)
                  new_options.ENTITY_KEYFRAME = local_value[x];

                //Parse scope
                if (local_entity_keyframe.effect)
                  parsed_effect = parseEffect(entity_id, local_entity_keyframe.effect, new_options);
                if (local_entity_keyframe.immediate)
                  parsed_immediate = parseEffect(entity_id, local_entity_keyframe.immediate, new_options);
                if (local_entity_keyframe)
                  printEntityKeyframesContextMenu(local_entity_keyframe, { entity_id: entity_id, ...new_options });
              }
            } else if (options.ui_type == "group_actions") {
              //Parse the group_effect being referenced
              for (var x = 0; x < local_value.length; x++) {
                var local_group_action = getGroupAction(local_value[x]);
                var new_options = JSON.parse(JSON.stringify(options));
                var parsed_effect, parsed_immediate;

                //Initialise options
                if (!new_options.GROUP_ACTION)
                  new_options.GROUP_ACTION = local_value[x];
                //console.log(local_value, new_options)

                //Parse scope
                if (local_group_action.effect)
                  parsed_effect = parseEffect(undefined, local_group_action.effect, new_options);
                if (local_group_action.immediate)
                  parsed_immediate = parseEffect(undefined, local_group_action.immediate, new_options);
                if (local_group_action)
                  printGroupActionsContextMenu(main.brush.selected_group_id, local_group_action, new_options);
              }
            }
          if (all_scope_keys[i] == "refresh_brush_actions")
            refreshBrushActions();
          if (["refresh_entity_actions", "reload_entity_actions"].includes(all_scope_keys[i]))
            refreshEntityActions(entity_id);
          if (all_scope_keys[i] == "select_multiple_keyframes")
            selectMultipleKeyframes(entity_id, { assign_key: local_value[0] });
        }
      }
  }

  /*
    parseLimit() - Recursively returns a boolean for an entity given its .limit scope.
    arg0_entity_id: (String) - The entity ID for which this limit checks.
    arg1_scope: (Object) - The effect limit scope to apply.
    arg2_options: (Object)
      operator: (String) - Optional. The current operator. Either 'and', 'not', 'or', or 'xor'. 'and' by default.
      options: (Object) - The actual options of various inputs and the data given, treated as global variables.

      depth: (Number) - The current recursive depth. Starts at 1.
      scope_type: (Array<String>) - Optional. What the current scope_type currently refers to. (e.g. 'polities', 'markers'). All if undefined. Undefined by default.
      timestamp: (String) - Optional. The current timestamp of the keyframe being referenced, if any.
      ui_type: (String) - Optional. Whether the ui_type is 'brush_actions'/'entity_actions'/'entity_keyframes'. 'entity_keyframes' by default.

    Returns: (Boolean)
  */
  function parseLimit (arg0_entity_id, arg1_scope, arg2_options) {
    //Convert from parameters
    var entity_id = arg0_entity_id;
    var scope = arg1_scope;
    var options = (arg2_options) ? arg2_options : {};

    //Initialise options
    if (options.depth == undefined) options.depth = 0;
      options.depth++;
    if (!options.operator) options.operator = "and";
    if (!options.ui_type) options.ui_type = "entity_keyframes";

    //Declare local instance variables
    var all_scope_keys = Object.keys(scope);
    var entity_obj = getEntity(entity_id);
    var local_checks = 0;

    //Add in scope variables if options.options demands; but only on the first depth layer
    if (options.depth == 1)
      //Iterate over all_scope_keys and replace any strings with values in options.options if they indeed exist
      for (var i = 0; i < all_scope_keys.length; i++) {
        var local_value = getList(scope[all_scope_keys[i]]);

        //Test to make sure that local_value[0] is indeed a string; and that local_value is 1 long
        if (local_value.length == 1)
          if (typeof local_value[0] == "string")
            if (options.options[local_value[0]] != undefined)
              scope[all_scope_keys[i]] = options.options[local_value[0]];
      }

    //Current .limit parser
    //Iterate over all_scope_keys, recursively parsing the scope whenever a subscope is encountered.
    for (var i = 0; i < all_scope_keys.length; i++) {
      var local_value = getList(scope[all_scope_keys[i]]);

      //Recursive parsers/scoping
      {
        if (all_scope_keys[i].startsWith("limit_") || all_scope_keys[i] == "limit") {
          var new_options = JSON.parse(JSON.stringify(options));
          var parsed_limit = parseLimit(entity_id, local_value[0], new_options);

          if (parsed_limit) local_checks++;
        }
        //And/Not/Or/Xor parser
        var local_boolean_type = getBooleanOperatorFromString(all_scope_keys[i]);
        if (local_boolean_type) {
          var new_options = JSON.parse(JSON.stringify(options));
            new_options.operator = local_boolean_type;
          var parsed_limit = parseLimit(entity_id, local_value[0], new_options);

          if (parsed_limit) local_checks++;
        }
      }

      //Same-scope conditions
      {
        if (all_scope_keys[i] == "brush_is_disabled")
          if (local_value[0] == true) {
            if (main.brush.disable_brush)
              local_checks++;
          } else {
            if (!main.brush.disable_brush)
              local_checks++;
          }
        if (all_scope_keys[i] == "entity_is_being_edited")
          if (local_value[0] == true) {
            if (isEntityBeingEdited(entity_id, local_value[0]))
              local_checks++;
          } else {
            if (!isEntityBeingEdited(entity_id, local_value[0]))
              local_checks++;
          }
        if (all_scope_keys[i] == "is_editing_entity")
          if (local_value[0] == true) {
            if (main.brush.current_path)
              local_checks++;
          } else {
            if (!main.brush.current_path)
              local_checks++;
          }
        if (all_scope_keys[i] == "is_editing_entity_nodes")
          if (local_value[0] == true) {
            if (isEditingEntityNodes(entity_id))
              local_checks++;
          } else {
            if (!isEditingEntityNodes(entity_id))
              local_checks++;
          }
        if (all_scope_keys[i] == "entity_is_hidden")
          if (local_value[0] == true) {
            if (isEntityHidden(entity_id, main.date))
              local_checks++;
          } else {
            if (!isEntityHidden(entity_id, main.date))
              local_checks++;
          }
      }
    }

    //Return statement; AND/NOT/OR/XOR handler
    if (options.operator == "and")
      if (local_checks >= all_scope_keys.length) return true;
    if (options.operator == "not")
      if (local_checks == 0) return true;
    if (options.operator == "or")
      if (local_checks > 0) return true;
    if (options.operator == "xor")
      if (local_checks == 1) return true;
  }

  /*
    parseVariableString() - Parses a variable string and returns its resolved value.
    arg0_string: (String) - The string which to resolve.
    arg1_options: (Object)
      <key>: (Variable)
      regex_replace: (Object)
        <key>: (Variable)

    Returns: (Variable)
  */
  function parseVariableString (arg0_string, arg1_options) { //[WIP] - Something here is wrong as it returns HTMLElement in some cases.
    //Convert from parameters
    var string = JSON.parse(JSON.stringify(arg0_string));
    var options = (arg1_options) ? arg1_options : {};

    //Initialise options
    if (!options.regex_replace) options.regex_replace = {};
      if (!options.regex_replace.BRUSH_OBJ) options.regex_replace.BRUSH_OBJ = "main.brush";
      if (!options.regex_replace.MAIN_OBJ) options.regex_replace.MAIN_OBJ = "global.main";

    //'hierarchies' handler
    var group_id = main.brush.selected_group_id;

    if (group_id) {
      var group_el = getGroupElement(group_id);
      var group_obj = getGroup("hierarchy", group_id);

      //Set FROM object
      if (!options.FROM)
        options.FROM = {
          current_group: group_obj,
          group_el: group_el,
          group_id: group_id,
          group_obj: group_obj
        };
    }

    //Declare local instance variables
    var all_option_keys = getAllObjectKeys(options, { include_parent_keys: true });

    //Destructure all keys in options such that they are locally available for eval to use
    for (var i = 0; i < all_option_keys.length; i++) {
      var local_split_key = all_option_keys[i].split(".");
      var local_value = getObjectKey(options, all_option_keys[i]);

      //Destructure local object first
      if (local_split_key.length > 1) {
        var define_string = [];

        for (var x = 0; x < local_split_key.length - 1; x++)
          if (x == 0) {
            define_string.push(`if (${local_split_key[0]} == undefined) var ${local_split_key[0]} = {};`);
          } else {
            var local_join_key = [];

            for (var y = 0; y < x + 1; y++)
              local_join_key.push(local_split_key[y]);
            local_join_key = local_join_key.join(".");

            define_string.push(`if (${local_join_key} == undefined) ${local_join_key} = {};`);
          }

          eval(define_string.join(""));
      } else {
        eval(`var ${all_option_keys[i]} = local_value;`);
      }
    }

    //console.log("parseVariableString()", all_option_keys);
    var evaluated_string;
    try {
      //Iterate over options.regex_replace
      var all_regex_replace_keys = Object.keys(options.regex_replace);

      for (var i = 0; i < all_regex_replace_keys.length; i++) {
        var local_value = options.regex_replace[all_regex_replace_keys[i]];
        var local_regexp = new RegExp(all_regex_replace_keys[i], "gm");

        try {
          string = string.replace(local_regexp, local_value);
        } catch {}
      }

      evaluated_string = eval(string);
    } catch (e) {
      if (!options.ignore_errors) {
        console.log("Options:", options);
        console.log("String:", string);
        console.log(e);
      }
      evaluated_string = string;
    }

    //Handle HTMLElement types
    if (isElement(evaluated_string))
      if (evaluated_string.getAttribute("type") == "checkbox") {
        //Return statement
        return evaluated_string.checked;
      } else {
        //Return statemenbt
        return evaluated_string.value;
      }

    //Return statement
    return evaluated_string;
  }
}

//Parser helper functions
{
  /*
    getBooleanOperatorFromString() - Helper function. Fetches a boolean operator (e.g. 'xor') from a given scripting string. Returns either 'and', 'not', 'or', or 'xor'.
    arg0_string: (String) - The scripting string.

    Returns: (String)
  */
  function getBooleanOperatorFromString (arg0_string) {
    //Convert from parameters
    var string = arg0_string;

    //Return statement
    if (string.startsWith("and_") || string == "and") return "and";
    if (string.startsWith("not_") || string == "not") return "not";
    if (string.startsWith("or_") || string == "or") return "or";
    if (string.startsWith("xor_") || string == "xor") return "xor";
  }
}
