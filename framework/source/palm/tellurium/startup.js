//* @protected
// Load Telurium nub
enyo.requiresWindow(function() {
	if (window.PalmSystem) {
		var xhr = window.enyo.xhr.request({url: Tellurium.nubPath + "tellurium_config.json", sync: true});
		var resp = xhr && xhr.responseText;
		if (!resp || !resp.length) {
			return;
		}
		window.addEventListener('load', function() {
			Tellurium.setup(window.enyo);
			console.log("Tellurium loading...");
		}, false);
	}
});
