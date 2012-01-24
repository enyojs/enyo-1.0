/*
	MediaCaptureErrorHelper::
	Helper:: Error helper that facilitate error resolution from media server to client
*/
enyo.kind({
	name:"enyo.MediaCaptureErrorHelper",
	kind:enyo.Component,
	/*
		error codes
	*/
	errorCode:{
		ERROR_NONE: 0,
		ERROR_BAD_SOURCE: 1,
		ERROR_BAD_MODE:2,
		ERROR_NO_SPACE: 3,
		ERROR_NO_PIPELINE: 4,
		ERROR_SOURCE_CONFLICT: 5,
		ERROR_TIMEOUT: 6,
		ERROR_OTHER: 7
	},
	/*
		parseErrorType: parse error from property change events, cast to ERROR_OTHER if not recognized.
	*/
	parseErrorType:function(errorValue)
	{		
		return this.errorCode[errorValue] || this.errorCode.ERROR_OTHER;
	}
});