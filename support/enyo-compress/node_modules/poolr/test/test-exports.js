var poolr = require('../lib/poolr.js'),
    should = require('should');

describe('library', function() {
    describe('version string', function() {
        it('should be valid', function() {
            poolr.version.should.match(/^\d+\.\d+\.\d+$/);
        });
    });
    describe('constructor', function() {
        it('should respond to "createPool"', function() {
            poolr.should.respondTo('createPool');
        });
        it('should create an object', function() {
            var testPool = poolr.createPool(1);
            testPool.should.be.a('object');
        });
    });
});
