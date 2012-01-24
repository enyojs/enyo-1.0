/*$
 * @name plan.js
 * @fileOverview This file has the implementation of the Numbering Plan object which gives information about a particular country's numbering plan
 * 
 * 
 *
 */

/*globals console G11n PhoneLoc Utils enyo */

//* @public
/**
Return info about the dialing/numbering plan of a particular locale.

It is up to the callers to release the json files from the cache.
*/
enyo.g11n.NumPlan = function(params) {
	
	this.locale = new enyo.g11n.PhoneLoc(params);
	
	var data = enyo.g11n.Utils.getNonLocaleFile({
		root: enyo.g11n.Utils._getEnyoRoot("../"),
		path: "phone/base/data/plans/" + this.locale.region + ".json",
		locale: this.locale
	});
	
	if (!data) {
		data = enyo.g11n.Utils.getNonLocaleFile({
			root: enyo.g11n.Utils._getEnyoRoot("../"),
			path: "phone/base/data/plans/unknown.json",
			locale: new enyo.g11n.Locale("unknown_unknown")
		});
	}
	
	if (data) {
		enyo.g11n.PhoneUtils.deepCopy(data, this);
	}
	
	return this;
};
