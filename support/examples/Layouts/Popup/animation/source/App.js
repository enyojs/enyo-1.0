easeOutBounce = function(inValue, inAnimation) {
	var a = inAnimation;
	return easeOutBounce.step(a.t1-a.t0, 0, 1, a.duration); 
}

// http://plugins.jquery.com/files/jquery.easing.1.2.js.txt
// t: current time, b: beginning value, c: change in value, d: duration
easeOutBounce.step = function (t, b, c, d) {
	if ((t/=d) < (1/2.75)) {
		return c*(7.5625*t*t) + b;
	} else if (t < (2/2.75)) {
		return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
	} else if (t < (2.5/2.75)) {
		return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
	} else {
		return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
	}
}

enyo.kind({
	name: "App",
	kind: enyo.VFlexBox,
	components: [
		{kind: "PageHeader", content: "Some popups shown with different animations"},
		{kind: "Animator", onBegin: "beginAnimation", onAnimate: "stepAnimation", onEnd: "endAnimation"},
		{kind: "Button", caption: "Open Modal Popup", onclick: "openPopup", popup: "popup"},
		{kind: "Button", caption: "Open Popup Fade", onclick: "openPopup", popup: "popupFade"},
		{kind: "Button", caption: "Open Animated Popup", onclick: "openPopup", popup: "animatedPopup"},
		{kind: "Button", caption: "Open Transitioning Popup", onclick: "openPopup", popup: "transitioningPopup"},
		{kind: "Button", caption: "Open Fancy Popup", onclick: "openPopup", popup: "fancyPopup"},
		{kind: "Button", caption: "Open PopupMenu", onclick: "openPopupMenu"},
		{kind: "Popup", modal: true, dismissWithClick: false, width: "400px", components: [
			{kind: "PasswordPrompt", onCancel: "closePopup", onSubmit: "confirmPassword"}
		]},
		{name: "popupFade", kind: "Popup", showHideMode: "transition", openClassName: "fadeIn", 
			className: "fadedOut", components: [
			{content: "I faded in and out"},
			{kind: "Button", caption: "Close", popupHandler: true}
		]},
		{name: "animatedPopup", kind: "Popup", showHideMode: "manual", onOpen: "animateOpen", onClose: "animateClose",
			scrim: true, modal: true, width: "400px", components: [
			{kind: "PasswordPrompt", onCancel: "closePopup", onSubmit: "confirmPassword"}
		]},
		{name: "transitioningPopup", kind: "Popup", showHideMode: "transition", openClassName: "scaleFadeIn", scrim: true, 
			modal: true, className: "transitioner", width: "400px", components: [
			{kind: "PasswordPrompt", onCancel: "closePopup", onSubmit: "confirmPassword"}
		]},
		{name: "confirmPasswordPopup", kind: "Popup", scrim: true, components: [
			{content: "Your password is:"},
			{name: "passwordDisplay"}
		]},
		{name: "fancyPopup", kind: "Popup", showHideMode: "transition", openClassName: "zoomFadeIn", 
			className: "transitioner2", layoutKind: "VFlexLayout",
			style: "overflow: hidden", width: "75%", height: "75%", components: [
			{kind: "FancySliding", flex: 1}
		]},
		{kind: "Menu", showHideMode: "transition", openClassName: "scaleIn", 
			className: "transitioner3", components: [
			{caption: "Foo"},
			{caption: "Bar"},
			{caption: "Baz"}
		]}
	],
	animateOpen: function(inSender) {
		if (inSender.hasNode()) {
			this.$.animator.setDuration(750);
			this.$.animator.style = inSender.node.style;
			this.$.animator.popup = inSender;
			this.$.animator.setEasingFunc(easeOutBounce);
			this.$.animator.play();
		}
	},
	animateClose: function(inSender) {
		this.$.animator.setDuration(250);
		this.$.animator.setEasingFunc(enyo.easing.easeOut);
		this.$.animator.play();
	},
	beginAnimation: function(inSender) {
		inSender.popup.setShowing(true);
	},
	stepAnimation: function(inSender, inValue, inPercent) {
		var p = inSender.popup.isOpen ? inPercent : 1 - inPercent;
		inSender.style.opacity = p;
		inSender.style.webkitTransform = "scale(" + (2 - p) +")";
	},
	endAnimation: function(inSender) {
		var popup = inSender.popup;
		popup.setShowing(popup.isOpen);
	},
	confirmPassword: function(inSender) {
		this.closePopup(inSender);
		var password = inSender.getPassword();
		this.$.passwordDisplay.setContent(password);
		this.$.confirmPasswordPopup.openAtCenter();
	},
	closePopup: function(inSender) {
		inSender.container.close();
	},
	openPopup: function(inSender) {
		var p = this.$[inSender.popup];
		if (p) {
			p.openAtCenter();
		}
	},
	openPopupMenu: function(inSender) {
		this.$.menu.openAroundControl(inSender, null, "left");
	}
});