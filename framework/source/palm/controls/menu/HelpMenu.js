/**
Menu item for Help.  Should be used by an application to provide user access to
additional help content.  It is meant to be used inside an <a href="#enyo.AppMenu">enyo.AppMenu</a>.

	{kind: "AppMenu", components: [
		{kind: "EditMenu"},
		{kind: "HelpMenu", target: "http://help.palm.com/phone/index.html"}
	]}
	
For internal HP/Palm applications, this will start the on-device Help application.  If
the target points outside the palm.com domain, this will instead launch the web browser
to display the content.
*/
enyo.kind({
	name: "enyo.HelpMenu",
	kind: enyo.AppMenuItem,
	caption: enyo._$L("Help"),
	published: {
		target: ""
	},
	//* @protected
	helpAppId: "com.palm.app.help",
	components: [
		{name: "launchHelp", kind: "PalmService", service: "palm://com.palm.applicationManager/", method: "open"},
	],
	itemClick: function() {
		this.inherited(arguments);
		/* for targets inside palm.com domain, use our help applications.  For help targets outside 
			of HP/Palm, use the web browser. */
		var hostMatch = this.target.match( /^http[sS]?:\/\/([^\/:?]+)/ );
		var palmDomain = (hostMatch && hostMatch.length >= 2 && this.stringEndsWith(hostMatch[1], "palm.com"));
		
		if (palmDomain) {
			this.$.launchHelp.call({id: this.helpAppId, params: {target: this.target}});
		}
		else {
			this.$.launchHelp.call({target: this.target});
		}
	},
	stringEndsWith: function (str, pattern) {
		var d = str.length - pattern.length;
		return d >= 0 && str.lastIndexOf(pattern) === d;
	}
});
