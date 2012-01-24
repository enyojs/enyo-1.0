// Handle cross-app launch for custom validation UI
// If an account is being modified


enyo.kind({
	name: "Accounts.crossAppUI",
	kind: enyo.Control,
	events: {
		onResult: "",
		onCrossAppUILoaded: "",
	},
	components: [
		{kind: "CrossAppUI", name:"crossAppUI", tabIndex: -1},
		{name: "modifyAccount", kind: "PalmService", service: enyo.palmServices.accounts, method: "modifyAccount"},
	],
	
	launchCrossAppUI: function(ui, params) {
		// Save the accountId if modifying the account so the credentials can be saved later
		if (params && params.mode === "modify" && params.account)
			this.accountId = params.account._id; 
		console.log("Custom UI: Opening iFrame " + ui.appId + "/" + ui.name);
		this.$.crossAppUI.path = ui.name;
		this.$.crossAppUI.setParams(params);
		this.$.crossAppUI.setApp(ui.appId);
		this.$.crossAppUI.onResult = "handleCrossAppUIResult";
		this.$.crossAppUI.onload = 'doCrossAppUILoaded';
	},
	
	// Handle the validation response from the custom UI
	handleCrossAppUIResult: function(inSender, msg) {
		//console.log("Accounts.crossAppUI:" + enyo.json.stringify(msg));
		if (this.accountId) {
			// Account was being modified.  If there is a validation object then save it
			if (msg && msg.returnValue && (msg.credentials || msg.config)) {
				console.log("Updating credentials for account " + this.accountId);
				// Modify the account
				var params = {
					"accountId": this.accountId,
					"object": {
						config: msg.config,
						credentials: msg.credentials,
					}
				};
				this.$.modifyAccount.call(params);
			}
		}
		this.doResult(msg);
		this.$.crossAppUI.onResult = "";
		this.$.crossAppUI.params = null;
		this.$.crossAppUI.path = null;
		this.$.crossAppUI.setApp();
		delete this.$.crossAppUI.onload;
	}
});

