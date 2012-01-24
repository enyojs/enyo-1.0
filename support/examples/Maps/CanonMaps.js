enyo.kind({
	name: "enyo.CanonMaps",
	kind: enyo.VFlexBox,
	components: [
		{name: "openApp", kind: "PalmService", service: "palm://com.palm.applicationManager/", method: "open"},
		{kind: "SlidingPane", flex: 1, wideWidth: 800, components: [
			{name: "left", width: "320px", components: [
				{kind: "VFlexBox", flex: 1, components: [
					{name: "list", kind: "VirtualList", flex: 1, onSetupRow: "listSetupRow", components: [
						{kind: "Item", layoutKind: "HFlexLayout", align: "center", onclick: "itemClick", components: [
							{kind: "Image", src: "images/avatar.png"},
							{name: "name", style: "padding-left: 10px;"}
						]}
					]}
				]}
			]},
			{name: "right", flex: 1, peekWidth: 70, dragAnywhere: false, components: [
				{kind: "VFlexBox", flex: 1, components: [
					{kind: "Header"},
					{name: "address"},
					{name: "map", kind: "enyo.Map", showing: false, width: "400px", height: "300px", 
						credentials: "AllI6f9MXMMRCVmNpXYfg3Hb1n0EEuTkHgciTg2pXg8Lq9YUE8fQxDjcugMF-Iq3",
						mapType: "birdseye", zoom: 18, options: {showDashboard: false}},
					{name: "launchBtn", showing: false, kind: "Button", caption: "Launch Maps", onclick: "launchMaps", width: "200px"}
				]},
				{kind: "Toolbar", components: [
					{kind: "GrabButton"}
				]}
			]}
		]}
	],
	contacts: [
		{name: "John Doe", address: "303 Second Street, San Francisco", latitude: 37.78508, longitude: -122.395828},
		{name: "Jane Doe", address: "950 West Maude Avenue, Sunnyvale", latitude: 37.392506, longitude: -122.041191}
	],
	rendered: function() {
		this.inherited(arguments);
		this.$.list.refresh();
	},
	listSetupRow: function(inSender, inRow) {
		var c = this.contacts && this.contacts[inRow];
		if (c) {
			this.$.name.setContent(c.name);
			return true;
		}
	},
	itemClick: function(inSender, inEvent) {
		var c = this.contacts[inEvent.rowIndex];
		this.$.header.setContent(c.name);
		this.$.address.setContent(c.address);
		this.$.map.show();
		this.$.map.setCenter(c.latitude, c.longitude);
		this.$.launchBtn.show();
	},
	launchMaps: function() {
		this.$.openApp.call({
			id: "com.palm.app.maps",
			params: {
				address: this.$.address.getContent()
			}
		});
	}
})
