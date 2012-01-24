someContent = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."

enyo.kind({
	name: "enyo.CanonSliding",
	kind: enyo.VFlexBox,
	components: [
		{kind: "VFlexBox", className: "enyo-fit", components: [
			
		]},
		{name: "slidingPane", kind: "SlidingPane", flex: 1, onSelectView: "slidingSelected", components: [
			{name: "left", width: "320px", layoutKind: "VFlexLayout", components: [
				{kind: "Header", content: "Fixed"},
				{kind: "Scroller", flex: 1, components: [
					{kind: "CanonPeekItem", caption: "Button 1", className: "enyo-first", onclick: "peekItemClick"},
					{kind: "CanonPeekItem", caption: "Button 2", onclick: "peekItemClick"},
					{kind: "CanonPeekItem", caption: "Button 3", className: "enyo-last", onclick: "peekItemClick"}
				]},
				{kind: "Toolbar", components: [
					{caption: "MultiView", toggling: true, depressed: true, onclick: "toggleMultiView"},
					{caption: "Add", onclick: "addPanel"}
				]}
			]},
			{width: "320px", fixedWidth: true, onResize: "slidingResize", components: [
				{kind: "CanonView", headerContent: "Panel 2", onGo: "next", flex: 1, components: [
					{className: "margin-medium", components: [
						{kind: "RowGroup", caption: "Inputs", components: [
							{kind: "Input"},
							{kind: "Input"},
							{kind: "Input"}
						]},
						{kind: "Button", caption: "De-lazy", onclick: "gotoLazyView"},
						{kind: "Button", onclick: "hideNext"},
						{kind: "Button", onclick: "showNext"}
					]}
				]}
			]},
			{name: "lazy", width: "320px", lazy: true, components: [
				{kind: "CanonView", headerContent: "Lazy Pane", onGo: "next", flex: 1, components: [
					{className: "margin-medium", components: [
						{kind: "RowGroup", caption: "Inputs", components: [
							{kind: "Input"},
							{kind: "Input"},
							{kind: "Input"}
						]},
						{name: "info", style: "height: 50px;"}
					]}
				]}
			]}
			
			/*,
			{name: "right", flex: 1, onResize: "slidingResize", components: [
				{kind: "CanonView", headerContent: "Panel 3", flex: 1, onGo: "next", components: [
					{className: "margin-medium", content: someContent}
				]}
			]}*/
		]},
		{name: "log", content: "Log"}
	],
	next: function() {
		this.$.slidingPane.next();
	},
	peekItemClick: function(inSender) {
		this.$.left.selectNext();
	},
	gotoLazyView: function() {
		this.$.slidingPane.selectViewByName("lazy");
	},
	count: 1,
	addPanel: function() {
		this.$.slidingPane.createComponent({width: "320px", onResize: "slidingResize", components: [
			{kind: "CanonView", headerContent: "Added Panel!", onGo: "next", flex: 1, components: [
				{style: "font-size: 300px; text-align: center;", content: this.count},
				{kind: "Button", onclick: "hideNext"},
				{kind: "Button", onclick: "showNext"}
			]}
		]}, {owner: this});
		this.count++;
		this.$.slidingPane.render();
	},
	slidingSelected: function(inSender, inSliding, inLastSliding) {
		//this.log(inSliding.id, (inLastSliding || 0).id);
	},
	slidingResize: function(inSender, inSize) {
		this.$.log.setContent(inSize || "null");
	},
	backHandler: function(inSender, e) {
		this.$.slidingPane.back(e);
	},
	toggleMultiView: function(inSender) {
		this.$.slidingPane.setMultiView(inSender.depressed);
	},
	hideNext: function(inSender) {
		var n = this.findNextSlidingAncestor(inSender);
		if (n) {
			n.setShowing(false);
		}
	},
	showNext: function(inSender) {
		var n = this.findNextSlidingAncestor(inSender);
		if (n) {
			n.setShowing(true);
		}
	},
	findNextSlidingAncestor: function(inSender) {
		var s = this.findSlidingAnestor(inSender);
		return s && s.getNextSibling();
	},
	findSlidingAnestor: function(inSender) {
		p = inSender.parent;
		while (p) {
			if (p instanceof enyo.SlidingView) {
				return p;
			}
			p = p.parent;
		}
	}
});