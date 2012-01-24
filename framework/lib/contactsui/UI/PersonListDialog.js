/*jslint white: true, onevar: true, undef: true, eqeqeq: true, plusplus: true, bitwise: true, 
regexp: true, newcap: true, immed: true, nomen: false, maxerr: 500 */
/*global ContactsLib, document, enyo, console, crb */



/* 

Person List Dialog

A dialog that has 3 modes : 
	-allows the selection of a person from the database or GAL. Returns raw JSON object. dialogMode: "peoplePicker"
  -allows the selection of a contact point in order to 1) get raw JSON result 2) 1 and set contact point as the favorite in the context of the host application. dialogMode: "contactPointPicker"
	-allows the selection of a person followed by the selection of a contact point. dialogMode: "combined"

SETUP PARAMETERS 
	dialogMode : 
		"peoplePicker" - Default value. Tap action: returns person raw JSON result
		"contactPointPicker" - Tap action: if enableFavoriting is true, favorites chosen contact point. ReturnValue: contact point raw JSON. Use the lookupContactPointsByPersonId function to pull up the person's contact points.
		"combined" - Used for favoriting. UI flow: people picker, then contactPointPicker. Tap action 1: returns person raw JSON result. Tap action 2: Marks chosen person's selected contact point as favorite, returns contactPointPicker raw JSON
	autoClose: bool. Closes the dialog upon the selection of a contact point AND also upon the selection of a person IFF dialogMode === "peoplePicker"
	enableFavoriting: bool. Chosen contact point will be auto-favorited on behalf of the host app if this is true.
	listIndexForDefault: Mandatory if enableFavoriting is truthy. Integer that specifies a relative index used for sorting in lists, in the context of the host application.
	contactPointTyped: Array of strings specifying what type(s) of contact points to choose from. Options include "IMAddress", "PhoneNumber", and "EmailAddress"

  mode: <string> - one of "noFilter", "favoritesOnly", "noFavoritesOnly". Defaults to "noFilter"
  exclusions: <array of <str>> - People to exclude from the peoplePicker list. Array of strings containing mojodb person _id's. Defaults to no exclusions : []
  showSearchBar: <bool> //only works when mode = noFilter
  enableGAL: <bool> - global address lookup enable flag. default: false
  showIMStatuses: <bool> - enable flag for IM status indicator for messaging contacts (not available yet in webOS 3.0)
  resizeOnSearchFocus: <bool> - If you don't want it to resize your window when the search field receives focus then set this to false.  Defaults to true.
	showFavStars: <bool> - show favorites stars
	

EVENTS
  onContactClick: fires when a contact is clicked. Return value: raw JSON person 
	onContactPointClick: fires when a contact point is clicked. Return value: raw JSON contact point 
	onListUpdated: the list updates
	onSearchCriteriaUpdated: typing or deleting (non-empty search field)
	onSearchCriteriaCleared: search field cleared
	onCancelClick: when the Cancel button is tapped. Listen to this event in order to close the dialog using the close() method.


PUBLIC API
	open(), openAtCenter() : show the dialog. Since dialogs are mainly lazily loaded, call validateComponents() on the dialog first.
	lookupContactPointsByPersonId(<personId>) : for contactPointPicker mode. Skip peoplePicker and look up contact points on the person specified by mojodb id. The contact point picker types are defined on creation in contactPointTypes, but can be changed at runtime. <yourInstanceOfThisWidget>.contactPointTypes = ["", "",..];
	closeDialog() : use this function instead of close()
	clearSearchField() : clears the search field of the people picker widget, refreshes list appropriately
	setExclusions(<array of mojodb person ids>) : exclude specific persons from the list (must exist in db). For performance reasons, consumers are advised to not use this function when it is avoidable.
*/



