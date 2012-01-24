enyo.kind({
	name: "widgets.ProgressButton",
	kind: HeaderView,
	components: [
		{kind: "ProgressButton", position: 50, onCancel:"reset", components: [
			{kind:"HFlexBox", components:[
				{content: "0"},
				{kind: "Spacer"},
				{content: "100"}
			]}
		]},
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
		var p = this.$.progressButton;
		var i = p.minimum + ((p.position - p.minimum + 5) % (p.calcRange() + 1));
		p.setPosition(i);
	},
	reset: function() {
		this.$.progressButton.setPosition(0);
	}
});
