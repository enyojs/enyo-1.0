enyo.kind({
	name: "toolbar.MenuGroups",
	kind: HeaderView,
	noScroller: true,
	components: [
		{flex: 1},
		{kind: "Toolbar", pack: "justify", components: [
			{kind: "RadioToolButtonGroup", components: [
				{caption: "One", className: "enyo-radiobutton-dark enyo-grouped-toolbutton-dark"},
				{caption: "Two", className: "enyo-radiobutton-dark enyo-grouped-toolbutton-dark"},
				{caption: "Three", className: "enyo-radiobutton-dark enyo-grouped-toolbutton-dark"}
			]},
			{kind: "RadioToolButtonGroup", components: [
				{icon: "images/menu-icon-back.png", className: "enyo-radiobutton-dark enyo-grouped-toolbutton-dark"},
				{width: "80px", caption: "Middle", className: "enyo-radiobutton-dark enyo-grouped-toolbutton-dark"},
				{icon: "images/menu-icon-forward.png", className: "enyo-radiobutton-dark enyo-grouped-toolbutton-dark"}
			]},
			{kind: "ToolButtonGroup", components: [
				{icon: "images/menu-icon-refresh.png", className: "enyo-radiobutton-dark enyo-grouped-toolbutton-dark"},
				{icon: "images/menu-icon-refresh.png", className: "enyo-radiobutton-dark enyo-grouped-toolbutton-dark"},
				{icon: "images/menu-icon-refresh.png", className: "enyo-radiobutton-dark enyo-grouped-toolbutton-dark"},
				{icon: "images/menu-icon-search.png", className: "enyo-radiobutton-dark enyo-grouped-toolbutton-dark"}
			]},
			{toggling: true, icon: "images/menu-icon-new.png"}
		]}
	]
});