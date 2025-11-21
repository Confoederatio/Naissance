ve.Demo = class veDemo extends ve.Class { //[WIP] - Make sure .name is always populated by local_key
	//Declare local instance variables
	constructor (arg0_options) {
		super();
		this.ve_fields = {};
		
		Object.iterate(global.ve, (local_key, local_value) => {
			try {
				if (Object.getPrototypeOf(local_value) === ve.Component) {
					let local_arguments = [];
					if (local_value.demo_value !== undefined) local_arguments.push(local_value.demo_value);
					if (local_value.demo_options !== undefined) local_arguments.push(local_value.demo_options);
					
					this[local_key] = new ve[local_key](...local_arguments);
				}
			} catch (e) { console.error(e); }
		});
		
		super.open("instance", { 
			name: "Test",
			x: 50,
			y: 50,
			mode: "window"
		});
	}
};

setTimeout(() => {
	if (ve.debug_mode) new ve.Demo();
}, 100);