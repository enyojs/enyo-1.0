// This provides UI to edit an account.  These fields are provided:
// 1. Account Name
// 2. Email address (field name can be overwritten by loc_usernameLabel in the account template)
// 3. Password (field name can be overwritten by loc_passwordLabel in the account template)
// 4. "Sign In" button
// 5. "Remove Account" button
// 6. Custom app chrome (can be used to add additional fields to the bottom of the view)
//
// When this view is done the onAccountsUI_Done event will be sent to the calling app
//
// Usage:
// ======
//
// Depends:
// Add this line to your app's depends.js file:
// "$enyo-lib/accounts/"
//
// Kind:
// {kind: "AccountsModify", name: "AccountsModify", capability: "CONTACTS", onAccountsModify_Done: "accountsDone"}
// You can add custom components to the view that will appear between the "Remove Account" and "Back" buttons, like this:
// {kind: "AccountsModify", name: "AccountsModify", capability: "CONTACTS", onAccountsModify_Done: "accountsDone", components: [{kind:"Button", label:"Additional prefs"}]},
//
// Initialise the view:
// this.$.AccountsModify.ModifyAccount(account, template, capability) // template is optional; the template information is included in the account
//
// The callback:
// onAccountsUI_Done: function() {
//		this.$.pane.selectViewByName("prefsAndAccounts");

