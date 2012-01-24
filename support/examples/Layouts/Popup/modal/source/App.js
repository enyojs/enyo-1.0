enyo.kind({
	name: "App",
	kind: enyo.VFlexBox,
	components: [
		{kind: "PageHeader", content: "Some Modal Dialogs"},
		{kind: "Button", caption: "Open Simple ModalDialog", onclick: "openPopup", popup: "modalDialog"},
		{kind: "Button", caption: "Open Scrolling ModalDialog", onclick: "openPopup", popup: "scrollingDialog"},
		{kind: "Button", caption: "Open ModalDialog with Pane (explicit height)", onclick: "openPopup", popup: "modalDialog1"},
		{kind: "Button", caption: "Open ModalDialog with Pane (natural height)", onclick: "openPopup", popup: "modalDialog2"},
		{kind: "ModalDialog", showKeyboardWhenOpening: true,  layoutKind: "VFlexLayout",
			caption: "Enter your password", onOpen: "dialogOpened", components: [
			{kind: "PasswordInput"},
			{components: [
				{kind: "Button", caption: "OK", popupHandler: "OK"},
				{kind: "Button", caption: "Cancel", popupHandler: "Cancel"},
			]}
		]},
		{name: "scrollingDialog", kind: "ModalDialog", showKeyboardWhenOpening: true,  layoutKind: "VFlexLayout",
			caption: "A bunch of inputs", onOpen: "scrollingDialogOpened", components: [
			// a basic scroller can be dynamically sized; provide height: auto to allow this
			{kind: "BasicScroller", autoVertical: true, style: "height: auto;", flex: 1, components: [
				{kind: "Input"},{kind: "Input"},{kind: "Input"},{kind: "Input"},{kind: "Input"},{kind: "Input"},
				{kind: "Input"},{kind: "Input"},{kind: "Input"},{kind: "Input"},{kind: "Input"},{kind: "Input"}
			]},
			{components: [
				{kind: "Button", caption: "OK", popupHandler: "OK"},
				{kind: "Button", caption: "Cancel", popupHandler: "Cancel"},
			]}
		]},
		{name: "modalDialog1", contentHeight: "400px", layoutKind: "VFlexLayout", kind: "ModalDialog", 
			caption: "Explicitly sized pane", components: [
			{name: "pane1", kind: "Pane", flex: 1, components: [
				{content: "1", style: "background: beige;"},
				{content: "2", style: "background: lightblue;"},
			]},
			{kind: "Button", caption: "Next", onclick: "paneNext", pane: "pane1"},
			{layoutKind: "HFlexLayout", components: [
				{kind: "Button", caption: "OK", flex: 1, popupHandler: "OK"},
				{kind: "Button", caption: "Cancel", flex: 1, popupHandler: "Cancel"},
			]}
		]},
		{name: "modalDialog2", kind: "ModalDialog", 
			caption: "Natually sized pane", components: [
			{name: "pane2", kind: "Pane", layoutKind: "", transitionKind: "enyo.transitions.Simple", components: [
				{content: "1", style: "height: 200px; background: beige;"},
				{content: "2", style: "height: 300px; background: lightblue;"},
			]},
			{kind: "Button", caption: "Next", onclick: "paneNext", pane: "pane2", popup: "modalDialog2"},
			{layoutKind: "HFlexLayout", components: [
				{kind: "Button", caption: "OK", flex: 1, popupHandler: "OK"},
				{kind: "Button", caption: "Cancel", flex: 1, popupHandler: "Cancel"},
			]}
		]}
	],
	openPopup: function(inSender) {
		var p = this.$[inSender.popup];
		if (p) {
			p.openAtCenter();
		}
	},
	dialogOpened: function() {
		// focuses the input and enables automatic keyboard mode
		this.$.passwordInput.forceFocusEnableKeyboard();
	},
	scrollingDialogOpened: function() {
		// focuses the input and enables automatic keyboard mode
		this.$.input.forceFocusEnableKeyboard();
	},
	paneNext: function(inSender) {
		var p = this.$[inSender.pane];
		if (p) {
			p.next();
		}
		var popup = this.$[inSender.popup];
		if (popup) {
			popup.resized();
		}
	}
});