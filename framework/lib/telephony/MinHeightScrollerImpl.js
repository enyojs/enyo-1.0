// helper class to control the min height of a scroller in the phone app.
// fixed to a standard height per device 
enyo.kind({
	name: "MinHeightScrollerImpl",
	kind: "Scroller",
	autoHorizontal: false,
	horizontal: false,
	autoVertical: true, // don't allow 'nudging' of content that doesn't need to be scrolled
	multiChrome: [
		{name: "client", className: "enyo-view", components: [
			{name: "innerClient", height: "100%"}
		]}
	],
	published: {
		clientMinHeight: ''
	},
	create: function() {
		this.inherited(arguments);
		this.clientMinHeightChanged();
	},
	clientMinHeightChanged: function() {
		this.$.innerClient.applyStyle("min-height", (this.clientMinHeight || this.defaultClientMinHeight) + "px");
	}
});