enyo.kind({
	name: "AccountsModify",
	kind: "Pane",
	published: {
		capability:"",
	},
	events: {
		onAccountsModify_Done: ""
	},
	className:"accounts-modify",
	components: [
		{name: "blank"},		// Empty view so that nothing is shown when switching to the Credentials view from a "bad credentials" dashboard
		{name: "accountModificationFromPIMApp", kind: "VFlexBox", className:"enyo-bg", components: [
			{kind:"Toolbar", className:"enyo-toolbar-light accounts-header", pack:"center", components: [
				{kind: "Image", src: AccountsUtil.libPath + "images/acounts-48x48.png"},
		        {kind: "Control", content: AccountsUtil.PAGE_TITLE_ACCOUNT_SETTINGS}
			]},
			{className:"accounts-header-shadow"},
			{kind: "Scroller", flex: 1, components: [
				{kind: "Control", className:"box-center", components: [
					{kind: "RowGroup", caption: AccountsUtil.GROUP_TITLE_ACCOUNT_NAME, className:"accounts-group", components: [
						{kind: "Input", name: "accountName", spellcheck: false, autocorrect:false}
					]},
					{kind: "Accounts.credentials", name: "credentials", onCredentials_ValidationSuccess: "saveAccountCredentials"},
					{kind: "Accounts.RemoveAccount", name: "removeAccountButton", onAccountsRemove_Done: "modifyDone"},
					{name: "client", flex:1, style: "position:relative"}
				]}
			]},
			// {name: "Spacer", flex:1},
			{className:"accounts-footer-shadow"},
			{kind:"Toolbar", className:"enyo-toolbar-light", components:[
				{kind: "Button", label: AccountsUtil.BUTTON_BACK, className:"accounts-toolbar-btn", onclick: "saveAccountName"}
			]},
			
			{name: "modifyAccount", kind: "PalmService", service: enyo.palmServices.accounts, method: "modifyAccount"}
		]},
		
		{kind: "Accounts.credentialView", name: "changeCredentialsView", onCredentials_ValidationSuccess: "saveAccountCredentials", onCredentials_Cancel: "backHandler"},
		{kind: "Accounts.modifyView", name: "modifyAccountView", onModifyView_ChangeLogin: "editCredentials", onModifyView_Cancel: "modifyDone", onModifyView_Success: "modifyDone"},
		{kind: "Accounts.SIMAccount", name: "SIMAccountView", onSIMAccountDone: "modifyDone"},
		{kind: "Accounts.crossAppUI", name:"customAccountsUI", onResult: "backHandler", tabIndex: -1}
	],
	
	// Account to modify was tapped on
	ModifyAccount: function(account, template, capability) {
		this.account = account;
		this.template = template || account;
		this.capability = capability || this.capability;
		this.capability = (enyo.isArray(this.capability)? this.capability[0]: this.capability);
		
		// Return to "Prefs & Accounts" from cross-app UI
		if (this.capability)
			this.$.customAccountsUI.onResult = "modifyDone";

		// It is not possible to edit the Profile account
		if (this.account.templateId === "com.palm.palmprofile") {
			throw "Not possible to edit com.palm.palmprofile account";
		}
		if (this.account.templateId === "com.palm.sim") {
			this.$.SIMAccountView.showSIMInfo(account);
			this.selectViewByName("SIMAccountView");
		}
		else if (account.credentialError) {
			// There is a credentials error.  Go straight to the Edit Credentials screen
			this.editCredentials(null, {account: this.account});
		}
		else if (!this.capability) {
			// If no capability is provided then Accounts.modifyView provides the necessary functionality
			// Typically only the Accounts app won't provide a capability; all PIM apps must provide a capability
			this.$.modifyAccountView.displayModifyView(account);
			this.selectViewByName("modifyAccountView");
		}
		else {
			if (this.template.validator.customUI) {
				// Pass information to the cross-app UI.  This.components refers to the extra UI passed in by the calling app (e.g. "Number of Contacts")
				this.$.customAccountsUI.launchCrossAppUI(this.template.validator.customUI, {mode:"modify", account: this.account, capability: this.capability});
				this.selectViewByName("customAccountsUI");
			}
			else {
				this.selectViewByName("accountModificationFromPIMApp");
				this.capability = capability || this.capability;
				// Display the account credentials 
				this.$.credentials.displayCredentialsView(account, capability);
				
				// Set the account name
				this.$.accountName.setValue(account.alias || account.loc_name);
				
				// Initialize the "remove account" functionality
				this.$.removeAccountButton.init(account, capability);
			}
		}
	},
	
	// Entry point for "bad credentials" dashboard
	ModifyCredentials: function(account) {
		this.account = account;
		this.account.credentialError = true;
		// Go straight to the Edit Credentials screen
		this.editCredentials(null, {account: this.account});
	},
	
	// Back was tapped.  Save the account name (the only editable field on the screen)
	saveAccountName: function() {
		var name = this.$.accountName.getValue();
		if (name && name !== this.account.alias)
			this.$.modifyAccount.call({"accountId":this.account._id, "object": {"alias": name}})
		this.modifyDone();
	},
	
	// The user changed the credentials on the account 
	saveAccountCredentials: function(inSender, validationResult) {
		//console.log("saveAccountCredentials: " + enyo.json.stringify(validationResult));
		// Save the validation results
		var param = {
			"accountId": this.account._id,
			"object": {
				config: validationResult.config,
				credentials: validationResult.credentials,
			}
		}
		// Save the account name, if it changed
		var name = this.$.accountName.getValue();
		if (name && name !== this.account.alias)
			param.object.alias = name;

		this.$.modifyAccount.call(param);
		this.modifyDone();
	},
	
	editCredentials: function(inSender, details) {
		if (!details || !details.account)
			return;
			
		var account = details.account;
		// Set the account name, so that it'll be correct if the user enters new credentials
		this.$.accountName.setValue(account.alias || account.loc_name);

		// If this template has custom UI then switch to it
		if (account.validator && account.validator.customUI) {
			// This template has custom UI
			this.$.customAccountsUI.launchCrossAppUI(account.validator.customUI, {mode: "modify", account: account, capability: this.capability});
			this.selectViewByName("customAccountsUI");
		}
		else {
			this.$.changeCredentialsView.displayCredentialsView(account, this.capability);
			this.selectViewByName("changeCredentialsView");
		}
	},
	
	backHandler: function() {
		if (this.account.credentialError)
			this.modifyDone();
		else {
			// Go back from the credentials view to the modify account view
			this.$.modifyAccountView.displayModifyView(this.account);
			this.selectViewByName("modifyAccountView");
		}
	},
	
	modifyDone: function() {
		this.selectViewByName("blank");
		this.doAccountsModify_Done();
	}
});
