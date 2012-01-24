enyo.kind({ 
	name: "popups.Popups", 
	kind: "HeaderView",
	components: [
		{kind: "Button", caption: $L("Open A Popup At Center!"), onclick: "example1Click"},
		{kind: "Button", caption: $L("Open A Popup At Event!"), onclick: "example2Click"},
		{kind: "Button", caption: $L("Open A Big Popup!"), onclick: "example3Click"},
		{kind: "Popup", name: "popup1",components: [
		    {content: "Hello World!"},
		    {kind: "ListSelector", value: "Foo", items: ["Foo", "Bar", "Bot"]}
		]},
		{kind: "Popup", name: "popup2", width: "500px", layoutKind: "VFlexLayout", pack: "center", align: "center", components: [
			{content: "Cupcake!", style: "color: red; font-size: 3em"},
			{kind: "Image", src: "images/cupcake.png"}
		]}
	],
	example1Click: function() {
	    this.$.popup1.openAtCenter();
	},
	example2Click: function(inSender, inEvent) {
	    this.$.popup1.openAtEvent(inEvent);
	},
	example3Click: function(inSender, inEvent) {
	    this.$.popup2.openAtCenter();
	}
});