//* @protected
enyo.requiresWindow = function(inFunction) {
	inFunction();
};

//* @public
/**
	Shortcut to call getElementById() if id is a string, otherwise returns id. doc is 
	optional, refers to document if not provided.
*/
enyo.byId = function(id, doc){
	return (typeof id == "string") ? (doc || document).getElementById(id) : id; 
};

//* @protected
enyo.fixEvent = function(inEvent) {
	var e = inEvent || window.event;
	//  IE has srcElement; Opera10 has both target,srcElement; standard is target
	if (!e.target) {
		e.target = e.srcElement;
	}
	e.handled = enyo._stopEvent;
	return e;
};

enyo._stopEvent = function() {
	enyo.stopEvent(this);
};

//* @public
//* Stop an event from propagating
enyo.stopEvent = function(inEvent) {
	if (inEvent.stopPropagation) {
		inEvent.stopPropagation();
		inEvent.preventDefault();
	} else {
		inEvent.keyCode = 0;
		inEvent.cancelBubble = true;
		inEvent.returnValue = false;
	}
};

//* @protected
enyo.makeElement = function(inTag, inAttrs) {
	var n = document.createElement(inTag);
	for (var i in inAttrs) {
		n[i] = inAttrs[i];
	}
	return n;
};

enyo.loadSheet = function(inUrl) {
	document.head.appendChild(enyo.makeElement("link", {rel: "stylesheet", type: "text/css", href: inUrl}));
};

enyo.loadScript = function(inUrl) {
	document.head.appendChild(enyo.makeElement("script", {type: "text/javascript", src: inUrl}));
};

//* @public
/**
	Gets a named value from the document cookie.
*/
enyo.getCookie = function(inName) {
	var matches = document.cookie.match(new RegExp("(?:^|; )" + inName + "=([^;]*)"));
	return matches ? decodeURIComponent(matches[1]) : undefined;
};

/**
	Sets a named value into the document cookie, with properties.

	Properties in the optional inProps argument are attached to the cookie.
	inProps may have an expires property, which can be a number of days, a Date object,
	or a UTC time string.
	
	To remove a cookie, use a inProps value of <code>{ "Max-Age": 0 }</code>.
	
	If developing in the Google Chrome browser with a local file as your application,
	start chrome with the <code>--enable-file-cookies</code> switch to allow cookies to be set.
*/
enyo.setCookie = function(inName, inValue, inProps) {
	var cookie = inName + "=" + encodeURIComponent(inValue);
	var p = inProps || {};
	//
	// FIXME: expires=0 seems to disappear right away, not on close? (FF3)  Change docs?
	var exp = p.expires;
	if (typeof exp == "number") {
		var d = new Date();
		d.setTime(d.getTime() + exp*24*60*60*1000);
		exp = d;
	}
	if (exp && exp.toUTCString) {
		p.expires = exp.toUTCString();
	}
	//
	var name, value;
	for (name in p){
		cookie += "; " + name;
		value = p[name];
		if (value !== true) {
			cookie += "=" + value;
		}
	}
	//
	//console.log(cookie);
	document.cookie = cookie;
};

