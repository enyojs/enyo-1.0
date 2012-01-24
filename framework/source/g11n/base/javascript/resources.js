/*$
 * @name resources.js
 * @fileOverview This file has conventions related to resources.
 * 
 * 
 */

/*globals G11n console document enyo $L*/

//* @public
/**
Global translation function, for convenience. This is only useful to apps
that want to translate strings to the current UI language. If you want to
translate to a different language, or if you want to translate strings for
a library or package, you need to create a Resources object instead, and
call its $L method.

If the string does not have a translation in the current language, the 
argument is returned as-is.
*/
$L = function(inText) {
	if (!$L._resources) {
		$L._resources = new enyo.g11n.Resources();
	}
	return $L._resources.$L(inText);
};

//* @protected
$L._resources = null;

//* @public
/**
Creates a new bundle of resource strings. The params object may contain the following:

* *root* - the path to the root of the current component. For libraries and packages, this
should be the absolute path to the directory containing the resources directory that contains
the translations for the component.
* *locale* - a Locale instance, or a locale spec string, specifying the locale of the resources
to load. If this parameter is left out, the resources for the current UI locale are loaded.

*/
enyo.g11n.Resources = function(params){
	if (params && params.root) {
		this.root = typeof(window) !== 'undefined' ? enyo.makeAbsoluteUrl(window,enyo.path.rewrite(params.root)) : params.root;
	}
	this.root = this.root || enyo.g11n.Utils._getRoot();
	this.resourcePath = this.root + "/resources/";
	
	// console.log("resources: root is " + this.resourcePath);
	if (params && params.locale) {
		this.locale = (typeof(params.locale) === 'string') ? new enyo.g11n.Locale(params.locale) : params.locale;
	} else {
		this.locale = enyo.g11n.currentLocale();
	}

	// en_pl is used for debugging g11n issues 
	this.$L = (this.locale.toString() === 'en_pl') ? this._pseudo : this._$L;
	
	this.localizedResourcePath = this.resourcePath + this.locale.locale + '/';
	this.languageResourcePath = this.resourcePath + (this.locale.language ? this.locale.language + '/' : "");
	this.regionResourcePath = this.languageResourcePath + (this.locale.region ? this.locale.region + '/' : "");
	this.carrierResourcePath = this.regionResourcePath + (this.locale.variant ? this.locale.variant  + '/' : "");
};

/**
Get a localized file

* path (String): the path relative to a locale directory to the file to load

This will search the resources directory looking for the localized version of the file.
The sequence of places that it looks for the file is as follows:

1. The variant directory, if there is one. (eg. resources/fr/fr/sfr/path)
1. The region directory, if there is one (eg. resources/fr/fr/path)
1. The language directory if there is one (eg. resources/fr/path)
1. The English directory (eg. resources/en/path)
1. The unlocalized files under the root. (eg. path)

If the file cannot be found, this function returns undefined.
*/
enyo.g11n.Resources.prototype.getResource = function (path) {
	var file;
	
	// console.log("getLocalizedResource: path is " + path);
	
	if ( this.carrierResourcePath ) {
		try {
			file = enyo.g11n.Utils.getNonLocaleFile({path: this.carrierResourcePath + path});
		} catch (e) {
			file = undefined;
		}
	}
	if ( !file ) {
		try {
			file = enyo.g11n.Utils.getNonLocaleFile({path: this.regionResourcePath + path});
		} catch (f) {
			file = undefined;
		}
	}
	if ( !file ) {
		try {
			file = enyo.g11n.Utils.getNonLocaleFile({path: this.languageResourcePath + path});
		} catch (g) {
			file = undefined;
		}
	}
	if ( !file ) {
		try {
			// try defaulting to en_us
			file = enyo.g11n.Utils.getNonLocaleFile({
				path: this.resourcePath + "en/" + path
			});
		} catch (h) {
			file = undefined;
		}
	}	
	if ( !file ) {
		try {
			// still not there? try the unlocalized version
			file = enyo.g11n.Utils.getNonLocaleFile({
				path: this.root + "/" + path
			});
		} catch (i) {
			// if it is still not there after all this, give up and return undefined
			file = undefined;
		}
	}
	
	return file;
};

