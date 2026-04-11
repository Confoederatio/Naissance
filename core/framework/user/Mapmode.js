if (!global.naissance) global.naissance = {};

/**
 * ##### Constructor:
 * - `arg0_mapmode_id`: {@link string}
 * - `arg1_options`: {@link Object}
 *   - `.icon`: {@link string}
 *   - `.name`: {@link string}
 *   - `.layer="bottom"`: {@link string} - Either 'bottom'/'top', targets `main.layers.mapmode_<key>_layer`.
 *   - 
 *   - `.onhide`: {@link function} - Called upon mapmode being hidden.
 *   - `.node_editor_file`: {@link string}
 *   - `.node_editor_value`: {@link Object}
 *   - `.special_function`: {@link function} | {@link maptalks.Geometry}[] - Called upon mapmode being shown or drawn.
 * 
 * @type {naissance.Mapmode}
 */
naissance.Mapmode = class extends ve.Class { //[WIP] - Finish class body
	static instances = [];
	
	constructor (arg0_mapmode_id, arg1_options) {
		//Convert from parameters
		let mapmode_id = arg0_mapmode_id;
		let options = (arg1_options) ? arg1_options : {};
			super();
			
		//Initialise options
		if (!options.layer) options.layer = "bottom";
			
		//Declare local instance variables
		this.geometries = [];
		this.id = (mapmode_id) ? mapmode_id : Class.generateRandomID(naissance.Mapmode);
		this.options = options;
		
		naissance.Mapmode.instances.push(this);
	}
	
	get is_enabled () {
		//Iterate over all naissance.Mapmode.instances
		for (let i = 0; i < main.user.mapmodes.length; i++)
			if (main.user.mapmodes[i] === this.id)
				//Return statement
				return true;
		return false;
	}
	
	drawHierarchyDatatype () {
		//Declare local instance variables
		let display_name = (this.options.name) ? this.options.name : this.id;
		
		//Return statement
		return veButton(() => {
			if (!this.is_enabled) {
				this.show();
			} else {
				this.hide();
			}
			main.interfaces.mapmodes_ui.draw();
		}, {
			attributes: {
				"data-selected-mapmode": this.is_enabled
			},
			name: `<icon>${(this.options.icon) ? this.options.icon : "flag"}</icon><span style = 'display: none'>${display_name}</span>`,
			tooltip: display_name
		});
	}
	
	hide () {
		//Iterate over all this.geometries and remove them from the map
		for (let i = 0; i < this.geometries.length; i++)
			this.geometries[i].remove();
		this.geometries = [];
		
		//Remove mapmode from main.user.mapmodes
		for (let i = 0; i < main.user.mapmodes.length; i++)
			if (main.user.mapmodes[i] === this.id) {
        if (this.options.onhide) this.options.onhide(this);
				main.user.mapmodes.splice(i, 1);
				break;
			}
	}
	
	setGeometries (arg0_geometries) {
		//Convert from parameters
		let geometries = (arg0_geometries) ? arg0_geometries : [];
		let mapmode_layer = main.layers[`mapmode_${this.options.layer}_layer`];
		
		//Iterate over all present this.geometries
		for (let i = 0; i < this.geometries.length; i++)
			this.geometries[i].remove();
		for (let i = 0; i < geometries.length; i++)
			geometries[i].addTo(mapmode_layer);
		this.geometries = geometries;
		
		//Return statement
		return this.geometries;
	}
	
	show () {
		if (!main.user.mapmodes.includes(this.id)) main.user.mapmodes.push(this.id);
		naissance.Mapmode.draw();
	}
	
	static draw () {
		//Iterate over all main.user.mapmodes in order and render them
		for (let i = 0; i < main.user.mapmodes.length; i++) {
			let local_mapmode;
			for (let x = 0; x < naissance.Mapmode.instances.length; x++)
				if (naissance.Mapmode.instances[x].id === main.user.mapmodes[i]) {
					local_mapmode = naissance.Mapmode.instances[x];
					break;
				}
			
			//Draw the local_mapmode if possible
			{
				let local_mapmode_layer = main.layers[`mapmode_${local_mapmode.options.layer}_layer`];
				
				//Remove all current geometries before resetting
				for (let x = 0; x < local_mapmode.geometries.length; x++)
					local_mapmode.geometries[x].remove();
				
				//Assign new_geometries
				let new_geometries = local_mapmode.options.special_function(local_mapmode);
				
				if (new_geometries !== undefined) {
					local_mapmode.geometries = new_geometries;
				} else {
					console.warn(`naissance.Mapmode: ${local_mapmode.id}.special_function does not return a valid geometries array.`);
				}
				
				//Iterate over all local_mapmode.geometries and draw them
				for (let x = 0; x < local_mapmode.geometries.length; x++) {
					let local_geometry = local_mapmode.geometries[x];
					
          local_geometry.config("interactive", !main.settings.disable_mapmode_interactivity);
					local_geometry.addTo(local_mapmode_layer);
				}
			}
		}
	}
	
	/**
	 * Loads config mapmodes from `config.mapmodes`, mapmodes with conflicting IDs are replaced
	 */
	static loadConfig () {
		//Iterate over config.mapmodes if it exists
		if (config.mapmodes)
			Object.iterate(config.mapmodes, (local_key, local_value) => {
				//Iterate over naissance.Mapmode.instances and remove duplicate mapmodes
				for (let i = naissance.Mapmode.instances.length - 1; i >= 0; i--) {
					let local_mapmode = naissance.Mapmode.instances[i];
					
					if (local_mapmode.id === local_key) {
						local_mapmode.hide();
						naissance.Mapmode.instances.splice(i, 1);
					}
				}
				
				//Push local_value as new mapmode
				config.mapmodes[local_key].instance = new naissance.Mapmode(local_key, local_value);
			});
		main.interfaces.mapmodes_ui.draw();
	}
};