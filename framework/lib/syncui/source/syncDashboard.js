enyo.kind({
	name: "SyncUI.syncDashboard",
	kind: "Component",
	components: [
		{name: "accounts", kind: "Accounts.getAccounts", onGetAccounts_AccountsAvailable: "onAccountsAvailable"},
		{name: "getSyncStatus", kind: "TempDbService", dbKind: "com.palm.account.syncstate:1", subscribe: true, method: "find", onResponse: "receivedSyncStatus", onWatch: "syncWatchFired"},
		{name: "deleteSyncStatus", kind: "TempDbService", dbKind: "com.palm.account.syncstate:1", method: "del"},
		{name: "openAccountsApp", kind: "PalmService", service: "palm://com.palm.applicationManager/", method: "open"}
	],
	dashboardLifespan: {
		"INITIAL_SYNC" : 1200000,	// Initial sync dashboards stay up for at most 20 minutes (20 * 60 * 1000)
		"DELETE" :  300000,			// Delete account dashboards stay up for at most 5 minutes (5 * 60 * 1000)
	},

	// Generate the list of accounts
	startSyncDashboard: function () {
		this.watchDelay = 100;
		// Get the accounts.  Include those that are being deleted so the "Remove account" can be displayed
		this.$.accounts.getAccounts({showDeleted: true});
	},
	
	// The list of accounts has been obtained
	onAccountsAvailable: function(inSender, inResponse) {
		this.accounts = inResponse.accounts;
		console.log("There are " + this.accounts.length + " accounts");
		
		// Update the account information in the sync status array
		for (accountId in this.accountStatus) {
			var account = SyncUIUtil.getAccount(this.accounts, accountId);
			if (account)
				this.accountStatus[accountId].account = account;
		}

		// Get the sync status of the accounts
		if (!this.accountStatus) {
			this.accountStatus = {};
			this.$.getSyncStatus.call();
		}
	},

	syncWatchFired: function(inSender, inResponse, inRequest) {
		// Get the account status (after waiting a little bit to prevent multiple updates from multiple transports)
		if (!this.getStatusTimer) {
			console.log("SyncUI.syncDashboard: watch fired, waiting " + this.watchDelay + " msec");
			this.getStatusTimer = setTimeout(enyo.bind(this, "getAccountStatus", inRequest), this.watchDelay);
		}
	},
	
	getAccountStatus: function(inRequest) {
		// Get the sync status of the accounts
		if (inRequest)
			enyo.call(inRequest, "reCall");
	},
	
	// Get the credentials for the current account
	receivedSyncStatus: function(inSender, inResponse, inRequest) {
		if (!inResponse || !inResponse.returnValue)
			return;
		var deletedSources = [];

		// Clear the timeout to allow sync watches to fire
		if (this.getStatusTimer) {
			clearTimeout(this.getStatusTimer);
			delete this.getStatusTimer;
		}
		
		// Create an array of accounts with account ID, dashboard (if present) and status
		console.log("Processing " + inResponse.results.length + " sync state entries ...");
		for (var i=0, l=inResponse.results.length; i < l; i++) {
			var syncSource = inResponse.results[i];
			var account = SyncUIUtil.getAccount(this.accounts, syncSource.accountId);
			
			// Catch permission problems (temporary - see DFISH-5215)
			if (syncSource.accountId === "DEBUG") {
				this.showPermissionsErrorDashboard(syncSource);
				continue;
			}
			
			// Has the account for this sync information been deleted?
			if (!account) {
				console.log("Sync status "+ syncSource._id + " not needed because account " + syncSource.accountId + " no longer exists");
				deletedSources.push(syncSource._id);
				
				// Delete the dashboard for this account, if it exists
				if (this.accountStatus[syncSource.accountId]) {
					if (this.accountStatus[syncSource.accountId].dashboard)
						this.accountStatus[syncSource.accountId].dashboard.pop();
					delete this.accountStatus[syncSource.accountId];
				}
				continue;
			}
			
			// Ignore all entries with a collecionID, indicating a folder sync.  There should be other entries for account sync.
			if (syncSource.collectionId)
				continue;
			
			// Create a new entry for this account if needed
			if (!this.accountStatus[syncSource.accountId])
				this.accountStatus[syncSource.accountId] = {"accountId": syncSource.accountId, account: account};
				
			// Save the "highest" status for this account (there may be multiple transports/status for a single account)
			SyncUIUtil.saveHighestStatus(this.accountStatus[syncSource.accountId], syncSource);
		}

		// Delete the status of accounts that no longer exist
		if (deletedSources.length)
			this.$.deleteSyncStatus.call({"ids": deletedSources});

		// Iterate through the array of accounts and update dashboards
		for (var accountId in this.accountStatus) {
			var icon, title, text, dashAccountId;
			var syncAccount = this.accountStatus[accountId];
			// console.log("receivedSyncStatus: Account " + accountId + " status=" + syncAccount.status);

			// Is the account now idle?
			if (syncAccount.status === "IDLE") {
				// Did this account have a dashboard that should be removed?
				if (syncAccount.dashboard) {
					console.log("Removing dashboard " + syncAccount.dashboardStatus + " for account " + accountId)
					// If a sync or delete has finished then display a "sync/delete done" banner
					if (syncAccount.bannerEndText) {
						enyo.windows.addBannerMessage(syncAccount.bannerEndText, "{}", syncAccount.dashboard.smallIcon);
						delete syncAccount.bannerEndText;
					}
					syncAccount.dashboard.destroy();
					delete syncAccount.dashboard;
					delete syncAccount.endTime;
					syncAccount.dashboardStatus = "IDLE";

					// Be quick to put up the next dashboard
					this.watchDelay = 100;
				}
				continue;
			}
			
			// Has the status changed?  Does the dashboard need updating?
			if (syncAccount.status === syncAccount.dashboardStatus) {
				syncAccount.status = "IDLE";
				continue;
			}
			
			// Save the status that corresponds to the dashboard
			syncAccount.dashboardStatus = syncAccount.status;
			console.log("Creating dashboard " + syncAccount.dashboardStatus + " for account " + accountId + " (" + syncAccount.stateBlame + ")");
			
			switch(syncAccount.status) {
				case "INITIAL_SYNC":
					icon = SyncUIUtil.libPath + "images/notification-small-sync.png";
					text = SyncUIUtil.SYNCING_ACCOUNT;
					syncAccount.bannerEndText = SyncUIUtil.SYNC_FINISHED;
					break;
				case "DELETE":
					icon = SyncUIUtil.libPath + "images/notification-small-sync.png";
					if (syncAccount.account.beingDeleted) {
						text = SyncUIUtil.REMOVING_ACCOUNT;
						syncAccount.bannerEndText = SyncUIUtil.REMOVE_FINISHED;
					}
					else {
						text = SyncUIUtil.REMOVING_ACCOUNT_DATA;
						syncAccount.bannerEndText = SyncUIUtil.REMOVE_DATA_FINISHED;
					}
					break;
				case "401_UNAUTHORIZED":
					icon = syncAccount.account.icon.loc_32x32;
					text = SyncUIUtil.BAD_CREDS_TEXT;
					dashAccountId = accountId;
					break;
			}
			
			// Create a dashboard if one doesn't exist
			if (!syncAccount.dashboard) {
				syncAccount.dashboard = this.createComponent({
					kind: "Dashboard",
					name: "SyncUI-" + accountId,
					onMessageTap: "dashboardTap",
					onIconTap: "dashboardTap",
					smallIcon: icon,
					accountId: dashAccountId
				});
			}

			// Display a banner
			if (syncAccount.status === "INITIAL_SYNC" || syncAccount.status === "DELETE") {
				enyo.windows.addBannerMessage(text, "{}", icon);
				// Be slow to take the dashboard down
				this.watchDelay = 3000;

				// Make a note of when this dashboard should be torn down (if it is still up)
				var dashboardDuration = this.dashboardLifespan[syncAccount.status];
				syncAccount.endTime = new Date().getTime() + dashboardDuration;
				
				// Start a timer at which time the dashboard will be removed if it is still up
				if (!this.dashboardTimer)
					this.dashboardTimer = setTimeout(enyo.bind(this, "RemoveExpiredDashboards"), dashboardDuration);
			}

			// Display the dashboard message			
			syncAccount.dashboard.setLayers([{
				icon: syncAccount.account.icon.loc_48x48,
				title: syncAccount.account.alias  || syncAccount.account.username,
				text: text,
			}]);
			
			// Reset the status for the next update
			syncAccount.status = "IDLE";
		}
	},
	
	// For debugging, provide an easy way for transports and services to display dashboards
	showPermissionsErrorDashboard: function(syncSource) {
		console.log("Showing debug dashboard for " + syncSource.capabilityProvider);
		if (!syncSource.capabilityProvider)
			return;
		this.permissionDashboard = this.permissionDashboard || {};
		if (!this.permissionDashboard[syncSource.capabilityProvider]) {
			this.permissionDashboard[syncSource.capabilityProvider] = this.createComponent({
				kind: "Dashboard",
				name: "SyncUI-" + syncSource.capabilityProvider,
				smallIcon: "/usr/lib/luna/system/luna-systemui/images/notification-small-info.png",
			});
		}
		// Display the dashboard message			
		this.permissionDashboard[syncSource.capabilityProvider].setLayers([{
			icon: "/usr/lib/luna/system/luna-systemui/images/notification-large-info.png",
			title: syncSource.title || syncSource.capabilityProvider,
			text: syncSource.text,
		}]);
	},
	
	dashboardTap: function(inSender) {
		console.log("dashboardTap: " + enyo.json.stringify(inSender.accountId));
		// Open the accounts app to change the credentials
		if (inSender.accountId) {
			this.$.openAccountsApp.call({
				"id": "com.palm.app.accounts",
				params: {
					launchType: "changelogin",
					accountId: inSender.accountId
				}
			});
		}
	},
	
	RemoveExpiredDashboards: function() {
		// Iterate through the array of accounts and see if any dashboards need to come down
		var restartTimer = false;
		for (var accountId in this.accountStatus) {
			var syncAccount = this.accountStatus[accountId];
			
			// Does this account have a dashboard that should be taken down if it stays up too long?
			if (!syncAccount.dashboard || !syncAccount.endTime)
				continue;
				
			// Has the period elapsed?
			var now = new Date().getTime();
			if (now < syncAccount.endTime) {
				// Dashboard should remain up for now
				restartTimer = true;
				continue;
			}
			
			// This dashboard has been up too long.  Remove it
			console.log("Forcibly Removing dashboard " + syncAccount.dashboardStatus + " for account " + accountId + " because it was up too long");
			this.$.deleteSyncStatus.call({"query":{"from": "com.palm.account.syncstate:1","where":[{"prop":"accountId","op":"=","val":accountId}]}});
		}
		// Restart the expired dashboard timer, if necessary
		delete this.dashboardTimer;
		if (restartTimer)
			this.dashboardTimer = setTimeout(enyo.bind(this, "RemoveExpiredDashboards"), 60000);
	}
});
