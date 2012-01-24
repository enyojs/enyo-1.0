/******************************
WiFi - g11n
******************************/
WiFiG11nResources = {
	"$L": function (inText) {
		if (!this.wifirb) {
			this.wifirb = new enyo.g11n.Resources({root: "$enyo-lib/wifi"});
		}
		return this.wifirb.$L(inText);
	},
	reload: function (locale) {
		this.wifirb = new enyo.g11n.Resources({root: "$enyo-lib/wifi", locale: locale});
	}
};

/******************************
WiFi - Service
******************************/
enyo.kind({
	name: "WiFiService",
	kind: "PalmService",
	service: "palm://com.palm.wifi/"
});

/******************************
WiFi - Popup 
******************************/

enyo.kind({
	LABEL_HEADERTITLE_NETWORKLIST		: WiFiG11nResources.$L("Wi-Fi Setup"),
	LABEL_HEADERTITLE_IPCONFIG		: WiFiG11nResources.$L("Wi-Fi Setup"),
	LABEL_HEADERTITLE_JOINNEWNETWORK	: WiFiG11nResources.$L("Join Other Network"),
	LABEL_HEADERTITLE_JOINSECURENETWORK	: new enyo.g11n.Template(WiFiG11nResources.$L("Join #{ssid}")),
	LABEL_HEADERTITLE_CAPTIVEPORTAL		: WiFiG11nResources.$L("No Internet Connection"),
	LABEL_HEADERTITLE_NOINTERNET		: WiFiG11nResources.$L("No Internet Connection"),
	LABEL_HEADERTITLE_TESTING		: WiFiG11nResources.$L("Wi-Fi Setup"),

	LABEL_HEADERINFO_NETWORKLIST		: "", //WiFiG11nResources.$L("Choose a network"),
	LABEL_HEADERINFO_IPCONFIG			: new enyo.g11n.Template(WiFiG11nResources.$L("Connected to #{ssid}")),
	LABEL_HEADERINFO_JOINNEWNETWORK		: "",
	LABEL_HEADERINFO_JOINSECURENETWORK	: "",
	LABEL_HEADERINFO_CAPTIVEPORTAL		: WiFiG11nResources.$L("The network you have selected contains a captive portal which requires additional authentication, and cannot be used for initial setup. Try another network."),
	LABEL_HEADERINFO_NOINTERNET		: WiFiG11nResources.$L("Cannot connect to the internet through this connection. Try another network."),
	LABEL_HEADERINFO_TESTING		: WiFiG11nResources.$L("Checking internet connectivity..."),

	LABEL_HEADERINFO_MACADDRESS		: new enyo.g11n.Template(WiFiG11nResources.$L("If your network has MAC address filtering enabled, allow the device to join by entering the MAC address #{macAddress} in the access point configuration page.")),

	LABEL_HELP_CONTENT : new enyo.g11n.Template(WiFiG11nResources.$L("You need a network connection to set up your device. You can use your own Wi-Fi network or a public network (at places like a café or an airport).<p/><h3>Connecting to a public network</h3><ol><li>Go to the location where the network is available and tap “Start Over.” The device will find all visible available networks. If you see the name of the network, tap it. Otherwise, tap “Join Network” and enter the network name.</li>&nbsp;<li>If needed, enter the network credentials, or accept the terms and conditions. Then you can use it to set up your device.</li></ol><h3>Connecting to another network</h3><ol><li>If you do not see your network’s name in the list, tap “Join Network” and enter a network name. You can join an open network, or a network with WEP encryption, WPA-personal, or Enterprise authentication.</li>&nbsp;<li>If you cannot access your network, you might need to enter the device’s MAC Address in your Wi-Fi Access Point Configuration software. Your device’s MAC address is #{macAddress}.</li>&nbsp;<li>Please note: You cannot join a network that requires certificate installation until setup is complete. WEP-shared security is not supported. For more information, visit http://hpwebos.com/support, or contact your network administrator.</li><ol>")),

	name: "WiFiPopup",
	kind: "ModalDialog",
	lazy: false,
	width: "451px",
	published: {
		headerTitle: "",
		headerInfo: ""
	},
	events: {
		onFinish: "",
		onCancel: ""
	},

	caption: "",

	components: [
		{name: "GetInfo", kind: "WiFiService", method: "getinfo", onSuccess: "parseWiFiInfoResponse"},
		{name: "DeleteProfile", kind: "WiFiService", method: "deleteprofile", onFailure: "handleDeleteProfileFailure"},
		{content: "", name: "headerInfoText", style: "font-size: 18px; margin-bottom: 5px;" },
		{kind: "Group", name: "wifiHelp", showing: false, components: [
			{kind: "Scroller", height: "290px", flex: 1, components: [
				{kind: "HtmlContent", name: "helpText", style: "font-size: 16px; margin: 10px 10px 10px 10px;", allowHtml: true, content: ""}
			]}
		]},
		{name: "wifiConfig", kind: "WiFiConfig", className: "wifi-network-list", onViewChange: "updatePopup", onNetworkSelectionChange: "handleNetworkSelectionChange"},
		{name: "helpButton", kind: "Button", caption: WiFiG11nResources.$L("Help"), showing: false, onclick: "displayHelp"},
		{name: "cancelButton", kind: "Button", caption: WiFiG11nResources.$L("Cancel"), showing: false, onclick: "closePopup"}
	],

	create: function () {
		this.inherited(arguments);
		this.lastCreatedProfileId = 0;
	},

	reloadResources: function (locale) {
		// for firstuse
		if (locale) {
			WiFiG11nResources.reload(locale);
		}
	},

	reset: function () {
		this.$.wifiConfig.purgeWiFiProfiles();
	},

	start: function () {
		this.$.wifiConfig.turnWiFiOn();
	},

	displayHelp: function () {
		if (this.$.wifiConfig.getShowing() ) {
			this.$.GetInfo.call({});
		} else {
			this.$.wifiHelp.hide();
			this.$.wifiConfig.show();
			this.updatePopup(null, "NetworkList");
		}
	},

	closePopup: function () {
		this.$.wifiConfig.deconfigure();
		this.close();
		this.doCancel();
	},

	handleNetworkSelectionChange: function (inSender, inProfileId) {
		if (0 !== this.lastCreatedProfileId) {
			this.$.DeleteProfile.call({"profileId": this.lastCreatedProfileId});
		}
		this.lastCreatedProfileId = inProfileId;
	},

	parseWiFiInfoResponse: function (inSender, inResponse, inRequest) {
		if (undefined !== inResponse.wifiInfo &&
				undefined !== inResponse.wifiInfo.macAddress) {
			this.setCaption(WiFiG11nResources.$L("Help"));
			this.$.headerInfoText.setContent("");
			this.$.helpText.setContent(
					this.LABEL_HELP_CONTENT.evaluate(
					{macAddress: inResponse.wifiInfo.macAddress}));
			this.$.helpButton.setCaption(WiFiG11nResources.$L("Close"));
			this.$.wifiConfig.hide();
			this.$.wifiHelp.show();
			this.$.cancelButton.hide();
			this.resized();
		}
	},

	updatePopup: function (inSender, inViewName) {
		switch (inViewName) {
		case "Off":
			this.setCaption(this.LABEL_HEADERTITLE_NETWORKLIST);
			this.$.headerInfoText.setContent("");
			break;
		case "IpConfig":
			this.setCaption(this.LABEL_HEADERTITLE_IPCONFIG);
			this.$.headerInfoText.setContent(this.LABEL_HEADERINFO_IPCONFIG.evaluate({
				ssid: this.$.wifiConfig.getJoinedNetwork().ssid
			}));
			break;
		case "JoinSecureNetwork":
			this.setCaption(this.LABEL_HEADERTITLE_JOINSECURENETWORK.evaluate({
				ssid: this.$.wifiConfig.getSelectedNetwork().ssid
			}));
			this.$.headerInfoText.setContent(this.LABEL_HEADERINFO_JOINSECURENETWORK);
			break;
		case "JoinNewNetwork":
			this.setCaption(this.LABEL_HEADERTITLE_JOINNEWNETWORK);
			this.$.headerInfoText.setContent(this.LABEL_HEADERINFO_JOINNEWNETWORK);
			break;
		case "CaptivePortal":
			this.setCaption(this.LABEL_HEADERTITLE_CAPTIVEPORTAL);
			this.$.headerInfoText.setContent(this.LABEL_HEADERINFO_CAPTIVEPORTAL);
			break;
		case "NoInternet":
			this.setCaption(this.LABEL_HEADERTITLE_NOINTERNET);
			this.$.headerInfoText.setContent(this.LABEL_HEADERINFO_NOINTERNET);
			break;
		case "TestingInternet":
			this.setCaption(this.LABEL_HEADERTITLE_TESTING);
			this.$.headerInfoText.setContent(this.LABEL_HEADERINFO_TESTING);
			break;
		default:
			this.setCaption(this.LABEL_HEADERTITLE_NETWORKLIST);
			this.$.headerInfoText.setContent(this.LABEL_HEADERINFO_NETWORKLIST);
			break;
		}

		if (this.$.wifiConfig.isInNetworkView() || this.$.wifiConfig.isInOffView()) {
			this.$.cancelButton.show();
			this.$.helpButton.setCaption(WiFiG11nResources.$L("Help"));
			this.$.helpButton.show();
		} else {
			this.$.cancelButton.hide();
			this.$.helpButton.hide();
		}
		this.resized();
	},

	headerTitleChanged: function () {
		if (this.$.wifiConfig.isInNetworkView()) {
			this.setCaption(this.headerTitle);
		}
	},

	headerInfoChanged: function () {
		if (this.$.wifiConfig.isInNetworkView()) {
			this.$.headerInfoText.setContent(this.headerInfo);
		}
	}
});

