// builtin modules
var path = require("path"),
fs = require("fs"),
vm = require("vm");

// Uglify modules
var uglify = require("uglify-js"),
parser = uglify.parser,
gen = uglify.uglify;

// Poolr
var poolr = require("poolr").createPool;

// stepup
var stepup = require("stepup");

// Mkdirp
var mkdirp = require("mkdirp");

// rm -rf
var rimraf = require("rimraf");

// Enyo module
var enyo = require("./dependency-loader.js");

// Glob module
var glob = require("./pureglob.js");

// logging
var log = require("./log.js");

// Set up special environment, don't let others muck with compressor's state
var yo = {enyo:enyo};

// eval the depends files
function findDepends(inDir, inStart) {
	var file, dep, absfile;
	// track depends files for removal
	var depends = [];
	enyo.folders.push(inStart);
	while(file = enyo.folders.shift()) {
		absfile = path.resolve(inDir,file);
		if (path.existsSync(absfile)) {
			dep = readSync(absfile);
			depends.push(file);
		} else {
			// skip to the next branch on missing depends files
			dep = "enyo.depends()";
		}
		vm.runInNewContext(dep, yo, absfile);
	}
	return depends;
}

// uglify incoming javascript code to the max
function compress(inCode) {
	var ast = parser.parse(inCode);
	ast = gen.ast_mangle(ast);
	// FIXME: for now, lift_vars seems to break a few enyo files. Maybe it'll help one day...
	//ast = gen.ast_lift_vars(ast);
	ast = gen.ast_squeeze(ast);
	ast = gen.ast_squeeze_more(ast);
	return gen.gen_code(ast, {indent_level:0, beautify:true, ascii_only:true});
}

function readSync(inFilePath) {
	var buffer = fs.readFileSync(inFilePath);
	return String(removeBOM(buffer));
}

function removeBOM(buffer) {
	if (buffer.length >= 3 && buffer[0] == 0xEF && buffer[1] == 0xBB && buffer[2] == 0xBF) {
		buffer = buffer.slice(3);
	}
	return buffer;
}

// read and strip BOM
function read(inFilePath, callback) {
	stepup(
		function fail(err, next) {
			if (err) {
				callback(err);
			}
		},
		function readFile() {
			fs.readFile(inFilePath, this);
		},
		// strip the Byte Order Mark from the buffer before turning into a string
		function strpBOM(buffer) {
			buffer = removeBOM(buffer);
			callback(null, String(buffer));
		}
	);
}

// properly split path based on platform
function pathSplit(inPath) {
	return inPath.split(glob.separator);
}

// make a relative path from source to target
function makeRelPath(inSource, inTarget) {
	// node 0.5 has this nice thing, 0.4 does not
	if (path.relative) {
		return path.relative(inSource, inTarget);
	}
	var s,t;
	s = pathSplit(path.resolve(inSource));
	t = pathSplit(path.resolve(inTarget));
	while (s.length && s[0] === t[0]){
		s.shift();
		t.shift();
	}
	for(var i = 0, l = s.length; i < l; i++) {
		t.unshift("..");
	}
	return path.join.apply(null, t);
}

// async copy, to reduce memory usage and open file descriptors
function copy(inSourcePath, inSinkPath, callback) {
	if (options.verbose) {
		log.log(inSourcePath, "->", inSinkPath);
	}
	var rs = fs.createReadStream(inSourcePath);
	var ws = fs.createWriteStream(inSinkPath);
	ws.on("close", callback);
	rs.pipe(ws);
}

// do a cp -r, copy files recursively
function copyDir(inSourceDir, inBuildDir, callback) {
	var infiles, folders, outfiles;
	stepup(
		function(err, next) {
			if (err) {
				callback(err);
			}
		},
		function() {
			glob.glob(inSourceDir, isHiddenFile, this);
		},
		function(files) {
			var f = splitFolders(files);
			folders = f.folders;
			infiles = f.files;
			outfiles = infiles.map(function(file) {
				file = makeRelPath(inSourceDir, file);
				return path.resolve(inBuildDir, file);
			});
			return "";
		},
		function() {
			// make paths
			var p = this.parallel;
			if (folders.length) {
				folders.forEach(function(folder) {
					folder = makeRelPath(inSourceDir, folder);
					mkdirp(path.resolve(inBuildDir, folder), 0777, p());
				});
			} else {
				return "";
			}
		},
		function() {
			if (infiles.length) {
				// batch file copy for super speed
				var copyPool = poolr(100);
				infiles.forEach(function(f,i) {
					copyPool.addTask(copy, f, outfiles[i]);
				});
				// when pool is done, fire the callback
				copyPool.on("idle", callback);
			} else {
				return "";
			}
		}
	);
}

