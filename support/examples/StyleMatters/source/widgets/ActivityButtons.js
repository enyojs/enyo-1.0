enyo.kind({
	name: "widgets.ActivityButtons",
	kind: HeaderView,
	components: [
		{allowHtml: true, className: "enyo-paragraph", content: "Note: Buttons should be in <em>desabled</em> state when the activity spinner is on."},
		{kind: "ActivityButton", disabled: true, active: true, caption: "Button"},
		{kind: "ActivityButton", disabled: true, active: true, className: "enyo-button-affirmative", caption: "Affirmative Button"},
		{kind: "ActivityButton", disabled: true, active: true, className: "enyo-button-negative", caption: "Negative Button"},
	]
});