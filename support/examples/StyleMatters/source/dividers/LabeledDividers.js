enyo.kind({
	name: "dividers.LabeledDividers",
	kind: HeaderView,
	components: [
		{kind: "Divider", caption: "SECTION 1"},
		{kind: "Item", className: "enyo-first", components: [
			{content: "Example 1"},
			{content: "An example", className: "enyo-item-secondary"}
		]},
		{kind: "Item", className: "enyo-last", components: [
			{content: "Example 2"},
			{content: "An example", className: "enyo-item-secondary"}
		]},
		{kind: "Divider", caption: "SECTION 2"},
		{kind: "Item", className: "enyo-first enyo-last", components: [
			{content: "Example 3"},
			{content: "An example", className: "enyo-item-secondary"}
		]},
		{kind: "Divider", caption: "SECTION 3"},
		{kind: "Item", className: "enyo-first enyo-last", components: [
			{content: "Example 4"},
			{content: "An example", className: "enyo-item-secondary"}
		]},
		{kind: "Divider", caption: "SECTION 4"},
		{kind: "Item", className: "enyo-first", components: [
			{content: "Example 5"},
			{content: "An example", className: "enyo-item-secondary"}
		]},
		{kind: "Item", components: [
			{content: "Example 6"},
			{content: "An example", className: "enyo-item-secondary"}
		]},
		{kind: "Item", className: "enyo-last", components: [
			{content: "Example 7"},
			{content: "An example", className: "enyo-item-secondary"}
		]},
		{kind: "Divider", caption: "SECTION 5"},
		{kind: "Item", className: "enyo-first", components: [
			{content: "Example 8"},
			{content: "An example", className: "enyo-item-secondary"}
		]},
		{kind: "Item", className: "enyo-last", components: [
			{content: "Example 9"},
			{content: "An example", className: "enyo-item-secondary"}
		]},
	]
});