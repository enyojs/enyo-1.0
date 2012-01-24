//* @protected
// FIXME: experimental, NOT currently used
// in case we need to do weighted average 
// for gestures like enyo1 does
enyo.weightedAverage = {
	data: {},
	count: 4,
	weights: [1, 2, 4, 8],
	compute: function(inValue, inKind) {
		if (!this.data[inKind]) {
			this.data[inKind] = [];
		}
		var cache = this.data[inKind];
		cache.push(inValue);
		if (cache.length > this.count) {
			cache.shift();
		}
		for (var i=0, d=0, o=0, c, w; (c=cache[i]) && (w=this.weights[i]); i++) {
			o += c * w;
			d += w;
		}
		d = d || 1;
		o = o / d;
		return o;
	},
	clear: function(inKind) {
		this.data[inKind] = [];
	}
};

//* @protected
enyo.kind({
	name: "enyo.BasicWebView",
	kind: enyo.Control,
	//* @protected
	published: {
		identifier: "",
		url: "",
		minFontSize: 16,
		enableJavascript: true,
		blockPopups: true,
		acceptCookies: true,
		headerHeight: 0,
		redirects: [],
		systemRedirects: [],
		networkInterface: "",
		dnsServers: [],
		ignoreMetaTags: false,
		cacheAdapter: true
	},
	domAttributes: {
		"onblur": enyo.bubbler,
		"tabIndex": 0
	},
	requiresDomMousedown: true,
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
		onOpenSelect: "",
		onNewPage: "",
		onPrint: "",
		onEditorFocusChanged: "",
		onScrolledTo: "",
		onConnected: "",
		onDisconnected: "",
		onError: ""
	},
	//* @protected
	lastUrl: "",
	style: "display: block; -webkit-transform:translate3d(0,0,0)",
	//style: "border: 2px solid red;",
	nodeTag: "object",
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.history = [];
		this.callQueue = [];
		this.dispatcher = enyo.dispatcher;
		this.domAttributes.type = "application/x-palm-browser";
		this.log("cache", this.cacheAdapter);
		this.domAttributes["x-palm-cache-plugin"] = this.cacheAdapter;
		/*
		this._mouseInInteractive = false;
		this._mouseInFlash = false;
		*/
		this._flashGestureLock = false;
	},
	destroy: function() {
		this.callQueue = null;
		this.node.eventListener = null;
		this.inherited(arguments);
	},
	rendered: function() {
		this.inherited(arguments);
		if (this.hasNode()) {
			this.node.eventListener = this;
			// need to add event listeners for touch events for
			// webkit to send them to browser adapter
			this.node.addEventListener("touchstart", enyo.bind(this, "touchHandler"));
			this.node.addEventListener("touchmove", enyo.bind(this, "touchHandler"));
			this.node.addEventListener("touchend", enyo.bind(this, "touchHandler"));
			this.history = [];
			this.lastUrl = "";
			if (this.adapterReady()) {
				this.connect();
			}
		}
	},
	blurHandler: function() {
		if (window.PalmSystem) {
			window.PalmSystem.editorFocused(false, 0, 0);
		}
	},
	touchHandler: function() {
		// nop
	},
	// check to make sure the adapter is ready to receive commands. when
	// the node is hidden we cannot call adapter functions.
	adapterReady: function() {
		return this.hasNode() && this.node.openURL;
	},
	// (browser adapter callback) we only get this if the view is initially
	// hidden
	adapterInitialized: function() {
		this.log("node", this.hasNode(), "func", this.node && this.node.openUrl);
		this._serverConnected = false;
		this.connect();
	},
	// (browser adapter callback) called when the server is connected
	serverConnected: function() {
		this.log();
		this._serverConnected = true;
		this.initView();
		this.doConnected();
	},
	connect: function() {
		if (this.adapterReady() && !this._serverConnected) {
			this._connect();
			/*
			this._connectJob = enyo.job("browserserver-connect", enyo.hitch(this, "connect"), 500);
		} else {
			this._connectJob = null;
			*/
		}
	},
	_connect: function() {
		try {
			this.node.setPageIdentifier(this.identifier || this.id);
			this.node.connectBrowserServer();
		} catch (e) {
			// eat the exception, this is expected while browserserver
			// is starting up
		}
	},
	initView: function() {
		if (this.adapterReady() && this._serverConnected) {
			this.cacheBoxSize();
			this.node.interrogateClicks(false);
			this.node.setShowClickedLink(true);
			this.node.pageFocused(true);
			this.blockPopupsChanged();
			this.acceptCookiesChanged();
			this.enableJavascriptChanged();
			this.systemRedirectsChanged();
			this.redirectsChanged();
			this.updateViewportSize();
			this.minFontSizeChanged();
			this.urlChanged();
			
		}
	},
	//* @public
	// NOTE: to be called manually when browser should be resized.
	resize: function() {
		var s = enyo.fetchControlSize(this);
		if (this._boxSize && (this._boxSize.w != s.w || this._boxSize.h != s.h)) {
			this.cacheBoxSize();
		}
		this.updateViewportSize();
	},
	//* @protected
	// save our current containing box size;
	// we use this to determine if we need to resize
	cacheBoxSize: function() {
		this._boxSize = enyo.fetchControlSize(this);
		this.applyStyle("width", this._boxSize.w + "px");
		this.applyStyle("height", this._boxSize.h + "px");
	},
	//* @protected
	// this tells the adapter how big the plugin is.
	updateViewportSize: function() {
		var b = enyo.calcModalControlBounds(this);
		if (b.width && b.height) {
			this.callBrowserAdapter("setVisibleSize", [b.width, b.height]);
		}
	},
	urlChanged: function() {
		if (this.url) {
			this.callBrowserAdapter("openURL", [this.url]);
		}
	},
	minFontSizeChanged: function() {
		this.callBrowserAdapter("setMinFontSize", [Number(this.minFontSize)]);
	},
	/*
	dispatchDomEvent: function(inEvent) {
		var r = true;	
		var pass = (inEvent.type == "gesturechange" || inEvent.type == "gesturestart" || inEvent.type == "gestureend");
		var left = inEvent.centerX || inEvent.clientX || inEvent.pageX;
		var top = inEvent.centerY || inEvent.clientY || inEvent.pageY;
		if (inEvent.preventDefault && (left < 0 || top < 0)) {
			inEvent.preventDefault();
			return true;
		}
		//this.log('type: ' + inEvent.type + ' pass: ' + pass + ' flashGestureLock: ' + this._flashGestureLock + ' mouseInFlash: ' + this._mouseInFlash + ' mouseInInteractive: ' + this._mouseInInteractive);
		if (pass || (!this._flashGestureLock && !this._mouseInInteractive) || (this._flashGestureLock && !this._mouseInFlash)) {
			r = this.inherited(arguments);
		}
		return r;
	},
	*/
	dragstartHandler: function() {
		// prevent dragging event from bubbling when dragging in webview
		return true;
	},
	flickHandler: function(inSender, inEvent) {
		this.callBrowserAdapter("handleFlick", [inEvent.xVel, inEvent.yVel]);
		// prevent flick event from bubbling when flicking in webview
		return true;
	},
	enableJavascriptChanged: function() {
		this.callBrowserAdapter("setEnableJavaScript", [this.enableJavascript]);
	},
	blockPopupsChanged: function() {
		this.callBrowserAdapter("setBlockPopups", [this.blockPopups]);
	},
	acceptCookiesChanged: function() {
		this.callBrowserAdapter("setAcceptCookies", [this.acceptCookies]);
	},
	headerHeightChanged: function() {
		this.callBrowserAdapter("setHeaderHeight", [this.headerHeight]);
	},
	systemRedirectsChanged: function(inOldRedirects) {
		this._redirectsChanged(this.systemRedirects, inOldRedirects);
	},
	redirectsChanged: function(inOldRedirects) {
		this._redirectsChanged(this.redirects, inOldRedirects);
	},
	_redirectsChanged: function(inRedirects, inOldRedirects) {
		for (var i=0, r; r=inOldRedirects && inOldRedirects[i]; i++) {
			this.callBrowserAdapter("addUrlRedirect", [r.regex, false, r.cookie, r.type || 0]);
		}
		for (i=0, r; r=inRedirects[i]; i++) {
			this.callBrowserAdapter("addUrlRedirect", [r.regex, r.enable, r.cookie, r.type || 0]);
		}
	},
	networkInterfaceChanged: function() {
		if (this.networkInterface) {
			this.callBrowserAdapter("setNetworkInterface", [this.networkInterface]);
		}
	},
	dnsServersChanged: function() {
		if (this.networkInterface) {
			var serverList = this.dnsServers.join(",");
			this.callBrowserAdapter("setDNSServers", [serverList]);
		}
	},
	ignoreMetaTagsChanged: function() {
		this.callBrowserAdapter("ignoreMetaTags", [this.ignoreMetaTags]);
	},
	//* @public
	clearHistory: function() {
		this.callBrowserAdapter("clearHistory");
	},
	//* @protected
	cutHandler: function() {
		this.callBrowserAdapter("cut");
	},
	copyHandler: function() {
		this.callBrowserAdapter("copy");
	},
	pasteHandler: function() {
		this.callBrowserAdapter("paste");
	},
	selectAllHandler: function() {
		this.callBrowserAdapter("selectAll");
	},
	// attempt to call a method on the browser adapter; if the adapter is not
	// ready the call will be added to the call queue. The call queue is
	// flushed next time this api is called.
	//* @public
	callBrowserAdapter: function(inFuncName, inArgs) {
		//this.log("node", this.hasNode(), "func", inFuncName, "?", this.node && this.node[inFuncName], "connected", this._serverConnected);
		if (this.adapterReady() && this._serverConnected) {
			// flush the call queue first
			for (var i=0,q; q=this.callQueue[i]; i++) {
				this._callBrowserAdapter(q.name, q.args);
			}
			this.callQueue = [];
			this._callBrowserAdapter(inFuncName, inArgs);
		} else if (inFuncName !== "disconnectBrowserServer") {
			this.log("queued!", inFuncName);
			this.callQueue.push({name: inFuncName, args: inArgs});
			if (this.adapterReady() && !this._serverConnected) {
				this.connect();
			}
		}
	},
	//* @protected
	_callBrowserAdapter: function(inFuncName, inArgs) {
		// do not log the arguments to setHTML for privacy reasons
		if (inFuncName == "setHTML") {
			this.log(inFuncName);
		} else {
			this.log(inFuncName, inArgs);
		}
		if (this.node[inFuncName]) {
			this.node[inFuncName].apply(this.node, inArgs);
		} else {
			this.log("no such function", inFuncName);
		}
	},
	showFlashLockedMessage: function() {
		if (this.flashPopup == null) {
			// Note: the html break in the message is intentional
			// (requested by HI)
			this.flashPopup = this.createComponent({kind: "Popup", modal: true, style: "text-align:center", components: [{content: $L("Tap outside or pinch when finished")}]});
			this.flashPopup.render();
			if (this.flashPopup.hasNode()) {
				this.flashTransitionEndHandler = enyo.bind(this, "flashPopupTransitionEndHandler");
				this.flashPopup.node.addEventListener("webkitTransitionEnd", this.flashTransitionEndHandler, false);
			}
		}
		this.flashPopup.applyStyle("opacity", 1);
		this.flashPopup.openAtCenter();
		enyo.job(this.id + "-hideFlashPopup", enyo.bind(this, "hideFlashLockedMessage"), 2000);
	},
	hideFlashLockedMessage: function() {
		this.flashPopup.addClass("enyo-webview-flashpopup-animate");
		this.flashPopup.applyStyle("opacity", 0);
	},
	flashPopupTransitionEndHandler: function() {
		this.flashPopup.removeClass("enyo-webview-flashpopup-animate");
		this.flashPopup.close();
	},
	// (browser adapter callback) reports page url, title and if it's possible
	// to go back/forward
	urlTitleChanged: function(inUrl, inTitle, inCanGoBack, inCanGoForward) {
		this.lastUrl = this.url;
		this.url = inUrl;
		this.doPageTitleChanged(enyo.string.escapeHtml(inTitle), inUrl, inCanGoBack, inCanGoForward);
	},
	// (browser adapter callback) used to store history and generate event
	loadStarted: function() {
		this.log();
		this.doLoadStarted();
	},
	// (browser adapter callback) generates event that can be used to show
	// load progress
	loadProgressChanged: function(inProgress) {
		this.doLoadProgress(inProgress);
	},
	// (browser adapter callback) used to restore history and generate event
	loadStopped: function() {
		this.log();
		this.doLoadStopped();
	},
	// (browser adapter callback) generates event
	documentLoadFinished: function() {
		this.log();
		this.doLoadComplete();
	},
	// (browser adapter callback) generates event
	mainDocumentLoadFailed: function(domain, errorCode, failingURL, localizedMessage) {
		this.doError(errorCode, localizedMessage + ": " + failingURL);
	},
	// (browser adapter callback) ?
	linkClicked : function(url) {
		//this.log(url);
	},
	// (browser adapter callback) called when loading a URL that should
	// be redirected
	urlRedirected: function(inUrl, inCookie) {
		this.doUrlRedirected(inUrl, inCookie);
	},
	// working
	updateGlobalHistory: function(url, reload) {
		//this.log(url);
	},
	// working
	firstPaintCompleted: function() {
		//this.log();
	},
	// (browser adapter callback) used to show/hide virtual keyboard when
	// input field is focused
	editorFocused: function(inFocused, inFieldType, inFieldActions) {
		if (window.PalmSystem) {
			if (inFocused) {
				this.node.focus();
			}
			window.PalmSystem.editorFocused(inFocused, inFieldType, inFieldActions);
		}
		this.doEditorFocusChanged(inFocused, inFieldType, inFieldActions);
	},
	// (browser adapter callback) called when the webview scrolls.
	scrolledTo: function(inX, inY) {
		this.doScrolledTo(inX, inY);
	},
	// (browser adapter callback) called to close a list selector
	// gets called after we send a response, so no need to do anything
	// hideListSelector: function(inId) {
	// },
	// (browser adapter callback) called to open an alert dialog
	dialogAlert: function(inMsg) {
		this.doAlertDialog(inMsg);
	},
	// (browser adapter callback) called to open a confirm dialog
	dialogConfirm: function(inMsg) {
		this.doConfirmDialog(inMsg);
	},
	// (browser adapter callback) called to open a prompt dialog
	dialogPrompt: function(inMsg, inDefaultValue) {
		this.doPromptDialog(inMsg, inDefaultValue);
	},
	// (browser adapter callback) called to open a SSL confirm dialog
	dialogSSLConfirm: function(inHost, inCode, inCertFile) {
		this.doSSLConfirmDialog(inHost, inCode, inCertFile);
	},
	// (browser adapter callback) called to open a user/password dialog
	dialogUserPassword: function(inMsg) {
		this.doUserPasswordDialog(inMsg);
	},
	// (browser adapter callback) called when loading an unsupported MIME type
	mimeNotSupported: function(inMimeType, inUrl) {
		this.doFileLoad(inMimeType, inUrl);
	},
	// (browser adapter callback) called when loading an unsupported MIME type
	mimeHandoffUrl: function(inMimeType, inUrl) {
		this.doFileLoad(inMimeType, inUrl);
	},
	// (browser adapter callback) called when mouse moves in or out of a
	// non-flash interactive rect
	mouseInInteractiveChange: function(inInteractive) {
		//this.log(inInteractive);
		this._mouseInInteractive = inInteractive;
	},
	// (browser adapter callback) called when mouse moves in or out of a
	// flash rect 
	mouseInFlashChange: function(inFlash) {
		//this.log(inFlash);
		this._mouseInFlash = inFlash;
	},
	// (browser adapter callback) called when flash "gesture lock" state
	// changes
	flashGestureLockChange: function(enabled) {
		//this.log(enabled);
		this._flashGestureLock = enabled;

                if (this._flashGestureLock) {
                    this.showFlashLockedMessage();
                }
	},
	/**
	(browser adapter callback) called when browser needs to create
	a new card. (e.g. links with target)
	**/
	createPage: function(inIdentifier) {
		this.doNewPage(inIdentifier);
	},
	/**
	(browser adapter callback) called when the browser needs to scroll
	the page. (e.g. named anchors)
	**/
	scrollTo: function(inLeft, inTop) {
		// nop
	},
	/**
	(browser adapter callback) called when found a meta viewport tag
	**/
	metaViewportSet: function(inInitialScale, inMinimumScale, inMaximumScale, inWidth, inHeight, inUserScalable) {
		// nop
	},
	/**
	(browser adapter callback) called when browser server disconnected
	**/
	browserServerDisconnected: function() {
		this.log();
		this._serverConnected = false;
		this.doDisconnected();
	},
	/**
	(browser adapter callback) called when web page  requests print
	**/
	showPrintDialog: function() {
		this.doPrint();
	},
	/**
	(browser adapter callback) called when text caret position is updated
	**/
	textCaretRectUpdate: function(inLeft, inTop, inRight, inBottom) {
		// nop
	},
	/**
	(browser adapter callback)
	**/
	eventFired: function(inEvent, inInfo) {
		var e = {type:inEvent.type, pageX:inEvent.pageX, pageY:inEvent.pageY};
		var h = {
			isNull: inInfo.isNull,
			isLink: inInfo.isLink,
			isImage: inInfo.isImage,
			x: inInfo.x,
			y: inInfo.y,
			bounds: {
				left: inInfo.bounds && inInfo.bounds.left || 0,
				top: inInfo.bounds && inInfo.bounds.top || 0,
				right: inInfo.bounds && inInfo.bounds.right || 0,
				bottom: inInfo.bounds && inInfo.bounds.bottom || 0
			},
			element: inInfo.element,
			title: inInfo.title,
			linkText: inInfo.linkText,
			linkUrl: inInfo.linkUrl,
			linkTitle: inInfo.linkTitle,
			altText: inInfo.altText,
			imageUrl: inInfo.imageUrl,
			editable: inInfo.editable,
			selected: inInfo.selected
		};
		var fn = "do" + inEvent.type.substr(0, 1).toUpperCase() + inEvent.type.substr(1);
		return this[fn].apply(this, [e, h]);
	},
	// renamed browser adapter callbacks:
	// (browser adapter callback) renamed to showListSelector
	showPopupMenu: function(inId, inItemsJson) {
		this.doOpenSelect(inId, inItemsJson);
	},
	// (browser adapter callback) renamed to documentLoadFinished
	didFinishDocumentLoad: function() {
		this.documentLoadFinished();
	},
	// (browser adapter callback) renamed to loadFailed
	failedLoad: function(domain, errorCode, failingURL, localizedMessage) {
	},
	// (browser adapter callback) renamed to mainDocumentLoadFailed
	setMainDocumentError: function(domain, errorCode, failingURL, localizedMessage) {
		this.mainDocumentLoadFailed(domain, errorCode, failingURL, localizedMessage);
	},
	// (browser adapter callback) renamed to firstPaintCompleted
	firstPaintComplete: function() {
		this.firstPaintCompleted();
	},
	// (browser adapter callback) renamed to loadProgressChanged
	loadProgress: function(inProgress) {
		this.loadProgressChanged(inProgress);
	},
	// (browser adapter callback) renamed to pageDimensionsChanged
	pageDimensions: function(width, height) {
		// nop
	},
	// (browser adapter callback) renamed to smartZoomAreaFound
	smartZoomCalculateResponseSimple: function(left, top, right, bottom, centerX, centerY, spotlightHandle) {
		// nop
	},
	// (browser adapter callback) renamed to urlTitleChanged
	titleURLChange: function(inTitle, inUrl, inCanGoBack, inCanGoForward) {
		this.urlTitleChanged(inUrl, inTitle, inCanGoBack, inCanGoForward);
	}
});
