//Event handlers
window.addEventListener('click', (e) => {
	let target = e.target.closest("a");
	if (target && target.href) {
		// If it's a link, tell the webview to load it manually
		// This bypasses some SPA-logic hurdles
		window.location.href = target.href;
	}
}, true);