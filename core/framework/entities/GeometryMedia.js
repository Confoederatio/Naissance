if (!global.naissance) global.naissance = {};

naissance.GeometryMedia = class extends naissance.Geometry {
	static hierarchy_symbol = {
		icon: "image",
		name: "Media Overlay",
	};
	
	constructor () {
		super();
		this.class_name = "GeometryMedia";
		this.node_editor_mode = "Media";
		
		//Declare local instance variables
		this.dom_wrapper = document.createElement("div");
		this.dom_wrapper.style.height = "0";
		this.dom_wrapper.style.overflow = "visible";
		this.dom_wrapper.style.pointerEvents = "none";
		this.dom_wrapper.style.width = "0";
		
		//Full-viewport screen-space canvas attached directly to the map container
		this.canvas = document.createElement("canvas");
		this.ctx = this.canvas.getContext("2d");
		this.canvas.style.left = "0";
		this.canvas.style.pointerEvents = "none";
		this.canvas.style.position = "absolute";
		this.canvas.style.top = "0";
		this.canvas.style.zIndex = "1";
		
		map.getContainer().appendChild(this.canvas);
		
		this.base_point_radius = 6;
		this.base_hitbox_radius = 20;
		this.grid_resolution = 20;
		this.img_display_size = 400; //This is dynamically adjusted after start
		this.img_center = this.img_display_size/2;
		this.max_buffer_size = 4096;
		this.hit_area_padding = 50;
		this.max_edge_screen_px = 48;
		this.max_subdivision = 16;
		
		this._is_dragging = false;
		this._canvas_hidden = false;
		this._last_global_sync = 0;
		this.canvas_dpr = 1;
		this.image = undefined;
		this.initial_zoom = map.getZoom();
		this.geometry = undefined;
		this.mesh_points = [];
		this.mesh_triangles = [];
		this.screen_pts = [];
		this.selected_point_index = null;

		//Crop Brush Instance Variables
		this.crop_brush_active = false;
		this.crop_brush_radius = 20;
		this._is_painting_crop = false;
		this._crop_mask_dirty = false;
		this._mouse_screen_pos = null;
		this.has_crop_mask = false;
		this._loaded_crop_mask = undefined;

		//Offscreen canvas for crop mask (sized dynamically to image native resolution)
		this.crop_mask_canvas = document.createElement("canvas");
		this.crop_mask_canvas.width = this.img_display_size;
		this.crop_mask_canvas.height = this.img_display_size;
		this.crop_mask_ctx = this.crop_mask_canvas.getContext("2d");

		//Offscreen canvas for combining full-res image + crop mask
		this.masked_canvas = document.createElement("canvas");
		this.masked_canvas.width = this.img_display_size;
		this.masked_canvas.height = this.img_display_size;
		this.masked_ctx = this.masked_canvas.getContext("2d");

		//Offscreen preview canvas for rendering warped brush overlay
		this.preview_canvas = document.createElement("canvas");
		this.preview_canvas.width = this.img_display_size;
		this.preview_canvas.height = this.img_display_size;
		this.preview_ctx = this.preview_canvas.getContext("2d");
		
		//Initialise mesh and bind events
		this.initMesh();
		this.handleEvents();
		
		//Add keyframe with default coords/symbol
		let map_centre = map.getCenter();
		this.addKeyframe(main.date, {
			center: [map_centre.x, map_centre.y],
			mesh_points: JSON.parse(JSON.stringify(this.mesh_points)),
			initial_zoom: this.initial_zoom,
		}, {
			url: "",
			opacity: 0.45,
			warp_mode: "triangulation",
			crop_mask: "",
		});
		
		this.draw();
		this.updateOwner();
	}
	
	_pauseVideo () {
		if (this.video_el) {
			this.video_el.pause();
			this._last_global_sync = 0; //Reset throttle to ensure accuracy on pause
			this.syncGlobalDateToVideo(); //Force one final update on pause
		}
	}
	
	_playVideo () {
		if (this.video_el) this.video_el.play();
	}

	getImageDimensions () {
		if (!this.image) return { w: this.img_display_size, h: this.img_display_size };
		let w = this.image.naturalWidth || this.image.videoWidth || this.img_display_size;
		let h = this.image.naturalHeight || this.image.videoHeight || this.img_display_size;
		return { w: w, h: h };
	}

	updateMaskCanvasSize () {
		let dim = this.getImageDimensions();
		if (this.crop_mask_canvas.width !== dim.w || this.crop_mask_canvas.height !== dim.h) {
			let tmp = document.createElement("canvas");
			tmp.width = this.crop_mask_canvas.width;
			tmp.height = this.crop_mask_canvas.height;
			if (tmp.width > 0 && tmp.height > 0) {
				tmp.getContext("2d").drawImage(this.crop_mask_canvas, 0, 0);
			}

			this.crop_mask_canvas.width = dim.w;
			this.crop_mask_canvas.height = dim.h;
			if (tmp.width > 0 && tmp.height > 0) {
				this.crop_mask_ctx.drawImage(tmp, 0, 0, dim.w, dim.h);
			}
		}
		if (this.masked_canvas.width !== dim.w || this.masked_canvas.height !== dim.h) {
			this.masked_canvas.width = dim.w;
			this.masked_canvas.height = dim.h;
		}
		if (this.preview_canvas.width !== dim.w || this.preview_canvas.height !== dim.h) {
			this.preview_canvas.width = dim.w;
			this.preview_canvas.height = dim.h;
		}
	}

	getImageSourcePosAtScreenPt (arg0_sp) {
		let sp = arg0_sp;
		if (!sp) return null;
		let container_pt = new maptalks.Point(sp.x, sp.y);
		let coord = map.containerPointToCoordinate(container_pt);
		if (!coord) return null;
		let world_pos = this.getLngLatToWorld(coord.x, coord.y);
		if (!world_pos) return null;

		for (let i = 0; i < this.mesh_triangles.length; i += 3) {
			let pt1 = this.mesh_points[this.mesh_triangles[i]],
				pt2 = this.mesh_points[this.mesh_triangles[i + 1]],
				pt3 = this.mesh_points[this.mesh_triangles[i + 2]];
			let bary_info = Geospatiale.getBarycentric(world_pos, pt1, pt2, pt3);
			if (bary_info.inside) {
				return {
					x: bary_info.u * pt1.src_x + bary_info.v * pt2.src_x + bary_info.w * pt3.src_x,
					y: bary_info.u * pt1.src_y + bary_info.v * pt2.src_y + bary_info.w * pt3.src_y,
					world_pos: world_pos
				};
			}
		}
		if (world_pos.x >= 0 && world_pos.x <= this.img_display_size &&
			world_pos.y >= 0 && world_pos.y <= this.img_display_size) {
			return { x: world_pos.x, y: world_pos.y, world_pos: world_pos };
		}
		return null;
	}

	loadCropMask (arg0_data_url) {
		let data_url = arg0_data_url;
		if (!data_url) {
			let dim = this.getImageDimensions();
			this.crop_mask_ctx.clearRect(0, 0, dim.w, dim.h);
			this.has_crop_mask = false;
			this.render();
			return;
		}
		let img = new Image();
		img.onload = () => {
			let dim = this.getImageDimensions();
			this.crop_mask_canvas.width = img.naturalWidth || dim.w;
			this.crop_mask_canvas.height = img.naturalHeight || dim.h;
			this.crop_mask_ctx.clearRect(0, 0, this.crop_mask_canvas.width, this.crop_mask_canvas.height);
			this.crop_mask_ctx.drawImage(img, 0, 0);
			this.has_crop_mask = true;
			this.render();
		};
		img.src = data_url;
	}

	paintCropBrush (arg0_e) {
		let e = arg0_e;
		let mouse_sp = this.getEventScreenPos(e);
		let center_info = this.getImageSourcePosAtScreenPt(mouse_sp);
		if (!center_info) return;

		let is_erase = (e.buttons === 2 || e.button === 2);
		let is_draw = (e.buttons === 1 || e.button === 0);

		if (!is_draw && !is_erase) return;

		let dim = this.getImageDimensions();
		this.updateMaskCanvasSize();

		let scale_x = dim.w / this.img_display_size;
		let scale_y = dim.h / this.img_display_size;

		let center_mask_x = center_info.x * scale_x;
		let center_mask_y = center_info.y * scale_y;

		// Calculate mask canvas radius matching screen brush radius
		let R_screen = this.crop_brush_radius;
		let edge_sp = { x: mouse_sp.x + R_screen, y: mouse_sp.y };
		let edge_info = this.getImageSourcePosAtScreenPt(edge_sp);

		let mask_radius;
		if (edge_info) {
			let edge_mask_x = edge_info.x * scale_x;
			let edge_mask_y = edge_info.y * scale_y;
			mask_radius = Math.hypot(edge_mask_x - center_mask_x, edge_mask_y - center_mask_y);
		} else {
			let sample_sp = { x: mouse_sp.x + 5, y: mouse_sp.y };
			let sample_info = this.getImageSourcePosAtScreenPt(sample_sp);
			if (sample_info) {
				let sample_mask_x = sample_info.x * scale_x;
				let sample_mask_y = sample_info.y * scale_y;
				let dist_5 = Math.hypot(sample_mask_x - center_mask_x, sample_mask_y - center_mask_y);
				mask_radius = dist_5 * (R_screen / 5);
			} else {
				mask_radius = R_screen * scale_x;
			}
		}

		if (mask_radius <= 0) mask_radius = 1;

		this.crop_mask_ctx.save();
		if (is_erase) {
			// Remove from mask (restore pixels)
			this.crop_mask_ctx.globalCompositeOperation = "destination-out";
		} else {
			// Add to mask (turn pixels transparent)
			this.crop_mask_ctx.globalCompositeOperation = "source-over";
			this.crop_mask_ctx.fillStyle = "black";
		}

		this.crop_mask_ctx.beginPath();
		this.crop_mask_ctx.arc(center_mask_x, center_mask_y, mask_radius, 0, Math.PI * 2);
		this.crop_mask_ctx.fill();
		this.crop_mask_ctx.restore();

		this.has_crop_mask = true;
		this._crop_mask_dirty = true;
		this.render();
	}
	
	draw () {
		//Declare local instance variables
		let derender_geometry = false;
		
		//1. Set this.value from current relative keyframe
		this.value = this.history.getKeyframe({
			date: main.date,
			guaranteed_indexes: [1],
		}).value;
		this.value[1] = this.getSymbol(this.value[1]);
		
		//2. Check any cause for derendering
		if (!this.value || this._is_visible === false) derender_geometry = true;
		if (!this.value[0]) derender_geometry = true;
		if (this.value && this.value[2]) {
			if (this.value[2].hidden) derender_geometry = true;
			if (this.value[2].max_zoom && map.getZoom() > this.value[2].max_zoom) derender_geometry = true;
			if (this.value[2].min_zoom && map.getZoom() < this.value[2].min_zoom) derender_geometry = true;
		}
		
		//3. Draw this.geometry onto map
		if (!derender_geometry) {
			try {
				if (!map || !map.isLoaded()) return;
				let coords_obj = this.value[0];
				let symbol_obj = (this.value?.[1]) ? this.value[1] : {};
				
				this.initial_zoom = coords_obj.initial_zoom ?? this.initial_zoom;
				if (this.selected_point_index === null && coords_obj.mesh_points) {
					this.mesh_points = JSON.parse(JSON.stringify(coords_obj.mesh_points));
					this.updateTriangulation();
				}
				
				if (!this.geometry) {
					this.geometry = new maptalks.ui.UIMarker(coords_obj.center, {
						draggable: false,
						single: false,
						content: this.dom_wrapper
					});
					this.geometry.addTo(map);
				} else {
					this.geometry.setCoordinates(new maptalks.Coordinate(coords_obj.center));
				}
				if (this.geometry.getMap()) this.geometry.show();
				
				this.canvas.style.display = "";
				this._canvas_hidden = false;
				this.canvas.style.opacity = String(Math.returnSafeNumber(symbol_obj.opacity, 0.45));
				
				if (this._loaded_url !== symbol_obj.url || this._loaded_timestamp !== symbol_obj.timestamp) {
					this.loadFile(symbol_obj.url, symbol_obj.timestamp);
					this._loaded_timestamp = symbol_obj.timestamp;
				}

				if (this._loaded_crop_mask !== symbol_obj.crop_mask) {
					this._loaded_crop_mask = symbol_obj.crop_mask;
					this.loadCropMask(symbol_obj.crop_mask);
				}

				this.render();
			} catch (e) { console.error(e); }
		} else {
			//Derender geometry
			if (this.geometry) this.geometry.hide();
			this.canvas.style.display = "none";
			this._canvas_hidden = true;
		}
		
		//Draw keyframes
		if (this.geometry && !derender_geometry) this.history.draw(this.keyframes_ui);
	}
	
	drawUI () {
		//Declare local instance variables
		let symbol_obj = (this.value?.[1]) ? this.value[1] : {};
		let current_metadata = symbol_obj.metadata || {};
		
		//Initialise elements if not already extant
		if (!this.points_area) {
			this.points_area = document.createElement("textarea");
			this.points_area.rows = 8;
			this.points_area.addEventListener("input", () => {
				let area_coords = Geospatiale.parseCoords(this.points_area.value);
				if (area_coords.length > 0) {
					this.mesh_points = area_coords.map((c, i) => {
						let world = this.getLngLatToWorld(c[0], c[1]);
						let existing = this.mesh_points[i];
						
						//Return statement
						return {
							x: world.x,
							y: world.y,
							src_x: (existing) ? existing.src_x : world.x,
							src_y: (existing) ? existing.src_y : world.y,
						};
					});
					this.updateTriangulation();
					this.updateKeyframe();
				}
			});
			
			this.extent_area = document.createElement("textarea");
			this.extent_area.rows = 3;
			this.extent_area.addEventListener("input", () => {
				let extent_coords = Geospatiale.parseCoords(this.extent_area.value);
				if (extent_coords.length >= 2 && this.mesh_points.length >= 4) {
					let lng_values = extent_coords.map((c) => c[0]),
						lat_values = extent_coords.map((c) => c[1]);
					let min_lng = Math.min(...lng_values),
						max_lng = Math.max(...lng_values),
						min_lat = Math.min(...lat_values),
						max_lat = Math.max(...lat_values);
					let mesh_corners = [
						[min_lng, max_lat],
						[max_lng, max_lat],
						[max_lng, min_lat],
						[min_lng, min_lat],
					];
					mesh_corners.forEach((coord, i) => {
						let world_pos = this.getLngLatToWorld(coord[0], coord[1]);
						this.mesh_points[i].x = world_pos.x;
						this.mesh_points[i].y = world_pos.y;
					});
					this.updateKeyframe();
				}
			});
		}
		
		//Return statement
		return {
			edit_image_ui: veInterface({
				warp_mode_select: veSelect({
					triangulation: { name: "Affine Triangles" },
					tps: { name: "Thin Plate Spline" },
				}, {
					name: "Warp Mode",
					selected: (symbol_obj.warp_mode || "triangulation"),
					onuserchange: (v) => this.updateKeyframe({ warp_mode: v }),
				}),
				crop_brush_toggle: veToggle(this.crop_brush_active, {
					name: "Crop Brush Tool",
					onuserchange: (v) => {
						this.toggleCropBrush(v);
						this.render();
					},
				}),
				clear_crop_mask: veButton(() => {
					let dim = this.getImageDimensions();
					this.crop_mask_ctx.clearRect(0, 0, dim.w, dim.h);
					this.has_crop_mask = false;
					this._crop_mask_dirty = false;
					this.updateKeyframe({ crop_mask: "" });
					this.render();
				}, { name: "Clear Crop Mask" }),
				disable_pitch_checkbox: veCheckbox(symbol_obj.disable_pitch || false, {
					name: "Disable Pitch",
					onuserchange: (v) => this.updateKeyframe({ disable_pitch: v }),
				}),
				disable_rotation: veCheckbox(symbol_obj.disable_rotation || false, {
					name: "Disable Rotation",
					onuserchange: (v) => this.updateKeyframe({ disable_rotation: v }),
				}),
				points_label: veHTML("Control Points [Lng, Lat]"),
				points_area: veHTML(this.points_area),
				extent_label: veHTML("Canvas Extent [NW, SE]"),
				extent_area: veHTML(this.extent_area),
				opacity_slider: veRange(Math.returnSafeNumber(symbol_obj.opacity, 0.45), {
					name: "Opacity",
					min: 0,
					max: 1,
					step: 0.01,
					onuserchange: (v) => {
						this.canvas.style.opacity = v;
						this.updateKeyframe({ opacity: v });
					},
				}),
				url_input: veText(symbol_obj.url || "", {
					name: "Media URL",
					onuserchange: (v) => this.updateKeyframe({ url: v }),
				}),
				media_timestamp: veNumber(symbol_obj.timestamp, {
					name: "Media Timestamp",
					limit: () => File.isVideo(this._loaded_url),
					onuserchange: (v) => this.updateKeyframe({ timestamp: v }),
				}),
				media_controls: veRawInterface({
					media_play: veButton(() =>  this._playVideo(),
						{ name: "Play Video", limit: () => this.video_el?.paused }),
					media_pause: veButton(() => this._pauseVideo(),
						{ name: "Pause Video", limit: () => !this.video_el?.paused }),
					edit_video: veButton(() => {
						let current_timeframes = [];
						let symbol_obj = (this.value?.[1]) ? this.value[1] : {};
						
						//Iterate over all symbol_obj.timeframes
						if (!symbol_obj.timeframes)
							symbol_obj.timeframes = [{ date: structuredClone(main.date), timestamp: 0 }];
						if (symbol_obj.timeframes) {
							for (let i = 0; i < symbol_obj.timeframes.length; i++)
								current_timeframes.push(veInterface({
									date: veDate(structuredClone(symbol_obj.timeframes[i].date), {
										tooltip: "Date at Timestamp",
										x: 0, y: 0
									}),
									timestamp: veTime(symbol_obj.timeframes[i].timestamp, {
										tooltip: "Timestamp (hh:mm:ss.ms)",
										x: 1, y: 0
									})
								}, { is_folder: false }));
						}
						
						this.video_window = veWindow({
							video_el: veHTML(this.video_el, {
								style: { "video": { width: "100%" } }
							}),
							video_settings: veInterface({
								//Row 1
								go_to_media_timestamp: veButton(() => {
									if (this.video_el) {
										let timestamp = Math.returnSafeNumber(this.value?.[1]?.timestamp);
										
										this.video_el.currentTime = timestamp;
										if (typeof veToast === "function") veToast(`Jumped to ${timestamp}s.`);
									}
								}, { 
									name: "Go To Media Timestamp",
									x: 0, y: 0
								}),
								enable_sync: veToggle(symbol_obj.enable_sync, {
									name: "Enable Sync",
									onuserchange: (v) => this.updateKeyframe({ enable_sync: v }),
									x: 1, y: 0
								}),
								
								//Row 2
								video_sync_global_date: veCheckbox(symbol_obj.video_sync_global_date, {
									name: "Move Global Date with Video",
									onuserchange: (v) => this.updateKeyframe({ video_sync_global_date: v }),
									x: 0, y: 1
								}),
								frame_increment: veNumber(Math.returnSafeNumber(current_metadata.frame_increment, 1), {
									name: "Frame Increment (Frames)",
									onuserchange: (v) => {
										if (!this.metadata) this.metadata = {};
										this.metadata.frame_increment = v;
									},
									tooltip: `<kbd>Ctrl + Left Arrow</kbd> goes back this many frames, <kbd>Ctrl + Right Arrow</kbd> goes forwards this many frames, but only when the video itself is selected.<br><br>Default assumption is 30FPS.`,
									x: 1, y: 1
								}),
							}, { name: "Video Settings" }),
							
							timeframes: veList(current_timeframes, {
								name: "Edit Timestamps",
								onadd: (v) => {
									v.date.v = structuredClone(main.date);
									v.timestamp.v = Math.returnSafeNumber(this.video_el?.currentTime);
								},
								onuserchange: (v) => {
									let updated_list = v.map((item) => ({
										date: item.date.v,
										timestamp: item.timestamp.v,
									}));
									this.updateKeyframe({ timeframes: updated_list });
								},
								style: {
									"[component='ve-interface'] td": { verticalAlign: "bottom" }
								}
							})
						}, {
							name: `Video Controls (${this.name})`,
							can_rename: false
						})
					}, { name: "Edit Video" })
				}, {
					limit: () => File.isVideo(this._loaded_url),
					style: { "[component='ve-button']": { marginLeft: "var(--padding)" } }
				})
			},
			{ name: "Edit Image", open: true }),
		};
	}
	
	getEventWorldPos (e) {
		//Declare local instance variables
		let rect = map.getContainer().getBoundingClientRect();
		let pt = new maptalks.Point(e.clientX - rect.left, e.clientY - rect.top);
		let coord = map.containerPointToCoordinate(pt);
		
		//Return statement
		if (!coord) return null;
		return this.getLngLatToWorld(coord.x, coord.y);
	}
	
	getEventScreenPos (e) {
		//Declare local instance variables
		let rect = map.getContainer().getBoundingClientRect();
		
		//Return statement
		return { x: e.clientX - rect.left, y: e.clientY - rect.top };
	}
	
	getHitpointIndex (arg0_mouse_sp) {
		//Convert from parameters
		let mouse_sp = arg0_mouse_sp;
		
		//Return statement
		if (!this.screen_pts) return null;
		return Geospatiale.getPointIndexAt(mouse_sp.x, mouse_sp.y, 
			this.screen_pts.map((p) => ({ x: p.screen_x, y: p.screen_y })), 
			1, this.base_hitbox_radius);
	}
	
	getLngLatToWorld (arg0_lng, arg1_lat) {
		//Convert from parameters
		let lng = arg0_lng;
		let lat = arg1_lat;
		
		//Declare local instance variables
		let projection = map.getProjection(),
			marker_coord = this.geometry.getCoordinates(),
			res = map.getResolution(this.initial_zoom);
		let center_auc = projection.project(marker_coord),
			target_auc = projection.project(new maptalks.Coordinate(lng, lat));
		
		//Return statement
		return {
			x: (target_auc.x - center_auc.x)/res + this.img_center,
			y: this.img_center - (target_auc.y - center_auc.y)/res,
		};
	}
	
	getWorldToLngLat (arg0_wx, arg1_wy) {
		//Convert from parameters
		let wx = arg0_wx;
		let wy = arg1_wy;
		
		//Declare local instance variables
		let projection = map.getProjection(),
			marker_coord = this.geometry.getCoordinates(),
			res = map.getResolution(this.initial_zoom);
		let center_auc = projection.project(marker_coord);
		let target_auc = new maptalks.Coordinate(
			center_auc.x + (wx - this.img_center)*res,
			center_auc.y - (wy - this.img_center)*res);
		let coordinate_result = projection.unproject(target_auc);
		
		//Return statement
		return [coordinate_result.x, coordinate_result.y];
	}
	
	getWorldToScreen (arg0_wx, arg1_wy, arg2_fallback_sp) {
		//Convert from parameters
		let wx = arg0_wx;
		let wy = arg1_wy;
		let fallback_sp = arg2_fallback_sp;
		
		//Declare local instance variables
		let coord = this.getWorldToLngLat(wx, wy);
		let symbol_obj = (this.value?.[1]) ? this.value[1] : {};
		let sp;
		
		if (symbol_obj.disable_pitch) {
			//Case: Pitch is disabled. Handle rotation manually for 2D flattening.
			let map_size = map.getSize();
			let projection = map.getProjection();
			let center_auc = projection.project(map.getCenter());
			let target_auc = projection.project(new maptalks.Coordinate(coord[0], coord[1]));
			let current_res = map.getResolution();
			
			let dx = (target_auc.x - center_auc.x)/current_res;
			let dy = (target_auc.y - center_auc.y)/current_res;
			
			let bearing_rad = (symbol_obj.disable_rotation) ? 0 : (map.getBearing() || 0)*Math.PI/180;
			let rx = (bearing_rad !== 0) ? dx*Math.cos(bearing_rad) - dy*Math.sin(bearing_rad) : dx;
			let ry = (bearing_rad !== 0) ? dx*Math.sin(bearing_rad) + dy*Math.cos(bearing_rad) : dy;
			
			sp = {
				x: map_size.width / 2 + rx,
				y: map_size.height / 2 - ry
			};
		} else if (symbol_obj.disable_rotation && map.getBearing() !== 0) {
			//Case: Only rotation is disabled. We pre-rotate the point in AUC space to cancel map bearing.
			let projection = map.getProjection();
			let center_auc = projection.project(map.getCenter());
			let target_auc = projection.project(new maptalks.Coordinate(coord[0], coord[1]));
			let bearing_rad = -(map.getBearing() || 0)*Math.PI/180;
			
			let dx = target_auc.x - center_auc.x;
			let dy = target_auc.y - center_auc.y;
			
			let rx = dx*Math.cos(bearing_rad) - dy*Math.sin(bearing_rad);
			let ry = dx*Math.sin(bearing_rad) + dy*Math.cos(bearing_rad);
			
			let rotated_coord = projection.unproject(new maptalks.Coordinate(center_auc.x + rx, center_auc.y + ry));
			sp = map.coordinateToContainerPoint(rotated_coord);
		} else {
			//Case: Standard behaviour.
			sp = map.coordinateToContainerPoint(new maptalks.Coordinate(coord[0], coord[1]));
		}
		
		//Determine sp
		if (!sp || isNaN(sp.x) || isNaN(sp.y)) sp = (fallback_sp || { x: 0, y: 0 });
		
		let sx = sp.x,
			sy = sp.y;
		if (sx > 20000) sx = 20000;
		if (sx < -20000) sx = -20000;
		if (sy > 20000) sy = 20000;
		if (sy < -20000) sy = -20000;
		
		//Return statement
		return { x: sx, y: sy };
	}
	
	handleEvents () {
		//Declare local instance variables; add event handlers
		let container = map.getContainer();
		
		this._onmousedown = (e) => this.handleMouseDown(e);
		this._onmousemove = (e) => this.handleMouseMove(e);
		this._onmouseup = (e) => this.handleMouseUp(e);
		this._onkeydown = (e) => this.handleKeyDown(e);
		this._oncontextmenu = (e) => {
			if (this.crop_brush_active) {
				e.preventDefault();
				e.stopPropagation();
			}
		};
		this._onwheel = (e) => {
			if (this.crop_brush_active && (e.ctrlKey || HTML.ctrl_pressed)) {
				e.preventDefault();
				e.stopPropagation();
				let delta = (e.deltaY < 0) ? -2 : 2;
				this.crop_brush_radius = Math.max(2, Math.min(200, this.crop_brush_radius + delta));
				this.render();
			}
		};
		
		container.addEventListener("mousedown", this._onmousedown, true);
		container.addEventListener("mousemove", this._onmousemove, true);
		container.addEventListener("mouseup", this._onmouseup, true);
		container.addEventListener("contextmenu", this._oncontextmenu, true);
		container.addEventListener("wheel", this._onwheel, { capture: true, passive: false });
		
		document.addEventListener("keydown", this._onkeydown, true);
		
		//Add map refresh call
		map.on("viewchange mousemove", () => this.render());
	}
	
	handleKeyDown (e) {
		if (!this.selected || !this.video_el) return;
		
		//Ignore if user is typing in an input element
		if (e.target && ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) return;

		if (e.ctrlKey || HTML.ctrl_pressed) {
			if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
				e.preventDefault();
				e.stopPropagation();
				
				let metadata = (this.metadata || {});
				let frames = Math.returnSafeNumber(metadata.frame_increment, 1);
				
				//Assuming standard 30FPS for generic video frame steps
				let step = frames*(1/30);

				if (e.key === "ArrowLeft") {
					this.video_el.currentTime = Math.max(0, this.video_el.currentTime - step);
				} else if (e.key === "ArrowRight") {
					this.video_el.currentTime = this.video_el.currentTime + step;
				}

				//Force render and obey sync logic
				this.render();
				this.syncGlobalDateToVideo(true);
			}
		}
	}
	
	handleMouseDown (e) {
		if (!this.isPrimarySelected() || this._canvas_hidden || e.button === 1) return; //Internal guard clause
		
		if (this.crop_brush_active) {
			if (e.button === 0 || e.button === 2) {
				this._is_painting_crop = true;
				e.stopPropagation();
				e.preventDefault();
				this.paintCropBrush(e);
				return;
			}
		}

		if (HTML.ctrl_pressed) {
			let mouse_sp = this.getEventScreenPos(e);
			let point_idx = this.getHitpointIndex(mouse_sp);
			
			if (point_idx !== null) {
				e.stopPropagation();
				e.preventDefault();
				
				this.mesh_points.splice(point_idx, 1);
				this.updateTriangulation();
				this.updateKeyframe();
				this.render();
			}
		} else {
			let mouse_sp = this.getEventScreenPos(e);
			this.selected_point_index = this.getHitpointIndex(mouse_sp);
			this._is_dragging = false;
			
			if (this.selected_point_index === null) {
				if (!this.isInsideImageArea(mouse_sp)) return;
				
				let world_pos = this.getEventWorldPos(e);
				if (!world_pos) return;
				
				e.stopPropagation();
				e.preventDefault();
				
				let source_x = world_pos.x,
					source_y = world_pos.y;
				for (let i = 0; i < this.mesh_triangles.length; i += 3) {
					let pt1 = this.mesh_points[this.mesh_triangles[i]],
						pt2 = this.mesh_points[this.mesh_triangles[i + 1]],
						pt3 = this.mesh_points[this.mesh_triangles[i + 2]];
					let bary_info = Geospatiale.getBarycentric(world_pos, pt1, pt2, pt3);
					if (bary_info.inside) {
						source_x = bary_info.u*pt1.src_x + bary_info.v*pt2.src_x + bary_info.w*pt3.src_x;
						source_y = bary_info.u*pt1.src_y + bary_info.v*pt2.src_y + bary_info.w*pt3.src_y;
						break;
					}
				}
				this.mesh_points.push({
					x: world_pos.x,
					y: world_pos.y,
					src_x: source_x,
					src_y: source_y,
				});
				this.selected_point_index = this.mesh_points.length - 1;
				this.updateTriangulation();
				this.render();
				this.updateKeyframe();
			} else {
				e.stopPropagation();
				e.preventDefault();
			}
		}
	}
	
	handleMouseMove (e) {
		this._mouse_screen_pos = this.getEventScreenPos(e);

		if (this.crop_brush_active) {
			if (this._is_painting_crop || e.buttons === 1 || e.buttons === 2) {
				e.stopPropagation();
				e.preventDefault();
				this.paintCropBrush(e);
			} else {
				this.render();
			}
			return;
		}

		if (!this.isPrimarySelected() || this.selected_point_index === null) return;
		this._is_dragging = true;
		
		e.stopPropagation();
		e.preventDefault();
		
		let world_pos = this.getEventWorldPos(e);
		if (!world_pos) return;
		
		this.mesh_points[this.selected_point_index].x = world_pos.x;
		this.mesh_points[this.selected_point_index].y = world_pos.y;
		this.render();
	}
	
	handleMouseUp (e) {
		if (this._is_painting_crop) {
			this._is_painting_crop = false;
			e.stopPropagation();
			e.preventDefault();
			if (this._crop_mask_dirty) {
				this._crop_mask_dirty = false;
				this.updateKeyframe({ crop_mask: this.crop_mask_canvas.toDataURL() });
			}
			return;
		}

		if (this.selected_point_index !== null) {
			e.stopPropagation();
			e.preventDefault();
			
			this.selected_point_index = null;
			if (this._is_dragging) {
				this._is_dragging = false;
				this.updateKeyframe();
			}
		}
	}
	
	initMesh () {
		this.mesh_points = [
			{ x: 0, y: 0, src_x: 0, src_y: 0 },
			{ x: this.img_display_size, y: 0, src_x: this.img_display_size, src_y: 0 },
			{
				x: this.img_display_size,
				y: this.img_display_size,
				src_x: this.img_display_size,
				src_y: this.img_display_size,
			},
			{ x: 0, y: this.img_display_size, src_x: 0, src_y: this.img_display_size },
		];
		this.updateTriangulation();
	}
	
	isInsideImageArea (arg0_mouse_sp) {
		//Convert from parameters
		let mouse_sp = arg0_mouse_sp;
		
		if (!this.screen_pts || this.screen_pts.length === 0) return false; //Internal guard clause
		
		//Declare local instance variables
		let min_x = Infinity,
			min_y = Infinity,
			max_x = -Infinity,
			max_y = -Infinity;
		
		//Iterate over all this.screen_pts
		for (let p of this.screen_pts) {
			if (p.screen_x < min_x) min_x = p.screen_x;
			if (p.screen_y < min_y) min_y = p.screen_y;
			if (p.screen_x > max_x) max_x = p.screen_x;
			if (p.screen_y > max_y) max_y = p.screen_y;
		}
		
		//Return statement
		return (mouse_sp.x >= min_x - this.hit_area_padding &&
			mouse_sp.x <= max_x + this.hit_area_padding &&
			mouse_sp.y >= min_y - this.hit_area_padding &&
			mouse_sp.y <= max_y + this.hit_area_padding);
	}
	
	isPrimarySelected () { return (main.brush?.selected_geometry?.id === this.id); }
	
	loadFile (arg0_url, arg1_timestamp) {
		//Convert from parameters
		let file_path = arg0_url;
		let timestamp = Math.returnSafeNumber(arg1_timestamp);
		
		//Declare local instance variables
		let is_image = File.isImage(file_path);
		
		this._loaded_url = file_path;
		if (is_image) {
			this.loadImage(file_path);
		} else {
			this.loadVideo(file_path, timestamp);
		}
	}
	
	loadImage (arg0_url) {
		//Convert from parameters
		let url = (arg0_url) ? arg0_url : "";
		
		//Declare local instance variables
		let map_defines = config.defines.map;
		
		//Construct new image
		this.image = new Image();
		this.image.onerror = () => console.error("Image failed to load:", url);
		this.image.onload = () => {
			this.updateMaskCanvasSize();
			this.render();
		};
		
		//Ensure image validity
		this.image.src = (url || map_defines.default_image_src);
	}
	
	loadVideo (arg0_url, arg1_timestamp) {
		//Convert from parameters
		let file_path = arg0_url;
		let timestamp = Math.returnSafeNumber(arg1_timestamp);
		
		//Declare local instance variables
		let map_defines = config.defines.map;
		
		if (!this.video_el) {
			this.video_el = document.createElement("video");
			this.video_el.controls = true;
			this.video_el.crossOrigin = "anonymous";
			this.video_el.muted = true;
			this.video_el.playsInline = true;
			
			//Drive canvas frames and throttled date sync during playback
			this.video_el.ontimeupdate = () => this.render();
			
			//Ensure sync is immediate when user manually jumps the playbar
			this.video_el.addEventListener("seeked", () => {
				this.image = this.video_el;
				this.updateMaskCanvasSize();
				this.render();
				this.syncGlobalDateToVideo(true);
			});
		}
		
		if (this.video_el.src !== file_path) this.video_el.src = file_path;
		
		//If the video is playing, don't force a seek
		if (!this.video_el.paused) {
			this.image = this.video_el;
			this.updateMaskCanvasSize();
			return; //Internal guard clause
		}
		
		//Only seek if the timestamp is significantly different from current position
		if (Math.abs(this.video_el.currentTime - timestamp) > 0.1) {
			this.video_el.currentTime = timestamp;
			this.video_el.onseeked = () => {
				this.image = this.video_el;
				this.updateMaskCanvasSize();
				this.render();
			};
		} else {
			this.image = this.video_el;
			this.updateMaskCanvasSize();
		}
		
		//Log any media errors
		this.video_el.onerror = (arg0_e) => {
			console.error("Video source failed to load:", file_path, arg0_e);
			this.loadImage(map_defines.default_image_src);
		};
	}
	
	remove (arg0_do_not_refresh) {
		if (this.geometry) this.geometry.remove();
		
		if (this.canvas && this.canvas.parentNode) this.canvas.parentNode.removeChild(this.canvas);
		let container = map.getContainer();
		if (container) {
			container.removeEventListener("mousedown", this._onmousedown, true);
			container.removeEventListener("mousemove", this._onmousemove, true);
			container.removeEventListener("mouseup", this._onmouseup, true);
			if (this._oncontextmenu) container.removeEventListener("contextmenu", this._oncontextmenu, true);
			if (this._onwheel) container.removeEventListener("wheel", this._onwheel, { capture: true });
		}
		if (this._onkeydown) document.removeEventListener("keydown", this._onkeydown, true);
		
		super.remove(arg0_do_not_refresh);
	}
	
	render () {
		//Convert from parameters
		let symbol_obj = (this.value?.[1]) ? this.value[1] : {};
		
		if (!this.image) return; //Internal guard clause for this.image
		
		if (this.image instanceof HTMLImageElement) {
			if (!this.image.complete || this.image.naturalWidth === 0) return;
		} else if (this.image instanceof HTMLVideoElement) {
			if (this.image.readyState < 2) return; // HAVE_CURRENT_DATA
		}
		
		if (!map || !map.isLoaded() || !this.geometry || this._canvas_hidden) return;
		
		this.updateBufferSize();
		if (!this.screen_pts) return;
		
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.save();
		this.ctx.scale(this.canvas_dpr, this.canvas_dpr);

		//Composite high-res image with crop mask if active
		this.updateMaskCanvasSize();
		let dim = this.getImageDimensions();

		let active_image = this.image;
		if (this.has_crop_mask) {
			this.masked_ctx.clearRect(0, 0, dim.w, dim.h);
			this.masked_ctx.drawImage(this.image, 0, 0, dim.w, dim.h);
			this.masked_ctx.globalCompositeOperation = "destination-out";
			this.masked_ctx.drawImage(this.crop_mask_canvas, 0, 0, dim.w, dim.h);
			this.masked_ctx.globalCompositeOperation = "source-over";
			active_image = this.masked_canvas;
		}

		//Render brush preview onto texture overlay so it passes through identical warp projections
		if (this.crop_brush_active && this._mouse_screen_pos) {
			let center_info = this.getImageSourcePosAtScreenPt(this._mouse_screen_pos);
			if (center_info) {
				let scale_x = dim.w / this.img_display_size;
				let scale_y = dim.h / this.img_display_size;
				let center_mask_x = center_info.x * scale_x;
				let center_mask_y = center_info.y * scale_y;

				let R_screen = this.crop_brush_radius;
				let edge_sp = { x: this._mouse_screen_pos.x + R_screen, y: this._mouse_screen_pos.y };
				let edge_info = this.getImageSourcePosAtScreenPt(edge_sp);

				let mask_radius;
				if (edge_info) {
					let edge_mask_x = edge_info.x * scale_x;
					let edge_mask_y = edge_info.y * scale_y;
					mask_radius = Math.hypot(edge_mask_x - center_mask_x, edge_mask_y - center_mask_y);
				} else {
					let sample_sp = { x: this._mouse_screen_pos.x + 5, y: this._mouse_screen_pos.y };
					let sample_info = this.getImageSourcePosAtScreenPt(sample_sp);
					if (sample_info) {
						let sample_mask_x = sample_info.x * scale_x;
						let sample_mask_y = sample_info.y * scale_y;
						let dist_5 = Math.hypot(sample_mask_x - center_mask_x, sample_mask_y - center_mask_y);
						mask_radius = dist_5 * (R_screen / 5);
					} else {
						mask_radius = R_screen * scale_x;
					}
				}
				if (mask_radius <= 0) mask_radius = 1;

				this.preview_ctx.clearRect(0, 0, dim.w, dim.h);
				this.preview_ctx.drawImage(active_image, 0, 0, dim.w, dim.h);
				this.preview_ctx.save();
				this.preview_ctx.beginPath();
				this.preview_ctx.arc(center_mask_x, center_mask_y, mask_radius, 0, Math.PI * 2);
				this.preview_ctx.lineWidth = 1;
				this.preview_ctx.strokeStyle = "rgb(240, 60, 60)";
				this.preview_ctx.fillStyle = "rgba(240, 60, 60, 0.5)";
				this.preview_ctx.fill();
				this.preview_ctx.stroke();
				this.preview_ctx.restore();

				active_image = this.preview_canvas;
			}
		}
		
		let warp_mode = (symbol_obj.warp_mode || "triangulation");
		
		if (warp_mode === "tps" && this.mesh_points.length >= 3) {
			this.renderTPSSubdivided(active_image);
		} else {
			for (let i = 0; i < this.mesh_triangles.length; i += 3) {
				let a = this.screen_pts[this.mesh_triangles[i]];
				let b = this.screen_pts[this.mesh_triangles[i + 1]];
				let c = this.screen_pts[this.mesh_triangles[i + 2]];
				this.renderTriangleSubdivided(a, b, c, active_image);
			}
		}
		
		if (this.isPrimarySelected()) {
			let overlay_pts = this.screen_pts.map((p) => ({
				x: p.screen_x,
				y: p.screen_y,
				src_x: p.src_x,
				src_y: p.src_y,
			}));
			Geospatiale.drawMeshOverlay(this.ctx, overlay_pts, this.mesh_triangles, 1, this.base_point_radius, this.selected_point_index);
		}
		
		this.ctx.restore();
		
		//Video -> global date sync (throttled, deferred to avoid re-entrant render loops)
		this.syncGlobalDateToVideo();
		this.updateInfoPanels();
	}
	
	renderTriangleSubdivided (arg0_a, arg1_b, arg2_c, arg3_image) {
		//Convert from parameters
		let a = arg0_a;
		let b = arg1_b;
		let c = arg2_c;
		let img = arg3_image || this.image;
		
		//Declare local instance variables
		let edge_px = Math.max(
			Math.hypot(a.screen_x - b.screen_x, a.screen_y - b.screen_y),
			Math.hypot(b.screen_x - c.screen_x, b.screen_y - c.screen_y),
			Math.hypot(c.screen_x - a.screen_x, c.screen_y - a.screen_y)
		);
		let n = Math.ceil(edge_px/this.max_edge_screen_px);
		if (n < 1) n = 1;
		if (n > this.max_subdivision) n = this.max_subdivision;
		
		let verts = [];
		let fallback = { x: a.screen_x, y: a.screen_y };
		
		for (let i = 0; i <= n; i++)
			for (let j = 0; j <= n - i; j++) {
				let u = i/n,
					v = j/n,
					w = 1 - u - v;
				let wx = u*a.x + v*b.x + w*c.x;
				let wy = u*a.y + v*b.y + w*c.y;
				let sx_src = u*a.src_x + v*b.src_x + w*c.src_x;
				let sy_src = u*a.src_y + v*b.src_y + w*c.src_y;
				let sp = (n === 1) ? 
					(i === 1) ? 
						{ x: a.screen_x, y: a.screen_y }
						: (j === 1) ? 
							{ x: b.screen_x, y: b.screen_y } : { x: c.screen_x, y: c.screen_y }
						: this.getWorldToScreen(wx, wy, fallback);
				verts.push({ x: sp.x, y: sp.y, src_x: sx_src, src_y: sy_src });
			}
		
		let row_start = (i) => (i*(2*n - i + 3))/2;
		
		for (let i = 0; i < n; i++)
			for (let j = 0; j < n - i; j++) {
				let v00 = verts[row_start(i) + j];
				let v01 = verts[row_start(i) + j + 1];
				let v10 = verts[row_start(i + 1) + j];
				Geospatiale.drawTriangle(
					this.ctx,
					img,
					this.img_display_size,
					{ x: v00.src_x, y: v00.src_y },
					{ x: v01.src_x, y: v01.src_y },
					{ x: v10.src_x, y: v10.src_y },
					v00,
					v01,
					v10
				);
				if (j < n - i - 1) {
					let v11 = verts[row_start(i + 1) + j + 1];
					Geospatiale.drawTriangle(
						this.ctx,
						img,
						this.img_display_size,
						{ x: v01.src_x, y: v01.src_y },
						{ x: v11.src_x, y: v11.src_y },
						{ x: v10.src_x, y: v10.src_y },
						v01, v11, v10);
				}
			}
	}
	
	renderTPSSubdivided (arg0_image) {
		let img = arg0_image || this.image;
		let world_pts = this.mesh_points.map((p) => ({
			x: p.x,
			y: p.y,
			src_x: p.src_x,
			src_y: p.src_y,
		}));
		let coeffs = Geospatiale.computeTPSCoefficients(world_pts);
		let res = this.grid_resolution;
		let step = this.img_display_size/res;
		let fallback = this.screen_pts.length ? { x: this.screen_pts[0].screen_x, y: this.screen_pts[0].screen_y } : { x: 0, y: 0 };
		
		let grid = [];
		for (let gy = 0; gy <= res; gy++) {
			let row = [];
			for (let gx = 0; gx <= res; gx++) {
				let sx = gx*step,
					sy = gy*step;
				let pos = Geospatiale.getTPSPosition(sx, sy, world_pts, coeffs.x, coeffs.y);
				let sp = this.getWorldToScreen(pos.x, pos.y, fallback);
				row.push({ x: sp.x, y: sp.y, src_x: sx, src_y: sy });
			}
			grid.push(row);
		}
		
		for (let gy = 0; gy < res; gy++) {
			for (let gx = 0; gx < res; gx++) {
				let v00 = grid[gy][gx],
					v01 = grid[gy][gx + 1],
					v10 = grid[gy + 1][gx],
					v11 = grid[gy + 1][gx + 1];
				Geospatiale.drawTriangle(
					this.ctx,
					img,
					this.img_display_size,
					{ x: v00.src_x, y: v00.src_y },
					{ x: v01.src_x, y: v01.src_y },
					{ x: v10.src_x, y: v10.src_y },
					v00,
					v01,
					v10
				);
				Geospatiale.drawTriangle(
					this.ctx,
					img,
					this.img_display_size,
					{ x: v01.src_x, y: v01.src_y },
					{ x: v11.src_x, y: v11.src_y },
					{ x: v10.src_x, y: v10.src_y },
					v01,
					v11,
					v10
				);
			}
		}
	}
	
	syncGlobalDateToVideo (arg0_force) {
		//Convert from parameters
		let force = arg0_force;
		
		//Declare local instance variables
		let symbol_obj = (this.value?.[1]) ? this.value[1] : {};
		
		if (!this.video_el) return; //Internal guard clause
		if (this.video_el.paused && !force) return; //Internal guard clause
		if (!symbol_obj.video_sync_global_date) return; //Internal guard clause
		
		let frames = symbol_obj.timeframes || [];
		if (frames.length < 2) return; //Internal guard clause
		
		let video_time = this.video_el.currentTime;
		let sorted_frames = [...frames].sort((a, b) => a.timestamp - b.timestamp);
		let f0 = null,
			f1 = null;
		
		for (let i = 0; i < sorted_frames.length; i++) {
			if (sorted_frames[i].timestamp <= video_time) f0 = sorted_frames[i];
			if (sorted_frames[i].timestamp > video_time && !f1) f1 = sorted_frames[i];
		}
		if (!f0 || !f1) return; //Internal guard clause
		
		let factor = (f1.timestamp === f0.timestamp) ? 0 : (video_time - f0.timestamp)/(f1.timestamp - f0.timestamp);
		let ts0 = Date.getTimestamp(f0.date),
			ts1 = Date.getTimestamp(f1.date);
		let target_ts = ts0 + factor*(ts1 - ts0);
		
		//If forced (e.g. playbar jump), we update immediately. Otherwise, we throttle to 1s.
		let now = Date.now();
		if (force || now - this._last_global_sync > 1000) {
			this._last_global_sync = now;
			setTimeout(() => UI_DateMenu.setDate(target_ts));
		}
	}
	
	toggleCropBrush (arg0_value) {
		//Convert from parameters
		let value = arg0_value;
		
		//Set this.crop_brush_active
		this.crop_brush_active = (value === undefined) ? (!this.crop_brush_active) : value;
		main.brush.disabled = (this.crop_brush_active);
	}
	
	updateBufferSize () {
		let map_size = map.getSize();
		if (!map_size) return;
		
		this.screen_pts = [];
		let fallback = { x: map_size.width/2, y: map_size.height/2 };
		
		for (let p of this.mesh_points) {
			let sp = this.getWorldToScreen(p.x, p.y, fallback);
			this.screen_pts.push({ ...p, screen_x: sp.x, screen_y: sp.y });
		}
		
		let dpr = window.devicePixelRatio || 1;
		let target_w = Math.ceil(map_size.width);
		let target_h = Math.ceil(map_size.height);
		
		if (target_w*dpr > this.max_buffer_size) target_w = Math.floor(this.max_buffer_size/dpr);
		if (target_h*dpr > this.max_buffer_size) target_h = Math.floor(this.max_buffer_size/dpr);
		
		if (
			this.canvas.style.width !== target_w + "px" ||
			this.canvas.style.height !== target_h + "px" ||
			this.canvas_dpr !== dpr
		) {
			this.canvas.style.width = target_w + "px";
			this.canvas.style.height = target_h + "px";
			this.canvas.width = target_w*dpr;
			this.canvas.height = target_h*dpr;
		}
		
		this.canvas_w = target_w;
		this.canvas_h = target_h;
		this.canvas_dpr = dpr;
	}
	
	updateInfoPanels () {
		if (!this.points_area || document.activeElement === this.points_area || document.activeElement === this.extent_area) return;
		this.points_area.value = this.mesh_points
		.map((p) => {
			let c = this.getWorldToLngLat(p.x, p.y);
			return "[" + c[0].toFixed(6) + ", " + c[1].toFixed(6) + "]";
		})
		.join("\n");
		if (this.mesh_points.length > 0) {
			let min_x = Infinity,
				min_y = Infinity,
				max_x = -Infinity,
				max_y = -Infinity;
			for (let i = 0; i < this.mesh_points.length; i++) {
				let p = this.mesh_points[i];
				if (p.x < min_x) min_x = p.x;
				if (p.y < min_y) min_y = p.y;
				if (p.x > max_x) max_x = p.x;
				if (p.y > max_y) max_y = p.y;
			}
			let tl = this.getWorldToLngLat(min_x, min_y),
				br = this.getWorldToLngLat(max_x, max_y);
			this.extent_area.value = `[${tl[0].toFixed(6)}, ${tl[1].toFixed(6)}]\n[${br[0].toFixed(6)}, ${br[1].toFixed(6)}]`;
		}
	}
	
	updateKeyframe (arg0_symbol_obj, arg1_do_not_push_to_dals) {
		//Convert from parameters
		let symbol_obj = arg0_symbol_obj;
		let do_not_push_to_dals = arg1_do_not_push_to_dals;
		
		//Call update media keyframe
		DALS.Timeline.parseAction("update_media_keyframe", {
			geometry_obj: this.id,
			update_keyframe: {
				date: main.date,
				symbol_obj
			}
		}, do_not_push_to_dals);
	}
	
	updateTriangulation () {
		if (this.mesh_points.length < 3) {
			this.mesh_triangles = [];
			return;
		}
		this.mesh_triangles = Geospatiale.delaunayTriangulate(this.mesh_points, this.img_center);
	}
	
	static getInstances () {
		//Declare local instance variables
		let all_geometry_medias = [];
		
		//Iterate over naissance.Geometry.instances
		Object.iterate(naissance.Geometry.instances, (local_key, local_geometry) => {
			if (local_geometry.class_name === "GeometryMedia") all_geometry_medias.push(local_geometry);
		});
		
		//Return statement
		return all_geometry_medias;
	}
	
	static syncToDate () {
		//Declare local instance variables
		let all_instances = naissance.GeometryMedia.getInstances();
		let global_ts = Date.getTimestamp(main.date);
		
		for (let i = 0; i < all_instances.length; i++) {
			let inst = all_instances[i];
			let symbol = inst.value?.[1];
			
			if (inst.video_el && symbol?.enable_sync && inst.video_el.paused) {
				let frames = symbol.timeframes || [];
				if (frames.length >= 2) {
					let sorted = [...frames].sort((a, b) => Date.getTimestamp(a.date) - Date.getTimestamp(b.date));
					let f0 = null, f1 = null;
					
					for (let x = 0; x < sorted.length; x++) {
						let ts = Date.getTimestamp(sorted[x].date);
						if (ts <= global_ts) f0 = sorted[x];
						if (ts > global_ts && !f1) f1 = sorted[x];
					}
					
					if (f0 && f1) {
						let t0 = Date.getTimestamp(f0.date), t1 = Date.getTimestamp(f1.date);
						let factor = (t1 === t0) ? 0 : (global_ts - t0) / (t1 - t0);
						let target_v_time = f0.timestamp + factor * (f1.timestamp - f0.timestamp);
						
						if (Math.abs(inst.video_el.currentTime - target_v_time) > 0.1)
							inst.video_el.currentTime = target_v_time;
					}
				}
			}
		}
	}
};