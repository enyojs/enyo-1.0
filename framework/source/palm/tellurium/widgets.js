//* @protected
/*
 * WIDGET SECTION
 */

// MENU WIDGET

/*
 * Show/hide a menu.
 * @param {Object} menu
*/
Tellurium.toggleMenu = function(menu) {
  return eval("Tellurium.enyo.windows.getActiveWindow().enyo.$."+menu+".toggleOpen()");
};

/*
*  Show a menu.
*  @param {Object} menu
*/
Tellurium.menuShow = function(menu) {
	return eval("Tellurium.enyo.windows.getActiveWindow().enyo.$."+menu+".show()");
};

/*
*  Hide a menu.
*  @param {Object} menu
*/
Tellurium.menuHide = function(menu) {
	return eval("Tellurium.enyo.windows.getActiveWindow().enyo.$."+menu+".hide()");
};

/*
 * Checks if a menu is visible
 * @param {Object} menu
 */
Tellurium.isMenuVisible = function(menu) {
	throw { message: "isMenuVisible in TelluriumNub is an invalid method for enyo apps." };
};

/*
 * Turn on/off a menu.
 * @param {Object} menu
 */
Tellurium.toggleMenuVisible = function(menu) {
	throw { message: "toggleMenuVisible in TelluriumNub is an invalid method for enyo apps." };
};

/*
 * Returns a list/array of commands available for the given menu.
 * Works in the current scene context. 
 * @param {Object} menu
 */
Tellurium.getMenuCommands = function(menu) {
	throw { message: "getMenuCommands in TelluriumNub is an invalid method for enyo apps." };
};

/*
 * Send a menu command event to the current stage.
 * The command is a string, usually one of the list
 * returned by getMenuCommand
 * 
 * @param {Object} command
 */
Tellurium.sendMenuCommand = function(command) {
	throw { message: "sendMenuCommand in TelluriumNub is an invalid method for enyo apps." };
};


// LIST WIDGET

/*
 * gets index of the element from the list
 * @param {Object} selector
 * @param {Object} value
*/
Tellurium.getIndexFromList = function(selector,value) {
	throw { message: "getIndexFromList in TelluriumNub is an invalid method for enyo apps." };
};

/*
 * Returns an array of elements from the list.
 * 
 * @param {Object} locator
 * @param {Object} start
 * @param {Object} length
 */
Tellurium.getListItems = function(locator, start, length) {
	throw { message: "getListItems in TelluriumNub is an invalid method for enyo apps." };
};

/*
 * Returns the length of the list
 * @param {Object} locator
 */
Tellurium.getListLength = function(locator) {
	throw { message: "getListLength in TelluriumNub is an invalid method for enyo apps." };
};

/*
 * Count the number of nodes using the xpath expression.
 * @param {Object} xpath
 */
Tellurium.getNodeCount = function(xpath) {
	var item;
	var count = 0;
	var nodes = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null);
	while(item = nodes.iterateNext()) {
 		count++;
	}
	return count;
};

/*
 * Moves the list so that the item at the given index is visible.
 * 
 * @param {Object} locator
 */
Tellurium.revealListItem = function(locator) {
	throw { message: "revealListItem in TelluriumNub is an invalid method for enyo apps." };
};

/*
 * Moves the list so that the item at the given index is visible.
 * 
 * @param {Object} locator
 */
Tellurium.getListItemJsonObject = function(locator) {
	throw { message: "getListItemJsonObject in TelluriumNub is an invalid method for enyo apps." };
};

/*
 * Returns the metrics for a list item.
 * @param {Object} locator
 * @param {Object} index
 */
Tellurium.getListItemMetrics = function(locator, index) {
	throw { message: "getListItemMetrics in TelluriumNub is an invalid method for enyo apps." };
};

// TEXTFIELD WIDGET

Tellurium.textFieldGetValue = function(locator) {
	throw { message: "textFieldGetValue in TelluriumNub is an invalid method for enyo apps." };
};

Tellurium.textFieldSetValue = function(locator, value) {
	throw { message: "textFieldSetValue in TelluriumNub is an invalid method for enyo apps." };
};

