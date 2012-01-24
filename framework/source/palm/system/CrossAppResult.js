/**
A CrossAppTarget control is used to communicate with the "caller" who has invoked some UI using the CrossAppUI component.

	{kind: "CrossAppTarget", onParamsChange:"myHandleNewParams"}

*/
enyo.kind({
	name: "enyo.CrossAppResult",
	kind: enyo.Component,
	//* @protected
	sendResult: function(params) {
		if (window.parent) {
			window.parent.postMessage("enyoCrossAppResult="+enyo.json.stringify(params), "*");
		}
	}
});
