enyo.kind({
	name: "popups.Menus",
	kind: HeaderView,
	components: [
		{flex: 1},
		{kind: "Toolbar", components: [
			{caption: "Category", onclick: "categoryClick"}
		]},
		/* By default, items are instances of MenuItem. Revoving the extra padding of the icon in css */
		{kind: "Menu", className: "example-submenu", components: [ 
			{caption: "All", icon: "images/folder.png"},
			{caption: "Business", icon: "images/folder.png"},
			{caption: "Personal", icon: "images/folder.png"},
			{caption: "Future", icon: "images/folder.png"},
			{caption: "Current", icon: "images/folder.png"},
			{caption: "Unfiled", icon: "images/folder.png"}
		]}
	],
	categoryClick: function(inSender) {
		console.log(inSender.id);
		this.$.menu.openAroundControl(inSender);
	}
});