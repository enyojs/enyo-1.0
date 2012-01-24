// gesture feature
/**
 enyo.gesture provides an event filter hooked into the enyo dispatcher.  This intercepts some DOM events and turns them into 
 special synthesized events.  
 
 * "back" - sent for the back gesture on webOS devices with a gesture area or on the ESC key in browsers
 * "click" - normally, you get the one sent by the system, but you can get a synthetic "click" when a drag has been initiated
 * "dragstart", "dragfinish" - sent for mouse moves that exceed a certain threshhold
 * "drag", "drop" - sent to the original target of the mousemove to inform it about the item being moved over or released over another element
 * "dragover", "dragout" - sent in place of mouseover and mouseout when there is an active drag
 * "mousehold", "mouseholdpulse", and "mouserelease" - sent for mouse moves that stay within the drag threshhold.  Used to implement hold actions.
 
 There are no public methods defined here.
 */

//* @protected
enyo.dispatcher.features.push(
	function(e) {
		// NOTE: beware of properties in enyo.gesture inadvertantly mapped to event types
		if (enyo.gesture[e.type]) {
			return enyo.gesture[e.type](e);
		}
	}
);

//* @public
enyo.gesture = {
//* @protected
	hysteresis: 4,
	holdDelay: 200,
	pulseInterval: 100,
	// synthesize 'back' event from ESC key on all platforms
	keyup: function(e) {
		if (e.keyCode == 27) {
			enyo.dispatch({
				type: "back",
				target: null,
				preventDefault: function() {
					e.preventDefault();
				}
			});
		}
	},
	focusByEvent: function(e) {
		var c = e.dispatchTarget;
		this.focusNode(c.requiresNodeFocus ? c.hasNode() : e.target);
	},
	focusNode: function(inNode) {
		var f = document.activeElement;
		if (f != inNode) {
			if (f) {
				f.blur();
			}
			if (inNode && inNode.focus) {
				inNode.focus();
			}
		}
	},
	requiresDomMousedown: function(e) {
		// FIXME: do we need to ascend the parent tree or is it enough to require an explicit flag on the control?
		return e.dispatchTarget.requiresDomMousedown;
	},
	mousedown: function(e) {
		// FIXME: refactor: code only relevant if using device async focusAtPoint api.
		if (this._isFocusing) {
			// if mousedown target has changed while focusing, abort focus
			if (e.target != this.targetEvent.target) {
				e.preventDefault();
			}
			return true;
		}
		// only process events that haven't been synthesized
		// (aka have not already been through this function)
		if (!e.synthetic && e.dispatchTarget) {
			// cache the mousedown targets
			this.target = e.target;
			this.dispatchTarget = e.dispatchTarget;
			this.targetEvent = e;
			var custom = !this.requiresDomMousedown(e);
			if (custom) {
				this.sendCustomMousedown(e);
			}
			// tracking whether this is a click or a drag
			this.startTracking(e);
			// if the mouse is held down long enough, we will send 'mousehold' events
			this.startMousehold(e);
			// stop processing if we used custom mousedown
			return custom;
		}
	},
	sendCustomMousedown: function(e) {
		// preventDefault on mousedown implements a performance
		// tweak to short-circuit cycle-stealing mousedown
		// handling in webkit when the -webkit-user-select:none
		// style is set.
		e.preventDefault();
		// We still need to allow control over focus effects
		// by honoring client code calls preventDefault.
		e.preventDefault = function() {
			e.prevented = true;
		};
		// Redispatch this event as a 'synthetic' event
		// so we can watch for 'prevented' flag
		e.synthetic = true;
		enyo.dispatch(e);
	},
	mousemove: function(e) {
		if (this.tracking) {
			this.dx = e.pageX - this.px0;
			this.dy = e.pageY - this.py0;
			if (this.dragEvent) {
				this.sendDrag(e);
			} else if (Math.sqrt(this.dy*this.dy + this.dx*this.dx) >= this.hysteresis) {
				this.sendDragStart(e);
				// mouserelease handler may need to know about the drag status
				// so we stopMousehold *after* dragStart, which may be counter-intuitive.
				this.stopMousehold();
			}
		}
	},
	mouseout: function(e) {
		if (this.dragEvent) {
			this.sendDragOut(e);
		}
	},
	mouseup: function(e) {
		// FIXME: refactor: code only relevant if using device async focusAtPoint api.
		if (this._isFocusing) {
			this._isFocusing = false;
			return true;
		}
		// only process events that haven't been synthesized
		// (i.e. have not already been through this function)
		if (!e.synthetic) {
			// it's possible for the drop event from stopDragging to
			// cause events to occur asynchronously to this method
			// (e.g. by throwing an alert), so we need to disable
			// tracking first.
			this.stopTracking();
			var dc = Boolean(this.dragEvent);
			// remember if this gesture was handled as a drag or a dom gesture (pinch/zoom) so we
			// can prevent a 'click' from being generated (see click method)
			//
			// FIXME: (review after Duval release) a dom gesture may or may not include a drag;
			// so we specifically need to squelch clicks in the case that there is a gesture;
			// note: for simplicity we're considering this a "drag"
			this.didDrag = this.stopDragging(e) || this._didDomGesture;
			this._didDomGesture = false;
			this.stopMousehold();
			// handle focusing
			this.tryFocus(e, dc);
			// sendCustomClick may create a synthetic click event if the up/down pair
			// crossed a node boundary. If sendCustomClick returns true, it has handled 
			// this mouseup specially,  and we must inform dispatcher to stop processing.
			return !this.didDrag && this.sendCustomClick(e);
		}
	},
	gesturestart: function(e) {
		this._didDomGesture = true;
	},
	// focus if conditions are satisfied: no drag, event not cancelled.
	tryFocus: function(inEvent, inDragged) {
		var e = this.targetEvent;
		var domMousedown = this.requiresDomMousedown(e);
		inEvent.didDrag = inDragged;
		var prevented = inEvent.mousedownPrevented = e.prevented || (domMousedown && e.defaultPrevented);
		// simulate focus if we aren't processing a dom mousedown and we can focus.
		if (!inDragged && !prevented && !domMousedown) {
			this.focusByEvent(e);
		}
	},
	sendCustomClick: function(e) {
		// If mousedown/up pair has crossed a node boundary,
		// synthesize a click event on the first common ancestor.
		//
		// if the target is the same, DOM should send a click for us (is this ever not true?)
		if (this.target !== e.target) {
			// If there is a common ancestor for the mousedown/mouseup pair,
			// it is the origin for bubbling a click event
			var p = this._findCommonAncestor(this.dispatchTarget, e.dispatchTarget);
			if (p) {
				// reprocess the original mouseup synchronously, because it has to happen before we send click
				// we also must send click synchronously, because click must happen before dblclick
				e.synthetic = true;
				enyo.dispatch(e);
				// now send syntha-click
				this.send("click", e, {synthetic: true, target: p.hasNode()});
				// tell the caller we handled the mouseup in this case
				return true;
			}
		}
	},
	findCustomClickTarget: function(e) {
		// if the target is the same, DOM should send a click for us (is this ever not true?),
		// otherwise, we may need to send a custom event
		return (this.target !== e.target);
	},
	click: function(e) {
		if (this.didDrag && !e.dispatchTarget.requiresDomClick) {
			// reset didDrag just in case somebody might send a click directly
			// and there was no mouseup to set didDrag.
			this.didDrag = false;
			// squelch post-drag clicks
			return true;
		}
		/*
		if (e.synthetic) {
			console.log("synth click");
		} else {
			console.log("dom click");
		}
		*/
	},
	_findCommonAncestor: function(inA, inB) {
		var p = inB;
		while (p) {
			if (inA.isDescendantOf(p)) {
				return p;
			}
			p = p.parent;
		}
	},
	stopDragging: function(e) {
		if (this.dragEvent) {
			this.sendDrop(e);
			var handled = this.sendDragFinish(e);
			this.dragEvent = null;
			return handled;
		}
	},
	makeDragEvent: function(inType, inTarget, inEvent, inInfo) {
		var adx = Math.abs(this.dx), ady = Math.abs(this.dy);
		var h = adx > ady;
		// suggest locking if off-axis < 22.5 degrees
		var l = (h ? ady/adx : adx/ady) < 0.414;
		return {
			type: inType,
			dx: this.dx,
			dy: this.dy,
			pageX: inEvent.pageX,
			pageY: inEvent.pageY,
			horizontal: h,
			vertical: !h,
			lockable: l,
			target: inTarget,
			dragInfo: inInfo
		};
	},
	sendDragStart: function(e) {
		this.dragEvent = this.makeDragEvent("dragstart", this.target, e);
		enyo.dispatch(this.dragEvent);
	},
	sendDrag: function(e) {
		// send dragOver event to the standard event target
		var synth = this.makeDragEvent("dragover", e.target, e, this.dragEvent.dragInfo);
		enyo.dispatch(synth);
		// send drag event to the drag source
		synth.type = "drag";
		synth.target = this.dragEvent.target;
		enyo.dispatch(synth);
	},
	sendDragFinish: function(e) {
		var synth = this.makeDragEvent("dragfinish", this.dragEvent.target, e, this.dragEvent.dragInfo);
		synth.preventClick = function() {
			this._preventClick = true;
		};
		enyo.dispatch(synth);
		return synth._preventClick;
	},
	sendDragOut: function(e) {
		var synth = this.makeDragEvent("dragout", e.target, e, this.dragEvent.dragInfo);
		enyo.dispatch(synth);
	},
	sendDrop: function(e) {
		var synth = this.makeDragEvent("drop", e.target, e, this.dragEvent.dragInfo);
		enyo.dispatch(synth);
	},
	startTracking: function(e) {
		// Note: 'tracking' flag indicates interest in mousemove, it's turned off
		// on mouseup
		// We reset tracking data whenever hysteresis is satisfied: we only want
		// to send 'draggable' gestures as dragStart.
		this.tracking = true;
		this.px0 = e.pageX;
		this.py0 = e.pageY;
	},
	stopTracking: function() {
		this.tracking = false;
	},
	startMousehold: function(inEvent) {
		if (this.holdpulseJob) {
			throw("re-entrant startMousehold");
		}
		var synth = {
			type: "mousehold",
			target: inEvent.target,
			holdStart: new Date().getTime(),
			clientX: inEvent.clientX,
			clientY: inEvent.clientY,
			pageX: inEvent.pageX,
			pageY: inEvent.pageY
		};
		enyo.job("enyo.gesture.mousehold", enyo.bind(this, "sendMousehold", synth), this.holdDelay);
	},
	sendMousehold: function(inEvent) {
		enyo.dispatch(inEvent);
		this.startMouseholdPulse(inEvent);
	},
	startMouseholdPulse: function(inEvent) {
		// send a pulse every 'pulseInterval' ms
		inEvent.type = "mouseholdpulse";
		this.holdpulseJob = setInterval(enyo.bind(this, "sendMouseholdPulse", inEvent), this.pulseInterval);
	},
	sendMouseholdPulse: function(inEvent) {
		inEvent.holdTime = new Date().getTime() - inEvent.holdStart;
		enyo.dispatch(inEvent);
	},
	stopMousehold: function(e) {
		enyo.job.stop("enyo.gesture.mousehold");
		if (this.holdpulseJob) {
			clearInterval(this.holdpulseJob);
			this.holdpulseJob = 0;
			this.sendMouseRelease(e);
		}
	},
	sendMouseRelease: function(e) {
		this.send("mouserelease", e);
	},
	send: function(inName, e, inProps) {
		var synth = {
			type: inName,
			pageX: e && e.pageX,
			pageY: e && e.pageY,
			target: this.target,
			// FIXME: prompted by an example that assumed click event would have prevent default (what does that even do?)
			// synthesized events are not dom events, but it's reasonable to expect they have a similar api
			// what else do we need to add?
			preventDefault: enyo.nop
		};
		enyo.mixin(synth, inProps);
		enyo.dispatch(synth);
		return synth;
	}
};