Tellurium.textFieldGetCursorPosition = function(locator) {
	throw { message: "textFieldGetCursorPosition in TelluriumNub is an invalid method for enyo apps." };
};

Tellurium.textFieldSetCursorPosition = function(locator, start, end) {
	throw { message: "textFieldSetCursorPosition in TelluriumNub is an invalid method for enyo apps." };
};

//SCROLLER WIDGET

/*
 * Returns true/false if scrolling is active/finished.
 * Throws an exception if locatorOrElement does not exist or if its associated enyo control does not have an "isScrolling" method.
 * @param {Object} locatorOrElement
 */
Tellurium.isScrolling = function(locatorOrElement) {
	var enyoScroller = Tellurium.getEnyoScroller(locatorOrElement, "isScrolling");
	if (enyoScroller.isScrolling)
		return enyoScroller.isScrolling() ? true : false;
	if (enyoScroller.$.scroll.isScrolling)
		return enyoScroller.$.scroll.isScrolling() ? true : false;
	throw { message: "isScrolling() in TelluriumNub - locatorOrElement does not appear to be an enyo scroller " + Tellurium.getLocatorInfo(locatorOrElement) };
};

/*
 * Get the current scroll position (left,top) position of a scroller element.
 * Throws an exception if locatorOrElement is invalid, or if unable to find methods getScrollLeft & getScrollTop
 * @param {Object} locatorOrElement
 */
Tellurium.getScrollerPositionMetrics = function(locatorOrElement) {
	var enyoScroller = Tellurium.getEnyoScroller(locatorOrElement, "getScrollerPositionMetrics");
	if (enyoScroller.getScrollLeft && enyoScroller.getScrollTop) {
		var metrics = {
				left: enyoScroller.getScrollLeft(),
				top: enyoScroller.getScrollTop()
		};
		return metrics;
	}
	if (enyoScroller.$.scroll.getScrollLeft && enyoScroller.$.scroll.getScrollTop) {
		var metrics = {
				left: enyoScroller.$.scroll.getScrollLeft(),
				top: enyoScroller.$.scroll.getScrollTop()
		};
		return metrics;
	}
	throw { message : "getScrollerPositionMetrics() in TelluriumNub - no getScrollLeft/getScrollTop methods for this scroller type " + Tellurium.getLocatorInfo(locatorOrElement) };
};

/*
 * Get {left,top} coordinates of locatorOrElement relative to the scrollerLocatorOrElement ancestor
 * 
 * @param {Object} scrollerLocatorOrElement
 * @param {Object} locatorOrElement
 */
Tellurium.scrollerOffset = function(scrollerLocatorOrElement, locatorOrElement) {
	var domElement = Tellurium.getElement(locatorOrElement);
	if (!domElement) throw { message: Tellurium.invalidLocatorMessage("scrollerOffset", locatorOrElement) };
	var enyoScroller = Tellurium.getEnyoScroller(scrollerLocatorOrElement, "scrollerOffset").node;
	var currentElement = domElement;
	var top = 0, left = 0;
	// add up offsetTop & offsetLeft of ancestors within the enyo scroller
	while (currentElement && currentElement !== enyoScroller) {
		top += currentElement.offsetTop;
		left += currentElement.offsetLeft;
		// include border widths, but not on the domElement itself
		if (currentElement !== domElement) {
			top += currentElement.clientTop;
			left += currentElement.clientLeft;
		}
		currentElement = currentElement.offsetParent;
	}
	return Tellurium.createOffset(left, top);
};

/*
 * Scroll to the bottom of an enyo scroller.
 * 
 * @param {Object} locatorOrElement
 */
Tellurium.scrollToBottom = function(locatorOrElement) {
	var enyoScroller = Tellurium.getEnyoScroller(locatorOrElement, "scrollToBottom");
	if (enyoScroller.scrollToBottom)
		enyoScroller.scrollToBottom();
	else if (enyoScroller.$.scroll.scrollToBottom)
		enyoScroller.$.scroll.scrollToBottom();
	else
		throw { message : "scrollToBottom() in TelluriumNub - no scrollToBottom method for this scroller type " + Tellurium.getLocatorInfo(locatorOrElement) };
};

