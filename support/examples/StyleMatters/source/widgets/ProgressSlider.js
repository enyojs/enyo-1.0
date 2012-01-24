enyo.kind({
	name: "widgets.ProgressSlider",
	kind: HeaderView,
	components: [
		{kind: "ProgressSlider", lockBar: true, position: 20},
		{kind: "Button", caption: "Toggle Progress!", toggling: true, onclick: "toggleProgress"}
	],
	toggleProgress: function(inSender) {
		this._progressing = inSender.depressed;
		this.nextProgress();
	},
	nextProgress: function() {
		if (this._progressing) {
			// animate only if node is showing
			enyo.requestAnimationFrame(enyo.bind(this, "_nextProgress"), this.hasNode());
		}
	},
	_nextProgress: function() {
		this.incrementProgress();
		setTimeout(enyo.bind(this, "nextProgress"), 500);
	},
	incrementProgress: function() {
		var p = this.$.progressSlider;
		var i = p.minimum + ((p.position - p.minimum + 5) % (p.calcRange() + 1));
		p.setPositionImmediate(i);
		p.setAltBarPosition(i+5); // showing "buffer" (alt progress bar)
	}
});