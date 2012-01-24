/*
* Compressing Enyo Server
*/

var path = require("path");
var express = require("express");
var compresslib = require("../lib/enyo-compress-lib");

var docroot = path.resolve(__dirname, "../../../../../");
console.log("Root:", docroot);

var server = express.createServer(
	express.errorHandler({showStack: true, dumpExceptions: true})
);

server.use(express.bodyParser());
server.use(express.static(docroot));
server.post("/", function(req, res) {
	var options = req.body;
	var start = options.start;
	delete options.start;
	compresslib.setOptions(options);
	compresslib.process(start, function(err, log) {
		if (err) {
			log.push(err.toString());
		}
		res.send(log.join("\n"));
	});
});
server.listen(9000)
var loc = __dirname.replace(docroot,"").replace(/\\/g,"/");
console.log("Server compressor UI at http://localhost:9000" + loc + "/enyo-compress-ui/index.html");
