enyo.kind({
	name: "enyo.ContactAtom",
	kind: "Button",
	layoutKind: "HFlexLayout",
	align: "center",
	pack: "center",
	className: "enyo-button enyo-contact-atom",
	published: {
		contact: null,
		isButtony: false,
		separator: "",
	},
	events: {
		onGetContact: ""
	},
	chrome: [
		{name: "content", className: "enyo-contact-atom-content", flex: 1},
	],
	constructor: function() {
		this.contact = {};
		this.inherited(arguments);
	},
	create: function() {
		this.inherited(arguments);
		this.contactChanged();
		this.isButtonyChanged();
	},
	isButtonyChanged: function() {
		this.addRemoveClass("enyo-button", this.isButtony);
		this.contactChanged();
	},
	contactChanged: function() {
		// try updating contact with a real person contact
		if (!this.contact || enyo.isString(this.contact)) {
			// well, we tried
			this.contact = this.doGetContact() || {value:this.contact};
		}
		var v = "";
		if (this.contact) {
			v = (this.contact.displayName || this.contact.name || this.contact.value) || "";
			v = v + (this.isButtony ? "" : this.separator);
		}
		this.$.content.setContent(v);
	},
	separatorChanged: function() {
		this.contactChanged();
	}
});
