// Allow the editing of account credentials when creating or editing an account
//
// Usage:
// ======
//
//
// TODO:
// 1. Handle broken capabilities
// 2. Handle case where this is no template (restore to different device)



enyo.kind({
	name: "Accounts.modifyView",
	kind: "Pane",
	events: {
		onModifyView_Success: "",
		onModifyView_Cancel: "",
		onModifyView_ChangeLogin: ""
	},
	components: [
		{},		// Empty view so that nothing is shown when switching to the Credentials view from a "bad credentials" dashboard
		{kind: "VFlexBox", name:"standardModifyView", flex:1, className:"enyo-bg", components: [
			{kind:"Toolbar", className:"enyo-toolbar-light accounts-header", pack:"center", components: [
				{kind: "Image", name:"titleIcon"},
		        {kind: "Control", content: AccountsUtil.PAGE_TITLE_ACCOUNT_SETTINGS}
			]},
			{className:"accounts-header-shadow"},
			{kind: "Scroller", flex: 1, components: [
				{kind: "Control", className:"box-center", components: [
					{kind: "RowGroup", className:"accounts-group", caption: AccountsUtil.GROUP_TITLE_ACCOUNT_NAME, components: [
						{kind: "Input", name: "accountName", spellcheck: false, autocorrect:false}
					]},
					{name: "useAccountWith", kind: "RowGroup", className:"accounts-group", caption: AccountsUtil.GROUP_TITLE_USE_ACCOUNT_WITH, components: [
						{name: "capabilitiesList", kind: "VirtualRepeater", onSetupRow: "listGetItem", onclick: "accountSelected", className:"accounts-rowgroup-item", components: [
							{kind: "Item", name: "capabilityRow", layoutKind: "HFlexLayout", flex: 1, className:"accounts-list-item", components: [
								{name: "capability", flex: 1},
								{name: "capabilityEnabled",	kind: "ToggleButton", onChange: "capabilityToggled"}
							]}
						]},
					]},
					{name:"changeLoginButton", kind: "Button", caption: AccountsUtil.BUTTON_CHANGE_LOGIN, onclick: "changeLoginTapped", className:"accounts-btn"},
					{name:"removeAccountButton", kind: "Accounts.RemoveAccount", className:"accounts-btn", onAccountsRemove_Done: "doModifyView_Success"},
					{name:"createAccountButton", kind: "ActivityButton", caption: AccountsUtil.BUTTON_CREATE_ACCOUNT, onclick: "createAccountTapped", className:"enyo-button-dark accounts-btn"},
				]},
			]},
			{className:"accounts-footer-shadow"},
			{kind:"Toolbar", className:"enyo-toolbar-light", components:[
				{name:"cancelButton", kind: "Button", className:"accounts-toolbar-btn", onclick: "backHandler"}
			]}
		]},
		{name: "createAccount", kind: "PalmService", service: enyo.palmServices.accounts, method: "createAccount", onResponse: "createResponse"},
		{name: "modifyAccount", kind: "PalmService", service: enyo.palmServices.accounts, method: "modifyAccount"}
	],
	
	// Pass in a validationResult if creating the account, or the account and template if modifying it
	displayCreateView: function(validationResult, template, capability) {
		this.validationResult = validationResult;
		this.template = template || {};
		this.capability = capability || "";
		
		// Hide buttons not needed when creating a new account
		this.$.changeLoginButton.hide();
		this.$.removeAccountButton.hide();
		// Get the "Create Account" button back to normal
		this.$.createAccountButton.setActive(false);
		this.$.createAccountButton.setCaption(AccountsUtil.BUTTON_CREATE_ACCOUNT);
		this.$.createAccountButton.setDisabled(false);

		this.$.accountName.setDisabled(false);
		this.$.changeLoginButton.setDisabled(false);
		this.$.cancelButton.setCaption(AccountsUtil.BUTTON_CANCEL);
		
		// Set the account name
		this.$.accountName.setValue(validationResult.alias || this.template.loc_name);
		
		// Update the icon on the page title
		if (this.template && this.template.icon && this.template.icon.loc_48x48)
			this.$.titleIcon.setSrc(this.template.icon.loc_48x48);
		else
			this.$.titleIcon.setSrc(AccountsUtil.libPath + "images/acounts-48x48.png");

		// Set the focus on the account name
//		enyo.asyncMethod(this.$.accountName, "forceFocus");
		
		this.displayCapabilities(true);
		this.selectViewByName("standardModifyView");
	},
	
	// Pass in a validationResult if creating the account, or the account and template if modifying it
	displayModifyView: function(account, capability) {
		this.displayModifyData(account, capability);
		this.selectViewByName("standardModifyView");
	},
	
	// Display the view for Bad credentials
	displayBadCredentialsView: function(account) {
		// Set up the data on this view, so that control can return to it
		this.displayModifyData(account);
		
		// Go to the credentials view
		enyo.asyncMethod(this, "changeLoginTapped");
	},
	
	// Pass in a validationResult if creating the account, or the account and template if modifying it
	displayModifyData: function(account, capability) {
		this.account = account || {};
		this.template = account || {};	// The template has been merged into the account
		this.capability = capability || "";
		
		// Hide buttons not needed when modifying an account
		this.$.createAccountButton.hide();
		// Initialize the "remove account" functionality
		this.$.removeAccountButton.init(account, capability);

		this.$.cancelButton.setCaption(AccountsUtil.BUTTON_BACK);
			
		// Set the account name
		this.$.accountName.setValue(this.account.alias || this.account.loc_name);
		
		// Enable all the buttons
		this.$.accountName.setDisabled(false);
		this.$.changeLoginButton.setDisabled(false);
		
		// Update the icon on the page title
		if (this.template && this.template.icon && this.template.icon.loc_48x48)
			this.$.titleIcon.setSrc(this.template.icon.loc_48x48);
		else
			this.$.titleIcon.setSrc(AccountsUtil.libPath + "images/acounts-48x48.png");

		this.displayCapabilities(false);
	},
	
	// Display the list of capabilites that the template supports
	displayCapabilities: function(newAccount) {
		// Determine which capabilities are active, and which should be disabled
		if (this.template.capabilityProviders) {
			for (var i=0, l=this.template.capabilityProviders.length; i<l; i++) {
				var c = this.template.capabilityProviders[i];
				// Get the localized name of the capability
				c.displayText = AccountsUtil.getCapabilityText(c.capability);
				
				// For new accounts, all capabilities should be enabled
				if (newAccount)
					c.enabled = true;
				else {
					c.enabled = !!c._id;
				}
				// Can the capability be toggled?
				c.changeAllowed = false;
				if (!c.alwaysOn && c.capability != this.capability)
					c.changeAllowed = true;
					
				// Does this capability have a config?
				if (c.config)
					this.config = c.config;
			}
			// Prevent a singleton capability on accounts with only one possible capability from being turned off
			if (this.template.capabilityProviders.length === 1 && this.template.capabilityProviders[0].enabled)
				this.template.capabilityProviders[0].changeAllowed = false;
		}
		
		// Render the list of capabilities
		this.$.capabilitiesList.render();
		this.capabilitiesDirty = false;
	},

	listGetItem: function(inSender, inIndex) {
		if (!this.template || !this.template.capabilityProviders || inIndex >= this.template.capabilityProviders.length)
			return false;
		var c = this.template.capabilityProviders[inIndex];
		// Temporary fix: Don't show Tasks until there is a tasks app (making use of the fact that Tasks will be last in the list)
		if (c.capability === "TASKS")
			return false;
		this.$.capability.setContent(c.displayText);
		this.$.capabilityEnabled.state = c.enabled;
		this.$.capabilityEnabled.disabled = !c.changeAllowed;
		this.$.capabilityEnabled.ready();
		//console.log("listGetItem: cap=" + c.capability + " disp=" + c.displayText + " changeAllowed = " + c.changeAllowed)
		return true;
	},
	
	capabilityToggled: function(inSender) {
		// Make a note of the new value
		var c = this.template.capabilityProviders[this.$.capabilitiesList.fetchRowIndex()];
		c.enabled = c._id = inSender.getState();
		this.capabilitiesDirty = true;
	},
	
	// The "Change Login" button was tapped
	changeLoginTapped: function() {
		// Save the account details if they changed
		this.saveAccountDetails();
		
		this.doModifyView_ChangeLogin({
			account: this.account
		});
	},
	
	// The "Create Account" button was tapped
	createAccountTapped: function() {
		// Disable the "Create Account" button
		this.$.createAccountButton.setDisabled(true);
		// Change the text to "Creating Account..."
		this.$.createAccountButton.setCaption(AccountsUtil.BUTTON_CREATING_ACCOUNT);
		// Start the spinner on the button
		this.$.createAccountButton.setActive(true);
		// Disable the account name field
		this.$.accountName.setDisabled(true);
		
		// See which capabilities are enabled
		var enabledCapabilities = [];
		for (var i = 0, l = this.template.capabilityProviders.length; i < l; i++) {
			if (this.template.capabilityProviders[i].enabled)
				enabledCapabilities.push({"id":this.template.capabilityProviders[i].id});
		}
		console.log("enabledCapabilities:" + enyo.json.stringify(enabledCapabilities));
		
		// Create the account
		this.$.createAccount.call({
			templateId: this.validationResult.templateId,
			username: this.validationResult.username,
			alias:  this.$.accountName.getValue(),
			credentials: this.validationResult.credentials,
			config: this.validationResult.config || this.config,
			capabilityProviders: enabledCapabilities
		});
	},
	
	createResponse: function(inSender, inResponse) {
		// Stop the spinner on the "Create Account" button
		this.$.createAccountButton.setActive(false);
		// Hopefully the response was successful and the account was created.  Even if it wasn't, nothing more can be done here
		this.doModifyView_Success();
	},
	
	// Save the account details if they changed
	saveAccountDetails: function() {
		var name = this.$.accountName.getValue();
		var nameDirty = name && this.account && name !== this.account.alias;

		// If the capabilities or account name was changed then save them
		if (this.account && (this.capabilitiesDirty || nameDirty)) {
			var param = {
				"accountId": this.account._id,
				"object": {}
			}
			if (this.capabilitiesDirty) {
				// See which capabilities are enabled
				var enabledCapabilities = [];
				for (var i = 0, l = this.template.capabilityProviders.length; i < l; i++) {
					if (this.template.capabilityProviders[i].enabled) 
						enabledCapabilities.push({"id":this.template.capabilityProviders[i].id});
				}
				console.log("enabledCapabilities:" + enyo.json.stringify(enabledCapabilities));
				param.object.capabilityProviders = enabledCapabilities;
			}
			
			if (nameDirty) {
				param.object.alias = this.account.alias = name;
			}

			// Modify the account
			this.$.modifyAccount.call(param);
		}
	},

	// Back was tapped
	backHandler: function() {
		// Save the account details if they changed
		this.saveAccountDetails();

		this.doModifyView_Cancel();
	}
});