// return { folders: [ folders ], files: [ files ] }
function splitFolders(inFiles) {
	var sep = (process.platform == "win32" ? "\\" : "/");
	var folders = [], files = [];
	inFiles.forEach(function(f) {
		if (f.slice(-sep.length) == sep) {
			folders.push(f);
		} else {
			files.push(f);
		}
	});
	return {folders: folders, files: files}
}

// return true if the path is hidden
function isHiddenFile(inPath) {
	return pathSplit(inPath).some(function(p) { return /^[\._]/.test(p) });
}

// remove a file
function rm(inFile, callback) {
	fs.unlink(inFile, callback);
}

// log.warn on multiple depends'ing of the same file or path
function warnMultiple(inPath) {
	log.warn("You had " + inPath + " listed multiple times in you depends file. Don't do that!");
}

// remove empty folders by trying to delete them, a failure means the folder has files
function cleanEmptyFolders(inDir, callback) {
	var files;
	stepup(
		function errHandler(err, next) {
			if (err) {
				callback(err);
			}
		},
		function getFiles() {
			glob.glob(inDir, this);
		},
		function getFolders(fs) {
			return splitFolders(fs);
		},
		function removeEmptyFolders(inFs) {
			var folders = inFs.folders;
			var files = inFs.files;
			if (folders.length) {
				var g = this.group();
				folders.reverse().forEach(function(f) {
					// if the folder has a file in it, skip
					var needed = files.some(function(fi){ return fi.indexOf(f) == 0 });
					if (!needed) {
						if (options.verbose) {
							log.itemize("Removing empty folder:", f);
						}
						fs.rmdir(f, g());
					}
				});
			} else {
				return "";
			}
		},
		function done(){
			callback();
		}
	);
}

// write out a file in pure ascii
function write(inPath, inContent, callback) {
	fs.writeFile(inPath, inContent, "ascii", callback);
}

// delete unneeded files
function cleanUp(inFolder, inFiles, callback) {
	stepup(
		function(err, next) {
			if (err) {
				callback(err);
			}
		},
		function() {
			var g = this.group();
			if (inFiles.length) {
				inFiles.forEach(function(f) {
					// don't delete files outside of our build dir
					var file = path.resolve(inFolder,f);
					if (!notInDir(inFolder, file)) {
						if (options.verbose) {
							log.itemize("Removing temporary file:", file);
						}
						rm(file, g());
					}
				});
			} else {
				return "";
			}
		},
		function() {
			cleanEmptyFolders(inFolder, callback);
		}
	)
}

// test incoming arrays for all unique elements
function allUniques() {
	var inArrays = [].slice.call(arguments, 0);
	inArrays.forEach(function(a) {
		var o = {};
		a.forEach(function(b) {
			if (o[b]) {
				warnMultiple(b);
			}
			o[b] = 1;
		});
	});
}

function generateDepends(inFiles){
	inFiles = inFiles.map(function(f){ return '"' + f + '"' }).join(",\n");
	return "enyo.depends(\n" + inFiles + "\n);"
}

function notInDir(inDir, inPath) {
	var p = makeRelPath(inDir, inPath);
	p = pathSplit(p);
	return p[0] === "..";
}

function compressJS(jsfiles, outfile, buildDir, callback) {
	var originalSize = 0, shrunkSize = 0, content = [];
	function readAndCompress(inFile, inIndex, inCallback) {
		stepup(
			function(err, next) {
				if (err) {
					inCallback(err);
				}
			},
			function() {
				catjs(buildDir, inFile, this);
			},
			function(stat) {
				originalSize += stat.original;
				shrunkSize += stat.shrunk;
				content[inIndex] = stat.content;
				inCallback();
			}
		);
	};
	stepup(
		function (err, next) {
			if (err) {
				callback(err);
			}
		},
		function () {
			if (jsfiles.length){
				var readpool = poolr(100);
				jsfiles.forEach(function(js, i) {
					readpool.addTask(readAndCompress, js, i);
				});
				readpool.on("idle", this);
			} else {
				return "";
			}
		},
		function () {
			write(outfile, content.join("\n"), this);
		},
		function () {
			var ratio = Math.floor((shrunkSize * 100) / originalSize);
			callback(null, {start: originalSize, end: shrunkSize, ratio: ratio});
		}
	);
}

