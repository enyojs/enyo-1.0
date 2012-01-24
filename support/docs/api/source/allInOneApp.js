enyo.kind({
	name: "AllInOneApp",
	kind: enyo.HFlexBox,
	components: [
		{flex: 1, kind: "VFlexBox", style: "background: white; overflow: auto; padding: 10px;", components: [
			{name: "docs", onclick: "docClick", requiresDomMousedown: true, allowHtml: true, className: "selectable"}
		]}
	],
	create: function() {
		// this maps files to content objects
		this.modules = {};
		this.inherited(arguments);
		this.nextDoc();
	},
	docsFinished: function() {
		var renderedModules = Object.keys(this.modules).map(function(topic) {
			return this.modules[topic] ? this.modules[topic].renderContent() : "";
		}, this);

		this.$.docs.setContent(renderedModules.join("<hr>"));
	},
	docIndex: 0,
	nextDoc: function() {
		var m = enyo.modules[this.docIndex++];
		if (m) {
			this.loadDoc(m.path);
		} else {
			this.docsFinished();
		}
	},
	loadDoc: function(inUrl) {
		enyo.xhrGet({
			url: inUrl,
			load: enyo.bind(this, "docLoaded", inUrl)
		});
	},
	docLoaded: function(inUrl, d) {
		this.addDocs(inUrl, d);
		this.nextDoc();
	},
	addDocs: function(inPath, inCode) {
		// remove crufty part of path
		var module = enyo.Module.relativizePath(inPath);
		this.modules[module] = this.createComponent({kind: "Module", name: module, path: module, source: inCode});
	}
});