//* @public
enyo.dom = {
	//* Get the computed style of a DOM node
	getComputedStyle: function(inNode) {
		return window.getComputedStyle(inNode, null);
	},
	//* Get the computed value of a property of a DOM node
	getComputedStyleValue: function(inNode, inProperty, inComputedStyle) {
		var s = inComputedStyle || this.getComputedStyle(inNode);
		return s.getPropertyValue(inProperty);
	},
	//* Get the calculated border of a node
	calcBorderExtents: function(inNode) {
		var s = this.getComputedStyle(inNode, null);
		return s && {
			t: parseInt(s.getPropertyValue("border-top-width")),
			r: parseInt(s.getPropertyValue("border-right-width")),
			b: parseInt(s.getPropertyValue("border-bottom-width")),
			l: parseInt(s.getPropertyValue("border-left-width"))
		};
	},
	//* Get the calculated margin of a node
	calcMarginExtents: function(inNode) {
		var s = this.getComputedStyle(inNode, null);
		return s && {
			t: parseInt(s.getPropertyValue("margin-top")),
			r: parseInt(s.getPropertyValue("margin-right")),
			b: parseInt(s.getPropertyValue("margin-bottom")),
			l: parseInt(s.getPropertyValue("margin-left"))
		};
	},
	/*
	Calculate the offset of inNode relative to viewport or the optional inParentNode.
	This offset includes any all webkit-transform and scroll positioning.
	*/
	calcNodeOffset: function(inNode, inParentNode) {
		var b = inNode && inNode.getBoundingClientRect();
		// bounding rect is readonly
		b = b ? {top: b.top, right: b.right, bottom: b.bottom, left: b.left} : {};
		if (inParentNode) {
			var p = inParentNode && inParentNode.getBoundingClientRect();
			if (p) {
				b.left -= p.left;
				b.right -= p.left;
				b.top -= p.top;
				b.bottom -= p.top;
			}
		}
		return b;
	},
	/*
	Calculate the offset of inNode relative to viewport or the optional inParentNode.
	This offset does *not* include any webkit-transform or scroll positioning.
	*/
	/*
	calcNodeOffsetSimple: function(inNode, inParentNode) {
		var n = inNode, op, b, pb;
		var o = {top: 0, left: 0};
		var p = inParentNode;
		var pop = p && p.offsetParent;
		do {
			// get position within offsetParent
			o.top += n.offsetTop || 0;
			o.left += n.offsetLeft || 0;
			op = n.offsetParent;
			// add border of offsetParent
			if (op) {
				b = enyo.dom.calcBorderExtents(op);
				o.top += b.t;
				o.left += b.l;
			}
			// walk up offset parents
			n = op;
			// if we share an offset parent with inParentNode, subtract
			// its position within our common offset parent
			if (n && p && (op == pop)) {
				pb = enyo.dom.calcBorderExtents(pop);
				o.top -= (p.offsetTop + pb.t) || 0;
				o.left -= (p.offsetLeft + pb.l) || 0;
			}
		// stop if we are the same node as inParentNode or its offsetParent.
		} while (n && n != pop && n != p);
		return o;
	},
	*/
	//* @protected
	findTarget: function(inControl, inX, inY) {
		console.log("===== findTarget ====");
		var cc = inControl;
		while (cc.parent) {
			cc = cc.parent;
		}
		return this._findTarget(cc.hasNode(), inX, inY);
	},
	_findTarget: function(inNode, inX, inY) {
		var n = inNode;
		if (n.style) {
			var o = this.calcNodeOffset(n);
			var x = inX - o.left;
			var y = inY - o.top;
			if (x>0 && y>0 && x<=n.offsetWidth && y<=n.offsetHeight) {
				console.log("IN: " + n.id + " -> [" + x + "," + y + " in " + n.offsetWidth + "x" + n.offsetHeight + "] (children: " + n.childNodes.length + ")");
				for (var i=0, n$=n.childNodes, c; c=n$[i]; i++) {
					var target = this._findTarget(c, inX, inY);
					if (target) {
						return target;
					}
				} 
				console.log("returning target " + n.id);
				return n;
			} else {
				console.log("(not in " + n.id + ") -> [" + x + "," + y + " in " + n.offsetWidth + "x" + n.offsetHeight + "]");
				console.log(inX, inY, o.left, o.top);
			}
		} else {
			console.log("not HTML node");
		}
	},
	/** @public
		Copies a string to the system clipboard
	*/
	setClipboard: function(inText) {
		if (!this._clipboardTextArea) {
			this._clipboardTextArea = enyo.makeElement("textarea");
		}
		this._clipboardTextArea.value = inText;
		document.body.appendChild(this._clipboardTextArea);
		enyo.keyboard.suspend();
		this._clipboardTextArea.select();
		document.execCommand("cut");
		this._clipboardTextArea.blur();
		enyo.keyboard.resume();
		document.body.removeChild(this._clipboardTextArea);
	},
	/**
	@ protected
	Returns a string from the system clipboard
	*/
	getClipboard: function(inCallback) {
		if (!this._clipboardTextArea) {
			this._clipboardTextArea = enyo.makeElement("textarea");
			this._clipboardTextArea.oninput = function(){
				if(this._clipboardTextArea.value !== ""){
					inCallback(this._clipboardTextArea.value);
				}
				// 'Hide' the textarea until it is needed again.
				this._clipboardTextArea.value = "";
				this._clipboardTextArea.blur();
				document.body.removeChild(this._clipboardTextArea);
			}.bind(this);
		}
		document.body.appendChild(this._clipboardTextArea);
		this._clipboardTextArea.value = "";
		enyo.keyboard.suspend();	
		this._clipboardTextArea.select();
		if (window.PalmSystem) {
			PalmSystem.paste();
		} else {
			document.execCommand("paste");
		}
	}
};
