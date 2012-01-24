/*jslint white: true, onevar: true, undef: true, eqeqeq: true, plusplus: true, bitwise: true, 
regexp: true, newcap: true, immed: true, nomen: false, maxerr: 500 */
/*global ContactsLib, document, enyo, console, runningInBrowser, PersonList, MockPersonMap, crb, $contactsui_path */

/*
Contact Point Picker List

A list of all the contact points that the consumer specifies ("EmailAddress", "PhoneNumber", and/or "IMAddress") in the types attribute (array) at creation time. 
A contact point clicked will automatically favorite the contact point on behalf of the host application (may be overridden by private bus apps).


Setup parameters

types - Array of strings ("IMAddress", "EmailAddress", "PhoneNumber")
saveSelectionAsPrimary - Whether to set the contact point as the favorite contact point for the selected person on behalf of the host app. The contact point raw
  JSON will be returned in either case.
listIndexForDefault - Mandatory if saveSelectionAsPrimary is truthy. An integer index that can be used in applications in order to sort favorites in lists. 
favoritingAppId - overridable by private bus apps. Favoriting a contact point on behalf of the specified app. Otherwise will be gotten from enyo.fetchAppId() which gets host's appId

Public API

Use lookupByPersonId ("<mojodbId>", <arrayOfContactPointTypeStrings>) in order to display the corresponding contact points of the given person in db.
Use closeDialog() instead of close() when closing the dialog


Public events

You may use the onRendered event as a hook for opening the dialog using .open() or .openAtCenter(). 
	The onRendered event will return the number of contact points available according to the criteria specified (>=0)
	This information may be used in order to determine whether the contactPointPicker should be displayed as part of the favoriting UI flow.
The onContactPointClick event will fire when a contactPoint is tapped.

*/


