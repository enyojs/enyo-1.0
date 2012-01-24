G11N_RB = {
  "$L" : function(inText) {
    if (!this.rb) {
      this.rb = new enyo.g11n.Resources({
        root : "$enyo-lib/captiveportal"
      });
    }
    return this.rb.$L(inText);
  },
  reload : function(locale) {
    this.rb = new enyo.g11n.Resources({
      root : "$enyo-lib/captiveportal",
      locale : locale
    });
  }
};

enyo.kind({
  name : "ConManService",
  kind : "PalmService",
  service : "palm://com.palm.connectionmanager/"
});

enyo.kind({
  name : "NoFocusButton",
  kind : "Button",
  requiresDomMousedown : true,
  // * @protected
  mousedownHandler : function(inSender, inEvent) {
    this.inherited(arguments);
    inEvent.preventDefault();
  }
});

enyo.kind({
  name : "AcceptCancelPopup",
  kind : "ModalDialog",
  published : {
    acceptCaption : $L("OK"),
    cancelCaption : $L("Cancel")
  },
  events : {
    onAccept : "",
    onResponse : ""
  },
  chrome : [
    {
      className : "enyo-modaldialog-container",
      components : [
          {
            name : "modalDialogTitle",
            className : "enyo-modaldialog-title"
          }, {
            name : "client"
          }, {
            kind : enyo.HFlexBox,
            components : [
                {
                  name : "cancel",
                  kind : "NoFocusButton",
                  flex : 1,
                  onclick : "cancelClick"
                }, {
                  name : "accept",
                  kind : "NoFocusButton",
                  flex : 1,
                  onclick : "acceptClick"
                }
            ]
          }
      ]
    }
  ],
  // * @protected
  accepted : false,
  componentsReady : function() {
    this.inherited(arguments);
    this.acceptCaptionChanged();
    this.cancelCaptionChanged();
  },
  acceptCaptionChanged : function() {
    if (this.acceptCaption) {
      this.$.accept.setCaption(this.acceptCaption);
      this.$.accept.show();
    } else {
      this.$.accept.hide();
    }
  },
  cancelCaptionChanged : function() {
    if (this.cancelCaption) {
      this.$.cancel.setCaption(this.cancelCaption);
      this.$.cancel.show();
    } else {
      this.$.cancel.hide();
    }
  },
  acceptClick : function() {
    this.accepted = true;
    this.doAccept();
    this.close();
  },
  cancelClick : function() {
    this.accepted = false;
    this.close();
  },
  prepareClose : function() {
    this.inherited(arguments);
    this.sendResponse(this.accepted);
  },
  sendResponse : function(inAccepted) {
    this.doResponse(this.accepted);
  },

  openPopup : function(inMsg) {
    this.accepted = false;
    this.openAtCenter();
  },
});

enyo.kind({
  name : "VerticalAcceptCancelPopup",
  kind : "AcceptCancelPopup",
  chrome : [
    {
      className : "enyo-modaldialog-container",
      components : [
          {
            name : "modalDialogTitle",
            className : "enyo-modaldialog-title"
          }, {
            name : "client"
          }, {
            kind : enyo.VFlexBox,
            components : [
                {
                  name : "accept",
                  kind : "NoFocusButton",
                  flex : 1,
                  onclick : "acceptClick"
                }, {
                  name : "cancel",
                  kind : "NoFocusButton",
                  flex : 1,
                  onclick : "cancelClick"
                }
            ]
          }
      ]
    }
  ]
});

