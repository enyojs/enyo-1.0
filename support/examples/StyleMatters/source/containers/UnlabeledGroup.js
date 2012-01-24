enyo.kind({
	name: "containers.UnlabeledGroup",
	kind: HeaderView,
	components: [
		{kind: "RowGroup", components: [
			{kind: "ListSelector", align: "center", items: [
				{caption: "Assiduous"},
				{caption: "Diligent"},
				{caption: "Earnest"},
				{caption: "Easy"},
				{caption: "Hard"},
				{caption: "Hardy"}
			]}
		]},
		{kind: "RowGroup", defaultKind: "HFlexBox", components: [
			{align: "center", tapHighlight: true, components: [
				{content: "Sifted flour", flex: 1},
				{content: "2 CUPS", className: "enyo-label"}
			]},
			{align: "center", tapHighlight: true, components: [
				{content: "Lukewarm milk", flex: 1},
				{content: "3 CUPS", className: "enyo-label"}
			]},
			{align: "center", tapHighlight: true, components: [
				{content: "Melted butter", flex: 1},
				{content: "1 STICK", className: "enyo-label"}
			]}
		]}
	]
});
