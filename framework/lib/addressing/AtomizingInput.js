// FIXME: currently a bad name: this is not an Input kind, should it be?
enyo.kind({
	name: "enyo.AtomizingInput",
	kind: enyo.Control,
	className: "enyo-atomizing-input-container",
	events: {
		onFilterStringChanged: "",
		onAtomize: "",
		onGetContact: "",
		onEditContact: "",
		onShowAllButtonClick: "",
		onExpandButtonClick: "",
		onFilterCleared: "",
		onContactsChanged: ""
	},
	published: {
		contacts: null,
		expandButtonCaption: "",
		hint: enyo.addressing._$L("Name or email address"),
		inputType: "",
		filterDelay: 200,
		inputValue: "",
		inputClassName: "enyo-middle"
	},
	//* @protected
	components: [
		{kind: "InputBox", className: "enyo-atomizing-input-box", layoutKind: null, components: [
			{name: "client", className: "enyo-atomizing-input-wrapper", components: [
				{name: "expandButton", kind: "Button", className: "enyo-contact-atom enyo-addressing-expand-button", onclick: "doExpandButtonClick"},
				{name: "showallButton", showing: true, kind: "IconButton", className: "enyo-addressing-showall-button",  icon: "enyo-addressing-showall-icon", iconIsClassName: true, onclick: "doShowAllButtonClick"},
				{name: "returnButton", showing: false, kind:"CustomButton", className: "enyo-addressing-return-button", onclick:"atomizeInput"},
				{
					name: "input",
					kind: "RichText",
					className: "enyo-atomizing-input",
					autocorrect: false,
					autoWordComplete: false,
					spellcheck: false,
					autoCapitalize: "lowercase",
					styled: false,
					richContent: false,
					onkeydown: "inputKeydown",
					onkeypress: "inputKeypress",
					oninput: "inputInputEvent"
				}
			]}
		]}
	],
	constructor: function() {
		// Semicolon **webOS NON-STANDARD**
		var semicolon = window.PalmSystem ? 59 : 186;
		this.atomizingKeyCodes = [
			semicolon,
			13,		// Enter
			188		// Comma
		];
		this.contacts = [];
		this.atoms = [];
		this.inherited(arguments);
	},
	create: function() {
		this.inherited(arguments);
		this.contactsChanged();
		this.expandButtonCaptionChanged();
		this.inputTypeChanged();
		this.inputClassNameChanged();
		this.inputValueChanged();
		this.hintChanged();
	},
	inputClassNameChanged: function(inOldValue) {
		if (inOldValue) {
			this.$.inputBox.removeClass(inOldValue);
		}
		this.$.inputBox.addClass(this.inputClassName);
	},
	setOrderStyle: function(inClass) {
		this.setInputClassName(inClass);
	},
	expandButtonCaptionChanged: function() {
		this.$.expandButton.setContent(this.expandButtonCaption);
	},
	hintChanged: function() {
		var h = this.atoms.length ? "" : this.hint;
		this.$.input.setHint(h);
	},
	inputValueChanged: function(inOldValue) {
		this.inputValue = this.inputValue || "";
		this.$.input.setValue(this.inputValue);
		if (this.generated && inOldValue !== undefined) {
			this.startFilterJob();
		}
	},
	getInputValue: function() {
		return this.inputValue = this.$.input.getValue();
	},
	inputTypeChanged: function() {
		this.$.input.setInputType(this.inputType);
		if (this.hasNode()) {
			this.$.input.render();
		}
	},
	contactsChanged: function() {
		this.destroyAtoms();
		var f = this.$.input.hasFocus();
		//this.setInputValue("");
		this.contacts = this.contacts || [];
		for (var i=0, c; c=this.contacts[i]; i++) {
			this.addAtom(c, f);
		}
		if (!f) {
			this.unbuttonize();
		}
		this.hintChanged();
	},
	getContacts: function() {
		this.atomizeInput();
		var contacts = [];
		for (var i=0, a; a=this.atoms[i]; i++) {
			contacts.push(a.getContact());
		}
		return this.contacts = contacts;
	},
	getSelection: function() {
		return this.$.input.getSelection();
	},
	//* @public
	forceFocus: function(inCallback) {
		this.$.input.forceFocus(inCallback);
	},
	addAtom: function(inContact) {
		var atom = this.createComponent({
			kind: "ContactAtom",
			contact: inContact,
			isButtony: this.$.input.hasFocus(),
			onclick: "editAtom",
			onGetContact: "doGetContact"
		});
		//
		this.atoms.push(atom);
		//
		// New atom should be inserted before the input element
		// avoid rendering client to prevent blur of input.
		var c = this.$.client;
		c.children.pop();
		c.children.splice(c.children.length - 1, 0, atom);
		if (this.hasNode()){
			atom.render();
			if (atom.hasNode()) {
				atom.node.parentNode.insertBefore(atom.node, atom.node.previousSibling);
			}
		}
		this.$.input.setValue("");
		return atom;
	},
	//* @protected
	atomizeInput: function() {
		var contact = this.$.input.getValue();
		if (contact) {
			var atom = this.addAtom(contact);
			this.doAtomize(atom);
		} else {
			return false;
		}
		this.doContactsChanged();
		this.$.input.setValue("");
		this.showAllOrReturn(true);
		this.hintChanged();
		return true;
	},
	destroyAtoms: function() {
		for (var i=0, a; a=this.atoms[i]; i++) {
			a.destroy();
		}
		this.atoms = [];
	},
	removeAtom: function(inAtom) {
		if (inAtom) {
			this.atoms = this.atoms.filter(function (a) { return a != inAtom });
			inAtom.destroy();
			if (this.$.input.hasNode()) {
				this.$.input.node.focus();
			}
		}
		this.doContactsChanged();
	},
	removeLastAtom: function() {
		this.removeAtom(this.atoms.slice(-1)[0]);
	},
	buttonize: function(inSender, inEvent) {
		for (var i = 0, a; a=this.atoms[i]; i++) {
			a.setIsButtony(true);
		}
	},
	unbuttonize: function(inSender, inEvent) {
		for (var i = 0, a; a=this.atoms[i]; i++) {
			a.setIsButtony(false);
			a.setSeparator(i < this.atoms.length-1 ? "; " : "");
		}
	},
	editAtom: function(inSender, inEvent) {
		if (!this.$.input.hasFocus()) {
			return;
		}
		this.atomizeInput();
		var contact = inSender.getContact();
		this.removeAtom(inSender);
		this.$.input.setValue(enyo.string.escapeHtml(contact.value || contact.displayName));
		/*
		* FIXME: Suspend the keyboard while bluring and highlighting the input
		* This is to prevent the keyboard from dropping while we work around an issue
		* where the select would not highlight
		*/
		enyo.keyboard.suspend();
		this.$.input.forceBlur(enyo.bind(this.$.input, function() {
			this.forceSelect(enyo.keyboard.resume);
		}));
		this.doEditContact(inSender);
	},
	// FIXME: cribbed from Input and necessitated by asynchronous keyboard focusAtPoint api.
	// can remove when this api is improved.
	mousedownHandler: function(inSender, inEvent) {
		var r = this.doMousedown(inEvent);
		this.chromeMousedown = !inSender.isDescendantOf(this.$.input) ? inEvent : null;
		if (this.chromeMousedown) {
			this.handleChromeMousedown(inEvent);
		}
		return r;
	},
	handleChromeMousedown: function(inEvent) {
		inEvent.chromeEventPrevented = inEvent.prevented;
		inEvent.preventDefault();
		inEvent.preventDefault = function() {
			inEvent.chromeEventPrevented = true;
		}
	},
	mouseupHandler: function(inSender, inEvent) {
		if (!this.$.input.hasFocus()) {
			// focus via a chrome click if there's no drag and event was not cancelled
			var canFocusChrome = this.chromeMousedown && !this.disabled && !inEvent.didDrag && !this.chromeMousedown.chromeEventPrevented
			// clicks on buttons in inputbox should not focus input
			if (canFocusChrome && !inSender.isDescendantOf(this.$.showallButton) && !inSender.isDescendantOf(this.$.returnButton) && !inSender.isDescendantOf(this.$.expandButton)) {
				this.forceFocus(enyo.bind(this, "cursorToEndPosition"));
			}
		} else if (!inSender.isDescendantOf(this.$.input)) {
			this.cursorToEndPosition();
		}
		return this.doMouseup(inEvent);
	},
	cursorToEndPosition: function() {
		var s = this.getSelection();
		if (s) {
			s.modify("move", "right", "documentboundary");
		}
	},
	focusHandler: function(inSender, inEvent) {
		this.buttonize();
		this.showAllOrReturn(this.getInputValue().length === 0);
		this.addClass(this.focusedClassName);
		this.fire("onfocus", inEvent);
	},
	blurHandler: function(inSender, inEvent) {
		this.showAllOrReturn(true);
		this.unbuttonize();
		this.removeClass(this.focusedClassName);
		this.hintChanged();
		this.fire("onblur", inEvent);
	},
	keyShouldAtomize: function(inKeyCode) {
		for (var i=0, kc=this.atomizingKeyCodes; i < kc.length; i++) {
			if (kc[i] == inKeyCode) {
				return true;
			}
		}
	},
	isExcludedFilterKey: function(inKeyCode) {
		if (inKeyCode == 9) {
			return true;
		}
	},
	// if we are deleting the last character, we need to not search
	isDeletingLastChar: function(inKeyCode) {
		if (inKeyCode == 8) {
			// maybe a bit paranoid, but w/e
			var v = this.$.input.getValue()||"";
			// only true when deletion kills last character (or won't do anything)
			return !(v.length > 1);
		}
	},
	inputKeydown: function(inSender, inEvent) {
		var keyCode = inEvent.keyCode;
		if (this.keyShouldAtomize(keyCode)) {
			// Atomizing keys shouldn't print their characters
			inEvent.preventDefault();
			var atomized = this.atomizeInput();
			event.atomizedInput = atomized;
		// special handling for when we have no value
		} else if (!this.$.input.getValue()) {
			// 8 == delete
			// Deleting when input is empty should destroy the last atom.
			if (keyCode == 8) {
				if (this.atoms.length) {
					this.removeLastAtom();
				}
			// 32 == space
			// disallow leading space
			} else if (keyCode == 32) {
				inEvent.preventDefault();
			}
		} else if (!this.isExcludedFilterKey(keyCode)) {
			if (this.isDeletingLastChar(keyCode)) {
				this.stopFilterJob();
				this.doFilterCleared();
			} else {
				this.startFilterJob();
			}
		}
	},
	inputKeypress: function(inSender, inEvent) {
		var kc = inEvent.keyCode;
		if (!this.keyShouldAtomize(kc) && !this.isExcludedFilterKey(kc) && !this.isDeletingLastChar(kc)) {
			this.startFilterJob();
		}
	},
	inputInputEvent: function(inSender, inEvent) {
		var showAllOrReturn = inSender.isEmpty();
		this.showAllOrReturn(showAllOrReturn);
		if (showAllOrReturn) {
			this.stopFilterJob();
			this.doFilterCleared();
		}
	},
	showAllOrReturn: function(inShowAll) {
		this.$.showallButton.setShowing(inShowAll);
		this.$.returnButton.setShowing(!inShowAll);
	},
	startFilterJob: function() {
		enyo.job(this.id + "filter", enyo.bind(this, "fireFilterStringChanged"), this.filterDelay);
	},
	stopFilterJob: function() {
		enyo.job.stop(this.id + "filter");
	},
	fireFilterStringChanged: function() {
		var v = this.$.input.getValue();
		this.doFilterStringChanged(v);
	}
});
