//Initialise functions
{
  /*
    addClass() - Adds a class to a given element.
    arg0_element: (HTMLElement) - The element to add a class to.
    arg1_class_name: (String) - The class to add. No space added by default.

    Returns: (String)
  */
  function addClass (arg0_element, arg1_class_name) {
    //Convert from parameters
    var element = arg0_element;
    var class_name = arg1_class_name;

    //Declare local instance variables
    var element_class = element.getAttribute("class");

    if (element_class)
      if (!element_class.includes(class_name))
        element.setAttribute("class", `${element_class}${class_name}`);

    //Return statement
    return element.getAttribute("class");
  }

  /*
    addClasses() - Adds a list of classes to an element.
    arg0_element: (HTMLElement) - The HTML element to pass.
    arg1_class_array: (Array<String>/String) - The array of classes to add.

    Returns: (String)
  */
  function addClasses (arg0_element, arg1_class_array) {
    //Convert from parameters
    var element = arg0_element;
    var class_array = getList(arg1_class_array);

    //Declare local instance variables
    for (var i = 0; i < class_array.length; i++)
      addClass(element, class_array[i]);

    //Return statement
    return element.getAttribute("class");
  }

  /*
    appendAfterSiblings() - Appends elements after selected siblings.
    arg0_container_el: (HTMLElement) - The container element to append a new element in.
    arg1_selector: (String) - The CSS selector referencing siblings within the container_el.
    arg2_new_element: (HTMLElement) - The new element to append.
  */
  function appendAfterSiblings (arg0_container_el, arg1_selector, arg2_new_element) {
    //Convert from parameters
    var container_el = arg0_container_el;
    var selector = arg1_selector;
    var new_el = arg2_new_element;

    //Declare local instance variables
    var all_elements = container_el.querySelectorAll(selector);

    //Guard clause if no elements found
    if (all_elements.length == 0) return;

    var last_sibling = all_elements[all_elements.length - 1];
    var parent_el = last_sibling.parentNode;
    var sibling_index = Array.prototype.indexOf.call(parent_el.children, last_sibling);

    //Call insert function
    (sibling_index < parent_el.children.length - 1) ?
      parent_el.insertBefore(new_el, parent_el.children[sibling_index + 1]) :
      parent_el.appendChild(new_el);
  }

  /*
    appendBeforeSiblings() - Appends elements before selected siblings.
    arg0_container_el: (HTMLElement) - The container element to prepend a new element in.
    arg1_selector: (String) - The CSS selector referencing siblings within the container_el.
    arg2_new_element: (HTMLElement) - The new element to prepend.
  */
  function appendBeforeSiblings (arg0_container_el, arg1_selector, arg2_new_element) {
    //Convert from parameters
    var container_el = arg0_container_el;
    var selector = arg1_selector;
    var new_el = arg2_new_element;

    //Declare local instance variables
    var first_el = container_el.querySelector(selector);

    //Guard clause if no element found
    if (!first_el) return;

    var parent_el = first_el.parentNode;

    //Call insert function
    parent_el.insertBefore(new_el, first_el);
  }

  /*
    arrayHasElement() - Checks if an array has an element.
    arg0_array: (Array<HTMLElement>) - The array of elements to look through
    arg1_query_selector: (String) - The query selector to check for

    Returns: (Boolean)
  */
  function arrayHasElement (arg0_array, arg1_query_selector) {
    //Convert from parameters
    var array = arg0_array;
    var query_selector = arg1_query_selector;

    //Declare local instance variables
    var selected_elements = document.querySelectorAll(query_selector);

    if (selected_elements)
      for (var i = 0; i < array.length; i++)
        for (var x = 0; x < selected_elements.length; x++)
          if (array[i].outerHTML == selected_elements[x].outerHTML) return true;
  }

  /*
    arrayHasElementAttribute() - Checks if an array of elements has an attribute.
    arg0_array: (Array<HTMLElement>) - The array of elements to pass to the function.
    arg1_attribute_type: (String) - The attribute to check for.
    arg2_attribute_content: (String) - The attribute content to check for.

    Returns: (Boolean)
  */
  function arrayHasElementAttribute (arg0_array, arg1_attribute_type, arg2_attribute_content) {
    //Convert from parameters
    var array = getList(arg0_array);
    var attribute_type = arg1_attribute_type;
    var attribute_content = arg2_attribute_content;

    //Iterate over array
    if (array)
      for (var i = 0; i < array.length; i++)
        try {
          //Return statement
          if (array[i].getAttribute(attribute_type) == attribute_content) return true;
        } catch {}
  }

  /*
    arrayHasQuerySelector() - Checks if an array of elements has an element matching the given query selector.
    arg0_array: (Array<HTMLElement>) - The array of elements to pass to the function.
    arg1_selector: (String) - The selector to match for.

    Returns: (Boolean)
  */
  function arrayHasQuerySelector (arg0_array, arg1_selector) {
    //Convert from parameters
    var array = getList(arg0_array);
    var selector = arg1_selector;

    //Iterate over array
    if (array)
      for (var i = 0; i < array.length; i++)
        try {
          //Return statement
          if (array[i].matches(selector)) return true;
        } catch {}
  }

  /*
    closestPointInCircle() - Fetches the closest [x, y] point in a circle if the point is outside the circle.
    arg0_circle_x: (Number) - The centre X coordinate of the circle.
    arg1_circle_y: (Number) - The centre Y coordinate of the circle.
    arg2_point_x: (Number) - The X point outside/inside the circle.
    arg3_point_y: (Number) - The Y point outside/inside the circle.
    arg4_radius: (Number) - The radius of the circle.

    Returns: (Array<Number, Number>)
  */
  function closestPointInCircle (arg0_circle_x, arg1_circle_y, arg2_point_x, arg3_point_y, arg4_radius) {
    //Convert from parameters
    var cX = arg0_circle_x;
    var cY = arg1_circle_y;
    var pX = arg2_point_x;
    var pY = arg3_point_y;
    var r = arg4_radius;

    //Declare local instance variables
    var center_x = cX + r;
    var center_y = cY + r;
    var vX = pX - center_x;
    var vY = pY - center_y;

    var magV = Math.sqrt(vX*vX + vY*vY);
    var aX = center_x + vX/magV*r;
    var aY = center_y + vY/magV*r;

    //Return statement
    return [aX, aY];
  }

  /*
    generateLine() - Generates an HTML line element between two elements.
    arg0_element: (HTMLElement) - The 1st element to pass to the function.
    arg1_element: (HTMLElement) - The 2nd element to pass to the function.
    arg2_options: (Object)
      colour: (String) - Optional. The colour to pass to the line element. 'white' by default.
      thickness: (Number) - Optional. The thickness of the line to generate. 1 by default.
  */
  function generateLine (arg0_element, arg1_element, arg2_options) {
    //Convert from parameters
    var element = arg0_element;
    var ot_element = arg1_element;
    var options = (arg2_options) ? arg2_options : {};

    //Initialise options
    if (!options.colour) options.colour = "black";
    if (!options.thickness) options.thickness = 1;

    //Declare local instance variables
    var html_line = new LeaderLine(
      element,
      ot_element
    );
    html_line.setOptions({
      startSocket: "bottom",
      endSocket: "top"
    });

    //Apply optional formatting
    if (options.colour)
      html_line.color = options.colour;
    if (options.thickness)
      html_line.size = options.thickness;
    html_line.show();

    //Return statement
    return html_line;
  }

  /*
    generateTable() - Generates an empty table according to x and y dimensions, giving them valid IDs.
    arg0_width: (Number) - The width of the table.
    arg1_height: (Number) - The height of the table.
    arg2_options: (Object) - The attributes of the table element.

    Returns: (String)
  */
  function generateTable (arg0_width, arg1_height, arg2_options) {
    //Convert from parameters
    var width = unzero(returnSafeNumber(arg0_width), 1);
    var height = unzero(returnSafeNumber(arg1_height), 1);
    var options = (arg2_options) ? arg2_options : {};

    //Declare local instance variables
    var table_html = [];

    //Format table
    table_html.push(`<table ${objectToAttributes(options)}>`);

    //Iterate over height first
    for (var i = 0; i < height; i++) {
      table_html.push(`<tr id = "row-${i}">`);
        for (var x = 0; x < width; x++)
          table_html.push(`<td id = "${x}-${i}"></td>`);
      table_html.push(`</tr>`);
    }

    //Close table formatting
    table_html.push(`</table>`);

    //Return statement
    return table_html.join("");
  }

  function getCanvasScale (arg0_canvas_el) {
    //Convert from parameters
    var canvas_el = arg0_canvas_el;

    //Declare local instance variables
    var transform_matrix = window.getComputedStyle(canvas_el).transform;

    //Internal guard clause if no transform
    if (transform_matrix == "none") return 1;

    //Deal with matrix_values
    var matrix_values = transform_matrix.match(/matrix\(([^)]+)\)/);

    if (matrix_values) {
      var matrix_array = matrix_values[1].split(", ").map(parseFloat);

      //Return statement
      return Math.sqrt(matrix_array[0]**2 + matrix_array[1]**2); //Extract scale from matrix
    }

    //Return statement
    return 1; //Fallback in case parsing fails
  }

  /*
    getOffset() - Returns the left/top/width/height offset of a given HTML element.
    arg0_element: (HTMLElement) - HTML element to pass.

    Returns: (Object)
      left: (Number)
      top: (Number)

      height: (Number)
      width: (Number)
  */
  function getOffset (arg0_element) {
    //Convert from parameters
    var element = arg0_element;

    //Declare local instance variables
    var rect = element.getBoundingClientRect();

    //Return statement
    return {
      left: rect.left + window.pageXOffset,
      top: rect.top + window.pageYOffset,
      width: (rect.width || el.offsetWidth),
      height: (rect.height || el.offsetHeight)
    };
  }

  /*
    getY() - Fetches the relative Y position of an element, accounting for scroll.
    arg0_element: (HTMLElement) - HTML element to pass.
    arg1_container_el: (HTMLElement) - Optional. The scrollable container element. document.body by default.

    Returns: (Number)
  */
  function getY (arg0_element, arg1_container_el) {
    //Convert from parameters
    var element = arg0_element;
    var container_el = (arg1_container_el) ? arg1_container_el : document.body;

    //Declare local instance variables
    var element_rect = element.getBoundingClientRect();
    var container_rect = container_el.getBoundingClientRect();

    //Return statement
    return (element_rect.top - container_rect.top);
  }

  /*
    hideElement() - Hides an HTML element. Appends a 'hidden' class.
    arg0_element: (HTMLElement) - The HTML element to pass.
  */
  function hideElement (arg0_element) {
    //Convert from parameters
    var element = arg0_element;

    //Declare local instance variables
    var class_name = element.getAttribute("class");

    if (!class_name.includes(" hidden"))
      (class_name) ?
        element.setAttribute("class", `${class_name} hidden`) :
        element.setAttribute("class", " hidden");
  }

  /*
    isDescendant() - Checks whether an element belongs to a specific parent.
    arg0_parent_el: (HTMLElement) - The HTML element of the parent to check.
    arg1_child_el: (HTMLElement) - The HTML element of the child to check.

    Returns: (Boolean)
  */
  function isDescendant (arg0_parent_el, arg1_child_el) {
    //Convert from parameters
    var parent_el = arg0_parent_el;
    var child_el = arg1_child_el;

    //Declare local instance variables
    var node = child_el.parentNode;

    //Iterate over parents as a while loop
    while (node != null) {
      if (node == parent) return true;
      node = node.parentNode;
    }

    //Return statement; if failed
    return false;
  }

  /*
    isElement() - Tests whether a given variable is an element.
    arg0_element: (Variable) - The variable to test for the type HTMLElement.

    Returns: (Boolean)
  */
  function isElement (arg0_element) {
    //Convert from parameters
    var element = arg0_element;

    //Return statement
    return (element instanceof Element || element instanceof HTMLDocument);
  }

  /*
    objectToAttributes() - Converts a given object to a bunch of attributes in terms of key/value pairs.
    arg0_input_object: (Object) - The object to pass to the function.

    Returns: (String)
  */
  function objectToAttributes (arg0_input_object) {
    //Convert from parameters
    var input_object = (arg0_input_object) ? arg0_input_object : {};

    //Declare local instance variables
    var all_keys = Object.keys(input_object);
    var attribute_string = [];

    //Iterate over all_keys
    for (var i = 0; i < all_keys.length; i++) {
      var local_value = input_object[all_keys[i]];

      attribute_string.push(`${all_keys[i]} = "${local_value}"`);
    }

    //Format attribute_string
    attribute_string = attribute_string.join(" ");

    //Return statement
    return (attribute_string) ? ` ${attribute_string}` : "";
  }

  /*
    onRangeChange() - Detects when a range is changed.
    arg0_range_el: (HTMLElement) - The HTML element of the range.
    arg1_listener: (Function) - The function to execute on change.
  */
  function onRangeChange (arg0_range_el, arg1_listener) {
    //Convert from parameters
    var range_el = arg0_range_el;
    var listener = arg1_listener;

    //Declare local instance variables
    var n, c, m;

    range_el.addEventListener("input", function (e) {
      n = 1;
      c = e.target.value;

      if (c != m) listener(e);
      m = c;
    });
    range_el.addEventListener("change", function (e) {
      if (!n) listener(e);
    });
  }

  /*
    pointIsInCircle() - Checks if a point is in a circle.
    arg0_circle_x: (Number) - The x position of the circle.
    arg1_circle_y: (Number) - The y position of the circle.
    arg2_point_x: (Number) - The x position to check.
    arg3_point_y: (Number) - The y position to check.
    arg4_radius: (Number) - The radius of the circle.

    Returns: (Boolean)
  */
  function pointIsInCircle (arg0_circle_x, arg1_circle_y, arg2_point_x, arg3_point_y, arg4_radius) {
    //Convert from parameters
    var circle_x = arg0_circle_x;
    var circle_y = arg1_circle_y;
    var point_x = arg2_point_x;
    var point_y = arg3_point_y;
    var radius = arg4_radius;

    //Declare local instance variables
    var distance_squared = (point_x - circle_x) ** 2 + (point_y - circle_y) ** 2;

    //Return statement
    return (distance_squared <= radius ** 2);
  }

  /*
    removeClass() - Removes a class from a given element.
    arg0_element: (HTMLElement) - The element to remove a class from.
    arg1_class_name: (String) - The class to remove. No space added by default.

    Returns: (String)
  */
  function removeClass (arg0_element, arg1_class_name) {
    //Convert from parameters
    var element = arg0_element;
    var class_name = arg1_class_name;

    //Declare local instance variables
    var element_class = element.getAttribute("class");

    if (element_class)
      element.setAttribute("class", element_class.replace(class_name, ""));

    //Return statement
    return element.getAttribute("class");
  }

  /*
    removeClasses() - Removes a list of classes from an element.
    arg0_element: (HTMLElement) - The HTML element to pass.
    arg1_class_array: (Array<String>/String) - The array of classes to remove.

    Returns: (String)
  */
  function removeClasses (arg0_element, arg1_class_array) {
    //Convert from parameters
    var element = arg0_element;
    var class_array = getList(arg1_class_array);

    //Declare local instance variables
    var element_class = element.getAttribute("class");

    if (element_class) {
      for (var i = 0; i < class_array.length; i++)
        element_class = element_class.replace(class_array[i], "");
      element.setAttribute("class", element_class);
    }

    //Return statement
    return element.getAttribute("class");
  }

  //removeErrorHandlers() - Removes onerror handlers.
  function removeErrorHandlers() {
    if (!global.original_error_handlers)
      global.original_error_handlers = {};

    const elements = document.querySelectorAll('[onerror]');
    elements.forEach((element) => {
        original_error_handlers[element] = element.getAttribute('onerror');
        element.removeAttribute('onerror');
    });
  }

  //restoreErrorHandlers() - Restores onerror handlers.
  function restoreErrorHandlers() {
    for (const element in original_error_handlers)
      if (original_error_handlers.hasOwnProperty(element))
        //Check if the element is a valid HTML element
        if (element instanceof HTMLElement)
          element.setAttribute('onerror', original_error_handlers[element]);
  }

  /*
    showElement() - Shows an element by removing the 'hidden' class.

    arg0_element: (HTMLElement) - The HTML element to pass.
  */
  function showElement (arg0_element) {
    //Convert from parameters
    var element = arg0_element;

    //Declare local instance variables
    var class_name = element.getAttribute("class");

    //Remove ` hidden` from class
    if (class_name)
      element.setAttribute("class", class_name.replace(/ hidden/gm, ""));
  }

  /*
    sortElements() - Sorts elements in a given order.
    arg0_elements: (Array<HTMLElement>) - The array of elements to pass to the function.
    arg1_options: (Object)
      attribute: (String)
      mode: (String) - Optional. Either 'ascending' or 'descending'. Ascending by default.

    Returns: (Array<HTMLElement>)
  */
  function sortElements (arg0_elements, arg1_options) {
    //Convert from parameters
    var elements = arg0_elements;
    var options = (arg1_options) ? arg1_options : {};

    //Initialise options
    if (!options.mode) options.mode = "ascending";

    //Declare local instance variables
    elements = Array.from(elements);
    (options.mode == "ascending") ?
      elements.sort((a, b) => {
        return parseInt(a.getAttribute(options.attribute)) - parseInt(b.getAttribute(options.attribute));
      }) :
      elements.sort((a, b) => {
        return parseInt(b.getAttribute(options.attribute)) - parseInt(a.getAttribute(options.attribute));
      });

    //Return statement
    return elements;
  }
}
