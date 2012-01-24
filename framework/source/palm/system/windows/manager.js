//* @protected
enyo.windows.manager = {
	getRootWindow: function() {
		var w = window.opener || window.rootWindow || window.top || window;
		if(!w.setTimeout) { // use this window as the root if we don't have access to the real root.
			w = window;
		}
		return w;
	},	
	// return a list of valid (still existing) windows.
	getWindows: function() {
		var app = this.getRootWindow();
		var am = app.enyo.windows.manager;
		var windows = am._windowList;
		// note: check for validity of window since we do not know if a spawned
		// windows that does not load enyo has been closed.
		var validWindows = {};
		for (var i in windows) {
			if (this.isValidWindow(windows[i])) {
				validWindows[i] = windows[i];
			}
		}
		am._windowList = validWindows;
		return validWindows;
	},
	// Returns the name of a window from our list, given the window object.
	// This is needed when the window is cross-domain and we cannot read the name directly.
	getWindowName: function(inWindow) {
		if(inWindow.name) {
			return inWindow.name;
		}
		var winList = this.getRootWindow().enyo.windows.manager._windowList;
		var props = Object.keys(winList);
		for(var i=0; i<props.length; i++) {
			if(winList[props[i]] === inWindow) {
				return props[i];
			}
		}
		return undefined;
	},
	//* @protected
	_windowList: {},
	//* @protected
	_pendingWindowParams: {},
	//* @protected
	getPendingParamsList: function(inWindow) {
		var am = this.getRootWindow().enyo.windows.manager;
		return am._pendingWindowParams[inWindow.name];
	},
	//* @protected
	setPendingParamsList: function(inWindow, list) {
		var am = this.getRootWindow().enyo.windows.manager;
		am._pendingWindowParams[inWindow.name] = list;
		return;
	},
	//* @protected
	// Sets any params waiting in the pending list, in order.
	// Deletes the pending list to mark the window as being able to handle new params immediately.
	executePendingWindowParams: function(inWindow) {
		var name = this.getWindowName(inWindow);
		var am = this.getRootWindow().enyo.windows.manager;
		var pending = am._pendingWindowParams[name];
		delete am._pendingWindowParams[name];
		if(!pending) {
			console.warn("WARNING: Executing pending window params, but no params list found.");
		}
		while(pending && pending.length) {
			enyo.windows.setWindowParams(inWindow, pending.shift());
		}
	},
	isValidWindow: function(inWindow) {
		return enyo.windows.agent.isValidWindow(inWindow);
	},
	addWindow: function(inWindow) {
		var windows = this.getWindows();
		windows[inWindow.name] = inWindow;
	},
	removeWindow: function(inWindow) {
		var windows = this.getWindows();
		delete windows[inWindow.name];
	},
	fetchWindow: function(inName) {
		var windows = this.getWindows();
		return windows[inName];
	},
	getActiveWindow: function() {
		var list = this.getWindows(), w;
		for (var i in list) {
			w = list[i];
			if (w.PalmSystem && w.PalmSystem.isActivated) {
				return w;
			}
		}
	},
	// If the root application window is closed,
	// we transfer manager info to a new root window.
	resetRootWindow: function(inOldRoot) {
		var list = this.getWindows(), w;
		// find new root window
		var root = this.findRootableWindow(list);
		if (root) {
			this.transferRootToWindow(root, inOldRoot);
			for (var i in list) {
				w = list[i];
				// set window.rootWindow so getRootWindow can return it.
				w.rootWindow = w == root ? null : root;
				// repair enyo.application
				this.setupApplication(w);
			}
		}
	},
	findRootableWindow: function(inWindowList) {
		var w;
		for (var i in inWindowList) {
			w = inWindowList[i];
			if (w.enyo && w.enyo.windows) {
				return inWindowList[i];
			}
		}
	},
	// make sure a given window can access the enyo.application object
	setupApplication: function(inWindow) {
		var we = inWindow.enyo;
		if(we) {
			we.application = (we.windows.getRootWindow().enyo || we).application || {};
		}
	},
	transferRootToWindow: function(inWindow, inOldRoot) {
		var wm = inWindow.enyo.windows.manager;
		var rm = inOldRoot.enyo.windows.manager;
		wm._windowList = enyo.clone(rm._windowList);
		wm._activeWindow = rm._activeWindow;
	},
	// if the app window is closed, automatically reset one of the open windows to the app window.
	addUnloadListener: function() {
		window.addEventListener('unload', enyo.hitch(this, function() {
			this.removeWindow(window);
			if (this.getRootWindow() == window) {
				this.resetRootWindow(window);
			}
		}), false);
	},
	// hook load so we can send a windowParamsChange event after the
	// main enyo component is created so that it can process the event.
	// We do this so there is 1 place to respond to windowParamsChange.
	// NOTE: enyo.windowParams is set before this, so an application can
	// respond to it in create.
	addLoadListener: function() {
		window.addEventListener('load', function() {
			enyo.windows.events.dispatchWindowParamsChange(window);
		}, false);
	},
	// Handle message events to update window params.
	addMessageListener: function() {
		var that=this;
		window.addEventListener('message', function(e) {
			var label = "enyoWindowParams=";
			if(e.data.indexOf(label) === 0) {
				enyo.windows.assignWindowParams(window, e.data.slice(label.length));
				enyo.windows.events.dispatchWindowParamsChange(window);
			} else if(e.data === "enyoWindowReady") {
				that.executePendingWindowParams(e.source);
			}
		}, false);
	}
};

// Setup windows api during enyo boot process:
enyo.requiresWindow(function() {
	// Assign windowParams.
	var params = enyo.windowParams || (window.PalmSystem && PalmSystem.launchParams);
	if(!params && enyo.args.enyoWindowParams) {
		params = decodeURIComponent(enyo.args.enyoWindowParams);
	}
	enyo.windows.finishOpenWindow(window, params);
	//
	// Hookup manager to load and unload.
	var m = enyo.windows.manager;
	m.addUnloadListener();
	m.addLoadListener();
	m.addMessageListener();
	// Report to our opener that we're ready to handle changes to windowParams.
	(window.opener || window.parent).postMessage("enyoWindowReady", "*");
	//
	// Establish enyo.application reference
	m.setupApplication(window);
});