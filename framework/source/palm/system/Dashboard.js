/**
A component that manages a standard dashboard window in order to properly display a list of notification "layers".
Public methods exist for adding and removing layers, which are objects of the following form:

	{
		icon: String, path to icon image for this layer.
		title: First line of text, bold by default.  HTML is automatically escaped.
		text: Second line of text, HTML is automatically escaped.
	}

If the layers stack is empty, the dashboard window is closed.
When the stack is not empty, the data from the topmost layer will be displayed.
If the stack size is greater than 1, the size will be displayed in a little blue badge over the icon.

Applications can create instances of this component for the various types of dashboards they require.
For example, email uses one per email account, and one for the unified "all inboxes".
Then apps can push/pop notification layers as appropriate.  
The component handles all logic for window creation, destruction, and UI display.
*/
/*
	Notes:
	Mojo supported some extra layer properties we may need to add if required by apps: 
		rightHTML, rightIcon, rightTemplate, dashboardCount.
	Mojo also alowed HTML in the 'title' property. 
		We escape it for consistency & safety, but we may need to support an alternative titleHTML property instead.
*/
enyo.kind({
	name: "enyo.Dashboard",
	kind: enyo.Component,
	published: {
		/** Array of layer objects specifying contents of dashboard.*/
		layers: null,
		/** Optional path to small icon to display when this dashboard window is hidden. */
		smallIcon:""
	},
	events: {
		/** Fired when user taps the icon portion of a dashboard. Event includes the top layer object.*/
		onIconTap: "",
		/** Fired when user taps the message portion of a dashboard. Event includes the top layer object.*/
		onMessageTap: "",
		/** Fired when user taps anywhere in a dashboard. Event includes the top layer object.*/
		onTap: "",
		/** Fired when user swipes away the dashboard (or the last layer).  NOT sent when it is programmatically closed by emptying the layer stack.*/
		onUserClose: "",
		/** Fired when user swipes a dashboard layer away, unless it's the last one (that's onUserClose instead). Event includes the top layer object.*/
		onLayerSwipe: "",
		/** Fired when the dashboard window is displayed/maximized. */
		onDashboardActivated: "",
		/** Fired when user dashboard window is concealed/minimized. */
		onDashboardDeactivated: ""
	},
	components: [
		// destroy the component if our window closes.
		// This ensures an orphaned dashboard window won't be left behind.
		{kind:"ApplicationEvents", onUnload:"destroy"}
	],
	
	indexPath: "$palm-system/dashboard-window/dashboard.html",
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.layers = [];
		// Messages for us should have this id, since we cannot otherwise distinguish between messages from different closed dashboard windows.
		this.dashboardId = Math.random();
		// Configure listener for dashboard events.
		this.handleMessageHitched = enyo.hitch(this, "handleMessage");
		window.addEventListener('message', this.handleMessageHitched);
	},
	destroy: function() {
		// Close window if there is one.
		this.layers.length = 0;
		this.updateWindow();
		window.removeEventListener('message', this.handleMessageHitched);
		this.inherited(arguments);
	},
	//* @public
	/** Add a notification layer to the top of the stack. */
	push: function(layer) {
		if(layer) {
			this.layers.push(layer);
			this.updateWindow();
		}
	},
	/** Remove the topmost notification layer from the stack. */
	pop: function() {
		var layer = this.layers.pop();
		this.updateWindow();
		return layer;
	},
	/** Set current stack of notification layers to a copy of the given array. */
	setLayers: function(layers) {
		this.layers = layers.slice(0);
		this.updateWindow();
	},	
	//* @protected
	/**
		Manages window creation & destruction when needed,
		and updates window contents when the layers change.
	*/
	updateWindow: function() {
		// Note that closed windows may get their js bindings snipped, so 'w.closed' may actually be undefined instead of true.
		var windowValid = this.window && this.window.closed === false;
		// If we have items to display, then create the window if we don't already have one.
		if(this.layers.length) {
			var params = {layers:this.layers, docPath:document.location.pathname, dashboardId:this.dashboardId};
			if(!windowValid) {
				var attributes = {webosDragMode:"manual", window:"dashboard", _enyoOpener:window};
				if(this.smallIcon) {
					attributes.icon = this.smallIcon;
				}
				this.window = enyo.windows.openDashboard(enyo.path.rewrite(this.indexPath), this.name, params, attributes);
			} else {
				enyo.windows.activate(undefined, this.name, params);
			}
		} else {
			if(windowValid) {
				this.window.close();
			}
			this.window = undefined;
		}
	},
	// Listen to messages sent by dashboard so we can propagate user events to the app.
	// Expects data like: enyoDashboardEvent={event:"doMessageTap", args:[layer, optionalFakedMouseEvent]}
	handleMessage: function(e) {
		// If we have no window open, the message must not be for us.
		if(!this.window) {
			return;
		}		
		// Ignore messages clearly not from *our* window.
		// When the dashboard is swiped away, our window gets its JS bindings snipped, and the message source is undefined, so source=== is not good enough.
		var couldBeOurWindow = (e.source === this.window) || (e.source === undefined && this.window.closed !== false);
		if(!couldBeOurWindow) {
			return;
		}
		var label = "enyoDashboardEvent=";
		// Only respond to dashboard event messages
		if (e.data.indexOf(label) !== 0) {
			return;
		}
		var data = enyo.json.parse(e.data.slice(label.length));
		// Ignore messages from other dashboards, and poorly formed messages.
		if(data.dashboardId !== this.dashboardId || !data.event || data.event.indexOf("do") !== 0 || !this[data.event]) {
			return;
		}
		// Special handling for a couple of event types.
		// Everything else is propagated directly.
		switch(data.event) {
			case "doLayerSwipe":
				this.layers.pop();
				this.doLayerSwipe.apply(this, data.args);
				break;
			case "doUserClose":
				this.layers.length = 0;
				this.window = undefined;
				this.doUserClose();
				break;
			default:
				this[data.event].apply(this, data.args);
				break;
		}
	}
});
