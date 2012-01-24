enyo.kind({
	name: "PasswordPrompt",
	kind: enyo.Control,
	events: {
		onSubmit: "",
		onCancel: ""
	},
	components: [
		{content: "Enter your password:", style: "font-size: 26px; padding: 6px;"},
		{kind: "PasswordInput"},
		{content: "Some pickers"},
		{kind: "DatePicker"},
		{kind: "ListSelector", items: ["1", "2", "3", "4"]},
		{kind: "HFlexBox", style: "padding-top: 6px;", components: [
			{kind: "Button", flex: 1, caption: "Cancel", onclick: "doCancel"},
			{kind: "Spacer"},
			{kind: "Button", flex: 1, caption: "Submit", onclick: "doSubmit"},
		]}
	],
	getPassword: function() {
		return this.$.passwordInput.getValue();
	}
});
