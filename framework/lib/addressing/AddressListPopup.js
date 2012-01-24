enyo.kind({
	kind:"Popup",
	name:"AddressListPopup",
	// let clicks go through to other parts of the popup's container, like the AtomizingInput
	processClick: function(inSender, inEvent) {
		if (this.dismissWithClick && !inEvent.dispatchTarget.isDescendantOf(this.owner)) {
			this.inherited(arguments);
		}
	}
});
