// Colorized Output module
var colors = require("colors");

function write(){
	if (colors.mode == "console") {
		console.log.apply(console, arguments);
	} else {
		log.logBody.push([].slice.call(arguments).join(" "));
	}
}

var log = {
	logBody:[],

	log: function log() {
		write.apply(null, arguments);
	},

	inform: function inform(inText) {
		if (this.colors) {
			inText = inText.underline.cyan;
		}
		write(inText);
	},

	error: function error(inText) {
		if (this.colors) {
			inText = inText.bold.red;
		}
		write(inText);
	},

	success: function success(inText) {
		if (this.colors) {
			inText = inText.bold.green;
		}
		write(inText);
	},

	warn: function warn(inText) {
		if (this.colors) {
			inText = inText.bold.yellow;
		}
		write(inText);
	},

	itemize: function itemize(inTitle, inText) {
		if (this.colors) {
			inTitle = inTitle.bold;
		}
		write(inTitle, inText);
	},

	disEnableColors: function(inColors) {
		this.colors = Boolean(inColors);
	},

	setMode: function(inMode) {
		colors.mode = inMode;
	}
};

module.exports = log;
