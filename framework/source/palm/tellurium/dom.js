//* @protected
/*
 * DOM API
 */

/*
 * Get a property of the element matching the xpath.
 * @param {Object} xpath
 * @param {Object} property
*/
Tellurium.getDomProperty = function(xpath,property) {
  var item;
  var nodes = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null);
  while(item = nodes.iterateNext()) {
    return item[property];
  }
  return -1;
};


/*
 * Use the 'click' mouse event to tap the element matching the xpath. 
 * @param {Object} xpath
*/
Tellurium.clickDom = function(xpath) {
  var nodes = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null);
  var item = nodes.iterateNext();
  if(item==null)                                                                  
   {    console.log("Invalid xpath");                                                                          
        return false;                                                             
   } 
  var details = {                                                                              
       detail: 1,                                                                                   
       ctrlKey: false,                                                                              
       altKey: false,                                        
       shiftKey: false,                                                                             
       metaKey: false,                                                  
       button: 0                                                        
       };  
  var newEvent = document.createEvent("MouseEvents");
  //item = nodes.iterateNext();                                              
  var locator = item["id"];
  var metrics = Tellurium.getMetrics("#"+locator);
  newEvent.initMouseEvent("click", true, true, window, details.detail,                  
                          metrics.left, metrics.top, metrics.left, metrics.top,                 
                          details.ctrlKey, details.altKey, details.shiftKey, details.metaKey,
                          details.button, null);                                             
  item.dispatchEvent(newEvent);   
  return true;                                                                       
};

/* Create Offset 
 * @param {Object} x
 * @param {Object} y
*/
Tellurium.createOffset = function(x,y) {
  var offset=[x,y];
  offset.left=x;
  offset.top=y;
  return offset;
};

/*
 * Retrieve a property value for the first element found that matches the CSS selector.
 *
 * @param {Object} selector
 * @param {Object} propertyname
*/
Tellurium.queryElementValue = function(selector,propertyname) {
  var propertyvalue = eval("document.querySelector(selector)."+propertyname);
  return propertyvalue;
};

/*
 * Retrieve the innerHTML for the first element found that matches the CSS selector.
 *
 * @param {Object} selector
*/
Tellurium.queryElement = function(selector) {
  var element = document.querySelector(selector);
  return element.innerHTML;
};

/*
 * Set the innerHTML for the first element found that matches the CSS selector.
 *
 * @param {Object} selector
 * @param {Object} value
*/
Tellurium.setValue = function(selector,value) {
   var element = document.querySelector(selector);
   element.innerHTML = value;
   return true;
};

/*
 * Set a property value for the first element found that matches the CSS selector.
 *
 * @param {Object} selector
 * @param {Object} propertyname
 * @param {Object} value
 */
Tellurium.setElementValue = function(selector,propertyname,value) {
  eval("document.querySelector(selector)."+propertyname+"='"+value+"'");
  return true;
};

Tellurium.getDimensions = function(inElement) {
	if (inElement.style.display != 'none') {
		return {
			width: inElement.offsetWidth,
			height: inElement.offsetHeight
		};
	}

	var els = inElement.style;
	var orig = {
		visibility: els.visibility,
		position: els.position,
		display: els.display
	};

	els.visibility = "hidden";
	els.position = "absolute";
	els.display = "block";

	var dims = {
		width: inElement.clientWidth,
		height: inElement.clientHeight
	};

	Tellurium.enyo.mixin(els, orig);

	return dims;
};

/*
 * Return the x,y screen coordinate of an element.
 * @param {Object} locatorOrElement
 */
Tellurium.viewportOffset = function(locatorOrElement) {
	var targetEl = Tellurium.getElement(locatorOrElement);
	if (!targetEl) throw { message: Tellurium.invalidLocatorMessage("viewportOffset", locatorOrElement) };
	var currentEl = targetEl;
	var top = 0, left = 0;
	var fixedParent;
	var ownerDocument = targetEl.ownerDocument;
	// pass1 - add up offsetTop & offsetLeft of positioned ancestors to the root of the DOM
	while (currentEl) {
		top += currentEl.offsetTop;
		left += currentEl.offsetLeft;
		// include border widths, but not on the targetEl itself
		if (currentEl !== targetEl) {
			top += currentEl.clientTop;
			left += currentEl.clientLeft;
		}
		// done if element is fixed position, which is always relative to the viewport
		if (currentEl.style.position && currentEl.style.position === 'fixed') {
			fixedParent = currentEl;
			break;
		}
		currentEl = currentEl.offsetParent;
	}
	// pass2 - adjust for enyo scroller containers
	var scrollTop, scrollLeft;
	currentEl = targetEl;
	while (currentEl && currentEl !== ownerDocument) {
		try {
			scrollTop = eval("Tellurium.enyo.windows.getActiveWindow().enyo.$."+currentEl.id+".getScrollTop()");
			scrollLeft = eval("Tellurium.enyo.windows.getActiveWindow().enyo.$."+currentEl.id+".getScrollLeft()");
			top -= scrollTop;
			left -= scrollLeft;
		}
		catch (bypassException) { }
		if (currentEl === fixedParent) break;
		currentEl = currentEl.parentNode;
	}
	return Tellurium.createOffset(left, top);
};

