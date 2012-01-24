/*
enyo.DomBuffer.prototype.installPage = function(inNode, inPage) {
	if (!inNode.parentNode) {
		var parentNode = this.pagesNode;
		if (inPage >= this.bottom) {
			parentNode.insertBefore(inNode, parentNode.firstChild);
		} else {
			parentNode.appendChild(inNode);
		}
	}
};
*/

/*
enyo.DbPages.prototype.receivePage = function(inResponse, inRequest) {
	var index = inRequest.index;
	//
	if (!inResponse.results.length) {
		this.pages[index] = {};
		return;
	}
	//
	this.pages[index] = {
		data: inResponse.results,
		request: inRequest
	};
	//
	// update min/max pages
	this.min = Math.min(this.min, index);
	this.max = Math.max(this.max, index);
	//
	//this.setHandle(index, inResponse.handle);
	//this.setHandle(index+1, inResponse.next);
	this.setHandle(index, inResponse.next);
	this.setHandle(index+1, inResponse.handle);
	//
	this.doReceive(index);
};
*/

enyo.kind({
	name: "enyo.CanonDbList",
	kind: enyo.VFlexBox,
	components: [
		{kind: "DbService", method: "find", dbKind: "com.palm.canondblist:2", subscribe: true, onSuccess: "queryResponse", onFailure: "queryFail", onWatch: "queryWatch"},
		{kind: "MockDb", dbKind: "com.palm.canondblist:2", onSuccess: "queryResponse", onWatch: "queryWatch"},
		{kind: "PageHeader", content: "Db List Example"},
		{name: "console", style: "background-color: white;"},
		{flex: 1, name: "list", desc: true, kind: "DbList", onQuery: "listQuery", onSetupRow: "listSetupRow", components: [
			{kind: "Item", style: "background-color: white", components: [
				{kind: "HFlexBox", components: [
					{name: "itemColor", className: "item-color"},
					{name: "itemName", flex: 1},
					{name: "itemIndex", className: "item-index"}
				]},
				{name: "itemSubject", className: "item-subject"}
			]}
		]},
		{kind: "Button", caption: "Find Bottom", onclick: "findBottom"},
		{kind: "Button", caption: "Reset List", onclick: "queryWatch"}
		/*
		{kind: "Button", caption: "Install Db", onclick: "installDb"},
		{kind: "DbInstaller", onSuccess: "installSuccess", onFailure: "installFail"}
		*/
	],
	create: function() {
		this.first = true;
		this.inherited(arguments);
	},
	findBottom: function() {
		this.$.list.$.scroller.findBottom();
		//this.$.list.refresh();
	},
	queryFail: function(inSender, inResponse) {
		this.$.console.setContent("dbService failure: " + enyo.json.stringify(inResponse));
	},
	listQuery: function(inSender, inQuery) {
		//
		// list is marked desc: true, so:
		//    queries are desc: true, backQueries are desc: false
		//
		this.log("requested desc:", inQuery.desc);
		//inQuery.desc = false;
		//this.log(inQuery.page);
		if (!("page" in inQuery) || (inSender.$.dbPages.handles[0] == inQuery.page)) {
			inQuery.desc = !inQuery.desc;
			this.log("inverting desc:", inQuery.desc);
		}
		//
		// query is forced to desc: false, so:
		//	queries: (query.desc != list.desc)
		//		queries are reversed
		//		queries invert handle/next
		//	backQueries: (query.desc != list.desc)
		//		backQueries are reversed
		//		backQueries invert handle/next
		//
		// IMPORTANT: must return a request object so dbList can decorate it
		if (window.PalmSystem) {
			return this.$.dbService.call({query: inQuery});
		} else {
			return this.$.mockDb.call({query: inQuery}, {method: "find"});
		}
	},
	queryResponse: function(inSender, inResponse, inRequest) {
		this.$.list.queryResponse(inResponse, inRequest);
		if (this.first) {
			this.first = false;
			//setTimeout(enyo.bind(this, "findBottom"), 100);
			this.findBottom();
		}
	},
	queryWatch: function() {
		/*
		this.$.console.setContent("dbService watch fired");
		this.findBottom();
		this.$.list.reset();
		//this.$.list.punt();
		//this.first = true;
		*/
		//this.$.list.punt();
		this.$.list.reset();
		setTimeout(enyo.bind(this, "findBottom"), 500);
	},
	listSetupRow: function(inSender, inRecord, inIndex) {
		this.$.itemIndex.setContent("(" + inIndex + ")");
		this.$.itemName.setContent(inRecord.name);
		this.$.itemColor.applyStyle("background-color", inRecord.color);
		this.$.itemSubject.setContent(inRecord.subject);
	},
	//
	// these methods are for installing the mock data into a database on a PalmSystem device
	//
	installDb: function() {
		if (window.PalmSystem) {
			this.$.dbInstaller.install(this.$.mockDb.dbKind, "com.palm.dblist", this.$.mockDb.data);
		} else {
			console.log("Device required for install Db.");
		}
	},
	installSuccess: function(inSender) {
		this.$.list.punt();
		this.$.console.setContent("install success");
	}
});