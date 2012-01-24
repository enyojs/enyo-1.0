enyo.kind({
	name: "enyo.Showing",
	kind: enyo.Control,
	style: "padding: 16px",
	components: [
		{style: "background-color: white; padding: 16px;", content: "<i>showing</i> property and <i>show()/hide()</i> methods are really just shortcuts for setting and removing display: none style (<a href='../../docs/api/#dom/DomNode.js'>see documentation</a>).<br/><br/>Here are examples:<br/>", allowHtml: true},
		{style: "padding: 16px; border: 1px solid silver;", components: [
			{content: "I'm showing true."},
			{content: "I'm showing false.", showing: false},
			{name: "noshow", content: "I'm showing false, but code has made me display by changing styles."},
			{className: "always-show", content: "I'm showing false, but CSS has made me display anyway."},
			{name: "showme", content: "I was showing false, until show().", showing: false},
			{components: [
				{content: "Left ", style: "display: inline"}, 
				{name: "middle", style: "display: inline", content: "-Middle (still display: inline after showing toggled)-", showing: false},
				{content: " Right", style: "display: inline"}
			]}
		]}
	],
	create: function() {
		this.inherited(arguments);
		// override showing by forcing a display style
		this.$.noshow.applyStyle("display", null);
		// toggle showme's showing
		this.$.showme.show();
		// show middle now, middle will remember being set to inline
		this.$.middle.show();
	}
});