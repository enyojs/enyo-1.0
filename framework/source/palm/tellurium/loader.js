//* @protected
// TELLURIUM LOADER

/*
 * Tellurium
 * 
 * Framework for automation testing. Allows javascript access to remote scripts
 * via service calls. Tellurium is similar to Selenium, but has the added capability
 * to better interface with webOS applications that use the Enyo framework.
 * 
 * See https://wiki.palm.com/display/Nova/Tellurium for more info.
 * 
 * (c) Hewlett-Packard, Inc.
 * webOS GBU
 */

/*
 * Tellurium global object.
 */
var Tellurium = {};

/*
 * The (private) service used to communicate with tests 
 */
Tellurium.identifier = 'palm://com.palm.telluriumservice/';

/*
 * The nub version number:
 *   2.2.2 - enhance app recognition in service.js
 */
Tellurium.nubVersion = '2.2.2';

/*
 * The nub config
 */
Tellurium.config = { "enableUserEvents": false };

/*
 * The nub path on the device
 */
Tellurium.nubPath = '/usr/palm/frameworks/tellurium/';

/*
 * Initializes Tellurium given the application Mojo framework object.
 * Lightweight applications share their Mojo. This is called by the
 * mojo.js patch when a Stage loads.
 */
Tellurium.setup = function(inEnyo) {
	window.Tellurium = Tellurium;
	Tellurium.enyo = inEnyo;
	Tellurium.extend = Tellurium.enyo.mixin;
	Tellurium.isActive = true;
	Tellurium.topSceneName = "";
	Tellurium.metaDown = false;
	Tellurium.inVerifyDialog = false;
	// Delayed event notifications
	Tellurium.delayedEvents = [];
	Tellurium.serviceAvailable = true;
	// Load tellurium config
	var moreConfig = Tellurium.enyo.xhr.request({url: Tellurium.enyo.path.rewrite("$palm-tellurium/tellurium_config.json"), sync: true}).responseText || "{}";
	Tellurium.config = Tellurium.extend(Tellurium.config, enyo.json.parse(moreConfig));
	// Determine the stage type
	Tellurium.stageType = "card";
	
	// Services
	Tellurium.subscribeToCommands();
		
	// Handle events!
	window.addEventListener('unload', Tellurium.cleanup, false);
	window.addEventListener('resize', Tellurium.handleResize, false);

	// FIXME: card related; could make sense, how should we do this?
	//document.addEventListener(Tellurium.Event.stageActivate, Tellurium.handleStageActivate, true);
	//document.addEventListener(Tellurium.Event.stageDeactivate, Tellurium.handleStageDeactivate, true);

	// Load user event
	if(Tellurium.config.enableUserEvents) {
		Tellurium.events.setup();
	}
};

/*
 * Called when the window is being closed. Sends a notification to the
 * Tellurium service that this stage is closing.
 */
Tellurium.cleanup = function() {
	console.log("enyo_tellurium [cleanup]");
	// Remove event listeners
	window.removeEventListener('unload', Tellurium.cleanup, false);	
	window.removeEventListener('resize', Tellurium.handleResize, false);
	
	//document.removeEventListener(Tellurium.Event.stageActivate, Tellurium.handleStageActivate, true);
	//document.removeEventListener(Tellurium.Event.stageDeactivate, Tellurium.handleStageDeactivate, true);

	// Cancel the subscription
	if (Tellurium.subscribeRequest) {
		Tellurium.subscribeRequest.destroy();
	}
	
	if(Tellurium.notifyRequest) {
		Tellurium.notifyRequest.destroy();
	}
	
	if(Tellurium.replyReq) {
		Tellurium.replyReq.destroy();
	}
};
