enyo.kind({
	name: "widgets.Slider",
	kind: HeaderView,
	components: [
		{kind: "RowGroup", components: [
			{kind: "VFlexBox", tapHighlight: false, components: [
				{content: "Ringer Volume"},
				{kind: "Slider", position: 20}
			]}
		]}
	]
});