/*
 * Runs a custom javascript.
 * 
 * @param {Object} script
 */
Tellurium.runScript = function(script) {
	var result = eval(script);
	if (result===undefined) return "[No Result]";
	if (result===null) return "[Null Result]";
	return result;
};

/*
 * Sets the focus on an element.
 * 
 * @param {Object} locatorOrElement
 */
Tellurium.focus = function(locatorOrElement) {
	var element = Tellurium.getElement(locatorOrElement);
	if (!element) throw { message: Tellurium.invalidLocatorMessage("focus", locatorOrElement) };
	element.focus();
};

/*
 * Removes the focus on an element.
 * 
 * @param {Object} locatorOrElement
 */
Tellurium.blur = function(locatorOrElement) {
	var element = Tellurium.getElement(locatorOrElement);
	if (!element) throw { message: Tellurium.invalidLocatorMessage("blur", locatorOrElement) };
	element.blur();
};

/*
 * Get the value of an element property.
 * 
 * @param {Object} locatorOrElement
 * @param {Object} property
 */
Tellurium.getProperty = function(locatorOrElement, property) {
	var element = Tellurium.getElement(locatorOrElement);
	if (!element) throw { message: Tellurium.invalidLocatorMessage("getProperty", locatorOrElement) };
	return element[property];
};

/*
 * Set the value of an element property.
 * 
 * @param {Object} locatorOrElement
 * @param {Object} property
 * @param {Object} value
 */
Tellurium.setProperty = function(locatorOrElement, property, value) {
	var element = Tellurium.getElement(locatorOrElement);
	if (!element) throw { message: Tellurium.invalidLocatorMessage("setProperty", locatorOrElement) };
	element[property] = value;
};

/*
 * Get the value of a child property for an element's style.
 *  
 * @param {Object} locatorOrElement
 * @param {Object} property
 */
Tellurium.getStyleProperty = function(locatorOrElement, property) {
	var element = Tellurium.getElement(locatorOrElement);
	if (!element) throw { message: Tellurium.invalidLocatorMessage("getStyleProperty", locatorOrElement) };
	var style = window.getComputedStyle(element, null);	
	return style[property];
};

/*
 * Set the value of a child property for an element's style.
 *  
 * @param {Object} locatorOrElement
 * @param {Object} property
 * @param {Object} value
 */
Tellurium.setStyleProperty = function(locatorOrElement, property, value) {
	var element = Tellurium.getElement(locatorOrElement);
	if (!element) throw { message: Tellurium.invalidLocatorMessage("setStyleProperty", locatorOrElement) };
	element.style[property] = value;
};

/*
 * Return true if an element is present.
 * 
 * @param {Object} locatorOrElement
 */
Tellurium.isElementPresent = function(locatorOrElement) {
	var element = Tellurium.getElement(locatorOrElement);
	return (element) ? true : false;
};

/*
 * Return true if the element is present and the element and all its ancestors are not hidden.
 * 
 * @param {Object} locatorOrElement
 */
Tellurium.isElementVisible = function(locatorOrElement) {
	var element = Tellurium.getElement(locatorOrElement);
	if (!element) return false;
	if (element.style.display === 'none') return false;
	var ancestorsXPath = Tellurium.getElementXPath(element, false) + "/ancestor::*";
	var ancestorNodes = document.evaluate(ancestorsXPath, document, null, XPathResult.ANY_TYPE, null);
	while(element = ancestorNodes.iterateNext()) {
		if (element.style.display === 'none') return false;
	}
	return true;
};

/*
 * Try to make the element visible on the screen.
 * Element must be inside an enyo scroller.
 * @param {Object} locatorOrElement
 */
