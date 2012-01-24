/**
A control that shows web content with built-in scroller.

	{kind: "WebView"}

The URL to load can be specified when declaring the instance, or by calling setUrl.

	{kind: "WebView", url: "http://www.google.com"}

	goToUrl: function(inUrl) {
		this.$.webView.setUrl(inUrl);
	}
*/
enyo.kind({
	name: "enyo.WebView",
	kind: enyo.Control,
	//* @public
	published: {
		/** page identifier, used to open new webviews for new window requests */
		identifier: "",
		/** url for page, updated as user navigates, relative URLs not allowed */
		url: "",
		/** smallest font size shown on the page, used to stop text from becoming unreadable */
		minFontSize: 16,
		/** boolean, allow page to run javascript */
		enableJavascript: true,
		/** boolean, allow page to request new windows to be opened */
		blockPopups: true,
		/** boolean, allow webview to accept cookies from server */
		acceptCookies: true,
		/** the height of the header to scroll with the webview **/
		headerHeight: 0,
		/** array of URL redirections specified as {regex: string, cookie: string, enable: boolean}. */
		redirects: [],
		/** the network interface */
		networkInterface: "",
		/** array of DNS servers */
		dnsServers: [],
		/** boolean, if set, page ignores viewport-related meta tags */
		ignoreMetaTags: false,
		/** boolean, if set (default) webkit will cache the plugin when the node is hidden. if your app explicitly destroys the plugin outside the app lifecycle, you must set this to false */
		cacheAdapter: true
	},
	events: {
		onMousehold: "",
		onResized: "",
		onPageTitleChanged: "",
		onUrlRedirected: "",
		onSingleTap: "",
		onLoadStarted: "",
		onLoadProgress: "",
		onLoadStopped: "",
		onLoadComplete: "",
		onFileLoad: "",
		onAlertDialog: "",
		onConfirmDialog: "",
		onPromptDialog: "",
		onSSLConfirmDialog: "",
		onUserPasswordDialog: "",
		onNewPage: "",
		onPrint: "",
		onEditorFocusChanged: "",
		onScrolledTo: "",
		onError: "",
		onDisconnected: ""
	},
	chrome: [
		{name: "view", kind: enyo.BasicWebView,
			onclick: "webviewClick",
			onMousehold: "doMousehold",
			onResized: "doResized",
			onPageTitleChanged: "pageTitleChanged",
			onUrlRedirected: "doUrlRedirected",
			onSingleTap: "doSingleTap",
			onLoadStarted: "doLoadStarted",
			onLoadProgress: "doLoadProgress",
			onLoadStopped: "doLoadStopped",
			onLoadComplete: "doLoadComplete",
			onFileLoad: "doFileLoad",
			onAlertDialog: "alertDialog",
			onConfirmDialog: "confirmDialog",
			onPromptDialog: "promptDialog",
			onSSLConfirmDialog: "sslConfirmDialog",
			onUserPasswordDialog: "userPasswordDialog",
			onOpenSelect: "showSelect",
			onNewPage: "doNewPage",
			onPrint: "doPrint",
			onEditorFocusChanged: "doEditorFocusChanged",
			onScrolledTo: "doScrolledTo",
			onConnected: "connected",
			onDisconnected: "disconnected",
			onError: "doError"
		},
		{name: "spinnerPopup", kind: "Popup", className: "enyo-webview-popup-spinner", scrim: true, components: [
			{name: "spinner", kind: "SpinnerLarge"}
		]}
	],
	_freeSelectPopups: [],
	_cachedSelectPopups: {},
	//* @protected
	create: function(inInfo) {
		// XXX hack to initialize the x-palm-cache-plugin property
		// before create, because this is the only time it is valid
		this.chrome[0].cacheAdapter = inInfo.cacheAdapter;
		this.inherited(arguments);
		this.identifierChanged();
		this.minFontSizeChanged();
		this.enableJavascriptChanged();
		this.blockPopupsChanged();
		this.acceptCookiesChanged();
		this.headerHeightChanged();
		this.addSystemRedirects();
		this.redirectsChanged();
		this.networkInterfaceChanged();
		this.ignoreMetaTagsChanged();
		this.urlChanged();
	},
	identifierChanged: function() {
		this.$.view.setIdentifier(this.identifier);
	},
	urlChanged: function(inOldUrl) {
		this.$.view.setUrl(this.url);
	},
	minFontSizeChanged: function() {
		this.$.view.setMinFontSize(this.minFontSize);
	},
	enableJavascriptChanged: function() {
		this.$.view.setEnableJavascript(this.enableJavascript);
	},
	blockPopupsChanged: function() {
		this.$.view.setBlockPopups(this.blockPopups);
	},
	acceptCookiesChanged: function() {
		this.$.view.setAcceptCookies(this.acceptCookies);
	},
	headerHeightChanged: function() {
		this.$.view.setHeaderHeight(this.headerHeight);
	},
	redirectsChanged: function(inOldRedirects) {
		this.$.view.setRedirects(this.redirects);
	},
	networkInterfaceChanged: function() {
		this.$.view.setNetworkInterface(this.networkInterface);
	},
	dnsServersChanged: function() {
		this.$.view.setDnsServers(this.dnsServers);
	},
	ignoreMetaTagsChanged: function() {
		this.$.view.setIgnoreMetaTags(this.ignoreMetaTags);
	},
	showSelect: function(inSender, inId, inItemsJson) {
		if (this._cachedSelectPopups[inId]) {
			this._cachedSelectPopups[inId]._response = -1;
			this.openSelect(this._cachedSelectPopups[inId]);
		} else {
			this.showSpinner();
			enyo.asyncMethod(this, "createSelectPopup", inId, inItemsJson);
		}
	},
	openSelect: function(inPopup) {
		var s = this._selectRect;
		if (s) {
			var p = inPopup.calcSize();
			var o = this.getOffset();
			var l = Math.max(0, s.right - (s.right - s.left)/2 - p.width/2);
			var t = Math.max(0, s.bottom - (s.bottom - s.top)/2 - p.height/2);
			inPopup.openAt({left: l + o.left, top: t + o.top});
		} else {
			inPopup.openAtCenter();
		}
	},
	createSelectPopup: function(inId, inItemsJson) {
		var p = this._freeSelectPopups.pop();
		if (!p) {
			p = this.createComponent({kind: "PopupList", name: "select-" + inId, _webviewId: inId, _response: -1, onSelect: "selectPopupSelect", onClose: "selectPopupClose"});
		} else {
			p._webviewId = inId;
			p._response = -1;
		}
		var listItems = [];
		var items = enyo.json.parse(inItemsJson);
		for (var i = 0, c; c = items.items[i]; i++) {
			listItems.push({caption: c.text, disabled: !c.isEnabled});
		}
		p.setItems(listItems);
		p.render();
		this._cachedSelectPopups[inId] = p;
		this.hideSpinner();
		this.openSelect(p);
	},
	selectPopupSelect: function(inSender, inSelected, inOldItem) {
		inSender._response = inSelected;
	},
	selectPopupClose: function(inSender) {
		// MenuItem calls close then doSelect, so wait for the function
		// to finish before replying to get the correct value.
		enyo.asyncMethod(this, "selectPopupReply", inSender);
	},
	selectPopupReply: function(inSender) {
		this.callBrowserAdapter("selectPopupMenuItem", [inSender._webviewId, inSender._response]);
	},
	connected: function() {
		this.hideSpinner();
	},
	disconnected: function() {
		var r = this._requestDisconnect;
		if (!this._requestDisconnect) {
			this.showSpinner();
			setTimeout(enyo.hitch(this, "reinitialize"), 5000);
		} else {
			this._requestDisconnect = false;
		}
		this.doDisconnected(r);
	},
	reinitialize: function() {
		this.$.view.connect();
	},
	showSpinner: function() {
		if (!this.$.spinnerPopup.isOpen) {
			this.$.spinnerPopup.validateComponents();
			this.$.spinner.show();
			this.$.spinnerPopup.openAtCenter();
		}
	},
	hideSpinner: function() {
		this.$.spinnerPopup.validateComponents();
		this.$.spinnerPopup.close();
		this.$.spinner.hide();
	},
	pageTitleChanged: function(inSender, inTitle, inUrl, inBack, inForward) {
		for (var p in this._cachedSelectPopups) {
			this._freeSelectPopups.push(this._cachedSelectPopups[p]);
		}
		this._cachedSelectPopups = {};
		this.doPageTitleChanged(inTitle, inUrl, inBack, inForward);
	},
	alertDialog: function() {
		this.handleDialog("AlertDialog", arguments);
	},
	confirmDialog: function() {
		this.handleDialog("ConfirmDialog", arguments);
	},
	promptDialog: function() {
		this.handleDialog("PromptDialog", arguments);
	},
	sslConfirmDialog: function() {
		this.handleDialog("SSLConfirmDialog", arguments);
	},
	userPasswordDialog: function() {
		this.handleDialog("UserPasswordDialog", arguments);
	},
	handleDialog: function(inEventType, inArgs) {
		var handler = this["on" + inEventType];
		if (this.owner && this.owner[handler]) {
			var args = Array.prototype.slice.call(inArgs, 1);
			this["do" + inEventType].apply(this, args);
		} else {
			this.cancelDialog();
		}
	},
	activate: function() {
		this.$.view.callBrowserAdapter("pageFocused", [true]);
	},
	deactivate: function() {
		this.$.view.callBrowserAdapter("pageFocused", [false]);
	},
	deferSetUrl: function(inUrl) {
		this.setUrl(inUrl);
	},
	resize: function() {
		// nop
	},
	resizeHandler: function() {
		this.$.view.resize();
	},
	//* @public
	/** disconnects this webview from the browser server */
	disconnect: function() {
		this.$.view.callBrowserAdapter("disconnectBrowserServer");
		this._requestDisconnect = true;
	},
	/** clears the browser cache */
	clearCache: function() {
		this.$.view.callBrowserAdapter("clearCache");
	},
	/** clears cookies */
	clearCookies: function() {
		this.$.view.callBrowserAdapter("clearCookies");
	},
	/** clears browser history */
	clearHistory: function() {
		this.$.view.clearHistory();
	},
	/** deletes an image from the filesystem */
	deleteImage: function(inPath) {
		this.$.view.callBrowserAdapter("deleteImage", [inPath]);
	},
	/** generates an icon from an image on the filesystem. only works with PNG files */
	generateIconFromFile: function(inPath, inIconPath, inLeft, inTop, inWidth, inHeight) {
		this.$.view.callBrowserAdapter("generateIconFromFile", [inPath, inIconPath, inLeft, inTop, inWidth, inHeight]);
	},
	/** go back one entry in history */
	goBack: function() {
		this.$.view.callBrowserAdapter("goBack");
	},
	/** go forward one entry in history */
	goForward: function() {
		this.$.view.callBrowserAdapter("goForward");
	},
	/** reloads the current page */
	reloadPage: function() {
		this.$.view.callBrowserAdapter("reloadPage");
	},
	/** resizes an image on the filesystem */
	resizeImage: function(inFromPath, inToPath, inWidth, inHeight) {
		this.$.view.callBrowserAdapter("resizeImage", [inFromPath, inToPath, inWidth, inHeight]);
	},
	//* @protected
	/** save a screenshot of the page to the filesystem */
	saveViewToFile: function(inPath, inLeft, inTop, inWidth, inHeight) {
		this.$.view.callBrowserAdapter("saveViewToFile", [inPath, inLeft, inTop, inWidth, inHeight]);
	},
	//* @public
	/** stop loading the current page */
	stopLoad: function() {
		this.$.view.callBrowserAdapter("stopLoad");
	},
	/** accepts the current dialog. */
	acceptDialog: function() {
		var args = [].slice.call(arguments);
		args.unshift("1");
		this.$.view.callBrowserAdapter("sendDialogResponse", args);
	},
	/** cancels the current dialog */
	cancelDialog: function() {
		this.$.view.callBrowserAdapter("sendDialogResponse", ["0"]);
	},
	/** responds to the current dialog */
	sendDialogResponse: function(inResponse) {
		this.$.view.callBrowserAdapter("sendDialogResponse", [inResponse]);
	},
	//* @protected
	inspectUrlAtPoint: function(inX, inY, inCallback) {
		this.$.view.callBrowserAdapter("inspectUrlAtPoint", [inX, inY, inCallback]);
	},
	//* @public
	/** if in an editable field, inserts a string at the current cursor position */
	insertStringAtCursor: function(inString) {
		this.$.view.callBrowserAdapter("insertStringAtCursor", [inString]);
	},
	/** saves the image at the specified position to the filesystem */
	saveImageAtPoint: function(inLeft, inTop, inDirectory, inCallback) {
		this.$.view.callBrowserAdapter("saveImageAtPoint", [inLeft, inTop, inDirectory, inCallback]);
	},
	//* @protected
	getImageInfoAtPoint: function(inX, inY, inCallback) {
		this.$.view.callBrowserAdapter("getImageInfoAtPoint", [inX, inY, inCallback]);
	},
	setHTML: function(inUrl, inBody) {
		this.$.view.callBrowserAdapter("setHTML", [inUrl, inBody]);
	},
	//* @public
	/** shows the print dialog to print the current page */
	printFrame: function(inName, inJobId, inWidth, inHeight, inDpi, inLandscape, inReverseOrder) {
		this.$.view.callBrowserAdapter("printFrame", [inName, inJobId, inWidth, inHeight, inDpi, inLandscape, inReverseOrder]);
	},
	//* @protected
	findInPage: function(inString) {
		// might not be working yet
		this.$.view.callBrowserAdapter("findInPage", [inString]);
	},
	getHistoryState: function(inCallback) {
		this.$.view.getHistoryState(inCallback);
	},
	//* XXX removeme
	redirectUrl: function(inRegex, inCookie, inEnable) {
		this.$.view.callBrowserAdapter("addUrlRedirect", [inRegex, inEnable, inCookie, 0]);
	},
	addSystemRedirects: function() {
		enyo.xhr.request({
			url: "/usr/palm/command-resource-handlers.json",
			method: "GET",
			callback: enyo.hitch(this, "gotSystemRedirects")
		});
	},
	gotSystemRedirects: function(inText, inXhr) {
		var resp = inXhr && enyo.json.parse(inXhr.responseText);
		var redirects = [];
		for (var i=0,r;resp && resp.redirects && (r=resp.redirects[i]);i++) {
			if (r.appId != enyo.fetchAppId()) {
				redirects.push({regex: r.url, enable: true, cookie: r.appId, type: 0});
			}
		}
		for (i=0,r;resp && resp.commands && (r=resp.commands[i]);i++) {
			if (r.appId != enyo.fetchAppId() && r.appId != "com.palm.app.browser") {
				redirects.push({regex: r.url, enable: true, cookie: r.appId, type: 1});
			}
		}
		this.$.view.setSystemRedirects(redirects);
	},
	callBrowserAdapter: function(inFuncName, inArgs) {
		this.$.view.callBrowserAdapter(inFuncName, inArgs);
	},
	webviewClick: function(inSender, inEvent, inInfo) {
		if (inInfo) {
			if (inInfo.element == "SELECT") {
				this._selectRect = inInfo.bounds;
			} else {
				this._selectRect = null;
			}
			this.doClick(inEvent, inInfo);
		}
	}
});

/*
On non-PalmSystem platforms, revert WebView to be an Iframe.
This allows basic use of WebView in a desktop browser.
*/
if (!window.PalmSystem) {
	enyo.WebView = enyo.Iframe;
}
