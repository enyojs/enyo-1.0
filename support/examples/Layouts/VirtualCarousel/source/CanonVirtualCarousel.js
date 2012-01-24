enyo.kind({
	name: "enyo.CanonVirtualCarousel",
	kind: enyo.VFlexBox,
	components: [
		{name: "carousel", kind: "VirtualCarousel", flex: 1,
			viewControl: {kind: "CanonView"}, 
			onSetupView: "setupView",
			onSnap: "snap",
			onSnapFinish: "snapFinish"
		}
	],
	create: function() {
		this.inherited(arguments);
		this.$.carousel.renderViews(0)
	},
	resizeHandler: function(inSender, e) {
		this.inherited(arguments);
		this.$.carousel.resize();
	},
	setupView: function(inSender, inView, inViewIndex) {
		var colors = ["lightblue", "lightgreen", "yellow"];
		inView.setHeaderContent(inViewIndex);
		inView.setBodyColor(colors[Math.abs(inViewIndex%3)]);
		return true;
	},
	snap: function() {
		this.log();
	},
	snapFinish: function() {
		var v = this.$.carousel.fetchCurrentView();
		this.log(v.headerContent);
	}
});
