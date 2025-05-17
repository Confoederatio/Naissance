//Initialise functions
{
  //Requires: html2canvas
  /*
    createContextMenu() - Creates a context menu within the DOM.

    arg0_options: (Object)
      anchor: (String/Element) - The query selector to pin a context menu to.
      class: (String) - The class prefix to prepend.
      close_function: (String) - The function to execute when the close button is clicked.
      do_not_add_close_button: (Boolean) - Whether to not add a close button to the input. False by default.
      do_not_append: (Boolean) - Whether to append or not.
      id: (String) - The ID of the context menu.
      is_resizable: (Boolean) - Whether to allow the context menu to be resized. True by default if is_window is true.
      is_window: (Boolean) - Whether to treat the context menu as a window. False by default.
      name: (String) - Optional. Title of the context menu. Undefined; will not display by default.
      maximum_height: (String) - Optional. The height after which a scrollbar should appear in CSS units.
      maximum_width: (String) - Optional. Maximum width in CSS units.

      <input_key>: (Object)
        type: (String) - The type of HTML input to grab.
          - biuf
          - rich_text/wysiwyg

          - basic_colour
          - button
          - checkbox
          - color/colour
          - context_menu
          - datalist
          - date
          - date_length
          - email
          - file
          - hierarchy
          - hidden
          - html
          - image
          - number
          - password
          - radio
          - range
          - reset
          - search_select
          - select
          - sortable_list
          - submit
          - tel/telephone
          - text
          - time
          - url/URL

        icon: (String) - Optional. The path to the display icon image.
        name: (String) - Optional. The HTML text of the button to display.
        onclick: (String) - Optional. The JS code to execute on button click.
        options: (Object) - For 'checkbox'/'search_select'/'select'/'sortable_list'/'radio'
          <option_key>: (String) - The datalist/select option ID to pass to the focus element.
        tooltip: (String) - Optional. The HTML tooltip a user can see by hovering over this input.

        height: (Number) - Optional. The row height of this element in a grid. 1 by default.
        width: (Number) - Optional. The column width of this element in a grid. 1 by default.

        x: (Number) - Optional. The X position of the element in a grid. 0 by default.
        y: (Number) - Optional. The Y position of the element in a grid. n + 1 by default, where n = last row.

        return_html: (Boolean) - Optional. Whether to return the html_string instead of modifying the anchor element. False by default.

    Returns: (HTMLElement)
  */
  function createContextMenu (arg0_options) { //[WIP] - Finish function body.
    //Convert from parameters
    var options = (arg0_options) ? arg0_options : {};

    //Initialise options
    if (!options.class) options.class = "";

    //Declare local instance variables
    var all_options = Object.keys(options);
    var context_menu_el = document.createElement("div");
    var default_keys = ["anchor", "class", "id", "maximum_height", "maximum_width"];
    var html_string = [];
    var query_selector_el;
    var table_columns = 0;
    var table_rows = 0;

    //Format CSS strings
    var height_string = (options.maximum_height) ? `height: ${options.maximum_height}; overflow-y: auto;` : "";
    var width_string = (options.maximum_width) ? `width: ${options.maximum_width}; overflow-x: hidden;` : "";

    var parent_style = `${height_string}${width_string}`;

    //Format html_string
    if (options.id) context_menu_el.id = options.id;
    context_menu_el.setAttribute("class", `${(options.class) ? options.class + " " : ""}context-menu`);
    if (parent_style.length > 0) context_menu_el.setAttribute("style", `${parent_style}`);

    //Add close button
    var do_not_add_close_button = (options.do_not_add_close_button);
    if (options.class)
      if (options.class.includes("unique"))
        do_not_add_close_button = true;

    if (!do_not_add_close_button)
      html_string.push(`<img id = "close-button" src = "./UF/gfx/close_icon_dark.png" class = "uf-close-button" draggable = "false" onclick = "${(options.close_function) ? options.close_function : "this.parentElement.remove();"}">`);

    //Fetch table_columns; table_rows
    for (var i = 0; i < all_options.length; i++) {
      var local_option = options[all_options[i]];

      //This is an input field; process .x, .y
      if (typeof local_option == "object") {
        if (local_option.x)
          table_columns = Math.max(table_columns, local_option.x);
        if (local_option.y) {
          table_rows = Math.max(table_rows, local_option.y);
        } else {
          table_rows++;
        }
      }
    }

    //Iterate over all_options; format them
    html_string.push(`<table>`);

    var current_row = 0;
    var table_rows = [];

    //1. Initialise table_rows
    for (var i = 0; i < all_options.length; i++) {
      var local_option = options[all_options[i]];

      if (typeof local_option == "object") {
        if (local_option.y != undefined) {
          current_row = local_option.y;
        } else {
          current_row++;
          local_option.y = current_row;
        }

        //Initialise table_rows[current_row]:
        table_rows[current_row] = [];
      }
    }

    //2. Populate table_rows
    for (var i = 0; i < all_options.length; i++) {
      var local_option = options[all_options[i]];

      if (typeof local_option == "object") {
        var local_el_html = [];
        var local_input_html = createInput(local_option);
        var local_row = table_rows[local_option.y];
        var local_x;

        if (local_input_html) {
          local_el_html.push(`<td${(local_option.width) ? ` colspan = "${local_option.width}"` : ""}${(local_option.height) ? ` rowspan = "${local_option.height}"` : ""}>`);
            local_el_html.push(local_input_html);
          local_el_html.push(`</td>`);

          if (local_option.x != undefined) {
            local_x = local_option.x;
          } else {
            local_x = local_row.length;
          }

          //Set local_row[local_x]
          local_row[local_x] = local_el_html.join("");
        } else {
          console.error(`Error when attempting to add UI element with options:`, local_option);
        }
      }
    }

    //3. Push table_rows to html_string
    for (var i = 0; i < table_rows.length; i++)
      if (table_rows[i]) {
        html_string.push(`<tr>${table_rows[i].join("")}</tr>`);
      } else {
        //Add a blank row if specified
        html_string.push(`<tr></tr>`);
      }

    //Close html_string
    html_string.push(`</table>`);
    context_menu_el.innerHTML = html_string.join("");
    handleContextMenu(context_menu_el, options);

    //Window handler
    {
      if (options.is_window) {
        var is_resizable = (options.is_resizable != false) ? true : false;

        //Invoke elementDragHandler()
        elementDragHandler(context_menu_el, { is_resizable: is_resizable });
      }
    }

    if (!options.return_html) {
      if (options.anchor) {
        query_selector_el = (isElement(options.anchor)) ? options.anchor : document.querySelector(options.anchor);

        if (!options.do_not_append) {
          query_selector_el.appendChild(context_menu_el);
        } else {
          query_selector_el.replaceChildren(context_menu_el);
        }
      }

      //Return statement
      return context_menu_el;
    } else {
      //Return statement
      return context_menu_el.innerHTML;
    }
  }

  /*
    createInput() - Returns a string representing the HTML input element.
    arg0_options: (Object)
      id: (String) - The ID to associate this input with.
      type: (String) - The input type to return the HTML of. 'biuf'/'rich_text'/'wysiwyg'/'button'/'checkbox'/'color'/'colour'/'datalist'/'date'/'date_length'/'email'/'file'/'hidden'/'hierarchy'/'html'/'image'/'number'/'password'/'radio'/'range'/'reset'/'search_select'/'select'/'submit'/'tel'/'text'/'time'/'url'

      icon: (String) - Optional. The path to the display icon image.
      name: (String) - Optional. The HTML string of the button to display.
      onclick: (String) - Optional. The onclick/confirm attribute of the button.
      onload: (String) - Optional. The onload attribute of the button.
      tooltip: (String) - Optional. The HTML tooltip a user can see by hovering over this input.

      attributes: - Optional.
        <attribute_name>: <value> - The attribute to pass to the focus element.
      options: - Optional. Used for checkbox/datalist/select/radio
        <option_id>: <value> - The datalist/select option ID to pass to the focus element.

      //Individual input type options.
      //'biuf'
        default: (String) - Optional. The default string to input as a placeholder value. 'Name' by default
      //'checkbox'
        default: (String) - Optional. The default ID to be checked. None by default.
      //'date'
        default_date: (Object) - The date to set defaults to if applicable.
      //'html'
        innerHTML: (String) - The HTML to append to this cell.
  */
  function createInput (arg0_options) {
    //Convert from parameters
    var options = (arg0_options) ? arg0_options : {};

    //Intiialise options
    if (!options.attributes) options.attributes = {};
    if (!options.options) options.options = {};
      if (!options.options.VALUE) {
        if (options.attributes.value)
          options.options.VALUE = options.attributes.value;
        if (options.placeholder)
          options.options.VALUE = options.placeholder;
      }
    if (options.name)
      options.name = `<span id = "name-label">${parseLocalisation(options.name, { is_html: true, scopes: options.options })}</span>`;

    //Declare local instance variables
    var html_string = [];

    //Format html_string
    html_string.push(`<div id = "${options.id}" class = "context-menu-cell" type = "${options.type}">`);

    //Input type handling
    if (options.type == "biuf") {
      if (options.name)
        html_string.push(`<div class = "header">${options.name}</div>`);

      //Create a contenteditable div with onchange handlers to strip formatting
      html_string.push(`<div id = "biuf-toolbar" class = "biuf-toolbar">`);
        //Onload handler
        html_string.push(`<img src = "" onerror = "initBIUFToolbar('${options.id}');">`);
        html_string.push(`<button id = "bold-button" class = "bold-icon">B</button>`);
        html_string.push(`<button id = "italic-button" class = "italic-icon">I</button>`);
        html_string.push(`<button id = "underline-button" class = "underline-icon">U</button>`);
        html_string.push(`<button id = "clear-button" class = "clear-icon">T</button>`);
      html_string.push(`</div>`);

      html_string.push(`<div id = "biuf-input" class = "biuf-input" contenteditable = "true" oninput = "handleBIUF(this);" ${objectToAttributes(options.options)}>`);
        html_string.push((options.default) ? options.default : "Name");
      html_string.push(`</div>`);
    } else if (["rich_text", "wysiwyg"].includes(options.type)) {
      //Div header
      if (options.name)
        html_string.push(`<div class = "header">${options.name}</div>`);

      html_string.push(`<div id = "wysiwyg-editor" class = "wysiwyg-editor">`);
        //Onload handler
        html_string.push(`<img src = "" onerror = "initWYSIWYG('${options.id}');">`);

        //Editor toolbar
        {
          html_string.push(`<div class = "toolbar">`);
            //FIRST LINE
            html_string.push(`<div class = "line">`);

            //First box: Bold, Italic, Underline, Strikethrough
            html_string.push(`<div class = "box">`);
              //Bold
              html_string.push(`<span class = "editor-button icon small" data-action = "bold" data-tag-name = "b" title = "Bold"><img src = "https://img.icons8.com/fluency-systems-filled/48/000000/bold.png"></span>`);
              //Italic
              html_string.push(`<span class = "editor-button icon small" data-action = "italic" data-tag-name = "i" title = "Italic"><img src = "https://img.icons8.com/fluency-systems-filled/48/000000/italic.png"></span>`);
              //Underline
              html_string.push(`<span class = "editor-button icon small" data-action = "underline" data-tag-name = "u" title = "Underline"><img src = "https://img.icons8.com/fluency-systems-filled/48/000000/underline.png"></span>`);
              //Strikethrough
              html_string.push(`<span class = "editor-button icon small" data-action = "strikeThrough" data-tag-name = "strike" title = "Strikethrough"><img src = "https://img.icons8.com/fluency-systems-filled/30/000000/strikethrough.png"></span>`);
            html_string.push(`</div>`);

            //Second box: Alignment, Lists, Indents, Hr
            html_string.push(`<div class = "box">`);
              html_string.push(`<span class = "editor-button icon has-submenu">`);
                //Menu icon
                html_string.push(`<img src = "https://img.icons8.com/fluency-systems-filled/48/000000/align-left.png">`);

                //1. Submenu
                html_string.push(`<div class = "submenu">`);
                  //Align left
                  html_string.push(`<span class = "editor-button icon" data-action = "justifyLeft" data-style = "textAlign:left" title = "Align Left"><img src = "https://img.icons8.com/fluency-systems-filled/48/000000/align-left.png"></span>`);
                  //Align centre
                  html_string.push(`<span class = "editor-button icon" data-action = "justifyCenter" data-style = "textAlign:center" title = "Align Centre"><img src = "https://img.icons8.com/fluency-systems-filled/48/000000/align-center.png"></span>`);
                  //Align right
                  html_string.push(`<span class = "editor-button icon" data-action = "justifyRight" data-style = "textAlign:right" title = "Align Right"><img src = "https://img.icons8.com/fluency-systems-filled/48/000000/align-right.png"></span>`);
                  //Align justify
                  html_string.push(`<span class = "editor-button icon" data-action = "formatBlock" data-style = "textAlign:justify" title = "Justify"><img src = "https://img.icons8.com/fluency-systems-filled/48/000000/align-justify.png"></span>`);
                html_string.push(`</div>`);
              html_string.push(`</span>`);

              //Insert ordered list
              html_string.push(`<span class = "editor-button icon" data-action = "insertOrderedList" data-tag-name = "ol" title = "Insert ordered list"><img src = "https://img.icons8.com/fluency-systems-filled/48/000000/numbered-list.png"></span>`);
              //Insert unordered list
              html_string.push(`<span class = "editor-button icon" data-action = "insertUnorderedList" data-tag-name = "ul" title = "Insert unordered list"><img src = "https://img.icons8.com/fluency-systems-filled/48/000000/bulleted-list.png"></span>`);
              //Indent
              html_string.push(`<span class = "editor-button icon" data-action = "indent" title = "Indent"><img src = "https://img.icons8.com/fluency-systems-filled/48/000000/indent.png"></span>`);
              //Outdent
              html_string.push(`<span class = "editor-button icon" data-action = "outdent" title = "Outdent" data-required-tag = "li"><img src = "https://img.icons8.com/fluency-systems-filled/48/000000/outdent.png"></span>`);
            html_string.push(`</div>`);

          html_string.push(`</div>`);

          //SECOND LINE
          html_string.push(`<div class = "line">`);

            //Third box: Undo, clear formatting
            html_string.push(`<div class = "box">`);
              //Undo
              html_string.push(`<span class = "editor-button icon small" data-action = "undo" title = "Undo"><img src = "https://img.icons8.com/fluency-systems-filled/48/000000/undo--v1.png"></span>`);
              //Remove formatting
              html_string.push(`<span class = "editor-button icon small" data-action = "removeFormat" title = "Remove format"><img src = "https://img.icons8.com/fluency-systems-filled/48/000000/remove-format.png"></span>`);
            html_string.push(`</div>`);

            //Fourth box: Add link, remove link
            html_string.push(`<div class = "box">`);
              //Insert Link
              html_string.push(`<span class = "editor-button icon small" data-action = "createLink" title = "Insert Link"><img src = "https://img.icons8.com/fluency-systems-filled/48/000000/add-link.png"></span>`);
              //Unlink
              html_string.push(`<span class = "editor-button icon small" data-action = "unlink" data-tag-name = "a" title = "Unlink"><img src = "https://img.icons8.com/fluency-systems-filled/48/000000/delete-link.png"></span>`);
            html_string.push(`</div>`);

            //Fifth box: Show HTML
            html_string.push(`<div class = "box">`);
              //Show HTML code
              html_string.push(`<span class = "editor-button icon" data-action = "toggle-view" title = "Show HTML Code"><img src = "https://img.icons8.com/fluency-systems-filled/48/000000/source-code.png"></span>`);
            html_string.push(`</div>`);
          html_string.push(`</div>`);
        html_string.push(`</div>`);
      }

        //Content area
        html_string.push(`<div class = "content-area">`);
          html_string.push(`<div class = "visual-view" contenteditable></div>`);
          html_string.push(`<textarea class = "html-view"></textarea>`);
        html_string.push(`</div>`);

        //Modal for hyperlinks
        html_string.push(`<div class = "modal">`);
          html_string.push(`<div class = "modal-bg"></div>`);
          html_string.push(`<div class = "modal-wrapper">`);
            html_string.push(`<div class = "close">✖</div>`);
            html_string.push(`<div class = "modal-content" id = "modal-create-link">`);
              html_string.push(`<h3>Insert Link</h3>`);
              html_string.push(`<input type = "text" id = "link-value" placeholder = "Link (example: https://google.com/)">`);
              html_string.push(`<div class = "row">`);
                html_string.push(`<input type = "checkbox" id = "new-tab"`);
                html_string.push(`<label for = "new-tab">Open in New Tab?</label>`);
              html_string.push(`</div>`);
              html_string.push(`<button class = "done">Done</button>`);
            html_string.push(`</div>`);
          html_string.push(`</div>`);
        html_string.push(`</div>`);
      html_string.push(`</div>`);
    } else if (options.type == "basic_colour") {
      html_string.push(`${(options.name) ? options.name : ""} <input type = "color" ${objectToAttributes(options.attributes)}>`);
    } else if (options.type == "button") {
      html_string.push(`<span class = "button">`);
        if (options.icon)
          html_string.push(`<img src = "${options.icon}">`);
        if (options.name)
          html_string.push(options.name);
      html_string.push(`</span>`);
    } else if (options.type == "checkbox") {
      delete options.options.VALUE;
      if (!options.options) {
        if (options.icon)
          html_string.push(`<img src = "${options.icon}">`);
        html_string.push(`<input type = "checkbox" ${objectToAttributes(options.attributes)}>`);

        if (options.name)
          html_string.push(`<span>${options.name}</span>`);
      } else {
        //Iterate over all options.options
        var all_suboptions = Object.keys(options.options);

        for (var i = 0; i < all_suboptions.length; i++) {
          var local_option = options.options[all_suboptions[i]];

          //Append checkbox
          var checked_string = "";
          if (all_suboptions[i] == options.default)
            checked_string = " checked";
          html_string.push(`<input id = "${all_suboptions[i]}" type = "checkbox" ${objectToAttributes(options.attributes)}${checked_string}>`);
          html_string.push(`<label for = "${all_suboptions[i]}">${local_option}</label><br>`);
        }
      }
    } else if (["color", "colour"].includes(options.type)) {
      if (options.name)
        html_string.push(`<div class = "header">${options.name}</div>`);

      //High-intensity - take a page from Naissance colour wheels
      html_string.push(`<div class = "colour-picker-container">`);
        //Colour picker HTML
        html_string.push(`<img id = "colour-picker-hue" class = "colour-picker-hue" src = "./UF/gfx/colour_wheel.png">`);
        html_string.push(`<div id = "colour-picker-brightness" class = "colour-picker-brightness"></div>`);

        html_string.push(`<div id = "colour-picker-cursor" class = "colour-picker-cursor"></div>`);
        html_string.push(`<div id = "colour-picker" class = "colour-picker-mask"></div>`);

        //RGB inputs
        html_string.push(`<div class = "rgb-inputs">`);
          html_string.push(`R: <input type = "number" id = "r" value = "255"><br>`);
          html_string.push(`G: <input type = "number" id = "g" value = "255"><br>`);
          html_string.push(`B: <input type = "number" id = "b" value = "255"><br>`);
        html_string.push(`</div>`);

        //No select
        html_string.push(`<span class = "no-select">`);
          html_string.push(`<span class = "brightness-range-container">`);
            html_string.push(`<input type = "range" min = "0" max = "100" value = "100" id = "colour-picker-brightness-range" class = "colour-picker-brightness-range">`);
            html_string.push(`<span id = "brightness-header" class = "small-header">BRT | 1</span>`);
          html_string.push(`</span>`);

          html_string.push(`<span class = "opacity-range-container">`);
            html_string.push(`<input type = "range" min = "0" max = "100" value = "50" id = "colour-picker-opacity-range" class = "colour-picker-opacity-range">`);
            html_string.push(`<span id = "opacity-header" class = "small-header">OPA | 0.5</span>`);
          html_string.push(`</span>`);
        html_string.push(`</span>`);
      html_string.push(`</div>`);
    } else if (options.type == "datalist") {
      delete options.options.VALUE;
      if (options.name)
        html_string.push(`<div class = "header">${options.name}</div>`);
      html_string.push(`<datalist class = "datalist">`);
        //Add .options to datalist
        var all_options = Object.keys(options.options);

        //Iterate over all_options
        for (var i = 0; i < all_options.length; i++) {
          var local_value = options.options[all_options[i]];

          //Push option to html_string
          html_string.push(`<option id = "${all_options[i]}" value = "${local_value}">`);
        }
      html_string.push(`</datalist>`);
    } else if (options.type == "date") {
      if (options.name)
        html_string.push(`<div class = "header">${options.name}</div>`);

      //High-intensity - create date framework first
      //Day/month/year container
      if (options.multiple_rows) html_string.push(`<div class = "row-one">`);
      html_string.push(`<input id = "day-input" class = "day-input" placeholder = "1st" size = "4">`);
      html_string.push(`<input id = "month-input" class = "month-input" list = "months" placeholder = "January">`);
      html_string.push(`
        <datalist id = "months" name = "month">
          <option value = "January">1</option>
          <option value = "February">2</option>
          <option value = "March">3</option>
          <option value = "April">4</option>
          <option value = "May">5</option>
          <option value = "June">6</option>
          <option value = "July">7</option>
          <option value = "August">8</option>
          <option value = "September">9</option>
          <option value = "October">10</option>
          <option value = "November">11</option>
          <option value = "December">12</option>
        </datalist>
      `);
      html_string.push(`<input id = "year-input" class = "year-input">`);
      html_string.push(`
        <select id = "year-type">
          <option value = "AD">AD</option>
          <option value = "BC">BC</option>
        </select>
      `);
      if (options.multiple_rows) html_string.push(`</div>`);
      //Hour-minute container
      if (options.multiple_rows) html_string.push(`<div class = "row-two">`);
      html_string.push(`
        <input id = "hour-input" value = "00" placeholder = "00" size = "2"> :
        <input id = "minute-input" value = "00" placeholder = "00" size = "2">
      `);
      if (options.multiple_rows) html_string.push(`</div>`);
    } else if (options.type == "date_length") {
      if (options.name)
        html_string.push(options.name);

      //Place date_length containers on separate lines for better readability
      html_string.push(`
        <div id = "date-container">
          <input id = "years-input" placeholder = "2000" value = "2000"></input>
          <input id = "months-input" placeholder = "January" value = "January"></input>
          <input id = "days-input" placeholder = "1st" value = "1st" size = "4"></input>
        </div>
        <div id = "clock-container">
          <input id = "hours-input" placeholder = "00" value = "00" size = "2"></input> :
          <input id = "minutes-input" placeholder = "00" value = "00" size = "2"></input>
        </div>
      `);
    } else if (options.type == "email") {
      if (options.name)
        html_string.push(options.name);
      html_string.push(`
        <input type = "email" id = "email-input" pattern = ".+@example\.com" size = "30" ${objectToAttributes(options.attributes)}>
      `);
    } else if (options.type == "file") {
      //High-intensity; file input [WIP]
    } else if (options.type == "html") {
      if (options.name)
        html_string.push(`<div class = "header">${options.name}</div>`);
      if (options.innerHTML)
        html_string.push(options.innerHTML);
    } else if (options.type == "image") {
      //High-intensity; image input [WIP]
    } else if (options.type == "number") {
      if (options.name)
        html_string.push(options.name);
      html_string.push(`<input type = "number" id = "number-input" ${objectToAttributes(options.attributes)}>`);
    } else if (options.type == "password") {
      if (options.name)
        html_string.push(options.name);
      html_string.push(`<input type = "password" id = "password-input" ${objectToAttributes(options.attributes)}>`);
    } else if (options.type == "radio") {
      delete options.options.VALUE;
      if (!options.options) {
        if (options.name)
          html_string.push(options.name);
        html_string.push(`<input type = "radio" id = "radio-input" ${objectToAttributes(options.attributes)}>`);
      } else {
        //Iterate over all options.options
        var all_suboptions = Object.keys(options.options);

        for (var i = 0; i < all_suboptions.length; i++) {
          var local_option = options.options[all_suboptions[i]];

          //Append radio
          var checked_string = "";
          if (all_suboptions[i] == options.default)
            checked_string = " checked";
          html_string.push(`<input type = "radio" id = "${all_suboptions[i]}" name = "radio-input" ${objectToAttributes(options.attributes)}${checked_string}>`);
          html_string.push(`<label for = "${all_suboptions[i]}">${local_option}</label>`);
        }
      }
    } else if (options.type == "range") {
      var actual_number_in_range = calculateNumberInRange([options.attributes.min, options.attributes.max], options.options.VALUE, options.value_equation);
      var name_string = (options.name) ? `${options.name} ` : "";

      html_string.push(`${name_string}<input type = "range" id = "range-input"${objectToAttributes(options.attributes)} value = "${actual_number_in_range}">`);
    } else if (options.type == "reset") {
      if (options.name)
        html_string.push(`<div class = "header">${options.name}</div>`);
      html_string.push(`<input type = "reset" id = "reset-button" value = "Reset">`);
    } else if (options.type == "search_select") {
      html_string.push(`<div class = "search-select-container" ${objectToAttributes(options.attributes)}>`);
        html_string.push(`<input type = "text" id = "search" placeholder = "${(options.name) ? options.name : "Search..."}" onkeyup = "handleSearchSelect(this.parentElement);">`);

        //Iterate over all options.options
        if (options.options) {
          var all_suboptions = Object.keys(options.options);

          for (var i = 0; i < all_suboptions.length; i++) {
            var local_option = options.options[all_suboptions[i]];

            html_string.push(`<a class = "search-select-item" data-value = "${all_suboptions[i]}">${local_option}</a>`);
          }
        }
      html_string.push(`</div>`);
    } else if (options.type == "sortable_list") {
      //Requires Sortable.js
      if (options.name)
        html_string.push(`<div class = "header">${options.name}</div>`);
      if (options.has_controls != false || options.disable_add == false)
        html_string.push(`<button id = "add-button">${(options.add_button_name) ? options.add_button_name : "Add Item"}</button>`);
      if (options.has_controls != false)
        if (options.other_header_buttons)
          html_string.push(`${options.other_header_buttons}`);

      html_string.push(`<ul class = "sortable-list" id = "${options.id}" ${objectToAttributes(options.attributes)}>`);  
      
      //Iterate over all options.options
      if (options.options) {
        var all_suboptions = Object.keys(options.options);

        for (var i = 0; i < all_suboptions.length; i++) {
          var local_option = options.options[all_suboptions[i]];

          var local_delete_button_name = (options.delete_button_name) ? options.delete_button_name : "Delete";
          var local_delete_button_string = (options.has_controls != false || options.disable_remove == false) ? 
            ` <button class = "delete-button">${local_delete_button_name}</button>` : "";

          //Push option to html_string
          html_string.push(`<li class = "sortable-list-item" data-value = "${all_suboptions[i]}"><span>${local_option}</span>${local_delete_button_string}</li>`);
        }
      }

      html_string.push(`</ul>`);
    } else if (options.type == "select") {
      if (options.name)
        html_string.push(`<div class = "header">${options.name}</div>`);
      //Similar to datalist
      html_string.push(`<select class = "select-menu" ${objectToAttributes(options.attributes)}>`);
        //Add .options to select
        var all_options = Object.keys(options.options);

        //Iterate over all_options
        for (var i = 0; i < all_options.length; i++) {
          var local_value = options.options[all_options[i]];

          //Push option to html_string
          html_string.push(`<option value = "${all_options[i]}">${local_value}</option>`);
        }
      html_string.push(`</select>`);
    } else if (options.type == "submit") {
      if (options.name)
        html_string.push(`<div class = "header">${options.name}</div>`);
      html_string.push(`<input type = "submit" value = "${(options.name) ? options.name : "Submit"}" ${objectToAttributes(options.attributes)}>`);
    } else if (["tel", "telephone"].includes(options.type)) {
      if (options.name)
        html_string.push(options.name);
      html_string.push(`${(options.name) ? options.name + " " : ""}<input type = "tel" id = "telephone-input" ${objectToAttributes(options.attributes)}>`);
    } else if (options.type == "text") {
      if (options.name)
        html_string.push(options.name);
      html_string.push(`<input type = "text" id = "text-input" ${objectToAttributes(options.attributes)}>`);
    } else if (options.type == "time") {
      if (options.name)
        html_string.push(options.name);
      html_string.push(`<input type = "time" id = "time-input" ${objectToAttributes(options.attributes)}>`);
    } else if (options.type == "url") {
      if (options.name)
        html_string.push(options.name);
      html_string.push(`<input type = "url" id = "url-input" placeholder = "http://example.com" ${objectToAttributes(options.attributes)}>`);
    }

    //Close html_string div
    html_string.push(`</div>`);

    //Return statement
    return html_string.join("");
  }

  /*
    createPageMenu() - Creates a page menu for a set of HTML elements.
    arg0_options: (Object)
      id: (String) - Optional. The ID of the page menu to use. Randomly generated by default.

      anchor: (String) - The query selector anchor in which the page menu is created. If options.tab_anchor is specified, this is just where page content is displayed instead.
      tab_anchor: (String) - Optional. Defaults to creating two elements in anchor if not available.

      default: (String) - Optional. The default context menu to apply to content and active tabs. The first key by default.
      pages: (Object)
        <page_key>: (Object) - createContextMenu() options is placed here.
          name: (String)
          html: (Array<String>/String) - Optional. Any custom HTML to load into the page instead of context menu options.
          <key>: (Variable) - Optional. The same as most context menus. Does not apply if local .html is true.
          special_function: (Function) - The function to execute upon clicking this tab.
      special_function: (Function) - The function to execute upon clicking any tab.

    Returns: (HTMLElement)
  */
  function createPageMenu (arg0_options) { //[WIP] - Implement options.default
    //Convert from parameters
    var options = (arg0_options) ? arg0_options : {};

    //Initialise options
    if (!options.pages) options.pages = {};

    //Declare local instance variables
    var all_pages = Object.keys(options.pages);
    var content_el;
    var tabs_el;

    //Initialise id; local interface
    if (!global.interfaces) global.interfaces = {};
    if (!options.id) options.id = generateRandomID(global.interfaces);
      if (!global.interfaces[options.id]) global.interfaces[options.id] = {};

    global.interfaces[options.id].page = (options.default) ? options.default : Object.keys(options.pages)[0];

    //Define content_el; tabs_el
    if (options.tab_anchor) {
      content_el = document.querySelector(options.anchor);
      tabs_el = document.querySelector(options.tab_anchor);
    } else {
      content_el = document.createElement("div");
      tabs_el = document.createElement("div");
    }

    //Set tabs_el.innerHTML according to page_key
    var tabs_html = [];

    //Set tabs_html to tabs_el.innerHTML
    tabs_html.push(`<div class = "tabs-container">`);
      for (var i = 0; i < all_pages.length; i++) {
        var local_value = options.pages[all_pages[i]];

        var local_page_name = (local_value.name) ? local_value.name : all_pages[i];
        tabs_html.push(`<span id = "${all_pages[i]}">${local_page_name}</span>`);
      }
    tabs_html.push(`<hr>`);
    tabs_html.push(`</div>`);
    tabs_el.innerHTML = tabs_html.join("");

    //Declare local helper function for switching pages
    function localSwitchPage (arg0_page, arg1_event) {
      //Convert from parameters
      var page = arg0_page;
      var e = (arg1_event) ? arg1_event : {};

      //Declare local instance variables
      var hr_el = tabs_el.querySelector("hr");
      var left_offset = 0.125; //In rem
      var local_tab_button_el = tabs_el.querySelector(`span[id="${page}"]`);
      var local_value = options.pages[page];

      //Initialise local_value options
      if (!local_value.anchor) local_value.anchor = content_el;

      //Parse .onclick handler
      if (options.special_function) options.special_function(e);
      if (local_value.special_function) local_value.special_function(e);

      //Remove 'active' class from all pages; and set the current tab to active in terms of highlighting
      for (var x = 0; x < all_pages.length; x++)
        removeClass(tabs_el.querySelector(`span[id="${all_pages[x]}"]`), "active");
      addClass(local_tab_button_el, "active");
      hr_el.style.left = `calc(${local_tab_button_el.offsetLeft - local_tab_button_el.parentElement.offsetLeft}px + ${left_offset}rem)`;

      //Set "page" attribute for content_el; replace content
      content_el.setAttribute("page", page);
      global.interfaces[options.id].page = page;

      if (!local_value.html) {
        if (!local_value.class) local_value.class = "unique";
        content_el.innerHTML = "";
        createContextMenu(local_value);
      } else {
        content_el.innerHTML = (Array.isArray(local_value.html)) ?
          local_value.html.join("") : local_value.html;
      }
    }

    //Add .onclick events for all_pages
    for (let i = 0; i < all_pages.length; i++) {
      let local_tab_button_el = tabs_el.querySelector(`span[id="${all_pages[i]}"]`);
      local_tab_button_el.onclick = function (e) {
        content_el.innerHTML = "";
        localSwitchPage(all_pages[i], e);
      };
    }

    //Parse options.default
    if (options.default) localSwitchPage(options.default);

    //Return statement
    return [tabs_el, content_el];
  }
}