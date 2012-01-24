/**
A divider designed to show a single letter as its caption. For example:

	{kind: "AlphaDivider", caption: "S"}

*/
enyo.kind({
	name: "enyo.AlphaDivider",
	kind: enyo.Control,
	className: "enyo-divider-alpha",
	published: {
		caption: ""
	},
	components: [
		{name: "caption", className: "enyo-divider-alpha-caption"}
	],
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.captionChanged();
	},
	captionChanged: function() {
		this.$.caption.setContent(this.caption);
	}
});
