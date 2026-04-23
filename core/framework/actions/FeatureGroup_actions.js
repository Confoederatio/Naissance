/**
 * Parses a JSON action for a target FeatureGroup.
 * - Static method of: {@link naissance.FeatureGroup}
 *
 * `arg0_json`: {@link Object|string}
 * - `.feature_id`: {@link string} - Identifier. The {@link naissance.Feature} ID to target changes for.
 * <br>
 * - #### Extraneous Commands:
 * - `.create_group`: {@link Object}
 *   - `.do_not_refresh=false`: {@link boolean}
 *   - `.id`: {@link string}
 * - #### Internal Commands:
 * - `.delete_feature`: {@link boolean}
 */
naissance.FeatureGroup.parseAction = function (arg0_json) {
	//Convert from parameters
	let json = (typeof arg0_json === "string") ? JSON.parse(arg0_json) : arg0_json;
	
	//Parse extraneous commands
	//create_group
	if (json.create_group)
		if (json.create_group.id) {
			let new_group = new naissance.FeatureGroup();
			new_group.id = json.create_group.id;
			
			if (!json.create_group.do_not_refresh)
				UI_LeftbarHierarchy.refresh();
		}
};