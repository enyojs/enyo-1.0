/**
A container for items presented at the bottom of the screen. By default, the
items are instances of <a href="#enyo.ToolButton">ToolButton</a>.

Example toolbar with three buttons equally spaced apart:

	{kind: "Toolbar", components: [
		{caption: "foo"},
		{kind: "Spacer"},
		{caption: "bar"},
		{kind: "Spacer"},
		{caption: "baz"}
	]}

Other controls to put in a Toolbar are <a href="#enyo.RadioToolButtonGroup">RadioToolButtonGroup</a> and <a href="#enyo.ToolButtonGroup">ToolButtonGroup</a>.
*/
enyo.kind({
	name: "enyo.Toolbar",
	kind: enyo.HFlexBox,
	published: {
		//* Fade the toolbar into view when the virtual keyboard is hidden or raised
		fadeOnKeyboard: false
	},
	chrome: [
		{kind: "enyo.ApplicationEvents", onKeyboardShown: "fadeHandler"}
	],
	pack: "center",
	align: "center",
	className: "enyo-toolbar",
	defaultKind: "ToolButton",
	//* @protected
	fadeHandler: function(inSender, inKeyboardParams) {
		if (this.fadeOnKeyboard && inKeyboardParams.showing) {
			this.fadeIn();
		}
	},
	fadeIn: function() {
		this.removeClass("enyo-toolbar-fade-in");
		this.addClass("enyo-toolbar-snap-out");
		/* FIXME: wait for keyboard to raise, need real event to say it's done */
		enyo.job(this.id + "fade", enyo.bind(this, "_fadeIn"), 300);
	},
	_fadeIn: function() {
		this.addClass("enyo-toolbar-fade-in");
	}
});
