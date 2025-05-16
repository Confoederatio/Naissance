//Initialise functions
{
  /*
    createFileExplorer() - Creates a new file explorer in a given container element.
    arg0_container_selector: (String)
    arg1_file_path: (String)
    arg2_options: (Object)
      saves_explorer: (Boolean) - Whether this is a saves explorer.
      variable_key: (String) - The variable key to use when setting new paths. main.selected_path by default.
  */
  function createFileExplorer (arg0_container_selector, arg1_file_path, arg2_options) {
    //Convert from parameters
    var container_selector = arg0_container_selector;
    var file_path = arg1_file_path.trim().toString();
    var options = (arg2_options) ? arg2_options : {};

    //Initialise options
    var container_el = (typeof container_selector != "object" ) ?
      document.querySelector(container_selector) : container_selector;

    if (!options.id) options.id = container_el.getAttribute("id");
    if (!options.variable_key) options.variable_key = main.selected_path;

    //Initialise hierarchy
    if (!main.hierarchies[options.id]) {
      var explorer_el = initHierarchy({
        id: options.id,
        hierarchy_selector: container_selector,
        hide_add_group: true,
        hide_add_entity: true,
        hide_context_menus: true,

        disable_delete: options.disable_delete,
        disable_renaming: true
      });

      //Populate initial base saves folder upon load
      populateFolderExplorer(options.id, file_path, undefined, options);
    }
  }

  /*
    populateFolderExplorer() - Populates the current folder explorer's DOM with the file path stated.
    arg0_hierarchy_id: (String)
    arg1_file_path: (String)
    arg2_parent_group_id: (String) - Optional. Used for nesting displays.
    arg3_options: (Object)
      saves_explorer: (Boolean) - Whether this is the saves explorer and file renames/deletes should be limited to the saves folder only.
  */
  function populateFolderExplorer (arg0_hierarchy_id, arg1_file_path, arg2_parent_group_id, arg3_options) {
    //Convert from parameters
    var hierarchy_id = arg0_hierarchy_id;
    var file_path = arg1_file_path;
    var parent_group_id = arg2_parent_group_id;
    var options = (arg3_options) ? arg3_options : {};

    //Declare local instance variables
    var all_drives = getAllDrives();
    var container_selector = (options.hierarchy_selector) ?
      options.hierarchy_selector : `#${hierarchy_id}`;
    var container_el = document.querySelector(container_selector);

    //Populate initial folder
    try {
      var files = fs.readdirSync(file_path);
      var hierarchy_options = main.hierarchies[hierarchy_id];
      var render_items = [];

      //1. Display folders at top
      if (options.variable_key.split("\\").length > 1) {
        var back_group_id = generateRandomID();

        var back_group_data = addGroup(hierarchy_id, {
          id: back_group_id,
          name: ".."
        });
        var back_group_el = document.querySelector(`${container_selector} .group[data-id="${back_group_id}"]`);
        back_group_el.querySelector(`button.delete-button`).remove();

        back_group_data.path = "..";
      }

      //1.1. Display drives if options.variable_key is a length of 2 and options.variable_key[1] == ""
      if (options.variable_key.split("\\").length == 1) {
        for (var i = 0; i < all_drives.length; i++) {
          let local_drive = all_drives[i];
          let local_full_path = `${local_drive}\\`;
          let local_item_id = generateRandomID();

          let drive_data = addGroup(hierarchy_id, {
            id: local_item_id,
            name: local_drive
          });
          let drive_el = document.querySelector(`${container_selector} .group[data-id="${local_item_id}"]`);

          drive_el.setAttribute("data-drive", "true");
          drive_el.querySelector(`button.delete-button`).remove();
          drive_data.path = local_full_path;
        }
      }

      files.forEach(function (file) {
        try {
          var local_full_path = path.join(file_path, file);
          var local_stats = fs.statSync(local_full_path);

          var local_item_id = generateRandomID();

          if (local_stats.isDirectory()) {
            var group_data = addGroup(hierarchy_id, {
              id: local_item_id,
              name: file
            });
            group_data.path = local_full_path;

            //Remove button.delete_button if options.saves_explorer is true and directory is not a subpath of main.saves_folder
            if (options.saves_explorer)
              if (!group_data.path.includes(main.saves_folder) || main.saves_folder == group_data.path) {
                var folder_el = document.querySelector(`${container_selector} .group[data-id="${local_item_id}"]`);
                folder_el.querySelector(`button.delete-button`).remove();
              }
          }
        } catch (e) {}
      }.bind(options));
      //2. Display files at bottom
      files.forEach((file) => {
        try {
          var local_full_path = path.join(file_path, file);
          var local_stats = fs.statSync(local_full_path);

          var local_item_id = generateRandomID();

          if (!local_stats.isDirectory()) {
            var entity_data = addEntity(hierarchy_id, {
              id: local_item_id,
              name: file
            });

            //Remove button.delete_button if options.saves_explorer is true and directory is not a subpath of main.saves_folder
            if (options.saves_explorer) {
              var file_selector = `${container_selector} .entity[data-id="${local_item_id}"]`;

              var file_el = document.querySelector(file_selector);

              if (!local_full_path.includes(main.saves_folder)) {
                file_el.querySelector(`button.delete-button`).remove();
              } else {
                //Add 'Load' button if possible
                var delete_button_el = file_el.querySelector(`button.delete-button`);
                  delete_button_el.onclick = function (e) {
                    if (window.confirm(`Are you sure you wish to delete ${local_full_path}?`)) {
                      file_el.remove();
                      fs.unlink(local_full_path, (err) => { if (err) console.error(err); });
                    }
                  };
                var load_button_el = document.createElement("button");
                  load_button_el.innerText = "Load";
                  load_button_el.onclick = function (e) {
                    loadNaissanceSave(local_full_path);
                  };

                //Append 'Load' before 'Delete'
                appendBeforeSiblings(file_el.querySelector(`.interaction-container`), `.delete-button`, load_button_el);
              }
            }
          }
        } catch (e) {}
      });

      //3. Add event listeners
      //Add click listeners to folders
      var all_folder_els = container_el.querySelectorAll(".group");

      for (var i = 0; i < all_folder_els.length; i++) {
        let local_folder_el = all_folder_els[i];

        local_folder_el.onclick = function (e) {
          var local_file_name_el = local_folder_el.querySelector(".item-name");
          var local_file_path = `${options.variable_key}\\${local_file_name_el.innerText}`;
          var local_type = local_folder_el.getAttribute("class");

          if (!local_folder_el.getAttribute("data-drive")) {
            //Regular folder/file handler
            if (local_type.includes("group")) {
              if (!["\\..", ".."].includes(local_file_name_el.innerText)) {
                options.variable_key = local_file_path;

                clearHierarchy(hierarchy_id, { hierarchy_selector: container_selector });
                populateFolderExplorer(hierarchy_id, local_file_path, undefined, options);
              } else {
                //Go up a folder
                var split_local_file_path = options.variable_key.split("\\");
                split_local_file_path.pop();
                options.variable_key = split_local_file_path.join("\\");

                clearHierarchy(hierarchy_id, { hierarchy_selector: container_selector });
                populateFolderExplorer(hierarchy_id, local_file_path, undefined, options);
              }
            } else if (local_type.includes("entity")) {
              console.log("Clicked:", local_file_name_el.innerText);
            }
          } else {
            //Drive handler
            options.variable_key = `${local_file_name_el.innerText}`;

            clearHierarchy(hierarchy_id, { hierarchy_selector: container_selector });
            populateFolderExplorer(hierarchy_id, options.variable_key + "\\", undefined, options);
          }
        };
      }
    } catch (e) {
      console.error(e);
    }
  }
}
