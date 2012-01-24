enyo.kind({
	name: "containers.LabeledGroup",
	kind: HeaderView,
	components: [
		{kind: "RowGroup", defaultKind: "HFlexBox", caption: "Ingredients", components: [
			{align: "center", tapHighlight: true, components: [
				{kind: "CheckBox", checked: true, style: "margin-right:10px"},
				{content: "Sifted flour", flex: 1},
				{content: "2 CUPS", className: "enyo-label"}
			]},
			{align: "center", tapHighlight: true, components: [
				{kind: "CheckBox", checked: true, style: "margin-right:10px"},
				{content: "Lukewarm milk", flex: 1},
				{content: "3 CUPS", className: "enyo-label"}
			]},
			{align: "center", tapHighlight: true, components: [
				{kind: "CheckBox", checked: true, style: "margin-right:10px"},
				{content: "Melted butter", flex: 1},
				{content: "1 STICK", className: "enyo-label"}
			]}
		]},
		{kind: "RowGroup", caption: "Username", components: [
			{kind: "Input"}
		]},
		{kind: "RowGroup", caption: "Password", components: [
			{kind: "PasswordInput"}
		]},
		{kind: "RowGroup", defaultKind: "HFlexBox", caption: "To Do List", components: [
			{align: "center", tapHighlight: true, components: [
				{content: "Mail scrapbook", flex: 1},
				{kind: "CheckBox"}
			]},
			{align: "center", tapHighlight: true, components: [
				{content: "Research cruise", flex: 1},
				{kind: "CheckBox"}
			]},
			{align: "center", tapHighlight: true, components: [
				{content: "Write novel", flex: 1},
				{kind: "CheckBox"}
			]}
		]}
	]
});