enyo.kind({
  name : "CaptivePortalControl",
  kind : enyo.Control,

  published : {
    captivePortalNwInterface : "",
    captivePortalNwStatus : "",
    captivePortalShowChooseNetworkButton : false,
    captivePortalSuppressPopups : false
  },

  events : {
    onNetworkStatusChanged : "",
    onChooseNewNetwork : ""
  },

  components : [
      {
        name : "pane",
        kind : "Pane",
        className : "enyo-fit",
        components : [
          {
            kind : "VFlexBox",
            flex : 1,
            components : [
                {
                  kind : "PageHeader",
				  className: "enyo-toolbar-light",
				  style: "height:54px;",
				  align: "center",
				  pack: "center",	
                  components : [
                      {
                        kind : "Image",
                        src : "$enyo-lib/captiveportal/images/icon-cap-port-id.png",
						style:"margin: -10px 0 0 0;"
                      }, 
					  {
                        content : G11N_RB.$L("Network Login"),
						style:"margin: -10px 0 0 5px;"
                      }
                  ]
                }, {
                  name : "progressBar",
                  kind : "ProgressBar",
                  className : "url-progress invisible",
                  animatePosition : false
                }, {
                  name : "capPortalWebView",
                  kind : window.PalmSystem ? enyo.WebView : "Iframe",
                  flex : 1,
                  minFontSize : 2,
                  onError : "onWebViewErrorEvent",
                  onAlertDialog : "onWebViewAlertEvent",
                  onConfirmDialog : "onWebViewConfirmEvent",
                  onPromptDialog : "onWebViewPromptEvent",
                  onSSLConfirmDialog : "onWebViewSSLConfirmEvent",
                  onLoadProgress : "onWebViewLoadProgress",
                  onLoadComplete : "onWebViewLoadComplete"
                }, {
                  kind : "Toolbar",
                  className : "enyo-toolbar-light",
                  components : [
                      {
                        kind : "ToolButton",
                        name : "backButton",
                        icon : "$enyo-lib/captiveportal/images/icon-cap-port-back.png",
                        disabled : true,
                        className : "enyo-light-menu-button",
                        onclick : "doBack"
                      }, {
                        kind : "Spacer"
                      }, {
                        kind : "Button",
                        name : "chooseNetworkButton",
                        style : "padding:0;",
                        caption : G11N_RB.$L("Choose a different network"),
                        showing : this.captivePortalShowChooseNetworkButton,
                        onclick : "chooseNewNwButtonClick"
                      }, {
                        kind : "Spacer"
                      }
                  ]
                }, {
                  name : "dialog",
                  kind : "VerticalAcceptCancelPopup",
                  cancelCaption : "",
                  components : [
                      {
                        name : "dialogTitle",
                        classNAme : "enyo-dialog-prompt-title"
                      }, {
                        name : "dialogMessage",
                        className : "browser-dialog-body enyo-text-body "
                      }
                  ]
                }, {
                  name : "alertDialog",
                  kind : "AcceptCancelPopup",
                  cancelCaption : "",
                  onResponse : "sendDialogResponse",
                  components : [
                    {
                      name : "alertMessage",
                      className : "browser-dialog-body enyo-text-body "
                    }
                  ]
                }, {
                  name : "confirmDialog",
                  kind : "VerticalAcceptCancelPopup",
                  onResponse : "sendDialogResponse",
                  components : [
                    {
                      name : "confirmMessage",
                      className : "browser-dialog-body enyo-text-body "
                    }
                  ]
                }, {
                  name : "promptDialog",
                  kind : "AcceptCancelPopup",
                  cancelCaption : "",
                  onResponse : "promptResponse",
                  onClose : "closePrompt",
                  components : [
                      {
                        name : "promptMessage",
                        className : "browser-dialog-body enyo-text-body "
                      }, {
                        name : "promptInput",
                        kind : "Input",
                        spellcheck : false,
                        autocorrect : false,
                        autoCapitalize : "lowercase"
                      }
                  ]
                }, {
                  name : "loginDialog",
                  kind : "AcceptCancelPopup",
                  onResponse : "loginResponse",
                  onClose : "closeLogin",
                  components : [
                      {
                        name : "loginMessage",
                        className : "browser-dialog-body enyo-text-body "
                      }, {
                        name : "userInput",
                        kind : "Input",
                        spellcheck : false,
                        autocorrect : false,
                        autoCapitalize : "lowercase",
                        hint : $L("Username...")
                      }, {
                        name : "passwordInput",
                        kind : "PasswordInput",
                        hint : $L("Password...")
                      }
                  ]

                }, {
                  name : "popupConnected",
                  kind : "Popup",
                  dismissWithClick : false,
                  modal : true,
                  components : [
                      {
                        content : G11N_RB.$L("Network Has Been Connected to the Internet")
                      }, {
                        kind : "Button",
                        caption : G11N_RB.$L("Dismiss"),
                        onclick : "netStateButtonClick"
                      }
                  ]
                }, {
                  name : "popupNotConnected",
                  kind : "Popup",
                  dismissWithClick : false,
                  modal : true,
                  components : [
                      {
                        content : G11N_RB.$L("Network has been disconnected")
                      }, {
                        kind : "Button",
                        caption : G11N_RB.$L("Dismiss"),
                        onclick : "netStateButtonClick"
                      }
                  ]
                }
            ]
          }
        // VFlexBox
        ]
      }, // Pane
      {
        kind : "ConManService",
        components : [
            {
              name : "getNetworkStatus",
              method : "getStatus",
              subscribe : true,
              resubscribe : true,
              onResponse : "handleGetConManStatusResponse"
            }, {
              name : "checkNetworkConnectivity",
              method : "checkNetworkConnectivity",
              onResponse : "handleConManCheckNetworkResponse"
            }, {
              name : "getActiveDnsServers",
              method : "getActiveDnsServers",
              onResponse : "handleGetConManDnsServerRequestResponse"
            }
        ]
      }
  ],

  create : function() {
    this.log("CaptivePortalControl::create");
    this._lastProgress = 0;
    this.inherited(arguments);
    this.$.progressBar.setPosition(0);
    this.captivePortalNwStatus = "captivePortal";
    if (window.PalmSystem) {
      this.$.capPortalWebView.callBrowserAdapter("addUrlRedirect", [
          "^https?:", false, "", 0
      ]);
    }
    if (window.PalmSystem) {
      this.$.capPortalWebView.setIdentifier(enyo.windowParams.webviewId);
    }
    this.$.getNetworkStatus.call({});
    this.captivePortalNwInterfaceChanged();
    if (!this.captivePortalShowChooseNetworkButton) {
      this.$.chooseNetworkButton.hide();
    }
    this.$.backButton.hide();
  },

  urlToGoTo : "http://www.hpwebos.com/",
  // urlToGoTo: "http://www.w3schools.com/js/js_popup.asp",
  // urlToGoTo: "http://www.w3schools.com/js/tryit.asp?filename=tryjs_alert",
  // urlToGoTo: "http://www.w3schools.com/js/tryit.asp?filename=tryjs_confirm",
  // urlToGoTo: "http://www.w3schools.com/js/tryit.asp?filename=tryjs_prompt",

  destroy : function() {
    this.log("CaptivePortalControl::destroy");
    this.$.checkNetworkConnectivity.call({});
  },
  reloadResources : function(locale) {

    if (locale) {
      G11N_RB.reload(locale);
    }

  },
  resize : function() {
    this.log("CaptivePortalControl::resize");
    this.$.capPortalWebView.resize();
  },

  captivePortalNwInterfaceChanged : function(inOldIf) {
    this.log("CaptivePortalControl::captivePortalNwInterfaceChanged ##Param Change:", this.captivePortalNwInterface);
    this.$.getActiveDnsServers.call({
      ifName : this.captivePortalNwInterface
    });
  },

  doBack : function() {
    this.log("CaptivePortalControl::doBack");
    this.$.capPortalWebView.goBack();
  },

  netStateButtonClick : function() {
    this.log("CaptivePortalControl::netStateButtonClick");
    this.$.popupConnected.close();
    this.$.popupNotConnected.close();
    this.doNetworkStatusChanged({
      networkStatus : this.captivePortalNwStatus
    });
  },

  chooseNewNwButtonClick : function() {
    this.log("CaptivePortalControl::chooseNewNwButtonClick");
    this.doChooseNewNetwork();
  },

  handleGetConManDnsServerRequestResponse : function(inSender, inResponse) {
    this.log("CaptivePortalControl::handleGetConManDnsServerRequestResponse #### ", inResponse);
    this.$.capPortalWebView.setNetworkInterface(this.captivePortalNwInterface);

    if (null == inResponse || null == inResponse.results || false == inResponse.returnValue) {
      this.log("CaptivePortalControl::handleConManDnsServerRequestResp getDnsServers For This If Request Failed");
    } else if (inResponse.results.length > 0) {
      this.log("CaptivePortalControl::handleConManDnsServerRequestResp setting dns servers: " + inResponse.results[0].dnsServers.join(","));
      this.$.capPortalWebView.setDnsServers(inResponse.results[0].dnsServers);
    }

    this.$.capPortalWebView.setUrl(this.urlToGoTo);
  },

  handleConManCheckNetworkResponse : function(inSender, inResponse) {
    this.log("CaptivePortalControl::handleConManCheckNetworkResponse", inResponse);
    if (inResponse && inResponse.returnValue && "captivePortal" !== inResponse.connection) {
      this.log("CaptivePortalControl::handleConManCheckNetworkResponse: No Longer on a captive portal");
    }
  },

  handleGetConManStatusResponse : function(inSender, inResponse) {
    this.log("CaptivePortalControl::handleGetConManStatusResponse #### ", inResponse);

    if (null == inResponse || false == inResponse.returnValue) {
      this.log("getStatus Request Failed");
      this.connectionManagerWatcher = undefined;
    } else {
      this.conManStatus = inResponse;

      var isWanConnected = ("connected" === inResponse.wan.state);
      var isWiFiConnected = ("connected" === inResponse.wifi.state);
      if (isWiFiConnected && this.captivePortalNwInterface === inResponse.wifi.interfaceName) {

        this.doNetworkStatusChanged({
          networkStatus : inResponse.wifi.onInternet
        });
        if ("captivePortal" === inResponse.wifi.onInternet) {
          if ("notConnected" === this.captivePortalNwStatus || "connected" === this.captivePortalNwStatus) {
            this.captivePortalNwStatus = "captivePortal";
            this.$.popupConnected.close();
            this.$.popupNotConnected.close();
            captivePortalNwInterfaceChanged();
          }
        } else {
          this.log("#### Network Connected");
          this.captivePortalNwStatus = "connected";
          if (!this.captivePortalSuppressPopups) {
            this.$.popupConnected.openAtControl(this);
          }
        }
      } else if (isWanConnected && this.captivePortalNwInterface === inResponse.wan.interfaceName) {
        if ("captivePortal" !== inResponse.wan.onInternet || "testing" === inResponse.wan.onInternet) {
          // Do Nothing
        } else {
          this.log("#### Network Connected");
          this.captivePortalNwStatus = "connected";
          if (!this.captivePortalSuppressPopups) {
            this.$.popupNotConnected.openAtControl(this);
          }
        }
      } else {
        this.log("#### Network Not Connected");
        this.captivePortalNwStatus = "notConnected";
        if (!this.captivePortalSuppressPopups) {
          this.$.popupNotConnected.openAtControl(this);
        }
      }
    }
  },

  callWebViewCtrl : function(inMethod, inArgs) { // Copied from EMail

    if (window.PalmSystem) {
      var v = this.$.capPortalWebView;
      if (v[inMethod]) {
        v[inMethod].apply(v, inArgs);
      } else {
        v.callBrowserAdapter(inMethod, inArgs);
      }
    }
  },

  sendDialogResponse : function(inSender, inAccepted) {
    this.log("CaptivePortalControl::sendDialogResponse", inAccepted);
    if (inAccepted) {
      this.callWebViewCtrl("acceptDialog", [].slice.call(arguments, 2));
    } else {
      this.callWebViewCtrl("cancelDialog");
    }
  },

  openDialog : function(inTitle, inMessage) {
    this.$.dialog.validateComponents();
    this.$.dialogTitle.setContent(inTitle);
    this.$.dialogMessage.setContent(inMessage);
    this.$.dialog.openPopup();
  },

  onWebViewLoadProgress : function(inSender, inProgress) {
    if (this._lastProgress < inProgress) {
      this.$.backButton.setDisabled(true);
      this.$.progressBar.show();
      this.$.progressBar.setPosition(inProgress);
      this._lastProgress = inProgress;

      if (inProgress === 100) {
        this._timeoutHandle = setTimeout(enyo.hitch(this, "clearProgress"), 1000);
      }
    }
  },

  isFirstLoad : true,

  onWebViewLoadComplete : function() {
    this.log("CaptivePortalControl::onWebViewLoadComplete!");
    this.$.checkNetworkConnectivity.call({
      ifName : "eth0"
    });
    // this.$.progressBar.hide();
  },

  onWebViewSSLConfirmEvent : function(inSender) {
    this.log("CaptivePortalControl::onWebViewSSLConfirmEvent");
    this.callWebViewCtrl("sendDialogResponse", [
      "2"
    ]);
  },

  showPopup : function(inPopup) {
    var w = enyo.fetchControlSize(this).w;
    inPopup.applyStyle("max-width", w - 100);
    inPopup.openPopup();
  },

  onWebViewAlertEvent : function(inSender, inMsg) {
    this.log("CaptivePortalControl::onWebViewAlertEvent");
    this.$.alertDialog.validateComponents();
    this.$.alertMessage.setContent(inMsg);
    this.showPopup(this.$.alertDialog);
  },

  onWebViewConfirmEvent : function(inSender, inMsg) {
    this.log("CaptivePortalControl::onWebViewConfirmEvent");
    this.$.confirmDialog.validateComponents();
    this.$.confirmMessage.setContent(inMsg);
    this.showPopup(this.$.confirmDialog);
  },
  onWebViewPromptEvent : function(inSender, inMsg, inDefaultValue) {
    this.log("CaptivePortalControl::onWebViewPromptEvent");
    this.$.promptDialog.validateComponents();
    this.$.promptMessage.setContent(inMsg);
    this.$.promptInput.setValue("");
    this.$.promptInput.setHint(inDefaultValue);
    this.showPopup(this.$.promptDialog);
  },

  promptResponse : function(inAccept) {
    this.sendDialogResponse(this, inAccept, this.$.promptInput.getValue() || this.$.promptInput.getHint());
  },
  closePrompt : function() {
    this.$.promptInput.forceBlur();
  },

  showUserPasswordDialog : function(inSender, inMsg) {
    this.$.loginDialog.validateComponents();
    var msg = $L("The server {$serverName} requires a username and password");
    msg = enyo.macroize(msg, {
      serverName : inMsg
    });
    this.$.loginMessage.setContent(msg);
    this.showPopup(this.$.loginDialog);
  },

  loginResponse : function(inSender, inAccept) {
    this.sendDialogResponse(this, inAccept, this.$.userInput.getValue(), this.$.passwordInput.getValue());
  },

  clearProgress : function() {
    this._lastProgress = 0;
    this.$.progressBar.hide();
    this.$.progressBar.setPosition(0);
    if (this.isFirstLoad) {
      this.isFirstLoad = false;
    } else {
      this.$.backButton.show();
      this.$.backButton.setDisabled(false);
    }
    this._timeoutHandle = null;
  },

  onWebViewErrorEvent : function(inSender, inErrorCode, inMsg) {
    var webKitErrors = {
      ERR_SYS_FILE_DOESNT_EXIST : 14,
      ERR_WK_FLOADER_CANCELLED : 1000,
      ERR_WK_NOINTERNET : 1005,
      ERR_CURL_FAILURE : 2000,
      ERR_CURL_COULDNT_RESOLVE_HOST : 2006,
      ERR_CURL_SSL_CACERT : 2060
    };

    switch (inErrorCode) {
    case webKitErrors.ERR_SYS_FILE_DOESNT_EXIST:
      this.log("File does not exist.");
      // this.openDialog($L("Error"), $L('File does not exist.'));
      break;
    case webKitErrors.ERR_CURL_COULDNT_RESOLVE_HOST:
      this.log("Unable to resolve host.");
      // this.openDialog($L("Error"), $L('Unable to resolve host.'));
      break;
    case webKitErrors.ERR_WK_NOINTERNET:
      // this.openDialog($L("Error"), $L('No Internet Connection.'));
      this.log("No Internet Connection");
      break;
    case webKitErrors.ERR_WK_FLOADER_CANCELLED:
      break;
    default:
      // this.openDialog($L("Error"), $L("Unable to Load Page"));
      this.log("Unknown Handled Error: " + inMsg);
      break;

    }
    this.clearProgress();
  }
});