Tellurium.revealElement = function(locatorOrElement) {
	var locatorElement = Tellurium.getElement(locatorOrElement);
	if (!locatorElement) return false;
	var scrollerElement = Tellurium.findScrollerAncestor(locatorElement);
	if (!scrollerElement) return false;
	try { Tellurium.scrollToElement(scrollerElement,locatorElement); }
	catch (scrollerException) { return false; }
	return true;
};

/*
 * Get the enyo scroller ancestor for locatorOrElement
 * @param {Object} locatorOrElement
 */
Tellurium.findScrollerAncestor = function(locatorOrElement) {
	var locatorElement = Tellurium.getElement(locatorOrElement);
	if (!locatorElement) return null;
	if (locatorElement.style.display === 'none') return null;
	if (locatorElement.offsetTop == undefined || locatorElement.offsetTop == null) return null;
	// look for an ancestor scroller container
	var foundScroller = false;
	var ancestorElement = null;
	var ancestorsXPath = Tellurium.getElementXPath(locatorElement, false) + "/ancestor::*";
	var ancestorNodes = document.evaluate(ancestorsXPath, document, null, XPathResult.ANY_TYPE, null);
	while (ancestorElement = ancestorNodes.iterateNext()) {
		if (ancestorElement.style.display === 'none') return null;
		try {
			Tellurium.getEnyoScroller(ancestorElement, "findScrollerAncestor");
		}
		catch (notFound) {
			continue;
		}
		foundScroller = true;
		break;
	}
	if (!foundScroller) return null;
	return ancestorElement;
};

/*
 * Get the width of an element.
 * @param {Object} locatorOrElement
 */
Tellurium.getWidth = function(locatorOrElement) {
	var element = Tellurium.getElement(locatorOrElement);
	if (!element) throw { message: Tellurium.invalidLocatorMessage("getWidth", locatorOrElement) };
	return Tellurium.getDimensions(element).width;
};

/*
 * Get the height of an element.
 * @param {Object} locatorOrElement
 */
Tellurium.getHeight = function(locatorOrElement) {
	var element = Tellurium.getElement(locatorOrElement);
	if (!element) throw { message: Tellurium.invalidLocatorMessage("getHeight", locatorOrElement) };
	return Tellurium.getDimensions(element).height;
};

/*
 * Get the top position of an element relative to its parent container.
 * @param {Object} locatorOrElement
 */
Tellurium.getViewportOffsetTop = function(locatorOrElement) {
	var element = Tellurium.getElement(locatorOrElement);
	if (!element) throw { message: Tellurium.invalidLocatorMessage("getViewportOffsetTop", locatorOrElement) };
	return Tellurium.viewportOffset(element).top;
};

/*
 * Get the left position of an element relative to its parent container.
 * @param {Object} locatorOrElement
 */
Tellurium.getViewportOffsetLeft = function(locatorOrElement) {
	var element = Tellurium.getElement(locatorOrElement);
	if (!element) throw { message: Tellurium.invalidLocatorMessage("getViewportOffsetLeft", locatorOrElement) };
	return Tellurium.viewportOffset(element).left;
};

/*
 * Get an element's position and dimensions relative to the display.
 * @param {Object} locatorOrElement
 */
Tellurium.getMetrics = function(locatorOrElement) {
	var element = Tellurium.getElement(locatorOrElement);
	if (!element) throw { message: Tellurium.invalidLocatorMessage("getMetrics", locatorOrElement) };
	var offset = Tellurium.viewportOffset(element);
	var dimensions = Tellurium.getDimensions(element);
	var metrics = {
		width: dimensions.width,
		height: dimensions.height,
		left: offset.left,
		top: offset.top
	};	
	return metrics;
};

/*
 * Search for a word in a string (words are separated by spaces; search is case sensitive).
 * @param {Object} inputString
 * @param {Object} targetWord
 */
Tellurium.isWordInString = function(inputString, targetWord) {
	var words = inputString.split(" ");
	for (var i = 0; i < words.length; i++) {
		if (words[i] === targetWord) return true;
	}
	return false;
};

/*
 * Return a formatted message for invalid locator
 * @param {Object} locatorOrElement
 */
Tellurium.invalidLocatorMessage = function(methodName,locatorOrElement) {
	return methodName + "() in TelluriumNub - invalid locator or element " + Tellurium.getLocatorInfo(locatorOrElement);
};