enyo.kind({
	name: "com.palm.library.contactsui.contactPointPickerList",
	kind: "VFlexBox",
	className: "enyo-contacts-pointpickerlist",
	published: {
		person: null,
		personId: null,
		types: [],
		saveSelectionAsPrimary: false,
		listIndexForDefault: undefined, 
		auxFavoriteDataForDefault: undefined,
		favoritingAppId: enyo.fetchAppId()
	},
	events: {
		onContactPointClick: "",
		onRendered: ""
	},
	statics: {
		PRIMARY_CLASS : "primary"
	},
	components: [
		{name: "contactPointList", kind: "VirtualList", flex: 1, onSetupRow: "getListItem", components: [
			{name: "contactItem", kind: "Item", layoutKind: "HFlexLayout", onclick: "handleItemTap", components: [
				{name: "contactItemLayout", kind: "Control", flex: 1, components: [
					{name: "contactPointName", className: "name", wantsEvents: false},
  	      {name: "contactPointLabel", className: "label", content: ""}
				]}
			]}
		]}
	],
	create: function () {
		this.inherited(arguments);
	},
	lookupByPersonId: function (personId, type) {
	  if (_.isString(type)) {
	    this.types = [type];
	  } else if (_.isArray(type)) {
	    this.types = type;
	  }
		if (personId && ( typeof personId === "string")) {
			this.personId = personId;
			ContactsLib.Person.findById(this.personId).then(this, function (future) {
      	this.person = future.result;
      	this.renderContactPoints();
      	future.result = true;
    	});
		} else {
			enyo.log("ERROR setting up ContactPointPicker with personId");
		}
	},
	personChanged: function (person) {
		if (person && (typeof person === "object")) {
			this.person = person;
			this.renderContactPoints();
		} else {
			enyo.log("ERROR setting up ContactPointPicker with person");
		}
	},
	ready: function () {
	},
	rendered: function () {
		this.inherited(arguments);
	},
	getListItem: function (inSender, inIndex) {
		if (this.contactPoints && "length" in this.contactPoints) {
			if (inIndex < this.contactPoints.length && inIndex >= 0) {
				this.$.contactPointName.setContent(this.getFieldValue(this.contactPoints[inIndex]));
				this.$.contactPointName.addRemoveClass("long", true); //TODO: check this over
				this.$.contactPointLabel.setContent(this.getFieldTypeDisplay(this.contactPoints[inIndex]));
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	},
	getContactFromItem: function (inItem) {
		var index = this.$.personList.fetchRowIndex();
		return this.persons[index % this.persons.length];
	},
	getFieldValue: function (inField) {
    var val = inField.value || inField.getDisplayValue() || "";
    val = enyo.string.escapeHtml(val);
    return val;
  },
  getFieldTypeDisplay: function (inField) {
    return (inField.x_displayType) || "";
  },
	renderContactPoints : function () {
 		var i,
  	  type;

		this.contactPoints = [];
//	  var displayName: this.person.generateDisplayName();

	  for (i = 0; i < this.types.length; i += 1) {
	 	  type = this.types[i].contactPoint ? this.types[i].contactPoint : this.types[i];
	    switch (type) {
  	  case ContactsLib.ContactPointTypes.PhoneNumber:
    	  this.contactPoints.push.apply(this.contactPoints, this.getCPsForPersonForType(this.person, ContactsLib.ContactPointTypes.PhoneNumber, this.types[i].type));
      	break;

	    case ContactsLib.ContactPointTypes.EmailAddress:
				this.contactPoints.push.apply(this.contactPoints, this.getCPsForPersonForType(this.person, ContactsLib.ContactPointTypes.EmailAddress, this.types[i].type));
				break;

			case ContactsLib.ContactPointTypes.IMAddress:
				this.contactPoints.push.apply(this.contactPoints, this.getCPsForPersonForType(this.person, ContactsLib.ContactPointTypes.IMAddress, this.types[i].type));
				break;

			default:
				enyo.warn("Encountered an unsupported type: " + type);
				break;
			}
		}

		if (!this.contactPoints || !_.isArray(this.contactPoints)) {
  	  this.contactPoints = [];
	  }

	  this.contactPoints.forEach(function (contactPoint) {
  	  if (contactPoint.getPrimary() || contactPoint.getFavoriteDataForAppWithId(this.favoritingAppId) ) {
    	  contactPoint.primaryClass = com.palm.library.contactsui.contactPointPickerList.PRIMARY_CLASS; //TODO: abstract out as constant
	    }
			if (this.showSpeedDialButtons && _.isFunction(item.getSpeedDial) && contactPoint.getSpeedDial()) {
  	    contactPoint.hasSpeedDial = "show-quick-dial";
	    }

	  });
		this.$.contactPointList.reset();
		this.doRendered(this.contactPoints.length);
	},
	getCPsForPersonForType: function (person, type, filter) {
    var mappingFunction = function (array, filter) {
      if (filter) {
        var toReturn = [];
        array.forEach(function (contactPoint) {
          if (contactPoint.getType() === filter) {
            toReturn.push(contactPoint);
          }
        });
        return toReturn;
      } else {
				return array;
      }
    };

    switch (type) {
    case ContactsLib.ContactPointTypes.PhoneNumber:
      return mappingFunction(person.getPhoneNumbers().getArray(), filter);
    case ContactsLib.ContactPointTypes.EmailAddress:
      return mappingFunction(person.getEmails().getArray(), filter);
    case ContactsLib.ContactPointTypes.IMAddress:
      return mappingFunction(person.getIms().getArray(), filter);
    default:
      return [];
    }
  },
	handleItemTap : function (inSender, inEvent) {
		var currentContactPoint = this.contactPoints[inEvent.rowIndex];
		this.doContactPointClick(currentContactPoint);	
		if (this.saveSelectionAsPrimary) {
  	  this.setItemAsDefault(currentContactPoint, this.person, this.listIndexForDefault, this.auxFavoriteDataForDefault, this.callback);
	  } else {
  //	  this.callCallback(this.callback, item, this.person);
	  }

/*  	if (this.popSceneOnItemSelect) {
	    this.controller.stageController.popScene();
  	}
*/
	},
	setItemAsDefault : function (item, person, listIndex, auxFavoriteDataForDefault, callback) {
  	var param = {
      defaultData: {
				value: item.getValue(),
				type: item.getType(),
				listIndex: listIndex,
				auxData: auxFavoriteDataForDefault,
				appId: this.favoritingAppId
      }
    };
	  if (item instanceof ContactsLib.PhoneNumber) {
	    param.defaultData.contactPointType = ContactsLib.ContactPointTypes.PhoneNumber;
	  } else if (item instanceof ContactsLib.IMAddress) {
	    param.defaultData.contactPointType = ContactsLib.ContactPointTypes.IMAddress;
	  } else if (item instanceof ContactsLib.EmailAddress) {
	    param.defaultData.contactPointType = ContactsLib.ContactPointTypes.EmailAddress;
	  }

	  if (param.defaultData.contactPointType) {
//	    ContactPointPickerAssistant.callCallback(callback, item, person);
	    person.setFavoriteDefault(param);
	  } else {
//	    ContactPointPickerAssistant.callCallback(callback, item, person);
	  }

	}

});
