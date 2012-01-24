enyo.kind({
	name: "widgets.RadioButtons",
	kind: HeaderView,
	notes: "FIXME: Currently value in RadioGroup is the index of which RadioButton is selected.\nWe should probably need a proper value there to be consistent with ListSelector.",
	components: [
		{kind: "RadioGroup", components: [
			{label: "TRUE"},
			{label: "FALSE"}
		]},
		{kind: "RadioGroup", value: 2, components: [
			{label: "FIRST"},
			{label: "SECOND"},
			{label: "THIRD"}
		]},
		{kind: "Group", caption: "Radio inside Group", components: [
			{style: "padding: 5px", components: [
				{kind: "RadioGroup", value: 1, components: [
					{label: "TRUE"},
					{label: "FALSE"}
				]},
				{kind: "RadioGroup", value: 2, components: [
					{label: "FIRST"},
					{label: "SECOND"},
					{label: "THIRD"}
				]}
			]}
		]}
	]
});