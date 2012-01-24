enyo.kind({
	name: "toolbar.ToolBarLight",
	kind: HeaderView,
	noScroller: true,
	components: [
		{flex: 1},
		{kind: "Toolbar", pack: "justify", className: "enyo-toolbar-light", components: [
			{kind: "RadioToolButtonGroup", components: [
				{caption: "One"},
				{caption: "Two"},
				{caption: "Three"}
			]},
			{kind: "RadioToolButtonGroup", components: [
				{icon: "images/menu-icon-back.png"},
				{width: "80px", caption: "Middle"},
				{icon: "images/menu-icon-forward.png"}
			]},
			{kind: "ToolButtonGroup",  components: [
				{icon: "images/menu-icon-refresh.png"},
				{icon: "images/menu-icon-refresh.png"},
				{icon: "images/menu-icon-refresh.png"},
				{icon: "images/menu-icon-search.png"}
			]},
			{toggling: true, icon: "images/menu-icon-new.png"}
		]}
	]
});