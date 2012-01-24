//* @protected

// return the visibile window bounds unobscured by the keyboard
enyo.getModalBounds = function() {
	return enyo.keyboard.modalBounds || {
		width: window.innerWidth,
		height: window.innerHeight - enyo.keyboard.height
	};
};

//* @public
/**

 A collection of methods to deal with the virtual keyboard on webOS.  The virtual keyboard has two modes, the automatic mode (the default),
 where the keyboard automatically appears when the user puts focus on a text input control, and a manual mode where the keyboard is shown and 
 hidden under program control.  
 
 Since the keyboard appears on screen with your application, you can have the default mode where your app
 window resizes or an alternative mode where the keyboard is a popup over your window.  The second mode may be preferred if resizing your UI
 is an expensive operation, but in that case you'll need to ensure that the user input area isn't positioned under the keyboard.
 */
enyo.keyboard = {
	//* @protected
	height: 0,
	events: {
		resize: 1,
		focus: 1,
		keydown: 1,
		keyboardShown: 1
	},
	resizesWindow: true,
	positiveSpaceChanged: function(inWidth, inHeight) {
		// FIXME: cheat by sending a resize event even though this is not actually a resize.
		enyo.keyboard.modalBounds = {width: inWidth, height: inHeight};
		enyo.dispatch({type: "resize"});
		this.scrollIntoView();
	},
	//* @protected
	scrollIntoView: function() {
		enyo.job("enyo.keyboard.scrollIntoView", enyo.bind(enyo.keyboard, "_scrollIntoView"), 100);
	},
	_scrollIntoView: function() {
		var s = this.findFocusedScroller();
		if (s) {
			this.scroller = s;
			var p = this.getCaretPosition();
			enyo.call(s, "scrollOffsetIntoView", [p.y, p.x, p.height]);
		}
	},
	resetScroller: function() {
		if (this.scroller) {
			// synchonously reset scroller position
			this.scroller.stabilize();
			this.scroller = null;
		}
	},
	findFocusedScroller: function() {
		var n = document.activeElement;
		var c;
		while (n) {
			c = enyo.$[n.id];
			if (c instanceof enyo.DragScroller) {
				return c;
			}
			n = n.parentNode;
		}
	},
	getFocusedControl: function() {
		// FIXME: this dispatcher function has a more general purpose; relocate/name...
		return enyo.dispatcher.findDispatchTarget(document.activeElement);
	},
	getCaretPosition: function() {
		if (window.caretRect) {
			var r = window.caretRect();
			if (r.x !== 0 || r.y !== 0) {
				return r;
			} else {
				r = this.getControlCaretPosition();
				if (r) {
					return r;
				}
			}
			//console.log("window.caretRect failed");
		}
		return this.getSimulatedCaretPosition();
	},
	getControlCaretPosition: function() {
		var c = this.getFocusedControl();
		if (c && c.caretRect) {
			return c.caretRect;
		}
	},
	getSimulatedCaretPosition: function() {
		var c = this.getFocusedControl();
		var p = {x: 0, y: 0, height: 20, width: 0};
		if (c) {
			var o = c.getOffset();
			p.x = o.left;
			p.y = o.top;
		}
		return p;
	},
	// events
	resize: function() {
		enyo.keyboard.scrollIntoView();
	},
	focus: function() {
		enyo.keyboard.scrollIntoView();
	},
	keydown: function(inEvent) {
		if (inEvent.keyCode != 9) {
			enyo.keyboard.scrollIntoView();
		}
	},
	keyboardShown: function(e) {
		if (!e.showing) {
			enyo.asyncMethod(enyo.keyboard, "resetScroller");
		}
	}
};

//* @public
/**
	Set the keyboard mode to either resize the application window (default) or to be displayed
	on top of application content.
*/
enyo.keyboard.setResizesWindow = function(inResizesWindow) {
	// stub for documentation purposes
};

/**
	Set the keyboard to be in manual mode. When in manual mode, the keyboard will not automatically display
	when an element that can receive keys is focused or blurred. When in manual mode, it's possible to
	show or hide the keyboard via _enyo.keyboard.show_ and _enyo.keyboard.hide_.
*/
enyo.keyboard.setManualMode = function(inManual) {
	// stub for documentation purposes
};

enyo.keyboard.suspend = function() {
}

enyo.keyboard.resume = function() {
}

/**
	Show the keyboard. Requires that the keyboard is in manual mode;
	call _enyo.keyboard.setManualMode(true)_ first.
	
	inType {Integer} Indicates the keyboard style to show, values are:

	* 0: Text (_enyo.keyboard.typeText_)
	* 1: Password (_enyo.keyboard.typePassword_)
	* 2: Search (_enyo.keyboard.typeSearch_)
	* 3: Range (_enyo.keyboard.typeRange_)
	* 4: Email (_enyo.keyboard.typeEmail_)
	* 5: Number (_enyo.keyboard.typeNumber_)
	* 6: Phone (_enyo.keyboard.typePhone_)
	* 7: URL (_enyo.keyboard.typeURL_)
	* 8: Color (_enyo.keyboard.typeColor_)
*/
enyo.keyboard.show = function(inType) {
	// stub for documentation purposes
};


