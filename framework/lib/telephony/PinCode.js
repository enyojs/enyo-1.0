/*globals enyo */
enyo.kind({
	name: "PinCode",
	//className: 'pinCardBackground',
	kind: enyo.VFlexBox,
	published: {
		pinAction: PinAction.PinCode_Lock,
		pinStatus: PinStatus.PinLocked,
		nextState: undefined,
		nextView: undefined,
		unblock: undefined,
		locktype: undefined
	},
	events: {
		onRefreshCard: "",
		onPinCodeDone: "",
		onStartOver: ""
	},
	components: [
		{name: "label", components: [
			{name: "pin", content: PinResources.$L({key:"notEASPIN", value: "Enter PIN"}), style: "text-align: center; color: white; width: 100%; font-size: 26px;"},
			{name: "oldPin", content: PinResources.$L("Enter old PIN"), style: "font-size: 18px; text-align: center; color: white; width: 100%;"}
		]},	
		{name:"pinlabel", content: PinResources.$L(" "), style: "font-size: 22px; weight: bold; text-align: center; color: white; width: 100%;"},
		{kind:"PinDialpad", flex: 1, onNumberAdded: "handleButtonClick", onHandleDelete: "HandleBackspace", onHandleClear: "HandleClear"},	
		{kind:"HFlexBox", defaultKind: "Button", components: [
			{flex: 1, layoutKind: "VFlexLayout", pack: "center", caption: PinResources.$L("Use Wi-Fi"), onclick: "UseWifiCall", height:"50px"},
			{flex: 1, layoutKind: "VFlexLayout", pack: "center", caption: PinResources.$L("Done"), onclick: "DonePinCode", className: "enyo-button-affirmative", height:"50px"}
		]}, 
		{name: "telService", kind: enyo.PalmService, service: enyo.palmServices.telephony, onSuccess: "", onFailure: ""}
	],

	create: function() {
		this.inherited(arguments);
		this.initData();
	},	
	
	initData: function() {
		this.pincode = "";
		this.pincodeDisplay = "";
		this.savedPin = "";
		this.PUK2 = "";
		this.PUK = "";
		this.newpin = "";
		this.newpin2 = "";
		this.pinError = false;
	},
	
	//physical keyboard button keyup
	keyup: function(e) {

		var value, key; 
		value = key = enyo.application.Utils.keyFromEvent(e); 
		if (value !== '\b' && value !== '\r') {
			value = enyo.application.Utils.isDTMFKey(key);
		}
		switch (value) {
		case '\b':
			this.HandleBackspace();
			break;
		case '\r':
			this.DonePinCode();
			break;
		case '0': case '1': case '2': case '3': case '4':
		case '5': case '6': case '7': case '8': case '9':
			this.handleButtonClick(null, value);
			break;
		}
		
		return true; 
	},	

	handleButtonClick: function(e, value){
		if (this.pinAction === PinAction.Exit){ //don't do anything
			return;
		}	
		if (this.pinError) {
			switch (this.pinAction) {
				case PinAction.PinCode_Lock:
					this.setDefault();
					break;
					
				case PinAction.PinCode_UnLock:
					this.setDefault();
					break;
					
				case PinAction.Pin2_Enable:
					this.setDefault(true);
					break;
					
				case PinAction.Pin2_Disable:
					this.setDefault(true);
					break;
					
				case PinAction.Pin2_Change:
					this.setDefault(true);
					break;
					
				case PinAction.PinCode_Change:
					this.setUI();
					break;
					
				case PinAction.PinCode_ChangeNew:
					this.setUI();
					break;
					
				case PinAction.PinCode_Verify:
					this.setUI();
					break;
					
				case PinAction.PUK_Enter:
					if (PinStatus.Pukrequired) {
						this.setHeaderText(PinResources.$L("SIM Card PUK Locked"));
						this.$.oldPin.setContent(PinResources.$L("Enter PUK to reset PIN"));
						this.showOldPin();
					}
					break;
					
				case PinAction.PUK_NewPin:
					this.setUI();
					break;
					
				case PinAction.Pin2_ChangeConfirm:
					if (PinStatus.Puk2required) {
						this.setHeaderText(PinResources.$L("Fixed dialing is enabled"));
						this.$.oldPin.setContent(PinResources.$L("Enter PUK2 to reset PIN2"));
						this.showOldPin();
						this.pinAction = PinAction.PUK2_Enter; 	
					}
					break; 
					
				case PinAction.PUK2_ConfirmPin:
					this.pinAction = PinAction.PUK2_Enter;  
					this.setUI();
					break;					
					
				default:
					this.error("PinAction "+this.pinAction+ " is not handled in button pressing");  
					this.setDefault();
					break; 					
			}
			this.pinError = false;
		}
		
		this.pincode = this.pincode + value;
		if (this.pincode) {
			var pinCodeMaxLength = 8;
			if (this.pinAction == PinAction.deviceLockUnlock) {
				pinCodeMaxLength = 16;
			}
			if (this.pincode.length <= pinCodeMaxLength) {
				this.pincodeDisplay = this.pincodeDisplay + ".";
				this.$.oldPin.setContent(this.pincodeDisplay);
			}
		}
	},
	
	HandleBackspace: function () {
		if (this.pincode.length > 0) {
			var strTemp = this.pincode.slice(0, this.pincode.length - 1);
			this.pincode = strTemp;
			strTemp = this.pincodeDisplay.slice(0, this.pincodeDisplay.length - 1);
			this.pincodeDisplay = strTemp;
			this.$.oldPin.setContent(this.pincodeDisplay);
			if(this.pincode.length == 0)
			{
			    this.setUI();
			}
		}
	}, 
	
	HandleClear: function() {
		this.pincode = this.pincodeDisplay = ""; 
		//this.$.pinlabel.setContent(this.pincodeDisplay);
	}, 

	/*EmergencyCall: function(){
		enyo.application.UI.event('dial',{'emergencyFill': true});
	},*/
	
	/*StartOverCall: function(){                                                                                
	    this.doStartOver();                                         
	},*/ 
        UseWifiCall: function(){
            this.doPinCodeDone("usewifi");
        },
	
	setDefault: function(pin2) {
	        this.$.pin.setContent(""); 
		this.$.pin.setContent(PinResources.$L({key:"notEASPIN", value: "Enter PIN"})); 
		if (pin2 == true) {
			this.$.pin.setContent(PinResources.$L("Enter PIN2"));
		}
		this.hideOldPin(); 
		this.clearData();
	},	

	setUI: function(){
		this.setDefault();

		switch (this.pinAction){
			case PinAction.PinCode_Change:
				this.$.oldPin.setContent(PinResources.$L("Enter old PIN"));
				this.showOldPin(); 
			break; 

			case PinAction.PinCode_ChangeNew:
			case PinAction.PUK_NewPin:
				this.setHeaderText(PinResources.$L("Enter new PIN")); 
				this.$.oldPin.setContent(PinResources.$L("Enter 4-8 numbers for new PIN")); 
				this.showOldPin(); 
			break; 

			case PinAction.PinCode_ChangeConfirm: 
			case PinAction.PUK_ConfirmPin:
				this.setHeaderText(PinResources.$L("Confirm new PIN"));
				this.$.oldPin.setContent(PinResources.$L("Enter 4-8 numbers for new PIN"));
				this.showOldPin(); 
			break; 

			case PinAction.Pin2_Enable:		
			case PinAction.Pin2_Verify:
			case PinAction.Pin2_Disable:				
				this.setHeaderText(PinResources.$L("Enter PIN2"));
			break; 			
			 
			case PinAction.Fdn_Verify:
			case PinAction.Fdn_Disable:
				this.setHeaderText(PinResources.$L("Fixed dialing is enabled"));
				this.$.oldPin.setContent(PinResources.$L("Enter PIN2"));
				this.showOldPin();
			break; 

			case PinAction.Pin2_Change:
				this.setHeaderText(PinResources.$L("Enter PIN2")); 
				this.$.oldPin.setContent(PinResources.$L("Enter old PIN2"));
				this.showOldPin();
			break; 

			case PinAction.Pin2_ChangeNew: 
			case PinAction.PUK2_NewPin:
				this.setHeaderText(PinResources.$L("Enter New PIN2")); 
				this.$.oldPin.setContent(PinResources.$L("Enter 4-8 numbers for new PIN2"));
				this.showOldPin();
			break; 

			case PinAction.Pin2_ChangeConfirm:
			case PinAction.PUK2_ConfirmPin:
				this.setHeaderText(PinResources.$L("Confirm new PIN2"));
				this.$.oldPin.setContent(PinResources.$L("Enter 4-8 numbers for new PIN2"));
				this.showOldPin();
			break; 

			case PinAction.PUK_Enter:
				this.setHeaderText(PinResources.$L("Enter PUK"));
				this.$.oldPin.setContent(PinResources.$L("Enter PUK to reset PIN")); 
				this.showOldPin();
			break; 

			case PinAction.PUK2_Enter:
				this.setHeaderText(PinResources.$L("Enter PUK2")); 
				this.$.oldPin.setContent(PinResources.$L("Enter PUK2 to reset PIN2")); 
				this.showOldPin();
			break; 

			case PinAction.SimLocked:
				this.setHeaderText(PinResources.$L("Contact carrier for new SIM")); 
				this.$.oldPin.setContent("");
			break;
			
			case PinAction.PinCode_Verify:
				this.setHeaderText(PinResources.$L("SIM Card Locked")); 
				this.$.oldPin.setContent(PinResources.$L({key: "notEASPIN", value: "Enter PIN"})); 
				this.showOldPin();						
			break; 
			
			case PinAction.deviceLockUnlock:
				if (this.unblock == true) {
					this.setHeaderText(PinResources.$L("Enter Unblock Code"));
					this.$.oldPin.setContent(PinResources.$L("Contact your carrier for the unblock code")); 
				}
				else {
					this.setHeaderText(PinResources.$L("Enter Network Unlock Code"));
					this.$.oldPin.setContent(PinResources.$L("Contact your carrier for the unlock code")); 
				}
				this.showOldPin();
			break; 			

			case PinAction.PinCode_Lock:
			case PinAction.PinCode_UnLock:
			break;

			default:
			break; 
		}

	}, 

	DonePinCode: function() {
		var param;
                this.log("fu-sim: DonePinCode "+this.pinAction);
		switch (this.pinAction) {
			case PinAction.PinCode_Lock: // lock
				this.$.telService.call({
					"pin": this.pincode
				},{
					method: "pin1Enable",
					onSuccess: "PinEnableDisableResponse",
					onFailure: "PinEnableDisableResponse"
				});
			break;
			
			case PinAction.PinCode_UnLock: //unlock
				this.$.telService.call({
					"pin": this.pincode
				},{
					method: "pin1Disable",
					onSuccess: "PinEnableDisableResponse",
					onFailure: "PinEnableDisableResponse"
				});
			break;
			
			case PinAction.PinCode_Change: //pin1 change
				this.savedPin = this.pincode;
				this.pinAction = PinAction.PinCode_ChangeNew; 
				this.clearData();
				this.setUI();
			break;
			
			case PinAction.PinCode_ChangeNew: //changeNew
				this.newpin = this.pincode;
				this.pinAction = PinAction.PinCode_ChangeConfirm;
				this.clearData();
				this.setUI();
			break;
			
			case PinAction.PinCode_ChangeConfirm://changeConfirm 
				param = {
					'oldPin': this.savedPin,
					'newPin': this.newpin,
					'newPinConfirm': this.pincode
				};
				this.$.telService.call(param, {
					method: "pin1Change",
					onSuccess: "PinChangeResponse",
					onFailure: "PinChangeResponse"
				});
			break;
			
			case PinAction.Pin2_Enable: 
				if (this.pincode != "") {
					this.$.telService.call({
						"pin2": this.pincode
					},{
						method: "fdnEnable",
						onSuccess: "fdnEnableDisableResponse",
						onFailure: "fdnEnableDisableResponse"
					});
				}
			break;

			case PinAction.Fdn_Disable:
			case PinAction.Pin2_Disable: 
				if (this.pincode != "") {
					this.$.telService.call({
						"pin2": this.pincode
					},{
						method: "fdnDisable",
						onSuccess: "fdnEnableDisableResponse",
						onFailure: "fdnEnableDisableResponse"
					});
				}
			break;

			case PinAction.Pin2_Verify: 
			case PinAction.Fdn_Verify:
				if (this.pincode != "") {
					this.$.telService.call({
						"pin": this.pincode
					},{
						method: "pin2Verify",
						onSuccess: "pin2VerifyResponse",
						onFailure: "pin2VerifyResponse"
					});
				}
			break;

			case PinAction.PUK_Enter:
				if (this.pincode != "") {
					this.PUK = this.pincode;
					this.pinAction = PinAction.PUK_NewPin;
					this.clearData();
					this.setUI();
				}
			break;

			case PinAction.PUK_NewPin:
				if (this.pincode != "") {
					this.newpin = this.pincode;
					this.pinAction = PinAction.PUK_ConfirmPin;
					this.clearData();
					this.setUI();
				}
			break;

			case PinAction.PUK_ConfirmPin:
				if (this.pincode != "") {
					param = {
						"puk": this.PUK,
						"newPin": this.newpin,
						"newPinConfirm": this.pincode
					};
					this.$.telService.call(param, {
						method: "pin1Unblock",
						onSuccess: "pinResetResponse",
						onFailure: "pinResetResponse"
					});
				}
			break;

			case PinAction.Pin2_Change: //x
				if (this.pincode != "") {
					this.savedPin = this.pincode;
					this.clearData();
					this.pinAction = PinAction.Pin2_ChangeNew;
					this.setUI();
				}
			break;

			case PinAction.Pin2_ChangeNew: //x
				if (this.pincode != "") {
					this.newpin2 = this.pincode;
					this.clearData();
					this.pinAction = PinAction.Pin2_ChangeConfirm;
					this.setUI(); 
				}
			break;

			case PinAction.Pin2_ChangeConfirm: //x
				if (this.pincode != "") {
					param = {
						"oldPin": this.savedPin,
						"newPin": this.newpin2,
						"newPinConfirm": this.pincode
					};
					this.$.telService.call(param, {
						method: "pin2Change",
						onSuccess: "pin2ChangeResponse",
						onFailure: "pin2ChangeResponse"
					});
				}
			break;

			case PinAction.PUK2_Enter:
				if (this.pincode != "") {
					this.PUK2 = this.pincode;
					this.pinAction = PinAction.PUK2_NewPin;
					this.clearData();
					this.setUI();
				}
			break;

			case PinAction.PUK2_NewPin:
				if (this.pincode != "") {
					this.newpin2 = this.pincode;
					this.pinAction = PinAction.PUK2_ConfirmPin;
					this.clearData();
					this.setUI();
				}
			break;

			case PinAction.PUK2_ConfirmPin:
				if (this.pincode != "") {
					param = {
						"puk2": this.PUK2,
						"newPin2": this.newpin2,
						"newPinConfirm": this.pincode
					};
					this.$.telService.call(param, {
						method: "pin2Unblock",
						onSuccess: "pin2ResetResponse",
						onFailure: "pin2ResetResponse"
					});
				}
			break;
			
			case PinAction.PinCode_Verify:
			        //this.log("fu-sim: code-verify "+ this.pincode);
				if (this.pincode != "") {
					param = {
						"pin": this.pincode
					};
					this.$.telService.call(param, {
						method: "pin1Verify",
						onSuccess: "pin1VerifyResponse",
						onFailure: "pin1VerifyResponse"
					});
				}			
			break; 
			
			case PinAction.deviceLockUnlock:
				if (this.pincode != "") {
					param = {
						'type': this.locktype,
						'key': this.pincode,
						'unblock': this.unblock
					}
					this.$.telService.call(param, {
						method: "deviceLockUnlock",
						onSuccess: "DeviceLockUnlockResponse",
						onFailure: "DeviceLockUnlockResponse"
					});
				}	
			break; 

			case PinAction.SimLocked:
			case PinAction.Exit:
				console.log("sim is locked");
				this.doneClick();
			break;

			default:
				//todo: any other conditions??
				this.error("NOT HANDLED: " + this.pinAction);
			break; 
		}
	},

	clearData: function() {
		this.pincode = "";
		this.pincodeDisplay = ""; 	
		//this.$.pinlabel.setContent(this.pincodeDisplay);
	},

	setHeaderText: function(caption) { 
		this.$.pin.setContent(caption); 
	},
	
	setSubText: function(caption) { 
		this.$.oldPin.setContent(caption);
	},
	
	formatRetriesMsg: function(inRetriesNum) {
		return enyo.application.Utils.formatChoice(PinResources.$L("1#1 retry remaining|##{tries} retries remaining"), inRetriesNum, {tries: inRetriesNum});
	},

	showOldPin: function() {
		this.$.oldPin.show(); 
	},

	hideOldPin: function() {
		this.$.oldPin.setContent(" "); 
	},

	//Lock/UnLock SIM card
	PinEnableDisableResponse: function(inSender, response){
this.log(enyo.json.to(response));				 
		if (response.returnValue){
			if (this.pinAction == PinAction.PinCode_Lock){
				PinStatus.PinLocked = true; 
			}else if (this.pinAction == PinAction.PinCode_UnLock){
				PinStatus.PinLocked = false; 
				enyo.windows.addBannerMessage(PinResources.$L("PIN Disabled"), "{}");
			}else{
				this.log("unknown action: "+this.pinAction);
			}
			this.doneClick();
		}else{
			this.error(enyo.json.to(response));
			this.pinError = true; 
			var msg = "";
			if (this.pinAction == PinAction.PinCode_Lock){
				PinStatus.PinLocked = false; 
			}else if (this.pinAction == PinAction.PinCode_UnLock){
				PinStatus.PinLocked = true; 
			}else{
				this.log("unknown action: "+this.pinAction);
			}			
			switch (response.errorCode){
				case 2:					
					this.setHeaderText(PinResources.$L("PIN incorrect"));
					msg = enyo.application.Messages.enablePinError[response.errorCode].toString();//PinResources.$L("Unable to change PIN status: bad format."); 
					
					if (response.extended && response.extended.attemptsRemaining !== undefined){
						msg = this.formatRetriesMsg(response.extended.attemptsRemaining);
					}
					this.$.oldPin.setContent(msg); 
					this.$.oldPin.show(); 
					break;

				case 3:
					this.setHeaderText(PinResources.$L("PIN incorrect"));
					this.$.oldPin.setContent(PinResources.$L("Contact carrier for PUK code")); 					
					this.$.oldPin.show();
					this.pinAction = PinAction.PUK_Enter;
					PinStatus.Pukrequired = true; 
					break; 

				case 4:
					this.pinAction = PinAction.SimLocked; 
					PinStatus.SimLocked = true; 
					this.setUI(); 
					break; 

				default:
					this.setHeaderText(PinResources.$L("PIN incorrect"));
					msg = enyo.application.Messages.enablePinError[0].toString();//PinResources.$L("Unable to change PIN status.");
					this.$.oldPin.setContent(msg); 
					this.$.oldPin.show(); 					 
					break; 
			}
			this.clearData();
		}		
	}, 

	//Change SIM Card PIN
	PinChangeResponse: function(inSender, response){ 
this.log(enyo.json.to(response));
		if (response.returnValue){
			enyo.windows.addBannerMessage(PinResources.$L("PIN Changed"), "{}");
			this.doneClick();
		}else{
			this.error(enyo.json.to(response));
			this.pinError = true;
			var msg = "";
			switch (response.errorCode){
				case 2:
					this.$.pin.setContent(PinResources.$L("PIN incorrect")); 
					if (response.extended && response.extended.attemptsRemaining !== undefined) {
						msg = this.formatRetriesMsg(response.extended.attemptsRemaining);
					}
					else {
						msg = enyo.application.Messages.pinChangeError[response.errorCode].toString();
					} 
					this.$.oldPin.setContent(msg); 
					this.$.oldPin.show(); 
					this.pinAction = PinAction.PinCode_Change;
					break;

				case 3:
					this.$.pin.setContent(PinResources.$L("PIN incorrect"));
					this.$.oldPin.setContent(PinResources.$L("Contact carrier for PUK code")); 
					this.$.oldPin.show();
					this.pinAction = PinAction.PUK_Enter; 	
					PinStatus.Pukrequired = true; 					
					break; 

				case 4:
					this.pinAction = PinAction.SimLocked; 
					PinStatus.SimLocked = true; 
					this.setUI(); 
					break; 

				case 5:
					msg = enyo.application.Messages.pinChangeError[response.errorCode].toString();
					this.$.oldPin.setContent(msg); 
					this.pinAction = PinAction.Exit; 
					break; 

				case 6: //Pins don't match
					this.$.pin.setContent(PinResources.$L("Enter new PIN")); 
					msg = PinResources.$L("PIN doesn't match");
					this.$.oldPin.setContent(msg); 
					this.$.oldPin.show(); 
					this.pinAction = PinAction.PinCode_ChangeNew; 
					break; 

				default:
					this.setHeaderText(PinResources.$L("PIN incorrect"));
					msg = enyo.application.Messages.pinChangeError[0].toString();//PinResources.$L("Unable to change PIN status.");
					this.$.oldPin.setContent(msg); 
					this.$.oldPin.show(); 
					break;
			}
			this.clearData();
		}
	},

	pin2ChangeResponse: function(inSender, response){ 
this.log(enyo.json.to(response));			
		if (response.returnValue) {
			enyo.windows.addBannerMessage(PinResources.$L("PIN2 Changed"), "{}");
			this.doneClick();
		}else{
			this.error(enyo.json.to(response));
			this.pinError = true;
			var msg = "";
			switch (response.errorCode){
				case 2:
					this.$.pin.setContent(PinResources.$L("PIN2 incorrect")); 
					if (response.extended && response.extended.attemptsRemaining !== undefined){
						msg = this.formatRetriesMsg(response.extended.attemptsRemaining);
					} else {
						msg = enyo.application.Messages.pinChangeError[response.errorCode].toString();
					}
					this.$.oldPin.setContent(msg); 
					this.$.oldPin.show(); 
					this.pinAction = PinAction.Pin2_Change; 
					break;

				case 3:					
					this.setHeaderText(PinResources.$L("PIN incorrect"));
					this.$.oldPin.setContent(PinResources.$L("Contact carrier for PUK2 code")); 
					this.$.oldPin.show();					
					PinStatus.Puk2required = true; 					
					break; 

				case 4:
					this.pinAction = PinAction.SimLocked; 
					PinStatus.SimLocked = true; 
					this.setUI(); 
					break; 

				case 5:
					msg = PinResources.$L("Unable to change PIN2: enable PIN2 first.");
					this.$.oldPin.setContent(msg); 
					this.pinAction = PinAction.Exit; 
					break; 

				case 6: //Pins don't match					
					this.$.pin.setContent(PinResources.$L("Enter new PIN2")); 
					msg = PinResources.$L("PIN doesn't match");
					this.$.oldPin.setContent(msg); 
					this.$.oldPin.show(); 
					this.pinAction = PinAction.Pin2_changeNew; 
					break; 

				default:
					this.$.pin.setContent(PinResources.$L("PIN2 incorrect"));
					this.$.oldPin.setContent(PinResources.$L("Unable to Change PIN2")); 
					this.pinAction = PinAction.Pin2_Change;
					break; 
					
			}
			this.clearData();
		}
	},


	fdnEnableDisableResponse: function(inSender, response){ 
this.log(enyo.json.to(response)); //temp enable the log fro CFISH-797
		if (response.returnValue){
			if (this.pinAction == PinAction.Pin2_Enable){
				PinStatus.FdnEnabled = true; 
			}else if (this.pinAction == PinAction.Pin2_Disable || this.pinAction == PinAction.Fdn_Disable){
				PinStatus.FdnEnabled = false; 
			}else{
				this.error("unknown action: "+this.pinAction);
			}
			this.doneClick();
		}else{
			this.error(enyo.json.to(response));
			this.pinError = true;
			var msg = ""; 
			if (this.pinAction == PinAction.Pin2_Enable){
				this.error("fdnenable error "+response.errorCode);			
			}else if (this.pinAction == PinAction.Pin2_Disable || this.pinAction == PinAction.Fdn_Disable){
				this.error("fdnDisable error "+response.errorCode);
			}else{
				this.error("unknown action: "+this.pinAction + " errorcode "+response.errorCode);
			}
			switch (response.errorCode){
				case 2:
					this.$.pin.setContent(PinResources.$L("PIN incorrect"));
					msg = enyo.application.Messages.fdnEnableError[response.errorCode].toString();//PinResources.$L("Unable to change PIN status: PUK locked."); 

					if (response.extended && response.extended.attemptsRemaining !== undefined){
						msg = this.formatRetriesMsg(response.extended.attemptsRemaining);
					}
					this.$.oldPin.setContent(msg); 
					this.$.oldPin.show(); 
					break;

				case 3:					
					this.setHeaderText(PinResources.$L("PIN incorrect"));
					this.$.oldPin.setContent(PinResources.$L("Contact carrier for PUK2 code")); 
					this.$.oldPin.show();
					this.pinAction = PinAction.PUK2_Enter;
					PinStatus.Puk2required = true; 
					break; 					

				case 4:
					this.pinAction = PinAction.SimLocked; 
					PinStatus.SimLocked = true; 
					this.setUI(); 
					break; 

				default:
					//this is a workaround for TIL side issue. Sometimes PIN2 query response and  
					//fdn status response get out of sync.  Trying to change the fdn status would
					//cause wired error and time out.  So puk status   
					if (PinStatus.Puk2required == true) {
						this.setHeaderText(PinResources.$L("PIN incorrect"));
						this.$.oldPin.setContent(PinResources.$L("Contact carrier for PUK2 code")); 
						this.$.oldPin.show();					
						
						this.pinAction = PinAction.PUK2_Enter;
						PinStatus.Puk2required = true; 					
					}
					else {
						this.setHeaderText(PinResources.$L("PIN incorrect"));
						msg = enyo.application.Messages.fdnEnableError[0].toString();//PinResources.$L("Unable to change PIN status.");
						this.$.oldPin.setContent(msg);
						this.$.oldPin.show();
					} 
					break; 
			}
			this.clearData();
		}
	},

	pin2VerifyResponse: function(inSender, response){
this.log(enyo.json.to(response));
		if (response.returnValue){
			this.doneClick(); 
		}else{
			this.error(enyo.json.to(response));
			this.pinError = true;
			var msg = "";							
			switch (response.errorCode){
				case 2:
					this.$.pin.setContent(PinResources.$L("PIN2 incorrect")); 
					msg = enyo.application.Messages.pin2VerifyError[response.errorCode].toString();//PinResources.$L("Unable to change PIN status."); 		

					if (response.extended && response.extended.attemptsRemaining !== undefined){
						msg = this.formatRetriesMsg(response.extended.attemptsRemaining);
					}
					this.$.oldPin.setContent(msg); 
					this.$.oldPin.show(); 
					this.pinAction = PinAction.Pin2_Verify; 
					break;

				case 3:					
					this.setHeaderText(PinResources.$L("PIN incorrect"));
					this.$.oldPin.setContent(PinResources.$L("Contact carrier for PUK2 code")); 
					this.$.oldPin.show();
					this.pinAction = PinAction.PUK2_Enter;
					PinStatus.Puk2required = true; 
					break; 						

				case 4:
					this.pinAction = PinAction.SimLocked; 
					PinStatus.SimLocked = true; 
					this.setUI(); 
					break; 

				default:
					this.setHeaderText(PinResources.$L("PIN incorrect"));
					msg = enyo.application.Messages.pin2VerifyError[0].toString(); 		
					this.$.oldPin.setContent(msg); 
					this.$.oldPin.show(); 					
					break; 
			}
			this.clearData();
		}
	},

	pinResetResponse: function(inSender, response){
this.log(enyo.json.to(response));		
		if (response.returnValue){
			enyo.windows.addBannerMessage(PinResources.$L("PIN Changed"), "{}");
			this.doneClick();
		}else{
			this.error(enyo.json.to(response));
			this.pinError = true;
			var msg = ""; 
			switch (response.errorCode){
				case 2:
					this.$.pin.setContent(PinResources.$L("PUK incorrect"));
					//PinResources.$L("Unable to unlock PUK: bad or incorrect PUK");  
					msg = enyo.application.Messages.pukUnlockError[response.errorCode].toString(); 	
					this.$.oldPin.setContent(msg); 
					this.$.oldPin.show(); 
					this.pinAction = PinAction.PUK_Enter; 				
					PinStatus.Pukrequired = true; 
					break;

				case 3: //bad pin format
					this.$.pin.setContent(PinResources.$L("PUK incorrect"));
					if (response.extended && response.extended.attemptsRemaining !== undefined){
						msg = this.formatRetriesMsg(response.extended.attemptsRemaining);
					} else {
						msg = PinResources.$L("Invalid PIN"); 
					}
					this.$.oldPin.setContent(msg); 
					this.$.oldPin.show(); 
					this.pinAction = PinAction.PUK_Enter;
					PinStatus.Pukrequired = true;
					break; 

				case 4:
					this.pinAction = PinAction.SimLocked; 
					PinStatus.SimLocked = true; 
					this.setUI(); 
					break; 

				case 5:
					this.$.pin.setContent(PinResources.$L("Enter new PIN")); 
					PinStatus.Pukrequired = response.extended && response.extended.pukrequired;							
					msg = PinResources.$L("PIN doesn't match");
					this.$.oldPin.setContent(msg); 
					this.$.oldPin.show(); 
					this.pinAction = PinAction.PUK_NewPin; 
					break; 					

				default:
					this.setHeaderText(PinResources.$L("PIN incorrect"));
					msg = enyo.application.Messages.pukUnlockError[0].toString(); 	
					this.$.oldPin.setContent(msg); 
					this.$.oldPin.show(); 
					break;  
			}
			this.clearData();
		}
	},

	pin2ResetResponse: function(inSender, response){
this.log(enyo.json.to(response));				
		if (response.returnValue){
			enyo.windows.addBannerMessage(PinResources.$L("PIN2 Changed"), "{}");			
			this.doneClick();
		}else{
			this.error(enyo.json.to(response));
			var msg = "";
			switch (response.errorCode){
				case 2:
					this.$.pin.setContent(PinResources.$L("PUK2 incorrect"));
					msg = PinResources.$L("Unable to unlock PUK2: bad or incorrect PUK2.");  
					this.$.oldPin.setContent(msg); 
					this.$.oldPin.show(); 	
					this.pinError = true;			
					PinStatus.Puk2required = true; 
					break;

				case 3: //bad pin format				
					this.$.pin.setContent(PinResources.$L("PUK2 incorrect"));
					if (response.extended && response.extended.attemptsRemaining !== undefined){
						msg = this.formatRetriesMsg(response.extended.attemptsRemaining);
					} else {
						msg = PinResources.$L("Invalid PIN"); 
					}
					this.$.oldPin.setContent(msg); 
					this.$.oldPin.show();
					this.pinError = true;
					PinStatus.Puk2required = true;
					break; 					

				case 4:
					this.pinAction = PinAction.SimLocked; 
					PinStatus.SimLocked = true; 
					this.setUI(); 
					break; 

				case 5:					
					this.$.pin.setContent(PinResources.$L("Enter new PIN")); 
					PinStatus.Puk2required = true;							
					msg = PinResources.$L("PIN doesn't match");
					this.$.oldPin.setContent(msg); 
					this.$.oldPin.show(); 
					this.pinAction = PinAction.PUK2_NewPin; 
					break; 					

				default:
					this.setHeaderText(PinResources.$L("PIN incorrect"));
					this.pinAction = PinAction.PUK2_Enter;
					msg = enyo.application.Messages.pukUnlockError[0].toString(); 
					this.$.oldPin.setContent(msg); 
					this.$.oldPin.show(); 							
					break;  
			}
			this.clearData();
		}
	},
	
	pin1VerifyResponse: function(inSender, response){
//this.log(enyo.json.to(response));
		if (response.returnValue){
		        this.log("fu-sim: pin1VerifyResponse-sucess");
			this.doneClick(); 
		}else{
			//this.error(enyo.json.to(response));
			this.pinError = true;
			var msg = "";				
			this.log("fu-sim: pin1VerifyResponse-fail - " + response.errorCode);
			switch (response.errorCode){
				case 2:
				        this.$.pin.setContent(""); 
					this.$.pin.setContent(PinResources.$L("PIN incorrect"));
					msg = PinResources.$L("Unable to verify PIN: bad format."); 		

					if (response.extended && response.extended.attemptsRemaining !== undefined){
						//msg = this.formatRetriesMsg(response.extended.attemptsRemaining);
						if(response.extended.attemptsRemaining == 1){
							this.doPinCodeDone("maxretries"); 
						}
						   
						this.$.oldPin.setContent((response.extended.attemptsRemaining-1) +PinResources.$L(" Try Remaining"));                                           
						this.$.oldPin.show();
					}
					//this.$.oldPin.setContent(msg); 
					//this.$.oldPin.show(); 
					this.pinAction = PinAction.PinCode_Verify; 
					break;

				case 3:					
				        this.doPinCodeDone("simlockpuk"); 
					/*this.setHeaderText(PinResources.$L("PIN incorrect"));
					this.$.oldPin.setContent(PinResources.$L("Contact carrier for PUK code")); 
					this.$.oldPin.show();
					this.pinAction = PinAction.PUK_Enter;
					PinStatus.Pukrequired = true; */
					break; 

				case 4:
					/*this.pinAction = PinAction.SimLocked; 
					PinStatus.SimLocked = true; 
					this.setUI(); 
					break; */

				default:
				        /*this.doPinCodeDone("pin2fail");
					this.setHeaderText(PinResources.$L("PIN incorrect"));
					msg = PinResources.$L("Unable to verify PIN2."); 		
					break; */
					this.doPinCodeDone("simlockperm");
                                        break;
					
			}
			this.clearData();
		}
	},	

	
	DeviceLockUnlockResponse: function(inSender, response) {
		this.log(enyo.json.to(response));
		if (response.returnValue){
			this.doneClick(); 
		}else{
			switch (response.errorCode){
				case 1:
					this.log("power is off"); 
					break; 

				default:
					this.$.pin.setContent(PinResources.$L("Please try again.")); 
					break; 
			}
			this.clearData();
		}
		
	},
	
	doneClick: function(){		
		var params;		
		this.doPinCodeDone("success");
		this.log("fu-sim: doneClick");
		//enyo.application.UI.event("back");  
		/*if (this.nextState) { //we were launched externally by other app or from pin status change
			params = {
				nextState: this.nextState, 
				nextView: this.nextView 
			}
			enyo.application.UI.event("backtoState", params);

		} else if (this.nextView){
			this.doRefreshCard(); 
			params = {
				"launchType": this.nextView
			}
			this.log(params);			
			if (this.nextView === 'dialer') {
				if (enyo.application.Cache.lastattemptednumber != undefined) 
					enyo.application.CallSynergizer.dial(enyo.application.Cache.lastattemptednumber);
			} else {
				enyo.application.UI.event("changeView", params);
			}
		} else {
			enyo.application.UI.event("back");
		}*/
		return true; 
	}
});
