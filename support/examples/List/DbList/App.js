enyo.kind({
	name: "App",
	kind: enyo.VFlexBox,
	components: [
		{kind: "MockDb", method: "find", dbKind: "com.palm.canondblist:2", onSuccess: "queryResponse", onWatch: "queryWatch"},
		{kind: "DbService", method: "find", dbKind: "xcom.palm.canondblist:2", subscribe: true, onSuccess: "queryResponse", onFailure: "queryFail", onWatch: "queryWatch"},
		{kind: "PageHeader", content: "Db List Example"},
		{layoutKind: "HLayout", style: "background-color: silver; padding: 4px;", components: [
			{kind: "Button", caption: "Update Row", onclick: "updateRow"},
			{kind: "Button", caption: "Dump Selection", onclick: "dumpSelection"},
			{content: "&nbsp;&nbsp;Multiselect:&nbsp;", allowHtml: true},
			{name: "multiMode", kind: "ToggleButton", onChange: "multiModeChange"}
		]},
		{name: "console", allowHtml: true, style: "background-color: white; padding: 4px;", content: "Use <i>bridge</i> launch option to use device data from over webOs bridge."},
		{flex: 1, name: "list", kind: "DbList", onQuery: "listQuery", onSetupRow: "listSetupRow", components: [
			{kind: "Item", style: "background-color: white", onclick: "selectItem", components: [
				{kind: "HFlexBox", components: [
					{name: "itemColor", className: "item-color"},
					{name: "itemName", flex: 1},
					{name: "itemIndex", className: "item-index"}
				]},
				{name: "itemSubject", className: "item-subject"}
			]}
		]},
		{kind: "Button", caption: "Install Db", onclick: "installDb"},
		{kind: "DbInstaller", onSuccess: "installSuccess", onFailure: "installFail"}
	],
	create: function() {
		this.inherited(arguments);
		if (!window.PalmSystem && !enyo.args.bridge) {
			// to use the automatic PalmService data-mocking, we set the dbList.pageSize such that the entire db fits in one page
			this.$.list.setPageSize(500);
		}
	},
	queryFail: function(inSender, inResponse) {
		this.$.console.setContent("dbService failure: " + enyo.json.stringify(inResponse));
		this.$.console.addContent("<br/><span style='color: red'>You may need to install the database with the installDb button below.'</span>");
	},
	listQuery: function(inSender, inQuery) {
		// IMPORTANT: must return a request object so dbList can decorate it
		if (window.PalmSystem || enyo.args.bridge) {
			return this.$.dbService.call({query: inQuery});
		} else {
			return this.$.mockDb.call({query: inQuery});
		}
	},
	queryResponse: function(inSender, inResponse, inRequest) {
		this.$.list.queryResponse(inResponse, inRequest);
	},
	queryWatch: function() {
		this.$.console.setContent("dbService watch fired");
		this.$.list.reset();
	},
	listSetupRow: function(inSender, inRecord, inIndex) {
		this.$.item.applyStyle("background-color", inSender.isSelected(inIndex) ? "lightgreen" : null);
		this.$.itemIndex.setContent("(" + inIndex + ")");
		this.$.itemName.setContent(inRecord.name);
		this.$.itemColor.applyStyle("background-color", inRecord.color);
		this.$.itemSubject.setContent(inRecord.subject);
	},
	updateRow: function() {
		var record = this.$.list.fetch(0);
		record.name = "UPDATED";
		this.$.list.updateRow(0);
	},
	selectItem: function(inSender, inEvent) {
		// The selection interface allows attaching arbitrary data to the selection entry.
		// At some later point, the rowIndex may not refer to a record in the local cache, 
		// so one can store a database to uniquely identify the record.
		this.$.list.select(inEvent.rowIndex, this.$.list.fetch(inEvent.rowIndex).name);
	},
	multiModeChange: function(inSender) {
		this.$.list.setMultiSelect(inSender.getState());
	},
	dumpSelection: function() {
		var s = this.$.list.getSelection().selected;
		var h = [];
		for (var i in s) {
			if (s[i]) {
				h.push(s[i]);
			}
		}
		this.$.console.setContent(h.join("<br/>"));
		this.$.list.resized();
	},
	//
	// these methods are for installing the mock data into a database on a PalmSystem device
	//
	installDb: function() {
		if (window.PalmSystem || enyo.args.bridge) {
			this.$.dbInstaller.install(this.$.mockDb.dbKind, "com.palm.dblist", this.$.mockDb.data);
		} else {
			console.log("Run on device or use bridge to install Db.");
		}
	},
	installSuccess: function(inSender) {
		this.$.list.punt();
		this.$.console.setContent("install success");
	}
});