/******************************
WiFi - Config 
******************************/
enyo.kind({
	name: "WiFiConfig",
	kind: "enyo.VFlexBox",
	lazy: false,
	published: {
		liteMode: false,
		selectedNetwork: null,
		joinedNetwork: null
	},
	events: {
		onViewChange: "",
		onSignalChange: "",
		onBssChange: "",
		onNetworkSelectionChange: ""
	},
	components: [
		{name: "GetNetworkStatus", kind: "PalmService", service: "palm://com.palm.connectionmanager/", method: "getStatus", subscribe: true, resubscribe: true, onResponse: "handleNetworkStatusResponse"},
		{name: "GetCertificateList", kind: "PalmService", service: "palm://com.palm.certificatemanager/", method: "listcertificates", onResponse: "handleCertificateListResponse"},

		{name: "SetRadioState", kind: "WiFiService", method: "setstate", onFailure: "handleSetStateFailure"},
		{name: "GetConnectionStatus", kind: "WiFiService", method: "getstatus", subscribe: true, resubscribe: true, onResponse: "handleWiFiConnectionStatus"},
		{name: "FindNetworks", kind: "WiFiService", method: "findnetworks", onResponse: "handleFindNetworksResponse"},
		{name: "Connect", kind: "WiFiService", method: "connect", onResponse: "handleConnectResponse"},
		{name: "GetProfileInfo", kind: "WiFiService", method: "getprofile", onResponse: "handleProfileInfoResponse"},
		{name: "GetWiFiInfo", kind: "WiFiService", method: "getinfo", onSuccess: "handleWiFiInfoResponse"},
		{name: "DeleteProfile", kind: "WiFiService", method: "deleteprofile", onFailure: "handleDeleteProfileFailure"},

		{name: "wifiOff", content: WiFiG11nResources.$L("Wi-Fi is turned off."), style: "font-size: 18px;", showing: false},

		{kind: "RowGroup", name: "wifiNetworkList", caption: WiFiG11nResources.$L("Choose a network"), showing: false, components: [
			{kind: "Scroller", height: "290px", flex: 1, components: [
				{kind: "Item", className: "enyo-first", layoutKind: "HFlexLayout", name: "searchMsg", pack: "center", showing: false, flex: 1, components: [
					{content: WiFiG11nResources.$L("Searching for networks..."), style: "font-size: 18px;", flex: 1},
					{kind: "Spinner", name: "searchSpinner", style: "margin: -3px 0;", showing: false}
				]},
				{name: "list", kind: "VirtualRepeater", onSetupRow: "updateRow", flex: 1, components: [
					{kind: "Item", name: "networkItem", onclick: "itemClick", tapHighlight: true, components: [
						{kind: "HFlexBox", components: [
							{className: "wifi-item-name", name: "itemName", flex: 1},
							{kind: "Spacer", flex: 0.1},
							{kind: "Image", className: "wifi-item-state", name: "itemConnected", src: "$enyo-lib/wifi/images/checkmark.png"},
							{kind: "Image", className: "wifi-item-secure", name: "itemSecure", src: "$enyo-lib/wifi/images/secure-icon.png"},
							{kind: "Image", name: "itemStrength"}
						]},
						{className: "wifi-message-status", name: "itemStatus", content: ""}
					]}
				]}
			]},
			{kind: "Item", className: "enyo-last", onclick: "showJoinOtherNetwork", tapHighlight: true, layoutKind: "HFlexLayout", flex: 1, components: [
				{kind: "Image", className: "wifi-item-join", src: "$enyo-lib/wifi/images/join-plus-icon.png"},
				{className: "wifi-item-name", content: WiFiG11nResources.$L("Join Network"), flex: 1}
			]}
		]},
		{kind: "WiFiIpConfig", name: "wifiIpConfig", showing: false, onForget: "handleForgetNetwork", onBack: "showNetworkList"},
		{kind: "VFlexBox", name: "wifiSecurity", showing: false, components: [
			{kind: "RowGroup", name:"ssidGroup", caption: WiFiG11nResources.$L("NETWORK NAME"), showing: false, components: [
				{kind: "Input", alwaysLooksFocused: true, name: "joinSsid", changeOnInput: true, onkeydown: "ssidKeyDowned", onchange: "joinInfoChanged", hint: WiFiG11nResources.$L("Enter network name"), autoCapitalize: "lowercase", autocorrect: false, spellcheck: false},
			]},
			{kind: "RowGroup", name:"usernameGroup", caption: WiFiG11nResources.$L("Username"), showing: false, components: [
				{kind: "Input", alwaysLooksFocused: true, name: "joinUsername", changeOnInput: true, onkeydown: "usernameKeyDowned", onchange: "joinInfoChanged", autoCapitalize: "lowercase", autocorrect: false, spellcheck: false},
			]},
			{kind: "RowGroup", name:"passwordGroup", caption: WiFiG11nResources.$L("Password"), showing: false, components: [
				{kind: "PasswordInput", alwaysLooksFocused: true, name: "joinPassword", changeOnInput: true, onkeydown: "passwordKeyDowned", onchange: "joinInfoChanged", autoCapitalize: "lowercase", autocorrect: false, spellcheck: false },
			]},
			{kind: "RowGroup", name: "securityGroup", caption: WiFiG11nResources.$L("NETWORK SECURITY"), components: [
				{kind: "ListSelector", name: "securityList", onChange: "handleSecuritySelection", items: [
					{caption: WiFiG11nResources.$L("Open"), value: "none"},
					{caption: WiFiG11nResources.$L("WPA Personal"), value: "wpa-personal"},
					{caption: WiFiG11nResources.$L("WEP"), value: "wep"},
					{caption: WiFiG11nResources.$L("Enterprise"), value: "enterprise"}
				]}
			]},
			{kind: "RowGroup", name: "keyIndexGroup", caption: WiFiG11nResources.$L("KEY INDEX"), showing: false, components: [
				{kind: "ListSelector", name: "keyIndexList", items: [
					{caption: WiFiG11nResources.$L("1"), value: 0},
					{caption: WiFiG11nResources.$L("2"), value: 1},
					{caption: WiFiG11nResources.$L("3"), value: 2},
					{caption: WiFiG11nResources.$L("4"), value: 3}
				]}
			]},
			{kind: "RowGroup", name: "hexKeyGroup", showing: false, components: [
				{kind: "Item", className: "enyo-single", tapHighlight: false, layoutKind: "HFlexLayout", components: [
					{content: WiFiG11nResources.$L("Is key in HEX?"), flex: 1},
					{kind: "CheckBox", name: "isInHexCheckbox", checked: false}
				]}
			]},
			{kind: "RowGroup", name: "auth8021xGroup", caption: WiFiG11nResources.$L("802.1X AUTHENTICATION"), showing: false, components: [
				{kind: "Item", tapHighlight: false, layoutKind: "HFlexLayout", components: [
					{content: WiFiG11nResources.$L("Type"), flex: 1},
					{kind: "ListSelector", name: "eapTypeList", onChange: "handleEapTypeSelection", items: [
						{caption: WiFiG11nResources.$L("Auto"), value: "eapAuto"},
						{caption: WiFiG11nResources.$L("PEAP"), value: "eapPeap"},
						{caption: WiFiG11nResources.$L("TLS"), value: "eapTls"},
						{caption: WiFiG11nResources.$L("TTLS"), value: "eapTtls"},
						{caption: WiFiG11nResources.$L("FAST"), value: "eapFast"}
					]}
				]},
				{kind: "Item", tapHighlight: false, layoutKind: "HFlexLayout", components: [
					{content: WiFiG11nResources.$L("Verify server certificate"), flex: 1},
					{kind: "CheckBox", name: "certVerifyCheckbox", checked: true}
				]}
			]},
			{kind: "RowGroup", name: "authWapiGroup", caption: WiFiG11nResources.$L("WAPI AUTHENTICATION"), showing: false, components: [
				{kind: "Item", tapHighlight: false, layoutKind: "HFlexLayout", components: [
					{content: WiFiG11nResources.$L("Root certificate"), flex: 1},
					{kind: "ListSelector", name: "wapiRootCertificateList", items: []}
				]},
				{kind: "Item", tapHighlight: false, layoutKind: "HFlexLayout", components: [
					{content: WiFiG11nResources.$L("User certificate"), flex: 1},
					{kind: "ListSelector", name: "wapiUserCertificateList", items: []}
				]}
			]},
			{kind: "VFlexBox", name: "certificateGroup", showing: false, components: [
				{content: WiFiG11nResources.$L("Select a security certificate for this network."), style: "font-size:16px; margin-left:5px;"},
				{kind: "RowGroup", caption: WiFiG11nResources.$L("SELECTED CERTIFICATE"), components: [
					{kind: "ListSelector", name: "certificateList", items: []}
				]}
			]},
			{style: "padding: 3px 0px 2px 0px"},
			{name: "joinMessage", content: "", className: "wifi-message-error", showing: false},
			{kind: "ActivityButton", className: "enyo-botton enyo-button-dark wifi-activity-button", caption: WiFiG11nResources.$L("Sign In"), name: "joinButton", disabled: true, onclick: "joinNetwork"},
			{style: "padding: 3px"},
			{kind: "Button", caption: WiFiG11nResources.$L("Cancel"), onclick: "discardNetwork", className: "enyo-button"}
			
		]}
	],

	create: function () {
		this.inherited(arguments);
		this.data = [];
		this.certItems = [];
		this.autoscan = null;
		this.shouldDiscardNetwork = false;
		this.$.GetWiFiInfo.call({});
		this.$.GetConnectionStatus.call({});
		this.$.GetNetworkStatus.call({});
	},

	isInOffView: function () {
		return this.$.wifiOff.getShowing();
	},

	isInNetworkView: function () {
		return this.$.wifiNetworkList.getShowing();
	},

	isInIpConfigView: function () {
		return this.$.wifiIpConfig.getShowing();
	},

	isInSecurityView: function () {
		return this.$.wifiSecurity.getShowing();
	},

	turnWiFiOn: function () {
		this.$.SetRadioState.call({"state": "enabled"});
		//this.startAutoScan();
	},

	turnWiFiOff: function () {
		this.$.SetRadioState.call({"state": "disabled"});
	},

	deconfigure: function () {
		this.doNetworkSelectionChange(0); // cancel any pending connection
		this.stopAutoScan();
		this.shouldDiscardNetwork = false;
		this.selectedNetwork = null;
	},

	purgeWiFiProfiles: function () {
		this.$.DeleteProfile.call({});
	},

	startAutoScan: function () {
		if (null === this.autoscan) {
			this.autoscan = window.setInterval(enyo.bind(this, this.triggerAutoScan), 12000);
			if (!this.data.length) {
				this.$.searchMsg.show();
				this.$.searchSpinner.show();
				this.triggerAutoScan(); // force-trigger the first scan 
			}
		}
	},

	delayAutoScan: function () {
		if (null !== this.autoscan) {
			window.clearInterval(this.autoscan);
			this.autoscan = window.setInterval(enyo.bind(this, this.triggerAutoScan), 12000);
		}
	},

	stopAutoScan: function (action) {
		if (null !== this.autoscan) {
			window.clearInterval(this.autoscan);
			this.autoscan = null;
		}
		if ('clear' === action) {
			this.data = [];
			if (this.isInNetworkView()) {
				this.$.list.render();
			}
		}
	},

	triggerAutoScan: function () {
		this.$.FindNetworks.call({});
	},

	assocFailureString: function (error) {
		var message;
		switch (error) {
		case "ApNotFound":
			message = WiFiG11nResources.$L("No network of that name with that security setting was found.");
			break;
		case "IncorrectPasskey":
			message = WiFiG11nResources.$L("The password you entered is not correct. Try again.");
			break;
		case "IncorrectPassword":
			message = WiFiG11nResources.$L("The username or password you entered is not correct. Try again.");
			break;
		case "ServerCertificateRequired":
			message = WiFiG11nResources.$L("You need a security certificate to join this network. Contact your network administrator.");
			break;
		default:
			message = WiFiG11nResources.$L("Unable to connect. Try again.");
			break;
		}
		return message;
	},

	disableJoinButtons: function (state) {
		this.$.joinButton.setActive(false);
		this.$.joinButton.setCaption(WiFiG11nResources.$L("Sign In"));
		this.$.joinButton.setDisabled(state);
	},

	showOffState: function () {
		this.selectedNetwork = null;
		this.$.wifiOff.show();
		this.$.wifiNetworkList.hide();
		this.$.wifiSecurity.hide();
		this.$.wifiIpConfig.hide();
		this.doViewChange("Off");
		this.stopAutoScan();
	},

	showNetworkList: function () {
		this.selectedNetwork = null;
		this.$.wifiNetworkList.show();
		this.$.wifiOff.hide();
		this.$.wifiSecurity.hide();
		this.$.wifiIpConfig.hide();
		this.doViewChange("NetworkList");
		this.startAutoScan();
		this.$.list.render();
	},

	showIpConfig: function (inProfile) {
		this.selectedNetwork = null;
		this.$.wifiIpConfig.show();
		this.$.wifiOff.hide();
		this.$.wifiNetworkList.hide();
		this.$.wifiSecurity.hide();
		this.$.wifiIpConfig.setJoinedProfile(inProfile);
		this.doViewChange("IpConfig");
		this.stopAutoScan();
	},

	showJoinOtherNetwork: function () {
		this.selectedNetwork = null;
		this.shouldDiscardNetwork = false;
		this.$.wifiSecurity.show();
		this.$.wifiOff.hide();
		this.$.wifiNetworkList.hide();
		this.$.wifiIpConfig.hide();
		this.doViewChange("JoinNewNetwork");
		this.stopAutoScan();

		this.$.joinSsid.setValue("");
		this.$.joinUsername.setValue("");
		this.$.joinPassword.setValue("");
		this.$.securityList.setValue("none");
		this.$.keyIndexList.setValue(0);
		this.$.isInHexCheckbox.setChecked(false);
		this.$.eapTypeList.setValue("eapAuto");
		this.$.certVerifyCheckbox.setChecked(true);
		this.$.joinMessage.setContent("");

		this.$.joinMessage.hide();
		this.$.ssidGroup.show();
		this.$.securityGroup.show();
		this.updateSecurityView("none");
		this.disableJoinButtons(true);
	},

	showJoinSecureNetwork: function (info) {
		this.selectedNetwork = info;
		this.shouldDiscardNetwork = false;
		this.$.wifiSecurity.show();
		this.$.wifiOff.hide();
		this.$.wifiNetworkList.hide();
		this.$.wifiIpConfig.hide();
		this.doViewChange("JoinSecureNetwork");
		this.stopAutoScan();

		this.$.joinSsid.setValue(info.ssid);
		this.$.joinUsername.setValue("");
		this.$.joinPassword.setValue("");
		this.$.securityList.setValue(info.securityType);
		this.$.keyIndexList.setValue(0);
		this.$.isInHexCheckbox.setChecked(false);
		this.$.eapTypeList.setValue("eapAuto");
		this.$.certVerifyCheckbox.setChecked(true);
		this.$.joinMessage.setContent("");

		this.$.joinMessage.hide();
		this.$.ssidGroup.hide();
		this.$.securityGroup.hide();
		this.updateSecurityView(info.securityType);
		this.disableJoinButtons(true);
	},

	retrieveIpInfo: function (info) {
		this.$.GetProfileInfo.call({"profileId": info.profileId});
	},

	updateNetworkItem: function (info, inIndex) {
		var isSelected = false,
			isJoined = false,
			sb,
			strength = ['low', 'average', 'excellent'];

		if (0 === inIndex) {
			this.$.networkItem.addClass("enyo-first");
		}

		if (null !== this.selectedNetwork &&
				this.selectedNetwork.ssid === info.ssid) {
			isSelected = true;
		}

		if (null !== this.joinedNetwork &&
				this.joinedNetwork.ssid === info.ssid) {
			isJoined = true;
		}

		this.$.itemName.setContent(info.ssid);

		if (undefined !== info.securityType) {
			this.$.itemSecure.show();
		} else {
			this.$.itemSecure.hide();
		}

		sb = info.signalBars;
		if (!sb) {
			this.$.itemStrength.hide();
		} else {
			this.$.itemStrength.setSrc('$enyo-lib/wifi/images/wifi-icon-' + strength[sb - 1] + '.png');
			this.$.itemStrength.show();
		}

		this.$.itemStatus.setContent("");
		this.$.itemStatus.hide();
		this.$.itemConnected.hide();

		switch (info.connectState) {
		case "associated":
			this.joinedNetwork = info;
			this.$.itemName.addClass("wifi-item-name-connected");
			this.$.itemStatus.setContent(WiFiG11nResources.$L("CONNECTING..."));
			this.$.itemStatus.show();
			break;
		case "associating":
			this.$.itemStatus.setContent(WiFiG11nResources.$L("CONNECTING..."));
			this.$.itemStatus.show();
			break;
		case "ipConfigured":
			this.joinedNetwork = info;
			this.$.itemName.addClass("wifi-item-name-connected");
			this.$.itemConnected.show();
			break;
		case "ipFailed":
			this.joinedNetwork = info;
			this.$.itemName.addClass("wifi-item-name-connected");
			this.$.itemStatus.setContent(WiFiG11nResources.$L("TAP TO CONFIGURE IP ADDRESS"));
			this.$.itemStatus.show();
			break;
		case "associationFailed":
			if (undefined !== info.lastConnectError &&
					"ApNotFound" !== info.lastConnectError &&
					"DisconnectRequest" !== info.lastConnectErr) {
				if ("IncorrectPasskey" === info.lastConnectError ||
						"IncorrectPassword" === info.lastConnectError) {
					this.$.itemStatus.setContent(WiFiG11nResources.$L("INCORRECT PASSWORD"));
				} else {
					this.$.itemStatus.setContent(WiFiG11nResources.$L("ASSOCIATION FAILED"));
				}
				this.$.itemStatus.show();
			}
			if (isJoined) {
				this.joinedNetwork = null;
			}
			if (isSelected) {
				this.selectedNetwork = null;
			}
			break;
		case "notAssociated":
			if (isJoined) {
				this.joinedNetwork = null;
			}
			if (isSelected) {
				this.selectedNetwork = null;
			}
			break;
		default:
			break;
		}

		// display connecting status as soon as the network is selected
		if (undefined === info.connectState && isSelected) {
			this.$.itemStatus.setContent(WiFiG11nResources.$L("CONNECTING..."));
			this.$.itemStatus.show();
		}
	},

	associationStateChanged: function (info) {
		var index;
		var record;

		for (index = 0; index < this.data.length; index++) {
			record = this.data[index];
			if (record) {
				if (record.networkInfo.ssid === info.ssid) {
					record.networkInfo.connectState = info.connectState;
					record.networkInfo.lastConnectError = info.lastConnectError;
					record.networkInfo.profileId = info.profileId;
					if (undefined !== info.signalBars) {
						record.networkInfo.signalBars = info.signalBars;
						record.networkInfo.signalLevel = info.signalLevel;
					}

					// Move this record to the beginning of the array and redraw
					break;
				}	
			}
		}

		if (index < this.data.length) {
			record = this.data.splice(index, 1);
			this.data.unshift(record[0]);
		} else {
			// network not in the scan results but association state changed, prepend
			this.data.unshift({networkInfo: info});
		}

		if (this.isInNetworkView()) {
			this.$.list.render();
		}
	},

	joinStateChanged: function (info) {
		// check if join state change is for our network
		if (null !== this.selectedNetwork &&
				this.selectedNetwork.ssid !== info.ssid &&
				this.$.joinSsid.getValue() !== info.ssid) {
			// nothing to do
			return;
		}

		switch (info.connectState) {
		case "associationFailed":
			this.$.joinMessage.setContent(this.assocFailureString(info.lastConnectError));
			this.$.joinMessage.show();
			this.$.joinButton.setActive(false);
			this.$.joinButton.setCaption(WiFiG11nResources.$L("Sign In"));

			// if error is for requiring client certificate, present UI to request certificate
			if ("ClientCertificateRequired" === info.lastConnectError) {
				this.$.usernameGroup.hide();
				this.$.passwordGroup.hide();
				this.$.securityGroup.hide();
				this.$.auth8021xGroup.hide();
				this.$.joinMessage.setContent("");
				this.$.joinMessage.hide();
				this.$.certificateGroup.show();
				this.$.eapTypeList.setValue("eapTls")
				this.$.GetCertificateList.call({});
			}

			if (this.$.passwordGroup.getShowing()) {
				this.$.joinPassword.forceFocus();
			}
			break;
		case "ipConfigured":
		case "ipFailed":
			this.joinedNetwork = info;
			if (null !== this.selectedNetwork ||
					(null === this.selectedNetwork &&
					 this.$.joinSsid.getValue() === info.ssid)) {
				this.selectedNetwork = null;
				this.showNetworkList();
			}
			break;
		}
	},

	handleWiFiConnectionStatus: function (inSender, inResponse, inRequest) {
		if (inResponse) {
			if ("serviceDisabled" !== inResponse.status) {
				if ("serviceEnabled" === inResponse.status && !this.isInNetworkView() && !this.isInIpConfigView() && !this.isInSecurityView()) {
					this.showNetworkList();
				} else if ("signalStrengthChanged" === inResponse.status && null !== this.joinedNetwork) {
					this.joinedNetwork.signalBars = inResponse.signalBars;
					this.joinedNetwork.signalLevel = inResponse.signalLevel;
					enyo.asyncMethod(this, "associationStateChanged", this.joinedNetwork);
				} else {
					if (undefined !== inResponse.apInfo) {
						this.doBssChange(inResponse.apInfo);
					}

					if (undefined === inResponse.networkInfo ||
							undefined === inResponse.networkInfo.connectState) {
						return;
					}
				
					if ("notAssociated" === inResponse.networkInfo.connectState) {
						this.joinedNetwork = null;
					} else if ("ipConfigured" === inResponse.networkInfo.connectState) {
						this.joinedNetwork = inResponse.networkInfo;
					}

					if (this.isInIpConfigView()) {
						// get out of IP configuration view if disconnected
						if ("notAssociated" === inResponse.networkInfo.connectState) {
							this.showNetworkList();
						} else if ("ipConfigured" === inResponse.networkInfo.connectState &&
								"roamed" !== inResponse.status) {
							this.$.GetProfileInfo.call({"profileId": inResponse.networkInfo.profileId});
						}
					} else if (this.isInSecurityView()) {
						this.joinStateChanged(inResponse.networkInfo);
					} else if (!this.isInNetworkView()) {
						this.showNetworkList();

						// show active network if scan results haven't returned
						if (!this.data.length) {
							this.data.push({networkInfo: inResponse.networkInfo});
						}
					}

					enyo.asyncMethod(this, "associationStateChanged", inResponse.networkInfo);
				}
			} else {
				this.stopAutoScan('clear');
				this.showOffState();
			}
		}
	},

	handleNetworkStatusResponse: function (inSender, inResponse, inRequest) {
		if (!this.isInNetworkView()) {
			return;
		}

		if (undefined !== inResponse &&
				false === inResponse.isInternetConnectionAvailable &&
				undefined !== inResponse.wifi &&
				"connected" === inResponse.wifi.state) {

			switch (inResponse.wifi.onInternet) {
			case "no":
				this.doViewChange("NoInternet");
				return;
			default:
				break;
			}
		}
	},

	handleCertificateListResponse: function (inSender, inResponse, inRequest) {
		var disableList = false;

		this.certItems = [];

		if (undefined !== inResponse.userCertificateStore && 0 < inResponse.userCertificateStore.length) {
			var that = this;
			inResponse.userCertificateStore.forEach(function (cert, index) {
				var certName = (cert.commonname)? cert.commonname : cert.organization;
				that.certItems.push({
					caption: certName,
					value: index,
					id: cert.certificateId,
					path: cert.certificateFilename
				});
			});
			disableList = false;
		} else {
			this.certItems.push({
				caption: WiFiG11nResources.$L("None installed"),
				value: 0,
				id: -1,
				path: null
			});
			disableList = true;
		}

		this.$.certificateList.setDisabled(disableList);
		this.$.certificateList.setItems(this.certItems);
		this.$.certificateList.setValue(0);

		this.$.wapiRootCertificateList.setDisabled(disableList);
		this.$.wapiRootCertificateList.setItems(this.certItems);
		this.$.wapiRootCertificateList.setValue(0);

		this.$.wapiUserCertificateList.setDisabled(disableList);
		this.$.wapiUserCertificateList.setItems(this.certItems);
		this.$.wapiUserCertificateList.setValue(0);

		this.joinInfoChanged(null, null);
	},

	handleConnectResponse: function (inSender, inResponse, inRequest) {
		if (undefined !== inResponse &&
				undefined !== inResponse.profileId) {
			this.doNetworkSelectionChange(inResponse.profileId);
		}
	},

	handleFindNetworksResponse: function (inSender, inResponse, inRequest) {

		if (null === this.autoScan) {
			return;
		}

		if (undefined !== inResponse &&
				true === inResponse.returnValue &&
				undefined !== inResponse.foundNetworks) {
			this.data = inResponse.foundNetworks;
			
			if (this.$.searchMsg.getShowing()) {
				this.$.searchMsg.hide();
				this.$.searchSpinner.hide();
			}
		} else {
			alert("Error: Cannot Load Network List");
			this.data = [];
		}

		if (this.isInNetworkView()) {
			this.$.list.render();
		}
	},

	handleProfileInfoResponse: function (inSender, inResponse, inRequest) {
		if (undefined !== inResponse &&
				true === inResponse.returnValue &&
				inResponse.wifiProfile.profileId === this.joinedNetwork.profileId) {
			this.showIpConfig(inResponse);
		}
	},

	handleWiFiInfoResponse: function (inSender, inResponse, inRequest) {
		if (undefined !== inResponse &&
				undefined !== inResponse.wifiInfo &&
				"enabled" === inResponse.wifiInfo.wapi) {
			this.$.securityList.getItems().push({
				caption: WiFiG11nResources.$L("WAPI Personal"),
				value: "wapi-psk"
			});
			this.$.securityList.getItems().push({
				caption: WiFiG11nResources.$L("WAPI Enterprise"),
				value: "wapi-cert"
			});
		}
	},

	updateRow: function (inSender, inIndex) {
		var record = this.data[inIndex];
		if (record) {
			this.updateNetworkItem(record.networkInfo, inIndex);
			return true;
		}
	},

	itemClick: function (inSender, inEvent, inRowIndex) {
		var record = this.data[inRowIndex];
		if (record) {
			if ("ipConfigured" === record.networkInfo.connectState ||
					"ipFailed" === record.networkInfo.connectState) {
				this.$.GetProfileInfo.call({"profileId": record.networkInfo.profileId});
				return;
			} else if (undefined !== record.networkInfo.profileId &&
					undefined === record.networkInfo.lastConnectError) {
				this.delayAutoScan();
				this.$.Connect.call({"profileId": record.networkInfo.profileId});
				this.selectedNetwork = record.networkInfo;
				//this.$.list.renderRow(inRowIndex);
				this.$.list.render();
			} else if (undefined === record.networkInfo.securityType) {
				this.delayAutoScan();
				this.$.Connect.call({"ssid": record.networkInfo.ssid});
				this.selectedNetwork = record.networkInfo;
				//this.$.list.renderRow(inRowIndex);
				this.$.list.render();
			} else {
				this.doNetworkSelectionChange(0);
				this.showJoinSecureNetwork(record.networkInfo);
			}
		}
	},

	validatePasskey: function (type, key) {
		var hexPattern = new RegExp('^[A-Fa-f0-9]*$'),
			asciiPattern = new RegExp('^[\x00-\x7F]*$'),
			pass = false;

		if ("wep" === type) {
			switch (key.length) {
			case 5:		// 40-bit ASCII
			case 13:	// 104-bit ASCII
				if (asciiPattern.test(key)) {
					pass = true;
				}
				break;
			case 10:	// 40-bit HEX
			case 26:	// 104-bit HEX
				if (hexPattern.test(key)) {
					pass = true;
				}
				break;
			default:
				break;
			}
		} else if ("wpa-personal" === type) {
			if (8 <= key.length && 63 >= key.length) {
				pass = true;
			} else if (64 === key.length && hexPattern.test(key)) {
				pass = true;
			}
		} else if ("wapi-psk" === type) {
			if ((hexPattern.test(key) && 0 < key.length && !(key.length % 2)) ||
				(8 <= key.length && 63 >= key.length)) {
				pass = true;
			}
		}

		return pass;
	},

	isKeyInHex: function (type, key) {
		var hexPattern = new RegExp('^[A-Fa-f0-9]*$'),
			isInHex = false;

		if (hexPattern.test(key)) {
			if ("wep" === type &&
					(10 === key.length || 26 === key.length)) {
				isInHex = true;
			} else if ("wpa-personal" === type &&
					64 === key.length) {
				isInHex = true;
			} else if ("wapi-psk" === type) {
				isInHex = true;
			}
		}

		return isInHex;
	},

	ssidKeyDowned: function (inSender, inResponse) {
		if (inResponse.keyCode !== 13) {
			return;
		}
		if (this.$.usernameGroup.getShowing()) {
			this.$.joinUsername.forceFocus();
		} else if (this.$.passwordGroup.getShowing()) {
			this.$.joinPassword.forceFocus();
		} else if (!this.$.joinButton.getDisabled()) {
			this.$.joinSsid.forceBlur();
			this.$.joinButton.doClick();
		}
	},

	usernameKeyDowned: function (inSender, inResponse) {
		if (inResponse.keyCode !== 13) {
			return;
		}
		if (this.$.passwordGroup.getShowing()) {
			this.$.joinPassword.forceFocus();
		} else if (!this.$.joinButton.getDisabled()) {
			this.$.joinUsername.forceBlur();
			this.$.joinButton.doClick();
		}
	},

	passwordKeyDowned: function (inSender, inResponse) {
		if (inResponse.keyCode !== 13) {
			return;
		}
		if (!this.$.joinButton.getDisabled()) {
			this.$.joinPassword.forceBlur();
			this.$.joinButton.doClick();
		}
	},

	joinInfoChanged: function (inSender, inEvent) {
		var username = this.$.joinUsername.getValue(),
			password = this.$.joinPassword.getValue(),
			ssid     = this.$.joinSsid.getValue(),
			security = this.$.securityList.getValue();

		if (null !== this.selectedNetwork) {
			ssid = this.selectedNetwork.ssid;
			security = this.selectedNetwork.securityType;
		}

		if ("enterprise" === security) {
			if ("eapTls" === this.$.eapTypeList.getValue()) {
				if (0 < username.length && !this.$.certificateList.getDisabled()){
					this.disableJoinButtons(false);
				} else {
					this.disableJoinButtons(true);
				}
			} else if (0 < username.length && 0 < password.length) {
				this.disableJoinButtons(false);
			} else {
				this.disableJoinButtons(true);
			}


		} else if ("wpa-personal" === security || "wep" === security || "wapi-psk" === security) {

			this.updateHexCheckbox();

			if (this.validatePasskey(security, password)) {
				this.disableJoinButtons(false);
			} else {
				this.disableJoinButtons(true);
			}
		} else if ("wapi-cert" === security) {
			if (this.$.wapiRootCertificateList.getDisabled() ||
					this.$.wapiUserCertificateList.getDisabled()) {
				this.disableJoinButtons(true);
			}
			else {
				this.disableJoinButtons(false);
			}
		} else {
			this.disableJoinButtons(false);
		}

		if (!ssid.length || 32 < ssid.length) {
			this.disableJoinButtons(true);
		}

		this.$.joinMessage.setContent("");
		this.$.joinMessage.hide();
	},

	discardNetwork: function () {
		if (this.shouldDiscardNetwork) {
			this.doNetworkSelectionChange(0); // delete pending network
			this.shouldDiscardNetwork = false;
		}
		this.showNetworkList();
	},

	handleForgetNetwork: function () {
		this.joinedNetwork = null;
	},

	joinNetwork: function () {
		var username = this.$.joinUsername.getValue(),
			password = this.$.joinPassword.getValue(),
			ssid     = this.$.joinSsid.getValue(),
			security = this.$.securityList.getValue(),
			hidden   = true; 

		if (null !== this.selectedNetwork) {
			ssid = this.selectedNetwork.ssid;
			security = this.selectedNetwork.securityType;
			hidden = false;
		}

		this.shouldDiscardNetwork = true;

		switch (security) {
		case "wpa-personal":
			this.$.Connect.call({"ssid": ssid,
				"wasCreatedWithJoinOther": hidden,
				"security": {"securityType": security,
					"simpleSecurity": {"passKey": password,
						"isInHex": this.isKeyInHex(security, password)}}});
			break;
		case "wep":
			this.$.Connect.call({"ssid": ssid,
				"wasCreatedWithJoinOther": hidden,
				"security": {"securityType": security,
					"simpleSecurity": {"passKey": password,
						"keyIndex": this.$.keyIndexList.getValue(),
						"isInHex": this.isKeyInHex(security, password)}}});
			break;
		case "enterprise":
			if ("eapTls" === this.$.eapTypeList.getValue() &&
					undefined !== this.$.certificateList.getValue()) {
				this.$.Connect.call({"ssid": ssid,
					"wasCreatedWithJoinOther": hidden,
					"security": {"securityType": security,
						"enterpriseSecurity": {"userId": username,
							"password": password,
							"eapType": this.$.eapTypeList.getValue(),
							"verifyServerCert": this.$.certVerifyCheckbox.getChecked(),
							"clientCertificatePath": this.certItems[this.$.certificateList.getValue()].path}}});
			} else {
				this.$.Connect.call({"ssid": ssid,
					"wasCreatedWithJoinOther": hidden,
					"security": {"securityType": security,
						"enterpriseSecurity": {"userId": username,
							"password": password,
							"eapType": this.$.eapTypeList.getValue(),
							"verifyServerCert": this.$.certVerifyCheckbox.getChecked()}}});
			}
			break;
		case "wapi-psk":
			this.$.Connect.call({"ssid": ssid,
				"wasCreatedWithJoinOther": hidden,
				"security": {"securityType": security,
					"simpleSecurity": {"passKey": password,
						"isInHex": this.$.isInHexCheckbox.getChecked()}}});
			break;
		case "wapi-cert":
			this.$.Connect.call({"ssid": ssid,
				"wasCreatedWithJoinOther": hidden,
				"security": {"securityType": security,
					"simpleSecurity": {"rootCert": this.certItems[this.$.wapiRootCertificateList.getValue()].path,
						"userCert": this.certItems[this.$.wapiUserCertificateList.getValue()].path}}});
			break;
		default:
			this.$.Connect.call({"ssid": ssid, "wasCreatedWithJoinOther": hidden});
			break;
		}

		this.$.joinMessage.setContent("");
		this.$.joinMessage.hide();
		this.$.joinButton.setActive(true);
		this.$.joinButton.setCaption(WiFiG11nResources.$L("Signing In..."));
		this.stopAutoScan(null);
	},

	handleSecuritySelection: function () {
		this.updateSecurityView(this.$.securityList.getValue());
	},

	updateHexCheckbox: function () {
		// nothing to do if the checkbox is not showing
		if (!this.$.hexKeyGroup.getShowing()) {
			return;
		} else {
			var key = this.$.joinPassword.getValue();
			if (!this.isKeyInHex("wapi-psk", key)) {
				this.$.isInHexCheckbox.setChecked(false);
				this.$.isInHexCheckbox.setDisabled(true);
			} else {
				this.$.isInHexCheckbox.setDisabled(false);
			}
		}
	},

	updateFocus: function () {
		if (this.$.ssidGroup.getShowing() && "" === this.$.joinSsid.getValue()) {
			this.$.joinSsid.forceFocus();
			return;
		}
		if (this.$.usernameGroup.getShowing() && "" === this.$.joinUsername.getValue()) {
			this.$.joinUsername.forceFocus();
			return;
		}
		if (this.$.passwordGroup.getShowing() && "" === this.$.joinPassword.getValue()) {
			this.$.joinPassword.forceFocus();
			return;
		}
	},

	updateSecurityView: function (securityType) {
		switch (securityType) {
		case "none":
			this.$.usernameGroup.hide();
			this.$.passwordGroup.hide();
			this.$.keyIndexGroup.hide();
			this.$.hexKeyGroup.hide();
			this.$.auth8021xGroup.hide();
			this.$.authWapiGroup.hide();
			this.$.certificateGroup.hide();
			break;
		case "wpa-personal":
			this.$.usernameGroup.hide();
			this.$.passwordGroup.show();
			this.$.keyIndexGroup.hide();
			this.$.hexKeyGroup.hide();
			this.$.auth8021xGroup.hide();
			this.$.authWapiGroup.hide();
			this.$.certificateGroup.hide();
			break;
		case "wep":
			this.$.usernameGroup.hide();
			this.$.passwordGroup.show();
			this.$.keyIndexGroup.show();
			this.$.hexKeyGroup.hide();
			this.$.auth8021xGroup.hide();
			this.$.authWapiGroup.hide();
			this.$.certificateGroup.hide();
			break;
		case "wapi-psk":
			this.$.usernameGroup.hide();
			this.$.passwordGroup.show();
			this.$.keyIndexGroup.hide();
			this.$.hexKeyGroup.show();
			this.updateHexCheckbox();
			this.$.auth8021xGroup.hide();
			this.$.authWapiGroup.hide();
			this.$.certificateGroup.hide();
			break;

		case "enterprise":
			this.$.usernameGroup.show();
			this.$.keyIndexGroup.hide();
			this.$.hexKeyGroup.hide();
			this.$.auth8021xGroup.show();
			this.$.authWapiGroup.hide();
			if ("eapTls" === this.$.eapTypeList.getValue()) {
				this.$.passwordGroup.hide();
				this.$.certificateGroup.show();
				this.$.GetCertificateList.call({});
			} else {
				this.$.passwordGroup.show();
				this.$.certificateGroup.hide();	
			}
			break;
		case "wapi-cert":
			this.$.usernameGroup.hide();
			this.$.passwordGroup.hide();
			this.$.keyIndexGroup.hide();
			this.$.hexKeyGroup.hide();
			this.$.auth8021xGroup.hide();
			this.$.authWapiGroup.show();
			this.$.certificateGroup.hide();
			this.$.GetCertificateList.call({});
			break;
		}

		this.updateFocus();
		this.joinInfoChanged(null, null);
	},

	handleEapTypeSelection: function () {
		switch (this.$.eapTypeList.getValue()) {
		case "eapTls":
			this.$.certificateGroup.show();
			this.$.GetCertificateList.call({});
			this.$.passwordGroup.hide();
			break;
		default:
			this.$.certificateGroup.hide();
			this.$.passwordGroup.show();
			break;
		}
		this.$.joinMessage.setContent("");
		this.$.joinMessage.hide();
		this.joinInfoChanged(null, null);
	}
});

