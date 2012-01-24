var fs = require("fs"),
path = require("path"),
stepup = require("stepup");

var separator = (process.platform == "win32" ? "\\" : "/");

// check if file is a folder
function isFolder(inPath, callback) {
	fs.stat(inPath, function(err, stat) {
		if (err) {
			callback(err);
		} else {
			callback(null, stat.isDirectory());
		}
	});
}

function isFolderSync(inPath) {
	return path.existsSync(inPath) && fs.statSync(inPath).isDirectory();
}

// recursively enumerate a directory
function globSync(inFile, inFilters) {
	var outfiles = [];
	if (inFilter && inFilter(inFile)) {
		return outfiles;
	}
	if (isFolderSync(inFile)) {
		var nf = fs.readdirSync(inFile).map(function(f) { return path.join(inFile, f) });
		nf = nf.reduce(function(a,b) { return a.concat(globSync(inFile, inFilter)) }, [inFile + separator]);
		outfiles = outfiles.concat(nf);
	} else {
		outfiles.push(inFile);
	}
	return outfiles;
}

function glob(inFile, inFilter, callback) {
	if (inFilter && !callback) {
		callback = inFilter;
		inFilter = null;
	}
	stepup(
		function errOut(err, next) {
			callback(err);
		},
		function hiddenFile() {
			if (inFilter && inFilter(inFile)) {
				callback(null, []);
			} else {
				return "";
			}
		},
		function folderCheck() {
			isFolder(inFile, this);
		},
		function recurse(f) {
			if (!f) {
				return [inFile];
			} else {
				folderRecurse(inFile, inFilter, this);
			}
		},
		function finish(files) {
			callback(null, files);
		}
	);
}

function folderRecurse(inFile, inFilter, callback) {
	stepup(
		function errOut(err, next) {
			callback(err);
		},
		function readFolder() {
			fs.readdir(inFile, this);
		},
		function map(files) {
			if (files.length) {
				var g = this.group();
				files.forEach(function (f) {
					f = path.join(inFile, f);
					glob(f, inFilter, g());
				});
			} else {
				return [];
			}
		},
		function reduce(files) {
			files = files.reduce(function(a,b) { return a.concat(b) }, [inFile + separator]);
			callback(null, files);
		}
	);
}

module.exports = {
	glob: glob,
	globSync: globSync,
	separator: separator,
	isFolder: isFolder,
	isFolderSync: isFolderSync
};
