enyo.kind({
	name: "BuildUI",
	kind: "VFlexBox",
	components: [
		{kind: "Header", content: "Enyo Compressor", pack: "center"},
		{kind: "RowGroup", content: "Paths", components: [
			{kind: "Input", name: "sourcePath", hint: "Source Folder Path"},
			{kind: "Input", name: "buildPath", hint: "Output Folder Path"}
		]},
		{kind: "RowGroup", content: "Options", components: [
			{kind: "HFlexBox", components: [
				{content: "Inplace build", flex: 1},
				{kind: "CheckBox", onChange: "inplaceChange", name: "inplace"}
			]},
			{kind: "HFlexBox", components: [
				{content: "Overwrite depends.js file", flex: 1},
				{kind: "CheckBox", name: "overwriteDepends", checked: true, disabled: true}
			]},
			{kind: "HFlexBox", components: [
				{content: "Clean up build folder", flex: 1},
				{kind: "CheckBox", name: "delete", checked: true}
			]},
			{kind: "HFlexBox", components: [
				{content: "Build as Enyo Framework", flex: 1},
				{kind: "CheckBox", name: "makeEnyo"}
			]},
			{kind: "VFlexBox", components: [
				{kind: "HFlexBox", components: [
					{content: "Use Alternate depends file", flex: 1},
					{kind: "CheckBox", onChange: "altChange", name: "useAlt"}
				]},
				{kind: "Input", name: "altDepends", hint: "Alternate depends.js file path", showing: false}
			]}
		]},
		{kind: "Button",  onclick: "build", content: "Build"},
		{kind: "Scroller", flex: 1, components: [
			{name: "log", style: "background: white; font-family: monospace; font-size: 10pt; margin: 5px;", flex: 1, content: "", allowHtml: true}
		]}
	],
	inplaceChange: function(inSender) {
		var enable = inSender.getChecked();
		this.$.overwriteDepends.setDisabled(!enable);
		if (!enable) {
			this.$.overwriteDepends.setChecked(true);
		}
	},
	altChange: function(inSender) {
		this.$.altDepends.setShowing(inSender.getChecked());
	},
	build: function(inSender) {
		this.$.button.setDisabled(true);
		this.$.scroller.scrollIntoView(0, 0);
		this.$.log.setContent("Build Started at " + (new Date) + "<br/>");
		var options = {
			start: this.$.sourcePath.getValue(),
			output: this.$.buildPath.getValue() || "build",
			inplace: this.$.inplace.getChecked(),
			"overwrite-depends": this.$.overwriteDepends.getChecked(),
			"make-enyo": this.$.makeEnyo.getChecked(),
			delete: this.$.delete.getChecked(),
			colors: true,
			mode: "browser",
			verbose: true
		};
		options.use = this.$.useAlt.getChecked() ? this.$.altDepends.getValue() : options["make-enyo"] ? "enyo-depends.js" : "depends.js";
		if (options["make-enyo"]) {
			options.keyfile = "platform/startup.js";
			options.js = "enyo-build.js";
			options.css = "enyo-build.css";
		} else {
			options.js = "build.js";
			options.css = "build.css";
		}
		enyo.xhrPost({url: "/", load: enyo.bind(this, "buildDone"), body: enyo.json.stringify(options), headers: {"Content-Type": "application/json"}});
	},
	buildDone: function(inResponseText, inXhr) {
		this.appendLog(inResponseText + "\n");
		this.$.button.setDisabled(false);
	},
	appendLog: function(inText) {
		inText = inText.replace(/\n/g, "<br/>");
		this.$.log.setContent(this.$.log.getContent() + inText);
	}
});
