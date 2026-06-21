//Initialise functions
{
	naissance.Geometry.Action_manageRelations = function () {
		//Declare local instance variables
		let relation_timestamp = (this.ui.add_relation_date !== undefined) ?
			Date.getTimestamp(this.ui.add_relation_date) : main.timestamp;
		let relation_mode = (this.ui.add_relation_mode || "direct");
		let relation_string;
		
		let existing_relations = [];
		let keyframe_obj = this.history.keyframes[relation_timestamp];
		try {
			existing_relations = keyframe_obj.value[2].variables.Relation;
			existing_relations = existing_relations.split(",").filter((item) => item.length > 0); //Prevent ,, artefacts
		} catch (e) {}
		
		//Declare local helper functions
		let _clearRelationsWithID = (id) => {
			for (let i = existing_relations.length - 1; i >= 0; i--) {
				let local_relation = existing_relations[i].split("-");
				
				if (local_relation[1] === String(id))
					existing_relations.splice(i, 1);
			}
		};
		let _getDirectRelationString = () => {
			//Return statement
			if (!this.ui.add_relation_with_id) {
				veToast(`<icon>warning</icon> You must select a valid geometry to add a relation with.`);
				return;
			}
			if (this.ui.add_relation_with_id === this.id) {
				veToast(`<icon>warning</icon> You cannot create a direct self-relationship.`);
				return;
			}
			if (!this.ui.add_relation_type || this.ui.add_relation_type.length === 0) {
				veToast(`<icon>warning</icon> You must specify a valid relation type.`);
				return;
			}
			return `${(this.ui.add_relation_modifier || "add")}-${this.ui.add_relation_with_id}-${this.ui.add_relation_type}`;
		}
		let _getIndirectRelationString = () => {
			if (!this.ui.add_relation_type || this.ui.add_relation_type.length === 0) {
				veToast(`<icon>warning</icon> You must specify a valid relation type.`);
				return;
			}
			return `${(this.ui.add_relation_modifier || "add")}-indirect-${this.ui.add_relation_type}`;
		}
		
		//Parse relation_mode for add/remove
		if (relation_mode === "clear") {
			//Simply clear Relation at timestamp
			DALS.Timeline.parseAction("remove_variable", [{
				geometry_obj: this.id,
				remove_variable: {
					date: relation_timestamp,
					key: "Relation"
				}
			}]);
			veToast(`Cleared all relations at this keyframe.`);
			
			return;
		} else if (relation_mode === "direct") {
			relation_string = _getDirectRelationString();
			if (!relation_string) return;
			
			if (existing_relations.includes(relation_string)) {
				veToast(`<icon>warning</icon> An identical relation already exists.`);
				return;
			}
			
			//Push to existing_relations
			existing_relations.push(relation_string);
		} else if (relation_mode === "indirect") {
			relation_string = _getIndirectRelationString();
			if (!relation_string) return;
			
			if (existing_relations.includes(relation_string)) {
				veToast(`<icon>warning</icon> An identical relation already exists.`);
				return;
			}
			
			existing_relations.push(relation_string);
		} else if (["remove_direct", "remove_indirect"].includes(relation_mode)) {
			relation_string = (relation_mode === "remove_direct") ? 
				_getDirectRelationString() : _getIndirectRelationString();
			if (!relation_string) return;
			
			//Iterate over all existing_relations and splice out indirect relationships that match
			for (let i = existing_relations.length - 1; i >= 0; i--)
				if (existing_relations[i] === relation_string)
					existing_relations.splice(i, 1);
		} else if (relation_mode === "replace") {
			relation_string = _getDirectRelationString();
			if (!relation_string) return;
			
			_clearRelationsWithID(this.ui.add_relation_with_id);
			
			existing_relations.push(relation_string);
		}
		
		//Modify Relation variable at timestamp
		DALS.Timeline.parseAction("add_variable", [{
			geometry_obj: this.id,
			add_variable: {
				date: relation_timestamp,
				key: "Relation",
				value: existing_relations.join(",")
			}
		}]);
		
		veToast(`Altered specified relation. Relations may be edited/removed in the Variables Editor.`);
	};
	
	naissance.Geometry.getRelations = function () {
		//Declare local instance variables
		let relation_obj = {};
		
		//Iterate over all .history.keyframes in order
		Object.iterate(this.history.keyframes, (local_key, local_value) => {
			if (parseFloat(local_key) <= main.timestamp)
				if (local_value?.value?.[2]?.variables) {
					let local_relation = local_value?.value?.[2]?.variables?.Relation;
					
					if (local_relation) {
						let all_local_relations = local_relation.split(",");
						
						for (let i = 0; i < all_local_relations.length; i++)
							if (all_local_relations[i].startsWith("add-")) {
								relation_obj[all_local_relations[i]] = true;
							} else if (all_local_relations[i].startsWith("remove-")) {
								delete relation_obj[all_local_relations[i].replace("remove-", "add-")];
							}
					}
				}
		}, "ascending");
		
		//Return statement
		let all_relation_keys = Object.keys(relation_obj);
		if (all_relation_keys.length > 0)
			return all_relation_keys.join(",");
		return "";
	};
	
	naissance.Geometry.parseRelationsString = function (arg0_timestamp, arg1_relations_string) {
		//Convert from parameters
		let timestamp = Date.getTimestamp(arg0_timestamp);
		let relations_string = (arg1_relations_string) ? arg1_relations_string : "";
		
		//Declare local instance variables
		let all_relations = relations_string.split(",");
		let relations_array = [];
		
		//Iterate over all_relations
		for (let i = 0; i < all_relations.length; i++) {
			let ot_entity_name;
			let split_relation = all_relations[i].split("-");
			
			//1. Fetch ot_entity_name
			if (naissance.Geometry.instances[split_relation[1]]) {
				console.log(split_relation[1]);
				let local_ot_geometry = naissance.Geometry.instances[split_relation[1]];
				let local_ot_keyframe = local_ot_geometry.history.getKeyframe({ 
					date: timestamp
				});
				
				if (local_ot_keyframe?.value?.[2]?.name)
					ot_entity_name = local_ot_keyframe.value[2].name;
			} else {
				ot_entity_name = split_relation[1];
			}
			
			//2. Push to relations_array
			if (split_relation[0] === "add") {
				if (ot_entity_name !== "indirect") {
					relations_array.push(`Added ${split_relation[2]} with ${ot_entity_name}`);
				} else {
					relations_array.push(`Joined ${split_relation[2]}`);
				}
			} else if (split_relation[0] === "remove") {
				if (ot_entity_name !== "indirect") {
					relations_array.push(`Removed ${split_relation[2]} with ${ot_entity_name}`);
				} else {
					relations_array.push(`Left ${split_relation[2]}`);
				}
			}
		}
		
		//Return statement
		return `Relations changed: ${relations_array.join(", ")}`;
	};
}