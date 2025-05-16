//Initialise functions
{
  //addParagraphTag() - Adds a paragraph tag when enter key is pressed
  function addParagraphTag (arg0_e) {
    //Convert from parameters
    var e = arg0_e;

    //Check if keyCode was enter
    if (e.keyCode == "13") {
      //Guard clause; Don't add a p tag on list item
      if (window.getSelection().anchorNode.parentNode.tagName == "LI") return;

      //Otherwise, add a p tag
      document.execCommand("formatBlock", false, "p");
    }
  }

  //childOf() - Checks if passed child has passed parent
  function childOf (arg0_child_el, arg1_parent_el) {
    //Convert from parameters
    var child_el = arg0_child_el;
    var parent_el = arg1_parent_el;

    //Return statement
    return parent_el.contains(child_el);
  }

  function elementDragHandler (arg0_el, arg1_options) {
    //Convert from parameters
    var el = (typeof arg0_el == 'string') ? document.querySelector(arg0_el) : arg0_el;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var position_one = 0;
    var position_two = 0;
    var position_three = 0;
    var position_four = 0;
    var is_resizing = false;
    var resize_edge = null;
    var resize_threshold = 5; // pixels from edge to trigger resize
    var initial_width = 0;
    var initial_height = 0;
    var initial_left = 0;
    var initial_top = 0;

    //Add resize handle styles
    el.style.position = 'absolute';
    el.style.resize = 'none'; // disable default resize
    el.style.overflow = 'hidden';

    //Add resize functionality if enabled
    if (options.is_resizable) {
      el.classList.add('resizable');
      
      //Define handle positions and cursors
      var handle_config = {
        'n': { top: '0', left: '0', right: '0', height: resize_threshold + 'px' },
        'e': { top: '0', right: '0', bottom: '0', width: resize_threshold + 'px' },
        's': { bottom: '0', left: '0', right: '0', height: resize_threshold + 'px' },
        'w': { top: '0', left: '0', bottom: '0', width: resize_threshold + 'px' },
        'ne': { top: '0', right: '0', width: resize_threshold + 'px', height: resize_threshold + 'px' },
        'nw': { top: '0', left: '0', width: resize_threshold + 'px', height: resize_threshold + 'px' },
        'se': { bottom: '0', right: '0', width: resize_threshold + 'px', height: resize_threshold + 'px' },
        'sw': { bottom: '0', left: '0', width: resize_threshold + 'px', height: resize_threshold + 'px' }
      };

      //Add resize handles
      var handles = ['n', 'e', 's', 'w', 'ne', 'nw', 'se', 'sw'];
      for (var i = 0; i < handles.length; i++) {
        var edge = handles[i];
        var handle = document.createElement('div');
        handle.className = 'resize-handle resize-' + edge;
        handle.style.position = 'absolute';
        handle.style.zIndex = '1000';
        
        //Apply handle configuration
        var config = handle_config[edge];
        for (var prop in config) {
          handle.style[prop] = config[prop];
        }
        
        el.appendChild(handle);
        handle.onmousedown = function(e) {
          e.stopPropagation();
          is_resizing = true;
          resize_edge = edge;
          
          //Store initial dimensions
          var rect = el.getBoundingClientRect();
          initial_width = rect.width;
          initial_height = rect.height;
          initial_left = rect.left;
          initial_top = rect.top;
          
          internalMouseDownHandler(e);
        };
      }
    }

    //Header drag handler
    if (el.querySelector('.header')) {
      el.querySelector('.header').onmousedown = internalMouseDownHandler;
    } else {
      el.onmousedown = internalMouseDownHandler;
    }

    //Declare local internal helper functions
    function internalCloseDragElement (e) {
      //Declare local instance variables
      var e = (e || window.event);

      //Stop moving when mouse button is released
      document.onmouseup = null;
      document.onmousemove = null;
      is_resizing = false;
      resize_edge = null;
    }

    function internalElementDrag (e) {
      //Declare local instance variables
      var e = (e || window.event);

      e.preventDefault();
      
      if (is_resizing && options.is_resizable) {
        var delta_x = e.clientX - position_three;
        var delta_y = e.clientY - position_four;
        
        //Define resize operations
        var resize_ops = {
          'e': function() { 
            el.style.width = Math.max(50, initial_width + delta_x) + 'px';
          },
          'w': function() { 
            var new_width = Math.max(50, initial_width - delta_x);
            el.style.width = new_width + 'px';
            el.style.left = (initial_left + (initial_width - new_width)) + 'px';
          },
          's': function() { 
            el.style.height = Math.max(50, initial_height + delta_y) + 'px';
          },
          'n': function() {
            var new_height = Math.max(50, initial_height - delta_y);
            el.style.height = new_height + 'px';
            el.style.top = (initial_top + (initial_height - new_height)) + 'px';
          },
          'se': function() {
            el.style.width = Math.max(50, initial_width + delta_x) + 'px';
            el.style.height = Math.max(50, initial_height + delta_y) + 'px';
          },
          'sw': function() {
            var new_width = Math.max(50, initial_width - delta_x);
            el.style.width = new_width + 'px';
            el.style.left = (initial_left + (initial_width - new_width)) + 'px';
            el.style.height = Math.max(50, initial_height + delta_y) + 'px';
          },
          'ne': function() {
            el.style.width = Math.max(50, initial_width + delta_x) + 'px';
            var new_height = Math.max(50, initial_height - delta_y);
            el.style.height = new_height + 'px';
            el.style.top = (initial_top + (initial_height - new_height)) + 'px';
          },
          'nw': function() {
            var new_width = Math.max(50, initial_width - delta_x);
            var new_height = Math.max(50, initial_height - delta_y);
            el.style.width = new_width + 'px';
            el.style.left = (initial_left + (initial_width - new_width)) + 'px';
            el.style.height = new_height + 'px';
            el.style.top = (initial_top + (initial_height - new_height)) + 'px';
          }
        };

        //Execute resize operation
        if (resize_ops[resize_edge]) {
          resize_ops[resize_edge]();
        }
      } else {
        position_one = position_three - e.clientX;
        position_two = position_four - e.clientY;
        position_three = e.clientX;
        position_four = e.clientY;

        //Set element position
        el.style.top = (el.offsetTop - position_two) + 'px';
        el.style.left = (el.offsetLeft - position_one) + 'px';
      }
    }

    function internalMouseDownHandler (e) {
      //Declare local instance variables
      var e = (e || window.event);
      
      e.preventDefault();
      position_three = e.clientX;
      position_four = e.clientY;

      document.onmouseup = internalCloseDragElement;
      document.onmousemove = internalElementDrag;
    }
  }

  function execCodeAction (arg0_button_el, arg1_editor_el, arg2_visual_view_el, arg3_html_view_el) {
    //Convert from parameters
    var button_el = arg0_button_el;
    var editor_el = arg1_editor_el;
    var visual_view = arg2_visual_view_el;
    var html_view = arg3_html_view_el;

    //Toggle visual/HTML view depending on current state
    if (button_el.classList.contains("active")) { //Show visual view
      visual_view.innerHTML = html_view.innerHTML = html_view.value;
      html_view.style.display = "none";
      visual_view.style.display = "block";

      button_el.classList.remove("active");
    } else { //Show HTML view
      html_view.innerText = visual_view.innerHTML;
      visual_view.style.display = "none";
      html_view.style.display = "block";

      button_el.classList.add("active");
    }
  }

  function execDefaultAction (arg0_action) {
    //Convert from parameters
    var action = arg0_action;

    //Invoke execCommand
    document.execCommand(action, false);
  }

  function execLinkAction (arg0_modal_el) {
    //Convert from parameters
    var modal = arg0_modal_el;

    //Declare local instance variables
    var close = modal.querySelectorAll(".close")[0];
    var selection = saveSelection();
    var submit = modal.querySelectorAll("button.done")[0];

    //Set modal to visible
    modal.style.display = "block";

    //Add link once done button is active
    submit.addEventListener("click", function (e) {
      e.preventDefault();

      var new_tab_checkbox = modal.querySelectorAll(`#new-tab`)[0];
      var link_input = modal.querySelectorAll(`#link-value`)[0];
      var link_value = link_input.value;
      var new_tab = new_tab_checkbox.checked;

      //Restore selection
      restoreSelection(selection);

      //Handle selection
      if (window.getSelection().toString()) {
        var local_a = document.createElement("a");

        local_a.href = link_value;
        if (new_tab)
          local_a.target = "_blank";
        window.getSelection().getRangeAt(0).surroundContents(local_a);
      }

      //Hide modal, deregister modal events
      modal.style.display = "none";
      link_input.value = "";

      submit.removeEventListener("click", arguments.callee);
      close.removeEventListener("click", arguments.callee);
    });

    //Close modal on close button click
    close.addEventListener("click", function (e) {
      e.preventDefault();

      var link_input = modal.querySelectorAll("#link-value")[0];

      //Hide modal, deregister modal events
      modal.style.display = "none";
      link_input.value = "";

      submit.removeEventListener("click", arguments.callee);
      close.removeEventListener("click", arguments.callee);
    });
  }

  function handleBIUF (arg0_e) {
    //Convert from parameters
    var biuf_el = arg0_e;

    //Declare local instance variables
    var child = biuf_el.firstChild;

    //Declare while loop, break when next sibling element can no longer be found.
    while (child) {
      var remove_node = null;

      //Check if child is not of <b><i><u> tags.
      if (child.tagName && (!["b", "i", "u"].includes(child.tagName.toLowerCase())))
        remove_node = child;
      child = child.nextSibling;

      //Remove node if flag is true
      if (remove_node)
        remove_node.parentNode.removeChild(remove_node);
    }
  }

  function handleColourWheel (arg0_parent_selector) {
    //Convert from parameters
    var parent_selector = arg0_parent_selector;

    //Declare local instance variables
    var parent_el = (typeof parent_selector == "string") ? document.querySelector(parent_selector) : parent_selector;

    var brightness_el = parent_el.querySelector(`#colour-picker-brightness-range`);
    var colour_brightness_el = parent_el.querySelector(`#colour-picker-brightness`);
    var colour_cursor_el = parent_el.querySelector(`#colour-picker-cursor`);
    var colour_wheel_el = parent_el.querySelector(`#colour-picker`);
    var opacity_el = parent_el.querySelector(`#colour-picker-opacity-range`);

    var b_el = parent_el.querySelector(`#b`);
    var g_el = parent_el.querySelector(`#g`);
    var r_el = parent_el.querySelector(`#r`);

    //Calculate rem_px
    var root_font_size = window.getComputedStyle(document.documentElement).fontSize;
    var rem_px = parseFloat(root_font_size.replace("px", ""));

    //colour_wheel_el onclick handler
    colour_wheel_el.onclick = function (e) {
      var bounding_rect = e.target.getBoundingClientRect();
      var coord_x = e.clientX - bounding_rect.left;
      var coord_y = e.clientY - bounding_rect.top;
      console.log(e);

      colour_cursor_el.style.left = `calc(${coord_x}px - 6px)`;
      colour_cursor_el.style.top = `calc(${coord_y}px - 6px)`;

      //Apply post-rem offset
      coord_y += rem_px*1;
      coord_x += rem_px*1;

      //Get r,g,b value of pixel
      removeErrorHandlers(); //Remove error handlers; restore later
      var temp_parent_el = parent_el.cloneNode(true);
      document.body.appendChild(temp_parent_el); //Temporarily append child to body for reading; restore later

      temp_parent_el.querySelector(`#colour-picker-cursor`).remove(); //Remove cursor from interference
      html2canvas(temp_parent_el, { logging: true }).then((canvas) => {
        var ctx = canvas.getContext("2d");

        var canvas_height = ctx.canvas.height;
        var canvas_width = ctx.canvas.width;
        var pixel = ctx.getImageData(coord_x, coord_y, 1, 1).data;

        //Set colour wheel CSS, interaction
        colour_cursor_el.style.background = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
        r_el.value = pixel[0];
        g_el.value = pixel[1];
        b_el.value = pixel[2];
        restoreErrorHandlers();

        //'onchange' handler
        (typeof parent_el.onchange == "string") ? 
          eval(parent_el.onchange) : parent_el.onchange([pixel[0], pixel[1], pixel[2]]);
      });
      temp_parent_el.remove();
    };

    //Range change listeners
    onRangeChange(brightness_el, function (e) {
      var brightness_value = parseInt(brightness_el.value);

      //Set brightness opacity
      colour_brightness_el.style.opacity = `${1 - brightness_value*0.01}`;
      updateBrightnessOpacityHeaders(parent_el);
    });
    onRangeChange(opacity_el, function (e) {
      if (e.onclick) {
        var local_expression = e.onclick;
        var local_result = new Function(local_expression)(e);
      }

      //Set brightness opacity
      updateBrightnessOpacityHeaders(parent_el);
    });

    //RGB listeners
    r_el.onchange = function () {
      this.value = Math.max(Math.min(this.value, 255), 0);
      setColourWheelCursor(parent_el, [r_el.value, g_el.value, b_el.value]);
    };
    g_el.onchange = function () {
      this.value = Math.max(Math.min(this.value, 255), 0);
      setColourWheelCursor(parent_el, [r_el.value, g_el.value, b_el.value]);
    };
    b_el.onchange = function () {
      this.value = Math.max(Math.min(this.value, 255), 0);
      setColourWheelCursor(parent_el, [r_el.value, g_el.value, b_el.value]);
    };
  }

  function handleSearchSelect (arg0_parent_el) {
    //Convert from parameters
    var parent_el = arg0_parent_el;

    //Declare local instance variables
    var all_a_els = parent_el.querySelectorAll(`a`);
    var input_el = parent_el.querySelector(`#search`);
    
    var filter = input_el.value.toLowerCase();

    //Iterate over all_a_els
    for (var i = 0; i < all_a_els.length; i++) {
      var text_value = all_a_els[i].textContent || all_a_els[i].innerText;

      if (text_value.toLowerCase().indexOf(filter) > -1) {
        all_a_els[i].style.display = "";
      } else {
        all_a_els[i].style.display = "none";
      }
    }
  }

  /*
    handleContextMenu() - Provides the interaction handler for context menus.
    arg0_context_menu_el: (HTMLElement) - The context menu HTML element.
    arg1_options: (Object) - Optional. Same as the originaal context menu options.
  */
  function handleContextMenu (arg0_context_menu_el, arg1_options) {
    //Convert from parameters
    var context_menu_el = arg0_context_menu_el;
    var options = (arg1_options) ? arg1_options : {};

    //Declare local instance variables
    var all_inputs = context_menu_el.querySelectorAll(".context-menu-cell");

    //1. General input handling
    for (let i = 0; i < all_inputs.length; i++) {
      let local_id = all_inputs[i].getAttribute("id");
      let local_input_obj = options[local_id];
      let local_type = all_inputs[i].getAttribute("type");

      if (local_type == "colour")
        handleColourWheel(all_inputs[i]);

      //Default type population (i.e. for 'sortable_list')
      if (local_type == "search_select") {
        all_inputs[i].querySelector(`#search`).addEventListener("click", function (e) {
          all_inputs[i].classList.toggle("shown");
        });

        //Iterate over all_a_els
        var all_a_els = all_inputs[i].querySelectorAll(`a`);

        for (let x = 0; x < all_a_els.length; x++) {
          all_a_els[x].addEventListener("click", function (e) {
            all_inputs[i].classList.toggle("selected");
            all_inputs[i].setAttribute("data-selected", all_a_els[x].getAttribute("data-value"));

            if (local_input_obj.onchange)
              local_input_obj.onchange(e);
            if (local_input_obj.onclick)
              local_input_obj.onclick(e);
          });
        }
      } if (local_type == "sortable_list") {
        Sortable.create(all_inputs[i].querySelector(".sortable-list"), {
          animation: 150,
          onEnd: function (e) {
            if (local_input_obj.onchange)
              local_input_obj.onchange(all_inputs[i]);
            if (local_input_obj.onclick)
              local_input_obj.onclick(e);
          },
          multiDrag: true,
          selectedClass: "selected"
        });

        all_inputs[i].querySelector("#add-button").addEventListener("click", function (e) {
          var local_delete_button_name = (local_input_obj.delete_button_name) ? 
            local_input_obj.delete_button_name : "Delete";
          var local_delete_button_string = (local_input_obj.has_controls != false || local_input_obj.disable_remove == false) ? 
            ` <button class = "delete-button">${local_delete_button_name}</button>` : "";

          //Push option to html_string
          var new_li_el = document.createElement("li");
            new_li_el.classList.add("sortable-list-item");
            new_li_el.setAttribute("data-value", generateRandomID());
            new_li_el.innerHTML = `<span>New Item</span>${local_delete_button_string}`;

          all_inputs[i].querySelector(".sortable-list").appendChild(new_li_el);

          var local_delete_button_el = new_li_el.querySelector(".delete-button");
          if (local_delete_button_el)
            local_delete_button_el.addEventListener("click", function (e) {
              if (local_input_obj.onchange)
                local_input_obj.onchange(all_inputs[i]);
              if (local_input_obj.onremove)
                local_input_obj.onremove(new_li_el);
              new_li_el.remove();
            });

          if (local_input_obj.onchange)
            local_input_obj.onchange(all_inputs[i]);
          if (local_input_obj.onadd)
            local_input_obj.onadd(new_li_el);
        });

        //Iterate over all_li_els; add .delete-button functionality
        var all_li_els = all_inputs[i].querySelectorAll(".sortable-list-item");

        for (let x = 0; x < all_li_els.length; x++) {
          let local_li_el = all_li_els[x];

          let local_delete_button_el = local_li_el.querySelector(".delete-button");

          if (local_delete_button_el)
            local_delete_button_el.addEventListener("click", function (e) {
              if (local_input_obj.onchange)
                local_input_obj.onchange(all_inputs[i]);
              if (local_input_obj.onremove)
                local_input_obj.onremove(local_li_el);
              local_li_el.remove();
            });
        }
      }

      //Custom interaction handling
      if (local_input_obj) {
        //.onclick handling
        if (local_input_obj.onclick)
          if (local_type == "button") {
            if (local_input_obj.onclick)
              if (typeof local_input_obj.onclick == "string") {
                all_inputs[i].setAttribute("onclick", local_input_obj.onclick);
              } else {
                all_inputs[i].onclick = function (e) { local_input_obj.onclick(e); };
              }
          } else if (local_type == "basic_colour") {
            all_inputs[i].onchange = local_input_obj.onclick;
          } else if (local_type == "colour") {
            all_inputs[i].onchange = local_input_obj.onclick;
          } else if (local_type == "number") {
            if (local_input_obj.onclick)
              if (typeof local_input_obj.onclick == "string") {
                all_inputs[i].setAttribute("onchange", local_input_obj.onclick);
              } else {
                all_inputs[i].onchange = function (e) {
                  console.log(local_input_obj);
                  local_input_obj.onclick(e);
                };
              }
          } else if (local_type == "range") {
            if (local_input_obj.onclick)
              all_inputs[i].onchange = local_input_obj.onclick;
          } else if (local_type == "select") {
            if (local_input_obj.onclick)
              all_inputs[i].onchange = local_input_obj.onclick;
          } else if (local_type == "text") {
            if (local_input_obj.onclick)
              if (typeof local_input_obj.onclick == "string") {
                all_inputs[i].setAttribute("onchange", local_input_obj.onclick);
              } else {
                all_inputs[i].onchange = function (e) {
                  local_input_obj.onclick(e);
                  console.log(e);
                };
              }
          }
        
        if (local_input_obj.onload)
          local_input_obj.onload(all_inputs[i]);
      }
    }
  }

  function initBIUFToolbar (arg0_parent_el_id) {
    //Convert from parameters
    var biuf_element_id = arg0_parent_el_id;

    //Declare local instance variables
    var biuf_el = document.querySelector(`div#${biuf_element_id} #biuf-input`);
    var toolbar_el = document.querySelector(`div#${biuf_element_id} #biuf-toolbar`);

    //Declare element references
    var bold_button = toolbar_el.querySelector("#bold-button");
    var clear_button = toolbar_el.querySelector("#clear-button");
    var italic_button = toolbar_el.querySelector("#italic-button");
    var underline_button = toolbar_el.querySelector("#underline-button");

    //Show toolbar when text is selected
    document.addEventListener("mouseup", function () {
      var selection = window.getSelection();

      if (selection.toString() != "" && document.querySelector(`div#${biuf_element_id} #biuf-input:focus`)) {
        var range = selection.getRangeAt(0);
        var rect = range.getBoundingClientRect();

        toolbar_el.style.display = "block";
        toolbar_el.style.top = rect.top - toolbar_el.offsetHeight + "px";
        toolbar_el.style.left = rect.left + "px";
      } else {
        toolbar_el.style.display = "none";
      }
    });

    //Apply formatting when various toolbar buttons are clicked
    bold_button.addEventListener("click", function () {
      document.execCommand("bold");
    });
    clear_button.addEventListener("click", function () {
      document.execCommand("removeFormat");
    });
    italic_button.addEventListener("click", function () {
      document.execCommand("italic");
    });
    underline_button.addEventListener("click", function () {
      document.execCommand("underline");
    });
  }

  function initWYSIWYG (arg0_parent_el_id) {
    //Convert from parameters
    var wysiwyg_parent_id = arg0_parent_el_id;

    //Declare local instance variables
    var editor = document.querySelector(`#${wysiwyg_parent_id} .wysiwyg-editor`);
    var modal = editor.getElementsByClassName("modal")[0];
    var toolbar = editor.getElementsByClassName("toolbar")[0];

    var buttons = toolbar.querySelectorAll(`.editor-button:not(.has-submenu)`);
    var content_area = editor.getElementsByClassName("content-area")[0];
    var visual_view = content_area.getElementsByClassName(`visual-view`)[0];

    var html_view = content_area.getElementsByClassName(`html-view`)[0];

    //Add active tag event
    document.addEventListener("selectionchange", function (e) {
      selectionChange(e, buttons, editor);
    });

    //Add paste event
    visual_view.addEventListener("paste", pasteEvent);

    //Add paragraph tag on newline
    content_area.addEventListener("keypress", addParagraphTag);

    //Add toolbar button actions
    for (var i = 0; i < buttons.length; i++) {
      var local_button = buttons[i];

      local_button.addEventListener("click", function (e) {
        var action = this.dataset.action;

        //execCommand handler
        switch (action) {
          case "toggle-view":
            execCodeAction(this, editor, visual_view, html_view);
            break;
          case "createLink":
            execLinkAction(modal);
            break;
          default:
            execDefaultAction(action);
        }
      });
    }
  }

  function parentTagActive (arg0_el) {
    //Convert from parameters
    var element = arg0_el;

    //Guard clause for visual view
    if (!element || !element.classList || element.classList.contains("visual-view"))
      return false;

    //Declare local instance variables
    var tag_name = element.tagName.toLowerCase();
    var text_align = element.style.textAlign;
    var toolbar_button;

    //Active by tag name
    toolbar_button = document.querySelectorAll(`.toolbar .editor-button[data-tag-name="${tag_name}"]`)[0];

    //Active by text-align
    toolbar_button = document.querySelectorAll(`.toolbar .editor-button[data-style="textAlign:${text_align}"]`)[0];

    //Set toolbar_button to being active if toolbar_button is defined
    if (toolbar_button)
      toolbar_button.classList.add("active");

    //Return statement
    return parentTagActive(element.parentNode);
  }

  //pasteEvent() - Handles paste event by removing all HTML tags
  function pasteEvent (arg0_e) {
    //Convert from parameters
    var e = arg0_e;

    //Declare local instance variables
    var text = (e.originalEvent || e).clipboardData.getData("text/plain");

    e.preventDefault();
    document.execCommand("insertHTML", false, text);
  }

  function restoreSelection (arg0_saved_selection) {
    //Convert from parameters
    var saved_selection = arg0_saved_selection;

    //Restore selection
    if (saved_selection)
      if (window.getSelection) {
        selection = window.getSelection();
        selection.removeAllRanges();

        //Populate selection ranges
        for (var i = 0, length = saved_selection.length; i < length; i++)
          selection.addRange(saved_selection[i]);
      } else if (document.selection && saved_selection.select) {
        saved_selection.select();
      }
  }

  function saveSelection () {
    if (window.getSelection) {
      var selection = window.getSelection();

      if (selection.getRangeAt && selection.rangeCount) {
        var ranges = [];

        //Iterate over selection.rangeCount to populate ranges
        for (var i = 0, length = selection.rangeCount; i < length; i++)
          ranges.push(selection.getRangeAt(i));

        //Return statement
        return ranges;
      }
    } else if (document.selection && document.selection.createRange) {
      //Return statement
      return document.selection.createRange();
    }
  }

  function selectionChange (arg0_e, arg1_buttons, arg2_editor) {
    //Convert from parameters
    var e = arg0_e;
    var buttons = arg1_buttons;
    var editor = arg2_editor;

    //Declare local instance variables
    for (var i = 0; i < buttons.length; i++) {
      var local_button = buttons[i];

      //Don't remove active class on code toggle button
      if (local_button.dataset.action == "toggle-view") continue;

      local_button.classList.remove("active");
    }

    if (!childOf(window.getSelection().anchorNode.parentNode, editor))
      //Return statement; guard clause
      return false;

    parentTagActive(window.getSelection().anchorNode.parentNode);
  }

  function setColourWheelCursor (arg0_parent_selector, arg1_colour, arg2_do_not_change) {
    //Convert from parameters
    var parent_selector = arg0_parent_selector;
    var colour = arg1_colour;
    var do_not_change = arg2_do_not_change;

    //Declare local instance variables
    var parent_el = (typeof parent_selector == "string") ? document.querySelector(parent_selector) : parent_selector;

    var brightness_el = parent_el.querySelector(`#colour-picker-brightness-range`);
    var colour_brightness_el = parent_el.querySelector(`#colour-picker-brightness`);
    var colour_cursor_el = parent_el.querySelector(`#colour-picker-cursor`);
    var colour_picker_el = parent_el.querySelector(`.colour-picker-container`);
    var colour_picker_hue_el = parent_el.querySelector(`.colour-picker-hue`);
    var has_colour = false;
    var max_brightness = 255;

    //Check if colour is defined
    if (colour)
      if (Array.isArray(colour))
        if (colour.length >= 3) {
          //Get closest r, g, b value in colour wheel and teleport cursor there
          has_colour = true;
          colour_cursor_el.style.visibility = "hidden";

          //Adjust brightness_el to new maximum brightness
          max_brightness = Math.max(Math.max(colour[0], colour[1]), colour[2])/255;

          brightness_el.value = max_brightness*100;
          colour_brightness_el.style.opacity = `${1 - max_brightness}`;

          //Set r, g, b colour fields
          parent_el.querySelector(`.rgb-inputs #r`).value = colour[0];
          parent_el.querySelector(`.rgb-inputs #g`).value = colour[1];
          parent_el.querySelector(`.rgb-inputs #b`).value = colour[2];

          //Move colour_cursor_el
          removeErrorHandlers();
          var temp_parent_el = colour_picker_el.cloneNode(true);
          document.body.appendChild(temp_parent_el); //Temporarily append child to body for reading; restore later

          temp_parent_el.querySelector(`#colour-picker-cursor`).remove(); //Remove cursor from interference
          html2canvas(temp_parent_el, { logging: false }).then((canvas) => {
            var ctx = canvas.getContext("2d");

            var canvas_height = ctx.canvas.height;
            var canvas_width = ctx.canvas.width;
            var circle_radius = canvas_width/2;
            var image_data = ctx.getImageData(0, 0, canvas_width, canvas_height).data;

            //Iterate over all image_data; each pixel has 4 elements
            var closest_pixel = [10000000, 0, 0]; //[colour_distance, x, y];

            //Iterate over image_data array
            for (var i = 0; i < image_data.length; i += 4) {
              var local_colour = [image_data[i], image_data[i + 1], image_data[i + 2]];

              if (local_colour.join(", ") != "255, 255, 255") {
                var distance_from_colour = deltaE(colour, local_colour);

                if (distance_from_colour < closest_pixel[0]) {
                  //Calculate local_x, local_y
                  var local_x = (i/4) % canvas_width;
                  var local_y = Math.floor((i/4)/canvas_width);

                  closest_pixel = [distance_from_colour, local_x, local_y, i];
                }
              }
            }

            //Set cursor colour
            colour_cursor_el.style.background = `rgb(${colour[0]}, ${colour[1]}, ${colour[2]})`;

            //Check if closest_pixel[1], closest_pixel[2] are inside circle
            if (
              pointIsInCircle(0, 0, closest_pixel[1], closest_pixel[2], circle_radius)
            ) {
              colour_cursor_el.style.left = `calc(${closest_pixel[1]}px - 6px*2)`;
              colour_cursor_el.style.top = `calc(${closest_pixel[2]}px - 6px)`;
            } else {
              //If not, use closest point to edge of circle instead
              var bounding_rect = colour_picker_hue_el.getBoundingClientRect();
              var cursor_coords = closestPointInCircle(0, 0, closest_pixel[1], closest_pixel[2], circle_radius);

              var actual_x = (cursor_coords[0])*(bounding_rect.width/canvas_width);
              var actual_y = (cursor_coords[1])*(bounding_rect.height/canvas_height);

              colour_cursor_el.style.left = `calc(${actual_x}px - 6px)`;
              colour_cursor_el.style.top = `calc(${actual_y}px - 6px - 1rem)`;
            }

            colour_cursor_el.style.visibility = "visible";
            restoreErrorHandlers();
          });
          temp_parent_el.remove();

          //'onchange' handler
          if (Array.isArray(colour)) {
            colour[0] = parseInt(colour[0]);
            colour[1] = parseInt(colour[1]);
            colour[2] = parseInt(colour[2]);

            (typeof parent_el.onchange == "string") ? 
              eval(parent_el.onchange) : parent_el.onchange(colour);
          }
        }

    //If no colour is defined, set cursor to the dead middle of the colour picker
    if (!has_colour)
      colour_cursor_el.style.top = `calc(${colour_picker_el.offsetHeight/3}px - 6px)`;
  }

  function updateBrightnessOpacityHeaders (arg0_parent_selector) {
    //Convert from parameters
    var parent_selector = arg0_parent_selector;

    //Declare local instance variables
    var parent_el = (typeof parent_selector == "string") ? document.querySelector(parent_selector) : parent_selector;

    var brightness_el = parent_el.querySelector(`#colour-picker-brightness-range`);
    var brightness_header_el = parent_el.querySelector(`#brightness-header`);
    var opacity_el = parent_el.querySelector(`#colour-picker-opacity-range`);
    var opacity_header_el = parent_el.querySelector(`#opacity-header`);

    var brightness_value = parseInt(brightness_el.value);
    var opacity_value = parseInt(opacity_el.value);

    //Update values
    if (brightness_header_el)
      brightness_header_el.innerHTML = `BRT | ${brightness_value/100}`;
    if (opacity_header_el)
      opacity_header_el.innerHTML = `OPA | ${opacity_value/100}`;
  }
}