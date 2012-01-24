enyo.kind({
	name: "headers.PageHeader",
	kind: enyo.VFlexBox,
	components: [
		{kind: "PageHeader", content: "This is a single-line header without an icon", style: "text-transform: capitalize"},
		{kind: "PageHeader", components: [
			{content: "Some truncating text that extends far far far far far far beyond the header's width", flex: 1, className: "enyo-text-ellipsis", style: "text-transform: capitalize"}
		]},
		{kind: "PageHeader", layoutKind: "VFlexLayout", components: [
			{content: "With a secondary title and without capitalization"},
			{content: "These page headers are quite flexible and work in any orientation", className: "enyo-item-secondary"}
		]},
		{kind: "PageHeader", components: [
			{kind: "Image", src: "images/facebook-32x32.png", style: "padding-right: 10px"},
			{layoutKind: "VFlexLayout", components: [
				{content: "This is a multi-line page header with icon", style: "text-transform: capitalize;"},
				{content: "The Secondary line", className: "enyo-item-secondary"}
			]}
		]},
		{kind: "PageHeader", components: [
			{kind: "Image", src: "images/mypalm-32x32.png", style: "padding-right: 10px"},
			{content: "Single line with custom icon and truncating text (Long header is long! la la la la la la)", flex: 1, className: "enyo-text-ellipsis", style: "text-transform: capitalize;"}
		]},
		{kind: "PageHeader", className: "enyo-header-dark", components: [
			{kind: "Image", src: "images/mypalm-32x32.png", style: "padding-right: 10px"},
			{content: "Dark Header", flex: 1, style: "text-transform: capitalize;"}
		]},
		{kind: "PageHeader", style: "background-color: pink", components: [
			{kind: "Image", src: "images/mypalm-32x32.png", style: "padding-right: 10px"},
			{content: "Custom Color Header", flex: 1, style: "text-transform: capitalize;"}
		]},
	]
});