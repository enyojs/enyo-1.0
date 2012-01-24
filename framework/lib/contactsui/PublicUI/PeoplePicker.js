/*jslint white: true, onevar: true, undef: true, eqeqeq: true, plusplus: true, bitwise: true, 
regexp: true, newcap: true, immed: true, nomen: false, maxerr: 500 */
/*global ContactsLib, document, Foundations, enyo, crb*/

/**
A PeoplePicker Dialog control is used to select a person (representation of 1+ linked contacts) and return the data.
*/

/** Use instructions for 3rd party applications
{name: "preferredName", kind: "com.palm.library.contactsui.peoplePicker", onContactClick: "contactClickHandlerFunctionName", onCancelClick: "cancelClickHandlerFunctionName"}

Handlers for all of the events in the events object below may be specified
Data will be returned in the form {event:"eventName", value:""}
Value will equal "" for all events other than contactClick. In the case of contactClick, the value will be a JSON object containing a raw JSON person object from db

To open the dialog, do not use .open() or .openAtCenter(). Use the pickPerson() method
 instead.
*/

enyo.kind({
	name: "com.palm.library.contactsui.peoplePicker",
	kind: "enyo.Popup",
	className: "enyo-popup contactsui-peoplepicker",
	published: {
		//* Optional int to set the width of the crop window.
		cropWidth: undefined,
		//* Optional int to set the height of the crop window.
		cropHeight: undefined,
		//* Optional id's of persons to exclude
		exclusions: [], 
		//* Optional mode. Can specify "noFilter" (all), "favoritesOnly", "noFavoritesOnly". Defaults to "noFilter"
		mode: "noFilter",
		//* Optional boolean for showing the search bar. Default: true
		showSearchBar: true,
		//* Optional boolean for showing IM statuses. Default: false
		showIMStatuses: false,
		//* Optional boolean for showing the favorite star next to favorited persons. Default: true
		showFavStars: true,
		//* Optional boolean for showing GAL search. Default: false
		enableGAL: false,
		//* String. Select "peoplePicker", "contactPointPicker", or "combined". Entry points are NOT open() and openAtCenter(), but
		//	pickPerson(_id_) for "peoplePicker" and "combined" mode, and lookupContactPointsByPersonId(_id_) for "contactPointPicker" mode 	
		dialogMode: "peoplePicker",
		//* Boolean. Default: "peoplePicker". Favorites person, then contactPoint (if clicked) automatically. Events onContactClicked and onContactPointClicked will return raw Person JSON and ContactPoint JSON in either case.
		enableFavoriting: "true",
		//* Integer, required. An integer value that can be used to sort favorited contact points in a vertical list. 
		listIndexForDefault: null,
		//* Array of string(s). Which types of contact points to allow the user to choose from. Options are "EmailAddress", "IMAddress", "PhoneNumber"
		contactPointTypes: [],
		//* Close the dialog automatically when the flow is finished.
		autoClose: false
	},
	events: {
		//*Person clicked. Person data will be returned with this event
		onContactClick: "",
		//*Contact point clicked. Contact point data will be returned with this event. Contact point may be favorited on behalf of the host app
		onContactPointClick: "",
		//*Cancel button clicked. The dialog will close and dispatch this event
		onCancelClick: "",
		//*The list is refreshed (persons db updated - visible area in list may or may not change)
		onListUpdated: "",
		//*Search field updated (not cleared)
		onSearchCriteriaUpdated: "",
		//*Search field cleared
		onSearchCriteriaCleared: ""
	},
	dismissWithClick: true,
	modal: true,
	scrim: true,
	peoplePickerDialogPath: "/media/cryptofs/apps/usr/palm/applications/com.palm.app.contacts/sharedWidgets/peoplePicker/peoplepicker.html",
	components: [
		{className: "contactsui-peoplepicker-container", components: [
			{name: 'crossapp', kind: "CrossAppUI", onResult: "_handleResult"}
		]}
	],

	//entry point functions, not open() or openAtCenter()
	pickPerson: function () {
		this.validateComponents();
		this._updateParams();
		this.$.crossapp.setPath(this.peoplePickerDialogPath);
		this.openAtCenter(); 
	},
	lookupContactPointsByPersonId: function (personId) {
		this.validateComponents();
		this._updateParams();
		this.$.crossapp.setPath(this.peoplePickerDialogPath);
		this.$.crossapp.setParams({action: "lookupContatPointsByPersonId", personId: personId});
	},
	//end of entry point functions

	setExclusions: function (exclusionsArray) {
		this.$.crossapp.setParams({action: "setExclusions", exclusionsArray: exclusionsArray});
	},
	clearSearchField: function () {
		this.$.crossapp.setParams({action: "clearSearchField"});
	},
	_updateParams: function () {
		var params = {favoritingAppId: enyo.fetchAppId()},
		that = this;
		// Copy all published properties to the params object.
		Object.keys(this.published).forEach(function (key) {
			if (that[key] !== undefined) {
				params[key] = that[key];
			}
		});
		this.$.crossapp.setParams(params);
	},
	_handleResult: function (inSender, result) {
		if (result.event === "contactClick") {
			this.doContactClick(result.value);
			if (this.autoClose === true && this.dialogMode === "peoplePicker") {
				this.destroyAndClose();
			}
		} else if (result.event === "contactPointClick") {
			this.doContactPointClick(result.value)
			if (this.autoClose === true) {
				this.destroyAndClose();
			}
		} else if (result.event === "listUpdated") {
			this.doListUpdated();
		} else if (result.event === "cancelClick") {
			this.doCancelClick();
			this.destroyAndClose();
		} else if (result.event === "searchUpdated") {
			this.doSearchCriteriaUpdated();
		} else if (result.event === "searchCleared") {
			this.doSearchCriteriaCleared();
		}
	},	
	destroyAndClose: function () {
		this.$.crossapp.setPath("");
		this.close();
	}
});