enyo.kind({
	name		: "com.palm.library.contactsui.personListDialog",
	kind		: "ModalDialog",
	layoutKind	: "VFlexLayout",
	caption		: crb.$L("Make A Selection"),
	scrim		: true,
	width		: "340px", // Explicitly setting the width here, otherwise the favorites icon wraps to the next line when the name of the person requires ellipsis

	events:
	{	
		onContactClick: "",
		onContactPointClick: "",
		onListUpdated: "",
		onSearchCriteriaUpdated: "",
		onSearchCriteriaCleared: "",
		onCancelClick: ""
	},

	published:
	{	
		exclusions : [],
		mode: "noFilter",
		showSearchBar: true,
		showIMStatuses: true,
		showFavStars: true,
		enableGAL: false,
		favoritingAppId: enyo.fetchAppId(),
		dialogMode: "peoplePicker", //"peoplePicker", "contactPointPicker", "combined"
		enableFavoriting: false,
		listIndexForDefault: null,
		contactPointTypes: [], //Array of at least one of "EmailAddress", "IMAddress", "PhoneNumber"
		autoClose: false
	},

	components: [
		{kind: "Pane", name: "pane", flex: 1, height: "300px", layoutKind: "VFlexLayout", className: "group", components: [
			{name: "listWrapper", flex: 1, height: "100%", style: "margin: -6px -10px -10px;", components: [], kind: "VFlexBox"},
			{name: "cppWrapper", flex: 1, height: "100%", style: "margin: -6px -10px -10px;", components: [], kind: "VFlexBox"}
		]},
		{kind: "Button", caption: crb.$L("Cancel"), onclick: "doCancelClick"}
	], //VFlexBox container for personListWidget did not work out; add components dynamically to component list in create() only!

	componentsReady: function () {
		var index;
		this.inherited(arguments);
		if (! this.favoritingAppId) { //if favoritingAppId not defined by private bus consumer, get it from host
			this.favoritingAppId = enyo.fetchAppId();
		}

		for (index = 0; index < this.contactPointTypes.length; index++) {
			if (this.contactPointTypes[index] === "EmailAddress") {
				this.contactPointTypes[index] = ContactsLib.ContactPointTypes.EmailAddress;
			} else if (this.contactPointTypes[index] === "IMAddress") {
				this.contactPointTypes[index] = ContactsLib.ContactPointTypes.IMAddress;
			} else if (this.contactPointTypes[index] === "PhoneNumber") {
				this.contactPointTypes[index] = ContactsLib.ContactPointTypes.PhoneNumber;
			} else {
				this.contactPointTypes.splice(index, 1);
			}
		}

		this.$.listWrapper.createComponent({kind: "com.palm.library.contactsui.personListWidget", 
			name: "personListWidget", 
			//width: "320px", 
			height: "100%",
			flex: 1,
			mode: this.mode, 
			showSearchBar: this.showSearchBar, 
			showAddButton: false, 
			onContactClick: "contactClick", 
			onListUpdated: "doListUpdated", 
			onAddClick: enyo.nop, 
			onSearchCriteriaUpdated: "doSearchCriteriaUpdated", 
			onSearchCriteriaCleared: "doSearchCriteriaCleared", 
			showIMStatuses: this.showIMStatuses, 
			showFavStars: this.showFavStars,
			enableGAL: this.enableGAL,
			owner: this
		});
		this.$.cppWrapper.createComponent({kind: "com.palm.library.contactsui.contactPointPickerList",
      	name: "ContactPointPicker",
	      flex: 1,
  	    saveSelectionAsPrimary: this.enableFavoriting,
    	  listIndexForDefault: this.listIndexForDefault,
				onContactPointClick: "returnFromCpp",
				onRendered: "showCPP",
	  		favoritingAppId: this.favoritingAppId,
		    owner: this
 	  });

	},
	open: function () {
		this.inherited(arguments);
	
		if (this.dialogMode === "combined" || this.dialogMode === "peoplePicker") {
			this.$.pane.selectViewByName("listWrapper");
		} else if (this.dialogMode === "contactPointPicker") {
			this.$.pane.selectViewByName("cppWrapper");
		}

		this.$.personListWidget.punt();
		if (this.exclusions && typeof(this.exclusions) === "array") {
			this.$.personListWidget.setExclusions = this.exclusions;
		}
//		this.$.personListWidget.setMode(this.mode);
	},	
	returnFromCpp: function (sender, value) {
		this.doContactPointClick(value);
		if (this.autoClose) {
			this.closeDialog();
		}
	},
	lookupContactPointsByPersonId: function (personId) {
		this.$.pane.selectViewByName("cppWrapper");
		this.$.ContactPointPicker.lookupByPersonId(personId, this.contactPointTypes);
	},
	contactClick: function (sender, value) {
		this.doContactClick(value);
		if (this.enableFavoriting === true) {
      ContactsLib.PersonFactory.createPersonDisplay(value).makeFavorite();
    }
		if (this.dialogMode === "peoplePicker" && this.autoClose === true){
			this.closeDialog();
		}
		else if (this.dialogMode === "combined") { 
			this.$.pane.selectViewByName("cppWrapper");
		  this.$.ContactPointPicker.lookupByPersonId(value._id, this.contactPointTypes);
		}
	},
	closeDialog: function () {
		this.$.pane.selectViewByName("listWrapper");
		this.clearSearchField();
		this.close();
	},
	clearSearchField: function () {
		this.$.personListWidget.clearSearchField();
	},
	setExclusions : function (exclusions) {
		this.$.personListWidget.setExclusions(exclusions);
	},
	showCPP: function (sender, numContactPoints) {
		if (numContactPoints > 0) {
			this.$.pane.selectViewByName("cppWrapper");
		} else {
			this.closeDialog();
		}
	}
});		
