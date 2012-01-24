/*
	Dispatcher for Media server mocking of property change events.
	Only used when developement in Browser mode
*/
enyo.kind({
	name:"enyo.MediaServerMockDispatcher",
	kind:"enyo.Component",
	registerDispatchForMethods:function(currentMethod)
	{
		var parent = this.owner;
		
		if(parent.CMD[currentMethod] == parent.CMD.load)
		{
			parent.$.mediaServerProxy.onSuccess = "dispatcherForLoad";				
		}
		else if(parent.CMD[currentMethod] == parent.CMD.startImageCapture)
		{
			parent.$.mediaServerProxy.onSuccess = "dispatcherForStartImageCapture";
		}
		else if(parent.CMD[currentMethod] == parent.CMD.startVideoCapture)
		{
			parent.$.mediaServerProxy.onSuccess = "dispatcherForStartVideoCapture";
		}
		else if(parent.CMD[currentMethod] == parent.CMD.stopVideoCapture)
		{
			parent.$.mediaServerProxy.onSuccess = "dispatcherForStopVideoCapture";
		}
		else if(parent.CMD[currentMethod] == parent.CMD.startAudioCapture)
		{
			parent.$.mediaServerProxy.onSuccess = "dispatcherForStartAudioCapture";
		}
		else if(parent.CMD[currentMethod] == parent.CMD.stopAudioCapture)
		{
			parent.$.mediaServerProxy.onSuccess = "dispatcherForStopAudioCapture";	
		}
		else
		{
			// do nothing....
		}
	},
	killElapsedTime:false,
	killElapsedVuData:false,
	numberOfElapsedTimeCalls:2000,
	vuDataTimeSeed:0.39599999785423,
	dispatcherForLoad:function()
	{
		var obj = {
		    "propertyChange": {
		        "name": "ready",
		        "value": true
		    },
		    "returnValue": true
		};
		this.owner._propertyChangeWatcherSuccess(null, obj);
	},
	dispatcherForStartImageCapture:function()
	{
		var imagePathObj = {
		    "propertyChange": {
		        "name": "lastImagePath",
		        "value": "mock/startImageCapture_lastImagePath.jpg"
		    },
		    "returnValue": true
		};
				
		this.owner._propertyChangeWatcherSuccess(null, imagePathObj);
		
		var imageCaptureComplete = {
		    "propertyChange": {
		        "name": "imagecapturecomplete",
		        "value": 1
		    },
		    "returnValue": true
		};
		
		this.owner._propertyChangeWatcherSuccess(null, imageCaptureComplete);		
	},
	dispatcherForStartVideoCapture:function()
	{
		this.killElapsedTime = false;
		var obj = {
		    "propertyChange": {
		        "name": "videocapturestart",
		        "value": 1
		    },
		    "returnValue": true
		};
		
		this.owner._propertyChangeWatcherSuccess(null, obj);
			
		var elapsePump = function(n)
		{
			var elapsedTimeObj = {
			    "propertyChange": {
			        "name": "elapsedTime",
			        "value": n
			    },
			    "returnValue": true
			};
			this.owner._propertyChangeWatcherSuccess(null, elapsedTimeObj);	
		}	

		this.elapsedPump(this.numberOfElapsedTimeCalls);
	},
	dispatcherForStopVideoCapture:function()
	{
		
		this.killElapsedTime = true;
		
		var videoUrlObj = 		
		{
		    "propertyChange": {
		        "name": "lastVideoPath",
		        "value": "mock/v.jpg"
		    },
		    "returnValue": true
		};
		
		this.owner._propertyChangeWatcherSuccess(null, videoUrlObj);
		
		var obj = {
		    "propertyChange": {
		        "name": "videocapturecomplete",
		        "value": 1
		    },
		    "returnValue": true
		};
		
		this.owner._propertyChangeWatcherSuccess(null, obj);
	},
	elapsedPump:function(n)
	{
		/* comment out errors for now
		if(n==1996)
		{
			// ERROR_NO_PIPELINE, ERROR_NO_SPACE, ERROR_BAD_MODE
			var errorObj = {
				"propertyChange":{
					"name":"error",
					"value":"ERROR_NO_PIPELINE"
					},
				"returnValue":true
				};
				this.owner._propertyChangeWatcherSuccess(null, errorObj);
		}
		*/
		
		if(n== 0 || this.killElapsedTime)
		{
			return;
		}
		
		var elapsedTimeObj = {
		    "propertyChange": {
		        "name": "elapsedTime",
		        "value": (((this.numberOfElapsedTimeCalls - n) * 500)/1000)
		    },
		    "returnValue": true
		};

		this.owner._propertyChangeWatcherSuccess(null, elapsedTimeObj);
				
		var durationObj = {
		    "propertyChange": {
		        "name": "duration",
		        "value": 100
		    },
		    "returnValue": true
		};
				
		this.owner._propertyChangeWatcherSuccess(null, durationObj);
				
		var that = this;
		window.setTimeout(function(){that.elapsedPump(n-1);}, 1000);
	},
	dispatcherForStartAudioCapture:function()
	{
		var obj = {
		    "propertyChange": {
		        "name": "audiocapturestart",
		        "value": 1
		    },
		    "returnValue": true
		};
		this.owner._propertyChangeWatcherSuccess(null, obj);
		
		this.vuDataPump(this.numberOfElapsedTimeCalls);
		
	},
	vuDataPump:function(n)
	{
		if(n== 0 || this.killElapsedVuData)
		{
			return;
		}
		// "value":[{"peak":[0.004730224609375],"rms":[0.001355190644972],"time":0.39599999785423}]}
		var vuDataObj = {
		    "propertyChange": {
		        "name": "vuData",
		        "value": [{"peak":[0.004730224609375],"rms":[0.001355190644972],"time":((this.numberOfElapsedTimeCalls - n) + this.vuDataTimeSeed)}]
		    },
		    "returnValue": true
		};

		this.owner._propertyChangeWatcherSuccess(null, vuDataObj);
				
		var that = this;
		window.setTimeout(function(){that.vuDataPump(n-1);}, 1000);
	},
	
	dispatcherForStopAudioCapture:function()
	{
		this.killElapsedVuData = true;
		
		var videoUrlObj = 		
		{
		    "propertyChange": {
		        "name": "lastAudioPath",
		        "value": "mock/audio_1313176502473.wav"
		    },
		    "returnValue": true
		};
		
		this.owner._propertyChangeWatcherSuccess(null, videoUrlObj);
		
		var obj = {
		    "propertyChange": {
		        "name": "audiocapturecomplete",
		        "value": 1
		    },
		    "returnValue": true
		};
		
		this.owner._propertyChangeWatcherSuccess(null, obj);
		
	}
});