/**
Retrieve a translated string. If the string to localize is not found in the resources,
the original argument is returned unmodified. This means that is always safe to call
$L because this method will always return something useful.
*/
enyo.g11n.Resources.prototype.$L = function(stringToLocalize){} // dummy for the documentation

//* @protected
// real implementation -- set $L to point to this one in the constructor
enyo.g11n.Resources.prototype._$L = function(stringToLocalize){
	var key, value;
	
	if (!stringToLocalize) {
		return "";
	}
	
	if (this.locale.equals(enyo.g11n.sourceLocale())) {
		// if we are in the locale that the app was using, we don't even need to 
		// map the string. Just return it as-is.
		if (typeof stringToLocalize === 'string') {
			return stringToLocalize;
		}else{
			return stringToLocalize.value;
		}
	}
	
	if (!this.strings) {
		this._loadStrings();
	}
	if (typeof stringToLocalize === 'string') {
		key = stringToLocalize;
		value = stringToLocalize;
	} else {
		key = stringToLocalize.key;
		value = stringToLocalize.value;
	}

	if (this.strings && typeof(this.strings[key]) !== 'undefined') {
		return this.strings[key];
	}
	return value;
};

// pseudotranslate on the fly. Set $L to point to this one in the constructor, but only for locale en_pl
enyo.g11n.Resources.prototype._pseudo = function(stringToLocalize){
	var i, value;
	
	if (!stringToLocalize) {
		return "";
	}
	
	// psuedo translation for debugging g11n issues
	value = "";
	for (i = 0; i < stringToLocalize.length; i++) {
		if (stringToLocalize.charAt(i) === '#' && i+1 < stringToLocalize.length && stringToLocalize.charAt(i+1) === '{') {
			while (stringToLocalize.charAt(i) !== '}' && i < stringToLocalize.length) {
				value += stringToLocalize.charAt(i++);
			}
			if (i < stringToLocalize.length) {
				value += stringToLocalize.charAt(i);
			}
		} else if (stringToLocalize.charAt(i) === '<') {
			while (stringToLocalize.charAt(i) !== '>' && i < stringToLocalize.length) {
				value += stringToLocalize.charAt(i++);
			}
			if (i < stringToLocalize.length) {
				value += stringToLocalize.charAt(i);
			}
		} else if (stringToLocalize.charAt(i) === '&' && i+1 < stringToLocalize.length && !enyo.g11n.Char.isSpace(stringToLocalize.charAt(i+1))) {			
			while (stringToLocalize.charAt(i) !== ';' && !enyo.g11n.Char.isSpace(stringToLocalize.charAt(i)) && i < stringToLocalize.length) {
				value += stringToLocalize.charAt(i++);
			}
			if (i < stringToLocalize.length) {
				value += stringToLocalize.charAt(i);
			}
		} else {
			value += enyo.g11n.Resources._pseudoMap[stringToLocalize.charAt(i)] || stringToLocalize.charAt(i);
		}
	}
	return value;
};

//* @protected
enyo.g11n.Resources.prototype._loadStrings = function () {

	this.strings = enyo.g11n.Utils.getJsonFile({
	    root: this.root,
		path: "resources",
		locale: this.locale,
		merge: true
	});
		
	enyo.g11n.Utils.releaseAllJsonFiles();
};

// for debugging g11n issues
enyo.g11n.Resources._pseudoMap = {
	"a":"á",
	"e":"è",
	"i":"ï",
	"o":"õ",
	"u":"û",
	"c":"ç",
	"A":"Å",
	"E":"Ë",
	"I":"Î",
	"O":"Õ",
	"U":"Û",
	"C":"Ç",
	"B":"ß",
	"y":"ÿ",
	"Y":"Ý",
	"D":"Ď",
	"d":"đ",
	"g":"ĝ",
	"G":"Ĝ",
	"H":"Ĥ",
	"h":"ĥ",
	"J":"Ĵ",
	"j":"ĵ",
	"K":"Ķ",
	"k":"ķ",
	"N":"Ñ",
	"n":"ñ",
	"S":"Ş",
	"s":"ş",
	"T":"Ť",
	"t":"ť",
	"W":"Ŵ",
	"w":"ŵ",
	"Z":"Ź",
	"z":"ź"
};
