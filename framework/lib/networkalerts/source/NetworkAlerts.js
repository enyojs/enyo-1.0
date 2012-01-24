/**
A component that manages various wireless network pop up alerts. An App can make use of this component to show the alert.
The main purpose of this library is to avoid duplicating the code in every app that wants to show the same pop up alerts for Turning on WiFi, Bluetooth etc

Usage:
-----
 Depends:
 --------
 	Add this line to your app's depends.js file:
 	"$enyo-lib/networkalerts/"

 Kind:
 -----
 	{kind: "NetworkAlerts", onTap: "onTapHandlerFn"}
 
 Public API:
 -----------
 	push() - Show the alert. The type of the alert should be passed in. 
    	params : {type: <<"Data", "Voice", "Bluetooth">>}
    
 	cancel() - Cancel the alert. 
 
 Event:
 ------
     onTap: This event will be fired when user taps on the button with the following response object.
     
     For type:"Data",
     	inResponse: {response: <<"WiFi-UserCancelled", "WiFi-Error", "WiFi-Enabled", "WiFi-Connected", "WiFi-StartingUp">>
     For type: "Voice"
     	inResponse: {response: <<"PhoneNetwork-UserCancelled", "PhoneNetwork-StartingUp">>}
     For type: "Bluetooth"
     	inResponse: {response: <<"BT-On", "BT-Error", "BT-StatingUp", "BT-UserCancelled">>}
*/