// concatenate javascript files, with statistics
function catjs(inDir, inFile, callback) {
	var original, shrunk;
	stepup(
		function(err, next) {
			if (err) {
				if (err.stack) {
					callback(err);
				} else {
					// errors here are usually bad javascript
					log.warn(x.message + "\nline: " + x.line + "\ncolumn:" + x.col);
					log.error("\n\nFile " + inFile + " failed to compress!");
					next("");
				}
			}
		},
		function getFile() {
			if (options.verbose) {
				log.itemize("Compressing:", inFile);
			}
			read(path.join(inDir, inFile), this);
		},
		function statsFile(data) {
			original = data.length;
			return data;
		},
		function compressFile(data) {
			return compress(data);
		},
		function statsEndFile(data) {
			shrunk = data.length;
			var shim = shimEnyoBuild(inFile);
			if (shim) {
				data += ";\n" + shim + ";\n";
			}
			return data;
		},
		function finish(data) {
			callback(null, {content: "// " + inFile.replace(/\\/g, "/") + "\n\n" + data + "\n", original: original, shrunk: shrunk});
		}
	);
}

function compressCSS(sheets, outfile, buildDir, callback) {
	var compressed = [];
	function readAndCompress(inFile, inIndex, inCallback) {
		stepup(
			function (err, next) {
				if (err) {
					inCallback(err);
				}
			},
			function() {
				catcss(buildDir, inFile, this);
			},
			function(css) {
				compressed[inIndex] = css;
				inCallback();
			}
		);
	}
	stepup(
		function() {
			if (sheets.length) {
				var readpool = poolr(100);
				sheets.forEach(function(c, i) {
					readpool.addTask(readAndCompress, c, i)
				});
				readpool.on("idle", this);
			} else {
				return "";
			}
		},
		function() {
			write(outfile, compressed.join("\n"), callback);
		}
	);
}

