config.mapmodes.polities_Cliopatria = {
	name: "Cliopatria (Polities)",
	icon: "flag",
	
	special_function: function (v) {
		if (!v.class_obj) v.class_obj = new polities_Cliopatria_UI();
		let class_obj = v.class_obj;
			class_obj.draw(main.date);
		
		//Return statement
		return class_obj.geometries;
	}
};