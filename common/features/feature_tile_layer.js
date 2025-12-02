config.features.tile_layer = {
	tilemap_presets: {
		//CARTO
		//Carto Dark
		carto_dark_all: {
			name: "Carto Dark All",
			options: {
				urlTemplate: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
				subdomains: ["a","b","c","d"]
			}
		},
		carto_dark_only_labels: {
			name: "Carto Dark (Only Labels)",
			options: {
				urlTemplate: "https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}.png",
				subdomains: ["a","b","c","d"]
			}
		},
		carto_dark_nolabels: {
			name: "Carto Dark (No Labels)",
			options: {
				urlTemplate: "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png",
				subdomains: ["a","b","c","d"]
			}
		},
		
		//Carto Light
		carto_light_all: {
			name: "Carto Light All",
			options: {
				urlTemplate: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
				subdomains: ["a","b","c","d"]
			}
		},
		carto_light_only_labels: {
			name: "Carto Light (Only Labels)",
			options: {
				urlTemplate: "https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png",
				subdomains: ["a","b","c","d"]
			}
		},
		carto_light_nolabels: {
			name: "Carto Light (No Labels)",
			options: {
				urlTemplate: "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png",
				subdomains: ["a","b","c","d"]
			}
		},
		
		//Carto Voyager
		carto_voyager: {
			name: "Carto Voyager",
			options: {
				urlTemplate: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
				subdomains: ["a","b","c","d"]
			}
		},
		carto_voyager_labels_under: {
			name: "Carto Voyager (Labels Under)",
			options: {
				urlTemplate: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png",
				subdomains: ["a","b","c","d"]
			}
		},
		carto_voyager_only_labels: {
			name: "Carto Voyager (Only Labels)",
			options: {
				urlTemplate: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}.png",
				subdomains: ["a","b","c","d"]
			}
		},
		carto_voyager_nolabels: {
			name: "Carto Voyager (No Labels)",
			options: {
				urlTemplate: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}.png",
				subdomains: ["a","b","c","d"]
			}
		},
		
		//ESRI
		esri_satellite: {
			name: "ESRI Satellite",
			options: {
				urlTemplate: "https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.jpg",
				subdomains: ["a", "b", "c"]
			}
		},
		
		//Google
		google_maps_road: {
			name: "Google Maps (Road)",
			options: {
				urlTemplate: "https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}",
				subdomains: ["a", "b", "c"]
			}
		},
		google_maps_roads: {
			name: "Google Maps (Roads)",
			options: {
				urlTemplate: "https://mt1.google.com/vt/lyrs=h&x={x}&y={y}&z={z}",
				subdomains: ["a", "b", "c"]
			}
		},
		google_maps_satellite: {
			name: "Google Maps (Satellite)",
			options: {
				urlTemplate: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
				subdomains: ["a", "b", "c"]
			}
		},
		google_maps_satellite_hybrid: {
			name: "Google Maps (Satellite Hybrid)",
			options: {
				urlTemplate: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
				subdomains: ["a", "b", "c"]
			}
		},
		google_maps_terrain: {
			name: "Google Maps (Terrain)",
			options: {
				urlTemplate: "https://mt1.google.com/vt/lyrs=t&x={x}&y={y}&z={z}",
				subdomains: ["a", "b", "c"]
			}
		},
		
		//MapTiler
		maptiler_aquarelle: { name: "MapTiler Aquarelle" },
		maptiler_backdrop: { name: "MapTiler Backdrop" },
		maptiler_basic: { name: "MapTiler Basic" },
		maptiler_bright: { name: "MapTiler Bright" },
		maptiler_dataviz: { name: "MapTiler Dataviz" },
		maptiler_landscape: { name: "MapTiler Landscape" },
		maptiler_openstreetmap: { name: "MapTiler OSM" },
		maptiler_ocean: { name: "MapTiler Ocean" },
		maptiler_outdoor: { name: "MapTiler Outdoor" },
		maptiler_satellite: { name: "MapTiler Satellite" },
		maptiler_streets: { name: "MapTiler Streets" },
		maptiler_toner: { name: "MapTiler Toner" },
		maptiler_topo: { name: "MapTiler Topo" },
		maptiler_winter: { name: "MapTiler Winter" },
		
		//OSM
		osm: {
			name: "OSM",
			options: {
				urlTemplate: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
				subdomains: ["a", "b", "c"]
			}
		},
		osm_english: {
			name: "OSM English",
			options: {
				urlTemplate: "https://cdn.lima-labs.com/{z}/{x}/{y}.png?api=demo",
				subdomains: ["a", "b", "c"]
			}
		},
		osm_humanitarian: {
			name: "OSM Humanitarian",
			options: {
				urlTemplate: "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
				subdomains: ["a", "b", "c"]
			}
		}
	}
};