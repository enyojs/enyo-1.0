//* @protected
/**
	Implements interacting with windows
*/
enyo.windows.agent = {
	open: function(inOpener, inUrl, inName, inAttributes, inWindowInfo) {
		// note: force an absolute url to prevent problems opening relative url's via root window on device.
		var url = enyo.makeAbsoluteUrl(window, inUrl);
		var a = inAttributes && enyo.isString(inAttributes) ? inAttributes : enyo.json.stringify(inAttributes);
		var a = "attributes=" + a;
		var i = inWindowInfo ? inWindowInfo + ", " : ""; 
		return inOpener.open(url, inName, i + a);
	},
	activate: function(inWindow) {
		if (inWindow.PalmSystem) {
			inWindow.PalmSystem.activate();
		}
	},
	deactivate: function(inWindow) {
		inWindow.PalmSystem && inWindow.PalmSystem.deactivate();
	},
	addBannerMessage: function() {
		return PalmSystem.addBannerMessage.apply(PalmSystem, arguments);
	},
	removeBannerMessage: function(inId) {
		PalmSystem.removeBannerMessage.apply(PalmSystem, arguments);
	},
	setWindowProperties: function(inWindow, inProps) {
		inWindow.PalmSystem.setWindowProperties(inProps);
	},
	isValidWindow: function(inWindow) {
		// JS bindings can be snipped on closed windows on webOS, so window.closed actually goes from false to undefined, and !closed is not a useful check.
		return Boolean(inWindow && inWindow.closed === false);
	},
	isValidWindowName: function(inName) {
		return inName;
	}
}
