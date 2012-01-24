/**
 enyo.MediaCapture is a non-control component that's used to managing the media capture
 process on webOS.
 */
enyo.kind({
	name: "enyo.MediaCapture",
	kind: enyo.Component,
	/*************************************************************************	
	Public Events .....
	Events that fire back to the client to signal completeness or if an action has started
	*************************************************************************/
	events:	{
		onInitialized:"", 
		onLoaded:"", 
		onAutoFocusComplete:"", 
		onError:"", 
		onDurationChange:"", 
		onAudioCaptureStart:"", 
		onAudioCaptureComplete:"",
		onImageCaptureStart:"", 
		onImageCaptureComplete:"", 
		onVideoCaptureComplete:"", 
		onVideoCaptureStart:""
	},
	properties: {
		/** last captured image path */
		lastImagePath:"", 
		/** last captured video path */
		lastVideoPath:"",
		/** last captured audio path */
		lastAudioPath:"",
		/** video elapsed time */		
		elapsedTime:0,
		/** audio vuData object, contains an object of peak, rms, and time*/
		vuData:null,
		/** duration of active captured seconds*/
		duration:0
	},
	components:[		
		{	/* Helper:: Property bag parser */
			name:"propertyHelper", kind:"MediaCapturePropertyHelper"
		},
		{	/* Helper:: Palm Service request proxyHelper */
			name:"proxyHelper", kind:"MediaCaptureProxyHelper"
		},
		{	/* Helper:: Error helper */
			name:"errorHelper", kind:"MediaCaptureErrorHelper"
		}
	],

	/* @private */
	// the live properties from media server for this device.  Verify Outlook security settings bug.
	_propertyBag: null,
	// Log file prefix - cache this
	_logPrefix: "MediaCapture:: ",

	/*************************************************************************	
	Public methods .....
	*************************************************************************/
	/** fires off the call to init an instance of mediaserver
		* videoObjectFromClient: an optional HTML5 video object used as the
		preview for the byte stream from media server
	*/							
	initialize:function(videoObjectFromClient)
	{
		if(videoObjectFromClient)
		{
			console.log(this._logPrefix + "video object passed in");
			this.$.proxyHelper.videoObject = videoObjectFromClient;
		}
		
		this.$.proxyHelper.getMediaServerInstance();							
	},
	/** loads the device
		* mode, the desired capture mode, get this from the property bag [required]
		* format, the format desired for the specified capture mode, also from the 
		  property bag [required]
	*/							
	load:function(mode, format)
	{			
		if(this.$.propertyHelper.verifiedDeviceMode(mode))
		{
			if(!format)
			{
				format = {};
			}
			format.deviceUri = this._propertyBag[mode].deviceUri;

			this.$.proxyHelper.request(
				this.$.proxyHelper.CMD.load, 
				this.$.propertyHelper.serialize(this._propertyBag[mode].deviceUri, format));							
		}
		else
		{
			// gross violation of API, throw and end don't allow progress. 
			// also check if we should just throw an error instead of throw, with enyo folks.
			throw(":: unsupported device capture mode for media capture APIs.");								
		}
	},
	/** Captures an image
		* filePath, name of file or empty string for default
		* imageCaptureOptions, the desired image capture format settings ie. {"bitrate":0,
		  "samplerate":0,"width":2032,"height":1520,"mimetype":"image/jpeg","codecs":"jpeg"}
	*/							
	startImageCapture:function(filePath, imageCaptureOptions)
	{	
		this.$.proxyHelper.request(
			this.$.proxyHelper.CMD.startImageCapture, 
			this.$.propertyHelper.serialize(filePath, imageCaptureOptions));		
	},
	/** starts an audio capture
		* filePath, name of file or empty string for default
		* audioCaptureOptions, the desired audio capture format settings ie. {"bitrate":128000,
		  "samplerate":8000,"width":0,"height":0,"mimetype":"audio/vnd.wave","codecs":"1"}
	*/							
	startAudioCapture:function(filePath, audioCaptureOptions)
	{									
		this.$.proxyHelper.request(
			this.$.proxyHelper.CMD.startAudioCapture, 
			this.$.propertyHelper.serialize(filePath, audioCaptureOptions));
	},
	/** stops the current audio capture */							
	stopAudioCapture:function()
	{
		this.$.proxyHelper.request(
			this.$.proxyHelper.CMD.stopAudioCapture);
	},
	/** starts a video capture 
		* filePath, name of file or empty string for default
		* videoCaptureOptions, the desired video capture format settings ie. {"bitrate":1100000,"samplerate":44100,
		  "width":1280,"height":720,"mimetype":"video/mp4","codecs":"mp4v.20,mp4a.40"}
	*/							
	startVideoCapture:function(filePath, videoCaptureOptions)
	{			
		this.$.proxyHelper.request(
			this.$.proxyHelper.CMD.startVideoCapture, 
			this.$.propertyHelper.serialize(filePath, videoCaptureOptions));
	},
	/** stops the current video capture */							
	stopVideoCapture:function()
	{
		this.$.proxyHelper.request(
			this.$.proxyHelper.CMD.stopVideoCapture);
	},
	/** unload the currently loaded device */							
	unload:function()
	{
		this.$.proxyHelper.request(
			this.$.proxyHelper.CMD.unload);
	},
	/** resets the current auto focus with the given settings object
		* settings: a json object, with "centerX", "centerY", "width","height","virtualWidth","virtualHeight","flash","type"
	*/							
	updateAutoFocus:function(autoFocusSettings)
	{
		this.$.proxyHelper.request(
			this.$.proxyHelper.CMD.setAutoFocus, this.$.propertyHelper.serializeNoFileName(autoFocusSettings));
	}
});