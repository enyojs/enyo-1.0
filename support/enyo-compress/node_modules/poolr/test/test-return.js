var should = require('should'),
    poolr = require('../lib/poolr.js');


var sleep05 = function(callback) {
    setTimeout(function(){return callback(null)}, 500);
}

describe('poolr with limit two', function() {
    var delayPool = poolr.createPool(2);

    describe('addTask', function() {
        it('should return true on first invocation', function() {
            delayPool.addTask(sleep05).should.be.ok;
        });
        it('should return true on second invocation', function() {
            delayPool.addTask(sleep05).should.be.ok;
        });
        it('should return false on third invocation', function() {
            delayPool.addTask(sleep05).should.not.be.ok;
        });
    });
});