/*
 * Scroll to the top of an enyo scroller.
 * 
 * @param {Object} locatorOrElement
 */
Tellurium.scrollToTop = function(locatorOrElement) {
	var enyoScroller = Tellurium.getEnyoScroller(locatorOrElement, "scrollToTop");
	if (enyoScroller.scrollTo)
		enyoScroller.scrollTo(0,0);
	else if (enyoScroller.$.scroll.scrollTo)
		enyoScroller.$.scroll.scrollTo(0,0);
	else
		throw { message : "scrollToTop() in TelluriumNub - no scrollTo method for this scroller type " + Tellurium.getLocatorInfo(locatorOrElement) };
};

/*
 * Scroll an element into view that is inside an enyo scroller.
 * 
 * @param {Object} scrollerLocatorOrElement
 * @param {Object} locatorOrElement
 */
Tellurium.scrollToElement = function(scrollerLocatorOrElement, locatorOrElement) {
	var element = Tellurium.getElement(locatorOrElement);
	if (!element) throw { message: Tellurium.invalidLocatorMessage("scrollToElement", locatorOrElement) };
	var enyoScroller = Tellurium.getEnyoScroller(scrollerLocatorOrElement, "scrollToElement");
	if (enyoScroller.scrollTo)
		enyoScroller.scrollTo(Tellurium.scrollerOffset(enyoScroller.node,element).top,0);
	else if (enyoScroller.$.scroll.scrollTo)
		enyoScroller.$.scroll.scrollTo(Tellurium.scrollerOffset(enyoScroller.node,element).top,0);
	else
		throw { message : "scrollToElement() in TelluriumNub - no scrollTo method for this scroller type " + Tellurium.getLocatorInfo(locatorOrElement) };
};

/*
 * Scroll to an (x,y) location inside an enyo scroller.
 * 
 * @param {Object} locatorOrElement
 * @param {Object} x
 * @param {Object} y
 */
Tellurium.scrollToViewable = function(locatorOrElement, x, y) {
	var enyoScroller = Tellurium.getEnyoScroller(locatorOrElement, "scrollToViewable");
	if (enyoScroller.scrollTo)
		enyoScroller.scrollTo(y,x);
	else if (enyoScroller.$.scroll.scrollTo)
		enyoScroller.$.scroll.scrollTo(y,x);
	else
		throw { message : "scrollToViewable() in TelluriumNub - no scrollTo method for this scroller type " + Tellurium.getLocatorInfo(locatorOrElement) };
};

/*
 * Returns the enyo object for locatorOrElement if it contains the "isScrolling" method, which seems
 * to be a common method among the different types of scrollers.
 * 
 * @param {Object} locatorOrElement 
 * @param {Object} callerName - used to identify the caller in error message
 */
Tellurium.getEnyoScroller = function(locatorOrElement, callerName) {
	var msgPrefix = callerName + "() in TelluriumNub - ";
	var scrollerElement = Tellurium.getElement(locatorOrElement);
	if (!scrollerElement) throw { message: Tellurium.invalidLocatorMessage(callerName, locatorOrElement) };
	if (!scrollerElement.id) throw { message : msgPrefix + "locatorOrElement found, but it has no 'id' property " + Tellurium.getLocatorInfo(locatorOrElement) };
	if (!Tellurium.enyo.windows.getActiveWindow()) throw { message : msgPrefix + "this app stage is not the active window." };
	var enyoScroller = eval("Tellurium.enyo.windows.getActiveWindow().enyo.$." + scrollerElement.id);
	if (enyoScroller && (enyoScroller.isScrolling || enyoScroller.$.scroll.isScrolling))
		return enyoScroller;
	throw { message: msgPrefix + "locatorOrElement does not appear to be an enyo scroller " + Tellurium.getLocatorInfo(locatorOrElement) };
};
