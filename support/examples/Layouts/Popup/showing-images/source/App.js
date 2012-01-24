enyo.kind({
	name: "App",
	kind: enyo.VFlexBox,
	components: [
		{kind: "Button", caption: "Open Image Popup", onclick: "openPopupClick"},
		{kind: "Button", caption: "Open ImageView Popup", onclick: "openViewImagePopupClick"},
		{kind: "Popup", onBeforeOpen: "beforePopupOpen", components: [
			{content: "Some images"},
			{kind: "Image", onload: "imageLoad"},
			{kind: "HFlexBox", components: [
				{kind: "Button", caption: "Next", onclick: "nextClick", flex: 1},
				{kind: "Button", caption: "Close", popupHandler: true, flex: 1}
			]}
		]},
		{name: "viewImagePopup", kind: "Popup", layoutKind: "VFlexLayout", 
			height: "500px", width: "500px", onBeforeOpen: "beforeViewImagePopupOpen", components: [
			{content: "Image Viewer"},
			{kind: "ImageView", flex: 1, style: "border: 1px solid black;"},
			{kind: "HFlexBox", components: [
				{kind: "Button", caption: "Next", onclick: "nextImageViewClick", flex: 1},
				{kind: "Button", caption: "Close", popupHandler: true, flex: 1}
			]}
		]}
	],
	index: 0,
	create: function() {
		this.inherited(arguments);
	},
	images: ["images/1.jpg", "images/2.jpg"],
	openPopupClick: function() {
		this.$.popup.openAtCenter();
	},
	openViewImagePopupClick: function() {
		this.$.viewImagePopup.openAtCenter();
	},
	beforePopupOpen: function() {
		this.updateImage();
	},
	nextClick: function() {
		// hide image while switching to smooth transition
		this.$.popup.applyStyle("visibility", "hidden");
		this.index = (this.index +1) % this.images.length;
		this.updateImage();
	},
	updateImage: function() {
		this.$.image.setSrc(this.images[this.index]);
	},
	imageLoad: function() {
		this.$.popup.resized();
		// show after a slight delay.
		enyo.asyncMethod(this, function() {
			this.$.popup.applyStyle("visibility", null);
		});
	},
	//
	beforeViewImagePopupOpen: function() {
		this.updateViewImage();
	},
	nextImageViewClick: function() {
		this.index = (this.index +1) % this.images.length;
		this.updateViewImage();
	},
	updateViewImage: function() {
		this.$.imageView.setCenterSrc(this.images[this.index]);
	}
});