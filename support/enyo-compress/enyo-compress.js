/*
* Compress Enyo applications
*/

// Node v2 fails to be useful
if (parseFloat(process.versions ? process.versions.node : 0) < 0.4) {
	console.log("Node version: " + process.version);
	console.log.error("Needs Node v0.4+");
	process.exit(-1);
}

var path = require("path"),
nopt = require("nopt"),
compresslib = require("./lib/enyo-compress-lib.js");

function processArgs() {
	var opts = {
		inplace: Boolean,
		delete: Boolean,
		help: Boolean,
		verbose: Boolean,
		stats: Boolean,
		"overwrite-depends": Boolean,
		"make-enyo": Boolean,
		output: path,
		use: path,
		debug: Boolean,
		colors: Boolean
	},
	shortHands = {
		i: ["--inplace"],
		o: ["--output"],
		v: ["--verbose"],
		s: ["--stats"],
		h: ["--help"],
		d: ["--delete"],
		u: ["--use"],
		"?": ["--help"]
	};
	var options = nopt(opts, shortHands);
	if (typeof options.colors == "undefined") {
		options.colors = true;
	}
	if (typeof options.delete == "undefined") {
		options.delete = !options.inplace;
	}
	if (options.help) {
		printUsage();
		process.exit(0);
	}
	if (options["make-enyo"]) {
		options.keyfile = "platform/startup.js";
		options.css = "enyo-build.css";
		options.js = "enyo-build.js";
	} else {
		options.js = "build.js";
		options.css = "build.css";
	}
	if (!options.output) {
		options.output = "build";
	}
	if (!options.inplace) {
		options["overwrite-depends"] = true;
	}
	if (!options.use) {
		if (options["make-enyo"]) {
			options.use = "enyo-depends.js";
		} else {
			options.use = "depends.js"
		}
	}
	options.mode = "console";
	return options;
}

function printUsage() {
	console.log([
		"Enyo Compress",
		"",
		"Usage:",
		"node enyo-compress.js [ flag ]* sourceDir",
		"",
		"Flags:",
		"-h | --help | -?: Print this message and exit",
		"-v | --verbose: Print more information, such as dependency loading steps and compression steps",
		"-o | --output {NAME}: Name of output directory, defaults to 'build'",
		"-s | --stats: Print compression statistics",
		"-i | --inplace: Put output files into sourceDir, assumes --no-delete by default",
		"-u | --use {PATH}: Use supplied depends file instead of one found in sourceDir",
		"--no-delete: Do not delete source files after compression",
		"--overwrite-depends: Force an overwriting of depends.js",
		"--make-enyo: Build the Enyo framework, slightly different format from apps.",
		"--no-colors: Turn off color output - good for logging"
	].join("\n"));
}

function isError(inError) {
	return Object.prototype.toString(inError) == "[object Error]";
}

// read command line arguments
var options = processArgs();
var start = options.argv.remain[0];
delete options.argv;
compresslib.setOptions(options);
compresslib.process(start, function(err){
	if (isError(err)) {
		console.log(err);
	}
});
