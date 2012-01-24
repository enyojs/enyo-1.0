enyo.kind({
	name: "enyo.GalService",
	kind: enyo.PalmService,
	requestKind: "GalService.Request",
	components: [
		{name: "accountsService", kind: "AccountsService", subscribe: true, onSuccess: "gotAccounts"},
	],
	call: function(inParams, inProps) {
		if (!this.accounts) {
			return this.$.accountsService.call({filterBy: {capability: 'REMOTECONTACTS'}}, {callArgs: arguments});
		} else {
			return this.inherited(arguments);
		}
	},
	gotAccounts: function(inSender, inResponse, inRequest) {
		this.accounts = inResponse.results;
		this.call.apply(this, enyo.cloneArray(inRequest.callArgs));
	},
	cancel: function() {
		var c;
		for (var i in this.$) {
			c = this.$[i];
			if (c != this.$.accountsService) {
				c.destroy();
			}
		}
	}
});

enyo.kind({
	name: "enyo.GalService.Request",
	kind: "PalmService.Request",
	components: [
		{name: "contactsService", kind: "PalmService", method: "", onSuccess: "gotResults", onFailure: "gotFailure"},
	],
	createBridge: function() {
		this.bridge = {cancel: enyo.nop};
	},
	// skip a failed contact query, others may return results
	gotFailure: function(inSender, inResponse, inRequest) {
		this.warn("GAL search failed, call:", this.id, "accountId", inRequest.params.accountId, "error:", inResponse.errorText);
		this.inflight--;
		this.maybeSendResults({returnValue:true});
	},
	gotNoAccounts: function() {
		this.receive({returnValue: false, errorText: enyo.addressing._$L("No Accounts")});
	},
	call: function() {
		this.$.contactsService.method = "";
		var a = this.owner.accounts;
		if (a && a.length) {
			this.fetchContacts();
		} else {
			this.gotNoAccounts();
		}
	},
	gotAccounts: function(inSender, inResponse) {
		this.accounts = this.owner.accounts = inResponse.results;
		//console.dir(this.accounts);
		this.fetchContacts();
	},
	fetchContacts: function() {
		this.inflight = 0;
		this.results = [];
		var accounts = this.owner.accounts;
		for (var i=0, a; a=accounts[i]; i++) {
			var query = this.fetchAccountLookupService(a).split('/');
			var service = query[0], method = query.slice(1).join('/');
			this.$.contactsService.service = service
			this.$.contactsService.method = method;
			this.inflight++;
			this.$.contactsService.call({
				accountId: a._id,
				query: this.params.filterString || "",
				limit: 100
			});
			this.log("GAL search, call :", this.id, "accountId:", a._id);
		}
	},
	fetchAccountLookupService: function(inAccount) {
		for (var i=0, cp; cp=inAccount.capabilityProviders[i]; i++) {
			if (cp.capability == "REMOTECONTACTS") {
				return cp.query;
			}
		}
	},
	gotResults: function(inSender, inResponse, inRequest) {
		this.inflight--;
		this.log("GAL search successful, call:", this.id, "num results:", inResponse.results.length, "accountId:", inRequest.params.accountId);
		this.results = this.results.concat(this.filterResults(inResponse.results));
		this.maybeSendResults(inResponse);
	},

	// wait until we get all responses, so we can sort them before returning
	// deliver each response right away.... (need to subscribe to get all the responses)
	maybeSendResults: function(inResponse) {
		if (this.inflight == 0) {
			this.results.sort(this.sortComparator);
			inResponse.results = this.results;
			this.receive(inResponse);
		}
	},
	// NOTE: the gal service does not know what type of data we're interested in so we may actually 
	// get nothing of interest
	filterResults: function(inResults) {
		var results = [];
		for (var i=0, r; r=inResults[i]; i++) {
			if (this.personHasAddressType(r)) {
				results.push(r);
			}
		}
		return results;
	},
	personHasAddressType: function(inPerson) {
		var types = this.params.addressTypes || [];
		for (var i=0, a; a=types[i]; i++) {
			if (inPerson[a] && inPerson[a].length) {
				return inPerson;
			}
		}
	},
	sortComparator: function(inA, inB) {
		return inA && inB && inA.displayName.localeCompare(inB.displayName);
	}
});