enyo.kind({
	name: "NetworkAlerts",
	kind: "Component",
	events: {
				onTap:""
	},
	components: [
	             {kind:"PalmService", name:"sysService", service:"palm://com.palm.systemservice/"},
	             {kind:"PalmService", name:"wifiService", service:"palm://com.palm.wifi/"},
	             {kind:"PalmService", name:"telephonyService", service:"palm://com.palm.telephony/"},
	             {kind:"PalmService", name:"btService", service:"palm://com.palm.btmonitor/monitor/"},
	],
	
	create: function() {
		this.inherited(arguments);
		this.params = {};
		this.currentActiveWindow = null;
		this.handleMessageHitched = enyo.hitch(this, "handleMessage");
	},
	
	alertWindowClosed: function() {
		this.currentActiveWindow = null;
	},
	
	push: function(params) {
		window.addEventListener('message', this.handleMessageHitched);
		this.params = params || {};
		this.showAlert();
	},
	
	cancel: function() {
		if(this.currentActiveWindow) {
			this.currentActiveWindow.close();
			this.currentActiveWindow = null;
		}
		this.cleanup();
	},
	
	cleanup: function() {
		window.removeEventListener('message', this.handleMessageHitched);
		this.currentActiveWindow = null;
	},
	
	showAlert: function() {
		
		if(!this.params.type) {
			this.log("NetworkAlerts - Connection Type Parameter Missing");			
			return;			
		}
		
		if(this.params.type.toLowerCase() === 'data') {
			var devInfo = enyo.fetchDeviceInfo();
			if(!devInfo || !devInfo.wifiAvailable) {
				this.sendResponse("WiFi-UserCancelled");
				return;
			}
			//Check to see if the Data alert was shown in last 30 minutes. if so, do not show again. .
			this.$.sysService.call({"keys":["lastDataAlertTimestamp"]}, {method:"getPreferences", onSuccess:"handleTimestamp"});
		}
		else if (this.params.type.toLowerCase() === 'voice') {
			this.showVoiceAlert();
		}
		else if (this.params.type.toLowerCase() === 'bluetooth') {
			//Check if Bluetooth is available
			var devInfo = enyo.fetchDeviceInfo();
			if(!devInfo || !devInfo.bluetoothAvailable) {
				this.sendResponse("BT-UserCancelled");
				return;
			}
			this.showBTAlert();
		}
		else 
			this.sendError("Undefined Connection Type!");		
	},
	
	handleTimestamp: function(inSender, inResponse) {
		if(!inResponse || inResponse.lastDataAlertTimestamp == undefined) {
			this.showDataAlert();
			return;
		}
		
		var lastTimestamp = inResponse.lastDataAlertTimestamp;
		var currTime = Math.ceil(new Date().getTime() / (1000 * 60));
		var diff = Math.ceil(currTime - lastTimestamp); 
		
		if(diff > 30) 
			this.showDataAlert();
		else
			this.sendResponse("WiFi-UserCancelled");
	},
	
	showDataAlert: function() {
		//Check the WiFi Status
		this.$.wifiService.call({}, {method:"getstatus", onSuccess:"handleWiFiStatus"});
	},
	
	handleWiFiStatus: function(inSender, inResponse) {
		
		if(inResponse.returnValue && !inResponse.returnValue) {
			this.sendResponse("WiFi-Error!");
			return;
		}
		
		if(!inResponse.status) {
			this.sendResponse("WiFi-Error!");
			return;
		}
		
		if(inResponse.status === 'serviceEnabled') {
			this.sendResponse("WiFi-Enabled");
			return;
		}
		else if(inResponse.status === 'connectionStateChanged') {
			this.sendResponse("WiFi-Connected");
			return;
		}
		else if(inResponse.status === 'serviceDisabled') {
			this.showWiFiAlert();
		}
		else {
			this.log("NetworkAlerts - Handle Other WiFi Status Notifications"+ inResponse.status);
		}				
			
	},
	
	showWiFiAlert: function() {
		var wCard = enyo.windows.fetchWindow("NetworkAlerts-WiFi-Alert");
		var windowHeight =  (enyo.g11n.currentLocale().locale == "en_us") ? 180 : 210;
		if(!wCard)
			this.currentActiveWindow = enyo.windows.openPopup(enyo.path.rewrite("$enyo-lib/networkalerts/source/networkalerts.html"), "NetworkAlerts-WiFi-Alert", {}, undefined, windowHeight);
	},
	
	showVoiceAlert: function() {
		this.$.sysService.call({"keys":["airplaneMode"]}, {method:"getPreferences", onSuccess:"handleTelephonyPowerQuery"});
	},
	
	handleTelephonyPowerQuery: function(inSender, inResponse) {
		if(inResponse.airplaneMode != undefined) {		
			if (inResponse.airplaneMode === false) {
				this.isManualSelectionOn();
			}			
			else {
				this.showFlightModeAlert();				
			}													
		}
		else {
			this.sendResponse("Telephony-Returned Error");
		}
	},
	
	showFlightModeAlert: function() {
		var windowHeight =  (enyo.g11n.currentLocale().locale == "en_us") ? 180 : 210;
		var wCard = enyo.windows.fetchWindow("NetworkAlerts-FlightMode-Alert");
		if(!wCard)
			this.currentActiveWindow = enyo.windows.openPopup(enyo.path.rewrite("$enyo-lib/networkalerts/source/networkalerts.html"), "NetworkAlerts-FlightMode-Alert", {}, undefined, windowHeight);
	},
	
	isManualSelectionOn: function() {
		this.$.telephonyService.call({},{method: 'platformQuery', onSuccess:"handlePlatformQuery"});
	},
	
	handlePlatformQuery: function(inSender, inResponse) {
		if (inResponse.extended && inResponse.extended.platformType) {
			if(inResponse.extended.platformType === 'gsm') 	
				this.$.telephonyService.call({},{method: 'networkSelectionModeQuery', onSuccess:"handleNetworkSelectionModeQuery"});
			else
				this.sendResponse("PhoneNetwork-Manual Selection Not Supported");
		}
	},
	
	handleNetworkSelectionModeQuery: function(inSender, inResponse) {
		
		if (inResponse.returnValue != undefined && inResponse.returnValue) {
			if(inResponse.automatic === false)
				this.showManualNetworkAlert();
			else
				this.sendResponse("PhoneNetwork-Manual Selection Not Selected");
		}	
	},
	
	showManualNetworkAlert: function() {	
		var windowHeight =  (enyo.g11n.currentLocale().locale == "en_us") ? 185 : 215;
		var wCard = enyo.windows.fetchWindow("NetworkAlerts-ManualNetwork-Alert");
		if(!wCard)
			this.currentActiveWindow = enyo.windows.openPopup(enyo.path.rewrite("$enyo-lib/networkalerts/source/networkalerts.html"), "NetworkAlerts-ManualNetwork-Alert", {}, undefined, windowHeight);
	},	
	
	showBTAlert: function() {
		//Check the Bluetooth Status
		this.$.btService.call({}, {method:"getradiostate", onSuccess:"handleBTStatus"});
	},
	
	handleBTStatus: function(inSender, inResponse) {
		
		if(!inResponse) {
			this.sendResponse("BT-Error");
			return;
		}
		
		if(inResponse.returnValue) {
			if(inResponse.radio === "on") {
				this.sendResponse("BT-On");
			}
			else if(inResponse.radio === "turningon") {
				this.sendResponse("BT-StartingUp");
			}
			else 
				this.showBTRadioAlert();
		}
		else {
			this.sendResponse("BT-Error");
		}	
	},
	
	showBTRadioAlert: function() {
		var windowHeight =  (enyo.g11n.currentLocale().locale == "en_us") ? 180 : 210;
		var wCard = enyo.windows.fetchWindow("NetworkAlerts-BT-Alert");
		if(!wCard)
			this.currentActiveWindow = enyo.windows.openPopup(enyo.path.rewrite("$enyo-lib/networkalerts/source/networkalerts.html"), "NetworkAlerts-BT-Alert", {}, undefined, windowHeight);
	},
	
	alertTapped: function(inSender, respMsg, event) {
		this.doTap({response:respMsg});
	},
	
	sendResponse: function(respMsg) {		
		this.doTap({response:respMsg});
	},
	
	handleMessage: function(e) {
		// If we have no window open, the message must not be for us.
		if(!this.currentActiveWindow) {
			return;
		}		
		// Ignore messages clearly not from *our* window.
		// When the dashboard is swiped away, our window gets its JS bindings snipped, and the message source is undefined, so source=== is not good enough.
		var couldBeOurWindow = (e.source === this.currentActiveWindow) || (e.source === undefined && this.currentActiveWindow.closed !== false);
		if(!couldBeOurWindow) {
			return;
		}
		var label = "NetworkAlertsEvent=";
		
		if (e.data.indexOf(label) !== 0) {
			return;
		}
		var data = enyo.json.parse(e.data.slice(label.length));
		// Ignore messages from other dashboards, and poorly formed messages.
		if(!data.event || data.event.indexOf("do") !== 0 ) {
			return;
		}
		// Special handling for a couple of event types.
		// Everything else is propagated directly.
		switch(data.event) {
			case "doTap":
				this.doTap({response:data.args[0]});
				this.cleanup();
				break;
			case "doSysServiceCall":
				this.$.sysService.call(data.args[0], data.args[1]);
				break;
			case "doWiFiServiceCall":
				this.$.wifiService.call(data.args[0], data.args[1]);
				break;
			case "doBTServiceCall":
				this.$.btService.call(data.args[0], data.args[1]);
				break;
			case "doAppLaunch":
				this.$.appLaunch.call(data.args[0], data.args[1]);
				break;
		}
	}
	
	
});