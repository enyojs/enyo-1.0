enyo.kind({
	name: "widgets.Activity",
	kind: HeaderView,
	components: [
		{kind: "Divider", caption: "EXAMPLES"},
		{kind: "ViewItem", className: "enyo-first", viewKind: "widgets.SmallActivity",
			title: "Small Activity Indicators"},
		{kind: "ViewItem", className: "enyo-last", viewKind: "widgets.LargeActivity",
			title: "Large Activity Indicators"}
	]
});

enyo.kind({
	name: "widgets.SmallActivity",
	kind: HeaderView,
	components: [
		{kind: "RowGroup", caption: "Indeterminite Progress", components: [
			{kind: "HFlexBox", tapHighlight: false, components: [
				{content: "Searching..."},
				{kind: "Spacer"},
				{kind: "Spinner", showing: true}
			]},
			{kind: "HFlexBox", tapHighlight: false, components: [
				{content: "Calculating..."},
				{kind: "Spacer"},
				{kind: "Spinner", showing: true}
			]},
			{kind: "HFlexBox", tapHighlight: false, components: [
				{content: "Updating..."},
				{kind: "Spacer"},
				{kind: "Spinner", showing: true}
			]}
		]}
	]
});

enyo.kind({
	name: "widgets.LargeActivity",
	kind: HeaderView,
	components: [
		{layoutKind: "VFlexLayout", align: "center", pack: "center", flex: 1, components: [
			{kind: "SpinnerLarge", showing: true}
		]}
	]
});