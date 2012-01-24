enyo.kind({
	name: "widgets.ToolInputs",
	kind: HeaderView,
	components: [
		{flex: 1},
		{kind: "Toolbar", components: [
			{kind: "ToolInput", hint: "Name..."}
		]},
		{flex: 1},
		{kind: "Toolbar", components: [
			{kind: "ToolInput", hint: "Enter URL or search terms", width: "100%", components: [
				{style: "background: url(images/menu-icon-forward.png) 0 0; width: 32px; height: 32px;"}
			]}
		]}
	]
});