// fix url paths in css
function catcss(inDir,inFile, callback) {
	var cssFilePath;
	stepup(
		function(err, next) {
			if (err) {
				callback(err);
			}
		},
		function() {
			cssFilePath = path.join(inDir, inFile);
			return "";
		},
		function () {
			read(cssFilePath, this);
		},
		function (styles) {
			if (options.verbose) {
				log.itemize("Concatenating:", inFile);
			}
			styles = styles.replace(/url\([^)]*\)/g, function(inMatch) {
				// find the url path, ignore quotes in url string
				var urlPath = inMatch.replace(/["']/g, "").slice(4, -1);
				// skip data urls
				if (/^data:/.test(urlPath)) {
					return "url(" + urlPath + ")";
				}
				// get absolute path to referenced asset
				var normalizedUrlPath = path.join(cssFilePath, "..", urlPath);
				// Make relative asset path to built css
				var relPath = makeRelPath(inDir, normalizedUrlPath);
				if (process.platform == "win32") {
					relPath = pathSplit(relPath).join("/");
				}
				return "url(" + relPath + ")";
			});
			callback(null, "/* " + inFile + " */" + "\n\n" + styles + "\n");
		}
	);
}

// fired after copying is complete
function build(sourceDir, buildDir, callback){
	var jsfiles, sheets, skipped, depends, outdepends, outJsFile, outCssFile, outDependsFile, stats;
	stepup(
		function(err, next) {
			if (err) {
				callback(err);
			}
		},
		function () {
			log.inform("Building Dependency Graph");
			if (options["make-enyo"]) {
				vm.runInNewContext("enyo.depends('dependency-loader.js')", yo);
			}
			return findDepends(buildDir, options.use);
		},
		function (inDepends) {
			depends = inDepends;
			jsfiles = enyo.modules.map(function(m) { return path.normalize(m.path) });
			sheets = enyo.sheets.map(path.normalize);
			skipped = enyo.externals;
			skipped = skipped.concat(jsfiles.filter(function(file) {
				return notInDir(buildDir, path.resolve(buildDir,file));
			}));
			skipped = skipped.concat(sheets.filter(function(file) {
				return notInDir(buildDir, path.resolve(buildDir,file));
			}));
			skipped = skipped.concat(depends.filter(function(file) {
				return notInDir(buildDir, path.resolve(buildDir,file));
			}));
			jsfiles = jsfiles.filter(function(js) { return skipped.indexOf(js) === -1 });
			sheets = sheets.filter(function(css) { return skipped.indexOf(css) === -1 });
			depends = depends.filter(function(d) { return skipped.indexOf(d) === -1  && d !== options.use });
			// make sure all the files are unique
			allUniques(skipped,jsfiles,sheets);
			// build an new depends file
			outdepends = generateDepends(skipped.concat([options.css, options.js]));
			outJsFile = path.join(buildDir, options.js);
			outCssFile = path.join(buildDir, options.css);
			outDependsFile = path.join(buildDir, options["overwrite-depends"] ? "depends.js" : "built-depends.js");
			return "";
		},
		// compress and write the files out
		function () {
			log.inform("Compressing files");
			compressJS(jsfiles, outJsFile, buildDir, this.parallel());
			compressCSS(sheets, outCssFile, buildDir, this.parallel());
		},
		function (inStats) {
			stats = inStats;
			if (options.delete) {
				log.inform("Removing temporary files");
				cleanUp(buildDir, jsfiles.concat(sheets).concat(depends), this);
			} else {
				return "";
			}
		},
		function () {
			// enyo doesn't need a depends file
			// always write depends file last
			if (!options["make-enyo"]) {
				write(outDependsFile, outdepends, this);
			} else {
				return "";
			}
		},
		function () {
			// document uncompressed dependencies
			log.log();
			if (skipped.length) {
				log.inform("These external dependencies were not compressed:");
				log.log(skipped.join("\n"));
				log.log();
			}
			if (options.verbose) {
				log.inform("Output:")
				log.itemize("Javascript:", outJsFile);
				log.itemize("CSS:", outCssFile);
				if (!options["make-enyo"]) {
					log.itemize("Depends:", outDependsFile);
				}
				log.log();
			}
			if (options.stats) {
				log.itemize("Original Size of Javascript:", stats.start + " bytes");
				log.itemize("Compressed Size of Javascript:", stats.end + " bytes");
				log.itemize("Compression Ratio:", + stats.ratio + "%");
				log.log();
			}
			log.success("DONE");
			callback();
		}
	);
}

function shimEnyoBuild (inFile) {
	if (options["make-enyo"] && inFile.slice(-options.keyfile.length) == options.keyfile) {
		var code = '\n\n//\n// this code specially inserted by builder tool\n//\n';
		code += 'enyo.requiresWindow(function(){enyo.sheet(enyo.path.rewrite("$enyo/enyo-build.css"));});\n';
		code += "enyo.paths(" + JSON.stringify(enyo.aliases) + ");\n";
		code += '//\n//\n//\n';
		return code;
	}
}

function processDir(sourceDir, callback) {
	// reset depends loader
	enyo.modules.length = 0;
	enyo.sheets.length = 0;
	enyo.folders.length = 0;
	enyo.externals.length = 0;
	log.logBody.length = 0;
	// normalize path and remove trailing slashes
	if (!sourceDir) {
		log.error("No source path given!");
		callback(true, log.logBody);
	} else {
		sourceDir = path.resolve(sourceDir);
		glob.isFolder(sourceDir, function(err, dir) {
			if (err) {
				callback(err, log.logBody);
			}
			if (!dir) {
				log.error(sourceDir + " is not a directory!");
				callback(null, log.logBody);
			} else {
				var buildDir = path.resolve(options.inplace ? sourceDir : options.output);
				// make sure you don't clobber your own source files
				var sourceInBuild = pathSplit(makeRelPath(sourceDir, buildDir)).pop() == "..";
				if (sourceInBuild == "..") {
					log.error("Source Directory is inside Output Directory!\nAborting!");
					callback(true, log.logBody);
				} else if (sourceDir == buildDir && !options.inplace) {
					log.error("Source Directory and Output Directory are the same\nPlease use --inplace");
					callback(true, log.logBody);
				} else {
					stepup(
						function(err, next) {
							if (err) {
								callback(err, log.logBody);
							}
						},
						function() {
							if (options.delete && !options.inplace) {
								if (path.existsSync(buildDir)) {
									log.inform("Cleaning up last build");
									rimraf(buildDir, this);
								} else {
									return "";
								}
							} else {
								return "";
							}
						},
						function buildInPlace() {
							if (options.inplace) {
								return "";
							}
							log.inform("Setting up Build Area");
							copyDir(sourceDir, buildDir, this);
						},
						function startBuild() {
							build(sourceDir, buildDir, this);
						},
						function finish() {
							callback(null, log.logBody);
						}
					);
				}
			}
		});
	}
}

function setOptions(inOptions) {
	global.options = inOptions;
	enyo.args = {debug: options.debug};
	enyo.verbose = options.verbose;
	log.disEnableColors(options.colors);
	log.setMode(options.mode);
}

exports.process = processDir;
exports.setOptions = setOptions;
