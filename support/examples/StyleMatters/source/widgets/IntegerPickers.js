enyo.kind({
	name: "widgets.IntegerPickers",
	kind: HeaderView,
	components: [
		{kind: "IntegerPicker", className: "picker-hbox"},
		{kind: "IntegerPicker", className: "picker-hbox", label: "rating", min: 1, max: 10, value: 5}
	]
});