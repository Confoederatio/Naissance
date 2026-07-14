/**
 * - #### Extraneous Commands:
 * - `.create_group`: {@link Object}
 *   - `.do_not_refresh=false`: {@link boolean}
 *   - `.id`: {@link string}
 * 
 * @type {Object}
 */
config.actions.feature_group = {
	create_group: {
		name: "Create Group",
		scope: ["FeatureGroup"],
		
		special_function: async function (json) {
			if (json.create_group)
				if (json.create_group.id) {
					let new_group = new naissance.FeatureGroup();
					new_group.setID(json.create_group.id);
					
					if (!json.create_group.do_not_refresh)
						UI_Leftbar.refresh();
				}
		}
	}
};