enyo.kind({
	name: "App",
	kind: enyo.Control,
	components: [
		{kind: "ApplicationEvents", onOpenAppMenu: "openAppMenu", onCloseAppMenu: "closeAppMenu"},
		{kind: "PageHeader", content: "This is an app with an app menu"},
		{style: "padding: 10px", content: "Note: In the browser, you can press ctrl-~ to display the app menu."},
		{kind: "Button", caption: "Show App Menu", onclick: "openAppMenu"},
		{kind: "Button", caption: "Add zot item", onclick: "addZot"},
		{kind: "Button", caption: "Remove zot item", onclick: "removeZot"},
		{kind: "Button", caption: "Enable zot item", onclick: "enableZot"},
		{kind: "Button", caption: "Disable zot item", onclick: "disableZot"},
		{kind: "Item", layoutKind: "HFlexLayout", align: "center", components: [
			{content: "App Menu cannot be shown when any modal popup, including this picker is open:", flex: 1},
			{kind: "IntegerPicker"}
		]},
		{kind: "Item", layoutKind: "HFlexLayout", align: "center", components: [
			{content: "Use other app menu", flex: 1},
			{kind: "ToggleButton", onChange: "switchAppMenu"}
		]},
		{kind: "AppMenu", automatic: false, onBeforeOpen: "beforeAppMenuOpen", components: [
			{kind: "EditMenu"},
			{caption: "Turn off the lights", onclick: "turnLightsOff"},
			{caption: "Turn on the lights", onclick: "turnLightsOn"},
		]},
		{name: "otherAppMenu", automatic: false, kind: "AppMenu", components: [
			{caption: "And now for something"},
			{caption: "completely different"},
		]}
	],
	zot: null,
	zotDisabled: false,
	openAppMenu: function() {
		var menu = this.myAppMenu || this.$.appMenu;
		menu.open();
	},
	closeAppMenu: function() {
		var menu = this.myAppMenu || this.$.appMenu;
		menu.close();
	},
	switchAppMenu: function(inSender) {
		this.myAppMenu = inSender.getState() ? this.$.otherAppMenu : this.$.appMenu;
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
		if (this.zot) {
			this.$.zotItem.setDisabled(this.zotDisabled);
		}
		m.render();
	},
	addZot: function() {
		this.zot = true;
	},
	removeZot: function() {
		this.zot = false;
	},
	enableZot: function() {
		this.zotDisabled = false;
	},
	disableZot: function() {
		this.zotDisabled = true;
	},
	turnLightsOff: function() {
		this.applyStyle("background-color", "black");
	},
	turnLightsOn: function() {
		this.applyStyle("background-color", null);
	}
});