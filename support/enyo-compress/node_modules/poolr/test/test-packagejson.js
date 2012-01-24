var should = require('should'),
    poolr = require('../lib/poolr'),
    fs     = require('fs');


describe('package.json', function() {
    var pkg = JSON.parse(fs.readFileSync(__dirname + '/../package.json'));
    describe('version', function() {
        it('should match library version', function() {
            poolr.version.should.eql(pkg.version);
        });
    });
});
