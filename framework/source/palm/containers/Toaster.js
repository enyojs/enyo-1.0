/**
A <a href="#enyo.Popup">Popup</a> that displays a set of controls over other content.
A toaster attaches to the bottom, left, right, or top of the screen and, when shown, 
slides in from off the screen.

Note, it's typically a good idea to control the vertical position of the toaster by giving it 
an absolute top and/or bottom position via css.

To show a toaster asking the user to confirm a choice, try the following:

	components: [
		{kind: "Button", caption: "Confirm choice", onclick: "showToaster"},
		{kind: "Toaster", flyInFrom: "right", components: [
			{content: "Are you sure?"},
			{layoutKind: "HFlexLayout", pack: "center", components: [
				{kind: "Button", caption: "OK", onclick: "confirmClick"},
				{kind: "Button", caption: "Cancel", onclick: "cancelClick"}
			]}
		]}
	],
	showToaster: function() {
		this.$.toaster.open();
	},
	confirmClick: function() {
		// process confirmation
		this.doConfirm();
		// then close dialog
		this.$.toaster.close();
	},
	cancelClick: function() {
		this.$.toaster.close();
	}
*/
enyo.kind({
	name: "enyo.Toaster",
	kind: enyo.Popup,
	className: "enyo-toaster",
	published: {
		/**
		Direction from which the toaster should fly in when it is opened.
		One of: "bottom", "top", "left", or "right"
		*/
		flyInFrom: "bottom"
	},
	//* @protected
	dragOffset: 0,
	chrome: [
		{name: "animator", kind: enyo.Animator, onAnimate: "animate", onEnd: "finishAnimate"}
	],
	create: function() {
		this.inherited(arguments);
		this.flyInFromChanged();
	},
	flyInFromChanged: function(inOldValue) {
		this.applyStyle(this.flyInFrom, 0);
	},
	getAnimator: function() {
		return this.$.animator;
	},
	renderOpen: function() {
		this.inherited(arguments);
		if (this.showHideMode != "manual") {
			this.startAnimate(100, 0);
		}
	},
	renderClose: function() {
		if (this.showHideMode == "auto") {
			this.startAnimate(0, 100);
		}
	},
	// NOTE: this could be made simpler by using -webkit-transition
	startAnimate: function(inStart, inEnd) {
		if (this.hasNode()) {
			this.$.animator.setNode(this.node);
			this.$.animator.style = this.node.style;
		}
		this.$.animator.play(inStart, inEnd);
	},
	animate: function(inSender, inPercent) {
		var ds = this.domStyles;
		var s = inSender.style;
		var translate = this.flyInFrom == "top" || this.flyInFrom == "bottom" ? "translateY(" : "translateX(";
		translate += this.flyInFrom == "top" || this.flyInFrom == "left" ? -inPercent : inPercent;
		translate += "%)";
		ds.webkitTransform = translate;
		if (s) {
			s.webkitTransform = translate;
		}
	},
	finishAnimate: function(inSender, inY) {
		if (this.isOpen) {
			enyo.asyncMethod(this, "afterOpen");
			this.$.animator.setNode(null);
		} else {
			this.hide();
		}
	},
        // Popup calls afterOpen in its finishOpen, override that call
        finishOpen: function() {
            this.renderOpen();
            this.showHideScrim(this.isOpen);
        },
	isDraggableEvent: function(inEvent) {
		var c = inEvent.dispatchTarget;
		return c && c.slidingHandler;
	},
	isHorizontal: function() {
		return this.flyInFrom == "right" || this.flyInFrom == "left";
	},
	dragstartHandler: function(inSender, inEvent) {
		if (this.isDraggableEvent(inEvent)) {
			this.dragging = true;
			this.dragD0 = 0;
			this.dragOffset = this.isHorizontal() ? inEvent.dx : inEvent.dy;
		}
	},
	dragHandler: function(inSender, inEvent) {
		if (this.dragging) {
			var d = this.isHorizontal() ? inEvent.dx - this.dragOffset : inEvent.dy - this.dragOffset;
			this.dragD = this.dragD0 - d;
			this.dragD0 = d;
			if ((this.dragD0 * ((this.flyInFrom == "right" || this.flyInFrom == "bottom") ? 1 : -1)) > 0) {
				var t = "translate3d(" + (this.isHorizontal() ? this.dragD0 + "px,0,0)" : "0," + this.dragD0 + "px,0)");
				this.domStyles["-webkit-transform"] = this.node.style.webkitTransform = t;
			}
		}
	},
	dragfinishHandler: function(inSender, inEvent) {
		if (this.dragging) {
			var w = this.hasNode()["client" + (this.isHorizontal() ? "Width" : "Height")]; 
			var s = Math.abs(this.dragD0/w) * 100;
			this.setShowHideMode("manual");
			if ((this.dragD * (this.flyInFrom == "right" || this.flyInFrom == "bottom" ? 1 : -1)) > 0) {
				this.startAnimate(s, 0);
				this.open();
			} else {
				this.startAnimate(s, 100);
				this.close();
			}
			this.setShowHideMode("auto");
			this.dragging = false;
		}
	}
});
