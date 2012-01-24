enyo.kind({
	name: "App",
	kind: enyo.VFlexBox,
	components: [
		{kind: "PageHeader", content: "Some popups shown with different animations"},
		{kind: "Pane", flex: 1, components: [
			{style: "background: beige;", components: [
				{content: "View 1"},
				{kind: "Button", caption: "Open Popup", onclick: "openPopup", popup: "popup"},
				{kind: "Popup", dismissWithClick: false, width: "400px", components: [
					{content: "I live inside Pane View #1 and will close when it closes"},
					{kind: "PasswordPrompt", onCancel: "closePopup", onSubmit: "confirmPassword"}
				]}
			]},
			{style: "background: tomato;", components: [
				{content: "View 2"},
				{kind: "Button", caption: "Open Popup", onclick: "openPopup", popup: "v2Popup"},
				{name: "v2Popup", kind: "Popup", dismissWithClick: false, width: "400px", components: [
					{content: "I live inside Pane View #2 and will close when it closes"},
					{kind: "PasswordPrompt", onCancel: "closePopup", onSubmit: "confirmPassword"}
				]}
			]}
		]},
		{name: "appPopup", kind: "Popup", dismissWithClick: false, width: "400px", components: [
			{content: "I live inside the app and stay open!"},
			{kind: "PasswordPrompt", onCancel: "closePopup", onSubmit: "confirmPassword"}
		]},
		{kind: "Toolbar", components: [
			{caption: "Open Popup", onclick: "openPopup", popup: "appPopup"},
			{caption: "Next", onclick: "nextClick"}
		]}
		
	],
	openPopup: function(inSender) {
		var p = this.$[inSender.popup];
		if (p) {
			p.openAtCenter();
		}
	},
	nextClick: function() {
		this.$.pane.next();
	},
	closePopup: function(inSender) {
		inSender.container.close();
	},
	confirmPassword: function(inSender) {
		this.closePopup(inSender);
	}
});