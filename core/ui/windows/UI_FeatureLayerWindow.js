global.UI_FeatureLayerWindow = class extends ve.Class { //[WIP] - Finish class body
	constructor (arg0_layer_obj) {
		//Convert from parameters
		let layer_obj = arg0_layer_obj;
			super();
			
		//Declare local instance variables
		this.layer = layer_obj;
	}

  /**
   * Returns an {@link Object}<{@link ve.Component}> representing the current UI_FeatureLayerWIndow element that can be bound; removes the previous `.interface` if present.
	 * 
	 * @returns {ve.Interface}
   */
  draw () {
    super.close("instance");

    //Declare local instance variables
    let geometry_table_array = this.getGeometryTable({ view_tags: true });

    this.interface = veInterface({
      searchbar: new ve.SearchSelect({}, {
        hide_filter: true,
        onuserchange: (v, e) => {
          //Declare local instance variables
          let search_value = e.search_value;
        }
      }),
      geometry_table: new ve.Table(geometry_table_array, {
        disable_hide_columns: [0]
      })
    }, { is_folder: false });

    super.open("instance", { 
      can_rename: false, //[WIP] - Should be able to rename layers from here in future
      name: (this.layer.name) ? this.layer.name : "Layer"
    });

    //Return statement
    return this.interface;
  }
	
	filterGeometryTable (arg0_options) {
		
	}
	
  /**
   * Returns a {@link naissance.Geometry} Table array that can be passed to {@link ve.Table}.
   * - Method of: {@link UI_FeatureLayerWindow}
   * 
   * @param {Object} [arg0_options]
   *  @param {boolean} [arg0_options.view_tags=false]
   */
	getGeometryTable (arg0_options) {
    //Convert from parameters
    let options = (arg0_options) ? arg0_options : {};

		//Declare local instance variables
    let _redrawSelections = () => {
      Object.iterate(table_map, (local_key, local_value) => {
        let is_selected = local_value.geometry?.selected;
        let local_checkbox = local_value.row[0].instance;

        local_checkbox.v = is_selected;
        local_checkbox.element.setAttribute("data-value", is_selected);
      });
    };
		let table_array = []; //[[select_button, index, geometry_type, geometry_name, actions_bar]];
    let table_map = {}; //{ <geometry_id>: { geometry: naissance.Geometry, row: any[] } }
		
		//Populate table_array from entities in this.layer
		let all_entities = this.layer.getAllGeometries();
		
		//Initalise header
    if (!options.view_tags) {
		  table_array.push(["Selected", "Index", "Type", "Name", "Actions"]);
    } else {
      table_array.push(["Selected", "Index", "Type", "Name", "Tags", "Actions"]);
    }
		
		//Iterate over all_entities and push it to table_array
		for (let i = 0; i < all_entities.length; i++) {
			let local_array = [];
			let local_geometry = all_entities[i];
			let local_geometry_name = local_geometry.name;
				if (!local_geometry_name)
					if (local_geometry.class_name) {
						local_geometry_name = local_geometry.class_name;
					} else {
						local_geometry_name = `Geometry`;
					}
      let select_component;
			
			//Set local_array
      //Select column
      {
        select_component = veCheckbox(local_geometry.selected, { //[WIP] - onprogramchange doesn't fire, no binding
          attributes: {
            "naissance-geometry-select": "true",
            "data-value": String(local_geometry.selected)
          },
          onuserchange: (v, e) => {
            e.element.setAttribute("data-value", String(v));
            local_geometry.selected = v;
          }
        });
        select_component.element.geometry = local_geometry;

			  local_array.push(select_component.element);
      }
			local_array.push(i);
			local_array.push((local_geometry.class_name) ? local_geometry.class_name : "Geometry");
      //Name column
      {
        let name_component = veText(local_geometry_name, { //[WIP] - onprogramchange doesn't fire, no binding
          attributes: { 
            "data-value": local_geometry_name
          },
          onprogramchange: (v, e) => {
            e.element.setAttribute("data-value", v);
            e.v = v;
          },
          onuserchange: (v, e) => {
            e.element.setAttribute("data-value", v);
            local_geometry.name = v;
          }
        });

        local_array.push(name_component.element);
      }
			
      if (options.view_tags) {
        let local_geometry_tags = local_geometry?.metadata?.tags;

        if (local_geometry_tags && Array.isArray(local_geometry_tags)) {
          local_array.push(local_geometry_tags.join(", "));
        } else {
          local_array.push("");
        }
      }

      //Actions bar
      {
        let actions_bar_el = local_geometry.getActionsBarElement();
        let brush_button = veButton((v, e) => {
          if (main.brush.selected_geometry?.id !== e.element.geometry?.id) {
            main.brush.selected_geometry = e.element.geometry;
            select_component.v = true;
            _redrawSelections();
          }
        }, {
          name: "<icon>brush</icon>",
          tooltip: "Move to Brush"
        });
          brush_button.element.geometry = local_geometry;
          actions_bar_el.prepend(brush_button.element);

			  local_array.push(actions_bar_el);
      }
			
			//Push local_array to table_array
			table_array.push(local_array);
      table_map[local_geometry.id] = {
        geometry: local_geometry,
        row: local_array
      };
		}
		
		//Return statement
		return table_array;
	}
}