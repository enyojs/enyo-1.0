// Determine if First Launch needs to be run
//
// Usage:
// ======
//
// Kind:
// {name: "checkFirstLaunch", kind: "Accounts.checkFirstLaunch", onCheckFirstLaunchResult: "onCheckFirstLaunchResult"}
//
// Check to see if FirstLaunch needs to be shown.  This is an asynchronous method and fires onCheckFirstLaunchResult for the result:
// this.$.checkFirstLaunch.shouldFirstLaunchBeShown({
// 		appId: "com.palm.app.contacts",		// AppId of app  (optional)
// });
//
// The callback for shouldFirstLaunchBeShown:
// onCheckFirstLaunchResult: function(inSender, inResponse) {
// 		var show = inResponse.showFirstLaunch;		
// }
//
// Store the fact that First Launch has been shown.  This is a synchronous call with no callback.
// this.$.checkFirstLaunch.firstLaunchHasBeenShown(shown);
// Parameter "shown" is optional (default = true) and assumes the same appId as for shouldFirstLaunchBeShown()


enyo.kind({
	name: "Accounts.checkFirstLaunch",
	kind: "Component",
	dbKind: "com.palm.firstlaunch:1",
	published: {
		appId: "" // The app ID of the calling app (optional)
	},
	events: {
		onCheckFirstLaunchResult: ""
	},
	components: [
		{name: "mojoDBQuery", kind: "DbService", "method": "find", onResponse: "mojoDBQueryResponse"},
		{name: "mojoDBPut", kind: "DbService", "method": "put"},
		{name: "mojoDBDel", kind: "DbService", "method": "del"}
	],
	
	// Get the account templates.  If the templates are in the cache then return those instead
	// of making a service call.  Use {"refreshCache":true} to force the retrieval of the templates 
	shouldFirstLaunchBeShown: function(appId) {
		this.appId = appId || this.appId || enyo.fetchAppId();
		// See if this app has been run before.  If it has then an entry will be found
		this.$.mojoDBQuery.call({"query": {"from": this.dbKind, "where": [{"prop": "appId", "op": "=", "val": this.appId}]}});
	},
	
	mojoDBQueryResponse: function(inSender, inResponse) {
		console.log("inResponse.results = " + enyo.json.stringify(inResponse.results));
		if (inResponse.returnValue && inResponse.results && inResponse.results.length > 0) {
			// First Launch has been run already
			this.doCheckFirstLaunchResult({showFirstLaunch: false});
		}
		else {
			// First Launch should be shown for the app 
			this.doCheckFirstLaunchResult({showFirstLaunch: true});
		}
	},
	
	firstLaunchHasBeenShown: function(shown) {
		// Default is that FirstLaunch has been shown
		if (shown === undefined)
			shown = true;
		if (shown) {
			// Store the appId in the database so that FirstLaunch won't be shown again
			this.$.mojoDBPut.call({"objects":[{"_kind": this.dbKind, "appId":this.appId, "_sync":false}]})
		}
		else {
			// Remove the database entry so that First Launch will be shown next time
			this.$.mojoDBDel.call({"query": {"from": this.dbKind, "where": [{"prop": "appId", "op": "=", "val": this.appId}]}});
		}
	}
});

