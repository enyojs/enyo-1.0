var G11N_RB = new enyo.g11n.Resources({root:"$enyo-lib/networkalerts"});

enyo.kind({
	name:"WiFiAlert",
	kind: "VFlexBox",
	events:{
			onTap: ""
	},
	components: [
		{
			kind: enyo.Control,
			className: "notification-container",
			domAttributes:{
				"x-palm-popup-content": " "
			},
			components: [
				{
					className: "notification-icon icon-wifi"
				},
				{
					className: "notification-text",
					components: [
						{
							className: "title",
							content: G11N_RB.$L("No Internet Connection")
						},
						{
							className: "message",
							content: G11N_RB.$L("Turn Wi-Fi on to automatically connect to a known network.")
						}
					]
				}
			]
		 },
		 {kind: "NotificationButton", className: "enyo-notification-button-affirmative", layoutKind:"HFlexLayout", pack:"center", onclick:"handleTurnOn", components:[{content: G11N_RB.$L("Turn Wi-Fi On")}]},
		 {kind: "NotificationButton", className: "enyo-notification-button-negative", layoutKind:"HFlexLayout", pack:"center", onclick:"onClose", components:[{content: G11N_RB.$L("Dismiss")}]}
	],
	
	create: function() {
		this.inherited(arguments);
		var params = enyo.windowParams;
		this.userTapped = false;
		var currTime = Math.ceil(new Date().getTime() / (1000 * 60));
		this.sendEventToApp("doSysServiceCall", [{"lastDataAlertTimestamp": currTime},{method:"setPreferences"} ]);
		this.boundDestroy = enyo.bind(this, "destroy");
		window.addEventListener('unload', this.boundDestroy);
	},
	
	destroy: function() {
		if(!this.userTapped) {
			this.sendEventToApp("doTap", ["WiFi-UserCancelled"]);
		}
		this.inherited(arguments);
	},
	
	handleTurnOn: function(event) {
		this.userTapped = true;
		this.sendEventToApp("doWiFiServiceCall", [{"state": "enabled"},{method:"setstate"} ]);
		this.sendEventToApp("doTap", ["WiFi-StartingUp"]);
     	close();
    },

    onClose: function(event) {
		this.userTapped = true;
		this.sendEventToApp("doTap", ["WiFi-UserCancelled"]);
     	close();
    },
    
    sendEventToApp: function(eventType, args) {
		args = args || [];
		if(window.opener) {
			window.opener.postMessage("NetworkAlertsEvent="+enyo.json.stringify({event:eventType, args:args}), "*");
		}
	}
	
	
});

enyo.kind({
	name:"FlightModeAlert",
	kind: "VFlexBox",
	events:{
			onTap: ""
	},
	components: [
		{
			kind: enyo.Control,
			className: "notification-container",
			domAttributes:{
				"x-palm-popup-content": " "
			},
			components: [
				{
					className: "notification-icon icon-flight-mode"
				},
				{
					className: "notification-text",
					components: [
						{
							className: "title",
							content: G11N_RB.$L("Airplane Mode Is On")
						},
						{
							className: "message",
							content: G11N_RB.$L("Turn off Airplane Mode for network access?")
						}
					]
				}
			]
		 },
		 {kind: "NotificationButton", className: "enyo-notification-button-affirmative", layoutKind:"HFlexLayout", pack:"center", onclick:"handleTurnOn", components:[{content: G11N_RB.$L("Turn Off")}]},
		 {kind: "NotificationButton", className: "enyo-notification-button-negative", layoutKind:"HFlexLayout", pack:"center", onclick:"onClose", components:[{content: G11N_RB.$L("Dismiss")}]}
	],
	
	create: function() {
		this.inherited(arguments);
		this.userTapped = false;
		this.boundDestroy = enyo.bind(this, "destroy");
		window.addEventListener('unload', this.boundDestroy);
	},
	
	destroy: function() {
		if(!this.userTapped) {
			this.sendEventToApp("doTap", ["PhoneNetwork-UserCancelled"]);
		}
		this.inherited(arguments);
	},
	
	handleTurnOn: function(event) {
		this.userTapped = true;
		this.sendEventToApp("doSysServiceCall", [{"airplaneMode":false},{method:"setPreferences"} ]);
		this.sendEventToApp("doTap", ["PhoneNetwork-StartingUp"]);
     	close();
    },

    onClose: function(event) {
		this.userTapped = true;
		this.sendEventToApp("doTap", ["PhoneNetwork-UserCancelled"]);
     	close();
    },
    sendEventToApp: function(eventType, args) {
		args = args || [];
		if(window.opener) {
			window.opener.postMessage("NetworkAlertsEvent="+enyo.json.stringify({event:eventType, args:args}), "*");
		}
	}
	
	
});

