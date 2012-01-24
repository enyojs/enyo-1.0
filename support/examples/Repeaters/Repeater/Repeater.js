enyo.kind({
	name: "App",
	kind: enyo.VFlexBox,
	components: [
		{kind: "PageHeader", content: "Repeater Example"},
		{kind: "Button", caption: "Update Repeater", onclick: "updateRepeater"},
		{kind: "Scroller", flex: 1, components: [
			{kind: "Repeater", onSetupRow: "listSetupRow"}
		]}
	],
	create: function() {
		this.inherited(arguments);
	},
	listSetupRow: function(inSender, inIndex) {
		if (inIndex < 10) {
			return {kind: "SwipeableItem", layoutKind: "HFlexLayout", onclick: "itemClick", components: [
				{content: ["foo", "bar", "baz"][enyo.irand(3)], flex: 1},
				{kind: "CheckBox", checked: enyo.irand(2)}
			]};
		}
	},
	updateRepeater: function() {
		this.$.repeater.render();
	},
	itemClick: function(inSender) {
		console.log(inSender.rowIndex);
	}
});