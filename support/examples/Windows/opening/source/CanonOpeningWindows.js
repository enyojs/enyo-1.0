enyo.kind({
	name: "enyo.CanonOpeningWindows",
	kind: "VFlexBox",
	chrome: [
		{kind: "ApplicationEvents",
			onWindowActivated: "windowActivated",
			onWindowDeactivated: "windowDeactivated",
			onWindowParamsChange: "windowParamsChanged",
			onApplicationRelaunch: "applicationRelaunched"
		},
		{kind: "Scroller", flex: 1, components: [
			{kind: "PageHeader", components: [
				{kind: "VFlexBox", flex: 1, components: [
					{content: "Opening Windows Demo"},
					{kind: "HFlexBox", style: "font-size: 15px", components: [
						{content: "Window Name: ", style: "padding-right: 8px"},
						{name: "windowName", flex: 1}
					]}
				]},
				{kind: "Button", label: "Close", onclick: "closeClick"}
			]},
			{kind: "Divider", caption: "Open Window"},
			{kind: "HFlexBox", style: "padding: 10px;", align: "center", onclick: "openWindowClick", components: [
				{flex: 1, content: "Open a copy of this window..."},
				{kind: "Button", caption: "Open"},
			]},
			{kind: "Divider", caption: "Window Params"},
			{style: "padding: 10px;", align: "center", components: [
				{content: "Window params can be used to transmit messages between application windows..."},
				{kind: "RowGroup", caption: "Current enyo.windowParams", components: [
					{name: "windowParams", content: "none"}
				]},
				{kind: "RowGroup", caption: "Window Params to send...", components: [
					{name: "windowParamsInput", kind: "Input", 
					value: "{message: 'hello world'}",
					hint: "Enter window params (json) to send to a window"},
				]},
				{kind: "RowGroup", caption: "Select a window...", components: [
					{name: "windowSelector", kind: "ListSelector"}
				]},
				{layoutKind: "HFlexLayout", pack: "end", components: [
					{kind: "Button", caption: "Send Params", style: "margin-right: 8px;", onclick: "sendParamsToSelected"},
					{kind: "Button", caption: "Activate", onclick: "activateSelected"}
				]}
			]}
		]}
	],
	create: function() {
		this.inherited(arguments);
		this.banners = [];
		this.$.windowName.setContent(window.name);
	},
	popuplateWindowSelector: function() {
		var windows = enyo.windows.getWindows();
		var items = [];
		for (var i in windows) {
			items.push(i);
		}
		this.$.windowSelector.setItems(items);
		this.$.windowSelector.setValue(window.name);
	},
	sendParamsToSelected: function() {
		var w = enyo.windows.fetchWindow(this.$.windowSelector.getValue());
		if (w) {
			enyo.windows.setWindowParams(w, this.$.windowParamsInput.getValue());
		}
	},
	activateSelected: function() {
		var n = this.$.windowSelector.getValue();
		var w = enyo.windows.fetchWindow(n);
		if (w) {
			enyo.windows.activate(null, n, this.$.windowParamsInput.getValue());
		}
	},
	openWindowClick: function() {
		enyo.windows.openWindow("index.html", "", {wasLaunchedBy: window.name});
	},
	closeClick: function() {
		window.close();
	},
	windowParamsChanged: function(inSender, inEvent) {
		var p = inEvent.params;
		p = p ? enyo.json.stringify(p) : "no windowParams";
		this.log(window.name, p);
		this.$.windowParams.setContent(p);
	},
	windowDeactivated: function() {
		this.log(window.name);
	},
	windowActivated: function() {
		this.log(window.name);
		this.popuplateWindowSelector();
	},
	applicationRelaunched: function() {
		this.log(window.name);
	}
});
