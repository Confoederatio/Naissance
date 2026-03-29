(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined'
		? factory(exports)
		: typeof define === 'function' && define.amd
			? define(['exports'], factory)
			: ((global = global || self), factory((global['leaflet-kmz'] = {})));
})(this, function (exports) {
	'use strict';
	
	/**
	 * HELPERS & UTILS
	 */
	function loadFile(url) {
		return new Promise((resolve, reject) => {
			let xhr = new XMLHttpRequest();
			xhr.open('GET', url);
			xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
			xhr.responseType = 'arraybuffer';
			xhr.onload = () => {
				if (xhr.readyState === 4 && (xhr.status === 200 || xhr.status === 0)) {
					resolve(xhr.response || xhr.responseText);
				} else {
					resolve('');
				}
			};
			xhr.onerror = () => reject('Error fetching KMZ: ' + url);
			xhr.send();
		});
	}
	
	function lazyLoader(urls, promise) {
		return promise instanceof Promise
			? promise
			: Promise.all(urls.map((url) => loadJS(url)));
	}
	
	function loadJS(url) {
		return new Promise((resolve) => {
			// Fix for "Can only have one anonymous define call"
			const oldDefine = window.define;
			window.define = null;
			
			let tag = document.createElement('script');
			tag.async = true;
			tag.onload = () => {
				window.define = oldDefine;
				resolve();
			};
			tag.onerror = () => {
				window.define = oldDefine;
				resolve();
			};
			tag.src = url;
			document.head.appendChild(tag);
		});
	}
	
	function toXML(data) {
		var text = data;
		if (data instanceof ArrayBuffer) {
			text = new Uint8Array(data).reduce(
				(acc, byte) => acc + String.fromCharCode(byte),
				''
			);
			var encoding = text
			.substring(0, text.indexOf('?>'))
			.match(/encoding\s*=\s*["'](.*)["']/i);
			if (encoding) text = new TextDecoder(encoding[1]).decode(data);
		}
		return text
			? new DOMParser().parseFromString(text, 'text/xml')
			: document.implementation.createDocument(null, 'kml');
	}
	
	function unzip(folder) {
		return new Promise((resolve, reject) => {
			window.JSZip.loadAsync(folder)
			.then((zip) => {
				var files = Object.keys(zip.files).map((name) => {
					var entry = zip.files[name];
					if (/\.(jpe?g|png|gif|bmp)$/i.test(name)) {
						var ext = name
						.split('.')
						.pop()
						.toLowerCase()
						.replace('jpg', 'jpeg');
						var mime = 'image/' + ext;
						return entry
						.async('base64')
						.then((val) => [name, 'data:' + mime + ';base64,' + val]);
					}
					return entry.async('text').then((val) => [name, val]);
				});
				Promise.all(files).then((list) =>
					resolve(
						list.reduce((obj, item) => {
							obj[item[0]] = item[1];
							return obj;
						}, {})
					)
				);
			})
			.catch(reject);
		});
	}
	
	/**
	 * CANVAS MARKER (HIGH PERFORMANCE)
	 */
	L.KMZMarker = L.CircleMarker.extend({
		_updatePath: function () {
			var renderer = this._renderer;
			if (!renderer || !renderer._drawing || this._empty()) return;
			
			var icon = this._icon;
			if (icon && icon.complete) {
				var p = this._point.subtract([
					this.options.iconSize[0] / 2,
					this.options.iconSize[1] / 2,
				]);
				renderer._ctx.drawImage(
					icon,
					p.x,
					p.y,
					this.options.iconSize[0],
					this.options.iconSize[1]
				);
			} else if (!icon) {
				this._icon = new Image();
				this._icon.onload = () => this.redraw();
				this._icon.src = this.options.iconUrl;
			}
		},
	});
	
	L.kmzMarker = (ll, opts) => new L.KMZMarker(ll, opts);
	
	/**
	 * MAIN KMZ LAYER
	 */
	const KMZLayer = L.FeatureGroup.extend({
		options: {
			interactive: true,
			ballon: true,
			bindPopup: true,
			bindTooltip: true,
			chunkSize: 150, // Processing speed
		},
		
		initialize: function (url, options) {
			L.setOptions(this, options);
			this._layers = {};
			this._renderer = L.canvas({ padding: 0.5 });
			if (url) this.load(url);
		},
		
		load: function (url) {
			L.KMZLayer._jsPromise = lazyLoader(
				this._requiredJSModules(),
				L.KMZLayer._jsPromise
			)
			.then(() => loadFile(url))
			.then((data) => {
				const isZipped =
					'PK' ===
					String.fromCharCode(
						new Uint8Array(data, 0, 1),
						new Uint8Array(data, 1, 1)
					);
				return isZipped
					? this._parseKMZ(data, url)
					: this._parseKML(data, { name: url, icons: {} });
			});
		},
		
		_parseKMZ: function (data, url) {
			unzip(data).then((files) => {
				const kmlKey = files['doc.kml']
					? 'doc.kml'
					: Object.keys(files).find((f) => f.endsWith('.kml'));
				const props = {
					name: url.split('/').pop(),
					icons: {},
				};
				Object.keys(files).forEach((f) => {
					if (/\.(jpe?g|png|gif|bmp)$/i.test(f)) props.icons[f] = files[f];
				});
				this._parseKML(files[kmlKey], props);
			});
		},
		
		_parseKML: function (kmlData, props) {
			const xml = toXML(kmlData);
			const geojson = window.toGeoJSON.kml(xml);
			this._processChunks(geojson.features, props, 0);
		},
		
		_processChunks: function (features, props, index) {
			const end = Math.min(index + this.options.chunkSize, features.length);
			
			for (let i = index; i < end; i++) {
				const feature = features[i];
				const layer = L.GeoJSON.geometryToLayer(feature, {
					pointToLayer: (f, latlng) => {
						const url = props.icons[f.properties.icon] || f.properties.icon;
						if (!url)
							return L.circleMarker(latlng, {
								radius: 3,
								renderer: this._renderer,
							});
						return new L.KMZMarker(latlng, {
							iconUrl: url,
							iconSize: [28, 28],
							renderer: this._renderer,
						});
					},
					renderer: this._renderer,
				});
				
				this._applyStyle(layer, feature);
				this._applyPopup(layer, feature);
				this.addLayer(layer);
			}
			
			if (end < features.length) {
				requestAnimationFrame(() => this._processChunks(features, props, end));
			} else {
				// Critical: Fire event with layer reference to fix your undefined error
				this.fire('load', { layer: this, name: props.name });
			}
		},
		
		_applyStyle: function (layer, feature) {
			if (!layer.setStyle) return;
			const p = feature.properties;
			layer.setStyle({
				color: p.stroke || '#3388ff',
				fillColor: p.fill || '#3388ff',
				opacity: p['stroke-opacity'] || 1,
				fillOpacity: p['fill-opacity'] || 0.2,
				weight: p['stroke-width'] || 2,
			});
		},
		
		_applyPopup: function (layer, feature) {
			if (!this.options.ballon) return;
			const p = feature.properties;
			if (p.name || p.description) {
				const content = `<b>${p.name || ''}</b><br>${p.description || ''}`;
				if (this.options.bindPopup) layer.bindPopup(content);
				if (this.options.bindTooltip)
					layer.bindTooltip(p.name || '', { sticky: true });
			}
		},
		
		_requiredJSModules: function () {
			const host = 'https://unpkg.com/';
			const urls = [];
			if (typeof window.JSZip !== 'function')
				urls.push(host + 'jszip@3.10.1/dist/jszip.min.js');
			if (typeof window.toGeoJSON !== 'object')
				urls.push(host + '@tmcw/togeojson@4.1.0/dist/togeojson.umd.js');
			return urls;
		},
	});
	
	L.KMZLayer = KMZLayer;
	L.kmzLayer = (url, opts) => new L.KMZLayer(url, opts);
	
	exports.KMZLayer = KMZLayer;
});