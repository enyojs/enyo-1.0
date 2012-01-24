enyo.kind({
	name: "App",
	kind: enyo.Control,
	components: [
		{kind: "PageHeader", content: "This is an app with an app menu"},
		{style: "padding: 10px", content: "Note: In the browser, you can press ctrl-~ to display the app menu."},
		{kind: "Button", caption: "Show App Menu", onclick: "openAppMenu"},
		{kind: "Button", caption: "Add zot item", onclick: "addZot"},
		{kind: "Button", caption: "Remove zot item", onclick: "removeZot"},
		{kind: "AppMenu", onBeforeOpen: "beforeAppMenuOpen", components: [
			{kind: "EditMenu"},
			{caption: "Turn off the lights", onclick: "turnLightsOff"},
			{caption: "Turn on the lights", onclick: "turnLightsOn"},
		]}
	],
	openAppMenu: function() {
		this.$.appMenu.open();
	},
	beforeAppMenuOpen: function() {
		this.updateZot();
	},
	updateZot: function() {
		var m = this.$.appMenu;
		if (this.zot && !this.$.zotItem) {
			m.createComponent({name: "zotItem", caption: "Zot", owner: this});
		} else if (!this.zot && this.$.zotItem) {
			this.$.zotItem.destroy();
		}
		m.render();
	},
	addZot: function() {
		this.zot = true;
	},
	removeZot: function() {
		this.zot = false;
	},
	turnLightsOff: function() {
		this.applyStyle("background-color", "black");
	},
	turnLightsOn: function() {
		this.applyStyle("background-color", null);
	}
});