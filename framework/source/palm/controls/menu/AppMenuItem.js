enyo.kind({
	name: "enyo.AppMenuItem",
	kind: enyo.MenuItem,
	defaultKind: "AppMenuItem",
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.$.item.addClass("enyo-appmenu-item");
	}
});
