/**
 * - #### Extraneous Commands:
 *   - .create_layer: {@link Object}
 *     - .do_not_refresh=false: {@link boolean}
 *     - .id: {@link string}
 *   - .merge_layer: {@link Object}
 *     - .do_not_delete_after=false: {@link boolean}
 *     - .end_date: {@link number}|{@link Object}
 *     - .start_date: {@link number}|{@link Object}
 *     - .to_layer_id: {@link string} - The ID of the layer to merge the current layer into.
 * - #### Internal Commands:
 *   - .set_layer_option: {@link Object}
 *     - .key: {@link string} - The key to change for the selected layer.
 *     - .value: {@link any} - What to change the value of the key to.
 * 
 * @type {Object}
 */
config.actions.feature_layer = {
	create_layer: {
		name: "Create Layer",
		scope: ["FeatureLayer"],
		
		special_function: async function (json) {
			if (json.create_layer.id) {
				let new_layer = new naissance.FeatureLayer();
				new_layer.setID(json.create_layer.id);
				
				if (!json.create_layer.do_not_refresh)
					UI_Leftbar.refresh();
			}
		}
	},
	
	merge_layer: {
		name: "Merge Layer",
		scope: ["FeatureLayer"],
		
		draw_function: function () {
			//Return statement
			return {
				mode: veSelect({
					auto: { name: "Auto" },
					manual_dates: { name: "Manual Dates" }
				}, {
					name: "Mode",
					selected: (this.ui.merge_layers_mode) ? this.ui.merge_layers_mode : "auto",
					onuserchange: (v) => this.ui.merge_layers_mode = v
				}),
				to_layer: new UI_FeatureDatalist(this.ui.merge_layers_to_layer, {
					name: "To Layer",
					onuserchange: (v) => this.ui.merge_layers_to_layer = v
				}),
				
				start_date: veDate(undefined, {
					name: "Start Date",
					limit: () => this.ui.merge_layers_mode === "manual_dates",
					onuserchange: (v) => this.ui.merge_layers_start_date = v
				}),
				end_date: veDate(undefined, {
					name: "End Date",
					limit: () => this.ui.merge_layers_mode === "manual_dates",
					onuserchange: (v) => this.ui.merge_layers_end_date = v
				}),
				delete_layer_after: veToggle((this.ui.merge_layers_delete_layer_after !== undefined) ? this.ui.merge_layers_delete_layer_after : true, {
					name: "Delete Layer After",
					onuserchange: (v) => this.ui.merge_layers_delete_layer_after = v
				}),
				
				confirm: veButton(() => {
					//Internal guard clause to ensure this.ui.merge_layers_to_layer is valid
					if (!this.ui.merge_layers_to_layer) {
						veToast(`<icon>warning</icon> You must select a valid Layer to merge ${this.name} into.`);
						return;
					}
					
					let to_layer_obj = naissance.Feature.instances[this.ui.merge_layers_to_layer];
					if (!to_layer_obj) {
						veToast(`<icon>warning</icon> No Layer with the specified ID could be found.`);
						return;
					}
					if (to_layer_obj.class_name !== "FeatureLayer") {
						veToast(`<icon>warning</icon> You cannot merge ${this.name} into a ${to_layer_obj.class_name}.`);
						return;
					}
					
					//Declare local instance variables
					let options = {};
					
					if (this.ui.merge_layers_mode === "manual_dates") {
						if (this.ui.merge_layers_end_date !== undefined) options.end_date = this.ui.merge_layers_end_date;
						if (this.ui.merge_layers_start_date !== undefined) options.start_date = this.ui.merge_layers_start_date;
						if (this.ui.merge_layers_delete_layer_after) options.do_not_delete_after = true;
					}
					
					//Execute action; close windows after
					DALS.Timeline.parseAction(`merge_layer_${to_layer_obj.id}`, [{
						feature_obj: this.id,
						type: "FeatureLayer",
						merge_layer: {
							to_layer_id: to_layer_obj.id,
							...options
						}
					}]);
					
					veToast(`Successfully merged this layer into ${to_layer_obj.name}.`);
					this.merge_layers_window.close();
					this.close("instance");
				}, { name: "Confirm" })
			};
		},
		special_function: async function (json) {
			//Declare local instance variables
			let layer_obj = json.naissance_obj;
			
			let from_layer_geometries = layer_obj.getAllGeometries();
			let from_layer_json = layer_obj.toJSON();
			let from_layer_timestamps = layer_obj.getTimestamps();
			let to_layer = naissance.Feature.instances[json.merge_layer.to_layer_id];
			let to_layer_geometries = to_layer.getAllGeometries();
			let to_layer_timestamps = to_layer.getTimestamps();
			
			let from_timestamp_set = new Set(from_layer_timestamps);
			let to_timestamp_set = new Set(to_layer_timestamps);
			let all_timestamps = [...new Set([...from_layer_timestamps, ...to_layer_timestamps])]
			.sort((a, b) => a - b);
			
			let end_date = (json.merge_layer.end_date) ?
				Date.getTimestamp(json.merge_layer.end_date) : all_timestamps[all_timestamps.length - 1];
			let start_date = (json.merge_layer.start_date) ?
				Date.getTimestamp(json.merge_layer.start_date) : all_timestamps[0];
			
			//0. Pre-bake keyframes for both layers
			let baked_from = {};
			for (let i = 0; i < from_layer_geometries.length; i++)
				baked_from[from_layer_geometries[i].id] = from_layer_geometries[i].history.getKeyframe({ bake_keyframes: true });
			
			let baked_to = {};
			for (let i = 0; i < to_layer_geometries.length; i++)
				baked_to[to_layer_geometries[i].id] = to_layer_geometries[i].history.getKeyframe({ bake_keyframes: true });
			
			//Active state trackers for sequential O(1) access without looping over timestamps
			let active_from_states = {};
			let active_to_states = {};
			
			//1. Difference Layer A from Layer B to ensure unlinked source polygons have room in to_layer
			let from_layer_union;
			
			for (let i = 0; i < all_timestamps.length; i++) {
				console.time(`1. Differencing ${all_timestamps[i]} (${i}/${all_timestamps.length})`);
				let current_timestamp = all_timestamps[i];
				
				//Update active states
				for (let x = 0; x < from_layer_geometries.length; x++) {
					let geometry_id = from_layer_geometries[x].id;
					if (baked_from[geometry_id] && baked_from[geometry_id][current_timestamp])
						active_from_states[geometry_id] = baked_from[geometry_id][current_timestamp];
				}
				for (let x = 0; x < to_layer_geometries.length; x++) {
					let geometry_id = to_layer_geometries[x].id;
					if (baked_to[geometry_id] && baked_to[geometry_id][current_timestamp])
						active_to_states[geometry_id] = baked_to[geometry_id][current_timestamp];
				}
				
				if (current_timestamp >= start_date && current_timestamp <= end_date) {
					//Update the current union of geometries in the source layer at this timestamp
					if (from_timestamp_set.has(current_timestamp)) {
						from_layer_union = undefined;
						
						for (let x = 0; x < from_layer_geometries.length; x++) {
							let local_geometry = from_layer_geometries[x];
							let local_keyframe = active_from_states[local_geometry.id];
							let local_keyframe_value = local_keyframe ? local_keyframe.value[0] : undefined;
							
							if (local_keyframe_value && local_geometry.class_name === "GeometryPolygon") {
								let maptalks_json = maptalks.Geometry.fromJSON(local_keyframe_value);
								let turf_geometry = Geospatiale.convertMaptalksToTurf(maptalks_json);
								
								from_layer_union = (from_layer_union === undefined) ?
									turf_geometry : turf.union(turf.featureCollection([from_layer_union, turf_geometry]));
							}
						}
					}
					
					//Subtract source union from destination layer if destination has data or source just changed
					if (from_layer_union && (from_timestamp_set.has(current_timestamp) || to_timestamp_set.has(current_timestamp))) {
						for (let x = 0; x < to_layer_geometries.length; x++) {
							let to_geometry = to_layer_geometries[x];
							let to_keyframe = active_to_states[to_geometry.id];
							let to_keyframe_value = to_keyframe ? to_keyframe.value[0] : undefined;
							
							if (to_keyframe_value && to_geometry.class_name === "GeometryPolygon") {
								let maptalks_to = maptalks.Geometry.fromJSON(to_keyframe_value);
								let turf_to = Geospatiale.convertMaptalksToTurf(maptalks_to);
								
								let differenced_turf = turf.difference(turf.featureCollection([turf_to, from_layer_union]));
								let maptalks_result = Geospatiale.convertTurfToMaptalks(differenced_turf);
								let result_json = (maptalks_result && typeof maptalks_result.toJSON === "function") ?
									maptalks_result.toJSON() : null;
								
								to_geometry.history.addKeyframe(current_timestamp, result_json);
								
								//Propagate changes to active state to mirror immediate evaluation of updated history
								active_to_states[to_geometry.id] = { value: [result_json] };
							}
						}
					}
				}
				
				console.timeEnd(`1. Differencing ${all_timestamps[i]} (${i}/${all_timestamps.length})`);
			}
			console.log(`1. Finished differencing.`);
			
			//2. Clean to keyframes
			let to_layer_ids = [];
			for (let i = 0; i < to_layer_geometries.length; i++) to_layer_ids.push(to_layer_geometries[i].id);
			naissance.Geometry.parseActionForGeometries(to_layer_ids, {
				command: "clean_keyframes", key: "clean_keyframes", name: "Clean F.Geometry Keyframes", value: []
			});
			console.log(`2. Cleaned to keyframes.`);
			
			//3. Union linked polygons
			for (let i = 0; i < from_layer_geometries.length; i++) {
				let from_geometry = from_layer_geometries[i];
				let linked_id = from_geometry?.metadata?.linked_id;
				
				if (linked_id) {
					let to_geometry = naissance.Geometry.instances[linked_id];
					
					if (to_geometry) {
						//Re-bake to_geometry history to account for Step 1 and Step 2 changes
						let current_baked_to = to_geometry.history.getKeyframe({ bake_keyframes: true });
						let from_keys = Object.keys(from_geometry.history.keyframes).map(Number);
						let to_keys = Object.keys(to_geometry.history.keyframes).map(Number);
						let union_timestamps = [...new Set([...from_keys, ...to_keys])].sort((a, b) => a - b);
						
						let active_from;
						let active_to;
						
						for (let x = 0; x < union_timestamps.length; x++) {
							let current_timestamp = union_timestamps[x];
							
							//Update rolling states from baked data
							if (baked_from[from_geometry.id] && baked_from[from_geometry.id][current_timestamp])
								active_from = baked_from[from_geometry.id][current_timestamp];
							if (current_baked_to && current_baked_to[current_timestamp])
								active_to = current_baked_to[current_timestamp];
							
							if (current_timestamp < start_date || current_timestamp > end_date) continue;
							
							let from_value = active_from ? active_from.value[0] : undefined;
							let to_value = active_to ? active_to.value[0] : undefined;
							
							let from_turf = from_value ? Geospatiale.convertMaptalksToTurf(maptalks.Geometry.fromJSON(from_value)) : undefined;
							let to_turf = to_value ? Geospatiale.convertMaptalksToTurf(maptalks.Geometry.fromJSON(to_value)) : undefined;
							
							let result_json;
							if (from_turf && to_turf) {
								let turf_union = turf.union(turf.featureCollection([from_turf, to_turf]));
								let maptalks_union = Geospatiale.convertTurfToMaptalks(turf_union);
								result_json = (maptalks_union && typeof maptalks_union.toJSON === "function") ? maptalks_union.toJSON() : null;
							} else if (from_turf || to_turf) {
								//If only one exists, it represents the new combined state
								let existing_turf = from_turf || to_turf;
								let maptalks_geom = Geospatiale.convertTurfToMaptalks(existing_turf);
								result_json = (maptalks_geom && typeof maptalks_geom.toJSON === "function") ? maptalks_geom.toJSON() : null;
							}
							
							//Apply union results and update active state for the next timestamp
							if (result_json !== undefined) {
								to_geometry.history.addKeyframe(current_timestamp, result_json);
								active_to = { value: [result_json] };
								
								//Transfer non-geometric history data (metadata/attributes)
								let source_keyframe = from_geometry.history.keyframes[current_timestamp];
								if (source_keyframe && source_keyframe.value.length > 1) {
									let extra_values = source_keyframe.value.slice(1);
									to_geometry.history.addKeyframe(current_timestamp, undefined, ...extra_values);
								}
							}
						}
						console.log(`3. Unioned link: ${from_geometry.id} -> ${to_geometry.id}`);
					}
					from_geometry.remove();
				}
				console.log(`3. Unioning linked polygons`, from_layer_geometries[i].id, `(${i}/${from_layer_geometries.length})`);
			}
			console.log(`3. Finished unioning linked polygons.`);
			
			//4. Clip unlinked entities and prepare for transfer
			for (let i = layer_obj.entities.length - 1; i >= 0; i--) {
				let local_entity = layer_obj.entities[i];
				
				if (local_entity.class_name.startsWith("Geometry")) {
					let entity_history = local_entity.history;
					let entity_timestamps = entity_history.getTimestamps().map(Number).sort((a, b) => a - b);
					
					if (entity_timestamps.length > 0) {
						if (entity_timestamps[0] < start_date) {
							let start_keyframe = baked_from[local_entity.id] ? baked_from[local_entity.id][start_date] : undefined;
							let start_value = start_keyframe ? start_keyframe.value[0] : undefined;
							
							if (start_value && start_keyframe) entity_history.addKeyframe(start_date, ...start_keyframe.value.slice());
						}
						if (entity_timestamps[entity_timestamps.length - 1] > end_date) {
							let end_keyframe = baked_from[local_entity.id] ? baked_from[local_entity.id][end_date] : undefined;
							let end_value = end_keyframe ? end_keyframe.value[0] : undefined;
							
							if (end_value && end_keyframe) entity_history.addKeyframe(end_date, ...end_keyframe.value.slice());
						}
						
						let current_keys = Object.keys(entity_history.keyframes);
						for (let x = 0; x < current_keys.length; x++) {
							let timestamp = Number(current_keys[x]);
							if (timestamp < start_date || timestamp > end_date) delete entity_history.keyframes[timestamp];
						}
					}
					
					if (Object.keys(entity_history.keyframes).length === 0) local_entity.remove(true);
				}
				
				console.log(`4. Clip/transfer`, layer_obj.entities[i].id, `(${i}/${layer_obj.entities.length})`);
			}
			console.log(`4. Finished clip/transfer`);
			
			//5. Transfer unlinked entities
			to_layer.entities = to_layer.entities.concat(layer_obj.entities);
			layer_obj.entities = [];
			
			//6. Final cleanup
			if (!json.merge_layer.do_not_delete_after) {
				layer_obj.remove();
			} else {
				layer_obj.fromJSON(from_layer_json);
			}
		}
	},
	set_layer_option: {
		name: "Set Layer Option",
		scope: ["FeatureLayer"],
		
		special_function: async function (json) {
			//Declare local instance variables
			let layer_obj = json.naissance_obj;
			
			layer_obj[json.set_layer_option.key] = json.set_layer_option.value;
		}
	}
};