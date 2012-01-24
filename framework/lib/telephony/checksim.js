enyo.kind({
    name: "TelephonyService", kind: "PalmService",service: "palm://com.palm.telephony/" 
});
enyo.kind({
    name: "ConManService", kind: "PalmService", service: "palm://com.palm.connectionmanager/"
});
    
enyo.kind({
    LABEL_HEADER_INVALID_SIM       : PinResources.$L("Invalid SIM"),
    LABEL_HEADER_NO_CONNECTION     : PinResources.$L("Network Unavailable"),
    LABEL_MESSAGE_INVALID_SIM      : PinResources.$L("Please insert a valid SIM with active data service"),
    LABEL_MESSAGE_NO_CONNECTION    : PinResources.$L("We cannot connect to your cellular network. Make sure you have a valid SIM with active data service and that cellular service is available. Otherwise, use Wi-Fi"),

    name: "CheckSim",
    kind: "VFlexBox",
    
    events: {
        onSimCheckSuccess: "",
        onSimCheckFailure: "",
        onStartOver: ""
    },


    components: [
        {name: "SimStatusQuery", kind: "TelephonyService", method: "simStatusQuery",subscribe: true, onSuccess: "handleSimStatusQuery"},
        {name: "SimPin1StatusQuery", kind: "TelephonyService", method: "pin1StatusQuery", onResponse: "handleSimPin1StatusQuery"},
        {name: "SimMepLockQuery", kind: "TelephonyService", method: "deviceLockQuery", subscribe: true, onSuccess: "handleSimMepLockQuery"},
        {name: "getStatus", kind: "ConManService", subscribe: true, resubscribe: true, onResponse: "handleNetworkStatusQuery"},
        
        {kind: "Scrim", layoutKind: "VFlexLayout", align: "center", pack: "center", components: [
                  {kind: "SpinnerLarge", name: "spinner", showing: false}
                  ]},
       			 {kind: "ModalDialog", width: "500px", name: "simInvalid", scrim: true, modal: true, lazy:false, align:'center', style:'text-align:center; color:#000',  components: [                                                                                                                                                                
						{name: "header", content: this.LABEL_HEADER_INVALID_SIM, className: 'enyo-modaldialog-title'},                                                                                                                                                                                                                                                                                  
						{name: "message", content: this.LABEL_MESSAGE_INVALID_SIM },                                                                                                                                                                                                                                                                                
						{kind: "Image", name:"padSimIcon", src: "$enyo-lib/telephony/images/sim-alert01.png", style:'padding:10px 0 20px 0', className:"pad-sim"},                                                                                                                                                                                                                                     
						{name: "wifiButton", kind: "Button", caption: PinResources.$L("Use Wi-Fi"), className:'enyo-button', onclick: "wifiBtnClick"},                                                                                                                                                                                                                                                       
						{name: "startoverButton", kind: "Button", caption: PinResources.$L("Start Over"), className:'enyo-button', onclick: "handleStartOver"}                                                                                                                                                                                                                                                    
				]},
        {kind: "ModalDialog", name: "PinPad", className:"cust-enyo-popup", scrim: true, modal: true, lazy: false, components: [
                    {kind: "PinCode", name: "PinCode", height:"360px", width: "320px",onPinCodeDone: "handlePinCodeDone",onStartOver: "handleStartOver"},
                    ]},
        /*{kind: "ModalDialog", name: "simMepLocked", scrim: "true", modal: "true", components: [
                    {content: "The SIM is MEP locked, please insert valid SIM card or contact your carrier"},                              
                    {kind: "Button", caption: "DONE", onclick: "CheckSimStatus"},
                    {kind: "Button", caption: "CANCEL", onclick: "closeAllPopups"} 
                    ]}*/ 
    ],
    create: function() {
        this.netQueryCnt = 0;
        this.setShowSpinner = false;
        this.valid_sim_no_data = false;
        this.timerId = 0;
        this.inherited(arguments);
        this.meplock_check = false;
        //this.handleLaunch(enyo.windowParams);
        
    },
    reloadResources: function (locale) {
                // for firstuse
        if (locale) {
            PinResources.reload(locale);
        }
    },
    startCheck: function(args) {
        if (args && args.locale) {
            this.reloadResources(args.locale);
        }
        this.checkSimStatus();
        this.checkSimMepLock();
    },


    /*handleLaunch: function(params) {
        this.log("handleLaunch Called.");
        return true;
    },*/
    
    handleSimStatusQuery: function(inSender, inResponse, inRequest) {
      if(inResponse.extended) 
      {
    	if(inResponse.extended.state == 'simnotfound') 
    	{
    	   this.$.PinPad.close();
           this.valid_sim_no_data = false;
           this.meplock_check = false;
           clearTimeout(this.timerId );
    	   //this.$.simInvalid.openAtCenter();
           this.openInvalidSimDialog(0);
           this.log("fu-sim: handleSimStatusQuery - sim not found");
        }
        else if(inResponse.extended.state == 'simnotready') 
        {
            this.log("fu-sim: handleSimStatusQuery - sim not ready");
            this.valid_sim_no_data = false;
            clearTimeout(this.timerId );
        }
        else if(inResponse.extended.state == 'pinrequired')                            
        {                                                                              
             this.log("fu-sim: handleSimStatusQuery - pin");                                                         
             //pin screen
             this.closeAllPopups();
             this.valid_sim_no_data = false;
             this.meplock_check = false;
             this.$.PinCode.setPinAction(PinAction.PinCode_Verify);                   
             this.$.PinCode.setUI();                         
             this.$.PinPad.openAtCenter();
        }     
        else if(inResponse.extended.state == 'pukrequired')
        {
             this.log("fu-sim: handleSimStatusQuery - puk locked");
             this.closeAllPopups();
             this.valid_sim_no_data = false;
             this.meplock_check = false;
             this.unRegisterCall();
             //puk screen
             /*if(this.closeFlag == true)
             {
                  this.closeAllPopups();
             }
             this.$.PinCode.setPinAction(PinAction.PUK_Enter);                  
             this.$.PinCode.setUI();                         
             this.$.PinPad.openAtCenter();*/
             this.doSimCheckFailure("simlockpuk");
        }
        else if(inResponse.extended.state == 'pinpermblocked')
        {
             this.log("fu-sim: handleSimStatusQuery - perm locked");
             this.closeAllPopups();
             this.valid_sim_no_data = false;
             this.meplock_check = false;
             clearTimeout(this.timerId );
             this.unRegisterCall();
             this.doSimCheckFailure("simlockperm");
        }       
        else if(inResponse.extended.state == 'siminvalid') 
        {
             this.log("fu-sim: handleSimStatusQuery - " + inResponse.extended.state);
             this.valid_sim_no_data = false;
             this.meplock_check = false;
             clearTimeout(this.timerId );
             this.closeAllPopups(); 
             if(this.setShowSpinner )
             {
                 this.showSpinner(false);
                 this.setShowSpinner = false;
                 this.$.getStatus.cancel();
             }
             //this.$.simInvalid.openAtCenter();
             this.openInvalidSimDialog(0);
             
        }
        else
        {
             this.log("fu-sim:handleSimStatusQuery- success ");
             this.closeAllPopups();
             /*if(this.meplock_check == false)
             {
                 this.checkSimMepLock();
                 this.meplock_check = true;
             }*/
             if(this.valid_sim_no_data == false)
             {
                     this.netQueryCnt = 0;
                     this.networkStatusQuery();
             }
        }
      }
   },
   
   checkSimStatus: function(){
        this.log("fu-sim: checkSimStatus");
   	this.$.SimStatusQuery.call({"subscribe":true});
   },
   
   
   checkSimMepLock: function(){                                   
        this.log("fu-sim: sim mep lock check");
        this.$.SimMepLockQuery.call({"subscribe":false});        
   },
   
  handleSimMepLockQuery: function(inSender, inResponse, inRequest) {
        this.log("fu-sim: sim mep lock query: " , inResponse);
        if(null==inResponse || false==inResponse.returnValue)
        {
            this.log("fu-sim: SimMepLockQuery Failed");
            this.doSimCheckFailure("devicelockquerycallfail");
        }
        else
        {
            if(this.isEmpty(inResponse.extended)!= true)
            {   
                 this.log("fu-sim: sim mep locked");
                 this.unRegisterCall();
                 this.closeAllPopups();
                 clearTimeout(this.timerId );
                 this.doSimCheckFailure("simlockmep");
            }   
        }     
  },
  
  networkStatusQuery: function() {
       this.$.getStatus.call({});
  },
  
  handleNetworkStatusQuery: function(inSender, inResponse, inRequest) { 
       this.log("fu-sim: handleNetworkStatusQuery: ", inResponse);        
       if(null==inResponse || false==inResponse.returnValue) {                                
            this.log("fu-sim:getStatus Request Failed");
            this.doSimCheckFailure("connectionmanagercallfail");
       }
       else
       {
            var isWanConnected = ("connected"===inResponse.wan.state); 
            var isNetworkUsable = ("unusable"!=inResponse.wan.network);
            var isOnInternet = ("no"!=inResponse.wan.onInternet);
            
            if( isWanConnected && isNetworkUsable && isOnInternet)
            {
                 this.log("fu-sim: success, netQueryCnt=" + this.netQueryCnt);
                 this.showSpinner(false);
                 this.$.SimStatusQuery.cancel();
                 this.$.getStatus.cancel();
                 clearTimeout(this.timerId );
                 this.doSimCheckSuccess();
             }
            else
            {
                 this.netQueryCnt = this.netQueryCnt+1;
                 if(this.netQueryCnt == 1)
                 {
                     this.timerId = setTimeout(this.networkStatusQueryTimeOut.bind(this),120000);
                 }
                 if(this.setShowSpinner == false)
                 {
                     this.showSpinner(true);
                     this.setShowSpinner = true;
                 }
            }
       }
  },
  networkStatusQueryTimeOut: function()
  {
  	this.log("fu-sim: nodataconnection - network status query time out");                              
        //this.$.SimStatusQuery.cancel();                                     
  	this.valid_sim_no_data = true;                                              
  	this.$.getStatus.cancel();                                                             
  	this.showSpinner(false);
  	this.setShowSpinner = false;
  	this.netQueryCnt = 0;
        this.closeAllPopups();    
        this. openInvalidSimDialog(1);
  	//this.doSimCheckFailure("nodataconnection"); 
  },
  handlePinCodeDone: function(inSender,inReason){
     
     /*if(inReason == "success")
     {
     	this.networkStatusQuery(); 
     }
     else*/
     this.closeAllPopups();
     if(inReason != "success")   
     {
           
        this.log("fu-sim: pin code done fail - "+ inReason); 
        if(inReason == "usewifi")
        {
            this. wifiBtnClick();
        }
        else
        {
     	    this.doSimCheckFailure(inReason);
        }
     }    
  },
  openInvalidSimDialog:function(index) {
        if(index == 0)
        {
            this.$.header.setContent(this.LABEL_HEADER_INVALID_SIM);
            this.$.message.setContent(this.LABEL_MESSAGE_INVALID_SIM);
        }
        else if(index == 1)
        {
            this.$.header.setContent(this.LABEL_HEADER_NO_CONNECTION);
            this.$.message.setContent(this.LABEL_MESSAGE_NO_CONNECTION);
        }
        this.$.simInvalid.openAtCenter();
  },
  
  handleStartOver: function(){
        this.log("fu-sim: StartOver clicked");
        this.unRegisterCall();
        this.closeAllPopups(); 
        this.doStartOver();
  },
  wifiBtnClick: function() {
        this.log("fu-sim: wifi Button clicked");
        this.unRegisterCall();
        this.closeAllPopups();
  	this.doSimCheckFailure("nosiminsert");
  },
  closeAllPopups: function(){
   	this.$.simInvalid.close();
   	this.$.PinPad.close();
   },
   
  showSpinner: function(show){
        if(show)
        {
            this.$.scrim.show();
        }
        else
        {
            this.$.scrim.hide();
        }
  	this.$.spinner.setShowing(show);
  	                                                                                              
  },
  unRegisterCall: function() {
       this.$.SimStatusQuery.cancel();
       this.$.getStatus.cancel();
       this.$.SimMepLockQuery.cancel();


 },
  isEmpty: function(obj) {
     for(var i in obj) {
           return false;
     }
     return true;
}
});
