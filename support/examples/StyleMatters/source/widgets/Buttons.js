enyo.kind({
	name: "widgets.Buttons",
	kind: HeaderView,
	components: [
		{kind: "Button", className: "enyo-button-dark", caption: "Primary Button"},
		{kind: "Button", caption: "Secondary Button"},
		{kind: "Button", className: "enyo-button-affirmative", caption: "Affirmative Button"},
		{kind: "Button", className: "enyo-button-negative", caption: "Negative Button"},
		{kind: "Button", className: "enyo-button-dark", caption: "Disabled Button", disabled: true},
		{kind: "Button", caption: "Disabled Button", disabled: true},
		{kind: "Button", className: "enyo-button-affirmative", caption: "Disabled Button", disabled: true},
		{kind: "Button", className: "enyo-button-negative", caption: "Disabled Button", disabled: true},
		
		{kind: "Spacer"},
		{layoutKind: "HFlexLayout", components: [
			{kind: "Button", className: "enyo-button-light", caption: "Cancel", flex: 1},
			{kind: "Button", className: "enyo-button-dark", caption: "OK", flex: 1}
		]},
		{kind: "Spacer"},
		{layoutKind: "HFlexLayout", components: [
			{kind: "Button", className: "enyo-button-blue", caption: "Blue Button", flex: 1},
			{kind: "Button", caption: "Custom Color Button 1", style: "background-color:deepPink; color:white", flex: 1},
			{kind: "Button", caption: "Custom Color Button 2", style: "background-color:orange; color:white", flex: 1},
			{kind: "Button", caption: "Custom Color Button 3", style: "background-color:PaleTurquoise; color:midnightBlue", flex: 1},
		]},
		{kind: "Toolbar", components: [
			{caption: "Tool Button"}
		]}
	]
});