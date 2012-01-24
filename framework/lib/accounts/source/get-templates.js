// Get the list of templates from the Accounts service
//
// Usage:
// ======
//
// Kind:
// {name: "templates", kind: "Accounts.getTemplates", onGetTemplates_TemplatesAvailable: "onTemplatesAvailable"}
//
// Making the call:
// this.$.templates.getAccountTemplates({
// 		capability: "MAIL",		// Specify a capability to filter the templates (optional)
// });
//
// The callback:
// onTemplatesAvailable: function(inSender, inResponse, inRequest) {
// 		this.templates = inResponse;		
// }


enyo.kind({
	name: "Accounts.getTemplates",
	kind: "Component",
	events: {
		onGetTemplates_TemplatesAvailable: ""
	},
	components: [
		{kind: "PalmService", service: enyo.palmServices.accounts, method: "listAccountTemplates", name: "listAccountTemplates", onResponse: "gotAccountTemplates"},
		{name: "getTemplateChanges", kind: "TempDbService", dbKind: "com.palm.signaling:1", subscribe: true, method: "find", onResponse: "receivedTemplateUpdate", reCallWatches: true},
	],
	
	// Get the account templates. 
	// The templates are retrieved in the 'receivedTemplateUpdate' callback, which is called when the subscription is 
	// first established and then everytime the templates change (apps supporting templates are installed or removed)
	getAccountTemplates: function (options) {
		this.filter = (options && options.capability)? {"capability": options.capability}: {}; 
		
		// Subscribe to updates to the list of templates
		this.$.getTemplateChanges.call();
	},

	// Templates have changed (or this was the first response to the subscription)
	receivedTemplateUpdate: function(inSender, inResponse) {
		// A return value of false means the subscription didn't work (app on the public bus with no access to tempdb?).  Cancel the subscription
		if (inResponse.returnValue === false)
			this.$.getTemplateChanges.cancel();
			
		// Get the templates from the Accounts Service
		this.$.listAccountTemplates.call(this.filter);
	},
	
	// Success and failure calls for template retrieval from the accounts service	
	gotAccountTemplates: function(inSender, inResponse) {
		var accountTemplates = inResponse.results || [];
		//this.log("gotAccountTemplates: accountTemplates.length=" + accountTemplates.length);
		this.doGetTemplates_TemplatesAvailable(accountTemplates);
	}
});

