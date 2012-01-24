enyo.kind({
	name: "widgets.TimePickers",
	kind: HeaderView,
	components: [
		{kind: "TimePicker", className: "picker-hbox"},
		{kind: "TimePicker", className: "picker-hbox", is24HrMode: true},
		{kind: "RowGroup", caption: "schedule", components: [
			{kind: "TimePicker", label: "start", labelClass: "widgets-timepickers-label", tapHighlight: false},
			{kind: "TimePicker", label: "end", labelClass: "widgets-timepickers-label", tapHighlight: false}
		]}
	]
});