enyo.kind({
	name: "containers.Drawers",
	kind: HeaderView,
	components: [
		{kind: "Divider", caption: "EXAMPLES"},
		{kind: "ViewItem", className: "enyo-first", viewKind: "containers.ListDrawer",
			title: "Drawer with List"},
		{kind: "ViewItem", viewKind: "containers.DrawerDrawer",
			title: "Drawer in a Drawer"},
		{kind: "ViewItem", className: "enyo-last", viewKind: "containers.CustomDrawer",
			title: "Drawer with custom UI"}
	]
});