// when on device, implement focus at point system which defers focus until mouseup.
enyo.requiresWindow(function() {
	if (window.PalmSystem) {
		
		// FIXME: inform system we are simulating clicks
		// corrects selection menu positioning
		// Not currently implemented for Pre3.
		if(PalmSystem.useSimulatedMouseClicks) {
			PalmSystem.useSimulatedMouseClicks(true);
		}
		//
		enyo.gesture.focusAtPoint = function(e) {
			enyo.gesture._isFocusing = true;
			// note: these events are asynchronous, but apparently can be called in order.
			PalmSystem.simulateMouseClick(e.pageX, e.pageY, true);
			PalmSystem.simulateMouseClick(e.pageX, e.pageY, false);
		}

		enyo.gesture.requiresDomMousedown = function(e) {
			// e.detail == 2 means mousedown is part of a doubleclick; require dom mousedown in this case to preserve
			// device doubleclick select behavior.
			return e.dispatchTarget.requiresDomMousedown || (e.detail == 2);
		}

		enyo.gesture.focusByEvent = function(e) {
			// FIXME: keyboard will toggle briefly unless it is suspended/resumed bracketing call to focusNode
			enyo.keyboard.suspend();
			// FIXME: blur/focus target synchonrously so that change events happen before click.
			// remove when we have a single synchronous "focusAtPoint" api.
			// NOTE: some focusing controls like richtext have internal non-focusable nodes.
			// Focusing these nodes briefly toggles device keyboard, so instead focus control node
			// if control says so via requiresNodeFocus property
			var c = e.dispatchTarget;
			this.focusNode(c.requiresNodeFocus ? c.hasNode() : e.target);
			enyo.keyboard.resume();
			this.focusAtPoint(e);
		}
	}
});