//Initialise functions
{
	if (!global.HTML) global.HTML = {};
	
	HTML.initialise = function () {
		//Add event listeners
		{
			document.addEventListener("keydown", (e) => {
				if (e.keyCode === 17) { //Ctrl
					if (is_naissance)
						try { 
							map.scrollWheelZoom.disable(); 
						} catch (e) { console.log(e); } //Disable map zoom upon Ctrl down
					HTML.ctrl_pressed = true;
				}
			});
			document.addEventListener("keyup", (e) => {
				if (e.keyCode === 17) { //Ctrl
					if (is_naissance) {
						try { 
							map.scrollWheelZoom.enable(); 
						} catch (e) { console.log(e); } //Re-enable map zoom upon Ctrl up
					}
					delete HTML.ctrl_pressed;
				}
			});
			document.addEventListener("mousemove", (e) => {
				HTML.mouse_x = e.clientX;
				HTML.mouse_y = e.clientY;
			});
		}
	}
	
	//Vercengen CSS handler
	{
		//Flag to ensure only one RAF loop is running
		if (!HTML.ve_css_active_loops) {
			HTML.ve_css_active_loops = true;
			HTML.ve_css_global_loop = () => {
				let ve_css_registry = HTML.ve_css_registry;
				
				//Iterate over all elements in ve_css_registry
				for (let [local_el, local_entry] of ve_css_registry.entries()) {
					if (!document.body.contains(local_el)) {
						//Cleanup elements removed from DOM
						ve_css_registry.delete(local_el);
						continue;
					}
					
					//Reapply only dynamic (function) styles
					HTML.applyDynamicTelestyle(local_el, local_entry.dynamic);
				}
				requestAnimationFrame(HTML.ve_css_global_loop);
			};
			
			//Jumpstart RAF loop
			requestAnimationFrame(HTML.ve_css_global_loop);
		}
		if (!HTML.ve_css_registry)
			HTML.ve_css_registry = new Map();
	}
}