enyo.kind({
	name:"BluetoothAlert",
	kind: "VFlexBox",
	events:{
			onTap: ""
	},
	components: [
		{
			kind: enyo.Control,
			className: "notification-container",
			domAttributes:{
				"x-palm-popup-content": " "
			},
			components: [
				{
					className: "notification-icon icon-bluetooth"
				},
				{
					className: "notification-text",
					components: [
						{
							className: "title",
							content: G11N_RB.$L("Bluetooth Is Off")
						},
						{
							className: "message",
							content: G11N_RB.$L("No devices connected.")
						}
					]
				}
			]
		 },
		 {kind: "NotificationButton", className: "enyo-notification-button-affirmative", layoutKind:"HFlexLayout", pack:"center", onclick:"handleTurnOn", components:[{content: G11N_RB.$L("Turn Bluetooth On")}]},
		 {kind: "NotificationButton", className: "enyo-notification-button-negative", layoutKind:"HFlexLayout", pack:"center", onclick:"onClose", components:[{content: G11N_RB.$L("Dismiss")}]}
	],
	
	create: function() {
		this.inherited(arguments);
		this.userTapped = false;
		this.boundDestroy = enyo.bind(this, "destroy");
		window.addEventListener('unload', this.boundDestroy);
	},
	
	destroy: function() {
		if(!this.userTapped) {
			this.sendEventToApp("doTap", ["BT-UserCancelled"]);
		}
		this.inherited(arguments);
	},
	
	handleTurnOn: function(event) {
		this.userTapped = true;
		this.sendEventToApp("doBTServiceCall", [{'visible':false, 'connectable':true},{method:"radioon"} ]);
		this.sendEventToApp("doTap", ["BT-StartingUp"]);
     	close();
    },

    onClose: function(event) {
		this.userTapped = true;
		this.sendEventToApp("doTap", ["BT-UserCancelled"]);
     	close();
    },
    
    sendEventToApp: function(eventType, args) {
		args = args || [];
		if(window.opener) {
			window.opener.postMessage("NetworkAlertsEvent="+enyo.json.stringify({event:eventType, args:args}), "*");
		}
	}
	
	
});

enyo.kind({
	name:"ManualNetworkAlert",
	kind: "VFlexBox",
	events:{
			onTap: ""
	},
	components: [
		{
			kind: enyo.Control,
			className: "notification-container",
			domAttributes:{
				"x-palm-popup-content": " "
			},
			components: [
				{
					className: "notification-icon icon-network"
				},
				{
					className: "notification-text",
					components: [
						{
							className: "title",
							content: G11N_RB.$L("Manual Network")
						},
						{
							className: "message",
							allowHtml:true,
							content: G11N_RB.$L("Wireless network unavailable.<br/>Select different one?")
						}
					]
				}
			]
		 },
		 {kind: "NotificationButton", className: "enyo-notification-button-affirmative", layoutKind:"HFlexLayout", pack:"center", onclick:"handleTurnOn", components:[{content: G11N_RB.$L("SELECT NEW")}]},
		 {kind: "NotificationButton", className: "enyo-notification-button-negative", layoutKind:"HFlexLayout", pack:"center", onclick:"onClose", components:[{content: G11N_RB.$L("DON'T SWITCH")}]},
		 {kind:"PalmService", name:"appLaunch", service:"palm://com.palm.applicationManager/"}
	],
	
	create: function() {
		this.inherited(arguments);
		this.userTapped = false;
		this.boundDestroy = enyo.bind(this, "destroy");
		window.addEventListener('unload', this.boundDestroy);
	},
	
	destroy: function() {
		if(!this.userTapped) {
			this.sendEventToApp("doTap", ["PhoneManualNetwork-UserCancelled"]);
		}
		this.inherited(arguments);
	},
	
	handleTurnOn: function(event) {
		this.userTapped = true;
		this.sendEventToApp("doAppLaunch", [{id: 'com.palm.app.phone',params: {preferences:true,launchType: 'startNetworkSearch'}},{method:"open"}]);
		this.sendEventToApp("doTap", ["PhoneManualNetwork-StartingUp"]);
     	close();
    },

    onClose: function(event) {
		this.userTapped = true;
		this.sendEventToApp("doTap", ["PhoneManualNetwork-UserCancelled"]);
     	close();
    },
    
    sendEventToApp: function(eventType, args) {
		args = args || [];
		if(window.opener) {
			window.opener.postMessage("NetworkAlertsEvent="+enyo.json.stringify({event:eventType, args:args}), "*");
		}
	}
	
	
});