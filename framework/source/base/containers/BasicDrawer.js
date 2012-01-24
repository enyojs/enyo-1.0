/**
A basic drawer control that animates vertically to open and close.
The drawer may be opened by calling setOpen(true) or just open; it 
may be closed by calling setOpen(false) or just close. For example,

	{kind: "Drawer", components: [
		{content: "Now you see me now you don't"},
		{kind: "Button", caption: "Close drawer", onclick: "closeDrawer"}
	]}

Then, to close the drawer:

	closeDrawer: function(inSender) {
		this.$.drawer.close();
	}

*/
enyo.kind({
	name: "enyo.BasicDrawer",
	kind: enyo.Control,
	published: {
		/**
		Specifies whether the drawer should be open.
		*/
		open: true,
		/**
		Controls whether or not the value of the open property may be changed.
		*/
		canChangeOpen: true,
		/**
		Set to false to avoid animations when the open state of a drawer changes.
		*/
		animate: true
	},
	events: {
		/**
		Event that fires when a drawer opens or closes.
		*/
		onOpenChanged: "",
		/**
		Event that fires when a drawer animation completes.
		*/
		onOpenAnimationComplete: ""
	},
	//* @protected
	chrome: [
		{name: "client"}
	],
	className: "enyo-drawer",
	create: function(inProps) {
		this.inherited(arguments);
		this.openChanged();
	},
	layoutKindChanged: function() {
		this.$.client.setLayoutKind(this.layoutKind);
	},
	openChanged: function(inOldValue) {
		if (!this.canChangeOpen) {
			this.open = inOldValue;
			return;
		}
		if (this.hasNode()) {
			this.node.style.display = "";
		} else {
			this.applyStyle("display", "");
		}
		// animate opening!
		if (this.animate && this.hasNode()) {
			this.playAnimation();
		} else {
			this.applyStyle("height", this.open ? "auto" : "0px");
			this.applyStyle("display", this.open ? null : "none");
		}
		if (inOldValue !== undefined && this.open !== inOldValue) {
			this.doOpenChanged();
		}
	},
	// NOTE: when animating closed, we ask dom for current content height
	getOpenHeight: function() {
		return this.$.client.hasNode().offsetHeight;
	},
	playAnimation: function() {
		if (this.hasNode()) {
			var a = this.node.animation;
			if (a) {
				a.stop();
			}
			//
			var s = this.node.offsetHeight;
			var e = this.open ? this.getOpenHeight() : 0;
			//
			// note: set correct control styles for end animation
			var ds = this.domStyles;
			ds.height = e + "px";
			ds.display = this.open ? null : "none";
			// NOTE: need to instruct animation not prevent animating if drawer is hidden,
			// because since the drawer hides itself, it would never unhide in this case.
			a = this.createComponent({kind: "Animator", onAnimate: "stepAnimation", onStop: "stopAnimation", node: this.node, style: this.node.style, open: this.open, s: s, e: e, alwaysAnimate: true});
			a.duration = this.open ? 250 : 100;
			a.play(s, e);
			this.node.animation = a;
		}
	},
	stepAnimation: function(inSender, inValue) {
		inSender.style.height = Math.round(inValue) + "px";
	},
	stopAnimation: function(inSender) {
		inSender.style.height = inSender.open ? "auto" : "0px";
		inSender.style.display = inSender.open ? null : "none";
		inSender.node.animation = null;
		inSender.destroy();
		this.doOpenAnimationComplete();
	},
	toggleOpen: function() {
		this.setOpen(!this.open);
	}
});