enyo.keyboard.typeText = 0;
enyo.keyboard.typePassword = 1;
enyo.keyboard.typeSearch = 2;
enyo.keyboard.typeRange = 3;
enyo.keyboard.typeEmail = 4;
enyo.keyboard.typeNumber = 5;
enyo.keyboard.typePhone = 6;
enyo.keyboard.typeURL = 7;
enyo.keyboard.typeColor = 8;

/**
	Hide the keyboard. Requires that the keyboard is in manual mode;
	call enyo.keyboard.setManualMode(true) first.
*/
enyo.keyboard.hide = function() {
	// stub for documentation purposes
};

/**
	Force the keyboard to show by setting manual keyboard mode and then showing the keyboard.
	See _enyo.keyboard.show_ for inType values.
*/
enyo.keyboard.forceShow = function(inType) {
	// stub for documentation purposes
};

/**
	Force the keyboard to hide by setting manual keyboard mode and then hiding the keyboard.
*/
enyo.keyboard.forceHide = function() {
	// stub for documentation purposes
};

/**
	Returns true if the keyboard is showing.
*/
enyo.keyboard.isShowing = function() {
	// stub for documentation purposes
};

/**
	Returns true if the keyboard is in manual mode.
*/
enyo.keyboard.isManualMode = function() {
	// stub for documentation purposes
};

//* @protected
enyo.keyboard.warnManual = function() {
	enyo.warn("Cannot show or hide keyboard when not in manual mode; call enyo.keyboard.setManualMode(true)");
};

	
enyo.requiresWindow(function() {
	// LunaSysMgr calls use Mojo namespace atm
	Mojo = window.Mojo || {};

	Mojo.positiveSpaceChanged = function(width, height) {
		//FIXME: Sysmgr sending positiveSpaceChanged(0,0) in initial orientation, bug filed DFISH-13508
		if (width !== 0 && height !== 0) {
			enyo.keyboard.positiveSpaceChanged(width, height);
		}
	};

	// Sysmgr calls this whenever the keyboard state changes (shown / hidden)
	// true == keyboard going to be shown (fired before window is resized)
	// false == keyboard was hidden (fired after window is resized)
	Mojo.keyboardShown = function (inKeyboardShowing) {
		enyo.keyboard._isShowing = inKeyboardShowing;
		enyo.dispatch({type: "keyboardShown", showing: inKeyboardShowing});
	}


	// Dispatcher feature hooks: resize, focus, keydown
	enyo.dispatcher.features.push(
		function(e) {
			if (enyo.keyboard.events[e.type]) {
				return enyo.keyboard[e.type](e);
			}
		}
	);

	if (window.PalmSystem && PalmSystem.setManualKeyboardEnabled) {
		enyo.keyboard.setResizesWindow = function(inResizesWindow) {
			//console.log("enyo.keyboard.setResizesWindow: " + inResizesWindow);
			this.resizesWindow = inResizesWindow;
			if (this.resizesWindow) {
				enyo.keyboard.modalBounds = null;
			}
			if (PalmSystem.allowResizeOnPositiveSpaceChange) {
				PalmSystem.allowResizeOnPositiveSpaceChange(inResizesWindow);
			} else {
				console.log("Keyboard resizing cannot be changed.");
			}
		};

		enyo.keyboard.setManualMode = function(inManual) {
			enyo.keyboard._manual = inManual;
			PalmSystem.setManualKeyboardEnabled(inManual);
		};

		enyo.keyboard.isManualMode = function() {
			return enyo.keyboard._manual;
		};

		enyo.keyboard.suspend = function() {
			// suspend keyboard independent of user's manual setting.
			if (enyo.keyboard.isManualMode()) {
				enyo.warn("Keyboard suspended when in manual mode");
			}
			// call SysMgr directly so as to not mess with isManualMode
			PalmSystem.setManualKeyboardEnabled(true);
		}

		enyo.keyboard.resume = function() {
			if (!enyo.keyboard.isManualMode()) {
				enyo.keyboard.setManualMode(false);
			}
		}

		enyo.keyboard.show = function(inType) {
			if (enyo.keyboard.isManualMode()) {
				PalmSystem.keyboardShow(inType || 0);
			} else {
				enyo.keyboard.warnManual();
			}
		};

		enyo.keyboard.hide = function() {
			if (enyo.keyboard.isManualMode()) {
				PalmSystem.keyboardHide();
			} else {
				enyo.keyboard.warnManual();
			}
		};

		enyo.keyboard.forceShow = function(inType) {
			enyo.keyboard.setManualMode(true);
			PalmSystem.keyboardShow(inType || 0);
		};

		enyo.keyboard.forceHide = function() {
			enyo.keyboard.setManualMode(true);
			PalmSystem.keyboardHide();
		};

		enyo.keyboard.isShowing = function() {
			return enyo.keyboard._isShowing;
		};
	}
});
