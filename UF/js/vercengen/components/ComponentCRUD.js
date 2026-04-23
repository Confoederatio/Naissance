/**
 * Refer to <span color = "yellow">{@link ve.Component}</span> for methods or fields inherited from this Component's parent such as `.options.attributes` or `.element`.
 * 
 * Create, Read, Update, Delete (CRUD) interface used for editing complex instances.
 * - Functional binding: <span color=00ffff>veCRUD</span>().
 *
 * ##### Constructor:
 * - `arg0_value`: {@link Array}<{@link any}>
 * - `arg1_options`: {@link Object}
 *   - `.header=["Selected", "Index", ...]`: {@link Array}<{@link string}>
 *   - `.special_function`: {@link function}(v:{@link any}) | {@link Array}<{@link any}> - How to parse Array elements in the dataframe into rows, excluding the selection row.
 *
 *   - `.filters`: {@link Array}<{@link Object}> - [{ name: "All" }] by default.
 *     - `[n].name`: {@link string} - The name of the given tab.
 *     - `[n].special_function`: {@link function}(v:{@link any}) | {@link boolean} - Boolean determines whether to include result in tab. If this field does not exist, all elements are taken as valid.
 *   - `.filter_interface`: {@link ve.Interface} - The interface to provide for the filter.
 *   - `.hide_searchbar=false`: {@link boolean}
 *   - `.onsearch`: {@link function}(v:{@link string}, e:{@link ve.CRUD})
 *   - `.onselect`: {@link function}(v:{@link boolean}, e:{ checkbox:{@link ve.Checkbox}, value:{@link any} })
 *   - `.searchbar_filters`: {@link Array}<{@link number>} - The column indices to target when filtering search results.
 *   - `.searchbar_header_components`: {@link Array}<{@link ve.Component}>
 *   - `.searchbar_options`: {@link Object} - The options to pass to the {@link ve.SearchSelect} for the CRUD.
 *   - `.select_options`: {@link Object}
 *   - `.table_options`: {@link Object} - The options to pass to the {@link ve.Table} for the CRUD.
 *   
 * ##### Instance:
 * - `.do_not_draw=false`: {@link boolean} - Whether to call .draw() when set v() is fired.
 * - `.page_menu`: {@link ve.PageMenu} - The PageMenu component responsible for containing CRUD subpages.
 * - `.searchbar`: {@link ve.SearchSelect}
 * - `.table`: {@link ve.Table}
 * - `.table_array`: {@link Array}<{@link Array}<{@link any}>>
 * - `.table_map`: {@link Array}<{@link Object}{ <value_id>: { value:{@link any}, row:{@link any}[] } }>
 * - `.v`: {@link Array}<{@link any}>
 * 
 * ##### Methods:
 * - <span color=00ffff>{@link ve.CRUD.draw|draw}</span>()
 * - <span color=00ffff>{@link ve.CRUD.filterTable|filterTable}</span>(arg0_search_string:{@link string}, arg1_options:{@link Object}) | {@link Array}<{@link any}>
 * - <span color-00ffff>{@link ve.CRUD.gc|gc}</span>()
 * - <span color=00ffff>{@link ve.CRUD.getFilters|getFilters}</span>() | {@link Object}{ name:{@link string}, special_function:{@link function} }
 * - <span color=00ffff>{@link ve.CRUD.getTable|getTable}</span>(arg0_filter_function:{@link function}) | {@link Array}<{@link Array}<{@link any}>>
 * - <span color=00ffff>{@link ve.CRUD.redrawSelections|redrawSelections}</span>()
 * 
 * @augments ve.Component
 * @memberof ve.Component
 * @type {ve.CRUD}
 */
