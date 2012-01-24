/*jslint white: true, onevar: true, undef: true, eqeqeq: true, plusplus: true, bitwise: true, 
regexp: true, newcap: true, immed: true, nomen: false, maxerr: 500 */
/*global ContactsLib, document, enyo, console, runningInBrowser, PersonList, MockPersonMap, crb, $contactsui_path */

enyo.kind({
	name: "PersonList",
	kind: "VFlexBox",
	persons: null,
	selectedPersonInfo: undefined,
	published: {
		mode: 2, // PersonList.NOFILTER_SEARCH,
		showFavStars: true,
		whereClause: undefined,
		showIMStatuses: true,
		exclusions: [],
		peopleWithAddressOnly: false,
		enableGAL: false
	},
	events: {
		onContactClick: "",
		onListUpdated: ""
	},
	statics: {
		SORTKEY_DEFAULT_CHAR: "\uFAD7",
		DEFAULT_DIVIDER_TEXT: "#",
		SORT_LAST_FIRST: "LAST_FIRST",
		SORT_FIRST_LAST: "FIRST_LAST",
		
		NOFILTER: 1,
		NOFILTER_SEARCH: 2,
		FAVORITES_ONLY: 3,
		FAVORITES_ONLY_SEARCH: 4,
		NO_FAVORITES_ONLY: 5,
		NO_FAVORITES_ONLY_SEARCH: 6,

		MESSAGING_TRANSPORT_ONLINE_STATE: "online",
		MESSAGING_IMBUDDYSTATUS_AVAILABLE: 0,
		MESSAGING_IMBUDDYSTATUS_AWAY: 2,
		MESSAGING_IMBUDDYSTATUS_INVISIBLE: 3,
		MESSAGING_IMBUDDYSTATUS_OFFLINE: 4
	},
	components: [
		{kind: "DbService", components: [
			{name: "getPersons", method: "find", dbKind: "com.palm.person:1", onSuccess: "decideToGetIMStatuses", subscribe: true, onWatch: "gotPersonsWatch", sortBy: "sortKey"}, 
			{name: "searchPersons", method: "search", dbKind: "com.palm.person:1", onSuccess: "decideToGetIMStatuses", sortBy: "sortKey", subscribe: true, onWatch: "gotPersonsWatch"},
			{name: "searchPersonsCnt", method: "search", dbKind: "com.palm.person:1", onSuccess: "gotPersonsCount", onFailure: "gotPersonsCountFailed", subscribe: false, sortBy: "sortKey"},
			{name: "watchIMAccountsState", method: "find", dbKind: "com.palm.imloginstate:1", onSuccess: "gotIMLoginState", onWatch: "gotIMLoginState", subscribe: true, reCallWatches: true}
		]},
		{kind: "TempDbService", components: [
			{name: "getIMStatuses", method: "find", dbKind: "com.palm.imbuddystatus:1", onSuccess: "gotIMStatuses", subscribe: false},
			{name: "watchAvailabilityStatuses", method: "find", dbKind: "com.palm.imbuddystatus:1", onSuccess: enyo.nop, onWatch: "imStatusWatchFired", subscribe: true, reCallWatches: true }
		]},
		{name: "galService", kind: "GalService", onSuccess: "gotGalResults", onFailure: "gotGalFailure"},
		{name: "personList", kind: "DbList", onQuery: "listQuery", flex: 1, onSetupRow: "getListItem", components: [
			{name: "divider", className: "enyo-divider-alpha", showing: false, components: [
				{name: "dividerLabel", className: "enyo-divider-alpha-caption divider-Label"}
			]},
			{name: "personItem", kind: "Item", tapHighlight: true, layoutKind: "HLayout", onclick: "itemClick", components: [
				{className: "icon", components: [
					{name: "photo", kind: "Control", className: "img"},
					{kind: "Control", className: "mask"}
				]},
				{name: "availabilityIcon", className: "status", kind: "Image", src: $contactsui_path + "/images/status-blank.png"},
				{name: "contactName", className: "name", wantsEvents: false},
				{name: "favIcon", className: "favorite"}
			]},
			{name: "NoSrchResultsMsgContainer", className: "enyo-item", canGenerate: false, flex: 1, components: [
				{name: "NoSrchResultsMsg", flex: 1, className: "no-srch-results-msg", content: crb.$L("No search results found")}
			]},
			// GAL related items
			{name: "GalDivider", kind: enyo.Divider, caption: crb.$L("GLOBAL ADDRESS LOOKUP"), canGenerate: false},
			{name: "GalMessage", kind: "Item", layoutKind: "HFlexLayout", pack: "justify", align: "center", onclick: "GalMessageOnClick", className: "first last", canGenerate: false, components: [
				{content: crb.$L("Search Exchange"), className: "name", style: "padding:20px 0;font-size:20px"},
				{name: "GalImage", kind: "Image", src: "$palm-themes-Onyx/images/search-input-search.png"},
				{name: "GalSpinner", kind: "Spinner"}
			]},
			{name: "GalResultsMessage", className: "enyo-item first last", showing: false, canGenerate: false, flex: 1, components: [
				{name: "GalResultsMsg", flex: 1, className: "no-srch-results-msg gal-message"}
			]},
			{name: "GalDrawer", kind: enyo.Drawer, open: false, canGenerate: false, onOpenAnimationComplete: "onOpenAnimationComplete", components: [
				{name: "GalList", kind: "VirtualRepeater", onSetupRow: "onGalGetItem", components: [
					{name: "galItem", kind: "Item", layoutKind: "HLayout", onclick: "onGalPersonClick", components: [
						{className: "icon", components: [
							{kind: "Control", className: "img"},
							{kind: "Control", className: "mask"}
						]},
						{name: "galPerson", className: "name long"}
					]}
				]}
			]}
		]}
	],
	create: function () {
		this.inherited(arguments);
	
		if (!runningInBrowser) {
			this.AppPrefs = new ContactsLib.AppPrefs(function () {
				this.isAppPrefsReady = true;
				this.refresh();
			}.bind(this)); //fourth argument disables appPrefs object writeback to db upon instantiation. this eliminates any race conditions with competing PersonLists.
		} else {
			this.createComponent({kind: "DbService", dbKind: "enyo.mockGal:1", onFailure: "gotGalFailure", components: [{name: "mockGalService", method: "find", onResponse: "gotGalResults"}]});
			this.refresh();
		}
	
		this.favoriteProperty = {prop: "favorite", op: "=", val: undefined};
		this.searchProperty = {prop: "searchProperty", op: "?", val: undefined, collate: "primary"};
		this.applySearchString = true;
		this.galData = [];
		this.gotGalData = false;
		this.maxIndex = -1;
		this.refreshRetryCount = 0;
		this.$.watchIMAccountsState.call();
		this.$.watchAvailabilityStatuses.call();
	},
	ready: function () {
		var mustRefresh = false;
		if (this.exclusions.length > 0) {
			mustRefresh = true;
		}

		this.readyFlag = true;
		this.idAvailabilityHash = {};

		if (mustRefresh) {
			this.refresh();
			return true;
		}
	},
	rendered: function () {
		this.inherited(arguments);
	},
	refresh: function () {
		if (this.isAppPrefsReady === true || runningInBrowser) {
			if (this.isGalActive === true && this.maxIndex < 0 && this.refreshRetryCount < 3) {
				// Wait before updating the list...
				this.refreshRetryCount += 1;
				enyo.job("job.contacts.PersonList.Refresh", enyo.bind(this, "_refresh"), 300);
			} else {
				this.refreshRetryCount = 0;
				this.$.personList.refresh();
			}
		}
	},
	_refresh: function () {
		enyo.job.stop("job.contacts.PersonList.Refresh");
		this.$.personList.refresh();
	},
	reset: function () {
		this.$.personList.reset();
	},
	punt: function () {
		this.$.personList.punt();
	},
	enableGALChanged: function () {
		if (runningInBrowser) {
			this.isGalActive = true;
		} else {
			this.isGalActive = (this.enableGAL && this.applySearchString);
		}
	},
	setExclusions: function (exclusionsArray) {
		if (!exclusionsArray || !Array.isArray(exclusionsArray)) 
		{
			enyo.error("setExclusions requires an array");
			return;
		}
		this.exclusions = exclusionsArray;
		if (this.readyFlag) {
			this.refresh();
		}
	},
	setSearchString: function (searchString, dontResetGalStates) {
		var srchQuery;
		
		if (dontResetGalStates === undefined) {
			this.resetGalStates();
		}

		if (this.applySearchString === true && searchString) {
			this.searchProperty.val = searchString;
			if (this.isGalActive === true) {
				srchQuery = {orderBy: "sortKey", where: [this.searchProperty]};
				srchQuery.where.push(this.favoriteProperty.val === undefined		? 
									{prop: "favorite", op: "=", val: [true, false]}	:
									this.favoriteProperty);

				this.$.searchPersonsCnt.call({query : srchQuery, count: true});
			}
		} else {
			this.searchProperty.val = undefined;
		}
	},
	changeMode: function (mode) {
		this.mode = mode;
		switch (this.mode) {
		case PersonList.NOFILTER:
		case PersonList.FAVORITES_ONLY:
		case PersonList.NO_FAVORITES_ONLY:
			this.applySearchString = false;
			break;
		default:
			this.applySearchString = true;
			break;
		}

		switch (this.mode) {
		case PersonList.NOFILTER:
		case PersonList.NOFILTER_SEARCH:
			this.showFavOnly = false;
			this.favoriteProperty.val = undefined;
			break;
		case PersonList.FAVORITES_ONLY:
		case PersonList.FAVORITES_ONLY_SEARCH:
			this.showFavOnly = true;
			this.favoriteProperty.val = true;
			break;
		case PersonList.NO_FAVORITES_ONLY:
		case PersonList.NO_FAVORITES_ONLY_SEARCH:
			this.showFavOnly = false;
			this.favoriteProperty.val = false;
			break;
		}
		
		this.enableGALChanged();

		this.ready();
		this.punt();
	},
	listQuery: function (inSender, inQuery) {
		//this.showFavOnly = false; this.hideFavOnly = false;
		//this.showFavOnly = true; this.hideFavOnly = false;
		//this.showFavOnly = false; this.hideFavOnly = true;
		//enyo.log("*** QUERYING DATABASE WITH: " + enyo.json.to(inQuery));
		var query = {query: inQuery};
		query.query.orderBy = "sortKey";
		//enyo.log("|||QUERY||| " + enyo.json.to(query));

		if (this.applySearchString === true && this.searchProperty.val !== undefined) {
			if (this.favoriteProperty.val === undefined) {
				query.query.where = [this.searchProperty, {prop: "favorite", op: "=", val: [true, false]}];
			} else {
				query.query.where = [this.searchProperty, this.favoriteProperty];
			}
			return this.$.searchPersons.call(query);
		} else {
			if (this.favoriteProperty.val !== undefined) {
				query.query.where = [this.favoriteProperty];
			} else {
				query.query.where = undefined;
			}
			return this.$.getPersons.call(query);
		}
	},
	imStatusWatchFired: function (inSender, inResult)
	{
		if ("fired" in inResult && inResult.fired === true) {
			enyo.log("Contacts PersonList : IM buddy availability watch fired");
			this.idAvailabilityHash = {};
			if (this.enabledIMAccountsMap && this.enabledIMAccountsMap.count > 0) {

				if (this.$ && this.$.personList && this.$.personList.reset) {

//console.log("|||||||||||||||||| IM STATUS WATCH FIRED - COUNT > 0 - RESETTING LIST");
					this.throttledListReset();
//					this.$.personList.reset();
				}
			}
		}  
	},
	gotIMLoginState: function (inSender, inResult) //handler for query response & watch fires
	{
		var index = 0,
			result = null;
		
		if (!("fired" in inResult) || inResult.fired === false) { //query response scenario - not a watch fire in itself, but in response to one
			this.enabledIMAccountsMap = {
				count : 0
			};

			for (index = 0; index < inResult.results.length; index += 1) {
				result = inResult.results[index];
				if ("accountId" in result && 
						"state" in result &&
						result.state === PersonList.MESSAGING_TRANSPORT_ONLINE_STATE &&//TODO : make this a messaging-side constant)
						"availability" in result &&
						result.availability !== PersonList.MESSAGING_IMBUDDYSTATUS_OFFLINE) {
//					this.enabledIMAccountsMap[result.accountId] = 1; //maps the account by accountId as enabled and online
					this.enabledIMAccountsMap.count += 1;
				}
			}
			if (this.enabledIMAccountsMap.count !== PersonList.MESSAGING_IMBUDDYSTATUS_OFFLINE) {
//console.log("|||||||||||||||||| GOT IM LOGIN STATE - COUNT 0 - RESETTING LIST");
				this.throttledListReset();
//				this.$.personList.reset();
			} 
		}
	},
	decideToGetIMStatuses : function (inSender, inResponse, inRequest) {

		if (this.showIMStatuses) {
			this.chainGetImBuddyStatus(inSender, inResponse, inRequest);
		} else {
			this.gotPersons(inSender, inResponse, inRequest);
		}
	},
	chainGetImBuddyStatus : function (inSender, inResponse, inRequest) {
		var index,
			idArray = [], //where person Ids are collected for the im status query
			query = {query: {
				where: [{prop: "personId", op: "=", val: idArray}]
			}};
	
		for (index = 0; index < inResponse.results.length; index += 1) {
			idArray.push(inResponse.results[index]._id);
			if (runningInBrowser) {
				MockPersonMap["" + inResponse.results[index]._id] = inResponse.results[index];
				MockPersonMap["" + inResponse.results[index]._id].contactCount = (index + 1);
			}
		}

		this._processPersonResults(inResponse, inRequest);
		this.$.getIMStatuses.call(query);
	},
	gotIMStatuses: function (inSender, inResponse, inRequest) {
		var index;

		for (index = 0; index < inResponse.results.length; index += 1) {
			this.idAvailabilityHash[inResponse.results[index].personId] = inResponse.results[index].personAvailability;
		}
		enyo.log("Contacts PersonList : IM buddy availability visual refresh");
//console.log("|||||||||||||||||||||| GOT IM STATUSES - REFRESHING LIST");
		this.throttledListRefresh();
//		this.$.personList.refresh();
	},

	throttledListRefresh: function () {
		enyo.job("job.contacts.PersonList.ThrottledRefresh", enyo.bind(this, "throttledListRefreshAction"), 2000);
	},
	throttledListRefreshAction: function () {
//console.log("|||||||||||||||||| ACTUALLY REFRESHING THE LIST");
		this.$.personList.refresh();
	},
	throttledListReset: function () {
		enyo.job("job.contacts.PersonList.ThrottledReset", enyo.bind(this, "throttledListResetAction"), 2000);
	},
	throttledListResetAction: function () {
//console.log("||||||||||||||||| ACTUALLY RESETTING THE LIST");
		this.$.personList.reset();
	},

	getListItem: function (inSender, inPerson, inIndex) {
		if (this.isGalActive && this.searchProperty.val !== undefined && inIndex === this.maxIndex) {
			this.$.GalDivider.canGenerate = true;
			this.$.GalMessage.canGenerate = true;
			this.$.GalSpinner.setShowing(this.galSpinnerShowing);
			this.$.GalMessage.addRemoveClass("selected", this.galSpinnerShowing);
			this.$.GalImage.setShowing(!this.galSpinnerShowing);
			this.$.GalList.canGenerate = true;
			this.$.GalDrawer.canGenerate = true;
			this.$.GalDrawer.setOpen(this.gotGalData);
			this.$.GalResultsMessage.canGenerate = true;
			this.$.GalMessage.setShowing(!this.gotGalData);
			this.$.GalResultsMessage.setShowing(this.galResultsMsg !== undefined);
			this.$.GalResultsMsg.setContent(this.galResultsMsg ? this.galResultsMsg : "");
			this.$.GalResultsMessage.setShowing(this.galResultsMsg !== undefined);
		} else {
			this.$.GalDivider.canGenerate = false;
			this.$.GalMessage.canGenerate = false;
			this.$.GalList.canGenerate = false;
			this.$.GalDrawer.canGenerate = false;
			this.$.GalResultsMessage.canGenerate = false;
		}
		
		if (this.searchProperty.val !== undefined && !this.showFavOnly && inIndex === 0 && this.maxIndex <= 0 && inPerson.emptyGALContact !== undefined) {
			this.$.NoSrchResultsMsgContainer.canGenerate = true;
		} else {
			this.$.NoSrchResultsMsgContainer.canGenerate = false;
		}

		//inPerson is the same as this.$.personList.fetch(inIndex)
		var future,
//			personListPageSize = this.$.personList.getPageSize(),
			curGroupName,
			displayName,
			type = this.showFavOnly ? ContactsLib.PersonPhotos.TYPE.SQUARE : ContactsLib.PersonPhotos.TYPE.LIST,
			nextPerson,
			noDividerAfter;
			
		if (inPerson.emptyGALContact !== undefined) {
			this.$.personItem.setShowing(false);
			return true;
		} else if (inPerson.excludedPerson) {
			this.$.personItem.setShowing(false);
			return true;
		} else {
/* //DEBUG LOGIC
enyo.log("|||||||> inRecord					: " + inRecord ? enyo.json.to(inRecord.name) : "");
var curContact = this.persons[inIndex % personListPageSize];
enyo.log("|||||||> contacts[" + inIndex % personListPageSize	+ "]	 : " + (curContact ? enyo.json.to(curContact.name) : ""));
var nextContact = this.persons[(inIndex % personListPageSize) + 1];
enyo.log("|||||||> contacts[" + ((inIndex % personListPageSize) + 1) + "]: " + (nextContact ? enyo.json.to(nextContact.name) : ""));
*/
			this.$.personItem.setShowing(true);
			displayName = ContactsLib.Person.generateDisplayNameFromRawPerson(inPerson);
			if (inPerson._id in this.idAvailabilityHash && this.enabledIMAccountsMap && this.enabledIMAccountsMap.count > 0) {
				if (this.idAvailabilityHash[inPerson._id] === PersonList.MESSAGING_IMBUDDYSTATUS_OFFLINE ||
						this.idAvailabilityHash[inPerson._id] === PersonList.MESSAGING_IMBUDDYSTATUS_INVISIBLE) {
					this.$.availabilityIcon.setSrc($contactsui_path + "/images/status-offline.png");
					this.$.availabilityIcon.show();
				} else if (this.idAvailabilityHash[inPerson._id] === PersonList.MESSAGING_IMBUDDYSTATUS_AWAY) {
					this.$.availabilityIcon.setSrc($contactsui_path + "/images/status-away.png");
					this.$.availabilityIcon.show();
				} else if (this.idAvailabilityHash[inPerson._id] === PersonList.MESSAGING_IMBUDDYSTATUS_AVAILABLE) {
					this.$.availabilityIcon.setSrc($contactsui_path + "/images/status-available.png");
					this.$.availabilityIcon.show();
				}
				delete this.idAvailabilityHash[inPerson._id];
			} 
			this.$.contactName.setContent(displayName);
			this.$.contactName.addRemoveClass("long", (this.showFavOnly || !this.showFavStars || !inPerson.favorite));
			this.$.contactName.addRemoveClass("long-favOnly", this.showFavOnly);
			this.$.contactName.addRemoveClass("no-im-status", !this.showIMStatuses);
			this.$.favIcon.applyStyle("display", !this.showFavOnly && this.showFavStars && inPerson.favorite ? "inline-block" : "none");
			future = ContactsLib.PersonPhotos.getPhotoPath(inPerson.photos, type, !this.showFavOnly);
			future.now(this, function () {
				this.$.photo.applyStyle("background-image", "url(" + future.result + ");");
			});
			curGroupName = inPerson.groupName;
			this.renderDivider(inIndex, curGroupName);

			nextPerson = this.$.personList.fetch(inIndex + 1);
			noDividerAfter = nextPerson ? (nextPerson.groupName === curGroupName) : false;
			this.$.personItem.addRemoveClass('first', this.$.divider.getShowing() ? true : false);
			this.$.personItem.addRemoveClass('last', (noDividerAfter || this.showFavOnly) ? false : true); // TODO: When showFavOnly is true how do we figure out if we're the last row..

			if (this.selectedPersonInfo && inPerson._id === this.selectedPersonInfo.personId) {
				this.$.personItem.addClass('selected');
			} else {
				this.$.personItem.removeClass('selected');
			}
			return true;
		}
	},
	renderDivider: function (inIndex, inCurGroupName)
	{
		this.$.divider.setShowing(this.determineIfCurDivShouldBeShown(inIndex, inCurGroupName));
		if (this.$.divider.getShowing()) {
			this.$.dividerLabel.setContent(inCurGroupName);
		}
	},
	determineIfCurDivShouldBeShown: function (inIndex, inCurGroupName) {
		var rawPerson;
		do {
			inIndex -= 1;
			rawPerson = this.$.personList.fetch(inIndex);
			if (!rawPerson) {
				return true;
			} else if (!rawPerson.excludedPerson) { // If they are exlcuded keep looping
				return (rawPerson.groupName !== inCurGroupName);
			}
		} while (rawPerson);

		return false;
	},
	getGroupName: function (inIndex, rawPersonObject) {
		//if we're in first-last or last-first, let the divider text be the first character, or the default divider text
		//if we're in company-first-last or company-last-first, let the divider text be the full company name, or the default divider text
		if (!rawPersonObject) {
			rawPersonObject = this.$.personList.fetch(inIndex);
		}
	
		if (!rawPersonObject) {
			return "";
		}
	
		var dividerText,
			sortKey = rawPersonObject.sortKey,
			sortOrder = runningInBrowser ? PersonList.SORT_LAST_FIRST : this.AppPrefs.get(ContactsLib.AppPrefs.Pref.listSortOrder);

		// Source and logic here ported from the PersonDisplayLite.create fn of the Mojo Contacts library (since the Globalization fns will fail)
		if (sortOrder === PersonList.SORT_FIRST_LAST || sortOrder === PersonList.SORT_LAST_FIRST) {
			//if there's a sort key and it doesn't start with the default character, use it
			if (sortKey && sortKey.slice(0, 1) !== PersonList.SORTKEY_DEFAULT_CHAR) {
				dividerText = sortKey.slice(0, 1);

				//make the divider text accent-free
				dividerText = enyo.g11n.Char.getBaseString(dividerText);

				//Some characters have a 2 character base
				dividerText = dividerText.slice(0, 1);

				return dividerText;
			} else {
				//else we use the default divider text
				return PersonList.DEFAULT_DIVIDER_TEXT;
			}
		} else {
			//if there's a sort key and it doesn't start with the default character, use it
			if (sortKey && sortKey.slice(0, 1) !== PersonList.SORTKEY_DEFAULT_CHAR) {
				dividerText = rawPersonObject.organization && rawPersonObject.organization.name;

				if (dividerText) {
					//make the divider text accent-free
					dividerText = enyo.g11n.Char.getBaseString(dividerText);
				
					//Some characters have a 2 character base
					dividerText = dividerText.slice(0, 1);

					return dividerText;
				} else {
					//not sure how we could ever get into this case, considering we have an org name in the sortKey
					//TODO: instead of reading from the org name directly, as above, should we parse the org name off the sortKey?

					//else we use the default divider text
					dividerText = PersonList.DEFAULT_DIVIDER_TEXT;

					return dividerText;
				}
			} else {
				//else we use the default divider text
				dividerText = PersonList.DEFAULT_DIVIDER_TEXT;

				return dividerText;
			}
		}	
	},
	gotPersonsCount: function (inSender, inResponse, inRequest) {
		if (inResponse.count !== undefined && this.isGalActive === true) {
			if (inResponse.count > 0) {
				this.maxIndex = inResponse.count - 1;
				// The DbList will only return a maximum of number of results equal to the pageSize, this is a limitation of a DB search
				if (this.maxIndex > (this.$.personList.pageSize - 1)) {
					this.maxIndex = this.$.personList.pageSize - 1;
				}
				// End of TODO
			} else { // There are no results but we still want to show the GAL if applicable
				this.maxIndex = 0;
			}
		} else {
			this.maxIndex = -1;
		}
	},
	gotPersonsCountFailed: function (inSender, inResponse, inRequest) {
		this.maxIndex = -1;
	},
	gotPersons: function (inSender, inResponse, inRequest) {
		var idArray = [], //where person Ids are collected for the im status query
			index;

		if (runningInBrowser) {	//for in-browser use (FOR APP PRODUCTION PEOPLE ONLY - will not be supported beyond this)
			for (index = 0; index < inResponse.results.length; index += 1) {
				idArray.push(inResponse.results[index]._id);
				MockPersonMap["" + inResponse.results[index]._id] = inResponse.results[index];
				MockPersonMap["" + inResponse.results[index]._id].contactCount = (index + 1);
			}
		}
		
		this._processPersonResults(inResponse, inRequest);
	},
	_processPersonResults: function (inResponse, inRequest) {
		var persons = inResponse.results || [],
			rawPerson,
			index;
		
		this.doListUpdated();
		this.persons = inResponse.results;
		
		for (index = 0; index < persons.length; index += 1) {
			rawPerson = persons[index];
			rawPerson.groupName = this.getGroupName(undefined, rawPerson);
			if (this.exclusions.length > 0) {
				if ((this.exclusions.indexOf(rawPerson._id) !== -1) ||
					(this.peopleWithAddressOnly === true && rawPerson.addresses && rawPerson.addresses.length === 0))
				{
					persons[index] = {excludedPerson: true, groupName: rawPerson.groupName};
				}
			}
		}

		if (this.searchProperty.val && this.maxIndex <= 0 && !this.showFavOnly) {
			inResponse.results.push({"emptyGALContact": ""});
		}

		this.$.personList.queryResponse(inResponse, inRequest);
	},
	gotPersonsWatch: function (inSender, inResponse, inRequest) {
		if (inResponse.fired === true) {
			this.$.personList.reset();

			if (this.searchProperty.val !== undefined) {
				this.setSearchString(this.searchProperty.val, true);
			}
		}
	},
	getContactFromItem: function (inItem) {
		var index = this.$.personList.fetchRowIndex();
		return this.persons[index % this.persons.length];
	},
	itemClick: function (inSender, inEvent, index) {
		var item = this.$.personList.fetch(index);
		this.toggleListSelection(false, index, item._id, true);
		this.doContactClick(item);
		enyo.job("job.contacts.PersonList.Refresh", enyo.bind(this, "_refresh"), 100);
	},
	selectContact: function (inPersonId) {
		// Un-highlights any previous item and highlights the person that matches with inPersonId
		this.toggleListSelection(false, undefined, inPersonId);
		
		// TODO: Figure out how to scroll to the selected item if possible?
	},
	toggleListSelection: function (inIsForGal, inIndex, inPersonId, inDoNotRefresh) {
		var prevSelectedGalPersonIndex = this.selectedGalPersonInfo ? this.selectedGalPersonInfo.itemIndex : -1;
		
		// Remember which item is being selected
		if (inIsForGal) {
			this.selectedPersonInfo = undefined;
			this.selectedGalPersonInfo = {itemIndex: inIndex};
		} else {
			this.selectedPersonInfo = {personId: inPersonId};
			this.selectedGalPersonInfo = undefined;
		}
		
		if (prevSelectedGalPersonIndex >= 0) {
			this.$.GalList.renderRow(prevSelectedGalPersonIndex);
		}

		// Select the currrent item
		if (inIsForGal) {
			this.$.GalList.renderRow(inIndex);
		} else {
			if (inDoNotRefresh !== true) {
				this.$.personList.refresh(); // Refresh the whole list since the list can get into a state where multiple items are selected if we call updateRow DFISH-29886
			}
		}
	},
	// GAL Functions
	resetGalStates: function () {
		this.$.galService.cancel();
		this.galData = [];
		this.gotGalData = false;
		this.maxIndex = -1;
		this.selectedGalPersonInfo = undefined;
		this.galResultsMsg = undefined;
		this.galSpinnerShowing = false;
	},
	onGalGetItem: function (inSender, inIndex) {
		var galPerson,
			selectedIndex = this.selectedGalPersonInfo ? this.selectedGalPersonInfo.itemIndex : -1;
		if (inIndex >= 0 && inIndex < this.galData.length) {
			galPerson = this.galData[inIndex];
			if (galPerson) {
				this.$.galPerson.setContent(galPerson.displayName);
				this.$.galItem.addRemoveClass("selected", inIndex === selectedIndex);
				return true;
			}
		}
	},
	gotGalResults: function (inSender, inResponse) {
		this.showGalSpinner(false);
		this.galData = inResponse.results || [];
		this.gotGalData = true;
		if (this.galData.length === 0) {
			this.galResultsMsg = crb.$L("No search results found");
		} else if (this.galData.length >= 100) {
			this.galResultsMsg = crb.$L("Over 100 results found. Please narrow your search query.");
		} else {
			this.galResultsMsg = undefined;
		}
		this.$.GalList.render();
		if (this.galData.length > 0) {
			this.$.GalDrawer.setOpen(true);
		}
		this.$.personList.updateRow(this.maxIndex); // Needed so that changes to this.galMessage are rendered
		this.$.GalResultsMessage.addRemoveClass("last", (this.galData.length >= 100)); // oksana: this is the attempt... failed one.
	},
	gotGalFailure: function (inSender, inResponse) {
		this.showGalSpinner(false);
	},
	showGalSpinner: function (inShowing) {
		if (this.maxIndex >= 0) {
			this.galSpinnerShowing = inShowing;
			this.$.personList.updateRow(this.maxIndex);
		}
	},
	GalMessageOnClick: function () {
		if (!this.$.GalDrawer.getOpen()) {
			this.showGalSpinner(true);
			if (runningInBrowser) {
				this.$.mockGalService.call();
			} else {
				this.$.galService.call({filterString: this.searchProperty.val, addressTypes: ["emails", "phoneNumbers", "ims"]});
			}
		}
	},
	onOpenAnimationComplete: function () {
		this.$.personList.refresh();
	},
	onGalPersonClick: function (inSender, inEvent) {
		var galPerson = this.galData[inEvent.rowIndex];
		if (galPerson) {
			galPerson.isGAL = true;
			this.toggleListSelection(true, inEvent.rowIndex, undefined);		
			this.doContactClick(galPerson);
		}
	}
});
