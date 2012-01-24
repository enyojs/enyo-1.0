/*jslint white: false, onevar: false, nomen:false, plusplus: false */
/*global RestrictedDialingList, document DialingShortcuts, window, console, kit, SystemService, TelephonyService, _, ContactsUI, ContactsLib, Class, App, enyo, $L, $H, $break, Event, Future, MojoDB, mapReduce, MainStageName, setTimeout, clearTimeout, Messaging, AudioTag, Image, PalmSystem, TransportPickerModel, Template, CharacterCounter, MessagingDB, MessagingUtils, MessagingMojoService, ChatFlags, BucketDateFormatter, CONSTANTS, MenuWrapper, SetTopicAssistant*/
/*  */

PinAction = {	
	PinCode_Lock: 1, 
	PinCode_UnLock: 3, 
	PinCode_Verify: 5, 
	PinCode_Change: 6, 
	PinCode_ChangeNew: 7, 
	PinCode_ChangeConfirm: 8,
	PUK_Enter: 9,
	PUK_NewPin: 10,
	PUK_ConfirmPin: 11,
	Pin2_Disable: 12, //fdnDisable
	Pin2_Enable: 13, //fdnEnable
	Pin2_Verify: 14,
	Pin2_Change: 15,
	Pin2_ChangeNew: 16,
	Pin2_ChangeConfirm: 17,
	PUK2_Enter: 18,
	PUK2_NewPin: 19,
	PUK2_ConfirmPin: 20,
	Pin2_PUKLocked: 21,
	SimLocked: 22,
	Fdn_Verify:25,
	Fdn_Disable:26,
	deviceLockUnlock: 28,
	Exit: 32
}; 

PinStatus = {
	PinLocked: 1,	
	Pin2Enabled: 0,
	FdnEnabled: -1,
	SimLocked: 0,
 	Devicelocked: 0,
	Pinpermblocked: 0, 
	Pin2permblocked: -1, 
	Pukrequired: 0,
	Puk2required: 0,
	Pinrequired: 0,
	Pin2required: 0,
}; 

APNtype = {
	kApnTypeData: 1,
	kApnTypeMms: 4
};

PinResources = {
	"$L": function(inText) {
		if (!this._resources) {
			this._resources = new enyo.g11n.Resources({root:"$enyo-lib/telephony"});
		}
		return this._resources.$L(inText);
	},
        reload: function (locale) {
                this._resources = new enyo.g11n.Resources({root: "$enyo-lib/telephony", locale: locale});
        }
};