ve.CRUD = class extends ve.Component {
  constructor (arg0_value, arg1_options) {
    //Convert from parameters
    let value = (arg0_value) ? Array.toArray(arg0_value) : [];
    let options = (arg1_options) ? arg1_options : {};
      super(options);
    
    //Initialise options
    options._filters = this.getFilters();
    let new_header = ["Selected", "Index"];
      this.head_index = 1; //Head index of the header
      if (options.header) new_header = new_header.concat(options.header);
      options.header = new_header;
      options.searchbar_filters = (options.searchbar_filters) ? 
        Array.toArray(options.searchbar_filters) : [];
    
    //Declare local instance variables
    this.element = document.createElement("div");
      this.element.setAttribute("component", "ve-crud");
      this.element.instance = this;
      HTML.setAttributesObject(this.element, options.attributes);
    this.id = Class.generateRandomID(ve.CRUD);
    this.options = options;
    this.value = value;
    
    //Push to instances
    ve.CRUD.instances.push(this);
    
    //Call this.draw()
    this.from_binding_fire_silently = true;
    this.v = value;
    delete this.from_binding_fire_silently;
  }
  
  /**
   * Returns an array of current values.
   * - Accessor of: {@link ve.CRUD}
   * 
   * @alias v
   * @memberof ve.Component.ve.CRUD
   * @type {any[]}
   */
  get v () {
    //Return statement
    return this.value;
  }
  
  /**
   * Sets the array of current values.
   * - Accessor of: {@link ve.CRUD}
   * 
   * @alias v
   * @memberof ve.Component.ve.CRUD
   * 
   * @param arg0_value
   */
  set v (arg0_value) {
    //Convert from parameters
    let value = Array.toArray(arg0_value);
    
    //Set value and call draw
    this.value = value;
    if (!this.options.do_not_draw) this.draw();
  }
  
  /**
   * Draws the current component and forces a re-render.
   * - Method of: {@link ve.CRUD}
   * 
   * @alias draw
   * @memberof ve.Component.ve.CRUD
   */
  draw () {
    //Declare local instance variables
    this.element.innerHTML = "";
    this.page_obj = {};
    
    let last_filter;

    if (!this.searchbar) this.searchbar = new ve.SearchSelect({}, {
      header_components_obj: {
        filter_columns_when_searching: veButton(() => {
          if (this.filter_window) this.filter_window.close();
          
          //Declare local instance variables
          let components_obj = {};
          
          //Iterate over all categories in header and show them for searchbar options
          for (let i = this.head_index; i < this.options.header.length; i++)
            components_obj[i] = new ve.Checkbox(this.options.searchbar_filters.includes(i), {
              name: this.options.header[i],
              onuserchange: (v) => {
                if (v === true) {
                  if (!this.options.searchbar_filters.includes(i))
                    this.options.searchbar_filters.push(i);
                } else {
                  //Iterate over this.options.searchbar_filteres and splice it
                  for (let x = this.options.searchbar_filters.length - 1; x >= 0; x--)
                    if (this.options.searchbar_filters[x] === i)
                      this.options.searchbar_filters.splice(x, 1);
                }
                
                this.filterTable(this.searchbar.search_value);
              }
            });
          
          components_obj.mirror_visible_columns = new ve.Toggle(this.options.mirror_visible_columns, {
            name: "Mirror Visible Columns",
            onuserchange: (v) => {
              this.options.mirror_visible_columns = v;
              this.filterTable(this.searchbar.search_value);
            }
          });
          
          //Open this.filter_window
          this.filter_window = new ve.Window({
            ...components_obj
          }, {
            name: "Filter Search",
            can_rename: false,
            width: "20rem"
          });
        }, {
          name: "<icon>filter_alt</icon>",
          tooltip: "Filter Columns When Searching",
          style: {
            display: "block",
            marginLeft: "auto"
          }
        }),
        ...this.options.searchbar_header_components
      },
      hide_filter: true,
      onuserchange: (v, e) => {
        //Declare local instance variables
        let search_value = e.search_value;
        
        //Filter table by search_value
        if (this.options.onsearch) this.options.onsearch(search_value, this);
        this.filterTable(search_value);
      },
      ...this.options.searchbar_options
    });

    //Initialise table with header only; refresh logic will populate data
    this.table_array = [this.options.header];
    this.table = new ve.Table(this.table_array, {
      disable_hide_columns: [0],
      ...this.options.table_options
    });
    
    //Iterate over this.options._filters and check for .name, .special_function
    for (let i = 0; i < this.options._filters.length; i++) {
      let local_filter = this.options._filters[i];
      
      this.page_obj[local_filter.name] = {
        name: local_filter.name,
        components_obj: (i === 0) ? {
          searchbar: this.searchbar,
          table: this.table
        } : {}
      };
    }
    
    //Define localized update logic to prevent double execution
    let updateView = (v, e) => {
      if (last_filter === v) return;
      last_filter = v;

      //Iterate over all this.options._filters to fetch this.filter_obj
      for (let i = 0; i < this.options._filters.length; i++) {
        let local_filter = this.options._filters[i];
        
        if (local_filter.name === v) {
          this.filter_obj = local_filter;
          break;
        }
      }
      
      //Fetch new data and refresh table display
      this.table_array = this.getTable(this.filter_obj?.special_function);
      this.filterTable(this.searchbar.search_value, { do_not_refresh: true });
      
      this.searchbar.bind(e.element);
      this.table.bind(e.element);
    };

    //Preserve old_starting_page if possible
    let old_starting_page = (this.page_menu) ? this.page_menu.v : undefined;
    this.page_menu = new ve.PageMenu(this.page_obj, {
      do_not_wrap: true,
      onuserchange: (v, e) => updateView(v, e.interfaces_obj[v]),
      starting_page: old_starting_page
    });

    //Initial draw call
    let initial_page_name = this.page_menu.v;
    updateView(initial_page_name, this.page_menu.interfaces_obj[initial_page_name]);
    
    this.page_menu.bind(this.element);
  }
  
  /**
   * Filters the current table depending on the search string given.
   * - Method of: {@link ve.CRUD}
   * 
   * @alias filterTable
   * @memberof ve.Component.ve.CRUD
   * 
   * @param {string} [arg0_search_string=""]
   * @param {Object} [arg1_options]
   *  @param {boolean} [arg1_options.do_not_refresh=false]
   * 
   * @returns {any[]}
   */
  filterTable (arg0_search_string, arg1_options) {
    //Convert from parameters
    let search_string = (arg0_search_string) ? arg0_search_string : "";
      search_string = search_string.trim().toLowerCase();
    let options = (arg1_options) ? arg1_options : {};
    
    //Declare local instance variables
    let filtered_table_array = [];
    let searchbar_columns = [];
    
    //Internal guard clause if search_string is empty
    if (search_string.length === 0) {
      filtered_table_array = (!options.do_not_refresh) ? 
        this.getTable(this.filter_obj?.special_function) : this.table_array;
      this.table.v = filtered_table_array;
      
      //Return statement
      return filtered_table_array;
    }
    
    //Set searchbar_columns
    if (this.options.mirror_visible_columns) {
      //Iterate over all columns in header and push anything not in hide_columns
      for (let i = 0; i < this.options.header.length; i++) try {
        if (!this.table.options.hide_columns.includes(i))
          searchbar_columns.push(i);
      } catch (e) {}
    } else {
      if (!this.options.searchbar_filters || this.options.searchbar_filters?.length === 0) {
        for (let i = 0; i < this.options.header.length; i++)
          searchbar_columns.push(i);
      } else {
        searchbar_columns = this.options.searchbar_filters;
      }
    }
    
    //Push header to filtered_table_array first
    filtered_table_array.push(this.options.header);
    
    //Iterate over all rows in this.table_array
    for (let i = 1; i < this.table_array.length; i++) {
      let is_valid = false;
      
      //Iterate over all searchbar_columns in this.table_array for filters to see if "data-value" or .innerText has a valid substring
      for (let x = 0; x < searchbar_columns.length; x++) {
        let local_cell = this.table_array[i][searchbar_columns[x]];
        let local_values = [];
        
        if (local_cell instanceof HTMLElement) {
          let data_value = local_cell.getAttribute("data-value");
          
          if (data_value) local_values.push(data_value);
          local_values.push(local_cell.innerText);
        } else {
          local_values.push(String(local_cell));
        }
        
        //Iterate over local_values and determine if any of them are valid against search_string
        for (let y = 0; y < local_values.length; y++) {
          let local_value = local_values[y].trim().toLowerCase();
          
          if (local_value.indexOf(search_string) !== -1) {
            is_valid = true;
            break;
          }
        }
      }
      
      if (is_valid) filtered_table_array.push(this.table_array[i]);
    }
    
    //Set this.table.v
    this.table.v = filtered_table_array;
    
    //Return statement
    return filtered_table_array;
  }
  
  /**
   * Returns all internal filters and sets them to `this.options._filters`.
   * - Method of: {@link ve.CRUD}
   * 
   * @alias getFilters
   * @memberof ve.Component.ve.CRUD
   * 
   * @returns {Array.<{ name: string, special_function: function|undefined }>}
   */
  getFilters () {
    //Declare local instance variables
    let new_filters = [{ name: "All" }];
    
    //Concatenate new_filters
    if (this.options.filters) new_filters = new_filters.concat(this.options.filters);
    this.options._filters = new_filters; //Set internal cache _filters
    
    //Return statement
    return new_filters;
  }
  
  /**
   * Returns the current table array for the CRUD component.
   * - Method of: {@link ve.CRUD}
   * 
   * @alias getTable
   * @memberof ve.Component.ve.CRUD
   * 
   * @param {function} [arg0_filter_function] - The function to filter `this.value[i]` by. Returns: {@link boolean}.
   * 
   * @returns {Array.<any[]>}
   */
  getTable (arg0_filter_function) {
    //Convert from parameteres
    let filter_function = arg0_filter_function;
    
    //Declare local instance variables
    this.table_array = []; //[[select_button, ...draw_function(value[n])], ...]
    this.table_map = {}; //{ <value_id>: { value: any, row: any[] } }
    
    //Set header
    this.table_array.push(this.options.header);
    
    //Populate table_array from value
    for (let i = 0; i < this.value.length; i++) {
      let is_valid = true;
        if (filter_function !== undefined) is_valid = filter_function(this.value[i]);
      if (!is_valid) continue; //Internal guard clause if element isn't valid
      
      let local_array = [];
      let select_component;
      
      //Set local_array
      //Select column
      {
        select_component = veCheckbox(this.value[i]?.selected, {
          attributes: {
            "crud-select": "true",
            "data-value": String(this.value[i]?.selected)
          },
          gc: true,
          onuserchange: (v, e) => {
            e.element.setAttribute("data-value", String(v));
            
            if (this.options.onselect) {
              this.options.onselect(v, {
                checkbox: e,
                value: this.value[i]
              });
            } else {
              this.value[i].selected = v;
            }
            this.redrawSelections();
          },
          ...this.options.select_options
        });
        select_component.element.value = this.value[i];
        
        local_array.push(select_component.element);
      }
      
      //Push index
      local_array.push(i);
      
      //Push everything else from this.options.special_function
      let row_value = this.options.special_function(this.value[i]);
      
      if (row_value)
        for (let x = 0; x < row_value.length; x++) {
          if (row_value[x].instance) row_value[x].instance.gc();
          local_array.push(row_value[x]);
        }
      
      //Push local_array to table_array
      this.table_array.push(local_array);
      
      this.table_map[(this.value[i].id) ? this.value[i].id : i] = {
        value: this.value[i],
        row: local_array
      };
    }
    
    //Return statement
    return this.table_array;
  }
  
  /**
   * Redraws selection boxes for the present component.
   * - Method of: {@link ve.CRUD}
   * 
   * @alias redrawSelections
   * @memberof ve.Component.ve.CRUD
   */
  redrawSelections () {
    Object.iterate(this.table_map, (local_key, local_value) => {
      let is_selected = local_value.value?.selected;
      let local_checkbox = local_value.row[0].instance;
      
      if (local_checkbox) {
        local_checkbox.v = is_selected;
        if (local_checkbox.element) local_checkbox.element.setAttribute("data-value", is_selected);
      }
    });
  }
};

//Functional binding

/**
 * @returns {ve.CRUD}
 */
veCRUD = function () {
  //Return statement
  return new ve.CRUD(...arguments);
};