/******************************
WiFi - IP Configuration
******************************/
enyo.kind({
	name: "WiFiIpConfig",
	kind: "enyo.VFlexBox",
	lazy: false,
	events:	{
		onForget: "",
		onBack: ""
	},
	published: {
		joinedProfile: ""
	},
	components: [
		{name: "DeleteProfile", kind: "WiFiService", method: "deleteprofile", onFailure: "handleDeleteProfileFailure"},
		{name: "Connect", kind: "WiFiService", method: "connect", onFailure: "handleConnectFailure"},
		{kind: "Group", style: "margin-top: 15px;", components: [
			{kind: "Item", className: "enyo-single", align: "center", tapHighlight: false, layoutKind: "HFlexLayout", components: [
				{content: WiFiG11nResources.$L("Automatic IP settings"), flex: 1},
				{kind: "ToggleButton", name: "dhcpToggleButton", onChange: "handleDhcpToggleButton"}
			]}
		]},
		{kind: "Group", components: [
			{kind: "Item", className: "enyo-first", components: [
				{kind: "Input", name: "ipField", hint: WiFiG11nResources.$L("Enter IP address"), inputType: "number", autoKeyModifier: "num-lock", spellcheck: false, changeOnInput: true, onkeydown: "ipKeyDowned", onchange: "ipInfoChanged", components: [
					{content: WiFiG11nResources.$L("ADDRESS"), className: "wifi-label-text"}
				]}
			]},
			{kind: "Item", className: "enyo-middle", components: [
				{kind: "Input", name: "subnetField", hint: WiFiG11nResources.$L("Enter subnet mask"), inputType: "number", autoKeyModifier: "num-lock", spellcheck: false, changeOnInput: true, onkeydown: "subnetKeyDowned", onchange: "ipInfoChanged", components: [
					{content: WiFiG11nResources.$L("SUBNET"), className: "wifi-label-text"}
				]}
			]},
			{kind: "Item", className: "enyo-middle", components: [
				{kind: "Input", name: "gatewayField", hint: WiFiG11nResources.$L("Enter gateway address"), inputType: "number", autoKeyModifier: "num-lock", spellcheck: false, changeOnInput: true, onkeydown: "gatewayKeyDowned", onchange: "ipInfoChanged", components: [
					{content: WiFiG11nResources.$L("GATEWAY"), className: "wifi-label-text"}
				]}
			]},
			{kind: "Item", className: "enyo-middle", components: [
				{kind: "Input", name: "dns1Field", hint: WiFiG11nResources.$L("Enter primary DNS server"), inputType: "number", autoKeyModifier: "num-lock", spellcheck: false, changeOnInput: true, onkeydown: "dns1KeyDowned", onchange: "ipInfoChanged", components: [
					{content: WiFiG11nResources.$L("DNS SERVER"), className: "wifi-label-text"}
				]}
			]},
			{kind: "Item", className: "enyo-last", components: [
				{kind: "Input", name: "dns2Field", hint: WiFiG11nResources.$L("Enter secondary DNS server (optional)"), inputType: "number", autoKeyModifier: "num-lock", spellcheck: false, changeOnInput: true, onkeydown: "dns2KeyDowned", onchange: "ipInfoChanged", components: [
					{content: WiFiG11nResources.$L("DNS SERVER"), className: "wifi-label-text"}
				]}
			]}
		]},
		//{kind: "Button", caption: WiFiG11nResources.$L("Configure Proxy"), onclick: "handleConfigureProxyButton"},
		{kind: "Button", className: "enyo-button-negative", caption: WiFiG11nResources.$L("Forget Network"), onclick: "handleForgetNetworkButton"},
		{kind: "Button", name: "ipDoneButton", caption: WiFiG11nResources.$L("Done"), onclick: "handleDoneButton"}
	],
	create: function () {
		this.inherited(arguments);
	},
	joinedProfileChanged: function () {
		var profileInfo = this.joinedProfile.wifiProfile,
			emptyIp = "0.0.0.0",
			editable = false;
		if (undefined === this.joinedProfile.ipInfo ||
				emptyIp === this.joinedProfile.ipInfo.ip ||
				(undefined !== profileInfo.useStaticIp &&
				 true === profileInfo.useStaticIp)) {
			editable = true;
		}
		this.displayIpInfo(editable);
	},
	displayIpInfo: function (editable) {
		var emptyIp = "0.0.0.0",
			ipInfo = this.joinedProfile.ipInfo;

		this.$.dhcpToggleButton.setState(!editable);
		this.useStaticIp = editable;

		this.$.ipField.setValue("");
		this.$.subnetField.setValue("");
		this.$.gatewayField.setValue("");
		this.$.dns1Field.setValue("");
		this.$.dns2Field.setValue("");

		this.$.ipField.setDisabled(!editable);
		this.$.subnetField.setDisabled(!editable);
		this.$.gatewayField.setDisabled(!editable);
		this.$.dns1Field.setDisabled(!editable);
		this.$.dns2Field.setDisabled(!editable);

		if (undefined !== ipInfo) {
			if (undefined !== ipInfo.ip && emptyIp !== ipInfo.ip) {
				this.$.ipField.setValue(ipInfo.ip);
			}
			if (undefined !== ipInfo.subnet && emptyIp !== ipInfo.subnet) {
				this.$.subnetField.setValue(ipInfo.subnet);
			}
			if (undefined !== ipInfo.gateway && emptyIp !== ipInfo.gateway) {
				this.$.gatewayField.setValue(ipInfo.gateway);
			}
			if (undefined !== ipInfo.dns1) {
				this.$.dns1Field.setValue(ipInfo.dns1);
			}
			if (undefined !== ipInfo.dns2) {
				this.$.dns2Field.setValue(ipInfo.dns2);
			}
		}

		if (editable) {
			this.$.ipField.forceBlur();
		} else {
			this.$.ipDoneButton.setDisabled(false);
		}
	},

	handleDhcpToggleButton: function (inSender, inState) {
		this.displayIpInfo(!inState);
		if (!inState) {
			this.$.ipField.forceFocus();
		}
	},

	handleForgetNetworkButton: function () {
		var profileInfo = this.joinedProfile.wifiProfile;
		
		NetworkProxyConfigLib.removeProxyConfig({networkTechnology: "wifi",
				proxyScope: profileInfo.profileId}, {owner: this});

		this.doForget();		
		this.$.DeleteProfile.call({"profileId": profileInfo.profileId});
		this.doBack();
	},

	getIpV4Class: function (address) {
		var patternA = new RegExp('^(0?[0-9]?[0-9]|1[0-1][0-9]|12[0-7])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$');
		var patternB = new RegExp('^(12[8-9]|1[3-8][0-9]|19[0-1])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$');
		var patternC = new RegExp('^(19[2-9]|2[0-1][0-9]|22[0-3])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$');

		if (patternA.test(address)) {
			return 'A';
		}
		if (patternB.test(address)) {
			return 'B';
		}
		if (patternC.test(address)) {
			return 'C';
		}

		return 'F';
	},

	validateIpSettings: function (ipInfo) {
		var pattern = new RegExp('^([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$');

		var addressValid = (0 < ipInfo.ip.length && pattern.test(ipInfo.ip));
		var subnetValid = (0 < ipInfo.subnet.length && pattern.test(ipInfo.subnet));
		var gatewayValid = (!ipInfo.gateway.length || pattern.test(ipInfo.gateway)); // optional field
		var dns1Valid = (!ipInfo.dns1.length || pattern.test(ipInfo.dns1)); // optional field
		var dns2Valid = (!ipInfo.dns2.length || pattern.test(ipInfo.dns2)); // optional field

		return (addressValid && subnetValid && gatewayValid && dns1Valid && dns2Valid);
	},

	ipInfoChanged: function (inSender, inEvent) {
		if (this.useStaticIp) {
			var ipInfo = {
				ip: this.$.ipField.getValue(),
				subnet: this.$.subnetField.getValue(),
				gateway: this.$.gatewayField.getValue(),
				dns1: this.$.dns1Field.getValue(),
				dns2: this.$.dns2Field.getValue()
			};

			if (inSender === this.$.ipField && !ipInfo.subnet.length) {
				// automatically fill-in subnet field if it's empty
				var ipClass = this.getIpV4Class(ipInfo.ip);
				if ('A' === ipClass) {
					this.$.subnetField.setValue("255.0.0.0");
				} else if ('B' === ipClass) {
					this.$.subnetField.setValue("255.255.0.0");
				} else if ('C' === ipClass) {
					this.$.subnetField.setValue("255.255.255.0");
				}
			}

			if (this.validateIpSettings(ipInfo)) {
				this.$.ipDoneButton.setDisabled(false);
			} else {
				this.$.ipDoneButton.setDisabled(true);
			}
		}
		else {
			this.$.ipDoneButton.setDisabled(false);
		}
	},

	ipKeyDowned: function (inSender, inResponse) {
		if (inResponse.keyCode !== 13) {
			return;
		}
		this.$.subnetField.forceFocus();
	},

	subnetKeyDowned: function (inSender, inResponse) {
		if (inResponse.keyCode !== 13) {
			return;
		}
		this.$.gatewayField.forceFocus();
	},

	gatewayKeyDowned: function (inSender, inResponse) {
		if (inResponse.keyCode !== 13) {
			return;
		}
		this.$.dns1Field.forceFocus();
	},

	dns1KeyDowned: function (inSender, inResponse) {
		if (inResponse.keyCode !== 13) {
			return;
		}
		this.$.dns2Field.forceFocus();
	},

	dns2KeyDowned: function (inSender, inResponse) {
		if (inResponse.keyCode !== 13) {
			return;
		}
		this.$.dns2Field.forceBlur();
		if (!this.$.ipDoneButton.getDisabled()) {
			this.$.ipDoneButton.doClick();
		}
	},

	handleConfigureProxyButton: function () {
		NetworkProxyConfigLib.openProxyConfigUi({networkTechnology: "wifi",
				proxyScope: this.joinedProfile.wifiProfile.profileId}, {owner: this});
	},

	handleDoneButton: function () {
		var profileInfo = this.joinedProfile.wifiProfile,
			reconnect = false,
			valid,
			ipInfo = {
				ip: this.$.ipField.getValue(),
				subnet: this.$.subnetField.getValue(),
				gateway: this.$.gatewayField.getValue(),
				dns1: this.$.dns1Field.getValue(),
				dns2: this.$.dns2Field.getValue()
			};

		valid = this.validateIpSettings(ipInfo);

		if (undefined === profileInfo.useStaticIp ||
				false === profileInfo.useStaticIp) {
			if (true === this.useStaticIp && valid) {
				// old:dhcp, new:static, reconnect
				reconnect = true;
				profileInfo.ipInfo = ipInfo;
			}
		} else {
			if (true === this.useStaticIp && valid) {
				// old:static, new:static, reconnect if not the same
				if (profileInfo.ipInfo.ip !== ipInfo.ip ||
						profileInfo.ipInfo.subnet !== ipInfo.subnet ||
						profileInfo.ipInfo.gateway !== ipInfo.gateway ||
						profileInfo.ipInfo.dns1 !== ipInfo.dns1 ||
						profileInfo.ipInfo.dns2 !== ipInfo.dns2) {
					reconnect = true;
					profileInfo.ipInfo = ipInfo;
				}
			} else {
				// old:static, new:dhcp
				reconnect = true;
				profileInfo.ipInfo = undefined;
			}
		}

		profileInfo.useStaticIp = this.useStaticIp;
		if (reconnect) {
			this.$.Connect.call(profileInfo);
		} else {
			this.doBack();
		}
	}
});
