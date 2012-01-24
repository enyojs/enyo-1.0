enyo.kind({
	name: "enyo.CanonPopup",
	kind: enyo.VFlexBox,
	components: [
		{style: "border: 1px solid black; margin: 20px; padding: 10px;", components: [
			{name: "message1", kind: "Input", hint: "Enter a message to display in the dialog"},
			{kind: "Button", caption: "Open Dialog", onclick: "openDialog"},
		]},
		{style: "border: 1px solid black; margin: 20px; padding: 10px;", components: [
			{name: "message2", kind: "Input", hint: "Enter a message to display in the dialog"},
			{kind: "Button", caption: "Open MyDialog", onclick: "openMyDialog"},
		]},
		{kind: "ModalDialog", caption: "A Modal Dialog", onBeforeOpen: "beforeDialogOpen", components: [
			{name: "dialogMessage", style: "text-align: center;"},
			{kind: "Button", caption: "Close", popupHandler: true}
		]},
		{kind: "MyDialog", caption: "A Custom Modal Dialog"}
	],
	// Customize the contents of a dialog or popup instance in the onBeforeOpen event:
	// The contained components are created only when the dialog or popup is opened.
	// Thus So the "message1" component does not exist until the onBeforeOpen event is fired.
	beforeDialogOpen: function() {
		this.$.dialogMessage.setContent(this.$.message1.getValue());
	},
	openDialog: function() {
		this.$.modalDialog.openAtCenter();
	},
	// A dialog sub-kind can be implemented such that its published properties
	// initialize correctly independent of when they are updated. Thus, it's 
	// valid to call MyPopup.setMessage before the popup has been opened.
	openMyDialog: function() {
		this.$.myDialog.setMessage(this.$.message2.getValue());
		this.$.myDialog.openAtCenter();
	}
});