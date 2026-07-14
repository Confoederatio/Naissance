config.actions.entity = {
	move_to_feature: {
		name: "Move to Feature",
		scope: ["Entity"],
		
		special_function: async function (json) {
			//Declare local instance variables
			let geometry_obj = json.naissance_obj;
			
			geometry_obj.moveToFeature(json.move_to_feature.feature_id);
		}
	},
};