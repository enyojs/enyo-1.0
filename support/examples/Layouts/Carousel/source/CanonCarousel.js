enyo.kind({
	name: "enyo.CanonCarousel",
	kind: enyo.VFlexBox,
	components: [
		{name: "carousel", kind: "Carousel", flex: 1, 
			onGetLeft: "getLeft", 
			onGetRight: "getRight",
			onSnap: "snap",
			onSnapFinish: "snapFinish"
		}
	],
	create: function() {
		this.inherited(arguments);
		this.index = 0;
		this.$.carousel.setCenterView(this.getViewInfo(this.index));
	},
	resizeHandler: function(inSender, e) {
		this.inherited(arguments);
		this.$.carousel.resize();
	},
	getViewInfo: function(inIndex) {
		var colors = ["lightblue", "lightgreen", "yellow"];
		if (inIndex%2) {
			return {kind: "CanonView", headerContent: inIndex, bodyColor: colors[Math.abs(inIndex%3)]};
		} else {
			return {kind: "HFlexBox", align: "center", pack: "center", style: "font-size: 5em;", content: inIndex};
		}
	},
	getLeft: function(inSender, inSnap) {
		inSnap && this.index--;
		return this.getViewInfo(this.index-1);
	},
	getRight: function(inSender, inSnap) {
		inSnap && this.index++;
		return this.getViewInfo(this.index+1);
	},
	snap: function() {
		this.log();
	},
	snapFinish: function() {
		var v = this.$.carousel.fetchCurrentView();
		this.log(v.kindName + ": " + (v.headerContent || v.content));
	}
});
