global.UI_DateMenu = class extends ve.Class {
	constructor () {
		super();
		
		//Declare local instance variables
		let navbar_el = document.querySelector(".ve.navbar");
		this.date = veDate(undefined, {
			binding: "main.date",
			name: " ",
			
			//Split up directional flows to prevent accessor race conditions
			onprogramchange: (v) => {
				//console.trace("date, onprogramchange");
				DALS.Timeline.parseAction({
					options: { name: "Refresh Date", key: "load_date" },
					value: [{ type: "global", refresh_date: true }]
				}, true);
			},
			onuserchange: (v) => { //[WIP] - Check that proxy is reset
				DALS.Timeline.parseAction({
					options: { name: "Set Date", key: "load_date" },
					value: [
						{ type: "global", set_date: v },
						{ type: "global", refresh_date: true }
					]
				});
			}
		});
		
		//Open UI
		super.open("instance", {
			anchor: "top_right",
			mode: "static_window",
			name: "Date",
			width: "24rem",
			x: 8,
			y: ((navbar_el) ? navbar_el.offsetHeight : 0) + 8
		});
	}
};