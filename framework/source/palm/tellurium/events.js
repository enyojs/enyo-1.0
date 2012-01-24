//* @protected
/*
 * EVENT SECTION
 */

/*
 * Sends a mouseDown,Mouseup,and click event.
 * @param {Object} locatorOrElement
 */
Tellurium.mouseTap = function(locatorOrElement) {
	var element = Tellurium.getElement(locatorOrElement);
	if (!element) throw { message: Tellurium.invalidLocatorMessage("mouseTap", locatorOrElement) };
	var details = {
		detail: 1,
		ctrlKey: false,
		altKey: false,
		shiftKey: false,
		metaKey: false,
		button: 0
	};
	Tellurium.mouseEvent(element,"mousedown",details);
	Tellurium.mouseEvent(element,"mouseup",details);
	Tellurium.mouseEvent(element,"click",details);
};

/*
 * Sends a mouse event.
 * @param {Object} locatorOrElement
 * @param {Object} eventType
 * @param {Object} details
 */
Tellurium.mouseEvent = function(locatorOrElement, eventType, details) {
	var element = Tellurium.getElement(locatorOrElement);
	if (!element) throw { message: Tellurium.invalidLocatorMessage("mouseEvent", locatorOrElement) };
	var metrics = Tellurium.getMetrics(element);
	var newEvent = document.createEvent("MouseEvents");
	newEvent.initMouseEvent(eventType, true, true, window, details.detail,
		metrics.left, metrics.top, metrics.left, metrics.top,
		details.ctrlKey, details.altKey, details.shiftKey, details.metaKey,
		details.button, null);
	element.dispatchEvent(newEvent);
};

/*
 * Sends an event to an element with the given details.
 * If you are sending a key or mouse event, prefer using
 * the keyEvent() and mouseEvent() functions
 * 
 * @param {Object} locatorOrElement
 * @param {Object} eventType
 * @param {Object} details
 */
Tellurium.fireEvent = function(locatorOrElement, eventType, details) {
	var element = Tellurium.getElement(locatorOrElement);
	if (!element) throw { message: Tellurium.invalidLocatorMessage("fireEvent", locatorOrElement) };
	var newEvent = document.createEvent("HTMLEvents");
	newEvent.initEvent(eventType, true, true);
	element.dispatchEvent(newEvent);
};

/*
 * Sends a key event.
 * @param {Object} locatorOrElement
 * @param {Object} eventType 'keydown' or 'keyup'
 * @param {Object} keyCode
 * @param {Object} keyIdentifier See http://www.w3.org/TR/DOM-Level-3-Events/keyset.html
 * @param {Object} shiftKey
 * @param {Object} metaKey
 * @param {Object} altKey
 * @param {Object} ctrlKey
 */
Tellurium.keyEvent = function(locatorOrElement, eventType, keyCode, keyIdentifier, shiftKey, metaKey, altKey, ctrlKey) {
	var element = Tellurium.getElement(locatorOrElement);
	if (!element) throw { message: Tellurium.invalidLocatorMessage("keyEvent", locatorOrElement) };
	var newEvent = document.createEvent("HTMLEvents");
	newEvent.initEvent(eventType, true, true, window);
	// Extend stuff to make it look like a KeyEvent
	newEvent.keyCode = keyCode;
	newEvent.charCode = newEvent.keyCode;
	newEvent.which = newEvent.keyCode;
	newEvent.shiftKey = shiftKey || false;
	newEvent.metaKey = metaKey || false;
	newEvent.altKey = altKey || false;
	newEvent.ctrlKey = ctrlKey || false;
	newEvent.altGraphKey = false;
	newEvent.keyIdentifier = keyIdentifier;
	newEvent.keyLocation = 0;
	newEvent.detail = 0;
	newEvent.view = window;
	// Send newEvent
	element.dispatchEvent(newEvent);
};

/*
 * Sends a text event (append text!) to an element
 * @param {Object} locatorOrElement
 * @param {Object} text
 */
Tellurium.textEvent = function(locatorOrElement, text) {
	var element = Tellurium.getElement(locatorOrElement);
	if (!element) throw { message: Tellurium.invalidLocatorMessage("textEvent", locatorOrElement) };
	var newEvent = document.createEvent("TextEvent");
	newEvent.initTextEvent("textInput", true, true, null, text);
	element.dispatchEvent(newEvent);
};

/*
 * Send a simulated tap via PalmSystem
 * @param {Object} locatorOrElement
 */
Tellurium.simulatedTap = function(locatorOrElement) {
	if (typeof locatorOrElement == "string") {
		if (locatorOrElement === "window")
			return Tellurium.simulatedTapXY((Math.round(window.innerWidth / 2)), (Math.round(window.innerHeight / 2)));
	}
	var element = Tellurium.getElement(locatorOrElement);
	if (!element) throw { message: Tellurium.invalidLocatorMessage("simulatedTap", locatorOrElement) };
	var metrics = Tellurium.getMetrics(element);
	return Tellurium.simulatedTapXY(Math.round(metrics.left + metrics.width / 2), Math.round(metrics.top + metrics.height / 2));
};

/*
 * Simulate a tap event using a mouse up/down events
 * @param {Object} x
 * @param {Object} y
 */
Tellurium.simulatedTapXY = function(x, y) {
	window.PalmSystem.simulateMouseClick(x, y, true);
	window.PalmSystem.simulateMouseClick(x, y, false);
	return true;
};

/*
 * Send a DOM mojo-tap event
 * @param {Object} locator
 */
Tellurium.mojoTap = function(locator) {
	throw { message: "mojoTap in Tellurium.Nub is an invalid method for enyo apps." };
};
