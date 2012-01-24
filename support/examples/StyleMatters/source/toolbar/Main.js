enyo.kind({
	name: "toolbar.Main",
	kind: HeaderView,
	components: [
		{kind: "Divider", caption: "EXAMPLES"},
		{kind: "ViewItem", className: "enyo-first", viewKind: "toolbar.ToolButtons",
			title: "Tool Buttons"},
		{kind: "ViewItem", viewKind: "toolbar.MenuGroups",
			title: "ToolButton Groups"},
		{kind: "ViewItem", viewKind: "toolbar.ToolBarLight",
			title: "Toolbar in Light Color Chrome"},
		{kind: "ViewItem", className: "enyo-last", viewKind: "toolbar.ToolBarColor",
			title: "Toolbar in Custom Color Chrome"}
	]
});
