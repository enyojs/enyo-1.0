/**
A <a href="#enyo.PalmService">PalmService</a> that allows applications to access various system settings.

	{kind: "enyo.SystemService"}

*/
enyo.kind({
	name: "enyo.SystemService",
	kind: enyo.PalmService,
	service: enyo.palmServices.system
});