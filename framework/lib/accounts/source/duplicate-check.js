// This provides "duplicate account" logic.  It should be called after authentication succeeds and before returning 
// validation results to the user. 
//
// Usage:
// ======
//
// Depends:
// Add this line to your app's depends.js file:
// "$enyo-lib/accounts/"
//
// Kind:
// {kind: "Accounts.DuplicateCheck", name: "duplicateCheck", onAccountsDuplicate_Success: "mySuccess", onAccountsDuplicate_Duplicate: "myDuplicate"}
//
// Start the duplicate check:
// this.$.duplicateCheck.start(validationResults, capability) 
//
// Returns:
// mySuccess: function(inSender, inResponse) {
//		// Account is not a duplicate.  Return the validation results
//		validationResults = inResponse;
// }
// 
// myDuplicate: function(inSender, inResponse) {
//		// The account already exists
//		if (inResponse.isDuplicateAccount)
//			Display "Duplicate Account" to user
//		else {
//			// The account was a duplicate, but the capability was turned off
//			// The capability has been turned on, and the account credentials
//			// have been updated.  Return "Done/Cancel" as the validation result
//			// to send the user straight back to the Accounts list.
//		}
// }
//		

enyo.kind({
	name: "Accounts.DuplicateCheck",
	kind: "Component",
	events: {
		onAccountsDuplicate_Success: "",
		onAccountsDuplicate_Duplicate: "",
	},
	components: [
		{name: "accounts", kind: "Accounts.getAccounts", onGetAccounts_AccountsAvailable: "onAccountsAvailable", subscribe: false},
		{name: "modifyAccount", kind: "PalmService", service: enyo.palmServices.accounts, method: "modifyAccount"},
	],
	
	start: function(validationResults, capability) {
		if (!validationResults || !validationResults.templateId) {
			console.log("Error: need validationResults.templateId");
			return;
		}
		this.validationResults = validationResults;
		this.capability = capability;
		// Make sure this account isn't a duplicate before it can be saved
		this.$.accounts.getAccounts({templateId: validationResults.templateId});
	},

	// The account list has been returned.  See if the account being added currently exists
	onAccountsAvailable: function(inSender, inResponse) {
		if (!inResponse || !inResponse.accounts || !inResponse.accounts.length) {
			// Account is not a duplicate
			console.log("No accounts of type " + this.validationResults.templateId);
			this.doAccountsDuplicate_Success(this.validationResults);
			return;
		}
		
		var accounts = inResponse.accounts;
		for (var i=0, l=accounts.length; i < l; i++) {
			var account = accounts[i];
			// Is this account a duplicate?
			if (account.username !== this.validationResults.username || account.beingDeleted)
				continue;

			// The account is a duplicate
			// If no capability was provided then the account was created from the Accounts app
			// In this case display a "duplicate account" error message
			if (!this.capability) {
				console.log("Duplicate account because account already exists!");
				this.doAccountsDuplicate_Duplicate({isDuplicateAccount: true});
				return;
			}
			
			// The account is being created from a PIM app.  If the capability is enabled already
			// then this is an attempt to create a duplicate account
			for (var cp in account.capabilityProviders) {
				var c = account.capabilityProviders[cp];
				// Find the capability
				if (c.capability !== this.capability)
					continue;
				// Now see if the capability is already enabled
				if (c._id) {
					// The capability is already enabled. User is trying to create a duplicate account
					console.log("Duplicate account because capability is already enabled!");
					this.doAccountsDuplicate_Duplicate({isDuplicateAccount: true});
					return;
				}
				
				// The capability is currently disabled, but the user would like it enabled - so enable it!
				// Create an array of currently enabled capabilities, starting with this capability
				var enabledCapabilities = [{"id":c.id}];
				console.log("Enabling capability " + c.id + " for account " +  account._id);
				for (var cap=0, l=account.capabilityProviders.length; cap < l; cap++) {
					var c = account.capabilityProviders[cap];
					if (c._id)
						enabledCapabilities.push({"id":c.id});
				}

				// Modify the account (don't wait for a response)
				var params = {
					"accountId":account._id,
					"object": {
						config: this.validationResults.config,
						credentials: this.validationResults.credentials,
						capabilityProviders: enabledCapabilities
					}
				};
				this.$.modifyAccount.call(params);
				
				// Let the caller know the capability was enabled
				this.doAccountsDuplicate_Duplicate({accountWasModified: true});
				return;
			}
		}
		
		// Account is not a duplicate
		console.log("Account " + this.validationResults.templateId + " is not a duplicate");
		this.doAccountsDuplicate_Success(this.validationResults);
	}
});
