/*
	MediaCaptureServiceProxy::
	Helper:: Proxy helper that facilitate calls to mediaserver
*/
enyo.kind({
	name:"enyo.MediaCaptureProxyHelper",
	kind: enyo.Component,
	logPrefix: "MediaCapture::ServiceProxy ", 	/* @private: Log file prefix - cache this*/
	components:[
		{	/* Generic bridge for all capture verbs*/
			name: "mediaServerProxy", kind: "PalmService", service: "palm://com.palm.mediad/service/"
		},
		{	/* Start the property change watcher, all events will route through this watcher */
			name: "propertyChangeWatcher", kind: "PalmService", service: "palm://com.palm.mediad/service/", method: "propertyChange",
		    onSuccess: "_propertyChangeWatcherSuccess", subscribe: true, onFailure:"_propertyChangeWatcherFailure"	
		},
		{	/* Initialize camera by getting instance from media server */
			name: "initializeMediaServerInstance", kind: "PalmService", service: "palm://com.palm.mediad/service/", method: "captureV3",
		    onSuccess: "_initializeMediaServerInstanceSuccess", onFailure:"_mediaServerProxyFailure", subscribe: true
		},
		{ 	/* media server mock dispatcher, for use when developement is on chrome */
			name:"mediaServerMockDispatcher", kind:"MediaServerMockDispatcher"
		}
	],
	/*
		the endpoint Uri, ie. palm://com.palm.mediad.MediaCaptureV3_1603240
	*/						
	_mediaServerPortLocation: null,
	/*
		has the initial query to media server for properties been made.
	*/							
	_retrivedLiveProperties: false,  
	/*
		if he client passed in a video object then we'll pipe the byte stream for them
	*/
	videoObject: null,			
	/*
		videoStreamInitialized: indicates if we have already started the video stream
	*/						
	_videoStreamInitialized: false,
	/*
		getMediaServerInstance: gets an instance to media server, and time outs after 5 secs if we don't
		get a reply
	*/
	getMediaServerInstance:function()
	{				
		// when we load the library we need to get the instance and the property bag of settings
		// the property bag is needed for calling the devices correct load settings.
		this.$.initializeMediaServerInstance.call(this.owner.$.propertyHelper.serializeNoFileName({}));

		console.log(this.logPrefix + "==== getMediaServerInstance ");
	},
	/*
		_mediaServerProxyFailure: error callback if the subscription goes down, test case likely Media server
		went down.  
	*/
	_mediaServerProxyFailure:function(inSender, inResponse)
	{
		if(!inResponse.returnValue)
		{
			console.log(this.logPrefix + "==== _mediaServerProxyFailure ");
			this.owner.doError(this.owner.$.errorHelper.errorCode.ERROR_NO_PIPELINE);			
		}
	},
	/*
		_initializeMediaServerInstanceSuccess: The call back from the initialization to Media server.
		1. Will contain the connection instance address to media server in reponse payload.
		2. Clears out the timeout counter.
		3. After which fires off a Palm Service request to property watcher.
	*/									
	_initializeMediaServerInstanceSuccess:function(inSender, inResponse)
	{				
		if(inResponse.returnValue)
		{
			this._retrivedLiveProperties = false;
			
			// we now have the media server location - palm://com.palm.mediad.MediaCaptureV3_1603240
			this._setServiceUri(inResponse.location);
						
			// start the property watcher.
			this.$.propertyChangeWatcher.call(this.owner.$.propertyHelper.serializeNoFileName({}));
			
			console.log(this.logPrefix + "===== MediaCapture::_initializeMediaServerInstanceSuccess() ..." + inResponse.location);
		}
	},
	/*
		_propertyChangeWatcherSuccess: The call back from the initialization to Property Changes from Media server.
		There are 2 modes, initial and subsequent.  Governed by _retrivedLiveProperties.
		
		initial: The very first time property is changed, the property bag returned will be the current settings for the
		device.
		
		subsequent: Any other property changes will route through here.
	*/									
	_propertyChangeWatcherSuccess:function(inSender, inResponse)
	{
		if(inResponse.returnValue)
		{
			if(this._retrivedLiveProperties)
			{
				// delegate to the normal property events
				this._handlePropertyChange(inResponse);					
			}
			else
			{
				console.log(this.logPrefix + "@@@@@@----------- FIRST PROPERTY GRAB -----------@@@@@@");
				console.log(this.logPrefix + "inResponse: " + enyo.json.stringify(inResponse));
				// in the first property grab, also check that there is an array of "propertyValues",
				// some times you get "propertyChange" only which signals an error.
				// now the settings are ready, use this to perform settings from now on.
				if(inResponse.propertyValues)
				{
					this._retrivedLiveProperties = true;
					this.owner._propertyBag = this.owner.$.propertyHelper.parseSettingsForPropertyBag(inResponse, this.owner._propertyBag);	
					this.owner.doInitialized(this.owner._propertyBag);					
				}
			}
		}
	},
	/*
		_propertyChangeWatcherFailure: Handles the scenario when property change subscription results in failure.
	*/
	_propertyChangeWatcherFailure:function(inSender, inResponse)
	{
		if(!inResponse.returnValue)
		{
			console.log(this.logPrefix + " _propertyChangeWatcherFailure");
			this.owner.doError(this.owner.$.errorHelper.errorCode.ERROR_NO_PIPELINE);
		}	
	},
	/*
		_handlePropertyChange: Routes the property change values to the right event routes.
		All property change from media server are dispatched here.
	*/
	_handlePropertyChange:function(responseObject)
	{
		if(responseObject.returnValue && responseObject.propertyChange)
		{
			var property = responseObject.propertyChange.name; 
			console.log(this.logPrefix + "#######----------- CHANGE PROPERTIES EVENT -----------######" + property + "      ");	
			var parent = this.owner;
			switch (property)
			{
				// fired via: startImageCapture
				case "imagecapturestart":
					parent.doImageCaptureStart(responseObject.propertyChange.value);
					break;					
				// fired via: startImageCapture	
				case "lastImagePath":
					parent.lastImagePath = responseObject.propertyChange.value;
					break;
				// fired via: startImageCapture
				case "imagecapturecomplete":
					parent.doImageCaptureComplete(parent.lastImagePath);
					break;
				// fired via: startVideoCapture	
				case "videocapturestart":
					// reset the elapsedTime as clients use this for the video counter
					parent.elapsedTime = 0;				
					parent.doVideoCaptureStart();
					break;
				// fired continously after: startVideoCapture
				case "elapsedTime":
					parent.elapsedTime = responseObject.propertyChange.value;
					break;
				// fired via: stopVideoCapture						
				case "lastVideoPath":
					parent.lastVideoPath = responseObject.propertyChange.value;
					break;
				// fired via: stopVideoCapture
				case "videocapturecomplete":
					// fire off the videocapture complete callback
					parent.doVideoCaptureComplete(parent.lastVideoPath);
					// reset the elapsedTime as clients use this for the video counter
					parent.elapsedTime = 0;
					break;
				// fired via: startAudioCapture
				case "audiocapturestart":
					parent.vuData = null;
					parent.doAudioCaptureStart();
					break;
				// fired continously after: startAudioCapture
				case "vuData":
					var vuDataObj = responseObject.propertyChange.value;
					if(vuDataObj && vuDataObj.length > 0)
					{
						parent.vuData = vuDataObj[0];						
					}
					break;
				// fired via: stopAudioCapture
				case "lastAudioPath":
					parent.lastAudioPath = responseObject.propertyChange.value;
					break;
				// fired via: stopAudioCapture
				case "audiocapturecomplete":
					parent.doAudioCaptureComplete(parent.lastAudioPath);
					parent.vuData = null;
					break;
				// fired via: load
				case "ready":
					if(responseObject.propertyChange.value)
					{
						// start the video stream for the view port if client passed in a HTML5 video object
						this._streamViewPort();									
					}
					parent.doLoaded({loaded: responseObject.propertyChange.value});	
					console.log(this.logPrefix + "Camera loaded: ---->" + responseObject.propertyChange.value + "<-----");
					break;
				// fired via: setAutoFocus
				case "autofocusdone":
					parent.doAutoFocusComplete();
					break;	
				case "durationchange":
					parent.doDurationChange(responseObject.propertyChange.value);
					break;
				case "duration":
					parent.duration = responseObject.propertyChange.value;
					break;
				case "error":				
					parent.doError(parent.$.errorHelper.parseErrorType(responseObject.propertyChange.value));
					break;
				default:
				break;
			}
		}
	},
	/*
		_setServiceUri: updates all palm service Urls to the media server instance 
	*/
	_setServiceUri:function(uri)
	{
		this.$.propertyChangeWatcher.service =
		this._mediaServerPortLocation = 
		this.$.mediaServerProxy.service = uri;
	},
	/*
		_streamViewPort: stream the video byte stream to the HTML5 object
	*/
	_streamViewPort:function()
	{
		if(this.videoObject && this.videoObject.hasNode())
		{
			this.videoObject.node.src =  this._mediaServerPortLocation;
			this.videoObject.node.play();
		}
	},
	/*
		List of mediaserver method calls..
	*/
	CMD:{
		captureV3: "captureV3",
		load: "load",
		unload:"unload", 
		propertyChange:"propertyChange", 

		startAudioCapture: "startAudioCapture", 
		startImageCapture: "startImageCapture", 
		startVideoCapture: "startVideoCapture",

		stopAudioCapture: "stopAudioCapture", 
		stopVideoCapture: "stopVideoCapture",

		setVideoStabilization: "setVideoStabilization",
		setAutoFocus: "setAutoFocus"
	},
	/*
		request: request proxy for media server calls
	*/
	request:function(method, arguments, subscribe)
	{
		if(!this.CMD[method])
		{
			console.log(this.logPrefix + " No such command to media server");
			
			var that = this;
			// all calls are async via media server, since there is an error mimic that behaviour also.
			window.setTimeout(function(){that.owner.doError(that.owner.$.errorHelper.errorCode.ERROR_OTHER);},1);
			return;
		}

		console.log(this.logPrefix + "Service request: ----->>>" + this.CMD[method] + "<<<-----");
		console.log(this.logPrefix + "arguments: ----->>>" + enyo.json.stringify(arguments) + "<<<-----");
		
		// over load the service command			
		this.$.mediaServerProxy.method = this.CMD[method];

		// check the subscribe bit.
		this.$.mediaServerProxy.subscribe = !! subscribe;
					
		if(!window.PalmSystem)
		{
			this.$.mediaServerMockDispatcher.registerDispatchForMethods(method);
		}
					
		// send the request off
		this.$.mediaServerProxy.call(arguments ? arguments : '{"args":[]}');
		
		// for unload also terminate the subscription.
		if(this.CMD[method] == this.CMD.unload)		
		{
			this.terminateSubscription();
		}
	},
	terminateSubscription:function()
	{
		this.$.propertyChangeWatcher.cancel();
		this.$.mediaServerProxy.cancel();
		
		// clean out service port instance and propertyBag object.
		this._mediaServerPortLocation = null;
		this.owner._propertyBag = null;

		console.log(this.logPrefix + "terminating subscription and cleaning out property bag and port instance");
	},
	// Proxy call for Browser only Media server calls.
	dispatcherForLoad:function()
	{
		this.$.mediaServerMockDispatcher.dispatcherForLoad();
	},
	dispatcherForStartImageCapture:function()
	{
		this.$.mediaServerMockDispatcher.dispatcherForStartImageCapture();
	},
	dispatcherForStartVideoCapture:function()
	{
		this.$.mediaServerMockDispatcher.dispatcherForStartVideoCapture();
	},
	dispatcherForStopVideoCapture:function()
	{
		this.$.mediaServerMockDispatcher.dispatcherForStopVideoCapture();
	},
	dispatcherForUnload:function()
	{
		this.$.mediaServerMockDispatcher.dispatcherForUnload();
	},
	dispatcherForStartAudioCapture:function()
	{
		this.$.mediaServerMockDispatcher.dispatcherForStartAudioCapture();
	},
	dispatcherForStopAudioCapture:function()
	{
		this.$.mediaServerMockDispatcher.dispatcherForStopAudioCapture();		
	}
});


