/*
	MediaCapturePropertyHelper::
	Helper:: Property bag helper that facilitate formulation of the device settings
*/
enyo.kind({
	name: "enyo.MediaCapturePropertyHelper",
	kind: enyo.Component,
	/* property bag of settings for each device*/
	_devicesPropBag: {}, 
	/* property bag of supported media settings for each device*/
	_supportedPropBag:{},
	/* list of devices, we get this from media server via "name": "captureDevices" */
	_deviceKeys:[],
	/*
		_parseDevicesProperty: parses all the devices available.
	*/
	_parseDevicesProperty:function(deviceObjects)
	{
		for(var i = 0; i< deviceObjects.length; i++)
		{
			// build a property bag of the current device
			this._devicesPropBag[deviceObjects[i].deviceUri] = deviceObjects[i];
			// build a device keys bag so users can query the property bag based on the keys
			this._deviceKeys[i] = {
				"deviceUri": deviceObjects[i].deviceUri,
				"description": deviceObjects[i].description,
				"inputtype": deviceObjects[i].inputtype				
			};
		}
	},
	/*
		parse: given a response object of properties from media server, parse
		all elements and place them by devices, this property bag is need for clients 
		to call the load method to load the device.
	*/
	parseSettingsForPropertyBag:function(inJson, propertyBag)
	{		
		if(inJson)
		{
			// typically 37 or so but we just need supported formats and a devices list.
			for(var i =0; i< inJson.propertyValues.length; i++)
			{
				switch(inJson.propertyValues[i].name)
				{
					case "supportedAudioFormats":
						this._supportedPropBag.supportedAudioFormats = inJson.propertyValues[i].value;
					break;
					case "supportedImageFormats":
						this._supportedPropBag.supportedImageFormats = inJson.propertyValues[i].value;
					break;	
					case "supportedVideoFormats":
						this._supportedPropBag.supportedVideoFormats = inJson.propertyValues[i].value;
					break;
					case "captureDevices":
						this._parseDevicesProperty(inJson.propertyValues[i].value);
					break;
					default:
					break;
				}
			}
		}
		// now to save an extra loop we'll do a mixin for each device.
		for(var item in this._devicesPropBag)
		{
			if(this._devicesPropBag[item].description == "Microphone")
			{
				this._devicesPropBag[item].supportedAudioFormats = this._supportedPropBag.supportedAudioFormats;
			}
			else
			{
				this._devicesPropBag[item].supportedImageFormats = this._supportedPropBag.supportedImageFormats;
				this._devicesPropBag[item].supportedVideoFormats = this._supportedPropBag.supportedVideoFormats;				
			}
		}
		// add the device keys so clients know how to load the right device
		this._devicesPropBag.deviceKeys = this._deviceKeys;
		
		return this._devicesPropBag;
	},
	/*
		serialize: helper for argument object serialization
	*/
	serialize:function(filePath, options)
	{
		var str = '{"args":["' + (filePath ? filePath : "") + '", ' + enyo.json.stringify(options) + ']}';
		return str;
	},
	/*
		serializeNoFileName: helper for argument object serialization		
	*/
	serializeNoFileName:function(options)
	{
		var str = '{"args":[' + enyo.json.stringify(options) + ']}';
		return str;		
	},
	/*
		verifiedDeviceMode : AUDIO, FRONT_CAMERA, REAR_CAMERA
	*/
	verifiedDeviceMode:function(mode)
	{
		var propertyBagKeys = this.owner._propertyBag.deviceKeys;
		if(propertyBagKeys)
		{
			for(var i=0; i<propertyBagKeys.length; i++)
			{
				if(propertyBagKeys[i].deviceUri == mode)
				{
					return true;
				}
			}			
		}
		return false;
	}
});
